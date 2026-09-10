// Geometric all-caps letterforms, drawn as stroke centrelines on a 100-unit
// cap-height grid: y=0 is the cap line, y=100 the baseline, x starts at 0.
// Only the glyphs in "HAVRE DE GRACE" are defined.
//
// Everything is constructed from circles, straight lines and elliptical arcs so
// the shapes stay true at any size, and so the wordmark carries no font
// dependency once it ships as a file.

const r2 = (n) => Math.round(n * 1000) / 1000

export function buildFont(w) {
  const i = w / 2 // stroke centreline inset from the glyph's outer edge
  const rx = 41 // round letters are slightly narrower than they are tall
  const ry = 50 - i
  const cx = i + rx
  const rightEdge = cx + rx

  // Point on the round-letter ellipse at a maths-convention angle (0 = east,
  // counter-clockwise positive) — remember SVG's y grows downward.
  const P = (deg) => {
    const t = (deg * Math.PI) / 180
    return [r2(cx + rx * Math.cos(t)), r2(50 - ry * Math.sin(t))]
  }

  const H = {
    width: 72,
    d: `M${i} 0V100M${72 - i} 0V100M${i} 50H${72 - i}`,
  }

  // Apex is a mitred join, so A and V are each a single three-point path.
  const aLegOut = 4
  const aBarY = 74
  const aBarL = r2(40 + (aLegOut - 40) * (aBarY / 100))
  const A = {
    width: 80,
    d: `M${aLegOut} 100L40 0L${80 - aLegOut} 100M${aBarL} ${aBarY}H${r2(80 - aBarL)}`,
  }

  const V = {
    width: 80,
    d: `M${aLegOut} 0L40 100L${80 - aLegOut} 0`,
  }

  // R: full-height stem, a bowl closing on itself, and a leg struck from under
  // the bowl to the baseline.
  const rBowlH = 48
  const rBowlR = rBowlH / 2
  const rBowlX = 72 - i - rBowlR
  const R = {
    width: 72,
    d: [
      `M${i} 0V100`,
      `M${i} ${i}H${rBowlX}a${rBowlR} ${rBowlR} 0 0 1 0 ${rBowlH}H${i}`,
      `M${r2(rBowlX - 4)} ${r2(i + rBowlH)}L${72 - i} 100`,
    ].join(''),
  }

  const E = {
    width: 64,
    d: `M${i} 0V100M${i} ${i}H${64 - i}M${i} 50H${64 - i}M${i} ${100 - i}H${64 - i}`,
  }

  const dBowlR = (100 - 2 * i) / 2
  const D = {
    width: 76,
    d: `M${i} 0V100M${i} ${i}H${r2(76 - i - dBowlR)}a${dBowlR} ${dBowlR} 0 0 1 0 ${r2(100 - 2 * i)}H${i}`,
  }

  // G opens at 30 degrees above east and runs the long way round to due east,
  // where a horizontal bar closes it off.
  const gStart = P(30)
  const G = {
    width: rightEdge + i,
    d: [
      `M${gStart[0]} ${gStart[1]}A${rx} ${ry} 0 1 0 ${rightEdge} 50`,
      `M${r2(cx + rx * 0.42)} 50H${rightEdge}`,
    ].join(''),
  }

  // C is the same ellipse cut symmetrically at 40 degrees either side of east.
  const cTop = P(40)
  const cBot = P(-40)
  const C = {
    width: rightEdge + i,
    d: `M${cTop[0]} ${cTop[1]}A${rx} ${ry} 0 1 0 ${cBot[0]} ${cBot[1]}`,
  }

  // N, O and U exist only for the optional place-name on the foot of a seal.
  const N = {
    width: 76,
    d: `M${i} 100V0L${76 - i} 100V0`,
  }

  const O = {
    width: rightEdge + i,
    d: `M${cx} ${i}A${rx} ${ry} 0 1 0 ${cx} ${100 - i}A${rx} ${ry} 0 1 0 ${cx} ${i}Z`,
  }

  const uShoulder = 54
  const U = {
    width: 76,
    d: `M${i} 0V${uShoulder}A${r2((76 - 2 * i) / 2)} ${r2(100 - i - uShoulder)} 0 0 0 ${76 - i} ${uShoulder}V0`,
  }

  return { H, A, V, R, E, D, G, C, N, O, U, ' ': { width: 26, d: '' } }
}

/**
 * A light neo-grotesque, for matching the lettering on the existing logo —
 * which is a Helvetica-family face, not the geometric one above. The traits
 * that carry the difference, in rough order of how much they show:
 *
 *   G  has a spur: the bar meets a straight vertical on the right, where a
 *      geometric G runs the bar straight into the circle
 *   R  has a small bowl in the upper half and a straight diagonal leg
 *   D  has flat sides, built as a rounded rectangle rather than a semicircle
 *   C  is narrower with a tighter aperture and near-horizontal terminals
 *   E  has a shortened middle arm
 *
 * Round letters are narrower than the cap height here, where the geometric
 * set draws them nearly circular.
 */
export function buildGrotesque(w) {
  const i = w / 2
  const rx = 33
  const ry = 50 - i
  const cx = i + rx

  const P = (deg) => {
    const t = (deg * Math.PI) / 180
    return [r2(cx + rx * Math.cos(t)), r2(50 - ry * Math.sin(t))]
  }

  const H = { width: 68, d: `M${i} 0V100M${68 - i} 0V100M${i} 50H${68 - i}` }

  // A and V get truncated apexes. A mitred point at this angle throws a spike
  // roughly one and a half stroke widths past the cap line — a needle no real
  // grotesque has. Cutting a short flat across the apex is what type does.
  const apex = 36
  const aLeg = 2
  const aFlat = 3.5
  const aTop = 4.5
  const aBarY = 76
  const aBarL = r2(aLeg + (apex - aFlat - aLeg) * ((100 - aBarY) / (100 - aTop)))
  const A = {
    width: 72,
    d: `M${aLeg} 100L${apex - aFlat} ${aTop}L${apex + aFlat} ${aTop}L${72 - aLeg} 100`
      + `M${aBarL} ${aBarY}H${r2(72 - aBarL)}`,
  }

  const vBase = 96.5
  const V = {
    width: 72,
    d: `M${aLeg} 0L${apex - aFlat} ${vBase}L${apex + aFlat} ${vBase}L${72 - aLeg} 0`,
  }

  const rBowlH = 44
  const rBowlR = rBowlH / 2
  const rBowlX = 66 - i - rBowlR
  const R = {
    width: 66,
    d: [
      `M${i} 0V100`,
      `M${i} ${i}H${rBowlX}a${rBowlR} ${rBowlR} 0 0 1 0 ${rBowlH}H${i}`,
      `M28 ${i + rBowlH}L${66 - i} 100`,
    ].join(''),
  }

  const E = {
    width: 58,
    d: `M${i} 0V100M${i} ${i}H${58 - i}M${i} 50H48M${i} ${100 - i}H${58 - i}`,
  }

  const dR = 34
  const dX = 70 - i - dR
  const D = {
    width: 70,
    d: `M${i} 0V100M${i} ${i}H${dX}A${dR} ${dR} 0 0 1 ${r2(dX + dR)} ${i + dR}`
      + `V${100 - i - dR}A${dR} ${dR} 0 0 1 ${dX} ${100 - i}H${i}`,
  }

  const gStart = P(25)
  const gEnd = P(-30)
  const G = {
    width: 75,
    d: `M${gStart[0]} ${gStart[1]}A${rx} ${ry} 0 1 0 ${gEnd[0]} ${gEnd[1]}V50H${r2(cx + 4)}`,
  }

  const cTop = P(22)
  const cBot = P(-22)
  const C = {
    width: 75,
    d: `M${cTop[0]} ${cTop[1]}A${rx} ${ry} 0 1 0 ${cBot[0]} ${cBot[1]}`,
  }

  return { H, A, V, R, E, D, G, C, ' ': { width: 24, d: '' } }
}

/** Measure a string, returning per-glyph advances and the total width. */
export function measure(text, { w, tracking, wordGap = 0, font = buildFont }) {
  const glyphs = font(w)
  const items = []
  let x = 0

  for (let n = 0; n < text.length; n += 1) {
    const ch = text[n]
    const g = glyphs[ch]
    if (!g) throw new Error(`No glyph for "${ch}"`)
    items.push({ ch, x, glyph: g })
    x += g.width + tracking + (ch === ' ' ? wordGap : 0)
  }

  return { items, width: x - tracking }
}

/**
 * Straight run of type. Returned at cap height `cap`, with the stroke weight
 * scaled to match, so callers can size a line by width or by height alone.
 */
export function textRun(text, { cap = 100, weight = 9, tracking = 20, wordGap = 0, font } = {}) {
  const { items, width } = measure(text, { w: weight, tracking, wordGap, font })
  const s = cap / 100
  const body = items
    .filter((it) => it.glyph.d)
    .map((it) => `<path d="${it.glyph.d}" transform="translate(${r2(it.x)} 0)"/>`)
    .join('')

  return {
    width: r2(width * s),
    height: cap,
    markup:
      `<g transform="scale(${r2(s)})" fill="none" stroke="currentColor" stroke-width="${weight}" `
      + `stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="6">${body}</g>`,
  }
}

/**
 * Type set around a circle. Each glyph is placed on its own tangent frame:
 * baseline on the radius, cap line pointing outward, reading left to right
 * along the top of the circle (which means decreasing angle).
 */
export function textArc(text, {
  cx, cy, radius, cap = 100, weight = 9, tracking = 20, wordGap = 0, font,
  centerDeg = 90, flip = false,
}) {
  const { items, width } = measure(text, { w: weight, tracking, wordGap, font })
  const s = cap / 100
  const spanDeg = ((width * s) / radius) * (180 / Math.PI)
  const dir = flip ? -1 : 1

  const body = items
    .filter((it) => it.glyph.d)
    .map((it) => {
      const mid = (it.x + it.glyph.width / 2) * s
      const deg = centerDeg + dir * (spanDeg / 2 - (mid / radius) * (180 / Math.PI))
      const t = (deg * Math.PI) / 180
      const px = r2(cx + radius * Math.cos(t))
      const py = r2(cy - radius * Math.sin(t))
      // Baseline sits on the radius either way; along the bottom of the circle
      // the frame is turned over so the caps still point in toward the middle.
      const rot = r2(flip ? 270 - deg : 90 - deg)
      return `<g transform="translate(${px} ${py}) rotate(${rot}) scale(${r2(s)}) `
        + `translate(${r2(-it.glyph.width / 2)} -100)">`
        + `<path d="${it.glyph.d}"/></g>`
    })
    .join('')

  return {
    spanDeg,
    markup:
      `<g fill="none" stroke="currentColor" stroke-width="${weight}" `
      + `stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="6">${body}</g>`,
  }
}
