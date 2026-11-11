/*
 * Ship to Stockholm · the road trip — the map: an old paper road map of the
 * United States, drawn from shared/video/geo/usa.mjs.
 *
 * Roads are in the album's ink by class, as a road map prints them but with
 * no colour of their own, because red is the dot's: expressways a double
 * line, US routes a single line, state roads a hairline, and the road the
 * trip takes drawn in as a back road wherever the national data has none
 * (so the dot is never off a printed road). State lines are dashed, the
 * frontier dash-and-dot, water is the song's ice blue, state names are set
 * large, pale and letterspaced across their states, and the sheet carries
 * the creases it was folded on.
 *
 * Everything that does not change is `lib`. The country is cut into 300 km
 * tiles, and a tile's roads are mounted the first time the camera comes near
 * it, so the page never holds more of the map than it has been shown. A
 * frame is a few dozen <use>s under one transform; strokes are non-scaling,
 * so a road is the same weight on the sheet at any distance, and dashes are
 * re-cut every frame in ground lengths so they do not creep while the
 * camera moves. Names, town marks and route numbers (a shield for a US
 * route, the interstate's shield, a circle for a state road) are set on the
 * sheet itself, at their own size whatever the scale.
 *
 * Detail by distance (pixels to a kilometre): state roads below 1.0 and US
 * routes below 0.6 are gone; expressways thin to single lines; names fade
 * below about 1.3, all but the two ends of the trip.
 */
import * as U from '../../geo/usa.mjs'
import { COVER_SHEET, INK, PAPER, PAPER_SHADE, SECOND_INK } from '../../album.mjs'
import { r, ramp, esc } from '../../kit.mjs'
import { line as decodeLine, project } from './geo.mjs'
import { TRIP, STOP, at as kmAt, scaleAt } from './trip.mjs'

const { x: PX, y: PY, w: PW, h: PH } = COVER_SHEET.plate
export const CX = PX + PW / 2
export const CY = PY + PH / 2
const NSS = 'vector-effect="non-scaling-stroke"'

/* Inks. Water is the song's ice let down into the paper; rivers the ice itself. */
const ICE = SECOND_INK['ship-to-stockholm']
export const WATER = '#c3cbc7'
const ABROAD = '#e3dac6'
/** Water close to the shore. */
const SHOAL = '#aebbbb'

/** A camera: (cx, cy) kilometres at the middle of the plate, s pixels to a kilometre. */
export const cam = (cx, cy, s) => ({
  cx, cy, s,
  X: (x) => CX + (x - cx) * s,
  Y: (y) => CY + (y - cy) * s,
  view: { x0: cx - (PW / 2 + 30) / s, x1: cx + (PW / 2 + 30) / s, y0: cy - (PH / 2 + 30) / s, y1: cy + (PH / 2 + 30) / s },
})

/*
 * A polyline as path data, to a tenth of a kilometre: the first point, then
 * every step as a difference (`l dx dy dx dy…`), which is half the markup of
 * absolute points. Differences are of the rounded positions, so nothing drifts.
 */
function pl(pts) {
  let px = Math.round(pts[0][0] * 10)
  let py = Math.round(pts[0][1] * 10)
  let d = `M${px / 10} ${py / 10}l`
  let steps = 0
  for (let i = 1; i < pts.length; i++) {
    const x = Math.round(pts[i][0] * 10)
    const y = Math.round(pts[i][1] * 10)
    if (x === px && y === py) continue
    const [dx, dy] = [(x - px) / 10, (y - py) / 10]
    d += `${i > 1 && dx >= 0 ? ' ' : ''}${dx}${dy >= 0 ? ' ' : ''}${dy}`
    px = x
    py = y
    steps++
  }
  // A line whose points all round to one place draws nothing, and a bare `l` is not path data.
  return steps ? d : ''
}
const ring = (pts) => { const d = pl(pts); return d ? `${d}Z` : '' }

/* ── Tiles ────────────────────────────────────────────────────────── */

const TILE = 300
const tileKey = (x, y) => `${Math.floor(x / TILE)}_${Math.floor(y / TILE)}`

/** Cut a polyline where it crosses from one tile to the next, and hand each piece to its tile. */
function intoTiles(tiles, layer, pts) {
  let key = tileKey(pts[0][0], pts[0][1])
  let run = [pts[0]]
  const flush = () => {
    if (run.length < 2) return
    if (!tiles.has(key)) tiles.set(key, { hwy: '', us: '', st: '', own: '', n: 0 })
    const t = tiles.get(key)
    t[layer] += pl(run)
    t.n += run.length
  }
  for (let i = 1; i < pts.length; i++) {
    run.push(pts[i])
    const k = tileKey(pts[i][0], pts[i][1])
    if (k !== key) { flush(); key = k; run = [pts[i]] }
  }
  flush()
}

const TILES = (() => {
  const tiles = new Map()
  for (const cls of ['hwy', 'us', 'st']) for (const s of U.ROADS[cls]) intoTiles(tiles, cls, decodeLine(s, 3))
  // The trip's own road, once (a road driven back is the same road).
  const seen = new Set()
  let run = []
  const { pts } = TRIP
  for (let i = 1; i < pts.length; i++) {
    const [a, b] = [pts[i - 1], pts[i]]
    const id = a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]) ? `${a[0]},${a[1]},${b[0]},${b[1]}` : `${b[0]},${b[1]},${a[0]},${a[1]}`
    if (seen.has(id)) { if (run.length > 1) intoTiles(tiles, 'own', run); run = []; continue }
    seen.add(id)
    if (!run.length) run.push(a)
    run.push(b)
  }
  if (run.length > 1) intoTiles(tiles, 'own', run)
  return tiles
})()

/* ── The steady layers, built once ────────────────────────────────── */

/** Douglas–Peucker, for the distant drawing. */
function thin(pts, tol) {
  if (pts.length <= 2) return pts
  const keep = new Uint8Array(pts.length)
  keep[0] = keep[pts.length - 1] = 1
  const stack = [[0, pts.length - 1]]
  while (stack.length) {
    const [a, b] = stack.pop()
    const [ax, ay] = pts[a]
    const [dx, dy] = [pts[b][0] - ax, pts[b][1] - ay]
    const L2 = dx * dx + dy * dy
    let worst = -1
    let far = tol * tol
    for (let i = a + 1; i < b; i++) {
      const u = L2 ? Math.max(0, Math.min(1, ((pts[i][0] - ax) * dx + (pts[i][1] - ay) * dy) / L2)) : 0
      const d2 = (pts[i][0] - ax - u * dx) ** 2 + (pts[i][1] - ay - u * dy) ** 2
      if (d2 > far) { far = d2; worst = i }
    }
    if (worst > 0) { keep[worst] = 1; stack.push([a, worst], [worst, b]) }
  }
  return pts.filter((_, i) => keep[i])
}

const STEADY = (() => {
  const nation = U.NATION.map((s) => decodeLine(s, 3))
  const land = U.LAND.map((s) => thin(decodeLine(s, 3), 2.2))
  const lakes = U.LAKES.map((l) => ({ ...l, pts: decodeLine(l.ring, 3), holes: l.holes.map((h) => decodeLine(h, 3)) }))
  const borders = U.BORDERS.map((s) => decodeLine(s, 3))
  const edge = U.EDGE.map((s) => decodeLine(s, 3))
  const rivers = U.RIVERS.map((v) => ({ r: v.r, pts: thin(decodeLine(v.line, 3), 0.9) }))
  const hwyFar = U.ROADS.hwy.map((s) => thin(decodeLine(s, 3), 4)).filter((p) => p.length > 1)
  const xs = nation.flat().map((p) => p[0])
  const ys = nation.flat().map((p) => p[1])
  // A lake is drawn in full only where the drive comes within sight of it; elsewhere, the big ones, roughly.
  const { pts } = TRIP
  const seen = (l) => {
    for (let i = 0; i < l.pts.length; i += 6) for (let j = 0; j < pts.length; j += 8) if (Math.abs(l.pts[i][0] - pts[j][0]) < 420 && Math.abs(l.pts[i][1] - pts[j][1]) < 260) return true
    return false
  }
  const close = lakes.filter(seen)
  return {
    landD: land.map(ring).join(''),
    nationD: nation.map(ring).join(''),
    lakesD: close.map((l) => ring(l.pts) + l.holes.map(ring).join('')).join(''),
    bigLakesD: lakes.filter((l) => l.a > 2500 && !close.includes(l)).map((l) => ring(thin(l.pts, 2))).join(''),
    bordersD: borders.map(pl).join(''),
    edgeD: edge.map(pl).join(''),
    riversBig: rivers.filter((v) => v.r <= 3).map((v) => pl(v.pts)).join(''),
    riversSmall: rivers.filter((v) => v.r > 3).map((v) => pl(v.pts)).join(''),
    hwyFarD: hwyFar.map(pl).join(''),
    box: { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) },
  }
})()

/** The lower forty-eight, whole: where the last pull-out ends. */
export const COUNTRY = (() => {
  const b = STEADY.box
  const s = Math.min((PW - 150) / (b.x1 - b.x0), (PH - 110) / (b.y1 - b.y0))
  return { cx: (b.x0 + b.x1) / 2, cy: (b.y0 + b.y1) / 2 + 20, s }
})()

/* The folds: the sheet is 12 panels by 6, creased where it was folded. */
const FOLD = { w: 610, h: 640, x0: -3660, y0: -1920, nx: 12, ny: 6 }
const foldsD = (() => {
  let v = ''
  let h = ''
  for (let i = 0; i <= FOLD.nx; i++) v += `M${FOLD.x0 + i * FOLD.w} ${FOLD.y0 - 400}V${FOLD.y0 + FOLD.ny * FOLD.h + 400}`
  for (let j = 0; j <= FOLD.ny; j++) h += `M${FOLD.x0 - 400} ${FOLD.y0 + j * FOLD.h}H${FOLD.x0 + FOLD.nx * FOLD.w + 400}`
  return v + h
})()

/* ── The library ──────────────────────────────────────────────────── */

const libs = new Map()
function libFor(uid) {
  if (libs.has(uid)) return libs.get(uid)
  const S = STEADY
  const id = (k) => `${uid}-rm-${k}`
  const base = '<defs>'
    + `<path id="${id('land')}" d="${S.landD}" ${NSS}/>`
    + `<path id="${id('nation')}" d="${S.nationD}" ${NSS}/>`
    + `<path id="${id('lakes')}" d="${S.lakesD}" fill-rule="evenodd" ${NSS}/>`
    + `<path id="${id('lakesfar')}" d="${S.bigLakesD}" ${NSS}/>`
    + `<g id="${id('rivers')}" fill="none" stroke="${ICE}" stroke-linejoin="round"><path d="${S.riversBig}" stroke-width="1.7" ${NSS}/><path d="${S.riversSmall}" stroke-width="1" ${NSS}/></g>`
    + `<path id="${id('borders')}" d="${S.bordersD}" fill="none" ${NSS}/>`
    + `<path id="${id('edge')}" d="${S.edgeD}" fill="none" ${NSS}/>`
    + `<path id="${id('folds')}" d="${foldsD}" fill="none" ${NSS}/>`
    + '</defs>'
  const entry = { chunks: [base], have: new Set() }
  libs.set(uid, entry)
  return entry
}
/** Mount the tiles a frame needs that this uid has not had yet: one new chunk for all of them. */
function mount(uid, keys, far) {
  const entry = libFor(uid)
  let add = ''
  // The distant drawing of the expressways, the first time the camera stands that far off.
  if (far && !entry.have.has('far')) {
    entry.have.add('far')
    add += `<path id="${uid}-rm-hwyfar" d="${STEADY.hwyFarD}" fill="none" ${NSS}/>`
  }
  for (const key of keys) {
    if (entry.have.has(key)) continue
    entry.have.add(key)
    const t = TILES.get(key)
    const id = (k) => `${uid}-rm-${k}${key}`
    add += `<path id="${id('s')}" d="${t.st}" ${NSS}/><path id="${id('o')}" d="${t.own}" ${NSS}/><path id="${id('u')}" d="${t.us}" ${NSS}/><path id="${id('h')}" d="${t.hwy}" ${NSS}/>`
  }
  if (add) entry.chunks.push(`<defs>${add}</defs>`)
  return entry.chunks
}

/* ── Names ────────────────────────────────────────────────────────── */

/* Jost, mixed case, 500: about half an em a letter. */
const WIDE = { i: 0.24, l: 0.24, j: 0.26, t: 0.34, f: 0.32, r: 0.37, ' ': 0.27, m: 0.86, w: 0.8, M: 0.9, W: 1.0, '.': 0.26 }
const widthOf = (text, size, upper) => {
  let ems = 0
  for (const ch of text) ems += upper ? (WIDE[ch.toUpperCase()] ?? 0.7) + 0.06 : WIDE[ch] ?? (ch >= 'A' && ch <= 'Z' ? 0.68 : 0.54)
  return ems * size
}

/*
 * Names are laid out once, for the views the film actually takes (`layNames`,
 * called by the film with every view of the drive): each name at the
 * furthest the camera ever stands off while that town is on the plate, so a
 * name set clear of the road and of its neighbours there is clear of them
 * whenever it is seen. A town the camera never shows is not on the list.
 * Names are gone by the time the last pull-out is past NAMES_OFF.
 */
const NAMES_OFF = [1.5, 1.95]
const S_FLOOR = 1.9
const SIDES = {
  e: [1, 0, 1], w: [-1, 0, 1], n: [0, -1, 1], s: [0, 1, 1], ne: [0.75, -0.8, 1], se: [0.75, 0.8, 1], nw: [-0.75, -0.8, 1], sw: [-0.75, 0.8, 1],
  // Further off, for a town with the road on every side of it.
  ne2: [0.6, -1, 2.1], se2: [0.6, 1, 2.1], nw2: [-0.6, -1, 2.1], sw2: [-0.6, 1, 2.1], n2: [0, -1, 2.3], s2: [0, 1, 2.3], e2: [1, 0, 2.6], w2: [-1, 0, 2.6],
}
const ORDER = ['e', 'w', 'ne', 'se', 'nw', 'sw', 'n', 's']
const FURTHER = ['ne2', 'se2', 'nw2', 'sw2', 'n2', 's2', 'e2', 'w2']

/*
 * Every name on the map and which side of its town it sits: the trip's own
 * stops first, then the nation's towns by size, each taking the first side
 * where it touches neither the road the dot drives, nor a town, nor a name
 * already set. A town with no room is left off. Laid out once, at S_REF; at
 * any closer scale the names are further apart, never nearer.
 */
function lay(views) {
  /** The furthest off (px/km) that (x, y) is ever seen from; 0 if never. */
  const seenAt = (x, y) => {
    let min = Infinity
    for (const v of views) if (v.s < min && x > v.x0 && x < v.x1 && y > v.y0 && y < v.y1) min = v.s
    return min === Infinity ? 0 : Math.max(S_FLOOR, min) * 0.97
  }
  // The road, in a grid, for "is the road under this name".
  const grid = new Map()
  const cell = 12
  const { pts } = TRIP
  for (let i = 1; i < pts.length; i++) {
    const [a, b] = [pts[i - 1], pts[i]]
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 3))
    for (let k = 0; k <= n; k++) {
      const [x, y] = [a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]
      const key = `${Math.floor(x / cell)}_${Math.floor(y / cell)}`
      if (!grid.has(key)) grid.set(key, [])
      grid.get(key).push([x, y])
    }
  }
  const roadIn = (box) => {
    for (let gx = Math.floor(box.x0 / cell); gx <= Math.floor(box.x1 / cell); gx++) {
      for (let gy = Math.floor(box.y0 / cell); gy <= Math.floor(box.y1 / cell); gy++) {
        for (const [x, y] of grid.get(`${gx}_${gy}`) ?? []) if (x >= box.x0 && x <= box.x1 && y >= box.y0 && y <= box.y1) return true
      }
    }
    return false
  }

  /** The nearest point of the road to (x, y): { x, y, d (km along), off (km away) }. */
  const nearest = (x, y) => {
    let best = { off: Infinity }
    for (let i = 1; i < pts.length; i++) {
      const [a, b] = [pts[i - 1], pts[i]]
      if (Math.min(a[0], b[0]) - best.off > x || Math.max(a[0], b[0]) + best.off < x) continue
      const [dx, dy] = [b[0] - a[0], b[1] - a[1]]
      const L2 = dx * dx + dy * dy
      const u = L2 ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L2)) : 0
      const [qx, qy] = [a[0] + dx * u, a[1] + dy * u]
      const off = Math.hypot(x - qx, y - qy)
      if (off < best.off) best = { off, x: qx, y: qy, d: TRIP.cum[i - 1] + Math.sqrt(L2) * u }
    }
    return best
  }

  const list = []
  for (const s of STOP.values()) {
    if (s.via) continue
    // A stop's mark sits on the road itself, where the road passes the town.
    const on = nearest(s.at[0], s.at[1])
    const p = on.off < 9 ? [on.x, on.y] : s.at
    list.push({ name: s.name, x: p[0], y: p[1], big: Boolean(s.big), stop: true, side: s.side, end: s.key === 'New York, NY' || s.key === 'Seaside, OR', s: seenAt(p[0], p[1]) || scaleAt(kmAt(s.key)) })
  }
  // The far shore of the ferry.
  const mw = project([-87.657, 44.089])
  list.push({ name: 'Manitowoc', x: mw[0], y: mw[1], side: 'w', s: seenAt(mw[0], mw[1]) || 2.3 })
  const towns = [...U.TOWNS].sort((a, b) => a.r - b.r || b.pop - a.pop)
  for (const t of towns) {
    const [x, y] = project([t.lon, t.lat])
    if (list.some((o) => Math.hypot(o.x - x, o.y - y) < 14)) continue
    // Only where the camera ever shows it.
    const seen = seenAt(x, y)
    if (!seen) continue
    list.push({ name: t.name, x, y, big: t.r <= 3, s: seen })
  }

  const placed = []
  const boxes = []
  const hits = (b) => boxes.some((o) => b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0)
  // Town marks keep their own ground first.
  const mark = (t, S) => { const m = (t.big ? 6 : 4.2) / S; return { x0: t.x - m, x1: t.x + m, y0: t.y - m, y1: t.y + m } }
  for (const t of list) {
    const S = t.s
    const size = t.big ? 12.5 : 11
    const text = t.big ? t.name.toUpperCase() : t.name
    const w = (widthOf(t.name, size, t.big) + (t.big ? text.length * 1.1 : 0)) / S
    const h = (size * 0.78) / S
    const gap = (t.big ? 9 : 7) / S
    const boxFor = (side) => {
      const [sx, sy, far] = SIDES[side]
      const g = gap * far
      const cy = t.y + sy * ((sx ? 0.9 : 1.35) * g + h / 2)
      const ax = sx === 0 ? 0 : sx > 0 ? 1 : -1
      const x0 = ax > 0 ? t.x + g * Math.abs(sx) : ax < 0 ? t.x - g * Math.abs(sx) - w : t.x - w / 2
      return { side, x0, x1: x0 + w, y0: cy - h / 2, y1: cy + h / 2, anchor: ax > 0 ? 'start' : ax < 0 ? 'end' : 'middle', tx: ax > 0 ? x0 : ax < 0 ? x0 + w : t.x, cy }
    }
    const pad = (b, px) => ({ x0: b.x0 - px / S, x1: b.x1 + px / S, y0: b.y0 - px / S, y1: b.y1 + px / S })
    const m = mark(t, S)
    if (!t.stop && hits(pad(m, 3))) continue
    let pick = null
    for (const side of [...(t.side ? [t.side] : []), ...ORDER, ...(t.stop ? FURTHER : [])]) {
      const b = boxFor(side)
      if (hits(pad(b, 2.5)) || roadIn(pad(b, 6))) continue
      pick = b
      break
    }
    if (!pick && t.stop) {
      // A stop is always named: take the side clear of other names, road or no road.
      for (const side of ORDER) { const b = boxFor(side); if (!hits(pad(b, 2))) { pick = b; break } }
    }
    if (!pick) { if (t.stop) { boxes.push(m); placed.push({ ...t, text: null }) } continue }
    boxes.push(m, pick)
    placed.push({ ...t, text, size, anchor: pick.anchor, dx: (pick.tx - t.x) * S, dy: (pick.cy - t.y) * S + size * 0.36, side: pick.side, forced: roadIn(pad(pick, 6)) })
  }
  /*
   * Route numbers, last: a shield at the middle of a numbered stretch, only
   * where nothing is already set and never on the road the dot drives (the
   * red line would run through it).
   */
  const shields = []
  for (const [n, k, lon, lat] of U.SHIELDS) {
    const [x, y] = project([lon, lat])
    const S = seenAt(x, y)
    if (!S) continue
    const b = { x0: x - 9 / S, x1: x + 9 / S, y0: y - 8.5 / S, y1: y + 8.5 / S }
    const pad = (px) => ({ x0: b.x0 - px / S, x1: b.x1 + px / S, y0: b.y0 - px / S, y1: b.y1 + px / S })
    if (hits(pad(5)) || roadIn(pad(7))) continue
    boxes.push(b)
    shields.push({ n, k, x, y })
  }
  return { placed, shields }
}
let LAID = null
/**
 * Lay the names out for a film's views: [{ x0, x1, y0, y1, s }], the plate's
 * extent in kilometres and the scale at each sampled moment. Called once.
 */
export function layNames(views) { LAID = lay(views); return LAID }
/** What was laid out: { placed, shields }. */
export const laid = () => LAID ?? layNames([])

/* State names: across the state, pale, letterspaced. In kilometres, so they are part of the sheet. */
const STATE_AT = { Michigan: [70, 70], Idaho: [-10, 150], Louisiana: [-60, -20], Florida: [70, -60], Maryland: [40, -25], Minnesota: [-30, 0], Oklahoma: [80, 10], Virginia: [60, 30], Kentucky: [30, 10], Texas: [60, -40], California: [-20, 20], Nevada: [0, -60], 'New York': [40, 10], Massachusetts: [-20, 0], Illinois: [0, -20], Wisconsin: [0, 30], 'New Jersey': [8, 10] }
const STATES = U.STATE_NAMES.filter((s) => s.name !== 'District of Columbia').map((s) => {
  const n = s.name.length
  const tall = s.h > s.w * 1.25 && n > 5
  const size = Math.max(7, Math.min(s.h * (tall ? 0.16 : 0.2), ((tall ? 0.8 : 0.62) * s.w) / (n * 1.05), 62))
  const [ox, oy] = STATE_AT[s.name] ?? [0, 0]
  return { text: s.name.toUpperCase(), x: s.x + ox, y: s.y + oy, size, track: size * 0.38 }
})

/* ── A frame of the map ───────────────────────────────────────────── */

const use = (uid, k, extra = '') => `<use href="#${uid}-rm-${k}"${extra}/>`
const op = (v) => (v >= 0.999 ? '' : ` opacity="${r(v, 3)}"`)

/**
 * The map at camera c: { svg, lib }. `svg` is the ground (under the dot's
 * line); `names(c)` below is what is set over it.
 */
export function ground(c, uid) {
  const v = c.view
  const near = ramp(c.s, 0.75, 1.15) // the tiled roads
  const st = ramp(c.s, 1.0, 1.5)
  const us = ramp(c.s, 0.6, 1.0)
  const far = 1 - ramp(c.s, 0.8, 1.2)
  const keys = []
  if (near > 0) {
    for (let i = Math.floor(v.x0 / TILE); i <= Math.floor(v.x1 / TILE); i++) {
      for (let j = Math.floor(v.y0 / TILE); j <= Math.floor(v.y1 / TILE); j++) if (TILES.has(`${i}_${j}`)) keys.push(`${i}_${j}`)
    }
  }
  const lib = mount(uid, keys, far > 0)
  const dash = (...km) => km.map((k) => r(Math.max(0.8, k * c.s), 2)).join(' ')
  // The weights of a road, a little lighter as the camera stands off.
  const k = 0.82 + 0.18 * ramp(c.s, 1.8, 3.6)
  const shore = `stroke="${INK}" stroke-opacity="0.8" stroke-width="${r(0.6 + 0.4 * (1 - far), 2)}"`
  let g = `<rect x="${r(v.x0 - 50)}" y="${r(v.y0 - 50)}" width="${r(v.x1 - v.x0 + 100)}" height="${r(v.y1 - v.y0 + 100)}" fill="${WATER}"/>`
  // The coast's vignette: a band of deeper water hugging the land, as a road map prints its shores.
  const band = `fill="none" stroke="${SHOAL}" stroke-linejoin="round"`
  g += use(uid, 'land', ` ${band} stroke-width="${r(13 - 5 * far, 1)}"`) + use(uid, 'nation', ` ${band} stroke-width="${r(13 - 5 * far, 1)}"`)
  g += use(uid, 'land', ` fill="${ABROAD}"`) + use(uid, 'nation', ` fill="${PAPER}" ${shore}`)
  g += use(uid, 'rivers', op(0.45 + 0.55 * ramp(c.s, 0.5, 1.4)))
  g += use(uid, 'lakesfar', ` fill="${WATER}" ${shore}`) + use(uid, 'lakes', ` fill="${WATER}" ${shore}`)
  // State names, under every line.
  const nameOp = 0.15 * ramp(c.s, 0.55, 1.0)
  if (nameOp > 0.004) {
    let names = ''
    for (const s of STATES) {
      const half = (s.text.length * (s.size * 0.7 + s.track)) / 2
      if (s.x + half < v.x0 || s.x - half > v.x1 || s.y + s.size < v.y0 || s.y - s.size > v.y1) continue
      names += `<text x="${r(s.x)}" y="${r(s.y + s.size * 0.36)}" font-size="${r(s.size, 2)}" letter-spacing="${r(s.track, 2)}" text-anchor="middle">${esc(s.text)}</text>`
    }
    if (names) g += `<g fill="${INK}" font-weight="700" opacity="${r(nameOp, 3)}">${names}</g>`
  }
  g += use(uid, 'folds', ` stroke="${PAPER_SHADE}" stroke-width="2.2" opacity="0.5"`)
  // State lines and the frontier: dashed close to, plain hairlines from far off.
  g += use(uid, 'borders', far < 1
    ? ` stroke="${INK}" stroke-width="${r(0.7 + 0.3 * (1 - far), 2)}" stroke-opacity="${r(0.62 - 0.12 * far, 3)}" stroke-dasharray="${dash(3.2, 1.3)}"`
    : ` stroke="${INK}" stroke-width="0.7" stroke-opacity="0.5"`)
  g += use(uid, 'edge', ` stroke="${INK}" stroke-width="${r(1 + 0.5 * (1 - far), 2)}" stroke-opacity="0.75" stroke-dasharray="${dash(4.5, 1.4, 0.5, 1.4)}"`)
  // Roads, lightest first; every expressway's casing under every expressway's middle.
  if (near > 0) {
    const tiles = (kind) => keys.map((key) => use(uid, `${kind}${key}`)).join('')
    let roads = ''
    if (st > 0) roads += `<g stroke-width="${r(0.65 * k, 2)}" stroke-opacity="${r(0.62 * st, 3)}">${tiles('s')}</g>`
    roads += `<g stroke-width="${r(0.95 * k, 2)}" stroke-opacity="${r(0.8 * Math.max(st, 0.55), 3)}">${tiles('o')}</g>`
    if (us > 0) roads += `<g stroke-width="${r(1.25 * k, 2)}" stroke-opacity="${r(0.9 * us, 3)}">${tiles('u')}</g>`
    roads += `<g stroke-width="${r(3.3 * k, 2)}">${tiles('h')}</g><g stroke="${PAPER}" stroke-width="${r(1.5 * k, 2)}">${tiles('h')}</g>`
    g += `<g fill="none" stroke="${INK}" stroke-linejoin="round"${op(near)}>${roads}</g>`
  }
  if (far > 0) g += use(uid, 'hwyfar', ` stroke="${INK}" stroke-width="0.7" stroke-opacity="${r(0.38 * far, 3)}"`)
  return {
    svg: `<g transform="translate(${r(CX - c.cx * c.s, 2)} ${r(CY - c.cy * c.s, 2)}) scale(${r(c.s, 5)})">${g}</g>`,
    lib,
  }
}

/* A US route's shield and an interstate's, about 15 px across, drawn round (0, 0). */
const SHIELD_US = 'M-6.6 -6.4Q-3.3 -5 0 -7Q3.3 -5 6.6 -6.4Q7.9 -1.2 5.6 3Q3.6 6 0 7.4Q-3.6 6 -5.6 3Q-7.9 -1.2 -6.6 -6.4Z'
const SHIELD_I = 'M-6.6 -5.6Q0 -8.4 6.6 -5.6Q7.6 1 0 7.8Q-7.6 1 -6.6 -5.6Z'

/** Town marks and names at camera c, on the sheet. `ends` (0–1) keeps the trip's two ends lettered when the rest have gone. */
export function names(c) {
  const v = c.view
  const all = ramp(c.s, ...NAMES_OFF)
  let marks = ''
  let text = ''
  let ends = ''
  let shields = ''
  if (all > 0.004) {
    for (const h of laid().shields) {
      if (h.x < v.x0 || h.x > v.x1 || h.y < v.y0 || h.y > v.y1) continue
      const shape = h.k === 's' ? '<circle r="7.2"/>' : h.k === 'i' ? `<path d="${SHIELD_I}"/><path d="M-6.3 -3.4H6.3" stroke-width="0.8"/>` : `<path d="${SHIELD_US}"/>`
      shields += `<g transform="translate(${r(c.X(h.x))} ${r(c.Y(h.y))})">${shape}<text y="${h.k === 'i' ? 3.6 : 2.7}" font-size="${h.n.length > 2 ? 6.3 : 7.4}" font-weight="600" text-anchor="middle" fill="${INK}" stroke="none">${h.n}</text></g>`
    }
  }
  for (const t of laid().placed) {
    if (t.x < v.x0 - 60 || t.x > v.x1 + 60 || t.y < v.y0 - 20 || t.y > v.y1 + 20) continue
    if (all <= 0.004 && !t.end) continue
    const [x, y] = [c.X(t.x), c.Y(t.y)]
    const m = t.big
      ? `<circle cx="${r(x)}" cy="${r(y)}" r="5" fill="${PAPER}" stroke="${INK}" stroke-width="1.2"/><circle cx="${r(x)}" cy="${r(y)}" r="1.9" fill="${INK}"/>`
      : `<circle cx="${r(x)}" cy="${r(y)}" r="3.1" fill="${PAPER}" stroke="${INK}" stroke-width="1.1"/>`
    const label = t.text
      ? `<text x="${r(x + t.dx)}" y="${r(y + t.dy)}" font-size="${t.size}" font-weight="${t.big ? 600 : 500}"${t.big ? ' letter-spacing="1.1"' : ''}${t.anchor !== 'start' ? ` text-anchor="${t.anchor}"` : ''}>${esc(t.text)}</text>`
      : ''
    if (t.end) ends += m + label
    else { marks += m; text += label }
  }
  const halo = `stroke="${PAPER}" stroke-width="3" stroke-linejoin="round" paint-order="stroke" fill="${INK}"`
  return (shields ? `<g fill="${PAPER}" stroke="${INK}" stroke-width="0.9" stroke-linejoin="round"${op(all * 0.9)}>${shields}</g>` : '')
    + (all > 0.004 ? `<g ${halo}${op(all)}>${marks}${text}</g>` : '') + `<g ${halo}>${ends}</g>`
}

export { STATES, TILES, ICE }
