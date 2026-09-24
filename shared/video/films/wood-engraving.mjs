/*
 * Wood engraving — "Ship to Stockholm" as an end-grain block cut in white line.
 *
 * Track 9 of the album (app/config/albumStyle.ts). The song is an ultimatum. A
 * man has had enough — of the anger, of people treating each other badly, of
 * talking and not being heard — and the ship back to Stockholm is the way out,
 * to a simpler time. But he is in love with what he is leaving, and he does not
 * want to go. The film is the story of a man who does not want to leave and
 * feels he has to.
 *
 * THREE RULES THE WHOLE FILM IS BUILT ON
 *
 *   - Left is home and right is the ship. Behind him, on the far shore, is the
 *     town, and in it one window that stays lit when every other light goes
 *     out: whatever he loves, left unnamed. Ahead of him, out on the water, is
 *     the ship, growing as he nears it. He walks between them the whole song,
 *     and keeps turning round.
 *   - Red is the journey, and the journey is held back. Until he goes, the only
 *     red on the block is the ship's stern lantern, small and swinging. The red
 *     wake is torn open through the ice only when he is aboard and the ship
 *     moves — the one time in the film that anything red travels.
 *   - The window answers nothing. He turns back to it, reaches for it, kneels
 *     to it, lets a letter go to it. On "not by letter or phone" it goes out.
 *
 * THE BLOCK, LEFT TO RIGHT — one quay the camera walks along with him
 *
 *   Intro        The block is cut: sky, far shore, sea and quay. The town's
 *                windows are lit; the ship is a speck with a red lantern. He
 *                walks in off the shingle with a sea bag on his shoulder.
 *   Verse 1      The town's lights go out behind him, all but one ("away with
 *                the light"). The ship's sails drop ("a' sailing"). Stars come
 *                out ("follow the night"). He stops and turns back to the one
 *                window ("lost love"), and it glows.
 *   Verse 2      The harbour-master's hut: STOCKHOLM on the board and a clock
 *                whose hands run ("waits on no man"). The wind rises and the
 *                snow goes sideways ("the wind doesn't wait"). He turns back
 *                and walks towards the window ("to get back to you"), holds out
 *                his hand with coins in it, kneels, puts his hand to his chest
 *                ("bribing or begging or bleeding").
 *   Break        He gets up and walks on. Lamp posts carry the telephone wire.
 *   Verse 3      Two crowds face each other across the quay. Rifles come up on
 *                "guns", fists on "fight"; the lamps over them fade ("fading").
 *                He stands between them with his arms out ("done trying to
 *                prove"), and one by one they turn their backs on him
 *                ("beyond persuading").
 *   Instrumental The plate takes the whole sheet. A storm: clouds over the
 *                moon, snow in streaks, the sea heaving, the ship coming in
 *                through it with its lantern swinging. He walks into it, bent
 *                double. Lightning; a wave breaks over the quay and puts him on
 *                one knee; the telephone wire snaps. The bass drops out and so
 *                does the storm: everything hushed, the moon back.
 *   Verse 4      The band comes back in. The ship lies in thin new ice off the
 *                end of the quay; on "rescue" a plank is run out to him from
 *                it; on "razor thin ice" the ice cracks. He walks the plank
 *                like a tightrope, arms out, and a light comes up on the
 *                horizon ("Eden"). Dogs snarl at each other on the quay behind
 *                him ("dogs … bite"); newspapers blow past him over the ice,
 *                the same page over and over ("not worth repeating").
 *   Verse 5      He turns round on the plank to the window. He holds up a
 *                letter ("I just need to ask"), reaches ("reach you"); the wind
 *                takes it ("letter"); the broken wire sparks ("phone"); the
 *                window goes out. "So I'm taking the ship": he turns, crosses,
 *                climbs aboard, and on "Stockholm" the ship casts off.
 *   Outro        The ship breaks out through the ice, east, towards the light,
 *                and the red wake tears open behind it — the whole journey of
 *                the film, drawn in the last sixteen seconds. He stands at the
 *                stern looking back.
 *
 * THE PRINT
 *
 *   - White line on black, the way an engraver on end grain works: the block
 *     prints black and every cut is paper. Tone is nothing but how wide and how
 *     close the lines are (toneLines, glowRows). The ice is the second ink, laid
 *     under the cuts; the lantern and the wake are the red.
 *   - Glows are rows of line that swell towards a light, computed exactly per
 *     row (glowRows), so a moon or a lamp can move and fade with nothing
 *     resampled. Everything that does not move is baked once.
 *   - The ship is seen in perspective: one point on the quay, projected, so it
 *     grows as he walks towards it and shrinks as it sails away, and its wake
 *     narrows to the horizon.
 *
 * THE MOTION is the album's (ALBUM_MOTION). He is a velocity schedule,
 * integrated; the camera follows him with a floor at the drift, so it never
 * stops; everything he meets is placed from where he is on its word.
 * `woodEngravingFrame({ time, score })` is a pure function of the clock.
 */

import { t as text, r, clamp01, easeOut, easeInOut, ramp, lerp } from '../kit.mjs'
import { sectionAt, lineAt } from '../score.mjs'
import { endCard } from '../ending.mjs'
import { joints, strokes, POSES } from '../figure.mjs'
import { PAPER, INK, RED, SECOND_INK, SHEET, paper, marginLyric, titleCard, land, easeCamera } from '../album.mjs'

export const ICE = SECOND_INK['ship-to-stockholm']
/** The white of the paper showing through a cut. */
export const CUT = PAPER

export const WOOD_ENGRAVING = {
  id: 'album-ship-to-stockholm',
  name: 'Wood engraving',
  accent: RED,
  palette: { PAPER, INK, RED, ICE },
}

const PL = SHEET.plate
/** The horizon, the far edge of the quay, and the line he walks on. */
const HY = 408
const QY = 604
const FEET = 672
const MAN_H = 158
/** Where a ship at full size floats: its waterline, on the ice off the quay's end. */
const MOOR_Y = 652
/** Parallax: sky, far shore, open sea, the ice along the quay. The quay is 1. */
const PX = { sky: 0.04, far: 0.05, sea: 0.3, ice: 0.75 }
const DT = 0.01

/* ══ SMALL THINGS ══════════════════════════════════════════════════════ */

const P = (x, y) => `${r(x)} ${r(y)}`
/** A true modulo: the camera starts left of zero, and JavaScript's % keeps the sign. */
const mod = (a, n) => ((a % n) + n) % n
const smooth = (u) => {
  const x = clamp01(u)
  return x * x * (3 - 2 * x)
}
const op = (o) => (o < 0.999 ? ` opacity="${r(Math.max(0, o), 3)}"` : '')
const pen = (d, w = 1, o = {}) => (d ? `<path d="${d}" fill="none" stroke="${o.stroke ?? CUT}" stroke-width="${r(w, 2)}" stroke-linecap="${o.cap ?? 'round'}" stroke-linejoin="round"${op(o.opacity ?? 1)}${o.extra ?? ''}/>` : '')
const fillD = (d, colour, o = {}) => (d ? `<path d="${d}" fill="${colour}"${op(o.opacity ?? 1)}${o.extra ?? ''}/>` : '')
const polyD = (pts, close = false) => (pts.length > 1 ? 'M' + pts.map(([x, y]) => P(x, y)).join('L') + (close ? 'Z' : '') : '')
const circ = (x, y, rad) => (rad > 0.2 ? `M${P(x - rad, y)}a${r(rad)} ${r(rad)} 0 1 0 ${r(rad * 2)} 0a${r(rad)} ${r(rad)} 0 1 0 ${r(-rad * 2)} 0` : '')
const rectD = (x, y, w, h) => `M${P(x, y)}h${r(w)}v${r(h)}h${r(-w)}Z`
/** A window of time: 0 → 1 over [a, b], back to 0 over [c, d]. */
const win = (t, a, b, c = Infinity, d = Infinity) => easeInOut(ramp(t, a, b)) * (1 - easeInOut(ramp(t, c, d)))

/** Deterministic noise in 0–1 from integers — no Math.random anywhere. */
function hash(x, y, s = 0) {
  let h = Math.imul((x | 0) ^ 0x27d4eb2d, 0x165667b1) ^ Math.imul(((y | 0) + Math.imul(s | 0, 7919)) | 0, 0x9e3779b1)
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}
function seq(seed) {
  let i = 0
  return () => hash(i++, 17, seed)
}
const CACHE = new Map()
const memo = (key, build) => {
  if (!CACHE.has(key)) CACHE.set(key, build())
  return CACHE.get(key)
}

/** A closed curve through `pts`, quadratics through the midpoints. */
function blob(pts) {
  const n = pts.length
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  let d = `M${P(...mid(pts[n - 1], pts[0]))}`
  pts.forEach((p, i) => { d += `Q${P(...p)} ${P(...mid(p, pts[(i + 1) % n]))}` })
  return d + 'Z'
}
/** An open curve through `pts`, quadratics through the midpoints. */
function curve(pts) {
  if (pts.length < 3) return polyD(pts)
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  let d = `M${P(...pts[0])}L${P(...mid(pts[0], pts[1]))}`
  for (let i = 1; i < pts.length - 1; i++) d += `Q${P(...pts[i])} ${P(...mid(pts[i], pts[i + 1]))}`
  return d + `L${P(...pts[pts.length - 1])}`
}

/* ══ THE TONE ENGINE ═══════════════════════════════════════════════════
 *
 * An engraver on end grain makes a gradient with line, not with grey: the
 * lines swell where it is light and thin to nothing where it is dark. Widths
 * are a graver's, finest first; every width is one <path>.
 */
const WIDTHS = [0.45, 0.8, 1.2, 1.7, 2.4, 3.2]
/** A glow swells through finer steps than a field, or it bands into rings. */
const GLOW_W = [0.35, 0.55, 0.8, 1.05, 1.3, 1.6, 1.9, 2.2, 2.5, 2.8, 3.1, 3.4]
const bucketOf = (b) => (b < 0.05 ? -1 : Math.min(WIDTHS.length - 1, Math.floor(b * WIDTHS.length)))
const w0 = Math.round

/** Horizontal engraved lines whose width follows `bright(x, y)`; runs of one width merged. */
function toneLines({ x0, x1, y0, y1, spacing = 7, step = 12, bright, seed = 1 }) {
  const buckets = WIDTHS.map(() => [])
  let row = 0
  for (let y = y0; y <= y1; y += spacing, row++) {
    let run = null
    for (let x = Math.floor(x0 / step) * step; x <= x1 + step; x += step) {
      // Noise in blocks of four samples, so runs break like a graver's, not like dither — keyed
      // to where the sample is, not to its index, so a field baked in pieces joins up.
      const q = Math.round(x / step)
      const b = x > x1 ? -1 : bright(x, y) + (hash(q >> 2, Math.round(y * 3), seed) - 0.5) * 0.06 + (hash(q, Math.round(y * 3), seed + 1) - 0.5) * 0.02
      const k = bucketOf(b)
      if (run && run.k === k) { run.b = x; continue }
      const edge = x - step / 2
      if (run && run.k >= 0) buckets[run.k].push([run.a, Math.min(edge, x1), y])
      run = { k, a: Math.max(edge, x0), b: x }
    }
  }
  return buckets
}
const drawRows = (buckets, colour = CUT, o = {}) => buckets.map((rows, k) => rows.length
  ? `<path d="${rows.map(([a, b, y]) => `M${w0(a)} ${w0(y)}H${w0(b)}`).join('')}" stroke="${colour}" stroke-width="${WIDTHS[k] * (o.scale ?? 1)}" stroke-linecap="round"${op(o.opacity ?? 1)}/>`
  : '').join('')

/** The sea: short curved flicks of the graver in rows, longer and closer as they come forward. */
function flicks({ x0, x1, y0, y1, bright, seed = 3 }) {
  const rand = seq(seed)
  const buckets = WIDTHS.map(() => [])
  let y = y0
  while (y < y1) {
    const depth = (y - y0) / (y1 - y0)
    const len = 10 + depth * 30
    const gap = 5 + depth * 10
    let x = x0 - rand() * len
    while (x < x1) {
      const b = bright(x, y, depth)
      const k = bucketOf(b)
      const lift = (1 + depth * 3) * (0.5 + rand())
      const l = len * (0.6 + rand() * 0.7)
      if (k >= 0) buckets[k].push(`M${w0(x)} ${w0(y + (rand() - 0.5) * 2)}Q${w0(x + l * 0.45)} ${w0(y - lift)} ${w0(x + l)} ${w0(y + (rand() - 0.3) * 1.5)}`)
      x += len + gap * (0.6 + rand() * 0.8)
    }
    y += 4.5 + depth * 8
  }
  return buckets
}
const drawFlicks = (buckets, colour = CUT, o = {}) => buckets.map((ds, k) => ds.length
  ? `<path d="${ds.join('')}" fill="none" stroke="${colour}" stroke-width="${WIDTHS[k] * (o.scale ?? 1)}" stroke-linecap="round"${op(o.opacity ?? 1)}/>`
  : '').join('')

/**
 * A glow: rows of line swelling towards a light at (cx, cy), cut exactly — for
 * each row and each width, the stretch where the light is bright enough is an
 * interval round cx, so the rows are nested segments, not samples. A light can
 * move and fade and nothing is resampled; `k` scales its strength.
 * `fall(d)` is the brightness at distance d (0–1).
 */
function glowRows({ cx, cy, R, fall, spacing = 7, y0 = -Infinity, y1 = Infinity, k = 1, squash = 1, phase = 0 }) {
  if (k <= 0.01) return ''
  const out = GLOW_W.map(() => [])
  const first = Math.ceil((Math.max(cy - R / squash, y0) - phase) / spacing) * spacing + phase
  for (let y = first; y <= Math.min(cy + R / squash, y1); y += spacing) {
    const dy = (y - cy) * squash
    for (let b = 0; b < GLOW_W.length; b++) {
      // Solve fall(d)·k ≥ threshold for the widest d, by bisection on a monotone fall.
      const need = (b + 0.6) / GLOW_W.length
      if (fall(Math.abs(dy)) * k < need) continue
      let lo = Math.abs(dy)
      let hi = R
      for (let i = 0; i < 14; i++) {
        const m = (lo + hi) / 2
        if (fall(m) * k >= need) lo = m
        else hi = m
      }
      const hw = Math.sqrt(Math.max(0, lo * lo - dy * dy)) * (1 + (hash(Math.round(y), b, 5) - 0.5) * 0.12)
      if (hw > 1) out[b].push(`M${w0(cx - hw)} ${w0(y)}H${w0(cx + hw)}`)
    }
  }
  return out.map((ds, b) => ds.length ? `<path d="${ds.join('')}" stroke="${CUT}" stroke-width="${GLOW_W[b]}" stroke-linecap="round"/>` : '').join('')
}

/* ══ THE WORLD THAT DOES NOT MOVE — baked once ═════════════════════════
 *
 * Baked in pieces along x, so a frame carries only the pieces in view: the
 * page rebuilds the whole frame sixty times a second, and a field drawn whole
 * is mostly markup nobody can see.
 */
const PIECE = 350
function baked(key, x0, x1, draw) {
  return memo(key, () => {
    const out = []
    for (let a = x0; a < x1; a += PIECE) out.push({ a, b: Math.min(x1, a + PIECE), svg: draw(a, Math.min(x1, a + PIECE), out.length) })
    return out
  })
}
/** A baked field drawn at `dx`, repeated `copies` times every `period`, keeping only what is in view. */
function inView(pieces, dx, period = 0, copies = 1, attrs = '') {
  let out = ''
  for (let c = 0; c < copies; c++) {
    const o = dx + c * period
    let inner = ''
    for (const p of pieces) if (o + p.b >= -30 && o + p.a <= 1630) inner += p.svg
    if (inner) out += `<g transform="translate(${r(o, 1)} 0)">${inner}</g>`
  }
  return out && attrs ? `<g${attrs}>${out}</g>` : out
}

const SKY_ROWS = 7
/** The night sky: dark overhead, paling to the horizon. Sky-layer coordinates. */
const skyField = () => baked('sky', -300, 2500, (a, b, i) => drawRows(toneLines({
  x0: a, x1: b, y0: -4, y1: HY - 4, spacing: SKY_ROWS, step: 12, seed: 5,
  bright: (x, y) => 0.13 + Math.max(0, (y - 20) / (HY - 20)) ** 2.2 * 0.48 + 0.07 * Math.sin(x / 190 + y / 37) * Math.sin(x / 83 - y / 51 + 1.3),
})))

const STARS = memo('stars', () => {
  const rand = seq(41)
  return Array.from({ length: 150 }, (_, i) => ({ x: -200 + rand() * 2600, y: 10 + rand() * (HY - 120), s: 0.8 + rand() * 1.8, i }))
})

/*
 * The far shore, far-layer coordinates: low hills along the whole horizon, and
 * on the left a town on a hill — roofs, a spire, and its windows.
 */
const TOWN = { x0: -120, x1: 640 }
const farHill = (x) => {
  const town = Math.exp(-(((x - 260) / 360) ** 2)) * 105
  return HY - 6 - town - 10 * Math.sin(x / 170 + 1) - 6 * Math.sin(x / 61) - (x > 1500 ? 18 * Math.exp(-(((x - 1900) / 260) ** 2)) : 0)
}
const FAR = memo('far', () => {
  const pts = []
  for (let x = -600; x <= 2800; x += 20) pts.push([x, farHill(x)])
  const hill = polyD([[-600, HY + 4], ...pts, [2800, HY + 4]], true)
  const ridge = curve(pts)
  // Houses up the hill: gables in ink, their roof lines cut.
  const rand = seq(77)
  const houses = []
  const windows = []
  for (let x = TOWN.x0; x < TOWN.x1; x += 30 + rand() * 24) {
    const base = farHill(x) + 12 + rand() * 22
    const w = 24 + rand() * 18
    const h = 18 + rand() * 16
    houses.push({ x, base, w, h })
    const n = rand() < 0.5 ? 1 : 2
    for (let i = 0; i < n; i++) windows.push({ x: x + 5 + i * (w / 2) + rand() * 2, y: base - h + 5 + rand() * 3, i: windows.length })
  }
  const spire = [300, farHill(300) + 6]
  let roofs = ''
  let fills = ''
  for (const hs of houses) {
    const d = `M${P(hs.x, hs.base)}V${r(hs.base - hs.h)}L${P(hs.x + hs.w / 2, hs.base - hs.h - hs.w * 0.45)}L${P(hs.x + hs.w, hs.base - hs.h)}V${r(hs.base)}Z`
    fills += d
    roofs += `M${P(hs.x - 1, hs.base - hs.h)}L${P(hs.x + hs.w / 2, hs.base - hs.h - hs.w * 0.45)}L${P(hs.x + hs.w + 1, hs.base - hs.h)}`
  }
  const spireD = `M${P(spire[0] - 12, spire[1])}V${r(spire[1] - 52)}L${P(spire[0], spire[1] - 124)}L${P(spire[0] + 12, spire[1] - 52)}V${r(spire[1])}Z`
  // A few engraved lines across the hills, thinning out away from the ridge.
  const hatch = toneLines({ x0: -600, x1: 2800, y0: HY - 90, y1: HY + 2, spacing: 5, step: 10, seed: 9, bright: (x, y) => (y > farHill(x) + 3 ? 0.14 + 0.1 * Math.sin(x / 90) : -1) })
  // The window that stays lit: a house a little apart, up the hill.
  const you = { x: 575, y: farHill(575) + 2 }
  const youHouse = `M${P(you.x - 16, you.y + 24)}V${r(you.y - 4)}L${P(you.x, you.y - 20)}L${P(you.x + 16, you.y - 4)}V${r(you.y + 24)}Z`
  return {
    body: fillD(hill, INK) + drawRows(hatch, CUT, { opacity: 0.8 }) + pen(ridge, 1.3) + fillD(fills + spireD + youHouse, INK) + pen(roofs, 1.1) + pen(spireD, 1.1) + pen(youHouse, 1.1),
    windows,
    you: { x: you.x, y: you.y + 6 },
  }
})

/** Open sea, sea-layer coordinates: one tile, repeated. */
const SEA_TILE = 1400
const seaTile = () => baked('sea', 0, SEA_TILE, (a, b, i) => drawFlicks(flicks({
  x0: a, x1: b, y0: HY + 4, y1: 566, seed: 8 + i,
  bright: (x, y, depth) => 0.12 + depth * 0.2 + 0.05 * Math.sin(x / 50 + y),
})))

/** The ice along the quay, ice-layer coordinates: a frosted sheet with a ragged far edge. */
const ICE_TILE = 1600
const ICE_TOP = (x) => 548 + 4 * Math.sin((x / ICE_TILE) * Math.PI * 2 * 3) + 2.5 * Math.sin((x / ICE_TILE) * Math.PI * 2 * 11)
const iceTile = () => baked('ice', 0, ICE_TILE, (a, b, i) => {
  const top = []
  for (let x = a; x <= b; x += 16) top.push([x, ICE_TOP(x)])
  if (top[top.length - 1][0] < b) top.push([b, ICE_TOP(b)])
  const d = polyD([...top, [b, QY + 20], [a, QY + 20]], true)
  const frost = toneLines({ x0: a, x1: b, y0: 552, y1: QY + 18, spacing: 3.4, step: 12, seed: 17, bright: (x, y) => (y > ICE_TOP(x) + 2 ? 0.2 + 0.18 * Math.sin(x / 130) ** 2 : -1) })
  const rand = seq(29 + i)
  const cracks = Array.from({ length: 4 }, () => {
    let x = a + rand() * (b - a - 60)
    let y = 556 + rand() * 40
    const pts = [[x, y]]
    for (let i = 0; i < 5; i++) { x += 14 + rand() * 40; y += (rand() - 0.45) * 12; pts.push([x, y]) }
    return polyD(pts)
  }).join('')
  return fillD(d, ICE, { opacity: 0.5 }) + drawRows(frost, CUT, { opacity: 0.75 }) + pen(cracks, 1.4, { stroke: INK }) + pen(polyD(top), 1.4)
})

/** The quay's paving, ground coordinates: courses in perspective, one tile repeated. */
const PAVE_TILE = 520
const COURSES = memo('courses', () => {
  const ys = []
  for (let k = 0; ; k++) {
    const y = QY + 10 + (k ** 1.5) * 6.2
    if (y > 930) break
    ys.push(y)
  }
  return ys
})
const paveTile = () => memo('pave', () => {
  let thin = ''
  let joints = ''
  COURSES.forEach((y, k) => {
    const depth = (y - QY) / (900 - QY)
    thin += `M0 ${r(y)}H${PAVE_TILE}`
    const gap = 46 + depth * 110
    const off = (k % 2) * gap * 0.5
    const next = COURSES[k + 1] ?? y + 30
    for (let x = off; x < PAVE_TILE; x += gap) joints += `M${P(x + (hash(k, x | 0, 3) - 0.5) * 8, y + 1.5)}L${P(x + (x - PAVE_TILE / 2) * 0.05 * depth, next - 1.5)}`
  })
  return pen(thin, 0.9, { opacity: 0.7 }) + pen(joints, 0.8, { opacity: 0.55 })
})

/* ══ FIGURES ═══════════════════════════════════════════════════════════
 *
 * A figure is ink with a cut round it: every part is stroked once wide in the
 * paper, then filled and stroked in the ink, so the union of the parts has a
 * white edge and reads against the sky, the sea or the paving alike.
 */

const RAD = Math.PI / 180
const WALK = [
  POSES.walk,
  { lean: 4, armB: [-4, 14], armF: [4, 16], legB: [4, 26], legF: [-2, 2], lift: 0.012 },
  { lean: 4, armB: POSES.walk.armF, armF: POSES.walk.armB, legB: POSES.walk.legF, legF: POSES.walk.legB },
  { lean: 4, armB: [4, 16], armF: [-4, 14], legB: [-2, 2], legF: [4, 26], lift: 0.012 },
]
const G = {
  stand: POSES.stand,
  reach: { lean: 4, armB: [-12, 6], armF: [96, -4], legB: [-8, 0], legF: [8, 0] },
  offer: { lean: 6, armB: [-10, 8], armF: [52, 38], legB: [-8, 0], legF: [8, 0] },
  kneel: { lean: 10, armB: [22, 56], armF: [34, 64], legB: [2, 92], legF: [82, 82] },
  chest: { lean: 24, armB: [8, 20], armF: [36, 118], legB: [2, 92], legF: [82, 82] },
  plead: { lean: 0, armB: [-78, 12], armF: [78, 12], legB: [-10, 0], legF: [10, 0] },
  bowed: { lean: 12, armB: [-4, 4], armF: [6, 6], legB: [-6, 0], legF: [6, 0] },
  brace: { lean: 26, armB: [30, 40], armF: [88, 10], legB: [2, 92], legF: [82, 82] },
  rope: { lean: 2, armB: [-92, -4], armF: [92, 4], legB: [-6, 0], legF: [6, 0] },
  letter: { lean: 2, armB: [-10, 6], armF: [64, 62], legB: [-6, 0], legF: [6, 0] },
  reachHigh: { lean: 6, armB: [-14, 6], armF: [118, -6], legB: [-8, 0], legF: [8, 0] },
  aim: { lean: 4, armB: [70, 50], armF: [88, 4], legB: [-12, 0], legF: [14, 0] },
  port: { lean: 0, armB: [20, 70], armF: [40, 70], legB: [-8, 0], legF: [8, 0] },
  fist: { lean: 4, armB: [-20, 30], armF: [150, 20], legB: [-10, 0], legF: [12, 0] },
}

function blend(a, b, u) {
  if (u <= 0) return a
  if (u >= 1) return b
  const mix = (p, q) => lerp(p, q, u)
  return {
    lean: mix(a.lean ?? 0, b.lean ?? 0),
    armB: [mix(a.armB[0], b.armB[0]), mix(a.armB[1], b.armB[1])],
    armF: [mix(a.armF[0], b.armF[0]), mix(a.armF[1], b.armF[1])],
    legB: [mix(a.legB[0], b.legB[0]), mix(a.legB[1], b.legB[1])],
    legF: [mix(a.legF[0], b.legF[0]), mix(a.legF[1], b.legF[1])],
    lift: mix(a.lift ?? 0, b.lift ?? 0),
  }
}
function cycleAt(poses, phase) {
  const i = Math.floor(phase)
  const f = phase - i
  const m = poses.length
  return blend(poses[((i % m) + m) % m], poses[(((i + 1) % m) + m) % m], f * f * (3 - 2 * f))
}
/** Joints facing east (u = 0) through side-on to west (u = 1): a turn, not a flip. */
function turnJ(x, ground, h, pose, u) {
  const a = joints(x, ground, h, pose, 1)
  if (u <= 0.001) return a
  const b = joints(x, ground, h, pose, -1)
  if (u >= 0.999) return b
  const e = easeInOut(u)
  const out = {}
  for (const k of Object.keys(a)) out[k] = a[k].map((v, i) => lerp(v, b[k][i], e))
  return out
}

/**
 * A person, cut: a long coat, boots, a cap or a hat, and optionally a sea bag
 * and a gun. Built from parts painted back to front — bag, back arm, legs,
 * coat, head, hat, front arm — and each part is cut round in the paper before
 * it is inked, so where one part crosses another there is a white edge, the
 * way an engraver separates an arm from a coat. `f` is the facing, continuous
 * from 1 (east) to −1 (west), so a turn passes through side-on.
 */
function person(j, h, f, o = {}) {
  const H = j.hip
  const N = j.neck
  const len = Math.hypot(N[0] - H[0], N[1] - H[1]) || 1
  const up = [(N[0] - H[0]) / len, (N[1] - H[1]) / len]
  const side = [-up[1], up[0]]
  const at = (p, a, b) => [p[0] + side[0] * a + up[0] * b, p[1] + side[1] * a + up[1] * b]
  const lw = h * 0.062
  const rim = 2
  const wind = (o.wind ?? 0) * h * 0.08
  // The coat, from the collar to below the knee, flaring, its hem blown back.
  const kneeY = (j.kneeB[1] + j.kneeF[1]) / 2
  const hem = Math.max(h * 0.12, (kneeY - H[1]) * (o.coat ?? 0.75) + h * 0.03)
  const coat = blob([
    at(N, -0.075 * h, 0.01 * h), at(N, 0.075 * h, 0.01 * h),
    at(H, 0.078 * h + f * 0.01 * h, 0), at(H, 0.12 * h - f * wind * 0.3, -hem),
    at(H, 0, -hem - 0.01 * h), at(H, -0.125 * h - f * wind * 1.2, -hem + 0.005 * h),
    at(H, -0.078 * h + f * 0.01 * h, 0),
  ])
  const headC = at(N, 0.012 * h * f, 0.082 * h)
  const hr = h * 0.064
  const neck = polyD([N, headC])
  const limb = (pts) => polyD(pts)
  const backArm = limb([j.shoulder, j.elbowB, j.handB])
  const frontArm = limb([j.shoulder, j.elbowF, j.handF])
  const boot = (foot) => `M${P(foot[0] - f * h * 0.01, foot[1] - h * 0.01)}L${P(foot[0] + f * h * 0.045, foot[1] - h * 0.006)}`
  const legs = limb([H, j.kneeB, j.footB]) + limb([H, j.kneeF, j.footF])
  const boots = boot(j.footB) + boot(j.footF)
  const [hx, hy] = headC
  let hat = ''
  if (o.hat === 'bowler') {
    hat = `M${P(hx - hr * 1.5, hy - hr * 0.45)}L${P(hx + hr * 1.5, hy - hr * 0.45)}L${P(hx + hr * 0.95, hy - hr * 0.62)}Q${P(hx, hy - hr * 2.1)} ${P(hx - hr * 0.95, hy - hr * 0.62)}Z`
  }
  else if (o.hat !== 'none') {
    hat = `M${P(hx - f * hr * 1.05, hy - hr * 0.15)}Q${P(hx - f * hr * 1.0, hy - hr * 1.3)} ${P(hx + f * hr * 0.4, hy - hr * 1.18)}L${P(hx + f * hr * 1.75, hy - hr * 0.5)}L${P(hx + f * hr * 0.85, hy - hr * 0.3)}Z`
  }
  let bag = ''
  if (o.bag) {
    const c = at(N, -f * 0.13 * h, -0.15 * h)
    bag = blob([at(c, -0.05 * h, 0.13 * h), at(c, 0.05 * h, 0.12 * h), at(c, 0.075 * h, 0), at(c, 0.05 * h, -0.13 * h), at(c, -0.05 * h, -0.12 * h), at(c, -0.07 * h, 0)])
  }
  let gun = ''
  if (o.gun) {
    const [ex, ey] = j.elbowF
    const [gx, gy] = j.handF
    const dl = Math.hypot(gx - ex, gy - ey) || 1
    const ux = (gx - ex) / dl
    const uy = (gy - ey) / dl
    gun = `M${P(ex - ux * h * 0.12, ey - uy * h * 0.12 + h * 0.01)}L${P(gx + ux * h * 0.46, gy + uy * h * 0.46)}`
  }
  const partStroke = (d, w) => pen(d, w + rim * 2, { stroke: CUT }) + pen(d, w, { stroke: INK })
  const partFill = (d) => fillD(d, INK, { extra: ` stroke="${CUT}" stroke-width="${rim * 2}" paint-order="stroke"` })
  const folds = `M${P(...at(N, 0.03 * h, -0.04 * h))}L${P(...at(H, 0.05 * h - f * wind * 0.2, -hem * 0.85))}M${P(...at(N, -0.035 * h, -0.05 * h))}L${P(...at(H, -0.06 * h - f * wind * 0.9, -hem * 0.8))}`
  return `<g${op(o.opacity ?? 1)}>`
    + (bag ? partFill(bag) + pen(`M${P(...at(N, f * 0.06 * h, -0.02 * h))}L${P(...at(N, -f * 0.12 * h, -0.13 * h))}`, 1.1, { opacity: 0.8 }) : '')
    + partStroke(backArm, lw * 0.95)
    + partStroke(legs, lw * 1.05) + partStroke(boots, lw * 0.62)
    + partFill(coat)
    + pen(folds, 1, { opacity: 0.75 })
    + partStroke(neck, lw * 0.8)
    + partFill(circ(hx, hy, hr))
    + (hat ? partFill(hat) : '')
    + (gun ? pen(gun, h * 0.028 + rim * 2, { stroke: CUT, cap: 'butt' }) + pen(gun, h * 0.028, { stroke: INK, cap: 'butt' }) : '')
    + partStroke(frontArm, lw * 0.95)
    + '</g>'
}

/**
 * A dog, side on, facing `f`: a lean body, a long head whose jaw opens `snap`,
 * hackles up, four legs that stride at `phase` while it runs and plant while it
 * snarls. `s` is its length.
 */
function dog(x, ground, s, f, o = {}) {
  const snap = o.snap ?? 0
  const run = o.run ?? 0
  const ph = o.phase ?? 0
  const X = (u) => x + u * s * f
  const Y = (v) => ground + v * s
  const low = 0.06 * (1 - run) // it crouches to snarl
  const body = blob([
    [X(-0.46), Y(-0.5)], [X(-0.3), Y(-0.6 + low)], [X(0.02), Y(-0.58 + low)], [X(0.26), Y(-0.64 + low)],
    [X(0.4), Y(-0.6 + low)], [X(0.44), Y(-0.44 + low)], [X(0.3), Y(-0.36 + low)], [X(0.02), Y(-0.34)],
    [X(-0.3), Y(-0.36)], [X(-0.48), Y(-0.42)],
  ])
  const hx = X(0.42)
  const hy = Y(-0.6 + low * 1.6)
  const head = blob([
    [hx, hy - 0.08 * s], [X(0.52), Y(-0.72 + low * 1.6)], [X(0.62), Y(-0.7 + low * 1.6)], [X(0.8), Y(-0.64 + low * 1.6)],
    [X(0.82), Y(-0.6 + low * 1.6)], [X(0.62), Y(-0.56 + low * 1.6)], [hx, hy + 0.05 * s],
  ])
  const a = snap * 26 * RAD
  const jx = X(0.6)
  const jy = Y(-0.575 + low * 1.6)
  const jaw = `M${P(jx, jy)}L${P(jx + Math.cos(a) * 0.22 * s * f, jy + Math.sin(a) * 0.22 * s)}L${P(jx + Math.cos(a) * 0.2 * s * f, jy + Math.sin(a) * 0.22 * s + 0.035 * s)}L${P(jx - 0.06 * s * f, jy + 0.05 * s)}Z`
  const ear = `M${P(X(0.5), Y(-0.7 + low * 1.6))}L${P(X(0.46), Y(-0.84 + low * 1.6))}L${P(X(0.56), Y(-0.73 + low * 1.6))}Z`
  const leg = (u, p, back) => {
    const sw = Math.sin(ph * Math.PI * 2 + p) * 0.2 * run
    const kx = back ? -0.05 : 0.03
    return `M${P(X(u), Y(-0.42))}L${P(X(u + kx + sw * 0.5), Y(-0.2))}L${P(X(u + sw), Y(0))}`
  }
  const legs = leg(-0.38, 0, true) + leg(-0.3, Math.PI, true) + leg(0.3, Math.PI * 0.5, false) + leg(0.37, Math.PI * 1.5, false)
  const tail = `M${P(X(-0.46), Y(-0.5))}Q${P(X(-0.62), Y(-0.6 - 0.12 * run))} ${P(X(-0.72), Y(-0.52 - 0.2 * run))}`
  const hackles = Array.from({ length: 6 }, (_, i) => `M${P(X(0.06 + i * 0.05), Y(-0.6 + low))}l${r(-0.02 * s * f)} ${r(-0.05 * s * (1 - run))}`).join('')
  const rim = 2
  const lw = s * 0.045
  const part = (d) => fillD(d, INK, { extra: ` stroke="${CUT}" stroke-width="${rim * 2}" paint-order="stroke"` })
  return pen(legs + tail, lw + rim * 2) + pen(legs + tail, lw, { stroke: INK })
    + part(body) + part(head + jaw + ear)
    + pen(hackles, 1.6, { opacity: 0.9 })
    + (snap > 0.2 ? pen(`M${P(X(0.66), Y(-0.585 + low * 1.6))}l${r(0.012 * s * f)} ${r(0.025 * s)}M${P(X(0.72), Y(-0.595 + low * 1.6))}l${r(0.01 * s * f)} ${r(0.025 * s)}`, 1.3) : '')
    + fillD(circ(X(0.6), Y(-0.66 + low * 1.6), s * 0.014), CUT)
}

/* ══ THE SHIP ══════════════════════════════════════════════════════════
 *
 * A three-masted barque, side on, bow east, drawn at scale `s` straight into
 * screen coordinates (never through a scaling transform, so its lines keep a
 * graver's weight at every distance). (x, y) is the middle of its waterline.
 * `sails` 0–1 drops the sails; `fill` bellies them; `pitch` rolls it in
 * degrees; `lantern` is the one red on the block until the wake.
 */
/** The ship's own scale: at s = 1 it is this fraction of the drawing below. */
const SHIP_K = 0.8
const HULL_L = 720
const MASTS = [{ x: -190, top: -600 }, { x: 30, top: -650 }, { x: 230, top: -560 }]
function ship(x, y, s0, o = {}) {
  const s = s0 * SHIP_K
  const sails = o.sails ?? 1
  const fill = o.fill ?? 0.3
  const X = (u) => x + u * s
  const Y = (v) => y + v * s
  const L2 = HULL_L / 2
  const lw = (w) => Math.max(0.7, w * s)
  const hull = `M${P(X(-L2), Y(-128))}L${P(X(L2 - 40), Y(-116))}Q${P(X(L2 + 30), Y(-118))} ${P(X(L2 + 50), Y(-140))}L${P(X(L2 + 12), Y(-30))}Q${P(X(L2 - 30), Y(12))} ${P(X(L2 - 100), Y(14))}L${P(X(-L2 + 40), Y(14))}Q${P(X(-L2 - 6), Y(-10))} ${P(X(-L2), Y(-128))}Z`
  const cabin = `M${P(X(-L2 + 6), Y(-128))}L${P(X(-L2 + 6), Y(-172))}L${P(X(-L2 + 150), Y(-168))}L${P(X(-L2 + 150), Y(-124))}Z`
  let rig = ''
  let masts = ''
  let sailD = ''
  let sailCut = ''
  let sailEdge = ''
  MASTS.forEach((m, i) => {
    masts += `M${P(X(m.x), Y(-126))}V${r(Y(m.top))}`
    // Yards and square sails, three to a mast, dropping from the yards as `sails` goes to 1.
    for (let k = 0; k < 3; k++) {
      const y0 = m.top + 50 + k * 140
      const half = 118 + k * 22 - (i === 2 ? 14 : 0)
      rig += `M${P(X(m.x - half), Y(y0))}H${r(X(m.x + half))}`
      const drop = 118 * clamp01(sails * 1.25 - k * 0.12)
      if (drop < 10) {
        // Furled: the sail rolled up along its yard.
        const fd = `M${P(X(m.x - half + 10), Y(y0 + 2))}Q${P(X(m.x), Y(y0 + 16))} ${P(X(m.x + half - 10), Y(y0 + 2))}Q${P(X(m.x), Y(y0 + 6))} ${P(X(m.x - half + 10), Y(y0 + 2))}Z`
        sailD += fd
        sailEdge += fd
        continue
      }
      const y1 = y0 + drop
      const belly = (18 + 30 * fill) * (drop / 118)
      const d = `M${P(X(m.x - half), Y(y0))}L${P(X(m.x + half), Y(y0))}Q${P(X(m.x + half + belly), Y((y0 + y1) / 2))} ${P(X(m.x + half - 6), Y(y1))}L${P(X(m.x - half + 6), Y(y1))}Q${P(X(m.x - half + belly), Y((y0 + y1) / 2))} ${P(X(m.x - half), Y(y0))}Z`
      sailD += d
      sailEdge += d
      if (s > 0.3) {
        for (let yy = y0 + 7; yy < y1 - 3; yy += 7) {
          const u = (yy - y0) / (y1 - y0)
          const bow = belly * Math.sin(u * Math.PI) * 0.9
          sailCut += `M${P(X(m.x - half + 8 + bow), Y(yy))}Q${P(X(m.x + bow * 0.4), Y(yy + 5))} ${P(X(m.x + half - 8 + bow), Y(yy))}`
        }
      }
    }
  })
  // Stays and shrouds.
  const mt = MASTS.map((m) => [X(m.x), Y(m.top)])
  rig += `M${P(X(-L2 + 20), Y(-172))}L${P(...mt[0])}L${P(...mt[1])}L${P(...mt[2])}L${P(X(L2 + 150), Y(-150))}`
  rig += `M${P(X(L2 + 40), Y(-138))}L${P(X(L2 + 170), Y(-176))}`
  for (const m of MASTS) rig += `M${P(X(m.x - 60), Y(-126))}L${P(X(m.x), Y(m.top + 60))}L${P(X(m.x + 60), Y(-126))}`
  const planks = Array.from({ length: 8 }, (_, i) => {
    const v = -118 + i * 16
    return `M${P(X(-L2 + 8 + i * 3), Y(v))}Q${P(X(0), Y(v + 6 + i))} ${P(X(L2 + 20 - i * 12), Y(v - 8 + i * 1.5))}`
  }).join('')
  const ports = Array.from({ length: 9 }, (_, i) => rectD(X(-L2 + 180 + i * 56), Y(-96), 14 * s, 12 * s)).join('')
  const lamp = [X(-L2 - 4), Y(-196)]
  const glow = o.lantern ?? 1
  const out = []
  out.push(pen(masts, lw(6)))
  out.push(pen(rig, lw(1.2), { opacity: 0.85 }))
  out.push(fillD(sailD, INK))
  if (sailCut) out.push(pen(sailCut, lw(1.5)))
  else if (sailD) out.push(fillD(sailD, CUT, { opacity: 0.55 }))
  out.push(pen(sailEdge, lw(1.8)))
  out.push(fillD(hull + cabin, INK))
  if (s > 0.25) out.push(pen(planks, lw(1.3)))
  out.push(pen(hull + cabin, lw(2.2)))
  if (s > 0.2) out.push(fillD(ports, CUT, { opacity: 0.8 }))
  // The stern lantern: its post, and the red.
  out.push(pen(`M${P(X(-L2 + 2), Y(-172))}L${P(lamp[0], lamp[1] + 10 * s)}`, lw(3)))
  out.push(`<circle cx="${r(lamp[0])}" cy="${r(lamp[1])}" r="${r(Math.max(2.6, 9 * s * (0.8 + 0.2 * glow)))}" fill="${RED}"/>`)
  if (glow > 0.05) out.push(`<circle cx="${r(lamp[0])}" cy="${r(lamp[1])}" r="${r(Math.max(6, 26 * s))}" fill="${RED}" opacity="${r(0.22 * glow, 3)}"/>`)
  const rot = o.pitch ? ` transform="rotate(${r(o.pitch, 2)} ${r(x)} ${r(y)})"` : ''
  return `<g${rot}>${out.join('')}</g>`
}
/** Where on a ship at (x, y, s) a thing sits, in its own units. */
const onShip = (x, y, s, u, v) => [x + u * s * SHIP_K, y + v * s * SHIP_K]

/* ══ PROPS ═════════════════════════════════════════════════════════════ */

/** A lamp post on the quay: an iron post, a lantern, a crossarm carrying the telephone wire. */
const POST_H = 300
const POST_FOOT = 618
function post(x, lit, sway = 0) {
  const top = POST_FOOT - POST_H
  const lx = x + sway
  const d = `M${P(x, POST_FOOT)}L${P(lx, top)}M${P(lx - 30, top + 16)}H${r(lx + 30)}M${P(lx, top + 70)}l-14 -10M${P(lx, top + 70)}l14 -10`
  const lantern = `M${P(lx - 9, top + 48)}L${P(lx + 9, top + 48)}L${P(lx + 12, top + 76)}L${P(lx - 12, top + 76)}Z`
  let out = pen(d, 7.5) + pen(d, 4, { stroke: INK }) + fillD(lantern, INK, { extra: ` stroke="${CUT}" stroke-width="1.6"` })
  out += fillD(rectD(lx - 5, top + 54, 10, 16), CUT, { opacity: 0.25 + 0.75 * lit })
  out += pen(`M${P(x - 16, POST_FOOT)}H${r(x + 16)}`, 2.2)
  return out
}
/** Where the wire leaves a post. */
const wireAt = (x, sway = 0) => [x + sway, POST_FOOT - POST_H + 16]

/** A lamp's light: rows swelling towards the lantern. */
const lampGlow = (x, lit, sway = 0) => glowRows({ cx: x + sway, cy: POST_FOOT - POST_H + 62, R: 90, k: lit, spacing: 6, phase: 1, fall: (d) => Math.max(0, 1 - d / 90) ** 1.8 * 1.05 })
/** Its pool on the paving: the courses near it cut wider. */
function lampPool(x, lit) {
  if (lit <= 0.02) return ''
  let d2 = ''
  let d3 = ''
  for (const y of COURSES) {
    const depth = (y - QY) / 300
    if (depth > 1.1) break
    const hw = (170 + depth * 90) * lit * (1 - depth * 0.45)
    if (hw < 10) continue
    d2 += `M${w0(x - hw)} ${w0(y)}H${w0(x + hw)}`
    if (hw > 90) d3 += `M${w0(x - hw * 0.5)} ${w0(y)}H${w0(x + hw * 0.5)}`
  }
  return pen(d2, 1.6, { opacity: 0.8 * lit }) + pen(d3, 2.4, { opacity: 0.8 * lit })
}

/** A bollard at the quay's edge. */
const bollard = (x) => {
  const d = `M${P(x - 11, QY + 30)}V${r(QY + 8)}Q${P(x - 11, QY - 2)} ${P(x - 16, QY - 4)}H${r(x + 16)}Q${P(x + 11, QY - 2)} ${P(x + 11, QY + 8)}V${r(QY + 30)}Z`
  return fillD(d, INK, { extra: ` stroke="${CUT}" stroke-width="1.8"` }) + pen(`M${P(x - 6, QY + 6)}V${r(QY + 26)}`, 1, { opacity: 0.8 })
}

/** The harbour-master's hut: planked, a board lettered STOCKHOLM, a clock, a pennant. */
function hut(x, now, clockAt, wind) {
  const y1 = FEET - 12
  const y0 = y1 - 230
  const w = 250
  const body = rectD(x - w / 2, y0, w, y1 - y0)
  const roof = `M${P(x - w / 2 - 24, y0 + 4)}L${P(x, y0 - 70)}L${P(x + w / 2 + 24, y0 + 4)}Z`
  let planks = ''
  for (let px = x - w / 2 + 12; px < x + w / 2; px += 12) planks += `M${r(px)} ${r(y0 + 6)}V${r(y1 - 2)}`
  let shingles = ''
  for (let k = 1; k < 7; k++) {
    const yy = y0 - 70 + k * 11
    const hw = ((yy - (y0 - 70)) / 74) * (w / 2 + 24)
    shingles += `M${P(x - hw, yy)}H${r(x + hw)}`
  }
  const door = rectD(x - 34, y1 - 130, 68, 130)
  const board = rectD(x - 112, y0 + 18, 224, 46)
  // The clock: hands that run once it is sung that it waits on no man.
  const cx = x
  const cy = y0 - 22
  const run = Math.max(0, now - clockAt)
  const spin = run * run * 0.9 + run * 2.4
  const minute = (spin * 360) % 360
  const hour = (spin * 30) % 360
  const hand = (deg, len) => `M${P(cx, cy)}L${P(cx + Math.sin(deg * RAD) * len, cy - Math.cos(deg * RAD) * len)}`
  // The pennant on its staff, flying as the wind gets up.
  const sx = x + w / 2 - 10
  const sTop = y0 - 150
  const flap = (a) => Math.sin(now * 7 + a * 3) * 8 * (0.2 + wind)
  const pennant = `M${P(sx, sTop)}Q${P(sx + 40 + 30 * wind, sTop + 6 + flap(1))} ${P(sx + 60 + 60 * wind, sTop + 12 + (1 - wind) * 22 + flap(2))}L${P(sx, sTop + 26)}Z`
  return fillD(roof, INK, { extra: ` stroke="${CUT}" stroke-width="1.8"` }) + pen(shingles, 0.9, { opacity: 0.7 })
    + fillD(body, INK, { extra: ` stroke="${CUT}" stroke-width="1.8"` }) + pen(planks, 0.9, { opacity: 0.55 })
    + fillD(door, INK, { extra: ` stroke="${CUT}" stroke-width="1.6"` }) + fillD(circ(x + 22, y1 - 66, 3), CUT)
    + fillD(board, INK, { extra: ` stroke="${CUT}" stroke-width="1.6"` })
    + text({ x, y: y0 + 51, size: 30, text: 'Stockholm', fill: CUT, anchor: 'middle', weight: 600, tracking: 3 })
    + fillD(circ(cx, cy, 24), INK, { extra: ` stroke="${CUT}" stroke-width="2"` })
    + pen(Array.from({ length: 12 }, (_, i) => `M${P(cx + Math.sin(i * 30 * RAD) * 18, cy - Math.cos(i * 30 * RAD) * 18)}L${P(cx + Math.sin(i * 30 * RAD) * 21, cy - Math.cos(i * 30 * RAD) * 21)}`).join(''), 1.4)
    + pen(hand(minute, 18), 2) + pen(hand(hour, 11), 2.6)
    + pen(`M${P(sx, y0 + 2)}V${r(sTop)}`, 2.2) + fillD(pennant, CUT, { opacity: 0.9 })
}

/** A newspaper: a sheet of paper with a headline bar and columns of ink lines, fluttering. */
function newspaper(x, y, rot, flutter, sc = 1) {
  const w = 64 * sc
  const h = 44 * sc * (0.55 + 0.45 * Math.abs(Math.cos(flutter)))
  const body = rectD(-w / 2, -h / 2, w, h)
  let lines = `M${r(-w / 2 + 5)} ${r(-h / 2 + 7)}H${r(w / 2 - 5)}`
  for (let c = 0; c < 3; c++) {
    for (let yy = -h / 2 + 14; yy < h / 2 - 3; yy += 4 * sc) lines += `M${r(-w / 2 + 5 + c * (w - 10) / 3)} ${r(yy)}h${r((w - 10) / 3 - 4)}`
  }
  return `<g transform="translate(${r(x)} ${r(y)}) rotate(${r(rot, 1)})">${fillD(body, CUT)}${pen(lines, 1.1, { stroke: INK, cap: 'butt' })}</g>`
}

/* ══ THE PLAN — times, the man, the camera, places — solved once per score ══ */

const PLANS = new WeakMap()
function planFor(score) {
  if (!PLANS.has(score)) PLANS.set(score, buildPlan(score))
  return PLANS.get(score)
}

/** A value between [t, v] keys, smoothstepped between each pair: continuous, and flat at every key. */
function schedule(keys) {
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1]
    for (let i = 0; i < keys.length - 1; i++) {
      const [ta, va] = keys[i]
      const [tb, vb] = keys[i + 1]
      if (t <= tb) return lerp(va, vb, smooth((t - ta) / Math.max(tb - ta, 1e-6)))
    }
    return keys[keys.length - 1][1]
  }
}
const tableAt = (arr) => (t) => {
  const f = Math.max(0, t) / DT
  const i = Math.min(arr.length - 2, Math.floor(f))
  return lerp(arr[i], arr[i + 1], Math.min(1, f - i))
}

function buildPlan(score) {
  const inSec = (sid) => score.lines.filter((l) => l.section === sid)
  const sec = (sid) => {
    const s = score.sections.find((x) => x.id === sid)
    if (!s) throw new Error(`wood-engraving: no section ${sid}`)
    return s
  }
  const wt = (line, re, nth = 0) => {
    const found = line?.words.filter((w) => re.test(w.text))
    if (!found?.length) throw new Error(`wood-engraving: no word ${re} in "${line?.text}"`)
    return found[Math.min(nth, found.length - 1)].t
  }
  const v1 = inSec('verse-1')
  const v2 = inSec('verse-2')
  const v3 = inSec('verse-3')
  const v4 = inSec('verse-4')
  const v5 = inSec('verse-5')
  const S = { intro: sec('intro'), brk: sec('break'), inst: sec('instrumental'), v4: sec('verse-4'), outro: sec('outro') }
  const T = {
    land: wt(v1[0], /^land/), away2: wt(v1[0], /^away/, 1), light: wt(v1[0], /^light/),
    tomorrow: v1[1].start, sailing: wt(v1[1], /^sailing/),
    oh3: v1[2].start, follow: wt(v1[2], /^follow/), night: wt(v1[2], /^night/),
    find: v1[3].start, lost: wt(v1[3], /^lost/), love: wt(v1[3], /^love/), saving: wt(v1[3], /^saving/),
    ship: wt(v2[0], /^ship/), stockholm: wt(v2[0], /^Stockholm/), waits: wt(v2[0], /^waits/), man: wt(v2[0], /^man/),
    wind: wt(v2[1], /^wind/), seasons: wt(v2[1], /^seasons/),
    oh7: v2[2].start, back7: wt(v2[2], /^back/), you7: wt(v2[2], /^you/), can: wt(v2[2], /^can/),
    bribing: wt(v2[3], /^Bribing/), begging: wt(v2[3], /^begging/), bleeding: wt(v2[3], /^bleeding/), oh8: wt(v2[3], /^oh/),
    so9: v3[0].start, guns: wt(v3[0], /^guns/), fight: wt(v3[0], /^fight/),
    tomorrow10: wt(v3[1], /^tomorrow/), fading: wt(v3[1], /^fading/),
    oh11: v3[2].start, done: wt(v3[2], /^done/), prove: wt(v3[2], /^prove/), right: wt(v3[2], /^right/),
    everyone: v3[3].start, beyond: wt(v3[3], /^beyond/), persuading: wt(v3[3], /^persuading/), oh12: wt(v3[3], /^oh/),
    oh13: v4[0].start, deep: wt(v4[0], /^deep/), water: wt(v4[0], /^water/), rescue: wt(v4[0], /^rescue/), razor: wt(v4[0], /^razor/), thin: wt(v4[0], /^thin/), ice: wt(v4[0], /^ice/),
    were: v4[1].start, walking: wt(v4[1], /^walking/), tightrope: wt(v4[1], /^tightrope/), eden: wt(v4[1], /^Eden/),
    so15: v4[2].start, dogs: wt(v4[2], /^dogs/), away15: wt(v4[2], /^away/, 1), bite: wt(v4[2], /^bite/),
    rhetoric: wt(v4[3], /^rhetoric/), repeating: wt(v4[3], /^repeating/), no16: wt(v4[3], /^no/),
    and17: v5[0].start, kiss: wt(v5[0], /^kiss/), ask: wt(v5[0], /^ask/),
    if18: v5[1].start, make: wt(v5[1], /^make/), past: wt(v5[1], /^past/),
    i19: v5[2].start, reach: wt(v5[2], /^reach/), letter: wt(v5[2], /^letter/), phone: wt(v5[2], /^phone/),
    so20: v5[3].start, taking: wt(v5[3], /^taking/), ship20: wt(v5[3], /^ship/), stockholm20: wt(v5[3], /^Stockholm/),
    end: score.endCardAt ?? score.duration,
  }

  /* ── The man: a signed walking speed, integrated ──────────────────────
   *
   * Positive is east, towards the ship. He walks in off the shingle, stops for
   * "lost love", walks past the hut, turns and walks a few steps back for "to
   * get back to you", kneels, walks the break, stops between the crowds, walks
   * into the storm bent double, is knocked to his knee, walks to the end of
   * the quay, and out along the plank.
   */
  const WALK_V = 58
  const BRK_LOOK = S.brk.from + 11.5
  T.brkLook = BRK_LOOK
  const vAt = schedule([
    [0, 0], [4.6, 0], [6.2, WALK_V],
    [T.find - 0.4, WALK_V], [T.lost - 0.5, 0],
    [T.ship - 0.1, 0], [T.ship + 1.1, WALK_V],
    [T.oh7 - 1.2, WALK_V], [T.oh7 - 0.1, 0],
    [T.back7 - 0.25, 0], [T.back7 + 0.35, -26], [T.can - 0.6, -26], [T.can + 0.2, 0],
    [S.brk.from + 1.8, 0], [S.brk.from + 3.2, WALK_V],
    // Halfway along the break he stops once more and looks back.
    [BRK_LOOK - 1.2, WALK_V], [BRK_LOOK - 0.1, 0], [BRK_LOOK + 3.4, 0], [BRK_LOOK + 4.6, WALK_V],
    [T.fight - 1.4, WALK_V], [T.fight + 0.1, 0],
    [S.inst.from + 0.5, 0], [S.inst.from + 2.4, WALK_V * 0.62],
    [172.9, WALK_V * 0.62], [173.9, 0],
    [T.oh13 + 0.4, 0], [T.oh13 + 1.1, WALK_V],
    [T.razor - 1.0, WALK_V], [T.razor - 0.05, 0],
    [T.were - 0.1, 0], [T.were + 0.5, 52], [T.eden - 0.5, 52], [T.eden + 0.2, 0],
    [T.so20 + 0.4, 0], [T.so20 + 0.8, 104], [T.ship20 + 0.2, 104], [T.ship20 + 0.6, 0], [1e4, 0],
  ])
  const n = Math.ceil((score.duration + 4) / DT)
  const D = new Float64Array(n + 1)
  const ODO = new Float64Array(n + 1)
  for (let i = 0; i < n; i++) {
    const v = (vAt(i * DT) + vAt((i + 1) * DT)) / 2
    D[i + 1] = D[i] + v * DT
    ODO[i + 1] = ODO[i] + Math.abs(v) * DT
  }
  const dAt = tableAt(D)
  const odoAt = tableAt(ODO)
  const X0 = -900
  const manX = (t) => X0 + dAt(t)

  /* ── Places, from where he is on their words ────────────────────────── */
  const Q = {}
  Q.start = X0 + 220
  Q.hut = manX(T.stockholm) + 330
  Q.crowd = manX(T.fight)
  Q.end = manX(T.razor) + 58
  Q.plank = [Q.end + 4, Q.end + 194]
  // The ship's middle, moored: its stern just past the plank's end, where the ladder goes up.
  Q.ship = Q.plank[1] - 16 + (HULL_L / 2) * SHIP_K
  // Lamp posts, one every 520 along the quay, but not through the hut or between the crowds.
  Q.posts = []
  for (let x = Q.start + 300; x < Q.end - 40; x += 700) {
    if (Math.abs(x - Q.hut) < 200 || Math.abs(x - Q.crowd) < 150) continue
    Q.posts.push(x)
  }
  // The last post stands well back from the end, so that in the last verse it is not in front of the window.
  const lastPost = Q.end - 250
  while (Q.posts.length && Q.posts[Q.posts.length - 1] > lastPost - 300) Q.posts.pop()
  Q.posts.push(lastPost)
  Q.bollards = []
  for (let x = Q.start + 120; x < Q.end - 20; x += 260) if (!Q.posts.some((p) => Math.abs(p - x) < 40)) Q.bollards.push(x)

  /* ── The camera: follows him, never slower than the drift ─────────────
   *
   * `lead` is how far ahead of him the camera looks (so 800 − lead is where he
   * stands on screen). The camera's speed is his speed plus whatever closes the
   * gap to the lead wanted, but never less than the drift — so when he stops,
   * or walks back, the camera goes on and he slides back in the frame; when he
   * walks again it goes a little slower than him until he is back in place.
   */
  const leadWant = schedule([
    [0, 920], [5, 920], [22, 250],
    [T.oh7, 250], [T.oh7 + 2, 150], [S.brk.from + 2, 150], [S.brk.from + 6, 250],
    [T.brkLook, 250], [T.brkLook + 2, 200], [T.brkLook + 4, 200], [T.brkLook + 7, 250],
    [T.so9 - 2, 250], [T.fight - 1, 40], [S.inst.from + 1, 40], [S.inst.from + 6, 250],
    [172, 250], [T.oh13, 300], [T.razor, 300],
  ])
  const floorAt = schedule([
    [0, 12], [T.find - 1, 12], [T.lost, 5], [T.ship, 5], [T.ship + 1, 12],
    [T.oh7 - 0.5, 12], [T.oh7 + 0.5, 5], [S.brk.from + 2, 5], [S.brk.from + 4, 12],
    [T.brkLook - 0.5, 12], [T.brkLook + 0.5, 6], [T.brkLook + 3.4, 6], [T.brkLook + 4.4, 12],
    [T.fight - 1, 12], [T.fight, 5], [S.inst.from, 5], [S.inst.from + 2, 12],
    [175, 12], [176.8, 4], [T.oh13 + 0.5, 4], [T.oh13 + 1.5, 10], [T.razor, 10], [T.razor + 1, 6],
  ])
  const C = new Float64Array(n + 1)
  C[0] = manX(0) + leadWant(0)
  const TAU = 1.1
  for (let i = 0; i < n; i++) {
    const t = i * DT
    const dx = D[i + 1] - D[i]
    const lead = C[i] - (X0 + D[i])
    const v = dx + ((leadWant(t) - lead) / TAU) * DT
    C[i + 1] = C[i] + Math.max(floorAt(t) * DT, v)
  }
  const follow = tableAt(C)

  /* ── The ship: one point, in perspective ──────────────────────────────
   *
   * At a distance D from the camera's centre, a thing on the water at depth
   * z is drawn at scale s = A / (D + A) — so a ship at the end of the quay is
   * a speck at the start of the song and full size at the end of it, and it
   * sits near the vanishing point the whole way. Through the storm A grows
   * without bound: the ship comes in faster than he walks, so it has arrived,
   * moored, by the time the storm drops.
   */
  const arriveFrom = 148
  const arriveBy = 175.4
  const shipScale = (t, cam) => {
    const d = Math.max(0, Q.ship - cam)
    const k = easeCamera(ramp(t, arriveFrom, arriveBy))
    if (k >= 0.9999) return 1
    const A = 900 / (1 - 0.9995 * k)
    return A / (d + A)
  }

  /* ── The outro: cast off, and the camera goes with the ship ─────────── */
  const off = T.stockholm20 + 0.1
  const shipV = schedule([[0, 0], [off, 0], [off + 4, 70], [off + 9, 150], [1e4, 150]])
  const SD = new Float64Array(n + 1)
  for (let i = 0; i < n; i++) SD[i + 1] = SD[i] + ((shipV(i * DT) + shipV((i + 1) * DT)) / 2) * DT
  const shipRun = tableAt(SD)
  // Receding: it heads out towards the light, so its depth grows as it goes.
  const recede = (dist) => 1 / (1 + dist / 1500)
  const camOut = schedule([[0, 0], [off, 0], [off + 5, 26], [off + 12, 44], [1e4, 44]])
  const CO = new Float64Array(n + 1)
  for (let i = 0; i < n; i++) CO[i + 1] = CO[i] + ((camOut(i * DT) + camOut((i + 1) * DT)) / 2) * DT
  const camOutAt = tableAt(CO)
  const cam = (t) => follow(t) + camOutAt(t)

  return { T, S, v1, v2, v3, v4, v5, vAt, dAt, odoAt, manX, Q, cam, follow, shipScale, shipRun, recede, off, WALK_V }
}

/* ══ WHAT HE IS DOING — pose, facing and ground, from the clock ═══════ */

function manAt(plan, now) {
  const { T, S, Q } = plan
  const x = plan.manX(now)
  const v = plan.vAt(now)
  // Facing: 0 east, 1 west. He turns back for "lost love", round again for the
  // ship, back for "to get back to you", round for the break, and back for the
  // dogs; and last of all, round for "So I'm taking the ship".
  const face = Math.max(
    win(now, T.lost - 0.2, T.lost + 0.7, T.ship - 0.3, T.ship + 0.5),
    win(now, T.oh7 - 0.1, T.oh7 + 0.8, S.brk.from + 1.1, S.brk.from + 1.9),
    win(now, T.dogs - 0.1, T.dogs + 0.7, T.so20, T.so20 + 0.5),
    win(now, T.brkLook, T.brkLook + 0.8, T.brkLook + 2.6, T.brkLook + 3.4),
  )
  let pose = blend(G.stand, cycleAt(WALK, plan.odoAt(now) / 34), smooth(Math.abs(v) / 20))
  const g = (p, w) => { pose = blend(pose, p, w) }
  g(G.reach, win(now, T.love - 0.3, T.love + 0.4, T.saving + 1.2, T.saving + 2.2) * 0.55)
  g(G.reach, win(now, T.you7 - 0.4, T.you7 + 0.2, T.can + 0.3, T.bribing - 0.4))
  g(G.offer, win(now, T.bribing - 0.35, T.bribing + 0.15, T.begging - 0.3, T.begging + 0.2))
  g(G.kneel, win(now, T.begging - 0.3, T.begging + 0.45, S.brk.from + 0.2, S.brk.from + 1.4))
  g(G.chest, win(now, T.bleeding - 0.25, T.bleeding + 0.4, S.brk.from - 0.2, S.brk.from + 1.0))
  g(G.plead, win(now, T.oh11 - 0.1, T.prove, T.oh12 - 0.2, T.oh12 + 1.0))
  g(G.bowed, win(now, T.oh12, T.oh12 + 1.2, S.inst.from + 0.3, S.inst.from + 1.5))
  // Into the storm, bent double.
  pose.lean += 16 * win(now, S.inst.from + 1.5, S.inst.from + 6, 173.2, 174)
  g(G.brace, win(now, 173.6, 174.25, 177.3, 178.4))
  g(G.rope, win(now, T.walking - 0.4, T.walking + 0.3, T.dogs - 0.4, T.dogs + 0.4))
  g(G.letter, win(now, T.make - 0.6, T.make + 0.1, T.reach - 0.3, T.reach + 0.1))
  g(G.reachHigh, win(now, T.reach - 0.3, T.reach + 0.2, T.phone, T.phone + 0.7))
  // Where he stands: the quay, the plank, the ladder up the ship's side.
  let ground = FEET
  const [p0, p1] = Q.plank
  const plankEndY = MOOR_Y + 4
  if (x > p0) ground = lerp(FEET, plankEndY, clamp01((x - p0) / (p1 - p0)))
  let aboard = false
  if (x > p1) {
    // The ladder: up the hull at the stern, then along the deck.
    const up = clamp01((x - p1) / 46)
    ground = lerp(plankEndY, MOOR_Y - 128 * SHIP_K, smooth(up))
    pose.lean += 14 * (up > 0 && up < 1 ? 1 : 0)
    aboard = x > p1 + 46
  }
  return { x, ground, pose, face, aboard }
}

/* ══ THE FRAME ═════════════════════════════════════════════════════════ */

export function woodEngravingFrame({ time, score, lockup = '', uid = 'st' }) {
  const now = time
  if (score.endCardAt != null && now >= score.endCardAt) return endCard({ now, from: score.endCardAt, lockup })

  const plan = planFor(score)
  const { T, S, Q } = plan
  const section = sectionAt(score, now)
  const active = lineAt(score, now)
  const C = plan.cam(now)
  const v = C - 800
  const lx = (x, p = 1) => x - p * v
  const vis = (a, b) => b >= v - 80 && a <= v + 1680

  /* ── The weather: wind, storm, the hush ─────────────────────────────── */
  const storm = win(now, S.inst.from + 1, S.inst.from + 12, 176.6, 177.6)
  const wind = Math.max(0.12 + 0.5 * win(now, T.wind - 0.6, T.wind + 1.2, T.oh7 + 2, T.oh7 + 6), storm * 1.1, 0.35 * win(now, T.so15, T.rhetoric, T.and17, T.if18))
  const full = Math.max(win(now, S.inst.from + 0.4, S.inst.from + 2.2, 176.5, 178.0), easeInOut(ramp(now, S.outro.from + 0.2, S.outro.from + 2.2)))
  const flash = Math.max(0, 1 - Math.abs(now - 172.62) / 0.05) * 0.9 + (now > 172.62 ? Math.exp(-(now - 172.62) / 0.35) * 0.55 : 0) + (now > 173.05 ? Math.exp(-(now - 173.05) / 0.25) * 0.35 * (now < 173.6 ? 1 : 0) : 0)

  // The plate: the album's sheet, or the whole sheet through the instrumental.
  const plateR = {
    x: lerp(PL.x, 0, full), y: lerp(PL.y, 0, full), w: lerp(PL.w, 1600, full), h: lerp(PL.h, 900, full),
  }
  const clipId = `${uid}-plate`

  const sky = []
  const far = []
  const sea = []
  const ground = []
  const over = []

  /* ── The sky ─────────────────────────────────────────────────────────── */
  const sxo = -PX.sky * v
  sky.push(inView(skyField(), sxo))
  // Stars, pricking out through "follow the night", and gone under the storm.
  const starK = easeOut(ramp(now, T.follow - 1.2, T.night + 0.3)) * (1 - storm)
  if (starK > 0.01) {
    let d = ''
    for (const s of STARS) {
      const k = land(now, T.follow - 1.2 + (s.i / STARS.length) * (T.night + 0.3 - T.follow + 1.2), 0.3) * (1 - storm)
      if (k <= 0.02) continue
      d += circ(s.x + sxo, s.y, s.s * k)
    }
    sky.push(fillD(d, CUT))
  }
  // A few stars from the start, the brightest.
  sky.push(fillD(STARS.slice(0, 18).map((s) => circ(s.x + sxo, s.y, s.s * 0.9 * (1 - storm))).join(''), CUT))
  // The moon: sinking west through the song; behind the clouds in the storm.
  const moon = { x: 1260 - 2.3 * now, y: 118 + 0.5 * now }
  const moonK = 1 - storm * 0.92
  sky.push(glowRows({ cx: moon.x, cy: moon.y, R: 330, k: moonK, spacing: SKY_ROWS, phase: -4, y1: HY - 8, fall: (d) => (d < 46 ? 1.1 : Math.max(0, 1 - (d - 46) / 280) ** 2.2 * 0.62) }))
  // Eden: a light on the horizon to the east, lit on "Eden", the dawn in the outro.
  const eden = { x: 1400 - PX.far * (v - plan.cam(T.eden) + 800), y: HY - 26 }
  const edenK = easeOut(ramp(now, T.eden - 0.5, T.eden + 0.6)) * 0.85 + 0.45 * easeInOut(ramp(now, plan.off, T.end))
  const edenR = 300 + 260 * easeInOut(ramp(now, plan.off, T.end))
  if (edenK > 0.01) sky.push(glowRows({ cx: eden.x, cy: eden.y, R: edenR, k: edenK, spacing: SKY_ROWS, phase: -4, squash: 1.8, y1: HY - 4, fall: (d) => Math.max(0, 1 - d / edenR) ** 1.5 * 1.05 }))
  // Storm clouds: ink masses rolling in from the east with their undersides cut.
  if (storm > 0.01) {
    const clouds = memo('clouds', () => {
      const rand = seq(91)
      let fills = ''
      const rows = WIDTHS.map(() => [])
      for (let i = 0; i < 9; i++) {
        const cx = i * 330 + rand() * 120
        const cy = 100 + rand() * 160
        const rx = 230 + rand() * 170
        const ry = 70 + rand() * 50
        const pts = Array.from({ length: 14 }, (_, k) => {
          const a = (k / 14) * Math.PI * 2
          const bump = 1 + (Math.sin(a) > 0 ? 0.22 * Math.sin(a * 5 + i) : 0.05 * Math.sin(a * 3))
          return [cx + Math.cos(a) * rx * bump, cy - Math.sin(a) * ry * bump]
        })
        fills += blob(pts)
        // Lines across the cloud, brightest along its underside where the moon catches it.
        const field = toneLines({ x0: cx - rx * 1.3, x1: cx + rx * 1.3, y0: cy - ry * 1.35, y1: cy + ry * 1.1, spacing: 5, step: 10, seed: 91 + i, bright: (x, y) => {
          const dx = (x - cx) / rx
          const dy = (y - cy) / ry
          const d = dx * dx + dy * dy
          if (d > 0.92) return -1
          return 0.08 + 0.5 * clamp01((dy + 0.2) / 1.1) ** 2 * (1 - d) + 0.12 * Math.sin(x / 40 + y / 13)
        } })
        field.forEach((b, k) => rows[k].push(...b))
      }
      return fillD(fills, INK) + drawRows(rows)
    })
    const cx = 1700 - 95 * (now - S.inst.from) - (now > 176.6 ? 260 * (now - 176.6) ** 1.6 : 0)
    sky.push(`<g transform="translate(${r(cx, 1)} ${r(-40 + 40 * storm, 1)})"${op(Math.min(1, storm * 1.6))}>${clouds}</g>`)
  }

  /* ── The far shore and the town ──────────────────────────────────────── */
  const fxo = -PX.far * v
  far.push(`<g transform="translate(${r(fxo, 1)} 0)">${FAR.body}</g>`)
  // The town's windows go out word by word across "away with the light", all but his.
  {
    let d = ''
    const nW = FAR.windows.length
    for (const wdw of FAR.windows) {
      const at = lerp(T.land, T.light + 0.2, hash(wdw.i, 2, 7))
      const lit = 1 - land(now, at, 0.35)
      if (lit <= 0.02) continue
      d += rectD(wdw.x + fxo, wdw.y, 4.6, 6.4)
    }
    far.push(fillD(d, CUT, { opacity: 0.95 }))
    void nW
  }
  if (edenK > 0.01) far.push(fillD(circ(eden.x, farHill(eden.x + PX.far * v) - 3, 3.2 + 1.6 * edenK), CUT, { opacity: Math.min(1, edenK * 1.4) }))
  const youOut = land(now, T.phone, 0.4)
  const youLit = (1 - youOut) * (1 - 0.35 * storm * (0.5 + 0.5 * Math.sin(now * 23)))
  const you = { x: FAR.you.x + fxo, y: FAR.you.y }
  if (youLit > 0.01) {
    const swell = 1 + 0.9 * win(now, T.love - 0.2, T.love + 0.8, T.saving + 2, T.saving + 4) + 0.6 * win(now, T.you7 - 0.3, T.you7 + 0.6, T.can + 1, T.can + 3) + 0.5 * win(now, T.ask - 1, T.ask, T.past, T.past + 1.5) + 0.5 * win(now, T.brkLook + 0.4, T.brkLook + 1.2, T.brkLook + 2.8, T.brkLook + 3.8)
    far.push(glowRows({ cx: you.x, cy: you.y, R: 34 * swell, k: youLit, spacing: 4, phase: 1, fall: (d) => Math.max(0, 1 - d / (34 * swell)) ** 1.6 * 1.1 }))
    far.push(fillD(rectD(you.x - 3.5, you.y - 5, 7, 10), CUT, { opacity: youLit }))
  }

  /* ── The sea and the ice ─────────────────────────────────────────────── */
  const seaO = -mod(PX.sea * v, SEA_TILE)
  const heave = storm
  sea.push(inView(seaTile(), seaO, SEA_TILE, 3, heave > 0.01 ? ` transform="translate(0 ${r(heave * 3 * Math.sin(now * 2.1), 1)})"` : ''))
  // The moon's path on the water: glitter under it, moving with it.
  {
    let d = ''
    const glint = seq(13)
    for (let y = HY + 6; y < 560; y += 6) {
      const depth = (y - HY) / 150
      const half = 16 + depth * 70
      for (let k = 0; k < 3 + depth * 3; k++) {
        const x = moon.x + (glint() - 0.5) * 2 * half + Math.sin(now * 1.3 + y) * 3
        const l = 6 + depth * 14 + glint() * 6
        d += `M${w0(x)} ${w0(y)}h${w0(l)}`
      }
    }
    sea.push(pen(d, 1.7, { opacity: 0.9 * moonK }))
  }
  // Storm crests: whitecaps running, higher as it blows.
  if (storm > 0.02) {
    let d = ''
    for (let row = 0; row < 7; row++) {
      const y = HY + 20 + row * 21
      const p = 0.3 + row * 0.08
      const gap = 120 + row * 30
      const shift = mod(p * v + now * (40 + row * 12), gap)
      for (let x = -gap - shift; x < 1700; x += gap) {
        const j = hash(Math.round((x + shift + p * v) / gap), row, 5)
        const hgt = (8 + row * 4) * storm * (0.6 + 0.6 * Math.sin(now * 2.2 + j * 9))
        const len = (40 + row * 12) * (0.7 + j * 0.6)
        d += `M${P(x, y)}Q${P(x + len * 0.55, y - hgt)} ${P(x + len, y + 2)}`
        if (hgt > 10) d += `M${P(x + len * 0.55, y - hgt)}l${r(8 + j * 6)} ${r(-4 - j * 5)}M${P(x + len * 0.6, y - hgt + 2)}l${r(12)} ${r(-1)}`
      }
    }
    sea.push(pen(d, 1.6, { opacity: Math.min(1, storm * 1.3) }))
  }
  // The ice along the quay: whole until the storm breaks it, then gone to thin new ice.
  const iceWhole = 1 - easeInOut(ramp(now, 158, 164))
  if (iceWhole > 0.01) {
    const io = -mod(PX.ice * v, ICE_TILE)
    sea.push(inView(iceTile(), io, ICE_TILE, 2, op(iceWhole)))
  }
  // After the storm, and through it: the harbour's ice is floes, then glass.
  const glass = easeInOut(ramp(now, 176.6, 178.6))
  const floes = win(now, 158, 164, 176.4, 178.4)
  if (floes > 0.01) {
    let d = ''
    for (let i = 0; i < 26; i++) {
      const fx = ((i * 97 + (hash(i, 1, 4) * 60)) - PX.ice * v * 0.2 - now * 14) % 1760
      const x = fx < -80 ? fx + 1760 : fx
      const y = 552 + hash(i, 2, 4) * 50 + Math.sin(now * 2.4 + i) * 5 * storm
      const w = 40 + hash(i, 3, 4) * 70
      const tilt = Math.sin(now * 1.9 + i * 1.3) * 6 * storm
      d += `M${P(x, y)}l${r(w * 0.3)} ${r(-5 + tilt * 0.3)}l${r(w * 0.6)} ${r(2 + tilt)}l${r(w * 0.1)} ${r(6)}l${r(-w * 0.9)} ${r(4 - tilt)}Z`
    }
    sea.push(fillD(d, ICE, { opacity: 0.55 * floes }) + pen(d, 1.2, { opacity: 0.8 * floes }))
  }
  if (glass > 0.01) {
    // Thin new ice: a pale film with a few long cuts, no frost yet.
    const film = memo('glass', () => {
      const rows = toneLines({ x0: 0, x1: 1600, y0: 548, y1: QY + 10, spacing: 5, step: 16, seed: 23, bright: (x, y) => 0.12 + 0.07 * Math.sin(x / 210 + y / 9) })
      return fillD(rectD(0, 546, 1600, QY - 530), ICE, { opacity: 0.32 }) + drawRows(rows, CUT, { opacity: 0.55 })
    })
    sea.push(`<g${op(glass)}>${film}</g>`)
  }

  /* ── The ship ───────────────────────────────────────────────────────── */
  const shipOut = plan.shipRun(now)
  const sAt = (t, c) => plan.shipScale(t, c) * plan.recede(plan.shipRun(t))
  const s = sAt(now, C)
  const moorX = Q.ship + shipOut
  // While it is far the vanishing point is pulled in from the frame's edge; at full size it is exact.
  const shipSX = 800 + (moorX - C) * s * (0.52 + 0.48 * s ** 1.5)
  const shipSY = HY + (MOOR_Y - HY) * s
  const pitch = storm * 5 * Math.sin(now * 2.05) + (1 - storm) * 0.6 * Math.sin(now * 0.8)
  const sails = easeInOut(ramp(now, T.sailing - 0.9, T.sailing + 0.8)) * (1 - easeInOut(ramp(now, 175.2, 177.4))) + easeInOut(ramp(now, T.taking - 0.2, T.stockholm20 + 0.2))
  const fill = 0.25 + 0.5 * wind + 0.4 * easeInOut(ramp(now, plan.off, plan.off + 4))
  const lanternK = 1 - 0.3 * storm * (0.5 + 0.5 * Math.sin(now * 9))
  // The wake: the lead the ship breaks through the ice behind it, in red — the journey.
  let wakeSvg = ''
  if (shipOut > 2) {
    const stern = (-HULL_L / 2) * SHIP_K
    const pts = []
    const N = 26
    for (let i = 0; i <= N; i++) {
      const u = i / N
      const dist = shipOut * u
      const sc = plan.recede(dist)
      const wx = Q.ship + stern + 30 + dist
      pts.push({ x: 800 + (wx - C) * sc * (0.52 + 0.48 * sc ** 1.5), y: HY + (MOOR_Y - 2 - HY) * sc, half: (16 + 26 * (1 - u)) * sc + 2 })
    }
    const top = pts.map((p, i) => [p.x, p.y - p.half * 0.5 - hash(i, 1, 51) * 3 * p.half / 20])
    const bot = pts.map((p, i) => [p.x, p.y + p.half * 0.5 + hash(i, 2, 51) * 3 * p.half / 20])
    const band = polyD([...top, ...bot.reverse()], true)
    let ripples = ''
    for (let i = 0; i < N; i++) {
      const p = pts[i]
      const q = pts[i + 1]
      for (let k = 0; k < 3; k++) {
        const u = (k + hash(i, k, 7)) / 3
        const x = lerp(p.x, q.x, u)
        const y = lerp(p.y, q.y, u) + (hash(i, k, 8) - 0.5) * p.half * 0.6
        ripples += `M${P(x, y)}q${r(3 * p.half / 20)} ${r(-1.2)} ${r((7 + hash(i, k, 9) * 7) * p.half / 20)} 0`
      }
    }
    // Broken ice either side of the lead, and cracks running off it.
    let cracks = ''
    for (let i = 1; i < N; i += 2) {
      const p = pts[i]
      for (const side of [-1, 1]) {
        let x = p.x
        let y = p.y + side * p.half * 0.5
        let dd = `M${P(x, y)}`
        for (let k = 0; k < 3; k++) {
          x += (hash(i, k, 21) - 0.3) * 40 * (p.half / 20)
          y += side * (6 + hash(i, k, 22) * 12) * (p.half / 20)
          dd += `L${P(x, y)}`
        }
        cracks += dd
      }
    }
    wakeSvg = pen(cracks, 1.3, { stroke: INK }) + fillD(band, RED) + pen(ripples, 1.5, { stroke: INK, opacity: 0.7 })
  }
  const shipSvg = ship(shipSX, shipSY, s, { sails, fill, pitch, lantern: lanternK })
  // The water round the hull where it lies in the ice: a black lead.
  const k6 = s * SHIP_K
  const leadSvg = s > 0.5 ? fillD(`M${P(shipSX - (HULL_L / 2 + 20) * k6, shipSY - 4 * k6)}Q${P(shipSX, shipSY - 14 * k6)} ${P(shipSX + (HULL_L / 2 + 60) * k6, shipSY - 4 * k6)}Q${P(shipSX + (HULL_L / 2 + 40) * k6, shipSY + 16 * k6)} ${P(shipSX, shipSY + 18 * k6)}Q${P(shipSX - (HULL_L / 2 + 10) * k6, shipSY + 16 * k6)} ${P(shipSX - (HULL_L / 2 + 20) * k6, shipSY - 4 * k6)}Z`, INK) : ''

  /* ── The foreground ice past the quay's end ─────────────────────────── */
  let foreIce = ''
  const qe = lx(Q.end)
  if (qe < 1700) {
    const FI = 2400
    const fw = baked('forewater', 0, FI, (a, b, i) => drawFlicks(flicks({ x0: a, x1: b, y0: QY - 2, y1: 930, seed: 37 + i, bright: (x, y, depth) => 0.14 + depth * 0.22 + 0.06 * Math.sin(x / 70 + y) })))
    const fi = baked('foreice', 0, FI, (a, b, i) => {
      const rows = toneLines({ x0: a, x1: b, y0: QY - 4, y1: 930, spacing: 4.2, step: 14, seed: 31, bright: (x, y) => 0.16 + 0.1 * Math.sin(x / 170 + y / 40) ** 2 + 0.06 * ((y - QY) / 300) })
      return fillD(rectD(a, QY - 6, b - a, 940 - QY), ICE, { opacity: 0.42 }) + drawRows(rows, CUT, { opacity: 0.6 })
    })
    const tiles = (pieces) => inView(pieces, qe, FI, 2)
    foreIce = `<rect x="${r(qe, 1)}" y="${QY - 6}" width="${r(Math.max(0, 1700 - qe), 1)}" height="${940 - QY}" fill="${INK}"/>`
    if (glass < 0.999) foreIce += `<g transform="translate(0 ${r(storm * 4 * Math.sin(now * 2.3), 1)})"${op(1 - glass)}>${tiles(fw)}</g>`
    if (glass > 0.001) foreIce += `<g${op(glass)}>${tiles(fi)}</g>`
    // Black water opening on "deep water", and cracks shooting out on "razor thin ice".
    const openK = easeOut(ramp(now, T.deep - 0.1, T.water + 0.5))
    if (openK > 0.01) {
      // Lanes of black water opening in the ice: long, thin, ragged, their edges cut white.
      let leads = ''
      let edges = ''
      ;[[0.1, 0.25, 420], [0.42, 0.62, 560], [0.2, 0.9, 380]].forEach(([u, vv, len], i) => {
        const y0 = QY + 14 + vv * 76
        const x0 = qe + 40 + u * 700
        const top = []
        const bot = []
        const n = 10
        for (let k = 0; k <= n; k++) {
          const e = k / n
          const x = x0 + e * len * openK
          const wdt = (3 + 6 * Math.sin(e * Math.PI)) * (0.6 + 0.4 * openK)
          const y = y0 + Math.sin(e * 5 + i) * 6 + e * 10
          top.push([x, y - wdt + (hash(k, i, 3) - 0.5) * 2])
          bot.push([x, y + wdt + (hash(k, i, 4) - 0.5) * 2])
        }
        leads += polyD([...top, ...bot.reverse()], true)
        edges += polyD(top) + polyD(bot)
      })
      foreIce += fillD(leads, INK) + pen(edges, 1.1, { opacity: 0.8 })
    }
    const burst = (at, cx, cy, n, len, seed) => {
      const k = easeOut(ramp(now, at, at + 0.35))
      if (k <= 0) return ''
      let d = ''
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + hash(i, 1, seed)
        let x = cx
        let y = cy
        d += `M${P(x, y)}`
        const L = len * (0.6 + hash(i, 2, seed) * 0.8) * k
        for (let st = 1; st <= 4; st++) {
          x = cx + Math.cos(a + (hash(i, st, seed) - 0.5) * 0.5) * L * (st / 4)
          y = cy + Math.sin(a + (hash(i, st, seed) - 0.5) * 0.5) * L * (st / 4) * 0.35
          d += `L${P(x, y)}`
        }
      }
      return d
    }
    const cracks = burst(T.razor, qe + 120, 668, 7, 240, 1) + burst(T.thin, qe + 380, 690, 8, 280, 2) + burst(T.ice, qe + 250, 640, 9, 340, 3)
    if (cracks) foreIce += pen(cracks, 2.2, { stroke: INK }) + pen(cracks, 0.7, { opacity: 0.5 })
  }

  /* ── The quay ───────────────────────────────────────────────────────── */
  const quayFrom = lx(Q.start)
  const quayTo = lx(Q.end)
  if (quayTo > -40 && quayFrom < 1700) {
    const a = Math.max(-40, quayFrom)
    const b = Math.min(1700, quayTo)
    // The quay: ink, its far lip cut, its paving courses.
    ground.push(fillD(rectD(a, QY - 2, b - a, 940 - QY), INK))
    const po = -((v - Q.start) % PAVE_TILE + PAVE_TILE) % PAVE_TILE
    ground.push(`<clipPath id="${uid}-quay"><rect x="${r(a)}" y="${QY}" width="${r(b - a)}" height="${940 - QY}"/></clipPath>`)
    let tiles = ''
    for (let x = po - PAVE_TILE; x < 1700; x += PAVE_TILE) tiles += `<g transform="translate(${r(x, 1)} 0)">${paveTile()}</g>`
    ground.push(`<g clip-path="url(#${uid}-quay)">${tiles}</g>`)
    ground.push(pen(`M${P(a, QY)}H${r(b)}`, 2.4) + pen(`M${P(a, QY + 6)}H${r(b)}`, 0.8, { opacity: 0.7 }))
    // The quay's end: its corner stones and steps down to the ice.
    if (quayTo < 1700) {
      let steps = ''
      for (let k = 0; k < 6; k++) steps += `M${P(quayTo - 2 - k * 3, QY + 20 + k * 52)}h${r(10 + k * 4)}`
      ground.push(pen(`M${P(quayTo, QY)}L${P(quayTo + 26, 940)}`, 2.4) + pen(steps, 1.4, { opacity: 0.8 }))
    }
    // The land end: shingle, where he comes from.
    if (quayFrom > -40) ground.push(pen(`M${P(quayFrom, QY)}L${P(quayFrom - 30, 940)}`, 2.4))
  }
  // Shingle and rocks on the land side of the quay.
  if (quayFrom > -200) {
    const sh = baked('shingle', -1400, 0, (a, b, i) => {
      const f = flicks({ x0: a, x1: b, y0: QY + 4, y1: 930, seed: 55 + i, bright: (x, y, depth) => 0.12 + depth * 0.25 })
      const rand = seq(56 + i)
      let rocks = ''
      for (let k = 0; k < 3; k++) {
        const x = a + 30 + rand() * (b - a - 60)
        const y = QY + 40 + rand() * 250
        const rr = 10 + rand() * 28
        rocks += blob(Array.from({ length: 7 }, (_, q) => [x + Math.cos(q / 7 * 6.283) * rr * (0.8 + rand() * 0.4), y + Math.sin(q / 7 * 6.283) * rr * 0.55]))
      }
      return fillD(rectD(a, QY - 2, b - a, 942 - QY), INK) + drawFlicks(f) + fillD(rocks, INK, { extra: ` stroke="${CUT}" stroke-width="1.5"` })
    })
    ground.push(inView(sh, quayFrom))
  }

  /* ── On the quay: posts, lamps, wires, bollards, the hut ────────────── */
  // A lamp goes out in the crowd's "fading", or as the storm reaches it; after the storm, none are lit.
  const lampLit = (x) => {
    let k = 1
    if (Math.abs(x - Q.crowd) < 900) k *= 1 - land(now, T.fading + (x - Q.crowd) / 3000, 0.9)
    const passAt = (() => {
      if (now < S.inst.from) return Infinity
      // The storm puts each lamp out as he reaches it, and every one by the wave.
      for (let t = S.inst.from; t < 174.5; t += 0.5) if (plan.manX(t) > x - 60) return t
      return 174.3
    })()
    k *= 1 - land(now, passAt, 0.25)
    const flicker = storm > 0.1 ? 0.75 + 0.25 * Math.sin(now * 31 + x) : 1
    return k * flicker
  }
  const posts = Q.posts.filter((x) => vis(x - 200, x + 200))
  const swayAt = (x) => storm * 6 * Math.sin(now * 3.1 + x / 200)
  for (const x of posts) ground.push(lampPool(lx(x), lampLit(x)))
  for (const x of Q.bollards) if (vis(x - 30, x + 30)) ground.push(bollard(lx(x)))
  if (vis(Q.hut - 220, Q.hut + 220)) ground.push(hut(lx(Q.hut), now, T.waits - 0.1, wind))
  for (const x of posts) ground.push(post(lx(x), lampLit(x), swayAt(x)) + lampGlow(lx(x), lampLit(x), swayAt(x)))
  // The telephone wire, post to post: sagging, whipping in the storm, snapped by the wave at the last span.
  {
    const snapAt = 174.55
    let d = ''
    let sparks = ''
    const ps = Q.posts
    for (let i = 0; i < ps.length - 1; i++) {
      const a = ps[i]
      const b = ps[i + 1]
      if (!vis(Math.min(a, b) - 40, Math.max(a, b) + 40)) continue
      const [ax, ay] = wireAt(lx(a), swayAt(a))
      const [bx, by] = wireAt(lx(b), swayAt(b))
      const whip = storm * 26 * Math.sin(now * 4.3 + i * 1.7)
      const sag = 14 + whip
      const lastSpan = i === ps.length - 2
      if (lastSpan && now >= snapAt) {
        // Two ends, hanging from their posts and swinging.
        const k = easeOut(ramp(now, snapAt, snapAt + 0.8))
        const swing = Math.sin((now - snapAt) * 3.2) * 30 * Math.exp(-(now - snapAt) / 6) + 6 * wind * Math.sin(now * 2.3)
        const hang = 150
        d += `M${P(ax, ay)}Q${P(lerp((ax + bx) / 2, ax + 30, k), lerp((ay + by) / 2 + sag, ay + hang * 0.6, k))} ${P(lerp((ax + bx) / 2, ax + 20 + swing, k), lerp((ay + by) / 2 + sag, ay + hang, k))}`
        d += `M${P(bx, by)}Q${P(lerp((ax + bx) / 2, bx - 30, k), lerp((ay + by) / 2 + sag, by + hang * 0.6, k))} ${P(lerp((ax + bx) / 2, bx - 16 - swing, k), lerp((ay + by) / 2 + sag, by + hang, k))}`
        // Sparks from the broken end: on the snap, and once more on "phone".
        const endX = lerp((ax + bx) / 2, bx - 16 - swing, k)
        const endY = lerp((ay + by) / 2 + sag, by + hang, k)
        for (const [at, n] of [[snapAt, 10], [T.phone, 8]]) {
          const e = ramp(now, at, at + 0.6)
          if (e <= 0 || e >= 1) continue
          for (let q = 0; q < n; q++) {
            const ang = hash(q, 1, at | 0) * Math.PI * 2
            const len = (10 + hash(q, 2, at | 0) * 30) * easeOut(e)
            sparks += `M${P(endX + Math.cos(ang) * len * 0.4, endY + Math.sin(ang) * len * 0.4 + e * 20)}l${r(Math.cos(ang) * len * 0.5)} ${r(Math.sin(ang) * len * 0.5)}`
          }
        }
      }
      else d += `M${P(ax, ay)}Q${P((ax + bx) / 2, (ay + by) / 2 + sag * 2)} ${P(bx, by)}`
    }
    ground.push(pen(d, 1.3))
    if (sparks) over.push(pen(sparks, 1.6))
  }

  /* ── The plank, run out from the ship on "rescue" ──────────────────── */
  if (now > T.rescue - 0.6 && vis(Q.plank[0] - 40, Q.plank[1] + 40)) {
    const k = easeInOut(ramp(now, T.rescue - 0.5, T.rescue + 0.35))
    const [p0, p1] = Q.plank
    const endY = MOOR_Y + 4
    // It slides out from the ship's side and drops onto the quay's end.
    const x0 = lx(lerp(p1, p0, k))
    const y0 = lerp(endY - 60, FEET + 6, k) - Math.sin(k * Math.PI) * 30
    const x1 = lx(p1)
    const y1 = endY + 6
    const shift = (now > plan.off ? 1 : 0) * easeInOut(ramp(now, plan.off, plan.off + 1.2))
    if (shift < 1) {
      const d = `M${P(x0, y0 - 5)}L${P(x1, y1 - 5)}L${P(x1, y1 + 5)}L${P(x0, y0 + 5)}Z`
      ground.push(`<g${op(1 - shift)}>${fillD(d, INK, { extra: ` stroke="${CUT}" stroke-width="1.8"` })}${pen(`M${P(x0 + 6, y0)}L${P(x1 - 6, y1)}`, 0.8, { opacity: 0.7 })}</g>`)
    }
    // The ladder up the stern.
    const lxs = lx(p1)
    const top = MOOR_Y - 126 * SHIP_K
    const lad = `M${P(lxs, endY + 4)}L${P(lxs + 46, top)}M${P(lxs + 14, endY + 4)}L${P(lxs + 60, top)}` + Array.from({ length: 5 }, (_, i) => `M${P(lxs + i * 9.2, endY + 4 - i * ((endY + 4 - top) / 5))}h14`).join('')
    if (s > 0.98 && shift < 1) ground.push(`<g${op(k * (1 - shift))}>${pen(lad, 5.5)}${pen(lad, 2.6, { stroke: INK })}</g>`)
  }

  /* ── The crowd ─────────────────────────────────────────────────────── */
  let crowdSvg = ''
  const crowdK = 1 - easeInOut(ramp(now, S.inst.from + 1, S.inst.from + 5))
  if (crowdK > 0.01 && now > T.so9 - 8 && vis(Q.crowd - 500, Q.crowd + 500)) {
    const PEOPLE = [
      [-440, 1, 'cap', 1, 148], [-360, 1, 'bowler', 0, 156], [-280, 1, 'none', 1, 142], [-205, 1, 'cap', 0, 152],
      [205, -1, 'bowler', 1, 150], [285, -1, 'cap', 0, 144], [365, -1, 'none', 1, 158], [445, -1, 'bowler', 0, 146],
    ]
    PEOPLE.forEach(([dx, f0, hat, gun, h], i) => {
      const x = lx(Q.crowd + dx)
      const gy = FEET - 18 - (i % 2) * 8
      // Rifles up on "guns", fists on "fight", staggered a little.
      const stag = (i % 4) * 0.12
      let pose = gun ? G.port : G.stand
      pose = blend(pose, gun ? G.aim : G.stand, win(now, T.guns - 0.3 + stag, T.guns + 0.3 + stag, T.persuading + stag, T.persuading + 0.8 + stag))
      pose = blend(pose, G.fist, gun ? 0 : win(now, T.fight - 0.2 + stag, T.fight + 0.3 + stag, T.beyond + stag, T.beyond + 0.8 + stag))
      // One by one they turn their backs on him.
      const turnAt = T.everyone + 0.15 + i * ((T.persuading + 0.4 - T.everyone) / 8)
      const u = f0 === 1 ? easeInOut(ramp(now, turnAt, turnAt + 0.6)) : 1 - easeInOut(ramp(now, turnAt, turnAt + 0.6))
      const j = turnJ(x, gy, h, pose, u)
      crowdSvg += person(j, h, 1 - 2 * u, { hat, gun, opacity: crowdK, coat: 0.5, wind: 0.2 })
    })
  }

  /* ── The dogs, on the quay behind him ──────────────────────────────── */
  let dogSvg = ''
  if (now > T.so15 - 1.5 && now < T.no16 + 4) {
    const DOGS = [[-230, 1, 0], [-150, -1, 0.3], [-60, 1, 0.6]]
    DOGS.forEach(([dx, f, delay], i) => {
      const arrive = T.dogs - 0.35 + delay * 0.6
      const leave = T.no16 + 0.2 + delay * 0.5
      const inK = easeOut(ramp(now, arrive - 1.4, arrive))
      const outK = easeInOut(ramp(now, leave, leave + 2.4))
      const x = lx(Q.end + dx) - (1 - inK) * 700 - outK * 900
      const running = (1 - inK > 0.01 && inK < 1) || (outK > 0 && outK < 1) ? 1 : 0
      const snap = Math.max(0.35 * (0.5 + 0.5 * Math.sin(now * 9 + i * 2)) * inK * (1 - outK), win(now, T.bite - 0.15 + i * 0.05, T.bite, T.bite + 0.25, T.bite + 0.6))
      const lunge = win(now, T.bite - 0.25, T.bite, T.bite + 0.3, T.bite + 0.8) * (i === 1 ? -28 : 20)
      const face = outK > 0.3 ? -1 : f
      dogSvg += dog(x + lunge, FEET - 4 - i * 7, 118, face, { snap, run: running, phase: now * 2.6 + i * 0.3 })
    })
  }

  /* ── Newspapers over the ice: the same page, again and again ──────── */
  let paperSvg = ''
  if (now > T.rhetoric - 0.4 && now < T.no16 + 3.2) {
    const N = 11
    for (let i = 0; i < N; i++) {
      const at = i === 0 ? T.rhetoric - 0.2 : T.repeating - 0.3 + (i - 1) * 0.14
      const age = now - at
      if (age < 0) continue
      const gone = easeInOut(ramp(now, T.no16, T.no16 + 2.4))
      const x = lx(Q.end - 300) + age * (210 + hash(i, 1, 61) * 80) + gone * 600
      const y = 520 + hash(i, 2, 61) * 160 + Math.sin(age * 3 + i) * 26 - age * 8 + gone * 80
      paperSvg += newspaper(x, y, Math.sin(age * 2.2 + i) * 30 + i * 11, age * 5 + i, 0.9 + hash(i, 3, 61) * 0.3)
    }
    paperSvg = `<g${op(1 - easeInOut(ramp(now, T.no16 + 1.2, T.no16 + 2.6)))}>${paperSvg}</g>`
  }

  /* ── The man ───────────────────────────────────────────────────────── */
  const me = manAt(plan, now)
  let manSvg = ''
  let coinSvg = ''
  let letterSvg = ''
  {
    const f = 1 - 2 * easeInOut(me.face)
    let j
    let h = MAN_H
    if (me.aboard || now > plan.off) {
      // Aboard: he rides at the stern rail, drawn with the ship.
      // Where he stepped aboard, in the ship's own units, so the handover from the ladder is exact.
      const deckU = (Q.plank[1] + 46 + Math.min(48, Math.max(0, me.x - Q.plank[1] - 46)) - Q.ship) / SHIP_K
      const [dxs, dys] = onShip(shipSX, shipSY, s, deckU, -128)
      h = MAN_H * s
      const lookBack = easeInOut(ramp(now, T.stockholm20 + 0.6, T.stockholm20 + 1.6))
      j = turnJ(dxs, dys, h, blend(me.pose, G.stand, easeInOut(ramp(now, T.ship20, T.stockholm20))), lookBack)
      manSvg = person(j, h, 1 - 2 * lookBack, { bag: true, wind: 0.4 })
    }
    else {
      j = turnJ(lx(me.x), me.ground, h, me.pose, easeInOut(me.face))
      manSvg = person(j, h, f, { bag: true, wind: wind * (me.face > 0.5 ? -1 : 1) })
    }
    // "Bribing": coins spill from his hand onto the quay and lie there.
    if (now > T.bribing - 0.1 && now < S.brk.from + 16) {
      const baseX = lx(plan.manX(T.bribing))
      let d = ''
      for (let i = 0; i < 6; i++) {
        const at = T.bribing + 0.05 + i * 0.09
        const u = clamp01((now - at) / 0.5)
        if (now < at) continue
        const hx = baseX - 40 + i * 3
        const tx = baseX - 60 + (hash(i, 1, 81) - 0.5) * 70
        const ty = FEET + 4 + hash(i, 2, 81) * 14
        const x = lerp(hx, tx, u)
        const y = lerp(FEET - 88, ty, u * u) - Math.sin(u * Math.PI) * 10
        d += `M${P(x - 5, y)}a5 2.2 0 1 0 10 0a5 2.2 0 1 0 -10 0`
      }
      coinSvg = fillD(d, CUT, { opacity: 0.95 })
    }
    // The letter: out of his coat on "make it back", held up, taken by the wind on "letter".
    if (now > T.make - 0.5 && now < T.letter + 4) {
      const hand = j.handF
      const flyU = clamp01((now - T.letter) / 3.2)
      let x = hand[0]
      let y = hand[1] - 6
      let rot = -8
      if (now > T.letter) {
        // Back towards the town, up on the wind, then fluttering down onto the ice short of the quay.
        x = hand[0] - flyU * 520 + Math.sin(flyU * 9) * 18
        y = hand[1] - 6 - Math.sin(flyU * Math.PI * 0.9) * 150 + flyU * flyU * 170
        rot = -8 + flyU * 400
      }
      const sc = 1 - flyU * 0.25
      const env = `<g transform="translate(${r(x)} ${r(y)}) rotate(${r(rot, 1)}) scale(${r(sc, 3)})">${fillD(rectD(-13, -9, 26, 18), CUT)}${pen('M-13 -9L0 1L13 -9', 1, { stroke: INK })}</g>`
      letterSvg = `<g${op(1 - easeInOut(ramp(now, T.letter + 2.6, T.letter + 3.4)))}>${env}</g>`
    }
  }

  /* ── The wave over the quay, and the lightning ─────────────────────── */
  let waveSvg = ''
  const waveK = ramp(now, 173.3, 175.8)
  if (waveK > 0 && waveK < 1) {
    // Foam as an engraver cuts it: a mound of short curled strokes, packed,
    // with a ragged top and spray flung off it; then it falls on the quay and
    // runs towards us as a sheet of white lines, over his feet.
    const mx = lx(plan.manX(173.9)) - 60
    const up = Math.sin(clamp01(waveK / 0.4) * Math.PI / 2)
    const down = easeInOut(clamp01((waveK - 0.4) / 0.35))
    const Hh = 320 * up * (1 - down)
    const W = 420 + 160 * waveK
    const topAt = (x) => {
      const u = (x - mx) / W
      if (Math.abs(u) >= 1) return QY
      return QY - Hh * (1 - u * u) ** 0.8 * (0.94 + 0.06 * Math.sin(x / 37 + now * 5))
    }
    let dome = ''
    let foam = ''
    if (Hh > 4) {
      const pts = []
      for (let x = mx - W; x <= mx + W; x += 20) pts.push([x, topAt(x)])
      dome = polyD([[mx - W, QY + 2], ...pts, [mx + W, QY + 2]], true)
      for (let y = QY - 6; y > QY - Hh; y -= 7) {
        for (let x = mx - W; x < mx + W; x += 16) {
          const jx = x + (hash(Math.round(x), Math.round(y), 3) - 0.5) * 10
          if (topAt(jx) > y - 4) continue
          const l = 8 + hash(Math.round(x), Math.round(y), 4) * 10
          foam += `M${P(jx, y)}q${r(l * 0.4)} ${r(-4)} ${r(l)} ${r(-1)}`
        }
      }
    }
    let wash = ''
    const washK = clamp01((waveK - 0.5) / 0.5)
    if (washK > 0) {
      for (let i = 0; i < 9; i++) {
        const reach = QY + 10 + washK * (190 - i * 12) * (1 - 0.1 * Math.sin(i))
        const yy = QY + 8 + (reach - QY) * (i / 9)
        const x0 = mx - W * 0.9
        const x1 = mx + W * 0.9
        const pts = []
        for (let x = x0; x <= x1; x += 30) pts.push([x, yy + Math.sin(x / 41 + i + now * 6) * 5])
        wash += curve(pts)
      }
    }
    let spray = ''
    for (let i = 0; i < 110; i++) {
      const born = 0.15 + hash(i, 1, 72) * 0.5
      if (waveK < born) continue
      const age = (waveK - born) * 2.4
      const sx = mx + (hash(i, 2, 72) - 0.5) * 2 * W * 0.8 + (hash(i, 5, 72) - 0.3) * age * 160
      const sy = QY - Hh * 0.7 - hash(i, 3, 72) * 120 * (1 - age) + 340 * age * age
      if (sy > FEET + 40) continue
      spray += circ(sx, sy, 1.4 + hash(i, 4, 72) * 3)
    }
    const fade = 1 - ramp(waveK, 0.85, 1)
    waveSvg = (dome ? fillD(dome, INK) + pen(foam, 1.6) + pen(polyD([...Array.from({ length: Math.ceil(2 * W / 20) + 1 }, (_, i) => [mx - W + i * 20, topAt(mx - W + i * 20)])]), 2.2) : '')
      + pen(wash, 1.5, { opacity: fade * 0.9 }) + fillD(spray, CUT, { opacity: 0.95 * fade })
  }
  let boltSvg = ''
  if (now > 172.55 && now < 173.2) {
    const k = 1 - ramp(now, 172.7, 173.2)
    const rand = seq(88)
    let x = 1020
    let y = -10
    let d = `M${P(x, y)}`
    while (y < HY - 20) {
      x += (rand() - 0.5) * 70
      y += 24 + rand() * 30
      d += `L${P(x, y)}`
      if (rand() < 0.2) d += `l${r((rand() - 0.5) * 60)} ${r(30 + rand() * 30)}M${P(x, y)}`
    }
    boltSvg = pen(d, 4, { opacity: k }) + pen(d, 1.5, { stroke: INK, opacity: k * 0.4 })
  }

  /* ── Snow ──────────────────────────────────────────────────────────── */
  let snowSvg = ''
  {
    const heavy = 0.35 + 0.65 * Math.max(storm, 0.5 * win(now, T.wind - 0.5, T.wind + 1, T.oh7 + 2, T.oh7 + 6))
    const nFlakes = Math.round(70 + 190 * heavy)
    const slant = wind * 1.6
    let dots = ''
    let streaks = ''
    for (let i = 0; i < nFlakes; i++) {
      const depth = 0.4 + hash(i, 1, 3) * 0.8
      const fallV = 26 + depth * 30 + storm * 60
      const y = ((hash(i, 2, 3) * 980 + now * fallV) % 980) - 40
      const x = (((hash(i, 3, 3) * 1800 - depth * v * 0.5 - now * slant * fallV + Math.sin(now * 0.7 + i) * 8) % 1800) + 1800) % 1800 - 100
      const rr = (0.9 + depth * 1.3)
      if (slant > 0.6) {
        const l = 4 + slant * 9 * depth
        streaks += `M${P(x, y)}l${r(-l)} ${r(l / (slant + 0.2))}`
      }
      else dots += circ(x, y, rr)
    }
    snowSvg = fillD(dots, CUT, { opacity: 0.9 }) + pen(streaks, 1.4, { opacity: 0.8 })
  }

  /* ── Compose ───────────────────────────────────────────────────────── */
  let margin = ''
  if (section.kind === 'intro') {
    const o = Math.min(easeOut(ramp(now, 0.6, 1.8)), 1 - easeInOut(ramp(now, section.to - 1.0, section.to - 0.2)))
    margin = titleCard({ title: score.title, track: 9, opacity: o })
  }
  else margin = marginLyric({ now, score, uid })

  // The block is cut in over the opening seconds: a ragged edge sweeping left to right.
  const cutK = easeInOut(ramp(now, 0.2, 4.2))
  let cutClip = ''
  let cutUse = ''
  if (cutK < 1) {
    const edge = -60 + cutK * 1780
    let d = `M-10 -10`
    for (let i = 0; i <= 40; i++) d += `L${P(edge + (hash(i, 1, 99) - 0.5) * 120 + 40 * Math.sin(i * 0.8), -10 + (i / 40) * 930)}`
    cutClip = `<clipPath id="${uid}-cut"><path d="${d}L-10 930Z"/></clipPath>`
    cutUse = ` clip-path="url(#${uid}-cut)"`
  }

  const shipBehindQuay = s < 0.97
  const svg = [
    paper(),
    `<defs><clipPath id="${clipId}"><rect x="${r(plateR.x, 1)}" y="${r(plateR.y, 1)}" width="${r(plateR.w, 1)}" height="${r(plateR.h, 1)}"/></clipPath>${cutClip}</defs>`,
    `<g clip-path="url(#${clipId})">`,
    `<rect x="${r(plateR.x, 1)}" y="${r(plateR.y, 1)}" width="${r(plateR.w, 1)}" height="${r(plateR.h, 1)}" fill="${INK}"/>`,
    `<g${cutUse}>`,
    sky.join(''),
    far.join(''),
    sea.join(''),
    shipBehindQuay ? shipSvg : '',
    foreIce,
    wakeSvg,
    shipBehindQuay ? '' : leadSvg + shipSvg,
    ground.join(''),
    crowdSvg,
    coinSvg,
    dogSvg,
    manSvg,
    letterSvg,
    paperSvg,
    waveSvg,
    over.join(''),
    boltSvg,
    snowSvg,
    '</g>',
    flash > 0.01 ? `<rect x="0" y="0" width="1600" height="900" fill="${CUT}" opacity="${r(Math.min(0.85, flash), 3)}"/>` : '',
    '</g>',
    margin,
  ].join('\n')
  return { svg, label: active?.text ?? section.label }
}

/* For tools: the camera and the ship's scale, so a script can measure them. */
export const woodEngravingCamera = (score, now) => planFor(score).cam(now)
export const woodEngravingPlan = (score) => planFor(score)
