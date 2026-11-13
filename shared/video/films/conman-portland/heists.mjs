/*
 * Conman on the Portland map — the five heists on their lots (2026-11-09).
 *
 * The heists are v2's, as the user wants them: the same rooms, people and
 * timing, each pinned to its verse. What changes is where they stand:
 *
 *   1  the record shop      redrawn for an ordinary street corner. v2's shop
 *                           followed a traffic circle; this is that plan
 *                           unrolled (an arc of radius R at angle θ becomes
 *                           x = (−28 − θ) × 0.7636, y = 49.5 − R) and turned
 *                           over left to right, so the staff door opens on the
 *                           side street instead of into the neighbour
 *   2  the counting house   as drawn, on the north side of the main street
 *   3  the studio           as drawn, its back lane now the side street
 *   4  the museum           as drawn, on the hilltop inside its ring road
 *   5  the concert hall     as drawn, its stage door on the street
 *
 * Nothing on the town is named (the user, 2026-11-09), so the plans' street
 * names are taken off. Crew numbers are by when they joined: 4 is the driver,
 * 5 the stagehand.
 *
 * Between and around them (2026-11-10; who goes where is story.mjs, how they
 * are drawn is travel.mjs): the drive from 1 to 2, a chase on foot from 2
 * to 3 and from 3 to 4, the police at the museum, the drive to the hall,
 * the police round the hall, the arrests, and No. 1's run under one even
 * pull-out to the whole town, which is where the film ends. Nobody is drawn
 * as a car (the user, 2026-11-12): a driver is his own dot.
 *
 * The camera has three distances: a plan, a wide view that holds a whole
 * trip, and the town. It goes plan → wide → plan; nothing follows a dot.
 */
import { RED } from '../../album.mjs'
import { wall, merge, box } from '../conman-heists/shop.mjs'
import { plan, timing } from '../conman-heists/motion.mjs'
import { inked } from '../conman-heists/sequence.mjs'
import { overlay, KEY2, SHEET2, ARRIVE } from '../conman-heists/job2.mjs'
import { legend } from '../conman-heists/atlas-plan.mjs'
import { titleBlock, north } from '../conman-heists/styles.mjs'
import { STUDIO3, MUSEUM4, HALL5, KEY3, KEY4, KEY5, openingSvg, END_CARD, conmanFilm } from '../conman-heists/film.mjs'
import { cam, town, sheet, CITY, r } from './atlas.mjs'
import { MOVERS } from './story.mjs'
import { T, zoomU, O1, O2, O3, O4, O5, VIEWS, HOLDS, viewAt } from './camera.mjs'
import { trail, head, hiding, officer } from './travel.mjs'

export { O1, O2, O3, O4, O5, viewAt }

const clamp01 = (v) => Math.max(0, Math.min(1, v))
const ramp = (t, a, b) => clamp01((t - a) / (b - a))
const ease = (u) => (u < 0.5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2)
const lerp = (a, b, u) => a + (b - a) * u

/** Names of streets and places, which the town does not have. */
const NAMES = new Set(['MAIN STREET', 'HIGH STREET', 'HIGH ST.', 'WEST CIRCLE', 'THE CRESCENT', 'THE PROMENADE', 'THE CIRCUS', 'THE HILL', 'BACK LANE', 'FLUKE ROAD', 'PIER ROAD'])
const unnamed = (job) => ({ ...job, rooms: (job.rooms ?? []).filter((w) => !NAMES.has(w[2])), marks: (job.marks ?? []).filter((w) => !NAMES.has(w[2])) })
const moved = (job, o) => unnamed({ ...job, o })

/* ── Heist 1: the record shop, on its corner ─────────────────────────── */

const SHOP_FROM = T.atShop
const SHOP_TO = T.inCar1
/** A route point pinned to the record: [x, y, hold, note, flag, at]. */
const pin = (x, y, at, hold = 0, note = null) => [x, y, hold, note, null, at]
/*
 * The owner, choreographed to the conman: at the counter, off to the stock
 * room for a box at 0:33 (the user, 2026-11-10: the two of them stood still
 * too long; it was 0:35), at its door at 34.6 (the conman's cue), back at the
 * counter once the conman has gone.
 */
const OWNER_GO = [[14.16, 5.5], [22.3, 5.5], [22.3, 2.9], [23.67, 2.3]]
const GOES = T.ownerGoes
const goT = timing(OWNER_GO.map((p, i) => [p[0], p[1], 0, null, null, [null, GOES + 1.6, GOES + 2.2, GOES + 2.6][i]]), GOES, GOES + 2.6)
const backT = timing(OWNER_GO.slice().reverse(), T.shopOut, T.shopOut + 3.4)
const SHOP = {
  key: 'corner', o: O1, sheet: ['THE RECORD SHOP', 'JOB No. 1 · 1968', 'SHEET 1/6'], view: [13, 7.5, 20],
  foot: [box(-0.4, -0.4, 26.4, 11.9)],
  walls: merge(
    wall('ext', [0, 11.5], [26, 11.5], [[0.76, 10.23, 'g'], [11.3, 14.66, -1], [15.73, 25.2, 'g']]),
    wall('ext', [0, 0], [26, 0]),
    wall('ext', [26, 11.5], [26, 0]),
    wall('ext', [0, 11.5], [0, 0], [[7.4, 8.6, 1]]),
    wall('int', [0, 4.9], [26, 4.9], [[2.18, 4.31, -1], [12.1, 14.24, -1], [21.27, 23.4, -1]]),
    wall('int', [7.64, 4.9], [7.64, 0]),
    wall('int', [18.33, 4.9], [18.33, 0]),
  ),
  tone: [box(0, 0, 26, 4.9)],
  items: [
    ...[2.71, 5.77, 20.27, 23.33].map((x) => ({ k: 'bins', x: x - 0.375, y: 6.7, w: 0.75, h: 3.2 })),
    { k: 'rect', x: 8.82, y: 5.85, w: 8.4, h: 0.7, label: 'COUNTER', side: 'below' },
    { k: 'rect', x: 19.13, y: 0.3, w: 6.1, h: 0.6 },
    { k: 'take', x: 12.3, y: 0.7, w: 1.4, h: 1.0, label: 'THE MASTERS', side: 'left' },
  ],
  rooms: [[20.1, 2.2, 'STOCK'], [15.9, 3.3, 'OFFICE'], [5.8, 1.7, 'STAFF'], [13, 9.5, 'SHOP FLOOR']],
  marks: [[13, -1.7, 'BRICK · 1 ST.'], [5.5, 13, 'PLATE GLASS'], [20.5, 13, 'PLATE GLASS']],
  storeys: [[-1.9, 9.8, '1']],
  dims: [],
  owners: [{ route: { at: (t) => (t < T.shopOut ? goT.at(t) : backT.at(t)) } }],
  /*
   * He comes up the side street from below the frame (story.mjs brings him
   * as far as this route's first point, and takes him on from its last),
   * turns the corner and stands outside the door from 21.6; in on the first
   * line (23.3); browses, talks shop until the owner is at the stock-room
   * door (34.6), then round the counter at a run, the safe (36.2–37.0), out
   * of the staff door onto the side street by 39.4 and back down it (41.2).
   */
  crew: [{ n: 1, role: 'The conman', style: 'solid', from: SHOP_FROM, to: SHOP_TO, pts: [
    [-10, 33], pin(-10, 23, 19.2), [-10, 18.6], pin(5, 16.4, 20.9), pin(13, 16, 21.6, 1.7),
    [13, 11.5], [18.75, 10.5], [21.8, 10.3], pin(21.8, 8.3, 26.4, 3, 'browses'), [21.8, 10.3], [16.07, 10.1], pin(14.16, 7.1, 30.6, 0, 'talks shop'),
    pin(14.16, 7.1, GOES + 1.6), pin(7.98, 7.1, GOES + 2.2),
    [7.98, 5.5], [13.17, 5.5], [13.17, 3.7], pin(13.32, 2.0, GOES + 3.2, 0.8, 'opens the safe'), [13.17, 3.7], [13.17, 5.5],
    [3.24, 5.5], [3.24, 3.3], [1.11, 3.3], [-3.07, 3.3], pin(-5.6, 3.3, T.shopOut), [-10, 7.5], pin(-10, 33, T.inCar1),
  ] }],
}

/* ── Heists 2–5: moved as they are ───────────────────────────────────── */

const job2At = (t) => moved(overlay(t), O2)
/** Crew stand at the start of their routes from `wait`, as they did at the end of v2's chases. */
const waiting = (crew, wait, who) => crew.map((cr) => (who.includes(cr.n) && cr.wait == null ? { ...cr, wait } : cr))
/*
 * The studio (the user, 2026-11-10): all three are out before the police
 * come. The conman leaves the control-room door for the back door and joins
 * the auditor in the lane (123.5); the engineer, out at the front, steps
 * into the street.
 * The auditor had his own wait from v2 (99.85), so `waiting` left him off
 * the sheet from 98.4 to 99.85 (the user, 2026-11-13: "coman 2 disappears
 * for a second"); he stands at the corner from 98.4 like the conman.
 */
const studioCrew = waiting(STUDIO3.crew, 98.4, [1, 2]).map((cr) => {
  if (cr.n === 2) return { ...cr, wait: 98.4 }
  if (cr.n === 1) return { ...cr, to: 123.5, pts: [...cr.pts, pin(30.8, 18.6, 121.9), pin(46, 18.5, 122.8), [50.2, 18.4], pin(57.6, 19.4, 123.5)] }
  if (cr.n === 3) return { ...cr, to: 122.2, pts: [...cr.pts, pin(7, 41, 122.2)] }
  return cr
})
const STUDIO = moved({ ...STUDIO3, crew: studioCrew }, O3)
/*
 * The museum: the auditor, who cut the power from the park, walks round to
 * the bay and the driver with the others. They leave a second sooner than
 * they did (the user, 2026-11-12), and the second comes out of standing
 * still, so nothing before it moves: the conman is a second less at the
 * bay's bolts, the auditor a second less at the substation, and the driver,
 * who is out of the frame when he sets off, sets off a second sooner.
 */
const SOONER4 = 158.5 - T.car45[0]
const museumCrew = waiting(MUSEUM4.crew, 139.2, [1, 2, 3]).map((cr) => {
  if (cr.n === 1) return { ...cr, to: cr.to - SOONER4, pts: cr.pts.map((p) => (p[3] === 'unbolts the bay' ? [p[0], p[1], p[2] - SOONER4, ...p.slice(3)] : p)) }
  if (cr.n === 4) return { ...cr, from: cr.from - SOONER4, to: cr.to - SOONER4 }
  if (cr.n !== 2) return cr
  const last = cr.pts.at(-1)
  return { ...cr, to: 157.6 - SOONER4, pts: [...cr.pts.slice(0, -1), [last[0], last[1], 2.8 - SOONER4, null, null, cr.to], [52, -30], [56, -12], pin(54.6, -4.2, 157.6 - SOONER4)] }
})
const MUSEUM = moved({ ...MUSEUM4, crew: museumCrew }, O4)
/** By when they joined: the driver (at the museum) is 4, the stagehand 5. */
const renumber = (crew) => crew.map((cr) => (cr.n === 4 ? { ...cr, n: 5 } : cr.n === 5 ? { ...cr, n: 4 } : cr)).sort((a, b) => a.n - b.n)
/*
 * The hall (the user, 2026-11-10). The driver waits along the lane and is
 * taken there at 2:55: he is on the plan until then (176.5) and gone
 * after. The performer, locked out, walks round to the front and stops at
 * the officer posted by the door (186.0); that is what sends them in.
 */
const hallCrew = renumber(waiting(HALL5.crew, 164.5, [2, 3])).map((cr) => (cr.n === 4
  ? { ...cr, to: T.arrest4[1], pts: [cr.pts[0], [cr.pts[1][0], cr.pts[1][1], 0, null, null, 168.5]] }
  : cr))
const performer = { ...HALL5.figures[0], pts: HALL5.figures[0].pts.slice(0, -3) }
const HALL = moved({ ...HALL5, crew: hallCrew, figures: [performer] }, O5)
const HALL_AFTER = { ...HALL, crew: HALL.crew.filter((cr) => cr.n !== 4) }
const KEYS = { 3: KEY3, 4: KEY4, 5: { ...KEY5, crew: renumber(KEY5.crew) } }

/* ── When, and from where ────────────────────────────────────────────── */

/** Each heist: when its plan is inked, when its people are on it, and the view it is seen from (camera.mjs). */
export const HEISTS = [
  { no: 1, ink: [14.4, 20.2], on: [SHOP_FROM, SHOP_TO], chrome: [20.4, 39.6], v: VIEWS[0], job: () => SHOP, key: SHOP, sheet: SHOP.sheet },
  { no: 2, ink: [48.4, 52.8], on: [ARRIVE, T.chase1], chrome: [56.2, 75.4], v: VIEWS[1], job: job2At, key: KEY2, sheet: SHEET2 },
  { no: 3, ink: [95, 98], on: [98.4, T.out3 + 0.1], chrome: [99.4, 121.8], v: VIEWS[2], job: () => STUDIO, key: KEYS[3], sheet: STUDIO.sheet },
  { no: 4, ink: [137.2, 138.9], on: [139.2, T.car45[0]], chrome: [140.2, T.car45[0] - 0.9], v: VIEWS[3], job: () => MUSEUM, key: KEYS[4], sheet: MUSEUM.sheet },
  // The hall is drawn from a second sooner, finishing as before (the user, 2026-11-13: it felt rushed).
  { no: 5, ink: [161.6, 164.6], on: [164.5, T.raid], chrome: [164.2, T.raid - 0.6], v: VIEWS[4], job: (t) => (t < T.arrest4[1] ? HALL : HALL_AFTER), key: KEYS[5], sheet: HALL.sheet },
]
/*
 * Hatching (the user, 2026-11-10: the museum's north wall "shakes" as the
 * camera lands). Brick was ruled on the screen, so it slid against every
 * wall while the camera moved. It is ruled on the ground now: at each hold
 * exactly as before (a line every three pixels), and between holds fixed to
 * the buildings, thinning or thickening by halves. The change of ruling
 * from one hold's to the next happens in the middle of a move, where the
 * camera is fastest; in the last pull-out it is spread over the whole move.
 */
const smooth = (u, a, b) => { const x = clamp01((u - a) / (b - a)); return x * x * (3 - 2 * x) }
const phaseOf = (s) => { const L = Math.log2(1 / s); return Math.round(L) - L }
function hatchAt(t, s) {
  let phi = 0
  let about = HOLDS[0][2]
  for (let i = 0; i < HOLDS.length; i++) {
    const [from, to, v, how] = HOLDS[i]
    if (t < from) {
      const [, was, u] = HOLDS[i - 1]
      const w = how === 'even' ? zoomU(t) : smooth(ramp(t, was, from), 0.35, 0.65)
      const pa = phaseOf(u.s)
      let pb = phaseOf(v.s)
      if (pb - pa > 0.5) pb -= 1
      if (pb - pa < -0.5) pb += 1
      phi = lerp(pa, pb, w)
      about = how === 'even' || w < 0.5 ? u : v
      break
    }
    phi = phaseOf(v.s)
    about = how === 'even' ? HOLDS[i - 1][2] : v
    if (t <= to) break
  }
  const L = Math.log2(1 / s) + phi
  const n = Math.round(L)
  return { m: 2 ** (n - phi), k: 2 ** (n - L), b: 1 - smooth(L - n, 0.25, 0.5), ax: about.cx, ay: about.cy }
}

/* ── Everyone between the heists ─────────────────────────────────────── */

const { x0: PLATE_X0, x1: PLATE_X1, y0: PLATE_Y0, y1: PLATE_Y1 } = { x0: -40, x1: 1640, y0: -40, y1: 940 }
const onSheet = (c, p) => { const [x, y] = [c.X(p[0]), c.Y(p[1])]; return x > PLATE_X0 && x < PLATE_X1 && y > PLATE_Y0 && y < PLATE_Y1 }
/** Everyone on the sheet at t, to go over the plans: trails, officers, heads. Whoever drives is a dot like the rest (story.mjs). */
function movers(c, t) {
  let [trails, cops, heads] = ['', '', '']
  for (const m of MOVERS) {
    if (t < Math.min(m.route.from, m.show[0])) continue
    const [a, b] = m.show
    const [fadeIn, fadeOut] = m.fade ?? [0, 0]
    const op = t < a || t > b ? 0 : Math.min(fadeIn ? ramp(t, a, a + fadeIn) : 1, fadeOut && b < Infinity ? 1 - ramp(t, b - fadeOut, b) : 1)
    if ((m.kind === 'crew' || m.kind === 'car') && m.trail !== false) trails += trail(c, m.route.walked(t), m.style ?? 'solid', m.sRef ?? 1, m.trail === 'fades' ? op : 1)
    if (op <= 0) continue
    const p = m.route.at(t)
    if (!onSheet(c, p)) continue
    if (m.kind === 'cop' || m.kind === 'copcar') cops += officer(c, p, op)
    else heads += m.hide && t >= m.hide[0] && t < m.hide[1] ? hiding(c, p, op) : head(c, p, m.n, op)
  }
  return trails + cops + heads
}
/** Who must be on the sheet when: [mover, from, to] (for the route check). */
export const MUST_SEE = [
  ['car1', 42.4, 54.2], ['pc1', 77.6, 78.2], ['run1', 78, 98.2], ['run2', 78.2, 98.3], ['cop1a', 78.7, 90],
  ['pc2', 123.2, 125.7], ['flee1', 123.7, 133], ['flee2', 123.8, 133], ['flee3', 123.5, 133],
  ['cop4a', 158.2, 160], ['car2', T.car45[0], 160.2], ['car2', 163.4, 164.4], ['pcA', 174.6, 177], ['copArrest', 175.3, 177], ['pcB', 175.8, 177],
  ['flee5', 190, 194.4], ['copE', 193.6, 194.4], ['flee3b', 199.6, 201.9], ['flee2b', 204.6, 206.7], ['pcD', 206.2, 206.7],
]

/* ── A frame ─────────────────────────────────────────────────────────── */

const bare = (job) => ({ ...job, crew: [], figures: [], owners: [], owner: null })
const inView = (c, o, pad = 110) => o[0] > c.view.x0 - pad && o[0] < c.view.x1 + pad && o[1] > c.view.y0 - pad && o[1] < c.view.y1 + pad
/** A plan without its crew's heads: once a heist is over they are in the car, or running. */
const noHeads = (svg) => svg.replace(new RegExp(`<circle[^>]*r="10.5" fill="${RED}"/><text[^>]*>\\d</text>`, 'g'), '')

export function heistsFilm({ time, score, lockup = '', uid = 'film' }) {
  if (time >= END_CARD) return conmanFilm({ time, score, lockup, uid })
  const t = time
  const v = viewAt(t)
  const c = cam(v.cx, v.cy, v.s)
  const ruled = hatchAt(t, c.s)
  const brick = { k: ruled.k, b: ruled.b, ox: c.X(ruled.ax), oy: c.Y(ruled.ay) }
  const { svg: townSvg, lib } = town(c, uid, { sites: false, hatch: ruled })
  let body = `<g opacity="0.55">${townSvg}</g>`
  let furniture = ''
  // Under about 4 km across the plans are part of the drawing; further out they are the town's blocks again.
  const plans = ramp(c.s, 0.3, 0.4)
  for (const h of HEISTS) {
    if (t < h.ink[0] || plans <= 0) continue
    const job = { ...h.job(Math.min(t, h.on[1])), hatch: brick }
    if (inView(c, job.o)) {
      const p = ease(ramp(t, ...h.ink))
      // Its people are on it for the heist; afterwards the building stays and their lines go.
      const done = ramp(t, h.on[1], h.on[1] + 1.2)
      const drawn = p < 1 ? inked(job, p) : job
      const part = (j, k, op) => (op <= 0 ? '' : `<g opacity="${r(op * plans, 3)}">${plan(j, c, Math.min(t, h.on[1]), `${uid}-h${h.no}${k}`)}</g>`)
      body += t < h.on[1] ? part(drawn, 'a', 1) : part(bare(job), 'b', 1) + noHeads(part(drawn, 'a', 1 - done))
    }
    const chrome = Math.min(ramp(t, h.chrome[0], h.chrome[0] + 1.2), 1 - ramp(t, h.chrome[1], h.chrome[1] + 1.2))
    if (chrome > 0) furniture += `<g opacity="${r(chrome, 3)}">${north()}${titleBlock(h.sheet)}${legend({ ...h.key, figures: h.key.figures ?? [], owners: h.key.owners ?? [] })}</g>`
  }
  body += movers(c, t)
  const label = HEISTS.findLast((h) => t >= h.ink[0])
  const frame = { svg: sheet({ uid, time: t, score, body: body + furniture }), lib, label: labelAt(t) ?? (label ? `Heist ${label.no}` : 'The town') }
  return t < 12 ? { ...frame, svg: frame.svg + openingSvg(t, uid), label: 'Opening' } : frame
}
const LABELS = [[T.drive12[0], 54, 'The drive'], [T.chase1, 98.4, 'Chase 1'], [T.out3, 139.2, 'Chase 2'], [T.car45[0], 164.5, 'To the hall'], [T.raid, 999, 'The end']]
const labelAt = (t) => LABELS.find(([a, b]) => t >= a && t < b)?.[2]
/** Seconds an export holds on the end card after the record. */
heistsFilm.hold = 4

/** For the page: the moments to jump to. */
export const FILM_BEATS = [
  { at: 0, label: 'Opening' },
  { at: 14, label: 'Heist 1 · the record shop' },
  { at: 41, label: 'The drive' },
  { at: 55, label: 'Heist 2 · the counting house', key: true },
  { at: 77, label: 'Chase 1' },
  { at: 98, label: 'Heist 3 · the studio' },
  { at: 122, label: 'Chase 2' },
  { at: 139, label: 'Heist 4 · the museum', key: true },
  { at: 164, label: 'Heist 5 · the concert hall' },
  { at: 175, label: 'The police' },
  { at: 188, label: 'The raid', key: true },
  { at: 225, label: 'The whole town' },
]
