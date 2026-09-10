// Round four: the shortlist.
//
// Three pieces are settled — the anchor on its own, the plain seal, and that
// seal reversed. The open question is the type on the stacked lockup, so the
// last five are the same lockup with the lettering swapped underneath it.
//
// The wordmark on the existing logo is a light neo-grotesque, not the geometric
// face used in rounds one to three, which is why those lockups never quite sat
// with the rest of the brand. `buildGrotesque` is the closer draw; the
// geometric version is kept here so the two can be compared directly.

import { buildGrotesque, measure, textRun } from './lettering.mjs'
import {
  NAME, STOCK_WEIGHT, anchorSolid, centered, doc, pad, r2,
} from './anchor.mjs'

const ANCHOR = () => anchorSolid({ crownWeight: STOCK_WEIGHT })

const C = 340
const SEAL_BOX = [-14, -14, 2 * C + 28, 2 * C + 28]
const SEAL_ANCHOR_H = 420

const ring = (r, w, stroke = 'currentColor') =>
  `<circle cx="${C}" cy="${C}" r="${r}" fill="none" stroke="${stroke}" stroke-width="${w}"/>`

/* ------------------------------------------------------------------ *
 * 01 — the anchor, on its own
 * ------------------------------------------------------------------ */
function anchor() {
  const a = ANCHOR()
  return doc(pad(a.box, 8), a.body, 'Havre De Grace anchor')
}

/* ------------------------------------------------------------------ *
 * 02 — the seal
 * ------------------------------------------------------------------ */
function seal() {
  const body =
    ring(320, 9) + ring(298, 3)
    + centered(ANCHOR(), { cx: C, y: C - SEAL_ANCHOR_H / 2, height: SEAL_ANCHOR_H }).markup

  return doc(SEAL_BOX, body, 'Havre De Grace')
}

/* ------------------------------------------------------------------ *
 * 03 — the seal reversed
 *
 * A filled disc with the rules and the anchor cut out of it, so they take the
 * colour of whatever the mark is placed on rather than being painted white.
 * That way one file works on paper, on a dark site, and on a photograph.
 * ------------------------------------------------------------------ */
function sealInverted() {
  const cut =
    `<g color="#000">`
    + ring(320, 9, '#000') + ring(298, 3, '#000')
    + centered(ANCHOR(), { cx: C, y: C - SEAL_ANCHOR_H / 2, height: SEAL_ANCHOR_H }).markup
    + `</g>`

  const body =
    `<mask id="hdg4-seal-inverted" maskUnits="userSpaceOnUse" x="0" y="0" `
    + `width="${2 * C}" height="${2 * C}">`
    + `<circle cx="${C}" cy="${C}" r="332" fill="#fff"/>${cut}</mask>`
    + `<circle cx="${C}" cy="${C}" r="332" fill="currentColor" mask="url(#hdg4-seal-inverted)"/>`

  return doc(SEAL_BOX, body, 'Havre De Grace')
}

/* ------------------------------------------------------------------ *
 * The stacked lockup, with the type as the variable
 *
 * Wordmark width is held constant so the lockups are directly comparable.
 * Tracking is therefore what sets the cap height: tighter tracking buys a
 * bigger, heavier line, looser tracking a finer one.
 * ------------------------------------------------------------------ */
function stacked({ font, tracking, width = 850, anchorH = 380, gap = 100 }) {
  const cap = (width / measure(NAME, { w: 9, tracking, font }).width) * 100
  const word = textRun(NAME, { cap, tracking, font })

  const body =
    centered(ANCHOR(), { cx: width / 2, y: 0, height: anchorH }).markup
    + `<g transform="translate(0 ${r2(anchorH + gap)})">${word.markup}</g>`

  return doc([-34, -34, width + 68, anchorH + gap + cap + 68], body, 'Havre De Grace')
}

const stackGrotesque = () => stacked({ font: buildGrotesque, tracking: 26 })
const stackTight = () => stacked({ font: buildGrotesque, tracking: 10 })
const stackWide = () => stacked({ font: buildGrotesque, tracking: 48 })
const stackGeometric = () => stacked({ tracking: 26 })

/* ------------------------------------------------------------------ *
 * 08 — two lines, which is how the existing logo is built
 *
 * The lines are matched in width by scale rather than by tracking, so GRACE
 * simply runs larger. That is the structure of the current mark, redrawn.
 * ------------------------------------------------------------------ */
function stackTwoLine() {
  const W = 620
  const tracking = 22
  const font = buildGrotesque
  const cap1 = (W / measure('HAVRE DE', { w: 9, tracking, font }).width) * 100
  const cap2 = (W / measure('GRACE', { w: 9, tracking, font }).width) * 100
  const leading = 42
  const anchorH = 400
  const gap = 92

  const body =
    centered(ANCHOR(), { cx: W / 2, y: 0, height: anchorH }).markup
    + `<g transform="translate(0 ${r2(anchorH + gap)})">`
    + textRun('HAVRE DE', { cap: cap1, tracking, font }).markup + `</g>`
    + `<g transform="translate(0 ${r2(anchorH + gap + cap1 + leading)})">`
    + textRun('GRACE', { cap: cap2, tracking, font }).markup + `</g>`

  const h = anchorH + gap + cap1 + leading + cap2
  return doc([-34, -34, W + 68, h + 68], body, 'Havre De Grace')
}

/* ------------------------------------------------------------------ */

export const ROUND_FOUR = [
  ['01-anchor.svg', anchor],
  ['02-seal.svg', seal],
  ['03-seal-inverted.svg', sealInverted],
  ['04-stack-grotesque.svg', stackGrotesque],
  ['05-stack-grotesque-tight.svg', stackTight],
  ['06-stack-grotesque-wide.svg', stackWide],
  ['07-stack-geometric.svg', stackGeometric],
  ['08-stack-two-line.svg', stackTwoLine],
]
