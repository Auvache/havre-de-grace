// Round three: variations on the arced seal from round two.
//
// The frame is fixed — two rules, the name over the top, the refined anchor in
// the middle — and the variable is the foot. A seal wants something at six
// o'clock to close the composition and stop the type arc from reading as a
// dropped stitch, but the lone diamond was doing that job charmlessly. These
// are the alternatives, plus the two straight requests: no ornament at all,
// and no name at all.

import { measure, textArc, textRun } from './lettering.mjs'
import {
  NAME, STOCK_WEIGHT, anchorSolid, centered, diamond, doc, r2, swell,
} from './anchor.mjs'

const ANCHOR = () => anchorSolid({ crownWeight: STOCK_WEIGHT })

const C = 340
const BOX = [-14, -14, 2 * C + 28, 2 * C + 28]
/** Six o'clock, in the band between the type ring and the inner rule. */
const FOOT = 588

const ring = (r, w) =>
  `<circle cx="${C}" cy="${C}" r="${r}" fill="none" stroke="currentColor" stroke-width="${w}"/>`

/**
 * The shared seal. Everything below varies only `foot`, `sides` and whether the
 * name is set, so the alternatives can be compared like for like.
 */
function seal({ name = true, foot = '', sides = '', anchorH = 352, anchorY = 170 }) {
  const arc = name
    ? textArc(NAME, {
      cx: C, cy: C, radius: 240, cap: 44, weight: 9, tracking: 26, centerDeg: 90,
    }).markup
    : ''

  const body =
    ring(320, 9) + ring(298, 3)
    + arc + sides + foot
    + centered(ANCHOR(), { cx: C, y: anchorY, height: anchorH }).markup

  return doc(BOX, body, 'Havre De Grace')
}

/* ------------------------------------------------------------------ *
 * Ornaments
 * ------------------------------------------------------------------ */

const star = (cx, cy, R, points = 5) => {
  const inner = R * 0.382
  const pts = Array.from({ length: points * 2 }, (_, i) => {
    const r = i % 2 ? inner : R
    const a = ((90 + (i * 180) / points) * Math.PI) / 180
    return `${r2(cx + r * Math.cos(a))} ${r2(cy - r * Math.sin(a))}`
  })
  return `<path d="M${pts.join('L')}Z" fill="currentColor"/>`
}

/** Four-pointed compass star: long on the vertical, pinched at the waist. */
const compass = (cx, cy, h, w) =>
  `<path d="M${cx} ${cy - h}Q${cx + 4} ${cy - 4} ${cx + w} ${cy}`
  + `Q${cx + 4} ${cy + 4} ${cx} ${cy + h}`
  + `Q${cx - 4} ${cy + 4} ${cx - w} ${cy}`
  + `Q${cx - 4} ${cy - 4} ${cx} ${cy - h}Z" fill="currentColor"/>`

const dot = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="currentColor"/>`

const water = (rows, w = 6) =>
  `<g fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round">`
  + rows.map(([y, halfW, amp]) => swell(C, y, halfW, amp)).join('')
  + `</g>`

/* ------------------------------------------------------------------ *
 * 01 — nothing at the foot
 * ------------------------------------------------------------------ */
const clean = () => seal({})

/* ------------------------------------------------------------------ *
 * 02 — no name either: rules and anchor only
 * ------------------------------------------------------------------ */
const markless = () => seal({ name: false, anchorH: 420, anchorY: C - 210 })

/* ------------------------------------------------------------------ *
 * 03 — five-pointed star
 * ------------------------------------------------------------------ */
const footStar = () => seal({ foot: star(C, FOOT, 29) })

/* ------------------------------------------------------------------ *
 * 04 — compass star
 * ------------------------------------------------------------------ */
const footCompass = () => seal({ foot: compass(C, FOOT, 31, 18) })

/* ------------------------------------------------------------------ *
 * 05 — a single swell
 * ------------------------------------------------------------------ */
const footSwell = () => seal({ foot: water([[FOOT, 42, 12]], 7) })

/* ------------------------------------------------------------------ *
 * 06 — a waterline of three, which ties the seal to the harbour marks
 * ------------------------------------------------------------------ */
const footWater = () => seal({
  foot: water([[566, 44, 11], [592, 32, 9], [615, 19, 6]]),
})

/* ------------------------------------------------------------------ *
 * 07 — a rule with dot terminals
 * ------------------------------------------------------------------ */
const footRule = () => seal({
  foot: `<path d="M${C - 74} ${FOOT}H${C + 74}" stroke="currentColor" stroke-width="3"/>`
    + dot(C - 78, FOOT, 5) + dot(C + 78, FOOT, 5),
})

/* ------------------------------------------------------------------ *
 * 08 — the diamond kept, but flanked by rules so it stops reading as a speck
 * ------------------------------------------------------------------ */
const footLozenge = () => seal({
  foot: diamond(C, FOOT, 12)
    + `<g stroke="currentColor" stroke-width="3">`
    + `<path d="M${C - 84} ${FOOT}H${C - 26}"/><path d="M${C + 26} ${FOOT}H${C + 84}"/></g>`
    + dot(C - 88, FOOT, 4.5) + dot(C + 88, FOOT, 4.5),
})

/* ------------------------------------------------------------------ *
 * 09 — a single dot, the quietest option that still closes the ring
 * ------------------------------------------------------------------ */
const footDot = () => seal({ foot: dot(C, FOOT, 12) })

/* ------------------------------------------------------------------ *
 * 10 — an asterism
 * ------------------------------------------------------------------ */
const footAsterism = () => seal({
  foot: dot(C, FOOT - 13, 6.5) + dot(C - 16, FOOT + 12, 6.5) + dot(C + 16, FOOT + 12, 6.5),
})

/* ------------------------------------------------------------------ *
 * 11 — a short arc, concentric with the rules
 *
 * Borrows the seal's own geometry rather than importing a symbol into it. The
 * first attempt here was a miniature of the anchor's crown, which sounded
 * better than it looked: at ornament size the bills vanish and the crescent
 * reads as a stray lowercase u.
 * ------------------------------------------------------------------ */
function footArc() {
  const r = 250
  const half = (11 * Math.PI) / 180
  const x = r * Math.sin(half)
  const y = C + r * Math.cos(half)

  return seal({
    foot: `<path d="M${r2(C - x)} ${r2(y)}A${r} ${r} 0 0 0 ${r2(C + x)} ${r2(y)}" `
      + `fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"/>`,
  })
}

/* ------------------------------------------------------------------ *
 * 12 — a plectrum
 *
 * The one ornament that says who this is. Kept for the idea, but be warned:
 * at ornament size a pick loses its shoulders and reads as a plain spade.
 * ------------------------------------------------------------------ */
function footPlectrum() {
  const shape =
    'M150 6C214 6 292 42 292 96'
    + 'C292 168 222 252 168 302'
    + 'C158 311 142 311 132 302'
    + 'C78 252 8 168 8 96'
    + 'C8 42 86 6 150 6Z'
  const s = 58 / 305 // the shape's own height is 305 units

  return seal({
    foot: `<g transform="translate(${C} ${FOOT}) scale(${r2(s)}) translate(-150 -158.5)">`
      + `<path d="${shape}" fill="currentColor"/></g>`,
  })
}

/* ------------------------------------------------------------------ *
 * 13 — nothing at the foot; the arc is closed at three and nine instead
 * ------------------------------------------------------------------ */
const sideMarks = () => seal({
  sides: diamond(C - 262, C, 12) + diamond(C + 262, C, 12),
})

/* ------------------------------------------------------------------ *
 * 14 — the foot carrying a place name rather than an ornament
 *
 * Optional content, not a fixed part of the mark: swap it, or drop it and use
 * 01. It is here because a word is the other honest answer to what replaces
 * the diamond, and it is what a seal is actually for.
 * ------------------------------------------------------------------ */
function footPlace() {
  const place = textArc('VANCOUVER', {
    cx: C, cy: C, radius: 238, cap: 36, weight: 9, tracking: 28,
    centerDeg: 270, flip: true,
  })

  return seal({
    sides: diamond(C - 262, C, 12) + diamond(C + 262, C, 12),
    foot: place.markup,
    anchorH: 326,
    anchorY: C - 161,
  })
}

/* ------------------------------------------------------------------ */

export const ROUND_THREE = [
  ['01-seal-clean.svg', clean],
  ['02-seal-no-name.svg', markless],
  ['03-foot-star.svg', footStar],
  ['04-foot-compass.svg', footCompass],
  ['05-foot-swell.svg', footSwell],
  ['06-foot-waterline.svg', footWater],
  ['07-foot-rule.svg', footRule],
  ['08-foot-lozenge-rule.svg', footLozenge],
  ['09-foot-dot.svg', footDot],
  ['10-foot-asterism.svg', footAsterism],
  ['11-foot-arc.svg', footArc],
  ['12-foot-plectrum.svg', footPlectrum],
  ['13-side-marks.svg', sideMarks],
  ['14-foot-place.svg', footPlace],
]
