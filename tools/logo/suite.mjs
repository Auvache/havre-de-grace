// The delivery suite.
//
// Four marks are signed off: the anchor, the seal, the seal reversed, and the
// stacked lockup. Everything here is those four, plus the variants and the
// ready-made assets the brand actually needs day to day.
//
// Grouped by the job each file does, not by how it was drawn:
//
//   a — core marks
//   b — lockups, for when the name has to travel with the mark
//   c — icons and avatars, square and circular crops
//   d — composed assets at real pixel dimensions
//   e — the clear-space rule, as a diagram
//
// Colour: every file in a, b, c and e paints with `currentColor`, so one file
// covers ink, reversed and accent — set `color` on the <svg> or inherit it
// from CSS. Group d is the exception: those have a background baked in, so
// their colours are explicit.

import { buildGrotesque, measure, textRun } from './lettering.mjs'
import {
  NAME, STOCK_WEIGHT, anchorCrown, anchorSolid, centered, doc, pad, place, r2,
} from './anchor.mjs'

const INK = '#16191d'
const LIGHT = '#f4f6f7'
const ACCENT = '#3d7a8a'

const FONT = buildGrotesque
const TRACKING = 26
/**
 * The weight the suite is set at, heavier than `textRun`'s own default of 9.
 *
 * The letterforms are stroke centrelines, so this is what decides how dark the
 * name reads. At 9 it came out visibly greyer than any mark standing next to
 * it — every mark here is solid shapes, an anchor's stock or a seal's rule —
 * and the wordmark went light and wiry on screen. 13 puts the letter strokes
 * between the seal's rule and the anchor's stock, so type and mark carry the
 * same colour. Glyph advances do not depend on it, so every file in the suite
 * keeps the dimensions it had.
 */
const TEXT_WEIGHT = 13

const ANCHOR = () => anchorSolid({ crownWeight: STOCK_WEIGHT })

/** A document with explicit pixel dimensions, for the fixed-size assets. */
const sized = (w, h, body, title, background) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" `
  + `viewBox="0 0 ${w} ${h}" role="img" aria-label="${title}">`
  + `<title>${title}</title>`
  + (background ? `<rect width="${w}" height="${h}" fill="${background}"/>` : '')
  + body + `</svg>\n`

/** One line of the wordmark, scaled to a target width. */
const line = (text, width, tracking = TRACKING) => {
  const cap = (width / measure(text, { w: TEXT_WEIGHT, tracking, font: FONT }).width) * 100
  return { cap, ...textRun(text, { cap, weight: TEXT_WEIGHT, tracking, font: FONT }) }
}

/* ================================================================== *
 * a — core marks
 * ================================================================== */

const SEAL_C = 340
const SEAL_BOX = [-14, -14, 2 * SEAL_C + 28, 2 * SEAL_C + 28]
const SEAL_ANCHOR_H = 420

const sealRing = (r, w, stroke = 'currentColor') =>
  `<circle cx="${SEAL_C}" cy="${SEAL_C}" r="${r}" fill="none" stroke="${stroke}" stroke-width="${w}"/>`

const sealBody = (stroke = 'currentColor') =>
  sealRing(320, 9, stroke) + sealRing(298, 3, stroke)
  + centered(ANCHOR(), { cx: SEAL_C, y: SEAL_C - SEAL_ANCHOR_H / 2, height: SEAL_ANCHOR_H }).markup

/** a1 — the anchor. */
function anchor() {
  const a = ANCHOR()
  return doc(pad(a.box, 8), a.body, 'Havre De Grace anchor')
}

/**
 * a5 — the anchor redrawn for small sizes.
 *
 * The signed-off anchor has a crown one seventh the weight of its height and a
 * shackle whose hole is thinner than its ring. Below roughly 32px both fill in
 * and it turns to mush. This draw fattens the crown, stock and shank, opens
 * the shackle, and broadens the bills so they survive. Use it under 32px; use
 * a1 above.
 */
function anchorCompact() {
  const crown = anchorCrown({ crownWeight: 26 })
  const ringR = 21
  const ringStroke = 12
  const stock = 22
  const shank = 22
  const top = 30 - ringR - ringStroke / 2

  const body =
    '<g fill="currentColor">'
    + `<circle cx="100" cy="30" r="${ringR}" fill="none" stroke="currentColor" stroke-width="${ringStroke}"/>`
    + `<path d="M${100 - shank / 2} 46h${shank}v159h-${shank}Z"/>`
    + `<path d="M38 ${79.5 - stock / 2}h124v${stock}H38Z"/>`
    + `<circle cx="38" cy="79.5" r="${stock / 2 + 1.5}"/>`
    + `<circle cx="162" cy="79.5" r="${stock / 2 + 1.5}"/>`
    + `<path d="${crown.d}"/>`
    + '</g>'

  return { body, box: { x: 16, y: top, w: 168, h: 222 - top } }
}

const anchorSmall = () => {
  const a = anchorCompact()
  return doc(pad(a.box, 8), a.body, 'Havre De Grace anchor, small sizes')
}

/**
 * a6 — the seal redrawn for small sizes.
 *
 * The signed-off seal carries two rules 22 units apart on a 680-unit box. In a
 * nav bar that gap is under a pixel: the two rules merge into one fat ring,
 * and the anchor between them fills in. This draw keeps a single rule,
 * thickened until it still holds a pixel or so of ink, and carries the compact
 * anchor for the same reason a5 exists. Use it under 64px; use a2 above.
 */
const SEAL_SMALL_R = 320
const SEAL_SMALL_RING = 30
const SEAL_SMALL_ANCHOR_H = 400

function sealCompact() {
  const body = sealRing(SEAL_SMALL_R, SEAL_SMALL_RING)
    + centered(anchorCompact(), {
      cx: SEAL_C,
      y: SEAL_C - SEAL_SMALL_ANCHOR_H / 2,
      height: SEAL_SMALL_ANCHOR_H,
    }).markup

  const edge = SEAL_SMALL_R + SEAL_SMALL_RING / 2
  return { body, box: { x: SEAL_C - edge, y: SEAL_C - edge, w: 2 * edge, h: 2 * edge } }
}

const sealSmall = () => {
  const s = sealCompact()
  return doc(pad(s.box, 8), s.body, 'Havre De Grace seal, small sizes')
}

/** a2 — the seal. */
const seal = () => doc(SEAL_BOX, sealBody(), 'Havre De Grace')

/**
 * a3 — the seal reversed.
 *
 * Cut out of a filled disc rather than painted white, so the rules and the
 * anchor take the colour of whatever sits behind them. One file for paper,
 * dark screens and photographs.
 */
function sealReversed() {
  const body =
    `<mask id="hdgs-seal-rev" maskUnits="userSpaceOnUse" x="0" y="0" `
    + `width="${2 * SEAL_C}" height="${2 * SEAL_C}">`
    + `<circle cx="${SEAL_C}" cy="${SEAL_C}" r="332" fill="#fff"/>`
    + `<g color="#000">${sealBody('#000')}</g></mask>`
    + `<circle cx="${SEAL_C}" cy="${SEAL_C}" r="332" fill="currentColor" mask="url(#hdgs-seal-rev)"/>`

  return doc(SEAL_BOX, body, 'Havre De Grace')
}

/* ================================================================== *
 * b — lockups
 * ================================================================== */

const STACK_W = 850
const STACK_ANCHOR = 380
const STACK_GAP = 100

/** a4 — the primary lockup: anchor over one line. */
function lockupStacked() {
  const word = line(NAME, STACK_W)
  const body =
    centered(ANCHOR(), { cx: STACK_W / 2, y: 0, height: STACK_ANCHOR }).markup
    + `<g transform="translate(0 ${STACK_ANCHOR + STACK_GAP})">${word.markup}</g>`

  return doc(
    [-34, -34, STACK_W + 68, STACK_ANCHOR + STACK_GAP + word.cap + 68],
    body,
    'Havre De Grace',
  )
}

/**
 * b3 — anchor over two lines.
 *
 * The lines are matched in width by scale rather than by tracking, so GRACE
 * simply runs larger. That is the structure of the existing logo.
 */
function lockupStackedTwo() {
  const W = 620
  const l1 = line('HAVRE DE', W, 22)
  const l2 = line('GRACE', W, 22)
  const leading = 42
  const anchorH = 400
  const gap = 92

  const body =
    centered(ANCHOR(), { cx: W / 2, y: 0, height: anchorH }).markup
    + `<g transform="translate(0 ${anchorH + gap})">${l1.markup}</g>`
    + `<g transform="translate(0 ${r2(anchorH + gap + l1.cap + leading)})">${l2.markup}</g>`

  const h = anchorH + gap + l1.cap + leading + l2.cap
  return doc([-34, -34, W + 68, h + 68], body, 'Havre De Grace')
}

/** b1 — anchor beside two lines, with a rule between. For headers. */
function lockupHorizontal() {
  const W = 560
  const l1 = line('HAVRE DE', W, 22)
  const l2 = line('GRACE', W, 22)
  const leading = 42
  const blockH = l1.cap + leading + l2.cap

  const a = place(ANCHOR(), { height: blockH + 26 })
  const ruleX = a.width + 54
  const textX = ruleX + 54

  const body =
    a.markup
    + `<path d="M${r2(ruleX)} 6V${r2(blockH + 20)}" stroke="currentColor" stroke-width="2.5" opacity="0.4"/>`
    + `<g transform="translate(${r2(textX)} 13)">${l1.markup}</g>`
    + `<g transform="translate(${r2(textX)} ${r2(13 + l1.cap + leading)})">${l2.markup}</g>`

  return doc([-26, -26, textX + W + 52, blockH + 26 + 52], body, 'Havre De Grace')
}

/** b2 — anchor beside one line. The most compact lockup; navigation bars. */
function lockupHorizontalSingle() {
  const W = 760
  const anchorH = 200
  const word = line(NAME, W)
  const a = place(ANCHOR(), { height: anchorH })
  const textX = a.width + 56
  const textY = (anchorH - word.cap) / 2

  const body = a.markup + `<g transform="translate(${r2(textX)} ${r2(textY)})">${word.markup}</g>`
  return doc([-24, -24, textX + W + 48, anchorH + 48], body, 'Havre De Grace')
}

/** b5 — the wordmark on its own. */
function wordmark() {
  const word = line(NAME, 1000)
  return doc([-24, -24, 1048, word.cap + 48], word.markup, 'Havre De Grace')
}

/** b6 — the wordmark on two lines. */
function wordmarkTwo() {
  const W = 620
  const l1 = line('HAVRE DE', W, 22)
  const l2 = line('GRACE', W, 22)
  const leading = 42

  const body = l1.markup
    + `<g transform="translate(0 ${r2(l1.cap + leading)})">${l2.markup}</g>`

  return doc([-24, -24, W + 48, l1.cap + leading + l2.cap + 48], body, 'Havre De Grace')
}

/** b7 — the seal over the name. The badge lockup: merch, sleeve backs, stamps. */
function lockupSealStacked() {
  const W = 560
  const sealH = 420
  const gap = 80
  const word = line(NAME, W)
  const sealS = sealH / (2 * SEAL_C + 28)

  const body =
    `<g transform="translate(${r2((W - sealH) / 2)} 0) scale(${r2(sealS)}) translate(14 14)">`
    + sealBody() + `</g>`
    + `<g transform="translate(0 ${sealH + gap})">${word.markup}</g>`

  return doc([-28, -28, W + 56, sealH + gap + word.cap + 56], body, 'Havre De Grace')
}

/**
 * b8 — the anchor standing over the name.
 *
 * Where B2 leads with the mark, this leads with the name, but the anchor is
 * not cut down to match it: the type is set at two thirds of the anchor's
 * height, so the mark stands proud of the lettering and still reads as an
 * anchor at nav-bar sizes, where matching cap height left the crown a pixel
 * or two of nothing.
 *
 * Drawn with the compact anchor deliberately. This is always going to be
 * rendered small, and the compact draw is also the closer weight match to the
 * letter strokes.
 */
const NAV_ANCHOR_H = 104
// Ink to ink: a run set at `cap` paints cap plus the stroke weight, since the
// strokes straddle the cap and base lines rather than sitting inside them.
// Sizing on the painted height is what makes the two thirds read.
const NAV_CAP = r2((NAV_ANCHOR_H * (2 / 3) * 100) / (100 + TEXT_WEIGHT))
// Wide enough that the mark reads as a mark rather than as a glyph in the
// word: at this size the tracking is under 17, so anything near that reads as
// a letter.
const NAV_GAP = r2(78 * (NAV_CAP / 100))

function lockupNav() {
  const word = textRun(NAME, { cap: NAV_CAP, weight: TEXT_WEIGHT, tracking: TRACKING, font: FONT })
  const a = place(anchorCompact(), { y: -2, height: NAV_ANCHOR_H })
  // Centred on the anchor rather than sharing its baseline: type this much
  // shorter than the mark hangs off a common baseline like a dropped subtitle.
  const wordY = r2(NAV_ANCHOR_H / 2 - 2 - NAV_CAP / 2)

  const body = a.markup
    + `<g transform="translate(${r2(a.width + NAV_GAP)} ${wordY})">${word.markup}</g>`

  return doc([-20, -22, a.width + NAV_GAP + word.width + 40, 144], body, 'Havre De Grace')
}

/**
 * b9 — the same nav lockup carrying the seal instead of the bare anchor.
 *
 * Same name, same size, same tracking as B8; only the mark changes. The seal
 * is not set to the anchor's height, though: two fifths of it is rule and
 * clear space, so height for height it reads as a much smaller mark and its
 * anchor comes out half the size. It is matched on the anchor inside the rule
 * instead, which lands the disc a little over twice the painted height of the
 * name.
 */
function lockupNavSeal() {
  const markH = 150
  const word = textRun(NAME, { cap: NAV_CAP, weight: TEXT_WEIGHT, tracking: TRACKING, font: FONT })
  const m = place(sealCompact(), { height: markH })
  const wordY = r2((markH - NAV_CAP) / 2)

  const body = m.markup
    + `<g transform="translate(${r2(m.width + NAV_GAP)} ${wordY})">${word.markup}</g>`

  return doc([-20, -20, m.width + NAV_GAP + word.width + 40, markH + 40], body, 'Havre De Grace')
}

/* ================================================================== *
 * c — icons and avatars
 * ================================================================== */

const TILE = 512
const RADIUS = 112

/** Knock `art` out of a shape, so the cut-out takes the background colour. */
const knockout = (id, shape, art) =>
  `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${TILE}" height="${TILE}">`
  + shape.replace('fill="currentColor"', 'fill="#fff"')
  + `<g color="#000">${art}</g></mask>`
  + shape.replace('/>', ` mask="url(#${id})"/>`)

const tileSquare = `<rect x="0" y="0" width="${TILE}" height="${TILE}" fill="currentColor"/>`
const tileRect = `<rect x="0" y="0" width="${TILE}" height="${TILE}" rx="${RADIUS}" fill="currentColor"/>`
const tileCircle = `<circle cx="${TILE / 2}" cy="${TILE / 2}" r="${TILE / 2}" fill="currentColor"/>`

/** c1 — app icon: rounded square with the anchor cut out. */
const appIcon = () => doc(
  [0, 0, TILE, TILE],
  knockout('hdgs-app', tileRect, centered(ANCHOR(), { cx: TILE / 2, y: 106, height: 300 }).markup),
  'Havre De Grace',
)

/** c2 — app icon carrying the seal instead, for when the badge is the brand. */
function appIconSeal() {
  const s = 380 / (2 * SEAL_C + 28)
  const art = `<g transform="translate(${r2((TILE - 380) / 2)} ${r2((TILE - 380) / 2)}) `
    + `scale(${r2(s)}) translate(14 14)">${sealBody('#000')}</g>`
  return doc([0, 0, TILE, TILE], knockout('hdgs-app-seal', tileRect, art), 'Havre De Grace')
}

/** c3 — circular avatar, for the profile pictures that crop to a circle anyway. */
const avatar = () => doc(
  [0, 0, TILE, TILE],
  knockout('hdgs-avatar', tileCircle, centered(ANCHOR(), { cx: TILE / 2, y: 106, height: 300 }).markup),
  'Havre De Grace',
)

/**
 * c4 — favicon tile, built on the small-size anchor. Legible at 16px.
 *
 * The one file in group c that paints the anchor rather than knocking it out
 * of the tile. A cut-out anchor takes the colour of whatever the browser puts
 * behind the tab, which is a different grey in every browser and theme, and on
 * a dark strip it closes up altogether; painting it off-white holds it against
 * the ink everywhere.
 */
const favicon = () => doc(
  [0, 0, TILE, TILE],
  tileRect
  + `<g color="${LIGHT}">`
  + centered(anchorCompact(), { cx: TILE / 2, y: 96, height: 320 }).markup
  + '</g>',
  'Havre De Grace',
)

/**
 * c5 — the same tile with square corners.
 *
 * Apple and Android round and mask home-screen icons themselves, so a tile
 * that arrives already rounded gets rounded twice. The anchor is held to just
 * over half the tile so it survives a maskable crop.
 */
const iconSquare = () => doc(
  [0, 0, TILE, TILE],
  knockout('hdgs-square', tileSquare, centered(ANCHOR(), { cx: TILE / 2, y: 124, height: 264 }).markup),
  'Havre De Grace',
)

/* ================================================================== *
 * d — composed assets, at the dimensions they ship at
 * ================================================================== */

/** Centre a lockup inside a fixed canvas at a given width. */
const centreLockup = (svgW, svgH, artW, artH, targetW, colour, markup) => {
  const s = targetW / artW
  return `<g color="${colour}" transform="translate(${r2((svgW - targetW) / 2)} `
    + `${r2((svgH - artH * s) / 2)}) scale(${r2(s)})">${markup}</g>`
}

/** d1 / d2 — Open Graph card, 1200x630. */
function ogImage({ dark }) {
  const word = line(NAME, STACK_W)
  const artH = STACK_ANCHOR + STACK_GAP + word.cap
  const art =
    centered(ANCHOR(), { cx: STACK_W / 2, y: 0, height: STACK_ANCHOR }).markup
    + `<g transform="translate(0 ${STACK_ANCHOR + STACK_GAP})">${word.markup}</g>`

  const ground = dark ? INK : '#ffffff'
  const ink = dark ? LIGHT : INK

  const body =
    `<rect x="34" y="34" width="1132" height="562" fill="none" stroke="${ink}" `
    + `stroke-width="2" opacity="0.28"/>`
    + centreLockup(1200, 630, STACK_W, artH, 500, ink, art)

  return sized(1200, 630, body, 'Havre De Grace', ground)
}

/** d3 — social header, 1500x500. */
function socialBanner() {
  const W = 760
  const anchorH = 200
  const word = line(NAME, W)
  const a = place(ANCHOR(), { height: anchorH })
  const textX = a.width + 56
  const art = a.markup
    + `<g transform="translate(${r2(textX)} ${r2((anchorH - word.cap) / 2)})">${word.markup}</g>`

  return sized(
    1500, 500,
    centreLockup(1500, 500, textX + W, anchorH, 960, LIGHT, art),
    'Havre De Grace',
    INK,
  )
}

/** d4 — square post, 1080x1080, on the site's accent. */
function squarePost() {
  const word = line(NAME, 620)
  const sealS = 520 / (2 * SEAL_C + 28)

  const body =
    `<g color="${LIGHT}">`
    + `<g transform="translate(280 210) scale(${r2(sealS)}) translate(14 14)">${sealBody()}</g>`
    + `<g transform="translate(230 830)">${word.markup}</g>`
    + `</g>`

  return sized(1080, 1080, body, 'Havre De Grace', ACCENT)
}

/* ================================================================== *
 * e — clear space
 * ================================================================== */

/**
 * e1 — the clear-space rule, drawn rather than described.
 *
 * The module is the cap height of the wordmark. Keep that much free on every
 * side; the four solid squares are the module, shown at the corners so the
 * measure can be checked by eye.
 */
function clearSpace() {
  const word = line(NAME, STACK_W)
  const x = word.cap
  const artH = STACK_ANCHOR + STACK_GAP + x

  const art =
    centered(ANCHOR(), { cx: STACK_W / 2, y: 0, height: STACK_ANCHOR }).markup
    + `<g transform="translate(0 ${STACK_ANCHOR + STACK_GAP})">${word.markup}</g>`

  const sq = (cx, cy) =>
    `<rect x="${r2(cx)}" y="${r2(cy)}" width="${r2(x)}" height="${r2(x)}" `
    + `fill="currentColor" opacity="0.16"/>`

  const body =
    art
    + `<rect x="${r2(-x)}" y="${r2(-x)}" width="${r2(STACK_W + 2 * x)}" height="${r2(artH + 2 * x)}" `
    + `fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="14 12" opacity="0.5"/>`
    + sq(-x, -x) + sq(STACK_W, -x) + sq(-x, artH) + sq(STACK_W, artH)

  return doc(
    [-x - 30, -x - 30, STACK_W + 2 * x + 60, artH + 2 * x + 60],
    body,
    'Havre De Grace clear space',
  )
}

/* ================================================================== */

export const SUITE = [
  ['a1-anchor.svg', anchor],
  ['a2-seal.svg', seal],
  ['a3-seal-reversed.svg', sealReversed],
  ['a4-lockup-stacked.svg', lockupStacked],
  ['a5-anchor-small.svg', anchorSmall],
  ['a6-seal-small.svg', sealSmall],

  ['b1-lockup-horizontal.svg', lockupHorizontal],
  ['b2-lockup-horizontal-single.svg', lockupHorizontalSingle],
  ['b3-lockup-stacked-two-line.svg', lockupStackedTwo],
  ['b5-wordmark.svg', wordmark],
  ['b6-wordmark-two-line.svg', wordmarkTwo],
  ['b7-lockup-seal-stacked.svg', lockupSealStacked],
  ['b8-lockup-nav.svg', lockupNav],
  ['b9-lockup-nav-seal.svg', lockupNavSeal],

  ['c1-app-icon.svg', appIcon],
  ['c2-app-icon-seal.svg', appIconSeal],
  ['c3-avatar.svg', avatar],
  ['c4-favicon.svg', favicon],
  ['c5-icon-square.svg', iconSquare],

  ['d1-og-image.svg', () => ogImage({ dark: false })],
  ['d2-og-image-dark.svg', () => ogImage({ dark: true })],
  ['d3-social-banner.svg', socialBanner],
  ['d4-square-post.svg', squarePost],

  ['e1-clear-space.svg', clearSpace],
]
