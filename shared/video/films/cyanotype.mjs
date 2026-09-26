/*
 * Cyanotype — "Rocks in the Sea" as a sun print that is not fixed until he stays.
 *
 * Track 8 of the album (app/config/albumStyle.ts). A cyanotype is paper brushed
 * with iron salts, things laid on it, and the sheet left in the sun: where
 * something lay the paper stays white, where the light got in it goes Prussian
 * blue. And it is not permanent until it is washed. Until then the image is
 * pale and unsettled, and anything that was lifted off the paper prints soft.
 *
 * The song is somebody who is pulled towards the sea and decides to stay, "for
 * the ones that I love". The film never says so. It says it with the print:
 *
 *   - Before "stay" the print is unfixed. The blue is a lighter, exposed blue,
 *     and every white thing carries a soft lifted penumbra, as if nothing on
 *     the paper is quite lying flat. A grey cotton cloud laid on "gray" rides
 *     along with the camera for the whole first half — it is always with him.
 *   - On "stay" the wash goes over. A sheet of water sweeps across the plate;
 *     behind its edge the blue deepens to full Prussian, every white presses
 *     flat and crisp, and the cloud rinses out of the paper. The last chorus is
 *     the same chorus as the first, printed fixed, and the film ends on the
 *     album still's picture.
 *   - Red is the journey: the road, the one line on the print the sun did not
 *     make, drawn on by hand. It is drawn along the foot of the plate from "I
 *     drove", turns up the headland and slims into the trees in the first
 *     chorus, and in the last it runs up a second headland into the trees with
 *     the hometown on the far shore beyond them.
 *
 * THE SHORE, LEFT TO RIGHT
 *
 *   Intro       The sensitiser is brushed on in four strokes; it exposes from
 *               pale to blue. The horizon thread is laid, the sun, the sea.
 *   Verse 1     The red road starts on "drove". The hometown's paper houses on
 *               the far shore on "hometown"; fern fronds on "green"; the cloud
 *               on "gray", which the camera then leaves everything behind but.
 *   Guitar      Anna Atkins's seaweed, laid on the bars and unfurling.
 *   Verse 2     A dandelion clock; the photogram's classic things — a key,
 *               scissors, a spoon, a comb, a button — on "things"; the seeds
 *               drift off on "drift away". Rain out of the cloud on "rain". The
 *               rocks laid in the water, and rings going out from them on
 *               "calling" while the camera slows.
 *   Chorus      The road turns up the headland on "road" and slims into the
 *               ferns on "trees"; the rain stops on "hide the sound". Gulls lift
 *               out of the trees on "hearts leaving home". Rocks in the sea, sand
 *               sifted down on "sand", a wave thread on "sea".
 *   Guitar      The plate takes the whole sheet and a long swell rolls through.
 *   Verse 3     Two tin cans on "talked" and "sister", the string pulled taut.
 *               A paper chain of houses unfolds on "things that we make". Three
 *               stones lift out of the water on "stranded", "rocks" and "bay" —
 *               soft while they are in the air — and land crisp as a cairn. On
 *               "stay" the wash.
 *   Chorus      Fixed. The road runs up the second headland into the trees; the
 *               gulls come back and settle in them; the hometown is laid on
 *               "home". Rocks, sand, sea grass: the album still, with the cairn
 *               and the paper houses in it. The end card on the last note.
 *
 * THE PRINT
 *
 *   - The coating is the paper's, fixed to the sheet with a brushed ragged edge;
 *     the world slides under it. Mottle and brush streaks are baked gradients,
 *     no filters anywhere (ALBUM_NOTES: a full-plate filter per frame is the
 *     one way a print stops being smooth).
 *   - A laid thing is its shape in white over two penumbra strokes in pale blue.
 *     `lift` widens the penumbra: 1 as a thing arrives, easing to the print's
 *     own residue (0.42 before the wash, 0 after) — so a word lands soft and
 *     settles, and after "stay" it settles further.
 *
 * THE MOTION is the album's: a drift that never stops, half-cosine moves, hushes
 * that slow and never stop, and everything placed where the camera will be on
 * its word (`X(t, sx, p)`), with parallax layers at 0.5 (far shore), 1 (the
 * shore) and 1.3 (foreground). `cyanotypeFrame({ time, score })` is pure.
 */

import { r, clamp01, easeOut, easeInOut, ramp, lerp } from '../kit.mjs'
import { sectionAt, lineAt } from '../score.mjs'
import { endCard } from '../ending.mjs'
import { PAPER, INK, RED, SECOND_INK, SHEET, paper, marginLyric, titleCard, easeCamera } from '../album.mjs'

/** The fixed print's blue — the song's second ink. */
export const BLUE = SECOND_INK['rocks-in-the-sea']
/** The same blue exposed but not yet washed: lighter and flatter. */
export const EXPOSED = '#4a7399'
/** Fresh sensitiser, brushed on and not yet in the sun. */
export const COAT = '#aec4d6'
/** The print's whites: the album paper, very slightly cooled by the wash. */
export const WHITE = '#eef0ea'
export const PALE = '#9fbad3'

export const CYANOTYPE = {
  id: 'album-rocks-in-the-sea',
  name: 'Cyanotype',
  accent: RED,
  palette: { PAPER, INK, RED, BLUE, EXPOSED, WHITE },
}

const HZ = 292
const DRIFT = 24
/** How soft an unwashed print's whites stay once laid. */
const RESIDUE = 0.42

/* ══ SMALL THINGS ══════════════════════════════════════════════════════ */

const P = (x, y) => `${r(x)} ${r(y)}`
const smooth = (u) => {
  const x = clamp01(u)
  return x * x * (3 - 2 * x)
}
const op = (o) => (o < 0.999 ? ` opacity="${r(Math.max(0, o), 3)}"` : '')
const polyD = (pts, close = false) => (pts.length > 1 ? 'M' + pts.map(([x, y]) => P(x, y)).join('L') + (close ? 'Z' : '') : '')
const circD = (x, y, rad) => `M${P(x - rad, y)}a${r(rad)} ${r(rad)} 0 1 0 ${r(rad * 2)} 0a${r(rad)} ${r(rad)} 0 1 0 ${r(-rad * 2)} 0Z`
const ellD = (x, y, rx, ry) => `M${P(x - rx, y)}a${r(rx)} ${r(ry)} 0 1 0 ${r(rx * 2)} 0a${r(rx)} ${r(ry)} 0 1 0 ${r(-rx * 2)} 0Z`
const rectD = (x, y, w, h) => `M${P(x, y)}h${r(w)}v${r(h)}h${r(-w)}Z`

/** Deterministic noise in 0–1 from integers — no Math.random anywhere. */
function hash(x, y = 0, s = 0) {
  let h = Math.imul((x | 0) ^ 0x27d4eb2d, 0x165667b1) ^ Math.imul(((y | 0) + Math.imul(s | 0, 7919)) | 0, 0x9e3779b1)
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}

function mix(a, b, u) {
  const k = clamp01(u)
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
  return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], k)).toString(16).padStart(2, '0')).join('')
}

const CACHE = new Map()
const memo = (key, make) => {
  if (!CACHE.has(key)) CACHE.set(key, make())
  return CACHE.get(key)
}

/** Join points into a smooth closed outline — quadratics through the midpoints, never straight joins. */
function blob(points) {
  const n = points.length
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const m0 = mid(points[n - 1], points[0])
  let d = `M${P(m0[0], m0[1])}`
  for (let i = 0; i < n; i++) {
    const p = points[i]
    const m = mid(p, points[(i + 1) % n])
    d += `Q${P(p[0], p[1])} ${P(m[0], m[1])}`
  }
  return d + 'Z'
}

/** A stone: a rounded irregular outline, flatter underneath. */
function stone(cx, cy, rx, ry, seed) {
  const pts = Array.from({ length: 11 }, (_, i) => {
    const a = (i / 11) * Math.PI * 2
    const k = 0.86 + hash(seed, i, 3) * 0.26
    const sy = Math.sin(a) > 0 ? 0.72 : 1
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k * sy]
  })
  return blob(pts)
}

/** A smooth centreline through control points (Catmull-Rom sampled). */
function spline(ctrl, steps = 10) {
  const out = []
  for (let i = 0; i < ctrl.length - 1; i++) {
    const p0 = ctrl[Math.max(0, i - 1)]
    const p1 = ctrl[i]
    const p2 = ctrl[i + 1]
    const p3 = ctrl[Math.min(ctrl.length - 1, i + 2)]
    for (let s = 0; s < steps; s++) {
      const u = s / steps
      const u2 = u * u
      const u3 = u2 * u
      out.push([0, 1].map((k) => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3)))
    }
  }
  out.push(ctrl[ctrl.length - 1])
  return out
}

/** The first fraction `f` of a polyline, by length. */
function partOf(pts, f) {
  if (f >= 1) return pts
  if (f <= 0) return [pts[0]]
  let total = 0
  const seg = []
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
    seg.push(l)
    total += l
  }
  let want = total * f
  const out = [pts[0]]
  for (let i = 1; i < pts.length; i++) {
    if (want <= seg[i - 1]) {
      const u = want / Math.max(seg[i - 1], 1e-6)
      out.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)])
      return out
    }
    want -= seg[i - 1]
    out.push(pts[i])
  }
  return out
}

/** A band along a centreline whose width runs from w0 to w1 over `full` points, closed with a round-ish tip. */
function taper(pts, w0, w1, full = pts.length) {
  const n = pts.length
  if (n < 2) return ''
  const left = []
  const right = []
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)]
    const b = pts[Math.min(n - 1, i + 1)]
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const len = Math.hypot(dx, dy) || 1
    const w = lerp(w0, w1, Math.min(1, i / Math.max(1, full - 1))) / 2
    left.push([pts[i][0] - (dy / len) * w, pts[i][1] + (dx / len) * w])
    right.push([pts[i][0] + (dy / len) * w, pts[i][1] - (dx / len) * w])
  }
  return polyD([...left, ...right.reverse()], true)
}

/* ══ THE PRINT: how a laid thing looks ═════════════════════════════════
 *
 * White where it lay, and round it a penumbra of pale blue where light crept
 * under its edge. `lift` is how far off the paper it is: 1 arriving or in the
 * air, the residue once laid on an unwashed print, 0 once fixed.
 */

function print(d, lift, o = {}) {
  if (!d) return ''
  const a = o.opacity ?? 1
  if (a <= 0.004) return ''
  const pen = 2.4 + 24 * lift
  const rule = o.evenodd ? ' fill-rule="evenodd"' : ''
  const nss = o.nss ? ' vector-effect="non-scaling-stroke"' : ''
  const fill = o.fill ?? WHITE
  return `<path d="${d}"${rule} fill="${PALE}" stroke="${PALE}" stroke-width="${r(pen, 1)}" stroke-linejoin="round"${nss}${op(a * (0.1 + 0.14 * lift))}/>`
    + `<path d="${d}"${rule} fill="${PALE}" stroke="${PALE}" stroke-width="${r(pen * 0.42, 1)}" stroke-linejoin="round"${nss}${op(a * 0.34)}/>`
    + `<path d="${d}"${rule} fill="${fill}"${op(a * (1 - 0.12 * lift))}/>`
}

/** The same for a thread or a stem: a stroke of width `w`. */
function printLine(d, w, lift, o = {}) {
  if (!d) return ''
  const a = o.opacity ?? 1
  if (a <= 0.004) return ''
  const pen = 1.6 + 14 * lift
  const extra = o.extra ?? ''
  const nss = o.nss ? ' vector-effect="non-scaling-stroke"' : ''
  const s = (colour, width, opacity) => `<path d="${d}" fill="none" stroke="${colour}" stroke-width="${r(width, 2)}" stroke-linecap="round" stroke-linejoin="round"${nss}${extra}${op(opacity)}/>`
  return s(PALE, w + pen, a * (0.1 + 0.14 * lift)) + s(PALE, w + pen * 0.42, a * 0.32) + s(o.stroke ?? WHITE, w, a * (1 - 0.1 * lift))
}

/** A word's arrival: presence over 200 ms round the word, and the lift settling over `settle`. */
function lay(now, at, settle = 0.9) {
  return {
    k: easeOut(ramp(now, at - 0.06, at + 0.14)),
    lift: 1 - easeOut(ramp(now, at - 0.06, at + settle)),
  }
}

/** Scale a thing about a point as it settles: arriving things are a touch larger and higher. */
const settleAt = (cx, cy, lift) => (lift > 0.002 ? ` transform="translate(${r(cx)} ${r(cy - 10 * lift)}) scale(${r(1 + 0.06 * lift, 4)}) translate(${r(-cx)} ${r(-cy)})"` : '')

/* ══ THE SHAPES ════════════════════════════════════════════════════════ */

/** A fern frond standing as a tree: a rachis and paired pinnae, pressed flat. */
function fern(x, base, h, lean = 0, seed = 1) {
  const top = [x + lean, base - h]
  let d = `M${P(x, base)}Q${P(x + lean * 0.2, base - h * 0.5)} ${P(top[0], top[1])}`
  const n = 13
  for (let i = 1; i < n; i++) {
    const u = i / n
    const px = x + lean * u * u
    const py = base - h * u
    const len = h * 0.3 * Math.sin(Math.PI * (0.15 + u * 0.85)) * (0.85 + hash(seed, i, 7) * 0.2)
    const up = h * 0.06
    d += `M${P(px, py)}q${r(-len * 0.5)} ${r(-up * 0.3)} ${r(-len)} ${r(-up)}q${r(len * 0.55)} ${r(up * 0.6)} ${r(len)} ${r(up)}`
    d += `M${P(px, py)}q${r(len * 0.5)} ${r(-up * 0.3)} ${r(len)} ${r(-up)}q${r(-len * 0.55)} ${r(up * 0.6)} ${r(-len)} ${r(up)}`
  }
  return { d, top }
}

/** A fern printed: stroked and filled, the way a pressed frond prints solid. */
function fernPrint(f, w, lift, a = 1) {
  if (a <= 0.004) return ''
  const pen = 1.6 + 14 * lift
  const s = (colour, width, opacity, fill) => `<path d="${f.d}" fill="${fill}" stroke="${colour}" stroke-width="${r(width, 2)}" stroke-linecap="round" stroke-linejoin="round"${op(opacity)}/>`
  return s(PALE, w + pen, a * (0.1 + 0.14 * lift), PALE) + s(PALE, w + pen * 0.42, a * 0.32, PALE) + s(WHITE, w, a * (1 - 0.1 * lift), WHITE)
}

/** Sea grass: long tapering blades that sway. */
function grassD(x0, base, now, seed = 9, n = 9) {
  let d = ''
  for (let i = 0; i < n; i++) {
    const x = x0 + i * 16 + hash(seed, i, 1) * 12
    const h = 150 + hash(seed, i, 2) * 170
    const bend = (hash(seed, i, 3) - 0.2) * 160 + 14 * Math.sin(now * 0.8 + i * 0.9 + seed)
    const w = 4 + hash(seed, i, 4) * 4
    d += `M${P(x - w, base)}Q${P(x + bend * 0.3, base - h * 0.55)} ${P(x + bend, base - h)}Q${P(x + bend * 0.3 + w, base - h * 0.55)} ${P(x + w, base)}Z`
  }
  return d
}

/** The hometown: paper houses and a steeple, cut flat. Each house its own outline, so each can be laid. */
const HOUSES = [[0, 40, 30], [36, 34, 40], [76, 48, 26], [112, 30, 34], [150, 42, 30], [196, 32, 44], [236, 50, 24], [282, 36, 36], [324, 44, 28]]
function houseD(x0, y, [dx, w, h], s = 1) {
  const x = x0 + dx * s
  return `M${P(x, y)}V${r(y - h * s)}L${P(x + (w * s) / 2, y - h * s - w * s * 0.45)}L${P(x + w * s, y - h * s)}V${r(y)}Z`
}
const steepleD = (x0, y, s = 1) => `M${P(x0 + 176 * s, y)}V${r(y - 56 * s)}L${P(x0 + 185 * s, y - 104 * s)}L${P(x0 + 194 * s, y - 56 * s)}V${r(y)}Z`

/** The things a photogram is made of, each in a box about 110 wide, centred on 0 0. */
const THINGS = {
  key: `${circD(-38, 0, 22)}${circD(-38, 0, 9)}M-18 -5H52V5H-18ZM30 5h7v13h-7ZM42 5h8v10h-8Z`,
  scissors: `${circD(-44, -15, 15)}${circD(-44, -15, 8)}${circD(-44, 15, 15)}${circD(-44, 15, 8)}M-32 -9L58 4L56 8L-30 -2ZM-32 9L58 -4L56 -8L-30 2Z`,
  spoon: `${ellD(36, 0, 24, 16)}M14 -3Q-20 -5 -58 -6Q-62 0 -58 6Q-20 5 14 3Z`,
  comb: `M-52 -18H52V-6H-52Z${Array.from({ length: 17 }, (_, i) => rectD(-50 + i * 6.2, -7, 2.8, 24)).join('')}`,
  button: `${circD(0, 0, 18)}${circD(-6, -6, 2.8)}${circD(6, -6, 2.8)}${circD(-6, 6, 2.8)}${circD(6, 6, 2.8)}`,
}

/** A gull, wings at `flap` (−1 down … 1 up), as one filled crescent. */
function gullD(x, y, s, flap) {
  const ty = -s * 0.42 * flap
  const lx = x - s
  const rx = x + s
  return `M${P(lx, y + ty)}Q${P(x - s * 0.45, y - s * 0.3 + ty * 0.35)} ${P(x, y)}Q${P(x + s * 0.45, y - s * 0.3 + ty * 0.35)} ${P(rx, y + ty)}`
    + `Q${P(x + s * 0.5, y - s * 0.14 + ty * 0.3)} ${P(x, y + s * 0.13)}Q${P(x - s * 0.5, y - s * 0.14 + ty * 0.3)} ${P(lx, y + ty)}Z`
}
/** A gull perched: body, head, a folded wing. */
const perchedD = (x, y, s) => `${ellD(x, y - s * 0.28, s * 0.42, s * 0.2)}${circD(x + s * 0.34, y - s * 0.5, s * 0.14)}M${P(x - s * 0.36, y - s * 0.3)}l${r(-s * 0.3)} ${r(-s * 0.05)}l${r(s * 0.12)} ${r(s * 0.12)}Z`

/** A tin can lying on its side, open end towards `face` (+1 right, −1 left). Local box: 0…58 by −28…28. */
const CAN_BODY = 'M0 -28H50A9 28 0 0 1 50 28H0A8 28 0 0 1 0 -28Z'
const CAN_MOUTH = ellD(50, 0, 7, 24)
const CAN_RIBS = 'M14 -28V28M26 -28V28M38 -28V28'

/** A paper-chain house, 62 wide, origin at its bottom left. The window and door are cut out. */
const CHAIN_W = 62
const CHAIN_HOUSE = `M0 0V-58L31 -90L62 -58V0Z${rectD(22, -48, 18, 16)}${rectD(25, -26, 12, 22)}`

/** Seaweed, after Anna Atkins: a branching frond, returned as one path per depth. */
function algae(x, base, h, seed, open, now) {
  const depths = [[], [], [], [], [], []]
  const curl = (hash(seed, 0, 3) < 0.5 ? -1 : 1) * 0.16
  const walk = (x0, y0, a, len, depth, id) => {
    const sway = 0.05 * Math.sin(now * 0.7 + depth * 0.8 + seed)
    const aa = a + sway + curl * depth * open
    const x1 = x0 + Math.sin(aa) * len
    const y1 = y0 - Math.cos(aa) * len
    const bend = (hash(seed, id, 5) - 0.5) * len * 0.35
    depths[depth].push(`M${P(x0, y0)}Q${P((x0 + x1) / 2 + bend, (y0 + y1) / 2)} ${P(x1, y1)}`)
    if (depth >= 5) return
    const kids = hash(seed, id, 6) < 0.3 ? 3 : 2
    for (let k = 0; k < kids; k++) {
      const spread = (0.32 + hash(seed, id * 3 + k, 8) * 0.34) * open
      const turn = kids === 2 ? (k === 0 ? -spread : spread) : (k - 1) * spread * 1.1
      walk(x1, y1, aa + turn, len * (0.68 + hash(seed, id * 3 + k, 9) * 0.12), depth + 1, id * 3 + k + 1)
    }
  }
  const lean = (hash(seed, 0, 4) < 0.5 ? -1 : 1) * (0.75 + hash(seed, 0, 5) * 0.4)
  walk(x, base, lean, h * 0.32, 0, 0)
  return depths.map((ds) => ds.join(''))
}
const ALGAE_W = [6, 4.4, 3.2, 2.3, 1.6, 1.1]

/* ══ THE PLAN: when and where everything is ════════════════════════════ */

const PLANS = new WeakMap()

function planFor(score, uid) {
  if (!PLANS.has(score)) PLANS.set(score, buildPlan(score))
  return { ...PLANS.get(score), uid }
}

function buildPlan(score) {
  const inSec = (sid) => score.lines.filter((l) => l.section === sid)
  const sec = (sid) => {
    const s = score.sections.find((x) => x.id === sid)
    if (!s) throw new Error(`cyanotype: no section ${sid}`)
    return s
  }
  const wt = (line, re, nth = 0) => {
    const found = line?.words.filter((w) => re.test(w.text))
    if (!found?.length) throw new Error(`cyanotype: no word ${re} in "${line?.text}"`)
    return found[Math.min(nth, found.length - 1)].t
  }
  const v1 = inSec('verse-1')
  const v2 = inSec('verse-2')
  const c1 = inSec('chorus-1')
  const v3 = inSec('verse-3')
  const c2 = inSec('chorus-2')

  const T = {
    drove: wt(v1[0], /^drove/), hometown: wt(v1[0], /^hometown/), today: wt(v1[0], /^today/),
    green: wt(v1[1], /^green/), gray: wt(v1[1], /^gray/),
    always1: wt(v1[2], /^always/), me1: wt(v1[2], /^me/), shame1: wt(v1[2], /^shame/),
    always2: wt(v1[3], /^always/), me2: wt(v1[3], /^me/), shame2: wt(v1[3], /^shame/),
    dont: wt(v2[0], /^don't/), much: wt(v2[0], /^much/), left: wt(v2[0], /^left/), say: wt(v2[0], /^say/),
    leave: wt(v2[1], /^leave/), things: wt(v2[1], /^things/), drift: wt(v2[1], /^drift/), away: wt(v2[1], /^away/),
    shake: wt(v2[2], /^shake/), rain: wt(v2[2], /^rain/),
    rocks1: wt(v2[3], /^rocks/), water: wt(v2[3], /^water/), calling1: wt(v2[3], /^calling/), name1: wt(v2[3], /^name/),
    road1: wt(c1[0], /^road/), down1: wt(c1[0], /^down/), trees1: wt(c1[0], /^trees/), sound1: wt(c1[0], /^sound/),
    hearts1: wt(c1[1], /^hearts/), home1: wt(c1[1], /^home/), free1: wt(c1[1], /^free/),
    only1: wt(c1[2], /^only/), place1: wt(c1[2], /^place/), calling2: wt(c1[2], /^calling/),
    sand1: wt(c1[3], /^sand/), rocks2: wt(c1[3], /^rocks/), sea1: wt(c1[3], /^sea/),
    sandB: wt(c1[4], /^sand/), rocksB: wt(c1[4], /^rocks/), seaB: wt(c1[4], /^sea/),
    talked: wt(v3[0], /^talked/), sister: wt(v3[0], /^sister/), today2: wt(v3[0], /^today/),
    things2: wt(v3[1], /^things/), make: wt(v3[1], /^make/),
    stranded: wt(v3[2], /^stranded/), rocks3: wt(v3[2], /^rocks/), bay: wt(v3[2], /^bay/),
    ones: wt(v3[3], /^ones/), love: wt(v3[3], /^love/), choose: wt(v3[3], /^choose/), stay: wt(v3[3], /^stay/),
    road2: wt(c2[0], /^road/), trees2: wt(c2[0], /^trees/), sound2: wt(c2[0], /^sound/),
    hearts2: wt(c2[1], /^hearts/), home2: wt(c2[1], /^home/), free2: wt(c2[1], /^free/),
    only2: wt(c2[2], /^only/), place2: wt(c2[2], /^place/), calling3: wt(c2[2], /^calling/),
    sand2: wt(c2[3], /^sand/), rocks4: wt(c2[3], /^rocks/), sea2: wt(c2[3], /^sea/),
    sandC: wt(c2[4], /^sand/), rocksC: wt(c2[4], /^rocks/), seaC: wt(c2[4], /^sea/),
    sandD: wt(c2[5], /^sand/), seaD: wt(c2[5], /^sea/),
    end: score.endCardAt ?? score.duration,
  }
  const S = {
    v1, v2, c1, v3, c2,
    break1: sec('break-1'),
    break2: sec('break-2'),
  }

  /* ── The camera: a drift that slows three times, plus eased moves ── */
  const hushes = [
    { a: T.rocks1 - 0.3, b: T.name1 + 0.4, k: 0.65 },
    { a: c1[4].start - 0.6, b: S.break2.from + 0.6, k: 0.6 },
    { a: v3[3].start - 1.2, b: 1e9, k: 0.75 },
  ]
  const hush = (t) => {
    let h = 0
    for (const x of hushes) h = Math.max(h, x.k * easeInOut(ramp(t, x.a, x.a + 0.9)) * (1 - easeInOut(ramp(t, x.b, x.b + 1.4))))
    return h
  }
  const speed = (t) => DRIFT * (0.35 + 0.65 * smooth(ramp(t, 0, 16))) * (1 - hush(t))
  const DT = 0.01
  const N = Math.ceil((score.duration + 2) / DT)
  const table = new Float64Array(N + 1)
  for (let i = 1; i <= N; i++) table[i] = table[i - 1] + speed((i - 0.5) * DT) * DT
  const drift = (t) => {
    const f = Math.max(0, t) / DT
    const i = Math.min(N - 1, Math.floor(f))
    return lerp(table[i], table[i + 1], f - i)
  }
  const moves = []
  const mv = (a, b, A) => moves.push({ a, b: Math.max(b, a + 1.4), A })
  mv(T.always1 - 0.4, T.me1 + 1.8, 650) // the town slides away; the cloud stays
  mv(T.shame2 + 0.7, T.shame2 + 4.4, 700) // into the seaweed
  mv(64.3, 68.3, 620) // along the seaweed
  mv(T.away + 0.8, v2[2].start + 1.2, 560) // out under the cloud
  mv(v2[2].end + 0.6, v2[3].start + 0.5, 520) // → the rocks
  mv(T.name1 + 0.2, T.road1 + 0.25, 520) // → the headland
  mv(T.free1 + 0.2, c1[2].start + 0.9, 1200) // → rocks in the sea
  mv(S.break2.from + 0.8, S.break2.to - 4.3, 1700) // the swell
  mv(T.today2 + 0.5, v3[1].start + 0.8, 450) // → the paper houses
  moves.sort((a, b) => a.a - b.a)
  const cam = (t) => {
    let x = drift(t)
    for (const m of moves) {
      if (t <= m.a) break
      x += m.A * easeCamera(ramp(t, m.a, m.b))
    }
    return x
  }
  /** World x of something at screen x `sx` at time `t`, on a layer moving at `p`. */
  const X = (t, sx, p = 1) => sx + p * (cam(t) - 800)
  /** World x of something that ends the film at screen x `sx` — the last chorus is composed as one picture. */
  const Tend = T.seaD
  const F = (sx, p = 1) => X(Tend, sx, p)

  /* ── The road: along the foot from "drove", up the first headland ── */
  // Drawn across the foot of the plate on "drove", then always reaching past
  // the right edge, until it meets the headland it will climb.
  const sweep = (t) => lerp(-770, 980, easeInOut(ramp(t, T.drove - 0.1, T.drove + 3.6)))
  const roadStart = cam(T.drove - 0.1) - 770
  const turn = cam(T.road1) + 330
  const headX = (t) => Math.min(turn, cam(t) + sweep(t))
  const roadY = (wx) => 664 + 13 * Math.sin(wx / 270) + 6 * Math.sin(wx / 101 + 0.7)
  const turnY = roadY(turn)
  const up1 = spline([[turn, turnY], [turn - 12, 640], [turn + 40, 592], [turn - 18, 542], [turn + 52, 494], [turn + 22, 446], [turn + 74, 398], [turn + 100, 374]], 10)
  const head1 = { a: turn - 420, b: turn - 30, c: turn + 330, d: turn + 580, top: 372 }
  const trees1 = [[-90, 372, 160, -10], [-20, 370, 222, 6], [60, 368, 196, 14], [140, 366, 150, 4], [215, 366, 188, -6], [290, 367, 140, 8]]
    .map(([dx, base, h, lean], i) => ({ ...fern(turn + dx, base, h, lean, 20 + i), at: T.trees1 - 0.12 + i * 0.13 }))

  /* ── The second headland, where the film ends ── */
  const r2 = F(1010)
  const up2 = spline([[r2, 716], [r2 - 22, 672], [r2 + 30, 622], [r2 - 14, 566], [r2 + 46, 512], [r2 + 12, 458], [r2 + 72, 408], [r2 + 112, 374]], 10)
  const head2 = { a: r2 - 260, b: r2 + 60, c: r2 + 2600, d: r2 + 3000, top: 372 }
  const trees2 = [[-40, 372, 170, -10], [30, 371, 236, 6], [110, 369, 206, 14], [190, 367, 160, 4], [270, 366, 200, -6], [350, 367, 150, 10]]
    .map(([dx, base, h, lean], i) => ({ ...fern(r2 + dx, base, h, lean, 40 + i), at: T.trees2 - 0.12 + i * 0.13 }))

  const heads = [head1, head2]
  const headTop = (h, wx) => {
    if (wx <= h.a || wx >= h.d) return Infinity
    if (wx < h.b) return lerp(716, h.top, Math.sin((Math.PI / 2) * ((wx - h.a) / (h.b - h.a))))
    if (wx <= h.c) return h.top + 4 * Math.sin(wx / 90)
    return lerp(h.top, 716, 1 - Math.cos((Math.PI / 2) * ((wx - h.c) / (h.d - h.c))))
  }
  const baseShore = (wx) => 604 + 15 * Math.sin(wx / 290) + 9 * Math.sin(wx / 113 + 1.3)
  const shoreY = (wx) => {
    let y = baseShore(wx)
    for (const h of heads) y = Math.min(y, headTop(h, wx))
    return y
  }

  /* ── Where everything is: placed from where the camera is on its word ── */
  const beat = (n) => (score.beatPhase ?? 0.54) + n * (60 / (score.bpm ?? 100))
  const bar = (t) => beat(Math.ceil((t - (score.beatPhase ?? 0.54)) / (240 / (score.bpm ?? 100))) * 4)
  const algaeAt = [bar(S.break1.from + 0.4)]
  for (let i = 1; i < 5; i++) algaeAt.push(algaeAt[i - 1] + 2.4)

  const Pl = {
    town1: { x: X(T.today, 560, 0.5), s: 1.3 },
    greens: [[210, 380, -40, 31], [300, 440, 10, 32], [395, 350, 46, 33]].map(([sx, h, lean, seed], i) => ({ x: X(T.green, sx, 1.3), h, lean, seed, at: T.green - 0.1 + i * 0.16 })),
    pebbles1: [[T.always2, 980, 20, 12], [T.me2, 1100, 15, 9], [T.shame2, 1210, 24, 13]].map(([at, sx, rx, ry], i) => ({ at, x: X(at, sx), y: 650 + 10 * i, rx, ry, seed: 50 + i })),
    algae: algaeAt.map((at, i) => ({ at, x: X(at, [1080, 1260, 1000, 1240, 1120][i]), base: [690, 610, 700, 640, 680][i], h: [360, 280, 340, 300, 350][i], seed: 60 + i })),
    dandelion: { x: X(T.dont, 1000), y: 652, at: T.dont },
    things: ['key', 'scissors', 'spoon', 'comb', 'button'].map((name, i) => ({ name, x: X(T.things, 230 + i * 118), y: 628 + (i % 2) * 18, rot: [-14, 8, -6, 12, 0][i], at: T.things - 0.12 + i * 0.16 })),
    rocks1: [[T.rocks1, 820, 520, 104, 54], [T.water, 1010, 548, 66, 38], [T.water + 0.2, 640, 556, 72, 36]].map(([at, sx, y, rx, ry], i) => ({ at, x: X(at, sx), y, rx, ry, seed: 70 + i })),
    birds1: [0, 1, 2, 3, 4].map((k) => ({ from: trees1[k].top, at: T.hearts1 - 0.2 + k * 0.3, s: 40 + (k % 3) * 6, k })),
    rocks2: [[T.only1, 330, 520, 124, 62], [T.place1, 760, 506, 98, 52], [T.rocks2, 540, 552, 72, 40], [T.rocks2 + 0.18, 650, 604, 48, 26], [T.rocks2 + 0.36, 190, 598, 58, 28], [T.rocksB, 1080, 536, 86, 44], [T.rocksB + 0.22, 1250, 566, 52, 28]].map(([at, sx, y, rx, ry], i) => ({ at, x: X(at, sx), y, rx, ry, seed: 80 + i })),
    streams1: [260, 640, 1000].map((sx, i) => ({ x: X(T.sand1, sx), at: T.sand1 - 0.1 + i * 0.22, seed: 90 + i })),
    grass1: { x: X(T.sandB, 60, 1.3), at: T.sandB },
    cans: [{ x: X(T.talked, 360), at: T.talked, face: 1 }, { x: X(T.sister, 980), at: T.sister, face: -1 }],
    chain: { x: F(130), at: T.things2, open: T.make },
    stones: [[500, 530, 58, 34], [630, 552, 46, 28], [730, 536, 36, 22]].map(([sx, y, rx, ry], i) => ({ x: F(sx), y, rx, ry, seed: 100 + i, at: [T.stranded, T.rocks3, T.bay][i] })),
    cairn: { x: F(640), base: 666 },
    town2: { x: F(140, 0.5), s: 1.3, at: T.home2 },
    birds2: [0, 1, 2, 3].map((k) => ({ to: trees2[k + 1].top, at: T.hearts2 + 0.6 + k * 0.45, s: 36 + (k % 2) * 6, k })),
    rocks4: [[T.only2, 300, 472, 92, 44], [T.place2, 480, 498, 58, 30], [T.place2 + 0.2, 600, 480, 38, 20]].map(([at, sx, y, rx, ry], i) => ({ at, x: F(sx), y, rx, ry, seed: 110 + i })),
    streams2: [200, 520, 860].map((sx, i) => ({ x: F(sx), at: T.sand2 - 0.1 + i * 0.22, seed: 120 + i })),
    pebbles2: [[T.rocksC, 700, 12, 7], [T.rocksC + 0.15, 760, 16, 9], [T.rocks4, 540, 11, 7]].map(([at, sx, rx, ry], i) => ({ at, x: F(sx), y: 676 + (i % 2) * 8, rx, ry, seed: 130 + i })),
    grass2: { x: F(0, 1.3), at: T.sandC },
  }

  /* ── The wash ── */
  const washFrom = T.stay - 0.1
  const washTo = T.stay + 5.2
  const front = (t) => lerp(-300, 1980, easeCamera(ramp(t, washFrom, washTo)))

  return {
    T, S, cam, X, F, speed, hush, shoreY, baseShore, heads, headTop,
    road: { start: roadStart, turn, headX, roadY, up1, up2 },
    trees1, trees2, Pl, front, washFrom, washTo,
  }
}

/* ══ THE PAPER: coat, mottle, and the full sheet ═══════════════════════ */

/** The plate: SHEET.plate, opening to the whole sheet for the second guitar break. */
function boxAt(plan, now) {
  const { break2 } = plan.S
  const k = easeCamera(ramp(now, break2.from + 0.4, break2.from + 2.2)) * (1 - easeCamera(ramp(now, break2.to - 2.3, break2.to - 0.5)))
  const B = SHEET.plate
  return { x: lerp(B.x, 0, k), y: lerp(B.y, 0, k), w: lerp(B.w, 1600, k), h: lerp(B.h, 900, k), k }
}

/** The brushed coating's outline for a box: ragged top and bottom, bristle fingers at the ends. */
function coatD(box) {
  const ix = lerp(18, 8, box.k)
  const iy = lerp(14, 7, box.k)
  const x0 = box.x + ix
  const x1 = box.x + box.w - ix
  const y0 = box.y + iy
  const y1 = box.y + box.h - iy
  const pts = []
  const NX = 60
  for (let i = 0; i <= NX; i++) pts.push([lerp(x0, x1, i / NX), y0 + (hash(i, 1, 201) - 0.5) * 7 + (hash(i >> 2, 2, 201) - 0.5) * 6])
  const NY = 34
  for (let j = 1; j < NY; j++) {
    const finger = hash(j, 3, 202) < 0.5 ? hash(j, 4, 202) * 22 : -hash(j, 5, 202) * 8
    pts.push([x1 + finger, lerp(y0, y1, j / NY)])
  }
  for (let i = NX; i >= 0; i--) pts.push([lerp(x0, x1, i / NX), y1 + (hash(i, 6, 203) - 0.5) * 7 + (hash(i >> 2, 7, 203) - 0.5) * 6])
  for (let j = NY - 1; j > 0; j--) {
    const finger = hash(j, 8, 204) < 0.5 ? hash(j, 9, 204) * 22 : -hash(j, 10, 204) * 8
    pts.push([x0 - finger, lerp(y0, y1, j / NY)])
  }
  return polyD(pts, true)
}

/** The four brush strokes of the intro, as a clip: each band's reveal, its leading edge ragged. */
const STROKES = [1.9, 3.3, 4.7, 6.1]
function brushClip(box, now) {
  let d = ''
  const bandH = box.h / STROKES.length
  STROKES.forEach((s, i) => {
    const u = easeInOut(ramp(now, s, s + 2.5))
    if (u <= 0) return
    const head = box.x - 80 + (box.w + 200) * u
    const y0 = box.y + i * bandH - (i ? 10 : 30)
    const y1 = box.y + (i + 1) * bandH + (i === STROKES.length - 1 ? 30 : 10)
    const pts = [[box.x - 100, y0]]
    const n = 16
    for (let j = 0; j <= n; j++) {
      const y = lerp(y0, y1, j / n)
      const bow = Math.sin((j / n) * Math.PI) * 40
      pts.push([head + bow - hash(i, j, 205) * 46, y])
    }
    pts.push([box.x - 100, y1])
    d += polyD(pts, true)
  })
  return d
}

/** Mottle and brush streaks: the coat's own unevenness. Fixed to the sheet; baked. */
function mottle(uid, box) {
  const blots = memo('blots', () => Array.from({ length: 16 }, (_, i) => [hash(i, 1, 210), hash(i, 2, 210), 120 + hash(i, 3, 210) * 260, 50 + hash(i, 4, 210) * 90]))
  const streaks = memo('streaks', () => Array.from({ length: 34 }, (_, i) => [hash(i, 1, 211), hash(i, 2, 211) * 0.3, 0.55 + hash(i, 3, 211) * 0.45, 1.2 + hash(i, 4, 211) * 3.4, 0.05 + hash(i, 5, 211) * 0.09]))
  const b = blots.map(([u, v, rx, ry]) => `<ellipse cx="${r(box.x + u * box.w)}" cy="${r(box.y + v * box.h)}" rx="${r(rx)}" ry="${r(ry)}" fill="url(#${uid}-mot)"/>`).join('')
  const s = streaks.map(([v, a, l, w, o]) => `<path d="M${P(box.x + a * box.w, box.y + v * box.h)}h${r(l * box.w)}" stroke="${PALE}" stroke-width="${r(w, 1)}" stroke-linecap="round"${op(o)}/>`).join('')
  return b + s
}

/* ══ THE SEA ═══════════════════════════════════════════════════════════ */

const THREADS = 13

/** The sea: cotton threads laid across the paper, each a slow wave, parallax by depth. Screen space. */
function sea(ctx, now) {
  const { plan, v, box, lift0 } = ctx
  const { S } = plan
  const swell = 1 + 1.9 * easeInOut(ramp(now, S.break2.from + 1.5, S.break2.from + 5)) * (1 - easeInOut(ramp(now, S.break2.to - 5, S.break2.to - 1)))
  const crestX = lerp(1900, -500, ramp(now, S.break2.from + 3.2, S.break2.to - 3.5))
  const crestOn = ramp(now, S.break2.from + 3.2, S.break2.from + 4.2) * (1 - ramp(now, S.break2.to - 4.2, S.break2.to - 3.5))
  const calm = 1 - 0.55 * easeInOut(ramp(now, plan.T.sound1 - 0.4, plan.T.sound1 + 1.2)) * (1 - easeInOut(ramp(now, plan.T.free1, plan.T.free1 + 3)))
  let out = ''
  const x0 = box.x
  const x1 = box.x + box.w
  for (let i = 0; i < THREADS; i++) {
    const u = easeInOut(ramp(now, 14 + i * 0.66, 15.3 + i * 0.66))
    if (u <= 0) continue
    const y0 = HZ + 10 + i * i * 1.2 + i * 6
    const p = 0.5 + 0.5 * (i / (THREADS - 1))
    const amp = (1.6 + i * 0.45) * swell * calm
    const k = (2 * Math.PI) / (260 - i * 8)
    const w = 0.55 + 0.03 * i
    const ph = hash(i, 1, 220) * 6.28
    const end = x0 + (x1 - x0) * u
    let d = ''
    let pen = false
    for (let x = x0; x <= end + 0.1; x += 26) {
      const xx = Math.min(x, end)
      const wx = xx + p * v
      let y = y0 + amp * Math.sin(wx * k + now * w + ph)
      if (crestOn > 0) y -= crestOn * (6 + i * 1.6) * Math.exp(-(((xx - crestX) / 240) ** 2))
      const land = plan.shoreY(xx + v) - 5
      if (y > land) {
        pen = false
        continue
      }
      d += `${pen ? 'L' : 'M'}${P(xx, y)}`
      pen = true
    }
    const o = 0.46 + 0.36 * hash(i, 2, 220)
    const width = 1.1 + i * 0.2
    out += printLine(d, width, lift0 * (hash(i, 3, 220) < 0.4 ? 1.4 : 0.8), { opacity: o })
  }
  return out
}

/** The coast: one more thread, laid along where the water stops. */
function coast(ctx, now) {
  const { plan, v, box, lift0 } = ctx
  const u = easeInOut(ramp(now, 22.5, 25.5))
  if (u <= 0) return ''
  let d = ''
  let pen = false
  const end = box.x + box.w * u
  for (let x = box.x; x <= end; x += 14) {
    const y = plan.shoreY(x + v)
    if (y > box.y + box.h + 12) {
      pen = false
      continue
    }
    d += `${pen ? 'L' : 'M'}${P(x, y)}`
    pen = true
  }
  return printLine(d, 2.4, lift0, { opacity: 0.9 })
}

/** Sand: grains scattered by hand, thicker towards the foot. Baked in 400-unit pieces of the world. */
function sandIn(plan, v) {
  let out = ''
  const c0 = Math.floor((v - 20) / 400)
  const c1 = Math.floor((v + 1620) / 400)
  for (let c = c0; c <= c1; c++) {
    out += memo(`sand-${c}`, () => {
      let d = ''
      for (let i = 0; i < 170; i++) {
        const x = c * 400 + hash(c, i, 230) * 400
        const top = plan.baseShore(x) + 12
        const vv = hash(c, i, 231)
        const y = i < 130 ? top + (712 - top) * Math.sqrt(vv) : 712 + vv * 190
        const s = 1.2 + hash(c, i, 232) * 2.4
        d += `M${P(x, y)}h${r(s, 1)}v${r(s, 1)}h${r(-s, 1)}z`
      }
      return `<path d="${d}" fill="${WHITE}"/>`
    })
  }
  return out
}

/** A stone laid: its penumbra, the white, and the pale underside where it curves up off the paper. */
function rock(ctx, x, y, rx, ry, seed, lift, k = 1) {
  if (k <= 0.004) return ''
  const d = stone(x, y, rx, ry, seed)
  const under = `<ellipse cx="${r(x)}" cy="${r(y + ry * 0.4)}" rx="${r(rx * 0.72)}" ry="${r(ry * 0.26)}" fill="${PALE}"${op(k * (0.25 + 0.3 * lift))}/>`
  return `<g${settleAt(x, y, Math.max(0, lift - ctx.lift0))}>${print(d, lift, { opacity: k })}${under}</g>`
}

/** Rings going out on the water from a point, one per start time. */
function rings(x, y, rx, starts, now, span = 2.4) {
  let out = ''
  for (const s of starts) {
    const u = (now - s) / span
    if (u <= 0 || u >= 1) continue
    const R = rx + 16 + 150 * easeOut(u)
    out += `<path d="${ellD(x, y, R, R * 0.2)}" fill="none" stroke="${WHITE}" stroke-width="${r(2 - u, 2)}"${op(0.6 * (1 - u) ** 1.4)}/>`
  }
  return out
}

/** Sand sifted down from above in a stream; every grain stays where it lands. */
function sift(stream, now, lift0) {
  const { x, at, seed } = stream
  if (now < at) return ''
  let falling = ''
  let landed = ''
  for (let i = 0; i < 60; i++) {
    const rel = at + i * 0.03 + hash(seed, i, 1) * 0.25
    if (now < rel) continue
    const land = 636 + hash(seed, i, 3) * 60
    const top = land - 150 - hash(seed, i, 6) * 90
    const fall = Math.sqrt((2 * (land - top)) / 1500)
    const u = clamp01((now - rel) / fall)
    const gx = x + (hash(seed, i, 2) - 0.5) * 24 + (hash(seed, i, 5) - 0.5) * 150 * u
    const y = top + (land - top) * u * u
    const s = 2 + hash(seed, i, 4) * 2.8
    if (u < 1) falling += `M${P(gx, y)}h${r(s, 1)}v${r(s * 1.6, 1)}h${r(-s, 1)}z`
    else landed += `M${P(gx, land)}h${r(s, 1)}v${r(s, 1)}h${r(-s, 1)}z`
  }
  return (falling ? `<path d="${falling}" fill="${WHITE}" opacity="0.7"/>` : '') + (landed ? print(landed, lift0 * 0.5) : '')
}

/** A wave thread rolling in along the shore on "sea". Screen space. */
function waveIn(ctx, at, now) {
  const { plan, v, box, lift0 } = ctx
  const u = easeInOut(ramp(now, at - 0.2, at + 1.5))
  const fade = 1 - easeInOut(ramp(now, at + 2.6, at + 5.5))
  if (u <= 0 || fade <= 0) return ''
  let d = ''
  let pen = false
  const end = box.x + box.w * u
  for (let x = box.x; x <= end; x += 18) {
    const shore = plan.baseShore(x + v)
    const y = shore - 20 - 5 * Math.sin((x + v) / 60 + now * 1.2)
    if (plan.shoreY(x + v) < shore - 30) {
      pen = false
      continue
    }
    d += `${pen ? 'L' : 'M'}${P(x, y)}`
    pen = true
  }
  return printLine(d, 3.4, lift0 + 0.3 * (1 - u), { opacity: 0.95 * fade })
}

/* ══ THE SCENES ════════════════════════════════════════════════════════ */

/** The sun: laid in the intro, crossing the sky over the whole song to where the still has it. Screen space. */
function sun(ctx, now) {
  const { k, lift } = lay(now, 12.6, 1.6)
  if (k <= 0) return ''
  const u = clamp01(now / 222)
  const x = lerp(1190, 560, u)
  const y = 172 - 34 * Math.sin(Math.PI * u)
  const l = Math.max(lift, ctx.fixedAt(x) < 1 ? RESIDUE * (1 - ctx.fixedAt(x)) + 0.2 * (1 - ctx.fixedAt(x)) : 0)
  return `<g${settleAt(x, y, lift)}>${print(circD(x, y, 52), l, { opacity: k })}</g>`
}

/** The hometown on the far shore, house by house. World, far layer. */
function town(ctx, now, where, times) {
  const { x, s } = where
  const y = HZ + 1
  let out = ''
  HOUSES.forEach((h, i) => {
    const { k, lift } = lay(now, times[i])
    if (k <= 0) return
    out += print(houseD(x, y, h, s), Math.max(lift, ctx.lift0), { opacity: k })
  })
  const st = lay(now, times[HOUSES.length])
  if (st.k > 0) out += print(steepleD(x, y, s), Math.max(st.lift, ctx.lift0), { opacity: st.k })
  const g = lay(now, times[0] - 0.1)
  if (g.k > 0) out += printLine(`M${P(x - 24, y)}H${r(x + 380 * s)}`, 3, ctx.lift0, { opacity: g.k })
  return out
}

/** The grey cloud: cotton wool, always soft, laid on "gray" and riding with the camera until the wash rinses it out. */
const PUFFS = [[-118, 12, 46], [-66, -16, 60], [0, -30, 70], [64, -12, 58], [118, 10, 44], [-26, 16, 56], [48, 18, 52]]
function cloudAt(plan, now) {
  const { T } = plan
  const x = lerp(1010, 630, easeCamera(ramp(now, T.always1 - 0.3, T.me1 + 1.8))) + 36 * Math.sin(now * 0.06) + 6 * Math.sin(now * 21) * Math.exp(-Math.max(0, now - T.shake) * 1.6) * (now > T.shake ? 1 : 0)
  const y = 136 + 7 * Math.sin(now * 0.1)
  return { x, y }
}
function cloud(ctx, now) {
  const { T } = ctx.plan
  const { k, lift } = lay(now, T.gray, 1.4)
  if (k <= 0) return ''
  const { x, y } = cloudAt(ctx.plan, now)
  const rinse = ctx.fixedAt(x)
  const a = k * (1 - easeInOut(clamp01(rinse * 1.15)))
  if (a <= 0.004) return ''
  const grow = 1 + 0.18 * rinse
  const d = PUFFS.map(([dx, dy, rad]) => circD(x + dx * grow, y + dy * grow, rad * grow)).join('')
  // Its paleness, and on the water under it a paler patch where it keeps the sun off.
  const shade = `<ellipse cx="${r(x)}" cy="${r(HZ + 150)}" rx="260" ry="80" fill="url(#${ctx.uid}-shade)"${op(a * 0.8)}/>`
  return shade + `<g${settleAt(x, y, lift)}>${print(d, 0.8 + 0.2 * lift + 0.3 * rinse, { opacity: a * 0.82, fill: mix(PALE, WHITE, 0.42) })}</g>`
}

/** Rain out of the cloud, falling and ringing on the water. Screen space. */
function rain(ctx, now) {
  const { T } = ctx.plan
  const k = Math.min(easeInOut(ramp(now, T.rain - 0.5, T.rain + 0.7)), 1 - easeInOut(ramp(now, T.trees1, T.sound1 + 0.6)))
  if (k <= 0) return ''
  const { x, y } = cloudAt(ctx.plan, now)
  let drops = ''
  let rng = ''
  for (let i = 0; i < 46; i++) {
    const period = 0.8 + hash(i, 1, 240) * 0.35
    const land = HZ + 30 + hash(i, 2, 240) * 250
    const top = y + 40
    const f = ((now + hash(i, 3, 240) * period) % period) / period
    const sx = x - 170 + hash(i, 4, 240) * 340
    const yy = top + (land - top) * f
    const xx = sx - (yy - top) * 0.2
    if (hash(i, 5, 240) > k) continue
    drops += `M${P(xx, yy)}l${r(-3.4)} ${r(17)}`
    // The drop before this one rings where it landed, for the first third of the cycle.
    if (f < 0.35 && now > T.rain) {
      const R = 3 + 16 * (f / 0.35)
      rng += ellD(sx - (land - top) * 0.2, land, R, R * 0.28)
    }
  }
  return `<path d="${drops}" fill="none" stroke="${WHITE}" stroke-width="1.6" stroke-linecap="round"${op(0.7 * k)}/>`
    + (rng ? `<path d="${rng}" fill="none" stroke="${WHITE}" stroke-width="1.2"${op(0.4 * k)}/>` : '')
}

/** Seaweed laid on the bars of the first guitar break, unfurling as it settles. World. */
function seaweed(ctx, now) {
  let out = ''
  for (const a of ctx.plan.Pl.algae) {
    if (!ctx.vis(a.x - 250, a.x + 250)) continue
    const { k, lift } = lay(now, a.at, 1.4)
    if (k <= 0) continue
    const open = 0.25 + 0.75 * easeOut(ramp(now, a.at - 0.05, a.at + 1.6))
    const ds = algae(a.x, a.base, a.h, a.seed, open, now)
    const l = Math.max(lift, ctx.lift0)
    out += `<g${settleAt(a.x, a.base - a.h / 2, lift)}>${ds.map((d, i) => printLine(d, ALGAE_W[i], l, { opacity: k })).join('')}</g>`
  }
  return out
}

/** The dandelion clock: laid on "don't have", a few seeds on "much", "left", "say", the rest on "drift away". World. */
function dandelion(ctx, now) {
  const { T, Pl } = ctx.plan
  const { x, y, at } = Pl.dandelion
  if (!ctx.vis(x - 200, x + 2200)) return ''
  const { k, lift } = lay(now, at, 1.1)
  if (k <= 0) return ''
  const cx = x + 12
  const cy = y - 214
  const l = Math.max(lift, ctx.lift0)
  const N = 64
  let attached = ''
  let loose = ''
  for (let j = 0; j < N; j++) {
    const a = -Math.PI / 2 + (j / N) * Math.PI * 2 + 0.07
    const dx = Math.cos(a)
    const dy = Math.sin(a)
    const rel = j % 9 === 1 ? T.much + (j % 5) * 0.12 : j % 9 === 4 ? T.left + (j % 5) * 0.12 : j % 9 === 7 ? T.say + (j % 5) * 0.12 : T.drift - 0.2 + hash(j, 2, 250) * 1.9
    const tau = now - rel - hash(j, 1, 250) * 0.3
    if (tau <= 0) {
      const tx = cx + dx * 46
      const ty = cy + dy * 46
      attached += `M${P(cx + dx * 7, cy + dy * 7)}L${P(tx, ty)}`
      for (let f = -2; f <= 2; f++) {
        const fa = a + f * 0.26
        attached += `M${P(tx, ty)}l${r(Math.cos(fa) * 12)} ${r(Math.sin(fa) * 12)}`
      }
      continue
    }
    if (tau > 12) continue
    // Carried off on the wind: accelerating from rest, lifting, turning pappus-up.
    const ease = tau - 0.8 * (1 - Math.exp(-tau / 0.8))
    const sx = cx + dx * 42 + 58 * ease + 5 * ease * ease * 0.2
    const sy = cy + dy * 42 - 16 * ease + 9 * Math.sin(tau * 1.1 + j)
    const up = lerp(a, -Math.PI / 2, 1 - Math.exp(-tau * 1.5)) + 0.25 * Math.sin(tau * 1.3 + j)
    const ux = Math.cos(up)
    const uy = Math.sin(up)
    loose += `M${P(sx - ux * 26, sy - uy * 26)}L${P(sx, sy)}`
    for (let f = -3; f <= 3; f++) {
      const fa = up + f * 0.22
      loose += `M${P(sx, sy)}l${r(Math.cos(fa) * 11)} ${r(Math.sin(fa) * 11)}`
    }
  }
  const stem = `M${P(x, y)}Q${P(x - 10, y - 110)} ${P(cx, cy)}`
  return `<g${settleAt(cx, cy, lift)}>${printLine(stem, 3.2, l, { opacity: k })}${print(circD(cx, cy, 7), l, { opacity: k })}${printLine(attached, 0.9, l * 0.7, { opacity: k })}</g>`
    + printLine(loose, 1, 0.5 + ctx.lift0 * 0.5, { opacity: k })
}

/** The photogram's things, laid in a row on "things". World. */
function things(ctx, now) {
  let out = ''
  for (const o of ctx.plan.Pl.things) {
    if (!ctx.vis(o.x - 80, o.x + 80)) continue
    const { k, lift } = lay(now, o.at)
    if (k <= 0) continue
    const l = Math.max(lift, ctx.lift0)
    out += `<g transform="translate(${r(o.x)} ${r(o.y - 8 * lift)}) rotate(${o.rot}) scale(${r(0.9 + 0.06 * lift, 3)})">${print(THINGS[o.name], l, { opacity: k, evenodd: true })}</g>`
  }
  return out
}

/** Rocks laid in the water, with rings going out from them. World. */
function rockGroup(ctx, now, list, calls = []) {
  let out = ''
  for (const o of list) {
    if (!ctx.vis(o.x - o.rx - 200, o.x + o.rx + 200)) continue
    const { k, lift } = lay(now, o.at, 1.0)
    if (k <= 0) continue
    out += rings(o.x, o.y + o.ry * 0.5, o.rx, calls.filter((c) => c >= o.at - 0.05), now)
    out += rock(ctx, o.x, o.y, o.rx, o.ry, o.seed, Math.max(lift, ctx.lift0), k)
  }
  return out
}

/** The red road: along the foot of the plate from "drove", up the first headland and into the trees. World. */
function road(ctx, now) {
  const { T, road: R } = ctx.plan
  if (now < T.drove - 0.1) return ''
  let out = ''
  const head = now < T.road1 ? R.headX(now) : R.turn
  const from = Math.max(R.start, ctx.v - 60)
  const to = Math.min(head, ctx.v + 1660)
  if (to > from) {
    const pts = []
    for (let x = from; x < to; x += 22) pts.push([x, R.roadY(x)])
    pts.push([to, R.roadY(to)])
    out += `<path d="${polyD(pts)}" fill="none" stroke="${RED}" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>`
  }
  if (now > T.road1 - 0.05 && ctx.vis(R.turn - 100, R.turn + 200)) {
    const f = easeInOut(ramp(now, T.road1 - 0.05, T.trees1 + 0.1))
    const part = partOf(R.up1, f)
    out += `<path d="${taper(part, 15, lerp(15, 2.5, f), Math.round(R.up1.length * f) || 1)}" fill="${RED}"/>`
  }
  return out
}

/** The second road, in the last chorus: from under the foot of the plate up into the trees. World. */
function road2(ctx, now) {
  const { T, road: R } = ctx.plan
  if (now < T.road2 - 0.4) return ''
  const f = easeInOut(ramp(now, T.road2 - 0.4, T.trees2 + 0.1))
  const part = partOf(R.up2, f)
  return `<path d="${taper(part, 16, lerp(16, 2.5, f), Math.round(R.up2.length * f) || 1)}" fill="${RED}"/>`
}

/** Ferns standing as trees on a headland, laid one by one. World. */
function trees(ctx, now, list, width = 2.6) {
  let out = ''
  for (const f of list) {
    if (!ctx.vis(f.top[0] - 150, f.top[0] + 150)) continue
    const { k, lift } = lay(now, f.at, 1.0)
    if (k <= 0) continue
    out += `<g${settleAt(f.top[0], f.top[1] + 80, lift)}>${fernPrint(f, width, Math.max(lift, ctx.lift0), k)}</g>`
  }
  return out
}

/** Gulls lifting out of the trees and away (chorus 1). World. */
function gullsAway(ctx, now) {
  let out = ''
  for (const b of ctx.plan.Pl.birds1) {
    const tau = now - b.at
    if (tau <= 0 || tau > 12) continue
    const T0 = 1.1
    const dist = tau - T0 * (1 - Math.exp(-tau / T0))
    const x = b.from[0] + 150 * dist + b.k * 14
    const y = b.from[1] - 8 - 58 * dist + 10 * Math.sin(tau * 1.5 + b.k)
    const flap = Math.sin(tau * 6.5 + b.k * 1.7) * Math.min(1, tau * 2)
    const k = easeOut(ramp(tau, 0, 0.3))
    out += print(gullD(x, y, b.s, flap), 0.55 + ctx.lift0 * 0.5, { opacity: k })
  }
  return out
}

/** Gulls coming back to the trees and settling (last chorus). World. */
function gullsHome(ctx, now) {
  let out = ''
  for (const b of ctx.plan.Pl.birds2) {
    const left = b.at - now
    if (left > 9) continue
    const [px, py] = b.to
    if (left <= 0) {
      const settle = easeOut(clamp01(-left / 0.5))
      out += print(perchedD(px, py - 2, b.s * 0.9), (1 - settle) * 0.5, { opacity: 1 })
      continue
    }
    const T0 = 1.1
    const dist = left - T0 * (1 - Math.exp(-left / T0))
    const x = px + 150 * dist + b.k * 10
    const y = py - 10 - 58 * dist + 8 * Math.sin(left * 1.5 + b.k)
    const flap = Math.sin(left * 6.5 + b.k * 1.7) * Math.min(1, left * 1.4 + 0.2)
    out += print(gullD(x, y, b.s, flap), 0.5, { opacity: easeOut(clamp01((9 - left) / 0.6)) })
  }
  return out
}

/** Two tin cans, and the string pulled taut between them on "today". World. */
function cans(ctx, now) {
  const { T, Pl } = ctx.plan
  const [a, b] = Pl.cans
  if (!ctx.vis(a.x - 100, b.x + 100)) return ''
  const y = 626
  let out = ''
  const mouth = []
  for (const c of [a, b]) {
    const { k, lift } = lay(now, c.at)
    const mx = c.x + c.face * 90
    mouth.push(mx)
    if (k <= 0) continue
    const l = Math.max(lift, ctx.lift0)
    out += `<g transform="translate(${r(c.x)} ${r(y - 8 * lift)}) scale(${c.face * 1.8} 1.8)">${print(CAN_BODY, l, { opacity: k, nss: true })}<path d="${CAN_MOUTH}" fill="${PALE}"${op(0.55 * k)}/><path d="${CAN_RIBS}" fill="none" stroke="${PALE}" stroke-width="1.6"${op(0.5 * k)}/></g>`
  }
  const u = easeInOut(ramp(now, T.today2 - 0.15, T.today2 + 0.7))
  if (u > 0) {
    const sag = 3 + 74 * (1 - easeInOut(ramp(now, T.today2 + 0.5, T.today2 + 1.7)))
    const d = `M${P(mouth[0], y)}Q${P((mouth[0] + mouth[1]) / 2, y + sag * 2)} ${P(mouth[1], y)}`
    out += printLine(d, 2.6, ctx.lift0 + 0.4 * (1 - u), { extra: u < 1 ? ` pathLength="1" stroke-dasharray="${r(u, 3)} 1"` : '' })
  }
  return out
}

/** The paper chain of houses: a folded stack on "things", unfolding house by house on "make". World. */
function chain(ctx, now) {
  const { chain: C } = ctx.plan.Pl
  if (!ctx.vis(C.x - 60, C.x + CHAIN_W * 6 + 60)) return ''
  const { k, lift } = lay(now, C.at)
  if (k <= 0) return ''
  const base = 664
  let out = ''
  let x = C.x
  const parts = []
  for (let j = 0; j < 6; j++) {
    const u = j === 0 ? 1 : easeInOut(ramp(now, C.open - 0.25 + j * 0.24, C.open + 0.5 + j * 0.24))
    if (j > 0 && u <= 0) break
    const w = CHAIN_W * (0.06 + 0.94 * u)
    parts.push({ x, w, u })
    x += w
  }
  // Drawn back to front so each house comes out from under the one before it.
  for (let j = parts.length - 1; j >= 0; j--) {
    const p = parts[j]
    const l = Math.max(lift, ctx.lift0, 0.8 * (1 - p.u))
    out += `<g transform="translate(${r(p.x)} ${r(base - 8 * lift)}) scale(${r(p.w / CHAIN_W, 4)} 1)">${print(CHAIN_HOUSE, l, { opacity: k, evenodd: true, nss: true })}</g>`
  }
  return out
}

/** Three stones lifted out of the water and stacked on the shore, soft while in the air. World. */
function cairn(ctx, now) {
  const { stones, cairn: C } = ctx.plan.Pl
  if (!ctx.vis(stones[0].x - 300, stones[2].x + 300)) return ''
  const stack = []
  let yTop = C.base
  stones.forEach((s, i) => {
    const cy = yTop - s.ry * 0.72
    stack.push([C.x + [0, 5, -3][i], cy])
    yTop = cy - s.ry * 0.82
  })
  let out = ''
  stones.forEach((s, i) => {
    const u = easeInOut(ramp(now, s.at - 0.35, s.at + 0.95))
    const air = Math.sin(Math.PI * u)
    const x = lerp(s.x, stack[i][0], u)
    const y = lerp(s.y, stack[i][1], u) - 150 * air
    const land = easeOut(ramp(now, s.at + 0.95, s.at + 1.6))
    const wet = u < 1 ? 1 : 0
    // While still in the water it is calling: slow rings. When it leaves, one last ring.
    if (u <= 0) out += rings(s.x, s.y + s.ry * 0.5, s.rx, [0, 1, 2, 3, 4, 5, 6, 7, 8].map((n) => s.at - 1.9 - n * 1.7 - i * 0.5), now, 3.2)
    else out += rings(s.x, s.y + s.ry * 0.5, s.rx, [s.at - 0.3], now, 2.2)
    const lift = Math.max(air, ctx.lift0, (1 - land) * 0.4 * (1 - wet))
    out += `<g transform="translate(${r(x)} ${r(y)}) scale(${r(1 + 0.12 * air, 4)}) translate(${r(-x)} ${r(-y)})">${rock(ctx, x, y, s.rx, s.ry, s.seed, lift, 1)}</g>`
  })
  return out
}

/** Small stones laid on the sand. World. */
function pebbles(ctx, now, list) {
  let out = ''
  for (const p of list) {
    if (!ctx.vis(p.x - 40, p.x + 40)) continue
    const { k, lift } = lay(now, p.at)
    if (k > 0) out += rock(ctx, p.x, p.y, p.rx, p.ry, p.seed, Math.max(lift, ctx.lift0), k)
  }
  return out
}

/* ══ THE WASH ══════════════════════════════════════════════════════════ */

function washEdge(plan, now, box) {
  const F = plan.front(now)
  const pts = []
  for (let y = box.y - 20; y <= box.y + box.h + 20; y += 18) pts.push([F + 34 * Math.sin(y / 57 + now * 1.3) + 14 * Math.sin(y / 19 - now * 2.3), y])
  return pts
}

/* ══ THE FRAME ═════════════════════════════════════════════════════════ */

export function cyanotypeFrame({ time, score, lockup = '', uid = 'cy' }) {
  const now = time
  if (score.endCardAt != null && now >= score.endCardAt) return endCard({ now, from: score.endCardAt, lockup })

  const plan = planFor(score, uid)
  const { T, Pl } = plan
  const section = sectionAt(score, now)
  const active = lineAt(score, now)
  const cam = plan.cam(now)
  const v = cam - 800
  const box = boxAt(plan, now)
  const F = plan.front(now)
  const fixedAt = (sx) => (now < plan.washFrom ? 0 : smooth((F - sx) / 260))
  const fixedAll = now >= plan.washTo
  const lift0 = fixedAll ? 0 : RESIDUE * (1 - fixedAt(800))
  const ctx = {
    plan, uid, v, box, fixedAt, lift0,
    vis: (a, b) => b >= v - 80 && a <= v + 1680,
  }
  // Each far/fg thing is culled by its own layer's view.
  const visP = (a, b, p) => b >= p * v - 80 && a <= p * v + 1680

  /* ── The ground ── */
  const expose = easeInOut(ramp(now, 8, 26))
  const ground = mix(COAT, EXPOSED, expose)
  const coat = coatD(box)
  const brushing = now < STROKES[STROKES.length - 1] + 2.6
  const washing = now >= plan.washFrom && !fixedAll
  const edge = washing ? washEdge(plan, now, box) : null
  const washClip = edge ? polyD([[box.x - 60, box.y - 30], ...edge, [box.x - 60, box.y + box.h + 30]], true) : ''

  const defs = [
    `<clipPath id="${uid}-box"><rect x="${r(box.x)}" y="${r(box.y)}" width="${r(box.w)}" height="${r(box.h)}"/></clipPath>`,
    `<clipPath id="${uid}-coat"><path d="${coat}"/></clipPath>`,
    brushing ? `<clipPath id="${uid}-brush"><path d="${brushClip(box, now)}"/></clipPath>` : '',
    washClip ? `<clipPath id="${uid}-wash"><path d="${washClip}"/></clipPath>` : '',
    `<radialGradient id="${uid}-mot"><stop offset="0" stop-color="${PALE}" stop-opacity="0.26"/><stop offset="1" stop-color="${PALE}" stop-opacity="0"/></radialGradient>`,
    `<radialGradient id="${uid}-shade"><stop offset="0" stop-color="${PALE}" stop-opacity="0.34"/><stop offset="1" stop-color="${PALE}" stop-opacity="0"/></radialGradient>`,
  ].join('')

  const groundFill = fixedAll ? BLUE : ground
  let base = `<rect x="${r(box.x)}" y="${r(box.y)}" width="${r(box.w)}" height="${r(box.h)}" fill="${groundFill}"/>`
  if (washing) base += `<rect x="${r(box.x)}" y="${r(box.y)}" width="${r(box.w)}" height="${r(box.h)}" fill="${BLUE}" clip-path="url(#${uid}-wash)"/>`
  base += mottle(uid, box)

  /* ── The sky and the far shore ── */
  const sky = []
  sky.push(sun(ctx, now))
  const hz = easeInOut(ramp(now, 9.6, 11.8))
  if (hz > 0) sky.push(printLine(`M${P(box.x, HZ)}H${r(box.x + box.w * hz)}`, 2, lift0, { opacity: 0.85 }))

  const far = []
  const town1Times = [...HOUSES.map((_, i) => T.hometown - 0.2 + i * 0.13), T.today]
  if (visP(Pl.town1.x - 40, Pl.town1.x + 520, 0.5)) far.push(town(ctx, now, Pl.town1, town1Times))
  const town2Times = [...HOUSES.map((_, i) => Pl.town2.at - 0.25 + i * 0.1), Pl.town2.at + 0.7]
  if (now > Pl.town2.at - 0.4) far.push(town(ctx, now, Pl.town2, town2Times))

  /* ── The shore ── */
  const world = []
  const grains = 0.8 * easeInOut(ramp(now, 23, 27))
  if (grains > 0) world.push(`<g${op(grains)}>${sandIn(plan, v)}</g>`)
  world.push(pebbles(ctx, now, Pl.pebbles1))
  world.push(seaweed(ctx, now))
  world.push(dandelion(ctx, now))
  world.push(things(ctx, now))
  world.push(rockGroup(ctx, now, Pl.rocks1, [T.calling1, T.calling1 + 0.9, T.name1, T.name1 + 0.8, T.name1 + 1.7]))
  world.push(road(ctx, now))
  world.push(trees(ctx, now, plan.trees1))
  world.push(gullsAway(ctx, now))
  world.push(rockGroup(ctx, now, Pl.rocks2, [T.calling2, T.calling2 + 0.9, T.rocksB, T.rocksB + 1.1]))
  for (const s of Pl.streams1) if (ctx.vis(s.x - 60, s.x + 60)) world.push(sift(s, now, lift0))
  world.push(cans(ctx, now))
  world.push(chain(ctx, now))
  world.push(cairn(ctx, now))
  world.push(road2(ctx, now))
  world.push(trees(ctx, now, plan.trees2))
  world.push(gullsHome(ctx, now))
  world.push(rockGroup(ctx, now, Pl.rocks4, [T.calling3]))
  for (const s of Pl.streams2) if (ctx.vis(s.x - 60, s.x + 60)) world.push(sift(s, now, lift0))
  world.push(pebbles(ctx, now, Pl.pebbles2))

  /* ── The foreground ── */
  const fg = []
  for (const g of Pl.greens) {
    if (!visP(g.x - 200, g.x + 200, 1.3)) continue
    const { k, lift } = lay(now, g.at, 1.1)
    if (k <= 0) continue
    const f = fern(g.x, 730, g.h, g.lean, g.seed)
    fg.push(`<g${settleAt(g.x, 730 - g.h / 2, lift)}>${fernPrint(f, 4, Math.max(lift, lift0), k)}</g>`)
  }
  for (const g of [Pl.grass1, Pl.grass2]) {
    if (!visP(g.x - 40, g.x + 400, 1.3)) continue
    const { k, lift } = lay(now, g.at, 1.1)
    if (k > 0) fg.push(`<g${settleAt(g.x + 80, 620, lift)}>${print(grassD(g.x, 716, now, g.x | 0), Math.max(lift, lift0), { opacity: k * 0.92 })}</g>`)
  }

  /* ── Screen-space things over the shore ── */
  const over = []
  for (const at of [T.sea1, T.seaB, T.sea2, T.seaC, T.seaD]) over.push(waveIn(ctx, at, now))
  over.push(cloud(ctx, now))
  over.push(rain(ctx, now))
  if (edge) {
    // The water's leading edge: a bright line, and behind it a sheen that
    // thins back into the deepened blue, with a few ripples carried along.
    const back = (dx, wob = 0) => polyD(edge.map(([x, y]) => [x - dx + wob * Math.sin(y / 31 + now * 3 + dx), y]))
    over.push([[150, 200, 0.07], [90, 120, 0.1], [44, 60, 0.14]].map(([dx, w, o]) => `<path d="${back(dx)}" fill="none" stroke="${PALE}" stroke-width="${w}"${op(o)}/>`).join('')
      + [[40, 1.2, 0.34, 6], [96, 1, 0.24, 10], [170, 0.9, 0.14, 14]].map(([dx, w, o, wob]) => `<path d="${back(dx, wob)}" fill="none" stroke="${WHITE}" stroke-width="${w}"${op(o)}/>`).join('')
      + `<path d="${back(8)}" fill="none" stroke="${WHITE}" stroke-width="7"${op(0.16)}/>`
      + `<path d="${polyD(edge)}" fill="none" stroke="${WHITE}" stroke-width="2.6"${op(0.75)}/>`)
  }

  /* ── The margin ── */
  let margin = ''
  if (section.kind === 'intro') {
    const o = Math.min(easeOut(ramp(now, 0.6, 1.8)), 1 - easeInOut(ramp(now, section.to - 1.0, section.to - 0.2)))
    margin = titleCard({ title: score.title, track: 8, opacity: o })
  }
  else margin = marginLyric({ now, score, uid })

  const tr = (p) => `translate(${r(-p * v, 1)} 0)`
  const plateInner = [
    base,
    sky.join(''),
    `<g transform="${tr(0.5)}">${far.join('')}</g>`,
    sea(ctx, now),
    coast(ctx, now),
    `<g transform="${tr(1)}">${world.join('')}</g>`,
    `<g transform="${tr(1.3)}">${fg.join('')}</g>`,
    over.join(''),
  ].join('\n')

  return {
    svg: [
      paper(),
      `<defs>${defs}</defs>`,
      `<g clip-path="url(#${uid}-box)">`,
      `<rect x="${r(box.x)}" y="${r(box.y)}" width="${r(box.w)}" height="${r(box.h)}" fill="${PAPER}"/>`,
      brushing ? `<g clip-path="url(#${uid}-brush)">` : '',
      `<g clip-path="url(#${uid}-coat)">`,
      plateInner,
      '</g>',
      brushing ? '</g>' : '',
      '</g>',
      margin,
    ].join('\n'),
    label: active?.text ?? section.label,
  }
}

/* For tools: the camera, so a script can measure it for smoothness. */
export const cyanotypeCamera = (score, now) => planFor(score, 'tool').cam(now)
