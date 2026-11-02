/*
 * Into the Wild · The Maze — the film (v2, 2026-11-02).
 *
 * The opening: the band's mark drawn on black, then INTO THE WILD drawn on in
 * the live videos' Hairline capitals, then the black lifts off blank paper.
 * The red dot comes in from the left to the centre and the first maze is
 * drawn round it, stroke by stroke, like the title. He walks out of it in a
 * few seconds, straight into a bigger maze drawn round the first, and out of
 * that, and on: each maze the ring round the last.
 *
 * He moves like somebody walking a maze, not like a solver. At every cell he
 * looks down each corridor as far as he can see. A corridor he can see is a
 * dead end, or one that leads back where he has been, he does not take; a
 * door he can see he goes straight to; when every way he can see is spent he
 * stops, stumped, and walks back to the nearest place that still had a way
 * he hadn't tried. He slows into corners, stops dead at the end of a dead
 * end, hesitates at a fork. How fast, how long he hesitates and how far he
 * bothers to look is his mood (MOODS), and the mood follows the song:
 *
 *   unsure  slowest; looks everywhere, hesitates at every fork
 *   sure    building confidence: quick, a glance at a fork
 *   bold    overconfident, plowing on: fast, never stops to look, sees two
 *           cells ahead at most, so he charges into dead ends a careful
 *           walker would have seen
 *   panic   fastest, no plan: any way at all, dead ends and old ground
 *           included, and he cannot see the door (the horns)
 *
 * The line he leaves fades out behind him over TRAIL seconds.
 *
 * Mazes nest: maze k+1 is generated in the ring round maze k, and maze k's
 * door opens into it. World units are cells. The walls are `lib`: each maze's
 * runs, in drawing order, cut into chunks, one <path> each, mounted once; a
 * frame <use>s the chunks already drawn and draws only the runs being drawn
 * at that moment, each with its own dash.
 *
 * The concept stills on /music-videos/off-the-grid draw from this same file
 * (tools/video-styles/visualizers/maze.mjs).
 */
import { rng, r, clamp01, lerp, easeInOut, ramp } from '../kit.mjs'
import { COVER_SHEET, INK, PAPER, RED, paper, marginLyric, markDrawnAt, MARK_DRAW } from '../album.mjs'
import { drawLines } from '../hairline-draw.mjs'
import { TITLES } from '../titles.mjs'

const { x: PX, y: PY, w: PW, h: PH } = COVER_SHEET.plate
const CX = PX + PW / 2
const CY = PY + PH / 2
const END = 222

/* ── The opening ──────────────────────────────────────────────────── */

/*
 * The live videos' clock (live-cards.mjs openingClock, approved 2026-10-27):
 * the mark from 0.5 s, faded over 5.0–5.7; the title drawn over 6.2–8.9; then
 * the black lifts, here off the paper rather than the stage.
 */
export const MAZE_OPENING = { mark: 0.5, markOut: [5.0, 5.7], title: [6.2, 8.9], reveal: [10.6, 12.0] }

function openingSvg(time, uid) {
  const O = MAZE_OPENING
  const black = 1 - ramp(time, ...O.reveal)
  if (black <= 0.001) return ''
  const markOn = 1 - ramp(time, ...O.markOut)
  const mark = time >= O.mark && markOn > 0.001
    ? `<g transform="translate(800 450) scale(${r(520 / 918, 5)}) translate(-459 -309.5)" style="color:${PAPER}" opacity="${r(easeInOut(markOn), 3)}">${markDrawnAt(Math.min(time - O.mark, MARK_DRAW.done), `${uid}-mark`)}</g>`
    : ''
  const title = time >= O.title[0] ? drawLines(TITLES['into-the-wild'], easeInOut(ramp(time, ...O.title)), PAPER, `${uid}-title`) : ''
  return `<g opacity="${r(easeInOut(black), 4)}"><rect width="1600" height="900" fill="${INK}"/>${mark}${title}</g>`
}

/* ── The mazes ────────────────────────────────────────────────────── */

// Odd sizes, centred on cell (0, 0), each the ring round the last, roughly
// the plate's shape. Small first, so the first ones go by quickly.
const SIZES = [[9, 5], [17, 9], [27, 13], [41, 21], [61, 31], [91, 47], [135, 69], [201, 105]]
// Which side each maze's door is on. The last has none: it never ends.
const DOORS = ['e', 'w', 'n', 'e', 's', 'w', 'e', null]
const SEEDS = [12, 27, 21, 10, 47, 59, 71, 92]

const DIRS = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }
const key = (x, y) => `${x},${y}`
const same = (a, b) => a && b && a[0] === b[0] && a[1] === b[1]

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
    const side = DOORS[k]
    if (!side) break
    const span = side === 'e' || side === 'w' ? h - 3 : w - 3
    const along = Math.round((g() - 0.5) * span)
    const hw = (w - 1) / 2
    const hh = (h - 1) / 2
    const inside = { e: [hw, along], w: [-hw, along], n: [along, -hh], s: [along, hh] }[side]
    const outside = [inside[0] + DIRS[side][0], inside[1] + DIRS[side][1]]
    link(inside, outside)
    doors.push({ inside, outside, side })
    entry = outside
  }
  return { open, doors, connected: (a, b) => open.has(`${key(...a)}|${key(...b)}`) }
}
const M = build()

/** How far out a cell sits within its maze's ring, 0 inner edge to 1 outer. */
function ringDepth(k, x, y) {
  const [w, h] = SIZES[k]
  const outer = Math.max(Math.abs(x) / ((w - 1) / 2 || 1), Math.abs(y) / ((h - 1) / 2 || 1))
  if (k === 0) return outer
  const [iw, ih] = SIZES[k - 1]
  const inner = Math.max(((iw - 1) / 2 + 1) / ((w - 1) / 2), ((ih - 1) / 2 + 1) / ((h - 1) / 2))
  return clamp01((outer - inner) / (1 - inner))
}

/* ── The walk ─────────────────────────────────────────────────────── */

/*
 * The moods, by song second, and what each does. `px` is his cruising speed
 * in screen pixels a second, so a bigger maze (smaller cells) is not a slower
 * film; `hesitate` the stop at a fork, `stumped` the stop on finding he has
 * run out of ways; `sight` how many cells down a corridor he looks.
 */
const MOODS = [
  [0, 'sure'],
  [40.5, 'bold'], // the end of verse 1 into the chorus: "running"
  [58.4, 'unsure'], // the break: a maze he can't charge through
  [72, 'sure'],
  [99.85, 'bold'],
  [110.8, 'panic'], // the horns
  [151.4, 'still'], // stops, breathes
  [157.5, 'sure'],
]
const MOOD = {
  unsure: { px: 150, hesitate: 0.6, stumped: 1.1, sight: Infinity, momentum: 0, wander: 0.9, pulse: 0.34 },
  sure: { px: 340, hesitate: 0.12, stumped: 0.45, sight: Infinity, momentum: 0.15, wander: 0.5, pulse: 0.27 },
  bold: { px: 520, hesitate: 0, stumped: 0.3, sight: 2, momentum: 0.8, wander: 0.4, pulse: 0.5 },
  panic: { px: 720, hesitate: 0, stumped: 0, sight: 0, momentum: 0.35, wander: 1, pulse: 2.6 },
  still: { px: 0, pulse: 0.13 },
}
export const moodAt = (time) => MOODS.findLast(([t]) => time >= t)[1]
const STILL_END = 157.5
/** The last chorus: he reaches the door he walks calmly to. */
const LAST_DOOR = 183.85

/** Screen px per cell that fits maze k on the plate. */
const fitScale = (k) => Math.min(PW / (SIZES[k][0] + 1.4), PH / (SIZES[k][1] + 1.4))

const neighbours = (k, [x, y]) =>
  Object.values(DIRS).map(([dx, dy]) => [x + dx, y + dy]).filter(([a, b]) => mazeOf(a, b) === k && M.connected([x, y], [a, b]))
const dirOf = (a, b) => [Math.sign(b[0] - a[0]), Math.sign(b[1] - a[1])]

/** The way in: from off the plate's left edge to the centre, stopping there. */
const ENTER = { from: 12.1, to: 14.5, startX: (PX - CX) / fitScale(0) - 1.5 }
/** He sets off on the first word. */
const SET_OFF = 15.6

/*
 * The whole walk, simulated once: `segs`, each a stretch of time from a to b
 * with speeds va → vb in cells a second (constant acceleration, so he speeds
 * up out of a stop and slows into a corner), or a pause (a = b). `exits` are
 * when he steps through each maze's door.
 */
const WALK = (() => {
  const segs = []
  const exits = []
  const push = (t0, t1, a, b, va, vb, ease = false) => segs.push({ t0, t1, a, b, va, vb, ease })
  let t = ENTER.to
  push(ENTER.from, ENTER.to, [ENTER.startX, 0], [0, 0], (2 * -ENTER.startX) / (ENTER.to - ENTER.from), 0)
  push(t, SET_OFF, [0, 0], [0, 0], 0, 0)
  t = SET_OFF

  let k = 0
  let here = [0, 0]
  let came = [1, 0]
  let visited = new Set([key(...here)])
  let dead = new Set()
  let route = [] // cells he has decided to walk, in order
  let pending = null // the step into `here`, waiting on how he leaves it
  const g = rng(1729)

  /* Looking down the corridor from `from` towards `next`. */
  const look = (from, next, sight) => {
    const door = M.doors[k]
    const cells = [next]
    let side = false
    let sawDoor = same(next, door?.inside)
    const d = dirOf(from, next)
    let at = next
    while (cells.length < sight) {
      for (const n of neighbours(k, at)) if (!same(n, cells.at(-2) ?? from) && !same(n, [at[0] + d[0], at[1] + d[1]])) side = true
      const ahead = [at[0] + d[0], at[1] + d[1]]
      if (!neighbours(k, at).some((n) => same(n, ahead))) break
      at = ahead
      cells.push(at)
      if (same(at, door?.inside)) sawDoor = true
    }
    // Seen all the way to a wall, nothing off it: a dead end.
    let blind = false
    if (cells.length < sight) {
      const last = cells.at(-1)
      const out = neighbours(k, last).filter((n) => !same(n, cells.at(-2) ?? from))
      blind = !out.length && !side && !sawDoor
    }
    else side = true // couldn't see the end: assume it goes somewhere
    return { cells, side, blind, sawDoor }
  }

  /* Walking back through ground he knows to the nearest cell with an untried way out of it. */
  const backtrack = () => {
    const prev = new Map([[key(...here), null]])
    const queue = [here]
    while (queue.length) {
      const c = queue.shift()
      for (const n of neighbours(k, c)) {
        const kn = key(...n)
        if (prev.has(kn)) continue
        if (!visited.has(kn)) {
          if (dead.has(kn)) continue
          const path = [n]
          for (let p = c; p && !same(p, here); p = prev.get(key(...p))) path.unshift(p)
          return path
        }
        prev.set(kn, c)
        queue.push(n)
      }
    }
    return null
  }

  /* The shortest way through maze k (after the breath, he can see it). */
  const solve = (kk, from, goal) => {
    const prev = new Map([[key(...from), null]])
    const queue = [from]
    while (queue.length) {
      const c = queue.shift()
      if (same(c, goal)) break
      for (const n of neighbours(kk, c)) if (!prev.has(key(...n))) { prev.set(key(...n), c); queue.push(n) }
    }
    const path = []
    for (let c = goal; c; c = prev.get(key(...c))) path.unshift(c)
    return path
  }
  let calm = false // from the breath until he is through that maze's door

  /* Where he goes next from `here`, and how long he stops first. */
  const decide = (mood) => {
    const P = MOOD[mood]
    const door = M.doors[k]
    if (mood !== 'panic' && same(here, door?.inside)) return { next: door.outside, pause: 0 }
    const opts = neighbours(k, here)
    if (mood === 'panic') {
      // No plan: any way, the door included only as a wall.
      const back = [here[0] - came[0], here[1] - came[1]]
      const ahead = [here[0] + came[0], here[1] + came[1]]
      const pool = opts.length > 1 ? opts.filter((o) => !same(o, back)) : opts
      const pick = pool.find((o) => same(o, ahead) && g() < P.momentum) ?? pool[Math.floor(g() * pool.length)]
      route = []
      return { next: pick, pause: 0 }
    }
    if (calm && route.length === 0 && door) {
      // After the breath he thinks it through and walks the clear way out.
      route = solve(k, here, door.inside).slice(1)
      if (!route.length) return { next: door.outside, pause: 0 }
    }
    if (route.length) return { next: route.shift(), pause: 0 }
    const back = [here[0] - came[0], here[1] - came[1]]
    const views = opts.filter((o) => !same(o, back)).map((o) => ({ o, ...look(here, o, P.sight) }))
    const seen = views.find((v) => v.sawDoor)
    if (seen) {
      route = seen.cells.slice(1, seen.cells.findIndex((c) => same(c, door.inside)) + 1)
      return { next: seen.o, pause: P.hesitate * 0.5 }
    }
    for (const v of views) if (v.blind) for (const c of v.cells) dead.add(key(...c))
    const fresh = views.filter((v) => !v.blind && !visited.has(key(...v.o)))
    if (fresh.length) {
      const score = (v) => ringDepth(k, ...v.cells.at(-1)) +
        (same(dirOf(here, v.o), came) ? P.momentum : 0) + g() * P.wander
      fresh.sort((p, q) => score(q) - score(p))
      return { next: fresh[0].o, pause: fresh.length > 1 ? P.hesitate : 0 }
    }
    // Every way he can see is spent: stop, then walk back.
    const path = backtrack()
    if (!path) return { next: opts[0] ?? here, pause: P.stumped }
    route = path.slice(1)
    return { next: path[0], pause: P.stumped }
  }

  let guard = 0
  let calmPace = 0
  let rest = true // standing still: the next step starts from nothing
  while (t < END && guard++ < 40000) {
    const mood = moodAt(t)
    if (mood === 'still') {
      if (pending) {
        const d = pending.va > 0 ? 2 / pending.va : 1.7 / pending.vc
        push(pending.t, pending.t + d, pending.a, here, pending.va, 0, pending.va <= 0)
        t = pending.t + d
        pending = null
      }
      push(t, Math.max(t, STILL_END), here, here, 0, 0)
      t = Math.max(t, STILL_END)
      rest = true
      calm = true
      route = []
      const way = M.doors[k] ? solve(k, here, M.doors[k].inside).length : 0
      // Paced to reach the door as the last chorus starts (corners cost a little).
      calmPace = way ? (way * 1.45) / (LAST_DOOR - STILL_END) : 0
      continue
    }
    const P = MOOD[mood]
    const vc = calm && calmPace ? calmPace : P.px / fitScale(k)
    const { next, pause } = decide(mood)
    const dir = dirOf(here, next)
    const straight = dir[0] === came[0] && dir[1] === came[1]
    const reverse = dir[0] === -came[0] && dir[1] === -came[1]
    // How fast he passes through `here`: full on, slowed for a corner, or stopped.
    const vHere = rest || pause > 0 || reverse ? 0 : straight ? vc : vc * 0.55
    rest = false
    if (pending) {
      const { a, va } = pending
      const sum = va + vHere
      const d = sum > vc * 0.15 ? 2 / sum : 1.7 / vc
      push(pending.t, pending.t + d, a, here, va, vHere, sum <= vc * 0.15)
      t = pending.t + d
    }
    if (pause > 0) { push(t, t + pause, here, here, 0, 0); t += pause }
    // Through a door: the next maze, and he knows nothing of it.
    if (M.doors[k] && same(here, M.doors[k].inside) && same(next, M.doors[k].outside)) {
      exits.push(t)
      k += 1
      visited = new Set()
      dead = new Set()
      route = []
      calm = false
    }
    pending = { t, a: here, va: vHere, vc }
    came = dir
    here = next
    visited.add(key(...here))
  }
  return { segs, exits }
})()

/** Where he is at `time`, in cells. */
function posAt(time) {
  const S = WALK.segs
  if (time <= S[0].t0) return S[0].a
  let lo = 0
  let hi = S.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (S[mid].t0 <= time) lo = mid
    else hi = mid - 1
  }
  const s = S[lo]
  if (time >= s.t1) return s.b
  const d = s.t1 - s.t0
  const tau = time - s.t0
  const L = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1])
  let u
  if (s.ease) u = easeInOut(tau / d)
  else if (L === 0) u = 0
  else u = clamp01((s.va * tau + (0.5 * (s.vb - s.va) * tau * tau) / d) / L)
  return [lerp(s.a[0], s.b[0], u), lerp(s.a[1], s.b[1], u)]
}

/** Which maze he is in at `time`. */
const mazeAt = (time) => WALK.exits.filter((e) => e <= time).length

/* ── Walls ────────────────────────────────────────────────────────── */

/** When maze k is drawn: the first round him as he arrives, each next one as he nears its door. */
const DRAWN = (() => {
  const out = SIZES.map((_, k) => (k === 0 ? [13.0, 15.5] : WALK.exits[k - 1] !== undefined
    ? [WALK.exits[k - 1] - 2.4 - Math.min(2.5, k * 0.4), WALK.exits[k - 1] + 0.5]
    : null))
  // The pull back at the end: every maze not yet drawn, one after another, out to the last.
  let at = Math.max(190, (WALK.exits.at(-1) ?? 0) + 3)
  return out.map((w) => {
    if (w) return w
    const span = [at, at + 4]
    at += 3
    return span
  })
})()
const CHUNKS = 24
/* Mazes with more runs than this appear chunk by chunk rather than stroke by stroke. */
const PEN_LIMIT = 1600

/**
 * Every maze's walls as straight runs in world units, in the order a hand
 * would draw them (ring by ring out from the middle, round each ring from the
 * door it was entered by), each with when it is drawn.
 */
const RUNS = SIZES.map((size, k) => {
  const [w, h] = size
  const hw = (w - 1) / 2
  const hh = (h - 1) / 2
  const hMap = new Map()
  const vMap = new Map()
  const add = (map, line, at) => { if (!map.has(line)) map.set(line, []); map.get(line).push(at) }
  for (let y = -hh; y <= hh; y++) {
    for (let x = -hw; x <= hw; x++) {
      if (mazeOf(x, y) !== k) continue
      for (const [d, [dx, dy]] of Object.entries(DIRS)) {
        const other = mazeOf(x + dx, y + dy)
        if (M.connected([x, y], [x + dx, y + dy])) continue
        if (other !== -1 && other < k) continue // the inner maze draws its own outer wall
        if ((d === 'w' || d === 'n') && other === k) continue
        if (d === 'n') add(hMap, y - 0.5, x - 0.5)
        if (d === 's') add(hMap, y + 0.5, x - 0.5)
        if (d === 'w') add(vMap, x - 0.5, y - 0.5)
        if (d === 'e') add(vMap, x + 0.5, y - 0.5)
      }
    }
  }
  const runs = []
  const merge = (map, horizontal) => {
    for (const [line, starts] of map) {
      starts.sort((p, q) => p - q)
      for (let i = 0; i < starts.length;) {
        let j = i
        while (j + 1 < starts.length && starts[j + 1] <= starts[j] + 1) j++
        runs.push(horizontal ? [starts[i], line, starts[j] + 1, line] : [line, starts[i], line, starts[j] + 1])
        i = j + 1
      }
    }
  }
  merge(hMap, true)
  merge(vMap, false)
  // Ring by ring outward, and round each ring starting from where he came in.
  const enter = k === 0 ? [-1, 0] : M.doors[k - 1].outside
  const a0 = Math.atan2(enter[1], enter[0])
  const rings = Math.max(3, Math.round(Math.min(w, h) / 4))
  const order = (run) => {
    const mx = (run[0] + run[2]) / 2
    const my = (run[1] + run[3]) / 2
    const depth = ringDepth(k, Math.max(-hw, Math.min(hw, Math.round(mx))), Math.max(-hh, Math.min(hh, Math.round(my))))
    const a = (((Math.atan2(my, mx) - a0) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
    return Math.min(rings - 1, Math.floor(depth * rings)) + a / (2 * Math.PI)
  }
  runs.sort((p, q) => order(p) - order(q))
  // Timing: the pen moves along the runs in order, several strokes at once.
  const [from, to] = DRAWN[k]
  const lengths = runs.map((q) => Math.abs(q[2] - q[0]) + Math.abs(q[3] - q[1]))
  const total = lengths.reduce((s, l) => s + l, 0)
  const span = to - from
  const each = (l) => Math.min(span * 0.3, 0.16 + 0.045 * l)
  let acc = 0
  return runs.map((q, i) => {
    const start = from + (span - each(lengths[i])) * (acc / total)
    acc += lengths[i]
    return { q, start, end: start + each(lengths[i]) }
  })
})

/** Each maze's runs, chunked in drawing order: [{ d, end }], `end` when its last run is down. */
const CHUNKED = RUNS.map((runs) => {
  const per = Math.ceil(runs.length / CHUNKS)
  const out = []
  for (let i = 0; i < runs.length; i += per) {
    const part = runs.slice(i, i + per)
    out.push({ d: part.map(({ q }) => `M${q[0]} ${q[1]}L${q[2]} ${q[3]}`).join(''), start: part[0].start, end: Math.max(...part.map((p) => p.end)), runs: part })
  }
  return out
})

const libCache = new Map()
/** The walls as defs for this uid: one chunk, the same on every frame. */
function wallLib(uid) {
  if (!libCache.has(uid)) {
    libCache.set(uid, `<defs>${CHUNKED.flatMap((chunks, k) => chunks.map((c, j) =>
      `<path id="${uid}-w${k}-${j}" d="${c.d}"/>`)).join('')}</defs>`)
  }
  return libCache.get(uid)
}

/** The walls drawn by `time`: finished chunks as <use>s, the strokes being drawn inline. */
function walls(time, uid) {
  let uses = ''
  let live = ''
  CHUNKED.forEach((chunks, k) => {
    if (time < DRAWN[k][0]) return
    const pen = RUNS[k].length <= PEN_LIMIT
    chunks.forEach((c, j) => {
      if (time >= c.end) { uses += `<use href="#${uid}-w${k}-${j}"/>`; return }
      if (time < c.start) return
      if (!pen) { uses += `<use href="#${uid}-w${k}-${j}" opacity="${r(easeInOut(ramp(time, c.start, c.end)), 3)}"/>`; return }
      let done = ''
      for (const { q, start, end } of c.runs) {
        if (time < start) continue
        if (time >= end) { done += `M${q[0]} ${q[1]}L${q[2]} ${q[3]}`; continue }
        const u = easeInOut((time - start) / (end - start))
        live += `<path d="M${q[0]} ${q[1]}L${q[2]} ${q[3]}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${r(1 - u, 4)}" stroke-linecap="butt"/>`
      }
      if (done) live += `<path d="${done}"/>`
    })
  })
  return uses + live
}

/* ── The pulse ────────────────────────────────────────────────────── */

const rate = (time) => (time < SET_OFF ? 0.24 : MOOD[moodAt(time)].pulse)
const phaseTable = (() => {
  const t = [0]
  for (let i = 1; i <= END * 10 + 20; i++) t.push(t[i - 1] + rate(i * 0.1) * 0.1 * Math.PI * 2)
  return t
})()
const phaseAt = (time) => {
  const i = Math.max(0, Math.min(phaseTable.length - 2, Math.floor(time / 0.1)))
  return lerp(phaseTable[i], phaseTable[i + 1], clamp01(time / 0.1 - i))
}

/* ── The camera ───────────────────────────────────────────────────── */

/** Screen px per cell: each maze fitted to the plate, pulling back as the next is drawn round it. */
const ZOOM = (() => {
  const keys = [[0, fitScale(0)]]
  const add = (t, s) => keys.push([Math.max(t, keys.at(-1)[0] + 0.05), s])
  WALK.exits.forEach((e, k) => {
    if (k + 1 >= SIZES.length) return
    add(DRAWN[k + 1][0] - 0.2, fitScale(k))
    add(e + 0.6, fitScale(k + 1))
  })
  // The outro: the whole of the last maze, whatever he is in.
  const last = fitScale(SIZES.length - 1)
  if (keys.at(-1)[1] > last && keys.at(-1)[0] < 199) keys.push([199, keys.at(-1)[1]], [210, last])
  return keys
})()
function scaleAt(time) {
  const j = ZOOM.findIndex(([t]) => t > time)
  if (j < 0) return ZOOM.at(-1)[1]
  if (j === 0) return ZOOM[0][1]
  const [t0, a] = ZOOM[j - 1]
  const [t1, b] = ZOOM[j]
  return Math.exp(lerp(Math.log(a), Math.log(b), easeInOut(clamp01((time - t0) / (t1 - t0)))))
}

/** Smooth 0→1→0 over [a, b] with `fade` seconds at each end. */
const window01 = (t, a, b, fade) => Math.min(easeInOut(clamp01((t - a) / fade)), easeInOut(clamp01((b - t) / fade)))

/* ── The frame ────────────────────────────────────────────────────── */

/** How long the line he leaves takes to fade to nothing. */
const TRAIL = 3.2
const TRAIL_STEP = 1 / 24
const TRAIL_BINS = 10

/** The plate alone — what goes inside the sheet. Returns { plate, lib }. */
export function mazePlate({ time, uid }) {
  const s = scaleAt(time)
  const sx = (x) => CX + x * s
  const sy = (y) => CY + y * s
  const dot = posAt(time)

  // The trail: where he was over the last TRAIL seconds, thinning and fading with age.
  const width = Math.max(1.5, Math.min(5, s * 0.06))
  const first = Math.max(WALK.segs[0].t0, time - TRAIL)
  const pts = []
  for (let u = first; u < time; u += TRAIL_STEP) pts.push([u, posAt(u)])
  pts.push([time, dot])
  let trail = ''
  const per = Math.max(2, Math.ceil(pts.length / TRAIL_BINS))
  for (let i = 0; i < pts.length - 1; i += per - 1) {
    const part = pts.slice(i, i + per)
    if (part.length < 2) break
    const age = (time - part[Math.floor(part.length / 2)][0]) / TRAIL
    const life = 1 - clamp01(age)
    if (life <= 0.02) continue
    const d = part.map(([, [x, y]], j) => `${j ? 'L' : 'M'}${r(sx(x))} ${r(sy(y))}`).join('')
    trail += `<path d="${d}" stroke-width="${r(width * (0.35 + 0.65 * life), 2)}" opacity="${r(life ** 1.6, 3)}"/>`
  }

  // Frantic: a tremble, eased in and out with the horns.
  const shake = window01(time, 110.8, 151.4, 1.5) * 0.12
  const jx = shake * (Math.sin(time * 41.3) + 0.6 * Math.sin(time * 67.9 + 1.3))
  const jy = shake * (Math.sin(time * 37.1 + 2.1) + 0.6 * Math.sin(time * 59.3))
  // The pulse: the dot swells and settles on each breath, and a ring goes out on each one.
  const ph = phaseAt(time)
  const breath = 0.5 + 0.5 * Math.sin(ph)
  const deep = 1 + 0.8 * window01(time, 151.4, STILL_END, 1.2)
  const base = Math.max(7, Math.min(11, s * 0.13))
  const rad = base * (1 + 0.28 * breath * deep)
  const ringU = ((ph / (Math.PI * 2)) % 1 + 1) % 1
  const hx = sx(dot[0] + jx)
  const hy = sy(dot[1] + jy)
  const wallW = Math.max(0.8, Math.min(3, s * 0.05))
  const appear = clamp01((time - ENTER.from) / 0.3)
  const plate = `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>
  <g transform="translate(${r(CX)} ${r(CY)}) scale(${r(s, 4)})" stroke="${INK}" stroke-width="${(wallW / s).toFixed(4)}" fill="none" stroke-linecap="square">${walls(time, uid)}</g>
  <g stroke="${RED}" fill="none" stroke-linejoin="round" stroke-linecap="round">${trail}</g>
  <g opacity="${r(appear, 3)}"><circle cx="${r(hx)}" cy="${r(hy)}" r="${r(rad * (1.2 + ringU * 1.6 * deep))}" fill="none" stroke="${RED}" stroke-width="2" opacity="${r(0.6 * (1 - ringU))}"/>
  <circle cx="${r(hx)}" cy="${r(hy)}" r="${r(rad)}" fill="${RED}"/></g>`
  return { plate, lib: wallLib(uid) }
}

/** The film: the opening, then the album's cover sheet, the plate, the lyric in the margin. */
export function mazeFrame({ time, score, uid = 'maze' }) {
  const { plate, lib } = mazePlate({ time, uid })
  const section = score.sections.find((s) => time >= s.from && time < s.to) ?? score.sections.at(-1)
  const clip = `${uid}-plate`
  return {
    lib: [lib],
    label: time < MAZE_OPENING.reveal[1] ? 'Opening' : `${section.label} · ${moodAt(time)} · maze ${mazeAt(time) + 1}`,
    svg: `<defs><clipPath id="${clip}"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}"/></clipPath></defs>
${paper(COVER_SHEET)}
<g clip-path="url(#${clip})">${plate}</g>
${marginLyric({ now: time, score, uid, sheet: COVER_SHEET })}
${openingSvg(time, uid)}`,
  }
}

/** For tuning and the page: when he leaves each maze, and the mood clock. */
export const MAZE_WALK = { exits: WALK.exits, moods: MOODS, doors: M.doors, segs: WALK.segs }
