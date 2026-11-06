/*
 * From the end of heist 1 to the end of heist 2 (0:40–1:18), three ways
 * (exploration, 2026-11-05). Heist 1 is the pick: D · Around the circle, so
 * every one opens on its turned, level shop and its route. He leaves the
 * staff door at once and goes straight to the next job; then:
 *
 *   A · Down Main Street   the camera turns back to north-up and follows him
 *                           close down Main Street, settling onto the counting
 *                           house as he reaches its door; the plan inks itself
 *   B · Over the bridge     it pulls up high (both circles, the river, the
 *                           bridge he crosses) and keeps turning as it comes
 *                           down, so the shop's tilt unwinds onto the new job
 *   C · Two floors          as A, but the counting house is two sheets side
 *                           by side: the ground floor, and the floor below
 *                           where he digs, so both halves of the job are seen
 *
 * B is the pick (2026-11-05): heist 2 starts once it has landed, on "Oh,
 * I'm a conman" (55.75). No shake.
 */
import { RED, PAPER } from '../../album.mjs'
import { TOWNS } from './styles.mjs'
import {
  JOB, PLAN, STREET, LEVEL, SHEET, GET_FROM, GET_TO, getawayAt, followAt, zoom, camOf, turnedCam, upright, drawn, plan, ownerSvg, crewSvg, sheet, ease, ramp, lerp, r,
} from './motion.mjs'
import { O2, SHEET2, ARRIVE, EARTH_SHOOK, DX, CONMAN2, KEY2, overlay, twoFloors } from './job2.mjs'

export const SEQ_WINDOW = { from: 40, to: 78 }

/* ── Cameras ─────────────────────────────────────────────────────────── */

const SHOP = { ...PLAN, s: PLAN.s * 1.05 * 1.06 }
/** The counting house with Main Street in frame, so he is seen arriving. */
export const HOUSE = { cx: O2[0] + 19.4, cy: O2[1] + 16.8, s: 19 }
const FLOORS = { cx: O2[0] + 33, cy: O2[1] + 10.5, s: 15.5 }

/** Where he is, through the getaway and then heist 2 (town metres). */
function conmanAt(t, route) {
  if (t < ARRIVE) return getawayAt(Math.max(t, GET_FROM)).at(-1)
  const p = route.at(t)
  return [p[0] + O2[0], p[1] + O2[1]]
}
function follow(t, route, span = 1) {
  let x = 0
  let y = 0
  const n = 9
  for (let k = 0; k < n; k++) {
    const q = t - span + (2 * span * k) / (n - 1)
    const p = q < GET_FROM ? followAt(q) : conmanAt(q, route)
    x += p[0] / n
    y += p[1] / n
  }
  return [x, y]
}
/* ── The plan of heist 2, inked on by progress p ─────────────────────── */

const KIND = { ext: 0, heavy: 1, int: 2 }
const segLen = (q) => (q.arc ? q.arc.R * ((q.arc.d1 - q.arc.d0) * Math.PI) / 180 : Math.hypot(q.b[0] - q.a[0], q.b[1] - q.a[1]))
export function inked(job, p) {
  if (p >= 1) return job
  const segs0 = job.walls.segs.slice().sort((a, b) => KIND[a.kind] - KIND[b.kind])
  let left = ramp(p, 0, 0.55) * segs0.reduce((s, q) => s + segLen(q), 0)
  const segs = []
  for (const q of segs0) {
    if (left <= 0) break
    const u = Math.min(1, left / segLen(q))
    left -= segLen(q)
    segs.push(q.arc ? { ...q, arc: { ...q.arc, d1: q.arc.d0 + (q.arc.d1 - q.arc.d0) * u } } : { ...q, b: [lerp(q.a[0], q.b[0], u), lerp(q.a[1], q.b[1], u)] })
  }
  const pg = ramp(p, 0.55, 0.65)
  const take = (list, u) => list.slice(0, Math.floor(u * list.length + 0.001))
  const pt = ramp(p, 0.8, 1)
  const words = (list) => list.map((w, i) => [w[0], w[1], String(w[2]).slice(0, Math.round(String(w[2]).length * Math.min(1, Math.max(0, pt * list.length - i)))), ...w.slice(3)])
  return {
    ...job,
    tone: p > 0.6 ? job.tone : [],
    walls: { segs, glass: take(job.walls.glass, pg), doors: take(job.walls.doors, pg), panels: [] },
    items: take(job.items, ramp(p, 0.65, 0.8)).map((it) => ({ ...it, label: it.label ? String(it.label).slice(0, Math.round(it.label.length * pt)) : it.label })),
    rooms: words(job.rooms),
    marks: words(job.marks ?? []),
    sheets: p > 0.1 ? job.sheets : [],
    storeys: p >= 1 ? job.storeys : [],
    owners: p >= 1 ? job.owners : [],
  }
}

/* ── One frame ───────────────────────────────────────────────────────── */

/** The getaway's line, and his mark until he reaches the next door. */
export function travel(c, t) {
  if (t < GET_FROM) return ''
  const pts = getawayAt(Math.min(t, GET_TO)).map(([x, y]) => [c.X(x), c.Y(y)])
  const head = pts.at(-1)
  return `<path d="M${pts.map((p) => p.map((v) => r(v)).join(' ')).join('L')}" stroke="${RED}" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round" fill="none"/>${t < ARRIVE ? `<circle cx="${r(head[0])}" cy="${r(head[1])}" r="10.5" fill="${RED}"/><text x="${r(head[0])}" y="${r(head[1] + 4.6)}" font-size="13" font-weight="700" fill="${PAPER}" text-anchor="middle">1</text>` : ''}`
}

function frame({ t, score, uid, v, rot = 0, job2, ink }) {
  const c = rot ? turnedCam(v) : camOf(v)
  const jobNow = job2(t)
  const second = ink > 0 ? plan(inked(jobNow, ink), c, t, `${uid}-q`) : ''
  const inner = `${plan(drawn(1), c, t, `${uid}-p`)}${ownerSvg(c, t)}${upright(crewSvg(c, t, uid) + travel(c, t) + second, rot)}`
  const body = rot
    ? `<g transform="rotate(${r(rot, 2)} ${800} ${422})"><rect x="-400" y="-800" width="2400" height="2400" fill="${PAPER}"/><g opacity="0.55">${TOWNS.atlas(c, `${uid}-t`)}</g>${inner}</g>`
    : inner
  // The key and title: heist 1's until he is out of the door, heist 2's once he arrives.
  const one = 1 - ramp(t, 42.4, 43.6)
  const two = ramp(t, ARRIVE + 0.6, ARRIVE + 2)
  const svg = t < 46
    ? sheet({ c, uid, time: t, score, body, chrome: one, town: !rot })
    : sheet({ c, uid, time: t, score, body, chrome: two, town: !rot, job: { ...KEY2 }, titles: SHEET2 })
  return { svg, label: 'Heist 1 to heist 2' }
}

/* ── A · Down Main Street ────────────────────────────────────────────── */

export function seqMainStreet({ time, score, uid = 'film' }) {
  const t = time
  const route = CONMAN2.overlay
  const near = (q) => ({ cx: follow(q, route)[0], cy: follow(q, route)[1], s: 5.2 })
  let v
  let rot = 0
  if (t < GET_FROM) { v = SHOP; rot = LEVEL }
  else if (t < 45.2) { const u = ease(ramp(t, GET_FROM, 45.2)); v = zoom(SHOP, near(t), u); rot = lerp(LEVEL, 0, u) }
  else if (t < 48.8) v = near(t)
  else if (t < 52.6) v = zoom(near(t), HOUSE, ease(ramp(t, 48.8, 52.6)))
  else v = zoom(HOUSE, { ...HOUSE, s: HOUSE.s * 1.06 }, ramp(t, 52.6, 78))
  return frame({ t, score, uid, v, rot, job2: overlay, ink: ease(ramp(t, 49.4, 53.4)) })
}

/* ── B · Over the bridge ─────────────────────────────────────────────── */

export function seqBridge({ time, score, uid = 'film' }) {
  const t = time
  const HIGH = { ...STREET, cx: 410, cy: 300, s: 2.3 }
  let v
  if (t < GET_FROM) v = SHOP
  else if (t < 46.4) v = zoom(SHOP, HIGH, ease(ramp(t, GET_FROM, 46.4)))
  else if (t < 49) v = HIGH
  else if (t < 54) v = zoom(HIGH, HOUSE, ease(ramp(t, 49, 54)))
  else v = zoom(HOUSE, { ...HOUSE, s: HOUSE.s * 1.06 }, ramp(t, 54, 78))
  // One long turn, from the shop's level back to north-up, landing as the camera lands.
  const rot = t < GET_FROM ? LEVEL : lerp(LEVEL, 0, ease(ramp(t, GET_FROM, 54)))
  return frame({ t, score, uid, v, rot, job2: overlay, ink: ease(ramp(t, 48.4, 52.8)) })
}

/* ── C · Two floors ──────────────────────────────────────────────────── */

export function seqTwoFloors({ time, score, uid = 'film' }) {
  const t = time
  const route = CONMAN2.twoFloors
  const near = (q) => ({ cx: follow(q, route)[0], cy: follow(q, route)[1], s: 5.2 })
  let v
  let rot = 0
  if (t < GET_FROM) { v = SHOP; rot = LEVEL }
  else if (t < 45.2) { const u = ease(ramp(t, GET_FROM, 45.2)); v = zoom(SHOP, near(t), u); rot = lerp(LEVEL, 0, u) }
  else if (t < 48.8) v = near(t)
  else if (t < 52.6) v = zoom(near(t), FLOORS, ease(ramp(t, 48.8, 52.6)))
  else v = zoom(FLOORS, { ...FLOORS, s: FLOORS.s * 1.05 }, ramp(t, 52.6, 78))
  return frame({ t, score, uid, v, rot, job2: twoFloors, ink: ease(ramp(t, 49.4, 53.4)) })
}

export const SEQ_TESTS = [
  { key: 'a', label: 'A · Down Main Street', film: seqMainStreet },
  { key: 'b', label: 'B · Over the bridge', film: seqBridge },
  { key: 'c', label: 'C · Two floors', film: seqTwoFloors },
]
void JOB
void SHEET
void DX
