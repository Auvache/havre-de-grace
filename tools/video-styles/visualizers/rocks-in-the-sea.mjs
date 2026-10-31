/*
 * Rocks in the Sea — five visualizers for a pull, and for staying.
 *
 * Core idea: the rocks in the water calling his name, handled softly and only
 * by metaphor, and the turn on "For the ones that I love, oh I choose to stay"
 * (173.78). Nothing literal: no figure, no water closing over anyone. Every
 * concept has a pull that builds through the first half and peaks in the first
 * chorus, and every one of them turns at that line and ends at home, on the
 * sand, or ashore. The last still of each is the proof.
 */
import { PLATE, CX, INK, PAPER, RED, SECOND_INK } from './sheet.mjs'
import { rng, r, t, ramp, clamp01, lerp, easeOut, easeInOut } from '../../../shared/video/kit.mjs'
import { glide } from '../../../shared/video/album.mjs'

const BLUE = SECOND_INK['rocks-in-the-sea']
const { x: PX, y: PY, w: PW, h: PH } = PLATE
const PR = PX + PW
const PB = PY + PH

/** The turn: "For the ones that I love, oh I choose to stay". */
const STAY = 173.78

const keys = (pairs) => pairs.map(([tt, v]) => ({ t: tt, v }))

/*
 * The pull, 0–1, shared by every concept so they all breathe together: it
 * builds through verse 2 ("drift away", "all this rain", "calling my name"),
 * peaks in the first chorus, eases in the break and verse 3, and after the turn
 * lets go.
 */
const PULL = keys([[0, 0.15], [30, 0.2], [58, 0.3], [80, 0.5], [95, 0.8], [123, 1], [136, 0.85], [152, 0.6], [STAY, 0.6], [STAY + 6, 0.15], [228, 0]])
const pullAt = (time) => glide(time, PULL)

/** A rounded stone: a closed loop through midpoints, radii varied under 15%. */
function stone(cx, cy, rx, ry, seed, tilt = 0) {
  const rand = rng(seed)
  const n = 9
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    const k = 1 + (rand() - 0.5) * 0.24
    const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k * (Math.sin(a) > 0 ? 0.82 : 1)
    return { x: cx + x * Math.cos(tilt) - y * Math.sin(tilt), y: cy + x * Math.sin(tilt) + y * Math.cos(tilt) }
  })
  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
  const m0 = mid(pts[n - 1], pts[0])
  let d = `M${r(m0.x)} ${r(m0.y)}`
  for (let i = 0; i < n; i++) {
    const m = mid(pts[i], pts[(i + 1) % n])
    d += `Q${r(pts[i].x)} ${r(pts[i].y)} ${r(m.x)} ${r(m.y)}`
  }
  return d + 'Z'
}

/* ── A. The cairn ─────────────────────────────────────────────────── */

const CAIRN = { x: 470, base: 742 }
/* Stones in the cairn, bottom up; `at` is when each is set down. The first three are there from the start. */
const CAIRN_STONES = [
  { rx: 118, ry: 40, at: 0, seed: 3 },
  { rx: 94, ry: 34, at: 0, seed: 4 },
  { rx: 76, ry: 30, at: 0, seed: 5 },
  { rx: 62, ry: 26, at: 152.62, seed: 6 }, // I talked to my sister today
  { rx: 50, ry: 22, at: 159.16, seed: 7 }, // the things that we make
  { rx: 40, ry: 19, at: 166.82, seed: 8 }, // I stranded those rocks by the bay
]

function cairn({ time, uid }) {
  const pull = pullAt(time)
  const HZ = 300
  // Waterline: further up the sand as the pull builds; it washes in and out.
  const shore = glide(time, keys([[0, 560], [80, 590], [123, 655], [152, 630], [STAY, 630], [STAY + 10, 548], [228, 535]])) + 9 * Math.sin(time * 0.9)
  let out = ''
  // Sky, with rain that clears after the turn.
  const rain = clamp01(0.25 + pull * 0.75) * (1 - easeInOut(ramp(time, STAY, STAY + 14)))
  out += `<defs><pattern id="${uid}-rain" width="22" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(12)"><line x1="6" y1="0" x2="6" y2="14" stroke="${INK}" stroke-width="1.4"/><line x1="17" y1="17" x2="17" y2="29" stroke="${INK}" stroke-width="1.1"/></pattern></defs>`
  if (rain > 0.02) out += `<rect x="${PX}" y="${PY}" width="${PW}" height="${HZ - PY}" fill="url(#${uid}-rain)" opacity="${r(rain * 0.55, 2)}"/>`
  // The sea: flat blue, wave lines in the paper.
  out += `<rect x="${PX}" y="${HZ}" width="${PW}" height="${r(shore - HZ)}" fill="${BLUE}"/>`
  let waves = ''
  for (let y = HZ + 10, i = 0; y < shore - 6; y += 9 + i * 1.6, i++) {
    const amp = 1.5 + i * 0.5 + pull * 2.5
    let d = `M${PX} ${r(y)}`
    for (let x = PX; x <= PR + 30; x += 30) d += `L${x} ${r(y + amp * Math.sin(x / (40 + i * 6) + time * 0.8 + i))}`
    waves += d
  }
  out += `<path d="${waves}" fill="none" stroke="${PAPER}" stroke-width="1.6" opacity="0.75"/>`
  // The foam edge.
  let foam = `M${PX} ${r(shore)}`
  for (let x = PX; x <= PR + 20; x += 20) foam += `L${x} ${r(shore + 5 * Math.sin(x / 33 + time * 1.7))}`
  out += `<path d="${foam}" fill="none" stroke="${PAPER}" stroke-width="5"/>`
  // The rocks in the water, and their call: rings on the water on the lines that sing it.
  const rocks = [[1200, 352, 34, 62, 11], [1318, 318, 62, 104, 12], [1418, 344, 44, 70, 13], [1500, 370, 30, 34, 14]]
  let rings = ''
  for (const at of [94.66, 116.02, 195.22]) {
    const age = time - at
    if (age < 0 || age > 9) continue
    const soft = at > STAY ? 0.35 : 1
    for (let k = 0; k < 3; k++) {
      const a = age - k * 1.2
      if (a < 0) continue
      const rad = 90 + a * 70
      rings += `<ellipse cx="1330" cy="400" rx="${r(rad)}" ry="${r(rad * 0.22)}" fill="none" stroke="${PAPER}" stroke-width="2.4" opacity="${r(soft * (1 - a / 9), 2)}"/>`
    }
  }
  out += rings
  for (const [x, y, rx, ry, s] of rocks) {
    out += `<path d="${stone(x, y, rx, ry, s)}" fill="${INK}"/>`
    // Surf round the foot of each stack.
    out += `<path d="M${r(x - rx * 1.3)} ${r(y + ry * 0.7)}q${r(rx * 0.65)} ${r(-8 - Math.sin(time * 1.3 + s) * 4)} ${r(rx * 1.3)} 0t${r(rx * 1.3)} 0" fill="none" stroke="${PAPER}" stroke-width="4"/>`
  }
  // Sand stipple.
  const rs = rng(2)
  let dots = ''
  for (let i = 0; i < 260; i++) {
    const x = PX + rs() * PW, y = shore + 14 + rs() ** 1.4 * (PB - shore)
    dots += `M${r(x)} ${r(y)}h1.6`
  }
  out += `<path d="${dots}" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" opacity="0.45"/>`
  // The cairn, set down stone by stone.
  let y = CAIRN.base
  const tops = []
  for (const s of CAIRN_STONES) {
    const land = easeOut(ramp(time, s.at, s.at + 0.6))
    const cy = y - s.ry * 0.8
    tops.push(cy - s.ry * 0.8)
    if (land > 0) out += `<path d="${stone(CAIRN.x + (s.seed % 2 ? 6 : -5), cy - (1 - land) * 60, s.rx, s.ry, s.seed, (s.seed % 3 - 1) * 0.06)}" fill="${INK}" opacity="${r(land, 2)}"/>`
    y = cy - s.ry * 0.72
  }
  // The red stone: on the sand at the water's edge, drawn a little out by the
  // pull, and on "I choose to stay" carried up onto the cairn.
  const atEdge = { x: 1000 + pull * 70, y: Math.min(shore + 6, 700) }
  const top = { x: CAIRN.x, y: y - 22 }
  const lift = easeInOut(ramp(time, STAY, STAY + 2.6))
  const sx = lerp(atEdge.x, top.x, lift)
  const sy = lerp(atEdge.y, top.y, lift) - Math.sin(lift * Math.PI) * 160
  out += `<path d="${stone(sx, sy, 50, 26, 21)}" fill="${RED}"/>`
  // Water washing over its foot while it sits at the edge.
  if (lift < 0.05 && shore > atEdge.y - 12) {
    let wash = `M${r(atEdge.x - 62)} ${r(atEdge.y + 4)}`
    for (let x = atEdge.x - 62; x <= atEdge.x + 62; x += 8) wash += `L${r(x)} ${r(atEdge.y + 6 + 3 * Math.sin(x / 9 + time * 2))}`
    out += `<path d="${wash}" fill="none" stroke="${PAPER}" stroke-width="4"/>`
  }
  return out
}

/* ── B. The tide table ────────────────────────────────────────────── */

/* Heights in metres, at the times they peak and fall: the highest water is "the sand by the rocks in the sea". */
const TIDE = keys([[0, 1.9], [24, 3.1], [44, 1.7], [66, 3.8], [84, 2.3], [97, 5.1], [110, 3.3], [125.5, 5.8], [146, 2.9], [166, 4.5], [STAY, 4.8], [196, 1.3], [214, 0.9], [228.083, 0.8]])

function tideTable({ time, score, uid }) {
  const X0 = 190, X1 = 1500, Y0 = 690, M = 72 // px per metre
  const x = (s) => X0 + (s / score.duration) * (X1 - X0)
  const y = (h) => Y0 - h * M
  let out = ''
  out += t({ x: X0, y: 104, size: 24, text: 'Tide table · the bay', fill: INK, weight: 700, tracking: 3 })
  out += t({ x: X1, y: 104, size: 16, text: 'heights in metres above chart datum', fill: INK, weight: 400, tracking: 2, anchor: 'end', opacity: 0.75 })
  out += `<line x1="${X0}" y1="124" x2="${X1}" y2="124" stroke="${INK}" stroke-width="2"/>`
  for (let m = 0; m <= 7; m++) {
    out += `<line x1="${X0}" y1="${y(m)}" x2="${X1}" y2="${y(m)}" stroke="${INK}" stroke-width="${m === 0 ? 2 : 0.8}" opacity="${m === 0 ? 1 : 0.3}"/>`
    out += t({ x: X0 - 20, y: y(m) + 6, size: 17, text: `${m}`, fill: INK, weight: 500, anchor: 'end' })
  }
  for (let h = 0; h <= 12; h++) {
    const hx = X0 + (h / 12) * (X1 - X0)
    out += `<line x1="${r(hx)}" y1="${y(0)}" x2="${r(hx)}" y2="${y(0) + 10}" stroke="${INK}" stroke-width="1.4"/>`
    out += t({ x: hx, y: y(0) + 38, size: 16, text: `${String((6 + h) % 24).padStart(2, '0')}00`, fill: INK, weight: 500, anchor: 'middle', tracking: 1 })
  }
  // High water springs: the line the tide should not cross.
  out += `<line x1="${X0}" y1="${y(5.5)}" x2="${X1}" y2="${y(5.5)}" stroke="${INK}" stroke-width="1.6" stroke-dasharray="10 7"/>`
  out += t({ x: X1, y: y(5.5) - 12, size: 15, text: 'mean high water springs', fill: INK, weight: 600, tracking: 2, anchor: 'end' })
  // The curve so far, with the water under it hatched in blue.
  const end = Math.min(time, score.duration)
  let d = `M${r(x(0))} ${r(y(glide(0, TIDE)))}`
  for (let s = 1; s <= end; s += 1) d += `L${r(x(s))} ${r(y(glide(s, TIDE)))}`
  d += `L${r(x(end))} ${r(y(glide(end, TIDE)))}`
  out += `<defs><pattern id="${uid}-w" width="7" height="7" patternUnits="userSpaceOnUse"><line x1="3.5" y1="0" x2="3.5" y2="7" stroke="${BLUE}" stroke-width="3.2"/></pattern></defs>`
  out += `<path d="${d}L${r(x(end))} ${y(0)}L${x(0)} ${y(0)}Z" fill="url(#${uid}-w)"/>`
  out += `<path d="${d}" fill="none" stroke="${RED}" stroke-width="3.6" stroke-linejoin="round"/>`
  out += `<circle cx="${r(x(end))}" cy="${r(y(glide(end, TIDE)))}" r="8" fill="${RED}"/>`
  // HW and LW pencilled at every turn of the tide already passed.
  TIDE.forEach((k, i) => {
    if (i === 0 || i === TIDE.length - 1 || k.t > end - 1.5) return
    const high = k.v > TIDE[i - 1].v
    const yy = y(k.v) + (high ? -18 : 32)
    out += t({ x: x(k.t), y: yy, size: 15, text: `${high ? 'HW' : 'LW'} ${k.v.toFixed(1)}`, fill: INK, weight: 700, anchor: 'middle', tracking: 1, extra: `stroke="${PAPER}" stroke-width="6" paint-order="stroke" stroke-linejoin="round"` })
  })
  return out
}

/* ── C. The windscreen ────────────────────────────────────────────── */

const DROPS = (() => {
  const rand = rng(41)
  return Array.from({ length: 340 }, () => ({ x: PX + rand() * PW, y: PY + rand() * PH, rad: 5 + rand() ** 2.2 * 17, at: rand(), j: rand() }))
})()

/* The wipes: one on every line's first word, until the rain stops. */
function windscreen({ time, score, uid }) {
  const pull = pullAt(time)
  const VP = { x: CX, y: 360 }
  let out = ''
  // Behind the glass, all in blue: sky hatch, the two banks of trees, the road.
  out += `<defs><pattern id="${uid}-s" width="8" height="8" patternUnits="userSpaceOnUse"><line x1="0" y1="4" x2="8" y2="4" stroke="${BLUE}" stroke-width="2.2"/></pattern></defs>`
  out += `<rect x="${PX}" y="${PY}" width="${PW}" height="${VP.y - PY + 30}" fill="url(#${uid}-s)" opacity="${r(0.35 + pull * 0.5, 2)}"/>`
  const half = lerp(560, 230, easeInOut(clamp01(pull))) // the road slims down
  out += `<path d="M${VP.x - 3} ${VP.y}L${VP.x + 3} ${VP.y}L${VP.x + half} ${PB}L${VP.x - half} ${PB}Z" fill="${BLUE}"/>`
  // Lane dashes coming at you.
  let dash = ''
  for (let k = 0; k < 9; k++) {
    const u = ((k / 9 + time * 0.07) % 1)
    const v0 = u ** 2.2, v1 = Math.min(1, (u + 0.04) ** 2.2)
    dash += `M${VP.x} ${r(VP.y + v0 * (PB - VP.y))}L${VP.x} ${r(VP.y + v1 * (PB - VP.y))}`
  }
  out += `<path d="${dash}" stroke="${PAPER}" stroke-width="6" opacity="0.85"/>`
  // Trees either side: dark blue spires, closing in as the road narrows.
  const trees = (side) => {
    let d = ''
    for (let k = 0; k < 16; k++) {
      const u = (k + 0.5) / 16
      const s = u ** 1.8
      const base = VP.y + s * (PB - VP.y)
      const x = VP.x + side * (half * s + 40 + s * 220 * (1 - pull * 0.6))
      const j = Math.sin(k * 12.9898 + side * 3.1) * 0.5 + 0.5
      const h = (30 + s * 520) * (0.7 + j * 0.5), w = (10 + s * 120) * (0.8 + j * 0.3)
      d += `M${r(x - w / 2)} ${r(base)}L${r(x)} ${r(base - h)}L${r(x + w / 2)} ${r(base)}Z`
    }
    return d
  }
  const floor = (side) => `M${VP.x + side * 6} ${VP.y}L${r(VP.x + side * half)} ${PB}L${side < 0 ? PX : PR} ${PB}L${side < 0 ? PX : PR} ${VP.y + 2}Z`
  out += `<g fill="${INK}" opacity="0.88"><path d="${floor(-1)}"/><path d="${floor(1)}"/><path d="${trees(-1)}${trees(1)}" fill-rule="nonzero"/></g>`
  // Home: a red light at the end of the road, nearer as the song goes, and a house round it after the turn.
  const near = easeInOut(clamp01(time / score.duration)) * 0.4 + easeInOut(ramp(time, STAY, score.duration)) * 0.6
  const lr = 8 + near * 16
  const house = easeOut(ramp(time, STAY, STAY + 8))
  if (house > 0) {
    const hw = 30 + near * 120, hh = hw * 0.7
    out += `<path d="M${r(VP.x - hw / 2)} ${r(VP.y + 4)}V${r(VP.y + 4 - hh)}L${VP.x} ${r(VP.y + 4 - hh - hw * 0.4)}L${r(VP.x + hw / 2)} ${r(VP.y + 4 - hh)}V${r(VP.y + 4)}Z" fill="${INK}" opacity="${r(house, 2)}"/>`
    out += `<rect x="${r(VP.x - lr * 0.8)}" y="${r(VP.y - hh * 0.55 - lr * 0.8)}" width="${r(lr * 1.6)}" height="${r(lr * 1.6)}" fill="${RED}"/>`
  } else out += `<circle cx="${VP.x}" cy="${VP.y - 6}" r="${r(lr)}" fill="${RED}"/>`
  // Rain on the glass, gathered since the last wipe; none forms after the turn.
  const starts = score.lines.map((l) => l.start).filter((s) => s <= STAY + 8)
  const lastWipe = starts.filter((s) => s + 0.45 <= time).at(-1) ?? 0
  const heavy = 0.35 + pull * 0.65
  let drops = ''
  let shine = ''
  for (const d of DROPS) {
    if (d.at > heavy) continue
    const window = Math.min(time, STAY + 4) - lastWipe
    const born = lastWipe + (d.at / heavy) * 5 // drops gather over ~5 s
    if (time < born || window <= 0 || born > STAY + 4) continue
    drops += `<circle cx="${r(d.x)}" cy="${r(d.y)}" r="${r(d.rad)}"/>`
    shine += `M${r(d.x - d.rad * 0.4)} ${r(d.y - d.rad * 0.5)}a${r(d.rad * 0.5)} ${r(d.rad * 0.5)} 0 0 1 ${r(d.rad * 0.6)} ${r(-d.rad * 0.1)}`
  }
  out += `<g fill="${INK}" fill-opacity="0.6" stroke="${PAPER}" stroke-width="1.8" stroke-opacity="0.85">${drops}</g>`
  out += `<path d="${shine}" fill="none" stroke="${PAPER}" stroke-width="2.6" stroke-linecap="round"/>`
  // The wiper: at rest along the bottom, a sweep up and back on each wipe.
  const sweep = starts.map((s) => ramp(time, s, s + 0.9)).find((u) => u > 0 && u < 1) ?? 0
  const ang = Math.PI * (1 - 0.03 - 0.6 * Math.sin(sweep * Math.PI))
  const piv = { x: PX + 640, y: PB - 6 }
  const L = 820
  const tip = { x: piv.x + L * Math.cos(ang), y: piv.y - L * Math.sin(ang) }
  out += `<line x1="${piv.x}" y1="${piv.y}" x2="${r(tip.x)}" y2="${r(tip.y)}" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>`
  const bx = (tip.x - piv.x) / L, by = (tip.y - piv.y) / L
  out += `<line x1="${r(piv.x + bx * 260)}" y1="${r(piv.y + by * 260 + 10)}" x2="${r(tip.x + bx * 20)}" y2="${r(tip.y + by * 20 + 10)}" stroke="${INK}" stroke-width="18" stroke-linecap="round"/>`
  out += `<circle cx="${piv.x}" cy="${piv.y}" r="16" fill="${INK}"/>`
  return out
}

/* ── D. The road home ─────────────────────────────────────────────── */

const ROAD = [[260, 470], [380, 452], [520, 430], [650, 448], [780, 410], [900, 380], [1010, 400], [1100, 360], [1170, 330], [1220, 318]]
const COAST = (y) => 1270 + 34 * Math.sin(y / 70) + 18 * Math.sin(y / 23 + 1)

const roadPath = (() => {
  // Resample the road densely, with its arc length.
  const pts = []
  for (let i = 0; i < ROAD.length - 1; i++) {
    const [ax, ay] = ROAD[i], [bx, by] = ROAD[i + 1]
    for (let k = 0; k < 20; k++) pts.push({ x: lerp(ax, bx, k / 20), y: lerp(ay, by, k / 20) })
  }
  pts.push({ x: ROAD.at(-1)[0], y: ROAD.at(-1)[1] })
  // Smooth it.
  for (let pass = 0; pass < 3; pass++) for (let i = 1; i < pts.length - 1; i++) pts[i] = { x: (pts[i - 1].x + pts[i].x * 2 + pts[i + 1].x) / 4, y: (pts[i - 1].y + pts[i].y * 2 + pts[i + 1].y) / 4 }
  let len = 0
  pts.forEach((p, i) => { if (i) len += Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y); p.s = len })
  return { pts, len }
})()

const along = (u) => {
  const { pts, len } = roadPath
  const s = u * len
  const i = Math.max(1, pts.findIndex((p) => p.s >= s))
  const a = pts[i - 1], b = pts[i]
  const k = (s - a.s) / Math.max(b.s - a.s, 1e-6)
  return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), nx: -(b.y - a.y), ny: b.x - a.x }
}
const roadD = (u0, u1, off = 0) => {
  let d = ''
  for (let u = u0; u <= u1 + 1e-9; u += 0.004) {
    const p = along(Math.min(u, u1))
    const n = Math.hypot(p.nx, p.ny) || 1
    d += `${d ? 'L' : 'M'}${r(p.x + (p.nx / n) * off)} ${r(p.y + (p.ny / n) * off)}`
  }
  return d
}

const OUT = keys([[0, 0], [30, 0.02], [58, 0.25], [101, 0.62], [127, 0.93], [136, 0.96], [STAY, 0.97]])
const BACK = keys([[STAY, 0.97], [STAY + 4, 0.9], [222, 0.0]])

function roadHome({ time, uid }) {
  let out = ''
  // Sea beyond the coast, cyanotype blue, with the rocks offshore.
  let coast = `M${PR} ${PY}`
  for (let y = PY; y <= PB; y += 10) coast += `L${r(COAST(y))} ${y}`
  coast += `L${PR} ${PB}Z`
  out += `<path d="${coast}" fill="${BLUE}"/>`
  let shoreline = ''
  for (let y = PY; y <= PB; y += 10) shoreline += `${y === PY ? 'M' : 'L'}${r(COAST(y))} ${y}`
  for (let k = 1; k <= 4; k++) out += `<path d="${shoreline}" transform="translate(${k * 14} 0)" fill="none" stroke="${PAPER}" stroke-width="1.2" opacity="${r(0.6 - k * 0.12, 2)}"/>`
  out += `<path d="${shoreline}" fill="none" stroke="${INK}" stroke-width="2.4"/>`
  // Sand along the coast.
  const rs = rng(5)
  let sand = ''
  for (let i = 0; i < 160; i++) { const y = PY + rs() * PH; const x = COAST(y) - 6 - rs() * 40; sand += `M${r(x)} ${r(y)}h1.4` }
  out += `<path d="${sand}" stroke="${INK}" stroke-width="2" stroke-linecap="round" opacity="0.5"/>`
  // The rocks in the sea.
  for (const [x, y, s, seed] of [[1352, 296, 15, 1], [1384, 322, 10, 2], [1338, 340, 8, 3], [1410, 290, 7, 4], [1376, 262, 6, 5]]) out += `<path d="${stone(x, y, s, s * 0.8, seed + 30)}" fill="${INK}"/>`
  // Contours: two low hills either side of the road.
  let contours = ''
  for (const [hx, hy, base, seed] of [[520, 220, 150, 1], [560, 660, 120, 2], [980, 640, 100, 3]]) {
    for (let k = 1; k <= 5; k++) {
      const rad = (base * k) / 5
      let d = ''
      for (let a = 0; a <= 360; a += 12) {
        const q = (a * Math.PI) / 180
        const wob = 1 + 0.12 * Math.sin(q * 3 + seed + k * 0.4)
        d += `${a ? 'L' : 'M'}${r(hx + Math.cos(q) * rad * 1.6 * wob)} ${r(hy + Math.sin(q) * rad * wob)}`
      }
      contours += d + 'Z'
    }
  }
  out += `<path d="${contours}" fill="none" stroke="${INK}" stroke-width="1" opacity="0.28"/>`
  // The forest the road runs into: map tree marks, thickening toward the coast.
  const rt = rng(19)
  let trees = ''
  for (let i = 0; i < 230; i++) {
    const x = 640 + rt() ** 0.7 * 560, y = PY + 40 + rt() * (PH - 80)
    const p = roadPath.pts.reduce((m, q) => Math.min(m, Math.hypot(q.x - x, q.y - y)), 1e9)
    if (p < 26 || x > COAST(y) - 50) continue
    trees += `M${r(x - 6)} ${r(y)}a6 6 0 1 0 12 0a6 6 0 1 0 -12 0M${r(x)} ${r(y + 6)}v7`
  }
  out += `<path d="${trees}" fill="none" stroke="${INK}" stroke-width="1.6" opacity="0.7"/>`
  // Home: a town of small blocks.
  const rb = rng(9)
  let blocks = ''
  for (let i = 0; i < 46; i++) {
    const a = rb() * Math.PI * 2, d = rb() ** 0.6 * 120
    const x = 210 + Math.cos(a) * d * 1.3, y = 470 + Math.sin(a) * d
    blocks += `<rect x="${r(x)}" y="${r(y)}" width="${r(10 + rb() * 14)}" height="${r(8 + rb() * 12)}"/>`
  }
  out += `<g fill="${INK}" opacity="0.85">${blocks}</g>`
  // The road: a double line out of town, a single line, then a dashed track — it slims down.
  out += `<path d="${roadD(0, 0.34, -4)}${roadD(0, 0.34, 4)}" fill="none" stroke="${INK}" stroke-width="2"/>`
  out += `<path d="${roadD(0.34, 0.7)}" fill="none" stroke="${INK}" stroke-width="2.4"/>`
  out += `<path d="${roadD(0.7, 1)}" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="7 7"/>`
  // North arrow and scale bar: the map's furniture.
  out += `<path d="M120 640l14 -50l14 50l-14 -12z" fill="${INK}"/>`
  out += t({ x: 134, y: 678, size: 16, text: 'N', fill: INK, weight: 700, anchor: 'middle' })
  out += `<path d="M200 740h200M200 732v16M300 736v8M400 732v16" stroke="${INK}" stroke-width="2"/>`
  out += t({ x: 300, y: 774, size: 14, text: '0 · 1 · 2 miles', fill: INK, weight: 500, anchor: 'middle', tracking: 2 })
  // The red route: out along the road toward the sea, and on the turn, back the whole way home.
  const outU = glide(time, OUT)
  if (outU > 0.003) out += `<path d="${roadD(0, outU)}" fill="none" stroke="${RED}" stroke-width="4" stroke-linecap="round"/>`
  let head = along(outU)
  if (time > STAY) {
    const backU = glide(time, BACK)
    // The return runs alongside, offset, so the hairpin at the coast shows.
    out += `<path d="${roadD(backU, 0.97, 12)}" fill="none" stroke="${RED}" stroke-width="4" stroke-linecap="round"/>`
    out += `<path d="${roadD(0.965, 0.97, 0)}" fill="none"/>`
    const p = along(backU)
    const n = Math.hypot(p.nx, p.ny) || 1
    head = { x: p.x + (p.nx / n) * 12, y: p.y + (p.ny / n) * 12 }
  }
  out += `<circle cx="${r(head.x)}" cy="${r(head.y)}" r="9" fill="${RED}"/>`
  void uid
  return out
}

/* ── E. Undertow ──────────────────────────────────────────────────── */

const ROCKS_AT = { x: 1330, y: 420 }
const SHORE_X = (y) => 210 + 28 * Math.sin(y / 60) + 12 * Math.sin(y / 17)

/*
 * The current, as a direction at a point: toward the rocks by the pull, and,
 * once he has chosen, toward the shore. Slack (a slow swirl) in between.
 */
function flow(x, y, time) {
  const p = pullAt(time)
  const home = easeInOut(ramp(time, STAY, STAY + 8))
  const dx = ROCKS_AT.x - x, dy = ROCKS_AT.y - y
  const dr = Math.hypot(dx, dy) || 1
  const near = clamp01((dr - 150) / 160) // the current runs past the rocks, never into them
  let vx = (dx / dr) * p * near + (-dy / dr) * p * (1 - near)
  let vy = (dy / dr) * p * near + (dx / dr) * p * (1 - near)
  vx = lerp(vx, -1, home)
  vy = lerp(vy, (CY_E - y) / 900, home)
  vx += 0.18 * Math.sin(y / 90 + time * 0.2)
  vy += 0.18 * Math.cos(x / 110 - time * 0.15)
  const n = Math.hypot(vx, vy) || 1
  return { vx: vx / n, vy: vy / n, speed: 0.2 + Math.max(p, home) }
}
const CY_E = PY + PH / 2

/* The red float's drift, integrated once from the start at 10 steps a second. */
const FLOAT = (() => {
  const pts = [{ x: 380, y: 560 }]
  for (let s = 0.1; s <= 229; s += 0.1) {
    const p = pts.at(-1)
    const f = flow(p.x, p.y, s)
    const v = f.speed * (s > STAY ? 28 : 8.5)
    let x = p.x + f.vx * v * 0.1, y = p.y + f.vy * v * 0.1
    x = Math.max(SHORE_X(y) + 26, Math.min(x, PR - 40))
    y = Math.max(PY + 40, Math.min(y, PB - 40))
    pts.push({ x, y })
  }
  return pts
})()
const floatAt = (time) => FLOAT[Math.max(0, Math.min(FLOAT.length - 1, Math.round(time * 10)))]

function undertow({ time, uid }) {
  let out = `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${BLUE}"/>`
  // Streamlines in the paper, dashed so they run.
  const rand = rng(64)
  let lines = ''
  for (let i = 0; i < 64; i++) {
    let x = PX + 220 + rand() * (PW - 240), y = PY + 20 + rand() * (PH - 40)
    let d = `M${Math.round(x)} ${Math.round(y)}`
    for (let k = 0; k < 26; k++) {
      const f = flow(x, y, time)
      x += f.vx * 15; y += f.vy * 15
      if (x < SHORE_X(y) + 6) break
      d += `L${Math.round(x)} ${Math.round(y)}`
    }
    lines += d
  }
  const speed = 0.2 + Math.max(pullAt(time), easeInOut(ramp(time, STAY, STAY + 8)))
  out += `<path d="${lines}" fill="none" stroke="${PAPER}" stroke-width="2" stroke-linecap="round" stroke-dasharray="26 16" stroke-dashoffset="${r(-time * 34 * speed)}" opacity="0.85"/>`
  // The shore at the left, paper and stipple.
  let shore = `M${PX} ${PY}`
  for (let y = PY; y <= PB; y += 8) shore += `L${r(SHORE_X(y))} ${y}`
  shore += `L${PX} ${PB}Z`
  out += `<path d="${shore}" fill="${PAPER}"/>`
  const rs = rng(3)
  let dots = ''
  for (let i = 0; i < 140; i++) { const y = PY + rs() * PH; const x = PX + rs() * (SHORE_X(y) - PX - 8); dots += `M${r(x)} ${r(y)}h1.4` }
  out += `<path d="${dots}" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" opacity="0.45"/>`
  let edge = ''
  for (let y = PY; y <= PB; y += 8) edge += `${y === PY ? 'M' : 'L'}${r(SHORE_X(y))} ${y}`
  out += `<path d="${edge}" fill="none" stroke="${INK}" stroke-width="2.4"/>`
  // The rocks.
  for (const [dx, dy, rx, ry, s] of [[0, 0, 82, 58, 1], [96, 52, 54, 40, 2], [-70, 70, 44, 32, 3], [40, -84, 36, 28, 4]]) out += `<path d="${stone(ROCKS_AT.x + dx, ROCKS_AT.y + dy, rx, ry, s + 50)}" fill="${INK}"/>`
  // The red float and the way it has come.
  let trail = ''
  for (let s = 0; s <= time; s += 0.5) { const p = floatAt(s); trail += `${trail ? 'L' : 'M'}${r(p.x)} ${r(p.y)}` }
  out += `<path d="${trail}" fill="none" stroke="${RED}" stroke-width="4" stroke-dasharray="3 9" stroke-linecap="round"/>`
  const p = floatAt(time)
  out += `<circle cx="${r(p.x)}" cy="${r(p.y)}" r="13" fill="${RED}" stroke="${PAPER}" stroke-width="3"/>`
  void uid
  return out
}

export const CONCEPTS = [
  {
    id: 'cairn',
    name: 'The Cairn',
    lyric: 'I stranded those rocks by the bay',
    idea: 'A beach with the rocks out in the sea and a small cairn on the sand. One red stone sits at the water’s edge. The tide is the pull, and the cairn is the people he stays for.',
    motion: 'The tide creeps up the sand through verse 2 and the first chorus and washes over the red stone’s foot. When the rocks "call my name", rings spread across the water from them. In verse 3 a stone is set on the cairn for each line: his sister, the things they make, the rocks by the bay. On "I choose to stay" the red stone is lifted onto the top. Then the tide goes out and the rain stops.',
    red: 'One stone: at the water’s edge for most of the song, and at the top of the cairn at the end.',
    stills: [45.5, 97, 168, 200],
    frame: cairn,
  },
  {
    id: 'tide-table',
    name: 'Tide Table',
    lyric: 'And the rocks in the water have been calling my name',
    idea: 'A printed tide chart for the bay: heights in metres, the hours across the bottom, the high-water mark as a dashed line. The red curve is the pull, drawn as a tide.',
    motion: 'The curve writes itself across the chart for the whole song, with the water under it hatched in blue. Each tide is higher than the last, and the highest goes over the high-water line on "the sand by the rocks in the sea". It turns on "I choose to stay" and falls to the lowest water of the day as the song ends. HW and LW are pencilled in at each turn as it passes.',
    red: 'The tide line and the pen drawing it.',
    stills: [52, 98, 126, 206],
    frame: tideTable,
  },
  {
    id: 'windscreen',
    name: 'Windscreen',
    lyric: "I can't seem to shake all this rain",
    idea: 'The view through a rainy windscreen down a road between trees. Rain gathers on the glass, the wiper clears it on every line, and the rain comes back. Far down the road is one small red light.',
    motion: 'The road narrows and the trees close in as the pull builds ("the road slims down"). Lane dashes stream toward you the whole time. The wiper sweeps on each sung line. After "I choose to stay" no more rain forms, and the red light grows into the lit window of a house at the end of the road.',
    red: 'The light of home at the end of the road.',
    stills: [31, 90.5, 120, 205],
    frame: windscreen,
  },
  {
    id: 'road-home',
    name: 'The Road Home',
    lyric: 'When the road slims down and the trees hide the sound',
    idea: 'A map in Andalusia’s manner: a hometown, a road out through the woods, the coast, and the rocks offshore. The road is a double line, then a single line, then a dashed track, so it slims down on the paper as it gets to the sea.',
    motion: 'A red route drives out of town and into the trees through the verses, and reaches the coast in the first chorus. It waits there through the break. On "I choose to stay" it turns, and it runs the whole road back home alongside its own track, arriving as the song ends.',
    red: 'The route: out to the coast, and the hairpin back.',
    stills: [45.5, 104, 165, 218],
    frame: roadHome,
  },
  {
    id: 'undertow',
    name: 'Undertow',
    lyric: "I'll leave all my things and just drift away",
    idea: 'A cyanotype current chart: the bay in solid blue, the current as running white lines, the rocks in black at the right and the sand at the left. One red float is carried on the water.',
    motion: 'The current lines run, and they strengthen and bend toward the rocks as the pull builds. The float drifts out with them and its dotted track trails behind it. On "I choose to stay" the whole field turns and runs toward the shore, and the float comes back and rests against the sand.',
    red: 'The float, and the dotted line of where it has drifted.',
    stills: [52, 98, 128, 214],
    frame: undertow,
  },
]
