/*
 * Conman — five visualizers. The core idea is stealing: a thing that was yours
 * is quietly becoming his, and he never changes while he does it.
 *
 * Red is the thief every time: the copying pen, the red-ink column, the lightning
 * going into the bottle, the matching line between prints, the one who follows.
 */
import { PLATE, CX, CY, INK, PAPER, RED, PAPER_SHADE, SECOND_INK } from './sheet.mjs'
import { rng, r, clamp01, lerp, ramp, easeOut, easeInOut, decay } from '../../../shared/video/kit.mjs'
import { glide, land } from '../../../shared/video/album.mjs'

const GREEN = SECOND_INK.conman
const { x: PX, y: PY, w: PW, h: PH } = PLATE
const PR = PX + PW
const PB = PY + PH

const allWords = (score) => score.lines.flatMap((l) => l.words.map((w) => ({ ...w, line: l.index })))

/** A row of type (plain, not the lyric's caps). */
const txt = (x, y, size, text, o = {}) =>
  `<text x="${r(x)}" y="${r(y)}" font-size="${r(size)}" font-weight="${o.weight ?? 500}" fill="${o.fill ?? INK}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.spacing != null ? ` letter-spacing="${o.spacing}"` : ''}${o.opacity != null ? ` opacity="${r(o.opacity, 3)}"` : ''}${o.italic ? ' font-style="italic"' : ''}${o.extra ?? ''}>${String(o.upper ? text.toUpperCase() : text).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`

const poly = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${r(p[0])} ${r(p[1])}`).join('')

/** Quadratics through midpoints — a sampled outline that reads as drawn, not plotted. */
function smooth(pts, closed = false) {
  if (pts.length < 3) return poly(pts)
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  if (closed) {
    let d = `M${r(mid(pts.at(-1), pts[0])[0])} ${r(mid(pts.at(-1), pts[0])[1])}`
    for (let i = 0; i < pts.length; i++) {
      const m = mid(pts[i], pts[(i + 1) % pts.length])
      d += `Q${r(pts[i][0])} ${r(pts[i][1])} ${r(m[0])} ${r(m[1])}`
    }
    return d + 'Z'
  }
  let d = `M${r(pts[0][0])} ${r(pts[0][1])}`
  for (let i = 1; i < pts.length - 1; i++) {
    const m = mid(pts[i], pts[i + 1])
    d += `Q${r(pts[i][0])} ${r(pts[i][1])} ${r(m[0])} ${r(m[1])}`
  }
  return d + `L${r(pts.at(-1)[0])} ${r(pts.at(-1)[1])}`
}

/** Horizontal engraving lines as a pattern. */
const hatch = (id, { gap = 6, w = 1.4, color = INK, angle = 0 } = {}) =>
  `<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse"${angle ? ` patternTransform="rotate(${angle})"` : ''}><rect width="${gap}" height="${w}" fill="${color}"/></pattern>`

/* ── A. Cooked Books ──────────────────────────────────────────────── */

const LEDGER_ITEMS = [
  'One shake', 'Rhythms, est. 1968', 'Lightning, bottled', 'Clouds, sea & smoke',
  'One look', 'A killing', 'The Earth, shaken', 'A search',
  'Same as ever', 'Same as ever',
  'Your sound', 'Shadows', 'A stare', 'Your unawareness',
  'Same as ever', 'Same as ever',
  'One move', 'A groove', 'Damages', 'All the eyes',
  'Same as ever', 'Same as ever', 'Same as ever', 'Same as ever',
]
const isSame = (i) => LEDGER_ITEMS[i] === 'Same as ever'
const money = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
function ledgerAmounts(n) {
  const rand = rng(1968)
  return Array.from({ length: n }, (_, i) => (isSame(i) ? 1968 : Math.round((120 + rand() * 4800) * 100) / 100))
}

function cookedBooks({ time, score, uid }) {
  const lines = score.lines
  const amounts = ledgerAmounts(lines.length)
  const ROW = 64
  const HEAD = PY + 84
  const FOOT = PB - 82
  const COLS = { no: PX + 40, item: PX + 190, yours: PX + 1040, mine: PR - 40 }
  const RULES = [PX + 150, PX + 760, PX + 1090]
  // The page climbs a row per line, gliding from each line to the next, so it never stops.
  const keys = [{ t: 0, v: -1.5 }, ...lines.map((l) => ({ t: l.start, v: l.index })), { t: score.duration, v: lines.length - 1 }]
  const at = glide(time, keys)
  const scroll = Math.max(0, (at + 0.5) * ROW - (FOOT - 1.7 * ROW - HEAD))
  const rowY = (i) => HEAD + (i + 0.5) * ROW - scroll

  let ruling = ''
  for (let i = -1; i < lines.length + 6; i++) {
    const y = rowY(i) + ROW / 2
    if (y < HEAD - 2 || y > FOOT + ROW) continue
    ruling += `M${PX} ${r(y)}H${PR}`
  }
  let rows = ''
  let carried = 0
  for (const l of lines) {
    const y = rowY(l.index)
    const strike = ramp(time, l.end, l.end + 0.45)
    carried += amounts[l.index] * easeOut(strike)
    if (y < HEAD - ROW || y > FOOT + ROW) continue
    const written = ramp(time, l.start - 0.1, l.end)
    if (written <= 0) continue
    const item = LEDGER_ITEMS[l.index] ?? 'Sundries'
    const clip = `${uid}-w${l.index}`
    const wide = 560 * easeInOut(written)
    rows += `<clipPath id="${clip}"><rect x="${COLS.item - 6}" y="${r(y - ROW / 2)}" width="${r(wide)}" height="${ROW}"/></clipPath>`
    rows += txt(COLS.no, y + 10, 22, String(l.index + 1).padStart(2, '0'), { fill: GREEN, weight: 500, opacity: land(time, l.start) })
    rows += `<g clip-path="url(#${clip})">${txt(COLS.item, y + 11, 34, item, { weight: 400, italic: true })}</g>`
    const yours = land(time, l.words[0].t, 0.3)
    rows += txt(COLS.yours, y + 11, 34, money(amounts[l.index]), { anchor: 'end', weight: 400, opacity: yours })
    if (strike > 0) {
      const w = advanceFig(money(amounts[l.index])) * 34
      rows += `<path d="M${r(COLS.yours - w - 6)} ${r(y + 1)}H${r(COLS.yours - w - 6 + (w + 12) * easeOut(strike))}" stroke="${RED}" stroke-width="3.2" stroke-linecap="round"/>`
      rows += txt(COLS.mine, y + 11, 34, money(amounts[l.index]), { anchor: 'end', fill: RED, weight: 500, opacity: land(time, l.end + 0.25, 0.3) })
    }
  }
  const total = money(Math.round(carried * 100) / 100)
  const headRule = `M${PX} ${HEAD - 4}H${PR}M${PX} ${HEAD}H${PR}`
  const footRule = `M${PX} ${FOOT}H${PR}M${PX} ${FOOT + 4}H${PR}`
  const pulse = lines.reduce((m, l) => Math.max(m, decay(time, l.end + 0.25, 0.4)), 0)
  return `<defs><clipPath id="${uid}-body"><rect x="${PX}" y="${HEAD + 2}" width="${PW}" height="${FOOT - HEAD - 2}"/></clipPath></defs>
  <rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>
  <g clip-path="url(#${uid}-body)">
    <path d="${ruling}" stroke="${GREEN}" stroke-width="1.2" opacity="0.55"/>
    ${rows}
  </g>
  <path d="${RULES.map((x) => `M${x} ${PY}V${PB}`).join('')}" stroke="${GREEN}" stroke-width="1.4" opacity="0.8"/>
  <path d="M${RULES[2] + 5} ${PY}V${PB}" stroke="${GREEN}" stroke-width="1.4" opacity="0.8"/>
  <path d="${headRule}${footRule}" stroke="${INK}" stroke-width="1.6"/>
  ${txt(COLS.no, HEAD - 26, 17, 'No.', { fill: GREEN, spacing: 2, upper: true, weight: 600 })}
  ${txt(COLS.item, HEAD - 26, 17, 'Particulars', { fill: GREEN, spacing: 3, upper: true, weight: 600 })}
  ${txt(COLS.yours, HEAD - 26, 17, 'Yours', { fill: GREEN, spacing: 3, upper: true, weight: 600, anchor: 'end' })}
  ${txt(COLS.mine, HEAD - 26, 17, 'Mine', { fill: GREEN, spacing: 3, upper: true, weight: 600, anchor: 'end' })}
  ${txt(COLS.item, FOOT + 52, 22, 'Balance carried forward', { fill: GREEN, spacing: 3, upper: true, weight: 600 })}
  ${txt(COLS.mine, FOOT + 54, 36 + 4 * pulse, total, { anchor: 'end', fill: RED, weight: 600 })}`
}

/** Jost figures and separators are close to monospaced at about 0.56 em. */
const advanceFig = (s) => [...s].reduce((n, ch) => n + (/[0-9]/.test(ch) ? 0.56 : 0.26), 0)

/* ── B. The Pantograph ────────────────────────────────────────────── */

const BARS = 150

function soundBars(score) {
  const rand = rng(87)
  const words = allWords(score)
  const level = { intro: 0.35, verse: 0.62, chorus: 0.95, break: 0.5, outro: 0.3 }
  return Array.from({ length: BARS }, (_, j) => {
    const at = ((j + 0.5) / BARS) * score.duration
    const half = score.duration / BARS
    const near = words.filter((w) => Math.abs(w.t - at) < half * 1.2).length
    const section = score.sections.find((s) => at >= s.from && at < s.to)
    const base = level[section?.kind] ?? 0.5
    return clamp01(base * (0.55 + 0.45 * Math.min(near / 4, 1)) * (0.72 + 0.28 * rand()) + 0.04)
  })
}

function pantograph({ time, score, uid }) {
  const bars = soundBars(score)
  const RAIL = PB - 22 // the carriage runs along the foot of the plate
  const K = 6
  const C = 80 // the carriage stands this far behind the stylus
  const X0 = PX + 96
  const X1 = PX + 1010
  const BASE = PB - 76
  const AMP = 34
  const dx = (X1 - X0) / BARS
  // The trace, two points a bar, visited at an even pace across the song.
  const pts = []
  bars.forEach((h, j) => {
    const x = X0 + (j + 0.5) * dx
    pts.push([x - dx / 4, BASE - h * AMP], [x + dx / 4, BASE + h * AMP])
  })
  const f = clamp01(time / score.duration) * (pts.length - 1)
  const i = Math.floor(f)
  const P = i >= pts.length - 1 ? pts.at(-1) : [lerp(pts[i][0], pts[i + 1][0], f - i), lerp(pts[i][1], pts[i + 1][1], f - i)]
  const O = [P[0] - C, RAIL]
  // The carriage moves with the stylus, so a copied point is the stylus point
  // carried (K − 1)·C to the right and scaled K times up from the rail.
  const copyOf = ([x, y]) => [x + (K - 1) * C, RAIL + K * (y - RAIL)]
  const Q = copyOf(P)
  // The knee: arms of length L from O and from Q, bending up.
  const L = 360
  const mx = (O[0] + Q[0]) / 2
  const my = (O[1] + Q[1]) / 2
  const dX = Q[0] - O[0]
  const dY = Q[1] - O[1]
  const d = Math.hypot(dX, dY)
  const hgt = Math.sqrt(Math.max(L * L - (d / 2) ** 2, 0))
  let nx = -dY / d
  let ny = dX / d
  if (ny > 0) { nx = -nx; ny = -ny }
  const A = [mx + nx * hgt, my + ny * hgt]
  const Cj = [O[0] + (A[0] - O[0]) / K, O[1] + (A[1] - O[1]) / K]
  const D = [A[0] + (Q[0] - A[0]) / K, A[1] + (Q[1] - A[1]) / K]

  const done = pts.slice(0, i + 1).concat([P])
  const ahead = [P].concat(pts.slice(i + 1))
  const copy = done.map(copyOf)
  const bar = (a, b, w) => `<path d="M${r(a[0])} ${r(a[1])}L${r(b[0])} ${r(b[1])}" stroke="${INK}" stroke-width="${w}" stroke-linecap="round"/><path d="M${r(a[0])} ${r(a[1])}L${r(b[0])} ${r(b[1])}" stroke="${PAPER}" stroke-width="${w - 5}" stroke-linecap="round"/>`
  const joint = (p, rad = 7) => `<circle cx="${r(p[0])}" cy="${r(p[1])}" r="${rad}" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/>`
  // The copy's own guide: faint green rules at the scaled baseline, a ruled sheet.
  const copyBase = RAIL + K * (BASE - RAIL)
  const sheetL = X0 + (K - 1) * C - 30
  const sheetR = X1 + (K - 1) * C + 30
  let guide = ''
  for (let k = -4; k <= 4; k++) guide += `M${r(sheetL)} ${r(copyBase + k * 56)}H${r(sheetR)}`
  return `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>
  <path d="${guide}" stroke="${GREEN}" stroke-width="1.1" opacity="0.45"/>
  ${txt(sheetL, copyBase - 4 * 56 - 16, 16, 'Copy', { fill: GREEN, spacing: 4, upper: true, weight: 600 })}
  ${txt(X0 - 4, BASE - AMP - 18, 16, 'Original', { fill: GREEN, spacing: 4, upper: true, weight: 600 })}
  <path d="${poly(ahead)}" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="${poly(done)}" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round" opacity="0.18"/>
  <path d="${poly(copy)}" fill="none" stroke="${RED}" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M${PX} ${RAIL + 6}H${PR}M${PX} ${RAIL + 11}H${PR}" stroke="${INK}" stroke-width="1.6"/>
  <rect x="${r(O[0] - 26)}" y="${RAIL - 6}" width="52" height="14" fill="${INK}"/>
  ${bar(O, A, 11)}${bar(A, Q, 11)}${bar(Cj, P, 9)}${bar(P, D, 9)}
  ${joint(O, 9)}${joint(A)}${joint(Cj, 6)}${joint(D, 6)}
  <circle cx="${r(P[0])}" cy="${r(P[1])}" r="6" fill="${INK}"/>
  <circle cx="${r(Q[0])}" cy="${r(Q[1])}" r="11" fill="${RED}"/>`
}

/* ── C. Bottled Lightning ─────────────────────────────────────────── */

const BOTTLE = { x: CX, top: 176, neckW: 88, bodyW: 380, shoulder: 360, base: 752, cork: 128 }

function bottleOutline() {
  const { x, top, neckW, bodyW, shoulder, base } = BOTTLE
  const n = neckW / 2
  const b = bodyW / 2
  return `M${x - n} ${top}L${x - n} ${shoulder - 70}C${x - n} ${shoulder - 20} ${x - b} ${shoulder - 30} ${x - b} ${shoulder + 40}L${x - b} ${base - 24}Q${x - b} ${base} ${x - b + 24} ${base}L${x + b - 24} ${base}Q${x + b} ${base} ${x + b} ${base - 24}L${x + b} ${shoulder + 40}C${x + b} ${shoulder - 30} ${x + n} ${shoulder - 20} ${x + n} ${shoulder - 70}L${x + n} ${top}Z`
}

function bolt(seed, from, to, jag = 38, steps = 9) {
  const rand = rng(seed)
  const pts = [from]
  for (let k = 1; k < steps; k++) {
    const u = k / steps
    pts.push([lerp(from[0], to[0], u) + (rand() - 0.5) * jag * 2, lerp(from[1], to[1], u) + (rand() - 0.5) * jag * 0.4])
  }
  pts.push(to)
  return pts
}

function cloudBlob(cx, cy, s, seed) {
  const rand = rng(seed)
  let d = ''
  const lobes = 5
  for (let k = 0; k < lobes; k++) {
    const x = cx + (k - (lobes - 1) / 2) * 62 * s + (rand() - 0.5) * 20 * s
    const y = cy - Math.sin((k / (lobes - 1)) * Math.PI) * 34 * s + (rand() - 0.5) * 10 * s
    const rad = (44 + rand() * 26) * s
    d += `M${r(x - rad)} ${r(y)}a${r(rad)} ${r(rad * 0.82)} 0 1 0 ${r(rad * 2)} 0a${r(rad)} ${r(rad * 0.82)} 0 1 0 ${r(-rad * 2)} 0`
  }
  d += `M${r(cx - 170 * s)} ${r(cy + 6)}h${r(340 * s)}v${r(30 * s)}h${r(-340 * s)}z`
  return d
}

function bottledLightning({ time, score, uid }) {
  const lines = score.lines
  const progress = clamp01(time / score.duration)
  const { x, top, cork, base, bodyW, shoulder } = BOTTLE
  // Clouds drift and thin out: the sky is cleared as the lightning is taken from it.
  const CLOUDS = [
    [260, 150, 1.15], [620, 110, 0.9], [1060, 140, 1.2], [1380, 200, 0.95], [420, 300, 0.8],
    [1220, 330, 0.85], [160, 420, 0.75], [1450, 470, 0.7], [900, 70, 0.8],
  ]
  let clouds = ''
  CLOUDS.forEach(([cx, cy, s], k) => {
    const leaves = 1 - easeInOut(ramp(progress, 0.15 + k * 0.08, 0.27 + k * 0.08))
    if (leaves <= 0.01) return
    const drift = ((cx + time * (6 + (k % 3) * 3)) % (PW + 500)) - 250 + PX
    clouds += `<path d="${cloudBlob(drift, cy + PY, s, k + 3)}" fill="url(#${uid}-hz)" opacity="${r(leaves, 3)}"/>`
  })
  // Each line is one strike; it comes down and goes in at the neck.
  const mouth = [x, cork - 4]
  let strikes = ''
  let stored = ''
  const sx = (i) => PX + 120 + rng(i + 50)() * (PW - 240)
  for (const l of lines) {
    const at = l.start
    if (time < at) continue
    const life = time - at
    if (life < 0.9) {
      const pts = bolt(l.index + 11, [sx(l.index), PY], mouth, 60, 7)
      const on = life < 0.12 ? life / 0.12 : 1 - easeInOut(ramp(life, 0.35, 0.9))
      strikes += `<path d="${poly(pts)}" fill="none" stroke="${RED}" stroke-width="${r(7 - life * 4)}" stroke-linejoin="miter" opacity="${r(on, 3)}"/>`
    }
    // Inside, a small bolt that stays — the bottle fills line by line.
    const rand = rng(l.index * 7 + 1)
    const bx = x + (rand() - 0.5) * (bodyW - 80)
    const by = shoulder + 60 + rand() * (base - shoulder - 110)
    const len = 56 + rand() * 50
    const ang = Math.PI / 2 + (rand() - 0.5) * 1.6
    const p0 = [bx - Math.cos(ang) * len / 2, by - Math.sin(ang) * len / 2]
    const p1 = [bx + Math.cos(ang) * len / 2, by + Math.sin(ang) * len / 2]
    const flick = 0.75 + 0.25 * Math.sin(time * 7 + l.index * 1.7)
    stored += `<path d="${poly(bolt(l.index + 300, p0, p1, 16, 4))}" fill="none" stroke="${RED}" stroke-width="4.2" stroke-linejoin="bevel" opacity="${r(easeOut(ramp(life, 0.3, 0.7)) * flick, 3)}"/>`
  }
  // The sea, engraved; the bottle stands in it.
  let sea = ''
  for (let k = 0; k < 11; k++) {
    const y = base - 30 + k * 9
    let d = `M${PX} ${y}`
    for (let s = 0; s <= 16; s++) d += `L${r(PX + (PW * s) / 16)} ${r(y + Math.sin(s * 1.3 + k + time * 0.8) * 2.2)}`
    sea += d
  }
  const glass = bottleOutline()
  return `<defs>
    ${hatch(`${uid}-hz`, { gap: 7, w: 2, color: GREEN })}
    ${hatch(`${uid}-gl`, { gap: 7, w: 1.6, color: INK, angle: 90 })}
    <clipPath id="${uid}-bt"><path d="${glass}"/></clipPath>
  </defs>
  <rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>
  ${clouds}
  ${strikes}
  <path d="${glass}" fill="${PAPER}"/>
  <g clip-path="url(#${uid}-bt)">
    <rect x="${x - bodyW / 2}" y="${top}" width="46" height="${base - top}" fill="url(#${uid}-gl)" opacity="0.8"/>
    <rect x="${x + bodyW / 2 - 30}" y="${top}" width="30" height="${base - top}" fill="url(#${uid}-gl)" opacity="0.5"/>
    ${stored}
  </g>
  <path d="${glass}" fill="none" stroke="${INK}" stroke-width="4.4"/>
  <path d="M${x - bodyW / 2 + 70} ${shoulder + 40}V${base - 40}" stroke="${INK}" stroke-width="1.4" opacity="0.5"/>
  <path d="M${x - BOTTLE.neckW / 2 - 8} ${top + 2}h${BOTTLE.neckW + 16}" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
  <path d="M${x - 30} ${cork}h60l-5 ${top - cork}h-50z" fill="url(#${uid}-gl)" stroke="${INK}" stroke-width="2.4"/>
  <rect x="${PX}" y="${base - 22}" width="${PW}" height="${PB - base + 22}" fill="${PAPER}" opacity="0.6"/>
  <path d="${sea}" fill="none" stroke="${GREEN}" stroke-width="1.8"/>`
}

/* ── D. The Same Print ────────────────────────────────────────────── */

function printPath() {
  // A whorl: wobbling loops round a core, broken where ridges end, and the
  // looser arches underneath. Drawn once, pressed ten times.
  const rand = rng(1968)
  let d = ''
  const core = [0, -18]
  for (let k = 0; k < 19; k++) {
    const rx = 9 + k * 7.2
    const ry = 12 + k * 8.4
    const twist = k * 0.22
    const gapAt = rand() * Math.PI * 2
    const gap = k > 3 && rand() < 0.6 ? 0.35 + rand() * 0.3 : 0
    const pts = []
    const N = 26 + k * 2
    for (let s = 0; s <= N; s++) {
      const a = gapAt + gap / 2 + (s / N) * (Math.PI * 2 - gap)
      const wob = 1 + 0.045 * Math.sin(a * 3 + k) + 0.03 * Math.sin(a * 5 - k * 0.7)
      pts.push([core[0] + Math.cos(a + twist * 0.1) * rx * wob, core[1] + Math.sin(a) * ry * wob - (Math.sin(a) > 0 ? 0 : k * 0.6)])
    }
    d += smooth(pts)
  }
  for (let k = 0; k < 9; k++) {
    const y = 118 + k * 8.5
    const pts = []
    for (let s = 0; s <= 14; s++) {
      const u = s / 14
      pts.push([-130 + u * 260, y - Math.sin(u * Math.PI) * (26 - k * 1.6) + Math.sin(u * 9 + k) * 1.5])
    }
    d += smooth(pts)
  }
  return d
}
const MINUTIAE = [[-34, -52], [42, -6], [-18, 48], [58, 64], [-62, 20], [12, -96]]
const FINGERS = ['R. Thumb', 'R. Index', 'R. Middle', 'R. Ring', 'R. Little', 'L. Thumb', 'L. Index', 'L. Middle', 'L. Ring', 'L. Little']

function samePrint({ time, score, uid }) {
  const sections = score.sections
  const press = sections.map((s, k) => (k === 0 ? 3 : s.from + 0.4))
  const CARD = { x: PX + 40, y: PY + 30, w: PW - 80, h: PH - 60 }
  const HEAD = 96
  const bw = CARD.w / 5
  const bh = (CARD.h - HEAD) / 2
  const box = (k) => ({ x: CARD.x + (k % 5) * bw, y: CARD.y + HEAD + Math.floor(k / 5) * bh })
  const centre = (k) => [box(k).x + bw / 2, box(k).y + bh / 2 + 14]
  // The camera leans towards the box being pressed, gliding between them.
  const keys = press.map((p, k) => ({ t: p - 1.4, v: { x: centre(k)[0], y: centre(k)[1] } }))
  const focus = glide(time, keys)
  const Z = 1.22
  const halfW = PW / (2 * Z)
  const halfH = PH / (2 * Z)
  const camX = Math.min(Math.max(lerp(CX, focus.x, 0.7), CARD.x - 14 + halfW), CARD.x + CARD.w + 14 - halfW)
  const camY = Math.min(Math.max(lerp(CY, focus.y, 0.6), CARD.y - 14 + halfH), CARD.y + CARD.h + 14 - halfH)
  const view = `translate(${r(CX)} ${r(CY)}) scale(${Z}) translate(${r(-camX)} ${r(-camY)})`

  let boxes = ''
  let defs = `<path id="${uid}-fp" d="${printPath()}"/>`
  defs += `<clipPath id="${uid}-oval"><ellipse cx="0" cy="0" rx="112" ry="132"/></clipPath>`
  let reds = ''
  for (let k = 0; k < 10; k++) {
    const b = box(k)
    const [cx, cy] = centre(k)
    boxes += txt(b.x + 14, b.y + 26, 15, `${k + 1}. ${FINGERS[k]}`, { fill: GREEN, upper: true, spacing: 2, weight: 600 })
    const roll = easeInOut(ramp(time, press[k], press[k] + 1.3))
    if (roll <= 0) continue
    const tilt = ((k * 37) % 9) - 4
    defs += `<clipPath id="${uid}-r${k}"><rect x="-130" y="-150" width="${r(260 * roll)}" height="300"/></clipPath>`
    boxes += `<g transform="translate(${r(cx)} ${r(cy)}) rotate(${tilt})"><g clip-path="url(#${uid}-oval)"><g clip-path="url(#${uid}-r${k})">
      <use href="#${uid}-fp" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linecap="round" opacity="${r(0.82 + 0.18 * ((k * 13) % 5) / 4, 3)}"/>
    </g></g></g>`
    const stamped = land(time, press[k] + 1.6, 0.25)
    if (stamped > 0 && k > 0) boxes += txt(b.x + bw - 16, b.y + bh - 16, 22, 'Same', { fill: GREEN, anchor: 'end', upper: true, spacing: 4, weight: 700, opacity: stamped })
    // Red: the points that match, ringed, and a line hopping from the last print to this one.
    const ring = land(time, press[k] + 1.4, 0.3)
    const rot = (tilt * Math.PI) / 180
    const place = ([mx, my]) => [cx + mx * Math.cos(rot) - my * Math.sin(rot), cy + mx * Math.sin(rot) + my * Math.cos(rot)]
    MINUTIAE.forEach((m, j) => {
      const p = place(m)
      if (ring > 0) reds += `<circle cx="${r(p[0])}" cy="${r(p[1])}" r="${r(10 * ring)}" fill="none" stroke="${RED}" stroke-width="2.4"/>`
    })
    if (k > 0) {
      const from = place(MINUTIAE[(k - 1) % MINUTIAE.length])
      const tiltPrev = ((((k - 1) * 37) % 9) - 4) * Math.PI / 180
      const [pcx, pcy] = centre(k - 1)
      const [mx, my] = MINUTIAE[(k - 1) % MINUTIAE.length]
      const a = [pcx + mx * Math.cos(tiltPrev) - my * Math.sin(tiltPrev), pcy + mx * Math.sin(tiltPrev) + my * Math.cos(tiltPrev)]
      const end = (sections[k].to ?? score.duration) - 1
      const u = easeInOut(ramp(time, press[k] + 1.6, Math.min(press[k] + 7, end)))
      if (u > 0) reds += `<path d="M${r(a[0])} ${r(a[1])}L${r(lerp(a[0], from[0], u))} ${r(lerp(a[1], from[1], u))}" stroke="${RED}" stroke-width="2.6" stroke-linecap="round"/>`
    }
  }
  let rules = `M${CARD.x} ${CARD.y + HEAD}H${CARD.x + CARD.w}M${CARD.x} ${CARD.y + HEAD + bh}H${CARD.x + CARD.w}`
  for (let k = 1; k < 5; k++) rules += `M${r(CARD.x + k * bw)} ${CARD.y + HEAD}V${CARD.y + CARD.h}`
  return `<defs>${defs}</defs>
  <rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER_SHADE}" opacity="0.35"/>
  <g transform="${view}">
    <rect x="${CARD.x}" y="${CARD.y}" width="${CARD.w}" height="${CARD.h}" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/>
    <rect x="${CARD.x + 6}" y="${CARD.y + 6}" width="${CARD.w - 12}" height="${CARD.h - 12}" fill="none" stroke="${INK}" stroke-width="1"/>
    <path d="${rules}" stroke="${INK}" stroke-width="1.6"/>
    ${txt(CARD.x + 26, CARD.y + 42, 26, 'Fingerprints', { upper: true, spacing: 6, weight: 700 })}
    ${txt(CARD.x + 26, CARD.y + 74, 16, 'Name: unknown · Alias: the conman · Since 1968', { fill: GREEN, upper: true, spacing: 2, weight: 600 })}
    ${txt(CARD.x + CARD.w - 26, CARD.y + 42, 16, 'Class: whorl', { fill: GREEN, anchor: 'end', upper: true, spacing: 2, weight: 600 })}
    ${txt(CARD.x + CARD.w - 26, CARD.y + 74, 16, 'Never seems to change', { fill: GREEN, anchor: 'end', upper: true, spacing: 2, weight: 600 })}
    ${boxes}
    ${reds}
  </g>`
}

/* ── E. In the Shadows ────────────────────────────────────────────── */

function town() {
  const rand = rng(25)
  const COLS = 14
  const ROWS = 9
  const xs = [0]
  const ys = [0]
  for (let c = 0; c < COLS; c++) xs.push(xs.at(-1) + 170 + rand() * 90)
  for (let k = 0; k < ROWS; k++) ys.push(ys.at(-1) + 150 + rand() * 70)
  const ST = 30
  const blocks = []
  for (let c = 0; c < COLS; c++) {
    for (let k = 0; k < ROWS; k++) {
      const x0 = xs[c] + ST
      const x1 = xs[c + 1] - ST
      const y0 = ys[k] + ST
      const y1 = ys[k + 1] - ST
      // Blocks are built up in two or three buildings.
      if (rand() < 0.5) {
        const cut = lerp(x0, x1, 0.35 + rand() * 0.3)
        blocks.push([x0, y0, cut - 6, y1, rand()], [cut + 6, y0, x1, y1, rand()])
      } else if (rand() < 0.5) {
        const cut = lerp(y0, y1, 0.35 + rand() * 0.3)
        blocks.push([x0, y0, x1, cut - 6, rand()], [x0, cut + 6, x1, y1, rand()])
      } else blocks.push([x0, y0, x1, y1, rand()])
    }
  }
  // Your walk: corner to corner along the streets.
  const route = []
  let c = 1
  let k = 1
  route.push([xs[c], ys[k]])
  const r2 = rng(68)
  for (let s = 0; s < 22; s++) {
    if (s % 2 === 0) c = Math.min(COLS - 1, c + 1 + Math.floor(r2() * 2))
    else k = Math.max(1, Math.min(ROWS - 1, k + (r2() < 0.5 ? -1 : 1) * (1 + Math.floor(r2() * 2))))
    route.push([xs[c], ys[k]])
    if (c >= COLS - 1) break
  }
  return { blocks, route, W: xs.at(-1), H: ys.at(-1) }
}

function along(route, s) {
  let left = s
  for (let i = 0; i < route.length - 1; i++) {
    const [a, b] = [route[i], route[i + 1]]
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    if (left <= len) return { p: [lerp(a[0], b[0], left / len), lerp(a[1], b[1], left / len)], i }
    left -= len
  }
  return { p: route.at(-1), i: route.length - 2 }
}
const routeLength = (route) => route.slice(1).reduce((n, p, i) => n + Math.hypot(p[0] - route[i][0], p[1] - route[i][1]), 0)

function hull(points) {
  const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const lower = []
  for (const p of pts) { while (lower.length >= 2 && cross(lower.at(-2), lower.at(-1), p) <= 0) lower.pop(); lower.push(p) }
  const upper = []
  for (const p of pts.reverse()) { while (upper.length >= 2 && cross(upper.at(-2), upper.at(-1), p) <= 0) upper.pop(); upper.push(p) }
  return lower.slice(0, -1).concat(upper.slice(0, -1))
}

function inTheShadows({ time, score, uid }) {
  const { blocks, route, W, H } = town()
  const total = routeLength(route)
  const u = clamp01((time - 6) / (score.duration - 14))
  const LAG = 0.05
  const you = along(route, total * easeInOut(u) )
  const him = along(route, total * easeInOut(clamp01(u - LAG)))
  // The sun goes over during the song; every shadow swings with it.
  const sun = lerp(-0.35, Math.PI + 0.35, clamp01(time / score.duration))
  const sv = [Math.cos(sun) * 70, Math.abs(Math.sin(sun)) * 30 + 22]
  const off = [sv[0] / Math.hypot(...sv) * 14, sv[1] / Math.hypot(...sv) * 14]
  const mid = [(you.p[0] + him.p[0]) / 2, (you.p[1] + him.p[1]) / 2]
  const Z = 1.4
  const camX = Math.min(Math.max(mid[0], PW / (2 * Z) - 40), W - PW / (2 * Z) + 40)
  const camY = Math.min(Math.max(mid[1], PH / (2 * Z) - 40), H - PH / (2 * Z) + 40)
  const S = (p) => [(p[0] - camX) * Z + CX, (p[1] - camY) * Z + CY]
  let shadows = ''
  let roofs = ''
  for (const [x0, y0, x1, y1, h] of blocks) {
    const a = S([x0, y0])
    const b = S([x1, y1])
    if (b[0] < PX - 120 || a[0] > PR + 120 || b[1] < PY - 120 || a[1] > PB + 120) continue
    const L = 0.5 + h * 1.6
    const corners = [[a[0], a[1]], [b[0], a[1]], [b[0], b[1]], [a[0], b[1]]]
    const cast = corners.map(([x, y]) => [x + sv[0] * L, y + sv[1] * L])
    shadows += poly(hull(corners.concat(cast))) + 'Z'
    roofs += `M${r(a[0])} ${r(a[1])}H${r(b[0])}V${r(b[1])}H${r(a[0])}Z`
  }
  const trail = (until, shift) => {
    const pts = route.slice(0, until.i + 1).concat([until.p]).map((p) => S([p[0] + shift[0], p[1] + shift[1]]))
    return poly(pts)
  }
  const yp = S(you.p)
  const hp = S([him.p[0] + off[0], him.p[1] + off[1]])
  const step = Math.sin(time * 9) * 1.5
  return `<defs>${hatch(`${uid}-sh`, { gap: 6, w: 1.8, color: GREEN, angle: 45 })}</defs>
  <rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>
  <path d="${shadows}" fill="url(#${uid}-sh)"/>
  <path d="${roofs}" fill="${PAPER}" stroke="${INK}" stroke-width="2.2"/>
  <path d="${trail(you, [0, 0])}" fill="none" stroke="${INK}" stroke-width="5" stroke-dasharray="0.1 13" stroke-linecap="round"/>
  <path d="${trail(him, off)}" fill="none" stroke="${RED}" stroke-width="4.5" stroke-linejoin="round"/>
  <circle cx="${r(yp[0])}" cy="${r(yp[1] + step)}" r="11" fill="${INK}"/>
  <circle cx="${r(yp[0])}" cy="${r(yp[1] + step)}" r="19" fill="none" stroke="${INK}" stroke-width="1.6"/>
  <circle cx="${r(hp[0])}" cy="${r(hp[1])}" r="11" fill="${RED}"/>`
}

/* ── The concepts ─────────────────────────────────────────────────── */

export const CONCEPTS = [
  {
    id: 'cooked-books',
    name: 'Cooked Books',
    lyric: "I've made a killing off of moving fast and cooking books",
    idea: 'A ledger page with two columns, Yours and Mine. Every sung line is one entry: what he took is written in, the figure under Yours is struck through in red, and the same figure appears under Mine. Every chorus line is the same entry for the same amount, 1,968.00, because he always sounds the same.',
    motion: 'The page climbs one row per line and glides between them, so it never stops. Each entry is written out across its line, and the strike lands on the line\'s last word. The red balance at the foot counts up all song.',
    red: 'The thief\'s ink: the strike through your figure, the copy in his column and the balance carried forward.',
    stills: [41, 74, 125, 223],
    frame: cookedBooks,
  },
  {
    id: 'pantograph',
    name: 'The Pantograph',
    lyric: "I'm a conman and I'm here to steal your sound",
    idea: 'A forger\'s copying machine. Its stylus traces your sound, printed as a small waveform of the whole song along the foot of the plate, and its pen draws the same waveform five times larger in red above it. Whatever the stylus has passed over fades out of the original.',
    motion: 'The carriage runs along the rail at the song\'s pace, so the stylus is always at the point being played, and the linkage folds and opens as the waveform rises and falls. By the end the original is a ghost and the copy is whole.',
    red: 'The pen, and the copy it lays down.',
    stills: [36, 100, 173, 225],
    frame: pantograph,
  },
  {
    id: 'bottled-lightning',
    name: 'Bottled Lightning',
    lyric: 'Bottled lightning in several steady notes',
    idea: 'One engraved bottle standing in the sea under a cloudy sky. Each line is a lightning strike that goes in at the neck and stays inside as a small red bolt. The clouds are pulled away one by one until the sky is clear.',
    motion: 'Strikes land on the first word of each line. The bolts already inside flicker with the band, the clouds drift and thin out across the song, and the sea keeps moving. By the last chorus the bottle is full of red and the sky is empty.',
    red: 'The lightning: taken from the sky and kept.',
    stills: [35, 80, 135, 225],
    frame: bottledLightning,
  },
  {
    id: 'same-print',
    name: 'The Same Print',
    lyric: 'No matter where I go, I never seem to change',
    idea: 'A police ten-print card for the conman. One finger is rolled for each section of the song, and all ten prints are the same print. A clerk stamps SAME on each one, and red rings mark the points that match.',
    motion: 'Each print rolls on from left to right as its section starts. The camera leans from box to box along the card, and between prints a red line works its way across from the matched point on the last print to the same point on the new one.',
    red: 'The match: rings on the matching points and the line that joins print to print.',
    stills: [30, 82, 168, 224],
    frame: samePrint,
  },
  {
    id: 'shadows',
    name: 'In the Shadows',
    lyric: 'I stick to the shadows when I follow you around',
    idea: 'A town plan seen from above, with every building casting a hatched shadow. Your walk is a dotted ink line through the streets. A red line follows a few blocks behind, and it keeps to the shadowed side of every street.',
    motion: 'You walk the length of the town over the whole song while the sun crosses the sky, so every shadow swings from one side of the streets to the other. The view drifts with the two of you, and the red never quite catches up and never drops back.',
    red: 'The one following you.',
    stills: [42, 124, 175, 222],
    frame: inTheShadows,
  },
]
