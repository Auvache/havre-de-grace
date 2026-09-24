/*
 * A film, written out as an mp4 — every frame drawn from the song's clock and
 * the record laid under it.
 *
 *   FILM=cartography-album SONG=andalusia node tools/video-styles/mp4.mjs
 *   FILM=cartography-album node tools/video-styles/mp4.mjs --from 72.8 --to 87.8
 *
 * Writes exports/<song>-<film>-2160p.mp4 and -1080p.mp4 (gitignored).
 *
 * HOW
 *
 * Frame n is the film's frame function at exactly n / fps seconds — the same
 * call the page makes sixty times a second, with the same lockup and uid — so
 * sync is not adjusted, it is by construction. Each frame is drawn by Google
 * Chrome, the engine the page is judged in, with Jost loaded as the site loads
 * it (the variable face, so a 600 is a true 600), at 3840×2160 natively: the
 * film is vector, so nothing is upscaled. The PNGs go straight into ffmpeg,
 * which encodes the 4K master and a lanczos-downscaled 1080p from the same
 * pixels in one pass. Workers take contiguous runs of frames in parallel and
 * the runs are joined without re-encoding.
 *
 * The audio is the mp3 decoded by ffmpeg, which trims the encoder's padding
 * the way afconvert does — the decode the score was measured on; the two agree
 * to the sample — and is encoded to AAC at 320 kb/s.
 *
 * Colour is tagged BT.709, limited range, so #ece4d2 plays back as #ece4d2
 * rather than as whatever a player guesses for an untagged file.
 */
import { spawn, execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { cpus, tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'

import { chromium } from 'playwright-core'

import { ANDALUSIA_SCORE } from '../../app/config/andalusiaScore.ts'
import { INTO_THE_WILD_SCORE } from '../../app/config/intoTheWildScore.ts'
import { GOODBYE_NORMA_JEANE_SCORE } from '../../app/config/goodbyeNormaJeaneScore.ts'
import { IVORY_SCORE } from '../../app/config/ivoryScore.ts'
import { CONMAN_SCORE } from '../../app/config/conmanScore.ts'
import { SHIP_TO_STOCKHOLM_SCORE } from '../../app/config/shipToStockholmScore.ts'
import { NEW_YORK_SCORE } from '../../app/config/newYorkScore.ts'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../..')

/* The same registries as frames.mjs. */
const FILMS = {
  cartography: ['cartography.mjs', 'cartographyFrame'],
  'cartography-album': ['cartography.mjs', 'cartographyAlbumFrame'],
  relief: ['relief.mjs', 'reliefFrame'],
  screenprint: ['screenprint.mjs', 'screenprintFrame'],
  etching: ['etching.mjs', 'etchingFrame'],
  engraving: ['engraving.mjs', 'engravingFrame'],
  'wood-engraving': ['wood-engraving.mjs', 'woodEngravingFrame'],
  letterpress: ['letterpress.mjs', 'letterpressFrame'],
}
const SCORES = {
  andalusia: ANDALUSIA_SCORE,
  'into-the-wild': INTO_THE_WILD_SCORE,
  'goodbye-norma-jeane': GOODBYE_NORMA_JEANE_SCORE,
  ivory: IVORY_SCORE,
  conman: CONMAN_SCORE,
  'ship-to-stockholm': SHIP_TO_STOCKHOLM_SCORE,
  'new-york': NEW_YORK_SCORE,
}

const { values: opt } = parseArgs({
  options: {
    fps: { type: 'string', default: '60' },
    from: { type: 'string' },
    to: { type: 'string' },
    workers: { type: 'string', default: String(Math.max(2, Math.min(8, cpus().length - 4))) },
    crf: { type: 'string', default: '12' },
    out: { type: 'string' },
  },
})

const filmName = process.env.FILM ?? 'cartography-album'
const songName = process.env.SONG ?? 'andalusia'
const [filmFile, filmExport] = FILMS[filmName] ?? []
const score = SCORES[songName]
if (!filmFile || !score) throw new Error(`Unknown FILM "${filmName}" or SONG "${songName}"`)
const film = (await import(resolve(root, 'shared/video/films', filmFile)))[filmExport]

/* The mark, prepared exactly as MusicVideoSvgFilm prepares it. */
const lockup = readFileSync(resolve(root, 'public/logos/suite/a4-lockup-stacked.svg'), 'utf8')
  .replace('<svg ', '<svg width="918" height="619.07" ')
  .replace(/ color="[^"]*"/, '')
  .replace(/ role="img"/, '')
  .replace(/ aria-label="[^"]*"/, '')
  .replace(/<title>.*?<\/title>/, '')

const fps = Number(opt.fps)
const mp3 = resolve(root, 'public', score.src.replace(/^\//, ''))

/* The record's real length, as decoded — the film runs as long as the audio. */
const audioSeconds = Number(execFileSync('ffprobe', [
  '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3,
]).toString().trim())

const from = opt.from ? Number(opt.from) : 0
const to = opt.to ? Number(opt.to) : audioSeconds
const first = Math.round(from * fps)
const last = Math.ceil(to * fps) // exclusive
const total = last - first
const whole = !opt.from && !opt.to

const outBase = opt.out
  ? resolve(opt.out)
  : resolve(root, 'exports', `${songName}-${filmName}${whole ? '' : `-${from}-${to}`}`)
mkdirSync(dirname(outBase), { recursive: true })
const work = join(tmpdir(), `mp4-${songName}-${process.pid}`)
mkdirSync(work, { recursive: true })

/* ── The page every frame is drawn on ─────────────────────────────── */
/*
 * The film's own <svg>, styled as MusicVideoSvgFilm styles it, filling a
 * 3840×2160 viewport — the page on a 4K screen, so every pixel is vector drawn
 * at that size, not a 1600 frame blown up. (A device scale factor looks like
 * the same thing and is not: CDP's surface capture ignores it and hands back
 * 1600×900.)
 */
const PAGE = `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&display=block">
<style>
  html, body { margin: 0; background: #000; overflow: hidden; }
  svg { display: block; width: 3840px; height: 2160px;
        font-family: "Jost", system-ui, sans-serif;
        font-variant-ligatures: none; isolation: isolate; }
</style>
<svg id="film" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"></svg>`

async function openPage(browser) {
  const context = await browser.newContext({ viewport: { width: 3840, height: 2160 }, deviceScaleFactor: 1 })
  const page = await context.newPage()
  await page.setContent(PAGE, { waitUntil: 'networkidle' })
  // Every weight the films set, loaded before the first frame — a frame drawn
  // in the fallback face would be a different film.
  const ok = await page.evaluate(async () => {
    await Promise.all(['400', '600', '700'].map((w) => document.fonts.load(`${w} 40px Jost`, 'ANDALUSIA 5/10')))
    await document.fonts.ready
    return ['400', '600', '700'].every((w) => document.fonts.check(`${w} 40px Jost`))
  })
  if (!ok) throw new Error('Jost did not load; refusing to render in a fallback face')
  const cdp = await context.newCDPSession(page)
  return { page, cdp }
}

/* ── One worker: a run of frames into one pair of segments ────────── */
const X264 = (crf) => [
  '-c:v', 'libx264', '-preset', 'slow', '-tune', 'animation', '-crf', String(crf),
  '-pix_fmt', 'yuv420p', '-profile:v', 'high',
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
  '-x264-params', 'colorprim=bt709:transfer=bt709:colormatrix=bt709',
  '-g', String(fps * 2), '-r', String(fps),
]

async function runWorker(browser, index, start, end, onFrame) {
  const { page, cdp } = await openPage(browser)
  const seg4k = join(work, `seg-${index}-2160.mp4`)
  const seg1080 = join(work, `seg-${index}-1080.mp4`)
  const ff = spawn('ffmpeg', [
    '-v', 'error', '-y',
    '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    '-filter_complex',
    '[0:v]scale=out_color_matrix=bt709:out_range=tv,split=2[a][b];[b]scale=1920:1080:flags=lanczos:out_color_matrix=bt709:out_range=tv[c]',
    '-map', '[a]', ...X264(Number(opt.crf)), '-level', '5.2', seg4k,
    '-map', '[c]', ...X264(Number(opt.crf) + 2), '-level', '4.2', seg1080,
  ], { stdio: ['pipe', 'inherit', 'inherit'] })
  const done = new Promise((ok, fail) => ff.on('close', (code) => (code === 0 ? ok() : fail(new Error(`ffmpeg exited ${code}`)))))

  for (let n = start; n < end; n++) {
    const { svg } = film({ time: n / fps, score, lockup, uid: 'film' })
    await page.evaluate((markup) => { document.getElementById('film').innerHTML = markup }, svg)
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true, optimizeForSpeed: true })
    const png = Buffer.from(data, 'base64')
    if (!ff.stdin.write(png)) await new Promise((ok) => ff.stdin.once('drain', ok))
    onFrame()
  }
  ff.stdin.end()
  await done
  await page.context().close()
  return { seg4k, seg1080 }
}

/* ── Run ──────────────────────────────────────────────────────────── */
const workers = Math.min(Number(opt.workers), total)
const browser = await chromium.launch({ channel: 'chrome', args: ['--disable-gpu', '--hide-scrollbars'] })
const began = Date.now()
let drawn = 0
const tick = () => {
  drawn++
  if (drawn % 120 === 0 || drawn === total) {
    const rate = drawn / ((Date.now() - began) / 1000)
    process.stdout.write(`\r${drawn}/${total} frames · ${rate.toFixed(1)}/s · ${Math.round((total - drawn) / rate)}s left   `)
  }
}

console.log(`${score.title} · ${filmName} · ${(total / fps).toFixed(2)}s · ${total} frames at ${fps} fps · ${workers} workers`)
const per = Math.ceil(total / workers)
let segments
try {
  segments = await Promise.all(Array.from({ length: workers }, (_, i) => {
    const start = first + i * per
    return runWorker(browser, i, start, Math.min(start + per, last), tick)
  }))
}
finally {
  await browser.close()
}
process.stdout.write('\n')

/* Join the runs without re-encoding, then lay the record under them. */
for (const [key, label] of [['seg4k', '2160p'], ['seg1080', '1080p']]) {
  const list = join(work, `${label}.txt`)
  writeFileSync(list, segments.map((s) => `file '${s[key]}'`).join('\n'))
  const joined = join(work, `${label}-video.mp4`)
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', joined])
  const out = `${outBase}-${label}.mp4`
  execFileSync('ffmpeg', [
    '-v', 'error', '-y',
    '-i', joined,
    '-ss', String(first / fps), '-t', String(total / fps), '-i', mp3,
    '-map', '0:v', '-map', '1:a',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k',
    '-movflags', '+faststart', out,
  ])
  console.log(`→ ${out}`)
}
rmSync(work, { recursive: true, force: true })
console.log(`done in ${Math.round((Date.now() - began) / 1000)}s`)
