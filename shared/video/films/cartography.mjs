/*
 * Cartography — style B2, as a film rather than as a sheet.
 *
 * An admiralty chart of the real Earth with the song plotted on it as a
 * passage plan. One red line that starts as a dot in Andalusia, wanders the
 * province through the first verse, and then goes round the world — Stockholm,
 * the North Sea, America, the whole globe in the oh-ohs — and comes home to
 * Andalusia before it leaves one last time and ends as a pulsing dot outside
 * Portland. Every line it draws stays drawn.
 *
 * WHAT MAKES THIS FILE WORTH READING TWICE
 *
 * `cartographyFrame({ time, score })` is a pure function: one number in, one
 * frame of SVG out, no animation state anywhere. Nothing to fall out of step
 * with the audio, nothing left half-transitioned when a clip is scrubbed or
 * replayed, and the same call renders frame 900 as cheaply as frame 1.
 *
 * THE MAP IS THE EARTH
 *
 * Natural Earth's coastline, baked into ../geo/earth.mjs, on an orthographic
 * globe. Zoomed into a province the globe is flat enough to read as a chart;
 * pulled back, it is a sphere with a limb and the far side hidden, turning
 * under the route. The camera is `{ lon, lat, R }` — where the globe faces and
 * its radius in pixels — and it is folded into the projection rather than into
 * a transform, so the coast, the graticule, the red line and the type keep the
 * same pen at every scale.
 *
 * NOTHING IS TAPPED IN
 *
 * Every leg of the route is timed off the score: a line's measured start, a
 * place name's measured onset, a section's boundaries. `planFor` turns those
 * into legs and camera keys once per score. Retime the score and the film
 * retimes itself.
 */

import {
  t, rect, line, path, circle, rng, r, advance,
  clamp01, lerp, ramp, fall, easeOut, easeInOut, easeOutBack, decay,
} from '../kit.mjs'
import { motifAt } from '../motifs.mjs'
import { LAND_FINE, LAND_COARSE, LAKES } from '../geo/earth.mjs'

/* ── The palette. Five colours, and only one of them is saturated. ──── */
export const CHART = '#e8dcc0'
export const SEA = '#cfd9cf'
export const INK = '#26312e'
export const ROUTE = '#b03a2e'
export const NEAT = '#8a7c5c'
/** The end card's white. With INK, the only two colours the lyric uses. */
export const WHITE = '#f4f6f7'
/*
 * Lyric type is ink until it is sung and white once it is — never route red.
 * Red over a map full of red lines was one more red thing; black and white is
 * the one pair that reads on paper, on sea and over the route alike.
 */
const LYRIC_UNSUNG = INK
// Ink as well, for now: the lyric does not change colour as it is sung. The
// sung/unsung split is kept so a second colour is one constant away.
const LYRIC_SUNG = INK

/* ══ CHART FURNITURE ══════════════════════════════════════════════════
 *
 * Exported because tools/video-styles/styles/b2-cartography.mjs draws its
 * reference sheet with these same four functions. A style whose still and whose
 * film disagree about what a sounding looks like is worse than no still at all.
 */

/** The 100-unit grid, optionally shifted and scaled by a view. */
export const graticule = (view = null, opacity = 0.28) => {
  const out = []
  // Drawn in chart space and projected, so a zoom moves the grid with the
  // geography rather than leaving a fixed mesh floating over a moving map.
  for (let i = -8; i <= 24; i++) {
    const a = place({ x: i * 100, y: -900 }, view)
    const b = place({ x: i * 100, y: 1800 }, view)
    if (a.x < -40 || a.x > 1640) continue
    out.push(line(a.x, a.y, b.x, b.y, NEAT, 1, { opacity }))
  }
  for (let i = -8; i <= 18; i++) {
    const a = place({ x: -1600, y: i * 100 }, view)
    const b = place({ x: 3200, y: i * 100 }, view)
    if (a.y < -40 || a.y > 940) continue
    out.push(line(a.x, a.y, b.x, b.y, NEAT, 1, { opacity }))
  }
  return out.join('')
}

/** Nested contours — the same shape offset, the way a depth chart draws one. */
export function contours(cx, cy, base, rings, seed, colour = NEAT) {
  const out = []
  for (let k = 0; k < rings; k++) {
    const rand = rng(seed + k)
    const rad = base + k * 46
    let d = ''
    for (let i = 0; i <= 26; i++) {
      const a = (i / 26) * Math.PI * 2
      // About 18% radial variation. More than that and a contour stops reading
      // as depth and starts reading as a star.
      const rr = rad * (0.9 + rand() * 0.18)
      d += (i === 0 ? 'M' : 'L') + r(cx + Math.cos(a) * rr * 1.25) + ' ' + r(cy + Math.sin(a) * rr)
    }
    out.push(path(d + 'Z', { stroke: colour, sw: 1.6, opacity: 0.5 - k * 0.06 }))
  }
  return out.join('')
}

/** Two-digit depths, scattered deterministically so a redraw is the same chart. */
export const soundings = (seed, view = null, opacity = 0.45) =>
  Array.from({ length: 34 }, (_, i) => {
    const rand = rng(seed + i)
    const p = place({ x: 60 + rand() * 1480, y: 80 + rand() * 780 }, view)
    if (p.x < -30 || p.x > 1630 || p.y < -20 || p.y > 920) return ''
    return t({ x: p.x, y: p.y, size: 17, text: String(Math.floor(6 + rand() * 90)), fill: NEAT, weight: 400, opacity })
  }).join('')

/**
 * A port: a ring, filled once its name has been sung, named to its right.
 *
 * `landing` is how far through the arrival it is, 0 at the syllable and 1 a
 * second and a bit later — the second ring opens out and fades over that. It
 * defaults to 0, which is the ring at rest, which is the state a still wants.
 */
export const portMark = (x, y, name, o = {}) => {
  const { active = false, landing = 0, opacity = 1, side = 'right', label = 1 } = o
  const size = active ? 34 : 26
  // Six ports on one chart and two of them a thumb apart: which side a name
  // hangs on is the difference between a chart and a pile of words.
  const at = side === 'left'
    ? { x: x - 26, y: y + 10, anchor: 'end' }
    : side === 'below'
      ? { x, y: y + 46 + size * 0.2, anchor: 'middle' }
      : side === 'above'
        ? { x, y: y - 34, anchor: 'middle' }
        : { x: x + 26, y: y + 10, anchor: 'start' }
  return `
  ${circle(x, y, active ? 15 : 9, { fill: active ? ROUTE : 'none', stroke: ROUTE, sw: 4, opacity })}
  ${active ? circle(x, y, 34 + landing * 26, { stroke: ROUTE, sw: 2, opacity: 0.5 * (1 - landing) * opacity }) : ''}
  ${name && opacity * label > 0.005 ? t({ ...at, size, text: name, fill: active ? ROUTE : INK, weight: 600, tracking: 3, opacity: opacity * label }) : ''}`
}

/* ══ THE FLAT CHART (the still sheet only) ════════════════════════════ */

/** Chart space → screen space, through the view. Identity when `view` is null. */
function place(p, view) {
  if (!view) return p
  return {
    x: 800 + (p.x - view.x) * view.k,
    y: 450 + (p.y - view.y) * view.k,
  }
}

/* ══ THE GLOBE ════════════════════════════════════════════════════════
 *
 * Unit vectors in, screen points out. `cam` is { lon, lat, R }: the point the
 * globe faces, and its radius in pixels. The sphere is centred on the frame.
 */

const RAD = Math.PI / 180
const HALF_DIAGONAL = Math.hypot(800, 450)

const vec = (lon, lat) => {
  const l = lon * RAD
  const p = lat * RAD
  return [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)]
}
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const angle = (a, b) => Math.acos(Math.max(-1, Math.min(1, dot(a, b))))
const lonLatOf = (v) => ({
  lon: Math.atan2(v[1], v[0]) / RAD,
  lat: Math.asin(Math.max(-1, Math.min(1, v[2]))) / RAD,
})

/** Great-circle interpolation between two unit vectors. */
function slerp(a, b, u) {
  const th = angle(a, b)
  if (th < 1e-9) return a
  const s = Math.sin(th)
  const ka = Math.sin((1 - u) * th) / s
  const kb = Math.sin(u * th) / s
  return [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb]
}

/** The camera's basis, worked out once per frame. */
function basis(cam) {
  const l = cam.lon * RAD
  const p = cam.lat * RAD
  return {
    R: cam.R,
    f: [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)],
    e: [-Math.sin(l), Math.cos(l), 0],
    n: [-Math.sin(p) * Math.cos(l), -Math.sin(p) * Math.sin(l), Math.cos(p)],
    // How far from the facing point the frame's corners reach, as an angle.
    // Anything further away than this plus its own size cannot be on screen.
    reach: cam.R > HALF_DIAGONAL ? Math.asin(HALF_DIAGONAL / cam.R) : Math.PI / 2,
  }
}

/** A unit vector to the screen, with its depth: z > 0 is the near side. */
function onScreen(v, b) {
  return {
    x: 800 + b.R * dot(v, b.e),
    y: 450 - b.R * dot(v, b.n),
    z: dot(v, b.f),
  }
}

// Far enough off the frame that nothing clamped to it is ever seen, near
// enough that a province-scale frame does not write seven-digit coordinates.
const clampX = (x) => (x < -2400 ? -2400 : x > 4000 ? 4000 : x)
const clampY = (y) => (y < -2400 ? -2400 : y > 3300 ? 3300 : y)

/* ── The coastline, decoded once ─────────────────────────────────────── */

/** Douglas–Peucker over [lon, lat], for the mid-scale coast. */
function simplify(points, tolerance) {
  if (!tolerance || points.length < 4) return points
  const keep = new Uint8Array(points.length)
  keep[0] = keep[points.length - 1] = 1
  const stack = [[0, points.length - 1]]
  while (stack.length) {
    const [a, c] = stack.pop()
    const [ax, ay] = points[a]
    const [cx, cy] = points[c]
    const dx = cx - ax
    const dy = cy - ay
    const len = Math.hypot(dx, dy)
    let worst = 0
    let at = -1
    for (let i = a + 1; i < c; i++) {
      const [px, py] = points[i]
      const dist = len > 1e-9 ? Math.abs(dy * px - dx * py + cx * ay - cy * ax) / len : Math.hypot(px - ax, py - ay)
      if (dist > worst) {
        worst = dist
        at = i
      }
    }
    if (worst > tolerance && at > 0) {
      keep[at] = 1
      stack.push([a, at], [at, c])
    }
  }
  return points.filter((_, i) => keep[i])
}

function decodeRing(encoded, tolerance = 0) {
  const lonLat = []
  let index = 0
  let lat = 0
  let lon = 0
  const next = () => {
    let result = 0
    let shift = 0
    let byte
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)
    return result & 1 ? ~(result >> 1) : result >> 1
  }
  while (index < encoded.length) {
    lat += next()
    lon += next()
    lonLat.push([lon / 100, lat / 100])
  }
  const kept = simplify(lonLat, tolerance)
  if (kept.length < 4) return null
  const points = kept.map(([x, y]) => vec(x, y))
  // A cap around the ring — its mean direction and how far its furthest point
  // lies from it — so a ring on the far side of the world costs one dot product.
  const sum = points.reduce((s, p) => [s[0] + p[0], s[1] + p[1], s[2] + p[2]], [0, 0, 0])
  const len = Math.hypot(...sum) || 1
  const centre = [sum[0] / len, sum[1] / len, sum[2] / len]
  const radius = points.reduce((m, p) => Math.max(m, angle(centre, p)), 0)
  /*
   * Which way the ring winds, seen from outside the globe: the sign of the
   * sum of successive cross products along its centre. Seen on screen, with
   * y running down, that is the opposite sense, and the limb is walked in the
   * ring's screen sense — which is `turn`, in the direction of increasing
   * screen angle when positive.
   */
  let wind = 0
  for (let i = 0; i < points.length; i++) {
    const a = points[i]
    const c = points[(i + 1) % points.length]
    wind += (a[1] * c[2] - a[2] * c[1]) * centre[0] + (a[2] * c[0] - a[0] * c[2]) * centre[1] + (a[0] * c[1] - a[1] * c[0]) * centre[2]
  }
  return { points, centre, radius, turn: wind > 0 ? -1 : 1 }
}

const DECODED = new Map()
const rings = (key, source, tolerance = 0) => {
  if (!DECODED.has(key)) DECODED.set(key, source.map((ring) => decodeRing(ring, tolerance)).filter(Boolean))
  return DECODED.get(key)
}

/**
 * Rings as one path, clipped at the horizon.
 *
 * A land ring that runs over the edge of the world is cut where it crosses the
 * limb, and the cut is closed along the limb itself — in the direction the
 * ring winds, which is what keeps land on the inside. Pushing the hidden points
 * radially out to the rim was tried first and is wrong: a point near the back
 * of the globe has no stable direction, the rim trace jumps across the disc,
 * and at 1:20 the whole of Asia came out as sea.
 *
 * Points within a pixel of the last one are skipped: at globe scale the 50m
 * coast is ten points a pixel.
 */
function ringsPath(list, b) {
  let d = ''
  for (const ring of list) {
    if (angle(ring.centre, b.f) > ring.radius + b.reach + 0.02) continue
    d += clipRing(ring, b)
  }
  return d
}

const screenOf = (v, b) => ({ x: clampX(800 + b.R * dot(v, b.e)), y: clampY(450 - b.R * dot(v, b.n)) })
const offFrame = (box) => box.maxX < 0 || box.minX > 1600 || box.maxY < 0 || box.minY > 900

function clipRing(ring, b) {
  const pts = ring.points
  const n = pts.length
  const z = new Float64Array(n)
  let visible = 0
  for (let i = 0; i < n; i++) {
    z[i] = dot(pts[i], b.f)
    if (z[i] > 0) visible++
  }
  if (!visible) return ''
  const box = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  const grow = (p) => {
    if (p.x < box.minX) box.minX = p.x
    if (p.x > box.maxX) box.maxX = p.x
    if (p.y < box.minY) box.minY = p.y
    if (p.y > box.maxY) box.maxY = p.y
  }
  /*
   * Whole pixels, relative to the last point, and nothing within two of it.
   * The land is the heaviest thing in a frame and a frame is re-parsed sixty
   * times a second: absolute coordinates to a tenth made Europe 160 KB.
   */
  let px = 0
  let py = 0
  const emit = (list, first) => {
    let out = ''
    list.forEach((p, i) => {
      const x = Math.round(p.x)
      const y = Math.round(p.y)
      if (first && i === 0) {
        out += 'M' + x + ' ' + y
      }
      else {
        if (i < list.length - 1 && Math.abs(x - px) + Math.abs(y - py) < 2) return
        if (x === px && y === py) return
        out += 'l' + (x - px) + ' ' + (y - py)
      }
      px = x
      py = y
    })
    return out
  }

  if (visible === n) {
    const list = pts.map((v) => screenOf(v, b))
    list.forEach(grow)
    return offFrame(box) ? '' : emit(list, true) + 'Z'
  }

  // Where an edge crosses the horizon, as a point on the limb and its angle.
  const crossing = (i, j) => {
    const a = pts[i]
    const c = pts[j]
    const u = z[i] / (z[i] - z[j])
    const p = [a[0] + (c[0] - a[0]) * u, a[1] + (c[1] - a[1]) * u, a[2] + (c[2] - a[2]) * u]
    const x = dot(p, b.e)
    const y = dot(p, b.n)
    const th = Math.atan2(-y, x)
    return { th, at: { x: clampX(800 + b.R * Math.cos(th)), y: clampY(450 + b.R * Math.sin(th)) } }
  }

  // The visible runs, starting the walk from a hidden point so none wraps.
  let s = 0
  while (z[s] > 0) s++
  const runs = []
  let current = null
  for (let k = 0; k < n; k++) {
    const i = (s + k) % n
    const j = (i + 1) % n
    if (z[i] <= 0 && z[j] > 0) {
      const c = crossing(i, j)
      current = { in: c.th, list: [c.at] }
    }
    if (current && z[j] > 0) current.list.push(screenOf(pts[j], b))
    if (current && z[i] > 0 && z[j] <= 0) {
      const c = crossing(i, j)
      current.list.push(c.at)
      current.out = c.th
      runs.push(current)
      current = null
    }
  }
  if (!runs.length) return ''

  // Round the limb in the ring's own winding. See `decodeRing` for `turn`.
  const D = ring.turn
  const TAU = Math.PI * 2
  const along = (from, to) => ((((to - from) * D) % TAU) + TAU) % TAU
  const arc = (from, to) => {
    const span = along(from, to)
    const steps = Math.ceil(span / (3 * RAD))
    const list = []
    for (let k = 1; k < steps; k++) {
      const th = from + D * (span * k) / steps
      list.push({ x: clampX(800 + b.R * Math.cos(th)), y: clampY(450 + b.R * Math.sin(th)) })
    }
    return list
  }

  let out = ''
  const used = new Set()
  for (const start of runs) {
    if (used.has(start)) continue
    let run = start
    let first = true
    while (run && !used.has(run)) {
      used.add(run)
      run.list.forEach(grow)
      out += emit(run.list, first)
      first = false
      let next = null
      let best = Infinity
      for (const candidate of runs) {
        const gap = along(run.out, candidate.in)
        if (gap < best) {
          best = gap
          next = candidate
        }
      }
      out += emit(arc(run.out, next.in), false)
      run = next
    }
    out += 'Z'
  }
  return offFrame(box) ? '' : out
}

/**
 * A line on the sphere — a leg of the route, a meridian — as the runs of it on
 * the near side. Unlike land, a line is broken at the limb, not wrapped round
 * it: the far half of a meridian is not there.
 */
function sphereLine(points, b, minStep = 1) {
  let d = ''
  let open = false
  let px = 0
  let py = 0
  for (const v of points) {
    const s = onScreen(v, b)
    if (s.z <= 0) {
      open = false
      continue
    }
    const x = Math.round(clampX(s.x))
    const y = Math.round(clampY(s.y))
    if (open && Math.abs(x - px) + Math.abs(y - py) < minStep) continue
    d += open ? 'l' + (x - px) + ' ' + (y - py) : 'M' + x + ' ' + y
    open = true
    px = x
    py = y
  }
  return d
}

/**
 * The graticule, at three spacings crossfaded by scale: fifteen degrees round
 * the whole world, five across a sea, one across a province. Sampled only over
 * the part of the sphere the frame can reach, so a province-scale frame does
 * not walk every meridian on Earth at a tenth of a degree.
 */
function globeGraticule(cam, b, opacity) {
  const reachDeg = b.reach / RAD
  const out = []
  const levels = [
    { step: 15, weight: 1 },
    { step: 5, weight: ramp(cam.R, 650, 1200) },
    { step: 1, weight: ramp(cam.R, 3200, 5200) },
  ]
  const latSpan = Math.min(90, reachDeg + 2)
  const lonSpan = Math.min(180, (reachDeg + 2) / Math.max(Math.cos(Math.min(Math.abs(cam.lat) + reachDeg, 89) * RAD), 0.05))
  // A graticule line is all but straight across one frame; twelve segments a
  // frame is a curve, sixty was a hundred kilobytes of meridians.
  const sample = Math.max(0.1, Math.min(2, reachDeg / 10))
  for (const [index, { step, weight }] of levels.entries()) {
    if (weight <= 0) continue
    const finer = levels.slice(0, index)
    const skip = (deg) => finer.some((l) => Math.abs(deg / l.step - Math.round(deg / l.step)) < 1e-6)
    let d = ''
    const lonFrom = Math.ceil((cam.lon - lonSpan) / step) * step
    for (let lon = lonFrom; lon <= cam.lon + lonSpan; lon += step) {
      if (index && skip(lon)) continue
      const pts = []
      for (let lat = Math.max(-80, cam.lat - latSpan); lat <= Math.min(80, cam.lat + latSpan); lat += sample) pts.push(vec(lon, lat))
      d += sphereLine(pts, b, 3)
    }
    const latFrom = Math.ceil(Math.max(-75, cam.lat - latSpan) / step) * step
    for (let lat = latFrom; lat <= Math.min(75, cam.lat + latSpan); lat += step) {
      if (index && skip(lat)) continue
      const pts = []
      for (let lon = cam.lon - lonSpan; lon <= cam.lon + lonSpan; lon += sample / Math.max(Math.cos(lat * RAD), 0.2)) pts.push(vec(lon, lat))
      d += sphereLine(pts, b, 3)
    }
    if (d) out.push(path(d, { stroke: NEAT, sw: 1, opacity: r(opacity * weight, 3) }))
  }
  return out.join('')
}

/* ══ THE PLACES ═══════════════════════════════════════════════════════
 *
 * Every place the red line touches. Nothing on the map is named — `name` is
 * here for whoever reads this file. `minor` is a town inside Andalusia, drawn
 * as a smaller dot and only at the scale where there is room for it.
 */
const PLACES = {
  sevilla: { name: 'Andalusia', lon: -5.98, lat: 37.39 },
  cordoba: { name: 'Córdoba', lon: -4.78, lat: 37.89, minor: true },
  granada: { name: 'Granada', lon: -3.6, lat: 37.18, minor: true },
  malaga: { name: 'Málaga', lon: -4.42, lat: 36.72, minor: true },
  cadiz: { name: 'Cádiz', lon: -6.29, lat: 36.53, minor: true },

  stockholm: { name: 'Stockholm', lon: 18.07, lat: 59.33 },
  copenhagen: { name: 'Copenhagen', lon: 12.57, lat: 55.68 },
  oslo: { name: 'Oslo', lon: 10.75, lat: 59.91 },
  london: { name: 'London', lon: -0.13, lat: 51.51 },
  dublin: { name: 'Dublin', lon: -6.26, lat: 53.35 },

  sanDiego: { name: 'San Diego', lon: -117.16, lat: 32.72 },
  bangkok: { name: 'Bangkok', lon: 100.5, lat: 13.75 },
  budapest: { name: 'Budapest', lon: 19.04, lat: 47.5 },
  batonRouge: { name: 'Baton Rouge', lon: -91.19, lat: 30.45 },

  newYork: { name: 'New York', lon: -74.0, lat: 40.71 },
  phoenix: { name: 'Phoenix', lon: -112.07, lat: 33.45 },
  toronto: { name: 'Toronto', lon: -79.38, lat: 43.65 },

  rio: { name: 'Rio de Janeiro', lon: -43.2, lat: -22.9 },
  capeTown: { name: 'Cape Town', lon: 18.42, lat: -33.92 },
  cairo: { name: 'Cairo', lon: 31.24, lat: 30.04 },
  moscow: { name: 'Moscow', lon: 37.62, lat: 55.76 },
  mumbai: { name: 'Mumbai', lon: 72.88, lat: 19.08 },
  beijing: { name: 'Beijing', lon: 116.4, lat: 39.9 },
  sydney: { name: 'Sydney', lon: 151.21, lat: -33.87 },
  mexicoCity: { name: 'Mexico City', lon: -99.13, lat: 19.43 },
  buenosAires: { name: 'Buenos Aires', lon: -58.38, lat: -34.6 },
  lagos: { name: 'Lagos', lon: 3.38, lat: 6.52 },
  dubai: { name: 'Dubai', lon: 55.27, lat: 25.2 },
  singapore: { name: 'Singapore', lon: 103.82, lat: 1.35 },
  tokyo: { name: 'Tokyo', lon: 139.69, lat: 35.69 },
  honolulu: { name: 'Honolulu', lon: -157.86, lat: 21.31 },
  reykjavik: { name: 'Reykjavík', lon: -21.9, lat: 64.15 },

  rome: { name: 'Rome', lon: 12.5, lat: 41.9 },
  paris: { name: 'Paris', lon: 2.35, lat: 48.86 },
  chicago: { name: 'Chicago', lon: -87.63, lat: 41.88 },
  denver: { name: 'Denver', lon: -104.99, lat: 39.74 },
  vancouver: { name: 'Vancouver, WA', lon: -122.66, lat: 45.64 },

  // The last trip round the world.
  athens: { name: 'Athens', lon: 23.73, lat: 37.98 },
  istanbul: { name: 'Istanbul', lon: 28.98, lat: 41.01 },
  tehran: { name: 'Tehran', lon: 51.39, lat: 35.69 },
  delhi: { name: 'Delhi', lon: 77.21, lat: 28.61 },
  hanoi: { name: 'Hanoi', lon: 105.85, lat: 21.03 },
  hongKong: { name: 'Hong Kong', lon: 114.17, lat: 22.32 },
  seoul: { name: 'Seoul', lon: 126.98, lat: 37.57 },
  auckland: { name: 'Auckland', lon: 174.76, lat: -36.85 },
  santiago: { name: 'Santiago', lon: -70.67, lat: -33.45 },
  lima: { name: 'Lima', lon: -77.04, lat: -12.05 },
  bogota: { name: 'Bogotá', lon: -74.07, lat: 4.71 },
  havana: { name: 'Havana', lon: -82.37, lat: 23.11 },
  montreal: { name: 'Montreal', lon: -73.57, lat: 45.5 },
  berlin: { name: 'Berlin', lon: 13.4, lat: 52.52 },
  nairobi: { name: 'Nairobi', lon: 36.82, lat: -1.29 },
  jakarta: { name: 'Jakarta', lon: 106.85, lat: -6.21 },
  shanghai: { name: 'Shanghai', lon: 121.47, lat: 31.23 },
  anchorage: { name: 'Anchorage', lon: -149.9, lat: 61.22 },
}
for (const [id, p] of Object.entries(PLACES)) {
  p.id = id
  p.v = vec(p.lon, p.lat)
}

/** Two laps of the world, eastward, for the oh-ohs. Toronto to Reykjavík. */
const WORLD_TOUR = [
  'rio', 'capeTown', 'cairo', 'moscow', 'mumbai', 'beijing', 'sydney',
  'mexicoCity', 'buenosAires', 'lagos', 'dubai', 'singapore', 'tokyo', 'honolulu', 'reykjavik',
]

/**
 * The last trip: from Andalusia, east round the world about twice, to the
 * last landfall. Nothing on it is named — by now the film is not a list of places.
 */
const LAST_TOUR = [
  'sevilla', 'rome', 'athens', 'istanbul', 'tehran', 'delhi', 'hanoi', 'hongKong', 'seoul',
  'auckland', 'santiago', 'lima', 'bogota', 'havana', 'montreal', 'paris', 'berlin',
  'nairobi', 'jakarta', 'shanghai', 'anchorage', 'vancouver',
]

/* ── Scales ────────────────────────────────────────────────────────────
 *
 * The globe's radius in pixels. 380 is the whole world with a margin; 800 a
 * hemisphere filling the frame; 9000 one province.
 */
const SCALE = {
  province: 10500,
  city: 6800,
  sea: 3000,
  country: 1800,
  wide: 780,
  continent: 1400,
  world: 400,
}


const normalise = (word) => word.toLowerCase().replace(/[^a-z]/g, '')

/* ══ THE PLAN ═════════════════════════════════════════════════════════ */

const PLANS = new WeakMap()

/**
 * The route and the camera, built once per score.
 *
 * A leg is { from, to, t0, t1 } between two places. A camera key is
 * { t, lon, lat, R }. Where a leg is followed, the camera has a key on each of
 * its ends and interpolates between them with the same easing and the same
 * great circle as the red line, so the head of the line sits in the middle of
 * the frame for the whole leg and the world moves under it — by construction,
 * not by a second calculation that could drift from the first.
 */
export function planFor(score) {
  const cached = PLANS.get(score)
  if (cached) return cached

  const words = score.lines.flatMap((l) => l.words)
  const onset = (cue, nth = 1) => {
    let seen = 0
    for (const word of words) if (normalise(word.text) === cue && ++seen === nth) return word.t
    return null
  }
  const section = (id) => score.sections.find((s) => s.id === id)
  const linesOf = (id) => score.lines.filter((l) => l.section === id)
  const starts = (id) => linesOf(id).map((l) => l.start)

  const legs = []
  const keys = []
  const leg = (from, to, t0, t1, o = {}) => legs.push({ from: PLACES[from], to: PLACES[to], t0, t1, ...o })
  const key = (t, at, R, o = {}) => {
    const p = typeof at === 'string' ? PLACES[at] : at
    keys.push({ t, lon: p.lon, lat: p.lat, R, ...o })
  }
  /** A leg the camera rides: centred on the head from end to end. */
  const follow = (from, to, t0, t1, R0, R1) => {
    leg(from, to, t0, t1)
    key(t0, from, R0)
    key(t1, to, R1)
  }

  /* Intro and verse one: the province. */
  const v1 = starts('verse-1')
  const v1s = section('verse-1')
  const province = { lon: -4.85, lat: 36.55 }
  key(0, province, SCALE.province * 0.72)
  key(section('intro').to, province, SCALE.province)
  leg('sevilla', 'cordoba', v1[0], v1[1] - 0.4)
  leg('cordoba', 'granada', v1[1], v1[2] - 0.4)
  leg('granada', 'malaga', v1[2], v1[3] - 0.4)
  const loop = (v1[3] + v1s.to) / 2
  leg('malaga', 'cadiz', v1[3], loop - 0.1)
  leg('cadiz', 'sevilla', loop + 0.1, v1s.to)

  /* Verse two: the line leaves as the verse starts and lands on "Stockholm". */
  const v2 = starts('verse-2')
  const stockholm = onset('stockholm') ?? v2[0] + 2.5
  key(v2[0], 'sevilla', SCALE.province)
  follow('sevilla', 'stockholm', v2[0], stockholm, SCALE.province, SCALE.city)
  key(section('verse-2').to, 'stockholm', SCALE.city * 1.12)

  /* First chorus: round the North Sea. */
  const c1 = starts('chorus-1')
  follow('stockholm', 'copenhagen', c1[0], c1[0] + 3.4, SCALE.city * 1.12, SCALE.sea)
  follow('copenhagen', 'oslo', c1[1], c1[1] + 3.2, SCALE.sea, SCALE.sea)
  follow('oslo', 'london', c1[2], c1[2] + 3.6, SCALE.sea, SCALE.sea)
  follow('london', 'dublin', c1[3], c1[3] + 2.8, SCALE.sea, SCALE.sea)

  /* Third verse: four places, spread evenly — the camera pulled back. */
  const v3s = section('verse-3')
  const v3from = v3s.from + 0.3
  const each = (v3s.to - 0.3 - v3from) / 4
  const verse3 = ['dublin', 'sanDiego', 'bangkok', 'budapest', 'batonRouge']
  for (let i = 0; i < 4; i++) {
    follow(verse3[i], verse3[i + 1], v3from + i * each, v3from + (i + 1) * each - 0.35, i ? SCALE.wide : SCALE.sea, SCALE.wide)
  }

  /* Second chorus: America. */
  const c2 = starts('chorus-2')
  follow('batonRouge', 'newYork', c2[0], c2[0] + 3.4, SCALE.wide, SCALE.country)
  follow('newYork', 'phoenix', c2[1], c2[1] + 3.6, SCALE.country, SCALE.country)
  // Mexico City on the way, so the line reaches Toronto just before the
  // oh-ohs rather than sitting there for five seconds; it leaves on the same oh.
  follow('phoenix', 'mexicoCity', c2[2], c2[2] + 3.2, SCALE.country, SCALE.country)
  follow('mexicoCity', 'toronto', c2[3], c2[3] + 3.0, SCALE.country, SCALE.country)

  /*
   * The oh-ohs: the whole world, twice round, slowing.
   *
   * One clock for the whole tour, eased out, so the line starts fast and the
   * globe spins down as it fills with red rather than stopping at every city.
   * Each leg is a straight share of that clock.
   */
  const ohs = section('ohs')
  const ohWords = linesOf('ohs').flatMap((l) => l.words)
  const tour = { from: ohWords[0]?.t ?? ohs.from + 0.4, to: ohs.to - 1.1 }
  const tourPlaces = ['toronto', ...WORLD_TOUR]
  const shareAt = (u) => 1 - (1 - u) ** 1.7
  const timeAt = (s) => {
    // Inverse of shareAt over the tour's span.
    const u = 1 - (1 - s) ** (1 / 1.7)
    return lerp(tour.from, tour.to, u)
  }
  for (let i = 0; i < WORLD_TOUR.length; i++) {
    leg(tourPlaces[i], tourPlaces[i + 1], timeAt(i / WORLD_TOUR.length), timeAt((i + 1) / WORLD_TOUR.length), { linear: true })
  }
  key(ohs.from, 'toronto', SCALE.country)

  /* Fourth verse: home, and a pause there while the dot breathes. */
  const v4s = section('verse-4')
  const v4 = starts('verse-4')
  const home = onset('andalusia', 2) ?? v4[0] + 1.7
  leg('reykjavik', 'sevilla', v4s.from, home)
  // The camera finishes settling onto the province two seconds after the line
  // lands: the fall from the whole world is the slowest move in the film.
  const settle = home + 2
  key(settle, province, SCALE.province)

  /*
   * Then round the world once more, unnamed, from two seconds into the verse's next line to the
   * last landfall, two seconds after the last line of the song starts.
   *
   * The same device as the oh-ohs — one clock for the whole trip, each leg a
   * straight share of it — but eased at both ends rather than only slowing, so
   * the line gathers speed out of Andalusia and settles into Vancouver.
   */
  const c3 = starts('chorus-3')
  /*
   * Two seconds' more pause at home, and the whole trip moved back by the same
   * two seconds rather than squeezed: the legs keep their pace and the line
   * reaches Vancouver two seconds later. What gives is the pull back to the
   * world afterwards, which has to fit before the end card at the same moment
   * as ever.
   */
  const lingering = 2
  const arrive = c3[4] - 0.3 + lingering
  const last = { from: (v4[1] ?? home + 3) + lingering, to: arrive }
  key(last.from, province, SCALE.province * 1.05)
  const share = (u) => lerp(u, easeInOut(u), 0.55)
  const inverse = (target) => {
    let lo = 0
    let hi = 1
    for (let k = 0; k < 40; k++) {
      const m = (lo + hi) / 2
      if (share(m) < target) lo = m
      else hi = m
    }
    return lerp(last.from, last.to, (lo + hi) / 2)
  }
  const hops = LAST_TOUR.length - 1
  for (let i = 0; i < hops; i++) {
    leg(LAST_TOUR[i], LAST_TOUR[i + 1], inverse(i / hops), inverse((i + 1) / hops), { linear: true })
  }

  keys.sort((a, b) => a.t - b.t)

  /* Each leg's great circle, sampled once. */
  for (const l of legs) {
    const th = angle(l.from.v, l.to.v)
    const n = Math.max(12, Math.min(420, Math.ceil(th / RAD * 3)))
    l.theta = th
    l.samples = Array.from({ length: n + 1 }, (_, i) => slerp(l.from.v, l.to.v, i / n))
  }

  const plan = { legs, keys, tour, last, arrive, homeView: { ...province, R: SCALE.province }, settle, endAt: score.endCardAt ?? section('outro').from, dotFrom: section('intro').to - 1.6, growTo: v2[0], home, pulseTo: last.from }
  PLANS.set(score, plan)
  return plan
}

/** How far along a leg the head is at `now`, 0..1. */
const progress = (l, now) => {
  const u = ramp(now, l.t0, l.t1)
  return l.linear ? u : easeInOut(u)
}

/** The head of the red line: the leg it is on and the point it has reached. */
function headAt(plan, now) {
  let current = null
  for (const l of plan.legs) {
    if (l.t0 <= now) current = l
    else break
  }
  if (!current) return { v: plan.legs[0].from.v, leg: null, moving: false }
  const u = progress(current, now)
  return { v: slerp(current.from.v, current.to.v, u), leg: current, moving: u > 0 && u < 1 }
}

/* ══ THE CAMERA ═══════════════════════════════════════════════════════ */

/**
 * Between two keys: the centre on a great circle, the scale in log space — so
 * a zoom from a province to the world takes as long per doubling at the end as
 * at the start — and, on a long move, a pull back through the middle, so a
 * jump from Sevilla to Stockholm shows the sea it crosses.
 */
function between(a, b, u) {
  const e = easeInOut(u)
  const va = vec(a.lon, a.lat)
  const vb = vec(b.lon, b.lat)
  const c = lonLatOf(slerp(va, vb, e))
  const logR = lerp(Math.log(a.R), Math.log(b.R), e)
  let R = Math.exp(logR)
  const th = angle(va, vb)
  // Keep the distance being crossed to within about a frame and a half.
  const needed = (th * R) / 1300
  if (needed > 1) R /= 1 + (needed - 1) * Math.sin(Math.PI * e)
  return { lon: c.lon, lat: c.lat, R }
}

function keyedCamera(plan, now) {
  const { keys } = plan
  if (now <= keys[0].t) return keys[0]
  for (let i = 1; i < keys.length; i++) {
    if (now < keys[i].t) {
      const a = keys[i - 1]
      const b = keys[i]
      return between(a, b, (now - a.t) / Math.max(b.t - a.t, 1e-6))
    }
  }
  return keys[keys.length - 1]
}

/**
 * A tour's camera: turning with the head of the line.
 *
 * Averaged over a second of the tour rather than locked to the head, because
 * the head turns a corner at every city and the globe should not. `follow` is
 * how much of the head's latitude the camera takes: none at world scale, where
 * the whole sphere is in frame, most of it at hemisphere scale, where a city
 * at 35°S would otherwise be off the bottom.
 */
function spinCamera(plan, now, R, follow) {
  let lon = 0
  let lat = 0
  let first = null
  const n = 7
  for (let i = 0; i < n; i++) {
    const at = lonLatOf(headAt(plan, now - 0.6 + (1.2 * i) / (n - 1)).v)
    if (first == null) first = at.lon
    // Unwrapped against the first sample, so ±180 averages to 180, not to 0.
    lon += at.lon + Math.round((first - at.lon) / 360) * 360
    lat += at.lat
  }
  return { lon: lon / n, lat: lerp(18, lat / n, follow), R }
}

const mix = (a, b, w) => {
  const c = lonLatOf(slerp(vec(a.lon, a.lat), vec(b.lon, b.lat), w))
  return { lon: c.lon, lat: c.lat, R: Math.exp(lerp(Math.log(a.R), Math.log(b.R), w)) }
}

/** Heading into the last landfall: the tour's camera settles onto the head and closes in. */
function arrivalCamera(plan, now) {
  const tour = spinCamera(plan, now, SCALE.wide, 0.6)
  const q = easeInOut(ramp(now, plan.arrive - 2.6, plan.arrive))
  if (q <= 0) return tour
  const at = lonLatOf(headAt(plan, now).v)
  return mix(tour, { ...at, R: SCALE.sea }, q)
}

/**
 * After the last landfall: straight out to the whole world with the dot held
 * dead centre. It used to spin the globe as it pulled back, which carried the
 * dot off to one side; the ending is the dot, so it stays in the middle.
 *
 * Deliberately slow, and still moving when the end card cuts in: the zoom
 * runs to a point past the cut, so the last frame of the globe is in motion
 * rather than settled — the card takes over, it does not wait.
 */
function finaleCamera(plan, now) {
  const V = PLACES.vancouver
  // Paced off the landing, not off the cut, so moving the cut does not rush it.
  const out = easeInOut(ramp(now, plan.arrive + 0.2, plan.arrive + 4.7))
  return {
    lon: V.lon,
    lat: V.lat,
    R: Math.exp(lerp(Math.log(SCALE.sea), Math.log(SCALE.world), out)),
  }
}

function cameraAt(plan, now) {
  if (now >= plan.arrive) return finaleCamera(plan, now)
  const keyed = keyedCamera(plan, now)
  const { tour, last } = plan
  if (now >= last.from - 0.2) {
    // Out of the province and onto the last trip, over the first leg or so.
    const w = easeInOut(ramp(now, last.from - 0.2, last.from + 1.8))
    const trip = arrivalCamera(plan, now)
    return w >= 1 ? trip : mix(keyed, trip, w)
  }
  if (now >= plan.settle) return keyed
  if (now >= tour.to) return homecomingCamera(plan, now)
  const w = easeInOut(ramp(now, tour.from - 0.4, tour.from + 1.0))
  if (w <= 0) return keyed
  const spin = spinCamera(plan, now, SCALE.world, 0.25)
  return w >= 1 ? spin : mix(keyed, spin, w)
}

/**
 * From the end of the oh-ohs straight down onto Andalusia, as one move.
 *
 * It used to hand the spinning globe back to the keyed camera — which had
 * spent the whole tour drifting from Toronto towards Iceland out of sight — and
 * then zoom world-to-province in three seconds, so the join was visible twice.
 * Now it starts from exactly where the spin came to rest (the tour's clock
 * eases out, so the globe is already still) and goes to the province: the
 * globe turns to face Andalusia while it is still pulled back, and the zoom
 * does most of its work once it is facing it.
 */
function homecomingCamera(plan, now) {
  const from = spinCamera(plan, plan.tour.to, SCALE.world, 0.25)
  const to = plan.homeView
  const u = ramp(now, plan.tour.to, plan.settle)
  const turn = easeInOut(ramp(u, 0, 0.5))
  const zoom = easeInOut(ramp(u, 0.12, 1))
  const c = lonLatOf(slerp(vec(from.lon, from.lat), vec(to.lon, to.lat), turn))
  return { lon: c.lon, lat: c.lat, R: Math.exp(lerp(Math.log(from.R), Math.log(to.R), zoom)) }
}

/* ══ MARKS ════════════════════════════════════════════════════════════ */

/** A town inside the province: a small dot. */
function townMark(x, y, o = {}) {
  const { reached = false, opacity = 1 } = o
  return circle(x, y, 6, { fill: reached ? ROUTE : 'none', stroke: ROUTE, sw: 3, opacity })
}

/* ══ TYPE ═════════════════════════════════════════════════════════════ */

/*
 * How wide a string is, off the kit's measured Jost table rather than off an
 * average glyph.
 *
 * The suite's `fit()` uses a flat 0.66 em, which is the right number for a
 * whole row and the wrong number for one word — and this style places its lyric
 * one word at a time along the route, so it needs the real thing. Setting "I'd
 * sit and watch the" on an average left forty units of air after I'D and ten
 * units of overlap after WATCH, in the same row.
 */
const widthOf = (text, size, tracking) => advance(text, size, tracking)

/** Split a chorus line into the two rows it wants: at its commas, or in half. */
function splitLine(text) {
  const parts = text.split(',').map((part) => part.trim()).filter(Boolean)
  // "Oh, I think that I could live in San Diego" splits at its comma into one
  // word and nine, which is a row of type and a row of shouting. A first part
  // that short is an interjection, not a half of the line.
  if (parts.length >= 2 && parts[0].split(' ').length > 1) {
    return [parts[0], parts.slice(1).join(', ')]
  }
  const words = text.split(' ')
  if (words.length < 7) return [text]
  const half = Math.ceil(words.length / 2)
  return [words.slice(0, half).join(' '), words.slice(half).join(' ')]
}

/**
 * Which of the line's measured words belong to which row.
 *
 * By position rather than by text, because "the" appears four times in one
 * chorus and "I" five. Both the road setting and the straight setting need it:
 * once a line has been broken, a word can only colour on its own onset if the
 * row it landed in knows which words it is holding.
 */
function bankWords(lyric, rows) {
  let taken = 0
  return rows.map((row) => {
    const count = row.split(' ').length
    const slice = lyric.words.slice(taken, taken + count)
    taken += count
    return slice.length ? slice : [{ t: lyric.start, text: row }]
  })
}

/**
 * How far through a row the voice is, as a share of the row's own measure —
 * and it lands on word boundaries.
 *
 * The first cut took the fraction of the *line's* words sung and split it
 * across the rows in proportion to their lengths, which put the colour edge
 * wherever the arithmetic landed: "WALK UNTIL MY BOO|TS". Nobody sings half a
 * word. This walks the row's characters instead, so the edge sits in the space
 * after the word that has been sung — and sweeps across the word being sung, in
 * the 180 ms it takes to say it, rather than jumping.
 */
function throughRow(now, row, words) {
  const whole = Math.max(advance(row), 0.001)
  let cursor = 0
  let edge = 0
  words.forEach((word, index) => {
    const before = cursor
    cursor += advance(word.text)
    const after = cursor
    cursor += advance(' ')
    if (now < word.t) return
    const next = words[index + 1]
    const span = Math.min(0.18, Math.max((next?.t ?? word.t + 0.3) - word.t, 0.06))
    edge = lerp(before, after, easeOut(ramp(now, word.t, word.t + span)))
  })
  return clamp01(edge / whole)
}

/**
 * A row of type with the voice's position marked inside it.
 *
 * The row is drawn twice and the second copy clipped to the words already sung,
 * which is cheaper than splitting a line into per-word elements and cannot fall
 * out of register with the row underneath — it is the same geometry.
 */
function sungRow({ id, x, y, size, text, len, through, fill, accent, opacity = 1 }) {
  const left = x - len / 2
  // One colour for sung and unsung: draw the row once. Drawn twice, the sung
  // copy lay over the unsung one and its edges doubled up, so words looked as
  // if they went bold as they were sung.
  if (fill === accent) return t({ x, y, size, text, fill, len, anchor: 'middle', weight: 600, opacity })
  // White type carries an ink keyline, drawn under the fill, so it holds on
  // chart paper and on sea alike. Ink type gets the same keyline, so the
  // glyphs do not change weight as the voice crosses them.
  const keyline = `stroke="${INK}" stroke-width="${r(Math.max(2, size * 0.05), 2)}" stroke-linejoin="round" paint-order="stroke"`
  return `<clipPath id="${id}"><rect x="${r(left)}" y="${r(y - size)}" width="${r(len * clamp01(through))}" height="${r(size * 1.35)}"/></clipPath>
    ${t({ x, y, size, text, fill, len, anchor: 'middle', weight: 600, opacity, extra: keyline })}
    ${t({ x, y, size, text, fill: accent, len, anchor: 'middle', weight: 600, opacity, extra: `${keyline} clip-path="url(#${id})"` })}`
}

/* ══ THE FRAME ════════════════════════════════════════════════════════ */

/**
 * One frame of the film.
 *
 * @param {object} o
 * @param {number} o.time   Seconds into the song.
 * @param {object} o.score  app/config/andalusiaScore.ts, or any score shaped like it.
 * @param {string} [o.lockup] The band's stacked mark, as inner SVG, for the end card.
 * @param {string} [o.uid]  Prefix for every id in the frame. Two films on one
 *                          page share a document, and `url(#x)` resolves to
 *                          whichever one is first in it.
 * @returns {{ svg: string, label: string }}
 */
export function cartographyFrame({ time, score, lockup = '', uid = 'carto' }) {
  const now = time
  const plan = planFor(score)
  const section = sectionAt(score, now)
  const activeLine = lineAt(score, now)
  // The line on screen can run a beat ahead of the line being sung.
  const shownLine = shownLineAt(score, now)
  const kind = section.kind

  /* ── The end card is not a chart at all ──────────────────────────── */
  /*
   * The end card cuts in on the score's `endCardAt` — in Andalusia, the guitar
   * harmonic at 2:46.27 — whichever section that falls in. Until then the globe
   * is still pulling back from the last landfall.
   */
  if (now >= plan.endAt) return endCard({ now, section: score.sections[score.sections.length - 1], lockup, uid })

  const cam = cameraAt(plan, now)
  const b = basis(cam)
  // 0 when the whole world is in the frame, 1 once the globe is bigger than it.
  const disc = cam.R < HALF_DIAGONAL + 40

  /* ── The lyric, decided first: it sets how loud the names may be ──── */
  let lyric = ''
  if (kind === 'intro') lyric = cartouche(now, section, score)
  else if (shownLine && shownLine.section === section.id && kind !== 'ohs') {
    lyric = straightLyric({ now, line: shownLine, from: cutIn(score, shownLine), scope: section.id, uid, low: kind !== 'chorus' })
  }
  const quiet = Boolean(lyric) && kind !== 'intro'

  /*
   * The chorus stands the map down — but not the route. Under the first cut
   * the whole chart went to a third, which was right when the choruses named
   * nowhere and the line barely moved. Now the choruses are where the line
   * travels, so the land goes back and the red stays at full pen.
   */
  const hush = kind === 'chorus'
    ? lerp(1, 0.7, easeInOut(ramp(now, section.from, section.from + 0.7)))
    // The moment of globe before the end card keeps the last chorus's look.
    : kind === 'outro' ? 0.7 : 1

  /* ── The globe ───────────────────────────────────────────────────── */
  const ground = []
  if (disc) {
    // A plate in an atlas: the world on the chart paper, with a shadow ring.
    ground.push(circle(800, 450, cam.R + 9, { stroke: NEAT, sw: 10, opacity: 0.18 }))
    ground.push(circle(800, 450, cam.R, { fill: SEA }))
  }
  else ground.push(rect(0, 0, 1600, 900, SEA))

  const land = ringsPath(
    cam.R < 1150 ? rings('coarse', LAND_COARSE) : cam.R < 3800 ? rings('mid', LAND_FINE, 0.07) : rings('fine', LAND_FINE),
    b,
  )
  const coastWeight = cam.R < 900 ? 1.6 : cam.R < 3000 ? 2.4 : 3.5
  if (land) ground.push(`<path d="${land}" fill="${CHART}" stroke="${INK}" stroke-width="${coastWeight}" stroke-linejoin="round" fill-rule="nonzero"/>`)
  if (cam.R > 1000) {
    const lakes = ringsPath(rings('lakes', LAKES), b)
    if (lakes) ground.push(`<path d="${lakes}" fill="${SEA}" stroke="${INK}" stroke-width="${r(coastWeight * 0.6, 2)}" stroke-linejoin="round"/>`)
  }
  ground.push(globeGraticule(cam, b, 0.3 * (0.3 + 0.7 * ramp(now, 0.3, 2.2))))
  if (disc) ground.push(circle(800, 450, cam.R, { stroke: INK, sw: 3 }))

  /* ── The route: every leg run so far, and the one being run ──────── */
  const route = []
  let d = ''
  for (const l of plan.legs) {
    if (now < l.t0) break
    const u = progress(l, now)
    if (u <= 0) continue
    const upTo = Math.floor(u * (l.samples.length - 1))
    const pts = l.samples.slice(0, upTo + 1)
    if (u < 1) pts.push(slerp(l.from.v, l.to.v, u))
    d += sphereLine(pts, b)
  }
  const routeWidth = cam.R < 600 ? 3.2 : 4.5
  if (d) route.push(path(d, { stroke: ROUTE, sw: routeWidth, cap: 'round', join: 'round', opacity: 0.92 }))

  /* ── Places, once the leg that reaches them has set out ──────────── */
  /*
   * Marks only, never names. The names were tried, faded by scale and by
   * recency, and taken out: a place is a red dot on the real map, and the map
   * and the song between them say where it is.
   */
  const marks = []
  const seen = new Set()
  for (const l of plan.legs) {
    for (const [p, opens] of [[l.from, l.t0], [l.to, l.t0]]) {
      if (now < opens || seen.has(p.id)) continue
      seen.add(p.id)
      if (p.id === 'vancouver' && now >= plan.arrive) continue
      const s = onScreen(p.v, b)
      if (s.z < 0.05 || s.x < -300 || s.x > 1900 || s.y < -200 || s.y > 1100) continue
      // Marks fade towards the limb, where the globe turns them away.
      const face = clamp01((s.z - 0.05) / 0.25)
      const firstReach = plan.legs.find((x) => x.to === p)?.t1 ?? opens
      const opacity = r(face * ramp(now, opens, opens + 0.5), 3)
      if (p.minor) {
        const room = ramp(cam.R, 3500, 6000)
        if (room > 0) marks.push(townMark(s.x, s.y, { reached: now >= firstReach, opacity: opacity * room }))
        continue
      }
      const landsAt = p.id === 'sevilla' ? plan.dotFrom : firstReach
      marks.push(portMark(s.x, s.y, null, {
        active: now >= landsAt,
        landing: ramp(now, landsAt, landsAt + 1.2),
        opacity,
      }))
    }
  }

  /* ── The head of the line ────────────────────────────────────────── */
  const head = headAt(plan, now)
  const hs = onScreen(head.v, b)
  const wordHit = activeLine
    ? activeLine.words.reduce((out, w) => Math.max(out, decay(now, w.t, 0.16)), 0)
    : 0
  if (hs.z > 0 && now >= plan.dotFrom) {
    if (now >= plan.arrive) {
      // The last landfall pulses, the way home did in the fourth verse.
      const phase = ((now - plan.arrive) / 2.6) % 1
      const breath = 0.5 - 0.5 * Math.cos(phase * Math.PI * 2)
      marks.push(circle(hs.x, hs.y, 13 * (1 + 0.28 * breath), { fill: ROUTE, opacity: 0.95 }))
      marks.push(circle(hs.x, hs.y, 21 + phase * 60, { stroke: ROUTE, sw: 2.5, opacity: r(0.55 * (1 - phase), 3) }))
    }
    else {
      // Grows from a pinprick while the first verse wanders the province.
      const grown = 4 + 9 * easeOut(ramp(now, plan.dotFrom, plan.growTo))
      // Home again in the fourth verse: the dot breathes, slowly.
      const home = now >= plan.home && now < plan.pulseTo
      const breath = home ? 0.5 - 0.5 * Math.cos(((now - plan.home) / 2.6) * Math.PI * 2) : 0
      marks.push(circle(hs.x, hs.y, grown * (1 + 0.28 * breath) + wordHit * 7, { fill: ROUTE, opacity: 0.95 }))
      if (home) {
        const phase = ((now - plan.home) / 2.6) % 1
        marks.push(circle(hs.x, hs.y, grown + 8 + phase * 60, { stroke: ROUTE, sw: 2.5, opacity: r(0.55 * (1 - phase), 3) }))
      }
    }
  }

  /* ── Furniture that does not move with the chart ─────────────────── */
  const furniture = []
  furniture.push(motifAt('compass', 200, 706, 190, {
    stroke: INK,
    width: 1.8,
    opacity: (quiet ? 0.2 : 0.55) * ramp(now, 3.2, 4.4),
    rotate: r(lerp(-14, 0, easeOutBack(ramp(now, 3.2, 6.0), 1.4)), 2),
  }))
  furniture.push(rect(40, 40, 1520, 820, 'none', { stroke: INK, sw: 4, opacity: ramp(now, 1.1, 2.4) }))
  furniture.push(rect(56, 56, 1488, 788, 'none', { stroke: INK, sw: 1.5, opacity: ramp(now, 1.6, 2.9) }))

  const groundSvg = ground.join('\n')
  return {
    svg: [
      rect(0, 0, 1600, 900, CHART),
      hush < 1 ? `<g opacity="${r(hush, 3)}">${groundSvg}</g>` : groundSvg,
      route.join('\n'),
      marks.join('\n'),
      furniture.join('\n'),
      lyric,
    ].join('\n'),
    label: activeLine?.text ?? section.label,
  }
}

/* ══ THE SCENES ═══════════════════════════════════════════════════════ */

/**
 * The lyric set straight, in one of two places.
 *
 * A chorus names no place, so the route barely moves under it and there is no
 * road to write on: the chorus owns the frame and sets across the top and the
 * bottom of it. A verse line that could not be set on the road is a different
 * thing — the chart is still the picture, and the words have to get out of its
 * way — so it goes into a note panel along the foot of the sheet, which is
 * where a real chart carries the sentences it cannot fit on the water.
 *
 * Both are the spec's own rule rather than a workaround: when a line will not
 * bend, do not force it onto a curve it does not fit.
 */
function straightLyric({ now, line: lyric, from = lyric.start, scope, uid, low = false }) {
  const rows = splitLine(lyric.text)
  const banks = bankWords(lyric, rows)
  // Fully in by the first word: it arrives over the lead, not across the word.
  const arrive = easeOut(ramp(now, from, Math.max(from + 0.12, lyric.start - 0.05)))

  /*
   * Sized to its measure before it is stretched to it. `textLength` with
   * `lengthAdjust="spacing"` takes the difference out of the word spaces, so a
   * row set larger than its column does not get smaller — it gets its spaces
   * eaten, and "I'd travel round the world" comes out as one word.
   */
  const measure = low ? 1330 : 1400
  const cap = low ? 72 : 96
  const sizes = rows.map((row) => Math.min(cap, (cap * measure) / Math.max(widthOf(row, cap, 0), 1)))

  /*
   * The note panel.
   *
   * Sized off the type rather than written down, because a one-row line and a
   * two-row line want different panels and the only thing worse than a lyric
   * over a compass rose is a plate of empty paper under a single row. It sits
   * inside the neatline — a note belongs on the sheet, not on top of it — and
   * carries one hairline rule along its top edge, which is the whole difference
   * between a panel and a wash. (Taken out once and put back: without it the
   * verses read as floating over the map rather than set on the chart.)
   */
  const bottom = 822
  const gap = low ? sizes[0] * 1.22 : 0
  const top = bottom - (rows.length > 1 ? gap : 0) - sizes[0] * 0.92 - 20
  const plate = low
    ? `<g opacity="${r(arrive, 3)}">
      ${rect(56, top, 1488, 844 - top, CHART, { opacity: 0.93 })}
      ${line(56, top, 1544, top, NEAT, 1.5, { opacity: 0.8 })}
    </g>`
    : ''

  const set = rows.map((row, index) => {
    const size = sizes[index]
    const y = low
      ? (rows.length === 1 ? bottom : index === 0 ? bottom - gap : bottom)
      : (rows.length === 1 ? 480 : index === 0 ? 220 : 800)
    const len = Math.min(measure, widthOf(row, size, 0))
    return sungRow({
      id: `${uid}-row-${scope}-${lyric.index}-${index}`,
      x: 800,
      y,
      size,
      text: row,
      len,
      through: throughRow(now, row, banks[index]),
      /*
       * Ink until it is sung, route red once it is — on every row, in every
       * section, and the same direction the words take along the road.
       *
       * The rows used to alternate, so a second row started red and turned ink
       * as the voice crossed it. It looked like a decision and it read as the
       * opposite of one: at the end of the last chorus the words that had just
       * been sung were the dark ones. One rule, one direction.
       */
      fill: LYRIC_UNSUNG,
      accent: LYRIC_SUNG,
      opacity: r(arrive, 3),
    })
  }).join('')

  return plate + set
}

/**
 * The oh-ohs: the chart empties to open sea and seventeen buoys light along a
 * bearing, one per oh. No words — there are none to set.

/**
 * The title, in a cartouche.
 *
 * A plain rectangle of chart colour with a rule round it, the way a chart
 * carries its own title. It fades as the intro ends. It used to be struck off
 * with a red rule first, and that was taken out: a red line through the title
 * read as a mistake, not as the passage about to start.
 */
function cartouche(now, section, score) {
  /*
   * The cartouche is the first thing on the sheet, not the last.
   *
   * It used to open at 4.0 and set its title at 5.6, which left the first six
   * seconds of a two-minute-fifty film on an empty rectangle — and a viewer who
   * does not know what they are looking at by second two has already decided.
   * The box now opens at 1.0 and the song's name is legible by 2.5, so the
   * graticule, the neatline and the soundings draw themselves *around* a title
   * that is already there rather than in front of nothing.
   */
  const open = easeOut(ramp(now, 1.0, 2.3))
  if (open <= 0) return ''
  const leave = fall(now, 16.6, section.to)
  const w = 1040 * open
  const h = 340
  const x = 800 - w / 2
  const y = 280

  return `<g opacity="${r(leave, 3)}">
    ${rect(x, y, w, h, CHART, { stroke: INK, sw: 3 })}
    ${rect(x + 12, y + 12, Math.max(w - 24, 0), h - 24, 'none', { stroke: INK, sw: 1, opacity: 0.5 })}
    ${t({ x: 800, y: 430, size: 130, text: score.title, fill: INK, anchor: 'middle', weight: 600, opacity: r(ramp(now, 1.7, 2.5), 3) })}
    ${t({ x: 800, y: 510, size: 28, text: score.artist, fill: ROUTE, anchor: 'middle', weight: 600, tracking: 14, opacity: r(ramp(now, 3.0, 3.7), 3) })}
    ${t({ x: 800, y: 566, size: 20, text: `From the album ${score.album}`, fill: INK, anchor: 'middle', weight: 400, tracking: 6, opacity: r(0.7 * ramp(now, 4.4, 5.1), 3) })}
  </g>`
}



/**
 * The shared ending, which is not a style decision.
 *
 * The splash screen's lockup on pure black, held, then a hard cut to the
 * credits on the same black. All seven films end this way and none of them gets
 * to design its own — which is why this is the one scene in the file that
 * throws the chart away entirely.
 */
function endCard({ now, section, lockup }) {
  const from = section.from
  const credits = now >= from + 3.4
  const parts = [rect(0, 0, 1600, 900, '#000000')]
  if (!credits) {
    // A hard take-over on the section boundary, no pop and no fade: the globe
    // is the last picture, and the card replaces it rather than arriving on it.
    parts.push(
      `<g transform="translate(800 450) scale(${r(520 / 918, 5)}) translate(-459 -309.5)" style="color:#f4f6f7">${lockup}</g>`,
    )
  }
  else {
    const lines = [
      'Words, voice and guitar — Stefan Auvache Bradley',
      'Mellophone, mix and production — Parker Holt',
    ]
    const first = 450 - ((lines.length - 1) * 62) / 2 + 34 * 0.34
    parts.push(lines.map((credit, i) => t({
      x: 800, y: first + i * 62, size: 34, text: credit,
      fill: '#f4f6f7', anchor: 'middle', weight: 400, upper: false,
    })).join(''))
  }
  return { svg: parts.join('\n'), label: credits ? 'Credits' : 'Havre De Grace' }
}

/* ══ SCORE READING ════════════════════════════════════════════════════
 *
 * Taken by argument rather than imported, so this file stays a pure function of
 * its inputs and one style module can be pointed at a second song without being
 * edited. The two lookups a score needs are small enough to keep here.
 */

const sectionAt = (score, time) =>
  score.sections.find((s) => time >= s.from && time < s.to) ?? score.sections[score.sections.length - 1]

/*
 * When a line comes on screen: a beat before its first word, so it is up and
 * readable as it is sung. Cut in exactly on the first word, the line was only
 * half faded in when that word was sung, and with no colour change to carry
 * the timing, every line read as late. Never before the previous line has
 * finished being sung.
 */
const LEAD = 0.3
const cutIn = (score, line) => {
  const previous = score.lines[line.index - 1]
  // Nor before its own section: the first verse starts 0.13 s before its
  // first word, and a line cut in during the intro would pop in half faded.
  const section = score.sections.find((x) => x.id === line.section)
  const floor = Math.max(previous ? previous.end : 0, section ? section.from : 0)
  return Math.min(line.start, Math.max(line.start - LEAD, floor))
}

/** The line on screen at `time`: like `lineAt`, but cut in early by `cutIn`. */
const shownLineAt = (score, time) => {
  let found = null
  for (const candidate of score.lines) {
    if (cutIn(score, candidate) > time + 0.001) break
    found = candidate
  }
  return found
}

const lineAt = (score, time) => {
  let found = null
  for (const candidate of score.lines) {
    if (candidate.start > time + 0.001) break
    found = candidate
  }
  return found
}

export const CARTOGRAPHY = {
  id: 'b2-cartography',
  name: 'Cartography',
  accent: ROUTE,
  palette: { CHART, SEA, INK, ROUTE, NEAT },
}
