/*
 * New York · Against the Grain — the film (v1, 2026-11-10).
 *
 * A crowd of small ink arrows, hundreds of them, all streaming toward a yellow
 * light off the right edge, in step with the record's click. One of them is a
 * little slow. On the first "don't" he stops, turns round and goes red, and
 * for the rest of the song he pushes the other way.
 *
 *   Verse 1     Carried along, jostled, overtaken.
 *   Chorus 1    He stops and the crowd parts round him; on "don't" he turns
 *               and goes red. The second "don't" sends a ring out: nobody
 *               turns. He starts upstream.
 *   Break       Upstream. Two knots of the crowd run into him.
 *   Verse 2     On each city a light flares at another edge and the whole
 *               crowd swings to point at it, and tugs him that way. "Bargain,
 *               bend, abandon, exploit" are four ranks that ram him.
 *   Chorus 2    Each "don't" is a ring, and the arrows behind him that it
 *               reaches turn round and fall in: a wedge, him at its point.
 *   No          Seven refusals, seven rings, the wedge bigger each time. On
 *               "New York" the light flares and the crowd surges.
 *   Instr.      The crowd fights back: on every bar a rank of massed arrows
 *               charges down the plate and rams the wedge, each one driving
 *               it back toward the light and stripping a layer of followers,
 *               until he is alone at the light's mouth, still facing away.
 *   Chorus 3    He pushes off again, harder, and they fall in again.
 *   New York    Twelve "No"s, twelve rings. The band stops and so does the
 *               crowd. On the held "York" the last ring goes out slowly and
 *               the camera pulls back, one even move: everything that turned
 *               with him is one great arrow, pointing away. The light goes out.
 *
 * HOW IT IS BUILT
 *
 * The frame is a pure function of the clock. Everything that needs a history
 * is worked out once per score (`planFor`): the stream's advance and his own
 * path are integrated into tables, and who turns on which ring, when, and
 * where they then stand in the wedge is simulated ring by ring.
 *
 * The stream is an endless lattice of arrows sliding right (`PHI`). The wedge
 * is a region in his frame, a half-width profile `prof(x')` behind his nose;
 * the stream is mapped round it (`|dy|' = (|dy|^p + h^p)^(1/p)`), so the crowd
 * parts at the nose, presses along the flanks and closes behind the barbs.
 * An arrow inside the region when a ring's front reaches it turns round and
 * from then on keeps its place relative to him. A rank of the crowd is a
 * compression wave run through the lattice. The red arrow is the only red
 * thing, with its rings; yellow is only ever a light.
 */
import { clamp01, easeOut, easeInOut, easeOutBack, lerp } from '../kit.mjs'
import { COVER_SHEET, INK, PAPER, RED, SECOND_INK, paper, marginLyric } from '../album.mjs'
import { filmOpening, inOpening } from '../opening.mjs'
import { endCard } from '../ending.mjs'

const { x: PX, y: PY, w: PW, h: PH } = COVER_SHEET.plate
const PR = PX + PW
const PB = PY + PH
const CX = PX + PW / 2
const CY = PY + PH / 2
const YELLOW = SECOND_INK['new-york']
const TAU = Math.PI * 2

/* ── The crowd's lattice ──────────────────────────────────────────── */

const SX = 58
const SY = 50
/** An ordinary arrow: half its length, and its head. */
const AL = 15
const AH = 8
const AW = 6

const hash = (i, j, k = 0) => {
  let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263) + Math.imul(k + 1, 1274126177)) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}
const smooth = (x) => { const u = clamp01(x); return u * u * (3 - 2 * u) }
const clean = (s) => s.toLowerCase().replace(/[^a-z']/g, '')

/* ── The wedge: the region the turned ones hold ───────────────────── */

/** The room round him when he is alone. */
const LENS_L = 80
const LENS_H = 42
/** The wedge starts this far ahead of his centre. */
const NOSE = 42
/** Half-width over length. */
const K = 0.5
/** The great arrow's shaft: its half-width and full length. */
const WS = 360
const LS_MAX = 1900
const P = 2.5
/** The formation's back is cut square: this much to fall from the barbs to the shaft. */
const BARB = 30

/**
 * Half the region's width at x' (behind him is positive), for a wedge of length Lw and a shaft of
 * length Ls. `sharp` is the formation itself, cut square behind the barbs; without it, the shape
 * the crowd flows round, which closes in behind the barbs gently (or they would whip across).
 */
function prof(xp, Lw, Ls, sharp = false) {
  let h = 0
  const ax = xp < 0 ? -xp : xp
  if (ax < LENS_L) h = LENS_H * Math.pow(1 - (ax / LENS_L) ** 2, 0.9)
  if (Lw > 1) {
    const s = xp + NOSE
    if (s > 0) {
      const tail = sharp ? BARB : 40 + 0.45 * K * Lw
      const ws = Ls > 0 ? Math.min(WS, K * Lw) * smooth(Ls / 300) : 0
      const end = Math.max(Lw + tail, Lw + BARB + Ls)
      let w
      if (s <= Lw) w = K * Math.pow(Lw, 0.15) * Math.pow(s, 0.85)
      else if (s <= Lw + tail) w = lerp(K * Lw, ws, smooth((s - Lw) / tail))
      else if (s <= end) w = ws
      else w = ws * (1 - smooth((s - end) / (sharp ? BARB : 250)))
      if (w > h) h = w
    }
  }
  return h
}

/* ── The plan, from the score ─────────────────────────────────────── */

const DT = 1 / 120
/** Piecewise-linear keys [[t, v], …] read at t. */
function keyed(keys, t) {
  if (t <= keys[0][0]) return keys[0][1]
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1]
      const [t1, v1] = keys[i]
      return v0 + (v1 - v0) * (t - t0) / (t1 - t0)
    }
  }
  return keys[keys.length - 1][1]
}
const table = (T, t) => {
  const f = t / DT
  const i = Math.max(0, Math.min(T.length - 2, Math.floor(f)))
  return T[i] + (T[i + 1] - T[i]) * (f - i)
}

/** The five cities, where a light flares for each: by the compass, with New York in the east. */
const CITIES = [
  { name: 'memphis', x: 1010, y: PB - 24 },
  { name: 'nashville', x: 1290, y: PB - 24 },
  { name: 'austin', x: 520, y: PB - 24 },
  { name: 'l.a', x: PX + 24, y: 610 },
  { name: 'detroit', x: 1130, y: PY + 24 },
]

const plans = new WeakMap()
function planFor(score) {
  let plan = plans.get(score)
  if (!plan) plans.set(score, plan = build(score))
  return plan
}

function build(score) {
  const beat = 60 / score.bpm
  const phase = score.beatPhase
  const bar = (n) => phase + 4 * n * beat
  const L = score.lines
  const word = (li, text, nth = 0) => {
    const hit = L[li]?.words.filter((w) => clean(w.text).replace(/'/g, '') === text.replace(/'/g, ''))[nth]
    if (!hit) throw new Error(`grain: no "${text}" (${nth}) in line ${li} (${L[li]?.text})`)
    return hit.t
  }
  const refusals = (li) => L[li].words.filter((w) => /^(no|don't|won't|not)$/.test(clean(w.text))).map((w) => w.t)
  const end = score.endCardAt

  /* The moments. */
  const T = {
    stop: L[2].start - 1.2, // stopped, a second before the first chorus
    turn: word(2, "don't"),
    ring0: word(3, "don't"),
    cities: CITIES.map((c) => word(4, c.name.replace('.', ''))),
    shoves: ['bargain', 'bend', 'abandon', 'exploit'].map((w) => word(5, w)),
    newYork1: word(9, 'new'),
    drop: word(15, "i'm") - 0.2, // the band stops under "I'm not going to"
    back: word(15, 'new') - 0.4, // and comes back under "New York"
    york: word(15, 'york'),
    end,
  }
  const lights = [word(2, 'lights'), word(6, 'lights'), word(10, 'lights')]
  /* "They say…": the ones round him turn to point at him, each time for longer and from further off. */
  T.says = [
    { t: L[0].start, until: L[0].start + 1.3, r: 250 },
    { t: L[1].start, until: L[1].start + 1.3, r: 300 },
    { t: L[4].start, until: T.cities[0] - 0.25, r: 460 },
    { t: L[5].start, until: L[5].start + 1.7, r: 520 },
  ]
  /* The light flares on "lights" and the crowd surges at it. */
  const surge = (t) => {
    let v = 0
    for (const t0 of lights) {
      const a = t - t0
      if (a > 0 && a < 2) v += smooth(a / 0.3) * (1 - smooth((a - 0.6) / 1.2))
    }
    return v
  }

  /* Every ring: when, and how long the wedge is once it has passed. */
  const rings = []
  const grow = (t, to, o = {}) => rings.push({ t, to, ...o })
  grow(T.ring0, 0, { reach: 330 }) // nobody turns
  const c2 = [...refusals(6), ...refusals(7)]
  grow(c2[0], 230); grow(c2[1], 330)
  ;[400, 470, 540, 620].forEach((to, k) => grow(refusals(8)[k], to))
  ;[700, 780, 860].forEach((to, k) => grow(refusals(9)[k], to))
  const INSTR_FROM = rings.length
  const c3 = [...refusals(10), ...refusals(11)]
  grow(c3[0], 260); grow(c3[1], 360)
  ;[440, 520, 600, 690].forEach((to, k) => grow(refusals(12)[k], to))
  ;[790, 890, 1000, 1110].forEach((to, k) => grow(refusals(13)[k], to))
  ;[1230, 1350, 1480, 1600].forEach((to, k) => grow(refusals(14)[k], to))
  ;[1700, 1800, 1900].forEach((to, k) => grow(refusals(15)[k], to))
  grow(T.york, 2000, { york: true })

  /* The ranks that ram him: the two knots in the break, the four shoves, and the instrumental's eleven. */
  const hits = []
  const knot = (t, o) => hits.push({ t, push: 26, back: 10, ext: 150, m: 0.74, w: 52, ...o })
  knot(bar(23), { ext: 120, push: 20 }); knot(bar(25)); knot(bar(27), { ext: 190, push: 30 })
  T.shoves.forEach((t, k) => knot(t, { push: 30, back: 8, ext: 170 + 30 * k }))
  const STRIP = [780, 700, 620, 540, 460, 380, 300, 220, 150, 80, 0]
  const firstBar = Math.round((122.37 - phase) / (4 * beat)) + 1
  STRIP.forEach((to, k) => hits.push({
    t: bar(firstBar + k), push: 80, back: 0, ext: 260 + 55 * k, m: 0.8, w: 62 + 3 * k, to, wall: k >= 8, big: true,
  }))
  T.hit0 = bar(firstBar)
  T.hitN = bar(firstBar + STRIP.length - 1)
  T.instr = bar(firstBar - 1)

  /* The wedge's length through the song: every ring adds, every big hit takes away. */
  const steps = []
  let at = 0
  for (const [k, ring] of rings.entries()) {
    if (k === INSTR_FROM) {
      for (const h of hits) if (h.big) { steps.push({ t: h.t, d: h.to - at, dur: 0.5 }); at = h.to }
    }
    if (ring.to !== at) steps.push({ t: ring.t, d: ring.to - at, dur: ring.york ? 1.2 : 0.6 })
    ring.from = at
    at = ring.to
  }
  const LwAt = (t) => {
    let v = 0
    for (const s of steps) {
      if (t <= s.t) break
      v += s.d * smooth((t - s.t) / s.dur)
    }
    return v < 0 ? 0 : v
  }
  /* The York ring is slow, a held note: its front is the shaft's growing end. */
  const YORK_C = 540
  const LsAt = (t) => (t <= T.york ? 0 : Math.max(0, Math.min(LS_MAX, YORK_C * (t - T.york) - (2000 + BARB + NOSE))))

  /* ── The stream's advance: Φ(t), integrated ── */
  const V0 = SX / (2 * beat)
  const speedKeys = [
    [0, 1], [T.cities[0] - 0.6, 1], [T.cities[0], 0.3], [T.cities[4] + 2.1, 0.3], [T.cities[4] + 3.8, 1],
    [T.newYork1, 1], [T.newYork1 + 1.2, 1.7], [T.instr, 2], [T.hitN + 1, 2], [T.hitN + 5, 1.5],
    [c3[0], 1.5], [c3[0] + 14, 1], [T.drop - 0.12, 1], [T.drop + 0.06, 0], [T.back - 0.05, 0], [T.back + 0.12, 1.1],
    [T.york, 1.1], [end, 0.8],
  ]
  const n = Math.ceil(score.duration / DT) + 2
  const PHI = new Float64Array(n)
  const pulse = (t) => Math.cos(TAU * (t - phase) / beat - 0.7)
  for (let i = 1; i < n; i++) {
    const t = (i - 0.5) * DT
    PHI[i] = PHI[i - 1] + V0 * keyed(speedKeys, t) * (1 + 0.9 * surge(t)) * (1 + 0.55 * pulse(t)) * DT
  }

  /* ── His path: a velocity, integrated, plus the knocks ── */
  const vKeys = [
    [0, 26], [20, 26], [30, 21], [L[1].end - 0.5, 18], [L[1].end + 0.3, 3], [L[1].end + 1.2, 14], [T.stop - 0.9, 12], [T.stop, 0],
    [T.ring0, 0], [T.ring0 + 0.5, -15], [L[4].start - 2.0, -15], [L[4].start - 1.1, 0],
    [c2[0], 0], [c2[0] + 0.5, -16], [L[8].start - 2.2, -16], [L[8].start - 1.2, 0],
    [T.newYork1 + 0.6, 0], [T.newYork1 + 1.6, 6], [T.instr, 6], [T.instr + 0.8, 0],
    [c3[0], 0], [c3[0] + 0.5, -34], [c3[0] + 15, -34], [L[12].start - 2.2, -14], [L[12].start - 1.1, 0],
    [T.york, 0], [T.york + 1.0, -22], [end, -22],
  ]
  const RX = new Float64Array(n)
  RX[0] = 18
  for (let i = 1; i < n; i++) {
    const t = (i - 0.5) * DT
    const v = keyed(vKeys, t)
    RX[i] = RX[i - 1] + v * (1 + (v < 0 ? 0.8 : 0.25) * pulse(t)) * DT
  }
  /* A lunge on every refusal from the first chorus-2 ring on; a recoil on every hit. */
  const lunges = rings.filter((ring) => ring.to > 0 && !ring.york).map((ring) => ring.t)
  const jostles = [word(0, 'lost'), word(0, 'rocks'), word(0, 'burning'), word(0, 'coals'), word(1, 'dreams'), word(1, 'submarines'), word(1, 'undermine'), word(1, 'goal')]
  const redAt = (t) => {
    let x = table(RX, t)
    // His line stays between the same two rows of the crowd all song: an arrow cannot change sides of him.
    const y = CY + 6 * Math.sin(0.043 * t + 1) + 3 * Math.sin(0.117 * t)
    // What knocks him about is drawn on him alone (oy); the ones behind him hold their line.
    let oy = 0
    let kick = 0
    for (const t0 of lunges) {
      if (t > t0) x -= 10 * easeOutBack(clamp01((t - t0) / 0.28), 2.2)
    }
    for (const [k, h] of hits.entries()) {
      if (t <= h.t) continue
      const a = t - h.t
      x += h.push * easeOut(clamp01(a / 0.4)) - h.back * easeInOut(clamp01((a - 0.5) / 1.3))
      if (a < 1.6) {
        const d = Math.exp(-a / 0.28)
        oy += (k % 2 ? -1 : 1) * (h.big ? 16 : 8) * d * Math.sin(a * 9)
        kick += (k % 2 ? 1 : -1) * (h.big ? 0.5 : 0.3) * d * Math.cos(a * 11)
      }
    }
    for (const t0 of lights) {
      const a = t - t0
      if (a > 0 && a < 3) x += 15 * smooth(a / 0.5) * (1 - smooth((a - 0.9) / 1.6))
    }
    // Alone at the mouth of the light: he shakes with the holding, and is still a second before he sings.
    const hold = smooth((t - T.hitN - 0.8) / 1.5) * (1 - smooth((t - (c3[0] - 1.9)) / 0.6))
    if (hold > 0) { oy += 2.6 * hold * Math.sin(t * 27); x += 1.8 * hold * Math.sin(t * 31 + 1) }
    for (const [k, t0] of jostles.entries()) {
      const a = t - t0
      if (a <= 0 || a > 2) continue
      const d = Math.exp(-a / 0.35)
      oy += (k % 2 ? -1 : 1) * 15 * d * Math.sin(a * 7)
      kick += (k % 2 ? -1 : 1) * 0.3 * d * Math.cos(a * 9)
      x += 5 * d
    }
    for (const [k, t0] of T.cities.entries()) {
      const a = t - t0
      if (a <= 0 || a > 1.6) continue
      const c = CITIES[k]
      const p = easeOut(clamp01(a / 0.2)) * (1 - easeInOut(clamp01((a - 0.3) / 0.7)))
      const dx = c.x - x
      const dy = c.y - y
      const m = Math.hypot(dx, dy) || 1
      x += 26 * p * dx / m
      oy += 26 * p * dy / m
      kick += 0.45 * p * Math.sign(dy) * (dx < 0 ? 0.4 : 1)
    }
    return { x, y, oy, kick }
  }

  /* Wave fronts: where each rank's apex is aimed, once his path is known. */
  const WAVE_C = 430
  for (const h of hits) {
    const at0 = redAt(h.t - 0.001)
    h.hitX = at0.x - NOSE - 10
    h.cy = at0.y
    h.launch = h.t - (h.hitX - (PX - 140)) / WAVE_C
    h.slope = h.wall ? 0.12 : 0.6
  }

  const pl = { beat, phase, bar, T, lights, rings, hits, LwAt, LsAt, PHI, redAt, WAVE_C, YORK_C, V0, speedKeys, c3, pulse }
  simulate(pl)
  return pl
}

/* ── The stream: where arrow (i, j) is, and which way it points ───── */

const OUT = { x: 0, y: 0, a: 0, s: 1, bold: 0, ny: 0 }

/**
 * Stream arrow (i, j) at t, written into OUT. `Lw`/`Ls` are the wedge the
 * stream is parting round (an arrow about to turn is held to the wedge as it
 * was when its ring set out). Returns false if it has been squeezed to nothing
 * (OUT is still where it would be).
 */
function streamAt(pl, i, j, t, red, Lw, Ls, phi) {
  let x = (i + (j & 1 ? 0.5 : 0)) * SX + (hash(i, j, 1) - 0.5) * 16 + phi
  let y = CY + (j + 0.5) * SY + (hash(i, j, 2) - 0.5) * 14
  let bold = 0
  let tilt = 0.1 * Math.sin(t * 0.7 + hash(i, j, 3) * TAU + x * 0.004)
  let dirx = 1
  let diry = 0

  // The ranks: a compression running down the lattice, faster than the stream.
  for (const h of pl.hits) {
    if (t < h.launch || t > h.t + 0.9) continue
    const amp = smooth((t - h.launch) / 0.35) * (1 - smooth((t - h.t) / 0.8))
    const lat = Math.abs(y - h.cy)
    const side = 1 - smooth((lat - h.ext * 0.65) / (h.ext * 0.35))
    if (side <= 0) continue
    const u = x - (h.hitX - pl.WAVE_C * (h.t - t) - h.slope * lat)
    const g = Math.exp(-(u * u) / (2 * h.w * h.w))
    x -= h.m * amp * side * u * g
    const core = amp * side * g
    if (core > bold) bold = core
  }

  // "They say": the ones round him turn to tell him.
  for (const say of pl.T.says) {
    if (t < say.t - 0.05 || t > say.until + 0.9) continue
    const dx = red.x - x
    const dy = red.y - y
    const m = Math.hypot(dx, dy)
    if (m > say.r || m < 1) continue
    const w = easeOut(clamp01((t - say.t + 0.05 * hash(i, j, 4)) / 0.3)) * (1 - easeInOut(clamp01((t - say.until) / 0.8))) * smooth((say.r - m) / (say.r * 0.45))
    dirx += (dx / m - 1) * w
    diry += (dy / m) * w
  }

  // The cities: the whole field swings to point at each in turn, and lunges at it.
  if (t > pl.T.cities[0] - 0.1 && t < pl.T.cities[4] + 4) {
    for (let k = 0; k < 5; k++) {
      const t0 = pl.T.cities[k]
      if (t < t0) break
      const until = k < 4 ? pl.T.cities[k + 1] : t0 + 2.0
      const w = easeOut(clamp01((t - t0) / 0.22)) * (1 - easeInOut(clamp01((t - until) / (k < 4 ? 0.22 : 1.3))))
      if (w <= 0.001) continue
      const c = CITIES[k]
      const dx = c.x - x
      const dy = c.y - y
      const m = Math.hypot(dx, dy) || 1
      const near = 0.72 + 0.28 * clamp01(1 - m / 1300)
      dirx += (dx / m - 1) * w * near
      diry += (dy / m) * w * near
      const a = t - t0 - 0.04 * hash(i, j, 4)
      if (a > 0 && a < 1) {
        const p = easeOut(clamp01(a / 0.16)) * (1 - easeInOut(clamp01((a - 0.2) / 0.6)))
        x += 15 * p * dx / m
        y += 15 * p * dy / m
      }
    }
  }

  // Round him and his: the crowd parts at the nose and closes behind.
  OUT.ny = y
  const xp = x - red.x
  let scale = 1
  const h = prof(xp, Lw, Ls)
  if (h > 0.5) {
    const dy = y - red.y
    const ady = dy < 0 ? -dy : dy
    const sgn = dy < 0 ? -1 : 1
    const out = Math.pow(Math.pow(ady, P) + Math.pow(h, P), 1 / P)
    y = red.y + sgn * out
    const dh = (prof(xp + 3, Lw, Ls) - prof(xp - 3, Lw, Ls)) / 6
    tilt += sgn * Math.atan(0.9 * dh * Math.pow(h / out, P - 1))
    // The deepest are squeezed out along a big wedge's flank, or the rim would be solid ink.
    if (h > 70) {
      const keep = clamp01(((ady / h) * 2.4 + 0.12 - hash(i, j, 5)) / 0.3)
      scale = lerp(1, keep, smooth((h - 70) / 100))
    }
  }

  // A ring going by: they shiver, even when they do not turn.
  for (const ring of pl.rings) {
    const a = t - ring.t
    if (a <= 0 || a > ring.life) continue
    const d = Math.hypot(x - red.x, y - red.y)
    const f = d - ring.c * a
    if (f > -90 && f < 40) tilt += (hash(i, j, 6) < 0.5 ? -1 : 1) * 0.55 * Math.exp(-(f * f) / 1800) * ring.fade(a)
  }

  OUT.x = x
  OUT.y = y
  OUT.a = Math.atan2(diry, dirx) + tilt
  OUT.s = scale
  OUT.bold = bold
  return scale >= 0.12
}

/* ── Who turns, when, and where they then stand ───────────────────── */

/** The formation: ranks behind him, one straight down his own line. */
const FX = 56
const FY = 48
const siteX = (a, b) => a * FX + (b & 1 ? FX / 2 : 0)
const siteKey = (a, b) => a * 8192 + (b + 4096)
/** How far an arrow will go to fall in. */
const FALL_IN = 70
/** And how far, for a place nobody is standing near. */
const FAR = 1100

function simulate(pl) {
  const turned = new Map() // lattice key → follower
  const taken = new Set() // formation sites
  const followers = []
  const key = (i, j) => i * 8192 + (j + 4096)
  for (const ring of pl.rings) {
    ring.reach = ring.reach ?? (ring.york ? NOSE + 2000 + BARB + LS_MAX + 250 : Math.max(280, ring.to * 1.2 + 140))
    ring.c = ring.york ? pl.YORK_C : Math.max(720, ring.reach / 0.62)
    ring.life = ring.reach / ring.c
    const life = ring.life
    ring.fade = (a) => smooth(a / 0.08) * (1 - smooth((a - life * 0.55) / (life * 0.45)))
  }
  // The ranks strip the wedge, a layer a hit, the back and the flanks first.
  const strip = (h) => {
    for (const f of followers) {
      if (f.tc > h.t || f.ts < Infinity) continue
      if (h.to > 0 && Math.abs(f.fy) < prof(f.fx, h.to, 0, true) - 8) continue
      f.ts = h.t + 0.04 + clamp01(f.fx / 900) * 0.4 + f.seed * 0.18
      taken.delete(f.site)
    }
  }
  const pending = pl.hits.filter((h) => h.big)
  for (const ring of pl.rings) {
    while (pending.length && pending[0].t < ring.t) strip(pending.shift())
    const reach = ring.reach
    if (ring.to <= 0) continue
    const Lw0 = pl.LwAt(ring.t)
    const red0 = pl.redAt(ring.t)
    const phi0 = table(pl.PHI, ring.t)
    const LsEnd = ring.york ? LS_MAX : 0
    const MARGIN = ring.to > 1600 ? 520 : 260
    const wide = (ring.york ? Math.max(K * ring.to, WS) : K * ring.to) + MARGIN
    const i0 = Math.floor((red0.x - 700 - phi0) / SX)
    const i1 = Math.ceil((red0.x + reach + (ring.to > 1100 ? 1000 : 300) - phi0) / SX)
    const j0 = Math.floor((red0.y - wide - 60 - CY) / SY)
    const j1 = Math.ceil((red0.y + wide + 60 - CY) / SY)
    // Everyone near enough to be asked: where each is, in his frame, when the ring's front reaches it.
    const cands = []
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        if (turned.has(key(i, j))) continue
        // A fixed point: the arrow drifts a little while the front comes out to it.
        let tc = ring.t
        let red = red0
        for (let pass = 0; pass < 4; pass++) {
          red = pl.redAt(tc)
          streamAt(pl, i, j, tc, red, Lw0, 0, table(pl.PHI, tc))
          tc = ring.t + Math.hypot(OUT.x - red.x, OUT.y - red.y) / ring.c
        }
        red = pl.redAt(tc)
        streamAt(pl, i, j, tc, red, Lw0, 0, table(pl.PHI, tc))
        const sx = OUT.x - red.x
        const sy = OUT.y - red.y
        if (Math.abs(sy) > prof(sx, ring.to, LsEnd) + MARGIN) continue
        cands.push({ i, j, tc, sx, sy, ny: OUT.ny - red.y, a0: OUT.a, s0: OUT.s, used: false })
      }
    }
    // The places to fill: every free site inside the wedge this ring makes, nearest him first.
    const sites = []
    const bMax = Math.ceil(wide / FY)
    const aMax = Math.ceil((reach + 100) / FX)
    for (let b = -bMax; b <= bMax; b++) {
      for (let a = 0; a <= aMax; a++) {
        if (taken.has(siteKey(a, b))) continue
        const x = siteX(a, b)
        const y = b * FY
        if (Math.hypot(x, y) < 76) continue
        if (Math.abs(y) > prof(x, ring.to, LsEnd, true) - 8) continue
        sites.push({ a, b, x, y, d: Math.hypot(x, y) })
      }
    }
    sites.sort((p, q) => p.d - q.d)
    // First whoever is standing in the place (a coarse grid finds them). Then, for the places
    // still empty (the hollow the crowd leaves behind the barbs, the flanks' new rows), whoever
    // is nearest, from the crowd pressed along the rim or from outside: they come in to close the ranks.
    const CELL = 80
    const shown = new Map()
    for (const c of cands) {
      const g = Math.floor(c.sx / CELL) * 4096 + Math.floor(c.sy / CELL) + 2048
      if (!shown.has(g)) shown.set(g, [])
      shown.get(g).push(c)
    }
    const join = (site, best) => {
      best.used = true
      site.done = true
      taken.add(siteKey(site.a, site.b))
      const seed = hash(best.i, best.j, 7)
      const fx = site.x + (seed - 0.5) * 6
      const fy = site.y + (hash(best.i, best.j, 9) - 0.5) * 6
      const f = {
        i: best.i, j: best.j, tc: best.tc, t0: ring.t, Lw0, sx: best.sx, sy: best.sy, a0: best.a0, s0: best.s0,
        fx, fy, fall: 0.7 + Math.hypot(best.sx - fx, best.sy - fy) / 350, ts: Infinity, seed, site: siteKey(site.a, site.b),
      }
      turned.set(key(best.i, best.j), f)
      followers.push(f)
    }
    for (const site of sites) {
      let best = null
      let bestD = FALL_IN
      const gx = Math.floor(site.x / CELL)
      const gy = Math.floor(site.y / CELL)
      for (let u = -1; u <= 1; u++) {
        for (let v = -1; v <= 1; v++) {
          const cell = shown.get((gx + u) * 4096 + gy + v + 2048)
          if (!cell) continue
          for (const c of cell) {
            if (c.used || c.s0 < 0.5) continue
            const d = Math.hypot(c.sx - site.x, c.sy - site.y)
            if (d < bestD) { bestD = d; best = c }
          }
        }
      }
      if (best) join(site, best)
    }
    for (const site of sites) {
      if (site.done) continue
      let best = null
      let bestD = FAR
      for (const c of cands) {
        if (c.used) continue
        const d = Math.hypot(c.sx - site.x, c.sy - site.y)
        if (d < bestD) { bestD = d; best = c }
      }
      if (best) join(site, best)
    }
  }
  followers.sort((a, b) => a.tc - b.tc)
  pl.turned = turned
  pl.followers = followers
  pl.key = key
}

/* ── Drawing ──────────────────────────────────────────────────────── */

const f1 = (v) => Math.round(v * 10) / 10

/** One arrow as path data: centre (x, y) on the plate, heading a, half-length l, head hl × hw. */
function arrow(x, y, a, l, hl, hw) {
  const c = Math.cos(a)
  const s = Math.sin(a)
  const tx = x + c * l
  const ty = y + s * l
  return `M${f1(x - c * l)} ${f1(y - s * l)}L${f1(tx)} ${f1(ty)}M${f1(tx - c * hl - s * hw)} ${f1(ty - s * hl + c * hw)}L${f1(tx)} ${f1(ty)}L${f1(tx - c * hl + s * hw)} ${f1(ty - s * hl - c * hw)}`
}
/** A far arrow: a stroke with a tick of a head, whole pixels. */
function dash(x, y, a, l) {
  const c = Math.cos(a) * l
  const s = Math.sin(a) * l
  return `M${Math.round(x - c)} ${Math.round(y - s)}L${Math.round(x + c)} ${Math.round(y + s)}`
}

/** The camera: still for the whole song, then one even pull-out from "York" to the end card. */
function camAt(pl, t, red) {
  const { T } = pl
  if (t <= T.york) return { x: CX, y: CY, z: 1 }
  const D = T.end - T.york
  const a = t - T.york
  const run = (v) => (v < 1 ? v * v / 2 : v - 0.5)
  const u = clamp01(run(a) / run(D))
  const z = Math.exp(Math.log(Z_END) * u)
  // He goes from where he stands to the left of the plate, so the whole arrow fits behind him.
  const red0 = pl.redAt(T.york)
  const w = (1 - z) / (1 - Z_END)
  const sx = lerp(red0.x, PX + 150, w)
  const sy = lerp(red0.y, CY, w)
  return { x: red.x + (CX - sx) / z, y: red.y + (CY - sy) / z, z }
}
const Z_END = 0.31

/** The light: a disc at the right edge and its rays. Fixed to the plate: it is a long way off. */
function lightSvg(pl, t) {
  const { T, lights, hits, beat, phase } = pl
  const grow = smooth((t - T.instr) / (T.hitN - T.instr)) * (1 - smooth((t - pl.c3[0]) / 16))
  let flare = 0
  for (const t0 of lights) if (t > t0) flare = Math.max(flare, Math.exp(-(t - t0) / 0.9))
  for (const t0 of [T.newYork1 + 0.5, T.back + 0.4]) if (t > t0 - 0.5) flare = Math.max(flare, smooth((t - t0 + 0.5) / 0.5) * Math.exp(-Math.max(0, t - t0) / 1.6))
  for (const h of hits) if (h.big && t > h.t) flare = Math.max(flare, 0.5 * Math.exp(-(t - h.t) / 0.5))
  const lw = pl.LwAt(t)
  const out = smooth((t - T.york) / 6.5)
  const strength = (1 - 0.5 * clamp01(lw / 1900) * (1 - grow)) * (1 - out)
  if (strength <= 0.004) return ''
  const R = (36 + 150 * grow + 10 * flare) * (1 - 0.5 * out)
  const cx = PR - 30 + 0.72 * (R - 36)
  const beatP = 0.5 + 0.5 * Math.cos(TAU * (t - phase) / beat)
  const len = 50 + 26 * flare * 3 + 70 * grow + 7 * beatP
  let rays = ''
  const N = 13
  for (let k = 0; k < N; k++) {
    const ang = Math.PI / 2 + (k / (N - 1)) * Math.PI
    const c = Math.cos(ang)
    const s = Math.sin(ang)
    const l = len * (k % 2 ? 0.72 : 1)
    rays += `M${f1(cx + c * (R + 10))} ${f1(CY + s * (R + 10))}L${f1(cx + c * (R + 10 + l))} ${f1(CY + s * (R + 10 + l))}`
  }
  return `<g opacity="${f1(strength * 100) / 100}"><circle cx="${f1(cx)}" cy="${CY}" r="${f1(R)}" fill="${YELLOW}"/><path d="${rays}" stroke="${YELLOW}" stroke-width="${f1(5 + 3 * grow)}" stroke-linecap="round" fill="none"/></g>`
}

/** The cities' lights: small, at the edges, each flaring on its word. */
function citiesSvg(pl, t) {
  const { T } = pl
  if (t < T.cities[0] - 0.05 || t > T.cities[4] + 4.2) return ''
  let out = ''
  const gone = 1 - smooth((t - (T.cities[4] + 2.2)) / 1.8)
  for (const [k, c] of CITIES.entries()) {
    const a = t - T.cities[k]
    if (a <= 0) continue
    const on = easeOutBack(clamp01(a / 0.25), 2.5)
    const flare = Math.exp(-a / 0.5)
    const R = 21 * on + 10 * flare
    const dx = CX - c.x
    const dy = CY - c.y
    const base = Math.atan2(dy, dx)
    let rays = ''
    for (let q = -3; q <= 3; q++) {
      const ang = base + q * 0.42
      const l = (20 + 30 * flare) * (q % 2 ? 0.7 : 1)
      rays += `M${f1(c.x + Math.cos(ang) * (R + 7))} ${f1(c.y + Math.sin(ang) * (R + 7))}L${f1(c.x + Math.cos(ang) * (R + 7 + l))} ${f1(c.y + Math.sin(ang) * (R + 7 + l))}`
    }
    const o = gone * (0.55 + 0.45 * flare)
    out += `<g opacity="${f1(o * 100) / 100}"><circle cx="${f1(c.x)}" cy="${f1(c.y)}" r="${f1(R)}" fill="${YELLOW}"/><path d="${rays}" stroke="${YELLOW}" stroke-width="4" stroke-linecap="round" fill="none"/></g>`
  }
  return out
}

/** His heading: with the crowd, then round on the first "don't", for good. */
function headingAt(pl, t, kick) {
  const { T } = pl
  const turn = easeOutBack(clamp01((t - T.turn) / 0.55), 1.4)
  const steady = 0.06 * Math.sin(t * 1.3) + 0.04 * Math.sin(t * 2.9)
  return Math.PI * turn + steady + kick
}

/** The plate alone — what goes inside the sheet. */
export function grainPlate({ time, score, probe = null }) {
  // `probe`, if given, collects [id, x, y, heading, scale] for every arrow drawn: for a frame-to-frame continuity scan.
  const pl = planFor(score)
  const { T } = pl
  const t = time
  const red = pl.redAt(t)
  const cam = camAt(pl, t, red)
  const z = cam.z
  const far = z < 0.62
  const px = (x) => CX + (x - cam.x) * z
  const py = (y) => CY + (y - cam.y) * z
  const gl = Math.pow(z, 0.85) // glyphs shrink a little slower than the ground
  const phi = table(pl.PHI, t)
  const Lw = pl.LwAt(t)
  const Ls = pl.LsAt(t)

  // What of the ground is on the plate.
  const x0 = cam.x - (PW / 2 + 40) / z
  const x1 = cam.x + (PW / 2 + 40) / z
  const y0 = cam.y - (PH / 2 + 30) / z
  const y1 = cam.y + (PH / 2 + 30) / z

  // The light swallows what reaches it.
  const growL = smooth((t - T.instr) / (T.hitN - T.instr)) * (1 - smooth((t - pl.c3[0]) / 16))
  const RL = 36 + 150 * growL
  const lcx = PR - 30 + 0.72 * (RL - 36)
  const lightOn = z > 0.9

  let thin = ''
  let mid = ''
  let bold = ''
  const j0 = Math.floor((y0 - CY) / SY) - 1
  const j1 = Math.ceil((y1 - CY) / SY)
  const i0 = Math.floor((x0 - 40 - phi) / SX) - 1
  const i1 = Math.ceil((x1 + 40 - phi) / SX)
  const thinOut = far ? smooth((0.62 - z) / 0.25) * 0.42 : 0
  for (let j = j0; j <= j1; j++) {
    for (let i = i0; i <= i1; i++) {
      const f = pl.turned.get(pl.key(i, j))
      if (f) {
        if (t >= f.tc) continue
        if (!streamAt(pl, i, j, t, red, t >= f.t0 ? f.Lw0 : Lw, t >= f.t0 ? 0 : Ls, phi)) continue
      } else if (!streamAt(pl, i, j, t, red, Lw, Ls, phi)) continue
      const X = px(OUT.x)
      const Y = py(OUT.y)
      if (X < PX - 20 || X > PR + 20 || Y < PY - 20 || Y > PB + 20) continue
      let s = OUT.s
      if (lightOn) {
        const d = Math.hypot(X - lcx, Y - CY)
        if (d < RL + 6) s *= smooth((d - RL * 0.45) / (RL * 0.55 + 6))
        if (s < 0.1) continue
      }
      if (probe) probe.push([pl.key(i, j), X, Y, OUT.a, s])
      if (far) {
        if (thinOut > 0 && hash(i, j, 8) < thinOut) continue
        thin += dash(X, Y, OUT.a, AL * gl * s)
      } else if (OUT.bold > 0.3) mid += arrow(X, Y, OUT.a, AL * gl * s * 1.12, AH * gl * s * 1.15, AW * gl * s * 1.15)
      else thin += arrow(X, Y, OUT.a, AL * gl * s, AH * gl * s, AW * gl * s)
    }
  }

  // The turned: each keeps its place behind him; the stripped are swept off downstream.
  const sway = far ? 0 : 1
  for (const f of pl.followers) {
    if (f.tc > t) break
    let x
    let y
    let a
    let heavy = true
    let fs = 1
    if (t < f.ts) {
      const fall = easeInOut(clamp01((t - f.tc) / f.fall))
      x = red.x + f.sx + (f.fx - f.sx) * fall
      y = red.y + f.sy + (f.fy - f.sy) * fall
      fs = f.s0 + (1 - f.s0) * smooth((t - f.tc) / 0.4)
      const turn = clamp01((t - f.tc) / 0.42)
      if (turn < 1) {
        const k = easeOutBack(turn, 1.6)
        a = f.a0 + ((f.sy < 0 ? -Math.PI : Math.PI) - f.a0) * k
        heavy = turn > 0.45
      } else a = Math.PI + sway * 0.07 * Math.sin(t * 1.1 + f.seed * TAU)
    } else {
      const at0 = pl.redAt(f.ts)
      const tau = t - f.ts
      if (tau > 40) continue
      x = at0.x + f.fx + (phi - table(pl.PHI, f.ts)) * (tau / (tau + 0.3))
      y = at0.y + f.fy + (f.fy < 0 ? -1 : 1) * (24 + 50 * f.seed) * easeOut(clamp01(tau / 1.3))
      const k = easeOutBack(clamp01(tau / 0.4), 1.4)
      a = Math.PI * (1 - k) * (f.fy < 0 ? -1 : 1) + 0.25 * smooth(tau / 0.2) * Math.exp(-tau / 0.6) * Math.sin(tau * 9 + f.seed * 6)
      heavy = tau < 0.18
    }
    if (x < x0 || x > x1 || y < y0 || y > y1) continue
    const X = px(x)
    const Y = py(y)
    let s = fs
    if (lightOn && !heavy) {
      const d = Math.hypot(X - lcx, Y - CY)
      if (d < RL + 6) s *= smooth((d - RL * 0.45) / (RL * 0.55 + 6))
      if (s < 0.1) continue
    }
    if (probe) probe.push([pl.key(f.i, f.j), X, Y, a, s])
    const d = arrow(X, Y, a, AL * gl * s, AH * gl * s, AW * gl * s)
    if (heavy) bold += d
    else thin += d
  }

  // The rings.
  let ringSvg = ''
  for (const ring of pl.rings) {
    const a = t - ring.t
    if (a <= 0 || a > ring.life) continue
    const o = ring.fade(a) * (ring.york ? 0.9 : 0.85)
    if (o <= 0.01) continue
    ringSvg += `<circle cx="${f1(px(red.x))}" cy="${f1(py(red.y))}" r="${f1(ring.c * a * z)}" fill="none" stroke="${RED}" stroke-width="${ring.york ? 3 : f1(2 + 2.2 * (1 - a / ring.life))}" opacity="${f1(o * 100) / 100}"/>`
  }

  // Him.
  const isRed = clamp01((t - T.turn) / 0.3)
  const big = lerp(30, 40, easeOut(isRed))
  const still = Math.abs(table(pl.PHI, t + 0.05) - phi) < 0.02
  const breath = 1 + 0.035 * Math.sin(t * (still ? 5 : 2.6))
  const heading = headingAt(pl, t, red.kick)
  const rl = big * breath * Math.max(gl, 0.62)
  const me = arrow(px(red.x), py(red.y + red.oy), heading, rl, rl * 0.56, rl * 0.42)
  const meSvg = `<path d="${me}" fill="none" stroke="${isRed > 0.5 ? RED : INK}" stroke-width="${f1(lerp(5.6, 9, isRed) * Math.max(Math.pow(z, 0.6), 0.6))}" stroke-linecap="round" stroke-linejoin="round"/>`

  const wThin = far ? 1.3 : 1.8
  const wBold = Math.max(1.5, 3.4 * Math.pow(z, 0.62))
  return `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>
${lightSvg(pl, t)}${citiesSvg(pl, t)}
<path d="${thin}" fill="none" stroke="${INK}" stroke-width="${wThin}" stroke-linecap="round" stroke-linejoin="round" opacity="${far ? f1(lerp(0.75, 0.5, smooth((0.62 - z) / 0.3)) * 100) / 100 : 0.75}"/>
<path d="${mid}" fill="none" stroke="${INK}" stroke-width="3.1" stroke-linecap="round" stroke-linejoin="round"/>
<path d="${bold}" fill="none" stroke="${INK}" stroke-width="${f1(wBold)}" stroke-linecap="round" stroke-linejoin="round"/>
${ringSvg}${meSvg}`
}

/** What he is doing, for the page's "Now" line and the review sheet. */
export function grainMood(score, time) {
  const { T, c3 } = planFor(score)
  const L = score.lines
  if (time < T.stop - 2.6) return 'carried along'
  if (time < T.turn) return 'stops'
  if (time < T.ring0) return 'turned'
  if (time < L[4].start - 1.1) return 'upstream'
  if (time < T.cities[4] + 3.8) return 'pulled five ways'
  if (time < L[6].start) return 'shoved'
  if (time < L[8].start - 1.2) return 'the first to follow'
  if (time < T.newYork1) return 'no'
  if (time < T.hit0 - 1) return 'the crowd surges'
  if (time < T.hitN + 0.6) return 'driven back'
  if (time < c3[0]) return 'alone at the light'
  if (time < L[12].start - 1.1) return 'pushes off again'
  if (time < T.drop) return 'no, no, no, no'
  if (time < T.york) return 'the crowd stops'
  return 'one great arrow'
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

/** The page's jump-to list. What each is: docs/visualizers/new-york.md. */
export const GRAIN_BEATS = [
  { at: 0, label: 'Opening' },
  { at: 12, label: 'Carried along' },
  { at: 37, label: 'He turns', key: true },
  { at: 49, label: 'Upstream' },
  { at: 68, label: 'Five cities' },
  { at: 80, label: 'Four shoves' },
  { at: 88, label: 'The first to follow', key: true },
  { at: 109, label: 'No' },
  { at: 121, label: 'The crowd fights back', key: true },
  { at: 150, label: 'Alone at the light' },
  { at: 156, label: 'Again' },
  { at: 177, label: 'Twelve nos' },
  { at: 192, label: 'One great arrow', key: true },
]
