/*
 * A contact sheet: many frames of a film, on one page, in one look.
 *
 *   node tools/video-styles/frames.mjs 73 88 12      # 12 frames across verse 3
 *   node tools/video-styles/frames.mjs 0 15          # 8 frames, the default
 *   node tools/video-styles/frames.mjs @6 @14 @16.2  # exactly those seconds
 *   FILM=cartography SONG=andalusia node ... 0 173 12
 *   FILM=woodcut SONG=into-the-wild node ... 175.7 190.7 6
 *
 * Writes .frames.html and opens it. FILM and SONG default to cartography and
 * andalusia; both registries are a few lines below.
 *
 * WHY THIS EXISTS
 *
 * A film like this is not judged a frame at a time. Every expensive mistake in
 * Cartography — type set along the whole route instead of one leg of it, a
 * lyric running up a leg that climbs, a compass rose printed through a port
 * name, a coastline that read as a mountain range — was invisible in any single
 * still and obvious the moment eight moments were laid out side by side.
 *
 * It is also the cheap way to work. Driving a browser to a page, pressing play,
 * waiting fifteen seconds and screenshotting gets you one frame per round trip;
 * this gets twelve per round trip and needs no dev server, no audio and no
 * clock. That difference is most of the cost of building one of these.
 *
 * It works at all because a style module is a pure function of the song's clock
 * with the score passed in — `node` can call it directly, at any time value, in
 * any order. A style written as a Vue template could not be sampled this way,
 * which is the practical argument for the shape the modules are in.
 */
import { execFile } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { ANDALUSIA_SCORE } from '../../app/config/andalusiaScore.ts'
import { INTO_THE_WILD_SCORE } from '../../app/config/intoTheWildScore.ts'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../..')

/*
 * Add a line to each when a style or a song is added. Both are imported at the
 * top rather than resolved from a path at runtime, so a typo is an error here
 * and not a blank page later.
 *
 *   FILM=cartography SONG=andalusia node tools/video-styles/frames.mjs 0 173 12
 */
/*
 * Films are [module, export] and imported lazily — only the one asked for.
 * Importing all of them up front meant one half-written module anywhere broke
 * the review loop for every style, which is what happened the first time five
 * were built at once.
 */
const FILMS = {
  cartography: ['cartography.mjs', 'cartographyFrame'],
  'cartography-album': ['cartography.mjs', 'cartographyAlbumFrame'],
  trailhead: ['trailhead.mjs', 'trailheadFrame'],
  contour: ['contour.mjs', 'contourFrame'],
  woodcut: ['woodcut.mjs', 'woodcutFrame'],
  relief: ['relief.mjs', 'reliefFrame'],
  'field-journal': ['field-journal.mjs', 'fieldJournalFrame'],
  flipbook: ['flipbook.mjs', 'flipbookFrame'],
}

const SCORES = {
  andalusia: ANDALUSIA_SCORE,
  'into-the-wild': INTO_THE_WILD_SCORE,
}

const pick = (table, key, what) => {
  const found = table[key]
  if (!found) throw new Error(`No ${what} named "${key}". Have: ${Object.keys(table).join(', ')}`)
  return found
}

const [filmFile, filmExport] = pick(FILMS, process.env.FILM ?? 'cartography', 'film')
const film = (await import(resolve(root, 'shared/video/films', filmFile)))[filmExport]
if (typeof film !== 'function') throw new Error(`${filmFile} has no export ${filmExport}`)
const score = pick(SCORES, process.env.SONG ?? 'andalusia', 'song')

/*
 * The mark is read off disk and handed in, the way the Vue component hands in
 * the same file through Vite's `?raw`. The film never reaches for a file
 * itself — which is the whole reason it can run here and in a browser.
 */
const lockup = readFileSync(resolve(root, 'public/logos/suite/a4-lockup-stacked.svg'), 'utf8')
  .replace('<svg ', '<svg width="918" height="619.07" ')
  .replace(/ color="[^"]*"/, '')
  .replace(/ role="img"/, '')
  .replace(/ aria-label="[^"]*"/, '')
  .replace(/<title>.*?<\/title>/, '')

/* ── What to sample ───────────────────────────────────────────────── */
const args = process.argv.slice(2)
const exact = args.filter((a) => a.startsWith('@')).map((a) => Number(a.slice(1)))
let times = exact
if (!times.length) {
  const from = Number(args[0] ?? 0)
  const to = Number(args[1] ?? score.duration)
  const count = Number(args[2] ?? 8)
  // Inset by half a step at each end: the first and last frame of a window are
  // usually its least interesting, because a cut has just happened or is about
  // to.
  const step = (to - from) / count
  times = Array.from({ length: count }, (_, i) => from + step * (i + 0.5))
}

const cells = times.map((time, index) => {
  const frame = film({ time, score, lockup, uid: `f${index}` })
  return `<figure><svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">${frame.svg}</svg>
<figcaption>${time.toFixed(2)}s &middot; ${frame.label.replace(/[<&]/g, '')}</figcaption></figure>`
}).join('\n')

// OUT=<path> writes somewhere else — for two reviews running at once.
const out = resolve(root, process.env.OUT ?? '.frames.html')
writeFileSync(out, `<!doctype html><meta charset="utf-8"><title>${score.title} — frames</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Jost:wght@400;700&display=swap">
<style>
  body { margin: 0; padding: 10px; background: #111; color: #999;
         font: 12px/1.5 Jost, system-ui, sans-serif;
         display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
  figure { margin: 0 }
  /* The family is set on the <svg> as well: the film sets weights per element
     but never a family, exactly as it does not on the page. */
  svg { display: block; width: 100%; aspect-ratio: 16 / 9;
        font-family: Jost, system-ui, sans-serif; font-variant-ligatures: none; }
  figcaption { padding: 5px 2px }
</style>
${cells}`)

console.log(`${times.length} frames → ${out}`)
// NO_OPEN=1 when the sheet is only going to be rasterised, not looked at.
if (!process.env.NO_OPEN) execFile('open', [out], () => {})
