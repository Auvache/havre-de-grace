/*
 * Into the Wild · Off the Grid — alternatives to idea 1 on /music-videos/ideas.
 *
 * Chosen 2026-10-31 as the favourite of the five. These are ways it could go:
 * the same town plan fraying into contours and the same red route, told five
 * ways. Each is a pure function of the song's clock like every concept, and
 * off-the-grid-build.mjs samples ten moments across the whole record.
 *
 *   original  — the idea as first drawn: the camera pans east with the route.
 *   unmapped  — the wild is blank paper; the map is drawn only where he has been.
 *   erosion   — no pan: one view of the town, and the town wears away into hills.
 *   tethered  — every chorus runs out of town and every verse pulls him back,
 *               until the last chorus, when he goes.
 *   whiteline — the original printed white on black, as Ship to Stockholm is.
 */
import { PLATE, CX, CY, INK, PAPER, RED } from './sheet.mjs'
import { rng, r, clamp01, lerp, easeInOut } from '../../../shared/video/kit.mjs'
import { MAZE } from './maze.mjs'
import { offTheGrid, route, routeUpTo, PEAKS, contourRing, travelled, GRID_END, WORLD, STREET, SLATE } from './into-the-wild.mjs'

const { x: PX, y: PY, w: PW, h: PH } = PLATE
const BEGIN = 15.6
const END = 199

/** The original's route length at `time`. */
const routeAt = (score, time) =>
  route().total * clamp01((travelled(score, time) - travelled(score, BEGIN)) / (travelled(score, END) - travelled(score, BEGIN))) * 0.96

const pathD = (pts, camX) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${r(x - camX + PX)} ${r(y)}`).join('')

/*
 * The original's world, drawn at camera `camX`, with its layers returned
 * separately so a variant can mask, recolour or reorder them.
 */
function world(camX) {
  const left = camX
  const right = camX + PW
  let streets = ''
  const g = rng(7)
  for (let gx = 0; gx < GRID_END + 600; gx += STREET) {
    const fray = clamp01((gx - (GRID_END - 900)) / 1100)
    const keep = g()
    if (gx < left - 10 || gx > right + 10) continue
    if (keep < fray) continue
    const stop = PY + PH * (1 - fray * g())
    streets += `M${r(gx - camX + PX)} ${PY}V${r(stop)}`
  }
  const g2 = rng(9)
  for (let gy = PY + 20; gy < PY + PH; gy += STREET) {
    const reach = GRID_END - 400 + g2() * 700
    if (reach < left) continue
    streets += `M${PX} ${r(gy)}H${r(Math.min(reach, right) - camX + PX)}`
  }
  let blocks = ''
  const g3 = rng(3)
  for (let gx = 0; gx < GRID_END; gx += STREET) {
    for (let gy = PY + 20; gy < PY + PH - STREET; gy += STREET) {
      const v = g3()
      if (gx + STREET < left || gx > right) continue
      if (v > 0.55 - (gx / GRID_END) * 0.4) continue
      const pad = 16
      blocks += `<rect x="${r(gx - camX + PX + pad)}" y="${r(gy + pad)}" width="${STREET - pad * 2}" height="${STREET - pad * 2}"/>`
    }
  }
  let contours = ''
  let index = ''
  for (const p of PEAKS) {
    const reach = p.rings * p.step * 1.5
    if (p.x + reach < left || p.x - reach > right) continue
    for (let k = 1; k <= p.rings; k++) {
      const d = contourRing(p.x - camX + PX, p.y, k * p.step, p.seed, k)
      if (k % 4 === 0) index += d
      else contours += d
    }
  }
  return { streets, blocks, contours, index }
}

const hatch = (uid, ink) =>
  `<pattern id="${uid}-h" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="${ink}" stroke-width="1.6"/></pattern>`

const head = (x, y) =>
  `<circle cx="${r(x)}" cy="${r(y)}" r="11" fill="${RED}"/><circle cx="${r(x)}" cy="${r(y)}" r="20" fill="none" stroke="${RED}" stroke-width="2" opacity="0.6"/>`

/* ── unmapped ─────────────────────────────────────────────────────── */
/*
 * The town is printed: it is known. Past the edge of the printed sheet the
 * paper is blank, and the hills ink in only within a walk's reach of the
 * route — the wild is a map he makes by going. A neatline with degree ticks
 * marks where the printed map stops.
 */
const NEAT = GRID_END + 150
function unmapped({ time, score, uid }) {
  const trail = routeUpTo(routeAt(score, time))
  const [hx, hy] = trail.at(-1)
  const camX = Math.max(0, Math.min(WORLD - PW, hx - PW * 0.55))
  const w = world(camX)
  const d = pathD(trail, camX)
  const nx = NEAT - camX + PX
  let ticks = ''
  for (let y = PY + 40; y < PY + PH; y += 60) ticks += `M${r(nx)} ${y}h${(y / 60) % 2 < 1 ? 18 : 10}`
  // The printed town stops at the neatline.
  const town = `<clipPath id="${uid}-town"><rect x="${PX}" y="${PY}" width="${r(Math.max(0, nx - PX))}" height="${PH}"/></clipPath>`
  // The surveyed wild: a band either side of where he has walked, its edge stepped so it reads as ink, not a glow.
  const mask = `<mask id="${uid}-seen" maskUnits="userSpaceOnUse" x="${PX}" y="${PY}" width="${PW}" height="${PH}">
    <rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="black"/>
    <path d="${d}" fill="none" stroke="#555" stroke-width="620" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${d}" fill="none" stroke="white" stroke-width="440" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="${PX}" y="${PY}" width="${r(Math.max(0, nx - PX))}" height="${PH}" fill="black"/>
  </mask>`
  return `<defs>${hatch(uid, INK)}${town}${mask}</defs>
  <rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>
  <g clip-path="url(#${uid}-town)">
    <g fill="url(#${uid}-h)" stroke="${INK}" stroke-width="1.5" opacity="0.8">${w.blocks}</g>
    <path d="${w.streets}" stroke="${INK}" stroke-width="2" fill="none"/>
  </g>
  <g mask="url(#${uid}-seen)">
    <path d="${w.contours}" stroke="${SLATE}" stroke-width="1.6" fill="none"/>
    <path d="${w.index}" stroke="${SLATE}" stroke-width="3" fill="none"/>
  </g>
  <path d="M${r(nx)} ${PY}V${PY + PH}M${r(nx + 8)} ${PY}V${PY + PH}${ticks}" stroke="${INK}" stroke-width="2" fill="none"/>
  <path d="${d}" stroke="${RED}" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
  ${head(hx - camX + PX, hy)}`
}

/* ── erosion ──────────────────────────────────────────────────────── */
/*
 * One fixed view. At the first word it is a whole town; by the last chorus it
 * is hills. Each street segment and block has its own moment to go, earlier
 * on the east side, and each contour ring its own moment to arrive, so the
 * town wears away from the right while the land comes up through it. The
 * route walks the streets while there are streets, then wanders; what it
 * walked more than a verse ago fades to a ghost.
 */
const E_STREET = 110
const E_PEAKS = (() => {
  const g = rng(77)
  const list = []
  for (let i = 0; i < 9; i++) {
    const x = PX + 120 + g() * (PW - 240)
    list.push({ x, y: PY + 90 + g() * (PH - 180), rings: 5 + Math.floor(g() * 5), seed: Math.floor(g() * 1000), step: 24 + g() * 10, at: 0.08 + (1 - (x - PX) / PW) * 0.5 + g() * 0.15 })
  }
  return list
})()
const eRoute = (() => {
  const pts = []
  const g = rng(5)
  let x = PX + 60
  let y = PY + 20 + E_STREET * 5
  pts.push([x, y])
  while (x < PX + PW * 0.42) {
    x += E_STREET * (1 + Math.floor(g() * 2))
    pts.push([x, y])
    const dy = E_STREET * (g() < 0.5 ? -1 : 1)
    if (y + dy > PY + 120 && y + dy < PY + PH - 120) { y += dy; pts.push([x, y]) }
  }
  const x0 = x
  const y0 = y
  for (let i = 1; i <= 1400; i++) {
    const u = i / 1400
    const ease = clamp01(u * 8)
    const wx = lerp(x0, CX + 560 * Math.sin(u * 9.4 - 0.2) + 90 * Math.sin(u * 37), ease)
    const wy = lerp(y0, CY + 250 * Math.sin(u * 13.1 + 1.1) + 60 * Math.sin(u * 51), ease)
    pts.push([wx, wy])
  }
  const len = [0]
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  return { pts, len, total: len.at(-1) }
})()
const slice = (R, a, b) => {
  const out = []
  const at = (L) => {
    const i = Math.max(1, R.len.findIndex((v) => v >= L))
    const u = clamp01((L - R.len[i - 1]) / (R.len[i] - R.len[i - 1] || 1))
    return [lerp(R.pts[i - 1][0], R.pts[i][0], u), lerp(R.pts[i - 1][1], R.pts[i][1], u)]
  }
  out.push(at(a))
  for (let i = 0; i < R.pts.length; i++) if (R.len[i] > a && R.len[i] < b) out.push(R.pts[i])
  out.push(at(b))
  return out
}
function erosion({ time, score, uid }) {
  const p = clamp01((travelled(score, time) - travelled(score, BEGIN)) / (travelled(score, END) - travelled(score, BEGIN)))
  // How worn a thing at x is: the east goes first, the west holds out to the last chorus.
  const gone = (x, v) => v < p * 1.5 - (1 - (x - PX) / PW) * 0.55
  let streets = ''
  const g = rng(21)
  for (let gx = PX + 60; gx < PX + PW; gx += E_STREET) {
    for (let gy = PY + 20; gy < PY + PH - 1; gy += E_STREET) {
      const v = g()
      if (!gone(gx, v)) streets += `M${gx} ${gy}V${Math.min(gy + E_STREET, PY + PH)}`
    }
  }
  for (let gy = PY + 20; gy < PY + PH; gy += E_STREET) {
    for (let gx = PX + 60 - E_STREET; gx < PX + PW; gx += E_STREET) {
      const v = g()
      if (!gone(gx + E_STREET / 2, v)) streets += `M${Math.max(gx, PX)} ${gy}H${gx + E_STREET}`
    }
  }
  let blocks = ''
  const g3 = rng(4)
  for (let gx = PX + 60; gx < PX + PW - E_STREET; gx += E_STREET) {
    for (let gy = PY + 20; gy < PY + PH - E_STREET; gy += E_STREET) {
      const v = g3()
      if (v > 0.5 || gone(gx + E_STREET / 2, v * 1.6)) continue
      blocks += `<rect x="${gx + 15}" y="${gy + 15}" width="${E_STREET - 30}" height="${E_STREET - 30}"/>`
    }
  }
  let contours = ''
  let index = ''
  for (const pk of E_PEAKS) {
    for (let k = pk.rings; k >= 1; k--) {
      // The outer rings arrive first, as land rising.
      if (p < pk.at + (pk.rings - k) * 0.025) continue
      const d = contourRing(pk.x, pk.y, k * pk.step, pk.seed, k)
      if (k % 4 === 0) index += d
      else contours += d
    }
  }
  const L = eRoute.total * p
  const ghost = Math.max(0, L - 2600)
  const old = slice(eRoute, 0, ghost)
  const fresh = slice(eRoute, ghost, L)
  const [hx, hy] = fresh.at(-1)
  const d = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${r(x)} ${r(y)}`).join('')
  return `<defs>${hatch(uid, INK)}</defs>
  <rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>
  <g fill="url(#${uid}-h)" stroke="${INK}" stroke-width="1.5" opacity="0.8">${blocks}</g>
  <path d="${streets}" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="square"/>
  <path d="${contours}" stroke="${SLATE}" stroke-width="1.6" fill="none"/>
  <path d="${index}" stroke="${SLATE}" stroke-width="3" fill="none"/>
  ${ghost > 0 ? `<path d="${d(old)}" stroke="${RED}" stroke-width="3" fill="none" opacity="0.28" stroke-linejoin="round"/>` : ''}
  <path d="${d(fresh)}" stroke="${RED}" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
  ${head(hx, hy)}`
}

/* ── tethered ─────────────────────────────────────────────────────── */
/*
 * The same world as the original, but the route is not a straight escape.
 * Each chorus runs out past the edge of town into the hills, and each verse
 * draws him back in along the way he went — further out every time. The
 * horn solo is the longest time out. The last chorus he goes and does not
 * come back. Where he has been and come back from stays on the plate as a
 * faint red, so the plate shows how far he got each time.
 */
const townLength = (() => {
  const R = route()
  const i = R.pts.findIndex(([x]) => x > GRID_END - 260)
  return R.len[i]
})()
const wildAt = (dx) => {
  const R = route()
  const i = R.pts.findIndex(([x]) => x > GRID_END - 260 + dx)
  return R.len[i < 0 ? R.len.length - 1 : i]
}
/** [song second, how far along the route] — eased between, so it never jumps. */
const TETHER = () => [
  [0, 0], [15.6, 0],
  [47.85, townLength * 0.62],
  [56.5, wildAt(900)],
  [67.6, townLength * 0.55],
  [99.85, townLength * 0.8],
  [110.8, wildAt(1900)],
  [138, wildAt(2700)],
  [151.4, townLength * 0.85],
  [183.85, townLength * 0.98],
  [199, wildAt(5400)],
  [205.6, wildAt(5700)],
]
function tetherAt(time) {
  const k = TETHER()
  const j = Math.max(1, k.findIndex(([t]) => t > time))
  if (time >= k.at(-1)[0]) return k.at(-1)[1]
  const [t0, a] = k[j - 1]
  const [t1, b] = k[j]
  return lerp(a, b, easeInOut(clamp01((time - t0) / (t1 - t0))))
}
function tethered({ time, uid }) {
  const L = tetherAt(time)
  // The furthest reached so far, sampled on the keys and the present.
  let most = L
  for (const [t] of TETHER()) if (t <= time) most = Math.max(most, tetherAt(t))
  const trail = routeUpTo(L)
  const reach = routeUpTo(most)
  const [hx, hy] = trail.at(-1)
  const camX = Math.max(0, Math.min(WORLD - PW, hx - PW * 0.5))
  const w = world(camX)
  return `<defs>${hatch(uid, INK)}</defs>
  <rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>
  <g fill="url(#${uid}-h)" stroke="${INK}" stroke-width="1.5" opacity="0.8">${w.blocks}</g>
  <path d="${w.streets}" stroke="${INK}" stroke-width="2" fill="none"/>
  <path d="${w.contours}" stroke="${SLATE}" stroke-width="1.6" fill="none"/>
  <path d="${w.index}" stroke="${SLATE}" stroke-width="3" fill="none"/>
  <path d="${pathD(reach, camX)}" stroke="${RED}" stroke-width="3" fill="none" opacity="0.3" stroke-linejoin="round" stroke-dasharray="2 9" stroke-linecap="round"/>
  <path d="${pathD(trail, camX)}" stroke="${RED}" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
  ${head(hx - camX + PX, hy)}`
}

/* ── whiteline ────────────────────────────────────────────────────── */
/* The original, printed white line on black: the album's wood-engraving ground. */
const MIST = '#a9b9bd'
function whiteline(args) {
  return offTheGrid(args)
    .replace(`width="${PW}" height="${PH}" fill="${PAPER}"`, `width="${PW}" height="${PH}" fill="${INK}"`)
    .replaceAll(`stroke="${INK}"`, `stroke="${PAPER}"`)
    .replaceAll(`stroke="${SLATE}"`, `stroke="${MIST}"`)
}

/* ── The list ─────────────────────────────────────────────────────── */

/** Ten moments: intro, verse, chorus, break, verse, chorus, horns, verse, last chorus, outro. */
export const MOMENTS = [8, 30, 53, 63, 85, 105, 130, 170, 192, 204]

export const VARIANTS = [
  MAZE,
  {
    id: 'original',
    name: 'As drawn',
    summary: 'The idea as it is on the ideas page, for comparison. The camera pans east with the route all song: the town, the grid fraying, then the hills. Verses walk, choruses run, the outro slows to a stop.',
    frame: offTheGrid,
  },
  {
    id: 'unmapped',
    name: 'Unmapped',
    summary: 'The town is printed and ends at the edge of the map, a double rule with ticks. Past it the paper is blank, and the hills are drawn only along where he has walked. The wild is a map he makes by going.',
    frame: unmapped,
  },
  {
    id: 'erosion',
    name: 'Erosion',
    summary: 'No camera move at all. One view of a whole town at the first word, and over the song the streets break and the blocks go, east side first, while the hills come up through it. The route walks the streets while there are streets, then wanders. Old trail fades to a ghost.',
    frame: erosion,
  },
  {
    id: 'tethered',
    name: 'Tethered',
    summary: 'Every chorus runs out of town into the hills; every verse pulls him back in, the same way he went. Further out each time, and the horn solo is the longest time out. The last chorus he goes and does not come back. A faint dotted red keeps how far he got.',
    frame: tethered,
  },
  {
    id: 'whiteline',
    name: 'White line',
    summary: 'The original, printed white on black instead of black on paper, the way Ship to Stockholm is cut. Same motion; a night version of the same map.',
    frame: whiteline,
  },
]
