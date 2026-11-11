/*
 * Ship to Stockholm · the road trip — the film (2026-11-10).
 *
 * An old paper road map of the United States, and a red dot that drives from
 * New York to the Turnaround at Seaside, Oregon, by the long way: two-lane
 * roads through small towns, and five wrong turns, most of them to the
 * water's edge (he is looking for a ship). The red line of where it
 * has been stays on the map. The roads are real (the map is Natural Earth's,
 * the route is OpenStreetMap's, as a router drives it); the itinerary is
 * road-trip/itinerary.mjs and the clock is road-trip/trip.mjs.
 *
 *   map.mjs      the map, as `lib` tiles, and the names set on it
 *   trip.mjs     the road joined into one line, and where the dot is when
 *   camera.mjs   the camera that tracks it, and the last pull-out
 *
 * Red is the dot and the line it has driven, nothing else. The line is laid
 * a hair to the right of the road, the side he drives on, so a road driven
 * out and back is two red lines with the road between them: a wrong turn
 * stays on the map as what it was.
 */
import { r, clamp01, ramp, easeOut } from '../kit.mjs'
import { COVER_SHEET, INK, PAPER, RED, paper, marginLyric } from '../album.mjs'
import { filmOpening, inOpening } from '../opening.mjs'
import { endCard } from '../ending.mjs'
import { project } from './road-trip/geo.mjs'
import { cam, ground, names, layNames } from './road-trip/map.mjs'
import { TRIP, STOP, distAt, pointAt, waitAt, lastStop } from './road-trip/trip.mjs'
import { viewAt, PULL } from './road-trip/camera.mjs'

const { x: PX, y: PY, w: PW, h: PH } = COVER_SHEET.plate

/* The names are laid out for the views this film takes: every 0.4 s of the drive, and the start of the pull-out. */
layNames((() => {
  const views = []
  for (let t = 10; t < PULL[0] + 6; t += 0.4) {
    const v = viewAt(t)
    views.push({ ...cam(v.cx, v.cy, v.s).view, s: v.s })
  }
  return views
})())

/* ── The red line ─────────────────────────────────────────────────── */

/** Pixels the line sits to the right of the road. */
const SIDE = 2.2

/*
 * For each point of the road: which way is "to the right" there (the mitre
 * of the way in and the way out), and how far over the line sits, 0 to 1.
 * Where the road doubles back on itself, the end of a wrong turn, the line
 * comes in to the middle of the road over the last few kilometres and goes
 * out again on the other side, so a wrong turn ends in a point.
 */
const TAPER = 5
const NORMALS = (() => {
  const { pts, cum } = TRIP
  const n = pts.length
  const seg = []
  for (let i = 0; i < n - 1; i++) {
    const [dx, dy] = [pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]]
    const L = Math.hypot(dx, dy) || 1
    seg.push([-dy / L, dx / L])
  }
  const at = []
  const turns = []
  for (let i = 0; i < n; i++) {
    const a = seg[Math.max(0, i - 1)]
    const b = seg[Math.min(n - 2, i)]
    const dot = a[0] * b[0] + a[1] * b[1]
    if (dot < -0.5) { at.push({ x: 0, y: 0 }); turns.push(cum[i]); continue }
    const [mx, my] = [a[0] + b[0], a[1] + b[1]]
    const L = Math.hypot(mx, my) || 1
    const k = Math.min(1.8, 1 / Math.max(0.3, Math.sqrt((1 + dot) / 2)))
    at.push({ x: (mx / L) * k, y: (my / L) * k })
  }
  /** How far over the line sits at distance d: 1, less within TAPER km of a turn-round. */
  const over = (d) => {
    let f = 1
    for (const t of turns) f = Math.min(f, Math.abs(d - t) / TAPER)
    return f
  }
  at.forEach((p, i) => { const f = over(cum[i]); p.x *= f; p.y *= f })
  return { seg, at, over }
})()

/** The driven line up to distance d at camera c, and where its head is on the sheet. */
function driven(c, d) {
  const { pts } = TRIP
  const head = pointAt(d)
  const side = SIDE * (0.55 + 0.45 * ramp(c.s, 0.4, 1.6))
  const v = c.view
  let path = ''
  let pen = false
  let px = 0
  let py = 0
  let was = false
  const put = (x, y, inView) => {
    // A point is drawn if it or the one before it is in view; otherwise the pen lifts.
    if (inView || was) {
      if (!pen) { path += `M${r(px)} ${r(py)}`; pen = true }
      path += `L${r(x)} ${r(y)}`
    } else pen = false
    px = x
    py = y
    was = inView
  }
  for (let i = 0; i <= head.i; i++) {
    const [x, y] = pts[i]
    const inView = x > v.x0 && x < v.x1 && y > v.y0 && y < v.y1
    const nm = NORMALS.at[i]
    const [sx, sy] = [c.X(x) + nm.x * side, c.Y(y) + nm.y * side]
    if (i === 0) { px = sx; py = sy; was = inView; continue }
    put(sx, sy, inView)
  }
  const hn = NORMALS.seg[head.i]
  const f = NORMALS.over(d)
  const hx = c.X(head.x) + hn[0] * side * f
  const hy = c.Y(head.y) + hn[1] * side * f
  was = true
  put(hx, hy, true)
  return { path, hx, hy }
}

/* ── The boat he misses ───────────────────────────────────────────── */

const FERRY = { from: project([-86.4502, 43.9493]), to: project([-87.6466, 44.0925]), leaves: 83.2, lands: 99.5 }

function ferry(c, time) {
  const [x0, y0, x1, y1] = [c.X(FERRY.from[0]), c.Y(FERRY.from[1]), c.X(FERRY.to[0]), c.Y(FERRY.to[1])]
  if (Math.max(x0, x1) < PX - 40 || Math.min(x0, x1) > PX + PW + 40 || Math.max(y0, y1) < PY - 40 || Math.min(y0, y1) > PY + PH + 40) return ''
  const show = ramp(c.s, 1.5, 1.95)
  if (show <= 0.004) return ''
  const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI
  // The crossing, as a road map draws one: dashes over the water, lettered.
  let s = `<line x1="${r(x0)}" y1="${r(y0)}" x2="${r(x1)}" y2="${r(y1)}" stroke="${INK}" stroke-width="1.1" stroke-opacity="0.7" stroke-dasharray="${r(2.2 * c.s, 2)} ${r(1.5 * c.s, 2)}"/>`
  const [mx, my] = [(x0 + x1) / 2, (y0 + y1) / 2]
  s += `<text x="${r(mx)}" y="${r(my - 7)}" font-size="9.5" font-weight="500" letter-spacing="1.6" fill="${INK}" fill-opacity="0.7" text-anchor="middle" transform="rotate(${r(ang + 180)} ${r(mx)} ${r(my)})">CAR FERRY</text>`
  // The boat: at the dock until it sails, then away across the lake.
  // It gets under way over a second and a half and then holds one speed across.
  const run = Math.max(0, time - FERRY.leaves)
  const u = clamp01((run < 1.5 ? (run * run) / 3 : run - 0.75) / (FERRY.lands - FERRY.leaves - 0.75))
  const k = 0.02 + 0.96 * u
  if (time < FERRY.lands + 3) {
    const [bx, by] = [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k]
    const fade = 1 - ramp(time, FERRY.lands, FERRY.lands + 3)
    s += `<g transform="translate(${r(bx)} ${r(by)}) rotate(${r(ang)})" opacity="${r(fade, 3)}"><path d="M-8 -3.4H4.5L9.5 0L4.5 3.4H-8Z" fill="${PAPER}" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/><path d="M-4 -3.4V3.4" stroke="${INK}" stroke-width="1.1"/></g>`
  }
  return `<g opacity="${r(show, 3)}">${s}</g>`
}

/* ── The dot ──────────────────────────────────────────────────────── */

function dot(x, y, time, score) {
  const wait = waitAt(time)
  let rad = 7.2
  let ring = ''
  if (wait && time > 12) {
    // Stood still: it breathes, and a ring goes out from it on every other beat.
    const beat = 60 / score.bpm
    const phase = (((time - score.beatPhase) / (2 * beat)) % 1 + 1) % 1
    // (Not once he has arrived for good and the camera is pulling away.)
    const on = Math.min(ramp(time, wait[0], wait[0] + 0.5), 1 - ramp(time, wait[1] - 0.5, wait[1]), 1 - ramp(time, PULL[0] - 0.6, PULL[0] + 0.6))
    rad += 1.5 * on * Math.exp(-phase * 3.2)
    ring = `<circle cx="${r(x)}" cy="${r(y)}" r="${r(8 + 22 * easeOut(phase), 2)}" fill="none" stroke="${RED}" stroke-width="1.6" opacity="${r(0.7 * on * (1 - phase) ** 1.5, 3)}"/>`
  }
  return `${ring}<circle cx="${r(x)}" cy="${r(y)}" r="${r(rad + 1.7, 2)}" fill="${PAPER}"/><circle cx="${r(x)}" cy="${r(y)}" r="${r(rad, 2)}" fill="${RED}"/>`
}

/* ── The frame ────────────────────────────────────────────────────── */

/** The plate alone: { plate, lib }. */
export function roadTripPlate({ time, score, uid }) {
  const v = viewAt(time)
  const c = cam(v.cx, v.cy, v.s)
  const map = ground(c, uid)
  const d = distAt(time)
  const line = driven(c, d)
  // The line: the same weight close to and far off, on a breath of bare paper so it reads through the mesh of roads.
  const w = 2.7 - 0.25 * ramp(c.s, 0.5, 1.8)
  const plate = `${map.svg}${ferry(c, time)}`
    + (d > 0.01 ? `<g fill="none" stroke-linejoin="round" stroke-linecap="round"><path d="${line.path}" stroke="${PAPER}" stroke-width="${r(w + 2.6, 2)}" stroke-opacity="0.55"/><path d="${line.path}" stroke="${RED}" stroke-width="${r(w, 2)}"/></g>` : '')
    + names(c)
    + dot(line.hx, line.hy, time, score)
  return { plate, lib: map.lib }
}

const stopName = (key) => STOP.get(key)?.name ?? ''

export function roadTripFrame({ time, score, lockup = '', uid = 'roadtrip' }) {
  if (score.endCardAt != null && time >= score.endCardAt) return endCard({ now: time, from: score.endCardAt, lockup })
  const section = score.sections.find((s) => time >= s.from && time < s.to) ?? score.sections.at(-1)
  const { plate, lib } = roadTripPlate({ time, score, uid })
  const clip = `${uid}-plate`
  const d = distAt(time)
  const where = time >= PULL[0] ? 'New York to Seaside' : waitAt(time) && time > 30 ? `stopped at ${stopName(lastStop(d))}` : d < 1 ? 'New York' : `past ${stopName(lastStop(d))}`
  return {
    label: inOpening(time) ? 'Opening' : `${section.label} · ${where}`,
    lib,
    svg: `<defs><clipPath id="${clip}"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}"/></clipPath></defs>
${paper(COVER_SHEET)}
<g clip-path="url(#${clip})">${plate}</g>
${marginLyric({ now: time, score, uid, sheet: COVER_SHEET })}
${filmOpening({ time, uid, slug: 'ship-to-stockholm' })}`,
  }
}

/** For the "Now" line: kilometres driven, and kilometres a second. */
export const roadTripStatus = (time) => `${Math.round(distAt(time))} km`

/** The frame to hold before play: back down the lake shore, the line doubled, the boat away across the water. */
export const ROAD_TRIP_POSTER = 93.5

export const ROAD_TRIP_BEATS = [
  { at: 0, label: 'Opening' },
  { at: 28, label: 'New York' },
  { at: 50, label: 'Wrong turn · Lake Erie', key: true },
  { at: 57, label: 'West on US 6' },
  { at: 75.5, label: 'Wrong turn · the boat', key: true },
  { at: 89, label: 'Round the lake' },
  { at: 109, label: 'The river road' },
  { at: 134, label: 'Wrong turn · the Missouri', key: true },
  { at: 148.5, label: 'And again · Faith', key: true },
  { at: 160, label: 'Wyoming' },
  { at: 185.5, label: 'To Eden' },
  { at: 198.5, label: 'Wrong turn · the desert', key: true },
  { at: 207, label: 'The run in' },
  { at: 223, label: 'Seaside', key: true },
  { at: 228, label: 'The whole way', key: true },
]
