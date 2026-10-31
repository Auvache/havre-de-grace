/*
 * Ghost — five visualizers for helplessness.
 *
 * Track ten. Second ink: ghost grey. Red is the one thing that will not be
 * stopped: the fires behind the glass, the needle, the step being danced
 * alone, the burning edge of the page, the match.
 */
import { PLATE, CX, CY, INK, PAPER, RED, SECOND_INK } from './sheet.mjs'
import { rng, r, clamp01, lerp, ramp, decay, easeOut, easeInOut } from '../../../shared/video/kit.mjs'
import { land } from '../../../shared/video/album.mjs'

const GREY = SECOND_INK.ghost
const X0 = PLATE.x
const Y0 = PLATE.y
const X1 = PLATE.x + PLATE.w
const Y1 = PLATE.y + PLATE.h
const frac = (v) => v - Math.floor(v)

const WORDS = new WeakMap()
function words(score) {
  if (!WORDS.has(score)) {
    WORDS.set(score, score.lines.flatMap((l) => l.words.map((w, i) => ({
      ...w, line: l.index, end: i < l.words.length - 1 ? l.words[i + 1].t : l.end + 0.35,
    }))))
  }
  return WORDS.get(score)
}
function pulse(score, time, half = 0.3) {
  let sum = 0
  for (const w of words(score)) {
    if (w.t > time) break
    if (time - w.t < half * 8) sum += decay(time, w.t, half)
  }
  return sum
}
const isFire = (w) => /fire|burns/i.test(w.text)

/* A flame: three tongues, flickering. (x, y) is its foot; h its height. */
function flame(x, y, h, w, time, seed) {
  const f = (k) => 1 + 0.12 * Math.sin(time * (9 + k) + seed * 3.1 + k)
  const t1 = h * f(0)
  const t2 = h * 0.62 * f(1)
  const t3 = h * 0.5 * f(2)
  const sway = Math.sin(time * 2.3 + seed) * w * 0.25
  return `M${r(x - w)} ${r(y)} C${r(x - w * 1.1)} ${r(y - h * 0.3)} ${r(x - w * 0.7)} ${r(y - t2 * 0.8)} ${r(x - w * 0.55 + sway * 0.5)} ${r(y - t2)}`
    + ` C${r(x - w * 0.45)} ${r(y - t2 * 0.6)} ${r(x - w * 0.2)} ${r(y - t1 * 0.6)} ${r(x + sway)} ${r(y - t1)}`
    + ` C${r(x + w * 0.2)} ${r(y - t1 * 0.6)} ${r(x + w * 0.4)} ${r(y - t3 * 0.6)} ${r(x + w * 0.6 + sway * 0.5)} ${r(y - t3)}`
    + ` C${r(x + w * 0.8)} ${r(y - t3 * 0.5)} ${r(x + w * 1.1)} ${r(y - h * 0.2)} ${r(x + w)} ${r(y)} Z`
}

/* ── A · The city through the glass ───────────────────────────────── */

const CITY = (() => {
  const rand = rng(23)
  const near = []
  const far = []
  for (let x = X0 - 20; x < X1 + 20;) {
    const w = 70 + rand() * 110
    near.push({ x, w, h: 170 + rand() * 300 + (rand() < 0.15 ? 120 : 0) })
    x += w + 6 + rand() * 14
  }
  for (let x = X0 - 40; x < X1 + 40;) {
    const w = 90 + rand() * 120
    far.push({ x, w, h: 300 + rand() * 280 })
    x += w
  }
  // Fires catch one after another, on the burning words and then on their own.
  const order = [7, 3, 10, 5, 12, 1, 8, 14, 4, 11, 2, 9].filter((i) => i < near.length)
  return { near, far, order }
})()

function city({ time, score, uid }) {
  const ground = Y1 - 60
  const all = words(score)
  const fireTimes = all.filter(isFire).map((w) => w.t)
  let out = `<defs><pattern id="${uid}-win" patternUnits="userSpaceOnUse" width="26" height="34"><rect x="8" y="10" width="9" height="13" fill="${PAPER}" opacity="0.8"/></pattern>
<pattern id="${uid}-haze" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(35)"><line x1="0" y1="4" x2="8" y2="4" stroke="${GREY}" stroke-width="1.2"/></pattern></defs>`
  // Sky hatched in grey as the smoke thickens.
  const smoke = ramp(time, 38, 190)
  out += `<rect x="${X0}" y="${Y0}" width="${PLATE.w}" height="${PLATE.h}" fill="url(#${uid}-haze)" opacity="${r(0.25 + 0.6 * smoke, 2)}"/>`
  let far = ''
  for (const b of CITY.far) far += `M${r(b.x)} ${ground}V${r(ground - b.h)}H${r(b.x + b.w)}V${ground}Z`
  out += `<path d="${far}" fill="${GREY}" opacity="0.6"/>`
  // Fires, then their smoke, behind the near row.
  let fires = ''
  let plumes = ''
  CITY.order.forEach((bi, k) => {
    const at = fireTimes[k * 2] ?? (38 + k * 13)
    const grow = easeOut(ramp(time, at, at + 14))
    if (grow <= 0) return
    const b = CITY.near[bi]
    const fx = b.x + b.w / 2
    const fy = ground - b.h + 2
    const h = (60 + 170 * grow) * (1 + 0.25 * Math.min(pulse(score, time, 0.25), 1.5))
    let d = ''
    for (let s = 0; s <= 10; s++) {
      const u = s / 10
      d += `${d ? 'L' : 'M'}${r(fx + u * 260 * grow + Math.sin(u * 5 + time * 0.8 + k) * 30 * u)} ${r(fy - h * 0.6 - u * 420 * grow)}`
    }
    plumes += `<path d="${d}" fill="none" stroke="${GREY}" stroke-width="${r(30 + 50 * grow)}" stroke-linecap="round" opacity="0.55"/>`
    fires += `<path d="${flame(fx, fy, h, b.w * 0.5, time, k)}" fill="${RED}"/>`
  })
  out += plumes + fires
  let near = ''
  for (const b of CITY.near) near += `M${r(b.x)} ${ground}V${r(ground - b.h)}H${r(b.x + b.w)}V${ground}Z`
  out += `<path d="${near}" fill="${INK}"/><path d="${near}" fill="url(#${uid}-win)"/>`
  out += `<rect x="${X0}" y="${ground}" width="${PLATE.w}" height="${Y1 - ground}" fill="${INK}"/>`
  // The window: frame, mullions, a sill, glints on the glass.
  const fw = 40
  out += `<path d="M${X0} ${Y0}H${X1}V${Y1}H${X0}Z M${X0 + fw} ${Y0 + fw}V${Y1 - fw - 30}H${X1 - fw}V${Y0 + fw}Z" fill="${PAPER}" fill-rule="evenodd"/>`
  out += `<rect x="${X0 + fw}" y="${Y0 + fw}" width="${PLATE.w - 2 * fw}" height="${PLATE.h - 2 * fw - 30}" fill="none" stroke="${INK}" stroke-width="3"/>`
  out += `<rect x="${X0 + fw}" y="${CY - 44}" width="${PLATE.w - 2 * fw}" height="26" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>`
  out += `<rect x="${CX - 14}" y="${Y0 + fw}" width="28" height="${PLATE.h - 2 * fw - 30}" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>`
  out += `<rect x="${X0 + 6}" y="${Y0 + 6}" width="${PLATE.w - 12}" height="${PLATE.h - 12}" fill="none" stroke="${INK}" stroke-width="2"/>`
  out += `<rect x="${X0 + 10}" y="${Y1 - fw - 30}" width="${PLATE.w - 20}" height="30" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>`
  for (const [x, y] of [[X0 + 140, Y0 + 80], [CX + 120, Y0 + 70], [X0 + 200, CY + 20], [CX + 220, CY + 30]]) {
    out += `<line x1="${x}" y1="${y + 90}" x2="${x + 90}" y2="${y}" stroke="${PAPER}" stroke-width="5" opacity="0.7"/><line x1="${x + 22}" y1="${y + 96}" x2="${x + 100}" y2="${y + 18}" stroke="${PAPER}" stroke-width="2" opacity="0.7"/>`
  }
  // A hand on the glass, from "I'd hold you close", that stays.
  const hand = land(time, 99.45, 1.2)
  if (hand > 0) {
    const hx = CX + 330
    const hy = CY + 170
    let g = `<ellipse cx="0" cy="0" rx="58" ry="66"/>`
    for (const [a, l] of [[-30, 74], [-10, 92], [8, 98], [26, 84]]) {
      g += `<rect x="-13" y="${-l}" width="26" height="${l + 14}" rx="13" transform="rotate(${a}) translate(0 -48)"/>`
    }
    g += `<rect x="-14" y="-70" width="28" height="80" rx="14" transform="translate(-40 6) rotate(-58)"/>`
    out += `<g transform="translate(${hx} ${hy}) rotate(-8) scale(1.25)" fill="${GREY}" opacity="${r(0.6 * hand, 2)}">${g}</g>`
  }
  return out
}

/* ── B · The amplifier's meter ────────────────────────────────────── */

const SCALE = [['20', 0], ['10', 0.2], ['7', 0.32], ['5', 0.42], ['3', 0.54], ['2', 0.61], ['1', 0.68], ['0', 0.76], ['1', 0.84], ['2', 0.92], ['3', 1]]

function level(score, time) {
  let v = 0.08 + 0.05 * Math.sin(time * 3.1) + 0.04 * Math.sin(time * 7.7)
  for (const w of words(score)) {
    if (w.t > time) break
    const age = time - w.t
    if (age > 3) continue
    const amp = isFire(w) ? 1.5 : 0.48 + 0.16 * ((w.text.length % 4) / 3)
    v += amp * (1 - Math.exp(-age / 0.05)) * Math.exp(-age / 0.5)
  }
  return Math.min(v, 1.02)
}

function meter({ time, score, uid }) {
  const px = CX
  const py = Y1 + 120
  const R = 640
  const ang = (pos) => (-50 + 100 * pos) * Math.PI / 180
  const at = (pos, rad) => [px + Math.sin(ang(pos)) * rad, py - Math.cos(ang(pos)) * rad]
  let out = `<defs><pattern id="${uid}-hot" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)"><line x1="0" y1="3.5" x2="7" y2="3.5" stroke="${INK}" stroke-width="2.2"/></pattern></defs>`
  // The housing, grey, and the face.
  out += `<rect x="${X0}" y="${Y0}" width="${PLATE.w}" height="${PLATE.h}" fill="${GREY}"/>`
  for (let i = 0; i < 60; i++) out += `<line x1="${X0}" y1="${Y0 + i * 13 + 6}" x2="${X1}" y2="${Y0 + i * 13 + 6}" stroke="${INK}" stroke-width="0.6" opacity="0.25"/>`
  out += `<rect x="${X0 + 90}" y="${Y0 + 60}" width="${PLATE.w - 180}" height="${PLATE.h - 100}" rx="18" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>`
  for (const [x, y] of [[X0 + 45, Y0 + 40], [X1 - 45, Y0 + 40], [X0 + 45, Y1 - 40], [X1 - 45, Y1 - 40]]) {
    out += `<circle cx="${x}" cy="${y}" r="13" fill="${PAPER}" stroke="${INK}" stroke-width="2"/><line x1="${x - 9}" y1="${y - 4}" x2="${x + 9}" y2="${y + 4}" stroke="${INK}" stroke-width="2"/>`
  }
  // The scale.
  const arc = (p0, p1, rad) => { const [a, b] = at(p0, rad); const [c, d] = at(p1, rad); return `M${r(a)} ${r(b)} A${rad} ${rad} 0 0 1 ${r(c)} ${r(d)}` }
  out += `<path d="${arc(0, 0.76, R)}" fill="none" stroke="${INK}" stroke-width="4"/>`
  const [h0x, h0y] = at(0.76, R)
  const [h1x, h1y] = at(1, R)
  const [h2x, h2y] = at(1, R + 34)
  const [h3x, h3y] = at(0.76, R + 34)
  out += `<path d="M${r(h0x)} ${r(h0y)} A${R} ${R} 0 0 1 ${r(h1x)} ${r(h1y)} L${r(h2x)} ${r(h2y)} A${R + 34} ${R + 34} 0 0 0 ${r(h3x)} ${r(h3y)} Z" fill="url(#${uid}-hot)" stroke="${INK}" stroke-width="2"/>`
  for (let i = 0; i <= 40; i++) {
    const p = i / 40
    const [a, b] = at(p, R)
    const [c, d] = at(p, R - (i % 5 === 0 ? 30 : 14))
    out += `<line x1="${r(a)}" y1="${r(b)}" x2="${r(c)}" y2="${r(d)}" stroke="${INK}" stroke-width="${i % 5 === 0 ? 2.4 : 1.2}"/>`
  }
  SCALE.forEach(([label, p], i) => {
    const [a, b] = at(p, R + 70)
    const sign = i === 0 || i < 7 ? '−' : i > 7 ? '+' : ''
    out += `<text x="${r(a)}" y="${r(b + 12)}" font-size="34" font-weight="500" fill="${INK}" text-anchor="middle">${sign}${label}</text>`
  })
  out += `<path d="${arc(0, 1, R - 120)}" fill="none" stroke="${INK}" stroke-width="1.4"/>`
  for (let i = 0; i <= 10; i++) {
    const [a, b] = at(i / 10 * 0.76, R - 120)
    const [c, d] = at(i / 10 * 0.76, R - 136)
    out += `<line x1="${r(a)}" y1="${r(b)}" x2="${r(c)}" y2="${r(d)}" stroke="${INK}" stroke-width="1.4"/>`
  }
  out += `<text x="${CX}" y="${Y1 - 180}" font-size="110" font-weight="700" fill="${INK}" text-anchor="middle" letter-spacing="10">VU</text>`
  // Ghosts of the needle, where it was a moment ago.
  for (let k = 6; k >= 1; k--) {
    const p = level(score, time - k * 0.07)
    const [a, b] = at(p, R + 10)
    out += `<line x1="${px}" y1="${py}" x2="${r(a)}" y2="${r(b)}" stroke="${GREY}" stroke-width="4" opacity="${r(0.8 - k * 0.1, 2)}"/>`
  }
  const p = level(score, time)
  const [nx, ny] = at(p, R + 14)
  out += `<line x1="${px}" y1="${py}" x2="${r(nx)}" y2="${r(ny)}" stroke="${RED}" stroke-width="4.5"/>`
  out += `<ellipse cx="${CX}" cy="${Y1 - 40}" rx="360" ry="70" fill="${INK}"/>`
  return out
}

/* ── C · The dance card ───────────────────────────────────────────── */

const SOLE = 'M0 -36 C13 -36 15 -14 12 2 C10 10 -10 10 -12 2 C-15 -14 -13 -36 0 -36 Z M0 16 C9 16 10 32 0 34 C-10 32 -9 16 0 16 Z'

function dance({ time, score, uid }) {
  const all = words(score)
  const cx = CX + 40
  const cy = CY + 60
  const ax = 580
  const ay = 215
  let out = ''
  // The printed sheet: title, legend, the floor's line of dance.
  out += `<text x="${X0 + 60}" y="${Y0 + 66}" font-size="30" font-weight="700" letter-spacing="6" fill="${INK}">THE WALTZ · BOX STEP</text>`
  out += `<text x="${X0 + 60}" y="${Y0 + 98}" font-size="20" font-weight="400" letter-spacing="3" fill="${INK}" opacity="0.7">FIG. 10 — FOR TWO</text>`
  out += `<g transform="translate(${X1 - 300} ${Y0 + 66}) scale(0.55)"><path d="${SOLE}" fill="${INK}"/></g><text x="${X1 - 278}" y="${Y0 + 74}" font-size="20" font-weight="500" letter-spacing="3" fill="${INK}">LEAD</text>`
  out += `<g transform="translate(${X1 - 160} ${Y0 + 66}) scale(0.55)"><path d="${SOLE}" fill="none" stroke="${GREY}" stroke-width="3"/></g><text x="${X1 - 138}" y="${Y0 + 74}" font-size="20" font-weight="500" letter-spacing="3" fill="${GREY}">FOLLOW</text>`
  out += `<ellipse cx="${cx}" cy="${cy}" rx="${ax}" ry="${ay}" fill="none" stroke="${INK}" stroke-width="1" stroke-dasharray="2 10" opacity="0.6"/>`
  const pos = (k) => {
    const a = Math.PI / 2 + k * 0.15
    return { x: cx + Math.cos(a) * ax, y: cy + Math.sin(a) * ay, tan: Math.atan2(Math.cos(a) * ay, -Math.sin(a) * ax) }
  }
  let n = 0
  while (n < all.length && all[n].t <= time) n++
  const first = Math.max(0, n - 22)
  let prints = ''
  for (let k = first; k < n; k++) {
    const age = n - 1 - k
    const fade = clamp01(1 - age / 22)
    const grow = land(time, all[k].t, 0.2)
    const p = pos(k)
    const deg = (p.tan * 180) / Math.PI + 90
    const side = k % 2 ? 1 : -1
    const nx = Math.cos(p.tan + Math.PI / 2)
    const ny = Math.sin(p.tan + Math.PI / 2)
    const lx = p.x + nx * side * 30
    const ly = p.y + ny * side * 30
    prints += `<g transform="translate(${r(lx)} ${r(ly)}) rotate(${r(deg)}) scale(${r(1.6 * grow, 3)})" opacity="${r(fade, 2)}"><path d="${SOLE}" fill="${INK}"/></g>`
    prints += `<text x="${r(lx + nx * side * 50)}" y="${r(ly + ny * side * 50 + 9)}" font-size="26" font-weight="600" fill="${INK}" text-anchor="middle" opacity="${r(fade * grow, 2)}">${(k % 3) + 1}</text>`
    // Where a partner would step: facing, inside the line, never filled.
    const il = Math.hypot(cx - p.x, cy - p.y) || 1
    const gx = p.x + ((cx - p.x) / il) * (128 - side * 32)
    const gy = p.y + ((cy - p.y) / il) * (128 - side * 32)
    prints += `<g transform="translate(${r(gx)} ${r(gy)}) rotate(${r(deg + 180)}) scale(1.6)" opacity="${r(fade * grow, 2)}"><path d="${SOLE}" fill="none" stroke="${GREY}" stroke-width="1.8"/></g>`
  }
  out += prints
  // Red: the step being taken now.
  if (n >= 2) {
    const a = pos(n - 2)
    const b = pos(n - 1)
    const u = easeOut(ramp(time, all[n - 1].t, all[n - 1].t + 0.35))
    const mx = (a.x + b.x) / 2 + (cx - (a.x + b.x) / 2) * -0.12
    const my = (a.y + b.y) / 2 + (cy - (a.y + b.y) / 2) * -0.12
    const ex = lerp(a.x, b.x, u)
    const ey = lerp(a.y, b.y, u)
    out += `<path d="M${r(a.x)} ${r(a.y)} Q${r(mx)} ${r(my)} ${r(ex)} ${r(ey)}" fill="none" stroke="${RED}" stroke-width="3.5" stroke-dasharray="9 7"/>`
    const ang = Math.atan2(b.y - a.y, b.x - a.x)
    out += `<path d="M${r(ex + Math.cos(ang) * 14)} ${r(ey + Math.sin(ang) * 14)} L${r(ex + Math.cos(ang + 2.5) * 14)} ${r(ey + Math.sin(ang + 2.5) * 14)} L${r(ex + Math.cos(ang - 2.5) * 14)} ${r(ey + Math.sin(ang - 2.5) * 14)} Z" fill="${RED}"/>`
  }
  return out
}

/* ── D · The burning manuscript ───────────────────────────────────── */

const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)

function manuscript({ time, score, uid }) {
  const all = words(score)
  const systems = 6
  const per = Math.ceil(all.length / systems)
  const sx0 = X0 + 90
  const sx1 = X1 - 70
  const gap = 13
  const top = Y0 + 110
  const pitch = (PLATE.h - 150) / systems
  let out = `<text x="${CX}" y="${Y0 + 62}" font-size="34" font-weight="300" font-style="italic" fill="${INK}" text-anchor="middle" letter-spacing="2">Ghost</text>`
  out += `<text x="${X1 - 70}" y="${Y0 + 62}" font-size="18" font-weight="400" fill="${INK}" text-anchor="end" opacity="0.7">(not by choice)</text>`
  let staves = ''
  for (let s = 0; s < systems; s++) {
    const y = top + s * pitch
    for (let l = 0; l < 5; l++) staves += `M${sx0} ${r(y + l * gap)}H${sx1}`
    staves += `M${sx0} ${r(y)}V${r(y + 4 * gap)}M${sx1} ${r(y)}V${r(y + 4 * gap)}`
    out += `<text x="${sx0 + 26}" y="${r(y + gap * 1.8)}" font-size="26" font-weight="700" fill="${INK}" text-anchor="middle">3</text><text x="${sx0 + 26}" y="${r(y + gap * 3.9)}" font-size="26" font-weight="700" fill="${INK}" text-anchor="middle">4</text>`
  }
  out += `<path d="${staves}" stroke="${INK}" stroke-width="1.3" fill="none"/>`
  // A note for every word, written as it is sung.
  let notes = ''
  all.forEach((w, i) => {
    const grow = land(time, w.t, 0.15)
    if (grow <= 0) return
    const s = Math.floor(i / per)
    const j = i % per
    const y0 = top + s * pitch + 4 * gap
    const x = sx0 + 70 + j * ((sx1 - sx0 - 100) / per)
    const step = (hash(w.text) % 11) - 1
    const y = y0 - step * gap / 2
    const up = step < 4
    notes += `<ellipse cx="${r(x)}" cy="${r(y)}" rx="${r(8.5 * grow)}" ry="${r(6.2 * grow)}" transform="rotate(-22 ${r(x)} ${r(y)})" fill="${INK}"/>`
    notes += `<line x1="${r(up ? x + 7.6 : x - 7.6)}" y1="${r(y)}" x2="${r(up ? x + 7.6 : x - 7.6)}" y2="${r(up ? y - 46 * grow : y + 46 * grow)}" stroke="${INK}" stroke-width="1.8"/>`
    if (step < 0) notes += `<line x1="${r(x - 14)}" y1="${r(y0 + gap)}" x2="${r(x + 14)}" y2="${r(y0 + gap)}" stroke="${INK}" stroke-width="1.3"/>`
    if (step > 8) notes += `<line x1="${r(x - 14)}" y1="${r(y0 - 5 * gap)}" x2="${r(x + 14)}" y2="${r(y0 - 5 * gap)}" stroke="${INK}" stroke-width="1.3"/>`
    if (j % 3 === 2 && j < per - 1) {
      const bx = x + ((sx1 - sx0 - 100) / per) / 2
      notes += `<line x1="${r(bx)}" y1="${r(y0 - 4 * gap)}" x2="${r(bx)}" y2="${r(y0)}" stroke="${INK}" stroke-width="1.3"/>`
    }
  })
  out += notes
  // The fire, eating the page from the bottom up.
  const base = lerp(Y1 + 40, Y0 + 170, easeInOut(ramp(time, 36, 194)))
  const edge = (x, k = 0) => base + 22 * Math.sin(x * 0.011 + time * 0.35) + 14 * Math.sin(x * 0.027 - time * 0.6 + 1.3) + 8 * Math.sin(x * 0.061 + time * 0.9) + k
  let front = ''
  for (let x = X0 - 10; x <= X1 + 10; x += 16) front += `${front ? 'L' : 'M'}${x} ${r(edge(x))}`
  let scorch = ''
  for (let x = X0 - 10; x <= X1 + 10; x += 16) scorch += `${scorch ? 'L' : 'M'}${x} ${r(edge(x, -46))}`
  out += `<defs><pattern id="${uid}-sc" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(-40)"><line x1="0" y1="3" x2="6" y2="3" stroke="${GREY}" stroke-width="1.6"/></pattern></defs>`
  out += `<path d="${scorch} L${X1 + 10} ${Y1 + 60} L${X0 - 10} ${Y1 + 60} Z" fill="url(#${uid}-sc)"/>`
  out += `<path d="${front} L${X1 + 10} ${Y1 + 60} L${X0 - 10} ${Y1 + 60} Z" fill="${INK}"/>`
  out += `<path d="${front}" fill="none" stroke="${GREY}" stroke-width="16" stroke-linejoin="round"/>`
  out += `<path d="${front}" transform="translate(0 -9)" fill="none" stroke="${RED}" stroke-width="4" stroke-linejoin="round"/>`
  // Embers lifting off it.
  const rand = rng(4)
  for (let k = 0; k < 26; k++) {
    const x = X0 + rand() * PLATE.w
    const rate = 0.05 + rand() * 0.08
    const u = frac(time * rate + rand())
    const y = edge(x) - 20 - u * 260
    if (base > Y1 + 20) continue
    out += `<circle cx="${r(x + Math.sin(u * 6 + k) * 18)}" cy="${r(y)}" r="${r(2.4 + rand() * 2.4)}" fill="${RED}" opacity="${r(1 - u, 2)}"/>`
  }
  return out
}

/* ── E · One match ────────────────────────────────────────────────── */

function match({ time, score, uid }) {
  const top = Y0 + 210
  const bottom = Y1 + 30
  const len = bottom - top
  const lit = 20.6
  const burn = easeInOut(ramp(time, lit, 193)) * 0.86
  const out_ = easeOut(ramp(time, 193, 196))
  const fy = top + burn * len
  const sw = 44
  let out = ''
  // Rings of light, engraved, carried down with the flame.
  if (time >= lit) {
    for (let k = 1; k <= 9; k++) {
      const rr = 60 + k * 46 + Math.sin(time * 2 + k) * 4
      out += `<circle cx="${CX}" cy="${r(fy - 60)}" r="${r(rr)}" fill="none" stroke="${GREY}" stroke-width="${r(3.2 - k * 0.25, 2)}" opacity="${r((1 - out_) * (1 - k * 0.08), 2)}"/>`
    }
  }
  // The unburnt stick, grained.
  out += `<rect x="${CX - sw / 2}" y="${r(fy)}" width="${sw}" height="${r(bottom - fy)}" fill="${PAPER}" stroke="${INK}" stroke-width="2.5"/>`
  for (let k = 1; k < 6; k++) out += `<line x1="${CX - sw / 2 + k * 7.3}" y1="${r(fy + 14)}" x2="${CX - sw / 2 + k * 7.3}" y2="${bottom}" stroke="${GREY}" stroke-width="1.2"/>`
  // The burnt part: thinner, black, curling away.
  if (time >= lit) {
    let left = ''
    let right = ''
    const n = 16
    for (let i = 0; i <= n; i++) {
      const y = lerp(fy, top, i / n)
      const d = fy - y
      const bend = (d / 300) ** 2 * 70
      const w = lerp(sw * 0.42, sw * 0.3, i / n)
      left += `${i ? 'L' : 'M'}${r(CX - w - bend)} ${r(y)}`
      right = `L${r(CX + w - bend)} ${r(y)}` + right
    }
    out += `<path d="${left}${right.replace(/^L/, 'L')}Z" fill="${INK}"/>`
    const tb = ((fy - top) / 300) ** 2 * 70
    out += `<ellipse cx="${r(CX - tb)}" cy="${top - 4}" rx="16" ry="20" fill="${INK}"/>`
    out += `<rect x="${CX - sw / 2}" y="${r(fy - 4)}" width="${sw}" height="10" fill="${RED}"/>`
  } else {
    out += `<ellipse cx="${CX}" cy="${top - 8}" rx="${sw / 2 + 6}" ry="30" fill="${INK}"/>`
  }
  // The flame, and the smoke above it.
  if (time >= lit && out_ < 1) {
    const h = (240 + 70 * Math.min(pulse(score, time, 0.3), 1.5)) * easeOut(ramp(time, lit, lit + 0.6)) * (1 - out_)
    out += `<path d="${flame(CX, fy + 10, h, 58 * (1 - out_ * 0.6), time, 1)}" fill="${RED}"/>`
    out += `<path d="${flame(CX, fy + 4, h * 0.42, 22, time + 0.4, 2)}" fill="${PAPER}"/>`
  }
  if (time >= lit) {
    const sy0 = fy - (out_ < 1 ? 220 : 40)
    for (const k of [0, 1]) {
      let d = ''
      for (let y = sy0; y > Y0 - 20; y -= 14) {
        const u = (sy0 - y) / 400
        d += `${d ? 'L' : 'M'}${r(CX + k * 10 + Math.sin(y * 0.02 + time * 1.4 + k * 2) * (8 + u * 40))} ${r(y)}`
      }
      out += `<path d="${d}" fill="none" stroke="${GREY}" stroke-width="${2.5 + out_ * 3}"/>`
    }
  }
  return out
}

export const CONCEPTS = [
  {
    id: 'city',
    name: 'The City Through Glass',
    lyric: 'The city burns and I’m a ghost',
    idea: 'A window, and through it a skyline catching fire one roof at a time. The whole film is on the other side of the glass.',
    motion: 'Each “burns” and “fire” in the lyric lights another roof, and flames jump on the words. Smoke hatches the sky more thickly each block. On “I’d hold you close” a grey handprint appears on the pane and stays there.',
    red: 'The fires. Nothing else in the room is red.',
    stills: [40, 101, 131, 184],
    frame: city,
  },
  {
    id: 'meter',
    name: 'Amplifier Meter',
    lyric: 'Amplifiers just make a noise',
    idea: 'The VU meter of an amplifier, filling the frame. The needle is the voice. It throws itself at the end of the scale and the scale doesn’t care.',
    motion: 'The needle kicks on every sung word with real meter ballistics and falls back. On “fire” it pins hard in the hatched zone. Ghosts of where it just was trail behind it in grey.',
    red: 'The needle.',
    stills: [22, 83, 130.45, 183.3],
    frame: meter,
  },
  {
    id: 'dance',
    name: 'The Dance Card',
    lyric: 'If I had legs, we could learn to dance',
    idea: 'A printed dance-step diagram. Inked footprints for the lead go round the floor one step per word, and every partner step is a faint grey outline that never fills in.',
    motion: 'A step lands on every sung word, counted one-two-three, round a long oval for the whole song. The oldest steps fade behind, so the dance never ends, and nobody ever dances the other half.',
    red: 'The step being taken now: a dashed arrow from the last print to the new one.',
    stills: [30, 92, 115.5, 165],
    frame: dance,
  },
  {
    id: 'manuscript',
    name: 'The Burning Manuscript',
    lyric: 'When I write songs, it’s not by choice',
    idea: 'A page of staff paper. The song writes itself onto it note by note from the top while the page burns up from the bottom.',
    motion: 'Every sung word puts a note on the staff. From the first “burns” the edge climbs: slowly in the first block, past the middle by “I’d play for you if I had hands”, and onto the last notes by the end.',
    red: 'The burning edge, with embers lifting off it.',
    stills: [31, 92, 122, 183],
    frame: manuscript,
  },
  {
    id: 'match',
    name: 'One Match',
    lyric: 'But you’re on fire and I’m a ghost',
    idea: 'One match, struck at the first word, burning down for the whole song. Nothing can be done about it.',
    motion: 'The flame breathes with the voice and creeps down the stick at a steady rate. The burnt wood blackens and curls behind it, engraved rings of light go down with it, and it goes out after the last line, leaving smoke.',
    red: 'The flame and the glowing quick of the wood.',
    stills: [22, 82, 131, 187.5],
    frame: match,
  },
]
