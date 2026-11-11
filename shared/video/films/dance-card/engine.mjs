/*
 * Ghost · The Dance Card — the machinery: people who are only their
 * footprints, and the ways feet go (2026-11-10).
 *
 * Nothing here knows the story (story.mjs). A person is a list of prints, laid
 * out once per score: where each foot comes down and when. A frame only asks
 * which prints exist at `time`, how old each is, and which have just landed.
 *
 * World units: the floor is 1532 × 776, centred on (0, 0), y down. An angle is
 * a heading in degrees: 0 faces up the sheet, 90 faces right. A foot is -1
 * (left) or 1 (right).
 *
 * The record is on a click at 110 BPM (measured: app/config/ghostScore.ts), a
 * beat at 0.25 s. `bt(k)` is beat k; nearly every step in the film lands on
 * one, a half or a quarter.
 */
import { rng, r, clamp01, lerp, easeOut } from '../../kit.mjs'
import { INK, RED, SECOND_INK } from '../../album.mjs'

export const BPM = 110
export const BEAT = 60 / BPM
export const PHASE = 0.25
export const bt = (k) => PHASE + k * BEAT

const rad = (d) => (d * Math.PI) / 180
export const fwd = (th) => [Math.sin(rad(th)), -Math.cos(rad(th))]
export const rgt = (th) => [Math.cos(rad(th)), Math.sin(rad(th))]
/** The heading that faces along (dx, dy). */
export const heading = (dx, dy) => (Math.atan2(dx, -dy) * 180) / Math.PI
export const toward = (from, to) => heading(to[0] - from[0], to[1] - from[1])

/* ── A person ─────────────────────────────────────────────────────── */

export class Person {
  /** `len` is the foot's length; `life` how long a print he has left behind takes to fade. */
  constructor(id, len, { stride = len * 0.8, life = 5.5 } = {}) {
    this.id = id
    this.len = len
    /** Half the distance between the feet, standing. */
    this.w = len * 0.25
    this.stride = stride
    this.life = life
    this.steps = []
    this.cur = { [-1]: null, 1: null }
    this.foot = -1
    this.x = 0
    this.y = 0
    this.th = 0
  }

  /** One print, the foot's own centre at (x, y), toes to `th`. The print that foot stood on before starts to fade. */
  put(t, x, y, th, foot, o = {}) {
    const s = { who: this.id, len: this.len, t, x, y, th, foot, lift: Infinity, life: this.life, ...o }
    const prev = this.cur[foot]
    if (prev) {
      prev.lift = Math.min(prev.lift, t - (o.air ?? 0.1))
      s.px = prev.x
      s.py = prev.y
    }
    // A hop comes down on one foot: the other is in the air too.
    if (o.hop && this.cur[-foot]) {
      this.cur[-foot].lift = Math.min(this.cur[-foot].lift, t - 0.1)
      this.cur[-foot] = null
    }
    this.cur[foot] = s
    this.steps.push(s)
    this.foot = -foot
    return s
  }

  /** A step: the body comes to (cx, cy) facing `th`, and the next foot (or `o.foot`) lands beside it. */
  step(t, cx, cy, th, o = {}) {
    const foot = o.foot ?? this.foot
    const [rx, ry] = rgt(th)
    const s = this.put(t, cx + rx * foot * this.w, cy + ry * foot * this.w, th + foot * (o.toe ?? 5), foot, o)
    s.cx = cx
    s.cy = cy
    s.cth = th
    this.x = cx
    this.y = cy
    this.th = th
    return s
  }

  /** The other foot is brought alongside. */
  close(t, o = {}) {
    return this.step(t, this.x, this.y, this.th, o)
  }

  /** Both feet come down together at (cx, cy): arriving out of nowhere, set down, or a two-footed jump. */
  place(t, cx, cy, th, o = {}) {
    return [this.step(t, cx, cy, th, { ...o, foot: -1 }), this.step(t + (o.gap ?? 0), cx, cy, th, { ...o, foot: 1 })]
  }

  /** Both feet leave the floor (picked up, or gone through the door). What is left fades over `life`. */
  liftAll(t, life) {
    for (const f of [-1, 1]) {
      const s = this.cur[f]
      if (!s) continue
      s.lift = Math.min(s.lift, t)
      if (life != null) s.life = life
      this.cur[f] = null
    }
  }

  /** Where the body is at `t`: between the last print of each foot. */
  where(t) {
    let L = null
    let R = null
    for (const s of this.steps) {
      if (s.t > t) continue
      if (s.foot < 0) { if (!L || s.t >= L.t) L = s }
      else if (!R || s.t >= R.t) R = s
    }
    if (L && R) return [(L.x + R.x) / 2, (L.y + R.y) / 2]
    const one = L ?? R
    return one ? [one.x, one.y] : [this.x, this.y]
  }
}

/* ── Lines to walk ────────────────────────────────────────────────── */

/** A polyline by distance: { L, at(d), dir(d) }. */
export function polyline(pts) {
  const cum = [0]
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  const L = cum.at(-1)
  const seg = (d) => {
    let i = 1
    while (i < pts.length - 1 && cum[i] < d) i++
    return i
  }
  const at = (d) => {
    if (pts.length === 1) return [pts[0][0], pts[0][1]]
    const dd = Math.max(0, Math.min(L, d))
    const i = seg(dd)
    const u = (dd - cum[i - 1]) / (cum[i] - cum[i - 1] || 1)
    return [lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]
  }
  const dir = (d) => {
    if (pts.length === 1) return 0
    const i = seg(Math.max(0.001, Math.min(L, d)))
    return heading(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
  }
  return { pts, L, at, dir }
}

/** A curve through the points (Catmull-Rom), sampled finely enough to walk. */
export function smooth(pts, per = 14) {
  if (pts.length < 3) return pts
  const out = [pts[0]]
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    for (let j = 1; j <= per; j++) {
      const u = j / per
      const u2 = u * u
      const u3 = u2 * u
      out.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (p2[k] - p0[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 + (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * u3)))
    }
  }
  return out
}

/** An arc of a circle as points: angles in degrees, 0 to the right, 90 down the sheet. */
export function arc(c, R, a0, a1, R1 = R) {
  const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 6))
  return Array.from({ length: n + 1 }, (_, i) => {
    const u = i / n
    const a = rad(lerp(a0, a1, u))
    const rr = lerp(R, R1, u)
    return [c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr]
  })
}

/* ── Ways of going ────────────────────────────────────────────────── */

/**
 * Walk a line, left, right, left. The line starts where the person stands
 * (`from` to start it elsewhere). Steps land every `per` from `t0` (or so that
 * the last lands at `arrive`); `n` steps, or as many as the stride asks for.
 *
 *   stop    stop this far short of the line's end
 *   side    walk this far to the right of the line (abreast of someone on it)
 *   face    keep facing this way whatever the line does (walking backwards)
 *   curve   run a curve through the points
 *   close   bring the other foot alongside at the end (default; `closeAt`)
 *   print   extra fields for every print, or (i, n) → fields
 *
 * Returns the prints, the closing one included.
 */
export function walk(P, pts, o = {}) {
  const raw = [o.from ?? [P.x, P.y], ...pts]
  const ln = polyline(o.curve ? smooth(raw) : raw)
  const span = Math.max(0, ln.L - (o.stop ?? 0))
  const n = o.times?.length ?? o.n ?? Math.max(1, Math.round(span / (o.stride ?? P.stride)))
  const per = o.per ?? BEAT
  const t0 = o.arrive != null ? o.arrive - (n - 1) * per : o.t0
  const out = []
  let t = t0
  for (let i = 0; i < n; i++) {
    t = o.times ? o.times[i] : t0 + i * per
    const d = o.dist ? o.dist(i, n, span) : (span * (i + 1)) / n
    const [x, y] = ln.at(d)
    const along = ln.dir(d)
    const sd = typeof o.side === 'function' ? o.side(i, n) : o.side ?? 0
    const [rx, ry] = rgt(along)
    const extra = typeof o.print === 'function' ? o.print(i, n) : o.print
    out.push(P.step(t, x + rx * sd, y + ry * sd, o.face ?? along, extra))
  }
  if (o.close !== false) {
    const extra = typeof o.print === 'function' ? o.print(n, n) : o.print
    out.push(P.close(o.closeAt ?? t + per, extra))
  }
  return out
}

/**
 * The box step in four: slow, quick, quick. Forward on the left, side on the
 * right, close; back on the right, side on the left, close. A half is four
 * beats, its steps on beats 1, 3 and 4. The person stands at `c` (the box's
 * back left corner) facing `th`, feet together.
 */
export function boxStep(P, { c, th, size, k0, halves, num = true, print = {} }) {
  const [fx, fy] = fwd(th)
  const [rx, ry] = rgt(th)
  const corner = (a, b) => [c[0] + fx * size * a + rx * size * b, c[1] + fy * size * a + ry * size * b]
  const out = []
  for (let h = 0; h < halves; h++) {
    const k = k0 + 4 * h
    const odd = h % 2
    // [beat, corner, foot]
    const moves = odd
      ? [[0, corner(0, 1), 1], [2, corner(0, 0), -1], [3, corner(0, 0), 1]]
      : [[0, corner(1, 0), -1], [2, corner(1, 1), 1], [3, corner(1, 1), -1]]
    moves.forEach(([b, at, foot], i) => {
      out.push(P.step(bt(k + b), at[0], at[1], th, { foot, toe: 0, arrow: true, air: 0.3, ...(num ? { num: String(odd * 3 + i + 1) } : {}), ...print }))
    })
  }
  return out
}

/** A child standing on his feet, facing him: her prints on his, toes to his heels, wherever his go. */
export function onFeet(kid, steps, o = {}) {
  for (const s of steps) {
    // On the front of his shoe, a little askew, so it reads as a small foot on a big one.
    const [fx, fy] = fwd(s.th)
    kid.put(s.t, s.x + fx * s.len * 0.14, s.y + fy * s.len * 0.14, s.th + 180 + s.foot * 9, -s.foot, { ...o })
  }
  const last = steps.at(-1)
  if (last) { kid.x = last.cx; kid.y = last.cy; kid.th = last.cth + 180 }
}

/** A partner in hold, facing him a foot's length off: the same steps, mirrored. */
export function partner(P, steps, gap, o = {}) {
  for (const s of steps) {
    const [fx, fy] = fwd(s.cth)
    const [rx, ry] = rgt(s.cth)
    // His left foot's side of the pair is her right foot.
    const lateral = s.foot * P.w
    P.put(s.t, s.cx + fx * gap + rx * lateral, s.cy + fy * gap + ry * lateral, s.cth + 180, -s.foot, { arrow: s.arrow, air: s.air, ...o })
    P.x = s.cx + fx * gap
    P.y = s.cy + fy * gap
    P.th = s.cth + 180
  }
}

/** Follow the leader: step into his prints, `delay` after he made them. */
export function inPrints(kid, steps, delay, o = {}) {
  for (const s of steps) {
    kid.put(s.t + delay, s.x, s.y, s.th, s.foot, { ...o })
    kid.x = s.cx
    kid.y = s.cy
    kid.th = s.cth
  }
}

/**
 * Ring a ring o' roses: everyone on one circle facing its middle, a side step
 * and a close to every beat. `phis` are where each starts (degrees, 0 to the
 * right, 90 down); the ring turns `dphi` a beat.
 */
export function ring(people, { c, R, k0, beats, dphi, phis, print = {} }) {
  const at = (phi) => [c[0] + Math.cos(rad(phi)) * R, c[1] + Math.sin(rad(phi)) * R]
  for (let i = 0; i < beats; i++) {
    people.forEach((P, j) => {
      const phi = phis[j] + dphi * (i + 1)
      const p = at(phi)
      const th = toward(p, c)
      // Facing the middle and going clockwise on the sheet is going to one's left.
      const lead = dphi > 0 ? -1 : 1
      P.step(bt(k0 + i), p[0], p[1], th, { foot: lead, toe: 0, ...print })
      P.step(bt(k0 + i + 0.5), p[0], p[1], th, { foot: -lead, toe: 0, ...print })
    })
  }
}

/** Rocking on the spot: side, close, side, close, a foot every `every` beats. */
export function sway(P, { k0, k1, every = 1, amp = 14, print }) {
  const [x0, y0, th] = [P.x, P.y, P.th]
  const [rx, ry] = rgt(th)
  // left, close, right, close…
  const seq = [[-1, -1], [1, -1], [1, 1], [-1, 1]]
  let i = 0
  for (let k = k0; k < k1 - 0.001; k += every, i++) {
    const [foot, side] = seq[i % 4]
    P.step(bt(k), x0 + rx * side * amp * 0.5, y0 + ry * side * amp * 0.5, th, { foot, ...print })
  }
  P.x = x0
  P.y = y0
}

/**
 * A tantrum: stamping on the spot, left, right, harder and faster as `I(t)`
 * climbs — a stamp a beat when it is low, two when it is up, four when it is
 * at its worst. `at(t)` is where (a child can stamp its way across the floor).
 * Below 0.45 the red goes out of the prints.
 */
export function tantrum(P, { at, th, t0, t1, I, seed = 1 }) {
  const rand = rng(seed)
  let t = t0
  let last = null
  while (t < t1 - 0.02) {
    const i = Math.max(0.05, I(t))
    const [x, y] = typeof at === 'function' ? at(t) : at
    const j = 8 + 18 * Math.min(i, 1.6)
    last = P.step(t, x + (rand() - 0.5) * j, y + (rand() - 0.5) * j, (typeof th === 'function' ? th(t) : th) + (rand() - 0.5) * 46 * Math.min(1.3, i + 0.2), {
      red: clamp01(i / 0.45),
      stomp: i,
      life: 0.5 + 0.5 * clamp01(1 - i),
      air: 0.05,
      toe: 10,
      seed: Math.floor(rand() * 1000),
    })
    t += i >= 1.3 ? BEAT / 4 : i >= 0.5 ? BEAT / 2 : BEAT
  }
  return last
}

/* ── The marks ────────────────────────────────────────────────────── */

/*
 * Three feet, each drawn as a left foot 100 long, toes up, centred. A man's
 * shoe: a broad sole and a square heel. A woman's: a pointed sole and a small
 * round heel, the way a printed dance diagram tells the lady's steps from the
 * gentleman's. The children are barefoot: a small sole and five toes, so a
 * child's print is a child's at any size and says which way it faces (on his
 * shoes, they face him).
 */
const SHOE = {
  man: 'M-2 -50C10 -50 19 -37 19 -18C19 -4 15 6 13 13L-14 13C-18 2 -21 -12 -20 -27C-19 -41 -12 -50 -2 -50ZM-13 21L13 21C14 33 13 44 7 49C3 51 -4 51 -8 49C-14 44 -14 33 -13 21Z',
  woman: 'M2 -50C9 -40 17 -24 16 -6C15 3 12 10 9 15L-10 15C-14 7 -17 -5 -16 -19C-14 -34 -6 -45 2 -50ZM0 24A10 10 0 1 0 0.01 24Z',
  child: 'M-2 -30C10 -32 20 -24 20 -12C20 0 12 8 11 20C10 34 12 44 2 49C-8 52 -15 44 -15 32C-15 18 -20 6 -21 -8C-22 -22 -14 -29 -2 -30ZM5 -41a8 8 0 1 0 16 0a8 8 0 1 0 -16 0ZM-6 -45.5a6 6 0 1 0 12 0a6 6 0 1 0 -12 0ZM-15.2 -43a5.2 5.2 0 1 0 10.4 0a5.2 5.2 0 1 0 -10.4 0ZM-22.1 -37a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0 -9.2 0ZM-26.5 -29a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z',
}

const GREY = SECOND_INK.ghost

/** One person's look. `outline` is the ghost: never filled. */
export const LOOKS = {
  dad: { shoe: SHOE.man, outline: true, wide: 1 },
  mom: { shoe: SHOE.woman, wide: 1 },
  a: { shoe: SHOE.child, wide: 1.05 },
  b: { shoe: SHOE.child, wide: 1.12 },
}

const mix = (a, b, u) => {
  const ch = (hex, i) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16)
  return `#${[0, 1, 2].map((i) => Math.round(lerp(ch(a, i), ch(b, i), u)).toString(16).padStart(2, '0')).join('')}`
}

/** How long a print takes to come down. */
const LAND = 0.09
/** What a print fades to the moment the foot leaves it, and then on to nothing over its life. */
const LEFT = 0.5

/** The opacity of a print at `time`, 0 if it is not on the floor. */
function presence(s, time) {
  if (time < s.t) return 0
  const on = Math.min(1, (time - s.t) / (LAND * 0.6))
  if (s.keep || time <= s.lift) return on
  const age = time - s.lift
  if (age >= s.life) return 0
  const drop = lerp(1, LEFT, clamp01(age / 0.25))
  return on * drop * (1 - age / s.life) ** 1.3
}

/**
 * Everything on the floor at `time`, in world units: arrows under prints
 * under numbers under the red. `ghost(time)` is how much of the father there
 * is (he thins on "I'm a ghost").
 */
export function floorSvg(story, time, ghost = 1) {
  let arrows = ''
  let nums = ''
  let shocks = ''
  const layers = { dad: '', mom: '', a: '', b: '' }
  for (const s of story.steps) {
    if (s.t - (s.arrow ? s.air ?? 0.3 : 0) > time) continue
    const look = LOOKS[s.who]
    const dadK = look.outline ? Math.max(0.34, ghost * (s.thin ?? 1)) : 1
    // The dashed line of the step being taken, from where that foot was.
    if (s.arrow && s.px != null && time < s.t + 1.1) {
      const air = s.air ?? 0.3
      const u = easeOut(clamp01((time - (s.t - air)) / air))
      const o = (1 - clamp01((time - s.t - 0.2) / 0.9)) * dadK
      const d = Math.hypot(s.x - s.px, s.y - s.py)
      if (d > 8 && o > 0.01) {
        const ex = lerp(s.px, s.x, u)
        const ey = lerp(s.py, s.y, u)
        arrows += `<path d="M${r(s.px)} ${r(s.py)}L${r(ex)} ${r(ey)}" stroke="${look.outline ? GREY : INK}" stroke-width="${look.outline ? 2 : 1.6}" stroke-dasharray="6 6" opacity="${r(o * 0.9, 2)}"/>`
      }
    }
    const p = presence(s, time)
    if (p <= 0.004) continue
    const k = s.len / 100
    const since = time - s.t
    const S = s.stomp ?? 0
    // Coming down: pressed on from a little large; a stamp from larger, and past its size and back.
    let scale = 1
    if (since < 0.2) {
      const u = clamp01(since / (S ? 0.16 : LAND))
      scale = S ? 1 + (0.55 + 0.25 * Math.min(S, 1.6)) * (1 - easeOut(u)) - 0.07 * Math.sin(Math.PI * clamp01(since / 0.2)) : 1 + 0.2 * (1 - easeOut(u))
      if (s.pop) scale += s.pop * 0.3 * (1 - easeOut(u))
    }
    const tf = `translate(${r(s.x)} ${r(s.y)}) rotate(${r(s.th)}) scale(${r(k * scale * s.foot * -1 * look.wide, 3)} ${r(k * scale, 3)})`
    if (look.outline) {
      const o = p * dadK * (s.keep ? 0.92 : 1)
      if (o > 0.01) layers.dad += `<path d="${look.shoe}" transform="${tf}" stroke-width="${r(3 / (k * scale), 2)}"${o < 0.995 ? ` opacity="${r(o, 3)}"` : ''}/>`
    } else {
      const red = s.red ?? 0
      layers[s.who] += `<path d="${look.shoe}" transform="${tf}"${red > 0.01 ? ` fill="${red > 0.99 ? RED : mix(INK, RED, red)}"` : ''}${p < 0.995 ? ` opacity="${r(p, 3)}"` : ''}/>`
    }
    // The count, beside the foot, upright.
    if (s.num && p > 0.02) {
      const [rx, ry] = rgt(s.cth ?? s.th)
      const off = s.foot * (s.len * 0.2 + 15)
      nums += `<text x="${r(s.x + rx * off)}" y="${r(s.y + ry * off + 5)}" opacity="${r(p * dadK * 0.85, 2)}">${s.num}</text>`
    }
    // The stamp's shock: short strokes thrown outwards, gone in a third of a second.
    if (S > 0.3 && since < 0.34 && (s.red ?? 0) > 0.3) shocks += shockSvg(s.x, s.y, s.len * 0.62, S, since / 0.34, s.seed ?? 1, s.red)
  }
  for (const b of story.bursts) {
    const since = time - b.t
    if (since < 0 || since >= 0.42) continue
    shocks += shockSvg(b.x, b.y, 30, b.s, since / 0.42, b.seed, 1, true)
  }
  return `<g fill="none" stroke-linecap="round">${arrows}</g>` +
    `<g fill="none" stroke="${GREY}" stroke-linejoin="round">${layers.dad}</g>` +
    `<g fill="${INK}">${layers.mom}${layers.a}${layers.b}</g>` +
    `<g fill="${INK}" font-size="17" font-weight="600" text-anchor="middle">${nums}</g>` +
    `<g fill="none" stroke="${RED}" stroke-linecap="round">${shocks}</g>`
}

/** Strokes thrown out from (x, y): `u` 0–1 through their life. */
function shockSvg(x, y, r0, S, u, seed, red = 1, cry = false) {
  const n = cry ? 7 + Math.round(2 * Math.min(S, 1.6)) : 6 + Math.round(2.5 * Math.min(S, 1.6))
  const e = easeOut(u)
  const reach = (cry ? 34 : 20) + 44 * Math.min(S, 1.8)
  const a = r0 + reach * e * 0.75
  const b = a + (9 + 20 * Math.min(S, 1.8)) * (1 - 0.55 * e)
  let d = ''
  for (let i = 0; i < n; i++) {
    const th = ((i + (seed % 7) / 7) / n) * Math.PI * 2
    const wob = 1 + 0.16 * Math.sin(i * 2.3 + seed)
    d += `M${r(x + Math.cos(th) * a * wob)} ${r(y + Math.sin(th) * a * wob)}L${r(x + Math.cos(th) * b * wob)} ${r(y + Math.sin(th) * b * wob)}`
  }
  return `<path d="${d}" stroke-width="${r(2.2 + 1.5 * Math.min(S, 1.6), 1)}" opacity="${r((1 - u) ** 0.8 * clamp01(red) * (cry ? 0.9 : 1), 2)}"/>`
}

/* ── After the story is laid out ──────────────────────────────────── */

/**
 * The father near the fire: every print of his is thinner the closer it comes
 * down to a stamping or screaming child (within `near` he is almost not
 * there; beyond `far` he is whole).
 */
export function thinNearFire(dadSteps, sources, { near = 75, far = 300, least = 0.42 } = {}) {
  for (const s of dadSteps) {
    let k = 1
    for (const f of sources) {
      if (Math.abs(f.t - s.t) > 0.7 || f.s < 0.3) continue
      const d = Math.hypot(f.x - s.x, f.y - s.y)
      k = Math.min(k, lerp(least, 1, clamp01((d - near) / (far - near))))
    }
    s.thin = k
  }
}
