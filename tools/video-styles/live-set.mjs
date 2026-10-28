/*
 * The whole Artichoke set as one video: the six songs in the order played,
 * each fading into the next, with one opening before the first and one end
 * card after the last.
 *
 *   node tools/video-styles/live-set.mjs --out "Live at Artichoke Music.mp4"
 *   node tools/video-styles/live-set.mjs --preview --out joins.mp4
 *
 * Everything is cut straight from the trimmed set file and the 9-bite
 * masters, as live.mjs cuts one song (LIVE.md has the offsets), in one encode.
 *
 * THE JOINS
 *
 * Each song plays to its last note (`stop`, as on its single), and the
 * camera's applause comes up under it at the single's `--room` level. The
 * next song's first note comes GAP seconds after that last note, and the
 * applause and the end of the mix fade out over those seconds and the one
 * after. The picture dissolves over DISSOLVE seconds, ending 0.5 s before the
 * next song's first note, or before the camera's own move at the end of a
 * song (`cut`: Into the Wild dissolves to a wide shot, Conman pulls out to a
 * dark one), whichever comes first. The next song's picture before its first
 * note is the camera from before its mix begins: the same few seconds of the
 * evening, so nothing is invented.
 *
 * Sync is live.mjs's, song by song: song i's camera is read from the first
 * frame at or after its seek, `lag` later, and its mix is advanced by that
 * `lag`, so each song is in sync to the sample.
 *
 * THE OPENING AND THE END CARD
 *
 * The opening is live.mjs's, laid over the first song (`--title`, one line
 * per flag; `--title=` for the mark alone, as on Song 1 and 2). The end card is
 * the last song's wide shot after its last note, dissolving to the mark, held,
 * then the credits: `--credit` lines, a `--credit=---` line starting a new screen. The
 * room runs under it all and fades with the picture.
 *
 * `--preview` renders only the joins (8 s either side of each), one after the
 * other, without the opening or the end card. `--opening` renders only the
 * opening and the 10 s after it; `--ending`, the last 12 s of the last song
 * and the end card.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { parseArgs } from 'node:util'

import { r } from '../../shared/video/kit.mjs'

import { loadFaces } from './hairline.mjs'
import { drawing, encode, endCredits, endLogo, GRADES, lines, openingAt, openingClock } from './live-cards.mjs'

const { values: opt } = parseArgs({
  options: {
    dir: { type: 'string', default: `${process.env.HOME}/stefan/videos/artichoke-parker-mixes` },
    out: { type: 'string' },
    // The opening and credits as the person settled them, 2026-10-28.
    title: { type: 'string', multiple: true, default: ['Live at Artichoke Music'] },
    credit: {
      type: 'string', multiple: true, default: [
        'Performed by **Havre De Grace**', 'with **Jed Wyatt Smith** on Andalusia', '', 'Mixed by **Parker Holt**', 'and **Stefan Auvache Bradley**', '---',
        'Recorded live at **Artichoke Music**', 'Portland Songwriters Association', '13 August 2026',
      ],
    },
    reveal: { type: 'string', default: '11.5' },
    preview: { type: 'boolean', default: false },
    opening: { type: 'boolean', default: false },
    ending: { type: 'boolean', default: false },
    crf: { type: 'string', default: '16' },
  },
})
if (!opt.out) throw new Error('--out is required')

/*
 * The set, in mix seconds (LIVE.md): where each mix sits in the trimmed file
 * (`at`), its first note (`first`, measured in 50 ms steps), its last
 * (`stop`), its `--room`, and the camera's own move after it (`cut`).
 */
const SET = [
  { song: 'Insane, Okay', wav: 'Song 1 and 2.wav', at: 118.111, from: 13.3, first: 13.85, stop: 408.7, room: 3.2,
    chapters: [['Insane, Okay', 13.85], ['The Hoax', 201.3]] },
  { song: 'New York', wav: 'New York.wav', at: 568.527, first: 2.2, stop: 195.68, room: 4.4 },
  { song: 'Andalusia', wav: 'Andalusia.wav', at: 1783.916, first: 0.45, stop: 193.22, room: 7.5 },
  { song: 'Into the Wild', wav: 'Into the Wild.wav', at: 2093.876, first: 0.35, stop: 219.2, room: 4.2, cut: 222.1 },
  // The camera lost Conman's applause (silent from 224 s): its room is Into the Wild's, as on the single.
  { song: 'Conman', wav: 'Conman.wav', at: 2330.544, first: 0.05, stop: 220.93, room: 3.8, roomAt: 2313.076, cut: 220.52 },
  // He waves to the room at stop + 2.1; the camera pulls out to the dark at stop + 5.6.
  { song: 'I Want to Be Yours', wav: 'I Want to be Yours.wav', at: 3386.719, first: 0.9, stop: 252.62, room: 5.8, cut: 258.2 },
]
const FPS = 30
const GAP = 3.0
const DISSOLVE = 1.0
/* The end card: the wide shot held after the last note, the dissolve to the mark, the mark, each credits screen. */
const WIDE_HOLD = 3.5
const LOGO_HOLD = 3.4
const CREDITS_HOLD = 4.5
const GRADE = GRADES['teal-bone']
const video = join(opt.dir, 'artichoke-set-full.mp4')
const grid = (t) => Math.round(t * FPS) / FPS

/*
 * Lays `songs` out on the output's clock. `start` is the first song's mix time
 * at output 0, `end` the last song's mix time where it stops (or, with `card`,
 * where the end card takes over). Every song gets `pos` (output = pos + mix
 * time), and `v` (output time its picture starts) and `seek`/`lag`.
 */
function layout(songs, start, end, card) {
  const out = songs.map((s) => ({ ...s, roomAt: s.roomAt ?? s.at + s.stop }))
  out[0].pos = -start
  out[0].v = 0
  for (let i = 1; i < out.length; i++) {
    const a = out[i - 1]
    const b = out[i]
    b.pos = a.pos + a.stop + GAP - b.first
    const dissolveEnd = Math.min(a.stop + GAP - 0.5, a.cut ?? Infinity)
    b.v = grid(a.pos + dissolveEnd - DISSOLVE)
  }
  for (const s of out) {
    const seek = s.at + s.v - s.pos
    s.seek = seek
    s.lag = Math.ceil(seek * FPS - 1e-6) / FPS - seek
  }
  const last = out.at(-1)
  const cardAt = card ? grid(last.pos + last.stop + WIDE_HOLD) : null
  const videoEnd = card ? cardAt + DISSOLVE : grid(last.pos + end)
  out.forEach((s, i) => { s.vEnd = i < out.length - 1 ? out[i + 1].v + DISSOLVE : videoEnd })
  return { songs: out, cardAt }
}

/* Raw stereo 48 kHz float samples from ffmpeg (`args` say what to read). */
const RATE = 48000
function pcm(args) {
  const b = execFileSync('ffmpeg', ['-v', 'error', ...args, '-vn', '-f', 'f32le', '-ac', '2', '-ar', String(RATE), '-'], { maxBuffer: 2 ** 31 - 1 })
  return new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length))
}
const ramp01 = (x) => Math.min(1, Math.max(0, x))

/*
 * The sound, mixed here sample by sample rather than with ffmpeg's amix: with
 * a dozen delayed inputs ending at different times, amix (ffmpeg 9) dropped a
 * later song from the mix at random, a different join each run, leaving
 * silence. Each piece is decoded, given its fades (straight lines, as afade's
 * default) and gain, and added in at its sample.
 */
function mixSound(songs, total, file) {
  const out = new Float32Array(Math.ceil(total * RATE) * 2)
  const lay = (samples, at, gain) => {
    const o = Math.round(at * RATE)
    for (let n = 0; n < samples.length / 2; n++) {
      const j = o + n
      if (j < 0 || j * 2 >= out.length) continue
      const g = gain(n / RATE)
      out[j * 2] += samples[n * 2] * g
      out[j * 2 + 1] += samples[n * 2 + 1] * g
    }
  }
  songs.forEach((s, i) => {
    /* The mix: song mix time m plays at output pos − lag + m. */
    const shift = s.pos - s.lag
    const next = songs[i + 1]
    const mStart = Math.max(i === 0 ? s.v - s.pos + s.lag : s.first - 1.0, 0, -shift)
    const mEnd = Math.min(next ? s.stop + GAP + 1.0 : total - shift, s.stop + 30)
    const fadeIn = i === 0 ? 0.05 : Math.max(0.02, Math.min(0.5, s.first - mStart))
    // The applause and the end of the mix fade out together, from 1 s after the last note.
    const fadeOut = (t) => next ? 1 - ramp01((t - (s.stop + 1.0)) / GAP) : 1
    lay(pcm(['-ss', String(r(mStart, 6)), '-t', String(r(mEnd - mStart, 6)), '-i', join(opt.dir, s.wav)]), shift + mStart,
      (t) => ramp01(t / fadeIn) * fadeOut(mStart + t))

    /* The room after the last note, if this stretch reaches it. */
    const roomFrom = shift + s.stop
    const roomLength = next ? GAP + 1.0 : total - roomFrom
    if (roomLength > 0 && roomFrom < total) {
      const gain = 10 ** (s.room / 20)
      lay(pcm(['-ss', String(r(s.roomAt, 3)), '-t', String(r(roomLength, 3)), '-i', video]), roomFrom,
        (t) => gain * ramp01(t / (next ? 0.8 : 1.5)) * fadeOut(s.stop + t))
    }
  })
  /* The whole: in over 50 ms, out over the last 1.5 s. */
  const frames = out.length / 2
  let peak = 0
  for (let j = 0; j < frames; j++) {
    const t = j / RATE
    const g = ramp01(t / 0.05) * ramp01((total - t) / 1.5)
    out[j * 2] *= g
    out[j * 2 + 1] *= g
    peak = Math.max(peak, Math.abs(out[j * 2]), Math.abs(out[j * 2 + 1]))
  }
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'f32le', '-ar', String(RATE), '-ac', '2', '-i', '-', '-c:a', 'pcm_f32le', file],
    { input: Buffer.from(out.buffer), maxBuffer: 2 ** 31 - 1 })
  return peak
}

/* Renders one stretch of the set to `file`. `opening` and `card` are the PNG paths to lay over it, or null. */
function render({ songs, cardAt }, file, { opening, card }) {
  const inputs = []
  const filter = []
  const input = (...args) => { inputs.push(...args); return inputs.filter((a) => a === '-i').length - 1 }
  const last = songs.at(-1)
  const total = card ? cardAt + LOGO_HOLD + card.credits.length * CREDITS_HOLD : last.vEnd

  songs.forEach((s, i) => {
    const length = s.vEnd - s.v
    const cam = input('-ss', String(r(s.seek, 6)), '-t', String(r(length + 0.2, 3)), '-i', video)
    filter.push(`[${cam}:v]setpts=PTS-STARTPTS,trim=duration=${r(length, 4)},${GRADE},format=yuv420p,setsar=1[c${i}]`)
  })

  /* The opening over the first song, then the dissolves. */
  if (opening) {
    const open = input('-i', opening)
    filter.push(`[${open}:v]format=rgba[open]`, `[c0][open]overlay=eof_action=pass:format=auto,format=yuv420p[c0o]`)
  }
  let chain = opening ? '[c0o]' : '[c0]'
  songs.slice(1).forEach((s, i) => {
    filter.push(`${chain}[c${i + 1}]xfade=transition=fade:duration=${DISSOLVE}:offset=${r(s.v, 4)}[x${i + 1}]`)
    chain = `[x${i + 1}]`
  })
  if (card) {
    const logo = input('-loop', '1', '-framerate', String(FPS), '-t', String(LOGO_HOLD), '-i', card.logo)
    const credits = card.credits.map((png) => input('-loop', '1', '-framerate', String(FPS), '-t', String(CREDITS_HOLD), '-i', png))
    const screens = [logo, ...credits]
    filter.push(...screens.map((n, k) => `[${n}:v]format=yuv420p,setsar=1,setpts=PTS-STARTPTS[s${k}]`))
    // On the camera's timebase (1/15360), or xfade refuses the pair.
    filter.push(`${screens.map((_, k) => `[s${k}]`).join('')}concat=n=${screens.length}:v=1:a=0,settb=1/15360[card]`)
    filter.push(`${chain}[card]xfade=transition=fade:duration=${DISSOLVE}:offset=${r(cardAt, 4)}[vend]`)
    chain = '[vend]'
  }
  filter.push(`${chain}format=yuv420p[v]`)

  const sound = `${file}.wav`
  const peak = mixSound(songs, total, sound)
  if (peak > 1) console.warn(`the sound peaks at ${r(20 * Math.log10(peak), 2)} dBFS: over full scale`)
  const track = input('-i', sound)
  execFileSync('ffmpeg', [
    '-v', 'error', '-stats', '-y', ...inputs,
    '-filter_complex', filter.join(';'),
    '-map', '[v]', '-map', `${track}:a`, '-t', String(r(total, 3)), ...encode({ fps: FPS, crf: opt.crf, out: file }),
  ], { stdio: 'inherit' })
  rmSync(sound)
  return total
}

const work = join(tmpdir(), `live-set-${process.pid}`)
mkdirSync(work, { recursive: true })
mkdirSync(dirname(resolve(opt.out)), { recursive: true })
const ms = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`

if (opt.preview) {
  /* Each join on its own: the last 8 s of a song to 8 s past the next one's first note. */
  const pieces = []
  for (let i = 1; i < SET.length; i++) {
    const a = SET[i - 1]
    const b = SET[i]
    const piece = join(work, `join-${i}.mp4`)
    const plan = layout([a, b], a.stop - 8, b.first + 8, false)
    const length = render(plan, piece, { opening: null, card: null })
    console.log(`join ${i}: ${a.song} → ${b.song}, ${r(length, 2)} s (dissolve at ${r(plan.songs[1].v, 2)} s, next first note at ${r(plan.songs[1].pos + b.first, 2)} s)`)
    pieces.push(piece)
  }
  // Joined by decoding each piece: the concat demuxer, even re-encoding, keeps each piece's AAC priming (1024 samples), and the sound runs 21 ms late.
  execFileSync('ffmpeg', [
    '-v', 'error', '-y', ...pieces.flatMap((p) => ['-i', p]),
    '-filter_complex', `${pieces.map((_, k) => `[${k}:v][${k}:a]`).join('')}concat=n=${pieces.length}:v=1:a=1[v][a]`,
    '-map', '[v]', '-map', '[a]', ...encode({ fps: FPS, crf: opt.crf, out: opt.out }),
  ])
}
else {
  const [first, last] = [SET[0], SET.at(-1)]
  const plan = opt.ending ? layout([last], last.stop - 12, null, true)
    : opt.opening ? layout([first], first.from, first.from + Number(opt.reveal) + 1.4 + 10, false)
    : layout(SET, first.from, null, true)
  const credits = opt.credit.join('\n').split(/\n---\n/).map((screen) => screen.split('\n'))
  const open = openingClock(Number(opt.reveal), opt.title.length > 0)
  mkdirSync(join(work, 'open'), { recursive: true })
  await loadFaces()
  const title = opt.title.length ? lines(opt.title) : null
  await drawing(async (shoot) => {
    const frames = Math.ceil((open.reveal[1] + 0.1) * FPS)
    for (let n = 0; n < (opt.ending ? 0 : frames); n++) await shoot(openingAt(open, title, n / FPS), join(work, 'open', `${String(n).padStart(5, '0')}.png`))
    if (opt.opening) return
    await shoot(endLogo(), join(work, 'end-logo.png'))
    for (const [k, screen] of credits.entries()) await shoot(endCredits(screen), join(work, `credits-${k}.png`))
  })
  /* One clip with alpha first: see live.mjs, Compositing, for why. */
  const opening = opt.ending ? null : join(work, 'open.mov')
  if (opening) execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', join(work, 'open', '%05d.png'), '-vf', 'format=rgba', '-c:v', 'qtrle', opening])
  const total = render(plan, resolve(opt.out), {
    opening,
    card: opt.opening ? null : { logo: join(work, 'end-logo.png'), credits: credits.map((_, k) => join(work, `credits-${k}.png`)) },
  })
  console.log(`→ ${resolve(opt.out)} · ${ms(total)} (${r(total, 2)} s)`)
  console.log('Chapters:')
  for (const [i, s] of plan.songs.entries()) {
    // A song's chapter starts where its picture does; one inside a song (The Hoax), where it begins.
    for (const [k, [name, m]] of (s.chapters ?? [[s.song]]).entries()) console.log(`${ms(k === 0 ? s.v : s.pos + m)} ${name}`)
  }
}

if (process.env.KEEP) console.log(`kept ${work}`)
else rmSync(work, { recursive: true, force: true })
