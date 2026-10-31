/*
 * Into the Wild — five visualizers for adventure.
 *
 * The song is a list of reasons to leave (conjecture, schemes, goals, pressure)
 * and a list of things to leave for (glaciers, gardens, grottos, the sage, a
 * harbour, a crowd), and a chorus that only says "running". Each idea below
 * picks one of those and makes it the whole picture.
 */
import { PLATE, CX, CY, INK, PAPER, RED, SECOND_INK } from './sheet.mjs'
import { rng, r, clamp01, ramp, lerp, easeOut, easeInOut } from '../../../shared/video/kit.mjs'
import { motifBody } from '../../../shared/video/motifs.mjs'
import { glide, land } from '../../../shared/video/album.mjs'

const SLATE = SECOND_INK['into-the-wild']
const { x: PX, y: PY, w: PW, h: PH } = PLATE

/* ── Shared clock ─────────────────────────────────────────────────── */

const isChorus = (score, t) => score.sections.some((s) => s.kind === 'chorus' && t >= s.from && t < s.to)
const sectionKind = (score, t) => (score.sections.find((s) => t >= s.from && t < s.to) ?? score.sections.at(-1)).kind

/*
 * Distance travelled: speed 1 in a verse, 2.6 in a chorus, 1.6 in the solo,
 * eased across every boundary over a second, integrated at 10 Hz. The one
 * clock four of the five ideas run on, so they all run harder on "running".
 */
const SPEED = { intro: 0.35, verse: 1, chorus: 2.6, break: 0.6, solo: 1.6, outro: 0.25 }
function smoothSpeed(score, t) {
  // A one-second box blur of the stepped speed, sampled five times.
  let sum = 0
  for (let i = 0; i < 5; i++) sum += SPEED[sectionKind(score, t - 1 + i * 0.25)] ?? 1
  return sum / 5
}
const travelCache = new WeakMap()
function travelled(score, t) {
  let table = travelCache.get(score)
  if (!table) {
    table = [0]
    for (let i = 1; i * 0.1 <= score.duration + 0.1; i++) table.push(table[i - 1] + smoothSpeed(score, i * 0.1) * 0.1)
    travelCache.set(score, table)
  }
  const i = Math.max(0, Math.min(table.length - 2, Math.floor(t / 0.1)))
  return lerp(table[i], table[i + 1], clamp01(t / 0.1 - i))
}
const totalTravel = (score) => travelled(score, score.duration)

/** Words sung so far whose text matches. */
const wordTime = (score, text, nth = 0) =>
  score.lines.flatMap((l) => l.words).filter((w) => w.text.toLowerCase().replace(/[^a-z]/g, '') === text)[nth]?.t ?? Infinity

/* ── 1 · Off the Grid ─────────────────────────────────────────────── */
/*
 * A town plan that turns into a contour map. The first third of the world is
 * streets on a grid; it frays; past it are hills drawn as contours. The red
 * route keeps to the streets at right angles until it is out of the grid and
 * then wanders like water.
 */
const GRID_END = 2300
const WORLD = 9000
const STREET = 130
const routeCache = new Map()
function route() {
  if (routeCache.has('r')) return routeCache.get('r')
  const pts = []
  // Through the town: an east–north–east staircase on the street grid.
  let x = 260
  let y = PY + PH * 0.72
  const g = rng(11)
  pts.push([x, y])
  while (x < GRID_END - 200) {
    x += STREET * (1 + Math.floor(g() * 2))
    pts.push([x, y])
    const dy = STREET * (g() < 0.5 ? -1 : 1)
    if (y + dy > PY + 160 && y + dy < PY + PH - 120) { y += dy; pts.push([x, y]) }
  }
  // Out of it: a freehand line that loops and doubles back, sampled densely.
  for (let i = 1; i <= 900; i++) {
    const u = i / 900
    const wx = x + u * (WORLD - x - 400)
    const wy = CY + 210 * Math.sin(u * 23 + 0.6) + 90 * Math.sin(u * 61) + 40 * Math.sin(u * 140)
    pts.push([wx + 70 * Math.sin(u * 47), wy])
  }
  // Arc length.
  const len = [0]
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  const out = { pts, len, total: len.at(-1) }
  routeCache.set('r', out)
  return out
}
function routeUpTo(L) {
  const { pts, len } = route()
  const out = [pts[0]]
  for (let i = 1; i < pts.length; i++) {
    if (len[i] <= L) { out.push(pts[i]); continue }
    const u = (L - len[i - 1]) / (len[i] - len[i - 1])
    out.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)])
    break
  }
  return out
}

const PEAKS = (() => {
  const g = rng(42)
  const list = []
  for (let x = GRID_END - 300; x < WORLD + 600; x += 400 + g() * 280) {
    list.push({ x: x + g() * 120, y: PY + 80 + g() * (PH - 160), rings: 5 + Math.floor(g() * 6), seed: Math.floor(g() * 1000), step: 26 + g() * 10 })
  }
  return list
})()

function contourRing(cx, cy, rad, seed, k) {
  const g = rng(seed)
  const a1 = g() * 6.28, a2 = g() * 6.28, a3 = g() * 6.28
  const n = 40
  const p = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const v = rad * (1 + 0.12 * Math.sin(2 * a + a1 + k * 0.3) + 0.07 * Math.sin(3 * a + a2) + 0.04 * Math.sin(5 * a + a3 + k))
    p.push([cx + v * Math.cos(a) * 1.35, cy + v * Math.sin(a)])
  }
  // Quadratics through midpoints, closed.
  let d = ''
  for (let i = 0; i < n; i++) {
    const a = p[i]
    const b = p[(i + 1) % n]
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
    d += i === 0 ? `M${r(m[0])} ${r(m[1])}` : ''
    const c = p[(i + 1) % n]
    const m2 = [(c[0] + p[(i + 2) % n][0]) / 2, (c[1] + p[(i + 2) % n][1]) / 2]
    d += `Q${r(c[0])} ${r(c[1])} ${r(m2[0])} ${r(m2[1])}`
    void b
  }
  return d + 'Z'
}

function offTheGrid({ time, score, uid }) {
  const R = route()
  const begin = 15.6
  const end = 199
  const L = R.total * (clamp01((travelled(score, time) - travelled(score, begin)) / (travelled(score, end) - travelled(score, begin)))) * 0.96
  const trail = routeUpTo(L)
  const head = trail.at(-1)
  const camX = Math.max(0, Math.min(WORLD - PW, head[0] - PW * 0.55))
  const left = camX
  const right = camX + PW
  let streets = ''
  // Streets: the grid frays — a street runs only where its own random draw beats how far out of town it is.
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
  // Blocks hatched in, thinning out.
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
  const tr = trail.map(([x, y], i) => `${i ? 'L' : 'M'}${r(x - camX + PX)} ${r(y)}`).join('')
  const hx = head[0] - camX + PX
  return `<defs><pattern id="${uid}-h" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="${INK}" stroke-width="1.6"/></pattern></defs>
  <rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>
  <g fill="url(#${uid}-h)" stroke="${INK}" stroke-width="1.5" opacity="0.8">${blocks}</g>
  <path d="${streets}" stroke="${INK}" stroke-width="2" fill="none"/>
  <path d="${contours}" stroke="${SLATE}" stroke-width="1.6" fill="none"/>
  <path d="${index}" stroke="${SLATE}" stroke-width="3" fill="none"/>
  <path d="${tr}" stroke="${RED}" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
  <circle cx="${r(hx)}" cy="${r(head[1])}" r="11" fill="${RED}"/>
  <circle cx="${r(hx)}" cy="${r(head[1])}" r="20" fill="none" stroke="${RED}" stroke-width="2" opacity="0.6"/>`
}

/* ── 2 · The Wandering Needle ─────────────────────────────────────── */
/*
 * One compass, filling the plate, that will not settle. The needle drifts
 * through the verses, swings wide in every chorus, and leaves a tick on the
 * rim at every word sung — by the end it has pointed everywhere.
 */
const headingAt = (score, t) => {
  const d = travelled(score, t)
  return (d * 26 + 70 * Math.sin(t * 0.37) + 34 * Math.sin(t * 1.13 + 1) + 12 * Math.sin(t * 2.9)) % 360
}

function needle({ time, score, uid }) {
  const cx = CX
  const cy = CY + 6
  const R = 300
  const card = 8 * Math.sin(time * 0.11) // the card itself rocks a little in its bowl
  let ticks = ''
  for (let i = 0; i < 360; i += 2) {
    const long = i % 10 === 0
    const a = ((i + card - 90) * Math.PI) / 180
    const r1 = R - (long ? 30 : 16)
    ticks += `M${r(cx + R * Math.cos(a))} ${r(cy + R * Math.sin(a))}L${r(cx + r1 * Math.cos(a))} ${r(cy + r1 * Math.sin(a))}`
  }
  let numbers = ''
  for (let i = 0; i < 360; i += 30) {
    const a = ((i + card - 90) * Math.PI) / 180
    const rr = R - 54
    numbers += `<text x="${r(cx + rr * Math.cos(a))}" y="${r(cy + rr * Math.sin(a) + 7)}" font-size="20" font-weight="500" fill="${INK}" text-anchor="middle" transform="rotate(${r(i + card)} ${r(cx + rr * Math.cos(a))} ${r(cy + rr * Math.sin(a))})">${i}</text>`
  }
  // The rose: 4 long points, 4 short, 8 hairlines.
  const point = (deg, len, wide, fill) => {
    const a = ((deg + card - 90) * Math.PI) / 180
    const n = [cx + len * Math.cos(a), cy + len * Math.sin(a)]
    const s1 = [cx + wide * Math.cos(a + Math.PI / 2), cy + wide * Math.sin(a + Math.PI / 2)]
    const s2 = [cx + wide * Math.cos(a - Math.PI / 2), cy + wide * Math.sin(a - Math.PI / 2)]
    return `<path d="M${r(cx)} ${r(cy)}L${r(s1[0])} ${r(s1[1])}L${r(n[0])} ${r(n[1])}Z" fill="${fill}"/><path d="M${r(cx)} ${r(cy)}L${r(s2[0])} ${r(s2[1])}L${r(n[0])} ${r(n[1])}Z" fill="${PAPER}" stroke="${fill}" stroke-width="1.5"/>`
  }
  let rose = ''
  for (let i = 0; i < 360; i += 22.5) rose += `<path d="M${r(cx)} ${r(cy)}L${r(cx + 250 * Math.cos(((i + card - 90) * Math.PI) / 180))} ${r(cy + 250 * Math.sin(((i + card - 90) * Math.PI) / 180))}" stroke="${SLATE}" stroke-width="1"/>`
  for (let i = 45; i < 360; i += 90) rose += point(i, 130, 18, SLATE)
  for (let i = 0; i < 360; i += 90) rose += point(i, 205, 24, SLATE)
  const letters = ['N', 'E', 'S', 'W'].map((L, k) => {
    const a = ((k * 90 + card - 90) * Math.PI) / 180
    const rr = R + 46
    return `<text x="${r(cx + rr * Math.cos(a))}" y="${r(cy + rr * Math.sin(a) + 14)}" font-size="40" font-weight="700" fill="${INK}" text-anchor="middle">${L}</text>`
  }).join('')
  // Every word sung so far leaves a mark on the outer ring, where the needle was pointing when it was sung.
  let marks = ''
  for (const line of score.lines) for (const w of line.words) {
    if (w.t > time) break
    const h = headingAt(score, w.t)
    const a = ((h - 90) * Math.PI) / 180
    const age = clamp01((time - w.t) / 20)
    const r0 = R + 8
    const r1 = R + 22 + (1 - age) * 10
    marks += `M${r(cx + r0 * Math.cos(a))} ${r(cy + r0 * Math.sin(a))}L${r(cx + r1 * Math.cos(a))} ${r(cy + r1 * Math.sin(a))}`
  }
  const h = headingAt(score, time)
  const a = ((h - 90) * Math.PI) / 180
  const nl = 268
  const tip = [cx + nl * Math.cos(a), cy + nl * Math.sin(a)]
  const tail = [cx - nl * 0.8 * Math.cos(a), cy - nl * 0.8 * Math.sin(a)]
  const side = (k) => [cx + 22 * Math.cos(a + (k * Math.PI) / 2), cy + 22 * Math.sin(a + (k * Math.PI) / 2)]
  const [s1, s2] = [side(1), side(-1)]
  return `<defs><pattern id="${uid}-h" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><line x1="0" y1="0" x2="0" y2="6" stroke="${INK}" stroke-width="1.1"/></pattern></defs>
  <circle cx="${cx}" cy="${cy}" r="${R + 90}" fill="url(#${uid}-h)" opacity="0.28"/>
  <circle cx="${cx}" cy="${cy}" r="${R + 6}" fill="${PAPER}" stroke="${INK}" stroke-width="4"/>
  <circle cx="${cx}" cy="${cy}" r="${R + 30}" fill="none" stroke="${INK}" stroke-width="1.5"/>
  <path d="${marks}" stroke="${SLATE}" stroke-width="3" stroke-linecap="round"/>
  <path d="${ticks}" stroke="${INK}" stroke-width="1.6"/>
  <circle cx="${cx}" cy="${cy}" r="${R - 70}" fill="none" stroke="${INK}" stroke-width="1"/>
  ${numbers}${rose}${letters}
  <path d="M${r(tip[0])} ${r(tip[1])}L${r(s1[0])} ${r(s1[1])}L${r(cx)} ${r(cy)}L${r(s2[0])} ${r(s2[1])}Z" fill="${RED}"/>
  <path d="M${r(tail[0])} ${r(tail[1])}L${r(s1[0])} ${r(s1[1])}L${r(cx)} ${r(cy)}L${r(s2[0])} ${r(s2[1])}Z" fill="${INK}"/>
  <circle cx="${cx}" cy="${cy}" r="14" fill="${PAPER}" stroke="${INK}" stroke-width="4"/>`
}

/* ── 3 · Cabinet of Splendours ────────────────────────────────────── */
/*
 * "The splendorous things the gods hid about": a naturalist's plate of
 * specimens, empty boxes at first, each drawn in as the song names it. A red
 * thread is pinned from each to the next, in the order they are found.
 */
const SPECIMENS = [
  { word: 'water', motif: 'wave', label: 'Water' },
  { word: 'iron', motif: 'globe', label: 'Iron' },
  { word: 'ebony', motif: 'pine', label: 'Ebony' },
  { word: 'ivory', motif: 'gem', label: 'Ivory' },
  { word: 'bone', motif: 'bone', label: 'Bone' },
  { word: 'stonecold', motif: 'stone', label: 'Stone' },
  { word: 'stories', motif: 'book', label: 'Stories' },
  { word: 'songs', motif: 'guitar', label: 'Songs' },
  { word: 'glaciers', motif: 'glacier', label: 'Glaciers' },
  { word: 'gardens', motif: 'flower', label: 'Gardens' },
  { word: 'grottos', motif: 'cave', label: 'Grottos' },
  { word: 'sage', motif: 'sprig', label: 'Sage' },
  { word: 'harbor', motif: 'lighthouse', label: 'Harbour' },
  { word: 'crowd', motif: 'crowd', label: 'Crowd' },
]

function cabinet({ time, score, uid }) {
  const cols = 7
  const rows = 2
  const gw = 196
  const gh = 318
  const gap = 14
  const x0 = CX - (cols * gw + (cols - 1) * gap) / 2
  const y0 = PY + 70
  const cells = SPECIMENS.map((s, i) => {
    const at = wordTime(score, s.word)
    const row = Math.floor(i / cols)
    // Boustrophedon: the second row runs right to left, so the thread never crosses the plate.
    const col = row % 2 ? cols - 1 - (i % cols) : i % cols
    return { ...s, at, x: x0 + col * (gw + gap), y: y0 + row * (gh + 50), n: i + 1 }
  })
  let out = `<defs><pattern id="${uid}-h" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="${SLATE}" stroke-width="1"/></pattern></defs>`
  out += `<text x="${CX}" y="${PY + 44}" font-size="20" font-weight="600" letter-spacing="6" fill="${INK}" text-anchor="middle">PL. I — SPLENDOROUS THINGS, AS FOUND</text>`
  const pins = []
  for (const c of cells) {
    const drawn = clamp01((time - c.at + 0.15) / 1.6)
    const shown = time >= c.at - 0.15
    out += `<rect x="${r(c.x)}" y="${r(c.y)}" width="${gw}" height="${gh}" fill="none" stroke="${INK}" stroke-width="1.5"/>`
    out += `<rect x="${r(c.x + 8)}" y="${r(c.y + 8)}" width="${gw - 16}" height="${gh - 16}" fill="${shown ? 'none' : `url(#${uid}-h)`}" stroke="${INK}" stroke-width="0.8" opacity="${shown ? 1 : 0.35}"/>`
    out += `<text x="${r(c.x + 16)}" y="${r(c.y + 32)}" font-size="16" font-weight="500" fill="${INK}">${c.n}.</text>`
    if (shown) {
      const size = 150
      const mx = c.x + gw / 2 - size / 2
      const my = c.y + 70
      // Drawn on with pathLength, the way an engraver's line goes down.
      const body = motifBody(c.motif)
      out += `<g transform="translate(${r(mx)} ${r(my)}) scale(1.5)" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${body.replace(/<(path|circle|rect|ellipse|line|polyline)/g, `<$1 pathLength="1" stroke-dasharray="1" stroke-dashoffset="${r(1 - drawn, 3)}"`)}</g>`
      out += `<text x="${r(c.x + gw / 2)}" y="${r(c.y + gh - 34)}" font-size="22" font-weight="600" letter-spacing="3" fill="${INK}" text-anchor="middle" opacity="${r(clamp01(drawn * 2 - 0.6), 3)}">${c.label.toUpperCase()}</text>`
      pins.push({ x: c.x + gw / 2, y: c.y + 26, at: c.at })
    }
  }
  // The red thread: pinned at each cell's top, slung between pins, the newest span drawn out as it is found.
  let thread = ''
  for (let i = 1; i < pins.length; i++) {
    const a = pins[i - 1]
    const b = pins[i]
    const u = easeOut(clamp01((time - b.at) / 0.8))
    const sag = 40
    const mx = (a.x + b.x) / 2
    const my = Math.max(a.y, b.y) + sag
    const bx = lerp(a.x, b.x, u)
    const by = lerp(a.y, b.y, u)
    thread += `M${r(a.x)} ${r(a.y)}Q${r(lerp(a.x, mx, u))} ${r(lerp(a.y, my, u))} ${r(bx)} ${r(by)}`
  }
  out += `<path d="${thread}" stroke="${RED}" stroke-width="3" fill="none"/>`
  out += pins.map((p) => `<circle cx="${r(p.x)}" cy="${r(p.y)}" r="6" fill="${RED}"/>`).join('')
  return out
}

/* ── 4 · Elevation Profile ────────────────────────────────────────── */
/*
 * The song as a day on the trail: a red pen draws its elevation profile left
 * to right as it plays. Verses roll, choruses climb, the solo is the summit
 * ridge, the outro walks down. Nothing is drawn ahead of the pen — where it
 * ends up, it doesn't know.
 */
const SPAN = 3.2 // the profile is this many plates wide
function elevationAt(score, t) {
  let e = 0
  for (const s of score.sections) {
    const into = clamp01((t - s.from) / (s.to - s.from))
    const lift = { intro: 0.05, verse: 0.12, chorus: 0.3, break: -0.18, solo: 0.38, outro: -0.75 }[s.kind] ?? 0
    e += lift * easeInOut(into)
  }
  return e + 0.05 * Math.sin(t * 0.9) + 0.02 * Math.sin(t * 2.3) + 0.006 * Math.sin(t * 7.1)
}

function profile({ time, score, uid }) {
  const W = PW * SPAN
  const base = PY + PH - 120
  const top = PY + 90
  const xOf = (t) => (t / score.duration) * W
  const yOf = (e) => base - clamp01((e + 0.12) / 1.5) * (base - top)
  const penX = xOf(time)
  const camX = Math.max(0, Math.min(W - PW, penX - PW * 0.62))
  const sx = (x) => PX + x - camX
  let d = ''
  let fill = ''
  const from = Math.max(0, (camX / W) * score.duration - 1)
  for (let t = from; t <= time; t += 0.25) {
    const x = sx(xOf(t))
    const y = yOf(elevationAt(score, t))
    d += `${d ? 'L' : 'M'}${r(x)} ${r(y)}`
    fill += `${fill ? 'L' : `M${r(x)} ${base}L`}${r(x)} ${r(y)}`
  }
  const penY = yOf(elevationAt(score, time))
  fill += `L${r(sx(penX))} ${base}Z`
  // Axis furniture: kilometre ticks from the song's own seconds, metres up the side.
  let ticks = ''
  let labels = ''
  for (let s = 0; s <= score.duration; s += 10) {
    const x = sx(xOf(s))
    if (x < PX - 20 || x > PX + PW + 20) continue
    const major = s % 30 === 0
    ticks += `M${r(x)} ${base}V${base + (major ? 18 : 9)}`
    if (major) labels += `<text x="${r(x)}" y="${base + 44}" font-size="18" font-weight="500" fill="${INK}" text-anchor="middle">${(s / 10).toFixed(0)} km</text>`
  }
  let grid = ''
  for (let m = 0; m <= 4; m++) {
    const y = base - (m / 4) * (base - top)
    grid += `M${PX} ${r(y)}H${PX + PW}`
    labels += `<text x="${PX + 16}" y="${r(y - 8)}" font-size="16" font-weight="500" fill="${SLATE}">${m * 800} m</text>`
  }
  // Waypoints: the things the song names, flagged where they were sung, once the pen has passed them.
  const WAYPOINTS = [['adventure', 'TRAILHEAD'], ['water', 'WATER'], ['bone', 'BONE'], ['wild', 'INTO THE WILD'], ['conjecture', 'CONJECTURE'], ['old', 'OLD'], ['songs', 'SONGS'], ['treasures', 'TREASURE'], ['glaciers', 'GLACIERS'], ['harbor', 'HARBOUR'], ['stage', 'CENTRE STAGE']]
  let flags = ''
  let k = 0
  for (const [w, label] of WAYPOINTS) {
    const pole = k++ % 2 ? 120 : 70
    const nth = w === 'adventure' && time > 150 ? 1 : 0
    const at = wordTime(score, w, nth)
    if (at > time) continue
    const x = sx(xOf(at))
    if (x < PX - 200 || x > PX + PW + 50) continue
    const y = yOf(elevationAt(score, at))
    const up = land(time, at, 0.4)
    flags += `<path d="M${r(x)} ${r(y)}V${r(y - pole * up)}" stroke="${INK}" stroke-width="2"/><path d="M${r(x)} ${r(y - pole * up)}l26 8l-26 8z" fill="${INK}"/>`
    flags += `<text x="${r(x + 6)}" y="${r(y - (pole + 12) * up)}" font-size="17" font-weight="600" letter-spacing="2" fill="${INK}" opacity="${r(up, 3)}">${label}</text>`
  }
  return `<defs><pattern id="${uid}-h" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(60)"><line x1="0" y1="0" x2="0" y2="8" stroke="${SLATE}" stroke-width="1.6"/></pattern></defs>
  <path d="${grid}" stroke="${INK}" stroke-width="0.8" stroke-dasharray="2 8" opacity="0.6"/>
  <path d="M${PX} ${base}H${PX + PW}" stroke="${INK}" stroke-width="2"/>
  <path d="${ticks}" stroke="${INK}" stroke-width="2"/>
  ${labels}
  <path d="${fill}" fill="url(#${uid}-h)"/>
  <path d="${d}" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
  ${flags}
  <path d="${d.split('L').slice(-24).join('L').replace(/^[^M]/, 'M$&')}" stroke="${RED}" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
  <circle cx="${r(sx(penX))}" cy="${r(penY)}" r="10" fill="${RED}"/>`
}

/* ── 5 · The Open Road ────────────────────────────────────────────── */
/*
 * One-point perspective, nothing else: a road to the horizon, fence posts and
 * red centre dashes coming at you on the beat, twice as fast on "running". The
 * horizon changes country with each verse — plains, then mountains, then ice.
 */
function road({ time, score, uid }) {
  const hy = PY + PH * 0.42
  const vx = CX
  const d = travelled(score, time) * 6 // metres
  const F = 260
  const sy = (z) => hy + (PH * 0.58 * 2.2) / z * 1.0 * (F / 260)
  const sx = (X, z) => vx + (X * F) / z
  const zNear = 1.15
  // Road edges.
  const edge = (X) => `M${r(sx(X, zNear))} ${r(sy(zNear))}L${vx} ${r(hy)}`
  let out = ''
  // Field furrows: lines converging to the vanishing point, both sides.
  let furrows = ''
  for (let X = 1.6; X < 40; X *= 1.18) for (const side of [-1, 1]) furrows += `M${r(sx(side * X, zNear))} ${r(sy(zNear))}L${vx} ${r(hy)}`
  // Cross-hatching of the land: horizontal rules at receding depths, scrolling.
  let rows = ''
  for (let k = 0; k < 26; k++) {
    const z = zNear + ((k * 2 - (d % 2) + 52) % 52)
    if (z < zNear) continue
    const y = sy(z)
    rows += `M${PX} ${r(y)}H${PX + PW}`
  }
  // Centre dashes: 3 m long every 6 m.
  let dashes = ''
  for (let k = 0; k < 30; k++) {
    const z0 = zNear + k * 6 - (d % 6)
    const z1 = z0 + 3
    if (z1 < zNear) continue
    const a = Math.max(z0, zNear)
    const w0 = 0.09
    dashes += `M${r(sx(-w0, a))} ${r(sy(a))}L${r(sx(w0, a))} ${r(sy(a))}L${r(sx(w0, z1))} ${r(sy(z1))}L${r(sx(-w0, z1))} ${r(sy(z1))}Z`
  }
  // Fence posts every 12 m on both sides.
  let posts = ''
  for (let k = 0; k < 16; k++) {
    const z = zNear + 0.4 + k * 12 - (d % 12)
    if (z < zNear) continue
    for (const side of [-1, 1]) {
      const x = sx(side * 3.4, z)
      const y = sy(z)
      const h = 380 / z
      posts += `M${r(x)} ${r(y)}V${r(y - h)}`
    }
  }
  // Horizon country: plains → mountains → ice, glided between per verse.
  const v2 = wordTime(score, 'conjecture')
  const v3 = 151.4
  const mountains = clamp01((time - v2 + 4) / 6) * (1 - clamp01((time - v3 + 2) / 6))
  const ice = clamp01((time - v3 + 2) / 6)
  const ridge = (amp, seed, f) => {
    const g = rng(seed)
    const ph = [g() * 6, g() * 6, g() * 6]
    let p = `M${PX} ${r(hy)}`
    for (let x = PX; x <= PX + PW; x += 12) {
      const u = x / 400
      const h = amp * (0.5 + 0.35 * Math.sin(u * f + ph[0]) + 0.25 * Math.sin(u * f * 2.3 + ph[1]) + 0.12 * Math.abs(Math.sin(u * f * 5.1 + ph[2])))
      p += `L${x} ${r(hy - h)}`
    }
    return p + `L${PX + PW} ${r(hy)}Z`
  }
  // Ice: sharp peaks; `shade` gives the right-hand face of each, for hatching.
  const peaks = (y0, amp, seed, shade = false) => {
    const g = rng(seed)
    let p = ''
    let x = PX - 60
    while (x < PX + PW + 60) {
      const w = 140 + g() * 220
      const h = amp * (0.35 + g() * 0.65)
      const top = x + w * (0.4 + g() * 0.2)
      p += shade ? `M${r(top)} ${r(y0 - h)}L${r(x + w)} ${r(y0)}L${r(top + w * 0.08)} ${r(y0)}Z` : `M${r(x)} ${r(y0)}L${r(top)} ${r(y0 - h)}L${r(x + w)} ${r(y0)}Z`
      x += w * 0.7
    }
    return p
  }
  const sun = { x: vx + 220, y: hy - 150 + 40 * Math.sin(time * 0.02) }
  let sunRays = ''
  for (let k = 0; k < 18; k++) {
    const y = sun.y - 70 + k * 8
    const half = Math.sqrt(Math.max(0, 70 * 70 - (y - sun.y) ** 2))
    sunRays += `M${r(sun.x - half)} ${r(y)}H${r(sun.x + half)}`
  }
  out += `<defs><pattern id="${uid}-h" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><line x1="0" y1="0" x2="0" y2="6" stroke="${SLATE}" stroke-width="1.4"/></pattern>
  <pattern id="${uid}-k" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-20)"><line x1="0" y1="0" x2="0" y2="5" stroke="${INK}" stroke-width="1.2"/></pattern>
  <clipPath id="${uid}-land"><rect x="${PX}" y="${r(hy)}" width="${PW}" height="${PH}"/></clipPath></defs>`
  out += `<path d="${sunRays}" stroke="${INK}" stroke-width="2.4"/>`
  out += `<path d="${ridge(60, 4, 0.9)}" fill="url(#${uid}-h)" stroke="${SLATE}" stroke-width="2" opacity="${r(1 - mountains * 0.7, 3)}"/>`
  if (mountains > 0) out += `<g opacity="${r(mountains, 3)}"><path d="${ridge(250, 8, 1.6)}" fill="${PAPER}"/><path d="${ridge(250, 8, 1.6)}" fill="url(#${uid}-k)" stroke="${INK}" stroke-width="3.5"/></g>`
  if (ice > 0) out += `<g opacity="${r(ice, 3)}"><path d="${peaks(hy, 200, 21)}" fill="${PAPER}" stroke="${INK}" stroke-width="3"/><path d="${peaks(hy, 200, 21, true)}" fill="url(#${uid}-h)"/></g>`
  out += `<path d="M${PX} ${r(hy)}H${PX + PW}" stroke="${INK}" stroke-width="2.5"/>`
  out += `<g clip-path="url(#${uid}-land)"><path d="${rows}" stroke="${SLATE}" stroke-width="1.6"/><path d="${furrows}" stroke="${INK}" stroke-width="1.2" opacity="0.55"/>
  <path d="M${r(sx(-2.2, zNear))} ${r(sy(zNear))}L${vx} ${r(hy)}L${r(sx(2.2, zNear))} ${r(sy(zNear))}Z" fill="${PAPER}"/>
  <path d="${edge(-2.2)}${edge(2.2)}" stroke="${INK}" stroke-width="4"/>
  <path d="${dashes}" fill="${RED}"/>
  <path d="${posts}" stroke="${INK}" stroke-width="6" stroke-linecap="square"/></g>`
  return out
}

/* ── The list ─────────────────────────────────────────────────────── */

export const CONCEPTS = [
  {
    id: 'off-the-grid',
    name: 'Off the Grid',
    lyric: "Oh, I'm tired of all the conjecture / Dreaming and scheming and goals",
    idea: 'A town plan that frays into a contour map. Streets on a grid, hatched blocks, then the grid runs out and the land is hills drawn as contours. The schemes and goals are the grid; the wild is everything past it.',
    motion: 'The camera pans east with the route the whole song. Verses walk, every chorus runs (the pan more than doubles on "running"), the solo is open country, and the outro slows to a stop in the hills.',
    red: 'The route. It keeps to the streets at right angles while it is in town, then wanders like water once it is out.',
    stills: [24, 77, 120, 186],
    frame: offTheGrid,
  },
  {
    id: 'needle',
    name: 'The Wandering Needle',
    lyric: "Where I'll end up, I don't know",
    idea: "One compass card filling the plate, and a needle that won't settle. Every word sung leaves a tick on the rim where the needle was pointing, so by the end it has pointed everywhere.",
    motion: 'The needle drifts through the verses, swings round hard in every chorus, and the card rocks in its bowl. The ticks build up, darkest where the song lingered.',
    red: 'The north half of the needle, the only thing in the frame that never stops moving.',
    stills: [21, 50, 90, 168],
    frame: needle,
  },
  {
    id: 'cabinet',
    name: 'Cabinet of Splendours',
    lyric: 'And stumble upon all the splendorous things / The gods hid about when they made',
    idea: "A naturalist's plate of fourteen empty boxes. Each one is engraved in the moment the song names it: water, iron, ebony, ivory, bone, then glaciers, gardens, grottos, sage, a harbour, a crowd.",
    motion: "Nothing moves except the things being found. Each specimen draws itself on over a second and a half from its own word, so the plate fills in the order the song finds it.",
    red: 'A thread pinned from each find to the next, like a collector tracing the route, slung across the plate as each new box opens.',
    stills: [38, 98, 170, 190],
    frame: cabinet,
  },
  {
    id: 'profile',
    name: 'Elevation Profile',
    lyric: "Oh, I'm headed out on an adventure",
    idea: "The song drawn as a day on the trail: a hiker's elevation profile, kilometres along the bottom and metres up the side. Verses roll, choruses climb, the solo is the summit ridge and the outro walks down.",
    motion: "A red pen draws the profile left to right in time with the record, with the camera following it. Each thing the song names is flagged as a waypoint where it was sung. Nothing is drawn ahead of the pen.",
    red: 'The pen and the last few seconds of the line behind it.',
    stills: [30, 52, 158, 190],
    frame: profile,
  },
  {
    id: 'road',
    name: 'The Open Road',
    lyric: "So I'm running into the wild",
    idea: 'One-point perspective and nothing else: a road to the horizon, fence posts and centre dashes coming at you. The horizon changes country with each verse, from plains to mountains to ice.',
    motion: 'Dashes pass at a walking pace in the verses and twice as fast on every "running". The horizon dissolves from one country to the next across a verse boundary, with no cut.',
    red: 'The centre line. It is the only red in the frame and the only thing that tells you how fast you are going.',
    stills: [20, 49, 100, 170],
    frame: road,
  },
]
