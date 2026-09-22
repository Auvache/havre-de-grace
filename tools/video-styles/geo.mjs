/*
 * Bakes the real coastline into shared/video/geo/earth.mjs.
 *
 *   node tools/video-styles/geo.mjs <land-50m.json> <land-110m.json> <ne_50m_lakes.geojson>
 *
 * Sources, all Natural Earth and public domain:
 *   https://cdn.jsdelivr.net/npm/world-atlas@2/land-50m.json
 *   https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json
 *   https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_lakes.geojson
 *
 * Run once; the output is checked in and nothing reads the sources again. The
 * film module stays a pure function with no file access — the geography is
 * just a (large) constant it imports.
 *
 * Two levels of detail, and a third the film derives from the fine one. The film draws the whole globe at ~380 px radius and
 * one province at ~9000, and the 50m coast at globe scale is a hundred
 * thousand points drawn into a few hundred pixels.
 *
 * Rings are stored as Google polyline strings at 0.01° (about a kilometre,
 * a pixel and a half at the tightest zoom in the film): a delta of a few
 * hundredths of a degree is one character, which is what gets the whole
 * world into well under a hundred kilobytes.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const out = resolve(here, '../../shared/video/geo/earth.mjs')

const [land50, land110, lakes50] = process.argv.slice(2)
if (!land50 || !land110 || !lakes50) {
  console.error('usage: node tools/video-styles/geo.mjs <land-50m.json> <land-110m.json> <ne_50m_lakes.geojson>')
  process.exit(1)
}

/* ── TopoJSON → rings of [lon, lat] ─────────────────────────────────── */
function topoRings(file) {
  const topo = JSON.parse(readFileSync(file, 'utf8'))
  const { scale, translate } = topo.transform
  const arcs = topo.arcs.map((arc) => {
    let x = 0
    let y = 0
    return arc.map(([dx, dy]) => {
      x += dx
      y += dy
      return [x * scale[0] + translate[0], y * scale[1] + translate[1]]
    })
  })
  const arcAt = (i) => (i >= 0 ? arcs[i] : [...arcs[~i]].reverse())
  const ring = (indices) => {
    const points = []
    for (const index of indices) {
      const a = arcAt(index)
      points.push(...(points.length ? a.slice(1) : a))
    }
    return points
  }
  const rings = []
  for (const geometry of topo.objects.land.geometries) {
    const polygons = geometry.type === 'Polygon' ? [geometry.arcs] : geometry.arcs
    for (const polygon of polygons) for (const r of polygon) rings.push(ring(r))
  }
  return rings
}

function lakeRings(file, minArea) {
  const lakes = JSON.parse(readFileSync(file, 'utf8'))
  const rings = []
  for (const feature of lakes.features) {
    const g = feature.geometry
    if (!g) continue
    const polygons = g.type === 'Polygon' ? [g.coordinates] : g.coordinates
    for (const polygon of polygons) {
      const outer = polygon[0]
      if (Math.abs(area(outer)) >= minArea) rings.push(outer)
    }
  }
  return rings
}

/** Planar area in square degrees, scaled by latitude. Only used to drop specks. */
function area(ring) {
  let sum = 0
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const k = Math.cos((ring[i][1] * Math.PI) / 180)
    sum += (ring[j][0] - ring[i][0]) * k * (ring[j][1] + ring[i][1])
  }
  return sum / 2
}

/* ── Douglas–Peucker, in degrees ────────────────────────────────────── */
function simplify(points, tolerance) {
  if (points.length < 4) return points
  const keep = new Uint8Array(points.length)
  keep[0] = keep[points.length - 1] = 1
  const stack = [[0, points.length - 1]]
  while (stack.length) {
    const [a, b] = stack.pop()
    let worst = 0
    let at = -1
    const [ax, ay] = points[a]
    const [bx, by] = points[b]
    const dx = bx - ax
    const dy = by - ay
    const len = Math.hypot(dx, dy) || 1e-9
    for (let i = a + 1; i < b; i++) {
      const [px, py] = points[i]
      const d = len > 1e-9
        ? Math.abs(dy * px - dx * py + bx * ay - by * ax) / len
        : Math.hypot(px - ax, py - ay)
      if (d > worst) {
        worst = d
        at = i
      }
    }
    if (worst > tolerance && at > 0) {
      keep[at] = 1
      stack.push([a, at], [at, b])
    }
  }
  return points.filter((_, i) => keep[i])
}

/* ── Google polyline encoding at 1e2 ────────────────────────────────── */
function encode(points) {
  let out = ''
  let plat = 0
  let plon = 0
  const chunk = (value) => {
    let v = value < 0 ? ~(value << 1) : value << 1
    while (v >= 0x20) {
      out += String.fromCharCode((0x20 | (v & 0x1f)) + 63)
      v >>= 5
    }
    out += String.fromCharCode(v + 63)
  }
  for (const [lon, lat] of points) {
    const la = Math.round(lat * 100)
    const lo = Math.round(lon * 100)
    chunk(la - plat)
    chunk(lo - plon)
    plat = la
    plon = lo
  }
  return out
}

function level(rings, tolerance, minArea) {
  const kept = []
  let count = 0
  for (const ring of rings) {
    if (Math.abs(area(ring)) < minArea) continue
    const s = simplify(ring, tolerance)
    if (s.length < 4) continue
    count += s.length
    kept.push(encode(s))
  }
  return { kept, count }
}

const fine = level(topoRings(land50), 0.02, 0.002)
const coarse = level(topoRings(land110), 0.12, 0.3)
const lakes = level(lakeRings(lakes50, 0.25), 0.03, 0.25)

const literal = (strings) => '[\n' + strings.map((s) => '  ' + JSON.stringify(s)).join(',\n') + ',\n]'
const body = `/*
 * The coastline of the Earth, and its largest lakes.
 *
 * GENERATED by tools/video-styles/geo.mjs from Natural Earth (public domain).
 * Do not edit; re-run the tool. Each string is one ring as a Google polyline
 * at 0.01°, lat before lon; \`rings()\` in films/cartography.mjs decodes them.
 *
 * fine:   land 50m, ${fine.kept.length} rings, ${fine.count} points
 * coarse: land 110m, ${coarse.kept.length} rings, ${coarse.count} points
 * lakes:  50m, the ${lakes.kept.length} large enough to see, ${lakes.count} points
 */
export const LAND_FINE = ${literal(fine.kept)}

export const LAND_COARSE = ${literal(coarse.kept)}

export const LAKES = ${literal(lakes.kept)}
`
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, body)
console.log(`wrote ${out}: ${(body.length / 1024).toFixed(0)} KB — fine ${fine.count} pts, coarse ${coarse.count} pts, lakes ${lakes.count} pts`)
