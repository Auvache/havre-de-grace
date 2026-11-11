/*
 * Bakes the road trip's route into shared/video/films/road-trip/route-baked.mjs.
 *
 *   node tools/video-styles/roadtrip/bake-route.mjs            # CACHE=<dir> to keep downloads somewhere
 *
 * Reads the hand-written itinerary (shared/video/films/road-trip/itinerary.mjs),
 * and for it asks two public services, gently (one request a second, every
 * answer cached on disk so a second run asks nothing):
 *
 *   Nominatim   https://nominatim.openstreetmap.org/search   where each town is
 *   OSRM demo   https://router.project-osrm.org/route/v1/driving   the real road
 *               between each pair of stops, as driven (OpenStreetMap geometry)
 *
 * Both are © OpenStreetMap contributors (ODbL). The demo router has no way to
 * refuse motorways, so the itinerary steers with `via` towns on the two-lane
 * roads; the report this prints lists how far each leg still runs on an
 * interstate, which is how the vias were chosen.
 *
 * The baked file holds each leg as a polyline at 0.0001° simplified to 200 m,
 * and each stop's position. The film (trip.mjs) joins the legs, and drives a
 * `back` leg by reversing the road it came on. Run check.mjs afterwards.
 *
 * A router's answer can change as the map is edited: a re-bake with an empty
 * cache may move a road by a few hundred metres, or choose another one.
 */
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { ITINERARY, keyOf } from '../../../shared/video/films/road-trip/itinerary.mjs'
import { project, decode } from '../../../shared/video/films/road-trip/geo.mjs'
import { cached, encode, hash, simplify } from './lib.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const STATES = { NY: 'New York', NJ: 'New Jersey', PA: 'Pennsylvania', OH: 'Ohio', IN: 'Indiana', MI: 'Michigan', IL: 'Illinois', IA: 'Iowa', WI: 'Wisconsin', MN: 'Minnesota', SD: 'South Dakota', NE: 'Nebraska', WY: 'Wyoming', MT: 'Montana', ID: 'Idaho', OR: 'Oregon' }

/* ── Where each stop is ───────────────────────────────────────────── */
const stops = new Map()
for (const entry of ITINERARY) {
  if (!Array.isArray(entry)) continue
  const [name, st, o = {}] = entry
  const key = keyOf(entry)
  if (stops.has(key)) continue
  let at = o.at
  if (!at) {
    // By name; and where that finds the county of the same name, asked for again as a town.
    const ask = async (tag, query) => JSON.parse(await cached(`${tag}-${hash(query)}.json`, `https://nominatim.openstreetmap.org/search?${query}&format=jsonv2&limit=1&countrycodes=us`, 1100))
    const q = o.q ?? `${name}, ${STATES[st]}`
    let found = JSON.parse(await cached(`place-${hash(q)}.json`, `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=jsonv2&limit=1&countrycodes=us&featureType=settlement`, 1100))
    if (!found.length || /county|state/.test(found[0].addresstype)) found = await ask('town', `city=${encodeURIComponent(name)}&state=${encodeURIComponent(STATES[st])}`)
    if (!found.length) throw new Error(`No place found for "${name}, ${st}"`)
    at = [Number(found[0].lon), Number(found[0].lat)]
    if (process.env.PLACES) console.log(`${key.padEnd(24)} ${found[0].addresstype.padEnd(10)} ${found[0].display_name}`)
  }
  stops.set(key, { key, name: o.as ?? name, st, lon: +at[0].toFixed(4), lat: +at[1].toFixed(4), ...(o.via ? { via: 1 } : {}), ...(o.big ? { big: 1 } : {}), ...(o.side ? { side: o.side } : {}) })
}

/* ── The road between each pair ───────────────────────────────────── */
const legs = []
let last = null
let total = 0
const report = []
for (const entry of ITINERARY) {
  if (!Array.isArray(entry)) {
    legs.push({ back: entry.back })
    last = stops.get(entry.back)
    if (!last) throw new Error(`back: no stop "${entry.back}"`)
    continue
  }
  const stop = stops.get(keyOf(entry))
  if (last) {
    const coords = `${last.lon},${last.lat};${stop.lon},${stop.lat}`
    const body = JSON.parse(await cached(`osrm-${hash(coords)}.json`, `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=polyline6&steps=true`, 1100))
    if (body.code !== 'Ok') throw new Error(`OSRM: ${body.code} for ${last.key} → ${stop.key}`)
    const routeOut = body.routes[0]
    const pts = decode(routeOut.geometry, 6)
    const km = routeOut.distance / 1000
    total += km
    // How much of it is interstate, and on what.
    const inter = {}
    for (const step of routeOut.legs[0].steps) {
      const ref = (step.ref ?? '').split(';').map((s) => s.trim()).find((s) => /^I[- ]\d/.test(s))
      if (ref) inter[ref] = (inter[ref] ?? 0) + step.distance / 1000
    }
    const on = Object.entries(inter).filter(([, d]) => d > 3).map(([ref, d]) => `${ref} ${Math.round(d)} km`).join(', ')
    report.push(`${String(Math.round(km)).padStart(5)} km  ${last.key} → ${stop.key}${on ? `   ⚠ ${on}` : ''}`)
    legs.push({ from: last.key, to: stop.key, km: +km.toFixed(1), pts })
  }
  last = stop
}
console.log(report.join('\n'))
console.log(`${Math.round(total)} km routed, ${legs.filter((l) => l.back).length} roads driven back`)

/*
 * A town's position is its middle, and the through road often is not: the
 * router drives in to the middle and out again by the same street, which on
 * the map is a barb at every town. Where one leg ends by the road the next
 * one starts on, both are cut back to where they part. (Not at a fork a wrong
 * turn leaves from: those are met exactly.)
 */
const apart = (a, b) => { const [p, q] = [project(a), project(b)]; return Math.hypot(p[0] - q[0], p[1] - q[1]) }
let barbs = 0
for (let n = 0; n < legs.length - 1; n++) {
  const [A, B] = [legs[n], legs[n + 1]]
  if (A.back || B.back || legs[n + 2]?.back === A.to || A.to !== B.from) continue
  if (legs.some((l) => l.back === A.to)) continue
  let k = 0
  while (k < A.pts.length - 3 && k < B.pts.length - 3 && apart(A.pts[A.pts.length - 2 - k], B.pts[k + 1]) < 0.06) k++
  if (!k) continue
  barbs++
  A.pts = A.pts.slice(0, A.pts.length - k)
  B.pts = [A.pts.at(-1), ...B.pts.slice(k + 1)]
}
console.log(`${barbs} barbs cut`)
for (const leg of legs) {
  if (leg.back) continue
  const xy = leg.pts.map(project)
  leg.line = encode(simplify(xy, 0.2).map((i) => leg.pts[i]), 4)
  delete leg.pts
}

const file = resolve(here, '../../../shared/video/films/road-trip/route-baked.mjs')
writeFileSync(file, `/*
 * Ship to Stockholm · the road trip — the route as driven, baked. GENERATED
 * by tools/video-styles/roadtrip/bake-route.mjs from itinerary.mjs; do not
 * edit. Road geometry © OpenStreetMap contributors (ODbL), by way of the OSRM
 * demo router; each leg a Google polyline at 0.0001° (geo.mjs \`decode\`).
 */
export const STOPS = ${JSON.stringify([...stops.values()])}

export const LEGS = ${JSON.stringify(legs)}
`)
console.log('wrote', file, `${Math.round(JSON.stringify(legs).length / 1024)} KB of legs`)
