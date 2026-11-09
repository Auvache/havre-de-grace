/*
 * Conman — the city, take three (2026-11-09). Geometry only.
 *
 * A town "just based on Portland" (the user): north up, the Willamette
 * through it with its nine bridges, the downtown grid turned twenty degrees
 * to the river, the true-north grid everywhere else, the West Hills and
 * their forest, the freeways' loop, Sandy's diagonal, Ladd's X, Mount Tabor.
 * Nothing in the film names any of it.
 *
 * It is a miniature. Places are set from their real latitude and longitude,
 * then: north–south is squeezed outside the middle (north of the Fremont
 * Bridge and south of the Ross Island Bridge), and the whole plan is drawn
 * at 300 film metres to a real kilometre. Buildings, streets and blocks stay
 * life-size (80 m blocks), so a plan drawn at 20 px a metre and the city at
 * 0.4 px a metre are one drawing: about a third as many blocks as the real
 * place, in the right arrangement.
 *
 * World units are film metres, y down, the Burnside Bridge at (0, 0).
 * Everything here is computed once, at load.
 */
import { rng } from '../../kit.mjs'
import { lerp, dist, spline, inPoly, arcPts, polyLen, along, xAtY } from './geo.mjs'

/* ── The projection ──────────────────────────────────────────────────── */

const LAT0 = 45.523
const LON0 = -122.6685
/** Film metres to a (squeezed) real kilometre. */
const M = 300
const N_EDGE = -1.67 // the Fremont Bridge, km north of Burnside
const S_EDGE = 2.56 // the Ross Island Bridge, km south
const CORE = 0.85
const warp = (y) => (y < N_EDGE ? N_EDGE * CORE + (y - N_EDGE) * 0.36 : y > S_EDGE ? S_EDGE * CORE + (y - S_EDGE) * 0.4 : y * CORE)
/** A real place, in film metres. */
export const ll = (lat, lon) => [(lon - LON0) * 78 * M, warp(-(lat - LAT0) * 111.2) * M]

/** The sheet the city fills at its widest: 1532 × 776 at 0.4 px a metre. */
export const BOUNDS = { x0: -1800, x1: 2030, y0: -990, y1: 950 }
const inBounds = (x, y, pad = 0) => x > BOUNDS.x0 - pad && x < BOUNDS.x1 + pad && y > BOUNDS.y0 - pad && y < BOUNDS.y1 + pad

/* ── The river ───────────────────────────────────────────────────────── */

/** The Willamette's centreline, south to north: [lat, lon, half-width in real km]. */
const RIVER_LL = [
  [45.17, -122.8, 0.2], [45.22, -122.74, 0.2], [45.28, -122.66, 0.2], [45.32, -122.615, 0.2], [45.35, -122.6, 0.2], [45.38, -122.62, 0.2], [45.41, -122.645, 0.2], [45.44, -122.655, 0.19],
  [45.462, -122.665, 0.17], [45.47, -122.6645, 0.17], [45.478, -122.6635, 0.3], [45.485, -122.6615, 0.44], [45.493, -122.6635, 0.4], [45.499, -122.6665, 0.27],
  [45.503, -122.667, 0.2], [45.5078, -122.669, 0.19], [45.5132, -122.6705, 0.19], [45.5176, -122.67, 0.19], [45.523, -122.6685, 0.19], [45.5275, -122.6692, 0.19],
  [45.532, -122.6745, 0.19], [45.538, -122.683, 0.21], [45.545, -122.6935, 0.24], [45.554, -122.707, 0.27], [45.564, -122.723, 0.27], [45.575, -122.742, 0.27], [45.585, -122.764, 0.27],
  [45.6, -122.79, 0.28], [45.62, -122.795, 0.3], [45.653, -122.768, 0.3],
]
/** [x, y, half-width], sampled. */
export const RIVER_CENTRE = spline(RIVER_LL.map(([lat, lon, hw]) => [...ll(lat, lon), hw * M]), 14)
const bankOf = (sgn) => RIVER_CENTRE.map((p, i) => {
  const a = RIVER_CENTRE[Math.max(0, i - 1)]
  const b = RIVER_CENTRE[Math.min(RIVER_CENTRE.length - 1, i + 1)]
  const L = dist(a, b) || 1
  return [p[0] + (sgn * (b[1] - a[1]) * p[2]) / L, p[1] - (sgn * (b[0] - a[0]) * p[2]) / L]
})
export const WEST_BANK = bankOf(1)
export const EAST_BANK = bankOf(-1)
export const RIVER = [...WEST_BANK, ...EAST_BANK.slice().reverse()]
/** Ross Island. */
export const ISLAND = arcPts(ll(45.4872, -122.6598), 52, 68, 0, Math.PI * 2, 8)
const riverBox = (() => {
  const xs = RIVER.map((p) => p[0])
  const ys = RIVER.map((p) => p[1])
  return [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
})()
export const inWater = (x, y) => x > riverBox[0] && x < riverBox[1] && y > riverBox[2] && y < riverBox[3] && inPoly(x, y, RIVER) && !inPoly(x, y, ISLAND)
/** The river's centre at a given y (it only ever runs north). */
export const riverX = xAtY(RIVER_CENTRE)
const westOfRiver = (x, y) => x < riverX(y)

/* ── The West Hills ──────────────────────────────────────────────────── */

const HILL_FOOT = [[45.6, -122.775], [45.575, -122.752], [45.56, -122.732], [45.545, -122.717], [45.535, -122.709], [45.527, -122.704], [45.518, -122.699], [45.508, -122.694], [45.495, -122.69], [45.47, -122.686], [45.44, -122.684], [45.38, -122.68]].map(([a, b]) => ll(a, b))
export const footX = xAtY(HILL_FOOT)
export const inHills = (x, y) => x < footX(y)
/** Contours: the foot of the hills, and lines up the slope behind it. */
export const CONTOURS = [0, 70, 190, 330, 480, 650, 840, 1050, 1280, 1520].map((dx, k) => {
  const pts = []
  for (let y = -4400; y <= 4800; y += 40) pts.push([footX(y) - dx - (k ? (26 + 6 * k) * Math.sin(y / (150 + 22 * k) + k * 1.7) + 14 * Math.sin(y / 61 + k) : 0), y])
  return pts
})

/* ── The sites: five empty lots ──────────────────────────────────────── */

/*
 * Option B (the user, 2026-11-09). `by` is where it is in the real town, for
 * the notes only. o is the building's top-left, in film metres; the plans'
 * own origins are in heists.mjs.
 */
export const HILLTOP = [-1118, -62]
export const SITES = [
  { no: 1, key: 'shop', name: 'The Record Shop', by: 'the Haymaker, N Killingsworth', o: [-230, -741.5], w: 26, h: 11.5 },
  { no: 2, key: 'bank', name: 'The Counting House', by: "Powell's Books, W Burnside", o: [-302, -38], w: 38, h: 24 },
  { no: 3, key: 'studio', name: 'The Studio', by: 'Alberta Rose, NE Alberta', o: [744, -682], w: 46, h: 32 },
  { no: 4, key: 'museum', name: 'The Museum', by: 'Pittock Mansion, in the hills', o: [HILLTOP[0] - 36, HILLTOP[1] - 36], w: 72, h: 72 },
  { no: 5, key: 'hall', name: 'The Concert Hall', by: 'Revolution Hall, SE Stark', o: [362, 89], w: 76, h: 60 },
]
export const nearSite = (x, y, pad) => SITES.some((s) => x > s.o[0] - pad && x < s.o[0] + s.w + pad && y > s.o[1] - pad && y < s.o[1] + s.h + pad)

/* ── Roads ───────────────────────────────────────────────────────────── */

/*
 * Only the roads that are not simply a gap in a grid: freeways, diagonals,
 * the bridges' own streets, the hills' winding streets. cls: arterial,
 * freeway, street (a curving residential street, houses along it), avenue (a
 * park or garden road, no houses), footway (no cars), bridge. w is kerb to
 * kerb. An arterial that runs along a grid street is no wider than the grid's
 * gap, so it does not take the lots that front it.
 */
export const ROADS = []
const road = (pts, w, cls, name) => ROADS.push({ pts, w, cls, name })

// Burnside: the one street that crosses everything, and winds on up into the hills.
road([[footX(0), 0], [BOUNDS.x1 + 10, 0]], 16, 'arterial', 'burnside')
road(spline([[footX(0), 0], [-900, 34], [-1010, 86], [HILLTOP[0], 82], [-1250, 64], [-1400, 112], [-1560, 74], [BOUNDS.x0 - 10, 100]], 6), 14, 'arterial', 'burnside')
// The hilltop: a ring road round the museum's park, and the drive up to it.
export const RING_R = 72
road(arcPts(HILLTOP, RING_R, RING_R, Math.PI / 2, Math.PI / 2 + Math.PI * 2, 3), 14, 'arterial', 'ring')
road([[HILLTOP[0], 82], [HILLTOP[0], HILLTOP[1] + RING_R]], 14, 'arterial', 'drive')

// The freeways: up the east bank, the loop round downtown, east up the gulch, west through the hills.
road(spline([[-360, -1010], [-360, -640], [-330, -560], [-262, -500], [-150, -420], [-30, -330], [90, -230], [112, -120], [110, 0], [110, 200], [110, 380], [60, 425], [-130, 478], [-180, 490], [-205, 560], [-200, 700], [-200, 970]], 8), 24, 'freeway', 'i5')
road(spline([[-262, -500], [-430, -410], [-425, -330], [-450, -170], [-500, -20], [-505, 100], [-470, 250], [-420, 340], [-300, 450], [-180, 490]], 8), 22, 'freeway', 'i405')
road(spline([[112, -140], [300, -175], [600, -235], [900, -285], [1400, -300], [BOUNDS.x1 + 10, -312]], 8), 20, 'freeway', 'i84')
road(spline([[-470, 250], [-600, 230], [-800, 290], [-1205, 312], [-1500, 350], [BOUNDS.x0 - 10, 368]], 8), 20, 'freeway', 'us26')
const I405 = xAtY([[-500, -20], [-505, 100], [-470, 250], [-420, 340], [-300, 450], [-180, 490]])

// The diagonal out to the north-east.
road([[269, -6], [1123, -360], [1960, -545], [BOUNDS.x1 + 10, -562]], 14, 'arterial', 'sandy')

// The bridges' streets (the bridge itself is laid over the wet run, below).
road([[-240, -160], [-205, -195], [-80, -305], [-20, -320], [1040, -320]], 16, 'arterial', 'broadway')
road([[-170, -160], [160, -160]], 16, 'arterial', 'steel')
road([[-150, 170], [90, 160]], 16, 'arterial', 'morrison')
road([[-150, 305], [90, 320]], 16, 'arterial', 'hawthorne')
road([[-110, 548], [100, 528]], 9, 'footway', 'tilikum')
road([[-205, 560], [-90, 585], [125, 600], [215, 640], [BOUNDS.x1 + 10, 640]], 16, 'arterial', 'ross island')

// The hills' streets: along the slope, with houses.
for (const pts of [
  [[-830, -330], [-870, -220], [-845, -110], [-880, -24]],
  [[-940, -420], [-985, -300], [-960, -180], [-1000, -90], [-1010, 40]],
  [[-1000, -300], [-1140, -330], [-1300, -420], [-1500, -560]],
  [[-800, 60], [-760, 170], [-720, 250]],
  [[-700, 330], [-650, 400], [-640, 500], [-590, 600], [-560, 720], [-540, 860], [-530, 960]],
  [[-900, 400], [-960, 470], [-920, 560], [-990, 650], [-930, 770], [-960, 960]],
  [[-1250, 64], [-1300, 180], [-1260, 290]],
]) road(spline(pts, 6), 9, 'street')

// Mount Tabor: a road round the hill and one up it.
export const TABOR = { c: ll(45.512, -122.5945), r: 128 }
road(arcPts(TABOR.c, TABOR.r + 14, TABOR.r + 14, 0, Math.PI * 2, 4), 9, 'avenue')
road(spline([[TABOR.c[0] - TABOR.r - 14, TABOR.c[1]], [TABOR.c[0] - 70, TABOR.c[1] + 40], [TABOR.c[0] - 20, TABOR.c[1] - 30], [TABOR.c[0] + 30, TABOR.c[1] + 10]], 6), 8, 'avenue')

// Ladd's: the X and the circle.
export const LADD = { x0: 329, x1: 551, y0: 329, y1: 471, c: [440, 400], r: 17 }
road([[LADD.x0 - 9, LADD.y0 - 9], [LADD.x1 + 9, LADD.y1 + 9]], 11, 'avenue')
road([[LADD.x0 - 9, LADD.y1 + 9], [LADD.x1 + 9, LADD.y0 - 9]], 11, 'avenue')
road(arcPts(LADD.c, LADD.r + 5, LADD.r + 5, 0, Math.PI * 2, 3), 9, 'avenue')

/* ── Parks ───────────────────────────────────────────────────────────── */

export const PARKS = []
const box = (x0, y0, x1, y1) => ({ kind: 'poly', pts: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]] })
/** Blocks by their streets: the park takes the blocks between x0..x1 and y0..y1 street centrelines. */
const blocks = (x0, y0, x1, y1) => box(x0 + 9, y0 + 9, x1 - 9, y1 - 9)

// The downtown grid, turned twenty degrees: u along its streets (east-south-east), v down its avenues.
export const SW = { o: [-100, 10], ang: 20 }
const rot = (o, ang) => {
  const a = (ang * Math.PI) / 180
  const c = Math.cos(a)
  const s = Math.sin(a)
  return ([u, v]) => [o[0] + u * c - v * s, o[1] + u * s + v * c]
}
const toSW = rot(SW.o, SW.ang)

PARKS.push({ kind: 'circle', c: HILLTOP, r: RING_R - 8, name: 'hilltop' })
PARKS.push({ kind: 'ellipse', c: ll(45.515, -122.71), rx: 150, ry: 120, name: 'washington' })
PARKS.push({ ...blocks(-240, -160, -160, 0), name: 'north park blocks' })
PARKS.push({ kind: 'poly', pts: [[-231, 89], [-169, 89], [-169, 391], [-231, 391]].map(toSW), name: 'south park blocks' })
// The waterfront: between the west bank and the first avenue, from the Steel Bridge to the Hawthorne.
PARKS.push({ kind: 'poly', name: 'waterfront', pts: (() => {
  const run = WEST_BANK.filter((p) => p[1] > -150 && p[1] < 330)
  return [...run.map(([x, y]) => [x + 2, y]), ...run.slice().reverse().map(([x, y]) => [x - 44, y])]
})() })
PARKS.push({ ...blocks(320, 80, 480, 240), name: 'hall' }) // the hall's own ground: two blocks by two
PARKS.push({ ...blocks(560, 80, 720, 160), name: 'lone fir' })
PARKS.push({ ...blocks(880, 0, 1040, 160), name: 'laurelhurst' })
PARKS.push({ kind: 'circle', c: TABOR.c, r: TABOR.r, name: 'tabor' })
PARKS.push({ ...blocks(240, -560, 400, -400), name: 'irving' })
PARKS.push({ ...blocks(480, -880, 640, -720), name: 'alberta' })
PARKS.push({ ...blocks(-160, -880, 0, -720), name: 'peninsula' })
PARKS.push({ ...blocks(880, -480, 1040, -400), name: 'grant' })
PARKS.push({ kind: 'poly', pts: [[150, 760], [330, 760], [360, 960], [120, 960]], name: 'oaks bottom' })
PARKS.push({ kind: 'poly', pts: ISLAND, name: 'ross island' })
PARKS.push({ kind: 'circle', c: LADD.c, r: LADD.r, name: 'ladd' })
for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
  const [x, y] = [LADD.c[0] + dx * 62, LADD.c[1] + dy * 42]
  PARKS.push({ kind: 'poly', pts: [[x, y - 12], [x + 12, y], [x, y + 12], [x - 12, y]], name: 'ladd' })
}

for (const p of PARKS) {
  const pts = p.kind === 'poly' ? p.pts : [[p.c[0] - (p.r ?? p.rx), p.c[1] - (p.r ?? p.ry)], [p.c[0] + (p.r ?? p.rx), p.c[1] + (p.r ?? p.ry)]]
  p.box = [Math.min(...pts.map((q) => q[0])), Math.min(...pts.map((q) => q[1])), Math.max(...pts.map((q) => q[0])), Math.max(...pts.map((q) => q[1]))]
}
export const inPark = (x, y, pad = 0) => PARKS.some((p) => {
  if (x < p.box[0] - pad || x > p.box[2] + pad || y < p.box[1] - pad || y > p.box[3] + pad) return false
  if (p.kind === 'circle') return Math.hypot(x - p.c[0], y - p.c[1]) < p.r + pad
  if (p.kind === 'ellipse') return ((x - p.c[0]) / (p.rx + pad)) ** 2 + ((y - p.c[1]) / (p.ry + pad)) ** 2 < 1
  return inPoly(x, y, p.pts)
})

/* ── Where roads meet the river ──────────────────────────────────────── */

/*
 * A road that crosses the river keeps going and has a bridge laid over the
 * wet run (and a few metres past each bank). Grid streets are not roads here:
 * they simply stop at the bank, because no lot is built in the water.
 */
export const BRIDGES = []
{
  const extra = []
  for (const rd of ROADS) {
    const fine = [rd.pts[0]]
    for (let i = 1; i < rd.pts.length; i++) {
      const a = rd.pts[i - 1]
      const b = rd.pts[i]
      const n = Math.max(1, Math.ceil(dist(a, b) / 3))
      for (let k = 1; k <= n; k++) fine.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)])
    }
    let from = -1
    for (let i = 0; i <= fine.length; i++) {
      const wet = i < fine.length && inWater(fine[i][0], fine[i][1])
      if (wet && from < 0) from = i
      if (!wet && from >= 0) {
        const pts = fine.slice(Math.max(0, from - 3), Math.min(fine.length, i + 3))
        const b = { pts, w: rd.w, cls: 'bridge', name: rd.name, of: rd.cls }
        extra.push(b)
        BRIDGES.push(b)
        from = -1
      }
    }
  }
  ROADS.push(...extra)
}

/* ── Clearance from roads: a hash of samples ─────────────────────────── */

const CELL = 30
const hash = new Map()
for (const rd of ROADS) {
  for (let i = 1; i < rd.pts.length; i++) {
    const a = rd.pts[i - 1]
    const b = rd.pts[i]
    const n = Math.max(1, Math.ceil(dist(a, b) / 3))
    for (let k = 0; k <= n; k++) {
      const p = [lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]
      const key = `${Math.floor(p[0] / CELL)},${Math.floor(p[1] / CELL)}`
      if (!hash.has(key)) hash.set(key, [])
      hash.get(key).push([p[0], p[1], rd.w / 2])
    }
  }
}
export function clearOfRoads(x, y, pad) {
  const cx = Math.floor(x / CELL)
  const cy = Math.floor(y / CELL)
  const reach = Math.ceil((pad + 14) / CELL)
  for (let i = -reach; i <= reach; i++) for (let j = -reach; j <= reach; j++) {
    for (const [px, py, h] of hash.get(`${cx + i},${cy + j}`) ?? []) if (Math.hypot(px - x, py - y) < h + pad) return false
  }
  return true
}

/* ── Blocks and lots ─────────────────────────────────────────────────── */

/*
 * Three grids. Downtown is turned to the river; Ladd's is a rectangle of
 * diagonal streets; everything else on the flat is one true-north grid whose
 * streets are every 80 m from the Burnside Bridge, on both banks. A block is
 * built three ways by where it is: the middle of town in whole, half and
 * quarter blocks; round it, lots round the edge of each block; further out,
 * houses with gaps between them. A lot is dropped where a road, the river, a
 * park or a site comes through.
 */
const inSW = (x, y) => y > 12 && y < 470 && westOfRiver(x, y) && x > I405(y) + 16
const inLadd = (x, y) => x > LADD.x0 && x < LADD.x1 && y > LADD.y0 && y < LADD.y1
const DISTRICTS = [
  { name: 'downtown', o: SW.o, ang: SW.ang, px: 80, py: 80, sw: 18, has: inSW },
  { name: 'ladd', o: LADD.c, ang: 45, px: 54, py: 54, sw: 11, has: inLadd },
  { name: 'flat', o: [0, 0], ang: 0, px: 80, py: 80, sw: 18, has: (x, y) => inBounds(x, y, 30) && !inHills(x, y) && !inSW(x, y) && !inLadd(x, y) && !(westOfRiver(x, y) && y > 0 && y < 24) },
]
/** How a block is built: 'core', 'mid' or 'house'. */
function zoneOf(x, y, g) {
  const west = westOfRiver(x, y)
  const core = west ? x > -540 && y > -350 && y < 500 : x < 345 && y > -350 && y < 410
  if (core) return g() < 0.9 ? 'core' : 'mid'
  const d = Math.hypot((x + 60) / 1050, (y - 20) / 640)
  if (d < 1) return g() < 0.88 ? 'mid' : 'house'
  return g() < (d < 1.25 ? 0.25 : 0.04) ? 'mid' : 'house'
}

export const BLOCKS = []
export const LOTS = []

const ptOk = ([x, y]) => !inWater(x, y) && !inPark(x, y, 1) && clearOfRoads(x, y, 1.5) && !nearSite(x, y, 8)
const quadOk = (q) => {
  const pts = [...q, [(q[0][0] + q[2][0]) / 2, (q[0][1] + q[2][1]) / 2]]
  for (let i = 0; i < 4; i++) pts.push([(q[i][0] + q[(i + 1) % 4][0]) / 2, (q[i][1] + q[(i + 1) % 4][1]) / 2])
  return pts.every(ptOk)
}

for (const d of DISTRICTS) {
  const W = rot(d.o, d.ang)
  const g = rng(d.name.length * 977 + 31)
  const span = d.name === 'flat' ? 2200 : 700
  for (let i = -Math.ceil(span / d.px); i < span / d.px; i++) {
    for (let j = -Math.ceil(span / d.py); j < span / d.py; j++) {
      const u0 = i * d.px + d.sw / 2
      const v0 = j * d.py + d.sw / 2
      const bw = d.px - d.sw
      const bh = d.py - d.sw
      const centre = W([u0 + bw / 2, v0 + bh / 2])
      if (!inBounds(centre[0], centre[1], 20) || !d.has(...centre)) continue
      const quad = [[u0, v0], [u0 + bw, v0], [u0 + bw, v0 + bh], [u0, v0 + bh]].map(W)
      const zone = d.name === 'ladd' ? 'house' : zoneOf(centre[0], centre[1], g)
      const lots = []
      const add = (u, v, w, h, house = false) => {
        if (w < 3 || h < 3) return
        const c = W([u + w / 2, v + h / 2])
        if (!d.has(...c)) return
        const q = [[u, v], [u + w, v], [u + w, v + h], [u, v + h]].map(W)
        if (!quadOk(q)) return
        lots.push({ quad: q, c, seed: g(), house })
      }
      const cuts = (len, lo = 8, vary = 12) => {
        const out = [0]
        while (out.at(-1) < len - lo) out.push(Math.min(len, out.at(-1) + lo + g() * vary))
        out[out.length - 1] = len
        return out
      }
      const pick = g()
      if (zone === 'house') {
        // Houses along the two long sides, a yard behind and a gap between.
        const rows = d.name === 'ladd' ? [[0, 1]] : [[0, 1], [1, -1]]
        for (const [side] of rows) {
          const across = cuts(bw, 11, 5)
          for (let n = 0; n < across.length - 1; n++) {
            const dep = 12 + g() * 5
            add(u0 + across[n] + 1.6, side ? v0 + bh - 2.4 - dep : v0 + 2.4, across[n + 1] - across[n] - 3.2, dep, true)
          }
        }
        if (d.name === 'ladd') {
          const across = cuts(bw, 10, 4)
          for (let n = 0; n < across.length - 1; n++) add(u0 + across[n] + 1.4, v0 + bh - 15, across[n + 1] - across[n] - 2.8, 12.6, true)
        }
      } else if (zone === 'core' && pick < 0.7) {
        // The middle of town: a whole block, two halves or four quarters.
        const parts = pick < 0.18 ? [[0, 0, 1, 1]] : pick < 0.4 ? [[0, 0, 0.5, 1], [0.5, 0, 0.5, 1]] : [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]]
        for (const [a, b, cw, ch] of parts) if (g() > 0.08) add(u0 + a * bw + 0.8, v0 + b * bh + 0.8, cw * bw - 1.6, ch * bh - 1.6)
      } else {
        // Lots round the edge of the block, a court in the middle.
        const deep = Math.min(bh / 2 - 2, 14 + g() * 6)
        const across = cuts(bw)
        for (let n = 0; n < across.length - 1; n++) {
          add(u0 + across[n] + 0.8, v0 + 0.8, across[n + 1] - across[n] - 1.6, deep - g() * 4)
          add(u0 + across[n] + 0.8, v0 + bh - deep + g() * 3, across[n + 1] - across[n] - 1.6, deep - 3.8)
        }
        const down = cuts(bh - deep * 2)
        for (let n = 0; n < down.length - 1; n++) {
          add(u0 + 0.8, v0 + deep + down[n] + 0.8, deep - g() * 4, down[n + 1] - down[n] - 1.6)
          add(u0 + bw - deep + 0.8, v0 + deep + down[n] + 0.8, deep - 1.6, down[n + 1] - down[n] - 1.6)
        }
      }
      if (!lots.length) continue
      const whole = zone !== 'house' && lots.length >= 3 && quad.every(([x, y]) => clearOfRoads(x, y, 1) && !inWater(x, y) && !inPark(x, y))
      BLOCKS.push({ quad, c: centre, district: d.name, zone, whole })
      LOTS.push(...lots)
    }
  }
}

/*
 * A site's own block: built up to the lot line on both sides and behind, so
 * a plan is drawn among its neighbours and not on bare paper. (The museum and
 * the hall stand in their own grounds.)
 */
{
  const g = rng(515)
  for (const st of SITES.filter((q) => ['shop', 'bank', 'studio'].includes(q.key))) {
    const bx0 = Math.floor((st.o[0] + st.w / 2) / 80) * 80 + 9
    const by0 = Math.floor((st.o[1] + st.h / 2) / 80) * 80 + 9
    const [bx1, by1] = [bx0 + 62, by0 + 62]
    for (let i = LOTS.length - 1; i >= 0; i--) {
      const c = LOTS[i].c
      if (c[0] > bx0 - 1 && c[0] < bx1 + 1 && c[1] > by0 - 1 && c[1] < by1 + 1) LOTS.splice(i, 1)
    }
    const [sx0, sy0, sx1] = [st.o[0], st.o[1], st.o[0] + st.w]
    const lot = (x0, y0, x1, y1) => { if (x1 - x0 > 4 && y1 - y0 > 4) LOTS.push({ quad: [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], c: [(x0 + x1) / 2, (y0 + y1) / 2], seed: 0.5 + g() * 0.5, house: false }) }
    /** A strip from x0 to x1 cut into lots about 13 m wide, each from its own back line down to the street. */
    const row = (x0, x1, y0, y1, vary) => {
      const n = Math.max(1, Math.round((x1 - x0) / 13))
      for (let k = 0; k < n; k++) lot(x0 + ((x1 - x0) * k) / n + 0.3, y0 + (vary ? g() * vary : 0), x0 + ((x1 - x0) * (k + 1)) / n - 0.3, y1)
    }
    const front = by1 - 0.8
    row(bx0 + 0.8, sx0 - 0.6, sy0 - 2, front, 5)
    row(sx1 + 0.6, bx1 - 0.8, sy0 - 2, front, 5)
    // Behind: the block's other street front.
    const back = Math.min(sy0 - 9, by0 + 22)
    if (back - by0 > 9) row(bx0 + 0.8, bx1 - 0.8, by0 + 0.8, back, 0)
    const block = BLOCKS.find((b) => Math.abs(b.c[0] - (bx0 + 31)) < 2 && Math.abs(b.c[1] - (by0 + 31)) < 2)
    if (block) block.whole = true
    else BLOCKS.push({ quad: [[bx0, by0], [bx1, by0], [bx1, by1], [bx0, by1]], c: [bx0 + 31, by0 + 31], district: 'flat', zone: 'mid', whole: true })
  }
}

/* The arena by the river, north of the Steel Bridge: part of the town, not marked out. */
{
  const c = [-2, -236]
  for (let i = LOTS.length - 1; i >= 0; i--) if (dist(LOTS[i].c, c) < 54) LOTS.splice(i, 1)
  LOTS.push({ quad: arcPts(c, 37, 37, Math.PI / 8, Math.PI / 8 + Math.PI * 2, 29).slice(0, 8), c, seed: 0.95, house: false })
}

/* Houses along the hills' winding streets. */
const placed = new Map()
const free = (x, y, rad) => {
  const cx = Math.floor(x / 20)
  const cy = Math.floor(y / 20)
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (const [px, py, pr] of placed.get(`${cx + i},${cy + j}`) ?? []) if (Math.hypot(px - x, py - y) < pr + rad) return false
  return true
}
const place = (x, y, rad) => {
  const key = `${Math.floor(x / 20)},${Math.floor(y / 20)}`
  if (!placed.has(key)) placed.set(key, [])
  placed.get(key).push([x, y, rad])
}
for (const l of LOTS) place(l.c[0], l.c[1], 5)
{
  const g = rng(4242)
  for (const rd of ROADS.filter((q) => q.cls === 'street')) {
    const L = polyLen(rd.pts)
    for (const side of [1, -1]) {
      let s = 6 + g() * 8
      while (s < L - 6) {
        const w = 10 + g() * 9
        const depth = 11 + g() * 7
        const { p, t } = along(rd.pts, s)
        const n = [t[1] * side, -t[0] * side]
        const back = rd.w / 2 + 3
        const c = [p[0] + n[0] * (back + depth / 2), p[1] + n[1] * (back + depth / 2)]
        const rad = Math.hypot(w, depth) / 2
        if (inBounds(c[0], c[1]) && !inWater(...c) && !inPark(...c, 2) && clearOfRoads(c[0], c[1], rad - 1) && !nearSite(c[0], c[1], 12) && free(c[0], c[1], rad * 0.8)) {
          const hw = [(t[0] * w) / 2, (t[1] * w) / 2]
          const hd = [(n[0] * depth) / 2, (n[1] * depth) / 2]
          LOTS.push({ quad: [[c[0] - hw[0] - hd[0], c[1] - hw[1] - hd[1]], [c[0] + hw[0] - hd[0], c[1] + hw[1] - hd[1]], [c[0] + hw[0] + hd[0], c[1] + hw[1] + hd[1]], [c[0] - hw[0] + hd[0], c[1] - hw[1] + hd[1]]], c, seed: g() * 0.5, house: true })
          place(c[0], c[1], rad * 0.8)
        }
        s += w + 2 + g() * 10
      }
    }
  }
}

/* ── Trees ───────────────────────────────────────────────────────────── */

const BANK_SAMPLES = [...WEST_BANK, ...EAST_BANK].filter((p, i) => i % 2 === 0 && inBounds(p[0], p[1], 40))
const nearBank = (x, y, d) => BANK_SAMPLES.some((p) => Math.abs(p[0] - x) < d && Math.abs(p[1] - y) < d)
/** Points for stippling: [x, y, radius]. The parks, the river's banks, the hills' forest. */
export const TREES = (() => {
  const g = rng(99)
  const out = []
  for (let k = 0; k < 70000; k++) {
    const x = lerp(BOUNDS.x0, BOUNDS.x1, g())
    const y = lerp(BOUNDS.y0, BOUNDS.y1, g())
    const rad = 1.6 + g() * 2.4
    const roll = g()
    const hills = inHills(x, y)
    const park = inPark(x, y, -3)
    // Forest thins a third of the hills; a bank is planted one tree in two.
    if (!park && (hills ? roll > 0.34 : roll > 0.5 || !nearBank(x, y, 15))) continue
    if (inWater(x, y) || nearSite(x, y, 4) || !clearOfRoads(x, y, 3)) continue
    if (!park && !free(x, y, 4)) continue
    out.push([x, y, rad])
  }
  return out
})()

/* ── Beyond the city: the region, in less detail ─────────────────────── */

/*
 * Seen only as the camera pulls out at the end (the user, 2026-11-09): the
 * Columbia across the north, the Willamette running up to meet it, the
 * suburbs thinning, and the mountain in the east. Not to scale: the mountain
 * is brought in to about half its true distance.
 */
export const COLUMBIA = (() => {
  const c = spline([[14500, -1100], [11500, -760], [9000, -640], [6750, -640], [4400, -880], [2070, -1190], [-150, -1370], [-1440, -1600], [-2260, -1840], [-2420, -2600], [-2850, -3600], [-3100, -4600]], 60)
  const side = (sgn) => c.map((p, i) => {
    const a = c[Math.max(0, i - 1)]
    const b = c[Math.min(c.length - 1, i + 1)]
    const L = dist(a, b) || 1
    return [p[0] + (sgn * (b[1] - a[1]) * 115) / L, p[1] - (sgn * (b[0] - a[0]) * 115) / L]
  })
  return [...side(1), ...side(-1).reverse()]
})()
const inColumbia = (x, y) => inPoly(x, y, COLUMBIA)
export const HOOD = { c: [11400, 1650] }
/** The mountain as contours: rings that are rounder and closer toward the top. */
export const HOOD_RINGS = [1500, 1220, 960, 730, 530, 360, 220, 110].map((R, k) => {
  const g = rng(300 + k)
  const ph = [g() * 6, g() * 6, g() * 6]
  const rough = 0.16 * (R / 1500) + 0.03
  return Array.from({ length: 73 }, (_, i) => {
    const a = (i / 72) * Math.PI * 2
    const rr = R * (1 + rough * Math.sin(3 * a + ph[0]) + rough * 0.6 * Math.sin(5 * a + ph[1]) + rough * 0.35 * Math.sin(9 * a + ph[2]))
    return [HOOD.c[0] + rr * Math.cos(a), HOOD.c[1] + rr * Math.sin(a) * 0.9]
  })
})
/** The foothills between the town and the mountain: lines that run north–south and tighten eastward. */
export const FOOTHILLS = [5600, 6300, 6900, 7500, 8050, 8600, 9100].map((x0, k) => {
  const pts = []
  for (let y = -500; y <= 4400; y += 80) {
    const x = x0 + (130 + 30 * k) * Math.sin(y / (420 + 40 * k) + k * 1.3) + 50 * Math.sin(y / 130 + k)
    if (Math.hypot(x - HOOD.c[0], (y - HOOD.c[1]) / 0.9) > 1650) pts.push([x, y])
  }
  return pts
})
/** The suburbs: blocks only, thinning with distance from the city's sheet. */
export const OUTSKIRTS = (() => {
  const g = rng(808)
  const patch = (x, y) => 0.5 + 0.25 * Math.sin(x / 410 + 1.3) * Math.cos(y / 370 - 0.4) + 0.15 * Math.sin((x + y) / 190) + 0.1 * Math.sin(x / 97 - y / 131)
  const out = []
  for (let x = -4200; x < 6600; x += 80) {
    for (let y = -2600; y < 3200; y += 80) {
      const cx = x + 40
      const cy = y + 40
      if (inBounds(cx, cy, 20)) continue
      const d = Math.hypot(Math.max(BOUNDS.x0 - cx, 0, cx - BOUNDS.x1), Math.max(BOUNDS.y0 - cy, 0, cy - BOUNDS.y1))
      const hills = cx < footX(cy) && cx > footX(cy) - 1500
      // Built solid at the sheet's edge, thinning in patches; further to the east than anywhere else.
      const keep = hills ? 0.03 : 1.3 - d / (cx > BOUNDS.x1 ? 3400 : 1900)
      if (patch(cx, cy) + (g() - 0.5) * 0.3 > keep) continue
      if (inWater(cx, cy) || inColumbia(cx, cy) || Math.abs(cy) < 12) continue
      out.push([x + 9, y + 9, 62])
    }
  }
  return out
})()

/* For the review: what is built. */
export const STATS = { blocks: BLOCKS.length, lots: LOTS.length, roads: ROADS.length, bridges: BRIDGES.length, trees: TREES.length, outskirts: OUTSKIRTS.length }
