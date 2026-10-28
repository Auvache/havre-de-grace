/*
 * Conman — the board, as a film. Track two of Into the Wild, whole song.
 *
 * The plan, taken with the person watching on 2026-09-28 from the stills on
 * /music-videos/conman (conman-board-stills.mjs):
 *
 *   Intro      The hard porthole opening ('stamp', opening() in album.mjs):
 *              CONMAN on black, the band's mark stamped down on it, and the
 *              dive through the anchor's ring onto their board, section A,
 *              whole.
 *   Verse 1–3  A walk across their board, one neighbour at a time and never a
 *   Choruses   zoom: a section a line through verses 1 and 2 (A–H) and the
 *              first chorus (I, J), a section a half through verse 3 (K, L), a
 *              section a line through the second chorus (M, N). The words tear
 *              the sheets in view, nicks first and whole sheets last; "Earth
 *              shook" tears everything in view at once, and shakes.
 *   Break      Out to the whole board, the sheet eased away to the full frame,
 *              and every sheet torn off down to the black, the cork and the
 *              banknotes' backing with them. Nothing is left.
 *   Verse 4    A fast zoom in from the black onto A, as a new board is pasted
 *              up out of their scraps and printed over in red: mine, my face
 *              made of pieces of theirs. B on the third line, where the first
 *              nicks come off it; C on the fourth.
 *   Chorus 3   D, E, F, G, a line each, torn harder each time.
 *   Outro      Out to my whole board, torn at all over; the end card cuts in
 *              on the last hit with about half of it gone and none of it
 *              finished going.
 *
 * The board, the formats and how a cell is drawn are conman-board.mjs. This
 * file is the plan (which sheet tears on which word, where the camera is) and
 * the frame. Plain .mjs, pure: the album's contract.
 */
import { r, lerp, clamp01, ramp } from '../kit.mjs'
import { COVER_SHEET, INK, paper, opening, marginLyric, easeCamera } from '../album.mjs'
import { sectionAt, lineAt } from '../score.mjs'
import { endCard } from '../ending.mjs'
import { hash } from '../portraits.mjs'
import { FORMATS, SCRAPS, SCRAP_FLIGHT, PULL, cellsOf, boardSvg, groundLayout, FULL_FRAME, layBoard } from './conman-board.mjs'

const PLATE = COVER_SHEET.plate
const BEAT = 60 / 87.5
/* A hold is a hair tighter than the section, so the camera can drift inside it without showing the next. */
const HOLD_Z = 1.05
/* A move from one section to the next, eased, ending just before its line. */
const MOVE = 1.3
/* When the stamp opening has finished with the frame (its dive ends at 9.3). */
const OPENING_UNTIL = 10

/*
 * The holds: [section, the line it arrives for, the biggest piece its words
 * may take at its start (0 a nick … 4 the whole sheet), the gap between tears
 * at its start]. Theirs before the break; mine after it.
 */
const THEIRS = [
  ['A', 0, 0, 2.4], ['B', 1, 0, 2.1], ['C', 2, 1, 1.9], ['D', 3, 1, 1.7],
  ['E', 4, 1, 1.5], ['F', 5, 2, 1.3], ['G', 6, 2, 1.2], ['H', 7, 2, 1.1],
  ['I', 8, 3, 1.0], ['J', 9, 3, 0.9], ['K', 10, 3, 0.8], ['L', 12, 4, 0.7],
  ['M', 14, 4, 0.6], ['N', 15, 4, 0.55],
]
const MINE = [
  ['A', 16, -1, 0], ['B', 18, 0, 1.4], ['C', 19, 0, 1.1],
  ['D', 20, 1, 0.9], ['E', 21, 2, 0.7], ['F', 22, 3, 0.55], ['G', 23, 4, 0.45],
]

/* ══ THE CAMERA ════════════════════════════════════════════════════════
 *
 * A list of shots. A shot holds on a section and drifts slowly across it; the
 * next shot's first `m` seconds are the move to it, half a cosine from wherever
 * the drift had got to, so the camera never stops dead. Scale changes (out to
 * the whole board and back) are eased in log scale.
 */
function shotAt(s, tt) {
  if (s.pan) return panAt(s, tt)
  const u = clamp01((tt - s.t0) / Math.max(0.001, s.t1 - s.t0))
  return { x: lerp(s.x0, s.x1, u), y: lerp(s.y0, s.y1, u), z: Math.exp(lerp(Math.log(s.z0), Math.log(s.z1), u)) }
}
function camera(shots, tt, whip = null) {
  let i = 0
  while (i + 1 < shots.length && shots[i + 1].t0 <= tt) i++
  const s = shots[i]
  const b = shotAt(s, tt)
  if (i === 0 || tt >= s.t0 + s.m) return b
  const a = shotAt(shots[i - 1], tt)
  const q = (tt - s.t0) / s.m
  // A whip only between two holds; into and out of the wide shots the camera eases as it always has.
  if (whip && s.pan && shots[i - 1].pan) return whip(a, b, q)
  const u = easeCamera(q)
  return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), u)) }
}

/* ══ THE PANNING TESTS ═════════════════════════════════════════════════
 *
 * 2026-09-28: each section five times the sheets at the same size, the camera
 * arriving on its middle and panning slowly across it while the line is sung,
 * and the moves between sections fast enough to disorient. Five readings of
 * that, side by side on /music-videos/conman (0:23–0:45: A, B, C, D).
 *
 * A pan shot sits at the section's middle until `go`, then travels `D`
 * (world units) along a curve bowed `bend` of its length to one side, its
 * speed eased up from rest over the first fifth. Past its end it keeps going
 * at the speed it had, so a whip that leaves from it leaves moving.
 */
function panAt(s, tt) {
  const span = Math.max(0.001, s.t1 - s.go)
  const u = Math.max(0, (tt - s.go) / span)
  const A = 0.2
  const g = (u < A ? (u * u) / (2 * A) : u - A / 2) / (1 - A / 2)
  const bow = s.bend * Math.sin(Math.PI * Math.min(u, 1))
  return { x: s.cx + s.D[0] * g - s.D[1] * bow, y: s.cy + s.D[1] * g + s.D[0] * bow, z: s.z }
}
/** A move whose speed is all in its middle: the ends almost still, the middle a blur. */
const whipCurve = (k) => (q) => (Math.tanh(k * (clamp01(q) - 0.5)) / Math.tanh(k / 2) + 1) / 2
/** A spring let go: past the mark and back, settled by the end. */
function springCurve(q) {
  const zeta = 0.42
  const w = 11
  const wd = w * Math.sqrt(1 - zeta * zeta)
  const y = (x) => 1 - Math.exp(-zeta * w * x) * (Math.cos(wd * x) + (zeta * w / wd) * Math.sin(wd * x))
  const e = 1 - y(1)
  const x = clamp01(q)
  return y(x) + e * x
}
const WHIPS = {
  smooth: (m) => (a, b, q) => {
    const u = whipCurve(6)(q)
    return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: b.z }
  },
  spring: (m) => (a, b, q) => {
    const u = springCurve(q)
    return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: b.z }
  },
  // Rolled over and back as it goes, the way a head turns too fast.
  roll: (m, cam) => (a, b, q) => {
    const u = whipCurve(9)(q)
    const side = Math.sign((b.x - a.x) || 1) * (Math.abs(b.y - a.y) > Math.abs(b.x - a.x) ? -1 : 1)
    return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: b.z, rot: side * cam.roll * Math.sin(Math.PI * clamp01(q)) ** 1.5 }
  },
  // Yanked back off the board and dropped onto the next section.
  dip: (m, cam) => (a, b, q) => {
    const u = whipCurve(5)(q)
    const lz = lerp(Math.log(a.z), Math.log(b.z), u) - Math.log(b.z / cam.dipTo) * Math.sin(Math.PI * clamp01(q)) ** 0.8
    return { x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), z: Math.exp(lz) }
  },
}

/* ══ THE PLAN ══════════════════════════════════════════════════════════ */
const plans = new Map()
function planFor(score, film) {
  const key = `${score.title}:${film.key}`
  if (plans.has(key)) return plans.get(key)
  const { SECTION, sections: BOARD, W: BOARD_W, wideCam: WIDE_CAM } = film.G
  const pan = film.camera
  const lines = score.lines
  const sec = (id) => score.sections.find((s) => s.id === id)
  const phase = score.beatPhase ?? 0.31
  const eighth = (tt) => phase + Math.round((tt - phase) / (BEAT / 2)) * (BEAT / 2)
  const brk = sec('break')
  const v4 = sec('verse-4')
  const outro = sec('outro')
  const endAt = score.endCardAt ?? score.duration

  /* ── The shots ───────────────────────────────────────────────────── */
  const shots = []
  /*
   * A pan across a section, from its middle: `speed` world units a second for
   * as long as the shot holds, but never so far the next section shows. Towards
   * the next section where there is room, or else along the section's longer
   * way; otherwise a direction of its own.
   */
  const panShot = (S, s, next, go) => {
    const roomX = Math.max(0, S.w / 2 - PLATE.w / 2 / HOLD_Z - 12)
    const roomY = Math.max(0, S.h / 2 - PLATE.h / 2 / HOLD_Z - 12)
    const N = next?.kind === 'hold' ? SECTION[next.id] : null
    let dir
    if (pan.toward && N) {
      const want = [Math.sign(N.cx - S.cx), Math.sign(N.cy - S.cy)]
      const room = want[0] ? roomX : roomY
      dir = room > 0.3 * Math.max(roomX, roomY) ? want : roomX >= roomY ? [want[0] || (s.k % 2 ? -1 : 1), 0] : [0, want[1] || 1]
    }
    else {
      const a = hash(s.k, 5, 41) * Math.PI * 2
      dir = [Math.cos(a), Math.sin(a) * (roomY / Math.max(1, roomX))]
    }
    const len = Math.hypot(dir[0], dir[1]) || 1
    dir = [dir[0] / len, dir[1] / len]
    const reach = Math.min(dir[0] ? roomX / Math.abs(dir[0]) : Infinity, dir[1] ? roomY / Math.abs(dir[1]) : Infinity) * (1 - Math.abs(pan.bend) * 1.2)
    const dist = Math.min(pan.speed * Math.max(0, s.t1 - go), reach)
    return { pan: true, go, cx: S.cx, cy: S.cy, z: HOLD_Z, D: [dir[0] * dist, dir[1] * dist], bend: pan.bend * (s.k % 2 ? -1 : 1) }
  }
  const hold = (id, t0, m, k, board) => shots.push({ t0, m, id, k, board, kind: 'hold' })
  const wide = (t0, m, dir) => shots.push({ t0, m, kind: 'wide', x0: BOARD_W / 2 - dir * 40, x1: BOARD_W / 2 + dir * 40, y0: WIDE_CAM.y, y1: WIDE_CAM.y, z0: WIDE_CAM.z, z1: WIDE_CAM.z * 1.01 })
  const move = pan ? pan.move : MOVE
  const arriveBy = (li) => lines[li].start - 0.15 - move
  THEIRS.forEach(([id, li], k) => hold(id, k === 0 ? 0 : arriveBy(li), k === 0 ? 0 : move, k, 'old'))
  wide(brk.from - 0.7, 2.4, 1)
  MINE.forEach(([id, li], k) => (k === 0 ? hold(id, v4.from - 1.0, 1.25, 20, 'mine') : hold(id, arriveBy(li), move, 20 + k, 'mine')))
  wide(outro.from - 0.2, 2.0, -1)
  shots.sort((a, b) => a.t0 - b.t0)
  for (let i = 0; i < shots.length; i++) shots[i].t1 = i + 1 < shots.length ? shots[i + 1].t0 : score.duration + 1
  // A hold's drift is sized to its own length: slow, alternate ways, never past the section's edge.
  for (let i = 0; i < shots.length; i++) {
    const s = shots[i]
    if (s.kind !== 'hold') continue
    const S = SECTION[s.id]
    if (pan) {
      Object.assign(s, panShot(S, s, shots[i + 1], i === 0 ? lines[0].start - 0.15 : s.t0 + s.m))
      continue
    }
    const dur = s.t1 - s.t0
    const dir = s.k % 2 ? -1 : 1
    const dx = Math.min(24, dur * 2.2) * dir
    const dy = Math.min(9, dur * 0.8) * (hash(s.k, 3, 17) < 0.5 ? -1 : 1)
    Object.assign(s, { x0: S.cx - dx, x1: S.cx + dx, y0: S.cy - dy, y1: S.cy + dy, z0: HOLD_Z, z1: HOLD_Z })
  }
  const whip = pan ? WHIPS[pan.whip](pan.move, pan) : null
  const camAt = (tt) => camera(shots, tt, whip)
  const holdOf = (board, k) => shots.find((s) => s.kind === 'hold' && s.board === board && s.k === k)

  /* ── The sheet eased away: the frame is the whole board's only in the break and at the end ── */
  const wideAt = (tt) => Math.max(
    easeCamera(ramp(tt, brk.from, brk.from + 1.8)) * (1 - easeCamera(ramp(tt, v4.from - 1.5, v4.from - 0.05))),
    easeCamera(ramp(tt, outro.from, outro.from + 1.7)),
  )

  /* ── What is in view, in world units ─────────────────────────────── */
  const inView = (S, c, cam, pad = 0) => {
    const F = FORMATS[S.format]
    const hw = PLATE.w / 2 / cam.z
    const hh = PLATE.h / 2 / cam.z
    const x0 = S.x0 + c.x * S.k
    const y0 = S.y0 + c.y * S.k
    const x1 = x0 + F.cell.w * S.k
    const y1 = y0 + F.cell.h * S.k
    return x0 >= cam.x - hw + pad && x1 <= cam.x + hw - pad && y0 >= cam.y - hh - F.cell.h * S.k * 0.1 && y1 <= cam.y + hh + F.cell.h * S.k * 0.15
  }
  const touches = (S, c, cam) => {
    const F = FORMATS[S.format]
    const hw = PLATE.w / 2 / cam.z + 40
    const hh = PLATE.h / 2 / cam.z + 40
    const x0 = S.x0 + c.x * S.k
    const y0 = S.y0 + c.y * S.k
    return x0 < cam.x + hw && x0 + F.cell.w * S.k > cam.x - hw && y0 < cam.y + hh && y0 + F.cell.h * S.k > cam.y - hh
  }

  /* ── The tears on the words ─────────────────────────────────────── */
  const words = lines.flatMap((l) => l.words.map((w) => w.t))
  const snap = (tt, win = 0.32) => {
    let best = null
    for (const w of words) if (Math.abs(w - tt) <= win && (best == null || Math.abs(w - tt) < Math.abs(best - tt))) best = w
    return best ?? eighth(tt)
  }
  const book = { old: new Map(), mine: new Map() }
  const add = (board, c, t, i) => {
    const m = book[board]
    if (!m.has(c.key)) m.set(c.key, [])
    m.get(c.key).push({ t, i })
  }
  const used = { old: new Map(), mine: new Map() }
  const stOf = (board, c) => {
    if (!used[board].has(c.key)) used[board].set(c.key, { used: new Set(), last: -9, done: false })
    return used[board].get(c.key)
  }
  /** Tear one piece off a sheet: the biggest this moment allows of those still on it. */
  const tearOne = (board, c, t, maxSize, small = false) => {
    const F = FORMATS[c.S.format]
    const st = stOf(board, c)
    if (st.done) return false
    const layout = F.layouts[c.layout]
    let pick = -1
    let pickSize = -1
    layout.forEach((pc, i) => {
      if (st.used.has(i) || pc.size > maxSize) return
      if (pc.whole && (small || st.used.size < 1)) return
      const sz = pc.size + hash(i, c.col + c.row * 31, 5) * 0.4
      if (sz > pickSize) { pickSize = sz; pick = i }
    })
    if (pick < 0) return false
    st.used.add(pick)
    st.last = t
    if (layout[pick].whole) st.done = true
    add(board, c, t, pick)
    return true
  }
  let focus = 0
  const wants = [] // { t, board, S, maxSize, count }
  const holdWants = (list, board) => list.forEach(([id, li, s0, g0], k) => {
    if (s0 < 0) return
    const sh = holdOf(board, board === 'old' ? k : 20 + k)
    const next = list[k + 1]
    const s1 = next ? Math.max(next[2], s0) : Math.min(4, s0 + 1)
    const g1 = next ? next[3] : g0 * 0.85
    const from = lines[li].words[1]?.t ?? lines[li].start + 0.4
    const to = sh.t1 - 0.25
    let tt = from
    while (tt < to) {
      const q = clamp01((tt - from) / Math.max(0.001, to - from))
      const at = snap(tt)
      const size = Math.round(lerp(s0, s1, q))
      wants.push({ t: at, board, S: SECTION[id], maxSize: size, count: 1 + (q > 0.8 && size >= 3 ? 1 : 0), small: board === 'mine' && s0 === 0 })
      tt = Math.max(at, tt) + lerp(g0, g1, q)
    }
  })
  holdWants(THEIRS, 'old')
  holdWants(MINE, 'mine')
  // "Until the Earth shook": everything in view goes at once.
  const shook = lines[6]?.words.find((w) => /shook/i.test(w.text))
  if (shook) wants.push({ t: shook.t, board: 'old', S: SECTION.G, maxSize: 4, count: 8 })
  wants.sort((a, b) => a.t - b.t)
  for (const wt of wants) {
    const cam = camAt(wt.t)
    const hw = PLATE.w / 2 / cam.z
    const hh = PLATE.h / 2 / cam.z
    for (let n = 0; n < wt.count; n++) {
      focus += 0.618
      const fx = cam.x + Math.sin(focus * 2.4) * hw * 0.55
      const fy = cam.y + Math.cos(focus * 3.1) * hh * 0.45
      let best = null
      let bestScore = Infinity
      for (const c of cellsOf(wt.S)) {
        if (!inView(wt.S, c, cam, 12)) continue
        const st = stOf(wt.board, c)
        if (st.done || wt.t - st.last < 0.9) continue
        const F = FORMATS[wt.S.format]
        const cx = wt.S.x0 + (c.x + F.cell.w / 2) * wt.S.k
        const cy = wt.S.y0 + (c.y + F.cell.h / 2) * wt.S.k
        const sc = Math.hypot(cx - fx, cy - fy) + hash(c.col, c.row, Math.round(wt.t * 100)) * 140
        if (sc < bestScore) { bestScore = sc; best = c }
      }
      if (best) tearOne(wt.board, best, wt.t, wt.maxSize, wt.small)
    }
  }

  /* ── The break: their board torn off, down to the black ──────────── */
  const B0 = brk.from + 1.6
  const B1 = brk.to - 6.5
  const all = BOARD.flatMap((S) => cellsOf(S))
  const order = all.map((c) => ({ c, u: hash(c.col * 13 + c.S.at[0], c.row * 7 + c.S.at[1], 77) })).sort((a, b) => a.u - b.u).map((o) => o.c)
  const lastIn = new Map()
  order.forEach((c, j) => {
    // Density climbing through the break: the j-th sheet at B0 + D·√(j/N).
    let tt = eighth(B0 + (B1 - B0) * Math.sqrt((j + 0.5) / order.length))
    const st = stOf('old', c)
    if (!st.done) {
      const layout = FORMATS[c.S.format].layouts[c.layout]
      if (hash(c.col, c.row, 91) < 0.7 && tearOne('old', c, tt, 3)) tt = eighth(tt + BEAT * (0.5 + hash(c.col, c.row, 9) * 1.5))
      const w = layout.findIndex((pc) => pc.whole)
      st.used.add(w)
      st.done = true
      add('old', c, tt, w)
    }
    lastIn.set(c.S.id, Math.max(lastIn.get(c.S.id) ?? 0, tt))
  })
  // The paper backings, once their sheets are off: in big pieces, the last one the rest of it.
  const grounds = new Map()
  for (const S of BOARD) {
    if (FORMATS[S.format].ground === INK) continue
    let tt = eighth((lastIn.get(S.id) ?? B1) + 0.5)
    grounds.set(S.id, groundLayout(S).map((pc, i) => {
      const at = tt
      tt = eighth(tt + BEAT * 0.75)
      return { t: at, i }
    }))
  }
  const oldGone = Math.max(...[...book.old.values()].flat().map((e) => e.t), ...[...grounds.values()].flat().map((e) => e.t)) + 2.5

  /* ── The last verse: my board, pasted up out of their scraps ─────── */
  // A's sheets one after another, faster and faster; each laid scrap by scrap, then pulled in red.
  const build = new Map()
  const aCells = cellsOf(SECTION.A).map((c) => ({ c, u: hash(c.col + 5, c.row + 11, 303) })).sort((a, b) => a.u - b.u).map((o) => o.c)
  const P0 = v4.from
  const P1 = v4.from + 4.6
  aCells.forEach((c, j) => {
    const start = P0 + (P1 - P0) * Math.sqrt(j / aCells.length)
    const lay = Array.from({ length: SCRAPS }, (_, k) => start + k * (0.1 + 0.05 * hash(j, k, 7)))
    build.set(c.key, { lay, print: lay[SCRAPS - 1] + SCRAP_FLIGHT + 0.18 })
  })
  // Everything else is up before the camera leaves A.
  const builtAt = P1 + 1.2

  // Being taken from, all over, where the camera is not looking: slow, then everywhere.
  const T0 = lines[18].start
  for (const c of all) {
    const u = hash(c.col + 71, c.row + 3, c.S.at[0] * 5 + c.S.at[1] * 11)
    const n = u < 0.1 ? 3 : u < 0.28 ? 2 : u < 0.55 ? 1 : 0
    const times = []
    for (let k = 0; k < n; k++) times.push(T0 + (endAt - 0.2 - T0) * hash(c.col, c.row + k * 17, 505) ** 0.35)
    // And a last burst in the wide, so pieces are still in the air when the end card cuts in.
    if (hash(c.col, c.row, 606) < 0.2) times.push(lerp(outro.from + 1.2, endAt - 0.1, hash(c.row, c.col, 607)))
    times.sort((a, b) => a - b)
    for (const t0 of times) {
      const t = eighth(t0)
      if (t < outro.from && touches(c.S, c, camAt(t))) continue
      const st = stOf('mine', c)
      if (t - st.last < 0.9) continue
      tearOne('mine', c, t, t > outro.from ? 4 : 3)
    }
  }

  // Shakes: the Earth, hard; the ground splitting, less.
  const hits = []
  if (shook) hits.push({ t: shook.t, a: 26 })
  const ground = lines[17]?.words.find((w) => /ground/i.test(w.text))
  if (ground) hits.push({ t: ground.t, a: 12 })

  const plan = { shots, camAt, wideAt, book, grounds, oldGone, build, builtAt, hits, endAt, mineFrom: v4.from - 1.0 }
  plans.set(score.title, plan)
  return plan
}

function shakeAt(plan, tt) {
  let x = 0
  let y = 0
  for (const h of plan.hits) {
    const d = tt - h.t
    if (d < 0 || d > 1.4) continue
    const k = h.a * Math.exp(-d / 0.28)
    x += k * Math.sin(d * 41 + h.t)
    y += k * 0.7 * Math.cos(d * 33 + h.t * 2)
  }
  return [x, y]
}

const outAt = (evs, now) => {
  const out = []
  for (const e of evs ?? []) if (e.t <= now) out.push({ i: e.i, tau: now - e.t })
  return out
}

/** The board's state at `now`, in the terms boardSvg reads. */
function stateAt(plan, now, mine) {
  if (!mine) {
    return {
      cell: (c) => {
        const out = outAt(plan.book.old.get(c.key), now)
        return out.length ? { out } : null
      },
      ground: (S) => outAt(plan.grounds.get(S.id), now),
    }
  }
  return {
    cell: (c) => {
      const b = plan.build.get(c.key)
      if (b) {
        if (now < b.lay[0]) return { built: 0 }
        if (now < b.print + PULL) return { lay: b.lay.map((t) => now - t), print: now - b.print }
      }
      else if (now < plan.builtAt) return { built: 0 }
      const out = outAt(plan.book.mine.get(c.key), now)
      return out.length ? { out } : null
    },
  }
}

/* ══ THE FRAME ═════════════════════════════════════════════════════════
 *
 * The defs are most of a frame (every print, portrait, collage and pattern)
 * and hardly any of them change from one frame to the next, so they are not
 * in `svg`: they come back as `lib`, chunks that only ever grow, one chunk for
 * whatever a frame needed that no earlier frame of this uid had.
 * MusicVideoSvgFilm mounts each chunk once; a tool that draws a frame on its
 * own puts `lib` in front of `svg`. Re-parsing them every frame held my board
 * at 15 frames a second where the picture needed 60.
 */
const libs = new Map()
function libFor(uid) {
  if (!libs.has(uid)) libs.set(uid, { ids: new Set(), chunks: [], list: [] })
  return libs.get(uid)
}
function grow(lib, sink) {
  let chunk = ''
  for (const [id, d] of sink) {
    if (lib.ids.has(id)) continue
    lib.ids.add(id)
    chunk += d
  }
  if (chunk) {
    lib.chunks.push(`<defs>${chunk}</defs>`)
    lib.list = [...lib.chunks]
  }
  return lib.list
}

/**
 * The film, on a board of sections `span` plates in size, walked by `camera`
 * (null: the film's own drift and moves; or a pan, as in PANS below).
 */
export function makeBoardFilm({ key = 'film', span = [1, 1], camera: cam = null } = {}) {
  const film = { key, G: layBoard(span), camera: cam }
  return (args) => filmFrame(film, args)
}

function filmFrame(film, { time, score, lockup = '', uid = 'cb' }) {
  const now = time
  const plan = planFor(score, film)
  // The lib stays mounted under the end card, or scrubbing back from it would parse all of it again at once.
  if (now >= plan.endAt) return { ...endCard({ now, from: plan.endAt, lockup }), lib: libFor(uid).list }
  const section = sectionAt(score, now)
  const active = lineAt(score, now)
  const cam0 = plan.camAt(now)
  const [qx, qy] = shakeAt(plan, now)
  const cam = { x: cam0.x - qx / cam0.z, y: cam0.y - qy / cam0.z, z: cam0.z, rot: cam0.rot ?? 0 }
  // A motion blur, if this camera has one: how far the board moves across the frame in a sixtieth of a second, halved.
  let blur = null
  if (film.camera?.blur) {
    const h = 1 / 120
    const a = plan.camAt(now - h)
    const b = plan.camAt(now + h)
    const k = film.camera.blur * cam.z / 60 / (2 * h)
    blur = [Math.min(30, Math.abs(b.x - a.x) * k), Math.min(30, Math.abs(b.y - a.y) * k)]
  }
  const k = plan.wideAt(now)
  const port = k <= 0 ? PLATE : { x: lerp(PLATE.x, FULL_FRAME.x, k), y: lerp(PLATE.y, FULL_FRAME.y, k), w: lerp(PLATE.w, FULL_FRAME.w, k), h: lerp(PLATE.h, FULL_FRAME.h, k) }
  const mine = now >= plan.mineFrom
  const sink = new Map()
  const board = mine || now < plan.oldGone ? boardSvg({ uid, cam, port, board: mine ? 'mine' : 'old', state: stateAt(plan, now, mine), scraps: 'mix', sink, sections: film.G.sections, blur })
    : `<rect x="${r(port.x, 2)}" y="${r(port.y, 2)}" width="${r(port.w, 2)}" height="${r(port.h, 2)}" fill="${INK}"/>`
  const margin = (now < OPENING_UNTIL ? opening({ now, title: score.title, track: 2, out: [0, 0], uid, sheet: COVER_SHEET, intro: 'stamp' }) : '') + marginLyric({ now, score, uid, sheet: COVER_SHEET })
  const svg = [paper(COVER_SHEET), board, margin].join('\n')
  return { svg, label: active?.text ?? section.label, lib: grow(libFor(uid), sink) }
}

/** The film as it runs on the page: sections a plate each, the camera drifting and easing between them. */
export const boardFrame = makeBoardFilm()

/*
 * The five panning tests. `move` is the whip's length in seconds, `speed` the
 * pan's in world units a second (a plate is 1532 across), `bend` how far the
 * pan bows to one side, `toward` whether it heads for the next section.
 */
const ROOT5 = Math.sqrt(5)
export const PANS = [
  { key: 'pan-1', span: [ROOT5, ROOT5], camera: { whip: 'smooth', move: 0.55, speed: 150, bend: 0, toward: true } },
  { key: 'pan-2', span: [ROOT5, ROOT5], camera: { whip: 'spring', move: 0.85, speed: 150, bend: 0.18, toward: false } },
  { key: 'pan-3', span: [ROOT5, ROOT5], camera: { whip: 'roll', move: 0.5, speed: 150, bend: 0, toward: true, roll: 14, blur: 0.9 } },
  { key: 'pan-4', span: [5, 1], camera: { whip: 'smooth', move: 0.6, speed: 260, bend: 0, toward: true } },
  { key: 'pan-5', span: [ROOT5, ROOT5], camera: { whip: 'dip', move: 0.8, speed: 150, bend: 0.1, toward: false, dipTo: 0.32 } },
].map((p) => ({ ...p, frame: makeBoardFilm(p) }))
/* By name, for the tools' registries. */
export const [boardPan1, boardPan2, boardPan3, boardPan4, boardPan5] = PANS.map((p) => p.frame)

/** Where each hold's own ten seconds are, for the page's section list: `board` 'old' or 'mine', `id` the section. */
export function boardWindow(score, board, id) {
  const list = board === 'old' ? THEIRS : MINE
  const h = list.find((x) => x[0] === id)
  if (!h) return null
  const line = score.lines[h[1]]
  return { from: Math.round((line.start - 1.6) * 10) / 10, to: Math.round((line.start + 8.4) * 10) / 10 }
}

/** The plan, for tools. */
export const boardPlan = (score, film = { key: 'film', G: layBoard(), camera: null }) => planFor(score, film)
