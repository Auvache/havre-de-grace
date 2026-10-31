/*
 * Ivory — five visualizers for being at a loss for words.
 *
 * Butterfly blue is the second ink; red is the one thing that moves. Each
 * concept is one system run off the measured words, and in each the words
 * fail somewhere: struck out, held breath, blank slots, a flight that never
 * lands for long, a name the sea takes back.
 */
import { PLATE, CX, CY, INK, PAPER, RED, PAPER_SHADE, SECOND_INK } from './sheet.mjs'
import { rng, r, t, ramp, clamp01, lerp, easeOut, easeInOut, decay } from '../../../shared/video/kit.mjs'
import { glide } from '../../../shared/video/album.mjs'

const BLUE = SECOND_INK.ivory
const { x: PX, y: PY, w: PW, h: PH } = PLATE

const memo = (fn) => {
  const cache = new WeakMap()
  return (score) => {
    let hit = cache.get(score)
    if (!hit) { hit = fn(score); cache.set(score, hit) }
    return hit
  }
}
const wordsOf = memo((score) => score.lines.flatMap((l) => l.words.map((w) => ({ ...w, line: l.index }))))
/** The lines that are only her name ("Ivory", "Oh, Ivory"). */
const isName = (line) => /^(oh, )?ivory$/i.test(line.text.trim())
/** When each "Ivory" is sung: the word itself. */
const nameTimes = memo((score) => score.lines.filter(isName).map((l) => l.words.at(-1).t))
const sectionAt = (score, time) => score.sections.find((s) => time >= s.from && time < s.to) ?? score.sections.at(-1)
const smooth = (pts, places = 1) => {
  const r = (n) => Number(n.toFixed(places))
  if (pts.length < 3) return pts.length ? `M${pts.map(([x, y]) => `${r(x)} ${r(y)}`).join('L')}` : ''
  let d = `M${r(pts[0][0])} ${r(pts[0][1])}`
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i]
    const [nx, ny] = pts[i + 1]
    d += `Q${r(x)} ${r(y)} ${r((x + nx) / 2)} ${r((y + ny) / 2)}`
  }
  const [lx, ly] = pts.at(-1)
  return d + `L${r(lx)} ${r(ly)}`
}

/* ── A. The Unfinished Letter ───────────────────────────────────────── */

/*
 * A letter that begins "Dear ______," and never fills the blank. Every line
 * he sings is written as a row of hand, word for word on the measured onsets,
 * and then struck through. On each "Ivory" the pen goes back up to the blank
 * and hovers there. The only rows left standing at the end are the two that
 * say he will keep this one for himself.
 */
const SHEET = { x: 290, w: 1020, top: 0, row: 64, first: 150 }
const KEEP = /just for me/i

const letter = memo((score) => {
  const rows = []
  for (const line of score.lines) {
    if (isName(line)) continue
    const y = SHEET.first + (rows.length + 1) * SHEET.row
    const rand = rng(40 + line.index)
    const glyphs = line.words.map((w) => w.text.replace(/[^a-z']/gi, '').length || 1)
    const total = glyphs.reduce((a, b) => a + b, 0)
    const lw = Math.min(17, (SHEET.w - 120 - (glyphs.length - 1) * 16) / total)
    let x = SHEET.x + 70
    const words = line.words.map((w, wi) => {
      const pts = []
      for (let g = 0; g < glyphs[wi]; g++) {
        const tall = rand() < 0.22 ? 1.9 : rand() < 0.15 ? -0.9 : 1
        const h = 16 * (0.8 + rand() * 0.4)
        for (let k = 0; k < 5; k++) {
          const th = (k / 5) * 2 * Math.PI
          const hh = tall < 0 ? (k >= 2 && k <= 3 ? -h * 1.4 : h) : h * (k === 2 || k === 3 ? tall : 1)
          pts.push([x + lw * (th / (2 * Math.PI)) - lw * 0.55 * Math.sin(th), y - hh * (1 - Math.cos(th)) / 2])
        }
        x += lw
      }
      pts.push([x, y])
      x += 16
      return { t: w.t, pts }
    })
    rows.push({ line, y, words, keep: KEEP.test(line.text), x1: x - 16 })
  }
  return { rows, height: SHEET.first + (rows.length + 2) * SHEET.row }
})

function letterFrame({ time, score, uid }) {
  const { rows, height } = letter(score)
  const blank = [SHEET.x + 270, SHEET.first - 8]
  // Where the nib is: the writing point, or hovering at the blank on her name.
  let nib = [SHEET.x + 70, SHEET.first + SHEET.row]
  let body = ''
  let strikes = ''
  for (const row of rows) {
    const { line } = row
    if (time < line.start - 0.2) break
    const pts = []
    for (let wi = 0; wi < row.words.length; wi++) {
      const w = row.words[wi]
      if (time < w.t) break
      const until = row.words[wi + 1]?.t ?? Math.max(line.end, w.t) + 0.45
      const u = clamp01((time - w.t) / Math.max(0.12, until - w.t))
      const n = Math.max(1, Math.round(w.pts.length * u))
      const part = w.pts.slice(0, n)
      body += smooth(part, 0)
      if (part.length) nib = part.at(-1)
    }
    // Struck out once it is written, unless it is the line he keeps.
    const end = Math.max(line.end, line.words.at(-1).t) + 0.9
    if (!row.keep && time > end) {
      const u = easeInOut(clamp01((time - end) / 0.45))
      const x0 = SHEET.x + 60, x1 = lerp(x0, row.x1 + 14, u)
      const rand = rng(900 + line.index)
      let d = `M${x0} ${r(row.y - 9)}`
      for (let x = x0 + 26; x <= x1; x += 26) d += `L${r(x)} ${r(row.y - 9 + (rand() - 0.5) * 9)}`
      strikes += d
    }
  }
  const names = nameTimes(score)
  let hover = 0
  for (const at of names) hover = Math.max(hover, clamp01((time - at + 0.4) / 0.4) * (1 - clamp01((time - at - 2.4) / 0.5)))
  if (hover > 0) {
    const wob = [Math.sin(time * 9) * 7, Math.cos(time * 7) * 5]
    nib = [lerp(nib[0], blank[0] + 120 + wob[0], easeInOut(hover)), lerp(nib[1], blank[1] - 10 + wob[1], easeInOut(hover))]
  }
  // Camera: follow the nib down the page; pull back to the whole letter at the end.
  const followY = clamp01(0) + Math.max(PY + PH / 2 - 60, nib[1])
  const end = easeInOut(ramp(time, 176, 186))
  const scale = lerp(1.15, PH / (height + 80), end)
  const camY = lerp(Math.min(followY, height - PH / 2 / 1.15 + 40), height / 2, end)
  const camX = lerp(CX, SHEET.x + SHEET.w / 2, end)
  const view = `translate(${CX} ${CY}) scale(${r(scale, 4)}) translate(${r(-camX)} ${r(-camY)})`
  const ruled = `<pattern id="${uid}-rule" width="${SHEET.w}" height="${SHEET.row}" patternUnits="userSpaceOnUse" x="${SHEET.x}" y="${SHEET.first + 2}"><path d="M0 0H${SHEET.w}" stroke="${BLUE}" stroke-width="1.6"/></pattern>`
  let out = `<defs>${ruled}</defs><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER_SHADE}"/>`
  out += `<g transform="${view}">`
  out += `<path d="M${SHEET.x + 14} 14H${SHEET.x + SHEET.w + 14}V${height + 14}H${SHEET.x + 14}Z" fill="${INK}" opacity="0.18"/>`
  out += `<rect x="${SHEET.x}" y="0" width="${SHEET.w}" height="${height}" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/>`
  out += `<rect x="${SHEET.x}" y="${SHEET.first + SHEET.row - 2}" width="${SHEET.w}" height="${height - SHEET.first - SHEET.row}" fill="url(#${uid}-rule)"/>`
  out += `<path d="M${SHEET.x + 50} 0V${height}M${SHEET.x + 56} 0V${height}" stroke="${BLUE}" stroke-width="1.2"/>`
  out += t({ x: SHEET.x + 70, y: SHEET.first, size: 58, text: 'Dear', fill: INK, weight: 400, upper: false, italic: true })
  out += `<path d="M${blank[0]} ${blank[1] + 10}H${blank[0] + 300}" stroke="${INK}" stroke-width="2.5"/>`
  out += t({ x: blank[0] + 306, y: SHEET.first, size: 58, text: ',', fill: INK, weight: 400, upper: false })
  out += `<path d="${body}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`
  out += `<path d="${strikes}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`
  out += `<circle cx="${r(nib[0])}" cy="${r(nib[1])}" r="${r(9 / Math.max(scale, 0.4), 2)}" fill="${RED}"/>`
  return out + '</g>'
}

/* ── B. Breath ──────────────────────────────────────────────────────── */

/*
 * A respiration chart: blue grid paper running under a pen. The trace breathes
 * slowly and evenly with the song, and every time her name comes, or she looks
 * at him, or he is asked his own, it catches and holds flat until the song
 * lets him go.
 */
const XS = 26 // chart units per second
const DT = 0.02

const breath = memo((score) => {
  const holds = nameTimes(score).map((at) => [at - 0.05, at + 2.1])
  const looked = score.lines[11]?.words.at(-2)
  if (looked) holds.push([looked.t, looked.t + 1.8])
  const breathe = score.lines[17]?.words.find((w) => /breathe/i.test(w.text))
  const nextName = score.lines[18]?.words.at(-1)
  if (breathe) holds.push([breathe.t, (nextName?.t ?? breathe.t + 4) + 1.2])
  const held = (s) => {
    let h = 0
    for (const [a, b] of holds) h = Math.max(h, Math.min(clamp01((s - a) / 0.12), 1 - clamp01((s - b) / 0.25)))
    return h
  }
  const n = Math.ceil(score.duration / DT) + 2
  const tau = new Float64Array(n)
  for (let i = 1; i < n; i++) tau[i] = tau[i - 1] + DT * (1 - held(i * DT))
  return { holds, tau, held }
})

function breathAt(score, s) {
  const { tau, holds } = breath(score)
  if (s <= 0) return 0
  const i = Math.min(tau.length - 2, Math.floor(s / DT))
  const tt = lerp(tau[i], tau[i + 1], s / DT - i)
  const P = 8 * (60 / (score.bpm || 105))
  const kind = sectionAt(score, s).kind
  const amp = kind === 'chorus' ? 1 : kind === 'intro' || kind === 'outro' ? 0.55 : 0.75
  let gasp = 0
  for (const [a] of holds) if (s > a) gasp += 0.5 * clamp01((s - a) / 0.1) * Math.exp(-Math.max(0, s - a - 0.1) / 0.9)
  // A breath: in quicker than out, and no two the same depth.
  const ph = (2 * Math.PI * tt) / P
  const depth = 0.82 + 0.12 * Math.sin(tt * 0.37) + 0.08 * Math.sin(tt * 1.13 + 1)
  return amp * depth * Math.sin(ph + 0.45 * Math.sin(ph)) + gasp
}

function breathFrame({ time, score, uid }) {
  const { holds } = breath(score)
  const penX = PX + PW * 0.7
  const mid = CY - 10
  const A = 190
  const off = -(time * XS)
  const grid = `<pattern id="${uid}-g" width="19" height="19" patternUnits="userSpaceOnUse" patternTransform="translate(${r(off % 19, 2)} ${r(mid)})"><path d="M19 0H0V19" fill="none" stroke="${BLUE}" stroke-width="0.8" opacity="0.7"/></pattern>
<pattern id="${uid}-G" width="95" height="95" patternUnits="userSpaceOnUse" patternTransform="translate(${r(penX + (off % 95), 2)} ${r(mid)})"><path d="M95 0H0V95" fill="none" stroke="${BLUE}" stroke-width="2"/></pattern>`
  let out = `<defs>${grid}</defs><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>`
  out += `<rect x="${PX}" y="${PY + 40}" width="${PW}" height="${PH - 110}" fill="url(#${uid}-g)"/>`
  out += `<rect x="${PX}" y="${PY + 40}" width="${PW}" height="${PH - 110}" fill="url(#${uid}-G)"/>`
  out += `<path d="M${PX} ${PY + 40}H${PX + PW}M${PX} ${PY + PH - 70}H${PX + PW}" stroke="${INK}" stroke-width="3"/>`
  // Sprocket holes along both edges of the strip.
  let holesD = ''
  for (let x = PX + ((off % 50) + 50) % 50; x < PX + PW; x += 50) holesD += `M${r(x)} ${PY + 20}a7 7 0 1 0 0.01 0M${r(x)} ${PY + PH - 35}a7 7 0 1 0 0.01 0`
  out += `<path d="${holesD}" fill="none" stroke="${INK}" stroke-width="2"/>`
  // Seconds along the bottom.
  for (let s = Math.ceil((time - 40) / 5) * 5; s <= time + 25; s += 5) {
    if (s < 0) continue
    const x = penX + (s - time) * XS
    if (x < PX + 20 || x > PX + PW - 20) continue
    out += t({ x, y: PY + PH - 44, size: 17, text: `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`, fill: INK, anchor: 'middle', weight: 500 })
  }
  // The held breaths, pencilled.
  const notes = [...nameTimes(score).map((at) => [at, 'Ivory'])]
  const looked = score.lines[11]?.words.at(-2)
  if (looked) notes.push([looked.t, 'she looked at me'])
  const br = score.lines[17]?.words.find((w) => /breathe/i.test(w.text))
  if (br) notes.push([br.t, 'forgot how'])
  for (const [at, label] of notes) {
    if (at > time) continue
    const x = penX + (at - time) * XS
    if (x < PX - 100) continue
    const y = mid - breathAt(score, at + 0.4) * A
    out += `<path d="M${r(x + 10)} ${r(y - 30)}V${r(y - 90)}" stroke="${INK}" stroke-width="1.3"/>`
    out += t({ x: x + 16, y: y - 96, size: 24, text: label, fill: INK, weight: 400, upper: false, italic: true })
  }
  // The trace.
  const pts = []
  for (let s = Math.max(0, time - (penX - PX) / XS); s <= time; s += 0.08) pts.push([penX + (s - time) * XS, mid - breathAt(score, s) * A])
  const yNow = mid - breathAt(score, time) * A
  pts.push([penX, yNow])
  out += `<path d="${smooth(pts)}" fill="none" stroke="${RED}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/>`
  // The pen arm.
  const pivot = [penX + 330, PY + 40 + (PH - 110) / 2]
  out += `<path d="M${r(pivot[0])} ${r(pivot[1])}L${r(penX)} ${r(yNow)}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`
  out += `<circle cx="${r(pivot[0])}" cy="${r(pivot[1])}" r="16" fill="${PAPER}" stroke="${INK}" stroke-width="4"/><circle cx="${r(pivot[0])}" cy="${r(pivot[1])}" r="4" fill="${INK}"/>`
  out += `<circle cx="${r(penX)}" cy="${r(yNow)}" r="9" fill="${RED}" stroke="${INK}" stroke-width="2.5"/>`
  return out
}

/* ── C. Five Blanks ─────────────────────────────────────────────────── */

/*
 * Five blank slots where her name should go. Every sung word is a letter he
 * tries in one of them, in blue, and rubs out; the tries pile up like pencil
 * on a page worked too hard. Each time the song says "Ivory", the name writes
 * itself in black, holds, and fades back to the blanks. The last one stays.
 */
const SLOT = { w: 210, gap: 52, y: 560 }
const slotX = (k) => CX - (5 * SLOT.w + 4 * SLOT.gap) / 2 + k * (SLOT.w + SLOT.gap) + SLOT.w / 2
const tries = memo((score) => {
  const rand = rng(17)
  const abc = 'ABCDEFGHJKLMNPQRSTUWXZ'
  return wordsOf(score).filter((w) => !/ivory/i.test(w.text)).map((w, k) => ({
    t: w.t, slot: k % 5, ch: abc[Math.floor(rand() * abc.length)], rot: (rand() - 0.5) * 10, dx: (rand() - 0.5) * 24,
  }))
})

function blanksFrame({ time, score }) {
  const all = tries(score)
  const names = nameTimes(score)
  let out = `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>`
  out += t({ x: slotX(0) - SLOT.w / 2, y: 190, size: 30, text: 'her name —', fill: INK, weight: 400, upper: false, italic: true })
  // The rubbed-out tries, accumulating.
  let ghosts = ''
  let current = null
  for (const a of all) {
    if (a.t > time) break
    current = a
    ghosts += `<text x="${r(slotX(a.slot) + a.dx)}" y="${SLOT.y - 34}" font-size="290" font-weight="300" text-anchor="middle" fill="${BLUE}" opacity="0.07" transform="rotate(${r(a.rot)} ${r(slotX(a.slot))} ${SLOT.y - 120})">${a.ch}</text>`
  }
  out += ghosts
  // The resolved name, when it comes.
  let name = 0
  let nameAt = null
  for (const [i, at] of names.entries()) {
    const last = i === names.length - 1
    const v = Math.min(clamp01((time - at + 0.1) / 0.5), last ? 1 : 1 - clamp01((time - at - 2.6) / 1.6))
    if (v > name) { name = v; nameAt = at }
  }
  if (current && name < 0.5) {
    const k = decay(time, current.t, 0.35)
    out += `<text x="${r(slotX(current.slot) + current.dx)}" y="${SLOT.y - 34}" font-size="290" font-weight="300" text-anchor="middle" fill="${INK}" opacity="${r(0.85 * k * (1 - name), 3)}" transform="rotate(${r(current.rot)} ${r(slotX(current.slot))} ${SLOT.y - 120})">${current.ch}</text>`
  }
  if (name > 0) {
    'IVORY'.split('').forEach((ch, k) => {
      const v = clamp01((time - nameAt + 0.1 - k * 0.09) / 0.25) * name
      out += `<text x="${r(slotX(k))}" y="${SLOT.y - 34}" font-size="290" font-weight="500" text-anchor="middle" fill="${INK}" opacity="${r(Math.min(v, name), 3)}">${ch}</text>`
    })
  }
  // The blanks.
  for (let k = 0; k < 5; k++) out += `<path d="M${r(slotX(k) - SLOT.w / 2)} ${SLOT.y}h${SLOT.w}" stroke="${INK}" stroke-width="7"/>`
  // The caret: glides to the slot being tried.
  const i = current ? all.indexOf(current) : -1
  const from = i > 0 ? all[i - 1].slot : 0
  const to = current ? current.slot : 0
  const u = current ? easeOut(clamp01((time - current.t) / 0.14)) : 0
  const cx = lerp(slotX(from), slotX(to), u)
  out += `<rect x="${r(cx - SLOT.w / 2)}" y="${SLOT.y + 18}" width="${SLOT.w}" height="10" fill="${RED}"/>`
  return out
}

/* ── D. Blue Butterfly ──────────────────────────────────────────────── */

/*
 * One blue butterfly crossing a meadow drawn in a few engraved strokes, its
 * red flight path dotted behind it like Andalusia's route. It loops and
 * doubles back and never goes straight; on each "Ivory" it settles on a flower
 * and opens its wings, then lifts off again. At the end the camera pulls back
 * to show the whole flight, and the butterfly is gone off the edge.
 */
const flight = memo((score) => {
  const rests = nameTimes(score).map((at) => [at - 0.3, at + 2.6])
  const resting = (s) => {
    let h = 0
    for (const [a, b] of rests) h = Math.max(h, Math.min(clamp01((s - a) / 0.5), 1 - clamp01((s - b) / 0.5)))
    return h
  }
  const n = Math.ceil(score.duration / DT) + 2
  const dist = new Float64Array(n)
  for (let i = 1; i < n; i++) dist[i] = dist[i - 1] + DT * 0.55 * (1 - resting(i * DT))
  return { dist, resting, rests }
})
const flyPos = (s) => [60 * s + 250 * Math.sin(0.72 * s), 240 * Math.sin(0.31 * s + 0.6) + 110 * Math.sin(1.31 * s)]
const distAt = (score, time) => {
  const { dist } = flight(score)
  const i = Math.max(0, Math.min(dist.length - 2, Math.floor(time / DT)))
  return lerp(dist[i], dist[i + 1], clamp01(time / DT - i))
}
const WING_F = 'M0 -4C10 -50 60 -104 108 -96C118 -62 84 -18 0 0Z'
const WING_H = 'M0 4C40 0 76 22 68 58C58 86 20 72 0 14Z'
const VEINS = 'M0 -3L96 -88M0 -3L86 -50M0 -3L60 -18M0 6L60 50M0 6L32 66'

function butterflyFrame({ time, score, uid }) {
  const { resting, rests } = flight(score)
  const s = distAt(score, time)
  const [bx, by] = flyPos(s)
  // Camera: the butterfly, smoothed over the last two seconds; the whole flight at the end.
  let cx = 0, cy = 0
  for (let k = 0; k < 8; k++) { const p = flyPos(distAt(score, Math.max(0, time - k * 0.3))); cx += p[0] / 8; cy += p[1] / 8 }
  const sEnd = distAt(score, score.duration)
  const [ex] = flyPos(sEnd)
  const out0 = easeInOut(ramp(time, 175, 186))
  const scale = lerp(1, Math.min(PW / (ex + 600), 1), out0)
  const camX = lerp(cx, ex / 2, out0), camY = lerp(cy * 0.6, 0, out0)
  const view = `translate(${CX} ${CY}) scale(${r(scale, 4)}) translate(${r(-camX)} ${r(-camY)})`
  // Flowers where it will rest, and a scatter of meadow marks, world-fixed.
  const flower = `<g id="${uid}-fl"><path d="M0 0C-4 40 4 80 -6 120" fill="none" stroke="${INK}" stroke-width="2.2"/>${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-17" rx="10" ry="18" transform="rotate(${a})" fill="${PAPER}" stroke="${INK}" stroke-width="2.2"/>`).join('')}<circle r="7" fill="${INK}"/></g>`
  const grass = `<path id="${uid}-gr" d="M0 0Q-6 -24 -14 -40M0 0Q2 -28 6 -46M0 0Q8 -18 18 -30" fill="none" stroke="${INK}" stroke-width="1.8"/>`
  let marks = ''
  const viewL = camX - (PW / 2) / scale - 100, viewR = camX + (PW / 2) / scale + 100
  const rand = rng(5)
  for (let k = 0; k < 160; k++) {
    const x = -600 + k * 45 + rand() * 40
    const y = -420 + rand() * 840
    if (x < viewL || x > viewR) continue
    marks += k % 5 === 2
      ? `<use href="#${uid}-fl" transform="translate(${r(x)} ${r(y)}) scale(0.55)"/>`
      : `<use href="#${uid}-gr" x="${r(x)}" y="${r(y)}"/>`
  }
  for (const [a] of rests) {
    const p = flyPos(distAt(score, a + 0.8))
    if (p[0] < viewL || p[0] > viewR) continue
    marks += `<use href="#${uid}-fl" x="${r(p[0])}" y="${r(p[1] + 18)}"/>`
  }
  // The trail.
  const pts = []
  for (let u = 0; u <= s; u += 0.12) pts.push(flyPos(u))
  pts.push([bx, by])
  let out = `<defs>${flower}${grass}</defs><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/><g transform="${view}">${marks}`
  out += `<path d="${smooth(pts)}" fill="none" stroke="${RED}" stroke-width="4" stroke-dasharray="2 12" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`
  // The butterfly. Off the edge of the world by the end.
  const away = easeInOut(ramp(time, 178, 186))
  if (away < 1) {
    const [ax, ay] = flyPos(s + 0.05)
    const heading = Math.atan2(ay - by, ax - bx) * 180 / Math.PI + 90
    const rest = resting(time)
    const flap = lerp(0.2 + 0.8 * Math.abs(Math.cos(time * Math.PI * 2 * 1.75)), 0.85 + 0.15 * Math.cos(time * 2.4), rest)
    const wings = (sx) => `<g transform="scale(${r(sx * flap, 3)} 1)"><path d="${WING_H}" fill="${BLUE}" stroke="${INK}" stroke-width="3"/><path d="${WING_F}" fill="${BLUE}" stroke="${INK}" stroke-width="3"/><path d="M84 -100C112 -98 116 -70 108 -56C96 -70 86 -84 84 -100Z" fill="${INK}"/><path d="${VEINS}" fill="none" stroke="${INK}" stroke-width="1.6"/><circle cx="96" cy="-70" r="5" fill="${PAPER}"/><circle cx="56" cy="44" r="6" fill="${PAPER}" stroke="${INK}" stroke-width="2"/></g>`
    out += `<g transform="translate(${r(bx + away * 900)} ${r(by - away * 600)}) rotate(${r(lerp(Math.max(-35, Math.min(35, ((heading + 540) % 360) - 180)) * 0.6, 0, rest))}) scale(${r(1 / Math.max(scale, 0.35), 3)})">${wings(1)}${wings(-1)}<path d="M0 -24C6 -10 6 30 0 44C-6 30 -6 -10 0 -24Z" fill="${INK}"/><path d="M-2 -22Q-14 -46 -26 -52M2 -22Q14 -46 26 -52" fill="none" stroke="${INK}" stroke-width="2.2"/></g>`
  }
  return out + '</g>'
}

/* ── E. Name in the Sand ────────────────────────────────────────────── */

/*
 * A shore engraved in level lines: sky, sea and sand. Her name is scratched
 * into the sand, and every line he sings sends a wave up the beach that takes
 * some of it back. On each "Ivory" it is written again. Across the whole song
 * a red sun comes up out of the sea.
 */
const HOR = 300, SHORE = 500

const waves = memo((score) => {
  const rand = rng(23)
  return score.lines.filter((l) => !isName(l)).map((l) => ({ t: l.start + 0.6, reach: 0.25 + rand() * 0.6 }))
})
const reachAt = (score, time) => {
  let v = 0
  for (const w of waves(score)) {
    const a = time - w.t
    if (a < 0 || a > 6) continue
    v = Math.max(v, w.reach * (a < 1.4 ? easeOut(a / 1.4) : 1 - easeInOut(clamp01((a - 1.4) / 4))))
  }
  return v
}

function sandFrame({ time, score, uid }) {
  let out = `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>`
  // The sun, rising all song, cut by the sky's lines where it crosses them.
  const sunY = lerp(HOR + 40, 150, easeInOut(ramp(time, 0, score.duration)))
  const sunX = 1080
  out += `<clipPath id="${uid}-sky"><rect x="${PX}" y="${PY}" width="${PW}" height="${HOR - PY}"/></clipPath>`
  out += `<g clip-path="url(#${uid}-sky)"><circle cx="${sunX}" cy="${r(sunY)}" r="92" fill="${RED}"/></g>`
  // Sky: level lines, thicker towards the top.
  let sky = ''
  for (let y = PY + 8, k = 0; y < HOR - 4; y += 11, k++) {
    const w = lerp(2.4, 0.6, (y - PY) / (HOR - PY))
    sky += `<path d="M${PX} ${y}H${PX + PW}" stroke="${INK}" stroke-width="${r(w, 2)}"/>`
  }
  out += sky
  // Sea: blue wave lines, wider apart as they come in.
  let sea = ''
  let y = HOR + 4
  for (let k = 0; y < SHORE; k++) {
    const amp = 1.5 + k * 0.55
    const len = 70 + k * 14
    let d = `M${PX} ${r(y)}`
    for (let x = PX; x <= PX + PW + len; x += len / 4) d += `L${r(x)} ${r(y + amp * Math.sin((x / len) * 2 * Math.PI + time * 1.4 + k))}`
    sea += d
    y += 6 + k * 1.25
  }
  out += `<path d="${sea}" fill="none" stroke="${BLUE}" stroke-width="2"/>`
  out += `<path d="M${PX} ${HOR}H${PX + PW}" stroke="${INK}" stroke-width="2.5"/>`
  // Sand: a stipple.
  out += `<pattern id="${uid}-st" width="23" height="17" patternUnits="userSpaceOnUse"><circle cx="4" cy="5" r="1.6" fill="${INK}"/><circle cx="15" cy="12" r="1.2" fill="${INK}"/></pattern>`
  out += `<rect x="${PX}" y="${SHORE}" width="${PW}" height="${PY + PH - SHORE}" fill="url(#${uid}-st)" opacity="0.6"/>`
  // The name: written on each "Ivory", washed from the top down by every wave after.
  const names = nameTimes(score)
  let written = null
  for (const at of names) if (at - 0.2 <= time) written = at
  const NY = 760, NS = 230
  let washed = SHORE
  if (written != null) {
    for (const w of waves(score)) {
      if (w.t < written || w.t > time) continue
      const top = SHORE + reachAt(score, Math.min(time, w.t + 1.4)) * (PY + PH - SHORE + 40)
      washed = Math.max(washed, top)
    }
    const draw = clamp01((time - written + 0.2) / 1.2)
    out += `<clipPath id="${uid}-wash"><rect x="${PX}" y="${r(washed)}" width="${PW}" height="${PH}"/></clipPath>`
    out += `<clipPath id="${uid}-pen"><rect x="${r(CX - 520)}" y="${SHORE}" width="${r(1040 * draw)}" height="${PH}"/></clipPath>`
    const word = (op) => `<text x="${CX}" y="${NY}" font-size="${NS}" font-weight="600" text-anchor="middle" letter-spacing="24" fill="none" stroke="${INK}" stroke-width="5" opacity="${op}">IVORY</text>`
    out += `<g clip-path="url(#${uid}-pen)">${word(0.14)}<g clip-path="url(#${uid}-wash)">${word(1)}</g></g>`
  }
  // The swash: water running up the sand.
  const reach = reachAt(score, time)
  if (reach > 0.01) {
    const edge = SHORE + reach * (PY + PH - SHORE + 40)
    let d = `M${PX} ${SHORE}`
    for (let x = PX; x <= PX + PW + 59; x += 60) d += `L${x} ${r(edge + 14 * Math.sin(x / 140 + time * 0.8))}`
    d += `L${PX + PW + 60} ${SHORE}Z`
    out += `<pattern id="${uid}-sw" width="16" height="15" patternUnits="userSpaceOnUse"><path d="M0 7H10" stroke="${BLUE}" stroke-width="1.8"/></pattern>`
    out += `<path d="${d}" fill="url(#${uid}-sw)"/>`
    let lip = `M${PX} ${r(edge + 14 * Math.sin(PX / 140 + time * 0.8))}`
    for (let x = PX; x <= PX + PW + 59; x += 60) lip += `L${x} ${r(edge + 14 * Math.sin(x / 140 + time * 0.8))}`
    out += `<path d="${lip}" fill="none" stroke="${BLUE}" stroke-width="5"/>`
  }
  return out
}

export const CONCEPTS = [
  {
    id: 'letter',
    name: 'The Unfinished Letter',
    lyric: 'When I asked her for her name, she looked straight back at me, oh',
    idea: 'A letter that opens "Dear ______," and never fills in the blank. Each line he sings is written out in a hand you can\'t quite read, then crossed out. The only lines left standing at the end are the two that say he\'ll keep this one for himself.',
    motion: 'The pen writes word by word on the measured onsets, and the camera follows it down the page. On every "Ivory" the pen goes back up to the blank and hovers there without writing. In the outro the camera pulls back to show the whole page.',
    red: 'The nib: it writes, it hovers over her name, and it never lands there.',
    stills: [16, 41.5, 90, 186],
    frame: letterFrame,
  },
  {
    id: 'breath',
    name: 'Held Breath',
    lyric: 'But when she asked me for my name, I forgot how to breathe, oh',
    idea: 'A respiration chart: blue grid paper running under a pen that records his breathing. It rises and falls slowly with the song. Every "Ivory", the moment she looks back at him, and the moment she asks his name, the line catches and goes flat.',
    motion: 'The paper scrolls at a steady speed under the pen, which breathes eight beats to a breath, deeper in the choruses. Each catch is a small gasp and then a held flat line, pencilled with what caused it. The longest hold runs from "breathe" to the next "Ivory".',
    red: 'The breath itself: the trace and the pen tip.',
    stills: [42.5, 90.8, 139.5, 166],
    frame: breathFrame,
  },
  {
    id: 'blanks',
    name: 'Five Blanks',
    lyric: 'I want to get to know her, she remains my mystery',
    idea: 'Five blank slots where her name should go. Every word he sings is a letter he tries in one of them, in blue, and rubs out again, so the slots fill with smudged attempts. Only when the song says "Ivory" does the name appear in black. Then it fades back to blanks.',
    motion: 'One attempt per word, cycling through the five slots, building up like pencil on a page worked too hard. Each "Ivory" writes the name letter by letter, holds it for a breath and lets it go. The last "Ivory" stays.',
    red: 'The cursor under the slot being tried, sliding to the next on every word.',
    stills: [29, 41.5, 133.5, 176],
    frame: blanksFrame,
  },
  {
    id: 'butterfly',
    name: 'Blue Butterfly',
    lyric: 'Her eyes are open ocean and blue butterfly wings',
    idea: 'One blue butterfly crossing a meadow drawn in a few engraved strokes, with its flight path dotted in red behind it like Andalusia\'s route. It loops and doubles back and never flies straight: she remains a mystery.',
    motion: 'The camera follows it smoothly at the pace of the record, its wings beating on the beat. On each "Ivory" it settles on a flower and slowly opens its wings, then lifts off again. At the end the camera pulls back to show the whole looping flight, and the butterfly is gone.',
    red: 'The flight path: a dotted line that only ever grows.',
    stills: [30, 96, 133, 186],
    frame: butterflyFrame,
  },
  {
    id: 'sand',
    name: 'Name in the Sand',
    lyric: 'Eyes that hit a sunrise like waves that hit a shore, oh',
    idea: 'A shore engraved in level lines: sky, blue sea, stippled sand. Her name is scratched in the sand, and every line he sings sends a wave up the beach that takes some of it back. He never finishes saying it before the sea has it.',
    motion: 'Each sung line is a wave: it runs up, washes the top off the letters, and slides back. On every "Ivory" the name is written in again, left to right. A red sun rises out of the sea over the whole song.',
    red: 'The sun, coming up from the horizon across the song.',
    stills: [16, 42.5, 90, 166],
    frame: sandFrame,
  },
]
