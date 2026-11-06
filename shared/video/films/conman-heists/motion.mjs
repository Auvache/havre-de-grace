/*
 * Job 1, the record shop on the circle, in motion: three ways to play it
 * (exploration, 2026-11-05). Each is a film function, frame({ time, score }),
 * run from 16 s to 52 s of the song (the job is 23.3–42.3, the getaway
 * 42.3–50.5):
 *
 *   motionPush    — from the whole town into the west circle while the plan
 *                   inks itself, held for the job, pulled back down Main
 *                   Street with the getaway.
 *   motionPen     — one fixed sheet: the plan drawn on line by line and
 *                   lettered, the job walked, then the plan settles into the
 *                   town and only the red stays bright.
 *   motionFollow  — close on the conman: the plan is only what he has seen,
 *                   the camera stays with him, the shop opens whole as he
 *                   leaves.
 *
 *   FILM_MODULE=tools/video-styles/conman-explore/motion.mjs FILM_EXPORT=motionPush \
 *     SONG=conman node tools/video-styles/mp4.mjs --from 16 --to 52
 */
import { COVER_SHEET, INK, PAPER, RED, paper, marginLyric } from '../../album.mjs'
import { TOWNS, CAMS, cam, titleBlock, north } from './styles.mjs'
import { atlasPlan, legend, schedule } from './atlas-plan.mjs'
import { SHOPS } from './shop.mjs'
import { STOCK_Y, BALLS, BALL_R } from './city.mjs'

export const JOB = SHOPS.find((j) => j.key === 'circle')
const { x: PX, y: PY, w: PW, h: PH } = COVER_SHEET.plate
export const r = (v, d = 1) => Math.round(v * 10 ** d) / 10 ** d
export const lerp = (a, b, u) => a + (b - a) * u
export const clamp01 = (v) => Math.max(0, Math.min(1, v))
export const ramp = (t, a, b) => clamp01((t - a) / (b - a))
export const ease = (u) => (u < 0.5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2)
const easeOut = (u) => 1 - (1 - u) ** 3
export const rad = (d) => (d * Math.PI) / 180
export const W = (p) => [p[0] + JOB.o[0], p[1] + JOB.o[1]]
export const SHEET = ['THE RECORD SHOP', 'JOB No. 1 · 1968', 'SHEET 1/6']

/* ── Cameras ─────────────────────────────────────────────────────────── */

export const PLAN = { cx: JOB.o[0] + JOB.view[0], cy: JOB.o[1] + JOB.view[1], s: JOB.view[2] }
const TOWN = { cx: CAMS.overview.cx, cy: CAMS.overview.cy, s: CAMS.overview.s }
export const STREET = { cx: 400, cy: 300, s: 2.5 }

/** Between two views, as a zoom should travel: scale in log, the centre held still on screen. */
export function zoom(a, b, u) {
  const s = Math.exp(lerp(Math.log(a.s), Math.log(b.s), u))
  const w = Math.abs(1 / b.s - 1 / a.s) < 1e-9 ? u : (1 / s - 1 / a.s) / (1 / b.s - 1 / a.s)
  return { cx: lerp(a.cx, b.cx, w), cy: lerp(a.cy, b.cy, w), s }
}
export const camOf = (v) => cam(v.cx, v.cy, v.s)

/* ── Where people are ────────────────────────────────────────────────── */

/** The plan's walker, returning a position (job metres) and the arrival/leave times (atlas-plan's `schedule`, so pins work). */
export function timing(pts, from, to) {
  const { arrive, leave } = schedule(pts, from, to)
  const at = (t) => {
    if (t <= from) return pts[0]
    const i = arrive.findLastIndex((a) => a <= t)
    if (t < leave[i] || i === pts.length - 1) return pts[i]
    const u = clamp01((t - leave[i]) / (arrive[i + 1] - leave[i]))
    return [lerp(pts[i][0], pts[i + 1][0], u), lerp(pts[i][1], pts[i + 1][1], u)]
  }
  return { arrive, leave, at }
}

export const CONMAN = JOB.crew[0]
export const CT = timing(CONMAN.pts, CONMAN.from, CONMAN.to)
const idx = (note) => CONMAN.pts.findIndex((p) => p[3] === note)
const TALK_END = CT.leave[idx('talks shop')]
const SAFE_OUT = CT.leave[idx('opens the safe')]

/*
 * The owner, choreographed to the conman rather than pacing: at the counter,
 * talking with him, then off to the stock room for a box while he goes round
 * the counter, back once he is out of the office.
 */
const COUNTER = [44, -46.5]
const STOCK = [[44, -57.2], [46.6, -57.2], [47.2, -59]]
const toPolar = ([R, d]) => {
  const a = rad(d)
  return [R * Math.cos(a), R * Math.sin(a)]
}
const OWNER_GO = [COUNTER, ...STOCK].map(toPolar)
const OWNER_BACK = OWNER_GO.slice().reverse()
const goT = timing(OWNER_GO.map((p, i) => (i === OWNER_GO.length - 1 ? [...p, 0] : p)), TALK_END + 0.4, TALK_END + 3.6)
const backT = timing(OWNER_BACK, SAFE_OUT + 2.4, SAFE_OUT + 5.8)
const ownerAt = (t) => (t < SAFE_OUT + 2.4 ? goT.at(t) : backT.at(t))

/*
 * The getaway: out of the staff door and straight on to the next job, the
 * empty shop beside the counting house (heist 2's TO LET door). He leaves at
 * once, at full pace, and slows only as he arrives (no hesitation).
 */
const EXIT = W(CONMAN.pts.at(-1))
export const NEXT_DOOR = [552 + 5.3, 280 + 31]
const GETAWAY = [EXIT, [EXIT[0] + 4, STOCK_Y - 2], [NEXT_DOOR[0], STOCK_Y - 2], NEXT_DOOR]
export const GET_FROM = CONMAN.to
export const GET_TO = 55.6
/** Leaves at the average speed, eases to a stop: a Hermite curve with the far tangent flat. */
const depart = (x) => -(x ** 3) + x * x + x
export function getawayAt(t) {
  const u = depart(ramp(t, GET_FROM, GET_TO))
  const lens = GETAWAY.slice(1).map((p, i) => Math.hypot(p[0] - GETAWAY[i][0], p[1] - GETAWAY[i][1]))
  const total = lens.reduce((a, b) => a + b, 0)
  let d = u * total
  const walked = [GETAWAY[0]]
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i]) { walked.push([lerp(GETAWAY[i][0], GETAWAY[i + 1][0], d / lens[i]), lerp(GETAWAY[i][1], GETAWAY[i + 1][1], d / lens[i])]); break }
    walked.push(GETAWAY[i + 1])
    d -= lens[i]
  }
  return walked
}

/** Where the conman is, in town metres, through the job and the getaway. */
export const headAt = (t) => (t < GET_FROM ? W(CT.at(t)) : getawayAt(t).at(-1))
/** The head, smoothed over two seconds, for a camera that follows. */
export function followAt(t, span = 1.2) {
  let x = 0
  let y = 0
  const n = 13
  for (let k = 0; k < n; k++) {
    const p = headAt(t - span + (2 * span * k) / (n - 1))
    x += p[0]
    y += p[1]
  }
  return [x / n, y / n]
}

/* ── The plan, part-drawn ────────────────────────────────────────────── */

const KIND_ORDER = { ext: 0, heavy: 1, int: 2 }
const segLen = (q) => (q.arc ? q.arc.R * rad(q.arc.d1 - q.arc.d0) : Math.hypot(q.b[0] - q.a[0], q.b[1] - q.a[1]))
const SEGS = JOB.walls.segs.slice().sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind])
const WALL_LEN = SEGS.reduce((s, q) => s + segLen(q), 0)
const slice = (str, u) => String(str).slice(0, Math.round(String(str).length * u))

/**
 * The job as drawn by progress p (0–1): walls by length (outside first), then
 * glass and doors, then the furniture, then the words lettered on.
 */
export function drawn(p, { owner = true } = {}) {
  const pw = ramp(p, 0, 0.5)
  let left = pw * WALL_LEN
  const segs = []
  for (const q of SEGS) {
    const L = segLen(q)
    if (left <= 0) break
    const u = Math.min(1, left / L)
    left -= L
    segs.push(q.arc ? { ...q, arc: { ...q.arc, d1: q.arc.d0 + (q.arc.d1 - q.arc.d0) * u } } : { ...q, b: [lerp(q.a[0], q.b[0], u), lerp(q.a[1], q.b[1], u)] })
  }
  const pg = ramp(p, 0.5, 0.62)
  const items = JOB.items.slice(0, Math.floor(ramp(p, 0.62, 0.8) * JOB.items.length + 0.001))
  const pt = ramp(p, 0.8, 1)
  const words = (list) => list.map((w, i) => {
    const u = clamp01(pt * list.length - i)
    return [w[0], w[1], slice(w[2], u), ...w.slice(3)]
  })
  return {
    ...JOB,
    tone: p > 0.55 ? JOB.tone : [],
    walls: {
      segs,
      glass: JOB.walls.glass.slice(0, Math.floor(pg * JOB.walls.glass.length + 0.001)),
      doors: JOB.walls.doors.slice(0, Math.floor(pg * JOB.walls.doors.length + 0.001)),
      panels: pg >= 1 ? JOB.walls.panels : [],
    },
    items: items.map((it) => ({ ...it, label: it.label ? slice(it.label, pt) : it.label })),
    rooms: words(JOB.rooms),
    marks: words(JOB.marks),
    storeys: p >= 1 ? JOB.storeys : [],
    owner: null,
    owners: owner ? [] : [],
    crew: [],
  }
}

/** The owner, as a single point (no pacing loop), and the way he goes. */
export function ownerSvg(c, t, opacity = 1) {
  const A = (p) => [c.X(p[0] + JOB.o[0]), c.Y(p[1] + JOB.o[1])]
  const [gx, gy] = A(ownerAt(t))
  const path = OWNER_GO.map((p, i) => `${i ? 'L' : 'M'}${A(p).map((v) => r(v)).join(' ')}`).join('')
  return `<g opacity="${r(opacity, 3)}"><path d="${path}" stroke="${INK}" stroke-width="1" stroke-dasharray="1 5" stroke-linecap="round" fill="none" opacity="0.6"/><circle cx="${r(gx)}" cy="${r(gy)}" r="7" fill="${PAPER}" stroke="${INK}" stroke-width="2"/><circle cx="${r(gx)}" cy="${r(gy)}" r="2.4" fill="${INK}"/></g>`
}

/** The job with its words taken off, for far views where they would pile up. */
const bare = (job) => ({
  ...job, rooms: [], marks: [], storeys: [],
  items: job.items.map((it) => ({ ...it, label: '' })),
  crew: job.crew.map((cr) => ({ ...cr, pts: cr.pts.map((p) => [p[0], p[1], p[2], undefined, p[4], p[5], p[6]]) })),
  figures: (job.figures ?? []).map((f) => ({ ...f, pts: f.pts.map((p) => [p[0], p[1], p[2], undefined, p[4], p[5], p[6]]) })),
})
/** Words fade out as the plan gets small on screen (under ~11 px a metre). */
const wordsAt = (c) => ease(ramp(c.s, 8, 13))
export function plan(job, c, t, uid) {
  const a = wordsAt(c)
  if (a >= 1) return atlasPlan(job, c, t, uid)
  if (a <= 0) return atlasPlan(bare(job), c, t, `${uid}b`)
  return `<g opacity="${r(a, 3)}">${atlasPlan(job, c, t, uid)}</g><g opacity="${r(1 - a, 3)}">${atlasPlan(bare(job), c, t, `${uid}b`)}</g>`
}

const EMPTY = { segs: [], doors: [], glass: [], panels: [] }
/** When the conman is first seen, standing on the circle outside the shop, before he goes in on the first line. */
export const WAIT1 = 21.6
/** Only the crew (route, notes, head), from the plan's own renderer. */
export function crewSvg(c, t, uid) {
  if (t < WAIT1) return ''
  const svg = plan({ ...JOB, crew: JOB.crew.map((cr) => ({ ...cr, wait: WAIT1 })), foot: [], tone: [], walls: EMPTY, items: [], rooms: [], marks: [], storeys: [], dims: [], owner: null, owners: [], sheets: [] }, c, Math.min(t, CONMAN.to + 0.05), `${uid}-c`)
  // Once he is in the car, his mark goes with the car.
  return t < GET_FROM ? svg : svg.replace(new RegExp(`<circle[^>]*r="10.5" fill="${RED}"/><text[^>]*>1</text>`, 'g'), '')
}

/** The getaway in red, in screen space, with his mark at its head. */
export function getawaySvg(c, t) {
  if (t < GET_FROM) return ''
  const pts = getawayAt(t).map(([x, y]) => [c.X(x), c.Y(y)])
  const head = pts.at(-1)
  return `<path d="M${pts.map((p) => p.map((v) => r(v)).join(' ')).join('L')}" stroke="${RED}" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" fill="none"/><circle cx="${r(head[0])}" cy="${r(head[1])}" r="10.5" fill="${RED}"/><text x="${r(head[0])}" y="${r(head[1] + 4.6)}" font-size="13" font-weight="700" fill="${PAPER}" text-anchor="middle">1</text>`
}

/* ── The sheet ───────────────────────────────────────────────────────── */

export function sheet({ c, uid, time, score, body, chrome = 1, key = chrome, town: withTown = true, job = JOB, titles = SHEET }) {
  const town = withTown ? `<g opacity="0.55">${TOWNS.atlas(c, uid)}</g>` : ''
  const furniture = (chrome > 0 ? `<g opacity="${r(chrome, 3)}">${north()}${titleBlock(titles)}</g>` : '') + (key > 0 ? `<g opacity="${r(key, 3)}">${legend(job)}</g>` : '')
  return `${paper(COVER_SHEET)}<defs><clipPath id="${uid}-plate"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}"/></clipPath></defs>
<g clip-path="url(#${uid}-plate)"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>${town}${body}${furniture}</g>${marginLyric({ now: time, score, uid, sheet: COVER_SHEET })}`
}

/* ── A · Push in ─────────────────────────────────────────────────────── */

export function motionPush({ time, score, uid = 'film' }) {
  const t = time
  let v
  if (t < 18) v = TOWN
  else if (t < 23.2) v = zoom(TOWN, PLAN, ease(ramp(t, 18, 23.2)))
  else if (t < 42.6) v = zoom(PLAN, { ...PLAN, s: PLAN.s * 1.08 }, ramp(t, 23.2, 42.6))
  else {
    const held = { ...PLAN, s: PLAN.s * 1.08 }
    const u = ease(ramp(t, 42.6, 50.8))
    v = zoom(held, STREET, u)
  }
  const c = camOf(v)
  const p = ease(ramp(t, 19.6, 23.4))
  const planned = p > 0 ? plan(drawn(p), c, t, `${uid}-p`) : ''
  const owner = ownerSvg(c, t, ramp(t, 22.6, 23.4))
  const body = `${planned}${owner}${crewSvg(c, t, uid)}${getawaySvg(c, t)}`
  const chrome = Math.min(ramp(t, 21.6, 23.2), 1 - ramp(t, 44.5, 46))
  return { svg: sheet({ c, uid, time: t, score, body, chrome }), label: 'Push in' }
}

/* ── B · Pen and ink ─────────────────────────────────────────────────── */

export function motionPen({ time, score, uid = 'film' }) {
  const t = time
  const c = camOf(zoom(PLAN, { ...PLAN, s: PLAN.s * 1.06 }, ramp(t, 16, 52)))
  const p = ramp(t, 16.4, 23.2)
  const settle = 1 - 0.45 * ease(ramp(t, 44.5, 49.5))
  const planned = p > 0 ? plan(drawn(p), c, t, `${uid}-p`) : ''
  const owner = ownerSvg(c, t, ramp(t, 22.4, 23.2))
  const body = `<g opacity="${r(settle, 3)}">${planned}${owner}</g>${crewSvg(c, t, uid)}${getawaySvg(c, t)}`
  return { svg: sheet({ c, uid, time: t, score, body, chrome: ramp(t, 22.2, 23.2) }), label: 'Pen and ink' }
}

/* ── C · Following ───────────────────────────────────────────────────── */

const SEEN_R = 6.4
/** Points along what he has walked, a metre apart, for the mask. */
function seenPts(t) {
  const pts = []
  const step = 0.25
  for (let q = CONMAN.from; q <= Math.min(t, CONMAN.to); q += step) pts.push(CT.at(q))
  return pts
}

export function motionFollow({ time, score, uid = 'film' }) {
  const t = time
  const CLOSE = 42
  const door = W(CONMAN.pts[1])
  const start = { cx: door[0] - 4, cy: door[1] + 4, s: 18 }
  let v
  if (t < 23.3) v = zoom(start, { cx: door[0], cy: door[1], s: CLOSE }, ease(ramp(t, 17, 23.3)))
  else {
    const [fx, fy] = followAt(t)
    const enter = ease(ramp(t, 23.3, 25.5))
    const follow = { cx: lerp(door[0], fx, enter), cy: lerp(door[1], fy, enter), s: CLOSE }
    if (t < 42.0) v = follow
    else {
      // As he leaves, the camera lets him go: back to see the whole shop and the street door, then all of Main Street.
      const MID = { cx: 222, cy: 300, s: 12 }
      v = t < 44.8 ? zoom(follow, MID, ease(ramp(t, 42.0, 44.8))) : zoom(MID, STREET, ease(ramp(t, 44.8, 51)))
    }
  }
  const c = camOf(v)
  const A = (p) => [c.X(p[0] + JOB.o[0]), c.Y(p[1] + JOB.o[1])]

  // What he can see: soft discs along his walk; the whole shop once he is out.
  const R = SEEN_R * c.s
  const whole = ease(ramp(t, 42.3, 45))
  const discs = seenPts(t).filter((_, i, a) => i % 2 === 0 || i === a.length - 1).map((p) => {
    const [x, y] = A(p)
    return `<circle cx="${r(x)}" cy="${r(y)}" r="${r(R)}" fill="url(#${uid}-soft)"/>`
  }).join('')
  const mask = `<defs><radialGradient id="${uid}-soft"><stop offset="0.55" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<mask id="${uid}-seen" maskUnits="userSpaceOnUse" x="0" y="0" width="1600" height="900"><rect width="1600" height="900" fill="#fff" opacity="${r(whole, 3)}"/>${discs}</mask></defs>`

  // The outside he can see from the street: outer walls and glass, the street names.
  const outside = plan({
    ...JOB, tone: [], items: [], marks: JOB.marks, storeys: [], owner: null, owners: [], crew: [],
    rooms: JOB.rooms.filter((q) => /CIRCLE|STREET/.test(q[2])),
    walls: { segs: JOB.walls.segs.filter((q) => q.kind === 'ext'), glass: JOB.walls.glass, doors: JOB.walls.doors.slice(0, 1), panels: [] },
  }, c, t, `${uid}-o`)
  const inside = `<g mask="url(#${uid}-seen)">${plan({ ...JOB, owner: null, owners: [], crew: [], rooms: JOB.rooms.filter((q) => !/CIRCLE|STREET/.test(q[2])), marks: [] }, c, t, `${uid}-i`)}${ownerSvg(c, t)}</g>`
  const body = `${mask}${outside}${inside}${crewSvg(c, t, uid)}${getawaySvg(c, t)}`
  // The key steps aside while the camera is close, so it never sits on the plan.
  const key = Math.min(ramp(t, 17, 19), 1 - ramp(t, 24, 25.5)) + ramp(t, 44, 46)
  return { svg: sheet({ c, uid, time: t, score, body, chrome: ramp(t, 17, 19), key: clamp01(key) }), label: 'Following' }
}

/* ── D · Around the circle ───────────────────────────────────────────── */

/*
 * The camera comes in turning round the west circle, so that by the first
 * line the curved shop sits level on the sheet (its labels, set along the
 * curve, read straight); it turns back to north-up as he drives off.
 */
export const LEVEL = -45
const CX = PX + PW / 2
const CY = PY + PH / 2
/** A camera whose culling covers the whole plate however it is turned. */
/** In a body turned by `rot`, the letters in the heads (crew numbers, the P and S marks) are turned back so they read upright. */
export function upright(svg, rot) {
  if (!rot) return svg
  return svg.replace(/<text x="([\d.-]+)" y="([\d.-]+)" font-size="(1[123](?:\.5)?)" font-weight="700"([^>]*text-anchor="middle"[^>]*)>/g, (m, x, y, fs, rest) => {
    const cy = Number(y) - (fs === '13' ? 4.6 : fs === '12' ? 4.4 : 4.2)
    return `<text x="${x}" y="${y}" font-size="${fs}" font-weight="700"${rest} transform="rotate(${r(-rot, 2)} ${x} ${r(cy)})">`
  })
}
export function turnedCam(v) {
  const c = camOf(v)
  const half = (Math.hypot(PW, PH) / 2 + 60) / v.s
  c.view = { x0: v.cx - half, x1: v.cx + half, y0: v.cy - half, y1: v.cy + half }
  return c
}

/*
 * Timing (the user, 2026-11-06): the camera is already moving when the black
 * lifts (12), the plan is drawn once it has landed, and everything is whole,
 * with the conman standing outside, a second and a half before the first line
 * (23.28). He goes in as the singing starts.
 */
const ZOOM1 = [11, 17.2]
const DRAW1 = [14.4, 20.2]
export function motionOrbit({ time, score, uid = 'film' }) {
  const t = time
  const circle = { cx: BALLS[0][0] + 12, cy: BALLS[0][1] - 10, s: 6.5 }
  const shop = { ...PLAN, s: PLAN.s * 1.05 }
  let v
  let rot
  if (t < ZOOM1[1]) {
    const u = ease(ramp(t, ...ZOOM1))
    v = zoom(circle, shop, u)
    rot = lerp(80, LEVEL, u)
  } else if (t < 42.6) {
    v = zoom(shop, { ...shop, s: shop.s * 1.06 }, ramp(t, ZOOM1[1], 42.6))
    rot = LEVEL
  } else {
    const u = ease(ramp(t, 42.6, 50.8))
    v = zoom({ ...shop, s: shop.s * 1.06 }, STREET, u)
    rot = lerp(LEVEL, 0, u)
  }
  const c = turnedCam(v)
  const p = ease(ramp(t, ...DRAW1))
  const planned = p > 0 ? plan(drawn(p), c, t, `${uid}-p`) : ''
  const owner = ownerSvg(c, t, ramp(t, 21.0, 21.6))
  const body = `<g transform="rotate(${r(rot, 2)} ${CX} ${CY})"><rect x="${CX - 1200}" y="${CY - 1200}" width="2400" height="2400" fill="${PAPER}"/><g opacity="0.55">${TOWNS.atlas(c, `${uid}-t`)}</g>${planned}${owner}${upright(crewSvg(c, t, uid) + getawaySvg(c, t), rot)}</g>`
  return { svg: sheet({ c, uid, time: t, score, body, chrome: Math.min(ramp(t, 20.4, 21.4), 1 - ramp(t, 44.5, 46)), town: false }), label: 'Around the circle' }
}

/* ── E · Cut to the lines ────────────────────────────────────────────── */

/*
 * No camera moves at all: a hard cut on every sung line, each a still
 * framing (held, with the slightest push) on where he is about to be. The
 * plan is there whole from the first frame; the town shot before the singing,
 * the whole shop when he leaves, Main Street for the getaway.
 */
export function motionCuts({ time, score, uid = 'film' }) {
  const t = time
  const lines = score.lines.filter((l) => l.start > 23 && l.start < 42).map((l) => l.start)
  const cuts = [-Infinity, ...lines, 42.3, 45.6]
  const i = cuts.findLastIndex((q) => q <= t)
  const start = Math.max(cuts[i], 16)
  const end = cuts[i + 1] ?? 52
  let v
  if (i === 0) v = { cx: BALLS[0][0] + 40, cy: STOCK_Y - 18, s: 6 }
  else if (i <= lines.length) {
    // Centred on where he goes during the shot, so he stays in it without the camera moving.
    const n = 12
    let fx = 0
    let fy = 0
    for (let k = 0; k < n; k++) {
      const p = headAt(lerp(start, Math.min(end, 42.2), k / (n - 1)))
      fx += p[0] / n
      fy += p[1] / n
    }
    v = { cx: fx, cy: fy, s: [42, 50, 38, 40][(i - 1) % 4] }
  } else if (cuts[i] === 42.3) v = PLAN
  else v = { ...STREET, cx: 330 }
  v = { ...v, s: v.s * (1 + 0.05 * ramp(t, start, end)) }
  const c = camOf(v)
  const body = `${plan(drawn(1), c, t, `${uid}-p`)}${ownerSvg(c, t)}${crewSvg(c, t, uid)}${getawaySvg(c, t)}`
  return { svg: sheet({ c, uid, time: t, score, body, chrome: 1 - ramp(t, 45.4, 45.8) }), label: 'Cut to the lines' }
}

/** The record shop's motion tests, for the page: all on one clock, 0:16–0:52. */
export const MOTION_WINDOW = { from: 16, to: 52 }
export const MOTION_TESTS = [
  { key: 'a', label: 'A · Push in', film: motionPush },
  { key: 'b', label: 'B · Pen and ink', film: motionPen },
  { key: 'c', label: 'C · Following', film: motionFollow },
  { key: 'd', label: 'D · Around the circle', film: motionOrbit },
  { key: 'e', label: 'E · Cut to the lines', film: motionCuts },
]
