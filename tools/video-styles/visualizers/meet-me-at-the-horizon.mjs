/*
 * Meet Me at the Horizon — five visualizers for a sleepless night.
 *
 * Core idea: anxiety at night. One night, lying awake, from the first line to
 * the dawn the song keeps reaching for. Every concept is that night as one
 * picture system, and every one of them ends at the horizon: the dawn comes up
 * in gold (the song's second ink) a little in each chorus, "again and again",
 * and for good in the outro.
 */
import { PLATE, CX, INK, PAPER, RED, SECOND_INK } from './sheet.mjs'
import { rng, r, t, ramp, clamp01, lerp, easeOut, easeInOut } from '../../../shared/video/kit.mjs'
import { glide, land } from '../../../shared/video/album.mjs'

const GOLD = SECOND_INK['meet-me-at-the-horizon']
const { x: PX, y: PY, w: PW, h: PH } = PLATE
const PR = PX + PW
const PB = PY + PH

/* ── Shared clock helpers ─────────────────────────────────────────── */

const cache = new WeakMap()
const memo = (score, key, make) => {
  let m = cache.get(score)
  if (!m) cache.set(score, (m = {}))
  return m[key] ?? (m[key] = make())
}
const words = (score) => memo(score, 'words', () => score.lines.flatMap((l) => l.words.map((w) => ({ ...w, line: l.index }))))
const sec = (score, id) => score.sections.find((s) => s.id === id)

/*
 * How far the dawn has come, 0–1. Each chorus ("the sun starts to wake") lifts
 * it a little higher and lets it fall back — the night repeats — and the outro
 * keeps it. The one curve every concept here lights its gold by.
 */
function dawnAt(score, time) {
  const swell = (id, peak) => {
    const s = sec(score, id)
    if (!s) return 0
    const up = easeInOut(ramp(time, s.from - 1, s.from + 5))
    const down = easeInOut(ramp(time, s.to - 2, s.to + 8))
    return peak * up * (1 - 0.75 * down)
  }
  const out = sec(score, 'hook-2')
  const morning = out ? easeInOut(ramp(time, out.from, score.duration - 6)) : 0
  return Math.max(swell('chorus-1', 0.28), swell('chorus-2', 0.42), swell('chorus-3', 0.58), 0.25 * easeInOut(ramp(time, 159, 178)) , morning)
}

/* ── A. The sleep study ───────────────────────────────────────────── */

const STAGES = ['WAKE', 'REM', 'N1', 'N2', 'N3']

/*
 * The stage at `time`, as a hypnogram would score it. Awake whenever a line is
 * being sung (just me and my thoughts), REM in the breaths inside a line, and
 * only in the gaps between lines does it start to go under — a stage deeper
 * every second and a half, so a long gap is the only way down. The outro is
 * the first long gap of the night, and it reaches deep sleep.
 */
function stageAt(score, time) {
  const ws = words(score)
  const line = score.lines.find((l) => time >= l.start - 0.25 && time <= l.end + 0.35)
  if (line) return 0
  const prev = [...score.lines].reverse().find((l) => l.end + 0.35 < time)
  // Before the first line: lights out, half under, never deep.
  if (!prev) return time < 4 ? 0 : Math.min(2, 1 + Math.floor((time - 4) / 4))
  const since = time - (prev.end + 0.35)
  // A gap goes straight to N1 and a stage deeper every 2.4 s; only the outro reaches N3.
  return Math.min(time > score.lines.at(-1).end ? 4 : 3, 2 + Math.floor(since / 2.4))
}

function sleepStudy({ time, score }) {
  const X0 = 220, X1 = 1500, Y0 = 290, ROW = 96
  const x = (s) => X0 + (s / score.duration) * (X1 - X0)
  const y = (k) => Y0 + k * ROW
  let out = ''
  // Header, like the top of a printed study.
  out += t({ x: X0, y: 112, size: 22, text: 'Polysomnogram · one night', fill: INK, weight: 600, tracking: 3 })
  out += t({ x: X1, y: 112, size: 16, text: 'epoch 30 s · lights out 22:58', fill: INK, weight: 400, tracking: 2, anchor: 'end', opacity: 0.7 })
  out += `<line x1="${X0}" y1="130" x2="${X1}" y2="130" stroke="${INK}" stroke-width="2"/>`
  // The light channel: dark, but gold in the dawns.
  out += t({ x: X0 - 24, y: 206, size: 15, text: 'light', fill: INK, weight: 600, tracking: 2, anchor: 'end' })
  out += `<rect x="${X0}" y="186" width="${X1 - X0}" height="28" fill="none" stroke="${INK}" stroke-width="1" opacity="0.5"/>`
  const step = 0.5
  let band = ''
  let runFrom = 0
  let runGold = false
  const flush = (to) => {
    if (to > runFrom) band += `<rect x="${r(x(runFrom))}" y="187" width="${r(x(to) - x(runFrom))}" height="26" fill="${runGold ? GOLD : INK}"/>`
    runFrom = to
  }
  for (let s = 0; s < Math.min(time, score.duration); s += step) {
    const gold = dawnAt(score, s) > 0.14
    if (gold !== runGold) { flush(s); runGold = gold }
  }
  flush(Math.min(time, score.duration))
  out += band
  // Stage rows.
  STAGES.forEach((name, k) => {
    out += t({ x: X0 - 24, y: y(k) + 6, size: 18, text: name, fill: INK, weight: 600, tracking: 2, anchor: 'end' })
    out += `<line x1="${X0}" y1="${y(k)}" x2="${X1}" y2="${y(k)}" stroke="${INK}" stroke-width="1" stroke-dasharray="2 6" opacity="0.55"/>`
  })
  // Hours, eleven to six.
  for (let h = 0; h <= 7; h++) {
    const hx = X0 + (h / 7) * (X1 - X0)
    out += `<line x1="${r(hx)}" y1="${Y0 - 20}" x2="${r(hx)}" y2="${y(4) + 26}" stroke="${INK}" stroke-width="1" opacity="0.25"/>`
    out += t({ x: hx, y: y(4) + 62, size: 18, text: ['11 pm', '12 am', '1', '2', '3', '4', '5', '6 am'][h], fill: INK, weight: 500, anchor: 'middle', tracking: 1 })
  }
  // The trace: steps, sampled every quarter second up to now.
  const end = Math.min(time, score.duration)
  let d = `M${r(x(0))} ${y(0)}`
  let last = 0
  for (let s = 0.25; s <= end; s += 0.25) {
    const k = stageAt(score, s)
    if (k !== last) { d += `H${r(x(s))}V${y(k)}`; last = k }
  }
  d += `H${r(x(end))}`
  out += `<path d="${d}" fill="none" stroke="${RED}" stroke-width="3" stroke-linejoin="miter"/>`
  out += `<circle cx="${r(x(end))}" cy="${y(last)}" r="7" fill="${RED}"/>`
  return out
}

/* ── B. Star trails ───────────────────────────────────────────────── */

const POLE = { x: 560, y: 130 }
const SWEEP = 72 // degrees of sky turned over the song: a long exposure of the night
const ridgeY = (x) => 676 + 18 * Math.sin(x / 210) + 9 * Math.sin(x / 67 + 1.3) - 26 * Math.exp(-(((x - 1240) / 160) ** 2))

const stars = memo({}, 'stars', () => {
  const rand = rng(77)
  return Array.from({ length: 170 }, () => ({
    R: 40 + rand() ** 0.7 * 1300,
    a: rand() * 360,
    w: 0.8 + rand() ** 3 * 2.4,
    o: 0.35 + rand() * 0.65,
  }))
})

const polar = (R, deg) => ({ x: POLE.x + R * Math.cos((deg * Math.PI) / 180), y: POLE.y + R * Math.sin((deg * Math.PI) / 180) })
const arc = (R, a0, a1) => {
  const p = polar(R, a0)
  const q = polar(R, a1)
  return `M${r(p.x)} ${r(p.y)}A${r(R)} ${r(R)} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${r(q.x)} ${r(q.y)}`
}

function starTrails({ time, score, uid }) {
  const turned = (SWEEP * time) / score.duration
  const dawn = dawnAt(score, time)
  let out = `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${INK}"/>`
  // The sky, clipped above the ridge: stars cannot go behind the hill.
  let ridge = `M${PX} ${PB}`
  for (let x = PX; x <= PR; x += 8) ridge += `L${x} ${r(ridgeY(x))}`
  ridge += `L${PR} ${PB}Z`
  let sky = `M${PX} ${PY}`
  for (let x = PX; x <= PR; x += 8) sky += `L${x} ${r(ridgeY(x))}`
  sky += `L${PR} ${PY}Z`
  out += `<defs><clipPath id="${uid}-sky"><path d="${sky}"/></clipPath></defs><g clip-path="url(#${uid}-sky)">`
  // Dawn: engraved gold lines up from the ridge, heavy at the bottom.
  const H = 40 + dawn * 560
  for (let k = 0; k * 7 < H; k++) {
    const yy = 700 - k * 7
    const w = 3.4 * (1 - (k * 7) / H) ** 1.4
    if (w > 0.15) out += `<line x1="${PX}" y1="${yy}" x2="${PR}" y2="${yy}" stroke="${GOLD}" stroke-width="${r(w, 2)}"/>`
  }
  const fade = 1 - 0.75 * clamp01(dawn * 1.4)
  out += `<g fill="none" stroke="${PAPER}" stroke-linecap="round" opacity="${r(fade, 2)}">`
  for (const s of stars) {
    if (turned < 0.05) continue
    out += `<path d="${arc(s.R, s.a, s.a + turned)}" stroke-width="${r(s.w, 2)}" opacity="${r(s.o, 2)}"/>`
  }
  out += `</g>`
  // The one red star: its trail falls to the horizon on the last "meet me".
  const meet = 188.83
  const a0 = 2
  const aEnd = a0 + SWEEP * (meet / score.duration)
  let RR = 600
  for (let k = 0; k < 4; k++) RR = (ridgeY(POLE.x + RR * Math.cos((aEnd * Math.PI) / 180)) - POLE.y) / Math.sin((aEnd * Math.PI) / 180)
  const aNow = a0 + SWEEP * (Math.min(time, meet) / score.duration)
  if (time > 1) out += `<path d="${arc(RR, a0, aNow)}" fill="none" stroke="${RED}" stroke-width="3.2" stroke-linecap="round"/>`
  const head = polar(RR, aNow)
  out += `<circle cx="${r(head.x)}" cy="${r(head.y)}" r="${time >= meet ? 9 : 5}" fill="${RED}"/>`
  out += `</g>`
  // The pole star.
  out += `<circle cx="${POLE.x}" cy="${POLE.y}" r="3" fill="${PAPER}" opacity="${r(fade, 2)}"/>`
  // The hill, and a hairline where the sky stops.
  out += `<path d="${ridge}" fill="${INK}"/>`
  const rt = rng(8)
  let pines = ''
  for (let x = PX + 30; x < PR; x += 14 + rt() * 40) {
    if (Math.sin(x / 150) < 0.1) continue
    const h = 18 + rt() * 46, b = ridgeY(x) + 4, w = h * 0.32
    pines += `M${r(x - w)} ${r(b)}L${r(x)} ${r(b - h)}L${r(x + w)} ${r(b)}Z`
  }
  out += `<path d="${pines}" fill="${INK}"/>`
  let edge = ''
  for (let x = PX; x <= PR; x += 8) edge += `${x === PX ? 'M' : 'L'}${x} ${r(ridgeY(x))}`
  out += `<path d="${edge}" fill="none" stroke="${PAPER}" stroke-width="1.2" opacity="0.35"/>`
  return out
}

/* ── C. Counting ──────────────────────────────────────────────────── */

/*
 * No counting sheep: the night counted instead, one stroke per sung word, in
 * fives, like days scratched on a wall. Each stroke lands on its word's
 * measured onset; the newest is red. The window's light comes across the wall
 * in each dawn, and stays in the outro.
 */
function counting({ time, score, uid }) {
  const ws = words(score)
  const n = ws.length
  const COLS = 14
  const groups = Math.ceil(n / 5)
  const rows = Math.ceil(groups / COLS)
  const GW = 1380 / COLS, GH = Math.min(150, 690 / rows), GAP = 8
  const left = PX + (PW - COLS * GW) / 2 + 18
  const top = PY + (PH - rows * GH) / 2 + 10
  const rand = rng(31)
  const jit = ws.map(() => [rand() * 6 - 3, rand() * 8 - 4, rand() * 6 - 3, rand() * 8 - 4])
  let out = ''
  // The light: a window's shape thrown across the wall, flat gold, under the marks.
  const dawn = dawnAt(score, time)
  if (dawn > 0.01) {
    const sx = lerp(PR + 80, PX + 260, easeOut(clamp01(dawn * 1.15)))
    const w = 520, h = 560, skew = 260
    const quad = (x0, y0) => `M${r(x0)} ${r(y0)}l${w} 0l${-skew} ${h}l${-w} 0Z`
    out += `<g opacity="${r(0.25 + 0.6 * clamp01(dawn * 1.5), 2)}" style="mix-blend-mode:multiply">`
    out += `<path d="${quad(sx, PY + 110)}" fill="${GOLD}"/>`
    out += `<path d="M${r(sx + w / 2)} ${PY + 110}l${-skew / 2} ${h}" stroke="${PAPER}" stroke-width="22"/>`
    out += `<path d="M${r(sx - skew / 2)} ${PY + 110 + h / 2}l${w} 0" stroke="${PAPER}" stroke-width="22"/>`
    out += `</g>`
  }
  let ink = ''
  let red = ''
  ws.forEach((w, i) => {
    if (time < w.t) return
    const g = Math.floor(i / 5)
    const k = i % 5
    const gx = left + (g % COLS) * GW
    const gy = top + Math.floor(g / COLS) * GH
    const grow = land(time, w.t, 0.09)
    const [a, b, c, d] = jit[i]
    let seg
    if (k < 4) {
      const x0 = gx + k * 17 + a, y0 = gy + b
      const x1 = gx + k * 17 + c, y1 = gy + GH - 30 + d
      seg = `M${r(x0)} ${r(y0)}L${r(lerp(x0, x1, grow))} ${r(lerp(y0, y1, grow))}`
    } else {
      const x0 = gx - 12 + a, y0 = gy + GH - 40 + b
      const x1 = gx + 66 + c, y1 = gy + 10 + d
      seg = `M${r(x0)} ${r(y0)}L${r(lerp(x0, x1, grow))} ${r(lerp(y0, y1, grow))}`
    }
    if (i === ws.findLastIndex((x) => x.t <= time)) red = seg
    else ink += seg
  })
  out += `<path d="${ink}" stroke="${INK}" stroke-width="5.5" stroke-linecap="round" fill="none"/>`
  if (red) out += `<path d="${red}" stroke="${RED}" stroke-width="6.5" stroke-linecap="round" fill="none"/>`
  void GAP; void uid
  return out
}

/* ── D. The ceiling ───────────────────────────────────────────────── */

/*
 * Lying on your back, the room seen from the bed: the ceiling, its rose, the
 * walls falling away at the edges. The moon's window slides across it all
 * night; a crack grows from the cornice a little on every word — the house
 * creaks, the headache evolves — and stops when the dawn comes in.
 */
const crackPath = memo({}, 'crack', () => {
  const rand = rng(12)
  const pts = [{ x: 1380, y: 150 }]
  let a = Math.PI * 0.82
  const branches = []
  for (let i = 0; i < 520; i++) {
    a += (rand() - 0.5) * 0.9
    a = a * 0.9 + Math.PI * 0.85 * 0.1 + (rand() - 0.5) * 0.05
    const p = pts.at(-1)
    pts.push({ x: p.x + Math.cos(a) * 4.2, y: p.y + Math.sin(a) * 3 + 0.9 })
    if (rand() < 0.035) branches.push({ at: i, a: a + (rand() < 0.5 ? -1 : 1) * (0.7 + rand() * 0.6), len: 14 + Math.floor(rand() * 26) })
  }
  return { pts, branches }
})

function ceiling({ time, score, uid }) {
  const ws = words(score)
  const sung = ws.filter((w) => w.t <= time).length
  const dawn = dawnAt(score, time)
  let out = `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${INK}"/>`
  // The ceiling: an inset panel, the walls as four trapezoids falling away.
  const c = { x: 180, y: 140, w: 1240, h: 560 }
  const CR = c.x + c.w, CB = c.y + c.h
  out += `<path d="M${PX} ${PY}L${c.x} ${c.y}M${PR} ${PY}L${CR} ${c.y}M${PX} ${PB}L${c.x} ${CB}M${PR} ${PB}L${CR} ${CB}" stroke="${PAPER}" stroke-width="2" opacity="0.6"/>`
  out += `<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" fill="none" stroke="${PAPER}" stroke-width="2" opacity="0.7"/>`
  out += `<rect x="${c.x + 16}" y="${c.y + 16}" width="${c.w - 32}" height="${c.h - 32}" fill="none" stroke="${PAPER}" stroke-width="1" opacity="0.45"/>`
  // The ceiling rose.
  const rx = c.x + c.w / 2, ry = c.y + c.h / 2
  for (const [rad, w, o] of [[60, 1.5, 0.55], [44, 2, 0.6], [16, 3, 0.7]]) out += `<circle cx="${rx}" cy="${ry}" r="${rad}" fill="none" stroke="${PAPER}" stroke-width="${w}" opacity="${o}"/>`
  // The moon's window, sliding across from the right all night, gold at dawn.
  const along = time / score.duration
  const wx = lerp(1250, 230, along), wy = lerp(210, 320, along)
  const ww = 330 + dawn * 260, wh = 230 + dawn * 120, sk = lerp(-120, 150, along)
  const lit = dawn > 0.05 ? GOLD : PAPER
  out += `<defs><pattern id="${uid}-h" width="6" height="6" patternUnits="userSpaceOnUse"><line x1="0" y1="3" x2="6" y2="3" stroke="${lit}" stroke-width="${r(3.4 + dawn * 2, 2)}"/></pattern>
  <clipPath id="${uid}-c"><rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}"/></clipPath></defs>`
  out += `<g clip-path="url(#${uid}-c)" opacity="${r(0.8 + dawn * 0.2, 2)}">`
  const pane = (x0, y0, w, h) => `M${r(x0)} ${r(y0)}l${r(w)} 0l${r(sk * (h / wh))} ${r(h)}l${r(-w)} 0Z`
  const m = 12
  for (const [i, j] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
    const pw = (ww - m) / 2, ph = (wh - m) / 2
    out += `<path d="${pane(wx + i * (pw + m) + j * sk * ((ph + m) / wh), wy + j * (ph + m), pw, ph)}" fill="url(#${uid}-h)"/>`
  }
  out += `</g>`
  // The crack: a share of the path per word sung, frozen once the dawn is up for good.
  const { pts, branches } = crackPath
  const upto = Math.min(pts.length - 1, Math.floor((sung / ws.length) * (pts.length - 1)))
  if (upto > 1) {
    let d = `M${r(pts[0].x)} ${r(pts[0].y)}`
    for (let i = 1; i <= upto; i++) d += `L${r(pts[i].x)} ${r(pts[i].y)}`
    for (const b of branches) {
      if (b.at > upto) continue
      const grown = Math.min(b.len, upto - b.at)
      let p = pts[b.at]
      d += `M${r(p.x)} ${r(p.y)}`
      for (let k = 0; k < grown; k++) {
        p = { x: p.x + Math.cos(b.a + Math.sin(k) * 0.3) * 3.6, y: p.y + Math.sin(b.a + Math.sin(k) * 0.3) * 3.6 }
        d += `L${r(p.x)} ${r(p.y)}`
      }
    }
    out += `<path d="${d}" fill="none" stroke="${RED}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>`
  }
  return out
}

/* ── E. Two lights ────────────────────────────────────────────────── */

/*
 * Meet me at the horizon, taken at its word: one horizon, two lights on it.
 * Mine in red from the left, yours in gold from the right. They close through
 * the verses, nearly touch on the first "meet me", fall apart again while he
 * misses the way things used to be, and meet on the last one. The night above
 * is engraved lines that thin as the dawn comes; the water below trembles on
 * every word.
 */
function twoLights({ time, score, uid }) {
  const HY = 430
  const dawn = dawnAt(score, time)
  const keys = (a) => a.map(([tt, v]) => ({ t: tt, v }))
  const gap = glide(time, keys([[0, 1240], [17, 1180], [52, 900], [71, 820], [106, 560], [126, 260], [129.8, 90], [140, 150], [158, 420], [176, 380], [180, 160], [188.8, 0], [228, 0]]))
  const mid = CX + 40 * Math.sin(time / 23)
  const red = mid - gap / 2, gold = mid + gap / 2
  let out = ''
  // Sky: heavy engraved lines thinning towards the horizon, and all of them thinning with the dawn.
  for (let y = PY + 3; y < HY - 2; y += 6) {
    const u = (HY - y) / (HY - PY)
    const w = (1.2 + 3.8 * u ** 0.7) * (1 - 0.8 * dawn)
    if (w > 0.12) out += `<line x1="${PX}" y1="${y}" x2="${PR}" y2="${y}" stroke="${INK}" stroke-width="${r(w, 2)}"/>`
  }
  // A band of gold sitting on the horizon at dawn.
  for (let k = 0; k < 14; k++) {
    const y = HY - 4 - k * 6
    const w = dawn * 4 * (1 - k / 14)
    if (w > 0.15) out += `<line x1="${PX}" y1="${y}" x2="${PR}" y2="${y}" stroke="${GOLD}" stroke-width="${r(w, 2)}"/>`
  }
  // Water: lines that tremble with the voice.
  const line = score.lines.find((l) => time >= l.start - 0.2 && time <= l.end + 0.5)
  const hit = line ? line.words.reduce((m, w) => Math.max(m, time < w.t ? 0 : Math.exp(-(time - w.t) / 0.4)), 0) : 0
  for (let y = HY + 8, i = 0; y < PB; y += 7 + i * 0.35, i++) {
    const u = (y - HY) / (PB - HY)
    const amp = (0.8 + u * 5) * (0.35 + hit * 0.9)
    let d = `M${PX} ${r(y)}`
    for (let x = PX; x <= PR + 20; x += 24) d += `L${x} ${r(y + amp * Math.sin(x / (30 + u * 40) + time * 1.3 + i * 1.7))}`
    out += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${r(0.7 + u * 2.6, 2)}"/>`
  }
  // Each light's broken path on the water.
  const glitter = (x, colour, seed) => {
    const rand = rng(seed)
    let d = ''
    for (let y = HY + 10; y < PB; y += 9) {
      const spread = 6 + (y - HY) * 0.08
      const len = 4 + rand() * 14 * (1 - (y - HY) / (PB - HY) * 0.5)
      const dx = (rand() - 0.5) * spread * 2 + Math.sin(time * 2 + y) * 3
      d += `M${r(x + dx - len / 2)} ${y}h${r(len)}`
    }
    return `<path d="${d}" stroke="${colour}" stroke-width="4" fill="none"/>`
  }
  out += `<rect x="${PX}" y="${HY - 1}" width="${PW}" height="2.5" fill="${INK}"/>`
  out += glitter(gold, GOLD, 5) + glitter(red, RED, 9)
  const met = clamp01((time - 188.8) / 2)
  out += `<circle cx="${r(gold)}" cy="${HY}" r="${r(15 + met * 6)}" fill="${GOLD}"/>`
  out += `<circle cx="${r(red)}" cy="${HY}" r="${r(15 - met * 4)}" fill="${RED}"/>`
  void uid
  return out
}

export const CONCEPTS = [
  {
    id: 'sleep-study',
    name: 'The Sleep Study',
    lyric: "When the absence of light doesn't mean that I sleep",
    idea: 'One night on a polysomnogram: the stages of sleep as rows, the hours of the night across the sheet. The red pen is scored awake on every sung line and only starts to go under in the gaps between them.',
    motion: 'The trace writes left to right across the whole song, stepping on the measured words. The light channel above it turns gold in each chorus, then back to black. In the outro, the first long gap of the night, the trace finally drops to deep sleep as the morning comes.',
    red: 'The pen and its trace, the only thing moving across the chart.',
    stills: [31, 82.5, 129.2, 189.6],
    frame: sleepStudy,
  },
  {
    id: 'star-trails',
    name: 'Star Trails',
    lyric: 'I lie in my bed and I think of the sky',
    idea: 'A long exposure of the night sky over a black hill. The stars turn round the pole and draw their arcs as the song goes, so the length of every trail is how long he has been lying awake.',
    motion: 'All the arcs lengthen together, smoothly, from the first line to the last. Gold dawn lines rise behind the ridge in each chorus and sink back. In the outro they climb and the stars fade into them.',
    red: 'One star whose trail falls through the night and touches the horizon on the last "meet me at the horizon".',
    stills: [40, 99, 160.5, 189.6],
    frame: starTrails,
  },
  {
    id: 'counting',
    name: 'No Counting Sheep',
    lyric: 'Just me and my thoughts, no counting sheep',
    idea: 'The night counted the way days are scratched on a cell wall: one stroke for every sung word, in fives, filling the plate row by row. It is the most literal picture of a night that will not end.',
    motion: 'Each stroke is drawn on its word’s measured onset in about 90 ms, so the wall fills in time with the singing and stops in the gaps. A window of gold light crosses the wall in each chorus and settles on it in the outro.',
    red: 'The newest stroke, always the one just sung.',
    stills: [28, 96, 154, 189.6],
    frame: counting,
  },
  {
    id: 'ceiling',
    name: 'The Ceiling',
    lyric: 'And the room breaks the silence when the house starts to creak',
    idea: 'The view from the pillow: the ceiling, its rose, the walls falling away at the edges. Moonlight through the window sits on the ceiling as a pale shape, and a hairline crack spreads out from the cornice.',
    motion: 'The window’s light slides slowly across the ceiling for the whole night and turns gold and wide in the dawns. The crack grows a little on every sung word, so it spreads with the worry and pauses when he does.',
    red: 'The crack, worrying its way across the ceiling.',
    stills: [36.5, 85.5, 112.5, 175],
    frame: ceiling,
  },
  {
    id: 'two-lights',
    name: 'Two Lights',
    lyric: 'Meet me at the horizon',
    idea: 'One horizon line over a dark engraved sea, with two lights on it: his in red from the left and yours in gold from the right. The whole video is whether they meet.',
    motion: 'The lights close through the verses and nearly touch on the first "meet me at the horizon". They drift apart again while he misses the way things used to be, then meet on the last one. The water trembles on every word and the night lines thin as the dawn comes.',
    red: 'His light, travelling the horizon towards hers.',
    stills: [30.5, 100, 128.5, 190.5],
    frame: twoLights,
  },
]
