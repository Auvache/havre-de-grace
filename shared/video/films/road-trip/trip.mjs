/*
 * Ship to Stockholm · the road trip — the drive: the whole road as one line,
 * and where the dot is on it at every moment of the record.
 *
 * `TRIP` is the baked legs joined end to end in the film's kilometres, a
 * road driven back being the same points in reverse. Everything is measured
 * as a distance along it, so a place visited twice (the fork a wrong turn
 * left from) is two distances: 'Wellsboro, PA' and 'Wellsboro, PA#2'.
 *
 * `distAt(time)` is the clock, and it is driven rather than drawn. PINS are
 * the moments that must land on the record: where the dot stands still, and
 * when (times from the measured score, app/config/shipToStockholmScore.ts).
 * Between two pins it drives at one steady pace on the sheet, which is a
 * faster pace on the ground wherever the camera stands further off
 * (`scaleAt`); it pulls away over about a second, brakes over the last
 * thirty kilometres, and eases off through every junction in SLOW, the forks
 * it is not sure of. The pace of each stretch is solved so the dot arrives
 * exactly on its pin.
 */
import { STOPS, LEGS } from './route-baked.mjs'
import { line as decodeLine, project } from './geo.mjs'

/* ── The road, joined ─────────────────────────────────────────────── */

const STOP = new Map(STOPS.map((s) => [s.key, { ...s, at: project([s.lon, s.lat]) }]))

function join() {
  const pts = []
  /** For each leg: [index of its first point, index of its last]. */
  const spans = []
  /** Where each stop was reached: key → [point index, …] in the order driven. */
  const reached = new Map()
  const note = (key, i) => { if (!reached.has(key)) reached.set(key, []); reached.get(key).push(i) }
  LEGS.forEach((leg, n) => {
    if (leg.back) {
      // Back to `leg.back` the way it came: the points since it was last there, reversed.
      const from = reached.get(leg.back).at(-1)
      const to = pts.length - 1
      const start = pts.length - 1
      const seen = [...reached.entries()].flatMap(([key, list]) => list.filter((i) => i > from && i < to).map((i) => [key, i]))
      for (let i = to - 1; i >= from; i--) {
        pts.push(pts[i])
        for (const [key, at] of seen) if (at === i) note(key, pts.length - 1)
      }
      note(leg.back, pts.length - 1)
      spans.push([start, pts.length - 1])
      return
    }
    const part = decodeLine(leg.line, 4)
    if (n === 0) { pts.push(part[0]); note(leg.from, 0) }
    const start = pts.length - 1
    // The router snaps each end to the nearest road, so one leg's end is the next one's start.
    for (let i = 1; i < part.length; i++) pts.push(part[i])
    note(leg.to, pts.length - 1)
    spans.push([start, pts.length - 1])
  })
  const cum = new Float64Array(pts.length)
  for (let i = 1; i < pts.length; i++) cum[i] = cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
  return { pts, cum, L: cum[pts.length - 1], reached, spans }
}

export const TRIP = join()
export { STOP }

/** Kilometres along the road at a place: 'Name, ST' the first time it is reached, 'Name, ST#2' the second. */
export function at(place) {
  if (typeof place === 'number') return place
  const [key, nth] = place.split('#')
  const list = TRIP.reached.get(key)
  if (!list) throw new Error(`road trip: no stop "${key}"`)
  const i = list[(Number(nth) || 1) - 1]
  if (i == null) throw new Error(`road trip: "${key}" is reached only ${list.length} time(s)`)
  return TRIP.cum[i]
}

/** The index of the last point at or before distance d. */
function seg(d) {
  const { cum } = TRIP
  let lo = 0
  let hi = cum.length - 1
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (cum[mid] <= d) lo = mid; else hi = mid - 1 }
  return Math.min(lo, cum.length - 2)
}
/** The point at distance d, and the way the road is heading there (a unit vector). */
export function pointAt(d) {
  const { pts, cum, L } = TRIP
  const dd = Math.max(0, Math.min(L, d))
  const i = seg(dd)
  const span = cum[i + 1] - cum[i] || 1
  const u = (dd - cum[i]) / span
  const [a, b] = [pts[i], pts[i + 1]]
  return { x: a[0] + (b[0] - a[0]) * u, y: a[1] + (b[1] - a[1]) * u, i, hx: (b[0] - a[0]) / span, hy: (b[1] - a[1]) / span }
}

/* ── How far off the camera stands, by place ──────────────────────── */

/*
 * Pixels to a kilometre, keyed to places along the road rather than to
 * times: close in the East where the roads tangle, further off where the
 * country is empty and there is ground to cover. The dot's pace on the
 * ground is this turned over, so on the sheet it is one pace all the way.
 * (camera.mjs reads this; the lake, the opening and the last pull-out are its own.)
 */
const SCALE_KEYS = [
  ['New York, NY', 4.0],
  ['Stockholm, NJ', 3.6],
  ['Honesdale, PA', 3.3],
  ['Erie, PA', 3.2],
  ['Meadville, PA', 3.1],
  ['Medina, OH', 2.8],
  ['Nappanee, IN', 2.7],
  ['Michigan City, IN', 2.45],
  ['Ludington, MI', 2.35],
  ['Michigan City, IN#2', 2.35],
  ['Dixon, IL', 2.5],
  ['Stockholm, WI', 2.6],
  ['Brookings, SD', 2.45],
  ['Blunt, SD', 2.35],
  ['Moorcroft, WY', 2.3],
  ['Burns, OR#2', 2.3],
  ['The Dalles, OR', 2.5],
  ['Astoria, OR', 2.8],
  ['Seaside, OR', 3.0],
]
const SCALE = SCALE_KEYS.map(([place, v]) => ({ d: at(place), v }))
/** Pixels to a kilometre when the dot is d kilometres along. */
export function scaleAt(d) {
  if (d <= SCALE[0].d) return SCALE[0].v
  for (let i = 0; i < SCALE.length - 1; i++) {
    const [a, b] = [SCALE[i], SCALE[i + 1]]
    if (d <= b.d) {
      const u = 0.5 - 0.5 * Math.cos(Math.PI * ((d - a.d) / (b.d - a.d || 1)))
      return a.v + (b.v - a.v) * u
    }
  }
  return SCALE.at(-1).v
}

/* ── The clock ────────────────────────────────────────────────────── */

/*
 * [time, place]: the dot stands at that place at that time. Two pins at one
 * place are a wait; between two places it drives.
 */
export const PINS = [
  // He sits in the city through the intro and pulls out as the first line starts (30.10).
  [0, 'New York, NY'],
  [29.9, 'New York, NY'],
  // Wrong turn 1. "To find if lost love is worth saving" (51.05–54.07): north to the lake, and stopped on "saving".
  [53.7, 'Erie, PA'],
  [55.3, 'Erie, PA'],
  // Wrong turn 2. "Bribing or begging or bleeding, oh" ends 84.80: at the dock, and the boat has gone.
  [84.9, 'Ludington, MI'],
  [89.4, 'Ludington, MI'],
  // Wrong turn 3. The instrumental starts 139.9: he is at the lake that should have been a road west.
  [140.4, 'Mobridge, SD'],
  [142.7, 'Mobridge, SD'],
  // …and the wrong way again at Faith, a bar and a half later.
  [151.6, 'Dupree, SD'],
  [152.9, 'Dupree, SD'],
  // Wrong turn 4. "The rhetoric's not worth repeating, no" ends 203.81: the end of the pavement.
  [203.2, 'Frenchglen, OR'],
  [204.5, 'Frenchglen, OR'],
  // "So I'm taking the ship back to Stockholm" ends 225.51: the ocean.
  [225.3, 'Seaside, OR'],
  [999, 'Seaside, OR'],
]

/** Forks he is not sure of: he eases off through them. [place, how slow (share of his pace), over how many km]. */
const SLOW = [
  ['Union City, PA', 0.4, 16],
  ['Union City, PA#2', 0.55, 10],
  ['Michigan City, IN', 0.4, 20],
  ['Michigan City, IN#2', 0.6, 14],
  ['Dubuque, IA', 0.6, 16],
  ['Blunt, SD', 0.4, 22],
  ['Lemmon, SD', 0.55, 20],
  ['Faith, SD', 0.4, 18],
  ['Faith, SD#2', 0.6, 12],
  ['Moorcroft, WY', 0.55, 20],
  ['Cody, WY', 0.65, 18],
  ['Burns, OR', 0.4, 22],
  ['Burns, OR#2', 0.6, 14],
].map(([place, k, w]) => ({ d: at(place), k, w }))

/** His pace as a share of the stretch's own, d kilometres along: 1, less through a fork. */
function ease(d) {
  let m = 1
  for (const s of SLOW) {
    const u = Math.abs(d - s.d) / s.w
    if (u < 1) m = Math.min(m, s.k + (1 - s.k) * (0.5 - 0.5 * Math.cos(Math.PI * u)))
  }
  return m
}

const STEP = 0.02
/** Seconds to get up to pace from a stand; kilometres over which he brakes to one. */
const AWAY = 1.1
const BRAKE = 30

/*
 * Drive one stretch at pace c (pixels a second on the sheet): from d0 at t0
 * until d1 is reached. Returns the distances at each STEP and the arrival time.
 */
function drive(d0, d1, t0, c) {
  const out = []
  let d = d0
  let t = t0
  while (d < d1 - 0.02 && t < t0 + 400) {
    out.push(d)
    const away = Math.min(1, (t - t0 + STEP) / AWAY)
    const brake = Math.min(1, Math.sqrt(Math.max(d1 - d, 0) / BRAKE) + 0.04)
    const v = (c / scaleAt(d)) * ease(d) * (0.5 - 0.5 * Math.cos(Math.PI * away)) * brake
    d = Math.min(d1, d + v * STEP)
    t += STEP
  }
  return { out, arrive: t }
}

/** The whole clock: distance at every STEP, and each stretch's pace on the sheet. */
function clock() {
  const table = []
  const paces = []
  for (let i = 0; i < PINS.length - 1; i++) {
    const [t0, p0] = PINS[i]
    const [t1, p1] = PINS[i + 1]
    const [d0, d1] = [at(p0.includes('#') ? p0 : lastReached(p0, i)), at(p1.includes('#') ? p1 : lastReached(p1, i + 1))]
    const n = Math.round((Math.min(t1, 400) - t0) / STEP)
    if (d1 <= d0 + 0.01) { for (let k = 0; k < n; k++) table.push(d0); continue }
    // Solve the pace: the arrival must be t1.
    let c = 100
    let run = drive(d0, d1, t0, c)
    for (let pass = 0; pass < 40 && Math.abs(run.arrive - t1) > STEP / 2; pass++) {
      c *= (run.arrive - t0) / (t1 - t0)
      run = drive(d0, d1, t0, c)
    }
    paces.push({ from: p0, to: p1, t0, t1, px: c, km: (d1 - d0) / (t1 - t0) })
    for (let k = 0; k < n; k++) table.push(k < run.out.length ? run.out[k] : d1)
  }
  return { table, paces }
}
/** A pin names a place; the place may be reached more than once, and a pin means the latest visit that is not behind the pin before it. */
function lastReached(place, i) {
  const list = TRIP.reached.get(place)
  if (!list) throw new Error(`road trip: no stop "${place}"`)
  if (list.length === 1 || i === 0) return TRIP.cum[list[0]]
  // The first visit at or after the previous pin's place.
  const prev = PINS[i - 1][1]
  const floor = prev === place ? null : TRIP.cum[TRIP.reached.get(prev.split('#')[0])[0]]
  const hit = list.map((k) => TRIP.cum[k]).find((d) => floor == null || d >= floor)
  return hit ?? TRIP.cum[list.at(-1)]
}
const CLOCK = clock()
/** Each stretch's pace, for the checker and the notes. */
export const PACES = CLOCK.paces

/** Kilometres along the road at `time`. */
export function distAt(time) {
  const { table } = CLOCK
  const x = Math.max(0, time) / STEP
  const i = Math.floor(x)
  if (i >= table.length - 1) return table.at(-1)
  return table[i] + (table[i + 1] - table[i]) * (x - i)
}
/** Kilometres a second. */
export const speedAt = (time) => (distAt(time + 0.05) - distAt(time - 0.05)) / 0.1
/** Standing still at `time`: [since, until] of the wait, or null. */
export function waitAt(time) {
  for (let i = 0; i < PINS.length - 1; i++) {
    if (time >= PINS[i][0] && time <= PINS[i + 1][0] && PINS[i][1] === PINS[i + 1][1]) return [PINS[i][0], PINS[i + 1][0]]
  }
  return null
}

/** The stop most lately reached by distance d: its key, for the label. */
export function lastStop(d) {
  let best = null
  let bestAt = -1
  for (const [key, list] of TRIP.reached) {
    if (STOP.get(key).via) continue
    for (const i of list) if (TRIP.cum[i] <= d + 0.5 && TRIP.cum[i] > bestAt) { bestAt = TRIP.cum[i]; best = key }
  }
  return best
}
