/*
 * Ship to Stockholm — five visualizers for "moving on".
 *
 * Track nine. Second ink: ice. Red is the one thing that is going: the wake
 * behind the ship, Stockholm's row climbing the board, the track through the
 * ice, the word on the wire, the bead on the rope.
 */
import { PLATE, CX, CY, INK, PAPER, RED, SECOND_INK, songAt } from './sheet.mjs'
import { rng, r, wobbleCircle, clamp01, lerp, ramp, decay, easeOut, easeInOut } from '../../../shared/video/kit.mjs'
import { easeCamera } from '../../../shared/video/album.mjs'

const ICE = SECOND_INK['ship-to-stockholm']
const X0 = PLATE.x
const Y0 = PLATE.y
const X1 = PLATE.x + PLATE.w
const Y1 = PLATE.y + PLATE.h
const frac = (v) => v - Math.floor(v)

/* Every sung word, flat, with when it ends (the next word, or the line's end). */
const WORDS = new WeakMap()
function words(score) {
  if (!WORDS.has(score)) {
    WORDS.set(score, score.lines.flatMap((l) => l.words.map((w, i) => ({
      ...w, line: l.index, end: i < l.words.length - 1 ? l.words[i + 1].t : l.end + 0.35,
    }))))
  }
  return WORDS.get(score)
}

/* How hard the voice is hitting now: recent onsets, decayed. */
function pulse(score, time, half = 0.3) {
  let sum = 0
  for (const w of words(score)) {
    if (w.t > time) break
    if (time - w.t < half * 8) sum += decay(time, w.t, half)
  }
  return sum
}

/* Progress that moves with the words but never stops: 60% words sung, 40% clock. */
function journey(score, time, from = 28, to = 226) {
  const all = words(score)
  let sung = 0
  for (const w of all) {
    if (w.t > time) break
    sung += clamp01((time - w.t) / Math.max(w.end - w.t, 0.05))
  }
  return clamp01(0.6 * (sung / all.length) + 0.4 * ramp(time, from, to))
}

/* ── A · Looking astern ────────────────────────────────────────────── */

const COAST = [[-1, 0], [-0.9, 0.18], [-0.74, 0.3], [-0.6, 0.26], [-0.44, 0.46], [-0.3, 0.42], [-0.18, 0.58],
  [-0.04, 0.5], [0.1, 0.38], [0.22, 0.36], [0.36, 0.3], [0.5, 0.22], [0.66, 0.24], [0.82, 0.1], [1, 0]]

function astern({ time, score, uid }) {
  const hz = Y0 + 236
  const p = songAt(score, time)
  const s = 1 / (1 + 6 * p)
  const sink = easeInOut(ramp(time, 226, 252))
  const swell = 1 + 0.5 * Math.min(pulse(score, time, 0.35), 2)
  let out = ''

  // Sky: engraved lines, closer towards the horizon.
  for (let i = 0; i < 22; i++) {
    const y = hz - 6 - i ** 1.45 * 3.1
    out += `<line x1="${X0}" y1="${r(y)}" x2="${X1}" y2="${r(y)}" stroke="${INK}" stroke-width="${r(0.9 - i * 0.025, 2)}" opacity="0.45"/>`
  }

  // The land, going.
  const lw = 820 * s
  const lh = 230 * s * (1 - sink)
  if (lh > 0.3) {
    let d = `M${r(CX - lw)} ${hz}`
    for (const [u, v] of COAST) d += ` L${r(CX + u * lw)} ${r(hz - v * lh)}`
    out += `<path d="${d} Z" fill="${INK}"/>`
    // The lighthouse, and its light going out with the land: a flash on each line.
    const lx = CX + 0.36 * lw
    const ly = hz - 0.3 * lh
    const th = 150 * s * (1 - sink)
    out += `<path d="M${r(lx - 11 * s)} ${r(ly + 1)} L${r(lx - 6 * s)} ${r(ly - th)} L${r(lx + 6 * s)} ${r(ly - th)} L${r(lx + 11 * s)} ${r(ly + 1)} Z" fill="${INK}"/>`
    const flash = (1 - p * 0.8) * (1 - sink) * (0.35 + 0.65 * Math.min(pulse(score, time, 0.6), 1))
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2 + 0.1
      const len = (14 + 90 * flash) * Math.max(s, 0.25)
      out += `<line x1="${r(lx + Math.cos(a) * 8 * s)}" y1="${r(ly - th - 4 * s + Math.sin(a) * 8 * s)}" x2="${r(lx + Math.cos(a) * len)}" y2="${r(ly - th - 4 * s + Math.sin(a) * len * 0.6)}" stroke="${INK}" stroke-width="0.9" opacity="${r(0.25 + 0.6 * flash, 2)}"/>`
    }
  }
  out += `<line x1="${X0}" y1="${hz}" x2="${X1}" y2="${hz}" stroke="${INK}" stroke-width="1.6"/>`

  // Water, running away to the horizon. y = hz + D / z.
  const D = Y1 + 40 - hz
  const wake = (y) => (y - hz) * 0.3
  let water = ''
  let foam = ''
  const N = 40
  for (let i = 0; i < N; i++) {
    const u = frac(i / N + time * 0.018)
    const z = Math.exp(u * Math.log(70))
    const y = hz + D / z
    const amp = (11 / z + 0.6) * swell
    const sw = Math.max(0.5, 3.2 / Math.sqrt(z))
    let d = ''
    for (let x = X0 - 20; x <= X1 + 28; x += 48) {
      const yy = y + Math.sin(x * 0.011 * Math.sqrt(z) + i * 1.7 + time * 0.9) * amp
      d += `${d ? 'L' : 'M'}${x} ${r(yy)}`
    }
    water += `<path d="${d}" stroke="${ICE}" stroke-width="${r(sw, 2)}" fill="none"/>`
    foam += `<path d="${d}" stroke="${INK}" stroke-width="${r(sw * 0.7, 2)}" fill="none" stroke-dasharray="${r(14 / z + 3)} ${r(22 / z + 4)}" stroke-dashoffset="${r(i * 13)}"/>`
  }
  const V = `M${CX} ${hz} L${r(CX - wake(Y1 + 40))} ${Y1 + 40} L${r(CX + wake(Y1 + 40))} ${Y1 + 40} Z`
  out += `<defs><clipPath id="${uid}-v"><path d="${V}"/></clipPath><clipPath id="${uid}-nv"><path d="M${X0} ${hz}H${X1}V${Y1 + 40}H${X0}Z ${V}" clip-rule="evenodd"/></clipPath></defs>`
  out += `<g clip-path="url(#${uid}-nv)">${water}</g><g clip-path="url(#${uid}-v)">${foam}</g>`

  // The wake's edges, feathered.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 26; i++) {
      const u = frac(i / 26 + time * 0.018)
      const z = Math.exp(u * Math.log(70))
      const y = hz + D / z
      const x = CX + side * wake(y)
      const len = 150 / z + 3
      out += `<path d="M${r(x - side * len * 0.5)} ${r(y + len * 0.12)} Q${r(x + side * len * 0.2)} ${r(y - len * 0.1)} ${r(x + side * len)} ${r(y + len * 0.05)}" fill="none" stroke="${INK}" stroke-width="${r(Math.max(0.6, 3 / Math.sqrt(z)), 2)}"/>`
    }
  }

  // Red: the way already come, running back to the land.
  out += `<path d="M${CX - 7} ${Y1 + 40} L${CX - 0.6} ${hz} L${CX + 0.6} ${hz} L${CX + 7} ${Y1 + 40} Z" fill="${RED}"/>`

  // The taffrail.
  const rail = (x) => Y1 - 118 + ((x - CX) / (PLATE.w / 2)) ** 2 * 60
  let rd = ''
  for (let x = X0 - 10; x <= X1 + 10; x += 30) rd += `${rd ? 'L' : 'M'}${x} ${r(rail(x))}`
  out += `<path d="${rd}" stroke="${INK}" stroke-width="9" fill="none" stroke-linecap="round"/>`
  out += `<path d="${rd}" transform="translate(0 30)" stroke="${INK}" stroke-width="3" fill="none"/>`
  for (let x = X0 + 40; x < X1; x += 110) out += `<line x1="${x}" y1="${r(rail(x))}" x2="${x}" y2="${Y1}" stroke="${INK}" stroke-width="7"/>`
  out += `<path d="M${X0} ${Y1 - 14} Q${CX} ${Y1 - 34} ${X1} ${Y1 - 14} L${X1} ${Y1} L${X0} ${Y1} Z" fill="${INK}"/>`
  return out
}

/* ── B · The departure board ──────────────────────────────────────── */

const DEPARTURES = [
  { dest: 'HELSINKI', berth: '4', at: 57.6 },
  { dest: 'TALLINN', berth: '2', at: 87.2 },
  { dest: 'RIGA', berth: '7', at: 111.6 },
  { dest: 'MARIEHAMN', berth: '3', at: 139.9 },
  { dest: 'GDANSK', berth: '5', at: 177.9 },
  { dest: 'KOBENHAVN', berth: '1', at: 206.0 },
  { dest: 'TURKU', berth: '6', at: 217.9 },
  { dest: 'STOCKHOLM', berth: '9', at: 225.6, ours: true },
]
const clockAt = (t) => {
  const m = 21 * 60 + 30 + (t / 256) * 58
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.floor(m % 60)).padStart(2, '0')}`
}
function remark(row, t) {
  if (t >= row.at) return 'DEPARTED'
  if (row.ours && t >= 217.9) return 'FINAL CALL'
  if (t >= row.at - (row.ours ? 17.9 : 24)) return 'BOARDING'
  return 'ON TIME'
}
/* The status flaps flip: the text squashes out and back over 0.36 s on a change. */
function flip(row, t) {
  const changes = row.ours ? [row.at - 17.9, 217.9, row.at] : [row.at - 24, row.at]
  for (const c of changes) if (t >= c - 0.18 && t < c + 0.18) return Math.abs(Math.cos(Math.PI * (t - c + 0.18) / 0.36))
  return 1
}

function board({ time, uid }) {
  const bx = X0 + 64
  const by = Y0 + 56
  const bw = PLATE.w - 128
  const bh = PLATE.h - 100
  const cols = 31
  const cw = (bw - 48) / cols
  const ch = 66
  const pitch = 80
  const gx = bx + 24
  const head = by + 108
  let out = `<defs><pattern id="${uid}-cell" patternUnits="userSpaceOnUse" x="${r(gx)}" y="${head}" width="${r(cw, 3)}" height="${pitch}">
<rect x="2" y="0" width="${r(cw - 4, 2)}" height="${ch}" rx="4" fill="#2c2924"/><line x1="2" y1="${ch / 2}" x2="${r(cw - 2, 2)}" y2="${ch / 2}" stroke="${INK}" stroke-width="2"/></pattern>
<clipPath id="${uid}-rows"><rect x="${bx}" y="${head - 2}" width="${bw}" height="${pitch * 6}"/></clipPath></defs>`
  out += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" fill="${INK}" rx="6"/>`
  out += `<rect x="${bx + 8}" y="${by + 8}" width="${bw - 16}" height="${bh - 16}" fill="none" stroke="${ICE}" stroke-width="1.2" rx="3" opacity="0.6"/>`
  out += `<text x="${gx + 4}" y="${by + 62}" font-size="38" font-weight="600" letter-spacing="6" fill="${ICE}">AVGÅNGAR · DEPARTURES</text>`
  // The clock.
  const clock = clockAt(time)
  out += [...clock].map((c, i) => `<rect x="${r(bx + bw - 250 + i * 44)}" y="${by + 24}" width="40" height="54" rx="4" fill="#2c2924"/><line x1="${r(bx + bw - 250 + i * 44)}" y1="${by + 51}" x2="${r(bx + bw - 210 + i * 44)}" y2="${by + 51}" stroke="${INK}" stroke-width="2"/><text x="${r(bx + bw - 230 + i * 44)}" y="${by + 66}" font-size="38" font-weight="500" fill="${PAPER}" text-anchor="middle">${c}</text>`).join('')
  // Column heads.
  const labels = [['TIME', 0], ['DESTINATION', 6], ['BERTH', 18], ['REMARKS', 21]]
  for (const [l, c] of labels) out += `<text x="${r(gx + c * cw + 4)}" y="${head - 12}" font-size="15" font-weight="600" letter-spacing="3" fill="${ICE}">${l}</text>`

  // Rows glide up as each ship leaves.
  let gone = 0
  for (const row of DEPARTURES) gone += easeCamera(ramp(time, row.at + 1.6, row.at + 3.0))
  out += `<rect x="${gx}" y="${head}" width="${r(cw * cols, 2)}" height="${pitch * 6}" fill="url(#${uid}-cell)"/>`
  let rows = ''
  DEPARTURES.forEach((row, i) => {
    const slot = i - gone
    if (slot < -1 || slot > 6) return
    const y = head + slot * pitch
    const fade = clamp01(1 + slot * 1.2)
    const cells = (text, c0, fill, sy = 1) => [...text].map((ch2, k) => {
      const x = gx + (c0 + k + 0.5) * cw
      return `<text x="${r(x)}" y="${r(y + 47)}" font-size="42" font-weight="500" fill="${fill}" text-anchor="middle"${sy !== 1 ? ` transform="translate(0 ${r(y + ch / 2)}) scale(1 ${r(Math.max(sy, 0.02), 3)}) translate(0 ${r(-(y + ch / 2))})"` : ''}>${ch2}</text>`
    }).join('')
    const status = remark(row, time)
    const destFill = row.ours ? RED : PAPER
    let g = cells(clockAt(row.at), 0, PAPER) + cells(row.dest, 6, destFill) + cells(row.berth, 19, PAPER)
      + cells(status, 21, status === 'ON TIME' ? ICE : PAPER, flip(row, time))
    if (row.ours) g = `<rect x="${r(gx - 18)}" y="${r(y + 6)}" width="10" height="${ch - 12}" fill="${RED}"/>` + g
    rows += `<g opacity="${r(fade, 3)}">${g}</g>`
  })
  out += `<g clip-path="url(#${uid}-rows)">${rows}</g>`
  // The empty board, once Stockholm has gone.
  const after = easeOut(ramp(time, 229, 232))
  if (after > 0) out += `<text x="${CX}" y="${head + pitch * 3}" font-size="22" font-weight="600" letter-spacing="8" fill="${ICE}" text-anchor="middle" opacity="${r(after, 2)}">NO FURTHER DEPARTURES</text>`
  return out
}

/* ── C · The lead through the ice ─────────────────────────────────── */

const LEAD = (() => {
  const pts = []
  for (let i = 0; i <= 240; i++) {
    const u = i / 240
    pts.push([lerp(X0 + 120, X1 - 90, u) + 70 * Math.sin(u * 6.5 + 0.4), lerp(Y1 + 60, Y0 - 60, u) + 46 * Math.sin(u * 4.6 + 1.2)])
  }
  const len = [0]
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  return { pts, len, total: len[len.length - 1] }
})()

const FLOES = (() => {
  const cols = 14
  const rows = 8
  const cw = (PLATE.w + 120) / cols
  const chh = (PLATE.h + 120) / rows
  const rand = rng(91)
  const V = []
  for (let j = 0; j <= rows; j++) {
    V.push([])
    for (let i = 0; i <= cols; i++) V[j].push([X0 - 60 + i * cw + (rand() - 0.5) * cw * 0.8, Y0 - 60 + j * chh + (rand() - 0.5) * chh * 0.8])
  }
  const mid = (a, b, k) => [(a[0] + b[0]) / 2 + (k() - 0.5) * 26, (a[1] + b[1]) / 2 + (k() - 0.5) * 50]
  const H = []
  const Vv = []
  for (let j = 0; j <= rows; j++) { H.push([]); for (let i = 0; i < cols; i++) H[j].push(mid(V[j][i], V[j][i + 1], rand)) }
  for (let j = 0; j < rows; j++) { Vv.push([]); for (let i = 0; i <= cols; i++) Vv[j].push(mid(V[j][i], V[j + 1][i], rand)) }
  const floes = []
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const poly = [V[j][i], H[j][i], V[j][i + 1], Vv[j][i + 1], V[j + 1][i + 1], H[j + 1][i], V[j + 1][i], Vv[j][i]]
      const c = poly.reduce((a, p) => [a[0] + p[0] / 8, a[1] + p[1] / 8], [0, 0])
      // Nearest point on the lead.
      let best = 0
      let bd = Infinity
      LEAD.pts.forEach((p, k) => { const d = Math.hypot(p[0] - c[0], p[1] - c[1]); if (d < bd) { bd = d; best = k } })
      const p = LEAD.pts[best]
      const n = bd > 0.01 ? [(c[0] - p[0]) / bd, (c[1] - p[1]) / bd] : [1, 0]
      floes.push({ poly, c, s: LEAD.len[best] / LEAD.total, d: bd, n, spin: (rand() - 0.5) * 16, ridge: rand() < 0.4 })
    }
  }
  return floes
})()

function ice({ time, score, uid }) {
  const head = journey(score, time)
  const kick = Math.min(pulse(score, time, 0.25), 2)
  let out = `<defs><pattern id="${uid}-sea" patternUnits="userSpaceOnUse" width="10" height="7"><line x1="0" y1="3.5" x2="10" y2="3.5" stroke="${INK}" stroke-width="0.9" opacity="0.55"/></pattern></defs>`
  out += `<rect x="${X0}" y="${Y0}" width="${PLATE.w}" height="${PLATE.h}" fill="${ICE}"/><rect x="${X0}" y="${Y0}" width="${PLATE.w}" height="${PLATE.h}" fill="url(#${uid}-sea)"/>`
  let floes = ''
  for (const f of FLOES) {
    const open = clamp01((head - f.s) * 5) + 0.12 * clamp01(1 - Math.abs(head - f.s) * 12) * kick
    const fall = Math.exp(-f.d / 240)
    const push = open * (95 * fall + 6)
    const dx = f.n[0] * push
    const dy = f.n[1] * push
    const rot = f.spin * open * fall
    const inset = 0.992 - 0.03 * open
    const pts = f.poly.map(([x, y]) => [f.c[0] + (x - f.c[0]) * inset, f.c[1] + (y - f.c[1]) * inset])
    const d = 'M' + pts.map(([x, y]) => `${r(x)} ${r(y)}`).join('L') + 'Z'
    const tr = `translate(${r(dx)} ${r(dy)}) rotate(${r(rot, 2)} ${r(f.c[0])} ${r(f.c[1])})`
    floes += `<g transform="${tr}"><path d="${d}" fill="${PAPER}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>`
    if (f.ridge) {
      const q = pts.map(([x, y]) => [f.c[0] + (x - f.c[0]) * 0.72, f.c[1] + (y - f.c[1]) * 0.72])
      floes += `<path d="M${q.slice(1, 6).map(([x, y]) => `${r(x)} ${r(y)}`).join('L')}" fill="none" stroke="${ICE}" stroke-width="1.4"/>`
    }
    floes += '</g>'
  }
  out += floes
  // Red: the track behind the ship, and the ship's bow at its head.
  const upto = head * LEAD.total
  let d = ''
  let hx = LEAD.pts[0][0]
  let hy = LEAD.pts[0][1]
  for (let k = 0; k < LEAD.pts.length; k++) {
    if (LEAD.len[k] > upto) {
      const a = LEAD.pts[k - 1]
      const b = LEAD.pts[k]
      const u = (upto - LEAD.len[k - 1]) / (LEAD.len[k] - LEAD.len[k - 1])
      hx = lerp(a[0], b[0], u)
      hy = lerp(a[1], b[1], u)
      d += `L${r(hx)} ${r(hy)}`
      break
    }
    d += `${d ? 'L' : 'M'}${r(LEAD.pts[k][0])} ${r(LEAD.pts[k][1])}`
    hx = LEAD.pts[k][0]
    hy = LEAD.pts[k][1]
  }
  out += `<path d="${d}" fill="none" stroke="${RED}" stroke-width="3.2" stroke-linecap="round"/>`
  for (let k = 0; k < 3; k++) {
    const ring = frac(time * 0.7 + k / 3)
    out += `<circle cx="${r(hx)}" cy="${r(hy)}" r="${r(10 + ring * 46)}" fill="none" stroke="${INK}" stroke-width="1.2" opacity="${r(0.8 * (1 - ring), 2)}"/>`
  }
  out += `<circle cx="${r(hx)}" cy="${r(hy)}" r="8" fill="${RED}"/>`
  return out
}

/* ── D · The telegraph tape ───────────────────────────────────────── */

const MORSE = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--',
  N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
}
const TAPE = new WeakMap()
function tape(score) {
  if (TAPE.has(score)) return TAPE.get(score)
  const all = words(score)
  const marks = []
  const letters = []
  const keys = [[0, 0]]
  let u = 0
  let lastT = 0
  all.forEach((w, wi) => {
    const prev = all[wi - 1]
    const gap = prev && prev.line === w.line ? 7 : 7 + (w.t - lastT) * 1.6
    u += wi === 0 ? 40 + w.t * 1.2 : gap
    keys.push([w.t, u])
    const start = u
    for (const ch of w.text.toUpperCase().replace(/[^A-Z]/g, '')) {
      const code = MORSE[ch]
      const l0 = u
      for (const sym of code) {
        const len = sym === '.' ? 1 : 3
        marks.push({ u0: u, u1: u + len, word: wi })
        u += len + 1
      }
      letters.push({ ch, at: (l0 + u - 1) / 2, word: wi })
      u += 2
    }
    const dur = Math.min(w.end - w.t, Math.max(0.22, (u - start) * 0.03))
    keys.push([w.t + dur, u])
    lastT = w.t + dur
  })
  keys.push([score.duration, u + 60])
  const out = { marks, letters, keys }
  TAPE.set(score, out)
  return out
}

function telegraph({ time, score, uid }) {
  const { marks, letters, keys } = tape(score)
  let P = 0
  for (let k = 0; k < keys.length - 1; k++) {
    const [ta, ua] = keys[k]
    const [tb, ub] = keys[k + 1]
    if (time >= ta && time <= tb) { P = lerp(ua, ub, tb > ta ? (time - ta) / (tb - ta) : 1); break }
    if (time > tb) P = ub
  }
  const all = words(score)
  let now = -1
  for (let i = 0; i < all.length; i++) if (all[i].t <= time && time < all[i].end + 0.15) now = i
  const U = 14
  const headX = X1 - 500
  const ty = CY + 70
  const th = 190
  let out = `<defs><pattern id="${uid}-bg" patternUnits="userSpaceOnUse" width="12" height="12" patternTransform="rotate(-30)"><line x1="0" y1="6" x2="12" y2="6" stroke="${ICE}" stroke-width="1.6"/></pattern></defs>`
  out += `<rect x="${X0}" y="${Y0}" width="${PLATE.w}" height="${PLATE.h}" fill="url(#${uid}-bg)" opacity="0.7"/>`
  // The spool of blank tape, getting thinner.
  const R = lerp(190, 125, songAt(score, time))
  const sx = X1 - 240
  const sy = ty - th / 2 - R + 12
  out += `<circle cx="${sx}" cy="${r(sy)}" r="${r(R)}" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>`
  for (let k = 1; k < 9; k++) out += `<circle cx="${sx}" cy="${r(sy)}" r="${r(R * (0.32 + k * 0.08))}" fill="none" stroke="${INK}" stroke-width="0.6" opacity="0.5"/>`
  out += `<circle cx="${sx}" cy="${r(sy)}" r="${r(R * 0.3)}" fill="${ICE}" stroke="${INK}" stroke-width="2"/>`
  const turn = -P * U / R
  for (let k = 0; k < 3; k++) {
    const a = turn + (k * Math.PI * 2) / 3
    out += `<line x1="${sx}" y1="${r(sy)}" x2="${r(sx + Math.cos(a) * R * 0.3)}" y2="${r(sy + Math.sin(a) * R * 0.3)}" stroke="${INK}" stroke-width="5"/>`
  }
  out += `<circle cx="${sx}" cy="${r(sy)}" r="9" fill="${INK}"/>`
  // The tape.
  out += `<rect x="${X0 - 10}" y="${ty - th / 2}" width="${r(sx - X0 + 10)}" height="${th}" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>`
  for (const m of marks) {
    if (m.u0 > P) break
    const x1 = headX - (P - m.u0) * U
    const x2 = headX - (P - Math.min(m.u1, P)) * U
    if (x2 < X0 - 20) continue
    out += `<rect x="${r(x1)}" y="${ty - 11}" width="${r(Math.max(x2 - x1, 1))}" height="22" rx="${r(Math.min(11, (x2 - x1) / 2))}" fill="${m.word === now ? RED : INK}"/>`
  }
  for (const l of letters) {
    if (l.at > P) break
    const x = headX - (P - l.at) * U
    if (x < X0 - 20) continue
    out += `<text x="${r(x)}" y="${ty + 72}" font-size="30" font-weight="400" fill="${INK}" text-anchor="middle" opacity="0.7" font-style="italic">${l.ch.toLowerCase()}</text>`
  }
  // The register: roller under, inking wheel over.
  out += `<circle cx="${headX}" cy="${ty + th / 2 + 40}" r="42" fill="${ICE}" stroke="${INK}" stroke-width="2"/>`
  out += `<rect x="${headX - 26}" y="${ty - th / 2 - 150}" width="52" height="110" fill="${INK}"/>`
  out += `<circle cx="${headX}" cy="${ty - th / 2 - 30}" r="34" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>`
  out += `<circle cx="${headX}" cy="${ty - th / 2 - 30}" r="7" fill="${INK}"/>`
  const hb = ty - th / 2 - 150
  out += `<rect x="${headX - 110}" y="${r(hb - 170)}" width="220" height="170" rx="8" fill="${ICE}" stroke="${INK}" stroke-width="2.5"/>`
  for (let k = 1; k < 12; k++) out += `<line x1="${headX - 100}" y1="${r(hb - 170 + k * 14)}" x2="${headX + 100}" y2="${r(hb - 170 + k * 14)}" stroke="${INK}" stroke-width="0.8" opacity="0.5"/>`
  out += `<text x="${headX}" y="${r(hb - 70)}" font-size="20" font-weight="600" letter-spacing="5" fill="${INK}" text-anchor="middle">TELEGRAF</text>`
  return out
}

/* ── E · A tightrope to Eden ──────────────────────────────────────── */

function tightrope({ time, score, uid }) {
  const ax = X0 + 120
  const bx = X1 - 150
  const ry = Y0 + 300
  const b = journey(score, time)
  const sea = Y0 + 470
  let out = ''
  // Deep water: lines closer and darker with depth.
  for (let i = 0; i < 46; i++) {
    const y = sea + i ** 1.18 * 5.6
    if (y > Y1 + 4) break
    const k = i / 46
    let d = ''
    for (let x = X0 - 20; x <= X1 + 20; x += 40) d += `${d ? 'L' : 'M'}${x} ${r(y + Math.sin(x * 0.012 + i * 0.9 + time * 0.6) * (1.5 + k * 3))}`
    out += `<path d="${d}" fill="none" stroke="${i % 5 === 4 ? INK : ICE}" stroke-width="${r(0.8 + k * 2.6, 2)}"/>`
  }
  out += `<line x1="${X0}" y1="${sea}" x2="${X1}" y2="${sea}" stroke="${INK}" stroke-width="1.6"/>`
  // The posts: a mast out of the water, and Eden — a rock with one tree.
  out += `<rect x="${ax - 7}" y="${ry - 30}" width="14" height="${sea - ry + 60}" fill="${INK}"/>`
  out += `<path d="M${bx - 120} ${sea + 4} Q${bx - 60} ${sea - 60} ${bx} ${sea - 70} Q${bx + 70} ${sea - 66} ${bx + 120} ${sea + 4} Z" fill="${INK}"/>`
  out += `<rect x="${bx - 6}" y="${ry - 30}" width="12" height="${sea - 66 - ry + 30}" fill="${INK}"/>`
  const tx = bx + 74
  const ty = sea - 66
  out += `<path d="M${tx - 5} ${ty} L${tx - 3} ${ty - 90} L${tx + 3} ${ty - 90} L${tx + 6} ${ty} Z" fill="${INK}"/>`
  out += `<path d="${wobbleCircle(tx, ty - 132, 50, 4, 7)}" fill="${ICE}" stroke="${INK}" stroke-width="2.4"/>`
  const lr = rng(5)
  for (let k = 0; k < 18; k++) {
    const a = lr() * Math.PI * 2
    const d = Math.sqrt(lr()) * 38
    const lx = tx + Math.cos(a) * d
    const ly = ty - 132 + Math.sin(a) * d
    out += `<path d="M${r(lx - 6)} ${r(ly + 3)} Q${r(lx)} ${r(ly - 5)} ${r(lx + 6)} ${r(ly + 3)}" fill="none" stroke="${INK}" stroke-width="1.3"/>`
  }
  // Sky, ruled lightly.
  for (let i = 0; i < 16; i++) {
    const y = sea - 8 - i ** 1.5 * 4
    out += `<line x1="${X0}" y1="${r(y)}" x2="${X1}" y2="${r(y)}" stroke="${INK}" stroke-width="0.7" opacity="0.3"/>`
  }
  // The rope: a sag, a dip where the bead is, and every word ringing along it.
  const all = words(score)
  const ring = []
  for (let i = 0; i < all.length; i++) {
    const w = all[i]
    if (w.t > time) break
    if (time - w.t < 2.5) ring.push({ age: time - w.t, mode: 2 + (i % 3) })
  }
  const dip = 70
  let d = ''
  let beadY = ry
  for (let k = 0; k <= 120; k++) {
    const u = k / 120
    let y = ry + 40 * 4 * u * (1 - u) + dip * (u < b ? u / Math.max(b, 0.001) : (1 - u) / Math.max(1 - b, 0.001))
    for (const w of ring) y += Math.sin(w.mode * Math.PI * u) * 14 * Math.exp(-w.age / 0.5) * Math.cos(w.age * 26)
    const x = lerp(ax, bx, u)
    d += `${d ? 'L' : 'M'}${r(x)} ${r(y)}`
    if (Math.abs(u - b) < 1 / 240) beadY = y
  }
  beadY = ry + 40 * 4 * b * (1 - b) + dip
  out += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="4"/>`
  out += `<circle cx="${r(lerp(ax, bx, b))}" cy="${r(beadY - 17)}" r="17" fill="${RED}"/>`
  // Guy lines to the water.
  out += `<line x1="${ax}" y1="${ry - 30}" x2="${X0 - 10}" y2="${sea}" stroke="${INK}" stroke-width="1.5"/>`
  out += `<line x1="${bx}" y1="${ry - 30}" x2="${bx - 140}" y2="${sea}" stroke="${INK}" stroke-width="1.5"/>`
  return out
}

export const CONCEPTS = [
  {
    id: 'astern',
    name: 'Looking Astern',
    lyric: 'Oh, away with the land and away with the light',
    idea: 'The view off the back of the ship for the whole song: the coast and its lighthouse getting smaller on the horizon, the wake running back to it. Moving on, seen from the only place you can watch it happen.',
    motion: 'The water streams away to the horizon at a steady speed and swells on the words. The land shrinks all song, the lighthouse beam weakens, and in the outro the coast slips under the horizon and is gone.',
    red: 'The wake’s centre line: the way already come, a red thread from the stern back to the land.',
    stills: [31.5, 74, 188, 223.5],
    frame: astern,
  },
  {
    id: 'board',
    name: 'The Departure Board',
    lyric: 'The ship back to Stockholm, it waits on no man',
    idea: 'A split-flap board at the quay. Every ship on it leaves on time, verse by verse, and the board rolls up. Stockholm is the last row.',
    motion: 'The clock keeps running. At each section’s end a row flips to DEPARTED and the board glides up a line. On the last line Stockholm flips to FINAL CALL, then DEPARTED on the word “Stockholm”, and the board is left empty.',
    red: 'Stockholm’s row, climbing the board as the ships ahead of it go.',
    stills: [40, 114, 210, 225.2],
    frame: board,
  },
  {
    id: 'ice',
    name: 'The Lead Through the Ice',
    lyric: 'It’s deep water rescue on razor thin ice',
    idea: 'Pack ice from directly above. A lead of open water cracks through it, corner to corner, and the floes shoulder apart to let the ship by.',
    motion: 'The crack advances with the words sung and keeps creeping through the instrumentals. Floes near the head jolt on each word and drift wider the longer the lead has been open. By the last line the lead has crossed the whole plate.',
    red: 'The ship’s track up the lead, with the bow as a dot at its head.',
    stills: [33, 83, 135, 224],
    frame: ice,
  },
  {
    id: 'telegraph',
    name: 'Telegraph Tape',
    lyric: 'I can’t seem to reach you, not by letter or phone',
    idea: 'A Morse register printing the lyric as it is sung, word by word, onto paper tape, with the operator’s pencilled letters underneath. Message after message goes out and none of it is answered.',
    motion: 'The tape advances only when a word is sung, so the spacing on it is the rhythm of the voice, and the instrumentals leave long blank runs. The spool of blank tape thins over the song. It ends on S-T-O-C-K-H-O-L-M.',
    red: 'The word being sent now. Once it has been sent it turns to ink.',
    stills: [33.5, 61.5, 113.5, 225.8],
    frame: telegraph,
  },
  {
    id: 'tightrope',
    name: 'A Tightrope to Eden',
    lyric: 'We’re walking a tightrope to Eden',
    idea: 'One rope from a mast to a rock with a single tree on it, strung above deep water. A red bead makes the crossing over the whole song.',
    motion: 'The bead moves with the words and the clock and never stops. Its weight bends the rope, and every sung syllable sends a ripple down the line. It reaches the tree on the last line.',
    red: 'The bead: the one crossing, left to right.',
    stills: [31, 116, 188, 224],
    frame: tightrope,
  },
]
