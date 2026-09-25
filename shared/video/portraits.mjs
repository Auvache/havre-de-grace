/*
 * Portraits — the sitters on Conman's wall.
 *
 * Every portrait is a stencil of a musician in the album's engraving: the hair
 * one angular mass, the face bare paper with only its outline — no eyes, no
 * mouth — and around it the things a crowd knows them by: a hat, a guitar, a
 * glove. No names anywhere; the viewer is meant to play "who's that", and it
 * does not matter much if they cannot. And every one of them has
 * a piece of somebody else pasted on — a torn patch of another portrait, its
 * edge in the album's red — because the song's argument is that everybody takes
 * from everybody.
 *
 * Each portrait is drawn in its own box, PW by PH, facing the viewer, head
 * centred on x = 180. A portrait is a function of a drawing kit `K` and returns
 * markup; it is drawn once, into <defs>, and the film <use>s it. `gives` are the
 * regions of it that get torn off, in its own box; `takes` are the patches of
 * other portraits pasted on to it.
 *
 * Plain .mjs, pure, no DOM, no randomness — the album's contract.
 */
import { r, lerp, clamp01 } from './kit.mjs'
import { PAPER, INK, RED, SECOND_INK } from './album.mjs'

export const GREEN = SECOND_INK.conman
export const PW = 360
export const PH = 460
const CX = 180

/* ══ SMALL THINGS ══════════════════════════════════════════════════════ */

/* Whole units: a picture is never looked at closer than about 1.4×, and half the bytes of a frame were decimals. */
export const P = (x, y) => `${Math.round(x)} ${Math.round(y)}`
export const op = (o) => (o < 0.999 ? ` opacity="${r(Math.max(0, o), 3)}"` : '')
export const pen = (d, w = 1, o = {}) => (d ? `<path d="${d}" fill="none" stroke="${o.stroke ?? INK}" stroke-width="${r(w, 2)}" stroke-linecap="round" stroke-linejoin="round"${op(o.opacity ?? 1)}${o.extra ?? ''}/>` : '')
export const fillD = (d, colour, o = {}) => (d ? `<path d="${d}" fill="${colour}"${op(o.opacity ?? 1)}${o.extra ?? ''}/>` : '')
export const circ = (x, y, rad) => (rad > 0.2 ? `M${P(x - rad, y)}a${r(rad)} ${r(rad)} 0 1 0 ${r(rad * 2)} 0a${r(rad)} ${r(rad)} 0 1 0 ${r(-rad * 2)} 0` : '')
export const ellipse = (x, y, rx, ry) => `M${P(x - rx, y)}a${r(rx)} ${r(ry)} 0 1 0 ${r(rx * 2)} 0a${r(rx)} ${r(ry)} 0 1 0 ${r(-rx * 2)} 0`
export const polyD = (lines) => lines.map((pts) => (pts.length > 1 ? 'M' + pts.map(([x, y]) => P(x, y)).join('L') : '')).join('')
export const lineD = (pts) => polyD([pts])
export const closedD = (pts) => lineD(pts) + 'Z'

/** Deterministic noise in 0–1 from integers — no Math.random anywhere. */
export function hash(x, y, s = 0) {
  let h = Math.imul((x | 0) ^ 0x27d4eb2d, 0x165667b1) ^ Math.imul(((y | 0) + Math.imul(s | 0, 7919)) | 0, 0x9e3779b1)
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}
export function seq(seed) {
  let i = 0
  return () => hash(i++, 17, seed)
}

/** A closed (or open) Catmull–Rom curve through `pts`. */
export function spline(pts, closed = true) {
  const n = pts.length
  const at = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))])
  let d = `M${P(...pts[0])}`
  const last = closed ? n : n - 1
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1)
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = at(i + 2)
    d += `C${P(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)} ${P(p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)} ${P(...p2)}`
  }
  return closed ? d + 'Z' : d
}
export const open = (pts) => spline(pts, false)

/** Is (x, y) inside the polygon `pts`? */
export function inside(pts, x, y) {
  let c = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]
    const [xj, yj] = pts[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}

/** A closed polygon resampled evenly to about `step` units. */
export function resample(pts, step = 6) {
  const n = pts.length
  const out = []
  for (let i = 0; i < n; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % n]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    const k = Math.max(1, Math.round(len / step))
    for (let s = 0; s < k; s++) out.push([lerp(a[0], b[0], s / k), lerp(a[1], b[1], s / k)])
  }
  return out
}

/** A torn edge: the polygon resampled and pushed in and out along its normal. */
export function tear(pts, seed = 1, amp = 3.2, step = 5) {
  const q = resample(pts, step)
  const n = q.length
  return q.map((p, i) => {
    const a = q[(i - 1 + n) % n]
    const b = q[(i + 1) % n]
    const nx = -(b[1] - a[1])
    const ny = b[0] - a[0]
    const len = Math.hypot(nx, ny) || 1
    const k = (hash(i, 3, seed) - 0.5) * 2 * amp + Math.sin(i * 0.7 + seed) * amp * 0.5
    return [p[0] + (nx / len) * k, p[1] + (ny / len) * k]
  })
}

export const mirror = (pts) => pts.map(([x, y]) => [2 * CX - x, y])
/** Left half of a symmetrical outline, top to bottom → the whole closed outline. */
const sym = (half) => [...half, ...mirror(half).reverse()]

/* ══ TONE ══════════════════════════════════════════════════════════════
 *
 * Tone is line: a patch is paper, then one to three hatch patterns over it.
 * Patterns are in the portrait's own units, so a portrait under the loupe
 * shows heavier lines, the way a magnified engraving does.
 */
const hatchPat = (id, { angle = 0, gap = 5, width = 1, colour = INK } = {}) =>
  `<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})"><line x1="0" y1="${gap / 2}" x2="${gap}" y2="${gap / 2}" stroke="${colour}" stroke-width="${width}"/></pattern>`

/** Patterns every portrait uses, once per film instance. */
export function portraitDefs(u) {
  return [
    hatchPat(`${u}-k1`, { angle: 38, gap: 4.4, width: 0.8 }),
    hatchPat(`${u}-k2`, { angle: -40, gap: 4.8, width: 0.75 }),
    hatchPat(`${u}-k3`, { angle: 50, gap: 2.9, width: 1.05 }),
    hatchPat(`${u}-k4`, { angle: -36, gap: 3.1, width: 1.0 }),
    hatchPat(`${u}-g0`, { angle: 0, gap: 4.2, width: 0.75, colour: GREEN }),
    hatchPat(`${u}-g1`, { angle: 42, gap: 4, width: 0.85, colour: GREEN }),
    hatchPat(`${u}-g2`, { angle: -40, gap: 4.4, width: 0.8, colour: GREEN }),
    hatchPat(`${u}-g3`, { angle: 50, gap: 2.8, width: 1.05, colour: GREEN }),
    hatchPat(`${u}-g4`, { angle: -36, gap: 3.1, width: 1.0, colour: GREEN }),
    `<radialGradient id="${u}-glow" cx="0.5" cy="0.42" r="0.5"><stop offset="0.35" stop-color="${PAPER}"/><stop offset="1" stop-color="${PAPER}" stop-opacity="0"/></radialGradient>`,
  ].join('')
}

const TONES = {
  ink: [[], ['k1'], ['k1', 'k2'], ['k3', 'k4'], ['k3', 'k4', 'k1']],
  green: [[], ['g1'], ['g1', 'g2'], ['g3', 'g4'], ['g3', 'g4', 'g1']],
}

/* ══ THE KIT ═══════════════════════════════════════════════════════════
 *
 * What a portrait function is handed. Everything is in the portrait's box.
 */
export function makeKit(ctx, id) {
  const u = ctx.uid
  let n = 0
  /*
   * A path used more than once — paper, ink, two hatches, an outline, a clip —
   * is written once into the defs and <use>d for each; a short one is cheaper
   * inline. `ref(d)` returns a function of the attributes.
   */
  const ref = (d) => {
    if (d.length < 160) return (attrs) => `<path d="${d}" ${attrs}/>`
    const pid = `${u}-${id}-p${n++}`
    ctx.defs.set(pid, `<path id="${pid}" d="${d}"/>`)
    return (attrs) => `<use href="#${pid}" ${attrs}/>`
  }
  const inkAttrs = (w, stroke = INK, opacity = 1) => `fill="none" stroke="${stroke}" stroke-width="${r(w, 2)}" stroke-linecap="round" stroke-linejoin="round"${op(opacity)}`
  const clip = (d, rule = '') => {
    const cid = `${u}-${id}-c${n++}`
    const R = typeof d === 'function' ? d : ref(d)
    ctx.defs.set(cid, `<clipPath id="${cid}">${R(rule ? `clip-rule="${rule}"` : '')}</clipPath>`)
    return `url(#${cid})`
  }
  const toneR = (R, lvl = 0, col = 'ink', o = {}) => {
    let s = o.bare ? '' : R(`fill="${PAPER}"`)
    if (lvl >= 4) s += R(`fill="${col === 'ink' ? INK : GREEN}" opacity="0.4"`)
    for (const p of TONES[col][Math.min(lvl, 4)]) s += R(`fill="url(#${u}-${p})"`)
    return s
  }
  const tone = (d, lvl = 0, col = 'ink', o = {}) => (d ? toneR(ref(d), lvl, col, o) : '')
  /** A shape: toned, outlined. `pts` are smoothed unless `sharp`. */
  const shape = (pts, o = {}) => {
    const R = ref(o.sharp ? closedD(pts) : spline(pts))
    return toneR(R, o.tone ?? 0, o.col ?? 'ink') + (o.line === 0 ? '' : R(inkAttrs(o.line ?? 1.2, o.stroke ?? INK)))
  }
  const within = (pts, body, sharp = false) => `<g clip-path="${clip(sharp ? closedD(pts) : spline(pts))}">${body}</g>`
  return { u, id, lod: !!ctx.lod, ref, inkAttrs, clip, tone, toneR, shape, within, pen, fillD, spline, open, circ, ellipse, sym, mirror, CX }
}

/* ══ THE STENCIL ═══════════════════════════════════════════════════════
 *
 * A sitter is a silhouette, the way a stencil portrait is: the hair one bold
 * angular mass, the face left in the paper and given nothing but its outline.
 * No eyes, no nose, no mouth — whoever it is has to be told by the cut of the
 * hair, the hat, the guitar. Dark hair is ink, light hair is the song's green,
 * both engraved: laid in close crosshatch with paper strands lifted out of it
 * from the parting to the tips.
 */

/*
 * Cut locks into an outline. A point may carry [x, y, amp, spacing]: the edge
 * from it to the next is cut into pointed locks `amp` long, one every
 * `spacing`, their tips pushed outward and pulled down by `lean`. An edge with
 * no amp stays straight — the parts of a haircut that are hidden, or cut blunt.
 */
const LOCK = { amp: 1.45, spacing: 1.9 }

export function jag(pts, seed = 1, o = {}) {
  const { spacing = 16, lean = 0.55, inset = 0.45 } = o
  const n = pts.length
  const out = []
  const tips = []
  const rand = seq(seed)
  for (let i = 0; i < n; i++) {
    const A = pts[i]
    const B = pts[(i + 1) % n]
    out.push([A[0], A[1]])
    // Few big locks, not many small ones: a stencil is cut with a knife.
    const amp = (A[2] ?? o.amp ?? 0) * LOCK.amp
    if (!amp) continue
    const L = Math.hypot(B[0] - A[0], B[1] - A[1])
    if (L < 4) continue
    const dx = (B[0] - A[0]) / L
    const dy = (B[1] - A[1]) / L
    let nx = dy
    let ny = -dx
    if (inside(pts, (A[0] + B[0]) / 2 + nx * 2, (A[1] + B[1]) / 2 + ny * 2)) {
      nx = -nx
      ny = -ny
    }
    // Locks of uneven width along the edge: cumulative widths, normalised.
    const k = Math.max(1, Math.round(L / ((A[3] ?? spacing) * LOCK.spacing)))
    const widths = Array.from({ length: k }, () => 0.45 + rand() * 1.1)
    const total = widths.reduce((x, y) => x + y, 0)
    // Every lock on an edge sweeps the same way, like a flame, and curls at the tip.
    const sweep = (rand() - 0.35) * 0.9
    let q0 = 0
    for (let s = 0; s < k; s++) {
      const q1 = q0 + widths[s] / total
      const long = rand()
      const a = amp * (long < 0.2 ? 0.35 : long > 0.8 ? 1.55 : 0.7 + rand() * 0.5)
      const at = (q) => [A[0] + dx * L * q, A[1] + dy * L * q]
      const [bx, by] = at(lerp(q0, q1, 0.5))
      const tip = [bx + nx * a + dx * a * sweep, by + ny * a + a * lean]
      // The lock's two sides bow the same way, so it reads as a curl, not a tooth.
      const [lx, ly] = at(lerp(q0, q1, 0.2))
      const [rx, ry] = at(lerp(q0, q1, 0.8))
      const bow = a * 0.18 * (sweep >= 0 ? 1 : -1)
      out.push([lerp(lx, tip[0], 0.55) + dx * bow, lerp(ly, tip[1], 0.55) + dy * bow])
      out.push(tip)
      tips.push(tip)
      out.push([lerp(rx, tip[0], 0.45) + dx * bow * 1.4, lerp(ry, tip[1], 0.45) + dy * bow * 1.4])
      if (s < k - 1) {
        const [ex, ey] = at(q1)
        const b = amp * inset * (0.4 + rand() * 0.6)
        out.push([ex - nx * b, ey - ny * b])
      }
      q0 = q1
    }
  }
  out.tips = tips
  return out
}

/** Strands lifted out of the hair: from the parting to each lock's tip, bowed. */
export function strandsD(J, part, seed, { bulge = 0.12, centre = [CX, 200], extra = 0.5 } = {}) {
  const rand = seq(seed + 3)
  const lines = []
  const targets = [...(J.tips ?? [])]
  // And a few to the straight runs, so a blunt cut still has grain.
  const edge = resample(J, 14)
  for (let i = 0; i < edge.length; i++) if (rand() < extra * 0.35) targets.push(edge[i])
  for (const tgt of targets) {
    const sx = part[0] + (rand() - 0.5) * 16
    const sy = part[1] + (rand() - 0.5) * 8
    const ex = lerp(sx, tgt[0], 0.9)
    const ey = lerp(sy, tgt[1], 0.9)
    let ox = (sx + ex) / 2 - centre[0]
    let oy = (sy + ey) / 2 - centre[1]
    const ol = Math.hypot(ox, oy) || 1
    const len = Math.hypot(ex - sx, ey - sy)
    const cx = (sx + ex) / 2 + (ox / ol) * len * bulge
    const cy = (sy + ey) / 2 + (oy / ol) * len * bulge
    // One quadratic from a little way out of the parting, so the crown is not a knot of lines.
    const q0 = 0.19
    const bx = (1 - q0) ** 2 * sx + 2 * (1 - q0) * q0 * cx + q0 * q0 * ex
    const by = (1 - q0) ** 2 * sy + 2 * (1 - q0) * q0 * cy + q0 * q0 * ey
    lines.push(`M${P(bx, by)}Q${P(lerp(cx, ex, q0), lerp(cy, ey, q0))} ${P(ex, ey)}`)
  }
  return lines.join('')
}

/** Hair: the cut outline, in ink or green, with strands lifted out of it. */
export function mane(K, pts, o = {}) {
  const J = jag(pts, o.seed ?? 5, o)
  const R = K.ref(closedD(J))
  const col = o.col ?? 'ink'
  let s = R(`fill="${PAPER}"`) + R(`fill="${col === 'ink' ? INK : GREEN}" opacity="0.62"`) + R(`fill="url(#${K.u}-${col === 'ink' ? 'k3' : 'g3'})"`) + R(`fill="url(#${K.u}-${col === 'ink' ? 'k4' : 'g4'})"`)
  // Far off, the strands are finer than a pixel: a wide shot leaves them out (ctx.lod).
  if (o.part !== false && !K.lod) s += `<g clip-path="${K.clip(R)}">${pen(strandsD(J, o.part ?? [CX, 90], o.seed ?? 5, o), 0.8, { stroke: PAPER, opacity: 0.42 })}</g>`
  return s + R(K.inkAttrs(1.1, col === 'ink' ? INK : GREEN))
}

/** A plain dark shape: a moustache, a beard, a hat band — hair with no parting. */
export const tuft = (K, pts, o = {}) => mane(K, pts, { part: false, ...o })

const FACE = { top: 110, eyeY: 190, w: 54, jaw: 48, chinY: 288, chinW: 18 }
/* Faces are cut wider than a likeness would be: a broad jaw is nobody's in particular. */
const WIDE = 1.16

/** The face's outline: straight cuts from temple to cheekbone to jaw to chin. */
function faceOutline(o = {}) {
  const f = { ...FACE, ...o }
  const { top, eyeY } = f
  const [w, jaw, chinY, chinW] = [f.w * WIDE, f.jaw * WIDE, f.chinY, f.chinW * WIDE]
  f.w = w
  f.jaw = jaw
  f.chinW = chinW
  const L = [[CX - w * 0.74, top + 10], [CX - w, eyeY - 30], [CX - w * 1.02, eyeY + 14], [CX - jaw, chinY - 36], [CX - chinW, chinY - 3], [CX - chinW * 0.35, chinY + 1]]
  return { f, pts: [[CX, top], ...mirror(L), ...L.slice().reverse()] }
}

/**
 * The skin: ears, neck and face in the paper, outlined; the one shadow a
 * stencil keeps is the jaw's, cut across the neck.
 */
export function skin(K, o = {}) {
  const { f, pts } = faceOutline(o)
  const nw = (o.neckW ?? 26) * 1.08
  let s = ''
  const neckPts = [[CX - nw, f.chinY - 40], [CX - nw - 3, 350], [CX + nw + 3, 350], [CX + nw, f.chinY - 40]]
  s += fillD(closedD(neckPts), PAPER)
  const shadow = [[CX - nw - 6, f.chinY - 40], [CX + nw + 6, f.chinY - 40], [CX + nw + 6, f.chinY + 34], [CX - nw - 6, f.chinY + 8]]
  s += K.within(neckPts, K.tone(closedD(shadow), 3, 'ink', { bare: true }), true)
  s += pen(`M${P(CX - nw, f.chinY - 30)}L${P(CX - nw - 3, 348)}M${P(CX + nw, f.chinY - 30)}L${P(CX + nw + 3, 348)}`, 1.3)
  if (o.ears) {
    for (const sd of [-1, 1]) {
      const ex = CX + sd * f.w
      const e = [[ex - sd * 4, f.eyeY - 10], [ex + sd * 10, f.eyeY - 8], [ex + sd * 12, f.eyeY + 12], [ex + sd * 5, f.eyeY + 30], [ex - sd * 4, f.eyeY + 26]]
      s += fillD(closedD(e), PAPER) + pen(closedD(e), 1.2)
    }
  }
  s += fillD(closedD(pts), PAPER) + pen(closedD(pts), 1.5)
  return s
}

/** Shoulders to the bottom of the box, cut straight. */
export function shoulders({ w = 150, y0 = 322, neckW = 27, drop = 50 } = {}) {
  return [[CX - neckW - 4, y0], [CX - neckW - 50, y0 + 18], [CX - w, y0 + drop], [CX - w - 26, y0 + drop + 50], [CX - w - 40, PH + 20], [CX + w + 40, PH + 20], [CX + w + 26, y0 + drop + 50], [CX + w, y0 + drop], [CX + neckW + 50, y0 + 18], [CX + neckW + 4, y0]]
}
/** Clothes: the shoulders, toned 0 (white) to 4 (black), and outlined. */
export const body = (K, o = {}) => K.shape(shoulders(o), { tone: o.tone ?? 1, sharp: true, line: 1.4 })

/** A ring of points, for heads of hair that are round: an afro, a bouffant. */
export const ringPts = (x, y, rx, ryTop, ryBot, n, amp, sp) => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * Math.PI * 2
  return [x + Math.cos(a) * rx, y + Math.sin(a) * (Math.sin(a) > 0 ? ryBot : ryTop), amp, sp]
})

/** A small eight-pointed sparkle. */
export const sparkle = (x, y, k) => `M${P(x - k, y)}L${P(x + k, y)}M${P(x, y - k)}L${P(x, y + k)}M${P(x - k * 0.5, y - k * 0.5)}L${P(x + k * 0.5, y + k * 0.5)}M${P(x - k * 0.5, y + k * 0.5)}L${P(x + k * 0.5, y - k * 0.5)}`

/**
 * Strands flowing from a parting to the outline's edge: waves and straight
 * hair. Each is a curve from `part` to a point on the edge, bowed outward from
 * `centre`, with `wave` of ripple along it.
 */
export function flowD(pts, part, seed, { n = 46, wave = 0, bulge = 0.25, centre = [CX, 190], below = -Infinity, waves = 3 } = {}) {
  const edge = resample(pts, 3)
  const rand = seq(seed)
  const lines = []
  const targets = edge.filter(([, y]) => y > below)
  for (let i = 0; i < n; i++) {
    const tgt = targets[Math.floor(((i + rand() * 0.8) / n) * targets.length) % targets.length]
    if (!tgt) continue
    const sx = part[0] + (rand() - 0.5) * 14
    const sy = part[1] + (rand() - 0.5) * 6
    const mx = (sx + tgt[0]) / 2
    const my = (sy + tgt[1]) / 2
    let ox = mx - centre[0]
    let oy = my - centre[1]
    const ol = Math.hypot(ox, oy) || 1
    ox /= ol
    oy /= ol
    const len = Math.hypot(tgt[0] - sx, tgt[1] - sy)
    const cx = mx + ox * len * bulge
    const cy = my + oy * len * bulge
    const ph = rand() * 6.28
    const line = []
    for (let s = 0; s <= 24; s++) {
      const q = s / 24
      const x = (1 - q) ** 2 * sx + 2 * (1 - q) * q * cx + q * q * tgt[0]
      const y = (1 - q) ** 2 * sy + 2 * (1 - q) * q * cy + q * q * tgt[1]
      const w = wave * Math.sin(ph + q * Math.PI * waves) * Math.min(1, q * 3)
      line.push([x + w, y])
    }
    lines.push(line)
  }
  return polyD(lines)
}

/* ══ PROPS ═════════════════════════════════════════════════════════════ */

/** A guitar neck from (x0, y0) to (x1, y1), frets across it, width `w`. */
export function guitarNeck(K, x0, y0, x1, y1, w = 16, o = {}) {
  const L = Math.hypot(x1 - x0, y1 - y0)
  const ux = (x1 - x0) / L
  const uy = (y1 - y0) / L
  const nx = -uy * w / 2
  const ny = ux * w / 2
  const body = closedD([[x0 + nx, y0 + ny], [x1 + nx * 0.85, y1 + ny * 0.85], [x1 - nx * 0.85, y1 - ny * 0.85], [x0 - nx, y0 - ny]])
  let frets = ''
  for (let i = 1; i < 22; i++) {
    const s = L * (1 - 2 ** (-i / 12)) * 1.9
    if (s > L) break
    frets += `M${P(x0 + ux * (L - s) + nx, y0 + uy * (L - s) + ny)}L${P(x0 + ux * (L - s) - nx, y0 + uy * (L - s) - ny)}`
  }
  let strings = ''
  for (let i = -2; i <= 2; i++) strings += `M${P(x0 + nx * i * 0.36, y0 + ny * i * 0.36)}L${P(x1 + nx * i * 0.3, y1 + ny * i * 0.3)}`
  return K.tone(body, o.tone ?? 3) + pen(body, 1.1) + pen(frets, 0.8, { stroke: PAPER, opacity: 0.9 }) + pen(strings, 0.4, { stroke: PAPER, opacity: 0.8 })
}

/** A headstock at the top of a neck: a polygon in the neck's frame, (along, across). */
export function headstock(K, x1, y1, ux, uy, shape, o = {}) {
  const nx = -uy
  const ny = ux
  const pts = shape.map(([a, c]) => [x1 + ux * a + nx * c, y1 + uy * a + ny * c])
  let out = K.tone(closedD(pts), o.tone ?? 0) + pen(closedD(pts), 1.1)
  for (const [a, c] of o.pegs ?? []) {
    const x = x1 + ux * a + nx * c
    const y = y1 + uy * a + ny * c
    out += fillD(circ(x, y, 2.6), INK)
  }
  return out
}

export function unit(x0, y0, x1, y1) {
  const L = Math.hypot(x1 - x0, y1 - y0)
  return [(x1 - x0) / L, (y1 - y0) / L]
}

/** A hand closed round something: a mitten with finger lines. */
export function fist(K, x, y, s = 1, o = {}) {
  const pts = [[-18, -10], [-8, -20], [10, -20], [20, -12], [22, 8], [12, 20], [-10, 20], [-20, 8]].map(([a, b]) => [x + a * s, y + b * s])
  let out = K.shape(pts, { tone: o.tone ?? 0 })
  for (let i = -1; i <= 1; i++) out += pen(`M${P(x - 14 * s, y + i * 8 * s)}Q${P(x, y + i * 8 * s - 3 * s)} ${P(x + 18 * s, y + i * 8 * s)}`, 0.8)
  return out
}

/** A hat with a crown and a brim. kind: tophat | fedora | bowler. */
export function hat(K, kind, o = {}) {
  const y = o.y ?? 112
  const tilt = o.tilt ?? 0
  const brimW = o.brimW ?? (kind === 'bowler' ? 88 : kind === 'fedora' ? 112 : 104)
  const tone = o.tone ?? 4
  let out = ''
  const bx = CX + (o.dx ?? 0)
  const back = `M${P(bx - brimW, y)}Q${P(bx, y - 22)} ${P(bx + brimW, y)}`
  let crown
  if (kind === 'tophat') crown = [[bx - 58, y], [bx - 64, y - 128], [bx - 30, y - 136], [bx + 30, y - 136], [bx + 64, y - 128], [bx + 58, y]]
  else if (kind === 'fedora') crown = [[bx - 64, y + 2], [bx - 60, y - 46], [bx - 40, y - 76], [bx - 10, y - 70], [bx, y - 60], [bx + 10, y - 70], [bx + 40, y - 76], [bx + 60, y - 46], [bx + 64, y + 2]]
  else crown = [[bx - 58, y + 2], [bx - 60, y - 30], [bx - 42, y - 66], [bx, y - 78], [bx + 42, y - 66], [bx + 60, y - 30], [bx + 58, y + 2]]
  const brim = kind === 'fedora'
    ? `M${P(bx - brimW, y + 4)}Q${P(bx - brimW + 10, y - 16)} ${P(bx - 60, y - 10)}L${P(bx + 60, y - 10)}Q${P(bx + brimW - 10, y - 16)} ${P(bx + brimW, y + 4)}Q${P(bx, y + 30)} ${P(bx - brimW, y + 4)}Z`
    : `M${P(bx - brimW, y)}Q${P(bx - brimW - 4, y - 18)} ${P(bx - 60, y - 12)}L${P(bx + 60, y - 12)}Q${P(bx + brimW + 4, y - 18)} ${P(bx + brimW, y)}Q${P(bx, y + 26)} ${P(bx - brimW, y)}Z`
  const g = (s) => (tilt ? `<g transform="rotate(${tilt} ${bx} ${y})">${s}</g>` : s)
  out += K.tone(brim, tone) + pen(brim, 1.3)
  const cd = kind === 'tophat' ? closedD(crown) : spline(crown)
  out += K.tone(cd, tone) + pen(cd, 1.3)
  // The band.
  const bandH = o.band ?? 14
  const band = `M${P(bx - 60, y - 2)}L${P(bx - 61, y - 2 - bandH)}Q${P(bx, y - 8 - bandH)} ${P(bx + 61, y - 2 - bandH)}L${P(bx + 60, y - 2)}Q${P(bx, y - 8)} ${P(bx - 60, y - 2)}Z`
  out += K.tone(band, o.bandTone ?? 1) + pen(band, 1)
  if (o.conchos) for (let i = -3; i <= 3; i++) out += fillD(circ(bx + i * 16, y - 2 - bandH / 2 - 3 + Math.abs(i) * 0.5, 4), PAPER) + pen(circ(bx + i * 16, y - 2 - bandH / 2 - 3 + Math.abs(i) * 0.5, 4), 0.9)
  // A highlight down the crown.
  out += pen(open(kind === 'tophat' ? [[bx - 40, y - 20], [bx - 44, y - 120]] : [[bx - 36, y - 20], [bx - 34, y - 56]]), 3, { stroke: PAPER, opacity: 0.5 })
  return g(out) + (back ? '' : '')
}

/** A microphone on a stand, the round old kind. */
export function oldMic(K, x, y, s = 1) {
  const head = spline([[x - 16 * s, y - 20 * s], [x, y - 30 * s], [x + 16 * s, y - 20 * s], [x + 18 * s, y + 8 * s], [x, y + 22 * s], [x - 18 * s, y + 8 * s]])
  let out = K.tone(head, 1) + pen(head, 1.3)
  for (let i = -2; i <= 2; i++) out += pen(`M${P(x - 16 * s, y + i * 7 * s)}Q${P(x, y + i * 7 * s + 3)} ${P(x + 16 * s, y + i * 7 * s)}`, 0.7)
  out += pen(`M${P(x, y + 22 * s)}L${P(x, y + 200 * s)}`, 5 * s) + pen(`M${P(x - 1.5, y + 24 * s)}L${P(x - 1.5, y + 200 * s)}`, 1, { stroke: PAPER, opacity: 0.6 })
  return out
}

/**
 * An embroidered dragon climbing from (x, y): a serpent body in paper with
 * scales, a horned head, claws and flames. `side` flips it.
 */
export function dragon(K, x, y, h = 140, side = 1) {
  const n = 26
  const pts = Array.from({ length: n }, (_, i) => {
    const q = i / (n - 1)
    return [x + side * 26 * Math.sin(q * Math.PI * 2.4), y - q * h]
  })
  const body = open(pts)
  let s = pen(body, 13, { stroke: INK }) + pen(body, 10, { stroke: PAPER })
  // Scales down the body.
  for (let i = 1; i < n - 2; i += 3) {
    const [a, b] = pts[i]
    const [c, d] = pts[i + 1]
    const ux = c - a
    const uy = d - b
    s += pen(`M${P(a - uy * 1.2, b + ux * 1.2)}Q${P(c, d)} ${P(a + uy * 1.2, b - ux * 1.2)}`, 0.8)
  }
  // Claws at two bends.
  for (const i of [6, 17]) {
    const [a, b] = pts[i]
    const out = side * (i === 9 ? 1 : -1)
    s += pen(`M${P(a, b)}l${r(out * 16)} 4m0 0l${r(out * 5)} -5m${r(-out * 5)} 5l${r(out * 6)} 1m${r(-out * 6)} -1l${r(out * 4)} 5`, 1.4, { stroke: PAPER }) + pen(`M${P(a, b)}l${r(out * 16)} 4`, 0.6)
  }
  // Flames off the back.
  for (let i = 3; i < n - 4; i += 5) {
    const [a, b] = pts[i]
    s += pen(open([[a, b - 4], [a - side * 12, b - 10], [a - side * 6, b - 20], [a - side * 14, b - 26]]), 1.1, { stroke: PAPER })
  }
  // The head: a snout, a jaw, a horn, an eye.
  const [hx, hy] = pts[n - 1]
  const headPts = [[hx - 7, hy + 4], [hx - 8, hy - 8], [hx + side * 8, hy - 14], [hx + side * 24, hy - 10], [hx + side * 26, hy - 3], [hx + side * 12, hy], [hx + side * 22, hy + 6], [hx + side * 6, hy + 8]]
  s += K.shape(headPts, { tone: 0, line: 1.1 }) + fillD(circ(hx + side * 6, hy - 7, 1.8), INK)
  s += pen(open([[hx - side * 2, hy - 10], [hx - side * 10, hy - 22], [hx - side * 6, hy - 30]]), 1.6, { stroke: PAPER }) + pen(`M${P(hx + side * 26, hy - 3)}q${r(side * 10)} -6 ${r(side * 14)} 4`, 1, { stroke: PAPER })
  return s
}

/** A peppermint: a disc of curved wedges, alternately green and paper. */
export function peppermint(K, x, y, R, o = {}) {
  let s = fillD(circ(x, y, R), PAPER)
  const n = o.n ?? 8
  for (let i = 0; i < n; i += 2) {
    const a0 = (i / n) * Math.PI * 2
    const a1 = ((i + 1) / n) * Math.PI * 2
    const tw = 0.9
    const pts = [[x, y]]
    for (let s2 = 0; s2 <= 5; s2++) {
      const q = s2 / 5
      const a = a0 + tw * q
      pts.push([x + Math.cos(a) * R * q, y + Math.sin(a) * R * q])
    }
    for (let s2 = 0; s2 <= 5; s2++) {
      const a = lerp(a0 + tw, a1 + tw, s2 / 5)
      pts.push([x + Math.cos(a) * R, y + Math.sin(a) * R])
    }
    for (let s2 = 5; s2 >= 0; s2--) {
      const q = s2 / 5
      const a = a1 + tw * q
      pts.push([x + Math.cos(a) * R * q, y + Math.sin(a) * R * q])
    }
    const d = closedD(pts)
    s += fillD(d, `url(#${K.u}-g3)`) + fillD(d, `url(#${K.u}-g4)`) + pen(d, 0.7, { stroke: GREEN })
  }
  return s + pen(circ(x, y, R), 1.4)
}

/** Three interlocking rings. */
export function rings3(x, y, R) {
  let s = ''
  for (const [dx, dy] of [[-R * 0.62, R * 0.38], [R * 0.62, R * 0.38], [0, -R * 0.62]]) s += pen(circ(x + dx, y + dy, R * 0.7), 2.2)
  return s
}

/** An acoustic guitar body with its soundhole, neck up towards (nx, ny). */
export function acoustic(K, x, y, s, nx, ny, o = {}) {
  const [ux, uy] = unit(x, y, nx, ny)
  const ang = (Math.atan2(uy, ux) * 180) / Math.PI + 90
  let out = guitarNeck(K, x + ux * 60 * s, y + uy * 60 * s, nx, ny, 18 * s, { tone: 3 })
  const bodyPts = [[0, -70], [42, -62], [52, -30], [40, 0], [62, 40], [58, 80], [0, 96], [-58, 80], [-62, 40], [-40, 0], [-52, -30], [-42, -62]].map(([a, b]) => [a * s, b * s])
  let g = K.shape(bodyPts, { tone: o.tone ?? 1, line: 1.4 })
  g += fillD(circ(0, -10 * s, 20 * s), INK, { opacity: 0.9 }) + pen(circ(0, -10 * s, 25 * s), 1.4) + pen(circ(0, -10 * s, 28 * s), 0.7)
  g += K.shape([[-22, 50], [22, 50], [22, 58], [-22, 58]].map(([a, b]) => [a * s, b * s]), { tone: 3, sharp: true, line: 0.8 })
  for (let i = -2; i <= 2; i++) g += pen(`M${P(i * 3 * s, -70 * s)}L${P(i * 3 * s, 54 * s)}`, 0.4, { stroke: PAPER, opacity: 0.8 })
  out += `<g transform="translate(${r(x)} ${r(y)}) rotate(${r(ang, 2)})">${g}</g>`
  return out
}

/** The torn patch's frame — paper core then the red edge. */
export function tornEdge(pts, o = {}) {
  const d = closedD(pts)
  return pen(d, o.core ?? 4.2, { stroke: PAPER, opacity: 0.95 }) + pen(d, o.red ?? 1.5, { stroke: RED })
}

/* ══ SCENES ════════════════════════════════════════════════════════════
 *
 * Everything that hangs on the wall is a scene drawn in a PW × PH box: a
 * sitter, or (shared/video/still-lifes.mjs) an instrument or a page of music.
 * `pieces` are the regions, in the box, that get torn off it; a scene with none
 * is given three, cut wherever there is most to tear.
 */
export const SCENES = {}
export const scene = (id, spec) => (SCENES[id] = { id, kind: 'sitter', frame: 'rect', ...spec })

/* ── The three the camera comes close to ─────────────────────────────── */

// Jimmy Page: long dark hair from a middle parting, the suit with the dragons up it.
scene('page', {
  kind: 'lead',
  hint: 'Long dark hair to the shoulders from a middle parting; a black suit with an embroidered dragon climbing each side.',
  frame: 'rect',
  pieces: {
    lock: [[88, 196], [140, 186], [150, 300], [96, 330]],
    parting: [[130, 70], [232, 70], [238, 130], [124, 130]],
    dragon: [[36, 350], [132, 340], [140, 460], [30, 460]],
    lapel: [[200, 330], [300, 350], [300, 440], [196, 430]],
  },
  draw: (K) => {
    let s = mane(K, [[180, 78], [236, 86], [264, 122], [274, 200], [282, 290], [296, 348, 9, 9], [246, 356], [228, 296], [132, 296], [114, 356, 9, 9], [64, 348], [78, 290], [86, 200], [96, 122], [124, 86]], { seed: 51, part: [CX, 82] })
    s += body(K, { w: 146, neckW: 30, tone: 4 })
    s += K.shape([[150, 320], [166, 400], [180, 470], [194, 400], [210, 320]], { tone: 0, sharp: true })
    s += pen(`M${P(148, 322)}L${P(130, 362)}L${P(164, 432)}L${P(172, 470)}M${P(212, 322)}L${P(230, 362)}L${P(196, 432)}L${P(188, 470)}`, 1.6, { stroke: PAPER })
    s += dragon(K, 80, 470, 132, 1) + dragon(K, 280, 470, 132, -1)
    s += skin(K, { eyeY: 194, chinY: 294, neckW: 30 })
    s += mane(K, [[CX, 82], [CX - 4, 110], [132, 150], [126, 220], [128, 306, 9, 8], [104, 300], [102, 210], [110, 134], [136, 96]], { seed: 52, part: [CX, 84] })
    s += mane(K, [[CX, 82], [224, 96], [250, 134], [258, 210], [256, 300, 9, 8], [232, 306], [234, 220], [228, 150], [CX + 4, 110]], { seed: 53, part: [CX, 84] })
    return s
  },
})

// Jack White: the black bob, parted in the middle, cut square at the jaw.
scene('jack', {
  kind: 'lead',
  hint: 'Jaw-length black hair parted in the middle, cut square, a dark shirt buttoned up.',
  frame: 'round',
  pieces: {
    left: [[92, 150], [140, 150], [142, 290], [94, 292]],
    crown: [[120, 70], [240, 70], [250, 120], [110, 120]],
    right: [[222, 170], [272, 160], [274, 282], [224, 290]],
    collar: [[130, 318], [230, 318], [240, 380], [120, 380]],
  },
  draw: (K) => {
    let s = mane(K, [[180, 82], [240, 88], [268, 126], [276, 200], [276, 268, 8, 9], [258, 294], [236, 254], [124, 254], [102, 294, 8, 9], [84, 268], [84, 200], [92, 126], [120, 88]], { seed: 121, part: [CX, 86] })
    s += body(K, { w: 142, neckW: 30, tone: 4 })
    s += K.shape([[148, 320], [164, 352], [180, 344], [196, 352], [212, 320]], { tone: 0, sharp: true })
    s += pen(`M${P(180, 346)}L${P(180, 470)}`, 1.2, { stroke: PAPER }) + fillD(circ(180, 380, 2.4) + circ(180, 412, 2.4) + circ(180, 444, 2.4), PAPER)
    s += skin(K, { eyeY: 196, chinY: 292, neckW: 30 })
    s += mane(K, [[CX, 84], [CX - 4, 106], [134, 146], [128, 200], [126, 278, 8, 8], [102, 290], [100, 212], [108, 136], [132, 94]], { seed: 122, part: [CX, 86] })
    s += mane(K, [[CX, 84], [228, 94], [252, 136], [260, 212], [258, 290, 8, 8], [234, 278], [232, 200], [226, 146], [CX + 4, 106]], { seed: 123, part: [CX, 86] })
    return s
  },
})

// Bob Dylan: the bush of curls standing up and out, a polka-dot shirt.
scene('dylan', {
  kind: 'lead',
  hint: 'A wild bush of curls standing up off the head; a polka-dot shirt with a narrow collar.',
  frame: 'oval',
  pieces: {
    top: [[110, 40], [250, 40], [250, 110], [110, 110]],
    side: [[60, 120], [120, 120], [124, 220], [64, 230]],
    dots: [[40, 360], [150, 350], [150, 450], [40, 460]],
    other: [[240, 120], [300, 120], [300, 220], [244, 230]],
  },
  draw: (K) => {
    let s = mane(K, ringPts(CX, 150, 108, 104, 84, 30, 9, 10), { seed: 61, part: [CX, 128], bulge: 0.2 })
    s += body(K, { w: 136, neckW: 28, tone: 0 })
    let dots = ''
    for (let y = 340; y < 470; y += 18) for (let x = 10; x < 360; x += 18) dots += circ(x + ((y / 18) % 2) * 9, y, 3.2)
    s += K.within(shoulders({ w: 136, neckW: 28 }), fillD(dots, INK), true)
    s += K.shape([[144, 320], [158, 362], [180, 342], [202, 362], [216, 320]], { tone: 0, sharp: true })
    s += skin(K, { eyeY: 196, chinY: 292, neckW: 28, w: 52, jaw: 46, chinW: 18 })
    s += mane(K, [[108, 156], [118, 104], [180, 86], [242, 104], [252, 156, 10, 10]], { seed: 62, part: [CX, 96] })
    return s
  },
})

/* ── Everyone else: haircuts, not people ──────────────────────────────────
 *
 * Seen on the wall in passing and never landed on. Each is an archetype — a
 * cut and a hat that a lot of people have worn — so a viewer may think "is that
 * …?" and be gone before they could say. Nothing here is drawn from anyone.
 */
scene('tophat', {
  frame: 'rect',
  draw: (K) => {
    let s = mane(K, [[84, 120], [66, 124, 16], [34, 220, 18], [26, 330, 18], [50, 410], [120, 404], [240, 404], [310, 410, 18], [334, 330, 18], [326, 220, 16], [294, 124], [276, 120]], { seed: 11, part: [CX, 118] })
    s += body(K, { w: 150, tone: 3 })
    s += K.shape([[150, 322], [132, 470], [228, 470], [210, 322]], { tone: 0, sharp: true })
    s += skin(K, { eyeY: 196, chinY: 290 })
    s += mane(K, [[112, 120], [248, 120], [256, 214, 16, 13], [104, 214]], { seed: 12, part: [CX, 122] })
    s += mane(K, [[80, 190], [120, 212, 14], [128, 320, 14], [94, 384], [58, 300]], { seed: 13, part: [100, 190] })
    s += mane(K, [[280, 190], [302, 300, 14], [266, 384, 14], [232, 320], [240, 212]], { seed: 14, part: [260, 190] })
    s += hat(K, 'tophat', { y: 124, band: 12, bandTone: 3 })
    return s
  },
})

scene('afro', {
  frame: 'oval',
  draw: (K) => {
    let s = mane(K, ringPts(CX, 168, 128, 124, 134, 34, 6, 9), { seed: 21, part: [CX, 150], bulge: 0.2 })
    s += body(K, { w: 148, tone: 3 })
    s += K.shape([[148, 320], [140, 356], [180, 372], [220, 356], [212, 320]], { tone: 0, sharp: true })
    s += skin(K, { eyeY: 194, chinY: 292 })
    s += K.shape([[112, 134], [180, 118], [248, 134], [246, 150], [180, 136], [114, 150]], { tone: 1, sharp: true })
    return s
  },
})

scene('crop', {
  frame: 'arch',
  draw: (K) => {
    let s = body(K, { w: 146, neckW: 32, tone: 0 })
    s += K.shape([[100, 470], [110, 360], [128, 326], [150, 326], [156, 360], [180, 382], [204, 360], [210, 326], [232, 326], [250, 360], [260, 470]], { tone: 0, sharp: true, line: 1.4 })
    s += skin(K, { eyeY: 190, chinY: 290, ears: true, neckW: 32 })
    s += mane(K, [[118, 164], [112, 112, 6, 9], [130, 80, 6, 9], [180, 66, 6, 9], [230, 80, 6, 9], [248, 112], [242, 164], [232, 132], [180, 120], [128, 132]], { seed: 31, part: [CX, 124], centre: [CX, 150] })
    s += tuft(K, [[146, 262], [152, 240], [180, 234], [208, 240], [214, 262], [200, 254], [180, 252], [160, 254]], { seed: 32 })
    return s
  },
})

scene('mane', {
  frame: 'oval',
  draw: (K) => {
    let s = mane(K, [[180, 70], [240, 76, 10], [284, 108, 14], [308, 172, 16], [316, 250, 18], [326, 340, 20], [302, 414], [248, 416], [238, 330], [226, 270], [134, 270], [122, 330], [112, 416, 20], [58, 414, 20], [34, 340, 18], [44, 250, 16], [52, 172, 14], [76, 108, 10], [124, 76]], { col: 'green', seed: 41, part: [180, 74], wave: 3 })
    s += body(K, { w: 140, neckW: 28, tone: 1 })
    s += K.shape([[150, 318], [160, 380], [180, 470], [200, 380], [210, 318]], { tone: 0, sharp: true })
    s += skin(K, { eyeY: 192, chinY: 294, neckW: 28 })
    s += mane(K, [[148, 108], [120, 118, 12], [100, 190, 14], [92, 290, 16], [88, 360, 14], [128, 356], [134, 280], [128, 190]], { col: 'green', seed: 42, part: [140, 110] })
    s += mane(K, [[212, 108], [232, 190], [226, 280], [232, 356, 14], [272, 360, 16], [268, 290, 14], [260, 190, 12], [240, 118]], { col: 'green', seed: 43, part: [220, 110] })
    return s
  },
})

scene('bowler', {
  frame: 'round',
  draw: (K) => {
    let s = mane(K, [[108, 128], [252, 128], [266, 200, 10, 12], [264, 290, 12, 12], [244, 336], [116, 336, 12, 12], [96, 290, 10, 12], [94, 200]], { seed: 81, part: [CX, 118] })
    s += body(K, { w: 150, neckW: 32, tone: 0 })
    s += K.shape([[146, 318], [110, 350], [150, 372], [180, 346], [210, 372], [250, 350], [214, 318]], { tone: 0, sharp: true })
    s += skin(K, { eyeY: 196, w: 62, jaw: 58, chinY: 290, chinW: 26, neckW: 32 })
    s += tuft(K, [[120, 234], [150, 236], [160, 226], [180, 224], [200, 226], [210, 236], [240, 234], [244, 262, 8, 10], [218, 298, 8, 10], [180, 312, 8, 10], [142, 298, 8, 10], [116, 262]], { seed: 82 })
    s += hat(K, 'bowler', { y: 132, brimW: 96, band: 10 })
    return s
  },
})

scene('feathered', {
  frame: 'oval',
  draw: (K) => {
    let s = mane(K, [[180, 74], [244, 78, 12], [294, 108, 16], [324, 170, 16], [326, 250, 16], [306, 332], [252, 352], [236, 300], [124, 300], [108, 352, 16], [54, 332, 16], [34, 250, 16], [36, 170, 16], [66, 108, 12], [116, 78]], { seed: 91, part: [166, 80], wave: 3 })
    s += body(K, { w: 136, neckW: 27, tone: 3 })
    s += K.shape([[154, 318], [168, 380], [180, 410], [192, 380], [206, 318]], { tone: 0, sharp: true })
    s += skin(K, { eyeY: 196, w: 52, jaw: 44, chinY: 290, chinW: 16, neckW: 27 })
    s += mane(K, [[174, 104], [128, 100, 12], [90, 132, 12], [80, 200, 12], [88, 262], [106, 224], [114, 160], [140, 126]], { seed: 92, part: [170, 106], centre: [CX, 220] })
    s += mane(K, [[186, 104], [220, 126], [246, 160], [254, 224], [272, 262, 12], [280, 200, 12], [270, 132, 12], [232, 100]], { seed: 93, part: [190, 106], centre: [CX, 220] })
    return s
  },
})

scene('fringe', {
  frame: 'arch',
  draw: (K) => {
    let s = mane(K, [[180, 82], [236, 88], [264, 126], [276, 200], [286, 300], [296, 384, 7, 8], [252, 398], [232, 320], [128, 320], [108, 398, 7, 8], [64, 384], [74, 300], [84, 200], [96, 126], [124, 88]], { col: 'green', seed: 101, part: [CX, 84] })
    s += body(K, { w: 136, neckW: 27, tone: 1 })
    s += skin(K, { eyeY: 196, w: 52, jaw: 44, chinY: 290, chinW: 16, neckW: 27 })
    s += mane(K, [[CX, 88], [232, 98], [244, 132], [242, 174, 3, 6], [118, 174], [116, 132], [128, 98]], { col: 'green', seed: 102, part: [CX, 90] })
    return s
  },
})

scene('cloud', {
  frame: 'oval',
  draw: (K) => {
    let s = mane(K, ringPts(CX, 190, 138, 124, 150, 34, 9, 11), { seed: 111, part: [CX, 150], bulge: 0.25 })
    s += body(K, { w: 142, neckW: 28, tone: 1 })
    s += skin(K, { eyeY: 200, chinY: 298, neckW: 28, w: 52 })
    s += mane(K, [[114, 172], [116, 120], [180, 100], [244, 120], [246, 172, 9, 10]], { seed: 112, part: [CX, 108] })
    return s
  },
})

scene('bangs', {
  frame: 'oval',
  draw: (K) => {
    let s = mane(K, [[180, 86], [240, 92], [268, 130], [276, 210], [280, 300, 6, 8], [254, 320], [238, 290], [122, 290], [106, 320, 6, 8], [80, 300], [84, 210], [92, 130], [120, 92]], { seed: 131, part: [CX, 90] })
    s += body(K, { w: 138, neckW: 28, tone: 1 })
    s += skin(K, { eyeY: 200, w: 60, jaw: 54, chinY: 292, chinW: 26, neckW: 28 })
    s += mane(K, [[CX, 92], [236, 100], [248, 134], [248, 178], [112, 178], [112, 134], [124, 100]], { seed: 132, part: [CX, 94] })
    return s
  },
})

scene('mop', {
  frame: 'rect',
  draw: (K) => {
    let s = body(K, { w: 134, neckW: 28, tone: 3 })
    s += K.shape([[150, 318], [162, 346], [180, 354], [198, 346], [210, 318]], { tone: 0, sharp: true })
    s += skin(K, { eyeY: 196, chinY: 290, neckW: 28, w: 52 })
    s += mane(K, [[120, 152], [106, 112, 12, 12], [126, 74, 12, 12], [170, 58, 12, 12], [220, 62, 12, 12], [252, 88, 10, 12], [262, 134], [254, 174], [240, 142, 7, 9], [170, 124, 7, 9], [132, 138], [126, 172]], { col: 'green', seed: 141, part: [150, 84], centre: [180, 150], wave: 3 })
    return s
  },
})

scene('quiff', {
  frame: 'rect',
  draw: (K) => {
    let s = body(K, { w: 146, neckW: 32, tone: 3 })
    s += K.shape([[148, 318], [158, 350], [180, 358], [202, 350], [212, 318]], { tone: 0, sharp: true })
    s += skin(K, { eyeY: 198, w: 60, jaw: 55, chinY: 292, chinW: 26, neckW: 32, ears: true })
    s += mane(K, [[118, 162], [112, 112, 9, 10], [128, 78, 9, 10], [172, 56, 9, 10], [228, 58, 9, 10], [256, 90], [248, 152], [236, 128], [190, 114], [150, 120], [126, 140]], { seed: 161, part: [150, 150], centre: [180, 180] })
    return s
  },
})

scene('shag', {
  frame: 'oval',
  draw: (K) => {
    let s = mane(K, [[180, 76], [242, 82], [280, 120, 10], [290, 190, 12], [286, 262, 12], [266, 314], [240, 278], [120, 278], [94, 314, 12], [74, 262, 12], [70, 190, 10], [80, 120], [118, 82]], { seed: 171, part: [170, 80] })
    s += body(K, { w: 130, neckW: 27, tone: 0 })
    s += skin(K, { eyeY: 196, w: 52, jaw: 46, chinY: 292, chinW: 18, neckW: 27 })
    s += mane(K, [[180, 82], [236, 94], [256, 152, 10, 10], [104, 152], [124, 94]], { seed: 172, part: [170, 84] })
    return s
  },
})

scene('scarf', {
  frame: 'rect',
  draw: (K) => {
    let s = mane(K, ringPts(CX, 196, 128, 128, 118, 30, 13, 13), { seed: 181, part: [CX, 120], wave: 2 })
    s += body(K, { w: 140, neckW: 28, tone: 4 })
    s += K.shape([[140, 318], [120, 360], [150, 380], [180, 360], [210, 380], [240, 360], [220, 318]], { tone: 1, sharp: true })
    s += skin(K, { eyeY: 198, chinY: 292, neckW: 28 })
    s += mane(K, [[120, 150], [240, 150], [248, 180, 10, 11], [112, 180]], { seed: 182, part: [CX, 150] })
    const band = `M${P(108, 138)}L${P(CX, 112)}L${P(252, 138)}L${P(254, 162)}L${P(CX, 136)}L${P(106, 162)}Z`
    s += K.tone(band, 1) + pen(band, 1.3)
    s += K.shape([[250, 140], [274, 148], [304, 196], [292, 202], [262, 164]], { tone: 1, sharp: true }) + K.shape([[254, 150], [272, 166], [278, 212], [266, 212], [256, 170]], { tone: 1, sharp: true })
    return s
  },
})

scene('lion', {
  frame: 'round',
  draw: (K) => {
    let s = mane(K, [[180, 68], [238, 72, 12], [286, 102, 16], [316, 160, 18], [328, 240, 18], [318, 318], [272, 354], [244, 320], [232, 262], [128, 262], [116, 320], [88, 354, 18], [42, 318, 18], [32, 240, 18], [44, 160, 16], [74, 102, 12], [122, 72]], { seed: 191, part: [164, 74], wave: 2 })
    s += body(K, { w: 142, neckW: 29, tone: 0 })
    s += skin(K, { eyeY: 196, chinY: 294, neckW: 29 })
    s += mane(K, [[164, 90], [216, 96], [244, 128, 14, 12], [222, 150, 12, 12], [148, 160, 12, 12], [116, 132], [130, 104]], { seed: 192, part: [166, 90] })
    s += mane(K, [[128, 120], [126, 200], [132, 270, 12, 12], [112, 300, 14, 12], [100, 250, 14, 12], [104, 170, 14, 12]], { seed: 193, part: [122, 120] })
    s += mane(K, [[232, 120, 14, 12], [256, 170, 14, 12], [260, 250, 14, 12], [248, 300, 12, 12], [228, 270], [234, 200]], { seed: 194, part: [238, 120] })
    return s
  },
})

scene('mullet', {
  frame: 'oval',
  draw: (K) => {
    let s = mane(K, [[122, 150], [106, 110, 14, 13], [112, 70, 16, 13], [150, 48, 16, 13], [196, 42, 16, 13], [240, 54, 14, 13], [260, 88], [260, 150], [266, 220], [280, 300, 9, 9], [250, 312], [236, 250], [124, 250], [110, 312, 9, 9], [80, 300], [94, 220]], { col: 'green', seed: 201, part: [180, 100], centre: [180, 200] })
    s += body(K, { w: 132, neckW: 26, y0: 326, tone: 0 })
    s += skin(K, { eyeY: 198, w: 52, jaw: 44, chinY: 294, chinW: 16, neckW: 26 })
    s += mane(K, [[124, 144], [136, 106], [180, 96], [224, 106], [236, 144, 8, 9]], { col: 'green', seed: 202, part: [180, 98] })
    return s
  },
})

scene('ringlets', {
  frame: 'arch',
  draw: (K) => {
    let s = mane(K, [[180, 80], [238, 86, 8, 10], [274, 124, 9, 10], [284, 200, 9, 10], [288, 280, 9, 10], [266, 320], [238, 290], [122, 290], [94, 320, 9, 10], [72, 280, 9, 10], [76, 200, 9, 10], [86, 124, 8, 10], [122, 86]], { seed: 211, part: [CX, 86], wave: 2 })
    s += body(K, { w: 132, neckW: 26, tone: 4 })
    for (let i = 0; i < 4; i++) {
      const y = 380 - i * 16
      const w = 56 - i * 6
      const pts = []
      for (let k = 0; k <= 12; k++) pts.push([CX - w + (k / 12) * w * 2, y + (k % 2 ? 7 : -3)])
      s += K.shape([...pts, [CX + w - 6, y - 20], [CX - w + 6, y - 20]], { tone: 0, sharp: true, line: 1 })
    }
    s += skin(K, { eyeY: 198, w: 52, jaw: 44, chinY: 290, chinW: 16, neckW: 26 })
    s += mane(K, [[104, 142], [128, 94], [180, 84], [232, 94], [256, 142, 8, 9]], { seed: 213, part: [CX, 88] })
    return s
  },
})

scene('thinning', {
  frame: 'rect',
  draw: (K) => {
    let s = body(K, { w: 150, neckW: 32, tone: 2 })
    s += skin(K, { eyeY: 198, w: 60, jaw: 56, chinY: 292, chinW: 26, neckW: 32, ears: true })
    s += mane(K, [[116, 196], [110, 160], [120, 132, 5, 8], [148, 112, 5, 8], [180, 106, 5, 8], [212, 112, 5, 8], [240, 132], [250, 160], [244, 196], [236, 160], [218, 136], [180, 128], [142, 136], [124, 160]], { seed: 221, part: [CX, 110] })
    return s
  },
})

scene('braids', {
  frame: 'oval',
  draw: (K) => {
    let s = body(K, { w: 138, neckW: 28, tone: 3 })
    s += skin(K, { eyeY: 198, chinY: 290, neckW: 28 })
    s += tuft(K, [[122, 232], [150, 238], [180, 232], [210, 238], [238, 232], [242, 262, 8, 9], [214, 300, 8, 9], [180, 312, 8, 9], [146, 300, 8, 9], [118, 262]], { col: 'green', seed: 231 })
    for (const sd of [-1, 1]) {
      const x = CX + sd * 72
      const pts = [[x - 12, 170], [x + 12, 170], [x + 10, 420], [x - 10, 420]]
      s += K.tone(closedD(pts), 3, 'green') + pen(closedD(pts), 1, { stroke: GREEN })
      for (let y = 176; y < 416; y += 12) s += pen(`M${P(x - 10, y)}L${P(x, y + 9)}L${P(x + 10, y)}`, 1.2, { stroke: PAPER })
    }
    s += mane(K, [[114, 170], [116, 140], [180, 124], [244, 140], [246, 170], [226, 160], [134, 160]], { col: 'green', seed: 234, part: [CX, 128] })
    const band = `M${P(108, 142)}L${P(CX, 104)}L${P(252, 142)}L${P(252, 160)}L${P(CX, 134)}L${P(108, 160)}Z`
    s += K.tone(band, 4) + pen(band, 1.3)
    return s
  },
})

scene('bouffant', {
  frame: 'arch',
  draw: (K) => {
    let s = mane(K, ringPts(CX, 178, 132, 150, 150, 32, 8, 11), { col: 'green', seed: 241, part: [CX, 80], bulge: 0.25 })
    s += body(K, { w: 130, neckW: 26, tone: 1 })
    s += skin(K, { eyeY: 208, w: 52, jaw: 44, chinY: 298, chinW: 16, neckW: 26, top: 130 })
    s += mane(K, [[CX, 110], [238, 124], [254, 172, 8, 10], [106, 172], [122, 124]], { col: 'green', seed: 243, part: [CX, 112] })
    return s
  },
})

scene('fedora', {
  frame: 'oval',
  draw: (K) => {
    let s = mane(K, [[120, 150], [138, 150], [136, 220], [138, 300], [118, 318, 9, 8], [100, 280, 9, 10], [106, 200, 9, 10]], { seed: 71, part: [128, 150] })
    s += mane(K, [[222, 150], [240, 150], [254, 200, 9, 10], [260, 280, 9, 10], [242, 318, 9, 8], [222, 300], [224, 220]], { seed: 72, part: [232, 150] })
    s += body(K, { w: 138, neckW: 26, tone: 4 })
    s += K.shape([[156, 318], [168, 380], [180, 400], [192, 380], [204, 318]], { tone: 0, sharp: true })
    s += skin(K, { eyeY: 198, w: 50, jaw: 42, chinY: 290, chinW: 14, neckW: 26 })
    s += hat(K, 'fedora', { y: 142, tilt: -9, band: 12, bandTone: 0 })
    return s
  },
})

/* ══ DRAWING A SCENE ═══════════════════════════════════════════════════ */

/**
 * The scene as it hangs: its engraved ground (the green lines and a pale glow)
 * and its drawing, as one <g> in ctx.defs. Everything else — a hole, a piece
 * in the air, the frame — is a <use> of this. Returns the id.
 */
export function sceneBase(ctx, id) {
  const gid = `${ctx.uid}-sc${ctx.lod ? 'l' : ''}-${id}`
  if (!ctx.defs.has(gid)) {
    const spec = SCENES[id]
    if (!spec) throw new Error(`portraits: no scene ${id}`)
    const K = makeKit(ctx, ctx.lod ? `${id}-l` : id)
    const u = ctx.uid
    const ground = spec.ground === false ? '' : `<rect x="-2" y="-2" width="${PW + 4}" height="${PH + 4}" fill="${PAPER}"/><rect x="-2" y="-2" width="${PW + 4}" height="${PH + 4}" fill="url(#${u}-g0)"/><ellipse cx="${CX}" cy="200" rx="200" ry="240" fill="url(#${u}-glow)"/>`
    ctx.defs.set(gid, `<g id="${gid}">${ground}${spec.draw(K)}</g>`)
  }
  return gid
}

/*
 * A scene with no pieces of its own is given three: a chunk off the top, one
 * off a side and one off the bottom, placed by its id so the same scene always
 * tears the same way.
 */
const AUTO = new Map()
export function piecesOf(id) {
  const spec = SCENES[id]
  if (spec.pieces && Object.keys(spec.pieces).length) return spec.pieces
  if (!AUTO.has(id)) {
    const h = (k) => hash(id.length * 31 + id.charCodeAt(0), k, 77)
    const box = (x, y, w, hh) => [[x, y], [x + w, y + (h(9) - 0.5) * 20], [x + w + (h(10) - 0.5) * 20, y + hh], [x, y + hh + (h(11) - 0.5) * 20]]
    AUTO.set(id, {
      a: box(100 + h(1) * 90, 40 + h(2) * 50, 90 + h(3) * 40, 80 + h(4) * 30),
      b: box(h(5) < 0.5 ? 30 : 230, 170 + h(6) * 60, 100, 110),
      c: box(110 + h(7) * 60, 340 + h(8) * 30, 130, 90),
    })
  }
  return AUTO.get(id)
}

const TEARS = new Map()
/** The torn outline of one piece, cut once and kept, so it tears the same way every frame. */
export function tearPts(id, piece) {
  const key = `${id}/${piece}`
  if (!TEARS.has(key)) {
    let seed = 0
    for (const ch of key) seed = (seed * 31 + ch.charCodeAt(0)) | 0
    TEARS.set(key, tear(piecesOf(id)[piece], seed, 3.6, 7))
  }
  return TEARS.get(key)
}
export function pieceCentre(id, piece) {
  const pts = piecesOf(id)[piece]
  return [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length]
}
/*
 * Each torn outline is one <path> in the defs, and everything that needs it —
 * the clip, the shadow, the fibre, the red edge, the hole — is a <use> of it.
 * A wide shot of the wall has a hundred holes in it; written out six times
 * each, they were most of a megabyte a frame.
 */
function piecePath(ctx, id, piece) {
  const pid = `${ctx.uid}-tp-${id}-${piece}`
  if (!ctx.defs.has(pid)) ctx.defs.set(pid, `<path id="${pid}" d="M${tearPts(id, piece).map(([x, y]) => `${Math.round(x)} ${Math.round(y)}`).join('L')}Z"/>`)
  return pid
}
function pieceClip(ctx, id, piece) {
  const cid = `${ctx.uid}-pc-${id}-${piece}`
  if (!ctx.defs.has(cid)) ctx.defs.set(cid, `<clipPath id="${cid}"><use href="#${piecePath(ctx, id, piece)}"/></clipPath>`)
  return cid
}
const useOf = (pid, attrs) => `<use href="#${pid}" ${attrs}/>`
const edgesOf = (pid, core = 4.2, red = 1.5) => useOf(pid, `fill="none" stroke="${PAPER}" stroke-width="${core}" stroke-linejoin="round" opacity="0.95"`) + useOf(pid, `fill="none" stroke="${RED}" stroke-width="${red}" stroke-linejoin="round"`)

/**
 * A torn piece of scene `id`, its centre at (x, y), turned `rot` degrees, at
 * scale `s`: the scene clipped to the tear, a shadow under it, and the tear's
 * white fibre and red edge round it.
 */
export function pieceSvg(ctx, id, piece, x, y, rot = 0, s = 1, o = {}) {
  // A small piece can be cut from the plainer drawing (o.lod), as a wide shot is.
  const lod = ctx.lod
  if (o.lod) ctx.lod = true
  const base = sceneBase(ctx, id)
  ctx.lod = lod
  const cid = pieceClip(ctx, id, piece)
  const pid = piecePath(ctx, id, piece)
  const [px, py] = pieceCentre(id, piece)
  const shadow = o.shadow ?? 0.25
  const lift = o.lift ?? 4
  return `<g transform="translate(${r(x)} ${r(y)}) rotate(${r(rot, 2)}) scale(${r(s, 3)}) translate(${r(-px)} ${r(-py)})"${op(o.opacity ?? 1)}>` +
    (shadow ? useOf(pid, `fill="${INK}" opacity="${r(shadow, 3)}" transform="translate(${r(lift * 0.7)} ${r(lift)})"`) : '') +
    `<g clip-path="url(#${cid})"><use href="#${base}"/></g>` + edgesOf(pid) + '</g>'
}

/**
 * Where a piece has gone: the dark behind the picture, showing through a torn
 * hole with a red edge. Drawn once per piece; `k` fades it in over the moment
 * of tearing.
 */
export function holeSvg(ctx, id, piece, k = 1, transform = '') {
  const hid = `${ctx.uid}-ho-${id}-${piece}`
  if (!ctx.defs.has(hid)) {
    const pid = piecePath(ctx, id, piece)
    const u = ctx.uid
    ctx.defs.set(hid, `<g id="${hid}">${useOf(pid, `fill="${PAPER}"`)}${useOf(pid, `fill="${INK}" opacity="0.5"`)}${useOf(pid, `fill="url(#${u}-k3)"`)}${useOf(pid, `fill="url(#${u}-k4)"`)}${edgesOf(pid, 2.6, 1.4)}</g>`)
  }
  return `<use href="#${hid}"${op(k)}${transform ? ` transform="${transform}"` : ''}/>`
}

/** The tear running round a piece before it lifts: its red edge drawn on, `k` of it. */
export function crackSvg(id, piece, k) {
  if (k <= 0) return ''
  const d = closedD(tearPts(id, piece))
  return pen(d, 1.6, { stroke: RED, extra: ` pathLength="1" stroke-dasharray="${r(clamp01(k), 3)} 1"` })
}

/** The whole scene as the wall shows it, with the named pieces torn out. */
export function sceneSvg(ctx, id, torn = []) {
  let s = `<use href="#${sceneBase(ctx, id)}"/>`
  for (const piece of torn) s += holeSvg(ctx, id, piece)
  return s
}

/* ══ FRAMES ════════════════════════════════════════════════════════════
 *
 * The opening a portrait is seen through, and the moulding round it.
 */
export function openingD(kind) {
  if (kind === 'oval') return ellipse(CX, PH / 2, PW / 2 - 6, PH / 2 - 6)
  if (kind === 'round') return circ(CX, PH / 2 - 10, PW / 2 - 4)
  if (kind === 'arch') return `M6 ${PH - 6}L6 ${PW / 2}A${PW / 2 - 6} ${PW / 2 - 6} 0 0 1 ${PW - 6} ${PW / 2}L${PW - 6} ${PH - 6}Z`
  return `M6 6H${PW - 6}V${PH - 6}H6Z`
}

/** The frame's moulding, drawn round the opening: bands of line in ink and green. */
export function mouldingSvg(ctx, kind) {
  const u = ctx.uid
  const bands = [
    { w: 34, tone: 'g', lvl: 1 },
    { w: 20, tone: 'k', lvl: 2 },
    { w: 8, tone: 'p', lvl: 0 },
  ]
  let s = ''
  const outline = (grow) => {
    if (kind === 'oval') return ellipse(CX, PH / 2, PW / 2 - 6 + grow, PH / 2 - 6 + grow)
    if (kind === 'round') return circ(CX, PH / 2 - 10, PW / 2 - 4 + grow)
    if (kind === 'arch') {
      const R = PW / 2 - 6 + grow
      return `M${6 - grow} ${PH - 6 + grow}L${6 - grow} ${PW / 2}A${R} ${R} 0 0 1 ${PW - 6 + grow} ${PW / 2}L${PW - 6 + grow} ${PH - 6 + grow}Z`
    }
    return `M${6 - grow} ${6 - grow}H${PW - 6 + grow}V${PH - 6 + grow}H${6 - grow}Z`
  }
  // Outermost first; each band is the outline at its width, filled, the next inside it.
  let grow = 44
  s += fillD(outline(grow), PAPER) + pen(outline(grow), 1.4)
  for (const b of bands) {
    const d = outline(grow)
    s += b.tone === 'g' ? fillD(d, `url(#${u}-g1)`) + fillD(d, `url(#${u}-g2)`) : b.tone === 'k' ? fillD(d, PAPER) + fillD(d, `url(#${u}-k3)`) + fillD(d, `url(#${u}-k4)`) : fillD(d, PAPER)
    s += pen(d, 1.1)
    grow -= b.w / 2 + 2
  }
  // Beads round the inner lip.
  s += pen(outline(3), 3.2, { extra: ' stroke-dasharray="0.1 7"' }) + pen(outline(0), 1.4)
  return s
}

/* ══ THE LAST PORTRAIT ═════════════════════════════════════════════════
 *
 * Built from nothing but pieces torn from the others: a musician who could be
 * anybody, as a list of shapes whose union is the silhouette. The film fills it
 * with patches (galleryFrame's collage).
 */

export const FINALES = {
  musician: {
    shapes: [
      // Messy hair and the head.
      Array.from({ length: 36 }, (_, i) => {
        const a = (i / 36) * Math.PI * 2
        const k = 1 + (i % 2 ? 0.1 : -0.02) + 0.05 * Math.sin(i * 1.7)
        return [CX + Math.cos(a) * 92 * k, 170 + Math.sin(a) * 104 * k]
      }),
      [[CX - 30, 250], [CX - 30, 340], [CX + 30, 340], [CX + 30, 250]],
      shoulders({ w: 140, neckW: 28 }),
      // A guitar neck and headstock rising at the right.
      [[276, 470], [312, 150], [330, 150], [300, 470]],
      [[306, 150], [300, 90], [320, 60], [344, 70], [340, 150]],
    ],
    lines: (K) => pen(`M${P(300, 420)}L${P(322, 160)}`, 1, { opacity: 0.6 }),
  },
}
