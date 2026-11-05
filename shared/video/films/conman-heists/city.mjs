/*
 * Conman — the city, take two (exploration, 2026-11-05). Geometry only.
 *
 * A town on the lines of Portland: a river that loops, a fine downtown grid
 * on the peninsula inside the loop, a long-blocked east side with diagonals
 * and a Ladd's-Addition circle, west hills of winding contour streets, a
 * freeway down the east bank, bridges everywhere. The anchor is in it, not on
 * it:
 *
 *   ring   — the ring road round a round hill (a Mount Tabor), the museum on top
 *   stock  — Main Street, the town's east–west street (a Burnside), which
 *            carries on over both rivers as ordinary streets past the circles
 *   balls  — the two traffic circles at either end of Main Street
 *   shank  — High Street, down the peninsula beside the park blocks
 *   arms   — the riverfront drive, round the inside of the loop
 *   flukes — two piers angled out into the river from the drive's two ends
 *   crown  — the waterfront plaza where High Street meets the drive
 *
 * World units are metres, north up, y down. Everything here is computed once.
 */
import { rng } from '../../kit.mjs'

/* ── Helpers ─────────────────────────────────────────────────────────── */

export const lerp = (a, b, u) => a + (b - a) * u
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])

/** Catmull-Rom through points, sampled about every `step` metres. */
export function spline(pts, step = 6) {
  const out = []
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const n = Math.max(2, Math.ceil(dist(p1, p2) / step))
    for (let k = 0; k < n; k++) {
      const t = k / n
      const t2 = t * t
      const t3 = t2 * t
      out.push([0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3)))
    }
  }
  out.push(pts.at(-1))
  return out
}

/** A polyline offset sideways by d (positive to the left of travel in screen space: +normal = (dy, -dx)). */
export function offset(pts, d) {
  return pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)]
    const b = pts[Math.min(pts.length - 1, i + 1)]
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const L = Math.hypot(dx, dy) || 1
    const dd = typeof d === 'function' ? d(i / (pts.length - 1)) : d
    return [p[0] + (dy / L) * dd, p[1] - (dx / L) * dd]
  })
}

export function inPoly(x, y, poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

export const arcPts = ([cx, cy], rx, ry, a0, a1, step = 4) => {
  const n = Math.max(2, Math.ceil((Math.abs(a1 - a0) * (rx + ry)) / 2 / step))
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = lerp(a0, a1, i / n)
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]
  })
}

export const polyLen = (pts) => pts.slice(1).reduce((s, p, i) => s + dist(p, pts[i]), 0)

/** Point and tangent at arc length s along a polyline. */
export function along(pts, s) {
  let acc = 0
  for (let i = 1; i < pts.length; i++) {
    const L = dist(pts[i], pts[i - 1])
    if (acc + L >= s || i === pts.length - 1) {
      const u = L ? Math.min(1, (s - acc) / L) : 0
      const dx = (pts[i][0] - pts[i - 1][0]) / (L || 1)
      const dy = (pts[i][1] - pts[i - 1][1]) / (L || 1)
      return { p: [lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)], t: [dx, dy] }
    }
    acc += L
  }
  return { p: pts.at(-1), t: [1, 0] }
}

/* ── The anchor, four metres to a unit of the mark ───────────────────── */

const U = 4
export const RING = { c: [100 * U, 26 * U], r: 18 * U }
export const BALL_R = 30
export const BALLS = [[42 * U, 79.5 * U], [158 * U, 79.5 * U]]
export const STOCK_Y = 79.5 * U
export const SHANK_X = 100 * U
export const ARMS = { c: [100 * U, 134 * U], rx: 68.5 * U, ry: 80.5 * U }
export const CROWN_Y = ARMS.c[1] + ARMS.ry
export const FLUKES = [[[31.5 * U, 134 * U], [16 * U, 102 * U]], [[168.5 * U, 134 * U], [184 * U, 102 * U]]]

/** The anchor's strokes as centrelines, in the order they read. */
export const ANCHOR = {
  ring: arcPts(RING.c, RING.r, RING.r, Math.PI / 2, Math.PI / 2 + Math.PI * 2, 3),
  balls: BALLS.map((b) => arcPts(b, BALL_R, BALL_R, 0, Math.PI * 2, 3)),
  stock: [[BALLS[0][0] + BALL_R, STOCK_Y], [BALLS[1][0] - BALL_R, STOCK_Y]],
  shank: [[SHANK_X, RING.c[1] + RING.r], [SHANK_X, CROWN_Y]],
  arms: arcPts(ARMS.c, ARMS.rx, ARMS.ry, Math.PI, 0, 3),
  flukes: FLUKES,
}
export const ANCHOR_LINES = [ANCHOR.ring, ...ANCHOR.balls, ANCHOR.stock, ANCHOR.shank, ANCHOR.arms, ...ANCHOR.flukes]

/* ── The old loop, and the river ─────────────────────────────────────── */

/*
 * The town grew inside a loop of land (the CORE): the downtown and north
 * grids, the Crescent's waterfront park. Its edge is a boulevard now, the
 * Loop, and the districts outside it keep their own grids, so the seam is a
 * street. (Until 2026-11-05 the loop was the river and the studio and the west
 * job stood on piers; the user wanted them on land.)
 */
const LOOP_CENTRE = (() => {
  const west = spline([[-120, -900], [-70, -420], [-45, -60], [-5, 220], [38, 420], [25, 536]], 8)
  const loop = arcPts(ARMS.c, 375, 480, Math.PI, 0, 8)
  const east = spline([[775, 536], [770, 420], [800, 200], [850, -80], [905, -420], [960, -900]], 8)
  return [...west.slice(0, -1), ...loop.slice(0, -1), ...east]
})()
const LOOP_INNER = offset(LOOP_CENTRE, 75)
const LOOP_OUTER = offset(LOOP_CENTRE, -80)
/** The core: everything inside the Loop. */
export const PENINSULA = [...LOOP_INNER, [LOOP_INNER.at(-1)[0], -1400], [LOOP_INNER[0][0], -1400]]

/*
 * The river: thinner, and cut diagonally across the town from the north-east
 * to the south-west. It comes down between the ring's hill and the east
 * circle, crosses Main Street a block east of High Street, runs through
 * downtown under High Street and out across the Crescent's west arm. No job
 * is on it: the nearest, the counting house, keeps 30 m of street between.
 */
const RIVER_CENTRE = spline([[1150, -700], [900, -330], [700, -60], [550, 150], [470, 318], [380, 470], [230, 640], [60, 820], [-200, 1000], [-600, 1250]], 8)
const WIDTH = (u) => lerp(62, 80, u)
export const INNER_BANK = offset(RIVER_CENTRE, (u) => WIDTH(u) / 2)
export const OUTER_BANK = offset(RIVER_CENTRE, (u) => -WIDTH(u) / 2)
export const RIVER = [...INNER_BANK, ...OUTER_BANK.slice().reverse()]
export const inWater = (x, y) => inPoly(x, y, RIVER)
export const ISLAND = []

/* ── The sites: six empty lots on the anchor ─────────────────────────── */

/*
 * Sizes are each plan's own (metres). The pier heads are decks built out at
 * the flukes' tips; the hall's front is on the drive at the crown, High Street
 * arriving at its doors.
 */
export const SITES = [
  { no: 1, key: 'shop', name: 'The Record Shop', at: 'the west circle', o: [185, 274], w: 27, h: 27 },
  { no: 2, key: 'bank', name: 'The Counting House', at: 'the east circle', o: [552, 280], w: 38, h: 24 },
  { no: 3, key: 'studio', name: 'The Studio', at: 'the east fluke', o: [722, 352], w: 46, h: 32 },
  { no: 4, key: 'museum', name: 'The Museum', at: 'the hill in the ring', o: [364, 68], w: 72, h: 72 },
  { no: 5, key: 'plant', name: 'The Pressing Plant', at: 'the west fluke', o: [30, 356], w: 40, h: 30 },
  { no: 6, key: 'hall', name: 'The Concert Hall', at: 'the crown', o: [362, 868], w: 76, h: 58 },
]
/** No piers now: both fluke sites are on land. */
export const PIERHEADS = []

/* ── Roads ───────────────────────────────────────────────────────────── */

/*
 * cls: anchor (the six strokes), arterial, street (a curving residential
 * street), freeway, bridge, pier. w is kerb to kerb.
 */
export const ROADS = []
const road = (pts, w, cls, name) => ROADS.push({ pts, w, cls, name })

// The anchor's own.
road(ANCHOR.ring, 16, 'anchor', 'The Circus')
for (const b of ANCHOR.balls) road(b, 14, 'anchor')
road(ANCHOR.stock, 16, 'anchor', 'Main Street')
road(ANCHOR.shank, 16, 'anchor', 'High Street')
road(ANCHOR.arms, 16, 'anchor', 'The Crescent')
// The fluke roads run from the arms' ends out to the two fluke sites.
road([FLUKES[0][0], [SITES[4].o[0] + SITES[4].w / 2 + 6, SITES[4].o[1] + SITES[4].h + 7]], 12, 'street')
road([FLUKES[1][0], [SITES[2].o[0] + SITES[2].w / 2 - 6, SITES[2].o[1] + SITES[2].h + 7]], 12, 'street')
// The Loop: the boulevard round the core.
road(offset(LOOP_INNER, 8).filter((p) => p[1] > -880), 14, 'arterial', 'The Loop')

// Main Street carries on past both circles as an ordinary street.
road([[BALLS[0][0] - BALL_R, STOCK_Y], [60, STOCK_Y]], 14, 'arterial')
road([[60, STOCK_Y], [-150, STOCK_Y - 6]], 14, 'bridge', 'Main Street Bridge')
road(spline([[-150, STOCK_Y - 6], [-260, STOCK_Y - 30], [-360, STOCK_Y - 110], [-470, STOCK_Y - 130], [-620, STOCK_Y - 230], [-900, STOCK_Y - 260]], 6), 12, 'arterial')
road([[BALLS[1][0] + BALL_R, STOCK_Y], [735, STOCK_Y]], 14, 'arterial')
road([[735, STOCK_Y], [960, STOCK_Y]], 14, 'bridge', 'Main Street Bridge')
road([[960, STOCK_Y], [2200, STOCK_Y]], 14, 'arterial')

// Streets out of the core across the Loop (bridges once, when the loop was water).
road([[-20, -150], [-230, -170]], 14, 'bridge')
road([[810, -60], [1040, -60]], 14, 'bridge')
const armAt = (deg) => [ARMS.c[0] + ARMS.rx * Math.cos((deg * Math.PI) / 180), ARMS.c[1] + ARMS.ry * Math.sin((deg * Math.PI) / 180)]
const outward = (deg, L) => {
  const p = armAt(deg)
  const a = (deg * Math.PI) / 180
  const n = [Math.cos(a) / ARMS.rx, Math.sin(a) / ARMS.ry]
  const k = Math.hypot(...n)
  return [p, [p[0] + (n[0] / k) * L, p[1] + (n[1] / k) * L]]
}
road(outward(140, 300), 14, 'bridge')
road(outward(52, 290), 14, 'bridge')
road([[95, 130], [-150, 95]], 13, 'bridge')
road([[728, 120], [930, 150]], 13, 'bridge')

// The east side: the freeway down the bank, two diagonals, the avenues.
const FREEWAY = offset(LOOP_OUTER.filter((p) => p[1] > -900 && p[0] > 700), -42).filter((p) => p[0] > 860)
road(FREEWAY, 24, 'freeway', 'The Freeway')
road([[960, 700], [1180, 470], [1500, 120], [2200, -500]], 13, 'arterial', 'Sandy Way')
road([[930, 1000], [1250, 1160], [2200, 1500]], 13, 'arterial', 'Foster Road')
road([[1180, -900], [1180, 1700]], 12, 'arterial')
road([[1640, -900], [1640, 1700]], 12, 'arterial')
road([[960, 760], [2200, 760]], 12, 'arterial')

// The west hills: contour streets that wind north–south, and switchbacks.
const westContour = (x0, ph, amp = 46) => spline(Array.from({ length: 14 }, (_, i) => {
  const y = -900 + i * 190
  return [x0 + amp * Math.sin(y / 230 + ph) + 0.5 * amp * Math.sin(y / 97 + ph * 2), y]
}), 6)
export const HILL_LINES = []
for (const [x0, ph] of [[-330, 0.3], [-470, 1.4], [-620, 2.2], [-790, 0.9], [-960, 2.9]]) HILL_LINES.push(westContour(x0, ph))
for (const k of [0, 2, 3]) road(HILL_LINES[k], 9, 'street')
road(spline([[-150, 520], [-260, 560], [-330, 470], [-470, 520], [-560, 620], [-620, 560]], 6), 9, 'street')
road(spline([[-230, -170], [-330, -230], [-420, -140], [-500, -260], [-620, -200], [-760, -320]], 6), 9, 'street')
road(spline([[-210, 880], [-330, 820], [-460, 900], [-540, 830], [-780, 900]], 6), 9, 'street')
// A freeway west into the hills, a Sunset Highway.
road(spline([[-150, 120], [-260, 80], [-380, 140], [-520, 60], [-700, 110], [-1000, 40]], 8), 22, 'freeway')

// The ring's hill: two contour streets round it and a road up from Main Street.
export const HILL_RINGS = [118, 160, 205, 255].map((R, k) => {
  const g = rng(70 + k)
  const p1 = g() * 6
  const p2 = g() * 6
  return Array.from({ length: 181 }, (_, i) => {
    const a = (i / 180) * Math.PI * 2
    const rr = R * (1 + 0.07 * Math.sin(3 * a + p1) + 0.04 * Math.sin(5 * a + p2))
    return [RING.c[0] + rr * Math.cos(a), RING.c[1] + rr * Math.sin(a) * 0.92]
  })
})
road(HILL_RINGS[0].filter((p) => p[1] < RING.c[1] + 80), 9, 'street')
road(HILL_RINGS[1].filter((p) => p[1] < STOCK_Y - 50), 9, 'street')
road(HILL_RINGS[2].filter((p) => p[1] < STOCK_Y - 40), 9, 'street')
road(spline([[RING.c[0] - 60, RING.c[1] - 90], [RING.c[0] - 120, RING.c[1] - 170], [RING.c[0] - 230, RING.c[1] - 230], [RING.c[0] - 300, RING.c[1] - 380]], 6), 9, 'street')
road(spline([[RING.c[0] + 70, RING.c[1] - 80], [RING.c[0] + 150, RING.c[1] - 120], [RING.c[0] + 190, RING.c[1] - 220], [RING.c[0] + 300, RING.c[1] - 330]], 6), 9, 'street')
road(spline([[RING.c[0] + 120, RING.c[1] + 60], [RING.c[0] + 210, RING.c[1] + 120], [RING.c[0] + 290, RING.c[1] + 110]], 6), 9, 'street')

/* ── Parks ───────────────────────────────────────────────────────────── */

export const PARKS = []
// The summit, inside the ring.
PARKS.push({ kind: 'circle', c: RING.c, r: RING.r - 8 })
// The park blocks, beside High Street.
PARKS.push({ kind: 'poly', pts: [[SHANK_X - 66, 404], [SHANK_X - 8, 404], [SHANK_X - 8, 790], [SHANK_X - 66, 790]] })
// The waterfront, between the drive and the river: a strip that is everything outside the arms.
// (Drawn by leaving it unbuilt; styles may plant it.)
// The west hills' forest.
PARKS.push({ kind: 'poly', pts: [[-1200, -900], [-560, -900], [-520, -500], [-640, -260], [-600, 40], [-760, 200], [-1200, 260]] })
// Ladd's circle and its four diamonds, on the east side.
export const LADD = { c: [1400, 470], r: 32, half: 230 }
PARKS.push({ kind: 'circle', c: LADD.c, r: LADD.r })
for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
  const [x, y] = [LADD.c[0] + dx * 130, LADD.c[1] + dy * 130]
  PARKS.push({ kind: 'poly', pts: [[x, y - 22], [x + 22, y], [x, y + 22], [x - 22, y]] })
}
road([[LADD.c[0] - LADD.half, LADD.c[1] - LADD.half], [LADD.c[0] + LADD.half, LADD.c[1] + LADD.half]], 11, 'street')
road([[LADD.c[0] - LADD.half, LADD.c[1] + LADD.half], [LADD.c[0] + LADD.half, LADD.c[1] - LADD.half]], 11, 'street')
road(arcPts(LADD.c, LADD.r + 6, LADD.r + 6, 0, Math.PI * 2, 3), 10, 'street')
// A big oval park with a ring of road (a Laurelhurst).
export const OVAL = { c: [1450, -180], rx: 150, ry: 110 }
PARKS.push({ kind: 'ellipse', c: OVAL.c, rx: OVAL.rx - 10, ry: OVAL.ry - 10 })
road(arcPts(OVAL.c, OVAL.rx, OVAL.ry, 0, Math.PI * 2, 4), 10, 'street')
road(arcPts(OVAL.c, OVAL.rx + 70, OVAL.ry + 60, 0, Math.PI * 2, 4), 9, 'street')

export const inPark = (x, y, pad = 0) => PARKS.some((p) => {
  if (p.kind === 'circle') return Math.hypot(x - p.c[0], y - p.c[1]) < p.r + pad
  if (p.kind === 'ellipse') return ((x - p.c[0]) / (p.rx + pad)) ** 2 + ((y - p.c[1]) / (p.ry + pad)) ** 2 < 1
  return inPoly(x, y, p.pts)
})

/* ── Where roads meet the river ──────────────────────────────────────── */

/*
 * Main roads cross it on a bridge (the road kept whole, a bridge laid over the
 * wet run and a few metres past each bank); streets stop at the bank. Anything
 * once a bridge over the old loop is an ordinary road on land now.
 */
{
  const MAJOR = new Set(['anchor', 'arterial', 'freeway'])
  const kept = []
  for (const rd of ROADS) {
    if (rd.cls === 'bridge' || rd.cls === 'pier') rd.cls = 'arterial'
    const fine = [rd.pts[0]]
    for (let i = 1; i < rd.pts.length; i++) {
      const a = rd.pts[i - 1]
      const b = rd.pts[i]
      const n = Math.max(1, Math.ceil(dist(a, b) / 3))
      for (let k = 1; k <= n; k++) fine.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)])
    }
    const wet = fine.map(([x, y]) => inWater(x, y))
    if (!wet.some(Boolean)) { kept.push(rd); continue }
    // Runs of wet and dry samples.
    const runs = []
    for (let i = 0; i < fine.length; i++) {
      if (!runs.length || runs.at(-1).wet !== wet[i]) runs.push({ wet: wet[i], from: i, to: i })
      else runs.at(-1).to = i
    }
    // A road that runs along the water rather than across it stops at the bank like a street.
    const crossing = runs.filter((q) => q.wet).every((q) => (q.to - q.from) * 3 < 150)
    if (rd.cls === 'anchor' || (MAJOR.has(rd.cls) && crossing)) {
      kept.push(rd)
      for (const run of runs.filter((q) => q.wet)) {
        const from = Math.max(0, run.from - 3)
        const to = Math.min(fine.length - 1, run.to + 3)
        kept.push({ pts: [fine[from], fine[to]], w: rd.w, cls: 'bridge', name: rd.name ? `${rd.name} Bridge` : undefined })
      }
    } else {
      for (const run of runs.filter((q) => !q.wet)) {
        const pts = fine.slice(run.from + (run.from ? 2 : 0), run.to + 1 - (run.to < fine.length - 1 ? 2 : 0))
        if (pts.length > 3) kept.push({ ...rd, pts })
      }
    }
  }
  ROADS.length = 0
  ROADS.push(...kept)
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

const nearSite = (x, y, pad) => SITES.some((s) => x > s.o[0] - pad && x < s.o[0] + s.w + pad && y > s.o[1] - pad && y < s.o[1] + s.h + pad)
const insideArms = (x, y) => y < ARMS.c[1] || ((x - ARMS.c[0]) / (ARMS.rx - 8)) ** 2 + ((y - ARMS.c[1]) / (ARMS.ry - 8)) ** 2 < 1
const inRingHill = (x, y) => Math.hypot(x - RING.c[0], (y - RING.c[1]) / 0.92) < 215

/* ── Blocks and lots ─────────────────────────────────────────────────── */

/*
 * Districts: each a grid (origin, angle, pitch, street width) and a test for
 * whether a point belongs. A block is kept whole or not at all; lots go round
 * its edge, and are dropped one at a time where a road, the river, a park or
 * a site comes through, so curving streets trim the grid as they would.
 */
const DISTRICTS = [
  { name: 'downtown', o: [SHANK_X, STOCK_Y], ang: 0, px: 80, py: 80, sw: 18,
    has: (x, y) => y > STOCK_Y && inPoly(x, y, PENINSULA) && insideArms(x, y) },
  { name: 'north', o: [SHANK_X, STOCK_Y], ang: -7, px: 72, py: 92, sw: 16,
    has: (x, y) => y < STOCK_Y && inPoly(x, y, PENINSULA) && !inRingHill(x, y) },
  { name: 'eastside', o: [1180, STOCK_Y], ang: 0, px: 76, py: 150, sw: 16,
    has: (x, y) => !inPoly(x, y, PENINSULA) && x > 700 && !inWater(x, y) && Math.abs(x - LADD.c[0]) + Math.abs(y - LADD.c[1]) > LADD.half * 1.02 },
  { name: 'ladd', o: LADD.c, ang: 45, px: 66, py: 66, sw: 14,
    has: (x, y) => Math.abs(x - LADD.c[0]) + Math.abs(y - LADD.c[1]) < LADD.half },
  { name: 'oldtown', o: [-150, STOCK_Y], ang: 14, px: 70, py: 70, sw: 15,
    has: (x, y) => x < 100 && x > -330 + 46 * Math.sin(y / 230 + 0.3) && !inPoly(x, y, PENINSULA) && !inWater(x, y) && y < 900 },
  { name: 'south', o: [SHANK_X, 1200], ang: 6, px: 80, py: 100, sw: 16,
    has: (x, y) => y > 900 && !inPoly(x, y, PENINSULA) && !inWater(x, y) && x > -330 && x < 760 },
]

export const BLOCKS = []
export const LOTS = []

const rot = (o, ang) => {
  const a = (ang * Math.PI) / 180
  const c = Math.cos(a)
  const s = Math.sin(a)
  return ([u, v]) => [o[0] + u * c - v * s, o[1] + u * s + v * c]
}

const BOUNDS = { x0: -1300, x1: 2300, y0: -1000, y1: 1600 }
const ptOk = ([x, y]) => !inWater(x, y) && !inPark(x, y, 1) && clearOfRoads(x, y, 1.5) && !nearSite(x, y, 8)
  && !PIERHEADS.some((ph) => inPoly(x, y, ph))
const quadOk = (q) => {
  const pts = [...q, [(q[0][0] + q[2][0]) / 2, (q[0][1] + q[2][1]) / 2]]
  for (let i = 0; i < 4; i++) pts.push([(q[i][0] + q[(i + 1) % 4][0]) / 2, (q[i][1] + q[(i + 1) % 4][1]) / 2])
  return pts.every(ptOk)
}

for (const d of DISTRICTS) {
  const W = rot(d.o, d.ang)
  const span = 3200
  const g = rng(d.name.length * 977)
  for (let i = -Math.ceil(span / d.px); i < span / d.px; i++) {
    for (let j = -Math.ceil(span / d.py); j < span / d.py; j++) {
      const u0 = i * d.px + d.sw / 2
      const v0 = j * d.py + d.sw / 2
      const bw = d.px - d.sw
      const bh = d.py - d.sw
      const centre = W([u0 + bw / 2, v0 + bh / 2])
      if (centre[0] < BOUNDS.x0 || centre[0] > BOUNDS.x1 || centre[1] < BOUNDS.y0 || centre[1] > BOUNDS.y1) continue
      if (!d.has(...centre)) continue
      const quad = [[u0, v0], [u0 + bw, v0], [u0 + bw, v0 + bh], [u0, v0 + bh]].map(W)
      const lots = []
      const add = (u, v, w, h, house = false) => {
        if (w < 3 || h < 3) return
        const c = W([u + w / 2, v + h / 2])
        if (!d.has(...c)) return
        const q = [[u, v], [u + w, v], [u + w, v + h], [u, v + h]].map(W)
        if (!quadOk(q)) return
        const tall = d.name === 'downtown' ? 10 + g() * g() * 70 : d.name === 'north' ? 8 + g() * 26 : house ? 5 + g() * 5 : 6 + g() * g() * 30
        lots.push({ quad: q, c, h: tall, seed: g(), house })
      }
      const cuts = (len, lo = 8, var_ = 12) => {
        const out = [0]
        while (out.at(-1) < len - lo) out.push(Math.min(len, out.at(-1) + lo + g() * var_))
        out[out.length - 1] = len
        return out
      }
      const pick = g()
      if (d.name === 'eastside') {
        // Houses back to back down the long sides, set back from the street, yards behind.
        for (const side of [0, 1]) {
          const along_ = cuts(bh, 11, 6)
          for (let n = 0; n < along_.length - 1; n++) {
            const dep = 11 + g() * 5
            const wid = along_[n + 1] - along_[n] - 3
            add(side ? u0 + bw - 3 - dep : u0 + 3, v0 + along_[n] + 1.5, dep, wid, true)
          }
        }
      } else if (d.name === 'downtown' && pick < 0.7) {
        // Downtown: a whole block, two halves or four quarters.
        const parts = pick < 0.18 ? [[0, 0, 1, 1]] : pick < 0.4 ? [[0, 0, 0.5, 1], [0.5, 0, 0.5, 1]] : [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 0.5, 0.5], [0.5, 0.5, 0.5, 0.5]]
        for (const [a, b, cw, ch] of parts) if (g() > 0.08) add(u0 + a * bw + 0.8, v0 + b * bh + 0.8, cw * bw - 1.6, ch * bh - 1.6)
      }
      const deep = Math.min(bh / 2 - 2, 14 + g() * 6)
      const across = cuts(bw)
      if (d.name !== 'eastside' && !(d.name === 'downtown' && pick < 0.7)) {
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
      // Kept if anything is built on it: a block the river or a park has taken goes.
      if (!lots.length) continue
      const whole = lots.length >= 6 && quad.every(([x, y]) => clearOfRoads(x, y, 1) && !inWater(x, y) && !inPark(x, y))
      BLOCKS.push({ quad, district: d.name, whole })
      LOTS.push(...lots)
    }
  }
}

/* Houses along the curving streets: the ring's hill, the west hills. */
const CURVY = ROADS.filter((rd) => rd.cls === 'street')
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
  for (const rd of CURVY) {
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
        if (c[0] > BOUNDS.x0 && c[0] < BOUNDS.x1 && c[1] > BOUNDS.y0 && c[1] < BOUNDS.y1 &&
            !inWater(...c) && !inPark(...c, 2) && clearOfRoads(c[0], c[1], rad - 1) && !nearSite(c[0], c[1], 12) && free(c[0], c[1], rad * 0.8)) {
          const hw = [t[0] * w / 2, t[1] * w / 2]
          const hd = [n[0] * depth / 2, n[1] * depth / 2]
          LOTS.push({ quad: [[c[0] - hw[0] - hd[0], c[1] - hw[1] - hd[1]], [c[0] + hw[0] - hd[0], c[1] + hw[1] - hd[1]], [c[0] + hw[0] + hd[0], c[1] + hw[1] + hd[1]], [c[0] - hw[0] + hd[0], c[1] - hw[1] + hd[1]]], c, h: 5 + g() * 7, seed: g(), house: true })
          place(c[0], c[1], rad * 0.8)
        }
        s += w + 2 + g() * 10
      }
    }
  }
}

/** Within d metres of the river (on either bank). */
const RIVER_SAMPLES = RIVER.filter((_, i) => i % 2 === 0)
const nearRiver = (x, y, d) => RIVER_SAMPLES.some((p) => Math.abs(p[0] - x) < d && Math.abs(p[1] - y) < d && Math.hypot(p[0] - x, p[1] - y) < d)

/* Trees: parks, the Crescent's esplanade, the river's banks, the hills' forest. Points, for stippling. */
export const TREES = (() => {
  const g = rng(99)
  const out = []
  for (let k = 0; k < 90000; k++) {
    const x = lerp(BOUNDS.x0, BOUNDS.x1, g())
    const y = lerp(BOUNDS.y0, BOUNDS.y1, g())
    if (inWater(x, y)) continue
    const park = inPark(x, y, -3)
    const esplanade = inPoly(x, y, PENINSULA) && y > ARMS.c[1] - 40 && !insideArms(x, y) && clearOfRoads(x, y, 4) && !nearSite(x, y, 6)
    const banks = nearRiver(x, y, 16) && clearOfRoads(x, y, 4) && !nearSite(x, y, 6)
    const waterfront = esplanade || banks
    if ((park || waterfront) && clearOfRoads(x, y, 3) && !nearSite(x, y, 4)) out.push([x, y, 1.6 + g() * 2.4])
  }
  return out
})()

/* For the review: what is built. */
export const STATS = { blocks: BLOCKS.length, lots: LOTS.length, roads: ROADS.length, trees: TREES.length }
