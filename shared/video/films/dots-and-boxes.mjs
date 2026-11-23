/*
 * Meet Me at the Horizon · Dots and Boxes — the film (v1, 2026-11-17).
 *
 * The user's brief (2026-11-17): "Think of a grid of dots all evenly spaced.
 * There is a game I used to play with my sister as a kid. Each of us would
 * take turns drawing one line that connected two dots. You could only go
 * up/down/left/right (no diagonal). You could draw a line wherever you wanted
 * to. If you closed a box … you would score a point. I want this video to show
 * a grid (same colors as into the wild music video) and for the red player
 * (me) to play against a black line/player (my monkey brain/enemy)."
 *
 * One sleepless night as one game of dots and boxes, on the album's paper in
 * Into the Wild's three inks: the dots and the monkey brain in ink, him in red.
 * Red draws first. A box closed is filled solid in its closer's ink (no tally
 * marks: the user took them out, 2026-11-23); closing a box earns another
 * line, so a chain is taken a line per sung word.
 *
 * The game is real: every move is legal, every box is scored to whoever drew
 * its fourth side, and the board is played out to the last line. It is played
 * once per score (`planFor`) by two simple players — take a box when one is
 * there; otherwise draw a line that gives nothing away; when nothing is safe,
 * give away as little as possible — and how they play follows the song
 * (`CARELESS`): in the choruses the monkey brain gets drowsy and leaves boxes
 * lying; in the fever of verses 3 and 4 it is him who slips. Everything else
 * is the game. `SEED` picks the one game (of thousands played offline by
 * tools/video-styles/dots/search.mjs) whose night goes the way the song does:
 * nothing taken before the first chorus, red's first boxes as the sun "starts
 * to wake", the monkey brain running away with the fever, red back in the
 * second chorus, the monkey brain ahead all through the last verse, and red
 * taking the lead only with the last chain, on the last "horizon".
 *
 * When: every line is drawn on a measured word (or a beat of the click in the
 * intro and the gap after the first hook), `SLOTS` per section, 175 lines in
 * all — the board's every edge. Red's pen is slow and straight; the monkey
 * brain's is quick and erratic, never still for long, but its lines are as
 * straight as his (2026-11-23). After the last line
 * the outro lets the monkey brain's ink sink back, and the red stays.
 *
 * Notes: docs/visualizers/meet-me-at-the-horizon.md.
 */
import { rng, r, clamp01, lerp, ramp, easeOut, easeInOut, easeOutBack } from '../kit.mjs'
import { COVER_SHEET, INK, PAPER, RED, paper, marginLyric } from '../album.mjs'
import { filmOpening, inOpening } from '../opening.mjs'
import { endCard } from '../ending.mjs'

const { x: PX, y: PY, w: PW, h: PH } = COVER_SHEET.plate
const CY = PY + PH / 2

/* ── The board ────────────────────────────────────────────────────── */

/** Dots across and down; boxes are one fewer each way. */
export const COLS = 14
export const ROWS = 7
const BW = COLS - 1
const BH = ROWS - 1
/** The dot pitch, in sheet units. */
const S = 96
const GX = 800 - (BW * S) / 2
const GY = CY - (BH * S) / 2
const NH = BW * ROWS
/** Every line on the board: 91 across, 84 down. */
export const EDGES = NH + COLS * BH
export const BOXES = BW * BH

const hEdge = (i, j) => j * BW + i
const vEdge = (i, j) => NH + j * COLS + i

/** The two dots an edge joins, as [i, j] grid places. */
function edgeDots(e) {
  if (e < NH) { const i = e % BW; const j = (e - i) / BW; return [[i, j], [i + 1, j]] }
  const k = e - NH
  const i = k % COLS
  const j = (k - i) / COLS
  return [[i, j], [i, j + 1]]
}

/** The (one or two) boxes an edge is a side of. */
const EDGE_BOXES = Array.from({ length: EDGES }, (_, e) => {
  const out = []
  if (e < NH) {
    const i = e % BW
    const j = (e - i) / BW
    if (j > 0) out.push((j - 1) * BW + i)
    if (j < BH) out.push(j * BW + i)
  }
  else {
    const k = e - NH
    const i = k % COLS
    const j = (k - i) / COLS
    if (i > 0) out.push(j * BW + i - 1)
    if (i < BW) out.push(j * BW + i)
  }
  return out
})

const BOX_EDGES = Array.from({ length: BOXES }, (_, b) => {
  const i = b % BW
  const j = (b - i) / BW
  return [hEdge(i, j), hEdge(i, j + 1), vEdge(i, j), vEdge(i + 1, j)]
})

const dotXY = ([i, j]) => [GX + i * S, GY + j * S]

/* ── The players ──────────────────────────────────────────────────── */

export const RED_P = 0
export const BLACK_P = 1

/*
 * How likely a player is, when a safe line is there, to draw one that leaves a
 * box on three sides anyway: [from, to, red, black]. Asleep-ish in the
 * choruses (the monkey brain), feverish in verses 3 and 4 (him).
 */
const CARELESS = [
  [52.0, 71.3, 0, 0.32],
  [71.3, 106.7, 0.24, 0],
  [106.7, 126.4, 0, 0.32],
]
const carelessAt = (p, t) => {
  for (const [a, b, red, black] of CARELESS) if (t >= a && t < b) return p === RED_P ? red : black
  return 0
}

/** The seed of the one game the film plays (tools/video-styles/dots/search.mjs). */
export const SEED = 96

/**
 * Plays the whole game: one move per slot. Returns [{ e, p, t, closed: [box] }].
 * Pure and deterministic for (slots, seed).
 */
export function playGame(slots, seed = SEED) {
  const rand = rng(seed)
  const drawn = new Int8Array(EDGES).fill(-1)
  const sides = new Uint8Array(BOXES)
  const owner = new Int8Array(BOXES).fill(-1)
  const moves = []
  let p = RED_P
  let lastEdge = -1

  const draw = (e, who, d = drawn, sd = sides) => {
    d[e] = who
    const closed = []
    for (const b of EDGE_BOXES[e]) if (++sd[b] === 4) closed.push(b)
    return closed
  }
  /** The edge left on a box with three sides. */
  const missing = (b, d) => BOX_EDGES[b].find((x) => d[x] < 0)
  /** How many boxes the other player takes, greedily, if `e` is drawn now. */
  const gift = (e) => {
    const d = drawn.slice()
    const sd = sides.slice()
    draw(e, 9, d, sd)
    let n = 0
    const queue = []
    for (let b = 0; b < BOXES; b++) if (sd[b] === 3) queue.push(b)
    while (queue.length) {
      const b = queue.pop()
      if (sd[b] !== 3) continue
      const m = missing(b, d)
      d[m] = 9
      for (const nb of EDGE_BOXES[m]) {
        sd[nb]++
        if (sd[nb] === 4) n++
        else if (sd[nb] === 3) queue.push(nb)
      }
    }
    return n
  }
  const pickNear = (list) => {
    if (lastEdge < 0) return list[Math.floor(rand() * list.length)]
    const [a] = edgeDots(lastEdge)
    let best = list[0]
    let bd = Infinity
    for (const e of list) {
      const [c] = edgeDots(e)
      const dd = Math.hypot(c[0] - a[0], c[1] - a[1])
      if (dd < bd) { bd = dd; best = e }
    }
    return best
  }

  for (let k = 0; k < EDGES; k++) {
    const t = slots[k]
    const open = []
    for (let e = 0; e < EDGES; e++) if (drawn[e] < 0) open.push(e)
    const completing = open.filter((e) => EDGE_BOXES[e].some((b) => sides[b] === 3))
    let e
    if (completing.length) e = pickNear(completing)
    else {
      const safe = open.filter((x) => EDGE_BOXES[x].every((b) => sides[b] <= 1))
      if (safe.length && !(rand() < carelessAt(p, t))) e = safe[Math.floor(rand() * safe.length)]
      else if (safe.length) {
        const giving = open.filter((x) => !safe.includes(x))
        e = giving.length ? giving[Math.floor(rand() * giving.length)] : safe[Math.floor(rand() * safe.length)]
      }
      else {
        let least = Infinity
        let pool = []
        for (const x of open) {
          const g = gift(x)
          if (g < least) { least = g; pool = [x] }
          else if (g === least) pool.push(x)
        }
        e = pool[Math.floor(rand() * pool.length)]
      }
    }
    const closed = draw(e, p)
    for (const b of closed) owner[b] = p
    moves.push({ e, p, t, closed })
    lastEdge = e
    if (!closed.length) p = 1 - p
  }
  return moves
}

/* ── When each line is drawn ──────────────────────────────────────── */

/*
 * How many lines each stretch of the song draws, 175 in all. Lines land on
 * sung words (picked evenly through the stretch, first and last included),
 * or on beats of the click where nothing is sung.
 */
const SLOTS = [
  // Nothing before the voice (2026-11-23): red's first line is the first word.
  { lines: [0, 3], n: 21, build: 1.8 }, // verse 1: taking turns, quickening
  { lines: [4, 7], n: 29, build: 1.15 }, // verse 2: racing
  { lines: [8, 11], n: 16 }, // chorus 1
  { lines: [12, 19], n: 46 }, // verses 3 and 4: the fever
  { lines: [20, 23], n: 16 }, // chorus 2
  { lines: [24, 26], beats: [138.3, 141.3], n: 10 }, // the first "meet me", and the gap after it
  { lines: [27, 30], n: 18 }, // verse 5
  { lines: [31, 34], n: 12 }, // chorus 3
  { lines: [35, 37], n: 7, endOn: 'horizon' }, // the last "meet me": the last line on the last "horizon"
]

export function slotsFor(score) {
  const beat = 60 / (score.bpm ?? 55)
  const phase = score.beatPhase ?? 0.48
  const out = []
  for (const seg of SLOTS) {
    let cand = []
    if (seg.lines) {
      for (let li = seg.lines[0]; li <= seg.lines[1]; li++) {
        for (const w of score.lines[li].words) cand.push({ t: w.t, text: w.text, li })
      }
    }
    if (seg.beats) {
      for (let k = Math.ceil((seg.beats[0] - phase) / beat); phase + k * beat < seg.beats[1]; k++) cand.push({ t: phase + k * beat })
    }
    cand.sort((a, b) => a.t - b.t)
    if (seg.endOn) {
      const last = cand.findLastIndex((c) => c.li === seg.lines[1] && /horizon/i.test(c.text ?? ''))
      cand = cand.slice(0, last + 1)
    }
    // No two lines nearer than a sixth of a second.
    const kept = []
    for (const c of cand) if (!kept.length || c.t - kept.at(-1).t >= 0.16) kept.push(c)
    const m = kept.length
    if (m < seg.n) throw new Error(`dots-and-boxes: ${m} places for ${seg.n} lines in [${seg.lines ?? seg.beats}]`)
    // Evenly through the stretch, or (`build`) spread out at first and closing up.
    const g = seg.build ?? 1
    let prev = -1
    for (let i = 0; i < seg.n; i++) {
      const x = seg.n === 1 ? 1 : i / (seg.n - 1)
      const f = g === 1 ? x : 1 - (1 - x) ** g
      const at = Math.min(m - (seg.n - i), Math.max(prev + 1, Math.round(f * (m - 1))))
      out.push(kept[at].t)
      prev = at
    }
  }
  if (out.length !== EDGES) throw new Error(`dots-and-boxes: ${out.length} slots for ${EDGES} lines`)
  return out
}

/* ── The plan ─────────────────────────────────────────────────────── */

/*
 * How worked up the monkey brain is (the user, 2026-11-23: "slowly build up
 * the speed/erratic behavior of the black dot … start by really taking turns,
 * then ramp up the intensity as the song builds"). 0: it goes to its line and
 * draws it, almost as calmly as he does. 1: the darting of flightsFor at full
 * tilt, from the fever (verse 4) on.
 */
const HEAT = [[17.3, 0], [34.7, 0.2], [52.0, 0.45], [71.3, 0.7], [89.35, 1]]
export function heatAt(t) {
  if (t <= HEAT[0][0]) return HEAT[0][1]
  for (let k = 1; k < HEAT.length; k++) {
    const [b, hb] = HEAT[k]
    if (t < b) { const [a, ha] = HEAT[k - 1]; return lerp(ha, hb, (t - a) / (b - a)) }
  }
  return HEAT.at(-1)[1]
}

/** How long a stroke takes: his are slow and even, the monkey brain's quick, once it is worked up. */
const DRAW = { [RED_P]: 0.34, [BLACK_P]: 0.13 }
const drawFor = (p, t) => (p === RED_P ? DRAW[RED_P] : lerp(0.28, DRAW[BLACK_P], heatAt(t)))

/*
 * Before the game (2026-11-23): the black lifts off blank paper, the board is
 * drawn, red comes in alone, a second later the monkey brain; they move about
 * a little, and red draws the first line on the first sung word.
 */
export const BOARD_AT = 12.6
const IN = { [RED_P]: 14.4, [BLACK_P]: 15.4 }
const HOME = { [RED_P]: [4, 3], [BLACK_P]: [9, 3] }

const plans = new WeakMap()
export function planFor(score, seed = SEED) {
  if (seed === SEED && plans.has(score)) return plans.get(score)
  const slots = slotsFor(score)
  const moves = playGame(slots, seed)
  const rand = rng(seed * 7 + 3)
  // Each move: which end the pen starts from, how long the stroke takes, and when its boxes fill.
  // Each pen starts its first line from the end nearer where it waited.
  const pens = { [RED_P]: dotXY(HOME[RED_P]), [BLACK_P]: dotXY(HOME[BLACK_P]) }
  const score2 = [0, 0]
  moves.forEach((m, k) => {
    const next = moves[k + 1]?.t ?? m.t + 1
    m.dur = Math.max(0.08, Math.min(drawFor(m.p, m.t), (next - m.t) * 0.75))
    const [a, b] = edgeDots(m.e).map(dotXY)
    const at = pens[m.p]
    const flip = Math.hypot(at[0] - b[0], at[1] - b[1]) < Math.hypot(at[0] - a[0], at[1] - a[1])
    m.from = flip ? b : a
    m.to = flip ? a : b
    pens[m.p] = m.to
    m.done = m.t + m.dur
    // Both pens draw straight lines (the user, 2026-11-23: the black one "less shaky").
    m.wob = `M${r(m.from[0])} ${r(m.from[1])}L${r(m.to[0])} ${r(m.to[1])}`
    score2[m.p] += m.closed.length
    m.score = [...score2]
  })
  const plan = { moves, slots, final: score2, seed }
  plan.flights = flightsFor(moves, score, seed)
  plan.redPre = redBefore(moves, seed)
  if (seed === SEED) plans.set(score, plan)
  return plan
}

/*
 * The monkey brain between its lines (the user, 2026-11-23: "less shaky and
 * more erratic", then "slowly build up"). Worked up (`heatAt` near 1) it
 * never sits still for long and never goes anywhere in a straight, even way:
 * it waits a moment, darts off to some other dot or the middle of some other
 * line (mostly near, now and then right across the board), swerves on the
 * way, overshoots and snaps back, freezes, darts again; then makes for the
 * line it will actually draw at the last moment. Calm (near 0) it rests where
 * its line ended and glides to the next one in good time, so the two of them
 * plainly take turns. Before the first line it wanders a little; after its
 * last it keeps on, slower and slower, as it sinks. Planned once per score
 * with its own rng, so every frame agrees.
 */
const HALF = S / 2
const clampX = (x) => Math.max(GX, Math.min(GX + BW * S, x))
const clampY = (y) => Math.max(GY, Math.min(GY + BH * S, y))
function flightsFor(moves, score, seed) {
  const rand = rng(seed * 31 + 11)
  const black = moves.filter((m) => m.p === BLACK_P)
  const legs = []
  const end = score.endCardAt ?? score.duration
  const hop = (pos, far, heat) => {
    // A half-grid point: a dot, or the middle of a line it is eyeing.
    const reach = far ? 4 + Math.floor(rand() * 6) : 1 + Math.floor(rand() * (1 + 2 * heat))
    const a = rand() * Math.PI * 2
    let x = Math.round((pos[0] + Math.cos(a) * reach * S - GX) / HALF) * HALF + GX
    let y = Math.round((pos[1] + Math.sin(a) * reach * S * 0.8 - GY) / HALF) * HALF + GY
    x = clampX(x)
    y = clampY(y)
    if (Math.hypot(x - pos[0], y - pos[1]) < HALF * 0.9) x = clampX(x + (x > 800 ? -S : S))
    return [x, y]
  }
  const leg = (t0, t1, from, to, heat) => {
    const len = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1
    // A swerve to one side, and how far past it shoots before snapping back.
    const bend = (rand() - 0.5) * Math.min(1.1, 140 / len) * len * (0.15 + 0.85 * heat)
    const nx = -(to[1] - from[1]) / len
    const ny = (to[0] - from[0]) / len
    legs.push({ t0, t1, from, to, c: [(from[0] + to[0]) / 2 + nx * bend, (from[1] + to[1]) / 2 + ny * bend], over: 0.6 + rand() * 2.2, heat })
  }
  const pauseAt = (calm, heat) => {
    const u = rand()
    if (u < 0.12) return (0.7 + rand() * 0.9) * calm // freezes
    if (u < 0.12 + 0.33 * heat) return (0.03 + rand() * 0.08) * calm // stutters: off again at once
    return (0.12 + rand() * 0.4) * calm
  }
  const slow = (heat) => 1 + 2.2 * (1 - heat)
  const durFor = (from, to, heat) => (0.07 + rand() * 0.12 + Math.hypot(to[0] - from[0], to[1] - from[1]) / 2600) * slow(heat)
  /** From `pos` at `t`, darting about (or not) until it has to make for `next`. */
  const between = (pos, t, next, heat, always = false) => {
    // The last glide to its line: calm, unhurried and longer the further it is; worked up, a dart at the last moment.
    const far = Math.hypot(next.from[0] - pos[0], next.from[1] - pos[1])
    const last = Math.max(0.08, Math.min(lerp(0.35 + far / 1400, 0.2, heat), (next.t - t) * lerp(0.7, 0.4, heat)))
    const goAt = next.t - last
    for (;;) {
      if (!always && rand() >= heat * 1.15) break
      const p = pauseAt(1 + 1.5 * (1 - heat), heat)
      const to = hop(pos, rand() < 0.14 * heat, heat)
      const dur = durFor(pos, to, heat)
      if (t + p + dur > goAt - 0.05) break
      leg(t + p, t + p + dur, pos, to, heat)
      pos = to
      t += p + dur
    }
    leg(Math.max(t, goAt), next.t, pos, next.from, heat)
  }
  // Before the game: in, a look round, a slow wander.
  if (black[0]) between(dotXY(HOME[BLACK_P]), IN[BLACK_P] + 0.7, black[0], 0.15, true)
  for (let k = 1; k < black.length; k++) {
    const prev = black[k - 1]
    between(prev.to, prev.done, black[k], heatAt(prev.done))
  }
  // After its last line: on and on, calmer each time, as the morning takes it.
  const fin = black.at(-1)
  if (fin) {
    let pos = fin.to
    let t = fin.done
    for (;;) {
      const calm = 1 + 2.5 * clamp01((t - fin.done) / 14)
      const p = pauseAt(calm, 1)
      const to = hop(pos, rand() < 0.1, 1)
      const dur = durFor(pos, to, 1) * Math.sqrt(calm)
      if (t + p + dur > end) break
      leg(t + p, t + p + dur, pos, to, 1)
      pos = to
      t += p + dur
    }
  }
  return legs
}

/** Red before its first line: alone a moment, a dot over, a pause, then to the line, slow and straight. */
function redBefore(moves, seed) {
  const rand = rng(seed * 17 + 5)
  const first = moves.find((m) => m.p === RED_P)
  if (!first) return []
  const home = dotXY(HOME[RED_P])
  const step = [home[0] + (rand() < 0.5 ? -S : S), home[1] + (rand() < 0.5 ? -S : S) * (rand() < 0.5 ? 1 : 0)]
  const mk = (t0, t1, from, to) => ({ t0, t1, from, to, c: [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2], over: 0, heat: 0 })
  const t0 = IN[RED_P] + 0.9
  const arrive = first.t - 0.12
  const legs = [mk(t0, t0 + 0.8, home, step)]
  const go = Math.max(t0 + 1.4, arrive - 1.0)
  legs.push(mk(go, arrive, step, first.from))
  return legs
}

/** Where a flight leg is at `u`: along its swerve, past the end and back. */
function legAt(L, u) {
  // Calm, a glide; worked up, a dart that overshoots.
  const h = L.heat ?? 1
  const e = h >= 1 ? easeOutBack(u, L.over) : lerp(easeInOut(u), easeOutBack(u, L.over), h)
  const q = clamp01(e)
  const a = 1 - q
  // The swerve's quadratic, then the overshoot carried on along the arrival direction.
  const x = a * a * L.from[0] + 2 * a * q * L.c[0] + q * q * L.to[0]
  const y = a * a * L.from[1] + 2 * a * q * L.c[1] + q * q * L.to[1]
  if (e <= 1) return { x, y }
  const dx = L.to[0] - L.c[0]
  const dy = L.to[1] - L.c[1]
  const n = Math.hypot(dx, dy) || 1
  const past = (e - 1) * Math.hypot(L.to[0] - L.from[0], L.to[1] - L.from[1])
  return { x: x + (dx / n) * past, y: y + (dy / n) * past }
}

/** For checking: where both pens are at `time` ([red, black], null before each comes in). */
export function dotsPensAt(score, time) {
  const plan = planFor(score)
  return [penAt(plan, RED_P, time), penAt(plan, BLACK_P, time)]
}

/** The score at `time`: [red, black]. */
export function scoreAt(plan, time) {
  let s = [0, 0]
  for (const m of plan.moves) { if (m.done > time) break; s = m.score }
  return s
}

/* ── Drawing ──────────────────────────────────────────────────────── */

const DOT_R = 6.5
const LINE_W = 7

/** The dots, popping on left to right once the black has lifted off blank paper. */
function dotsSvg(time) {
  let d = ''
  let late = ''
  for (let i = 0; i < COLS; i++) {
    const u = easeOutBack(clamp01((time - BOARD_AT - i * 0.1) / 0.35))
    if (u <= 0.01) continue
    for (let j = 0; j < ROWS; j++) {
      const [x, y] = dotXY([i, j])
      if (u >= 0.999) d += `M${r(x)} ${r(y)}h0`
      else late += `<circle cx="${r(x)}" cy="${r(y)}" r="${r(DOT_R * u, 2)}"/>`
    }
  }
  return `<path d="${d}" stroke="${INK}" stroke-width="${DOT_R * 2}" stroke-linecap="round"/><g fill="${INK}">${late}</g>`
}

/** How far the monkey brain's ink has sunk back, after the last line. */
const sink = (time, plan) => {
  const end = plan.moves.at(-1).done
  return easeInOut(ramp(time, end + 5, end + 13))
}

/** A pen's place at `time`: coming in, waiting, drawing, or between its lines. */
function penAt(plan, p, time) {
  if (time < IN[p]) return null
  const pop = clamp01((time - IN[p]) / 0.4)
  let last = null
  let next = null
  for (const m of plan.moves) {
    if (m.p !== p) continue
    if (m.t <= time) last = m
    else { next = m; break }
  }
  if (last && time < last.done) {
    const u = p === RED_P ? easeInOut(clamp01((time - last.t) / last.dur)) : easeOut(clamp01((time - last.t) / last.dur))
    return { x: lerp(last.from[0], last.to[0], u), y: lerp(last.from[1], last.to[1], u), drawing: true, pop }
  }
  if (p === BLACK_P || !last) {
    // The monkey brain's flights (flightsFor), or red before its first line (redBefore).
    const legs = p === BLACK_P ? plan.flights : plan.redPre
    let at = last ? last.to : dotXY(HOME[p])
    for (const L of legs) {
      if (L.t0 > time) break
      if (last && L.t1 <= last.done) continue
      if (time < L.t1) return { ...legAt(L, (time - L.t0) / (L.t1 - L.t0)), pop }
      at = L.to
    }
    return { x: at[0], y: at[1], pop }
  }
  const rest = last.to
  if (next) {
    // Red sets off in good time and glides.
    const span = Math.min(0.9, next.t - last.done)
    const e = easeInOut(clamp01((time - (next.t - span)) / Math.max(span, 0.01)))
    return { x: lerp(rest[0], next.from[0], e), y: lerp(rest[1], next.from[1], e), pop }
  }
  return { x: rest[0], y: rest[1], pop }
}

/** The plate: dots, lines, boxes, pens. */
export function dotsPlate({ time, score }) {
  const plan = planFor(score)
  const quiet = 1 - 0.72 * sink(time, plan)
  const boxes = { [RED_P]: '', [BLACK_P]: '' }
  const pops = { [RED_P]: '', [BLACK_P]: '' }
  const lines = { [RED_P]: '', [BLACK_P]: '' }
  const drawing = { [RED_P]: '', [BLACK_P]: '' }
  const inset = 9
  for (const m of plan.moves) {
    if (m.t > time) break
    const u = clamp01((time - m.t) / m.dur)
    if (u >= 1) lines[m.p] += m.wob
    else drawing[m.p] += `<path d="${m.wob}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${r(1 - (m.p === RED_P ? easeInOut(u) : easeOut(u)), 3)}"/>`
    if (time < m.done) continue
    const since = time - m.done
    for (const b of m.closed) {
      const i = b % BW
      const j = (b - i) / BW
      const x = GX + i * S + inset
      const y = GY + j * S + inset
      const w = S - inset * 2
      if (since >= 0.22) boxes[m.p] += `M${x} ${y}h${w}v${w}h${-w}z`
      else {
        const k = 0.45 + 0.55 * easeOutBack(since / 0.22)
        const cx = x + w / 2
        const cy = y + w / 2
        pops[m.p] += `<rect x="${r(cx - (w * k) / 2)}" y="${r(cy - (w * k) / 2)}" width="${r(w * k)}" height="${r(w * k)}"/>`
      }
    }
  }
  const pen = (p) => {
    const at = penAt(plan, p, time)
    if (!at) return ''
    const { x, y } = at
    // Coming in: a pop, from nothing.
    const k = at.pop < 1 ? easeOutBack(at.pop, 2.2) : 1
    if (k <= 0.01) return ''
    const fill = p === RED_P ? RED : INK
    const fade = p === BLACK_P ? quiet : 1
    return `<g opacity="${r(Math.min(1, at.pop * 2.5) * fade, 3)}"><circle cx="${r(x)}" cy="${r(y)}" r="${r((at.drawing ? 11 : 9.5) * k, 2)}" fill="${fill}"/><circle cx="${r(x)}" cy="${r(y)}" r="${r(16 * k, 2)}" fill="none" stroke="${fill}" stroke-width="1.6" opacity="0.45"/></g>`
  }
  const blackO = quiet < 0.999 ? ` opacity="${r(quiet, 3)}"` : ''
  return `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>
<g fill="${INK}"${blackO}><path d="${boxes[BLACK_P]}"/>${pops[BLACK_P]}</g>
<g fill="${RED}"><path d="${boxes[RED_P]}"/>${pops[RED_P]}</g>
<g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="${LINE_W}">
<g stroke="${INK}"${blackO}><path d="${lines[BLACK_P]}"/>${drawing[BLACK_P]}</g>
<g stroke="${RED}"><path d="${lines[RED_P]}"/>${drawing[RED_P]}</g>
</g>
${dotsSvg(time)}
${pen(BLACK_P)}${pen(RED_P)}`
}

/** The film: the opening, then the album's cover sheet, the board, the lyric in the margin. */
export function dotsFrame({ time, score, lockup = '', uid = 'dots' }) {
  if (score.endCardAt != null && time >= score.endCardAt) return endCard({ now: time, from: score.endCardAt, lockup })
  const plan = planFor(score)
  const [red, black] = scoreAt(plan, time)
  const clip = `${uid}-plate`
  return {
    label: inOpening(time) ? 'Opening' : `Red ${red} · Black ${black}`,
    svg: `<defs><clipPath id="${clip}"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}"/></clipPath></defs>
${paper(COVER_SHEET)}
<g clip-path="url(#${clip})">${dotsPlate({ time, score })}</g>
${marginLyric({ now: time, score, uid, sheet: COVER_SHEET })}
${filmOpening({ time, uid, slug: 'meet-me-at-the-horizon' })}`,
  }
}

/** The "Now" line on the page: the game's score. */
export function dotsStateAt(score, time) {
  if (time < 12) return ''
  const [red, black] = scoreAt(planFor(score), time)
  return `Red ${red} · Black ${black}`
}

/** For the docs and for checking: every run of boxes taken, who took it and when. */
export function dotsRuns(score, seed = SEED) {
  const plan = planFor(score, seed)
  const runs = []
  for (const m of plan.moves) {
    if (!m.closed.length) continue
    const last = runs.at(-1)
    if (last && last.p === m.p && m.t - last.t1 < 4) { last.n += m.closed.length; last.t1 = m.done; last.score = m.score }
    else runs.push({ p: m.p, n: m.closed.length, t0: m.t, t1: m.done, score: m.score })
  }
  return runs
}

/** The poster: the board nearly full, red climbing back, the monkey brain still ahead (33–38). */
export const DOTS_POSTER = 176.5

/** The jump-to list on the page. What each is: docs/visualizers/meet-me-at-the-horizon.md. */
export const DOTS_BEATS = [
  { at: 0, label: 'Opening' },
  { at: 12, label: 'The board' },
  { at: 14.2, label: 'Red, then black' },
  { at: 17.2, label: 'First line' },
  { at: 35, label: 'Racing' },
  { at: 65.3, label: 'First box', key: true },
  { at: 79.8, label: 'The fever' },
  { at: 95, label: 'Running away', key: true },
  { at: 109.5, label: 'Back in it' },
  { at: 129.3, label: 'Oh won’t you' },
  { at: 139.6, label: 'The long chain', key: true },
  { at: 154.6, label: 'A sliver of hope', key: true },
  { at: 188.4, label: 'The horizon', key: true },
  { at: 196, label: 'Morning' },
]
