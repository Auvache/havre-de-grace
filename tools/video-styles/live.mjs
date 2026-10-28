/*
 * A live take, cut to its mixed audio, with the band's mark and the song's
 * title before it and the end card after.
 *
 *   node tools/video-styles/live.mjs --video set.mp4 --at 1783.916 \
 *     --wav Andalusia-master.wav --title Andalusia --stop 193.22 --out Andalusia.mp4
 *
 * `--at` is where the mix's first sample falls in the camera file, in seconds
 * (measured by cross-correlating the mix against the camera's own audio — they
 * are the same performance, so the peak is exact). `--stop` is the moment, in
 * mix seconds, the end card takes over: the last note, as on Andalusia.
 * `--from` starts the video that far into the mix (talk and silence before the
 * first note), and the camera with it.
 *
 * WHAT IS LAID OVER IT
 *
 * The opening (v2, 2026-10-27): on faded slate (BG), the mark drawn on exactly
 * as the site's splash screen draws it (`markDrawnAt`), held, faded; then the
 * title and "Live at Artichoke Music" drawn on with the wordmark's pen, letter by
 * letter, in the Shorts captions' Hairline type (hairline.mjs); then the slate
 * and the title fade together to show the stage. Without `--title` the mark
 * holds on its own until the slate fades. The audio runs from the first
 * frame underneath it. The frames are drawn by Google Chrome on a transparent
 * page and laid over the footage.
 *
 * The camera is graded on the way through (GRADE): a light temporal denoise
 * for the curtain's noise, a touch warmer and more contrast, gentle sharpening.
 * `--grade none` turns it off.
 *
 * The ending is Andalusia's end card (cartography.mjs, `endCard`): the mark on
 * the slate, hard cut on `--stop`, held 3.4 s, then a hard cut to the credits
 * (`--credit`, once per line, `**names**` in SemiBold) for the 3.66 s Andalusia
 * gives them, set still in the same Hairline type. Under both,
 * the camera's own audio of the room (the applause) comes up from `--stop`
 * and fades out with the picture, so the end card never sits on silence.
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
    video: { type: 'string' },
    wav: { type: 'string' },
    at: { type: 'string' },
    title: { type: 'string' },
    stop: { type: 'string' },
    out: { type: 'string' },
    fps: { type: 'string', default: '30' },
    crf: { type: 'string', default: '16' },
    credit: { type: 'string', multiple: true, default: ['Performed by **Havre De Grace**', 'and **Jed Wyatt Smith**'] },
    grade: { type: 'string', default: 'teal-bone' },
    bare: { type: 'boolean', default: false },
    room: { type: 'string', default: '8' },
    reveal: { type: 'string', default: '11.5' },
    'room-at': { type: 'string' },
    from: { type: 'string', default: '0' },
  },
})
for (const k of opt.bare ? ['video', 'wav', 'at', 'out'] : ['video', 'wav', 'at', 'stop', 'out']) if (!opt[k]) throw new Error(`--${k} is required`)

const fps = Number(opt.fps)
const at = Number(opt.at)
const from = Number(opt.from)
// The camera is read from here: the mix's `from` s.
const camAt = at + from
// See Compositing: the output clock runs `lag` ahead of the mix's, so the end card comes `lag` early.
const lag = Math.ceil(camAt * fps - 1e-6) / fps - camAt
const stop = Number(opt.stop) - from - lag
// Where in the camera file the room under the end card is taken from: by default the moment after the last note.
const roomAt = opt['room-at'] ? Number(opt['room-at']) : at + Number(opt.stop)
const LOGO_HOLD = 3.4
const CREDITS_HOLD = 3.66
const OPEN = openingClock(Number(opt.reveal), Boolean(opt.title))
const OPENING_END = OPEN.reveal[1] + 0.1
const GRADE = GRADES[opt.grade]
if (!GRADE) throw new Error(`--grade is teal-bone, warm or none`)
const total = process.env.LIMIT ? Number(process.env.LIMIT) : stop + LOGO_HOLD + CREDITS_HOLD

const wavSeconds = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', opt.wav]).toString())

const ENCODE = encode({ fps, crf: opt.crf, out: opt.out })

/*
 * `--bare`: the graded camera under the mix, and nothing else (no opening, no
 * end card, no room), for a take that is only going to be cut into Shorts.
 * Same sync as below: the mix starts `lag` in.
 */
if (opt.bare) {
  const length = process.env.LIMIT ? Number(process.env.LIMIT) : wavSeconds - from - lag
  mkdirSync(dirname(resolve(opt.out)), { recursive: true })
  execFileSync('ffmpeg', [
    '-v', 'error', '-stats', '-y',
    '-ss', String(camAt), '-t', String(length), '-i', opt.video,
    '-i', opt.wav,
    '-filter_complex', `[0:v]setpts=PTS-STARTPTS,${GRADE},format=yuv420p[v];[1:a]atrim=start=${r(from + lag, 6)},asetpts=PTS-STARTPTS[au]`,
    '-map', '[v]', '-map', '[au]', '-t', String(length), ...ENCODE,
  ], { stdio: 'inherit' })
  console.log(`→ ${resolve(opt.out)} · ${r(length, 2)} s, bare (mix advanced ${r(lag * 1000, 1)} ms)`)
  process.exit(0)
}

await loadFaces()
const TITLE = opt.title ? lines([opt.title, 'Live at Artichoke Music']) : null

const work = join(tmpdir(), `live-${process.pid}`)
mkdirSync(join(work, 'open'), { recursive: true })

await drawing(async (shoot) => {
  const frames = Math.ceil(OPENING_END * fps)
  for (let n = 0; n < frames; n++) {
    await shoot(openingAt(OPEN, TITLE, n / fps), join(work, 'open', `${String(n).padStart(5, '0')}.png`))
  }
  await shoot(endLogo(), join(work, 'end-logo.png'))
  await shoot(endCredits(opt.credit), join(work, 'end-credits.png'))
})

/* ── Compositing ──────────────────────────────────────────────────── */
/*
 * The opening is first made one clip with alpha. Chrome writes an opaque frame
 * as RGB and a frame with the ring's hole as RGBA, and a PNG sequence that
 * changes format mid-way rebuilds ffmpeg's filter graph — which, with the
 * camera in the same graph, dropped 266 camera frames and put the picture
 * 9.03 s ahead of the mix. Normalised here, alone, it costs nothing.
 *
 * The camera is seeked to `at` on input and its first frame becomes frame 0 —
 * the first camera frame at or after `at`, `lag` later than the mix's first
 * sample (17 ms on Andalusia). So output time t shows camera time at + lag + t,
 * and the mix starts `lag` in: picture and sound are in sync to the sample
 * rather than to the nearest frame. (v1 and the first v2 delayed the mix by
 * `lag` instead, which put the sound 2 × lag late; measured 2026-10-27 by
 * matching output frames to camera frames with -copyts.) The end card is two
 * stills on `stop`.
 *
 * The room under the end card is the camera's own audio from `roomAt` (by
 * default the moment of the last note, so the camera's thinner copy of the
 * music is never heard against the mix), laid in from `stop` at `--room` dB
 * and faded out with the last 1.5 s. `--room-at` takes it from elsewhere in the
 * set, for a song whose own applause the camera missed.
 */
const openClip = join(work, 'open.mov')
execFileSync('ffmpeg', [
  '-v', 'error', '-y', '-framerate', String(fps), '-i', join(work, 'open', '%05d.png'),
  '-vf', 'format=rgba', '-c:v', 'qtrle', openClip,
])
const logoOff = stop + LOGO_HOLD
const filter = [
  `[0:v]setpts=PTS-STARTPTS,${GRADE},format=yuv420p[cam]`,
  `[1:v]format=rgba[open]`,
  '[cam][open]overlay=eof_action=pass:format=auto[a]',
  `[a][2:v]overlay=enable='between(t,${stop},${logoOff})'[b]`,
  `[b][3:v]overlay=enable='gte(t,${logoOff})',format=yuv420p[v]`,
  `[4:a]atrim=start=${r(from + lag, 6)},asetpts=PTS-STARTPTS,apad=whole_dur=${r(total, 3)}[mix]`,
  `[5:a]aresample=48000,aformat=channel_layouts=stereo,afade=t=in:d=1.5,volume=${Number(opt.room)}dB,adelay=delays=${r(stop * 1000, 1)}:all=1,apad=whole_dur=${r(total, 3)}[room]`,
  `[mix][room]amix=inputs=2:normalize=0:duration=first,afade=t=out:st=${r(total - 1.5, 3)}:d=1.5[au]`,
].join(';')

mkdirSync(dirname(resolve(opt.out)), { recursive: true })
execFileSync('ffmpeg', [
  '-v', 'error', '-stats', '-y',
  '-ss', String(camAt), '-t', String(total), '-i', opt.video,
  '-i', openClip,
  '-loop', '1', '-framerate', String(fps), '-i', join(work, 'end-logo.png'),
  '-loop', '1', '-framerate', String(fps), '-i', join(work, 'end-credits.png'),
  '-i', opt.wav,
  '-ss', String(roomAt), '-t', String(r(total - stop + 0.5, 3)), '-i', opt.video,
  '-filter_complex', filter,
  '-map', '[v]', '-map', '[au]', '-t', String(total), ...ENCODE,
], { stdio: 'inherit' })

if (process.env.KEEP) console.log(`kept ${work}`)
else rmSync(work, { recursive: true, force: true })
console.log(`→ ${resolve(opt.out)} · ${r(total, 2)} s (mix ${r(wavSeconds, 2)} s, end card at ${opt.stop} s of the mix, mix advanced ${r(lag * 1000, 1)} ms, room from ${r(roomAt, 2)} s)`)
