/*
 * Goodbye, Norma Jeane — five visualizers for the price of fame.
 *
 * Screenprint pink is the second ink; red is the one thing that moves. Every
 * concept is one system run off the measured words: a pull per word, a letter
 * per word, a flash per word, a step up per word, a glint per word.
 */
import { PLATE, CX, CY, INK, PAPER, RED, SECOND_INK } from './sheet.mjs'
import { rng, r, t, esc, ramp, clamp01, lerp, easeOut, easeInOut, decay } from '../../../shared/video/kit.mjs'
import { glide, land } from '../../../shared/video/album.mjs'

const PINK = SECOND_INK['goodbye-norma-jeane']
const { x: PX, y: PY, w: PW, h: PH } = PLATE

/* Every word of the song, flattened, cached per score. */
const cache = new WeakMap()
function wordsOf(score) {
  let hit = cache.get(score)
  if (!hit) {
    hit = score.lines.flatMap((l) => l.words.map((w) => ({ ...w, line: l.index })))
    cache.set(score, hit)
  }
  return hit
}
const sectionAt = (score, time) => score.sections.find((s) => time >= s.from && time < s.to) ?? score.sections.at(-1)
const beat = (score) => 60 / (score.bpm || 95)

/* ── A. The Edition ─────────────────────────────────────────────────── */

/*
 * One silhouette — the curls, the brow, the lips — pulled through the screen
 * once per sung word. The grid grows outward from the first pull and the
 * camera falls back to keep it all in frame; each pull is a little thinner in
 * the black and a little further off register in the pink.
 */
const SIL = 'M20 100C22 88 34 82 40 76C34 72 28 64 28 52C28 34 40 22 56 22C70 22 78 30 78 40L78 46C79 49 82 51 84 54L87 60C86 61 84 62 82 62L83 65C82 66 81 66 81 67L82 69C80 70 79 71 79 73C79 76 76 78 72 78L66 80C66 86 70 92 74 100Z'
const CURLS = [[34, 40, 9], [41, 30, 10], [52, 23, 10], [64, 23, 9], [72, 30, 7], [30, 52, 8], [34, 61, 7], [46, 19, 7], [27, 45, 7]]
const CELL = { w: 60, h: 80, gx: 68, gy: 90 }

const editionCache = new WeakMap()
function edition(score) {
  let hit = editionCache.get(score)
  if (hit) return hit
  const pulls = [1.2, ...wordsOf(score).map((w) => w.t)]
  const last = score.lines.at(-1).end + 1.5
  for (let b = last; b < score.duration - 1; b += beat(score)) pulls.push(b)
  const cells = []
  for (let i = -24; i <= 24; i++) for (let j = -12; j <= 12; j++) {
    cells.push({ i, j, d: Math.max(Math.abs(i) * CELL.gx / PW, Math.abs(j) * CELL.gy / PH), a: Math.atan2(j, i) })
  }
  cells.sort((p, q) => p.d - q.d || p.a - q.a)
  const rand = rng(31)
  const jitter = pulls.map(() => [rand() - 0.5, rand() - 0.5])
  hit = { pulls, cells, jitter }
  editionCache.set(score, hit)
  return hit
}

function editionFrame({ time, score, uid }) {
  const { pulls, cells, jitter } = edition(score)
  let ns = 0
  for (const p of pulls) ns += easeOut(ramp(time, p, p + 1.6))
  const d = Math.sqrt(Math.max(ns, 1) * CELL.gx * CELL.gy / (4 * PW * PH))
  const S = 0.92 * Math.min((PW / 2) / (d * PW + CELL.gx * 0.75), (PH / 2) / (d * PH + CELL.gy * 0.75))
  let wx = 0, wy = 0, wsum = 0
  for (let n = 0; n < pulls.length && n < cells.length; n++) {
    const k = easeOut(ramp(time, pulls[n], pulls[n] + 1.6))
    if (k <= 0) break
    wx += cells[n].i * k; wy += cells[n].j * k; wsum += k
  }
  const ox = wsum ? (wx / wsum) * CELL.gx * S : 0
  const oy = wsum ? (wy / wsum) * CELL.gy * S : 0
  const levels = [null, 2.1, 1.75, 1.4, 1.05]
  const defs = `<defs>
<g id="${uid}-sil"><path d="${SIL}"/>${CURLS.map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr}"/>`).join('')}</g>
${levels.map((rr, L) => rr ? `<pattern id="${uid}-ht${L}" width="4.4" height="4.4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="2.2" cy="2.2" r="${rr}" fill="${INK}"/></pattern>` : '').join('')}
${levels.map((_, L) => `<g id="${uid}-c${L}"><use href="#${uid}-sil" fill="${L ? `url(#${uid}-ht${L})` : INK}" transform="translate(-14 -12) scale(0.84)"/></g>`).join('')}
</defs>`
  let body = ''
  let sweep = ''
  for (let n = 0; n < pulls.length && n < cells.length; n++) {
    if (time < pulls[n]) break
    const c = cells[n]
    const x = CX - ox + c.i * CELL.gx * S - (CELL.w * S) / 2
    const y = CY - oy + c.j * CELL.gy * S - (CELL.h * S) / 2
    const L = Math.min(4, Math.floor(n / 45))
    const off = 1 + n * 0.05
    const [jx, jy] = jitter[n]
    const age = time - pulls[n]
    const reveal = clamp01(age / 0.35)
    const inner = `<rect x="${r(jx * off * 2, 2)}" y="${r(jy * off * 2, 2)}" width="${CELL.w}" height="${CELL.h}" fill="${PINK}"/><use href="#${uid}-c${L}"/>`
    if (reveal < 1) {
      const cw = CELL.w * easeInOut(reveal)
      body += `<g transform="translate(${r(x, 2)} ${r(y, 2)}) scale(${r(S, 4)})"><clipPath id="${uid}-rv${n}"><rect x="-4" y="-4" width="${r(cw + 4, 2)}" height="${CELL.h + 8}"/></clipPath><g clip-path="url(#${uid}-rv${n})">${inner}</g></g>`
      sweep += `<rect x="${r(x + (cw - 3) * S, 2)}" y="${r(y - 6 * S, 2)}" width="${r(5 * S, 2)}" height="${r((CELL.h + 12) * S, 2)}" fill="${RED}"/>`
    } else {
      body += `<g transform="translate(${r(x, 2)} ${r(y, 2)}) scale(${r(S, 4)})">${inner}</g>`
    }
  }
  return `${defs}<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>${body}${sweep}`
}

/* ── B. The Marquee ─────────────────────────────────────────────────── */

/*
 * A cinema marquee. It opens reading NORMA JEANE; through the second verse
 * ("Dye your hair and change your clothes") one letter comes down per word and
 * another goes up, until by "Goodbye, Norma Jean" it reads MARILYN MONROE.
 * Then the bulbs start to go, one a word, until only the name is lit.
 */
const ROWS = [
  { from: [' ', 'N', 'O', 'R', 'M', 'A', ' '], to: ['M', 'A', 'R', 'I', 'L', 'Y', 'N'], y: 262 },
  { from: [' ', 'J', 'E', 'A', 'N', 'E'], to: ['M', 'O', 'N', 'R', 'O', 'E'], y: 470 },
]
const TILE = { w: 128, h: 172, gap: 14 }
const BOX = { x: 170, y: 120, w: 1260, h: 600 }

const marqueeCache = new WeakMap()
function marquee(score) {
  let hit = marqueeCache.get(score)
  if (hit) return hit
  const words = wordsOf(score)
  const slots = ROWS.flatMap((row, ri) => row.from.map((_, i) => [ri, i]))
  const order = slots.map((s, k) => ({ s, k: rng(7 + k)() })).sort((a, b) => a.k - b.k).map((o) => o.s)
  const swapWords = words.filter((w) => w.line >= 6).slice(0, order.length)
  const swaps = new Map(order.map(([ri, i], k) => [`${ri}-${i}`, swapWords[k].t]))
  // Bulbs: the perimeter, in order.
  const bulbs = []
  const inset = 26
  const bx = BOX.x + inset, by = BOX.y + inset, bw = BOX.w - inset * 2, bh = BOX.h - inset * 2
  const per = 2 * (bw + bh)
  const n = 96
  for (let k = 0; k < n; k++) {
    let s = (k / n) * per
    let p
    if (s < bw) p = [bx + s, by]
    else if ((s -= bw) < bh) p = [bx + bw, by + s]
    else if ((s -= bh) < bw) p = [bx + bw - s, by + bh]
    else { s -= bw; p = [bx, by + bh - s] }
    bulbs.push(p)
  }
  const dieOrder = bulbs.map((_, k) => ({ k, v: rng(100 + k)() })).sort((a, b) => a.v - b.v)
  const dyingWords = words.filter((w) => w.t > 140).map((w) => w.t)
  const deathAt = new Array(n).fill(Infinity)
  dieOrder.forEach(({ k }, m) => {
    const w = dyingWords[Math.floor((m * dyingWords.length) / n)]
    deathAt[k] = w ?? Infinity
  })
  hit = { swaps, bulbs, deathAt }
  marqueeCache.set(score, hit)
  return hit
}

function marqueeFrame({ time, score, uid }) {
  const { swaps, bulbs, deathAt } = marquee(score)
  const S = glide(time, [{ t: 0, v: 1.45 }, { t: 19, v: 1.45 }, { t: 40, v: 1.18 }, { t: 250, v: 1.18 }, { t: score.duration, v: 1.0 }])
  const fy = glide(time, [{ t: 0, v: 262 + 86 }, { t: 19, v: 262 + 86 }, { t: 40, v: CY }])
  const sec = sectionAt(score, time)
  const allOn = sec.kind === 'chorus'
  const step = Math.floor(time / (beat(score) / 2))
  let out = `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${INK}"/>`
  out += `<g transform="translate(${CX} ${CY}) scale(${r(S, 4)}) translate(${-CX} ${r(-fy, 2)})">`
  // The board: paper with an engraved double rule, the pink header band.
  out += `<rect x="${BOX.x}" y="${BOX.y}" width="${BOX.w}" height="${BOX.h}" fill="${PAPER}"/>`
  out += `<rect x="${BOX.x + 52}" y="${BOX.y + 52}" width="${BOX.w - 104}" height="${BOX.h - 104}" fill="none" stroke="${INK}" stroke-width="3"/>`
  out += `<rect x="${BOX.x + 60}" y="${BOX.y + 60}" width="${BOX.w - 120}" height="${BOX.h - 120}" fill="none" stroke="${INK}" stroke-width="1"/>`
  out += `<rect x="${BOX.x + 60}" y="${BOX.y + 60}" width="${BOX.w - 120}" height="46" fill="${PINK}"/>`
  out += t({ x: CX, y: BOX.y + 95, size: 28, text: 'Now showing · silver screen', fill: INK, anchor: 'middle', weight: 700, tracking: 6 })
  // Bulbs.
  bulbs.forEach(([x, y], k) => {
    const dead = time >= deathAt[k]
    const lit = !dead && (allOn || (k + step) % 4 === 0 || (k + step) % 4 === 1)
    if (dead) out += `<circle cx="${r(x)}" cy="${r(y)}" r="9" fill="${INK}"/>`
    else if (lit) out += `<circle cx="${r(x)}" cy="${r(y)}" r="10" fill="${PINK}" stroke="${INK}" stroke-width="2"/><circle cx="${r(x - 3)}" cy="${r(y - 3)}" r="2.5" fill="${PAPER}"/>`
    else out += `<circle cx="${r(x)}" cy="${r(y)}" r="9" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>`
  })
  // Tiles.
  let falling = ''
  ROWS.forEach((row, ri) => {
    const n = row.from.length
    const x0 = CX - (n * TILE.w + (n - 1) * TILE.gap) / 2
    row.from.forEach((was, i) => {
      const x = x0 + i * (TILE.w + TILE.gap)
      const y = row.y - 40
      const at = swaps.get(`${ri}-${i}`)
      const u = clamp01((time - at) / 0.9)
      out += `<rect x="${r(x)}" y="${y}" width="${TILE.w}" height="${TILE.h}" fill="${PAPER}" stroke="${INK}" stroke-width="2.5"/>`
      const letter = (ch, dy, fill, rot = 0, op = 1) => ch.trim()
        ? `<g transform="translate(${r(x + TILE.w / 2)} ${r(y + 136 + dy)}) rotate(${r(rot)})" opacity="${r(op, 3)}">${t({ x: 0, y: 0, size: 124, text: ch, fill, anchor: 'middle', weight: 700 })}</g>`
        : ''
      if (time < at) out += `<clipPath id="${uid}-t${ri}${i}"><rect x="${r(x)}" y="${y}" width="${TILE.w}" height="${TILE.h}"/></clipPath><g clip-path="url(#${uid}-t${ri}${i})">${letter(was, 0, INK)}</g>`
      else {
        // The new one slides down into the tile; the old one falls, red, out of frame.
        out += `<clipPath id="${uid}-t${ri}${i}"><rect x="${r(x)}" y="${y}" width="${TILE.w}" height="${TILE.h}"/></clipPath>`
        out += `<g clip-path="url(#${uid}-t${ri}${i})">${letter(row.to[i], -TILE.h * (1 - easeOut(clamp01(u * 1.6))), INK)}</g>`
        if (u < 1) falling += letter(was, 900 * u * u, RED, 50 * u * (i % 2 ? 1 : -1), 1 - u * 0.2)
      }
    })
  })
  out += falling + '</g>'
  return out
}

/* ── C. The Red Carpet ──────────────────────────────────────────────── */

/*
 * One long red carpet into the dark, walked at the song's pace. Every sung
 * word is a flashbulb going off along the ropes; the choruses are a wall of
 * them. White line on black, the ropes in pink, the carpet the only red.
 */
const F = 760, VP = 300, CAM_H = 150
const carpetZ = (time) => 26 * time
const project = (X, Y, Z) => ({ x: CX + (F * X) / Z, y: VP + (F * (CAM_H - Y)) / Z, s: F / Z })

const flashCache = new WeakMap()
function flashes(score) {
  let hit = flashCache.get(score)
  if (hit) return hit
  const rand = rng(77)
  hit = []
  for (const w of wordsOf(score)) {
    const chorus = sectionAt(score, w.t).kind === 'chorus'
    const n = chorus ? 3 : 1
    for (let k = 0; k < n; k++) {
      const side = rand() < 0.5 ? -1 : 1
      hit.push({ t: w.t + k * 0.07, X: side * (300 + rand() * 520), Y: 60 + rand() * 210, dz: 350 + rand() * 2200, size: 0.8 + rand() * 0.7, spin: rand() * 30 })
    }
  }
  flashCache.set(score, hit)
  return hit
}

function star(x, y, rad, spin, points = 8) {
  let d = ''
  for (let k = 0; k < points * 2; k++) {
    const a = ((k / (points * 2)) * 360 + spin) * Math.PI / 180
    const rr = k % 2 ? rad * 0.18 : rad
    d += `${k ? 'L' : 'M'}${r(x + Math.cos(a) * rr)} ${r(y + Math.sin(a) * rr)}`
  }
  return d + 'Z'
}

function carpetFrame({ time, score }) {
  const cz = carpetZ(time)
  let out = `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${INK}"/>`
  const zNear = 140, zFar = 9000
  // The carpet ends somewhere ahead: by the outro the dark comes up to meet it.
  const endZ = 26 * score.duration + 600
  const far = Math.min(zFar, endZ - cz)
  const a = project(-170, 0, zNear), b = project(170, 0, zNear), c = project(170, 0, far), d = project(-170, 0, far)
  out += `<path d="M${r(a.x)} ${r(a.y)}L${r(b.x)} ${r(b.y)}L${r(c.x)} ${r(c.y)}L${r(d.x)} ${r(d.y)}Z" fill="${RED}"/>`
  // Seams across the carpet, world-fixed so they come towards us.
  let seams = ''
  for (let z = Math.ceil(cz / 160) * 160; z < cz + far; z += 160) {
    const zr = z - cz
    if (zr < zNear) continue
    const p = project(-170, 0, zr), q = project(170, 0, zr)
    seams += `M${r(p.x)} ${r(p.y)}L${r(q.x)} ${r(q.y)}`
  }
  out += `<path d="${seams}" stroke="${INK}" stroke-width="1.2" opacity="0.45"/>`
  // Stanchions and ropes.
  let posts = '', ropes = ''
  for (const side of [-1, 1]) {
    let prev = null
    for (let z = Math.ceil(cz / 300) * 300; z < cz + Math.min(far, 7000); z += 300) {
      const zr = z - cz
      if (zr < zNear * 0.7) { prev = null; continue }
      const g = project(side * 250, 0, zr), top = project(side * 250, 95, zr)
      posts += `M${r(g.x)} ${r(g.y)}L${r(top.x)} ${r(top.y)}`
      if (prev) {
        const mid = project(side * 250, 70, zr - 150)
        ropes += `M${r(prev.x)} ${r(prev.y)}Q${r(mid.x)} ${r(mid.y + 22 * mid.s)} ${r(top.x)} ${r(top.y)}`
      }
      prev = top
    }
  }
  out += `<path d="${posts}" stroke="${PAPER}" stroke-width="3" fill="none"/>`
  out += `<path d="${ropes}" stroke="${PINK}" stroke-width="5" fill="none"/>`
  // Flashes.
  for (const f of flashes(score)) {
    const age = time - f.t
    if (age < 0 || age > 0.9) continue
    const z = carpetZ(f.t) + f.dz - cz
    if (z < 120) continue
    const p = project(f.X, f.Y, z)
    const k = decay(time, f.t, 0.22)
    const rad = 190 * p.s * f.size * (0.6 + 0.6 * easeOut(clamp01(age / 0.12)))
    out += `<circle cx="${r(p.x)}" cy="${r(p.y)}" r="${r(rad * 1.35)}" fill="none" stroke="${PINK}" stroke-width="${r(Math.max(1.5, 6 * p.s * 3))}" opacity="${r(k, 3)}"/>`
    out += `<path d="${star(p.x, p.y, rad, f.spin)}" fill="${PAPER}" opacity="${r(Math.max(k, 0.15), 3)}"/>`
    out += `<circle cx="${r(p.x)}" cy="${r(p.y)}" r="${r(rad * 0.28)}" fill="${PAPER}" opacity="${r(k, 3)}"/>`
  }
  return out
}

/* ── D. More, More, More ────────────────────────────────────────────── */

/*
 * A box-office chart on graph paper, log scale. Every sung word steps the red
 * line up; the camera climbs with it, so the dollar axis runs from $1 into the
 * billions while the dotted line of "you" — where she started — sinks out of
 * the bottom of the frame and is never seen again.
 */
const DEC = 130 // world units per decade
const XS = 24 // world units per second
const NOTES = [[0, 'Silver screen'], [9, 'DiMaggio'], [12, 'Goodbye'], [17, 'Diamonds'], [26, 'More']]

function decades(score, time) {
  let v = 0
  for (const w of wordsOf(score)) {
    if (w.t > time) break
    v += (/more/i.test(w.text) ? 0.16 : 0.04) * land(time, w.t, 0.3)
  }
  const tail = score.lines.at(-1).end
  if (time > tail) v += 0.6 * easeInOut(ramp(time, tail, score.duration))
  return v
}

function chartFrame({ time, score, uid }) {
  // Camera: the head, smoothed over the last two seconds.
  let cx = 0, cy = 0
  for (let k = 0; k < 9; k++) {
    const s = Math.max(0, time - k * 0.25)
    cx += s * XS
    cy += decades(score, s) * DEC
  }
  cx /= 9; cy /= 9
  const HX = PX + PW * 0.66, HY = PY + PH * 0.42
  const sx = (xw) => HX + (xw - cx)
  const sy = (yw) => HY - (yw - cy)
  const grid = `<pattern id="${uid}-g" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="translate(${r(-cx % 150, 2)} ${r(cy % 150, 2)})">
<path d="M30 0H0V30" fill="none" stroke="${PINK}" stroke-width="1"/></pattern>
<pattern id="${uid}-G" width="150" height="150" patternUnits="userSpaceOnUse" patternTransform="translate(${r(HX - cx % 150, 2)} ${r(HY + cy % 150, 2)})">
<path d="M150 0H0V150" fill="none" stroke="${PINK}" stroke-width="2.5"/></pattern>`
  let out = `<defs>${grid}</defs><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>`
  out += `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="url(#${uid}-g)"/>`
  out += `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="url(#${uid}-G)"/>`
  // Where she started: a dotted rule at the first value.
  const start = sy(0)
  if (start < PY + PH + 10) {
    out += `<path d="M${PX} ${r(start)}H${PX + PW}" stroke="${INK}" stroke-width="2" stroke-dasharray="2 9" stroke-linecap="round"/>`
    out += t({ x: PX + PW - 20, y: start - 12, size: 20, text: 'you', fill: INK, anchor: 'end', weight: 500, upper: false, italic: true })
  }
  // The line.
  let d = ''
  const from = Math.max(0, time - 70)
  for (let s = from; s <= time + 1e-6; s += 0.2) d += `${d ? 'L' : 'M'}${r(sx(s * XS))} ${r(sy(decades(score, s) * DEC))}`
  const hx = sx(time * XS), hy = sy(decades(score, time) * DEC)
  d += `L${r(hx)} ${r(hy)}`
  // Notes pencilled on the chart at the words they name.
  for (const [li, label] of NOTES) {
    const ln = score.lines[li]
    if (!ln || ln.start > time) continue
    const x = sx(ln.start * XS), y = sy(decades(score, ln.start) * DEC)
    if (x < PX - 200) continue
    out += `<path d="M${r(x)} ${r(y)}L${r(x - 30)} ${r(y - 70)}" stroke="${INK}" stroke-width="1.5"/>`
    out += t({ x: x - 34, y: y - 78, size: 22, text: label, fill: INK, anchor: 'end', weight: 500, upper: false, italic: true })
  }
  out += `<path d="${d}" fill="none" stroke="${RED}" stroke-width="5" stroke-linejoin="round"/>`
  out += `<circle cx="${r(hx)}" cy="${r(hy)}" r="9" fill="${RED}"/>`
  // The axis: decades in dollars on a paper band at the left.
  out += `<rect x="${PX}" y="${PY}" width="150" height="${PH}" fill="${PAPER}"/><path d="M${PX + 150} ${PY}V${PY + PH}" stroke="${INK}" stroke-width="2.5"/>`
  const money = (k) => '$' + ['1', '10', '100', '1K', '10K', '100K', '1M', '10M', '100M', '1B', '10B', '100B', '1T'][k]
  for (let k = 0; k <= 12; k++) {
    const y = sy(k * DEC)
    if (y < PY - 40 || y > PY + PH + 40) continue
    out += `<path d="M${PX + 130} ${r(y)}H${PX + 150}" stroke="${INK}" stroke-width="2.5"/>`
    out += t({ x: PX + 120, y: y + 9, size: 26, text: money(k), fill: INK, anchor: 'end', weight: 600 })
  }
  out += t({ x: PX + 190, y: PY + 52, size: 22, text: 'Gross receipts · log scale', fill: INK, weight: 700, tracking: 3 })
  return out
}

/* ── E. The Only Friend ─────────────────────────────────────────────── */

/*
 * One brilliant-cut diamond, engraved in line, turning slowly all song. Its
 * facets take the pink and the black as they turn to the light; a red glint
 * skips from facet to facet on every word. It grows as the song goes on, and
 * by the last chorus it is all there is.
 */
function diamondMesh() {
  const V = []
  const T = [], G = []
  for (let i = 0; i < 8; i++) { const a = (i / 8) * 2 * Math.PI; T.push(V.length); V.push([0.55 * Math.cos(a), -0.36, 0.55 * Math.sin(a)]) }
  for (let j = 0; j < 16; j++) { const a = ((j - 0.5) / 16) * 2 * Math.PI; G.push(V.length); V.push([Math.cos(a), 0, Math.sin(a)]) }
  const C = V.length; V.push([0, 0.92, 0])
  const F = [T.slice()]
  for (let i = 0; i < 8; i++) {
    const a = T[i], b = T[(i + 1) % 8]
    const g0 = G[(2 * i) % 16], g1 = G[(2 * i + 1) % 16], g2 = G[(2 * i + 2) % 16]
    F.push([a, g0, g1], [a, g1, b], [b, g1, g2])
  }
  for (let j = 0; j < 16; j++) F.push([G[j], C, G[(j + 1) % 16]])
  return { V, F }
}
const MESH = diamondMesh()

function diamondFrame({ time, score, uid }) {
  const spin = time * 0.11
  const tilt = 0.42
  const scale = lerp(300, 470, easeInOut(ramp(time, 20, 240)))
  const cy0 = CY - 30
  const P = MESH.V.map(([x, y, z]) => {
    const x1 = x * Math.cos(spin) - z * Math.sin(spin)
    const z1 = x * Math.sin(spin) + z * Math.cos(spin)
    const y2 = y * Math.cos(tilt) - z1 * Math.sin(tilt)
    const z2 = y * Math.sin(tilt) + z1 * Math.cos(tilt)
    return [CX + x1 * scale, cy0 + y2 * scale, z2]
  })
  const light = [-0.5, -0.7, -0.5]
  const faces = MESH.F.map((f, k) => {
    const [a, b, c] = f.map((i) => P[i])
    const ux = b[0] - a[0], uy = b[1] - a[1], vx = c[0] - a[0], vy = c[1] - a[1]
    const facing = ux * vy - uy * vx
    const zc = f.reduce((s, i) => s + P[i][2], 0) / f.length
    const cxp = f.reduce((s, i) => s + P[i][0], 0) / f.length
    const cyp = f.reduce((s, i) => s + P[i][1], 0) / f.length
    // A cheap light term from screen-space orientation and the spin.
    const tone = (Math.sin(k * 1.7 + spin * 3) + 1) / 2
    return { f, k, facing, zc, cx: cxp, cy: cyp, tone }
  })
  const hatch = `<pattern id="${uid}-h" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><path d="M0 0H7" stroke="${INK}" stroke-width="2"/></pattern>
<pattern id="${uid}-p" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(60)"><path d="M0 0H9" stroke="${PINK}" stroke-width="4"/></pattern>`
  let out = `<defs>${hatch}</defs><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>`
  // Rays of dispersion behind it, engraved, more of them as the song goes on.
  const rays = Math.floor(lerp(12, 64, easeInOut(ramp(time, 0, score.duration))))
  let rd = ''
  for (let k = 0; k < rays; k++) {
    const a = (k / rays) * 2 * Math.PI + 0.05
    rd += `M${r(CX + Math.cos(a) * scale * 1.25)} ${r(cy0 + Math.sin(a) * scale * 1.25)}L${r(CX + Math.cos(a) * 1500)} ${r(cy0 + Math.sin(a) * 1500)}`
  }
  out += `<path d="${rd}" stroke="${INK}" stroke-width="1.6" opacity="0.6"/>`
  // Back facets first (seen through), then the front.
  const front = faces.filter((f) => f.facing < 0)
  const back = faces.filter((f) => f.facing >= 0)
  const poly = (f) => 'M' + f.f.map((i) => `${r(P[i][0])} ${r(P[i][1])}`).join('L') + 'Z'
  out += `<path d="${back.map(poly).join('')}" fill="${PAPER}" stroke="${INK}" stroke-width="1" opacity="0.55"/>`
  for (const f of front) {
    const fill = f.tone > 0.72 ? PINK : f.tone > 0.45 ? `url(#${uid}-p)` : f.tone < 0.18 ? `url(#${uid}-h)` : PAPER
    out += `<path d="${poly(f)}" fill="${fill}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`
  }
  // The glint: hops to a front facet on every word.
  const words = wordsOf(score)
  let wi = -1
  for (let i = 0; i < words.length; i++) { if (words[i].t <= time) wi = i; else break }
  if (wi >= 0 && front.length) {
    const pick = (i) => front[Math.floor(rng(500 + i)() * front.length)]
    const now = pick(wi), was = pick(Math.max(0, wi - 1))
    const u = easeOut(clamp01((time - words[wi].t) / 0.16))
    const gx = lerp(was.cx, now.cx, u), gy = lerp(was.cy, now.cy, u)
    const k = 0.55 + 0.45 * decay(time, words[wi].t, 0.4)
    out += `<path d="${star(gx, gy, 74 * k, 0, 4)}" fill="${RED}"/>`
  }
  return out
}

export const CONCEPTS = [
  {
    id: 'edition',
    name: 'The Edition',
    lyric: 'Know you want the world, it\'s more, more, more',
    idea: 'One silhouette, curls and lips, pulled through a pink screen once for every word she sings. The first print is perfect; by the end there are hundreds, each thinner in the black and further off register, and you can no longer find the first one.',
    motion: 'A new pull lands on each measured word, the grid grows outward from the centre, and the camera falls back to keep all of it in frame. The choruses fill the screen fastest, and the outro keeps printing on the beat after the voice has gone.',
    red: 'The squeegee: a red bar that sweeps across each new print as it is pulled.',
    stills: [24.5, 84.8, 150.5, 230],
    frame: editionFrame,
  },
  {
    id: 'marquee',
    name: 'The Marquee',
    lyric: 'Die your hair and change your clothes',
    idea: 'A cinema marquee in black and pink that reads NORMA JEANE. Across the second verse the letters come down one word at a time and new ones go up, and by "Goodbye, Norma Jean" it says MARILYN MONROE. Then the bulbs start to burn out.',
    motion: 'The bulbs chase on the half-beat and blaze together in the choruses. Each swapped letter drops on its word. From the third verse a bulb dies on every word, until the last chorus plays to a dark sign with only her new name on it.',
    red: 'Each old letter turns red as it falls out of the sign.',
    stills: [22, 75.5, 103, 236],
    frame: marqueeFrame,
  },
  {
    id: 'carpet',
    name: 'The Red Carpet',
    lyric: 'Silver screen says Norma Jeane, oh',
    idea: 'A red carpet running into black, roped off in pink, walked at the pace of the song. Every word sets off a flashbulb along the ropes. Nobody is on it: you are the one walking.',
    motion: 'The camera walks forward all song, without a cut. One flash per word in the verses and three per word in the choruses, so the choruses become a wall of white. In the outro the carpet runs out ahead and the dark comes up to meet it.',
    red: 'The carpet: the one road through the frame, and the only red.',
    stills: [22, 104, 160.8, 270],
    frame: carpetFrame,
  },
  {
    id: 'receipts',
    name: 'Gross Receipts',
    lyric: 'I wanted you, you wanted more',
    idea: 'A box-office chart on pink graph paper, in log scale. The red line climbs from $1 into the billions, one step for every word. A dotted line marked "you", where she began, sinks out of the bottom of the frame and never comes back.',
    motion: 'The camera rides the head of the line like Andalusia\'s route, smoothed over two seconds so it never jolts. Notes are pencilled where the song names things: DiMaggio, Diamonds, Goodbye. After the last word the line keeps going up.',
    red: 'The receipts line and its head.',
    stills: [36, 85.2, 151.3, 236.5],
    frame: chartFrame,
  },
  {
    id: 'diamond',
    name: 'Only Friend',
    lyric: 'Diamonds are your only friend',
    idea: 'One brilliant-cut diamond, engraved in line, turning slowly in the middle of the paper. Its facets catch pink and hatched black as they turn to the light. Hard, beautiful and cold: the friend who stays.',
    motion: 'It turns at one steady speed for the whole song and grows from a jewel to the whole frame by the last chorus. The rays of light behind it multiply as the song goes on.',
    red: 'A glint that jumps to a new facet on every word, then fades.',
    stills: [31.5, 105, 150.6, 229],
    frame: diamondFrame,
  },
]
