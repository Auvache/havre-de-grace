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
 * This file is the heists only: between them the camera crosses the town
 * alone. The drive, the two chases, the police in jobs 4 and 5 and the
 * countdown come next, on routes checked against water and buildings.
 */
import { INK, PAPER } from '../../album.mjs'
import { wall, merge, box } from '../conman-heists/shop.mjs'
import { plan, timing } from '../conman-heists/motion.mjs'
import { inked } from '../conman-heists/sequence.mjs'
import { overlay, KEY2, SHEET2, ARRIVE } from '../conman-heists/job2.mjs'
import { legend } from '../conman-heists/atlas-plan.mjs'
import { titleBlock, north } from '../conman-heists/styles.mjs'
import { STUDIO3, MUSEUM4, HALL5, KEY3, KEY4, KEY5, openingSvg, END_CARD, conmanFilm } from '../conman-heists/film.mjs'
import { HILLTOP } from './city.mjs'
import { cam, town, sheet, CITY, REGION, r } from './atlas.mjs'

const clamp01 = (v) => Math.max(0, Math.min(1, v))
const ramp = (t, a, b) => clamp01((t - a) / (b - a))
const ease = (u) => (u < 0.5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2)

/* ── Where each plan stands (its own origin, in film metres) ─────────── */

export const O1 = [-230, -741.5]
export const O2 = [-302, -38]
export const O3 = [744, -682]
export const O4 = HILLTOP
export const O5 = [400, 88]

/** Names of streets and places, which the town does not have. */
const NAMES = new Set(['MAIN STREET', 'HIGH STREET', 'HIGH ST.', 'WEST CIRCLE', 'THE CRESCENT', 'THE PROMENADE', 'THE CIRCUS', 'THE HILL', 'BACK LANE', 'FLUKE ROAD', 'PIER ROAD'])
const unnamed = (job) => ({ ...job, rooms: (job.rooms ?? []).filter((w) => !NAMES.has(w[2])), marks: (job.marks ?? []).filter((w) => !NAMES.has(w[2])) })
const moved = (job, o) => unnamed({ ...job, o })

/* ── Heist 1: the record shop, on its corner ─────────────────────────── */

const SHOP_FROM = 19.2
const SHOP_TO = 42.3
/** A route point pinned to the record: [x, y, hold, note, flag, at]. */
const pin = (x, y, at, hold = 0, note = null) => [x, y, hold, note, null, at]
/*
 * The owner, choreographed to the conman: at the counter, off to the stock
 * room for a box on "Bottled lightning" (35.0), at its door at 36.6 (the
 * conman's cue), back at the counter once the conman has gone.
 */
const OWNER_GO = [[14.16, 5.5], [22.3, 5.5], [22.3, 2.9], [23.67, 2.3]]
const goT = timing(OWNER_GO.map((p, i) => [p[0], p[1], 0, null, null, [null, 36.6, 37.2, 37.6][i]]), 35.0, 37.6)
const backT = timing(OWNER_GO.slice().reverse(), 41.4, 44.8)
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
  owners: [{ route: { at: (t) => (t < 41.4 ? goT.at(t) : backT.at(t)) } }],
  /*
   * He comes up the side street from below the frame, turns the corner and
   * stands outside the door from 21.6; in on the first line (23.3); browses,
   * talks shop until the owner is at the stock-room door (36.6), then round
   * the counter at a run, the safe (38.2–39.0), out of the staff door onto the
   * side street by 41.4, where the car picks him up.
   */
  crew: [{ n: 1, role: 'The conman', style: 'solid', from: SHOP_FROM, to: SHOP_TO, pts: [
    [-10, 23], [-10, 18.6], pin(5, 16.4, 20.9), pin(13, 16, 21.6, 1.7),
    [13, 11.5], [18.75, 10.5], [21.8, 10.3], pin(21.8, 8.3, 26.4, 3, 'browses'), [21.8, 10.3], [16.07, 10.1], pin(14.16, 7.1, 30.6, 0, 'talks shop'),
    pin(14.16, 7.1, 36.6), pin(7.98, 7.1, 37.2),
    [7.98, 5.5], [13.17, 5.5], [13.17, 3.7], pin(13.32, 2.0, 38.2, 0.8, 'opens the safe'), [13.17, 3.7], [13.17, 5.5],
    [3.24, 5.5], [3.24, 3.3], [1.11, 3.3], [-3.07, 3.3], pin(-5.6, 3.3, 41.4),
  ] }],
}

/* ── Heists 2–5: moved as they are ───────────────────────────────────── */

const job2At = (t) => moved(overlay(t), O2)
/** Crew stand at the start of their routes from `wait`, as they did at the end of v2's chases. */
const waiting = (crew, wait, who) => crew.map((cr) => (who.includes(cr.n) && cr.wait == null ? { ...cr, wait } : cr))
const STUDIO = moved({ ...STUDIO3, crew: waiting(STUDIO3.crew, 98.4, [1, 2]) }, O3)
const MUSEUM = moved({ ...MUSEUM4, crew: waiting(MUSEUM4.crew, 139.2, [1, 2, 3]) }, O4)
/** By when they joined: the driver (at the museum) is 4, the stagehand 5. */
const renumber = (crew) => crew.map((cr) => (cr.n === 4 ? { ...cr, n: 5 } : cr.n === 5 ? { ...cr, n: 4 } : cr)).sort((a, b) => a.n - b.n)
const HALL = moved({ ...HALL5, crew: renumber(waiting(HALL5.crew, 164.5, [2, 3])) }, O5)
/** The police are not in the keys yet: they come with the chases. */
const noPolice = (key) => ({ ...key, figures: (key.figures ?? []).filter((f) => f.label !== 'The police') })
const KEYS = { 3: noPolice(KEY3), 4: noPolice(KEY4), 5: noPolice({ ...KEY5, crew: renumber(KEY5.crew) }) }

/* ── When, and from where ────────────────────────────────────────────── */

/** Each heist: when its plan is inked, when its people are on it, and the view it is seen from. */
const view = (o, v) => ({ cx: o[0] + v[0], cy: o[1] + v[1], s: v[2] })
export const HEISTS = [
  { no: 1, ink: [14.4, 20.2], on: [SHOP_FROM, 45], chrome: [20.4, 44.5], v: view(O1, SHOP.view), job: () => SHOP, key: SHOP, sheet: SHOP.sheet },
  { no: 2, ink: [48.4, 52.8], on: [ARRIVE, 78], chrome: [56.2, 77], v: view(O2, [19.4, 16.8, 19]), job: job2At, key: KEY2, sheet: SHEET2 },
  { no: 3, ink: [95, 98], on: [98.4, 122.6], chrome: [99.4, 122], v: view(O3, [24, 28, 12.6]), job: () => STUDIO, key: KEYS[3], sheet: STUDIO.sheet },
  { no: 4, ink: [137.2, 138.9], on: [139.2, 159], chrome: [140.2, 158.6], v: view(O4, [6, 1, 8.4]), job: () => MUSEUM, key: KEYS[4], sheet: MUSEUM.sheet },
  { no: 5, ink: [162.6, 164.6], on: [164.5, 189], chrome: [164.2, 188.4], v: view(O5, [0, 22, 8.6]), job: () => HALL, key: KEYS[5], sheet: HALL.sheet },
]
/** Between two views, as a zoom should travel: scale in log, the centre moving in step with it. */
function zoom(a, b, u) {
  const s = Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * u)
  const k = Math.abs(a.s - b.s) < 1e-9 ? u : (1 / a.s - 1 / s) / (1 / a.s - 1 / b.s)
  return { cx: a.cx + (b.cx - a.cx) * k, cy: a.cy + (b.cy - a.cy) * k, s }
}
/** A view that holds two heists, with room round them. */
const both = (a, b) => {
  const [p, q] = [HEISTS[a - 1].v, HEISTS[b - 1].v]
  return { cx: (p.cx + q.cx) / 2, cy: (p.cy + q.cy) / 2, s: Math.min(1.9, 1532 / (Math.abs(p.cx - q.cx) + 420), 776 / (Math.abs(p.cy - q.cy) + 300)) }
}
const V = (n) => HEISTS[n - 1].v
/** [from, to, view]: held from `from` to `to`; eased between one hold and the next. */
const HOLDS = [
  [0, 11, { cx: V(1).cx + 60, cy: V(1).cy + 40, s: 2.2 }],
  [17.2, 42.6, V(1)],
  [46.4, 49, both(1, 2)], [54, 77, V(2)],
  [80.6, 94.6, both(2, 3)], [98.4, 122, V(3)],
  [125, 136.2, both(3, 4)], [139.2, 158.4, V(4)],
  [160.4, 162.6, both(4, 5)], [164.8, 188.2, V(5)],
  [198, 221, CITY],
  [231, 999, REGION],
]
function viewAt(t) {
  for (let i = 0; i < HOLDS.length; i++) {
    const [from, to, v] = HOLDS[i]
    if (t < from) { const [, was, u] = HOLDS[i - 1]; return zoom(u, v, ease(ramp(t, was, from))) }
    if (t <= to) return v
  }
  return REGION
}

/* ── A frame ─────────────────────────────────────────────────────────── */

const bare = (job) => ({ ...job, crew: [], figures: [], owners: [], owner: null })
const inView = (c, o, pad = 110) => o[0] > c.view.x0 - pad && o[0] < c.view.x1 + pad && o[1] > c.view.y0 - pad && o[1] < c.view.y1 + pad

export function heistsFilm({ time, score, lockup = '', uid = 'film' }) {
  if (time >= END_CARD) return conmanFilm({ time, score, lockup, uid })
  const t = time
  const v = viewAt(t)
  const c = cam(v.cx, v.cy, v.s)
  const { svg: townSvg, lib } = town(c, uid, { sites: false })
  let body = `<g opacity="0.55">${townSvg}</g>`
  let furniture = ''
  // Under about 4 km across the plans are part of the drawing; further out they are the town's blocks again.
  const plans = ramp(c.s, 0.3, 0.4)
  for (const h of HEISTS) {
    if (t < h.ink[0] || plans <= 0) continue
    const job = h.job(Math.min(t, h.on[1]))
    if (inView(c, job.o)) {
      const p = ease(ramp(t, ...h.ink))
      // Its people are on it for the heist; afterwards the building stays and the trails go.
      const done = ramp(t, h.on[1], h.on[1] + 1.2)
      const drawn = p < 1 ? inked(job, p) : job
      const part = (j, k, op) => (op <= 0 ? '' : `<g opacity="${r(op * plans, 3)}">${plan(j, c, t, `${uid}-h${h.no}${k}`)}</g>`)
      body += done <= 0 ? part(drawn, 'a', 1) : part(bare(job), 'b', 1) + part(drawn, 'a', 1 - done)
    }
    const chrome = Math.min(ramp(t, h.chrome[0], h.chrome[0] + 1.2), 1 - ramp(t, h.chrome[1], h.chrome[1] + 1.2))
    if (chrome > 0) furniture += `<g opacity="${r(chrome, 3)}">${north()}${titleBlock(h.sheet)}${legend({ ...h.key, figures: h.key.figures ?? [], owners: h.key.owners ?? [] })}</g>`
  }
  const label = HEISTS.findLast((h) => t >= h.ink[0])
  const frame = { svg: sheet({ uid, time: t, score, body: body + furniture }), lib, label: label ? `Heist ${label.no}` : 'The town' }
  return t < 12 ? { ...frame, svg: frame.svg + openingSvg(t, uid), label: 'Opening' } : frame
}
/** Seconds an export holds on the end card after the record. */
heistsFilm.hold = 4

/** For the page: the moments to jump to. */
export const FILM_BEATS = [
  { at: 0, label: 'Opening' },
  { at: 14, label: 'Heist 1 · the record shop' },
  { at: 55, label: 'Heist 2 · the counting house', key: true },
  { at: 98, label: 'Heist 3 · the studio' },
  { at: 139, label: 'Heist 4 · the museum', key: true },
  { at: 164, label: 'Heist 5 · the concert hall' },
  { at: 198, label: 'The whole town' },
  { at: 222, label: 'The region', key: true },
]
void INK
void PAPER
