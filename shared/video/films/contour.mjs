/*
 * Contour — style C2, "Into the Wild" drawn as a topographic survey sheet.
 *
 * A quadrangle: generative terrain as contour lines, heavier index contours
 * with their elevations set along them, water as a blue tint with its shoreline
 * and depth lines, woodland as a pale green tint, and one red dashed trail. The
 * map collar along the foot of the sheet carries the lyric the way a quad
 * carries its own name. Every noun the song sings becomes a landform: the hush
 * of a harbor is a drowned bay, the roar of a crowd is a range whose contours
 * pile up word by word, and the wild is a massif the trail runs up into.
 *
 * WHY IT IS FAST ENOUGH
 *
 * A contour map is marching squares over a height field, and that is far too
 * much work to do sixty times a second. So nothing here is computed per frame
 * except strings being joined. Terrain is generated in 800-unit tiles, and each
 * tile's contours, fills, labels and hachures are made once and cached in a
 * module-level Map keyed by (scene, tile, step). The terrain may change — the
 * roar raises its range — but only in STEPS on measured words, each step a new
 * cache entry; never continuously. A pan is a translate on cached tiles, which
 * does not touch stroke weight, and only the tiles in view are drawn.
 *
 * The cache is deterministic (every field is a pure function of its seed), so
 * it changes how long a frame takes, never what it looks like: frame 4000 is
 * the same picture whether it is drawn first or after the other 3999.
 */

import { t, rect, line, path, circle, rng, r, advance, clamp01, lerp, ramp, fall, easeOut, easeInOut } from '../kit.mjs'
import { sectionAt, shownLineAt, lineAt, splitLine, bankWords, throughRow, sizeToMeasure, cutIn, wordIndexAt } from '../score.mjs'
import { cuesIn, cueFor } from '../cues.mjs'
import { endCard } from '../ending.mjs'

/* ── The palette. A survey sheet's inks, and one red. ─────────────── */
export const PAPER = '#f2eee3'
export const BROWN = '#a0714a'
export const INDEX = '#6b4426'
export const WATER_LINE = '#4f86a3'
export const WATER = '#cfe0e6'
export const WOOD = '#dfe6cf'
export const ICE = '#d9e8ef'
export const TRAIL = '#c8412d'
export const INK = '#23211e'

/* ── The sheet. Map above, collar below. ──────────────────────────── */
const NEAT = { x0: 30, y0: 30, x1: 1570, y1: 700 }
const COLLAR_TOP = 712
const TILE = 800
const CELL = 16
const FIELD_H = 736
/** Where the cross-section A—A′ is cut, for the sections with nothing to sing. */
const SECTION_Y = 320

/* ══ TERRAIN ══════════════════════════════════════════════════════════
 *
 * A scene is a height field in feet, a contour interval, a sea level, and a
 * woodland field. All of it is built from a seed, so a scene redrawn is the
 * same scene.
 */

const gauss = (x, y, cx, cy, sx, sy = sx) => Math.exp(-(((x - cx) ** 2) / (2 * sx * sx) + ((y - cy) ** 2) / (2 * sy * sy)))

/** Smooth deterministic wiggle: a handful of seeded sinusoids. */
function waves(seed, count, scale, amp) {
  const rand = rng(seed)
  const terms = Array.from({ length: count }, () => {
    const a = rand() * Math.PI * 2
    const k = (0.6 + rand() * 1.4) / scale
    return { kx: Math.cos(a) * k, ky: Math.sin(a) * k, p: rand() * Math.PI * 2, w: 0.5 + rand() * 0.5 }
  })
  const total = terms.reduce((s, x) => s + x.w, 0)
  return (x, y) => {
    let v = 0
    for (const q of terms) v += q.w * Math.sin(q.kx * x + q.ky * y + q.p)
    return (v / total) * amp
  }
}

/** Distance from a point to a polyline. */
function distTo(pts, x, y) {
  let best = Infinity
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1]
    const [bx, by] = pts[i]
    const dx = bx - ax
    const dy = by - ay
    const u = clamp01(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1))
    const d = Math.hypot(x - ax - u * dx, y - ay - u * dy)
    if (d < best) best = d
  }
  return best
}

/** Terracing: flats with steep risers, so contours bunch in bands. */
const terrace = (v, step) => {
  // A smooth staircase — flats and risers without a kink, which marching squares turns into noise.
  const u = v / step
  return (u - 0.85 * Math.sin(u * Math.PI * 2) / (Math.PI * 2)) * step
}

/*
 * The recipes. Each returns { f, interval, width, wood, trail?, features }.
 * `amp` is the step the terrain has risen to, 0→1, for the scenes that grow on
 * words; `features` are named places a symbol can be set on.
 */
const RECIPES = {
  hills(seed, amp = 1) {
    const rand = rng(seed)
    const bumps = Array.from({ length: 6 }, () => ({
      x: 120 + rand() * 1360, y: 90 + rand() * 540, s: 120 + rand() * 170, a: 160 + rand() * 360,
    }))
    const n = waves(seed + 7, 6, 160, 45)
    const lake = { x: 200 + rand() * 1200, y: 150 + rand() * 450 }
    return {
      interval: 40,
      f: (x, y) => {
        let v = 120 + n(x, y)
        for (const b of bumps) v += b.a * amp * gauss(x, y, b.x, b.y, b.s)
        return v - 260 * gauss(x, y, lake.x, lake.y, 90, 70)
      },
      features: { peak: bumps.reduce((a, b) => (b.a > a.a ? b : a)) },
    }
  },

  /* The hush of a harbor: a drowned bay. Low, gentle, wide-spaced, mostly sea. */
  bay(seed) {
    const n = waves(seed, 6, 180, 22)
    return {
      interval: 40,
      f: (x, y) => {
        const g = (x / 1600) * 0.55 + (1 - y / 720) * 0.45
        let v = -150 + 560 * g ** 1.4 + n(x, y)
        v -= 260 * gauss(x, y, 560, 520, 420, 240)
        v += 120 * gauss(x, y, 930, 470, 70, 150)
        return v
      },
      features: { light: { x: 930, y: 560 }, peak: { x: 1480, y: 90 } },
    }
  },

  /* The roar of a crowd: a sharp range, bunched, that rises on every word. */
  range(seed, amp = 1) {
    const rand = rng(seed)
    const peaks = Array.from({ length: 7 }, (_, i) => ({
      x: 520 + i * 95 + (rand() - 0.5) * 70,
      y: 330 + (rand() - 0.5) * 160,
      s: 55 + rand() * 60,
      a: 520 + rand() * 520 + (i === 3 ? 520 : 0),
    }))
    const n = waves(seed + 3, 6, 140, 40)
    return {
      interval: 50,
      f: (x, y) => {
        let v = 120 + n(x, y) + 160 * gauss(x, y, 800, 360, 520, 300)
        for (const p of peaks) v += p.a * amp * gauss(x, y, p.x, p.y, p.s, p.s * 1.4)
        return v
      },
      features: { peak: peaks[3] },
    }
  },

  /* Glaciers, gardens and grottos: three landforms, one sheet, west to east. */
  composite(seed) {
    const n = waves(seed, 6, 150, 30)
    const bowls = [[200, 250], [390, 230], [560, 270]]
    return {
      interval: 40,
      f: (x, y) => {
        let v = 200 + n(x, y)
        // Cirques: a high ridge along the north-west with bowls bitten out of its south face.
        v += 1100 * gauss(x, y, 380, 90, 330, 110)
        for (const [bx, by] of bowls) v -= 380 * gauss(x, y, bx, by, 80, 70)
        // Garden terraces in the middle.
        const g = 520 * gauss(x, y, 850, 420, 230, 200)
        v += terrace(g, 90)
        // The grotto: a closed depression on a knoll in the east.
        v += 420 * gauss(x, y, 1300, 380, 220, 200)
        v -= 330 * gauss(x, y, 1300, 390, 75, 60)
        return v
      },
      ice: (x, y) => 0.6 * gauss(x, y, 380, 140, 300, 80) + bowls.reduce((s, [bx, by]) => s + gauss(x, y, bx, by - 20, 70, 60), 0) - 0.55,
      features: { glacier: { x: 390, y: 150 }, garden: { x: 850, y: 420 }, grotto: { x: 1300, y: 390 } },
    }
  },

  terraces(seed) {
    const n = waves(seed, 6, 160, 30)
    return {
      interval: 40,
      f: (x, y) => 100 + n(x, y) + terrace(700 * gauss(x, y, 820, 380, 420, 260), 110),
      features: { peak: { x: 820, y: 380 } },
    }
  },

  depression(seed) {
    const rand = rng(seed)
    const cx = 500 + rand() * 600
    const n = waves(seed, 6, 150, 35)
    return {
      interval: 40,
      f: (x, y) => 160 + n(x, y) + 520 * gauss(x, y, cx, 380, 300, 240) - 360 * gauss(x, y, cx + 20, 390, 90, 70),
      features: { grotto: { x: cx + 20, y: 390 } },
    }
  },

  /* Wind through the sage: open slopes, wide spacing, and a lot of scrub. */
  slopes(seed, amp = 1, width = 1600) {
    const n = waves(seed, 7, 220, 40)
    const m = waves(seed + 5, 5, 90, 12)
    return {
      interval: 40,
      width,
      f: (x, y) => 40 + (1 - y / 720) * 420 + n(x, y) + m(x, y) + 200 * gauss(x, y, 1150, 200, 260, 160),
      woodK: 0.1,
      features: { peak: { x: 1150, y: 200 } },
    }
  },

  /* The wild: a massif with a valley the trail runs up. Wider than the frame, for the pan. */
  massif(seed, amp = 1, width = 3000, flip = false) {
    const rand = rng(seed)
    const Y = (y) => (flip ? 720 - y : y)
    const trail = [[110, 650], [380, 590], [640, 500], [900, 450], [1160, 360], [1420, 330],
      [1700, 270], [1980, 300], [2260, 230], [2540, 260], [2820, 200], [3100, 230], [3380, 180]]
      .filter(([x]) => x <= width + 200)
      .map(([x, y]) => [x + (rand() - 0.5) * 60, Y(y + (rand() - 0.5) * 50)])
    const peaks = []
    for (let x = 500; x < width + 300; x += 260 + rand() * 120) {
      const north = peaks.length % 2 === 0
      peaks.push({ x, y: Y(north ? 90 + rand() * 90 : 560 + rand() * 120), s: 170 + rand() * 110, a: (800 + rand() * 700) * amp })
    }
    const n = waves(seed + 11, 7, 130, 60)
    return {
      interval: 80,
      width,
      trail,
      f: (x, y) => {
        let v = 80 + n(x, y) + Math.min(x, 2000) * 0.25
        let p = 0
        for (const q of peaks) p += q.a * gauss(x, y, q.x, q.y, q.s, q.s * 1.2)
        const tube = Math.exp(-((distTo(trail, x, y) / 130) ** 2))
        v += p * (1 - 0.8 * tube) - 60 * tube
        v -= 320 * gauss(x, y, trail[0][0], trail[0][1] + (flip ? -40 : 40), 150, 90)
        return v
      },
      features: { peak: peaks.reduce((a, b) => (b.a > a.a ? b : a)), peaks },
    }
  },

  /* The horns: a long range to pan along, twice the frame and a half. */
  ridge(seed, amp = 1, width = 4000) {
    const rand = rng(seed)
    const peaks = []
    for (let x = 100; x < width + 300; x += 150 + rand() * 140) {
      peaks.push({ x, y: 300 + (rand() - 0.5) * 240, s: 90 + rand() * 90, a: 400 + rand() * 900 })
    }
    const n = waves(seed + 2, 7, 160, 50)
    return {
      interval: 80,
      width,
      f: (x, y) => {
        let v = 60 + n(x, y) + 200 * gauss(x, y, x, 340, 1, 220)
        for (const q of peaks) v += q.a * gauss(x, y, q.x, q.y, q.s, q.s * 1.6)
        return v - 240 * gauss(x, y, 0, 700, 1e9, 60)
      },
      features: {},
    }
  },
}

/* Which landform a line's drawing is, from the shared cue list. */
const KIND = {
  lighthouse: 'bay', wave: 'bay', crowd: 'range', microphone: 'range', gem: 'range', crown: 'range',
  pine: 'massif', runner: 'massif', glacier: 'composite', flower: 'terraces', cave: 'depression',
  sprig: 'slopes', book: 'terraces', door: 'depression',
}

/* ══ MARCHING SQUARES ═════════════════════════════════════════════════ */

function grid(f, x0, y0, w, h, pad) {
  const nx = Math.ceil(w / CELL)
  const ny = Math.ceil(h / CELL)
  const px = pad ? 1 : 0
  const cols = nx + 1 + 2 * px
  const rows = ny + 1 + 2 * px
  const v = new Float64Array(cols * rows)
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const edge = pad && (i === 0 || j === 0 || i === cols - 1 || j === rows - 1)
      v[j * cols + i] = edge ? -1e6 : f(x0 + (i - px) * CELL, y0 + (j - px) * CELL)
    }
  }
  return { v, cols, rows, x0: x0 - px * CELL, y0: y0 - px * CELL }
}

const SEGS = [[], [[3, 2]], [[2, 1]], [[3, 1]], [[0, 1]], [[3, 0], [2, 1]], [[0, 2]], [[3, 0]],
  [[3, 0]], [[0, 2]], [[0, 1], [3, 2]], [[0, 1]], [[3, 1]], [[2, 1]], [[3, 2]], []]

/** Every contour of `g` at `level`, joined into polylines of [x, y]. */
function trace(g, level) {
  const { v, cols, rows, x0, y0 } = g
  const NH = rows * (cols - 1)
  const pts = new Map()
  const adj = new Map()
  const link = (a, b) => {
    const la = adj.get(a); la ? la.push(b) : adj.set(a, [b])
    const lb = adj.get(b); lb ? lb.push(a) : adj.set(b, [a])
  }
  const at = (e, i, j) => {
    if (pts.has(e)) return
    let ax, ay, bx, by, va, vb
    if (e < NH) { ax = i; ay = j; bx = i + 1; by = j } else { ax = i; ay = j; bx = i; by = j + 1 }
    va = v[ay * cols + ax]; vb = v[by * cols + bx]
    const u = clamp01((level - va) / (vb - va || 1e-9))
    pts.set(e, [x0 + (ax + (bx - ax) * u) * CELL, y0 + (ay + (by - ay) * u) * CELL])
  }
  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const a = v[j * cols + i] >= level
      const b = v[j * cols + i + 1] >= level
      const c = v[(j + 1) * cols + i + 1] >= level
      const d = v[(j + 1) * cols + i] >= level
      const k = (a ? 8 : 0) | (b ? 4 : 0) | (c ? 2 : 0) | (d ? 1 : 0)
      if (k === 0 || k === 15) continue
      // Edges: 0 top, 1 right, 2 bottom, 3 left.
      const E = [j * (cols - 1) + i, NH + j * cols + i + 1, (j + 1) * (cols - 1) + i, NH + j * cols + i]
      const ij = [[i, j], [i + 1, j], [i, j + 1], [i, j]]
      for (const [p, q] of SEGS[k]) {
        at(E[p], ij[p][0], ij[p][1])
        at(E[q], ij[q][0], ij[q][1])
        link(E[p], E[q])
      }
    }
  }
  const used = new Set()
  const chains = []
  const walk = (start) => {
    const chain = [start]
    used.add(start)
    let cur = start
    for (;;) {
      const next = (adj.get(cur) ?? []).find((e) => !used.has(e))
      if (next == null) break
      used.add(next)
      chain.push(next)
      cur = next
    }
    const closed = chain.length > 2 && (adj.get(cur) ?? []).includes(start)
    return { points: chain.map((e) => pts.get(e)), closed }
  }
  for (const [e, list] of adj) if (list.length === 1 && !used.has(e)) chains.push(walk(e))
  for (const e of adj.keys()) if (!used.has(e)) chains.push(walk(e))
  return chains
}

/** Douglas–Peucker, so a contour costs its shape rather than its grid. */
function simplify(points, tol = 1.5) {
  if (points.length < 4) return points
  const keep = new Uint8Array(points.length)
  keep[0] = keep[points.length - 1] = 1
  const stack = [[0, points.length - 1]]
  while (stack.length) {
    const [a, b] = stack.pop()
    const [ax, ay] = points[a]
    const [bx, by] = points[b]
    const L = Math.hypot(bx - ax, by - ay) || 1
    let far = -1
    let fd = tol
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((bx - ax) * (ay - points[i][1]) - (ax - points[i][0]) * (by - ay)) / L
      if (d > fd) { fd = d; far = i }
    }
    if (far > 0) { keep[far] = 1; stack.push([a, far], [far, b]) }
  }
  return points.filter((_, i) => keep[i])
}

const lengthOf = (pts) => pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0)

/*
 * Quadratics through the midpoints. A contour joined with straight segments
 * reads as a mountain range drawn by a machine, or as a bug.
 */
function smooth(pts, closed) {
  const R = (n) => Math.round(n)
  if (pts.length < 3) return `M${R(pts[0][0])} ${R(pts[0][1])}` + pts.slice(1).map((p) => `L${R(p[0])} ${R(p[1])}`).join('')
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  if (closed) {
    const ring = pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1] ? pts.slice(0, -1) : pts
    const m0 = mid(ring[0], ring[1])
    let d = `M${R(m0[0])} ${R(m0[1])}`
    for (let i = 1; i <= ring.length; i++) {
      const p = ring[i % ring.length]
      const m = mid(p, ring[(i + 1) % ring.length])
      d += `Q${R(p[0])} ${R(p[1])} ${R(m[0])} ${R(m[1])}`
    }
    return d + 'Z'
  }
  let d = `M${R(pts[0][0])} ${R(pts[0][1])}`
  for (let i = 1; i < pts.length - 1; i++) {
    const m = mid(pts[i], pts[i + 1])
    d += `Q${R(pts[i][0])} ${R(pts[i][1])} ${R(m[0])} ${R(m[1])}`
  }
  const last = pts[pts.length - 1]
  return d + `L${R(last[0])} ${R(last[1])}`
}

/* ══ THE CACHE ════════════════════════════════════════════════════════ */

const SCENES = new Map()
const TILES = new Map()

/** A scene object, made once per key. */
function scene(key, kind, seed, amp = 1, extra = {}) {
  const id = `${key}|${amp}`
  let s = SCENES.get(id)
  if (!s) {
    const make = RECIPES[kind] ?? RECIPES.hills
    const made = kind === 'massif'
      ? make(seed, amp, extra.width ?? 3000, extra.flip)
      : make(seed, amp, extra.width)
    const wood = waves(seed + 91, 5, 120, 1)
    s = { key, kind, seed, amp, ...made, width: made.width ?? 1600, wood: (x, y) => wood(x, y) - (made.woodK ?? 0.32) }
    SCENES.set(id, s)
  }
  return s
}

/*
 * One tile of one scene: every level's contour as path data, the water and
 * woodland fills, index labels and depression hachures. Built once.
 */
function tile(s, index) {
  const id = `${s.key}|${s.amp}|${index}`
  const hit = TILES.get(id)
  if (hit) return hit
  const x0 = index * TILE
  const g = grid(s.f, x0, 0, TILE, FIELD_H, false)
  let lo = Infinity
  let hi = -Infinity
  let top = null
  for (let j = 0; j < g.rows; j++) {
    for (let i = 0; i < g.cols; i++) {
      const val = g.v[j * g.cols + i]
      if (val < lo) lo = val
      if (val > hi) { hi = val; top = [g.x0 + i * CELL, g.y0 + j * CELL] }
    }
  }
  const I = s.interval
  const levels = []
  for (let L = Math.ceil(lo / I) * I; L <= hi; L += I) {
    if (L === 0) continue
    const chains = trace(g, L)
      .map((c) => ({ ...c, points: simplify(c.points) }))
      .filter((c) => lengthOf(c.points) > 48)
    if (!chains.length) continue
    const index5 = L % (I * 5) === 0
    const d = chains.map((c) => smooth(c.points, c.closed)).join('')
    // Labels: the longest run of an index contour gets its elevation, reading uphill-right.
    const labels = []
    if (index5 && L > 0) {
      const long = chains.filter((c) => lengthOf(c.points) > 380).sort((a, b) => lengthOf(b.points) - lengthOf(a.points)).slice(0, 2)
      for (const c of long) {
        const pts = c.points
        const total = lengthOf(pts)
        let acc = 0
        for (let i = 1; i < pts.length; i++) {
          const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
          if (acc + seg >= total * 0.45) {
            let a = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]) * 180 / Math.PI
            if (a > 90) a -= 180
            if (a < -90) a += 180
            const [x, y] = pts[i - 1]
            if (x > x0 + 40 && x < x0 + TILE - 40 && y > 70 && y < 660) labels.push({ x, y, a, text: String(L) })
            break
          }
          acc += seg
        }
      }
    }
    // Hachures: ticks on the inside of a closed contour whose middle is lower.
    let hach = ''
    if (L > 0) {
      for (const c of chains) {
        if (!c.closed || c.points.length < 6) continue
        const cx = c.points.reduce((a, p) => a + p[0], 0) / c.points.length
        const cy = c.points.reduce((a, p) => a + p[1], 0) / c.points.length
        if (s.f(cx, cy) >= L) continue
        let acc = 0
        for (let i = 1; i < c.points.length; i++) {
          const [ax, ay] = c.points[i - 1]
          const [bx, by] = c.points[i]
          const seg = Math.hypot(bx - ax, by - ay)
          acc += seg
          if (acc < 26) continue
          acc = 0
          let nx = -(by - ay) / (seg || 1)
          let ny = (bx - ax) / (seg || 1)
          if ((cx - ax) * nx + (cy - ay) * ny < 0) { nx = -nx; ny = -ny }
          hach += `M${Math.round(ax)} ${Math.round(ay)}l${r(nx * 9)} ${r(ny * 9)}`
        }
      }
    }
    levels.push({ L, d, index: index5, labels, hach })
  }
  // Woodland: where the wood field is up and the ground is dry. Padded so every ring closes.
  const woodG = grid((x, y) => Math.min(s.wood(x, y) * 400, s.f(x, y) - 30), x0 - CELL, 0, TILE + 2 * CELL, FIELD_H, true)
  const wood = trace(woodG, 0).map((c) => smooth(simplify(c.points, 1.5), true)).join('')
  let ice = ''
  if (s.ice) {
    const iceG = grid((x, y) => s.ice(x, y), x0 - CELL, 0, TILE + 2 * CELL, FIELD_H, true)
    ice = trace(iceG, 0).map((c) => smooth(simplify(c.points, 1.5), true)).join('')
  }
  const out = { levels, wood, ice, top, hi }
  TILES.set(id, out)
  return out
}

/** Water, per tile and per sea level — the harbor's sea rises word by word. */
const WATERS = new Map()
function water(s, index, sea) {
  const id = `${s.key}|${s.amp}|${index}|${sea}`
  const hit = WATERS.get(id)
  if (hit) return hit
  const x0 = index * TILE
  // Filled a cell past the tile on each side, so two tiles' fills overlap rather than meet on a hairline.
  const g = grid((x, y) => sea - s.f(x, y), x0 - CELL, 0, TILE + 2 * CELL, FIELD_H, true)
  const fill = trace(g, 0).map((c) => smooth(simplify(c.points, 1.2), true)).join('')
  // The shoreline itself, unpadded, so it stops at the tile edge rather than running along it.
  const open = grid((x, y) => sea - s.f(x, y), x0, 0, TILE, FIELD_H, false)
  const shore = trace(open, 0).filter((c) => lengthOf(c.points) > 30).map((c) => smooth(simplify(c.points), c.closed)).join('')
  const out = { fill, shore }
  WATERS.set(id, out)
  return out
}

/* ══ DRAWING A MAP ════════════════════════════════════════════════════ */

/**
 * The terrain, in view. `reveal` is how many levels are inked, counted up from
 * the sea — a line's contours go down word by word — and `fresh` is how far the
 * newest level has faded in, for the 90 ms ease on each step.
 */
function drawMap(s, { viewX = 0, sea = 0, reveal = Infinity, fresh = 1, tints = {}, uid }) {
  const first = Math.max(0, Math.floor(viewX / TILE))
  const last = Math.min(Math.ceil((s.width ?? 1600) / TILE) - 1, Math.floor((viewX + 1600) / TILE))
  const under = []
  const lines = []
  const wet = []
  const labels = []
  for (let k = first; k <= last; k++) {
    const T = tile(s, k)
    const W = water(s, k, sea)
    // Tile paths are already in field coordinates; the view is one translate for all of them.
    const dx = -Math.round(viewX)
    const shift = dx ? ` transform="translate(${dx} 0)"` : ''
    const land = T.levels.filter((l) => l.L > sea)
    const drowned = T.levels.filter((l) => l.L < sea)
    under.push(`<g${shift}>${T.wood ? `<path d="${T.wood}" fill="${WOOD}"/>` : ''}${T.ice && tints.ice ? `<path d="${T.ice}" fill="${ICE}" stroke="${WATER_LINE}" stroke-width="2" stroke-dasharray="7 6" opacity="${r(tints.ice, 3)}"/>` : ''}<path d="${W.fill}" fill="${WATER}" fill-rule="evenodd"/></g>`)
    const shown = land.slice(0, reveal === Infinity ? land.length : Math.max(0, Math.ceil(reveal)))
    const regular = shown.filter((l) => !l.index).map((l, i, all) => {
      const newest = reveal !== Infinity && l === shown[shown.length - 1] && fresh < 1
      return newest ? `<path d="${l.d}" opacity="${r(fresh, 3)}"/>` : l.d
    })
    const plain = regular.filter((x) => !x.startsWith('<')).join('')
    const faded = regular.filter((x) => x.startsWith('<')).join('')
    const idx = shown.filter((l) => l.index)
    const hach = shown.map((l) => l.hach).join('')
    lines.push(`<g${shift} fill="none" stroke-linejoin="round">
      ${plain ? `<path d="${plain}" stroke="${BROWN}" stroke-width="1.5"/>` : ''}
      ${faded ? `<g stroke="${BROWN}" stroke-width="1.5">${faded}</g>` : ''}
      ${idx.length ? `<path d="${idx.map((l) => l.d).join('')}" stroke="${INDEX}" stroke-width="2.6"/>` : ''}
      ${hach ? `<path d="${hach}" stroke="${BROWN}" stroke-width="1.5" stroke-linecap="round"/>` : ''}
    </g>`)
    wet.push(`<g${shift} fill="none">
      ${drowned.length ? `<path d="${drowned.map((l) => l.d).join('')}" stroke="${WATER_LINE}" stroke-width="1.2" opacity="0.6"/>` : ''}
      ${W.shore ? `<path d="${W.shore}" stroke="${WATER_LINE}" stroke-width="2.2"/>` : ''}
    </g>`)
    for (const l of idx) {
      for (const lab of l.labels) {
        const x = lab.x + dx
        if (x < NEAT.x0 + 30 || x > NEAT.x1 - 30) continue
        labels.push(`<text x="${r(x)}" y="${r(lab.y)}" font-size="17" font-weight="500" fill="${INDEX}" text-anchor="middle" dominant-baseline="central" transform="rotate(${r(lab.a)} ${r(x)} ${r(lab.y)})" stroke="${PAPER}" stroke-width="6" paint-order="stroke">${lab.text}</text>`)
      }
    }
  }
  return `<g clip-path="url(#${uid}-map)">
    ${rect(0, 0, 1600, 736, PAPER)}
    ${under.join('')}
    ${wet.join('')}
    ${lines.join('')}
    ${labels.join('')}
  </g>`
}

/** A spot height: a cross and its elevation, the way a survey marks a summit. */
function spot(x, y, text, o = {}) {
  const k = o.size ?? 20
  return `<g opacity="${r(o.opacity ?? 1, 3)}">
    ${path(`M${r(x - 7)} ${r(y - 7)}L${r(x + 7)} ${r(y + 7)}M${r(x + 7)} ${r(y - 7)}L${r(x - 7)} ${r(y + 7)}`, { stroke: INK, sw: 2.6, cap: 'round' })}
    ${t({ x: x + 14, y: y + 7, size: k, text, fill: INK, weight: 500, upper: false, extra: `stroke="${PAPER}" stroke-width="5" paint-order="stroke"` })}
  </g>`
}

/** A feature named the way a survey letters one: italic, tracked, no mark. */
function featureName(x, y, text, o = {}) {
  const name = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
  return t({ x, y, size: 26, text: name, fill: INDEX, weight: 500, italic: true, upper: false, anchor: 'middle', tracking: 3, opacity: o.opacity ?? 1, extra: `stroke="${PAPER}" stroke-width="7" paint-order="stroke"` })
}

/** A benchmark triangle, for the summit the crowd is on. */
function benchmark(x, y, text, o = {}) {
  return `<g opacity="${r(o.opacity ?? 1, 3)}">
    ${path(`M${r(x)} ${r(y - 12)}L${r(x + 11)} ${r(y + 8)}L${r(x - 11)} ${r(y + 8)}Z`, { stroke: INK, sw: 2.6, join: 'round', fill: PAPER })}
    ${circle(x, y + 1, 2.4, { fill: INK })}
    ${t({ x: x + 18, y: y + 8, size: o.size ?? 22, text, fill: INK, weight: 600, upper: false, extra: `stroke="${PAPER}" stroke-width="6" paint-order="stroke"` })}
  </g>`
}

/** A light, on a headland: the chart symbol, which a survey sheet borrows. */
function light(x, y, o = {}) {
  const rays = [-60, -30, 0, 30, 60].map((a) => {
    const q = (a - 90) * Math.PI / 180
    return `M${r(x + Math.cos(q) * 12)} ${r(y + Math.sin(q) * 12)}L${r(x + Math.cos(q) * (26 + (o.pulse ?? 0) * 10))} ${r(y + Math.sin(q) * (26 + (o.pulse ?? 0) * 10))}`
  }).join('')
  return `<g opacity="${r(o.opacity ?? 1, 3)}">${path(rays, { stroke: TRAIL, sw: 2.4, cap: 'round' })}${circle(x, y, 6, { fill: TRAIL })}</g>`
}

/** Soundings in the bay: small numbers, a few per word. */
function soundings(s, sea, count, seed, viewX = 0) {
  const rand = rng(seed)
  const out = []
  let tries = 0
  while (out.length < count && tries < 400) {
    tries++
    const x = 60 + rand() * 1480
    const y = 60 + rand() * 620
    const depth = sea - s.f(x + viewX, y)
    if (depth < 12) continue
    out.push(t({ x, y, size: 15, text: String(Math.round(depth / 6)), fill: WATER_LINE, weight: 400, upper: false, italic: true, opacity: 0.9 }))
  }
  return out.join('')
}

/** Neatline, corner ticks, a north arrow and a scale bar: the furniture of a quad. */
function furniture(o = {}) {
  const q = o.opacity ?? 1
  const ticks = []
  for (let x = 230; x < 1570; x += 200) ticks.push(`M${x} ${NEAT.y0}v-12M${x} ${NEAT.y1}v12`)
  for (let y = 130; y < 700; y += 200) ticks.push(`M${NEAT.x0} ${y}h-12M${NEAT.x1} ${y}h12`)
  return `<g opacity="${r(q, 3)}">
    ${rect(NEAT.x0, NEAT.y0, NEAT.x1 - NEAT.x0, NEAT.y1 - NEAT.y0, 'none', { stroke: INK, sw: 2.2 })}
    ${path(ticks.join(''), { stroke: INK, sw: 1.4 })}
  </g>
  <g opacity="${r(q * (o.quiet ? 0.35 : 0.7), 3)}">
    ${path('M1530 112 L1530 64 M1530 62 L1520 86 L1530 78 L1540 86 Z', { stroke: INK, sw: 2, join: 'round', fill: INK })}
  </g>`
}

/* ══ THE COLLAR ═══════════════════════════════════════════════════════ */

/**
 * A row of type with the voice's position in it: drawn twice, the second copy
 * clipped to what has been sung. Brown until it is sung, ink once it is — the
 * colours of an unfinished survey and a finished one.
 */
function sungRow({ id, x, y, size, text, len, through, tracking, opacity = 1 }) {
  const left = x - len / 2
  const base = { x, y, size, text, len, anchor: 'middle', weight: 700, tracking, opacity }
  if (through <= 0) return t({ ...base, fill: BROWN })
  if (through >= 1) return t({ ...base, fill: INK })
  return `<clipPath id="${id}"><rect x="${r(left - 20)}" y="${r(y - size)}" width="${r(len * through + 20)}" height="${r(size * 1.4)}"/></clipPath>
    ${t({ ...base, fill: BROWN })}
    ${t({ ...base, fill: INK, extra: `clip-path="url(#${id})"` })}`
}

const MEASURE = 1440
const TRACK = 6

/** The lyric in the collar: one row if it fits large, two if not. */
function collarLyric(now, lyric, from, uid) {
  let rows = [lyric.text]
  let size = sizeToMeasure(lyric.text, MEASURE, 104, TRACK)
  if (size < 70) {
    rows = splitLine(lyric.text, 3)
    size = Math.min(...rows.map((row) => sizeToMeasure(row, MEASURE, 76, TRACK)))
  }
  const banks = bankWords(lyric, rows)
  const arrive = easeOut(ramp(now, from, from + 0.12))
  const top = COLLAR_TOP + 12
  const room = 900 - top - 16
  const lead = size * 1.02
  const block = rows.length === 1 ? size * 0.72 : lead + size * 0.72
  const first = top + (room - block) / 2 + size * 0.72
  return rows.map((row, i) => {
    const len = Math.min(MEASURE, advance(row, size, TRACK) - TRACK)
    return sungRow({
      id: `${uid}-row-${lyric.index}-${i}`,
      x: 800,
      y: first + i * lead,
      size,
      text: row,
      len,
      tracking: TRACK,
      through: throughRow(now, row, banks[i]),
      opacity: arrive,
    })
  }).join('')
}

/** The title, in the collar, the way a quadrangle is named. */
function collarTitle(now, score) {
  const title = score.title
  const size = sizeToMeasure(title, 900, 118, 14)
  const len = advance(title, size, 14) - 14
  const leave = fall(now, 14.6, 15.5)
  return `<g opacity="${r(leave, 3)}">
    ${t({ x: 800, y: 842, size, text: title, fill: INK, anchor: 'middle', weight: 700, tracking: 14, len, opacity: r(ramp(now, 1.0, 1.8), 3) })}
    ${t({ x: 800, y: 752, size: 22, text: score.artist, fill: TRAIL, anchor: 'middle', weight: 600, tracking: 12, opacity: r(ramp(now, 2.4, 3.1), 3) })}
  </g>`
}

/**
 * A profile, for the sections with nothing to sing: the ground cut along the
 * section line A—A′ across the middle of the sheet, drawn in the collar with the
 * height exaggerated, the way a survey prints its cross-sections.
 */
function profile(s, viewX, opacity, uid) {
  const pts = []
  let hi = -Infinity
  let lo = Infinity
  for (let x = 0; x <= 1600; x += 20) {
    const v = s.f(x + viewX, SECTION_Y)
    pts.push([x, v])
    if (v > hi) hi = v
    if (v < lo) lo = v
  }
  // Exaggerated to its own relief, the way a printed section is: a gentle slope still reads as ground.
  const floor = lo - 40
  const scale = 112 / Math.max(hi - floor, 240)
  const base = 882
  const Y = (v) => base - (Math.max(v, floor) - floor) * scale
  const X = (x) => 80 + (x / 1600) * 1440
  const d = pts.map(([x, v], i) => `${i ? 'L' : 'M'}${r(X(x))} ${r(Y(v))}`).join('')
  return `<g opacity="${r(opacity, 3)}">
    ${path(`${d}L1520 ${base}L80 ${base}Z`, { fill: WOOD })}
    ${path(d, { stroke: INK, sw: 2.2, join: 'round' })}
    ${line(80, base, 1520, base, INK, 1.4)}
    ${t({ x: 52, y: base - 4, size: 22, text: 'A', fill: INK, weight: 600, anchor: 'middle' })}
    ${t({ x: 1548, y: base - 4, size: 22, text: 'A′', fill: INK, weight: 600, anchor: 'middle', upper: false })}
  </g>`
}

/* ══ THE TRAIL ════════════════════════════════════════════════════════ */

function trailPath(pts) {
  let total = 0
  const acc = [0]
  for (let i = 1; i < pts.length; i++) { total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); acc.push(total) }
  return { pts, acc, total }
}

/** Smoothed densely once, so the partial trail is a curve and not a polygon. */
const TRAILS = new Map()
function trailFor(s) {
  let tr = TRAILS.get(s.key)
  if (!tr) {
    const out = []
    const P = s.trail
    for (let i = 0; i < P.length - 1; i++) {
      const p0 = P[Math.max(0, i - 1)]; const p1 = P[i]; const p2 = P[i + 1]; const p3 = P[Math.min(P.length - 1, i + 2)]
      for (let k = 0; k < 12; k++) {
        const u = k / 12
        const u2 = u * u; const u3 = u2 * u
        out.push([0, 1].map((a) => 0.5 * ((2 * p1[a]) + (-p0[a] + p2[a]) * u + (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * u2 + (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * u3)))
      }
    }
    out.push(P[P.length - 1])
    tr = trailPath(out)
    TRAILS.set(s.key, tr)
  }
  return tr
}

function pointAlong(tr, dist) {
  const d = Math.max(0, Math.min(tr.total, dist))
  let i = 1
  while (i < tr.acc.length - 1 && tr.acc[i] < d) i++
  const u = (d - tr.acc[i - 1]) / ((tr.acc[i] - tr.acc[i - 1]) || 1)
  return { i, p: [lerp(tr.pts[i - 1][0], tr.pts[i][0], u), lerp(tr.pts[i - 1][1], tr.pts[i][1], u)] }
}

function drawTrail(tr, share, viewX, pulse = 0) {
  const { i, p } = pointAlong(tr, tr.total * share)
  if (share <= 0) return ''
  const pts = tr.pts.slice(0, i).concat([p])
  const d = pts.map(([x, y], k) => `${k ? 'L' : 'M'}${Math.round(x - viewX)} ${Math.round(y)}`).join('')
  const [sx, sy] = tr.pts[0]
  return `${path(d, { stroke: PAPER, sw: 9, cap: 'round', join: 'round', opacity: 0.85 })}
    ${path(d, { stroke: TRAIL, sw: 4.2, cap: 'round', join: 'round', dash: '16 10' })}
    ${circle(sx - viewX, sy, 9, { fill: PAPER, stroke: TRAIL, sw: 3 })}
    ${circle(p[0] - viewX, p[1], 8 + pulse * 5, { fill: TRAIL })}`
}

/* ══ THE FRAME ════════════════════════════════════════════════════════ */

/** Which scene a moment belongs to: a chorus is one sheet; a verse is one sheet per line. */
function sceneAt(score, now) {
  const section = sectionAt(score, now)
  const kind = section.kind
  if (kind === 'intro') return { s: scene('intro', 'hills', 3), section }
  if (kind === 'break') return { s: scene('break', 'slopes', 41, 1, { width: 2400 }), section, pan: 800 }
  if (kind === 'solo') return { s: scene('solo', 'ridge', 57, 1, { width: 4000 }), section, pan: 2400 }
  if (kind === 'chorus' || kind === 'outro') {
    const id = kind === 'outro' ? 'chorus-3' : section.id
    const n = Number(id.split('-')[1] ?? 1)
    const width = n === 3 ? 3000 : 2600
    return { s: scene(id, 'massif', 200 + n * 17, n === 3 ? 1.25 : 1, { width, flip: n === 2 }), section, chorus: score.sections.find((x) => x.id === id) }
  }
  const shown = shownLineAt(score, now)
  if (!shown || shown.section !== section.id) return { s: scene(`${section.id}-pre`, 'hills', 300 + section.from), section }
  const cue = cuesIn(shown).some((c) => c.motif === 'glacier') ? 'composite' : (KIND[cueFor(shown)] ?? 'hills')
  return { s: scene(`line-${shown.index}`, cue, 400 + shown.index * 13), section, line: shown, cue }
}

/**
 * One frame of the film.
 *
 * @param {object} o
 * @param {number} o.time  Seconds into the song.
 * @param {object} o.score app/config/intoTheWildScore.ts, or any score shaped like it.
 * @param {string} [o.lockup] The band's stacked mark, as inner SVG, for the end card.
 * @param {string} [o.uid] Prefix for every id in the frame.
 */
export function contourFrame({ time, score, lockup = '', uid = 'topo' }) {
  const now = time
  if (score.endCardAt != null && now >= score.endCardAt) return endCard({ now, from: score.endCardAt, lockup })

  const at = sceneAt(score, now)
  const { section } = at
  let { s } = at
  const shown = shownLineAt(score, now)
  const lyricLine = shown && shown.section === section.id ? shown : null
  const sung = lineAt(score, now)

  let viewX = 0
  let sea = 0
  let reveal = Infinity
  let fresh = 1
  const tints = {}
  const marks = []
  let trail = ''

  if (section.kind === 'intro') {
    // The survey inks itself in, one contour per beat of the count-in, from the sea up.
    const beats = Math.floor((now - 1.53) / 0.5)
    reveal = Math.max(0, beats)
    fresh = easeOut(ramp(now - 1.53 - beats * 0.5, 0, 0.09))
  }
  else if (at.pan) {
    viewX = at.pan * easeInOut(ramp(now, section.from, section.to))
  }
  else if (at.chorus) {
    const c = at.chorus
    const lines = score.lines.filter((l) => l.section === c.id)
    const [l1, l2] = lines
    const tr = trailFor(s)
    const tNow = Math.min(now, c.to)
    const endAt = c.to - 0.6
    let share = 0
    if (l1 && l2) {
      share = tNow < l1.start ? 0 : tNow < l2.start
        ? 0.34 * ramp(tNow, l1.start, l2.start)
        : lerp(0.34, 1, ramp(tNow, l2.start, endAt))
    }
    const head = pointAlong(tr, tr.total * share).p
    const panMax = s.width - 1600
    viewX = Math.max(0, Math.min(panMax, head[0] - 980))
    const pulse = sung && sung.section === c.id
      ? sung.words.reduce((m, w) => Math.max(m, now < w.t ? 0 : Math.exp(-(now - w.t) / 0.14)), 0)
      : 0
    trail = drawTrail(tr, share, viewX, pulse)
    // The summit the trail is making for: the highest in view, and clear of the sheet's edges.
    const pk = (s.features.peaks ?? [])
      .filter((q) => q.x - viewX > 160 && q.x - viewX < 1380 && q.y > 110 && q.y < 600)
      .sort((a, b) => b.a - a.a)[0]
    if (pk) {
      marks.push(spot(pk.x - viewX, pk.y, String(Math.round(s.f(pk.x, pk.y) / 10) * 10), { opacity: ramp(now, l1?.start ?? c.from, (l1?.start ?? c.from) + 0.3) }))
    }
  }
  else if (at.line) {
    const L = at.line
    const k = wordIndexAt(L, now)
    const words = L.words.length
    const since = k >= 0 ? now - L.words[k].t : 0
    if (at.cue === 'range') {
      // The roar: the range rises a step on every word. Each step is its own cached sheet.
      const step = Math.max(0, k + 1)
      s = scene(`line-${L.index}`, 'range', 400 + L.index * 13, r(0.16 + 0.84 * (step / words), 3))
      const pk = s.features.peak
      const height = Math.round(s.f(pk.x, pk.y) / 10) * 10
      marks.push(benchmark(pk.x, pk.y - 4, String(height), { size: 26 }))
    }
    else if (at.cue === 'bay') {
      // The hush: the sea comes in a little on every word, and the soundings with it.
      sea = Math.max(0, k + 1) * 8
      marks.push(soundings(s, sea, 6 + Math.max(0, k + 1) * 3, 70 + L.index))
      const harbor = cuesIn(L).find((c) => c.motif === 'lighthouse')
      if (harbor && now >= harbor.t) {
        const f = s.features.light
        marks.push(light(f.x, f.y, { opacity: easeOut(ramp(now, harbor.t, harbor.t + 0.09)), pulse: Math.exp(-(now - harbor.t) / 0.5) }))
      }
    }
    else {
      // Everything else inks its contours from the sea up, a band per word.
      const T = tile(s, 0)
      const total = T.levels.filter((l) => l.L > 0).length
      const share = 0.35 + 0.65 * (Math.max(0, k + 1) / words)
      reveal = Math.max(1, total * share)
      fresh = k >= 0 ? easeOut(ramp(since, 0, 0.09)) : 1
      if (at.cue === 'composite') {
        for (const c of cuesIn(L)) {
          if (now < c.t) continue
          const u = easeOut(ramp(now, c.t, c.t + 0.09))
          const f = s.features[{ glacier: 'glacier', flower: 'garden', cave: 'grotto' }[c.motif]]
          if (c.motif === 'glacier') tints.ice = u
          if (f) marks.push(featureName(f.x, f.y, c.word != null ? L.words[c.word].text.replace(/[^A-Za-z]/g, '') : '', { opacity: u }))
        }
        reveal = Infinity
      }
      else {
        const cue = cuesIn(L).at(-1)
        const pk = s.features.peak ?? s.features.grotto
        if (cue && pk && now >= cue.t) {
          marks.push(spot(pk.x, pk.y, String(Math.round(s.f(pk.x, pk.y) / 10) * 10), { opacity: easeOut(ramp(now, cue.t, cue.t + 0.09)) }))
        }
      }
    }
  }

  /* ── The collar ──────────────────────────────────────────────────── */
  let collar = ''
  if (section.kind === 'intro') collar = collarTitle(now, score)
  else if (lyricLine) collar = collarLyric(now, lyricLine, cutIn(score, lyricLine), uid)
  else if (at.pan && (section.kind === 'break' || section.kind === 'solo')) {
    collar = profile(s, viewX, ramp(now, section.from, section.from + 0.8), uid)
    marks.push(`<g opacity="${r(0.8 * ramp(now, section.from, section.from + 0.8), 3)}">${line(NEAT.x0, SECTION_Y, NEAT.x1, SECTION_Y, INK, 1.4, { dash: '10 8' })}
      ${t({ x: 52, y: SECTION_Y - 8, size: 22, text: 'A', fill: INK, weight: 600, anchor: 'middle' })}
      ${t({ x: 1548, y: SECTION_Y - 8, size: 22, text: 'A′', fill: INK, weight: 600, anchor: 'middle', upper: false })}</g>`)
  }

  const map = drawMap(s, { viewX, sea, reveal, fresh, tints, uid })

  return {
    svg: [
      `<defs><clipPath id="${uid}-map"><rect x="${NEAT.x0}" y="${NEAT.y0}" width="${NEAT.x1 - NEAT.x0}" height="${NEAT.y1 - NEAT.y0}"/></clipPath></defs>`,
      rect(0, 0, 1600, 900, PAPER),
      map,
      `<g clip-path="url(#${uid}-map)">${trail}${marks.join('')}</g>`,
      furniture({ quiet: Boolean(lyricLine) }),
      line(NEAT.x0, COLLAR_TOP, NEAT.x1, COLLAR_TOP, INK, 1.2, { opacity: 0.5 }),
      collar,
    ].join('\n'),
    label: sung?.text ?? section.label,
  }
}

export const CONTOUR = {
  id: 'c2-contour',
  name: 'Contour',
  accent: TRAIL,
  palette: { PAPER, BROWN, INDEX, WATER_LINE, WATER, WOOD, TRAIL, INK },
}
