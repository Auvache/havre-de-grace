/*
 * Ghost · The Dance Card — the machinery: people who are only their
 * footprints, and the ways feet go (2026-11-10; sad feet, a red father and
 * no tantrums from 2026-11-17).
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
import { r, clamp01, lerp, easeOut } from '../../kit.mjs'
import { INK, RED } from '../../album.mjs'

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
    // `wide` < 1 brings the feet in; a negative `toe` turns the toes in.
    const w = this.w * (o.wide ?? 1)
    const s = this.put(t, cx + rx * foot * w, cy + ry * foot * w, th + foot * (o.toe ?? 5), foot, o)
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

/** Turn on the spot to face `target`: one foot, then the other. */
export function faceTo(P, t, target, o = {}) {
  const th = toward([P.x, P.y], target)
  P.step(t, P.x, P.y, th, { foot: -1, ...o })
  P.step(t + (o.gap ?? BEAT / 2), P.x, P.y, th, { foot: 1, ...o })
  return th
}

/**
 * Sad feet. The child stops: the feet come together, toes turned in, and
 * then shuffle — small slow steps, a foot every `every` beats, each dragged
 * along the floor (a scuff from where it was), turning a little further away
 * each time. `away` is the heading to drift towards (away from him); `turn`
 * how far round the feet come by the last shuffle.
 *
 *   sad(kid, { t0, n: 3, away: 60 })     the feet together at t0, then 3 shuffles
 *   sad(kid, { times: [...], away })     shuffles on given times (on the words)
 */
export function sad(P, { t0, n = 3, every = 2, away, turn, shuffle = 0.62, times, settle = true }) {
  const fields = { sad: true, toe: -19, wide: 0.9, air: 0.4, life: 1.4 }
  const from = P.th
  const to = turn ?? away
  // Turn the short way round.
  const d = ((((to - from) % 360) + 540) % 360) - 180
  const out = []
  if (settle) {
    out.push(P.step(t0, P.x, P.y, from, { ...fields, foot: -1, air: 0.25 }))
    out.push(P.step(t0 + BEAT / 2, P.x, P.y, from, { ...fields, foot: 1, air: 0.25 }))
  }
  const ts = times ?? Array.from({ length: n }, (_, i) => t0 + BEAT * (settle ? 1.5 : 0) + i * every * BEAT)
  const [ax, ay] = fwd(away)
  ts.forEach((t, i) => {
    const u = (i + 1) / ts.length
    const step = P.len * shuffle
    out.push(P.step(t, P.x + ax * step, P.y + ay * step, from + d * u, { ...fields, scuff: true }))
  })
  return out
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

/** One person's look. `outline` is the ghost: never filled, and red — the one red thing on the sheet. */
export const LOOKS = {
  dad: { shoe: SHOE.man, outline: true, wide: 1 },
  mom: { shoe: SHOE.woman, wide: 1 },
  kid: { shoe: SHOE.child, wide: 1.08 },
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

/** The father's line, in floor units at life size (the camera scales it with the floor). */
const DAD_STROKE = 4.2

/**
 * Everything on the floor at `time`, in world units: the dashed line of a
 * step and the scuff of a dragged foot under the prints, the count over
 * them. `ghost` is how much of the father there is (he thins on "I'm a ghost").
 */
export function floorSvg(story, time, ghost = 1) {
  let arrows = ''
  let scuffs = ''
  let nums = ''
  const layers = { dad: '', mom: '', kid: '' }
  for (const s of story.steps) {
    const lead = s.arrow || s.scuff ? s.air ?? 0.3 : 0
    if (s.t - lead > time) continue
    const look = LOOKS[s.who]
    // How much of him there is: his line thins (it stays red; it only goes pale as an old print fades).
    const dadK = look.outline ? Math.max(0.3, ghost * (s.thin ?? 1)) : 1
    const p = presence(s, time)
    // The dashed line of the step being taken, from where that foot was.
    if (s.arrow && s.px != null && time < s.t + 1.1) {
      const air = s.air ?? 0.3
      const u = easeOut(clamp01((time - (s.t - air)) / air))
      const o = (1 - clamp01((time - s.t - 0.2) / 0.9)) * lerp(0.5, 1, dadK)
      const d = Math.hypot(s.x - s.px, s.y - s.py)
      if (d > 8 && o > 0.01) {
        const ex = lerp(s.px, s.x, u)
        const ey = lerp(s.py, s.y, u)
        arrows += `<path d="M${r(s.px)} ${r(s.py)}L${r(ex)} ${r(ey)}" stroke="${look.outline ? RED : INK}" stroke-width="${look.outline ? 2.2 : 1.6}" stroke-dasharray="6 6" opacity="${r(o * 0.9, 2)}"/>`
      }
    }
    // A dragged foot: a soft smear along the floor from where it was, drawn as the foot slides, fading with the print.
    if (s.scuff && s.px != null) {
      const air = s.air ?? 0.4
      const u = easeOut(clamp01((time - (s.t - air)) / air))
      // The smear outlasts the print: what is left of a sad stretch is the drag.
      const o = time < s.t ? 1 : 1 - clamp01((time - s.t) / 5)
      if (o > 0.01) {
        const k = s.len / 100
        const ex = lerp(s.px, s.x, u)
        const ey = lerp(s.py, s.y, u)
        scuffs += `<path d="M${r(s.px)} ${r(s.py)}L${r(ex)} ${r(ey)}" stroke-width="${r(26 * k, 1)}" opacity="${r(0.13 * o, 3)}"/>` +
          `<path d="M${r(s.px)} ${r(s.py)}L${r(ex)} ${r(ey)}" stroke-width="${r(5 * k, 1)}" opacity="${r(0.28 * o, 3)}"/>`
      }
    }
    if (p <= 0.004) continue
    const k = s.len / 100
    const since = time - s.t
    // Coming down: pressed on from a little large. A dragged foot does not come down, it arrives.
    let scale = 1
    if (since < 0.2 && !s.scuff) {
      const u = clamp01(since / LAND)
      scale = 1 + 0.2 * (1 - easeOut(u))
      if (s.pop) scale += s.pop * 0.3 * (1 - easeOut(u))
    }
    const tf = `translate(${r(s.x)} ${r(s.y)}) rotate(${r(s.th)}) scale(${r(k * scale * s.foot * -1 * look.wide, 3)} ${r(k * scale, 3)})`
    if (look.outline) {
      const o = p * lerp(0.72, 1, dadK)
      const sw = DAD_STROKE * lerp(0.28, 1, dadK)
      if (o > 0.01) layers.dad += `<path d="${look.shoe}" transform="${tf}" stroke-width="${r(sw / (k * scale), 2)}"${o < 0.995 ? ` opacity="${r(o, 3)}"` : ''}/>`
    } else {
      // A sad foot presses lightly.
      const o = p * (s.sad ? 0.88 : 1)
      layers[s.who] += `<path d="${look.shoe}" transform="${tf}"${o < 0.995 ? ` opacity="${r(o, 3)}"` : ''}/>`
    }
    // The count, beside the foot, upright.
    if (s.num && p > 0.02) {
      const [rx, ry] = rgt(s.cth ?? s.th)
      const off = s.foot * (s.len * 0.2 + 15)
      nums += `<text x="${r(s.x + rx * off)}" y="${r(s.y + ry * off + 5)}" opacity="${r(p * 0.85, 2)}">${s.num}</text>`
    }
  }
  return `<g fill="none" stroke="${INK}" stroke-linecap="round">${scuffs}</g>` +
    `<g fill="none" stroke-linecap="round">${arrows}</g>` +
    `<g fill="none" stroke="${RED}" stroke-linejoin="round">${layers.dad}</g>` +
    `<g fill="${INK}">${layers.mom}${layers.kid}</g>` +
    `<g fill="${INK}" font-size="17" font-weight="600" text-anchor="middle">${nums}</g>`
}

/* ── After the story is laid out ──────────────────────────────────── */

/**
 * The father near the sadness: every print of his is thinner the closer it
 * comes down to a sad child (within `near` he is almost not there; beyond
 * `far` he is whole). `sources` are { t, x, y, s }.
 */
export function thinNearFire(dadSteps, sources, { near = 75, far = 300, least = 0.42, window = 0.7 } = {}) {
  for (const s of dadSteps) {
    let k = 1
    for (const f of sources) {
      if (Math.abs(f.t - s.t) > window || f.s < 0.3) continue
      const d = Math.hypot(f.x - s.x, f.y - s.y)
      k = Math.min(k, lerp(least, 1, clamp01((d - near) / (far - near))))
    }
    s.thin = k
  }
}
