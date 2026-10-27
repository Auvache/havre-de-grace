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
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

import { chromium } from 'playwright-core'

import { markDrawnAt, MARK_DRAW } from '../../shared/video/album.mjs'
import { rect, r, easeInOut, ramp, fall } from '../../shared/video/kit.mjs'

import { drawLines, loadFaces, setLine, setLines } from './hairline.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../..')

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
/*
 * The opening's clock, in seconds: the mark drawn from `mark` (complete
 * MARK_DRAW.done later), faded over `markOut`; the title's letters drawn on
 * over `title`; the slate and the title gone over `reveal`.
 *
 * `--reveal` is when the black starts to fade: after the camera operator's
 * last reframe, so the stage is never seen being found. Andalusia's (11.5 s,
 * reframes at 8.4, 10.2 and 11.0–11.3 s) is the clock as approved; a later
 * reveal moves the title by as much and the mark's fade by half, so the
 * title still holds 2.6 s and the screens stay evenly spaced.
 */
const late = Number(opt.reveal) - 11.5
const OPEN = opt.title ? {
  mark: 0.5,
  markOut: [5.0 + late / 2, 5.7 + late / 2],
  title: [6.2 + late, 8.9 + late],
  reveal: [11.5 + late, 12.9 + late],
} : {
  mark: 0.5,
  reveal: [11.5 + late, 12.9 + late],
}
const OPENING_END = OPEN.reveal[1] + 0.1
/*
 * The camera's grade. Each starts with hqdn3d for the noise in the dark curtain
 * (temporal, so it smooths without smearing faces) and ends with
 * contrast-adaptive sharpening for the camera's softness.
 *
 * `teal-bone` (default, chosen 2026-10-27 over eleven other looks and five
 * variations of itself): a split tone, teal into the shadows and the curtain,
 * cream into the highlights, so skin and the guitars keep their warmth against
 * a cool room; blacks lifted to 0.08 and highlights capped at 0.94 for a faded
 * print, colour down to 72%. `warm` was v2's first grade, judged too warm.
 */
const GRADE = {
  'teal-bone': "hqdn3d=2:1.5:5:4,eq=saturation=0.72,curves=all='0/0.08 1/0.94',colorbalance=rs=-0.12:gs=0.03:bs=0.12:rm=-0.03:bm=0.03:rh=0.05:gh=0.03:bh=-0.04,cas=0.35",
  warm: "hqdn3d=2:1.5:5:4,colortemperature=temperature=5400:mix=0.7,colorbalance=rs=0.02:bs=-0.03:rm=0.03:bm=-0.02,eq=contrast=1.07:gamma=0.97,vibrance=intensity=0.08,curves=all='0/0 0.06/0.04 0.5/0.5 0.92/0.945 1/1',cas=0.45",
  none: 'null',
}[opt.grade]
if (!GRADE) throw new Error(`--grade is teal-bone, warm or none`)
const total = process.env.LIMIT ? Number(process.env.LIMIT) : stop + LOGO_HOLD + CREDITS_HOLD

const wavSeconds = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', opt.wav]).toString())

const ENCODE = [
  '-c:v', 'libx264', '-preset', 'slow', '-crf', opt.crf, '-pix_fmt', 'yuv420p', '-profile:v', 'high',
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
  '-r', String(fps), '-g', String(fps * 2),
  '-c:a', 'aac', '-b:a', '320k', '-ar', '48000',
  '-movflags', '+faststart', resolve(opt.out),
]

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

/* The mark, prepared exactly as MusicVideoSvgFilm prepares it. */
const lockup = readFileSync(resolve(root, 'public/logos/suite/a4-lockup-stacked.svg'), 'utf8')
  .replace('<svg ', '<svg width="918" height="619.07" ')
  .replace(/ color="[^"]*"/, '')
  .replace(/ role="img"/, '')
  .replace(/ aria-label="[^"]*"/, '')
  .replace(/<title>.*?<\/title>/, '')

const WHITE = '#f4f6f7'
/*
 * The opening's and end card's ground: "faded slate", chosen 2026-10-27 from
 * eight navies laid against the teal-bone grade (the curtain grades to #001b29).
 */
const BG = '#1c2939'
/* Type the size of the old credits (34), lines 62 apart, centred on the frame. */
const SIZE = 34
const lines = (texts) => texts.map((text, i) => setLine(text, 800, 450 - ((texts.length - 1) * 62) / 2 + i * 62 + 12, SIZE))
await loadFaces()
const TITLE = opt.title ? lines([opt.title, 'Live at Artichoke Music']) : null
/* One frame of the opening, `now` seconds in: the mark centred as on the end card, then the title. */
const openingAt = (now) => {
  const black = fall(now, ...OPEN.reveal)
  if (black <= 0.001) return ''
  const markOn = OPEN.markOut ? fall(now, ...OPEN.markOut) : 1
  const mark = now >= OPEN.mark && markOn > 0.001
    ? `<g transform="translate(800 450) scale(${r(520 / 918, 5)}) translate(-459 -309.5)" style="color:${WHITE}" opacity="${r(easeInOut(markOn), 3)}">${markDrawnAt(Math.min(now - OPEN.mark, MARK_DRAW.done), 'live')}</g>`
    : ''
  const title = TITLE && now >= OPEN.title[0] ? drawLines(TITLE, easeInOut(ramp(now, ...OPEN.title)), WHITE, 'live-title') : ''
  return `<g opacity="${r(easeInOut(black), 4)}">${rect(0, 0, 1600, 900, BG)}${mark}${title}</g>`
}

/* Andalusia's end card, its two screens. */
const endLogo = rect(0, 0, 1600, 900, BG) +
  `<g transform="translate(800 450) scale(${r(520 / 918, 5)}) translate(-459 -309.5)" style="color:${WHITE}">${lockup}</g>`
const endCredits = rect(0, 0, 1600, 900, BG) + setLines(lines(opt.credit), WHITE)

/* ── Drawing: a transparent 1920×1080 page ────────────────────────── */
// Every letter is a path (hairline.mjs), so the page loads no fonts.
const PAGE = `<!doctype html><meta charset="utf-8">
<style>
  html, body { margin: 0; background: transparent; overflow: hidden; }
  svg { display: block; width: 1920px; height: 1080px; isolation: isolate; }
</style>
<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><g id="film"></g></svg>`

const work = join(tmpdir(), `live-${process.pid}`)
mkdirSync(join(work, 'open'), { recursive: true })

const browser = await chromium.launch({ channel: 'chrome', args: ['--disable-gpu', '--hide-scrollbars'] })
try {
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })
  const page = await context.newPage()
  await page.setContent(PAGE)
  // Playwright's own screenshot, not CDP's surface capture: the surface comes
  // back 1920×993 here (the window, not the viewport), and without alpha.
  const shoot = async (svg, file) => {
    await page.evaluate((markup) => { document.getElementById('film').innerHTML = markup }, svg)
    await page.screenshot({ path: file, type: 'png', omitBackground: true })
  }
  const frames = Math.ceil(OPENING_END * fps)
  for (let n = 0; n < frames; n++) {
    await shoot(openingAt(n / fps), join(work, 'open', `${String(n).padStart(5, '0')}.png`))
  }
  await shoot(endLogo, join(work, 'end-logo.png'))
  await shoot(endCredits, join(work, 'end-credits.png'))
}
finally {
  await browser.close()
}

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
