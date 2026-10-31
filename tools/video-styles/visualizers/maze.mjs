/*
 * Into the Wild · The Maze — Off the Grid, rethought (2026-10-31).
 *
 * Blank paper. The red line comes in from the left to the centre, and a maze
 * draws itself around it. It wanders, finds the way out, and walks straight
 * into a bigger maze that grows round the first. The third is very complex:
 * through the horns the dot scrambles, frantic, its pulse racing; at verse 3 it
 * stops, breathes, and takes the clean way out, reaching it as the last chorus
 * starts — and the camera pulls back to show all of it was the centre of a
 * maze too big to see the edge of. Life as a series of challenges: panic and
 * get stuck, or breathe and go.
 *
 * Mazes nest: maze k+1 is generated in the ring around maze k, and maze k's
 * door opens into it. World units are cells; the camera is a scale (screen
 * px per cell) centred on the origin. Pure function of time, rng(seed) only.
 */
import { PLATE, CX, CY, INK, PAPER, RED } from './sheet.mjs'
import { rng, r, clamp01, lerp, easeInOut, easeOut } from '../../../shared/video/kit.mjs'

const { x: PX, y: PY, w: PW, h: PH } = PLATE

/* ── The mazes ────────────────────────────────────────────────────── */

// Odd sizes, centred on cell (0, 0). Each is the ring around the last.
const SIZES = [[9, 7], [21, 15], [63, 31], [321, 163]]
// Which side each maze's door is on. The last has none: it never ends.
const DOORS = ['e', 'n', 'e', null]
const SEEDS = [3, 14, 15, 92]

const DIRS = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }
const key = (x, y) => `${x},${y}`

const inBox = (k, x, y) => {
  if (k < 0) return false
  const [w, h] = SIZES[k]
  return Math.abs(x) <= (w - 1) / 2 && Math.abs(y) <= (h - 1) / 2
}
/** Which maze a cell belongs to (its smallest enclosing box). */
const mazeOf = (x, y) => SIZES.findIndex((_, k) => inBox(k, x, y))

function build() {
  const open = new Set() // passages, as "x,y|x,y" both ways
  const link = (a, b) => { open.add(`${key(...a)}|${key(...b)}`); open.add(`${key(...b)}|${key(...a)}`) }
  const doors = []
  let entry = [0, 0]
  for (let k = 0; k < SIZES.length; k++) {
    const [w, h] = SIZES[k]
    const g = rng(SEEDS[k])
    const mine = (x, y) => inBox(k, x, y) && !inBox(k - 1, x, y)
    // Recursive backtracker from the cell the last maze's door lets onto.
    const seen = new Set([key(...entry)])
    const stack = [entry]
    while (stack.length) {
      const [x, y] = stack.at(-1)
      const next = Object.values(DIRS).map(([dx, dy]) => [x + dx, y + dy]).filter(([a, b]) => mine(a, b) && !seen.has(key(a, b)))
      if (!next.length) { stack.pop(); continue }
      const n = next[Math.floor(g() * next.length)]
      link([x, y], n)
      seen.add(key(...n))
      stack.push(n)
    }
    // The door: a cell on the outer wall, its far side the next maze's first cell.
    const side = DOORS[k]
    if (!side) break
    const along = Math.round((g() - 0.5) * (side === 'e' ? h - 3 : w - 3))
    const inside = side === 'e' ? [(w - 1) / 2, along] : [along, -(h - 1) / 2]
    const outside = [inside[0] + DIRS[side][0], inside[1] + DIRS[side][1]]
    link(inside, outside)
    doors.push({ inside, outside })
    entry = outside
  }
  return { open, doors, connected: (a, b) => open.has(`${key(...a)}|${key(...b)}`) }
}
const M = build()

/* ── Walls, drawn on outward from the centre as each maze appears ─── */

/** When maze k's walls draw on: [start, end], ring by ring outward. */
const REVEAL = [[10.5, 16], [49, 60], [101, 112], [184.5, 197]]

/** How far out a cell sits within its maze's ring, 0 inner edge to 1 outer. */
function ringDepth(k, x, y) {
  const [w, h] = SIZES[k]
  const outer = Math.max(Math.abs(x) / ((w - 1) / 2 || 1), Math.abs(y) / ((h - 1) / 2 || 1))
  if (k === 0) return outer
  const [iw, ih] = SIZES[k - 1]
  const inner = Math.max(((iw - 1) / 2 + 1) / ((w - 1) / 2), ((ih - 1) / 2 + 1) / ((h - 1) / 2))
  return clamp01((outer - inner) / (1 - inner))
}

/**
 * The walls in view at `time`, as one path in screen space. Unit wall pieces
 * are collected per row and column, then merged into runs so a big maze is
 * not a hundred thousand moveto's.
 */
function walls(time, cam) {
  const hRuns = new Map() // y-line → [x…] unit pieces starting at x
  const vRuns = new Map()
  const add = (map, line, at) => { if (!map.has(line)) map.set(line, []); map.get(line).push(at) }
  // The cell range on screen.
  const x0 = Math.floor(cam.toWorldX(PX)) - 1
  const x1 = Math.ceil(cam.toWorldX(PX + PW)) + 1
  const y0 = Math.floor(cam.toWorldY(PY)) - 1
  const y1 = Math.ceil(cam.toWorldY(PY + PH)) + 1
  for (let k = 0; k < SIZES.length; k++) {
    const [a, b] = REVEAL[k]
    if (time < a) break
    const [w, h] = SIZES[k]
    const hw = (w - 1) / 2
    const hh = (h - 1) / 2
    const shown = clamp01((time - a) / (b - a))
    for (let y = Math.max(-hh, y0); y <= Math.min(hh, y1); y++) {
      for (let x = Math.max(-hw, x0); x <= Math.min(hw, x1); x++) {
        if (mazeOf(x, y) !== k) continue
        if (ringDepth(k, x, y) > shown) continue
        // Each cell owns its east and south walls, and its west/north if that side is not in a maze drawn later than it.
        for (const [d, [dx, dy]] of Object.entries(DIRS)) {
          const nx = x + dx
          const ny = y + dy
          const other = mazeOf(nx, ny)
          if (M.connected([x, y], [nx, ny])) continue
          if (other !== -1 && other < k) continue // the inner maze draws its own outer wall, door and all
          if ((d === 'w' || d === 'n') && other === k) continue // the neighbour draws it as its e/s
          if (d === 'n') add(hRuns, y - 0.5, x - 0.5)
          if (d === 's') add(hRuns, y + 0.5, x - 0.5)
          if (d === 'w') add(vRuns, x - 0.5, y - 0.5)
          if (d === 'e') add(vRuns, x + 0.5, y - 0.5)
        }
      }
    }
  }
  let d = ''
  for (const [line, starts] of hRuns) {
    starts.sort((p, q) => p - q)
    for (let i = 0; i < starts.length;) {
      let j = i
      while (j + 1 < starts.length && starts[j + 1] <= starts[j] + 1) j++
      d += `M${r(cam.sx(starts[i]))} ${r(cam.sy(line))}H${r(cam.sx(starts[j] + 1))}`
      i = j + 1
    }
  }
  for (const [line, starts] of vRuns) {
    starts.sort((p, q) => p - q)
    for (let i = 0; i < starts.length;) {
      let j = i
      while (j + 1 < starts.length && starts[j + 1] <= starts[j] + 1) j++
      d += `M${r(cam.sx(line))} ${r(cam.sy(starts[i]))}V${r(cam.sy(starts[j] + 1))}`
      i = j + 1
    }
  }
  return d
}

/* ── The walk ─────────────────────────────────────────────────────── */

const neighbours = (k, [x, y]) =>
  Object.values(DIRS).map(([dx, dy]) => [x + dx, y + dy]).filter(([a, b]) => mazeOf(a, b) === k && M.connected([x, y], [a, b]))

/**
 * Exploring maze k from `from` the way a person does: go on, and back out of
 * dead ends, retracing every step. `bias` is the chance of trying the way
 * towards `goal` first. Stops on `goal`, or after `limit` steps.
 */
function explore(k, from, goal, bias, seed, limit = Infinity) {
  const g = rng(seed)
  const walk = [from]
  const seen = new Set([key(...from)])
  const stack = [from]
  while (stack.length && walk.length < limit) {
    const here = stack.at(-1)
    if (goal && here[0] === goal[0] && here[1] === goal[1]) break
    let next = neighbours(k, here).filter((c) => !seen.has(key(...c)))
    if (!next.length) { stack.pop(); if (stack.length) walk.push(stack.at(-1)); continue }
    next = next.sort(() => g() - 0.5)
    if (goal && g() < bias) next.sort((p, q) => Math.hypot(p[0] - goal[0], p[1] - goal[1]) - Math.hypot(q[0] - goal[0], q[1] - goal[1]))
    seen.add(key(...next[0]))
    stack.push(next[0])
    walk.push(next[0])
  }
  return walk
}

/** The shortest way through maze k. */
function solve(k, from, goal) {
  const prev = new Map([[key(...from), null]])
  const queue = [from]
  while (queue.length) {
    const c = queue.shift()
    if (c[0] === goal[0] && c[1] === goal[1]) break
    for (const n of neighbours(k, c)) if (!prev.has(key(...n))) { prev.set(key(...n), c); queue.push(n) }
  }
  const path = []
  for (let c = goal; c; c = prev.get(key(...c))) path.unshift(c)
  return path
}

/*
 * The plan: legs of the walk, each a list of cells and a window of the song.
 * `mood` sets how it is drawn and how fast the pulse runs.
 */
const PLAN = (() => {
  const [d1, d2, d3] = M.doors
  const legs = []
  // Maze 1: wanders the verse, out on the first "running".
  legs.push({ maze: 0, cells: explore(0, [0, 0], d1.inside, 0.35, 8), from: 17, to: 47.6, mood: 'walk' })
  legs.push({ maze: 0, cells: [d1.inside, d1.outside], from: 47.6, to: 49, mood: 'run' })
  // Maze 2: runs the chorus, steadies through the break and verse, out on the second.
  legs.push({ maze: 1, cells: explore(1, d1.outside, d2.inside, 0.55, 21), from: 51, to: 99.6, mood: 'walk' })
  legs.push({ maze: 1, cells: [d2.inside, d2.outside], from: 99.6, to: 101, mood: 'run' })
  // Maze 3: the scramble — no aim, fast, from the chorus to the end of the horns.
  const scramble = explore(2, d2.outside, null, 0, 33, 520).filter((c) => !(c[0] === d3.inside[0] && c[1] === d3.inside[1]))
  legs.push({ maze: 2, cells: scramble, from: 103, to: 151.4, mood: 'panic' })
  // A breath. Then the clean way out, arriving as the last chorus begins.
  const stop = scramble.at(-1)
  legs.push({ maze: 2, cells: [stop], from: 151.4, to: 157.5, mood: 'still' })
  legs.push({ maze: 2, cells: solve(2, stop, d3.inside), from: 157.5, to: 183.6, mood: 'calm' })
  legs.push({ maze: 2, cells: [d3.inside, d3.outside], from: 183.6, to: 185, mood: 'run' })
  // Out into the big one, walking on, small.
  legs.push({ maze: 3, cells: explore(3, d3.outside, [140, 0], 0.7, 4, 70), from: 185, to: 205.6, mood: 'calm' })
  return legs
})()

/** Where the dot is on leg `l` at `time`, in cells, with the cells walked so far. */
function onLeg(l, time) {
  const n = l.cells.length - 1
  if (n <= 0) return { at: l.cells[0], walked: [l.cells[0]] }
  const u = clamp01((time - l.from) / (l.to - l.from))
  const s = (l.mood === 'calm' || l.mood === 'walk' ? easeInOut(u) * 0.15 + u * 0.85 : u) * n
  const i = Math.min(n - 1, Math.floor(s))
  const f = s - i
  const a = l.cells[i]
  const b = l.cells[i + 1]
  const at = [lerp(a[0], b[0], f), lerp(a[1], b[1], f)]
  return { at, walked: [...l.cells.slice(0, i + 1), at] }
}

/* ── The pulse ────────────────────────────────────────────────────── */

/** Breaths a second, by mood and section. */
function rate(time) {
  if (time < 17) return 0.22
  const leg = PLAN.find((l) => time >= l.from && time < l.to)
  if (!leg) return 0.25
  return { walk: 0.3, run: 0.7, panic: 2.6, still: 0.13, calm: 0.18 }[leg.mood]
}
const phaseTable = (() => {
  const t = [0]
  for (let i = 1; i <= 2060; i++) t.push(t[i - 1] + rate(i * 0.1) * 0.1 * Math.PI * 2)
  return t
})()
const phaseAt = (time) => {
  const i = Math.max(0, Math.min(phaseTable.length - 2, Math.floor(time / 0.1)))
  return lerp(phaseTable[i], phaseTable[i + 1], clamp01(time / 0.1 - i))
}

/* ── The camera ───────────────────────────────────────────────────── */

/** Screen px per cell: [song second, scale]. Eased in log space between keys. */
const ZOOM = [[0, 76], [50, 76], [64, 44], [101, 44], [112, 23.5], [184.5, 23.5], [199, 10], [205.6, 8.5]]
function scaleAt(time) {
  const j = ZOOM.findIndex(([t]) => t > time)
  if (j < 0) return ZOOM.at(-1)[1]
  if (j === 0) return ZOOM[0][1]
  const [t0, a] = ZOOM[j - 1]
  const [t1, b] = ZOOM[j]
  return Math.exp(lerp(Math.log(a), Math.log(b), easeInOut(clamp01((time - t0) / (t1 - t0)))))
}
function camera(time) {
  const s = scaleAt(time)
  return {
    s,
    sx: (x) => CX + x * s,
    sy: (y) => CY + y * s,
    toWorldX: (px) => (px - CX) / s,
    toWorldY: (py) => (py - CY) / s,
  }
}

/* ── The frame ────────────────────────────────────────────────────── */

function frame({ time, uid }) {
  const cam = camera(time)
  const wallW = Math.max(0.7, Math.min(3, cam.s * 0.075))
  const pts = (cells) => cells.map(([x, y], i) => `${i ? 'L' : 'M'}${r(cam.sx(x))} ${r(cam.sy(y))}`).join('')
  let trails = ''
  let dot = [0, 0]
  let jitter = [0, 0]
  // The way in from the left: a line to the centre, gone once the first maze has him.
  const inU = easeOut(clamp01((time - 1.5) / 11.5))
  const startX = cam.toWorldX(PX) - 1
  const inOpacity = 1 - clamp01((time - 15.6) / 5)
  if (time < 17) dot = [lerp(startX, 0, inU), 0]
  if (inOpacity > 0) trails += `<path d="M${r(cam.sx(startX))} ${r(cam.sy(0))}H${r(cam.sx(dot[0]))}" stroke="${RED}" stroke-width="5" fill="none" opacity="${r(inOpacity)}" stroke-linecap="round"/>`
  // Every leg begun: earlier mazes faint, the panic a thin scribble, the way out solid.
  const current = PLAN.findLast((l) => time >= l.from)
  for (const l of PLAN) {
    if (time < l.from) break
    const { at, walked } = onLeg(l, time)
    dot = at
    const old = l.maze < current.maze
    const w = l.mood === 'panic' ? 2.4 : 4.5
    const o = old ? 0.3 : l.mood === 'panic' ? 0.55 : 1
    const scale = Math.min(1, cam.s / 23.5)
    trails += `<path d="${pts(walked)}" stroke="${RED}" stroke-width="${r(Math.max(1, w * scale))}" fill="none" opacity="${o}" stroke-linejoin="round" stroke-linecap="round"/>`
  }
  // Frantic: the dot shakes inside its corridor.
  if (current?.mood === 'panic') {
    const g = rng(Math.floor(time * 30))
    jitter = [(g() - 0.5) * 0.35, (g() - 0.5) * 0.35]
  }
  // The pulse: the dot swells and settles on each breath; a ring goes out on each one.
  const ph = phaseAt(time)
  const breath = 0.5 + 0.5 * Math.sin(ph)
  const deep = current?.mood === 'still' ? 1.8 : 1
  const base = Math.max(8, Math.min(11, cam.s * 0.16))
  const rad = base * (1 + 0.28 * breath * deep)
  const ringU = ((ph / (Math.PI * 2)) % 1 + 1) % 1
  const hx = cam.sx(dot[0] + jitter[0])
  const hy = cam.sy(dot[1] + jitter[1])
  const ring = `<circle cx="${r(hx)}" cy="${r(hy)}" r="${r(rad * (1.2 + ringU * 1.6 * deep))}" fill="none" stroke="${RED}" stroke-width="2" opacity="${r(0.6 * (1 - ringU))}"/>`
  return `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>
  <path d="${walls(time, cam)}" stroke="${INK}" stroke-width="${r(wallW)}" fill="none" stroke-linecap="square"/>
  ${trails}
  ${ring}
  <circle cx="${r(hx)}" cy="${r(hy)}" r="${r(rad)}" fill="${RED}"/>`
}

/** Twelve moments: the way in, each maze, the scramble, the breath, the way out, the pull back. */
export const MAZE_MOMENTS = [6, 14, 32, 48.5, 58, 85, 106, 135, 154, 172, 186, 196, 204]

export const MAZE = {
  id: 'maze',
  name: 'The Maze',
  summary: 'Blank paper, and the red line comes in from the left to the centre, where a maze draws itself around it. It wanders and finds the way out on the first chorus, straight into a bigger maze growing round the first; out again on the second chorus, into a third, very complex one. Through the horns it scrambles, frantic, pulse racing, and gets nowhere: the faint red scribble. At verse 3 it stops and takes a deep breath, then walks the clean way out, solid red through the scribble, reaching the door as the last chorus starts. The camera pulls back: all three were the middle of a maze too big to see the edge of, and he walks on into it, calm. The dot pulses like breathing the whole time: slow when calm, racing in the panic.',
  frame,
  moments: MAZE_MOMENTS,
}
