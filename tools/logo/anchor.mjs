// The anchor itself, plus the small amount of scaffolding every composition
// needs. Both halves of every anchor are derived from one set of numbers, so
// the two sides cannot drift out of symmetry.

export const INK = '#16191d'
export const NAME = 'HAVRE DE GRACE'

export const r2 = (n) => Math.round(n * 1000) / 1000

/** Wrap a body in a document. `box` is [minX, minY, width, height]. */
export const doc = (box, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.map(r2).join(' ')}" `
  + `color="${INK}" role="img" aria-label="${title}">`
  + `<title>${title}</title>${body}</svg>\n`

/** Grow a bounding box by a uniform margin and return it as a viewBox array. */
export const pad = (b, m) => [b.x - m, b.y - m, b.w + 2 * m, b.h + 2 * m]

export const RING_CY = 26
export const RING_R = 18
export const STOCK_Y = 78
export const STOCK_HALF = 58
/** Height of the stock bar. The crown is matched to this in the refined draw. */
export const STOCK_WEIGHT = 15

// Crown geometry, shared by both weights. The bills flaring outward past the
// ends of the stock are what stop the crown reading as a bowl on a stick.
const CROWN_CY = 134
const CROWN_RX = 76
const CROWN_RY = 88
const BILL_Y = 102

/** Monoline anchor: one constant stroke weight, round terminals. */
export function anchorMono(sw = 11) {
  const half = sw / 2
  // Lower half of an ellipse with a straight bill struck off each end at
  // roughly 55 degrees. The kink where bill meets arc is the whole trick.
  const crown = 'M16 106L36 134A64 80 0 0 0 164 134L184 106'

  const body =
    `<g fill="none" stroke="currentColor" stroke-width="${sw}" `
    + `stroke-linecap="round" stroke-linejoin="miter" stroke-miterlimit="6">`
    + `<circle cx="100" cy="${RING_CY}" r="${RING_R}"/>`
    + `<path d="M100 ${RING_CY + RING_R}V214" stroke-linecap="butt"/>`
    + `<path d="M${100 - STOCK_HALF} ${STOCK_Y}H${100 + STOCK_HALF}"/>`
    + `<path d="${crown}"/>`
    + `</g>`

  return { body, box: { x: 16 - half, y: 8 - half, w: 168 + sw, h: 206 + sw } }
}

/**
 * The crown: a true crescent, two concentric half-ellipses finished with a
 * triangular bill flaring off each end. `crownWeight` is its thickness.
 *
 * Exported on its own because it doubles as an ornament — a crescent at the
 * foot of a seal echoes the mark it sits beneath.
 */
export function anchorCrown({ crownWeight = STOCK_WEIGHT } = {}) {
  const innerRx = CROWN_RX - crownWeight
  const innerRy = CROWN_RY - crownWeight
  const outerEnd = 100 - CROWN_RX
  const innerEnd = 100 - innerRx

  const d = [
    `M${outerEnd} ${CROWN_CY}`,
    `A${CROWN_RX} ${CROWN_RY} 0 0 0 ${200 - outerEnd} ${CROWN_CY}`, // outer sweep
    `L184 ${BILL_Y}`, // right bill
    `L${200 - innerEnd} ${CROWN_CY}`,
    `A${innerRx} ${innerRy} 0 0 1 ${innerEnd} ${CROWN_CY}`, // back through the throat
    `L16 ${BILL_Y}`, // left bill
    'Z',
  ].join('')

  return {
    d,
    innerRy,
    box: { x: 16, y: BILL_Y, w: 168, h: CROWN_CY + CROWN_RY - BILL_Y },
  }
}

/**
 * Solid anchor: the heritage drawing. Tapering shank, ball-ended stock, and the
 * crescent crown above.
 *
 * At crownWeight 18 the crown is heavier than the stock; setting it to
 * STOCK_WEIGHT matches the two, which reads lighter and stops the bottom of
 * the mark going clubby.
 */
export function anchorSolid({ crownWeight = 18 } = {}) {
  const { d: crown, innerRy } = anchorCrown({ crownWeight })
  const shankBottom = CROWN_CY + innerRy + 6

  const body =
    '<g fill="currentColor">'
    + `<circle cx="100" cy="${RING_CY}" r="${RING_R}" fill="none" stroke="currentColor" stroke-width="10"/>`
    + `<path d="M92.4 40h15.2l-1.8 ${r2(shankBottom - 40)}h-11.6Z"/>`
    + `<path d="M42 ${STOCK_Y - 6}h116v${STOCK_WEIGHT}H42Z"/>`
    + `<circle cx="42" cy="79.5" r="8.5"/><circle cx="158" cy="79.5" r="8.5"/>`
    + `<path d="${crown}"/>`
    + '</g>'

  return { body, box: { x: 16, y: 8, w: 168, h: CROWN_CY + CROWN_RY - 8 } }
}

/**
 * Place a sub-mark: scale it to `height` and put its top-left at (x, y).
 * `at` maps a point in the mark's own coordinates into the placed frame, so
 * callers can line other artwork up with the stock or the crown.
 */
export function place(mark, { x = 0, y = 0, height }) {
  const s = height / mark.box.h
  return {
    markup: `<g transform="translate(${r2(x)} ${r2(y)}) scale(${r2(s)}) `
      + `translate(${r2(-mark.box.x)} ${r2(-mark.box.y)})">${mark.body}</g>`,
    width: r2(mark.box.w * s),
    height,
    scale: s,
    at: (lx, ly) => [x + s * (lx - mark.box.x), y + s * (ly - mark.box.y)],
  }
}

/** Centre a placed mark horizontally on `cx`, at vertical position `y`. */
export function centered(mark, { cx, y, height }) {
  const probe = place(mark, { height })
  return place(mark, { x: cx - probe.width / 2, y, height })
}

/** A swell of water: two quadratics, `halfW` wide each, centred on `cx`. */
export const swell = (cx, y, halfW, amp) =>
  `<path d="M${r2(cx - halfW)} ${y}q${r2(halfW / 2)} ${-amp} ${halfW} 0`
  + `q${r2(halfW / 2)} ${amp} ${halfW} 0"/>`

/** A diamond ornament, point up. */
export const diamond = (x, y, r) =>
  `<path d="M${x} ${y - r}L${x + r} ${y}L${x} ${y + r}L${x - r} ${y}Z" fill="currentColor"/>`
