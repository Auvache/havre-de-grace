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
 * looks down each corridor. A corridor he can see is a dead end, or one that
 * leads back where he has been, he does not take; a door he can see he goes
 * straight to; when every way he can see is spent he stops, stumped, and
 * walks back to the nearest place that still had a way he hadn't tried. He
 * slows into corners, stops dead at the end of a dead end, hesitates at a
 * fork. At each door he stops in the doorway while the next maze is drawn
 * round him, then goes on.
 *
 * How fast he goes, how long he hesitates and how long he stays stumped is
 * his confidence (`confidence`, `gait`), and it follows the song (2026-11-02,
 * as asked): gained through the first maze, kept to the break, lost slowly to
 * nothing by the end of verse 2; then the meltdown (he stops and pulses hard
 * after the last "running", and races every way through the horns, old ground
 * and dead ends included, blind to the door); then in the lull before verse 3
 * he breathes, and walks the clear way out at the confident pace.
 *
 * The first maze is laid by hand (ROUTE0): its only way out goes all the way
 * round, anticlockwise, to the door on the right.
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
import { END_BLACK, END_INK } from '../ending.mjs'

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
// the plate's shape. Small first, so the first ones go by quickly. Round the
// fifth is the last maze of all, the band's anchor (ANCHOR, below), which
// has no door: it never ends.
const SIZES = [[9, 5], [17, 9], [27, 13], [41, 21], [61, 31]]
const DOORS = ['e', 'w', 'n', 'e', null]
const SEEDS = [12, 27, 49, 10, 47]
/** The anchor's maze number: one past the boxes. */
const A = SIZES.length

const DIRS = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }
const key = (x, y) => `${x},${y}`
const same = (a, b) => a && b && a[0] === b[0] && a[1] === b[1]

const inBox = (k, x, y) => {
  if (k < 0 || k >= A) return false
  const [w, h] = SIZES[k]
  return Math.abs(x) <= (w - 1) / 2 && Math.abs(y) <= (h - 1) / 2
}

/*
 * The anchor (as asked, 2026-11-02): every maze was the middle of the band's
 * anchor, the stock where the shank crosses it, and the anchor is one more
 * maze, all the way out. In anchor units (the mark's own: 0–200 across, 3–222
 * down) the stock is 15 thick, so the fifth maze's 31 cells make ANCHOR_K
 * cells a unit, and the whole anchor is about 450 cells tall: at the end the
 * cells are a pixel and a half, small, but still a maze.
 */
const ANCHOR_K = 31 / 15
const ANCHOR_AT = [100, 79.5] // the stock's middle, where the shank crosses it: the mazes' centre
const toUnits = (x, y) => [ANCHOR_AT[0] + x / ANCHOR_K, ANCHOR_AT[1] + y / ANCHOR_K]
const ANCHOR_MID = ((3 + 222) / 2 - ANCHOR_AT[1]) * ANCHOR_K
const ANCHOR_BOX = {
  x0: Math.floor((16 - ANCHOR_AT[0]) * ANCHOR_K), x1: Math.ceil((184 - ANCHOR_AT[0]) * ANCHOR_K),
  y0: Math.floor((3 - ANCHOR_AT[1]) * ANCHOR_K), y1: Math.ceil((222 - ANCHOR_AT[1]) * ANCHOR_K),
}
/* The arms (the mark's crescent with its flukes) as a polygon: outer arc, fluke, inner arc, fluke. */
const ARMS = (() => {
  const pts = []
  for (let i = 0; i <= 48; i++) { const a = Math.PI - (Math.PI * i) / 48; pts.push([100 + 76 * Math.cos(a), 134 + 88 * Math.sin(a)]) }
  pts.push([184, 102], [161, 134])
  for (let i = 0; i <= 48; i++) { const a = (Math.PI * i) / 48; pts.push([100 + 61 * Math.cos(a), 134 + 73 * Math.sin(a)]) }
  pts.push([16, 102])
  return pts
})()
const SHANK = [[92.4, 40], [107.6, 40], [105.8, 213], [94.2, 213]]
function inPolygon(poly, x, y) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
/** Is the anchor's ink at this point (anchor units)? Ring, shank, stock and its balls, arms. */
function inkAt(u, v) {
  const ring = Math.hypot(u - 100, v - 26)
  if (ring >= 13 && ring <= 23) return true
  if (u >= 42 && u <= 158 && v >= 72 && v <= 87) return true
  if (Math.hypot(u - 42, v - 79.5) <= 8.5 || Math.hypot(u - 158, v - 79.5) <= 8.5) return true
  if (u >= 92 && u <= 108 && v >= 40 && v <= 213 && inPolygon(SHANK, u, v)) return true
  return v >= 102 && v <= 222 && (u <= 42 || u >= 158 || v >= 190 || Math.hypot((u - 100) / 76, (v - 134) / 88) <= 1) && inPolygon(ARMS, u, v)
}
/** The anchor maze's cells: every cell whose centre is in the anchor's ink, outside the boxes. */
const ANCHOR_CELLS = (() => {
  const out = new Set()
  for (let y = ANCHOR_BOX.y0; y <= ANCHOR_BOX.y1; y++) {
    for (let x = ANCHOR_BOX.x0; x <= ANCHOR_BOX.x1; x++) {
      if (inBox(A - 1, x, y)) continue
      if (inkAt(...toUnits(x, y))) out.add(key(x, y))
    }
  }
  return out
})()

/** Which maze a cell belongs to: its smallest enclosing box, else the anchor (A), else none (-1). */
const mazeOf = (x, y) => {
  const k = SIZES.findIndex((_, i) => inBox(i, x, y))
  if (k >= 0) return k
  return ANCHOR_CELLS.has(key(x, y)) ? A : -1
}

/*
 * The first maze's way out, laid by hand: up from the middle to the top,
 * along it to the left, down the left side, the length of the bottom, and up
 * the right side to the door, which stays where it was (east, one row up).
 */
const ROUTE0 = (() => {
  const out = [[0, 0], [0, -1], [0, -2]]
  for (let x = -1; x >= -4; x--) out.push([x, -2])
  for (let y = -1; y <= 2; y++) out.push([-4, y])
  // The bottom, with a step up and back down in the middle of it.
  for (let x = -3; x <= -1; x++) out.push([x, 2])
  out.push([-1, 1], [0, 1], [1, 1], [1, 2])
  for (let x = 2; x <= 4; x++) out.push([x, 2])
  for (let y = 1; y >= -1; y--) out.push([4, y])
  return out
})()

function build() {
  const open = new Set() // passages, as "x,y|x,y" both ways
  const link = (a, b) => { open.add(`${key(...a)}|${key(...b)}`); open.add(`${key(...b)}|${key(...a)}`) }
  const doors = []
  let entry = [0, 0]
  for (let k = 0; k < SIZES.length; k++) {
    const [w, h] = SIZES[k]
    const g = rng(SEEDS[k])
    const mine = (x, y) => inBox(k, x, y) && !inBox(k - 1, x, y)
    // Recursive backtracker from the cell the last maze's door lets onto. The
    // first maze is laid by hand first: its only way out goes all the way
    // round, anticlockwise (ROUTE0), and the backtracker hangs dead ends off it.
    const seen = new Set([key(...entry)])
    const stack = [entry]
    if (k === 0) {
      for (let i = 1; i < ROUTE0.length; i++) { link(ROUTE0[i - 1], ROUTE0[i]); seen.add(key(...ROUTE0[i])) }
      stack.splice(0, 1, ...ROUTE0.filter(() => g() < 0.5), ROUTE0[0])
    }
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
    const along = k === 0 ? ROUTE0.at(-1)[1] : Math.round((g() - 0.5) * span)
    const hw = (w - 1) / 2
    const hh = (h - 1) / 2
    const inside = { e: [hw, along], w: [-hw, along], n: [along, -hh], s: [along, hh] }[side]
    const outside = [inside[0] + DIRS[side][0], inside[1] + DIRS[side][1]]
    link(inside, outside)
    doors.push({ inside, outside, side })
    entry = outside
  }
  // The anchor: a backtracker over its cells, from every part not yet reached
  // (a thin joint can leave a piece on its own; it is still a maze).
  const g = rng(1066)
  const seen = new Set()
  for (const start of ANCHOR_CELLS) {
    if (seen.has(start)) continue
    seen.add(start)
    const stack = [start.split(',').map(Number)]
    while (stack.length) {
      const [x, y] = stack.at(-1)
      const next = Object.values(DIRS).map(([dx, dy]) => [x + dx, y + dy]).filter(([a, b]) => ANCHOR_CELLS.has(key(a, b)) && !seen.has(key(a, b)))
      if (!next.length) { stack.pop(); continue }
      const n = next[Math.floor(g() * next.length)]
      link([x, y], n)
      seen.add(key(...n))
      stack.push(n)
    }
  }
  return { open, doors, connected: (a, b) => open.has(`${key(...a)}|${key(...b)}`) }
}
const M = build()

/** How far out a cell sits within its maze's ring, 0 inner edge to 1 outer. */
function ringDepth(k, x, y) {
  if (k === A) return clamp01(Math.hypot(x, y - ANCHOR_MID * 0.4) / (ANCHOR_BOX.y1 - ANCHOR_BOX.y0))
  const [w, h] = SIZES[k]
  const outer = Math.max(Math.abs(x) / ((w - 1) / 2 || 1), Math.abs(y) / ((h - 1) / 2 || 1))
  if (k === 0) return outer
  const [iw, ih] = SIZES[k - 1]
  const inner = Math.max(((iw - 1) / 2 + 1) / ((w - 1) / 2), ((ih - 1) / 2 + 1) / ((h - 1) / 2))
  return clamp01((outer - inner) / (1 - inner))
}

/* ── The walk ─────────────────────────────────────────────────────── */

/*
 * His mood, by song second. Walking, it is one number, his confidence `c`
 * (0 unsure, 1 sure of himself), and everything about how he walks is read
 * off it (`gait`): his cruising speed in screen pixels a second (so a bigger
 * maze, with smaller cells, is not a slower film), the stop at a fork, the
 * stop on finding he has run out of ways, how much he wanders. He gains it
 * through the first maze, keeps it through verse 1 and the chorus, and loses
 * it slowly to nothing by the end of verse 2. Then (timed to the record, as
 * asked 2026-11-02):
 *
 *   1:50.8  the horns: the meltdown. He stops and pulses harder and harder.
 *   1:56.24 the loudest hit in the horns: he sprints, every way at once, old
 *           ground and dead ends and all, blind to the door.
 *   2:24    he starts to come round, slowing, as if realising he has to focus,
 *   2:28.19 and stops dead on the harmonic as the horns drop away (the
 *           bright ping 17 dB over the lull). His breathing slows.
 *   2:32.52 "headed", in the first line of verse 3: he sets out carefully,
 *           and grows sure of himself as he walks the clear way out.
 */
const SET_OFF = 20.31 // "To see if I can't lose my way", once the first maze is drawn round him
const MELTDOWN = 110.8 // the horns come in
const SPRINT = 116.24 // the loudest hit in the horns
const FOCUS = 144 // he starts to come round
const STOP = 148.19 // the harmonic
const SET_OUT = 152.52 // "headed"
const PANIC_SEED = 23

const confidence = (time) => {
  if (time < 32) return lerp(0.08, 1, easeInOut(clamp01((time - SET_OFF) / (32 - SET_OFF))))
  if (time < 58.4) return 1
  if (time < 99.85) return 1 - ((time - 58.4) / (99.85 - 58.4)) ** 1.5 // slowly at first
  if (time < SET_OUT) return 0
  return lerp(0.25, 1, easeInOut(clamp01((time - SET_OUT) / 7)))
}
/** What he is doing at `time`: 'enter', 'walk', 'meltdown', 'panic', 'focus' or 'breathe'. */
const stateAt = (time) => (time < SET_OFF ? 'enter' : time < MELTDOWN ? 'walk' : time < SPRINT ? 'meltdown'
  : time < FOCUS ? 'panic' : time < STOP ? 'focus' : time < SET_OUT ? 'breathe' : 'walk')
/** The mood in words, for the page. */
export const moodAt = (time) => {
  const s = stateAt(time)
  if (s === 'enter') return 'arriving'
  if (s === 'focus') return 'coming round'
  if (s !== 'walk') return s
  const c = confidence(time)
  return time >= SET_OUT && c < 0.85 ? 'careful' : c > 0.85 ? 'sure' : c < 0.2 ? 'unsure' : time < 58.4 ? 'gaining confidence' : 'losing confidence'
}
const PANIC_GAIT = { px: 720, hesitate: 0, stumped: 0, momentum: 0.35, wander: 1, pulse: 2.6 }
const gait = (time) => {
  const s = stateAt(time)
  if (s === 'panic') return PANIC_GAIT
  // Coming round: the sprint slows away to nothing by the harmonic.
  if (s === 'focus') {
    const u = easeInOut(ramp(time, FOCUS, STOP))
    return { ...PANIC_GAIT, px: Math.max(60, 720 * (1 - u)), pulse: lerp(2.6, 1.5, u) }
  }
  if (s === 'meltdown') return { px: 0, pulse: lerp(1.2, 3.2, easeInOut(ramp(time, MELTDOWN, MELTDOWN + 2.5))) }
  // The breath slows from the sprint's to the slowest of the film.
  if (s === 'breathe') return { px: 0, pulse: lerp(1.4, 0.14, easeInOut(ramp(time, STOP, STOP + 3.4))) }
  const c = s === 'enter' ? 1 : confidence(time)
  return { px: lerp(150, 340, c), hesitate: lerp(0.75, 0.12, c), stumped: lerp(1.4, 0.45, c), momentum: lerp(0, 0.15, c), wander: lerp(0.9, 0.5, c), pulse: s === 'enter' ? 0.24 : lerp(0.36, 0.27, c) }
}

/** Screen px per cell that fits maze k on the plate. */
const fitScale = (k) => Math.min(PW / (SIZES[k][0] + 1.4), PH / (SIZES[k][1] + 1.4))

const neighbours = (k, [x, y]) =>
  Object.values(DIRS).map(([dx, dy]) => [x + dx, y + dy]).filter(([a, b]) => mazeOf(a, b) === k && M.connected([x, y], [a, b]))
const dirOf = (a, b) => [Math.sign(b[0] - a[0]), Math.sign(b[1] - a[1])]

/** The way in: from off the plate's left edge to the centre, stopping there. */
const ENTER = { from: 11.5, to: 13.3, startX: (PX - CX) / fitScale(0) - 1.5 }

/** How long maze k takes to draw once he is standing in its doorway. */
const drawTime = (k) => Math.min(3.4, 1.9 + 0.3 * k)
/** The camera's pull back to the new maze, from his arrival in the doorway. */
const PULL = 1.3

/*
 * The whole walk, simulated once: `segs`, each a stretch of time from a to b
 * with speeds va → vb in cells a second (constant acceleration, so he speeds
 * up out of a stop and slows into a corner), or a pause (a = b). `arrivals`
 * are when he comes to a stop in each next maze's doorway; he waits there
 * while it is drawn round him.
 */
const WALK = (() => {
  const segs = []
  const arrivals = []
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
  let doorway = false // just stepped through a door: stop and wait for the maze
  const g = rng(1729)
  const gp = rng(PANIC_SEED) // the sprint and after, so they can be tuned without moving what comes before
  const trodden = new Map() // cells he has run through in the sprint, and how often

  /* Looking down the corridor from `from` towards `next`. */
  const look = (from, next) => {
    const door = M.doors[k]
    const cells = [next]
    let side = false
    let sawDoor = same(next, door?.inside)
    const d = dirOf(from, next)
    let at = next
    for (;;) {
      for (const n of neighbours(k, at)) if (!same(n, cells.at(-2) ?? from) && !same(n, [at[0] + d[0], at[1] + d[1]])) side = true
      const ahead = [at[0] + d[0], at[1] + d[1]]
      if (!neighbours(k, at).some((n) => same(n, ahead))) break
      at = ahead
      cells.push(at)
      if (same(at, door?.inside)) sawDoor = true
    }
    // Seen all the way to a wall, nothing off it: a dead end.
    const blind = !side && !sawDoor
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
  const solve = (from, goal) => {
    const prev = new Map([[key(...from), null]])
    const queue = [from]
    while (queue.length) {
      const c = queue.shift()
      if (same(c, goal)) break
      for (const n of neighbours(k, c)) if (!prev.has(key(...n))) { prev.set(key(...n), c); queue.push(n) }
    }
    const path = []
    for (let c = goal; c; c = prev.get(key(...c))) path.unshift(c)
    return path
  }

  /* How far each cell of maze k is from its door, walking: a Map, and `far`, the farthest. */
  const doorCache = new Map()
  const doorDistance = (kk) => {
    if (!M.doors[kk]) return null
    if (!doorCache.has(kk)) {
      const D = new Map([[key(...M.doors[kk].inside), 0]])
      const queue = [M.doors[kk].inside]
      let far = 0
      while (queue.length) {
        const c = queue.shift()
        const d = D.get(key(...c))
        far = Math.max(far, d)
        for (const n of neighbours(kk, c)) if (!D.has(key(...n))) { D.set(key(...n), d + 1); queue.push(n) }
      }
      D.far = far
      doorCache.set(kk, D)
    }
    return doorCache.get(kk)
  }

  /* Where he goes next from `here`, and how long he stops first. */
  const decide = (state, P) => {
    const door = M.doors[k]
    const frantic = state === 'panic' || state === 'focus'
    if (!frantic && same(here, door?.inside)) return { next: door.outside, pause: 0 }
    const opts = neighbours(k, here)
    const back = [here[0] - came[0], here[1] - came[1]]
    if (frantic) {
      // No plan: any way on at a fork, never turning back but at a wall, old
      // ground and dead ends and all, but spread about: a way he has been down
      // is less likely the more often he has (so not three times running), and
      // a way that leads near the door (within 12 cells of it, as the crow
      // flies, in the next 40 cells along it) is unlikely, so he stays clear.
      const nearDoorAhead = (o) => {
        if (!door) return false
        const man = (c) => Math.abs(c[0] - door.inside[0]) + Math.abs(c[1] - door.inside[1])
        const seen = new Set([key(...here), key(...o)])
        let front = [o]
        for (let depth = 0; depth < 20 && front.length; depth++) {
          if (front.some((c) => man(c) < 10)) return true
          const next = []
          for (const c of front) for (const n of neighbours(k, c)) if (!seen.has(key(...n))) { seen.add(key(...n)); next.push(n) }
          front = next
        }
        return false
      }
      const ahead = [here[0] + came[0], here[1] + came[1]]
      const forward = opts.length > 1 ? opts.filter((o) => !same(o, back)) : opts
      const weight = (o) => {
        const n = trodden.get(key(...o)) ?? 0
        const toDoor = nearDoorAhead(o)
        return (1 / (1 + n) ** 2.5) * (toDoor ? 0.02 : 1) * (same(o, ahead) ? 1 + P.momentum : 1)
      }
      const ws = forward.map(weight)
      let pickAt = gp() * ws.reduce((t, w) => t + w, 0)
      let pick = forward.at(-1)
      for (let i = 0; i < forward.length; i++) { pickAt -= ws[i]; if (pickAt <= 0) { pick = forward[i]; break } }
      route = []
      return { next: pick, pause: 0 }
    }
    if (route.length) return { next: route.shift(), pause: 0 }
    const views = opts.filter((o) => !same(o, back)).map((o) => ({ o, ...look(here, o) }))
    const seen = views.find((v) => v.sawDoor)
    if (seen) {
      route = seen.cells.slice(1, seen.cells.findIndex((c) => same(c, door.inside)) + 1)
      return { next: seen.o, pause: 0 } // he's seen it: no stopping now
    }
    for (const v of views) if (v.blind) for (const c of v.cells) dead.add(key(...c))
    const fresh = views.filter((v) => !v.blind && !visited.has(key(...v.o)))
    if (fresh.length) {
      const score = (v) => ringDepth(k, ...v.cells.at(-1)) +
        (same(dirOf(here, v.o), came) ? P.momentum : 0) + (t >= MELTDOWN ? gp() : g()) * P.wander
      fresh.sort((p, q) => score(q) - score(p))
      return { next: fresh[0].o, pause: fresh.length > 1 ? P.hesitate : 0 }
    }
    // Every way he can see is spent: stop, then walk back.
    const path = backtrack()
    if (!path) return { next: opts[0] ?? here, pause: P.stumped }
    route = path.slice(1)
    return { next: path[0], pause: P.stumped }
  }

  /* Bring the step into `here` to a stop. */
  const stop = () => {
    if (!pending) return
    const d = pending.va > 0 ? 2 / pending.va : 1.7 / pending.vc
    push(pending.t, pending.t + d, pending.a, here, pending.va, 0, pending.va <= 0)
    t = pending.t + d
    pending = null
  }

  let guard = 0
  let rest = true // standing still: the next step starts from nothing
  while (t < END && guard++ < 40000) {
    const state = stateAt(t)
    // Coming round: once the slowing step would carry him past the harmonic, he stops.
    if (state === 'focus' && pending && pending.t + (pending.va > 0 ? 2 / pending.va : 1.7 / pending.vc) >= STOP) {
      // The last step eased to land on the harmonic exactly.
      const d = Math.max(0.35, STOP - pending.t)
      push(pending.t, pending.t + d, pending.a, here, pending.va, 0, 'land')
      t = pending.t + d
      pending = null
      push(t, Math.max(t, STOP), here, here, 0, 0)
      t = Math.max(t, STOP)
      rest = true
      continue
    }
    if (state === 'meltdown' || state === 'breathe') {
      stop()
      const until = state === 'meltdown' ? SPRINT : SET_OUT
      push(t, Math.max(t, until), here, here, 0, 0)
      t = Math.max(t, until)
      rest = true
      // After the breath: fresh eyes. He walks it as he did before the meltdown,
      // wrong turns and all, and finds his own way out.
      if (state === 'breathe') { visited = new Set([key(...here)]); dead = new Set(); route = [] }
      continue
    }
    if (doorway) {
      // In the next maze's doorway: stop, and wait while it is drawn round him.
      stop()
      arrivals.push(t)
      const until = t + PULL * 0.2 + drawTime(k) + 0.25
      push(t, until, here, here, 0, 0)
      t = until
      doorway = false
      rest = true
      continue
    }
    const P = gait(t)
    const vc = P.px / fitScale(k)
    const decided = decide(state, P)
    const { next } = decided
    // A hesitation too short to read as a stop is a slowing down instead.
    const glance = decided.pause > 0 && decided.pause < 0.2
    const pause = glance ? 0 : decided.pause
    const dir = dirOf(here, next)
    const straight = dir[0] === came[0] && dir[1] === came[1]
    const reverse = dir[0] === -came[0] && dir[1] === -came[1]
    // How fast he passes through `here`: full on, slowed for a corner or a glance, or stopped.
    const vHere = rest || pause > 0 || reverse ? 0 : glance ? vc * 0.4 : straight ? vc : vc * 0.55
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
      k += 1
      visited = new Set()
      dead = new Set()
      route = []
      doorway = true
    }
    if (state === 'panic' || state === 'focus') trodden.set(key(...next), (trodden.get(key(...next)) ?? 0) + 1)
    pending = { t, a: here, va: vHere, vc }
    came = dir
    here = next
    visited.add(key(...here))
  }
  return { segs, arrivals }
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
  if (s.ease === 'land') {
    // Leaving at his speed, arriving at rest, at a set time: a Hermite curve.
    const x = tau / d
    u = clamp01(-2 * x ** 3 + 3 * x ** 2 + ((s.va * d) / (L || 1)) * (x ** 3 - 2 * x ** 2 + x))
  }
  else if (s.ease) u = easeInOut(tau / d)
  else if (L === 0) u = 0
  else u = clamp01((s.va * tau + (0.5 * (s.vb - s.va) * tau * tau) / d) / L)
  return [lerp(s.a[0], s.b[0], u), lerp(s.a[1], s.b[1], u)]
}

/*
 * Where he is, smoothed: a short moving average of posAt, so the corners he
 * turns are rounded and the line he leaves is one sweep rather than a run of
 * right angles. The window is a fixed fraction of a cell, so it rounds a
 * corner as much at a run as at a walk, and never cuts through a wall.
 */
function smoothAt(time) {
  const P = gait(time)
  const cells = P.px > 0 ? P.px / scaleAt(time) : 0
  const w = cells > 0 ? Math.max(0.012, Math.min(0.09, 0.2 / cells)) : 0.09
  let x = 0
  let y = 0
  let sum = 0
  for (const [k, wt] of [[-2, 1], [-1, 2], [0, 3], [1, 2], [2, 1]]) {
    const p = posAt(time + (k * w) / 2)
    x += p[0] * wt
    y += p[1] * wt
    sum += wt
  }
  return [x / sum, y / sum]
}

/** The last pull back, in song seconds: one steady move from the maze he is in out to the whole anchor. */
const OUTRO = [193, 202.3]
const OUTRO_EASE = 1

/** The doorways the film shows: any after 3:08 would fall in the pull back or past the end card. */
const ARRIVALS = WALK.arrivals.filter((a) => a < 188)

/** Which maze he is in at `time`. */

const mazeAt = (time) => ARRIVALS.filter((e) => e <= time).length

/* ── Walls ────────────────────────────────────────────────────────── */

/** When maze k is drawn: the first round him as he arrives, each next one as he nears its door. */
const DRAWN = (() => {
  // The first once he is in the middle and his line in has faded; each next
  // one while he stands in its doorway, the camera pulling back as it starts.
  const out = SIZES.map((_, k) => (k === 0 ? [16.6, 19.2] : ARRIVALS[k - 1] !== undefined
    ? [ARRIVALS[k - 1] + PULL * 0.2, ARRIVALS[k - 1] + PULL * 0.2 + drawTime(k)]
    : null))
  // Any box he never reached comes in just before the pull back; the anchor
  // comes in, middle outward, as the pull back starts, while it is still
  // mostly out of frame.
  let at = Math.max(186, (ARRIVALS.at(-1) ?? 0) + 4)
  return [...out.map((w) => {
    if (w) return w
    const span = [at, at + 3]
    at += 2
    return span
  }), [OUTRO[0] - 0.5, OUTRO[0] + 2.5]]
})()
const CHUNKS = 24
/* Mazes with more runs than this appear chunk by chunk rather than stroke by stroke. */
const PEN_LIMIT = 1600

/**
 * Every maze's walls as straight runs in world units, in the order a hand
 * would draw them (ring by ring out from the middle, round each ring from the
 * door it was entered by), each with when it is drawn.
 */
const RUNS = [...SIZES, null].map((size, k) => {
  const anchor = k === A
  const [w, h] = anchor ? [ANCHOR_BOX.x1 - ANCHOR_BOX.x0, ANCHOR_BOX.y1 - ANCHOR_BOX.y0] : size
  const hw = (w - 1) / 2
  const hh = (h - 1) / 2
  const [x0, x1, y0, y1] = anchor ? [ANCHOR_BOX.x0, ANCHOR_BOX.x1, ANCHOR_BOX.y0, ANCHOR_BOX.y1] : [-hw, hw, -hh, hh]
  const hMap = new Map()
  const vMap = new Map()
  const add = (map, line, at) => { if (!map.has(line)) map.set(line, []); map.get(line).push(at) }
  const cells = anchor ? [...ANCHOR_CELLS].map((c) => c.split(',').map(Number)) : null
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (anchor) break
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
  for (const [x, y] of cells ?? []) {
    for (const [d, [dx, dy]] of Object.entries(DIRS)) {
      const other = mazeOf(x + dx, y + dy)
      if (M.connected([x, y], [x + dx, y + dy])) continue
      if (other !== -1 && other < k) continue
      if ((d === 'w' || d === 'n') && other === k) continue
      if (d === 'n') add(hMap, y - 0.5, x - 0.5)
      if (d === 's') add(hMap, y + 0.5, x - 0.5)
      if (d === 'w') add(vMap, x - 0.5, y - 0.5)
      if (d === 'e') add(vMap, x + 0.5, y - 0.5)
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
  const enter = k === 0 ? [-1, 0] : anchor ? [1, 0] : M.doors[k - 1].outside
  const a0 = Math.atan2(enter[1], enter[0])
  const rings = anchor ? 40 : Math.max(3, Math.round(Math.min(w, h) / 4))
  const order = (run) => {
    const mx = (run[0] + run[2]) / 2
    const my = (run[1] + run[3]) / 2
    const depth = anchor ? ringDepth(A, mx, my) : ringDepth(k, Math.max(-hw, Math.min(hw, Math.round(mx))), Math.max(-hh, Math.min(hh, Math.round(my))))
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

const rate = (time) => gait(time).pulse
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

/*
 * The last pull back (as asked, 2026-11-02): one steady move, out from the
 * maze he is in to the whole anchor, a second's ease at each end and an even
 * speed between, in log scale. The anchor is about 15 times its stock, so the
 * stock's edges show early in the move; by 3:22.3 the whole anchor is on the
 * plate, and the camera holds there, the red dot in it, until the mark on
 * black at the last note.
 */

/** Screen px per cell: each maze fitted to the plate, pulling back as the next is drawn round it. */
const ZOOM = (() => {
  const keys = [[0, fitScale(0)]]
  const add = (t, s) => keys.push([Math.max(t, keys.at(-1)[0] + 0.05), s])
  ARRIVALS.forEach((e, k) => {
    if (k + 1 >= SIZES.length) return
    add(e, fitScale(k))
    add(e + PULL, fitScale(k + 1))
  })
  return keys.filter(([t]) => t < OUTRO[0])
})()

/** Screen px per cell when the whole anchor (219 units tall) fills 90% of the plate. */
const ANCHOR_FIT = (PH * 0.9) / (219 * ANCHOR_K)

/** How far through the pull back, 0–1: a trapezoid of speed, so the middle is even. */
function outroProgress(time) {
  const T = OUTRO[1] - OUTRO[0]
  const a = OUTRO_EASE
  const v = 1 / (T - a)
  const tau = clamp01((time - OUTRO[0]) / T) * T
  if (tau < a) return (v * tau * tau) / (2 * a)
  if (tau > T - a) return 1 - (v * (T - tau) ** 2) / (2 * a)
  return v * (tau - a / 2)
}

function scaleAt(time) {
  if (time < OUTRO[0]) return keyScale(time)
  const u = outroProgress(time)
  return Math.exp(lerp(Math.log(keyScale(OUTRO[0])), Math.log(ANCHOR_FIT), u))
}

/** Where the camera looks, in cells: the mazes' centre, drifting down to the anchor's as it all comes in. */
function lookAt(time) {
  return [0, ANCHOR_MID * outroProgress(time) ** 2]
}

function keyScale(time) {
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
const TRAIL_STEP = 1 / 60
const TRAIL_BINS = 32

/** The plate alone — what goes inside the sheet. Returns { plate, lib }. */
export function mazePlate({ time, uid }) {
  const s = scaleAt(time)
  const [lx, ly] = lookAt(time)
  const sx = (x) => CX + (x - lx) * s
  const sy = (y) => CY + (y - ly) * s
  const dot = smoothAt(time)

  // The trail: where he was over the last TRAIL seconds, sampled finely,
  // tapering and fading with age in many small steps.
  const width = Math.max(1.5, Math.min(5, s * 0.06))
  const first = Math.max(WALK.segs[0].t0, time - TRAIL)
  const pts = []
  for (let u = first; u < time; u += TRAIL_STEP) pts.push([u, smoothAt(u)])
  pts.push([time, dot])
  let trail = ''
  const per = Math.max(2, Math.ceil(pts.length / TRAIL_BINS))
  for (let i = 0; i < pts.length - 1; i += per - 1) {
    const part = pts.slice(i, i + per)
    if (part.length < 2) break
    const age = (time - part[Math.floor(part.length / 2)][0]) / TRAIL
    const life = 1 - clamp01(age)
    if (life <= 0.02) continue
    const d = part.map(([, [x, y]], j) => `${j ? 'L' : 'M'}${r(sx(x), 2)} ${r(sy(y), 2)}`).join('')
    trail += `<path d="${d}" stroke-width="${r(width * (0.25 + 0.75 * life), 2)}" opacity="${r(life ** 1.3, 3)}"/>`
  }

  // A tremble: building through the meltdown, frantic through the sprint, easing as he comes round.
  const shake = Math.max(
    window01(time, MELTDOWN, SPRINT + 0.5, 1) * 0.07 * ramp(time, MELTDOWN, SPRINT),
    window01(time, SPRINT, STOP, 0.6) * 0.12 * (1 - ramp(time, FOCUS, STOP)),
  )
  const jx = shake * (Math.sin(time * 41.3) + 0.6 * Math.sin(time * 67.9 + 1.3))
  const jy = shake * (Math.sin(time * 37.1 + 2.1) + 0.6 * Math.sin(time * 59.3))
  // The pulse: the dot swells and settles on each breath, and a ring goes out on each one.
  const ph = phaseAt(time)
  const breath = 0.5 + 0.5 * Math.sin(ph)
  const deep = 1 + 0.8 * window01(time, STOP, SET_OUT, 1.2) + 1.3 * window01(time, MELTDOWN + 0.6, SPRINT + 0.6, 1.4)
  const base = Math.max(7, Math.min(11, s * 0.13))
  const rad = base * (1 + 0.28 * breath * deep)
  const ringU = ((ph / (Math.PI * 2)) % 1 + 1) % 1
  const hx = sx(dot[0] + jx)
  const hy = sy(dot[1] + jy)
  // Walls keep a hairline down to cells of 2.7 px; below that they are a
  // share of the cell, so far out the anchor stays a maze, not solid ink.
  const wallW = s >= 2.67 ? Math.max(0.8, Math.min(3, s * 0.05)) : s * 0.3
  const appear = clamp01((time - ENTER.from) / 0.3)
  const plate = `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>
  <g transform="translate(${r(CX - lx * s, 3)} ${r(CY - ly * s, 3)}) scale(${r(s, 5)})" stroke="${INK}" stroke-width="${(wallW / s).toFixed(4)}" fill="none" stroke-linecap="square">${walls(time, uid)}</g>
  <g stroke="${RED}" fill="none" stroke-linejoin="round" stroke-linecap="butt">${trail}</g>
  <g opacity="${r(appear, 3)}"><circle cx="${r(hx)}" cy="${r(hy)}" r="${r(rad * (1.2 + ringU * 1.6 * deep))}" fill="none" stroke="${RED}" stroke-width="2" opacity="${r(0.6 * (1 - ringU))}"/>
  <circle cx="${r(hx)}" cy="${r(hy)}" r="${r(rad)}" fill="${RED}"/></g>`
  return { plate, lib: wallLib(uid) }
}

/** The last note (the hit at 3:23.1 rings to about 3:24.3): 3:24.0 was a smidge late. */
const END_CARD = 203.8

/** The film: the opening, then the album's cover sheet, the plate, the lyric in the margin. */
export function mazeFrame({ time, score, lockup = '', uid = 'maze' }) {
  // The last note: a hard cut to the band's mark on black, as Andalusia ends,
  // and it holds (no credits), past the record's end into silence.
  if (time >= END_CARD) {
    return {
      lib: [wallLib(uid)],
      label: 'End card',
      svg: `<rect width="1600" height="900" fill="${END_BLACK}"/><g transform="translate(800 450) scale(${r(500 / 918, 5)}) translate(-459 -309.5)" style="color:${END_INK}">${lockup}</g>`,
    }
  }
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
export const MAZE_WALK = { arrivals: WALK.arrivals, doors: M.doors, segs: WALK.segs }

/** Seconds of silence an export holds on the end card after the record (mp4.mjs reads it). */
mazeFrame.hold = 4
