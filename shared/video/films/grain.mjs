/*
 * New York · Against the Grain — the film (v2, 2026-11-23).
 *
 * The user (2026-11-23): "I like the main idea, but it needs something more
 * engaging/more progression. Get rid of the sun and any yellow elements. I
 * just want arrows all of the same size (with one bold red arrow) doing
 * different things that represent going against the grain, sometimes falling
 * inline, being ridiculed, persevering, etc. I don't want a crowd to follow
 * until the end. Also, the whole board should move or 'pulse' with the beat
 * of the song. I want some of the arrows to turn red at some points. Some can
 * stay red, others turn back to black and follow the crowd. Be bold!"
 *
 * Seen from above: a crowd of identical ink arrows marching right, a step on
 * every beat of the click, and the whole board pulsing with the beat (harder
 * on the downbeat). One arrow, the same size but bold and red, faces the other
 * way from the first frame and pushes upstream through all of it.
 *
 *   Intro       The march. He holds against it.
 *   Verse 1     Ridiculed: on "They say" the ones round him turn, point and
 *               wag; on "That easy dreams" a wider circle of them, jabbing on
 *               the words.
 *   Chorus 1    On "don't" one beside him turns red and faces his way; on the
 *               second "don't" another. Three of them, upstream.
 *   Break       The crowd mocks the second one until it gives in: black again,
 *               turned round, swept away (falling in line).
 *   Verse 2     The crowd swings five ways, one per city, and shoves; it
 *               points at the first ally on "That the only way"; four ranks
 *               ram them on "bargain, bend, abandon, exploit", and on
 *               "abandon" the ally does. He is alone.
 *   Chorus 2    On each "don't" arrows far from him turn red on their own,
 *               five of them. The crowd mocks two: one holds, one gives in.
 *   No          A ring from him on every "No", and on each of the first four
 *               another arrow somewhere turns red. "New York": the crowd surges.
 *   Instr.      The crowd fights back: on every bar a rank charges into one
 *               of the reds. Six of them give in; he is driven back across
 *               the plate, shaking, never turning. Two others hold.
 *   Chorus 3    He pushes off again, harder. On "don't" the two who held come
 *               to him; on the second "don't" five more turn red beside them
 *               and stay: a small red flight. The crowd mocks them; nobody
 *               cares.
 *   New York    Only now does the crowd follow. Every "No" is a ring, and
 *               every arrow it reaches turns round to face his way. The crowd
 *               slows, stops dead with the band, and on the held "York" the
 *               last ring takes everyone: the whole crowd marches his way,
 *               parting ahead of the reds into one great arrowhead with them
 *               at its tip, and the camera pulls back to see all of it.
 *
 * No yellow, no light, no sun: paper, ink and red. Every arrow is the same
 * size; his is bold.
 *
 * HOW IT IS BUILT
 *
 * A pure function of the clock. The crowd is an endless lattice sliding by
 * D(t), the click-stepped flow integrated once into a table. Everything else
 * is a field laid over it, in closed form, per arrow, per frame: ranks
 * (compression waves), ridicule (point at a target, wag, lean in, jab on the
 * words), the coda's turning rings and the arrowhead, and room round every
 * red (no arrow ever overlaps one). A red is a lattice arrow taken out of the
 * lattice at its moment (`ACTORS`): it stands its ground, joins him, is shoved,
 * and maybe gives in, when it turns back black and is carried off as a free
 * arrow with the flow. Planned once per score (`planFor`).
 *
 * Notes: docs/visualizers/new-york.md.
 */
import { clamp01, easeOut, easeInOut, lerp, ramp } from '../kit.mjs'
import { COVER_SHEET, INK, PAPER, RED, paper, marginLyric } from '../album.mjs'
import { filmOpening, inOpening } from '../opening.mjs'
import { endCard } from '../ending.mjs'

const { x: PX, y: PY, w: PW, h: PH } = COVER_SHEET.plate
const CX = PX + PW / 2
const CY = PY + PH / 2
const TAU = Math.PI * 2

/* ── Arrows ───────────────────────────────────────────────────────── */

/** Every arrow: half its length, and its head. His is the same, only bold. */
const AL = 15
const AH = 9
const AW = 6.5
const W_INK = 3
const W_HIM = 6.4

/** The lattice: spacing, and the tile it repeats in (wider than the pulled-back view). */
const SX = 58
const SY = 50
const NX = 66
const NY = 46
const WX = NX * SX
const WY = NY * SY

const hash = (i, j, k = 0) => {
  let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(k + 1, 1274126177)) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}
const smooth = (x) => { const u = clamp01(x); return u * u * (3 - 2 * u) }
const wrap = (v, c, W) => { const a = c - W / 2; return a + ((((v - a) % W) + W) % W) }
const BASE = Array.from({ length: NX * NY }, (_, id) => {
  const i = id % NX
  const j = (id - i) / NX
  return {
    x: i * SX + (j & 1 ? SX / 2 : 0) + (hash(i, j, 1) - 0.5) * 14,
    y: j * SY + (hash(i, j, 2) - 0.5) * 12,
    n: (hash(i, j, 3) - 0.5) * 0.16,
    ph: hash(i, j, 4) * TAU,
  }
})

/* ── The flow ─────────────────────────────────────────────────────── */

const DT = 1 / 120
/** Piecewise-linear keys [[t, v], …] at t. */
function keyed(keys, t) {
  if (t <= keys[0][0]) return keys[0][1]
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1]
      const [t1, v1] = keys[i]
      return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0)
    }
  }
  return keys.at(-1)[1]
}
const table = (T, t) => {
  const f = t / DT
  const i = Math.max(0, Math.min(T.length - 2, Math.floor(f)))
  return T[i] + (T[i + 1] - T[i]) * (f - i)
}

/* ── The plan, from the score ─────────────────────────────────────── */

const clean = (s) => s.toLowerCase().replace(/[^a-z']/g, '')
const plans = new WeakMap()
function planFor(score) {
  let p = plans.get(score)
  if (!p) { p = build(score); plans.set(score, p) }
  return p
}

function build(score) {
  const L = score.lines
  const beat = 60 / score.bpm
  const phase = score.beatPhase
  /** The k-th sung `word` of line `li`. */
  const w = (li, word, k = 0) => {
    const hits = L[li].words.filter((x) => clean(x.text) === word)
    if (!hits[k]) throw new Error(`grain: no "${word}" #${k} in line ${li}`)
    return hits[k].t
  }
  const nos = (li) => L[li].words.filter((x) => clean(x.text) === 'no').map((x) => x.t)
  const downbeatsIn = (a, b) => {
    const out = []
    for (let k = Math.ceil((a - phase) / beat); phase + k * beat < b; k++) if (k % 4 === 0) out.push(phase + k * beat)
    return out
  }

  const T = {
    dont1: w(2, "don't"), dont2: w(3, "don't"),
    they2: L[4].start, cities: [w(4, 'memphis'), w(4, 'nashville'), w(4, 'austin'), w(4, 'la'), w(4, 'detroit')],
    only: L[5].start, bargain: w(5, 'bargain'), bend: w(5, 'bend'), abandon: w(5, 'abandon'), exploit: w(5, 'exploit'),
    dont3: w(6, "don't"), dont4: w(7, "don't"),
    nos1: nos(8), no1b: L[9].words[0].t, ny1: w(9, 'new'), york1: w(9, 'york'),
    instr: score.sections.find((s) => s.id === 'break-2'),
    dont5: w(10, "don't"), dont6: w(11, "don't"),
    nos2: [...nos(12), ...nos(13), ...nos(14), L[15].words[0].t],
    stop: 193.7, back: 195.0, york: w(15, 'york'), end: score.endCardAt ?? score.duration,
  }
  T.c0 = T.nos2[0]
  T.turnAll = T.york
  T.rev = T.york + 0.8

  /* The flow: how fast the crowd marches (px/s on the sheet), stepped on the click. */
  const SPEED = [
    [0, 55], [38, 55], [39.5, 66], [57, 66], [58, 58], [68.4, 58], [69, 46], [87, 46], [88, 64], [108, 70],
    [T.ny1, 70], [T.ny1 + 0.25, 150], [T.york1 + 1.6, 90], [T.instr.from, 112], [T.instr.to - 4, 112], [T.instr.to, 64],
    [176.4, 60], [184.5, 0], [T.rev, 0], [T.rev + 1.5, -45], [T.rev + 4, -78], [T.end + 1, -78],
  ]
  /* Its direction: right, except in verse 2, where it swings once per city. */
  const SWING = [0.85, -0.75, 0.55, -0.62, 0.35]
  const angleAt = (t) => {
    let a = 0
    T.cities.forEach((tc, k) => { if (t >= tc) a = lerp(a, SWING[k], easeInOut(clamp01((t - tc) / 0.32))) })
    return a * (1 - easeInOut(clamp01((t - (T.cities[4] + 1.6)) / 1.4)))
  }
  const step = (t) => {
    if (t >= T.stop && t < T.back) return 0
    const u = ((((t - phase) / beat) % 1) + 1) % 1
    return 1 + 0.9 * Math.cos(TAU * (u - 0.16))
  }
  const N = Math.ceil((score.duration + 2) / DT)
  const Dx = new Float64Array(N)
  const Dy = new Float64Array(N)
  for (let k = 1; k < N; k++) {
    const t = (k - 0.5) * DT
    const v = keyed(SPEED, t) * step(t)
    const a = angleAt(t)
    Dx[k] = Dx[k - 1] + v * Math.cos(a) * DT
    Dy[k] = Dy[k - 1] + v * Math.sin(a) * DT
  }

  const pl = { T, beat, phase, Dx, Dy, angleAt, speed: (t) => keyed(SPEED, t) }
  pl.D = (t) => [table(Dx, t), table(Dy, t)]

  /* ── Ranks: compression waves that ram a red (by id) on a word or a downbeat. ── */
  const ranks = [
    { t: T.bargain, target: 'him', s: 150, a: 1 },
    { t: T.bend, target: 'A', s: 150, a: 1 },
    { t: T.abandon, target: 'A', s: 150, a: 1 },
    { t: T.exploit, target: 'him', s: 170, a: 1 },
  ]
  const bars = downbeatsIn(T.instr.from + 1.8, T.instr.to - 3.5)
  // Who each bar of the instrumental rams. The ones marked "gives" give in.
  const INSTR = ['N1', 'him', 'F', 'N2', 'him', 'C', 'G', 'him', 'N3', 'E', 'N4', 'him', 'him']
  bars.forEach((t, k) => ranks.push({ t, target: INSTR[k % INSTR.length], s: 210, a: 1, big: k >= bars.length - 3 }))
  pl.ranks = ranks
  pl.bars = bars

  /* ── Ridicule: the crowd round a red turns to point at it and wags. ── */
  const wordsIn = (a, b) => L.flatMap((l) => l.words.map((x) => x.t)).filter((t) => t >= a && t <= b)
  const jeer = (target, from, to, R) => ({ target, from, to, R, jabs: wordsIn(from, to) })
  pl.jeers = [
    jeer('him', L[0].start - 0.2, L[0].end + 0.8, 190),
    jeer('him', L[1].start - 0.2, L[1].end + 0.8, 290),
    jeer('B', 57.8, 63.0, 190),
    jeer('him', T.they2 - 0.1, T.cities[0] - 0.05, 250),
    jeer('A', T.only - 0.1, T.bargain - 0.2, 200),
    jeer('C', 90.6, 96.4, 175),
    jeer('D', 99.6, 104.2, 175),
    jeer('him', 159.2, 164.6, 300),
  ]

  /* ── Him ── */
  // Where he means to be (his own progress); the ranks' pushes and kicks go on top.
  const HK = [
    [0, 1010, 432], [19.5, 1005, 432], [38.4, 990, 428], [57.6, 860, 420], [68.4, 845, 424], [81.2, 815, 426],
    [88, 815, 426], [106.5, 700, 418], [121.5, 640, 420], [T.instr.to + 0.3, 640, 420], [T.dont6 + 2, 470, 424],
    [176.4, 420, 426], [T.stop, 395, 426],
  ]
  const hk = (t) => {
    if (t <= HK[0][0]) return [HK[0][1], HK[0][2]]
    for (let i = 1; i < HK.length; i++) {
      if (t <= HK[i][0]) {
        const [t0, x0, y0] = HK[i - 1]
        const [t1, x1, y1] = HK[i]
        const u = easeInOut((t - t0) / (t1 - t0))
        return [lerp(x0, x1, u), lerp(y0, y1, u)]
      }
    }
    return [HK.at(-1)[1], HK.at(-1)[2]]
  }

  /* ── The reds: who turns, when, where, and what becomes of them. ── */
  // mode: 'hold' (stand its ground, edging upstream), 'beside' (with him, at `off`), 'free' (gave in).
  const N1 = T.nos1
  const ACTORS = [
    { id: 'A', at: T.dont1, near: [40, -62], rel: true, segs: [['beside', T.dont1, { off: [36, -SY] }], ['free', T.abandon + 0.15]] },
    { id: 'B', at: T.dont2, near: [40, 62], rel: true, segs: [['beside', T.dont2, { off: [36, SY] }], ['free', 63.0]] },
    { id: 'C', at: T.dont3, near: [380, 250], segs: [['hold', T.dont3], ['beside', T.dont5, { off: [50, -SY], join: 3.2 }]] },
    { id: 'D', at: T.dont3 + 0.2, near: [560, 650], segs: [['hold', T.dont3 + 0.2], ['free', 104.4]] },
    { id: 'E', at: T.dont3 + 0.4, near: [1350, 270], segs: [['hold', T.dont3 + 0.4], ['beside', T.dont5 + 0.3, { off: [50, SY], join: 3.4 }]] },
    { id: 'F', at: T.dont4, near: [240, 540], segs: [['hold', T.dont4]] },
    { id: 'G', at: T.dont4 + 0.25, near: [1180, 680], segs: [['hold', T.dont4 + 0.25]] },
    { id: 'N1', at: N1[0], near: [620, 160], segs: [['hold', N1[0]]] },
    { id: 'N2', at: N1[1], near: [980, 700], segs: [['hold', N1[1]]] },
    { id: 'N3', at: N1[2], near: [300, 330], segs: [['hold', N1[2]]] },
    { id: 'N4', at: N1[3], near: [1420, 520], segs: [['hold', N1[3]]] },
    ...[[100, -2 * SY], [100, 2 * SY], [104, 0], [156, -3 * SY], [156, 3 * SY]].map((off, k) => ({
      id: `I${k + 1}`, at: T.dont6 + 0.12 * k, near: [off[0] + 20, off[1] * 1.05], rel: true,
      segs: [['beside', T.dont6 + 0.12 * k, { off, join: 1.4 }]],
    })),
  ]
  // The instrumental's ranks take whoever they ram, except him, C and E: those hold.
  const KEEP = new Set(['him', 'C', 'E'])
  for (const r of ranks) {
    if (!(r.t > T.instr.from && !KEEP.has(r.target))) continue
    const a = ACTORS.find((x) => x.id === r.target)
    if (a && !a.segs.some(([m]) => m === 'free')) a.segs.push(['free', r.t + 0.5])
  }
  for (const a of ACTORS) {
    a.segs = a.segs.map(([mode, t, o = {}]) => ({ mode, t, join: 1.6, ...o }))
    a.end = a.segs.find((s) => s.mode === 'free')?.t ?? Infinity
    a.hits = ranks.filter((r) => r.target === a.id && r.t > a.at && r.t < a.end + 0.6)
  }
  pl.actors = ACTORS
  pl.byId = new Map(ACTORS.map((a) => [a.id, a]))

  // His hits: a kick back on each, and in the instrumental a push that stays.
  const hisHits = ranks.filter((r) => r.target === 'him')
  const PUSH = (r) => (r.t > T.instr.from ? (r.big ? 70 : 115) : 32)
  /*
   * Every red, and he, keeps to a line midway between two rows of the crowd
   * (the rows only ever move together), so no row ever runs through one of
   * them: the crowd always knows which side to pass on.
   */
  pl.snap = (y, t) => y + cmod(pl.D(t)[1] + SY / 2 - y, SY)
  const hisLine = pl.snap(HK[0][2], 0)
  pl.him = (t) => {
    let [x] = hk(Math.min(t, T.rev))
    let y = hisLine + pl.D(t)[1] - pl.D(0)[1]
    for (const r of hisHits) {
      if (t < r.t) break
      x += PUSH(r) * easeOut(clamp01((t - r.t) / 0.35))
    }
    // The cities tug him their way.
    T.cities.forEach((tc, k) => {
      const u = t - tc
      if (u > 0 && u < 2) x += 22 * kick(u, 0.45) * Math.cos(SWING[k])
    })
    for (const r of hisHits) x += 26 * kick(t - r.t, 0.32)
    // A lunge on every No.
    for (const n of [...T.nos1, T.no1b, ...T.nos2]) x -= 16 * kick(t - n, 0.25)
    // Jostled when mocked.
    for (const j of pl.jeers) if (j.target === 'him') for (const jt of j.jabs) y += 5 * kick(t - jt, 0.2) * (hash(Math.round(jt * 100), 7) - 0.5) * 2
    // From the turn on, he marches with everyone.
    if (t > T.rev) x += pl.D(t)[0] - pl.D(T.rev)[0]
    return [x, y]
  }
  pl.hisHits = hisHits

  /* Where each red starts: the lattice arrow nearest its mark at that moment. */
  const used = new Set()
  for (const a of ACTORS) {
    const [hx, hy] = pl.him(a.at)
    const want = a.rel ? [hx + a.near[0], hy + a.near[1]] : a.near
    const [dx, dy] = pl.D(a.at)
    let best = -1
    let bd = Infinity
    for (let id = 0; id < BASE.length; id++) {
      if (used.has(id)) continue
      const x = wrap(BASE[id].x + dx, CX, WX)
      const y = wrap(BASE[id].y + dy, CY, WY)
      const d = Math.hypot(x - want[0], y - want[1])
      if (d < bd) { bd = d; best = id }
    }
    used.add(best)
    a.slot = best
    a.start = [wrap(BASE[best].x + dx, CX, WX), wrap(BASE[best].y + dy, CY, WY)]
  }
  pl.slots = new Map(ACTORS.map((a) => [a.slot, a]))

  // Anchors for each segment, in order (a segment starts where the last one had it).
  for (const a of ACTORS) {
    a.segs.forEach((s, k) => {
      s.anchor = k === 0 ? a.start : actorPos(pl, a, s.t, k - 1)
      s.Dy = pl.D(s.t)[1]
      if (s.mode === 'hold') s.line = pl.snap(s.anchor[1], s.t)
      if (s.mode === 'free') {
        // Back in with the crowd, a little to one side of its line (never on it: that is where the reds are).
        s.line = pl.snap(s.anchor[1], s.t) + (hash(a.slot, 5) < 0.5 ? -11 : 11)
        // Carried off: easing up to the flow's speed over 1.2 s.
        const ramp1 = 1.2
        let ox = 0
        let oy = 0
        const tab = []
        for (let t = s.t; t <= s.t + ramp1 + 1e-9; t += DT) {
          const e = easeInOut((t - s.t) / ramp1)
          const [x1, y1] = pl.D(t + DT)
          const [x0, y0] = pl.D(t)
          ox += e * (x1 - x0)
          oy += e * (y1 - y0)
          tab.push([ox, oy])
        }
        s.tab = tab
        s.ramp = ramp1
        s.D1 = pl.D(s.t + ramp1)
      }
    })
  }

  /*
   * A red's room in the crowd: none while it crosses rows (stepping out of
   * line, going to him), full once it stands on its line, shrinking away as it
   * gives in.
   */
  for (const a of ACTORS) {
    const gaps = [[a.at - 0.05, a.at + 0.55]]
    a.segs.forEach((sg, k) => { if (k > 0 && sg.mode === 'beside') gaps.push([sg.t - 0.1, sg.t + sg.join + 0.05]) })
    a.room = (t) => {
      let r = 1 - smooth((t - a.end) / 0.6)
      for (const [g0, g1] of gaps) r *= 1 - smooth((t - (g0 - 0.35)) / 0.35) * (1 - smooth((t - g1) / 0.45))
      return r
    }
  }

  /* The coda's rings: the call goes out from him on every No; each one turns the crowd it reaches. */
  pl.c0 = pl.him(T.c0)
  pl.rings = T.nos2.map((t, k) => ({ t, v: 560, max: 150 + 92 * (k + 1) }))
  pl.rings.push({ t: T.turnAll, v: 760, max: 4200, slow: true })
  pl.rings1 = [...T.nos1, T.no1b].map((t) => ({ t, v: 520, max: 210 }))
  return pl
}

/** A blow, then letting go: 0 → 1 → 0 over about `tau` seconds. */
function kick(u, tau) {
  if (u <= 0) return 0
  return (1 - Math.exp(-u / 0.045)) * Math.exp(-u / tau)
}

/** A red's place at time t, in segment k (or whichever it is in). Sheet units, no camera. */
function actorPos(pl, a, t, k = null) {
  if (k == null) { k = 0; for (let i = 0; i < a.segs.length; i++) if (t >= a.segs[i].t) k = i }
  const s = a.segs[k]
  let p
  if (s.mode === 'hold') {
    // Standing its ground, edging upstream; every rank that rams it drives it back for good.
    const dt = Math.max(0, t - s.t)
    let x = s.anchor[0] - 9 * dt
    const y = s.line + pl.D(t)[1] - s.Dy + 6 * Math.sin(dt * 0.7 + a.slot)
    for (const r of a.hits) if (t > r.t && r.t >= s.t) x += 60 * easeOut(clamp01((t - r.t) / 0.35))
    p = [Math.min(PX + PW - 50, Math.max(PX + 50, x)), y]
  }
  else if (s.mode === 'beside') {
    const [hx, hy] = pl.him(t)
    p = [hx + s.off[0], hy + s.off[1] + 3 * Math.sin(t * 1.7 + a.slot)]
  }
  else {
    const u = t - s.t
    let o
    if (u <= 0) o = [0, 0]
    else if (u < s.ramp) o = s.tab[Math.min(s.tab.length - 1, Math.floor(u / DT))]
    else { const [x, y] = pl.D(t); const e = s.tab.at(-1); o = [e[0] + x - s.D1[0], e[1] + y - s.D1[1]] }
    p = [s.anchor[0] + o[0], lerp(s.anchor[1], s.line, easeInOut(clamp01(u / s.ramp))) + pl.D(t)[1] - s.Dy]
  }
  for (const r of a.hits) p[0] += 30 * kick(t - r.t, 0.3)
  // Coming into a segment: eased from where the last one had it.
  if (k > 0 && s.mode !== 'free' && t < s.t + s.join) {
    const prev = actorPos(pl, a, t, k - 1)
    const e = easeInOut((t - s.t) / s.join)
    p = [lerp(prev[0], p[0], e), lerp(prev[1], p[1], e)]
  }
  return p
}

/** How red a red is at t (0 = ink): on at its moment, off as it gives in. */
function redness(a, t) {
  return easeOut(clamp01((t - a.at) / 0.35)) * (1 - easeInOut(clamp01((t - a.end) / 0.8)))
}

/*
 * A rank: the crowd within S1 behind its front packed into C of the room, back
 * to normal by S2 (a smooth, monotonic map, so no arrow ever passes another).
 */
const RANK = { S1: 300, S2: 820, C: 0.34 }
function rankMap(s) {
  const { S1, S2, C } = RANK
  if (s <= S1) return s * C
  if (s >= S2) return s
  const u = (s - S1) / (S2 - S1)
  const L = S2 - S1
  const u2 = u * u
  const u3 = u2 * u
  return (2 * u3 - 3 * u2 + 1) * C * S1 + (u3 - 2 * u2 + u) * C * L + (-2 * u3 + 3 * u2) * S2 + (u3 - u2) * L
}

/* The great arrow's shape: half-width over length, and how soft its edge is. */
const HEAD = 0.8
const SOFT = 40
const softplus = (u) => (u > 12 * SOFT ? u : SOFT * Math.log1p(Math.exp(u / SOFT)))
const sigmoid = (u) => 1 / (1 + Math.exp(-u))
/** v into [-m/2, m/2). */
const cmod = (v, m) => ((((v + m / 2) % m) + m) % m) - m / 2

/* ── The camera and the pulse ─────────────────────────────────────── */

/** Still all song; from the turn, one even pull back as everything marches his way. */
function camAt(pl, t) {
  const u = easeInOut(ramp(t, pl.T.york + 0.2, pl.T.end - 0.3))
  return { x: lerp(CX, CX + 90, u), y: CY, z: Math.exp(Math.log(0.46) * u) }
}

/** The whole board breathes on the beat: a little on every beat, more on the downbeat. */
const PULSE = { intro: 0.006, 'verse-1': 0.007, 'chorus-1': 0.011, 'break-1': 0.008, 'verse-2': 0.007, 'chorus-2': 0.011, 'no-1': 0.013, 'break-2': 0.015, 'chorus-3': 0.012, 'no-2': 0.013, outro: 0.01 }
function pulseAt(pl, score, t) {
  const { T, beat, phase } = pl
  if (t >= T.stop && t < T.back) return 1
  const k = Math.floor((t - phase) / beat)
  const since = t - (phase + k * beat)
  const sec = score.sections.find((s) => t >= s.from && t < s.to)
  const amp = (PULSE[sec?.id] ?? 0.008) * (k % 4 === 0 ? 1.7 : 1) * (t < 10 ? 0 : 1)
  return 1 + amp * Math.exp(-since / 0.13)
}

/* ── Drawing ──────────────────────────────────────────────────────── */

const f1 = (v) => Math.round(v * 10) / 10

/** One arrow as path data: centre (x, y), heading a, scale s. */
function arrow(x, y, a, s) {
  const c = Math.cos(a)
  const n = Math.sin(a)
  const l = AL * s
  const hl = AH * s
  const hw = AW * s
  const tx = x + c * l
  const ty = y + n * l
  return `M${f1(x - c * l)} ${f1(y - n * l)}L${f1(tx)} ${f1(ty)}M${f1(tx - c * hl - n * hw)} ${f1(ty - n * hl + c * hw)}L${f1(tx)} ${f1(ty)}L${f1(tx - c * hl + n * hw)} ${f1(ty - n * hl - c * hw)}`
}

const mixHex = (a, b, u) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  return `#${pa.map((v, i) => Math.round(lerp(v, pb[i], u)).toString(16).padStart(2, '0')).join('')}`
}
const angLerp = (a, b, u) => {
  const d = ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI
  return a + d * u
}

/** The plate alone — what goes inside the sheet. */
export function grainPlate({ time, score, probe = null }) {
  const pl = planFor(score)
  const { T } = pl
  const t = time
  const cam = camAt(pl, t)
  const Z = cam.z * pulseAt(pl, score, t)
  const sx = (x) => CX + (x - cam.x) * Z
  const sy = (y) => CY + (y - cam.y) * Z
  const gs = Z
  const [dx, dy] = pl.D(t)
  const flowA = pl.angleAt(t)
  const him = pl.him(t)

  /* The reds (and the ones who gave in), where they are now. */
  const live = []
  for (const a of pl.actors) {
    if (t < a.at) continue
    const free = t >= a.end
    const p = actorPos(pl, a, t)
    // Carried off by the flow, it wraps round the lattice's tile like everyone else.
    if (free) { p[0] = wrap(p[0], cam.x, WX); p[1] = wrap(p[1], cam.y, WY) }
    live.push({ a, p, red: redness(a, t), free })
  }
  // Room round each: eased in as it turns, smaller once it has given in.
  const rooms = [{ x: him[0], y: him[1], r: 38 }]
  for (const o of live) {
    const r = 30 * o.a.room(t)
    if (r > 0.5) rooms.push({ x: o.p[0], y: o.p[1], r, id: o.a.id })
  }

  /* Ranks now in flight. */
  const RV = 480
  const ranks = []
  for (const r of pl.ranks) {
    if (t < r.t - 1.6 || t > r.t + 1.1) continue
    const tg = r.target === 'him' ? him : (live.find((o) => o.a.id === r.target)?.p ?? him)
    const env = smooth((t - (r.t - 1.6)) / 0.7) * (1 - smooth((t - (r.t + 0.2)) / 0.9))
    ranks.push({ xf: tg[0] + RV * (t - r.t) - 30, y: tg[1], s: r.big ? 900 : r.s, a: r.a * env })
  }

  /* Ridicule now. */
  const jeers = []
  for (const j of pl.jeers) {
    if (t < j.from || t > j.to + 0.7) continue
    const env = smooth((t - j.from) / 0.45) * (1 - smooth((t - j.to) / 0.7))
    const tg = j.target === 'him' ? him : live.find((o) => o.a.id === j.target)?.p
    if (!tg || env <= 0.001) continue
    let jab = 0
    for (const jt of j.jabs) jab = Math.max(jab, kick(t - jt, 0.18))
    jeers.push({ x: tg[0], y: tg[1], R: j.R, env, jab })
  }

  /* The coda: who has turned (rings from where he stood on the first No), and the arrowhead ahead of the reds. */
  const coda = t > T.c0 - 0.1
  const c0 = pl.c0
  // When an arrow turns: the first ring to reach it, judged from where it stood as that ring went out (fixed, so it turns once).
  const ringD = coda ? pl.rings.map((r) => pl.D(r.t)) : []
  const turnedAt = (b, x, y) => {
    let best = Infinity
    pl.rings.forEach((r, k) => {
      const px = b ? wrap(b.x + ringD[k][0], cam.x, WX) : x
      const py = b ? wrap(b.y + ringD[k][1], cam.y, WY) : y
      const d = Math.hypot(px - c0[0], py - c0[1])
      if (d <= r.max) best = Math.min(best, r.t + d / r.v)
    })
    return best
  }
  // The great arrow: from the turn on, the crowd draws in behind the reds into one "<".
  const headK = easeInOut(ramp(t, T.york - 0.4, T.rev + 4))

  /** Everything the crowd does to one arrow at raw place (x, y). */
  const field = (x, y, b, ownId = null) => {
    const x0 = x
    const y0 = y
    let op = 1
    let a = flowA + b.n + 0.05 * Math.sin(1.1 * t + b.ph)
    // Ranks: a compression wave, piling the crowd up at its front.
    for (const r of ranks) {
      const s = r.xf - x
      if (s <= 0 || s >= RANK.S2) continue
      const lat = Math.exp(-(((y - r.y) / r.s) ** 2)) * r.a
      // Packed into a dense rank at its front, a gap behind, closing in on the one it is aimed at.
      const d = s - rankMap(s)
      x += d * lat
    }
    // Ridicule: turn to point at the one being mocked, lean in, wag, jab on the words.
    let jw = 0
    let ja = 0
    for (const j of jeers) {
      const d = Math.hypot(j.x - x, j.y - y)
      const wgt = j.env * smooth((j.R - d) / (j.R * 0.45))
      if (wgt > jw) {
        jw = wgt
        ja = Math.atan2(j.y - y, j.x - x)
        x += (j.x - x) * Math.min(0.3, ((14 + 12 * j.jab) * wgt) / Math.max(d, 1))
      }
    }
    if (jw > 0) {
      // Straight behind him the shorter way round is a coin toss: those few just stay as they are.
      const dif = ((ja - a + Math.PI) % TAU + TAU) % TAU - Math.PI
      const k = jw * smooth((Math.PI - Math.abs(dif)) / 0.7)
      a += dif * k + 0.3 * Math.sin(TAU * 6.5 * t + b.ph) * k
    }
    // The coda: turned round to face his way, swinging the head in towards him.
    if (coda) {
      const tt = turnedAt(ownId ? null : b, x, y)
      if (t > tt) a += easeInOut(clamp01((t - tt) / 0.45)) * (y0 < c0[1] ? Math.PI : -Math.PI)
      /*
       * The great arrow: nobody ahead of him, and behind him the crowd held
       * inside a widening "<" with the reds at its tip. Whoever is outside is
       * squeezed onto its edge by a soft-plus, and fades exactly as fast as it
       * is squeezed, so the ink stays even and the edge stays clean.
       */
      if (headK > 0) {
        const ax = him[0] - 40
        const s0 = x - ax
        x = lerp(x, ax + softplus(s0), headK)
        op *= lerp(1, sigmoid(s0 / SOFT), headK)
        const h = HEAD * Math.max(x - ax, 0)
        const ddy = y - him[1]
        const m = Math.abs(ddy)
        const m2 = h - softplus(h - m)
        y = him[1] + Math.sign(ddy) * lerp(m, m2, headK)
        op *= lerp(1, sigmoid((h - m) / SOFT), headK)
        // And nobody at all ahead of him.
        op *= lerp(1, sigmoid((x - him[0] - 12) / 10), headK)
      }
    }
    /*
     * Room round him and every red: the crowd bulges to pass, sideways only,
     * on the side it was already on (from where it would have been, `y0`),
     * so nothing ever flips from one side to the other.
     */
    for (const rm of rooms) {
      if (rm.id === ownId) continue
      const u = (x - rm.x) / (rm.r * 2.2)
      if (u <= -1 || u >= 1) continue
      const h = rm.r * (1 - u * u) ** 2
      const side = y0 < rm.y ? -1 : 1
      const m = Math.max(0, side * (y - rm.y))
      y = rm.y + side * Math.pow(m ** 2.5 + h ** 2.5, 1 / 2.5)
    }
    return [x, y, a, op]
  }

  // The visible window in sheet units, with a margin.
  const hw = (PW / 2) / Z + 60
  const hh = (PH / 2) / Z + 60
  let ink = ''
  // Arrows fading into the great arrow's edge, by how faded.
  const faint = ['', '', '', '']
  for (let id = 0; id < BASE.length; id++) {
    const b = BASE[id]
    const act = pl.slots.get(id)
    // A red is drawn as itself from its moment on (below).
    if (act && t >= act.at) continue
    const rx = wrap(b.x + dx, cam.x, WX)
    const ry = wrap(b.y + dy, cam.y, WY)
    if (Math.abs(rx - cam.x) > hw + 120 || Math.abs(ry - cam.y) > hh + 120) continue
    const [x, y, a, op] = field(rx, ry, b)
    if (op < 0.2) continue
    if (Math.abs(x - cam.x) > hw || Math.abs(y - cam.y) > hh) continue
    const X = sx(x)
    const Y = sy(y)
    if (op > 0.9) ink += arrow(X, Y, a, gs)
    else faint[Math.min(3, Math.floor(op * 4))] += arrow(X, Y, a, gs)
    if (probe) probe.push([id, X, Y, a, gs])
  }

  /* The reds, and the ones who gave in (carried off as free arrows). */
  let reds = ''
  let mixed = ''
  for (const o of live) {
    const { a } = o
    let [x, y] = o.p
    let ang = Math.PI + 0.06 * Math.sin(t * 1.3 + a.slot)
    // In the crowd for its first half second: eased out of its lattice place.
    if (t < a.at + 0.5) {
      const b = BASE[a.slot]
      const [fx, fy, fa] = field(wrap(b.x + dx, cam.x, WX), wrap(b.y + dy, cam.y, WY), b, a.id)
      const e = easeInOut((t - a.at) / 0.5)
      x = lerp(fx, x, e)
      y = lerp(fy, y, e)
      ang = angLerp(fa, ang, easeInOut(clamp01((t - a.at) / 0.45)))
    }
    for (const r of a.hits) ang += 0.5 * kick(t - r.t, 0.3) * Math.sin(TAU * 9 * (t - r.t))
    let fop = 1
    if (o.free) {
      // Given in: turned back round to go with the crowd, then just one of them.
      const u = t - a.end
      const [fx, fy, fa, op] = field(x, y, BASE[a.slot], a.id)
      fop = op
      const e = easeInOut(clamp01(u / 0.9))
      x = lerp(x, fx, e)
      y = lerp(y, fy, e)
      ang = angLerp(ang, fa, easeInOut(clamp01(u / 0.55)))
    }
    if (fop < 0.2 || Math.abs(x - cam.x) > hw || Math.abs(y - cam.y) > hh) continue
    const X = sx(x)
    const Y = sy(y)
    const d = arrow(X, Y, ang, gs)
    if (o.red >= 0.999) reds += d
    else if (o.red <= 0.001 && fop <= 0.9) faint[Math.min(3, Math.floor(fop * 4))] += d
    else if (o.red <= 0.001) ink += d
    else mixed += `<path d="${d}" stroke="${mixHex(INK, RED, o.red)}"/>`
    if (probe) probe.push([a.id, X, Y, ang, gs])
  }

  /* Him: bold and red, facing upstream, shaken by every rank and every mocking word. */
  let ha = Math.PI + 0.05 * Math.sin(t * 1.3) + 0.035 * Math.sin(t * 2.9)
  for (const r of pl.hisHits) ha += 0.55 * kick(t - r.t, 0.35) * Math.sin(TAU * 8 * (t - r.t))
  // Shaking with the holding, late in the instrumental.
  ha += 0.06 * smooth((t - (T.instr.to - 12)) / 4) * (1 - smooth((t - T.instr.to) / 1.5)) * Math.sin(TAU * 11 * t)
  for (const j of pl.jeers) if (j.target === 'him') for (const jt of j.jabs) ha += 0.12 * kick(t - jt, 0.18) * (hash(Math.round(jt * 100), 9) - 0.5) * 2
  const HX = sx(him[0])
  const HY = sy(him[1])
  if (probe) probe.push(['him', HX, HY, ha, gs])

  /* Rings: the call going out on each No. */
  let rings = ''
  for (const r of [...pl.rings1, ...pl.rings]) {
    const u = t - r.t
    if (u <= 0) continue
    const R = r.v * u
    if (R > r.max + 120 || (r.slow && R > 2600)) continue
    const o = (1 - smooth((R - r.max) / 120)) * (r.slow ? 0.85 * (1 - smooth(u / 3.2)) : 0.7) * smooth(u / 0.08)
    if (o <= 0.01) continue
    const c = r.t >= T.c0 - 0.1 ? c0 : pl.him(r.t)
    rings += `<circle cx="${f1(sx(c[0]))}" cy="${f1(sy(c[1]))}" r="${f1(R * Z)}" stroke-width="${f1((r.slow ? 4 : 2.6) * Math.max(Z, 0.6))}" opacity="${f1(o * 100) / 100}"/>`
  }

  const wInk = f1(W_INK * Math.max(Math.pow(Z, 0.7), 0.5))
  return `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>
<g fill="none" stroke-linecap="round" stroke-linejoin="round">
<g stroke="${RED}" fill="none">${rings}</g>
<path d="${ink}" stroke="${INK}" stroke-width="${wInk}"/>
${faint.map((d, k) => (d ? `<path d="${d}" stroke="${INK}" stroke-width="${wInk}" opacity="${(k + 0.5) / 4}"/>` : '')).join('')}
<g stroke-width="${wInk}">${mixed}</g>
<path d="${reds}" stroke="${RED}" stroke-width="${wInk}"/>
<path d="${arrow(HX, HY, ha, gs)}" stroke="${RED}" stroke-width="${f1(W_HIM * Math.max(Math.pow(Z, 0.7), 0.55))}"/>
</g>`
}

/** What is happening, for the page's "Now" line and the review sheet. */
export function grainMood(score, time) {
  const { T } = planFor(score)
  const L = score.lines
  const t = time
  if (t < L[0].start - 0.3) return 'against the march'
  if (t < T.dont1) return 'mocked'
  if (t < 57.8) return 'one turns red, then two'
  if (t < 63.4) return 'one gives in'
  if (t < T.cities[0]) return 'pointed at'
  if (t < T.only) return 'pulled five ways'
  if (t < T.abandon) return 'shoved'
  if (t < T.dont3) return 'abandoned'
  if (t < T.nos1[0]) return 'reds of their own'
  if (t < T.ny1) return 'no'
  if (t < T.instr.from + 1.5) return 'the crowd surges'
  if (t < T.instr.to - 4) return 'the crowd fights back'
  if (t < T.dont5) return 'still standing'
  if (t < T.dont6) return 'the two who held'
  if (t < T.nos2[0]) return 'a red flight'
  if (t < T.stop) return 'they turn'
  if (t < T.york) return 'the crowd stops'
  return 'everyone, his way'
}

/** The film: the opening, the album's sheet, the crowd, the lyric in the margin, the end card. */
export function grainFrame({ time, score, lockup = '', uid = 'grain' }) {
  if (score.endCardAt != null && time >= score.endCardAt) return endCard({ now: time, from: score.endCardAt, lockup })
  const section = score.sections.find((s) => time >= s.from && time < s.to) ?? score.sections.at(-1)
  const clip = `${uid}-plate`
  return {
    label: inOpening(time) ? 'Opening' : `${section.label} · ${grainMood(score, time)}`,
    svg: `<defs><clipPath id="${clip}"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}"/></clipPath></defs>
${paper(COVER_SHEET)}
<g clip-path="url(#${clip})">${grainPlate({ time, score })}</g>
${marginLyric({ now: time, score, uid, sheet: COVER_SHEET })}
${filmOpening({ time, uid, slug: 'new-york' })}`,
  }
}

/** For checking: the plan. */
export const grainPlan = (score) => planFor(score)

/** The page's jump-to list. What each is: docs/visualizers/new-york.md. */
export const GRAIN_BEATS = [
  { at: 0, label: 'Opening' },
  { at: 12, label: 'Against the march' },
  { at: 19.8, label: 'Mocked' },
  { at: 39.4, label: 'One turns red', key: true },
  { at: 57.6, label: 'Falling in line' },
  { at: 68.6, label: 'Five ways' },
  { at: 78.2, label: 'Abandoned', key: true },
  { at: 88.4, label: 'Reds of their own' },
  { at: 109.4, label: 'No' },
  { at: 122, label: 'The crowd fights back', key: true },
  { at: 150, label: 'Still standing' },
  { at: 156.4, label: 'A red flight', key: true },
  { at: 177.6, label: 'They turn' },
  { at: 195.6, label: 'Everyone, his way', key: true },
]
