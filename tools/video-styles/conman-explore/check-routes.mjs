/*
 * Conman on the Portland map — the route check (2026-11-10).
 *
 *   node tools/video-styles/conman-explore/check-routes.mjs          every route against the rules
 *   node tools/video-styles/conman-explore/check-routes.mjs --json   and write what failed, for a map
 *
 * The rules (the user, 2026-11-09): nobody goes into the water except on a
 * bridge; nobody passes through a building (a heist's own building only by
 * its doors: those steps are flagged 'in' or 'jump' in story.mjs); a car
 * keeps out of the parks and off the footbridge. Every mover in
 * story.mjs is sampled every 20 ms.
 *
 * It also prints each mover's speeds (metres a second: typical and top), so
 * a rushed arrival or an uneven trip shows up as a number, and whether the
 * ones that must be seen are inside the frame when they must be.
 */
import { writeFileSync } from 'node:fs'
import { COVER_SHEET } from '../../../shared/video/album.mjs'
import * as C from '../../../shared/video/films/conman-portland/city.mjs'
import { inPoly } from '../../../shared/video/films/conman-portland/geo.mjs'
import { MOVERS, TOUR_ROOM } from '../../../shared/video/films/conman-portland/story.mjs'
import { T } from '../../../shared/video/films/conman-portland/camera.mjs'
import { HEISTS, viewAt, MUST_SEE } from '../../../shared/video/films/conman-portland/heists.mjs'
import { cam } from '../../../shared/video/films/conman-portland/atlas.mjs'

/* Buildings: every lot, hashed. */
const CELL = 40
const hash = new Map()
for (const l of C.LOTS) {
  const xs = l.quad.map((p) => p[0])
  const ys = l.quad.map((p) => p[1])
  for (let i = Math.floor(Math.min(...xs) / CELL); i <= Math.floor(Math.max(...xs) / CELL); i++) {
    for (let j = Math.floor(Math.min(...ys) / CELL); j <= Math.floor(Math.max(...ys) / CELL); j++) {
      const k = `${i},${j}`
      if (!hash.has(k)) hash.set(k, [])
      hash.get(k).push(l.quad)
    }
  }
}
const inLot = (x, y) => (hash.get(`${Math.floor(x / CELL)},${Math.floor(y / CELL)}`) ?? []).some((q) => inPoly(x, y, q))

/* The heists' own buildings, as drawn. */
const FEET = HEISTS.flatMap((h) => { const job = h.job(h.on[1]); return job.foot.map((poly) => poly.map(([x, y]) => [x + job.o[0], y + job.o[1]])) })
const inPlan = (x, y) => FEET.some((q) => inPoly(x, y, q))

/* Bridges: within the deck. */
const toSeg = (p, a, b) => {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]]
  const u = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)))
  return Math.hypot(p[0] - a[0] - u * dx, p[1] - a[1] - u * dy)
}
const onBridge = (p, only) => C.BRIDGES.some((b) => (!only || b.name === only) && b.pts.some((q, i) => i && toSeg(p, b.pts[i - 1], q) <= b.w / 2 + 0.5))

const END = T.end
const bad = {}
let failures = 0
console.log('mover        from     to    typical  top m/s   water  building  plan  park')
for (const m of MOVERS) {
  const counts = { water: 0, building: 0, plan: 0, park: 0 }
  const first = {}
  const speeds = []
  const wheels = m.kind === 'car' || m.kind === 'copcar'
  for (let t = m.route.from; t <= Math.min(m.route.to, END); t += 0.02) {
    const w = m.route.walked(t)
    const p = w.at(-1)
    const flag = p[2]
    const v = m.route.speed(t)
    if (v > 0.5) speeds.push(v)
    const hit = (k) => { counts[k]++; first[k] ??= [Math.round(t * 100) / 100, Math.round(p[0]), Math.round(p[1])]; (bad[m.id] ??= []).push([p[0], p[1]]) }
    if (C.inWater(p[0], p[1]) && !onBridge(p)) hit('water')
    // Standing where a route begins he is where the plan left him: inside, if that is where it was.
    if (flag !== 'in' && flag !== 'jump' && w.length > 1) {
      if (inLot(p[0], p[1])) hit('building')
      if (inPlan(p[0], p[1])) hit('plan')
    }
    if (wheels && flag !== 'in' && w.length > 1 && ((C.inPark(p[0], p[1], -2) && C.clearOfRoads(p[0], p[1], 0) && !inPlan(p[0], p[1])) || (C.inWater(p[0], p[1]) && onBridge(p, 'tilikum')))) hit('park')
  }
  speeds.sort((a, b) => a - b)
  const n = Object.values(counts).reduce((a, b) => a + b, 0)
  failures += n
  console.log(`${m.id.padEnd(11)} ${m.route.from.toFixed(1).padStart(6)} ${m.route.to.toFixed(1).padStart(6)}   ${String(Math.round(speeds[speeds.length >> 1] ?? 0)).padStart(5)}  ${String(Math.round(speeds.at(-1) ?? 0)).padStart(5)}     ${Object.values(counts).map((c) => String(c).padStart(5)).join('   ')}${n ? `   ✗ ${Object.entries(first).map(([k, v]) => `${k}@${v.join(',')}`).join(' ')}` : ''}`)
}

/* Seen when they must be: [id, from, to] in heists.mjs. */
const { x: PX, y: PY, w: PW, h: PH } = COVER_SHEET.plate
for (const [id, from, to, pad = 12] of MUST_SEE) {
  const m = MOVERS.find((q) => q.id === id)
  let out = 0
  let firstOut = null
  for (let t = from; t <= to; t += 0.05) {
    const v = viewAt(t)
    const c = cam(v.cx, v.cy, v.s)
    const p = m.route.at(t)
    const [x, y] = [c.X(p[0]), c.Y(p[1])]
    if (x < PX + pad || x > PX + PW - pad || y < PY + pad || y > PY + PH - pad) { out++; firstOut ??= t.toFixed(2) }
  }
  if (out) failures++
  console.log(`seen  ${id.padEnd(10)} ${from}–${to}  ${out ? `✗ out of frame for ${(out * 0.05).toFixed(1)} s, first at ${firstOut}` : 'in frame'}`)
}
console.log(`No. 1 has ${Math.round(TOUR_ROOM)} m of route left at the end card.`)
console.log(failures ? `${failures} failures` : 'all clear')
if (process.argv.includes('--json')) writeFileSync(process.argv[process.argv.indexOf('--json') + 1], JSON.stringify(bad))
process.exit(failures ? 1 : 0)
