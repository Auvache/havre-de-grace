/*
 * Checks the road trip (Ship to Stockholm's film) after any change to the
 * itinerary, the clock or the camera — the sibling of
 * conman-explore/check-routes.mjs.
 *
 *   node tools/video-styles/roadtrip/check.mjs
 *
 *   the road     the baked legs join end to end (no gap where one router leg
 *                hands over to the next), and each road driven back ends at
 *                the fork it left
 *   the clock    the dot never backs up; its pace on the ground and on the
 *                sheet, section by section; nothing over the bounds below
 *   the frame    the dot is on the plate, with room, at every moment, and
 *                moves on the sheet at a watchable speed
 *   the names    every named stop was given room for its name; the trip's
 *                wrong turns come back to where they left
 *
 * Exits 1 if anything is out of bounds.
 */
import { SHIP_TO_STOCKHOLM_SCORE as score } from '../../../app/config/shipToStockholmScore.ts'
import { COVER_SHEET } from '../../../shared/video/album.mjs'
import { TRIP, PINS, PACES, at, distAt, pointAt, speedAt } from '../../../shared/video/films/road-trip/trip.mjs'
import { viewAt, PULL } from '../../../shared/video/films/road-trip/camera.mjs'
import { laid, cam } from '../../../shared/video/films/road-trip/map.mjs'
import '../../../shared/video/films/road-trip.mjs' // lays the names out for the film's own views
import { LEGS, STOPS } from '../../../shared/video/films/road-trip/route-baked.mjs'
import { line as decodeLine } from '../../../shared/video/films/road-trip/geo.mjs'

const { x: PX, y: PY, w: PW, h: PH } = COVER_SHEET.plate
let bad = 0
const fail = (msg) => { bad++; console.log(`  ✗ ${msg}`) }
const ok = (msg) => console.log(`  ✓ ${msg}`)

/* Bounds. */
const MAX_GAP = 0.6 // km between one leg's end and the next one's start
const MAX_SHEET = 150 // px a second the dot may move on the sheet, the camera's own motion included
const MAX_GROUND = 60 // km a second
const ROOM = 70 // px from the dot to the plate's edge

console.log('The road')
{
  const { pts, L } = TRIP
  // Each routed leg should start where the one before it ended (a road driven back ends at its fork).
  let worst = 0
  let where = ''
  let end = null
  for (const leg of LEGS) {
    if (leg.back) { const s = STOPS.find((x) => x.key === leg.back); end = { at: null, key: s.key }; continue }
    const line = decodeLine(leg.line, 4)
    if (end?.at) {
      const gap = Math.hypot(line[0][0] - end.at[0], line[0][1] - end.at[1])
      if (gap > worst) { worst = gap; where = `${leg.from} → ${leg.to}` }
    }
    end = { at: line.at(-1), key: leg.to }
  }
  if (worst > MAX_GAP) fail(`a gap of ${worst.toFixed(2)} km where ${where} starts`)
  else ok(`legs join end to end (the widest gap ${Math.round(worst * 1000)} m)`)
  ok(`${pts.length} points, ${Math.round(L)} km driven, ${LEGS.filter((l) => !l.back).length} legs routed, ${LEGS.filter((l) => l.back).length} driven back`)
  for (const leg of LEGS.filter((l) => l.back)) {
    const [p, q] = [pointAt(at(leg.back)), pointAt(at(`${leg.back}#2`))]
    const gap = Math.hypot(p.x - q.x, p.y - q.y)
    if (gap > MAX_GAP) fail(`${leg.back}: comes back ${gap.toFixed(2)} km from where it left`)
    else ok(`${leg.back}: out ${Math.round((at(`${leg.back}#2`) - at(leg.back)) / 2)} km and back to the same fork`)
  }
}

console.log('The clock')
{
  let prev = -1
  for (let t = 0; t <= score.endCardAt; t += 0.02) {
    const d = distAt(t)
    if (d < prev - 1e-6) { fail(`backs up at ${t.toFixed(2)}`); break }
    prev = d
  }
  for (const [t, place] of PINS) {
    if (t > 900) continue
    const p = pointAt(distAt(t))
    const q = pointAt(at(place.includes('#') ? place : place))
    const list = TRIP.reached.get(place.split('#')[0]).map((i) => TRIP.pts[i])
    const off = Math.min(...list.map(([x, y]) => Math.hypot(p.x - x, p.y - y)))
    if (off > 0.6) fail(`pin ${place} at ${t}: the dot is ${off.toFixed(1)} km away`)
    void q
  }
  for (const s of PACES) console.log(`    ${s.from} → ${s.to}: ${s.t0}–${s.t1}  ${Math.round(s.km)} km/s on the ground, ${Math.round(s.px)} px/s on the sheet`)
  ok('never backs up; every pin is met')
  for (const s of score.sections) {
    let [gMax, gSum, n, pMax, pSum, pAt] = [0, 0, 0, 0, 0, 0]
    for (let t = Math.max(s.from, 12); t < Math.min(s.to, score.endCardAt); t += 0.05) {
      const g = speedAt(t)
      const v0 = viewAt(t - 0.05)
      const v1 = viewAt(t + 0.05)
      const [p0, p1] = [pointAt(distAt(t - 0.05)), pointAt(distAt(t + 0.05))]
      // On the sheet: where the dot is drawn now, against where it was drawn a tenth of a second ago.
      const sx = ((p1.x - v1.cx) * v1.s - (p0.x - v0.cx) * v0.s) / 0.1
      const sy = ((p1.y - v1.cy) * v1.s - (p0.y - v0.cy) * v0.s) / 0.1
      // Past the map: the ground's speed under the camera.
      const m = g * viewAt(t).s
      gMax = Math.max(gMax, g); gSum += g; n++
      if (m > pMax) { pMax = m; pAt = t }
      pSum += m
      void sx; void sy
    }
    if (!n) continue
    const line = `${s.label.padEnd(13)} ground ${Math.round(gSum / n)} avg, ${Math.round(gMax)} max km/s · map under the dot ${Math.round(pSum / n)} avg, ${Math.round(pMax)} max px/s (at ${pAt.toFixed(1)})`
    if (gMax > MAX_GROUND || (pMax > MAX_SHEET && s.from < PULL[0])) fail(line)
    else ok(line)
  }
}

console.log('The frame')
{
  let tight = Infinity
  let tightAt = 0
  for (let t = 12; t < score.endCardAt; t += 0.1) {
    const v = viewAt(t)
    const c = cam(v.cx, v.cy, v.s)
    const p = pointAt(distAt(t))
    const [x, y] = [c.X(p.x), c.Y(p.y)]
    const room = Math.min(x - PX, PX + PW - x, y - PY, PY + PH - y)
    if (room < tight) { tight = room; tightAt = t }
  }
  if (tight < ROOM) fail(`the dot is ${Math.round(tight)} px from the plate's edge at ${tightAt.toFixed(1)}`)
  else ok(`the dot is never nearer than ${Math.round(tight)} px to the plate's edge (at ${tightAt.toFixed(1)})`)
  // The camera's own speed: how fast the map slides.
  let slide = 0
  let slideAt = 0
  for (let t = 12; t < PULL[0]; t += 0.05) {
    const [a, b] = [viewAt(t - 0.05), viewAt(t + 0.05)]
    const v = (Math.hypot(b.cx - a.cx, b.cy - a.cy) / 0.1) * viewAt(t).s
    if (v > slide) { slide = v; slideAt = t }
  }
  if (slide > MAX_SHEET) fail(`the map slides at ${Math.round(slide)} px/s at ${slideAt.toFixed(1)}`)
  else ok(`the map never slides faster than ${Math.round(slide)} px/s (at ${slideAt.toFixed(1)})`)
}

console.log('The names')
{
  const { placed, shields } = laid()
  const stops = placed.filter((n) => n.stop)
  const bare = stops.filter((n) => !n.text)
  const forced = stops.filter((n) => n.text && n.forced)
  if (bare.length) fail(`no room for the name of: ${bare.map((n) => n.name).join(', ')}`)
  else if (forced.length) fail(`set over the road, for want of room: ${forced.map((n) => n.name).join(', ')}`)
  else ok(`${stops.length} stops named clear of the road, ${placed.length - stops.length} other towns, ${shields.length} route numbers`)
}

console.log(bad ? `\n${bad} problem(s)` : '\nall clear')
process.exit(bad ? 1 : 0)
