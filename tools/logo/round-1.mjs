// Round one: ten first-pass directions, from the anchor on its own to the
// anchor woven through the name. Kept as drawn so the review page can show
// both rounds side by side — the refinements live in round-2.mjs.

import { measure, textArc, textRun } from './lettering.mjs'
import {
  NAME, STOCK_Y, anchorMono, anchorSolid, diamond, doc, pad, place, r2, swell,
} from './anchor.mjs'

/* ------------------------------------------------------------------ *
 * 01 — the anchor alone, monoline
 * ------------------------------------------------------------------ */
function minimal() {
  const a = anchorMono(11)
  return doc(pad(a.box, 8), a.body, 'Havre De Grace anchor')
}

/* ------------------------------------------------------------------ *
 * 02 — the anchor alone, solid
 * ------------------------------------------------------------------ */
function classic() {
  const a = anchorSolid()
  return doc(pad(a.box, 8), a.body, 'Havre De Grace anchor')
}

/* ------------------------------------------------------------------ *
 * 03 — anchor over a single line of type
 * ------------------------------------------------------------------ */
function stacked() {
  const W = 850
  const tracking = 26
  const cap = (W / measure(NAME, { w: 9, tracking }).width) * 100
  const word = textRun(NAME, { cap, tracking })

  const anchorH = 380
  const gap = 100
  const a = place(anchorSolid(), { x: 0, y: 0, height: anchorH })

  const body =
    `<g transform="translate(${r2((W - a.width) / 2)} 0)">${a.markup}</g>`
    + `<g transform="translate(0 ${r2(anchorH + gap)})">${word.markup}</g>`

  return doc([-34, -34, W + 68, anchorH + gap + cap + 68], body, 'Havre De Grace')
}

/* ------------------------------------------------------------------ *
 * 04 — anchor beside a two-line wordmark
 *
 * The two lines are set to a common width by scaling rather than by tracking,
 * which is how the existing mark is built: GRACE simply runs larger.
 * ------------------------------------------------------------------ */
function horizontal() {
  const LINE_W = 560
  const tracking = 22
  const cap1 = (LINE_W / measure('HAVRE DE', { w: 9, tracking }).width) * 100
  const cap2 = (LINE_W / measure('GRACE', { w: 9, tracking }).width) * 100
  const leading = 44

  const t1 = textRun('HAVRE DE', { cap: cap1, tracking })
  const t2 = textRun('GRACE', { cap: cap2, tracking })
  const blockH = cap1 + leading + cap2

  const a = place(anchorMono(9), { height: blockH + 30 })
  const ruleX = a.width + 56
  const textX = ruleX + 56

  const body =
    a.markup
    + `<path d="M${r2(ruleX)} 6V${r2(blockH + 24)}" stroke="currentColor" `
    + `stroke-width="2.5" opacity="0.4"/>`
    + `<g transform="translate(${r2(textX)} 15)">${t1.markup}</g>`
    + `<g transform="translate(${r2(textX)} ${r2(15 + cap1 + leading)})">${t2.markup}</g>`

  return doc([-26, -26, textX + LINE_W + 52, blockH + 30 + 52], body, 'Havre De Grace')
}

/* ------------------------------------------------------------------ *
 * 05 — circular seal
 * ------------------------------------------------------------------ */
function seal() {
  const C = 340
  const arc = textArc(NAME, {
    cx: C, cy: C, radius: 240, cap: 44, weight: 9, tracking: 26, centerDeg: 90,
  })

  const anchorH = 352
  const a = place(anchorSolid(), { height: anchorH })

  const body =
    `<circle cx="${C}" cy="${C}" r="320" fill="none" stroke="currentColor" stroke-width="9"/>`
    + `<circle cx="${C}" cy="${C}" r="298" fill="none" stroke="currentColor" stroke-width="3"/>`
    + arc.markup
    + diamond(C, C + 250, 21)
    + `<g transform="translate(${r2(C - a.width / 2)} ${r2(C - anchorH / 2 + 6)})">${a.markup}</g>`

  return doc([-14, -14, 2 * C + 28, 2 * C + 28], body, 'Havre De Grace')
}

/* ------------------------------------------------------------------ *
 * 06 — the anchor set inline, as the word space
 *
 * The mark stops sitting beside the name and starts doing a job inside it:
 * it separates the two halves of the wordmark and overhangs both cap line and
 * baseline, which is what ties the lockup together.
 * ------------------------------------------------------------------ */
function inline() {
  const tracking = 24
  const cap = 100
  const t1 = textRun('HAVRE DE', { cap, tracking })
  const t2 = textRun('GRACE', { cap, tracking })

  const anchorH = 214
  const a = place(anchorSolid(), { height: anchorH })
  const gap = 72
  const ax = t1.width + gap
  const ay = 50 - anchorH / 2

  const body =
    t1.markup
    + `<g transform="translate(${r2(ax)} ${r2(ay)})">${a.markup}</g>`
    + `<g transform="translate(${r2(ax + a.width + gap)} 0)">${t2.markup}</g>`

  const W = ax + a.width + gap + t2.width
  return doc([-28, ay - 28, W + 56, anchorH + 56], body, 'Havre De Grace')
}

/* ------------------------------------------------------------------ *
 * 07 — anchor knocked out of a disc
 * ------------------------------------------------------------------ */
function knockout() {
  const R = 160
  const a = place(anchorMono(13), { height: 214 })

  const body =
    `<mask id="hdg-disc" maskUnits="userSpaceOnUse" x="0" y="0" width="${2 * R}" height="${2 * R}">`
    + `<circle cx="${R}" cy="${R}" r="${R}" fill="#fff"/>`
    + `<g color="#000" transform="translate(${r2(R - a.width / 2)} ${r2(R - 107)})">${a.markup}</g>`
    + `</mask>`
    + `<circle cx="${R}" cy="${R}" r="${R}" fill="currentColor" mask="url(#hdg-disc)"/>`

  return doc([0, 0, 2 * R, 2 * R], body, 'Havre De Grace')
}

/* ------------------------------------------------------------------ *
 * 08 — anchor above a waterline, inside a ring
 * ------------------------------------------------------------------ */
function harbor() {
  const C = 170
  const R = 152
  const anchorH = 196
  const a = place(anchorMono(11), { height: anchorH })

  const body =
    `<circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="currentColor" stroke-width="8"/>`
    + `<g transform="translate(${r2(C - a.width / 2)} 40)">${a.markup}</g>`
    + `<g fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round">`
    + swell(C, 262, 106, 17) + swell(C, 296, 66, 13)
    + `</g>`

  return doc([-8, -8, 2 * C + 16, 2 * C + 16], body, 'Havre De Grace')
}

/* ------------------------------------------------------------------ *
 * 09 — anchor knocked out of a plectrum
 *
 * The one mark in the set that says "musician" as loudly as it says "harbour".
 * ------------------------------------------------------------------ */
function pick() {
  const shape =
    'M150 6C214 6 292 42 292 96'
    + 'C292 168 222 252 168 302'
    + 'C158 311 142 311 132 302'
    + 'C78 252 8 168 8 96'
    + 'C8 42 86 6 150 6Z'

  const anchorH = 176
  const a = place(anchorMono(13), { height: anchorH })

  const body =
    `<mask id="hdg-pick" maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="324">`
    + `<path d="${shape}" fill="#fff"/>`
    + `<g color="#000" transform="translate(${r2(150 - a.width / 2)} 54)">${a.markup}</g>`
    + `</mask>`
    + `<path d="${shape}" fill="currentColor" mask="url(#hdg-pick)"/>`

  return doc([-8, -6, 316, 329], body, 'Havre De Grace')
}

/* ------------------------------------------------------------------ *
 * 10 — arched wordmark over the anchor
 *
 * The stock is drawn long, reaching out under the falling ends of the arch,
 * so the type and the mark close into one silhouette rather than stacking.
 * ------------------------------------------------------------------ */
function arch() {
  const cx = 520
  const cy = 560
  const baseR = 420
  const cap = 78
  const arc = textArc(NAME, {
    cx, cy, radius: baseR, cap, weight: 9, tracking: 24, centerDeg: 90,
  })

  const anchorH = 480
  const mark = anchorMono(15)
  const a = place(mark, { x: 0, y: 0, height: anchorH })
  const placed = place(mark, { x: cx - a.width / 2, y: 200, height: anchorH })
  const [, stockY] = placed.at(100, STOCK_Y)
  const reach = 264
  const strokeW = 15 * (anchorH / mark.box.h)

  const body =
    arc.markup
    + `<path d="M${cx - reach} ${r2(stockY)}H${cx + reach}" fill="none" stroke="currentColor" `
    + `stroke-width="${r2(strokeW)}" stroke-linecap="round"/>`
    + placed.markup

  const top = cy - (baseR + cap) - 24
  return doc([cx - 500, top, 1000, 200 + anchorH + 40 - top], body, 'Havre De Grace')
}

/* ------------------------------------------------------------------ */

// Ordered as they are presented: the six standalone marks first, then the four
// wordmark lockups, with the two widest last so a two-column grid never wraps
// around a hole.
// Ordered as presented: the six standalone marks first, then the four wordmark
// lockups, with the two widest last so a two-column grid never wraps a hole.
export const ROUND_ONE = [
  ['01-anchor-minimal.svg', minimal],
  ['02-anchor-classic.svg', classic],
  ['03-anchor-disc.svg', knockout],
  ['04-anchor-harbor.svg', harbor],
  ['05-anchor-plectrum.svg', pick],
  ['06-anchor-seal.svg', seal],
  ['07-wordmark-stacked.svg', stacked],
  ['08-wordmark-arch.svg', arch],
  ['09-wordmark-horizontal.svg', horizontal],
  ['10-wordmark-inline.svg', inline],
]
