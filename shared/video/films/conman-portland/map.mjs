/*
 * Conman on the Portland map — the map itself, before anything is moved onto
 * it (test, 2026-11-09). A tour on the song's clock that sits where each
 * part of the film will happen and at the distance it will be seen from:
 *
 *   0–12        the whole city
 *   12–42       down to lot 1 (street distance, then plan distance)
 *   42–77       across to lot 2
 *   77–100      back out over the way to lot 3 (a chase's distance), then in
 *   100–140     lot 3, out over the way to lot 4, in
 *   140–188     lot 4, the way to lot 5, lot 5
 *   188–222     out to the whole city
 *   222–232     out to the region: the Columbia, the mountain
 *
 * The numbers on the lots are for planning; the film has no names or numbers
 * on the town.
 */
import { SITES } from './city.mjs'
import { cam, town, sheet, CITY, REGION } from './atlas.mjs'

const ease = (u) => (u < 0.5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2)
const clamp01 = (v) => Math.max(0, Math.min(1, v))
/** Between two views, as a zoom should travel: scale in log, the centre moving in step with it. */
function zoom(a, b, u) {
  const s = Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * u)
  const k = a.s === b.s ? u : (1 / a.s - 1 / s) / (1 / a.s - 1 / b.s)
  return { cx: a.cx + (b.cx - a.cx) * k, cy: a.cy + (b.cy - a.cy) * k, s }
}
const mid = (st) => [st.o[0] + st.w / 2, st.o[1] + st.h / 2]
const street = (n) => ({ cx: mid(SITES[n - 1])[0], cy: mid(SITES[n - 1])[1], s: 1.9 })
const PLAN_S = [20, 19, 12.6, 8.4, 8.6]
const plan = (n) => ({ cx: mid(SITES[n - 1])[0], cy: mid(SITES[n - 1])[1], s: PLAN_S[n - 1] })
/** A view that holds two lots, with room round them. */
const both = (a, b) => {
  const [p, q] = [mid(SITES[a - 1]), mid(SITES[b - 1])]
  return { cx: (p[0] + q[0]) / 2, cy: (p[1] + q[1]) / 2, s: Math.min(1.9, 1532 / (Math.abs(p[0] - q[0]) + 420), 776 / (Math.abs(p[1] - q[1]) + 300)) }
}

/** [from, to, view]: held from `from` to `to`; eased between one hold and the next. */
const HOLDS = [
  [0, 12, CITY],
  [16, 19.4, street(1)], [22.4, 42.3, plan(1)],
  [45.4, 49, both(1, 2)], [54, 77, plan(2)],
  [80.6, 94.6, both(2, 3)], [98.4, 122, plan(3)],
  [125, 136.2, both(3, 4)], [139.2, 158.4, plan(4)],
  [160.4, 162.6, both(4, 5)], [164.8, 188.2, plan(5)],
  [198, 221, CITY],
  [231, 999, REGION],
]
const LABELS = ['The city', 'Lot 1', 'Lot 1', 'Lots 1 and 2', 'Lot 2', 'Lots 2 and 3', 'Lot 3', 'Lots 3 and 4', 'Lot 4', 'Lots 4 and 5', 'Lot 5', 'The city', 'The region']

function viewAt(t) {
  for (let i = 0; i < HOLDS.length; i++) {
    const [from, to, v] = HOLDS[i]
    if (t < from) { const [, was, u] = HOLDS[i - 1]; return { v: zoom(u, v, ease(clamp01((t - was) / (from - was)))), label: LABELS[i] } }
    if (t <= to) return { v, label: LABELS[i] }
  }
  return { v: REGION, label: 'The region' }
}

export function mapTour({ time, score, uid = 'film' }) {
  const { v, label } = viewAt(time)
  const c = cam(v.cx, v.cy, v.s)
  const { svg, lib } = town(c, uid, { sites: 'numbers' })
  return { svg: sheet({ uid, time, score, body: svg }), lib, label: `The map · ${label}` }
}

export const MAP_TESTS = [{ key: 'map', label: 'The new map · a tour', film: mapTour }]
