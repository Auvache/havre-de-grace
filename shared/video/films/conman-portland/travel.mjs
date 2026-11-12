/*
 * Conman on the Portland map — getting about (2026-11-10): the machinery
 * for everything that moves between the heists. Geometry and drawing only;
 * who goes where and when is story.mjs.
 *
 * A route is a list of legs. A leg is a polyline covered between two times
 * at an even speed, easing away from its start and into its stop (the user,
 * 2026-11-10: "they should speed up/slow down naturally and not seem too
 * rushed when arriving"). Between legs whoever it is stands where the last
 * leg ended.
 *
 * A point is [x, y, flag?] in film metres. Flags on the step INTO a point:
 *   'jump'  drawn thin and dotted (a tunnel, a fly tower, over the seats)
 *   'in'    inside a heist's own building, by its doors (the checker lets
 *           these through; everything else must be street, park or bridge)
 */
import { INK, PAPER, RED } from '../../album.mjs'
import { DASH } from '../conman-heists/styles.mjs'
import { r } from './atlas.mjs'

const clamp01 = (v) => Math.max(0, Math.min(1, v))
const lerp = (a, b, u) => a + (b - a) * u

/* ── Polylines by distance ───────────────────────────────────────────── */

export function line(pts) {
  const cum = [0]
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  const L = cum.at(-1)
  /** The segment d falls in: the index of its end point. */
  const seg = (d) => {
    let lo = 1
    let hi = pts.length - 1
    while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] < d) lo = mid + 1; else hi = mid }
    return lo
  }
  const at = (d) => {
    if (pts.length === 1 || d <= 0) return [pts[0][0], pts[0][1]]
    if (d >= L) return [pts.at(-1)[0], pts.at(-1)[1]]
    const i = seg(d)
    const u = (d - cum[i - 1]) / (cum[i] - cum[i - 1] || 1)
    return [lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]
  }
  /** Everything from distance d0 to d1, the cut ends included. */
  const part = (d0, d1) => {
    if (pts.length === 1) return [[pts[0][0], pts[0][1]]]
    const [a, b] = [Math.max(0, d0), Math.min(L, d1)]
    if (b <= a) return [at(a)]
    const [i, j] = [seg(a), seg(b)]
    const out = [at(a)]
    for (let k = i; k < j; k++) out.push(pts[k])
    out.push([...at(b), ...(pts[j][2] ? [pts[j][2]] : [])])
    return out
  }
  /** The heading (degrees) of the segment at d. */
  const dir = (d) => {
    if (pts.length === 1) return 0
    const i = seg(Math.max(0.001, Math.min(L, d)))
    return (Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]) * 180) / Math.PI
  }
  return { pts, cum, L, at, part, dir }
}

/* ── Legs and routes ─────────────────────────────────────────────────── */

/**
 * A polyline covered from t0 to t1: `a` seconds getting up to speed, `b`
 * seconds coming to a stop, an even speed between.
 */
export function leg(pts, t0, t1, a = 0.7, b = 1.0) {
  const T = Math.max(0.01, t1 - t0)
  const k = a + b > T * 0.9 ? (T * 0.9) / (a + b) : 1
  const [ea, eb] = [a * k, b * k]
  const vmax = 1 / (T - ea / 2 - eb / 2)
  const frac = (t) => {
    const x = Math.max(0, Math.min(T, t - t0))
    if (x < ea) return (vmax * x * x) / (2 * ea)
    if (x <= T - eb) return vmax * (x - ea / 2)
    return 1 - (vmax * (T - x) ** 2) / (2 * eb)
  }
  const ln = line(pts)
  return { ln, t0, t1, dist: (t) => ln.L * frac(t) }
}
/** A leg whose distance is any function of time (for a speed that follows the camera). */
export const paced = (pts, t0, t1, dist) => {
  const ln = line(pts)
  return { ln, t0, t1, dist: (t) => Math.max(0, Math.min(ln.L, dist(t))) }
}

export function route(...legs) {
  const from = legs[0].t0
  const to = legs.at(-1).t1
  const legAt = (t) => legs.findLast((l) => l.t0 <= t) ?? legs[0]
  const at = (t) => { const l = legAt(t); return l.ln.at(l.dist(Math.min(t, l.t1))) }
  /** Degrees. Standing still, the way it last went. */
  const dir = (t) => { const l = legAt(t); return l.ln.dir(l.dist(Math.min(Math.max(t, l.t0 + 0.02), l.t1))) }
  /** Everything covered by t, the head last; null before it starts. */
  const walked = (t) => {
    if (t < from) return null
    const out = []
    for (const l of legs) {
      if (l.t0 > t) break
      const pts = l.ln.part(0, l.dist(Math.min(t, l.t1)))
      if (out.length && Math.hypot(out.at(-1)[0] - pts[0][0], out.at(-1)[1] - pts[0][1]) < 0.01) out.push(...pts.slice(1))
      else out.push(...pts)
    }
    return out
  }
  /** Metres a second, measured. */
  const speed = (t) => { const [p, q] = [at(t - 0.05), at(t + 0.05)]; return Math.hypot(q[0] - p[0], q[1] - p[1]) / 0.1 }
  return { legs, from, to, at, dir, walked, speed }
}

/**
 * Someone behind someone else on the same line: `lag(t)` metres back, from
 * where he joins it (d0) to where he gives up (d1), coming to the join along
 * `lead` (his own way there, which ends at the line's point d0).
 */
export function behind(leader, { lag, d0 = 0, d1 = Infinity, lead = [] }) {
  const l = leader.legs[0]
  const end = Math.min(d1, l.ln.L)
  const own = line([...lead, ...l.ln.part(d0, end).slice(lead.length ? 1 : 0)])
  const leadL = lead.length ? line(lead).L : 0
  const lagOf = typeof lag === 'function' ? lag : () => lag
  const dist = (t) => leadL + (l.dist(Math.min(Math.max(t, l.t0), l.t1)) - lagOf(t) - d0)
  // He is on the scene from the moment his distance turns positive.
  let t0 = l.t0
  while (t0 < l.t1 && dist(t0) < 0) t0 += 0.02
  let t1 = t0
  while (t1 < l.t1 && dist(t1) < own.L) t1 += 0.02
  return route({ ln: own, t0, t1: Math.max(t1, t0 + 0.02), dist: (t) => Math.max(0, Math.min(own.L, dist(t))) })
}

/* ── Drawing ─────────────────────────────────────────────────────────── */

/**
 * A red trail. Its dashes are fixed to the ground (as long, in metres, as
 * they are in pixels at `sRef` pixels a metre), so they do not creep along
 * the line while the camera pulls in or out.
 */
export function trail(c, pts, style = 'solid', sRef = 1, op = 1) {
  if (!pts || pts.length < 2) return ''
  let solid = ''
  let through = ''
  let pen = null
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = [r(c.X(pts[i - 1][0])), r(c.Y(pts[i - 1][1]))]
    const [x1, y1] = [r(c.X(pts[i][0])), r(c.Y(pts[i][1]))]
    if (pts[i][2] === 'jump') { through += `M${x0} ${y0}L${x1} ${y1}`; pen = null; continue }
    solid += pen === i - 1 ? `L${x1} ${y1}` : `M${x0} ${y0}L${x1} ${y1}`
    pen = i
  }
  const k = c.s / sRef
  const dash = DASH[style] ? ` stroke-dasharray="${DASH[style].split(' ').map((v) => r(Math.max(1.2, v * k), 2)).join(' ')}"` : ''
  const o = op < 1 ? ` opacity="${r(op, 3)}"` : ''
  return (solid ? `<path d="${solid}" stroke="${RED}" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" fill="none"${dash}${o}/>` : '')
    + (through ? `<path d="${through}" stroke="${RED}" stroke-width="1.8" stroke-dasharray="2 5" stroke-linecap="round" fill="none"${o}/>` : '')
}

const grp = (op, s) => (op >= 1 ? s : op <= 0.004 ? '' : `<g opacity="${r(op, 3)}">${s}</g>`)
/** One of the crew: a red disc and his number. */
export const head = (c, p, n, op = 1) => grp(op, `<circle cx="${r(c.X(p[0]))}" cy="${r(c.Y(p[1]))}" r="10.5" fill="${RED}"/><text x="${r(c.X(p[0]))}" y="${r(c.Y(p[1]) + 4.6)}" font-size="13" font-weight="700" fill="${PAPER}" text-anchor="middle">${n}</text>`)
/** One of the crew out of sight: a dashed ring where he is. */
export const hiding = (c, p, op = 1) => grp(op, `<circle cx="${r(c.X(p[0]))}" cy="${r(c.Y(p[1]))}" r="8" fill="none" stroke="${RED}" stroke-width="1.8" stroke-dasharray="2 3"/>`)
/** An officer: the ringed P. */
export const officer = (c, p, op = 1) => grp(op, `<circle cx="${r(c.X(p[0]))}" cy="${r(c.Y(p[1]))}" r="10" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/><text x="${r(c.X(p[0]))}" y="${r(c.Y(p[1]) + 4.4)}" font-size="12" font-weight="700" fill="${INK}" text-anchor="middle">P</text>`)
