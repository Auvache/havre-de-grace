/*
 * Conman, the whole film (exploration, 2026-11-05): everything decided so far,
 * end to end, as one function of the song clock.
 *
 *   0–12        the shared opening (mark, title, the black lifts)
 *   12–42.3     heist 1, the record shop (D · Around the circle)            1968
 *   42.3–77     the drive over the bridge and heist 2 (B), from "Oh, I'm a
 *               conman" (55.75): the counting house, through the floor      1969
 *   77–99.95    police chase 1, the first chorus (A · From above); they slip
 *               out of the park behind the officer and are at the studio's
 *               door by 98.4
 *   99.95–122   heist 3, the studio: the conman and the auditor are the
 *               shadow and the taker, the engineer joins, "you" in ink      1970
 *   122–140.2   chase 2, the second chorus: out of the studio's back lane,
 *               round the whole Crescent, up the west fluke road into the
 *               pressing plant to hide; the officer circles it and gives up;
 *               out north, along Main Street, up High Street to the museum,
 *               where they stand from 139.2
 *   140.2–158.4 heist 4, the drum museum, the break: the police almost catch
 *               them (one in at the front as they leave by the bay, a car
 *               round the Circus as the getaway pulls away)                 1973
 *   158.4–164.5 the getaway down High Street to the crown, the car lost
 *   164–188     heist 5, the fan hall at the crown, five crew; the hall is
 *               drawn as the camera lands and they go in on the verse       1975
 *   188–232.1   the final chase: the five scatter down the anchor's strokes,
 *               the police falling behind, the camera pulls out to the whole
 *               town and their red becomes the anchor; they are gone into it
 *   232.1       the end card on the last hit
 *
 * Timing rule (the user, 2026-11-06): the start of every heist — the plan
 * whole and the crew standing outside — lands a second or so before the verse,
 * and they go in as the singing starts (heist 4, in the break, goes on the
 * break's downbeat). The dots are controlled: they only run from the police
 * or in long transit, and always ease to a stop at a door.
 *
 * Earlier jobs stay in the town as finished sheets with their routes. A chase
 * through the grid fades once it is over; the police's trails fade as each
 * chase ends; the getaways that run on the anchor's own strokes stay red.
 */
import { COVER_SHEET, INK, PAPER, RED, markDrawnAt, MARK_DRAW } from '../../album.mjs'
import { drawLines } from '../../hairline-draw.mjs'
import { TITLES } from '../../titles.mjs'
import { END_BLACK, END_INK } from '../../ending.mjs'
import { DASH, CAMS } from './styles.mjs'
import { RING, BALLS, BALL_R, STOCK_Y, SHANK_X, ARMS, FLUKES, arcPts } from './city.mjs'
import { motionOrbit, plan, drawn, ownerSvg, crewSvg, sheet, zoom, camOf, ease, ramp, lerp, r, timing } from './motion.mjs'
import { seqBridge, travel, inked } from './sequence.mjs'
import { chaseAbove, ROUTE1, ROUTE2, COP, STUDIO_VIEW } from './chase1.mjs'
import { overlay, KEY2, timed } from './job2.mjs'
import { VARIANTS as STUDIOS } from './heists/studio.mjs'
import { VARIANTS as PLANTS } from './heists/west-pier.mjs'
import { VARIANTS as MUSEUMS } from './heists/museum.mjs'
import { VARIANTS as HALLS } from './heists/concert-hall.mjs'

const END_CARD = 232.1
const OPENING = { mark: 0.5, markOut: [5.0, 5.7], title: [6.2, 8.9], reveal: [10.6, 12.0] }
const T3 = 99.95
const C2 = [121.95, 140.2]
const T4 = [140.2, 158.4]
const T5 = [164.0, 187.8]
const FINAL = [188.2, 223.5]
/** The museum job and the police's near-miss, written for 140.4–160, play this much earlier so the hall is ready for the verse. */
const EARLY4 = 1.6

/* ── Drawing people and trails in town metres ────────────────────────── */

const P = (deg) => (deg * Math.PI) / 180
const pl = (c, pts) => `M${pts.map(([x, y]) => `${r(c.X(x))} ${r(c.Y(y))}`).join('L')}`
const redTrail = (c, pts, style, op = 1) => (pts && pts.length > 1 ? `<path d="${pl(c, pts)}" stroke="${RED}" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" fill="none"${DASH[style] ? ` stroke-dasharray="${DASH[style]}"` : ''}${op < 1 ? ` opacity="${r(op, 3)}"` : ''}/>` : '')
const head = (c, p, n, op = 1) => `<g${op < 1 ? ` opacity="${r(op, 3)}"` : ''}><circle cx="${r(c.X(p[0]))}" cy="${r(c.Y(p[1]))}" r="10.5" fill="${RED}"/><text x="${r(c.X(p[0]))}" y="${r(c.Y(p[1]) + 4.6)}" font-size="13" font-weight="700" fill="${PAPER}" text-anchor="middle">${n}</text></g>`
const hiding = (c, p) => `<circle cx="${r(c.X(p[0]))}" cy="${r(c.Y(p[1]))}" r="7" fill="none" stroke="${RED}" stroke-width="1.6" stroke-dasharray="2 3"/>`
const noHeads = (svg) => svg.replace(new RegExp(`<circle[^>]*r="10.5" fill="${RED}"/><text[^>]*>\\d</text>`, 'g'), '')

/** An officer: dashed ink trail, a ringed P, his line of sight a dotted fan. */
function cop(c, route, t, { look, trailOp = 0.8, show = true } = {}) {
  const w = route.walked(t)
  if (!w) return ''
  let s = trailOp > 0.01 ? `<path d="${pl(c, w)}" stroke="${INK}" stroke-width="1.8" stroke-dasharray="7 5" stroke-linecap="round" fill="none" opacity="${r(trailOp, 3)}"/>` : ''
  if (!show) return s
  const p = w.at(-1)
  const [x, y] = [c.X(p[0]), c.Y(p[1])]
  const d = look ?? heading(route, t)
  const reach = Math.max(70, 50 * c.s)
  const q1 = [x + reach * Math.cos(P(d - 24)), y + reach * Math.sin(P(d - 24))]
  const q2 = [x + reach * Math.cos(P(d + 24)), y + reach * Math.sin(P(d + 24))]
  s += `<path d="M${r(x)} ${r(y)}L${r(q1[0])} ${r(q1[1])}A${r(reach)} ${r(reach)} 0 0 1 ${r(q2[0])} ${r(q2[1])}Z" fill="${INK}" fill-opacity="0.07" stroke="${INK}" stroke-width="0.9" stroke-dasharray="1 4" stroke-linecap="round"/>`
  s += `<circle cx="${r(x)}" cy="${r(y)}" r="10" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/><text x="${r(x)}" y="${r(y + 4.4)}" font-size="12" font-weight="700" fill="${INK}" text-anchor="middle">P</text>`
  return s
}
function heading(route, t) {
  const a = route.at(t - 0.2)
  const b = route.at(t)
  if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.01) return 90
  return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI
}

/* ── Heist 3: the studio ─────────────────────────────────────────────── */

const S0 = STUDIOS[0]
const SO = S0.o
// Both stand at the door from the end of the chase (chase1.mjs AT_DOOR) and go in on the verse.
const studioCrew = S0.crew.map((cr) => {
  if (cr.n === 1) return { ...cr, role: 'The conman', from: T3, pts: [[7, 35], ...cr.pts.slice(2)] }
  if (cr.n === 2) return { ...cr, role: 'The auditor', from: T3 + 0.25, wait: T3 - 0.1, pts: [[7.6, 35.6], [30, 36.6], [52, 36.4], [60, 30], ...cr.pts] }
  return cr
})
const STUDIO3 = { ...S0, crew: studioCrew }
const studioEnd = (n) => {
  const cr = studioCrew.find((q) => q.n === n)
  const p = timing(cr.pts, cr.from, cr.to).at(cr.to + 1)
  return [p[0] + SO[0], p[1] + SO[1]]
}
const KEY3 = { crew: studioCrew, figures: S0.figures, owners: [] }

/* ── Chase 2: round the Crescent into the pressing plant ─────────────── */

const PLANT = { ...PLANTS[0], crew: [], owners: [] }
const PO = PLANT.o
const armLow = arcPts(ARMS.c, ARMS.rx, ARMS.ry, 0, Math.PI, 18) // east end, round the crown, to the west end
const DOOR_E = [SO[0] + 46, SO[1] + 18.5]
const LANE = [SO[0] + 60, SO[1] + 18.5]
const PLANT_DOOR = [PO[0] + 34.8, PO[1] + 34]
/*
 * The Crescent is the only way from the studio's side of the river to the
 * plant's that does not retrace Main Street, so the two legs (studio → plant,
 * plant → museum) are evened out at about 140 m/s rather than 150 and 120:
 * into the plant by 131.4, out again at 133.2 while the officer is round the
 * far side, up to the museum's door by 139.2, easing to a stop, in at 140.2.
 */
const HIDE2 = [131.4, 133.2]
const AT_MUSEUM = 139.2
const RUN2 = [
  [LANE[0], LANE[1], 122.6], [LANE[0], SO[1] + 46], [739, 393], FLUKES[1][0], ...armLow.slice(1, -1), FLUKES[0][0], [PLANT_DOOR[0], PLANT_DOOR[1] + 4], PLANT_DOOR,
  [PO[0] + 30, PO[1] + 24], [PO[0] + 16, PO[1] + 20, HIDE2[0]], [PO[0] + 16, PO[1] + 20, HIDE2[1]],
  [PO[0] + 30, PO[1] + 14], [PO[0] + 33, PO[1] + 1], [PO[0] + 34, PO[1] - 8, HIDE2[1] + 0.7], [PO[0] + 34, STOCK_Y], [BALLS[0][0] - BALL_R, STOCK_Y],
  ...arcPts(BALLS[0], BALL_R, BALL_R, Math.PI, 2 * Math.PI, 6).slice(1), [SHANK_X, STOCK_Y], [SHANK_X, RING.c[1] + RING.r, AT_MUSEUM - 0.5], [SHANK_X, 154, AT_MUSEUM],
]
const offsetRun = (dx, dy, dt) => RUN2.map(([x, y, t]) => [x + dx, y + dy, t == null ? undefined : t + dt])
const CHASE2 = [
  { n: 1, style: 'solid', route: timed([[...studioEnd(1), 121.5], [DOOR_E[0] - 3, DOOR_E[1]], DOOR_E, ...offsetRun(0, 0, 0)]) },
  { n: 2, style: 'dash', route: timed([[...studioEnd(2), 121.5], [LANE[0] + 1.6, LANE[1] + 1.6, 122.9], ...offsetRun(1.6, 1.6, 0.3).slice(1)]) },
  { n: 3, style: 'dot', route: timed([[...studioEnd(3), 121.5], [DOOR_E[0] - 3, DOOR_E[1] - 1.4], [DOOR_E[0], DOOR_E[1] - 1.4], ...offsetRun(-1.6, -1.6, 0.6)]) },
]
/** The officer: down Main Street to the back lane as they run, after them all the way, once round the plant (the building on his left), gone. */
const COP_LOOP = [132.3, 133.8]
const COP2 = timed([
  [LANE[0], STOCK_Y, 122.1], [LANE[0], STOCK_Y, 122.6], [LANE[0], LANE[1], 123.4], [LANE[0], SO[1] + 46], [739, 393], FLUKES[1][0], ...armLow.slice(1, -1), FLUKES[0][0],
  [PLANT_DOOR[0], PLANT_DOOR[1] + 4, COP_LOOP[0]], [PO[0] + 46, PO[1] + 36, 132.6], [PO[0] + 46, PO[1] - 6, 133.0], [PO[0] - 5, PO[1] - 6, 133.4], [PO[0] - 5, PO[1] + 36, COP_LOOP[1]],
  FLUKES[0][0], [200, 760, 137.0], [260, 820, 138.2],
])
const KEY_C2 = { crew: [{ n: 1, role: 'The conman', style: 'solid' }, { n: 2, role: 'The auditor', style: 'dash' }, { n: 3, role: 'The engineer', style: 'dot' }], figures: [{ label: 'The police', mark: 'P' }] }

/* ── Heist 4: the museum; the police almost catch them ───────────────── */

const M0 = MUSEUMS[0]
const MO = M0.o
const pc = (R, d) => [R * Math.cos(P(d)), R * Math.sin(P(d))]
// The three stand at the door from the end of chase 2 (AT_MUSEUM) and go in on the break's downbeat.
const museumCrew = M0.crew.map((cr) => {
  if (cr.n === 1) return { ...cr, role: 'The conman', from: T4[0], to: cr.to - EARLY4 }
  if (cr.n === 2) return { ...cr, role: 'The auditor', from: T4[0], to: cr.to - EARLY4, pts: [[1.6, 51], pc(60, 45), pc(62, 0), ...cr.pts] }
  if (cr.n === 3) return { ...cr, role: 'The engineer', from: T4[0], to: cr.to - EARLY4, pts: [[-1.6, 51], pc(60, 135), pc(62, 180), ...cr.pts] }
  return { ...cr, from: cr.from - EARLY4, to: cr.to - EARLY4 }
})
const MUSEUM4 = { ...M0, crew: museumCrew }
const KEY4 = { crew: museumCrew, owners: M0.owners, ownerLabel: 'The guards', figures: [{ label: 'The police', mark: 'P' }] }
const e4 = (t) => (t == null ? undefined : t - EARLY4)
const at4 = (x, y, t) => [MO[0] + x, MO[1] + y, e4(t)]
/** On foot up High Street, in at the front, through the rotunda to the bay, a breath too late. */
const COP4A = timed([[SHANK_X, STOCK_Y, e4(149)], [SHANK_X, RING.c[1] + RING.r, e4(152.4)], at4(0, 50), at4(0, 36, 154.6), at4(0, 26), at4(0, 9, 156.6), at4(0, 9, 157.4), at4(18, 4), at4(30, 1), at4(36, 0, 159.4), at4(46, 0, 160.1), at4(46, 0, 161.5)])
/** A car round the Circus from the south, coming up on the bay as the getaway pulls away; after it down High Street, lost at Main Street. */
const circus = (d0, d1) => arcPts(RING.c, RING.r, RING.r, P(d0), P(d1), 6)
const COP4B = timed([[SHANK_X, STOCK_Y + 40, e4(151)], [SHANK_X, RING.c[1] + RING.r, e4(153.4)], ...circus(90, 180).slice(1), ...circus(180, 270).slice(1), ...circus(270, 352).slice(1), [RING.c[0] + RING.r, RING.c[1], e4(160.4)],
  ...circus(0, 90).slice(1), [SHANK_X, STOCK_Y, e4(162.6)], [SHANK_X, STOCK_Y, e4(164)]])
/** The getaway: from the bay round the Circus and straight down High Street to the crown, easing to a stop where the hall's crew start (HO + DROP). */
const CAR_OUT = e4(160)
const CROWN_STOP = ARMS.c[1] + ARMS.ry - 2
const CAR = timed([[MO[0] + 58.4, MO[1], CAR_OUT], [RING.c[0] + RING.r, RING.c[1], CAR_OUT + 0.5], ...circus(0, 90).slice(1), [SHANK_X, STOCK_Y], [SHANK_X, CROWN_STOP - 30, 163.9], [SHANK_X, CROWN_STOP, 164.5]])

/* ── Heist 5: the hall at the crown ──────────────────────────────────── */

const H0 = HALLS[0]
const HO = H0.o
const DROP = [0, -10]
// The car stops at DROP by 164.5 and the five go on the verse (165.45): the driver first, the conman standing until his turn.
const V4 = 165.45
const hallCrew = H0.crew.map((cr) => {
  const lead = (pts, from) => ({ ...cr, from, pts: [DROP, ...pts] })
  if (cr.n === 1) return { ...lead([[30, -6], [50, 18], [40, 50], ...cr.pts], V4 + 0.1), wait: 164.5 }
  if (cr.n === 2) return { ...lead([[-46, -6], ...cr.pts], V4 + 0.3), role: 'The auditor' }
  if (cr.n === 3) return { ...lead(cr.pts, V4 + 0.5), role: 'The engineer' }
  if (cr.n === 4) return { ...cr, from: 167.2 }
  if (cr.n === 5) return { ...cr, from: V4, pts: [[0, cr.pts[0][1] + 8], [-40, cr.pts[1][1]], [-40, cr.pts[1][1], 12], ...cr.pts.slice(2)] }
  return cr
})
const HALL5 = { ...H0, crew: hallCrew }
const hallEnd = (n) => {
  const cr = hallCrew.find((q) => q.n === n)
  const p = timing(cr.pts, cr.from, cr.to).at(cr.to + 1)
  return [p[0] + HO[0], p[1] + HO[1]]
}
const KEY5 = { crew: hallCrew, owners: H0.owners, ownerLabel: 'The ushers' }

/* ── The final chase: their red becomes the anchor ───────────────────── */

const CROWN = [SHANK_X, ARMS.c[1] + ARMS.ry]
const westArm = arcPts(ARMS.c, ARMS.rx, ARMS.ry, Math.PI / 2, Math.PI, 30)
const eastArm = arcPts(ARMS.c, ARMS.rx, ARMS.ry, Math.PI / 2, 0, 30)
const ringRound = arcPts(RING.c, RING.r, RING.r, Math.PI / 2, Math.PI / 2 + 2 * Math.PI, 4)
const ballRound = (b, a0) => arcPts(b, BALL_R, BALL_R, a0, a0 + 2 * Math.PI, 5)
const [F0, F1] = FINAL
const run = (start, pts, end = F1) => timed([[...start, F0], ...pts.slice(0, -1), [...pts.at(-1), end]])
const FINAL_RUNS = [
  { n: 1, style: 'solid', route: run(hallEnd(1), [CROWN, [SHANK_X, RING.c[1] + RING.r], ...ringRound.slice(1)], F1) },
  { n: 2, style: 'longdash', route: run(hallEnd(2), [CROWN, ...westArm.slice(1), FLUKES[0][1]], F1 - 1.5) },
  { n: 3, style: 'dashdot', route: run(hallEnd(3), [CROWN, ...eastArm.slice(1), FLUKES[1][1]], F1 - 1) },
  { n: 4, style: 'dash', route: run(hallEnd(4), [CROWN, [SHANK_X, STOCK_Y], [BALLS[0][0] + BALL_R, STOCK_Y], ...ballRound(BALLS[0], 0).slice(1)], F1 - 0.5) },
  { n: 5, style: 'dot', route: run(hallEnd(5), [CROWN, [SHANK_X, STOCK_Y + 2], [BALLS[1][0] - BALL_R, STOCK_Y + 2], ...ballRound(BALLS[1], Math.PI).slice(1)], F1) },
]
/** Three officers from the river side, each after one of them, falling behind and stopping. */
const part = (pts, a, b) => pts.slice(Math.round(a * (pts.length - 1)), Math.round(b * (pts.length - 1)) + 1)
const COPS_F = [
  timed([[SHANK_X - 6, 1010, 187.6], [SHANK_X - 6, CROWN[1] + 12, 189.6], CROWN, [SHANK_X, 600], [SHANK_X, 470, 204], [SHANK_X, 470, 240]]),
  timed([[SHANK_X - 30, 1010, 187.8], [SHANK_X - 30, CROWN[1] + 8, 190], ...part(westArm, 0.15, 0.62), [...part(westArm, 0.65, 0.65)[0], 206], [...part(westArm, 0.65, 0.65)[0], 240]]),
  timed([[SHANK_X + 30, 1010, 188], [SHANK_X + 30, CROWN[1] + 8, 190.2], ...part(eastArm, 0.15, 0.55), [...part(eastArm, 0.58, 0.58)[0], 205], [...part(eastArm, 0.58, 0.58)[0], 240]]),
]
const KEY_F = { crew: [{ n: 1, role: 'The conman', style: 'solid' }, { n: 2, role: 'The auditor', style: 'longdash' }, { n: 3, role: 'The engineer', style: 'dashdot' }, { n: 4, role: 'The stagehand', style: 'dash' }, { n: 5, role: 'The driver', style: 'dot' }], figures: [{ label: 'The police', mark: 'P' }] }

/* ── Cameras from heist 3 on ─────────────────────────────────────────── */

const STUDIO_END = { ...STUDIO_VIEW, s: STUDIO_VIEW.s * 1.06 }
const WIDE2 = { cx: 390, cy: 600, s: 1.24 }
const PLANT_VIEW = { cx: PO[0] + 22, cy: PO[1] + 10, s: 6.2 }
const NORTH = { cx: 270, cy: 250, s: 1.9 }
const MUSEUM_VIEW = { cx: MO[0] + M0.view[0], cy: MO[1] + M0.view[1], s: M0.view[2] }
const MUSEUM_END = { ...MUSEUM_VIEW, s: MUSEUM_VIEW.s * 1.05 }
const HALL_VIEW = { cx: HO[0] + H0.view[0], cy: HO[1] + H0.view[1], s: H0.view[2] }
const HALL_END = { ...HALL_VIEW, s: HALL_VIEW.s * 1.05 }
const TOWN = { cx: CAMS.overview.cx, cy: CAMS.overview.cy, s: CAMS.overview.s }
const carView = (t, s) => { const p = CAR.at(t); return { cx: p[0], cy: p[1], s } }

function camLater(t) {
  if (t < C2[0]) return zoom(STUDIO_VIEW, STUDIO_END, ramp(t, T3, C2[0]))
  if (t < 125) return zoom(STUDIO_END, WIDE2, ease(ramp(t, C2[0], 125)))
  if (t < 130.4) return WIDE2
  if (t < 132) return zoom(WIDE2, PLANT_VIEW, ease(ramp(t, 130.4, 132)))
  if (t < 133.6) return PLANT_VIEW
  if (t < 135.6) return zoom(PLANT_VIEW, NORTH, ease(ramp(t, 133.6, 135.6)))
  // Held wide while they run Main Street, then down onto the museum, landed as they reach its door.
  if (t < 137.4) return NORTH
  if (t < AT_MUSEUM) return zoom(NORTH, MUSEUM_VIEW, ease(ramp(t, 137.4, AT_MUSEUM)))
  if (t < CAR_OUT - 0.2) return zoom(MUSEUM_VIEW, MUSEUM_END, ramp(t, AT_MUSEUM, CAR_OUT - 0.2))
  if (t < CAR_OUT + 1.8) return zoom(MUSEUM_END, carView(t, 2.4), ease(ramp(t, CAR_OUT - 0.2, CAR_OUT + 1.8)))
  if (t < 162.6) return carView(t, 2.4)
  // Down onto the hall as the car slows to the crown; landed, and the hall inked, before the verse.
  if (t < 164.8) return zoom(carView(t, 2.4), HALL_VIEW, ease(ramp(t, 162.6, 164.8)))
  if (t < F0) return zoom(HALL_VIEW, HALL_END, ramp(t, 164.8, F0))
  if (t < F1 + 0.5) return zoom(HALL_END, TOWN, ease(ramp(t, F0, F1 + 0.5)))
  return TOWN
}

/* ── A frame from heist 3 on ─────────────────────────────────────────── */

function later({ time: t, score, uid }) {
  const c = camOf(camLater(t))
  let body = ''
  let top = ''
  // What is already in the town: jobs 1 and 2, the first getaway, chase 1 fading.
  body += plan(drawn(1), c, t, `${uid}-j1`) + ownerSvg(c, t) + crewSvg(c, t, uid) + travel(c, t)
  body += noHeads(plan(overlay(t), c, t, `${uid}-j2`))
  const fade1 = 1 - ramp(t, 101, 106)
  if (fade1 > 0) {
    body += redTrail(c, ROUTE1.walked(t), 'solid', fade1) + redTrail(c, ROUTE2.walked(t), 'dash', fade1)
    body += cop(c, COP, t, { trailOp: 0.8 * fade1, show: false })
  }
  // Heist 3.
  const j3 = plan(STUDIO3, c, Math.min(t, 121.5), `${uid}-j3`)
  body += t < 121.5 ? j3 : noHeads(j3)
  // Chase 2, and the pressing plant they hide in.
  if (t >= 129.4) body += plan(inked(PLANT, ease(ramp(t, 129.4, 131.4))), c, t, `${uid}-pp`)
  if (t >= C2[0] - 0.5) {
    for (const k of CHASE2) {
      const w = k.route.walked(t)
      body += redTrail(c, w, k.style)
      if (!w || t >= C2[1]) continue
      top += t > HIDE2[0] + 0.3 && t < HIDE2[1] ? hiding(c, w.at(-1)) : head(c, w.at(-1), k.n)
    }
    const looking = t >= COP_LOOP[0] && t < COP_LOOP[1] ? heading(COP2, t) - 90 : undefined
    body += cop(c, COP2, Math.min(t, 138.2), { look: looking, trailOp: 0.8 * (1 - ramp(t, 140, 144)), show: t < 138.2 })
  }
  // Heist 4, drawn on as the camera lands, with the police at the door.
  if (t >= 137.0) {
    const j4 = plan(inked(MUSEUM4, ease(ramp(t, 137.2, AT_MUSEUM - 0.3))), c, Math.min(t, T4[1] + 0.2), `${uid}-j4`)
    body += t < T4[1] ? j4 : noHeads(j4)
    const copOp = 0.8 * (1 - ramp(t, e4(166), e4(170)))
    body += cop(c, COP4A, Math.min(t, e4(161.5)), { trailOp: copOp, show: t < e4(161.5) })
    body += cop(c, COP4B, Math.min(t, e4(164)), { trailOp: copOp, show: t < e4(164) })
    if (t >= CAR_OUT) {
      const w = CAR.walked(t)
      body += redTrail(c, w, 'longdash')
      if (t < 164.5) top += head(c, w.at(-1), 4)
    }
  }
  // Heist 5, the hall drawn on as the camera lands.
  if (t >= 162.4) {
    const j5 = plan(inked(HALL5, ease(ramp(t, 162.6, 164.6))), c, Math.min(t, T5[1]), `${uid}-j5`)
    body += t < F0 ? j5 : noHeads(j5)
  }
  // The final chase.
  if (t >= F0 - 0.2) {
    for (const k of FINAL_RUNS) {
      const w = k.route.walked(t)
      body += redTrail(c, w, k.style)
      if (!w) continue
      // Gone into the anchor as it completes.
      const gone = 1 - ramp(t, k.route.to - 0.2, k.route.to + 1.2)
      if (gone > 0) top += head(c, w.at(-1), k.n, gone)
    }
    const copOp = 0.8 * (1 - ramp(t, 214, 222))
    for (const route of COPS_F) body += cop(c, route, t, { trailOp: copOp, show: t < 222 })
  }

  // Key and title, per stretch.
  let s
  const plates = (job, titles, a, b) => ({ job, titles, chrome: Math.min(ramp(t, a, a + 1.2), 1 - ramp(t, b - 1.2, b)) })
  if (t < C2[0]) s = plates(KEY3, S0.sheet, T3 - 0.6, C2[0] + 0.6)
  else if (t < T4[0]) s = { job: KEY_C2, titles: S0.sheet, chrome: 0, key: Math.min(ramp(t, C2[0], C2[0] + 1.2), 1 - ramp(t, C2[1] - 1.2, C2[1])) }
  else if (t < T5[0]) s = plates(KEY4, M0.sheet, T4[0], e4(162))
  else if (t < F0) s = plates(KEY5, H0.sheet, T5[0], F0 + 0.4)
  else {
    const career = ramp(t, F1, F1 + 2)
    s = { job: KEY_F, titles: ['THE CAREER', 'JOBS 1–5 · 1968–1975', 'SHEET 6/6'], chrome: career, key: Math.min(ramp(t, F0, F0 + 1.2), 1 - career) }
  }
  return { svg: sheet({ c, uid, time: t, score, body: body + top, ...s }), label: 'Conman' }
}

/* ── The opening and the end card ────────────────────────────────────── */

const easeInOut = (u) => (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2)
function openingSvg(time, uid) {
  const O = OPENING
  const black = 1 - ramp(time, ...O.reveal)
  if (black <= 0.001) return ''
  const markOn = 1 - ramp(time, ...O.markOut)
  const mark = time >= O.mark && markOn > 0.001
    ? `<g transform="translate(800 450) scale(${r(520 / 918, 5)}) translate(-459 -309.5)" style="color:${PAPER}" opacity="${r(easeInOut(markOn), 3)}">${markDrawnAt(Math.min(time - O.mark, MARK_DRAW.done), `${uid}-mark`)}</g>`
    : ''
  const title = time >= O.title[0] ? drawLines(TITLES.conman, easeInOut(ramp(time, ...O.title)), PAPER, `${uid}-title`) : ''
  return `<g opacity="${r(easeInOut(black), 4)}"><rect width="1600" height="900" fill="${INK}"/>${mark}${title}</g>`
}

/** The film. */
export function conmanFilm({ time, score, lockup = '', uid = 'film' }) {
  if (time >= END_CARD) {
    return { label: 'End card', svg: `<rect width="1600" height="900" fill="${END_BLACK}"/><g transform="translate(800 450) scale(${r(500 / 918, 5)}) translate(-459 -309.5)" style="color:${END_INK}">${lockup}</g>` }
  }
  let f
  if (time < 42.3) f = motionOrbit({ time, score, uid })
  else if (time < 77) f = seqBridge({ time, score, uid })
  else if (time < T3) f = chaseAbove({ time, score, uid })
  else f = later({ time, score, uid })
  return time < OPENING.reveal[1] ? { ...f, svg: f.svg + openingSvg(time, uid), label: 'Opening' } : f
}
/** Seconds an export holds on the end card after the record. */
conmanFilm.hold = 4

/** For the page: the moments to jump to. */
export const FILM_BEATS = [
  { at: 0, label: 'Opening' },
  { at: 14, label: 'Heist 1 · the record shop' },
  { at: 42, label: 'Over the bridge' },
  { at: 55, label: 'Heist 2 · the counting house', key: true },
  { at: 76, label: 'Police chase 1' },
  { at: 98, label: 'Heist 3 · the studio' },
  { at: 121, label: 'Chase 2 · the pressing plant' },
  { at: 139, label: 'Heist 4 · the museum', key: true },
  { at: 158, label: 'Down High Street' },
  { at: 164, label: 'Heist 5 · the concert hall' },
  { at: 187, label: 'The final chase', key: true },
  { at: 222, label: 'The anchor' },
]
void COVER_SHEET
void lerp
