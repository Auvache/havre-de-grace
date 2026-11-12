/*
 * Conman on the Portland map — where things are, when, and where the camera
 * is (2026-11-10). Everything else in the film reads these: the plans stand
 * on the sites, the routes are timed by the clock, and a trip's speed is set
 * against the camera's distance (story.mjs `trip`).
 *
 * The camera has three distances: a plan, a wide view that holds a whole
 * trip, and the town. It goes plan → wide → plan and is still while anyone
 * travels; nothing follows a dot.
 */
import * as C from './city.mjs'
import { CITY } from './atlas.mjs'
import { leg } from './travel.mjs'

const clamp01 = (v) => Math.max(0, Math.min(1, v))
const ramp = (t, a, b) => clamp01((t - a) / (b - a))
const ease = (u) => (u < 0.5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2)

/* ── Where each plan stands (its own origin, in film metres) ─────────── */

const HALL_S = 8.6

export const O1 = [-230, -741.5]
export const O2 = [-302, -38]
export const O3 = [744, -682]
export const O4 = C.HILLTOP
export const O5 = [400, 88]

/* ── The clock ───────────────────────────────────────────────────────── */

export const T = {
  // Heist 1: the owner walks off at 0:33 (was 0:35); everything after it two seconds sooner.
  atShop: 18.5, ownerGoes: 33.0, shopOut: 39.4, inCar1: 41.2, drive12: [41.5, 54.2], atDoor2: 55.4,
  chase1: 78.0, hide1: [88.5, 90.6], atStudio: 98.2,
  out3: 123.6, atMuseum: 139.0,
  // They leave the museum a second sooner (the user, 2026-11-12; it was 158.5) and take that second on the way: the hall is as it was.
  car45: [157.5, 164.4],
  police5: 175.0, arrest4: [175.9, 176.5, 177.1], posts: [178.0, 184.0], raid: 188.0,
  // Arrests, each on a beat (87.5 BPM, a beat at 0.31).
  arrest5: 194.37, arrest3: 201.91, arrest2: 206.71,
  zoom: [188.0, 225.0], end: 232.1,
}

/* ── The last pull-out: one even zoom from the hall to the whole town ── */

/** 0 → 1 over the zoom, at an even rate but for a soft start and stop. */
const zoomLeg = leg([[0, 0], [1, 0]], T.zoom[0], T.zoom[1], 1.4, 1.6)
export const zoomU = (t) => zoomLeg.dist(t)
/** Pixels to a metre during it. */
export const zoomS = (t) => Math.exp(Math.log(HALL_S) + (Math.log(CITY.s) - Math.log(HALL_S)) * zoomU(t))

/* ── The views ───────────────────────────────────────────────────────── */

const view = (o, v) => ({ cx: o[0] + v[0], cy: o[1] + v[1], s: v[2] })
/** Each heist as it is seen: the middle of the frame from its plan's origin, and pixels to a metre. */
export const VIEWS = [view(O1, [13, 7.5, 20]), view(O2, [19.4, 16.8, 19]), view(O3, [24, 28, 12.6]), view(O4, [6, 1, 8.4]), view(O5, [0, 22, HALL_S])]
const V = (n) => VIEWS[n - 1]
/** Between two views, as a zoom should travel: scale in log, the centre moving in step with it. */
function zoom(a, b, u) {
  const s = Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * u)
  const k = Math.abs(a.s - b.s) < 1e-9 ? u : (1 / a.s - 1 / s) / (1 / a.s - 1 / b.s)
  return { cx: a.cx + (b.cx - a.cx) * k, cy: a.cy + (b.cy - a.cy) * k, s }
}
/** A view that holds two heists, with room round them. */
const both = (a, b) => {
  const [p, q] = [V(a), V(b)]
  return { cx: (p.cx + q.cx) / 2, cy: (p.cy + q.cy) / 2, s: Math.min(1.9, 1532 / (Math.abs(p.cx - q.cx) + 420), 776 / (Math.abs(p.cy - q.cy) + 300)) }
}
/* The wide views: each holds a whole trip, so the camera is still while they travel. */
const DRIVE_12 = { cx: -190, cy: -365, s: 0.9 }
const CHASE_1 = { cx: 150, cy: -290, s: 0.98 }
const CHASE_2 = { cx: 130, cy: -400, s: 0.84 }
/**
 * [from, to, view, how]: held from `from` to `to`; eased between one hold
 * and the next, or (how = 'even') travelled at the even rate of the last
 * pull-out, which ends on the whole town at 3:45 and stays there.
 */
export const HOLDS = [
  [0, 11, { cx: V(1).cx + 60, cy: V(1).cy + 40, s: 2.2 }],
  [17.2, 40.4, V(1)],
  [44.4, 49.6, DRIVE_12], [54, 76.0, V(2)],
  [80.4, 92.6, CHASE_1], [98.4, 122.4, V(3)],
  // The camera leaves the museum as they do, and is on the wide view two seconds later: so the second they gained is spent travelling, not pulling away.
  [125.8, 133.6, CHASE_2], [139.2, T.car45[0] - 0.1, V(4)],
  [T.car45[0] + 1.9, 162.6, both(4, 5)], [164.8, T.zoom[0], V(5)],
  [T.zoom[1], 999, CITY, 'even'],
]
export function viewAt(t) {
  for (let i = 0; i < HOLDS.length; i++) {
    const [from, to, v, how] = HOLDS[i]
    if (t < from) { const [, was, u] = HOLDS[i - 1]; return zoom(u, v, how === 'even' ? zoomU(t) : ease(ramp(t, was, from))) }
    if (t <= to) return v
  }
  return CITY
}

