/*
 * What the live videos share: the camera's grade, the slate the opening and
 * the end card sit on, the Hairline lines, the mark, drawing frames in Chrome
 * and the encode. live.mjs renders one song with them, live-set.mjs the whole
 * set.
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { chromium } from 'playwright-core'

import { markDrawnAt, MARK_DRAW } from '../../shared/video/album.mjs'
import { rect, r, easeInOut, ramp, fall } from '../../shared/video/kit.mjs'

import { drawLines, setLine, setLines } from './hairline.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

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
export const GRADES = {
  'teal-bone': "hqdn3d=2:1.5:5:4,eq=saturation=0.72,curves=all='0/0.08 1/0.94',colorbalance=rs=-0.12:gs=0.03:bs=0.12:rm=-0.03:bm=0.03:rh=0.05:gh=0.03:bh=-0.04,cas=0.35",
  warm: "hqdn3d=2:1.5:5:4,colortemperature=temperature=5400:mix=0.7,colorbalance=rs=0.02:bs=-0.03:rm=0.03:bm=-0.02,eq=contrast=1.07:gamma=0.97,vibrance=intensity=0.08,curves=all='0/0 0.06/0.04 0.5/0.5 0.92/0.945 1/1',cas=0.45",
  none: 'null',
}

export const WHITE = '#f4f6f7'
/*
 * The opening's and end card's ground: "faded slate", chosen 2026-10-27 from
 * eight navies laid against the teal-bone grade (the curtain grades to #001b29).
 */
export const BG = '#1c2939'
/* Type the size of the old credits (34), lines 62 apart, centred on the frame. */
const SIZE = 34
export const lines = (texts) => texts.map((text, i) => setLine(text, 800, 450 - ((texts.length - 1) * 62) / 2 + i * 62 + 12, SIZE))

/* The mark, prepared exactly as MusicVideoSvgFilm prepares it. */
const lockup = readFileSync(resolve(root, 'public/logos/suite/a4-lockup-stacked.svg'), 'utf8')
  .replace('<svg ', '<svg width="918" height="619.07" ')
  .replace(/ color="[^"]*"/, '')
  .replace(/ role="img"/, '')
  .replace(/ aria-label="[^"]*"/, '')
  .replace(/<title>.*?<\/title>/, '')

/*
 * The opening's clock, in seconds: the mark drawn from `mark` (complete
 * MARK_DRAW.done later), faded over `markOut`; the title's letters drawn on
 * over `title`; the slate and the title gone over `reveal`.
 *
 * `reveal` is when the black starts to fade: after the camera operator's
 * last reframe, so the stage is never seen being found. Andalusia's (11.5 s,
 * reframes at 8.4, 10.2 and 11.0–11.3 s) is the clock as approved; a later
 * reveal moves the title by as much and the mark's fade by half, so the
 * title still holds 2.6 s and the screens stay evenly spaced.
 */
export function openingClock(reveal, titled) {
  const late = reveal - 11.5
  return titled ? {
    mark: 0.5,
    markOut: [5.0 + late / 2, 5.7 + late / 2],
    title: [6.2 + late, 8.9 + late],
    reveal: [11.5 + late, 12.9 + late],
  } : {
    mark: 0.5,
    reveal: [11.5 + late, 12.9 + late],
  }
}

/* One frame of the opening, `now` seconds in: the mark centred as on the end card, then the title (`lines`, or null). */
export function openingAt(open, title, now) {
  const black = fall(now, ...open.reveal)
  if (black <= 0.001) return ''
  const markOn = open.markOut ? fall(now, ...open.markOut) : 1
  const mark = now >= open.mark && markOn > 0.001
    ? `<g transform="translate(800 450) scale(${r(520 / 918, 5)}) translate(-459 -309.5)" style="color:${WHITE}" opacity="${r(easeInOut(markOn), 3)}">${markDrawnAt(Math.min(now - open.mark, MARK_DRAW.done), 'live')}</g>`
    : ''
  const drawn = title && now >= open.title[0] ? drawLines(title, easeInOut(ramp(now, ...open.title)), WHITE, 'live-title') : ''
  return `<g opacity="${r(easeInOut(black), 4)}">${rect(0, 0, 1600, 900, BG)}${mark}${drawn}</g>`
}

/* Andalusia's end card, its two screens: the mark, then credits (`**names**` in SemiBold). */
export const endLogo = () => rect(0, 0, 1600, 900, BG) +
  `<g transform="translate(800 450) scale(${r(520 / 918, 5)}) translate(-459 -309.5)" style="color:${WHITE}">${lockup}</g>`
export const endCredits = (texts) => rect(0, 0, 1600, 900, BG) + setLines(lines(texts), WHITE)

/* ── Drawing: a transparent 1920×1080 page ────────────────────────── */
// Every letter is a path (hairline.mjs), so the page loads no fonts.
const PAGE = `<!doctype html><meta charset="utf-8">
<style>
  html, body { margin: 0; background: transparent; overflow: hidden; }
  svg { display: block; width: 1920px; height: 1080px; isolation: isolate; }
</style>
<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"><g id="film"></g></svg>`

/* Calls `draw(shoot)`, where `shoot(svg, file)` writes one PNG of `svg` (in the 1600×900 frame). */
export async function drawing(draw) {
  const browser = await chromium.launch({ channel: 'chrome', args: ['--disable-gpu', '--hide-scrollbars'] })
  try {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })
    const page = await context.newPage()
    await page.setContent(PAGE)
    // Playwright's own screenshot, not CDP's surface capture: the surface comes
    // back 1920×993 here (the window, not the viewport), and without alpha.
    await draw(async (svg, file) => {
      await page.evaluate((markup) => { document.getElementById('film').innerHTML = markup }, svg)
      await page.screenshot({ path: file, type: 'png', omitBackground: true })
    })
  }
  finally {
    await browser.close()
  }
}

/* H.264 CRF `crf` preset slow, BT.709 tagged, AAC 320k: the output arguments. */
export const encode = ({ fps, crf, out }) => [
  '-c:v', 'libx264', '-preset', 'slow', '-crf', String(crf), '-pix_fmt', 'yuv420p', '-profile:v', 'high',
  '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
  '-r', String(fps), '-g', String(fps * 2),
  '-c:a', 'aac', '-b:a', '320k', '-ar', '48000',
  '-movflags', '+faststart', resolve(out),
]
