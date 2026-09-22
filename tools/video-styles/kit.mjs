/*
 * The sheet builder's kit: everything in shared/video/kit.mjs, plus the few
 * helpers that can only run in Node.
 *
 * The split is not arbitrary. Everything below reads the band's lockup off
 * disk, which a browser cannot do — the film components inline the same file
 * through Vite's `?raw` instead. Everything a browser *can* do is shared, so a
 * style's still sheet and that style's film are drawn by the same code.
 */
export * from '../../shared/video/kit.mjs'
export { r } from '../../shared/video/motifs.mjs'

import { rect, t } from '../../shared/video/kit.mjs'
import { r } from '../../shared/video/motifs.mjs'

/** The stacked lockup, inlined so it takes the film's foreground colour. */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const lockupRaw = readFileSync(resolve(here, '../../public/logos/suite/a4-lockup-stacked.svg'), 'utf8')

/** `mark(cx, cy, width, colour)` — the band's mark, centred, any size. */
export function mark(cx, cy, width, colour, opacity = 1) {
  const inner = lockupRaw
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/<title>[\s\S]*?<\/title>/, '')
  // The file's own viewBox is "-34 -34 918 619.07".
  const s = width / 918
  const h = 619.07 * s
  return `<g transform="translate(${r(cx - width / 2)} ${r(cy - h / 2)}) scale(${r(s, 5)}) translate(34 34)" style="color:${colour}" opacity="${r(opacity, 3)}">${inner}</g>`
}

/* ── The end card. The same two screens in all seven films ────────────
 *
 * Whatever the film has been for two and a half minutes, it ends the same way:
 * the mark alone on black, held, then a hard cut to the credits on the same
 * black. It is the splash screen's lockup and the splash screen's ink, so the
 * last thing anybody sees of a record is the first thing they saw of the site.
 *
 * The ground is pure black rather than the splash's #141414 — on a phone, in a
 * feed, at the end of a film that has been ink or paper or amber for the whole
 * run, "nearly black" reads as a mistake and black reads as an ending.
 */
export const END_BLACK = '#000000'
export const END_INK = '#f4f6f7'

export const CREDITS = [
  'Words, voice and guitar — Stefan Auvache Bradley',
  'Mellophone, mix and production — Parker Holt',
]

/** Screen one: the mark, centred on both axes, nothing else in the frame. */
export const logoScreen = () => `
  ${rect(0, 0, 1600, 900, END_BLACK)}
  ${mark(800, 450, 500, END_INK)}`

/**
 * Screen two: the credits, one per line, centred on both axes and centred as
 * text. No headings, no rules, no mark — the mark has just had three seconds to
 * itself and putting it here as well would spend it twice.
 */
export const creditsScreen = (lines = CREDITS, o = {}) => {
  const size = o.size ?? 34
  const leading = o.leading ?? 62
  const first = 450 - ((lines.length - 1) * leading) / 2 + size * 0.34
  return `
  ${rect(0, 0, 1600, 900, END_BLACK)}
  ${lines.map((credit, i) => t({
    x: 800, y: first + i * leading, size, text: credit,
    fill: END_INK, anchor: 'middle', weight: 400, upper: false,
  })).join('')}`
}
