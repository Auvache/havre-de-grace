/*
 * Conman on a Portland map — where the five heists go (planning sketch,
 * 2026-11-09). Not the film: a labelled diagram of the sites, with the real
 * places named, shown as a test on /visualizers/conman beside the new map
 * (map.mjs), which has no names. Delete it once the map is settled. The film itself carries no names at all
 * (the user, 2026-11-09: the town is not revealed as Portland until the
 * camera pulls out at the end).
 *
 * The map is north-up and "just based on Portland": east–west is true, and
 * north–south is squeezed outside the middle (Fremont Bridge to Ross Island
 * Bridge), the way a visitor's map is, so the far north and south fit a wide
 * frame. Positions are from street addresses, good to a block or two.
 */
import { COVER_SHEET, INK, PAPER, PAPER_SHADE, RED, paper } from '../../album.mjs'

const WATER = '#c6d1d4'
const { x: PX, y: PY, w: PW, h: PH } = COVER_SHEET.plate
const r = (v, d = 1) => Math.round(v * 10 ** d) / 10 ** d
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')

/* ── The projection ──────────────────────────────────────────────────── */

const LAT0 = 45.523
const LON0 = -122.6685
/** Kilometres east and south of the Burnside Bridge. */
const km = ([lat, lon]) => [(lon - LON0) * 78, -(lat - LAT0) * 111.2]
const N_EDGE = -1.67 // the Fremont Bridge
const S_EDGE = 2.56 // the Ross Island Bridge
const CORE = 0.85
const warp = (y) => (y < N_EDGE ? N_EDGE * CORE + (y - N_EDGE) * 0.36 : y > S_EDGE ? S_EDGE * CORE + (y - S_EDGE) * 0.4 : y * CORE)
const K = 120 // pixels to a kilometre
const X0 = -6.0
const Y0 = -3.3
const toPx = ([x, y]) => [PX + (x - X0) * K, PY + (warp(y) - Y0) * K]
const px = (ll) => toPx(km(ll))
/** A line of kilometre points cut into short steps, so the squeeze bends it where it should. */
function fine(pts, step = 0.12) {
  const out = [pts[0]]
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step))
    for (let k = 1; k <= n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n])
  }
  return out
}
const lineD = (lls) => `M${fine(lls.map(km)).map(toPx).map(([x, y]) => `${r(x)} ${r(y)}`).join('L')}`
const polyD = (kms) => `M${fine([...kms, kms[0]]).map(toPx).map(([x, y]) => `${r(x)} ${r(y)}`).join('L')}Z`
const ellipse = ([lat, lon], rx, ry, n = 28) => {
  const [cx, cy] = km([lat, lon])
  return Array.from({ length: n }, (_, i) => [cx + rx * Math.cos((i / n) * 2 * Math.PI), cy + ry * Math.sin((i / n) * 2 * Math.PI)])
}

/* ── The river and its bridges ───────────────────────────────────────── */

/** The Willamette's centreline, south to north: [lat, lon, half-width km]. */
const RIVER = [
  [45.462, -122.665, 0.16], [45.47, -122.6645, 0.17], [45.478, -122.664, 0.22], [45.485, -122.6615, 0.5], [45.493, -122.6635, 0.45], [45.499, -122.667, 0.24],
  [45.503, -122.667, 0.2], [45.5078, -122.669, 0.19], [45.5132, -122.6705, 0.19], [45.5176, -122.67, 0.19], [45.523, -122.6685, 0.19], [45.5275, -122.6692, 0.19],
  [45.532, -122.6745, 0.19], [45.538, -122.683, 0.21], [45.545, -122.6935, 0.24], [45.554, -122.707, 0.27], [45.564, -122.723, 0.27], [45.575, -122.742, 0.27], [45.585, -122.764, 0.27], [45.6, -122.79, 0.3],
]
const CENTRE = RIVER.map(km)
const tangentAt = (i) => {
  const a = CENTRE[Math.max(0, i - 1)]
  const b = CENTRE[Math.min(CENTRE.length - 1, i + 1)]
  const L = Math.hypot(b[0] - a[0], b[1] - a[1])
  return [(b[0] - a[0]) / L, (b[1] - a[1]) / L]
}
const bank = (side) => CENTRE.map((p, i) => {
  const t = tangentAt(i)
  return [p[0] + side * -t[1] * RIVER[i][2], p[1] + side * t[0] * RIVER[i][2]]
})
const RIVER_D = polyD([...bank(1), ...bank(-1).reverse()])
const ROSS_ISLAND = polyD(ellipse([45.4872, -122.6598], 0.2, 0.62))

/** Where the centreline is at a latitude, and across it. */
function crossing(lat) {
  const y = -(lat - LAT0) * 111.2
  for (let i = 1; i < CENTRE.length; i++) {
    const a = CENTRE[i - 1]
    const b = CENTRE[i]
    if ((a[1] - y) * (b[1] - y) > 0) continue
    const u = (y - a[1]) / (b[1] - a[1])
    const L = Math.hypot(b[0] - a[0], b[1] - a[1])
    const n = [-(b[1] - a[1]) / L, (b[0] - a[0]) / L]
    const half = RIVER[i - 1][2] + (RIVER[i][2] - RIVER[i - 1][2]) * u + 0.07
    const c = [a[0] + (b[0] - a[0]) * u, y]
    return { c, w: [c[0] + n[0] * half, c[1] + n[1] * half], e: [c[0] - n[0] * half, c[1] - n[1] * half] }
  }
  return null
}
const BRIDGES = [
  ['Fremont', 45.538], ['Broadway', 45.5318], ['Steel', 45.5275], ['Burnside', 45.523], ['Morrison', 45.5176], ['Hawthorne', 45.5132], ['Marquam', 45.5078], ['Tilikum', 45.5044], ['Ross Island', 45.5008],
].map(([name, lat]) => ({ name, ...crossing(lat) }))
const bridge = (name) => BRIDGES.find((b) => b.name === name).c

/* ── Streets, hills, parks ───────────────────────────────────────────── */

const ew = (lat, lon0, lon1) => [[lat, lon0], [lat, lon1]]
const ns = (lon, lat0, lat1) => [[lat0, lon], [lat1, lon]]
const STREETS = [
  ew(45.523, -122.75, -122.58), // Burnside
  [[45.5232, -122.657], [45.5357, -122.6205], [45.548, -122.585]], // Sandy
  ns(-122.6615, 45.497, 45.59), // MLK
  [[45.53, -122.672], [45.54, -122.6765], [45.5627, -122.6815], [45.59, -122.6815]], // Interstate
  ew(45.5627, -122.7, -122.58), // Killingsworth
  ew(45.559, -122.6615, -122.6), // Alberta
  ew(45.5483, -122.672, -122.58), // Fremont Street
  ew(45.5351, -122.672, -122.6205), // Broadway
  ew(45.5192, -122.665, -122.58), // Stark
  ew(45.512, -122.667, -122.58), // Hawthorne
  ew(45.5048, -122.662, -122.58), // Division
  ew(45.4975, -122.66, -122.58), // Powell
  ns(-122.6225, 45.475, 45.565), // 39th
  ns(-122.6535, 45.497, 45.5351), // 12th
  ns(-122.6815, 45.508, 45.531), // downtown's Broadway
]
const FREEWAYS = [
  [[45.59, -122.679], [45.545, -122.676], [45.536, -122.668], [45.523, -122.664], [45.51, -122.664], [45.5078, -122.669], [45.502, -122.677], [45.475, -122.677]],
  [[45.538, -122.683], [45.533, -122.685], [45.527, -122.688], [45.518, -122.69], [45.51, -122.687], [45.5068, -122.678]],
  [[45.5285, -122.662], [45.533, -122.63], [45.534, -122.58]],
  [[45.5165, -122.69], [45.512, -122.72], [45.51, -122.75]],
]
/** The foot of the West Hills, north to south. */
const HILL_FOOT = [[45.6, -122.775], [45.575, -122.752], [45.56, -122.732], [45.545, -122.717], [45.535, -122.709], [45.527, -122.704], [45.518, -122.699], [45.508, -122.694], [45.495, -122.69], [45.47, -122.686]]
const hillLine = (dx, wob) => fine(HILL_FOOT.map(km)).map(([x, y], i) => [x - dx + wob * Math.sin(i * 0.31 + dx * 3), y])
const HILLS_D = `M${[...hillLine(0, 0), [X0 - 1, 9], [X0 - 1, -12]].map(toPx).map(([x, y]) => `${r(x)} ${r(y)}`).join('L')}Z`
const CONTOURS = [0.45, 0.95, 1.5, 2.1, 2.8].map((dx, k) => `M${hillLine(dx, 0.1 + 0.04 * k).map(toPx).map(([x, y]) => `${r(x)} ${r(y)}`).join('L')}`).join('')
const LADD = (() => {
  const [cx, cy] = km([45.5085, -122.6492])
  const h = 0.42
  return { d: polyD([[cx, cy - h], [cx + h, cy], [cx, cy + h], [cx - h, cy]]), x: `M${[[cx - h / 2, cy - h / 2], [cx + h / 2, cy + h / 2]].map(toPx).map((p) => p.map((v) => r(v)).join(' ')).join('L')}M${[[cx - h / 2, cy + h / 2], [cx + h / 2, cy - h / 2]].map(toPx).map((p) => p.map((v) => r(v)).join(' ')).join('L')}`, c: toPx([cx, cy]) }
})()
const PARKS = [
  { at: [45.515, -122.71], rx: 0.6, ry: 0.75, name: 'Washington Park' },
  { at: [45.5212, -122.6265], rx: 0.27, ry: 0.2, name: 'Laurelhurst' },
  { at: [45.512, -122.5945], rx: 0.45, ry: 0.55, name: 'Mt Tabor' },
  { at: [45.5176, -122.6425], rx: 0.2, ry: 0.13 },
  { at: [45.5465, -122.6575], rx: 0.2, ry: 0.2, name: 'Irving Park' },
  { at: [45.5645, -122.6445], rx: 0.2, ry: 0.25 },
  { at: [45.5685, -122.6735], rx: 0.2, ry: 0.25 },
  { at: [45.5395, -122.629], rx: 0.2, ry: 0.2 },
  { at: [45.48, -122.6555], rx: 0.22, ry: 0.55 },
  { at: [45.5152, -122.684], rx: 0.045, ry: 0.4, name: 'Park Blocks', side: -1 },
  { at: [45.5175, -122.6728], rx: 0.045, ry: 0.75 },
]

/* ── The places ──────────────────────────────────────────────────────── */

const PLACES = {
  hay: { at: [45.5627, -122.679], name: 'the Haymaker', label: [-24, -6, 'end'] },
  pow: { at: [45.5231, -122.6813], name: "Powell's Books", label: [-24, -6, 'end'] },
  pam: { at: [45.5162, -122.6834], name: 'the art museum', label: [-24, 8, 'end'] },
  pit: { at: [45.5252, -122.7163], name: 'Pittock Mansion', label: [0, -46, 'middle'] },
  alb: { at: [45.559, -122.6349], name: 'Alberta Rose', label: [24, -6, 'start'] },
  art: { at: [45.4975, -122.6455], name: 'Artichoke Music', label: [24, 8, 'start'] },
  rev: { at: [45.519, -122.6525], name: 'Revolution Hall', label: [24, 30, 'start'] },
  moda: { at: [45.5316, -122.6668], name: 'Moda Center', label: [12, 5, 'start'] },
  jack: { at: [45.5052, -122.611], name: 'Jackpot! studio', label: [12, 5, 'start'] },
  omsi: { at: [45.5084, -122.6659], name: 'OMSI', label: [12, 16, 'start'] },
  mill: { at: [45.5231, -122.633], name: 'Music Millennium', label: [12, -8, 'start'] },
  holly: { at: [45.5357, -122.6205], name: 'Hollywood Theatre', label: [12, -8, 'start'] },
}
const JOBS = ['RECORD SHOP', 'COUNTING HOUSE', 'STUDIO', 'MUSEUM', 'CONCERT HALL']
const LEGS = ['the drive', 'chase 1', 'chase 2', 'the getaway']
/** Where along each leg its label sits (0–1), and its offset in pixels. */
const LEG_LABEL = [[0.3, 12, -6], [0.72, 0, -12], [0.45, 10, -12], [0.62, 0, 24]]

/** The pick (B, 2026-11-09; A and C are in docs/visualizers/conman.md): the five sites in order, and the way between them (place keys, bridge names or [lat, lon]). */
const OPTIONS = [
  {
    key: 'sites-b', label: 'The sites · sketch', title: 'THE FIVE SITES', note: 'Picked 2026-11-09: two west of the river, far apart',
    sites: ['hay', 'pow', 'alb', 'pit', 'rev'],
    legs: [
      ['hay', [45.5627, -122.6815], [45.54, -122.6765], 'Broadway', [45.5295, -122.6813], 'pow'],
      ['pow', [45.5275, -122.6813], 'Steel', [45.5285, -122.6615], [45.5465, -122.6615], [45.5483, -122.6349], 'alb'],
      ['alb', [45.559, -122.6615], [45.5483, -122.6615], [45.5483, -122.672], 'Fremont', [45.533, -122.685], [45.531, -122.7], 'pit'],
      ['pit', [45.5232, -122.705], [45.523, -122.685], 'Burnside', [45.523, -122.6535], 'rev'],
    ],
  },
]

/* ── Drawing ─────────────────────────────────────────────────────────── */

const txt = (x, y, size, text, o = {}) =>
  `<text x="${r(x)}" y="${r(y)}" font-size="${size}" font-weight="${o.weight ?? 500}" fill="${o.fill ?? INK}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.spacing != null ? ` letter-spacing="${o.spacing}"` : ''}${o.opacity != null ? ` opacity="${o.opacity}"` : ''}${o.italic ? ' font-style="italic"' : ''}${o.halo ? ` stroke="${PAPER}" stroke-width="5" stroke-linejoin="round" paint-order="stroke"` : ''}>${esc(text)}</text>`

function base(uid) {
  let s = `<defs><clipPath id="${uid}-clip"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}"/></clipPath>
<pattern id="${uid}-grid" width="13" height="11" patternUnits="userSpaceOnUse"><path d="M0 0H13M0 0V11" stroke="${INK}" stroke-width="0.7" opacity="0.2" fill="none"/></pattern></defs>`
  s += `<g clip-path="url(#${uid}-clip)">`
  s += `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="url(#${uid}-grid)"/>`
  // The hills: no grid, contours.
  s += `<path d="${HILLS_D}" fill="${PAPER}"/><path d="${CONTOURS}" fill="none" stroke="${INK}" stroke-width="0.9" opacity="0.3"/>`
  for (const p of PARKS) s += `<path d="${polyD(ellipse(p.at, p.rx, p.ry))}" fill="${PAPER_SHADE}" stroke="${INK}" stroke-width="0.8" stroke-opacity="0.45"/>`
  s += `<path d="${LADD.d}" fill="${PAPER}" stroke="${INK}" stroke-width="0.9" stroke-opacity="0.5"/><path d="${LADD.x}" stroke="${INK}" stroke-width="0.9" stroke-opacity="0.5"/><circle cx="${r(LADD.c[0])}" cy="${r(LADD.c[1])}" r="6" fill="${PAPER_SHADE}" stroke="${INK}" stroke-width="0.8" stroke-opacity="0.5"/>`
  for (const st of STREETS) s += `<path d="${lineD(st)}" fill="none" stroke="${PAPER}" stroke-width="5"/><path d="${lineD(st)}" fill="none" stroke="${INK}" stroke-width="1.1" opacity="0.5"/>`
  for (const f of FREEWAYS) s += `<path d="${lineD(f)}" fill="none" stroke="${PAPER}" stroke-width="7"/><path d="${lineD(f)}" fill="none" stroke="${INK}" stroke-width="1.6" stroke-dasharray="9 5" opacity="0.5"/>`
  s += `<path d="${RIVER_D}" fill="${WATER}" stroke="${INK}" stroke-width="1.3" stroke-opacity="0.7"/><path d="${ROSS_ISLAND}" fill="${PAPER}" stroke="${INK}" stroke-width="1" stroke-opacity="0.6"/>`
  for (const b of BRIDGES) {
    const [w, e] = [toPx(b.w), toPx(b.e)]
    s += `<path d="M${r(w[0])} ${r(w[1])}L${r(e[0])} ${r(e[1])}" stroke="${INK}" stroke-width="8" stroke-opacity="0.75"/><path d="M${r(w[0])} ${r(w[1])}L${r(e[0])} ${r(e[1])}" stroke="${PAPER}" stroke-width="5.4"/>`
    const east = w[0] > e[0] ? w : e
    s += txt(east[0] + 9, east[1] + 5, 14, b.name, { italic: true, opacity: 0.8, halo: true })
  }
  for (const p of PARKS.filter((q) => q.name)) {
    const c = px(p.at)
    s += txt(c[0] + (p.side === -1 ? -10 : 0), c[1] + (p.side === -1 ? 60 : p.ry * K * 0.85 + 16), 13, p.name.toUpperCase(), { anchor: p.side === -1 ? 'end' : 'middle', spacing: 1.2, opacity: 0.6, halo: true })
  }
  s += txt(LADD.c[0], LADD.c[1] + 62, 13, "LADD'S", { anchor: 'middle', spacing: 1.2, opacity: 0.6, halo: true })
  s += txt(px([45.553, -122.737])[0], px([45.553, -122.737])[1], 13, 'FOREST PARK', { anchor: 'middle', spacing: 1.2, opacity: 0.6 })
  s += txt(px([45.497, -122.722])[0], px([45.497, -122.722])[1], 13, 'WEST HILLS', { anchor: 'middle', spacing: 1.2, opacity: 0.6 })
  return s
}

const pointOf = (w) => (typeof w !== 'string' ? km(w) : PLACES[w] ? km(PLACES[w].at) : bridge(w))

function option(o, uid) {
  let s = paper(COVER_SHEET) + base(uid)
  // Places not used in this option, faint.
  for (const [key, p] of Object.entries(PLACES)) {
    if (o.sites.includes(key)) continue
    const c = px(p.at)
    s += `<circle cx="${r(c[0])}" cy="${r(c[1])}" r="5.5" fill="${PAPER}" stroke="${INK}" stroke-width="1.6" opacity="0.7"/>`
    s += txt(c[0] + p.label[0] * 0.5, c[1] + (p.label[1] > 0 ? 16 : -8), 13, p.name, { anchor: p.label[2], opacity: 0.6, halo: true })
  }
  // The way between the sites.
  o.legs.forEach((leg, i) => {
    const pts = fine(leg.map(pointOf)).map(toPx)
    s += `<path d="M${pts.map(([x, y]) => `${r(x)} ${r(y)}`).join('L')}" fill="none" stroke="${RED}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"${i === 1 || i === 2 ? ' stroke-dasharray="12 7"' : ''}/>`
    const [u, dx, dy] = (o.legLabels ?? LEG_LABEL)[i]
    const m = pts[Math.floor((pts.length - 1) * u)]
    s += txt(m[0] + dx, m[1] + dy, 15, LEGS[i], { fill: RED, weight: 700, halo: true })
  })
  // The finale: No. 1 away east as the camera pulls out.
  const rev = px(PLACES.rev.at)
  const out = px([45.5192, -122.583])
  s += `<path d="M${r(rev[0])} ${r(rev[1])}L${r(out[0])} ${r(out[1])}" stroke="${RED}" stroke-width="2.2" stroke-dasharray="2 7" stroke-linecap="round"/>`
  s += txt(out[0] - 8, out[1] - 10, 15, 'No. 1, never caught', { fill: RED, weight: 700, anchor: 'end', halo: true })
  // The sites.
  o.sites.forEach((key, i) => {
    const p = PLACES[key]
    const c = px(p.at)
    s += `<circle cx="${r(c[0])}" cy="${r(c[1])}" r="17" fill="${INK}" stroke="${PAPER}" stroke-width="2.5"/>${txt(c[0], c[1] + 7, 20, String(i + 1), { fill: PAPER, anchor: 'middle', weight: 700 })}`
    const [dx, dy, anchor] = p.label
    s += txt(c[0] + dx, c[1] + dy, 19, JOBS[i], { anchor, weight: 700, spacing: 1, halo: true })
    s += txt(c[0] + dx, c[1] + dy + 18, 15, `by ${p.name}`, { anchor, halo: true })
  })
  s += '</g>'
  // The title block.
  const bx = PX + PW - 388
  const by = PY + PH - 112
  s += `<rect x="${bx}" y="${by}" width="372" height="96" fill="${PAPER}" stroke="${INK}" stroke-width="1.4"/><line x1="${bx}" y1="${by + 30}" x2="${bx + 372}" y2="${by + 30}" stroke="${INK}" stroke-width="1"/>`
  s += txt(bx + 12, by + 21, 13, 'SITES FOR', { spacing: 2, opacity: 0.7 }) + txt(bx + 360, by + 21, 13, 'CONMAN', { spacing: 2, anchor: 'end', fill: RED, weight: 700 })
  s += txt(bx + 12, by + 58, 21, o.title, { weight: 700, spacing: 1 }) + txt(bx + 12, by + 82, 14, o.note, { opacity: 0.8 })
  s += txt(PX + PW / 2, COVER_SHEET.lyricY + 8, 22, 'PLANNING SKETCH · NAMES ARE FOR CHOOSING, THE FILM HAS NONE', { anchor: 'middle', weight: 700, spacing: 1.5 })
  return s
}

/** For the page: the sketch as a test (a static frame). */
export const SITE_TESTS = OPTIONS.map((o) => ({
  key: o.key,
  label: o.label,
  film: ({ uid = 'film' }) => ({ svg: option(o, uid), label: o.label }),
}))
