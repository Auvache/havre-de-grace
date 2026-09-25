/*
 * Torn paper — the tear under Conman's wall of sections
 * (shared/video/films/conman-wall.mjs).
 *
 * Every study is the same machine with a different sheet in it: a wall of one
 * rectangle repeated edge to edge (a picture, a banknote, a stamp, a flyer, a
 * poster), a camera drifting along it, and on the words pieces torn out of the
 * rectangles. What this file owns is the tear, because that is the thing the
 * person watching asked to change ("the way things break off is weird — I want
 * it to look like tearing paper"). What made the gallery's tears read as
 * something else was that they were holes: a dark blob with a red outline
 * appearing in the middle of a picture. Paper does not tear like that. So here:
 *
 *   - A tear always starts at an edge. A piece is bounded by the sheet's own
 *     edge and one torn line across it, never cut out of the middle.
 *   - The torn line is ragged at every scale: midpoint displacement for the
 *     wander, a fine jitter on top for the fibre.
 *   - The paper left behind shows its core. The printed surface tears short of
 *     the paper under it, so every torn edge has a band of bare paper, wider
 *     here and thinner there — the one detail that says "paper" at a glance.
 *   - The piece peels. It lifts from the torn line, folds back over itself
 *     showing its unprinted back, tears free and tumbles down the frame,
 *     turning over as it goes. Nothing pops.
 *
 * A tear is a pure function of time since its word, like everything else in
 * shared/video/. Which sheet tears on which word is the film's business.
 *
 * Plain .mjs, pure, no DOM, no randomness — the album's contract.
 */
import { r, clamp01, easeOut, easeInOut, ramp, lerp } from './kit.mjs'
import { PAPER, INK } from './album.mjs'
import { hash } from './portraits.mjs'

/** The back of a sheet: the paper a shade down, unprinted. */
export const BACK = '#ddd2bb'
/** The paper's core where a tear has taken the surface off — a shade up from the stock. */
export const CORE = '#f6f0e2'

const P2 = (x, y) => `${Math.round(x * 10) / 10} ${Math.round(y * 10) / 10}`
export const polyPath = (pts) => 'M' + pts.map(([x, y]) => P2(x, y)).join('L') + 'Z'
const smooth = (x) => x * x * (3 - 2 * x)
const seedOf = (s) => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) | 0; return h }

/* ══ THE TORN LINE ═════════════════════════════════════════════════════ */

/**
 * A ragged line from `a` to `b`: midpoint displacement (each level half the
 * last, so it wanders at every scale) and then a fine jitter along the normal
 * for the fibre. `rough` is the wander as a share of the line's length.
 */
export function tornLine(a, b, seed, { rough = 0.09, fine = 1.1, step = 4 } = {}) {
  let pts = [a, b]
  const len = Math.hypot(b[0] - a[0], b[1] - a[1])
  let amp = len * rough
  let level = 0
  while (len / (pts.length - 1) > step) {
    const next = [pts[0]]
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i]
      const q = pts[i + 1]
      const dx = q[0] - p[0]
      const dy = q[1] - p[1]
      const l = Math.hypot(dx, dy) || 1
      const k = (hash(i, level, seed) - 0.5) * 2 * amp
      next.push([(p[0] + q[0]) / 2 - (dy / l) * k, (p[1] + q[1]) / 2 + (dx / l) * k], q)
    }
    pts = next
    amp *= 0.52
    level++
  }
  // The fibre: every point but the two ends pushed a hair along the normal.
  const n = pts.length
  return pts.map((p, i) => {
    if (i === 0 || i === n - 1) return p
    const a2 = pts[i - 1]
    const b2 = pts[i + 1]
    const nx = -(b2[1] - a2[1])
    const ny = b2[0] - a2[0]
    const l = Math.hypot(nx, ny) || 1
    const k = (hash(i, 91, seed) - 0.5) * 2 * fine
    return [p[0] + (nx / l) * k, p[1] + (ny / l) * k]
  })
}

/**
 * The same line moved `w` along its normal towards `toward`, where w wanders
 * between `lo` and `hi` — the edge of the paper's core, inside the piece that
 * is torn away. The ends stay put: they are on the sheet's edge.
 */
export function coreLine(pts, toward, seed, lo = 2, hi = 8) {
  const n = pts.length
  return pts.map((p, i) => {
    if (i === 0 || i === n - 1) return p
    const a = pts[Math.max(0, i - 2)]
    const b = pts[Math.min(n - 1, i + 2)]
    let nx = -(b[1] - a[1])
    let ny = b[0] - a[0]
    const l = Math.hypot(nx, ny) || 1
    nx /= l
    ny /= l
    if ((toward[0] - p[0]) * nx + (toward[1] - p[1]) * ny < 0) { nx = -nx; ny = -ny }
    // Slow wander plus a fleck: the band is never an even stripe.
    const u = i / n
    const slow = 0.5 + 0.5 * Math.sin(u * 9.3 + seed * 0.37) * Math.sin(u * 3.1 + seed)
    const w = lerp(lo, hi, clamp01(slow * 0.85 + hash(i, 5, seed) * 0.3))
    // Taper to nothing at the sheet's edge.
    const taper = smooth(clamp01(Math.min(i, n - 1 - i) / 4))
    return [p[0] + nx * w * taper, p[1] + ny * w * taper]
  })
}

/* ══ A PIECE ═══════════════════════════════════════════════════════════
 *
 * A piece is a stretch of the sheet's perimeter and one torn line closing it.
 * The perimeter of a w × h sheet is walked clockwise from its top-left corner:
 * s runs 0 → w along the top, w → w + h down the right, and so on round. The
 * piece is the perimeter from `from` to `to` (forward) and the torn line back.
 */
function perimeterAt(w, h, s) {
  const L = 2 * (w + h)
  s = ((s % L) + L) % L
  if (s <= w) return [s, 0]
  if (s <= w + h) return [w, s - w]
  if (s <= 2 * w + h) return [w - (s - w - h), h]
  return [0, h - (s - 2 * w - h)]
}
function perimeterWalk(w, h, from, to) {
  const L = 2 * (w + h)
  let end = to
  while (end <= from) end += L
  const corners = [0, w, w + h, 2 * w + h, L, L + w, L + w + h, L + 2 * w + h]
  const out = [perimeterAt(w, h, from)]
  for (const c of corners) if (c > from && c < end) out.push(perimeterAt(w, h, c))
  out.push(perimeterAt(w, h, end))
  return out
}

/**
 * A piece of a w × h sheet: the perimeter from `from` to `to` and a torn line
 * back, optionally bent through `via` (sheet points) so a strip can run down
 * the sheet and back up. `hinge` is where it peels from; by default the chord
 * of the torn line. Returns the region, the core's edge and the hinge.
 */
export function piece(w, h, from, to, seed, o = {}) {
  const edge = perimeterWalk(w, h, from, to)
  const A = edge[edge.length - 1]
  const B = edge[0]
  const knots = [A, ...(o.via ?? []), B]
  let line = []
  for (let i = 0; i < knots.length - 1; i++) {
    const seg = tornLine(knots[i], knots[i + 1], seed + i * 17, o)
    line = line.concat(i ? seg.slice(1) : seg)
  }
  const cx = edge.reduce((s, p) => s + p[0], 0) / edge.length * 0.5 + line.reduce((s, p) => s + p[0], 0) / line.length * 0.5
  const cy = edge.reduce((s, p) => s + p[1], 0) / edge.length * 0.5 + line.reduce((s, p) => s + p[1], 0) / line.length * 0.5
  const core = coreLine(line, [cx, cy], seed, o.coreLo ?? 2.2, o.coreHi ?? 8.5)
  const region = [...edge.slice(0, -1), ...line.slice(0, -1)]
  const coreRegion = [...edge.slice(0, -1), ...core.slice(0, -1)]
  const hinge = o.hinge ?? [A, B]
  return { region, coreRegion, line, hinge, centre: [cx, cy], style: o.style ?? 'peel', seed, size: o.size ?? 1 }
}

/**
 * A whole sheet coming away (a stamp off its sheet): the region is the sheet,
 * there is no core — it parts along its perforations — and it peels from `side`.
 */
export function wholeSheet(w, h, seed, side = 'top', style = 'peel') {
  const region = [[0, 0], [w, 0], [w, h], [0, h]]
  const hinge = side === 'top' ? [[0, 0], [w, 0]] : side === 'left' ? [[0, h], [0, 0]] : side === 'right' ? [[w, 0], [w, h]] : [[w, h], [0, h]]
  return { region, coreRegion: region, line: [], hinge, centre: [w / 2, h / 2], style, seed, whole: true, size: 4 }
}

/* ══ THE PEEL ══════════════════════════════════════════════════════════
 *
 * A flap folding over its hinge, seen straight on, is the flap squashed
 * towards the hinge by cos θ: a point's distance from the hinge line is
 * multiplied by c = cos θ, and past 90° it lies over the sheet showing its
 * back. That is one affine matrix, so the whole flap — the print clipped to the
 * piece — is one <g transform>. Once it has come right over it tears free at
 * the hinge and falls, still turning, so it keeps flipping front to back as it
 * goes down: paper tumbling.
 */
export const PEEL = 0.42
const FALL = 1.9
export const TEAR_LIFE = PEEL + FALL

export function foldMatrix(p0, p1, c) {
  let ux = p1[0] - p0[0]
  let uy = p1[1] - p0[1]
  const l = Math.hypot(ux, uy) || 1
  ux /= l
  uy /= l
  const nx = -uy
  const ny = ux
  const k = c - 1
  const a = 1 + k * nx * nx
  const b = k * nx * ny
  const d = 1 + k * ny * ny
  const np0 = nx * p0[0] + ny * p0[1]
  return [a, b, b, d, -k * nx * np0, -k * ny * np0]
}
export const mul = (A, B) => [
  A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1],
  A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3],
  A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5],
]
export const rotAbout = (deg, cx, cy) => {
  const a = (deg * Math.PI) / 180
  const c = Math.cos(a)
  const s = Math.sin(a)
  return [c, s, -s, c, cx - c * cx + s * cy, cy - s * cx - c * cy]
}
export const matStr = (m) => `matrix(${m.map((v, i) => r(v, i < 4 ? 4 : 1)).join(' ')})`

/**
 * Where a piece is `tau` seconds after its word: null before it and once it
 * has gone, otherwise { m (its matrix in sheet units), front (which face is
 * up), shade, alpha }. `fallTo` is how far below it has to fall to leave the
 * frame, in sheet units.
 */
export function flapAt(pc, tau, fallTo = 1400) {
  if (tau < 0 || tau > TEAR_LIFE) return null
  const [p0, p1] = pc.hinge
  const h = hash(pc.seed, 7, 3)
  if (pc.style === 'pull') {
    // A tab: tugged a little away from the tear, then let go.
    const pull = easeOut(ramp(tau, 0, 0.16)) * 16
    const fall = Math.max(0, tau - 0.12)
    const m = mul([1, 0, 0, 1, (h - 0.5) * 60 * fall, pull + 0.5 * 1300 * fall * fall], rotAbout((h - 0.5) * 160 * fall, pc.centre[0], pc.centre[1]))
    const c = Math.cos(fall * (5 + h * 4))
    return { m: mul(m, foldMatrix([pc.centre[0] - 10, pc.centre[1]], [pc.centre[0] + 10, pc.centre[1]], c)), front: c > 0, shade: 1 - Math.abs(c), alpha: 1 - ramp(tau, TEAR_LIFE - 0.3, TEAR_LIFE) }
  }
  // Peel: 0 → about 165°, fast off the word and settling as it comes over.
  const u = ramp(tau, 0, PEEL)
  const reach = pc.whole ? 0.72 : 0.92
  let theta = Math.PI * reach * easeOut(u)
  let m
  if (tau <= PEEL) m = foldMatrix(p0, p1, Math.cos(theta))
  else {
    const f = tau - PEEL
    // Free: it keeps turning over its hinge line and drops away under gravity, drifting off to one side.
    theta = Math.PI * reach + f * (3.2 + h * 2.2)
    const fold = foldMatrix(p0, p1, Math.cos(theta))
    const side = h < 0.5 ? -1 : 1
    const dx = side * (40 + 160 * h) * f + Math.sin(f * 3.4 + h * 6) * 26
    const dy = -30 * Math.min(f, 0.25) * 4 + 0.5 * 1500 * f * f
    const spin = side * (25 + 70 * h) * f
    const [cx, cy] = pc.centre
    m = mul([1, 0, 0, 1, dx, dy], mul(rotAbout(spin, cx, cy), fold))
    if (dy > fallTo) return null
  }
  const c = Math.cos(theta)
  return { m, front: c > 0, shade: 1 - Math.abs(c), alpha: 1 - ramp(tau, TEAR_LIFE - 0.25, TEAR_LIFE) }
}

/* ══ A SHEET, TORN ═════════════════════════════════════════════════════
 *
 * What is drawn for one cell at one moment, in the sheet's own units:
 *
 *   under   whatever is behind the sheet — the backing, or an older sheet
 *   core    the paper's core, clipped to the sheet less every torn piece's
 *           core region: this is the pale band along every torn edge
 *   print   the print, clipped to the sheet less every torn piece
 *
 * and, separately (so it can pass over the neighbours), each piece that is
 * still in the air. The clips are keyed by layout and by which pieces are
 * out, so a grid of a hundred sheets that tore alike shares a handful.
 */
function sheetClip(ctx, key, w, h, regions) {
  const id = `${ctx.uid}-${key}`
  if (!ctx.defs.has(id)) {
    const d = `M0 0H${w}V${h}H0Z` + regions.map(polyPath).join('')
    ctx.defs.set(id, `<clipPath id="${id}"><path d="${d}" clip-rule="evenodd"/></clipPath>`)
  }
  return `url(#${id})`
}
function regionClip(ctx, key, pts) {
  const id = `${ctx.uid}-${key}`
  if (!ctx.defs.has(id)) ctx.defs.set(id, `<clipPath id="${id}"><path d="${polyPath(pts)}"/></clipPath>`)
  return `url(#${id})`
}
function regionPath(ctx, key, pts) {
  const id = `${ctx.uid}-${key}`
  if (!ctx.defs.has(id)) ctx.defs.set(id, `<path id="${id}" d="${polyPath(pts)}"/>`)
  return id
}

/**
 * One cell: `layout` its pieces, `out` the indices already begun (with their
 * tau), `print` / `under` markup in sheet units. Returns { body, flaps, sheet },
 * all in sheet units; the caller places them. `sheet` is the print as it stands,
 * holes and all, for a caller that flies the whole sheet itself (`own`).
 */
export function tornSheet(ctx, { w, h, layoutKey, layout, out, print, under, core = CORE, back = BACK, fallTo }) {
  const began = out.filter((o) => o.tau >= 0)
  const gone = began.filter((o) => !layout[o.i].whole).map((o) => o.i).sort((a, b) => a - b)
  const whole = began.some((o) => layout[o.i].whole)
  // Everything a sheet draws stays inside it: an older sheet under it, a snipe across its corner.
  const cell = regionClip(ctx, `cr-${w}x${h}`, [[0, 0], [w, 0], [w, h], [0, h]])
  // The sheet as it stands: the print less every piece gone, the core showing along each rip.
  let sheet
  if (!gone.length) sheet = `<g clip-path="${cell}">${print}</g>`
  else {
    const mask = gone.join('.')
    const printClip = sheetClip(ctx, `tp-${layoutKey}-${mask}`, w, h, gone.map((i) => layout[i].region))
    // `core: null` leaves the pale band out, for a sheet seen from so far off it would be under a pixel.
    const coreRect = core ? `<rect width="${w}" height="${h}" fill="${core}" clip-path="${sheetClip(ctx, `tk-${layoutKey}-${mask}`, w, h, gone.map((i) => layout[i].coreRegion))}"/>` : ''
    sheet = `${coreRect}<g clip-path="${printClip}">${print}</g>`
  }
  let body
  if (whole) body = `<g clip-path="${cell}">${under}</g>`
  else if (!gone.length) body = sheet
  else body = `<g clip-path="${cell}">${under}</g>${sheet}`
  let flaps = ''
  for (const o of out) {
    // A piece whose flight the caller draws itself (Conman's break: onto the pile).
    if (o.own) continue
    const pc = layout[o.i]
    const f = flapAt(pc, o.tau, fallTo)
    if (!f || f.alpha <= 0.01) continue
    const pid = regionPath(ctx, `tr-${layoutKey}-${o.i}`, pc.region)
    // A whole sheet comes away with whatever holes it already had.
    const front = pc.whole ? sheet : `<g clip-path="${regionClip(ctx, `tc-${layoutKey}-${o.i}`, pc.region)}">${print}</g>`
    const face = f.front ? front : `<use href="#${pid}" fill="${back}"/>`
    // Turning edge-on it darkens: the light goes across it.
    const dim = f.shade > 0.02 ? `<use href="#${pid}" fill="${INK}" opacity="${r(0.28 * f.shade, 3)}"/>` : ''
    const edge = `<use href="#${pid}" fill="none" stroke="${INK}" stroke-width="0.8" opacity="0.35"/>`
    const shadow = `<use href="#${pid}" fill="${INK}" opacity="0.22" transform="${matStr(mul([1, 0, 0, 1, 6, 10], f.m))}"/>`
    flaps += `<g${f.alpha < 0.999 ? ` opacity="${r(f.alpha, 3)}"` : ''}>${shadow}<g transform="${matStr(f.m)}">${face}${dim}${edge}</g></g>`
  }
  return { body, flaps, sheet }
}

/** Flecks off a fresh tear: a few crumbs of paper along the line, falling. */
export function flecks(pc, tau, k = 6) {
  if (tau < 0 || tau > 1.3 || !pc.line.length) return ''
  let s = ''
  const n = pc.line.length
  for (let j = 0; j < k; j++) {
    const h = (q) => hash(pc.seed + j * 13, q, 29)
    const [x0, y0] = pc.line[Math.floor(h(1) * (n - 1))]
    const x = x0 + (h(2) - 0.5) * 160 * tau
    const y = y0 - (60 + h(3) * 120) * tau + 700 * tau * tau
    const sz = 2 + h(4) * 4
    const a = h(5) * 6.28 + tau * (6 + h(6) * 8)
    const pts = [0, 2.3, 4.1].map((b) => [x + Math.cos(a + b) * sz, y + Math.sin(a + b) * sz * 0.6])
    s += `<path d="${polyPath(pts)}" fill="${CORE}" stroke="${INK}" stroke-width="0.5" opacity="${r(1 - smooth(ramp(tau, 0.8, 1.3)), 3)}"/>`
  }
  return s
}

void PAPER
void easeInOut
