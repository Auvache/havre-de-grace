/*
 * Bakes the road map of the United States into shared/video/geo/usa.mjs.
 *
 *   node tools/video-styles/roadtrip/bake-map.mjs              # CACHE=<dir> to keep downloads somewhere
 *
 * Sources (downloaded once into the cache; all public domain):
 *   Natural Earth 1:10m  roads, lakes, rivers + lake centerlines, populated places
 *     https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_roads.geojson
 *     …/ne_10m_lakes.geojson  …/ne_10m_rivers_lake_centerlines.geojson  …/ne_10m_populated_places_simple.geojson
 *   us-atlas (US Census cartographic boundaries)  https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json
 *   world-atlas (Natural Earth 1:50m land)        https://cdn.jsdelivr.net/npm/world-atlas@2/land-50m.json
 *
 * Run once; the output is checked in and nothing reads the sources again
 * (the same arrangement as tools/video-styles/geo.mjs and earth.mjs).
 *
 * Everything is a Google polyline at 0.001° (about 100 m; a third of a pixel
 * at the film's tightest view), lat before lon, simplified on the film's own
 * projection (road-trip/geo.mjs) to a few hundred metres. The film derives its
 * distant, lighter drawing from these at load.
 *
 *   ROADS      by class: `hwy` (interstates and other expressways, drawn double),
 *              `us` (US routes and other trunk roads), `st` (state roads)
 *   BORDERS    state lines; `EDGE` the land frontier with Canada and Mexico
 *   NATION     the United States' outline, rings; `LAND` the continent round it
 *   LAKES, RIVERS, TOWNS, STATE_NAMES, SHIELDS (route numbers and where to print them)
 */
import { writeFileSync, existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { project } from '../../../shared/video/films/road-trip/geo.mjs'
import { CACHE, cached, encode, simplify } from './lib.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const NE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/'
const get = async (name, url) => {
  // A file dropped into the cache by hand (curl) is used as it is.
  const file = resolve(CACHE, name)
  return JSON.parse(existsSync(file) ? readFileSync(file, 'utf8') : await cached(name, url))
}
const roads = await get('roads.geojson', `${NE}ne_10m_roads.geojson`)
const lakes = await get('lakes.geojson', `${NE}ne_10m_lakes.geojson`)
const rivers = await get('rivers.geojson', `${NE}ne_10m_rivers_lake_centerlines.geojson`)
const places = await get('places.geojson', `${NE}ne_10m_populated_places_simple.geojson`)
const states = await get('states-10m.json', 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
const land = await get('land-50m.json', 'https://cdn.jsdelivr.net/npm/world-atlas@2/land-50m.json')

/* The sheet: what the last pull-out can see, and a margin. */
const BOX = { x0: -142, x1: -48, y0: 12, y1: 62 }
/* Roads and towns are kept only where the film goes near them. */
const NEAR = { x0: -128.5, x1: -64, y0: 23.5, y1: 51.5 }
const inBox = ([x, y], b) => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1

const thin = (pts, tol) => simplify(pts.map(project), tol).map((i) => pts[i])
const enc = (pts) => encode(pts, 3)
const lines = (geometry) => (geometry.type === 'LineString' ? [geometry.coordinates] : geometry.type === 'MultiLineString' ? geometry.coordinates : [])
const polys = (geometry) => (geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : [])
const kmLong = (pts) => { let L = 0; const q = pts.map(project); for (let i = 1; i < q.length; i++) L += Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]); return L }
const area = (ring) => { const q = ring.map(project); let a = 0; for (let i = 0; i < q.length; i++) { const [x0, y0] = q[i]; const [x1, y1] = q[(i + 1) % q.length]; a += x0 * y1 - x1 * y0 } return Math.abs(a / 2) }

/* ── Roads ────────────────────────────────────────────────────────── */
const ROADS = { hwy: [], us: [], st: [] }
let roadPts = 0
/* Route numbers: one candidate at the middle of every numbered stretch long enough to carry a shield. */
const numbered = []
const midpoint = (pts) => {
  const q = pts.map(project)
  let L = 0
  const cum = [0]
  for (let i = 1; i < q.length; i++) { L += Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]); cum.push(L) }
  let i = 1
  while (i < q.length - 1 && cum[i] < L / 2) i++
  const u = (L / 2 - cum[i - 1]) / (cum[i] - cum[i - 1] || 1)
  return { len: L, at: [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u], xy: [q[i - 1][0] + (q[i][0] - q[i - 1][0]) * u, q[i - 1][1] + (q[i][1] - q[i - 1][1]) * u] }
}
for (const f of roads.features) {
  const p = f.properties
  if (p.type === 'Ferry Route' || p.type === 'Unknown') continue
  const home = p.sov_a3 === 'USA'
  const cls = !home ? 'st'
    : (p.expressway === 1 && p.type !== 'Secondary Highway') || p.level === 'Interstate' ? 'hwy'
      : p.type === 'Major Highway' || p.level === 'Federal' ? 'us' : 'st'
  for (const pts of lines(f.geometry)) {
    if (!pts.some((q) => inBox(q, NEAR))) continue
    const kept = thin(pts, 0.35)
    if (kept.length < 2) continue
    roadPts += kept.length
    ROADS[cls].push(enc(kept))
    const kind = p.level === 'Interstate' ? 'i' : p.level === 'Federal' ? 'u' : p.level === 'State' ? 's' : null
    if (home && kind && /^\d{1,3}$/.test(p.name ?? '')) {
      const m = midpoint(pts)
      if (m.len >= 45) numbered.push({ n: p.name, k: kind, ...m })
    }
  }
}

/* Thinned: the long stretches first, a number not repeated within 170 km, no two shields within 40. */
const SHIELDS = []
{
  const rank = { u: 0, i: 1, s: 2 }
  const taken = []
  for (const c of numbered.sort((a, b) => rank[a.k] - rank[b.k] || b.len - a.len)) {
    if (taken.some((o) => { const d = Math.hypot(o.xy[0] - c.xy[0], o.xy[1] - c.xy[1]); return d < 40 || (d < 170 && o.n === c.n && o.k === c.k) })) continue
    taken.push(c)
    SHIELDS.push([c.n, c.k, +c.at[0].toFixed(2), +c.at[1].toFixed(2)])
  }
}

/* ── States: the lines between them, the outline, the names ───────── */
const { scale, translate } = states.transform
const arcs = states.arcs.map((arc) => { let x = 0; let y = 0; return arc.map(([dx, dy]) => { x += dx; y += dy; return [x * scale[0] + translate[0], y * scale[1] + translate[1]] }) })
const arcAt = (i) => (i >= 0 ? arcs[i] : [...arcs[~i]].reverse())
const ringOf = (indices) => { const pts = []; for (const i of indices) { const a = arcAt(i); pts.push(...(pts.length ? a.slice(1) : a)) } return pts }
const LOWER = (g) => !['02', '15', '60', '66', '69', '72', '78'].includes(g.id)
const used = new Map()
const STATE_NAMES = []
for (const g of states.objects.states.geometries.filter(LOWER)) {
  const rings = (g.type === 'Polygon' ? [g.arcs] : g.arcs)
  for (const poly of rings) for (const ring of poly) for (const i of ring) { const k = i >= 0 ? i : ~i; used.set(k, (used.get(k) ?? 0) + 1) }
  // The name goes at the middle of the state's biggest piece.
  const outer = rings.map((poly) => ringOf(poly[0])).sort((a, b) => area(b) - area(a))[0]
  const q = outer.map(project)
  let [cx, cy, a] = [0, 0, 0]
  for (let i = 0; i < q.length; i++) { const [x0, y0] = q[i]; const [x1, y1] = q[(i + 1) % q.length]; const w = x0 * y1 - x1 * y0; a += w; cx += (x0 + x1) * w; cy += (y0 + y1) * w }
  STATE_NAMES.push({ name: g.properties.name, x: Math.round(cx / (3 * a)), y: Math.round(cy / (3 * a)), w: Math.round(Math.max(...q.map((p) => p[0])) - Math.min(...q.map((p) => p[0]))), h: Math.round(Math.max(...q.map((p) => p[1])) - Math.min(...q.map((p) => p[1]))) })
}
const BORDERS = []
for (const [k, n] of used) if (n >= 2) BORDERS.push(enc(thin(arcs[k], 0.4)))
const NATION = []
for (const g of states.objects.nation.geometries) {
  for (const poly of (g.type === 'Polygon' ? [g.arcs] : g.arcs)) {
    const ring = ringOf(poly[0])
    if (!inBox(ring[0], NEAR) || area(ring) < 60) continue
    NATION.push(enc(thin(ring, 0.5)))
  }
}

/* ── The continent: land 50m, cut to the sheet ────────────────────── */
const lt = land.transform
const larcs = land.arcs.map((arc) => { let x = 0; let y = 0; return arc.map(([dx, dy]) => { x += dx; y += dy; return [x * lt.scale[0] + lt.translate[0], y * lt.scale[1] + lt.translate[1]] }) })
const larcAt = (i) => (i >= 0 ? larcs[i] : [...larcs[~i]].reverse())
/** Sutherland–Hodgman against the sheet's box. */
function clip(ring, b) {
  const edges = [
    [(p) => p[0] >= b.x0, (p, q) => [b.x0, p[1] + ((q[1] - p[1]) * (b.x0 - p[0])) / (q[0] - p[0])]],
    [(p) => p[0] <= b.x1, (p, q) => [b.x1, p[1] + ((q[1] - p[1]) * (b.x1 - p[0])) / (q[0] - p[0])]],
    [(p) => p[1] >= b.y0, (p, q) => [p[0] + ((q[0] - p[0]) * (b.y0 - p[1])) / (q[1] - p[1]), b.y0]],
    [(p) => p[1] <= b.y1, (p, q) => [p[0] + ((q[0] - p[0]) * (b.y1 - p[1])) / (q[1] - p[1]), b.y1]],
  ]
  let out = ring
  for (const [inside, cut] of edges) {
    const src = out
    out = []
    for (let i = 0; i < src.length; i++) {
      const p = src[i]
      const q = src[(i + 1) % src.length]
      if (inside(p)) { out.push(p); if (!inside(q)) out.push(cut(p, q)) }
      else if (inside(q)) out.push(cut(p, q))
    }
    if (!out.length) break
  }
  return out
}
const LAND = []
const landRings = []
for (const g of land.objects.land.geometries) {
  for (const poly of (g.type === 'Polygon' ? [g.arcs] : g.arcs)) {
    const pts = []
    for (const i of poly[0]) { const a = larcAt(i); pts.push(...(pts.length ? a.slice(1) : a)) }
    const cut = clip(pts, BOX)
    if (cut.length < 4 || area(cut) < 400) continue
    landRings.push(cut)
    LAND.push(enc(thin(cut, 1.2)))
  }
}

/* The frontier: the outline's arcs with land on both sides of them. */
const inside = (pt, ring) => { let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i]; const [xj, yj] = ring[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c } return c }
const onLand = (pt) => landRings.some((ring) => inside(pt, ring)) && !lakes.features.some((f) => f.properties.scalerank <= 1 && polys(f.geometry).some((poly) => inside(pt, poly[0])))
const EDGE = []
for (const [k, n] of used) {
  if (n !== 1) continue
  const arc = arcs[k]
  if (kmLong(arc) < 25) continue
  // Sample along it: a frontier has land a few kilometres to both sides.
  let both = 0
  let seen = 0
  for (let i = 1; i < arc.length; i += Math.max(1, Math.floor(arc.length / 24))) {
    const [x0, y0] = arc[i - 1]
    const [x1, y1] = arc[i]
    const L = Math.hypot(x1 - x0, y1 - y0) || 1
    const [nx, ny] = [-(y1 - y0) / L * 0.12, (x1 - x0) / L * 0.12]
    const m = [(x0 + x1) / 2, (y0 + y1) / 2]
    seen++
    if (onLand([m[0] + nx, m[1] + ny]) && onLand([m[0] - nx, m[1] - ny])) both++
  }
  if (both / seen > 0.6) EDGE.push(enc(thin(arc, 0.4)))
}

/* ── Water ────────────────────────────────────────────────────────── */
const LAKES = []
for (const f of lakes.features) {
  for (const poly of polys(f.geometry)) {
    const ring = poly[0]
    if (!ring.some((q) => inBox(q, BOX)) || ring.some((q) => q[0] > -40)) continue
    const a = area(ring)
    // Small lakes only where the film comes near enough to see them.
    if (a < (ring.some((q) => inBox(q, NEAR)) ? 70 : 280)) continue
    LAKES.push({ name: f.properties.name, a: Math.round(a), ring: enc(thin(ring, 0.5)), holes: poly.slice(1).filter((h) => area(h) > 150).map((h) => enc(thin(h, 0.5))) })
  }
}
const RIVERS = []
for (const f of rivers.features) {
  const p = f.properties
  if (p.scalerank > 6 || p.featurecla === 'Lake Centerline') continue
  for (const pts of lines(f.geometry)) {
    if (!pts.some((q) => inBox(q, { x0: -128, x1: -64, y0: 24, y1: 52 }))) continue
    if (kmLong(pts) < 30) continue
    RIVERS.push({ r: p.scalerank, line: enc(thin(pts, 0.5)) })
  }
}

/* ── Towns ────────────────────────────────────────────────────────── */
const TOWNS = []
for (const f of places.features) {
  const p = f.properties
  const at = f.geometry.coordinates
  if (!inBox(at, NEAR)) continue
  if (p.adm0_a3 !== 'USA' && p.scalerank > 4) continue
  TOWNS.push({ name: p.name, st: p.adm0_a3 === 'USA' ? p.adm1name : p.adm0_a3, lon: +at[0].toFixed(3), lat: +at[1].toFixed(3), r: p.scalerank, pop: p.pop_max })
}

const out = resolve(here, '../../../shared/video/geo/usa.mjs')
const body = `/*
 * The road map of the United States: roads, state lines, water, towns.
 *
 * GENERATED by tools/video-styles/roadtrip/bake-map.mjs from Natural Earth
 * 1:10m (roads, lakes, rivers, towns), the US Census boundaries in us-atlas
 * and Natural Earth 1:50m land — all public domain. Do not edit; re-run the
 * tool. Each string is a Google polyline at 0.001°, lat before lon
 * (shared/video/films/road-trip/geo.mjs \`decode(str, 3)\`).
 *
 * roads:   ${ROADS.hwy.length} expressway, ${ROADS.us.length} trunk, ${ROADS.st.length} state — ${roadPts} points
 * borders: ${BORDERS.length} state lines, ${EDGE.length} of frontier; outline ${NATION.length} rings; land ${LAND.length} rings
 * water:   ${LAKES.length} lakes, ${RIVERS.length} rivers
 * towns:   ${TOWNS.length}; route numbers: ${SHIELDS.length}
 */
export const ROADS = ${JSON.stringify(ROADS)}

export const BORDERS = ${JSON.stringify(BORDERS)}

export const EDGE = ${JSON.stringify(EDGE)}

export const NATION = ${JSON.stringify(NATION)}

export const LAND = ${JSON.stringify(LAND)}

export const LAKES = ${JSON.stringify(LAKES)}

export const RIVERS = ${JSON.stringify(RIVERS)}

/** x, y in the film's kilometres (the middle of the state's largest piece); w, h its extent. */
export const STATE_NAMES = ${JSON.stringify(STATE_NAMES)}

export const TOWNS = ${JSON.stringify(TOWNS)}

/** Route numbers: [number, 'i' interstate | 'u' US route | 's' state road, lon, lat], at the middle of a stretch of that road. */
export const SHIELDS = ${JSON.stringify(SHIELDS)}
`
writeFileSync(out, body)
console.log(`wrote ${out}: ${Math.round(body.length / 1024)} KB`)
console.log({ hwy: ROADS.hwy.length, us: ROADS.us.length, st: ROADS.st.length, roadPts, borders: BORDERS.length, edge: EDGE.length, nation: NATION.length, land: LAND.length, lakes: LAKES.length, rivers: RIVERS.length, towns: TOWNS.length })
