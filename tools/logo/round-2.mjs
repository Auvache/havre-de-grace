// Round two: the classic solid anchor, refined, and the compositions built on
// it. Two changes carry the whole set —
//
//   1. the crown crescent is thinned to the weight of the stock, so the bottom
//      of the mark stops going clubby and the whole anchor reads lighter;
//   2. seals are explored properly, since that is where the mark has the most
//      to say.
//
// Everything here uses anchorSolid at STOCK_WEIGHT. The monoline draw is not
// used in this round.

import { measure, textArc, textRun } from './lettering.mjs'
import {
  NAME, RING_CY, RING_R, STOCK_WEIGHT, anchorSolid, centered, diamond, doc,
  pad, place, r2, swell,
} from './anchor.mjs'

/** The refined anchor. Every composition in this round draws from here. */
const ANCHOR = () => anchorSolid({ crownWeight: STOCK_WEIGHT })

const SEAL_C = 340
const SEAL_BOX = [-14, -14, 2 * SEAL_C + 28, 2 * SEAL_C + 28]

const ring = (r, w) =>
  `<circle cx="${SEAL_C}" cy="${SEAL_C}" r="${r}" fill="none" stroke="currentColor" stroke-width="${w}"/>`

/* ------------------------------------------------------------------ *
 * 01 — the refined anchor alone
 * ------------------------------------------------------------------ */
function refined() {
  const a = ANCHOR()
  return doc(pad(a.box, 8), a.body, 'Havre De Grace anchor')
}

/* ------------------------------------------------------------------ *
 * 02 — seal, name arced over the top
 * ------------------------------------------------------------------ */
function sealClassic() {
  const arc = textArc(NAME, {
    cx: SEAL_C, cy: SEAL_C, radius: 240, cap: 44, weight: 9, tracking: 26, centerDeg: 90,
  })

  const body =
    ring(320, 9) + ring(298, 3)
    + arc.markup
    + diamond(SEAL_C, SEAL_C + 250, 21)
    + centered(ANCHOR(), { cx: SEAL_C, y: SEAL_C - 170, height: 352 }).markup

  return doc(SEAL_BOX, body, 'Havre De Grace')
}

/* ------------------------------------------------------------------ *
 * 03 — seal, name split top and bottom
 *
 * The shorter word runs larger so the two arcs carry comparable weight, and
 * diamonds sit at the three and nine o'clock joins where the arcs meet.
 * ------------------------------------------------------------------ */
function sealSplit() {
  const top = textArc('HAVRE', {
    cx: SEAL_C, cy: SEAL_C, radius: 238, cap: 50, weight: 9, tracking: 28, centerDeg: 90,
  })
  const bottom = textArc('DE GRACE', {
    cx: SEAL_C, cy: SEAL_C, radius: 238, cap: 46, weight: 9, tracking: 28,
    centerDeg: 270, flip: true,
  })

  const body =
    ring(320, 9) + ring(298, 3)
    + top.markup + bottom.markup
    + diamond(SEAL_C - 262, SEAL_C, 13) + diamond(SEAL_C + 262, SEAL_C, 13)
    + centered(ANCHOR(), { cx: SEAL_C, y: SEAL_C - 160, height: 320 }).markup

  return doc(SEAL_BOX, body, 'Havre De Grace')
}

/* ------------------------------------------------------------------ *
 * 04 — seal, reversed out of a solid disc
 * ------------------------------------------------------------------ */
function sealReversed() {
  const arc = textArc(NAME, {
    cx: SEAL_C, cy: SEAL_C, radius: 236, cap: 42, weight: 9, tracking: 26, centerDeg: 90,
  })

  const cut =
    `<g color="#000">`
    + `<circle cx="${SEAL_C}" cy="${SEAL_C}" r="290" fill="none" stroke="#000" stroke-width="3"/>`
    + arc.markup
    + diamond(SEAL_C, SEAL_C + 246, 19)
    + centered(ANCHOR(), { cx: SEAL_C, y: SEAL_C - 162, height: 336 }).markup
    + `</g>`

  const body =
    `<mask id="hdg2-seal-reversed" maskUnits="userSpaceOnUse" x="0" y="0" `
    + `width="${2 * SEAL_C}" height="${2 * SEAL_C}">`
    + `<circle cx="${SEAL_C}" cy="${SEAL_C}" r="320" fill="#fff"/>${cut}</mask>`
    + `<circle cx="${SEAL_C}" cy="${SEAL_C}" r="320" fill="currentColor" `
    + `mask="url(#hdg2-seal-reversed)"/>`

  return doc(SEAL_BOX, body, 'Havre De Grace')
}

/* ------------------------------------------------------------------ *
 * 05 — seal with a milled edge
 *
 * The ring of radial ticks is a coin edge. It gives the badge a texture that
 * survives being printed small, where a hairline second ring would drop out.
 * ------------------------------------------------------------------ */
function sealMilled() {
  const TICKS = 48
  const ticks = Array.from({ length: TICKS }, (_, i) => {
    const t = (i / TICKS) * Math.PI * 2
    const [c, s] = [Math.cos(t), Math.sin(t)]
    return `M${r2(SEAL_C + 294 * c)} ${r2(SEAL_C + 294 * s)}`
      + `L${r2(SEAL_C + 314 * c)} ${r2(SEAL_C + 314 * s)}`
  }).join('')

  const arc = textArc(NAME, {
    cx: SEAL_C, cy: SEAL_C, radius: 226, cap: 42, weight: 9, tracking: 26, centerDeg: 90,
  })

  const body =
    ring(320, 4)
    + `<path d="${ticks}" fill="none" stroke="currentColor" stroke-width="5"/>`
    + ring(284, 8)
    + arc.markup
    + diamond(SEAL_C, SEAL_C + 234, 17)
    + centered(ANCHOR(), { cx: SEAL_C, y: SEAL_C - 158, height: 316 }).markup

  return doc(SEAL_BOX, body, 'Havre De Grace')
}

/* ------------------------------------------------------------------ *
 * 06 — seal with the anchor breaking the inner ring
 *
 * The anchor is drawn taller than the inner ring can hold, so the shackle
 * crosses it at the top and the crown at the bottom, and the ring is masked
 * away behind both. The outer ring is left intact deliberately — break that
 * one too and the badge stops reading as a circle at all, because a crown this
 * wide runs almost tangent to it for most of the lower arc.
 * ------------------------------------------------------------------ */
function sealBreakout() {
  const anchorH = 540
  const a = centered(ANCHOR(), { cx: SEAL_C, y: SEAL_C - anchorH / 2, height: anchorH })
  const [ringX, ringY] = a.at(100, RING_CY)

  // The shackle is stroked, not filled, so it needs its own fattened copy —
  // the group stroke below cannot widen a child that sets its own width.
  const halo =
    `<g color="#000" stroke="#000" stroke-width="${r2(20 / a.scale)}" `
    + `stroke-linejoin="round" stroke-linecap="round">${a.markup}</g>`
    + `<circle cx="${r2(ringX)}" cy="${r2(ringY)}" r="${r2(RING_R * a.scale)}" fill="none" `
    + `stroke="#000" stroke-width="${r2(10 * a.scale + 20)}"/>`

  const body =
    ring(320, 9)
    + `<mask id="hdg2-seal-breakout" maskUnits="userSpaceOnUse" x="0" y="0" `
    + `width="${2 * SEAL_C}" height="${2 * SEAL_C}">`
    + `<rect x="0" y="0" width="${2 * SEAL_C}" height="${2 * SEAL_C}" fill="#fff"/>${halo}</mask>`
    + `<circle cx="${SEAL_C}" cy="${SEAL_C}" r="252" fill="none" stroke="currentColor" `
    + `stroke-width="4" mask="url(#hdg2-seal-breakout)"/>`
    + a.markup

  return doc(SEAL_BOX, body, 'Havre De Grace')
}

/* ------------------------------------------------------------------ *
 * 07 — seal with a banner across the foot
 *
 * The only seal here that sets the name straight rather than on a curve, so
 * the name stays readable at small sizes where arced type turns to mush.
 * ------------------------------------------------------------------ */
function sealBanner() {
  const bandTop = 470
  const bandH = 92
  const word = textRun(NAME, { cap: 100, tracking: 22 })
  const cap = (450 / word.width) * 100
  const line = textRun(NAME, { cap, tracking: 22 })

  const band =
    `<g color="#000">`
    + `<g transform="translate(${r2(SEAL_C - 225)} ${r2(bandTop + (bandH - cap) / 2)})">`
    + line.markup.replace('stroke="currentColor"', 'stroke="#000"')
    + `</g></g>`

  const body =
    `<clipPath id="hdg2-banner-clip"><circle cx="${SEAL_C}" cy="${SEAL_C}" r="316"/></clipPath>`
    + `<mask id="hdg2-banner-mask" maskUnits="userSpaceOnUse" x="0" y="0" `
    + `width="${2 * SEAL_C}" height="${2 * SEAL_C}">`
    + `<rect x="0" y="${bandTop}" width="${2 * SEAL_C}" height="${bandH}" fill="#fff"/>${band}</mask>`
    + ring(320, 8)
    + centered(ANCHOR(), { cx: SEAL_C, y: 85, height: 320 }).markup
    + `<g clip-path="url(#hdg2-banner-clip)">`
    + `<rect x="0" y="${bandTop}" width="${2 * SEAL_C}" height="${bandH}" fill="currentColor" `
    + `mask="url(#hdg2-banner-mask)"/></g>`

  return doc(SEAL_BOX, body, 'Havre De Grace')
}

/* ------------------------------------------------------------------ *
 * 08 — porthole: a heavy riveted ring, no type
 * ------------------------------------------------------------------ */
function sealPorthole() {
  const RIVETS = 12
  const rivets = Array.from({ length: RIVETS }, (_, i) => {
    const t = ((i + 0.5) / RIVETS) * Math.PI * 2
    return `<circle cx="${r2(SEAL_C + 308 * Math.cos(t))}" `
      + `cy="${r2(SEAL_C + 308 * Math.sin(t))}" r="8" fill="#000"/>`
  }).join('')

  const body =
    `<mask id="hdg2-porthole" maskUnits="userSpaceOnUse" x="0" y="0" `
    + `width="${2 * SEAL_C}" height="${2 * SEAL_C}">`
    + `<rect x="0" y="0" width="${2 * SEAL_C}" height="${2 * SEAL_C}" fill="#fff"/>${rivets}</mask>`
    + `<circle cx="${SEAL_C}" cy="${SEAL_C}" r="308" fill="none" stroke="currentColor" `
    + `stroke-width="28" mask="url(#hdg2-porthole)"/>`
    + ring(278, 3)
    + centered(ANCHOR(), { cx: SEAL_C, y: SEAL_C - 190, height: 380 }).markup

  return doc(SEAL_BOX, body, 'Havre De Grace')
}

/* ------------------------------------------------------------------ *
 * Harbour: the anchor riding above a waterline
 * ------------------------------------------------------------------ */

const HARBOR_C = 200

/** Reusable so the stacked lockup at the end can sit the ring over the name. */
function harborRingMark() {
  const body =
    `<circle cx="${HARBOR_C}" cy="${HARBOR_C}" r="180" fill="none" stroke="currentColor" stroke-width="9"/>`
    + centered(ANCHOR(), { cx: HARBOR_C, y: 48, height: 232 }).markup
    + `<g fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round">`
    + swell(HARBOR_C, 310, 118, 18) + swell(HARBOR_C, 344, 74, 14)
    + `</g>`

  return { body, box: { x: 15.5, y: 15.5, w: 369, h: 369 } }
}

/* 09 — harbour inside a ring */
function harborRing() {
  const m = harborRingMark()
  return doc(pad(m.box, 8), m.body, 'Havre De Grace')
}

/* 10 — harbour with the ring taken away */
function harborOpen() {
  const body =
    centered(ANCHOR(), { cx: HARBOR_C, y: 8, height: 240 }).markup
    + `<g fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round">`
    + swell(HARBOR_C, 292, 150, 21) + swell(HARBOR_C, 330, 108, 17)
    + swell(HARBOR_C, 366, 62, 13)
    + `</g>`

  return doc([36, -2, 328, 392], body, 'Havre De Grace')
}

/* 11 — harbour reversed out of a disc */
function harborDisc() {
  const R = 180
  const cut =
    `<g color="#000">`
    + centered(ANCHOR(), { cx: HARBOR_C, y: 46, height: 212 }).markup
    + `<g fill="none" stroke="#000" stroke-width="13" stroke-linecap="round">`
    + swell(HARBOR_C, 294, 108, 16) + swell(HARBOR_C, 328, 66, 12)
    + `</g></g>`

  const body =
    `<mask id="hdg2-harbor-disc" maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="400">`
    + `<circle cx="${HARBOR_C}" cy="${HARBOR_C}" r="${R}" fill="#fff"/>${cut}</mask>`
    + `<circle cx="${HARBOR_C}" cy="${HARBOR_C}" r="${R}" fill="currentColor" `
    + `mask="url(#hdg2-harbor-disc)"/>`

  return doc([12, 12, 376, 376], body, 'Havre De Grace')
}

/* ------------------------------------------------------------------ *
 * Stacked lockups
 * ------------------------------------------------------------------ */

/* 12 — anchor over one line */
function stackedSingle() {
  const W = 850
  const tracking = 26
  const cap = (W / measure(NAME, { w: 9, tracking }).width) * 100
  const word = textRun(NAME, { cap, tracking })
  const anchorH = 380
  const gap = 100

  const body =
    centered(ANCHOR(), { cx: W / 2, y: 0, height: anchorH }).markup
    + `<g transform="translate(0 ${r2(anchorH + gap)})">${word.markup}</g>`

  return doc([-34, -34, W + 68, anchorH + gap + cap + 68], body, 'Havre De Grace')
}

/*
 * 13 — anchor over two lines
 *
 * The lines are matched in width by scale rather than by tracking, which is
 * how the existing mark is built: GRACE simply runs larger.
 */
function stackedTwoLine() {
  const W = 620
  const tracking = 22
  const cap1 = (W / measure('HAVRE DE', { w: 9, tracking }).width) * 100
  const cap2 = (W / measure('GRACE', { w: 9, tracking }).width) * 100
  const leading = 44
  const anchorH = 400
  const gap = 92

  const body =
    centered(ANCHOR(), { cx: W / 2, y: 0, height: anchorH }).markup
    + `<g transform="translate(0 ${r2(anchorH + gap)})">${textRun('HAVRE DE', { cap: cap1, tracking }).markup}</g>`
    + `<g transform="translate(0 ${r2(anchorH + gap + cap1 + leading)})">${textRun('GRACE', { cap: cap2, tracking }).markup}</g>`

  const h = anchorH + gap + cap1 + leading + cap2
  return doc([-34, -34, W + 68, h + 68], body, 'Havre De Grace')
}

/* 14 — the harbour ring over the name */
function stackedHarbor() {
  const W = 700
  const tracking = 26
  const cap = (W / measure(NAME, { w: 9, tracking }).width) * 100
  const word = textRun(NAME, { cap, tracking })

  const m = harborRingMark()
  const markH = 400
  const s = markH / m.box.h
  const markW = m.box.w * s
  const gap = 88

  const body =
    `<g transform="translate(${r2((W - markW) / 2)} 0) scale(${r2(s)}) `
    + `translate(${r2(-m.box.x)} ${r2(-m.box.y)})">${m.body}</g>`
    + `<g transform="translate(0 ${r2(markH + gap)})">${word.markup}</g>`

  return doc([-34, -34, W + 68, markH + gap + cap + 68], body, 'Havre De Grace')
}

/* ------------------------------------------------------------------ */

export const ROUND_TWO = [
  ['01-anchor-refined.svg', refined],
  ['02-seal-classic.svg', sealClassic],
  ['03-seal-split.svg', sealSplit],
  ['04-seal-reversed.svg', sealReversed],
  ['05-seal-milled.svg', sealMilled],
  ['06-seal-breakout.svg', sealBreakout],
  ['07-seal-banner.svg', sealBanner],
  ['08-seal-porthole.svg', sealPorthole],
  ['09-harbor-ring.svg', harborRing],
  ['10-harbor-open.svg', harborOpen],
  ['11-harbor-disc.svg', harborDisc],
  ['12-stacked-single.svg', stackedSingle],
  ['13-stacked-two-line.svg', stackedTwoLine],
  ['14-stacked-harbor.svg', stackedHarbor],
]
