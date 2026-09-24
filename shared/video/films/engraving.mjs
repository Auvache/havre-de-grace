/*
 * Engraving — "Conman" as an uncut sheet of banknotes that moves like the chart.
 *
 * Track 2 of the album (app/config/albumStyle.ts). The song is about how being
 * inspired by other musicians is a kind of theft, and how that is not a bad
 * thing: we all take from each other and build on it, and if we are lucky
 * somebody takes from us. So the film is money — the most copied engraving
 * there is — and the whole song is one long uncut sheet of notes coming off a
 * press, every one of them a copy of the one before with a new face on it.
 *
 * THREE RULES THE WHOLE FILM IS BUILT ON
 *
 *   - Every note is the same note. One layout — a rosette, a portrait oval, a
 *     vignette, the same border — is printed the whole length of the sheet.
 *     What changes from note to note is the face in the oval, the number and
 *     the year. That is the song's argument, drawn.
 *   - Red is the journey, and the journey is the conman: one red serial number,
 *     HG and a year, that follows the camera from note to note and stamps each
 *     one it passes. It starts on the 1968 note, rolls to 2025 when the earth
 *     shakes, and at the end rolls on to 2068 on somebody else's note.
 *   - Everything is line. Tone is line spacing and line crossing; nothing is a
 *     flat fill except paper knocked out of the tone — the sitters are left in
 *     the paper, the way an engraver burnishes a face out of the plate.
 *
 * THE SHEET, LEFT TO RIGHT
 *
 *   Intro     The 1968 note is engraved: border, rosette rings one by one, the
 *             portrait oval, a sitter with a lion's mane.
 *   1968      The red serial arrives on "conman" and rolls from 0000 to 1968 on
 *             "1968", when an airship sails into the vignette. The bottle is
 *             engraved on "Bottled", the lightning cut into it; a stave runs
 *             into its neck and a note lands on it on each of "several steady
 *             notes". The clouds are pulled down into the sea and the smoke is
 *             wiped out of the sky.
 *   A killing The reprints: the same note, printed again and again, with a new
 *             face and a bigger number — 5, 20, 100, 1000 — and the camera runs
 *             along them on "moving fast". The 2025 note has nobody in its oval.
 *             The earth shakes on "shook"; a loupe searches the rosette, and on
 *             "realized" finds 1968 engraved in its microprint.
 *   Chorus    The press runs. The same note, printed on the beat, one after
 *             another, the serial stamping each one, the rosettes spinning, the
 *             numbering wheels spinning and landing on the same number.
 *   Shadows   Three notes of the people he is following now: a three-dollar
 *             bill with a peppermint rosette; a note whose rosette is a watch
 *             dial keeping the beat; a note with a small tall man standing on
 *             top of the world. The serial steals the first one's serial box,
 *             follows along the bottom border in the shadow of the hatching,
 *             looks away when the sitter looks at it, and on "pray" the last
 *             note is held to the light and his watermark is in its paper.
 *   Break     The composite. A blank note on the press, and on each bar a piece
 *             of the notes before it flies in: the peppermint, the watch hands,
 *             the 1968 mane, the long dark hair, the coat, the bottle, the globe.
 *   Groove    He moves. The bottle is uncorked on "Watch me", the lightning
 *             splits the ground and pierces the sky, and the rosette finds a
 *             groove: it is a record. The note cracks behind him on "damage in
 *             my wake", and on "all the eyes" every record ahead is an eye.
 *   Last      The press runs his note — and then other people's: new faces,
 *             his record for a rosette, his serial on every one, the years
 *             rolling on to 2068.
 *
 * THE MOTION is the album's (ALBUM_MOTION): a drift that never stops plus eased
 * moves and runs, integrated from one speed curve so the velocity is always
 * continuous; the zoom is a loupe's, in the transform, because a magnified
 * engraving is supposed to show heavier lines. Everything that lands on a word
 * eases in over 90–400 ms and stays. `engravingFrame({ time, score })` is a pure
 * function of the clock; the plan is built once per score.
 */

import { t as text, r, clamp01, easeOut, easeInOut, ramp, lerp, advance } from '../kit.mjs'
import { sectionAt, lineAt } from '../score.mjs'
import { endCard } from '../ending.mjs'
import { PAPER, PAPER_SHADE, INK, RED, SECOND_INK, SHEET, paper, plateClip, marginLyric, titleCard, land, easeCamera } from '../album.mjs'

export const GREEN = SECOND_INK.conman

export const ENGRAVING = {
  id: 'album-conman',
  name: 'Line engraving',
  accent: RED,
  palette: { PAPER, INK, RED, GREEN },
}

const PL = SHEET.plate
const CX = PL.x + PL.w / 2
const CY = PL.y + PL.h / 2

/* ══ SMALL THINGS ══════════════════════════════════════════════════════ */

const P = (x, y) => `${r(x)} ${r(y)}`
const smooth = (u) => {
  const x = clamp01(u)
  return x * x * (3 - 2 * x)
}
const op = (o) => (o < 0.999 ? ` opacity="${r(Math.max(0, o), 3)}"` : '')
const pen = (d, w = 1, o = {}) => (d ? `<path d="${d}" fill="none" stroke="${o.stroke ?? INK}" stroke-width="${r(w, 2)}" stroke-linecap="round" stroke-linejoin="round"${op(o.opacity ?? 1)}${o.extra ?? ''}/>` : '')
const fillD = (d, colour, o = {}) => (d ? `<path d="${d}" fill="${colour}"${op(o.opacity ?? 1)}${o.extra ?? ''}/>` : '')
/** A stroke drawn along its length: `k` of it is down. */
const drawn = (d, w, k, o = {}) => {
  if (k <= 0) return ''
  if (k >= 1) return pen(d, w, o)
  return pen(d, w, { ...o, extra: `${o.extra ?? ''} pathLength="1" stroke-dasharray="${r(k, 3)} 1"` })
}
const circ = (x, y, rad) => (rad > 0.2 ? `M${P(x - rad, y)}a${r(rad)} ${r(rad)} 0 1 0 ${r(rad * 2)} 0a${r(rad)} ${r(rad)} 0 1 0 ${r(-rad * 2)} 0` : '')
const ellipse = (x, y, rx, ry) => `M${P(x - rx, y)}a${r(rx)} ${r(ry)} 0 1 0 ${r(rx * 2)} 0a${r(rx)} ${r(ry)} 0 1 0 ${r(-rx * 2)} 0`
const rectD = (x, y, w, h) => `M${P(x, y)}h${r(w)}v${r(h)}h${r(-w)}Z`
const polyD = (lines) => lines.map((pts) => (pts.length > 1 ? 'M' + pts.map(([x, y]) => P(x, y)).join('L') : '')).join('')
const clipRect = (id, x, y, w, h) => `<clipPath id="${id}"><rect x="${r(x)}" y="${r(y)}" width="${r(Math.max(0, w))}" height="${r(Math.max(0, h))}"/></clipPath>`
const clipPathD = (id, d, rule = '') => `<clipPath id="${id}"><path d="${d}"${rule ? ` clip-rule="${rule}"` : ''}/></clipPath>`

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

/** A closed (or open) Catmull–Rom curve through `pts`. */
function spline(pts, closed = true) {
  const n = pts.length
  const at = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))])
  let d = `M${P(...pts[0])}`
  const last = closed ? n : n - 1
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1)
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = at(i + 2)
    d += `C${P(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)} ${P(p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)} ${P(...p2)}`
  }
  return closed ? d + 'Z' : d
}

/** Is (x, y) inside the polygon `pts`? */
function inside(pts, x, y) {
  let c = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]
    const [xj, yj] = pts[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}

/** Roman numerals, for the years under the portraits. */
function roman(n) {
  const table = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]
  let out = ''
  for (const [v, s] of table) while (n >= v) { out += s; n -= v }
  return out
}

/* ══ THE ENGRAVER'S TOOLS ══════════════════════════════════════════════
 *
 * Every tone on the sheet is one of these patterns. They are defined once per
 * frame in note-local coordinates and every note refers to them, so the same
 * line runs through the same place on every copy — which is what makes a run
 * of notes read as one plate printed over and over.
 */

const hatchPat = (id, { angle = 0, gap = 5, width = 1, colour = INK } = {}) =>
  `<pattern id="${id}" width="${gap}" height="${gap}" patternUnits="userSpaceOnUse" patternTransform="rotate(${angle})"><line x1="0" y1="${gap / 2}" x2="${gap}" y2="${gap / 2}" stroke="${colour}" stroke-width="${width}"/></pattern>`

/** A braided guilloche band: four interlaced sine strands per 48-unit repeat. */
const braid = (id, { colour = GREEN, rotate = 0 } = {}) =>
  `<pattern id="${id}" width="48" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotate})"><g fill="none" stroke="${colour}" stroke-width="0.9"><path d="M0 13 C12 -1 12 -1 24 13 S36 27 48 13"/><path d="M0 13 C12 27 12 27 24 13 S36 -1 48 13"/><path d="M0 13 C12 6 12 6 24 13 S36 20 48 13" stroke-width="0.6"/><path d="M0 13 C12 20 12 20 24 13 S36 6 48 13" stroke-width="0.6"/></g></pattern>`

/** The security ground under every note: a faint field of wavy lines. */
const ground = (id) =>
  `<pattern id="${id}" width="60" height="7" patternUnits="userSpaceOnUse"><path d="M0 3.5 Q15 0.5 30 3.5 T60 3.5" fill="none" stroke="${GREEN}" stroke-width="0.6"/></pattern>`

/* ══ THE NOTE'S LAYOUT ═════════════════════════════════════════════════
 *
 * One note is 1400 by 600 — a banknote's proportion, and near enough the
 * plate's, so at a zoom of 1 one note fills the frame. The sheet is a row of
 * them with a 140-unit gutter and crop marks.
 */

const NW = 1400
const NH = 600
const GUTTER = 140
const PITCH = NW + GUTTER
/** The sheet's rows are the same notes again, one note and a gutter apart. */
const ROW = NH + GUTTER
const NY = CY - NH / 2
/** World x of local x on slot k. */
const S = (k, lx = 700) => k * PITCH + lx

const LAY = {
  rosette: { x: 240, y: 300, R: 150 },
  oval: { x: 700, y: 288, rx: 132, ry: 156 },
  vig: { cx: 1135, cy: 300, rx: 200, ry: 238 },
  boxA: { x: 250, y: 116 },
  boxB: { x: 1150, y: 553 },
}
const HEAD = { x: LAY.oval.x + 6, y: LAY.oval.y - 34, u: 36 }

/* ══ GUILLOCHE ═════════════════════════════════════════════════════════ */

const RINGS = [
  { f: 1, n: 24, a: 0.06, copies: 5, colour: GREEN, w: 0.8, s: 1 },
  { f: 0.8, n: 16, a: 0.12, copies: 6, colour: GREEN, w: 0.8, s: -1.4 },
  { f: 0.66, n: 30, a: 0.05, copies: 3, colour: INK, w: 0.7, s: 0.7 },
  { f: 0.5, n: 12, a: 0.18, copies: 7, colour: INK, w: 0.7, s: -2.1 },
]

/** ρ(θ) = R(1 + a·sin(nθ)) about the origin, closed. */
function ringD(R, n, a) {
  const steps = n * 12
  let d = ''
  for (let i = 0; i <= steps; i++) {
    const th = (i / steps) * Math.PI * 2
    const rr = R * (1 + a * Math.sin(n * th))
    d += (i ? 'L' : 'M') + r(Math.cos(th) * rr) + ' ' + r(Math.sin(th) * rr)
  }
  return d + 'Z'
}

/** A hypotrochoid star for the heart of a rosette, about the origin. */
function starD(R, k = 9) {
  const b = R / k
  const dpen = b * 2.4
  let d = ''
  for (let i = 0; i <= 720; i++) {
    const th = (i / 720) * Math.PI * 2
    const x = (R - b) * Math.cos(th) + dpen * Math.cos(((R - b) / b) * th)
    const y = (R - b) * Math.sin(th) - dpen * Math.sin(((R - b) / b) * th)
    d += (i ? 'L' : 'M') + r(x * 0.55) + ' ' + r(y * 0.55)
  }
  return d
}

/** The peppermint swirl: every other of 14 curved wedges, about the origin. */
function pepperD(R) {
  const n = 14
  const twist = 1.25
  let d = ''
  for (let i = 0; i < n; i += 2) {
    const a0 = (i / n) * Math.PI * 2
    const a1 = ((i + 1) / n) * Math.PI * 2
    const pts = []
    for (let s = 0; s <= 10; s++) { const q = (s / 10) * R; const a = a0 + twist * (q / R); pts.push([Math.cos(a) * q, Math.sin(a) * q]) }
    for (let s = 0; s <= 6; s++) { const a = a0 + twist + ((a1 - a0) * s) / 6; pts.push([Math.cos(a) * R, Math.sin(a) * R]) }
    for (let s = 10; s >= 0; s--) { const q = (s / 10) * R; const a = a1 + twist * (q / R); pts.push([Math.cos(a) * q, Math.sin(a) * q]) }
    d += 'M' + pts.map(([x, y]) => P(x, y)).join('L') + 'Z'
  }
  return d
}
/** The swirl's boundary curves, for the ink. */
function pepperLinesD(R) {
  const n = 14
  const twist = 1.25
  let d = ''
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2
    const pts = []
    for (let s = 1; s <= 10; s++) { const q = (s / 10) * R; const a = a0 + twist * (q / R); pts.push([Math.cos(a) * q, Math.sin(a) * q]) }
    d += 'M' + pts.map(([x, y]) => P(x, y)).join('L')
  }
  return d
}

/** A record's grooves: concentric circles, a few wider gaps between tracks. */
function groovesD(r0, r1) {
  let d = ''
  let rad = r0
  let i = 0
  while (rad < r1) {
    d += circ(0, 0, rad)
    rad += i % 17 === 16 ? 5 : 2.3
    i++
  }
  return d
}

/* ══ THE SITTERS ═══════════════════════════════════════════════════════
 *
 * Every portrait is the same bust — a three-quarter head facing left, a neck,
 * a dark coat and a paper collar — and it is the hair that says who it is. The
 * head, neck and collar are left in the paper and never outlined, so they are
 * only there because of the tone round them; hair is either paper with ink
 * strands through it or ink crosshatch with paper strands.
 *
 * Coordinates are in head units (HEAD.u) about the head's centre, x to the
 * right; the face is on the left.
 */

const HEAD_PTS = [[-0.62, -0.92], [-0.8, -0.55], [-0.86, -0.25], [-0.9, -0.05], [-1.04, 0.2], [-0.9, 0.3], [-0.93, 0.45], [-0.86, 0.55], [-0.84, 0.72], [-0.7, 0.92], [-0.4, 1.02], [-0.1, 0.98], [0.3, 0.8], [0.62, 0.5], [0.84, 0.05], [0.8, -0.5], [0.5, -0.9], [0, -1.05]]
const NECK_PTS = [[-0.44, 0.82], [-0.5, 1.75], [0.46, 1.75], [0.4, 0.66]]
const COAT_PTS = [[-3.6, 5.6], [-3.1, 3.0], [-2.0, 2.1], [-0.7, 1.66], [0.6, 1.66], [1.9, 2.05], [3.1, 2.9], [3.7, 5.6]]
const COLLAR_PTS = [[-0.78, 1.62], [-0.2, 2.75], [0, 2.3], [0.2, 2.75], [0.8, 1.62], [0.36, 1.5], [-0.34, 1.5]]

/*
 * Hair: an outline that may run behind the head freely (the head is drawn over
 * it) but not in front of the profile above the chin, which is the edge the
 * whole face reads by. `dark` hair is crosshatch; light hair is paper.
 * `bumps` pushes the outline out in curls.
 */
const HAIR = {
  // 1968: a lion's mane to the shoulders.
  mane: { pts: [[-0.72, -0.78], [-0.5, -1.25], [0.05, -1.5], [0.75, -1.38], [1.3, -0.95], [1.62, -0.25], [1.78, 0.6], [1.9, 1.5], [1.82, 2.4], [1.3, 2.75], [0.8, 2.35], [0.45, 1.7], [-0.35, 1.55], [-0.8, 2.2], [-1.25, 2.5], [-1.5, 2.0], [-1.3, 1.3], [-0.95, 0.95], [-0.5, 0.4], [-0.55, -0.4]], bumps: 0.13, nb: 26, strands: 'curl' },
  // 1971: a shag with a fringe.
  shag: { pts: [[-0.86, -0.42], [-0.78, -1.1], [0, -1.42], [0.8, -1.25], [1.35, -0.7], [1.5, 0.2], [1.55, 1.1], [1.25, 1.7], [0.7, 1.3], [0.2, 0.9], [-0.5, 0.3], [-0.6, -0.3]], bumps: 0.06, nb: 30, strands: 'straight', fringe: [[-0.9, -0.36], [-0.8, -0.95], [-0.2, -1.2], [0.4, -1.0], [0.1, -0.62], [-0.4, -0.5]] },
  // 1977: dark, feathered back from the face.
  feather: { dark: true, pts: [[-0.8, -0.62], [-0.72, -1.2], [0, -1.5], [0.85, -1.35], [1.4, -0.85], [1.62, -0.05], [1.6, 0.9], [1.3, 1.45], [0.8, 1.1], [0.4, 0.5], [-0.3, -0.2], [-0.5, -0.5]], bumps: 0.05, nb: 18, strands: 'sweep' },
  // 1986: teased up and out.
  big: { pts: [[-0.9, -0.3], [-1.05, -1.0], [-0.6, -1.7], [0.2, -1.95], [1.1, -1.75], [1.75, -1.1], [2.0, -0.1], [2.05, 1.0], [1.8, 1.9], [1.2, 2.1], [0.6, 1.5], [0.1, 0.9], [-0.5, 0.3], [-0.6, -0.2]], bumps: 0.17, nb: 30, strands: 'curl' },
  // 1994: limp, centre-parted, to the shoulders.
  grunge: { pts: [[-0.8, -0.6], [-0.55, -1.12], [0, -1.2], [0.6, -1.12], [1.05, -0.7], [1.15, 0.2], [1.2, 1.2], [1.25, 2.2], [0.95, 2.35], [0.7, 1.4], [0.3, 0.9], [-0.55, 0.95], [-0.88, 1.6], [-1.05, 2.3], [-1.28, 2.15], [-1.1, 1.2], [-0.92, 0.6], [-0.6, 0.0]], bumps: 0.03, nb: 20, strands: 'straight' },
  // Now: long, straight and black, with a fringe.
  straight: { dark: true, pts: [[-0.88, -0.35], [-0.8, -1.05], [-0.1, -1.35], [0.7, -1.25], [1.2, -0.8], [1.35, 0.1], [1.4, 1.1], [1.45, 2.3], [1.0, 2.5], [0.6, 1.6], [0.3, 0.9], [-0.55, 0.95], [-0.9, 1.7], [-1.0, 2.5], [-1.3, 2.4], [-1.15, 1.3], [-0.92, 0.6], [-0.6, 0.1]], bumps: 0.0, nb: 12, strands: 'straight', fringe: [[-0.92, -0.3], [-0.85, -1.0], [-0.2, -1.25], [0.5, -1.05], [0.45, -0.55], [-0.3, -0.38]] },
  // Now: short and dark.
  short: { dark: true, pts: [[-0.72, -0.75], [-0.55, -1.14], [0.05, -1.25], [0.64, -1.1], [0.94, -0.6], [0.92, -0.05], [0.76, 0.25], [0.4, -0.3], [-0.2, -0.6]], bumps: 0.03, nb: 24, strands: 'short', ear: true },
  // Now: a wavy mop.
  wavy: { pts: [[-0.84, -0.6], [-0.72, -1.16], [0, -1.42], [0.76, -1.28], [1.18, -0.76], [1.22, 0.0], [1.06, 0.52], [0.6, 0.3], [0.2, -0.3], [-0.4, -0.6]], bumps: 0.1, nb: 22, strands: 'curl', ear: true },
  // The next ones.
  bun: { dark: true, pts: [[-0.72, -0.78], [-0.5, -1.12], [0.05, -1.2], [0.6, -1.12], [0.9, -0.66], [0.92, 0.0], [0.6, 0.2], [0.2, -0.4]], bumps: 0.02, nb: 20, strands: 'sweep', bun: [0.82, -1.02, 0.46], ear: true },
  curls: { dark: true, pts: Array.from({ length: 18 }, (_, i) => { const a = (i / 18) * Math.PI * 2; return [0.25 + Math.cos(a) * 1.55, -0.3 + Math.sin(a) * 1.45] }), bumps: 0.14, nb: 30, strands: 'curl' },
  cap: { dark: true, pts: [[-1.3, -0.58], [-0.76, -0.72], [-0.72, -1.18], [0, -1.42], [0.76, -1.26], [1.02, -0.7], [0.96, -0.36], [0.4, -0.5], [-0.3, -0.64]], bumps: 0.0, nb: 12, strands: 'none', ear: true, band: true },
  braids: { dark: true, pts: [[-0.8, -0.62], [-0.62, -1.15], [0, -1.28], [0.66, -1.15], [1.0, -0.7], [1.05, 0.2], [1.1, 1.4], [1.18, 2.9], [0.86, 3.0], [0.72, 1.5], [0.4, 0.8], [-0.2, -0.4]], bumps: 0.0, nb: 12, strands: 'braid' },
  // Nobody.
  none: null,
}

/** The hair outline, resampled and pushed out in curls, in head units. */
function hairOutline(style) {
  return memo(`hair-${style}`, () => {
    const h = HAIR[style]
    const pts = h.pts
    const n = pts.length
    const cx = pts.reduce((s, p) => s + p[0], 0) / n
    const cy = pts.reduce((s, p) => s + p[1], 0) / n
    if (!h.bumps) return pts
    const out = []
    const N = h.nb * 4
    // Resample the closed polygon evenly by length.
    const seg = pts.map((p, i) => Math.hypot(pts[(i + 1) % n][0] - p[0], pts[(i + 1) % n][1] - p[1]))
    const total = seg.reduce((a, b) => a + b, 0)
    for (let s = 0; s < N; s++) {
      let d = (s / N) * total
      let i = 0
      while (d > seg[i]) { d -= seg[i]; i++ }
      const a = pts[i]
      const b = pts[(i + 1) % n]
      const u = d / seg[i]
      const x = lerp(a[0], b[0], u)
      const y = lerp(a[1], b[1], u)
      const len = Math.hypot(x - cx, y - cy) || 1
      const bump = h.bumps * Math.abs(Math.sin((Math.PI * s * h.nb) / N))
      out.push([x + ((x - cx) / len) * bump, y + ((y - cy) / len) * bump])
    }
    return out
  })
}

const toLocal = (pts, o = HEAD) => pts.map(([u, v]) => [o.x + u * o.u, o.y + v * o.u])
const shapeD = (pts, o) => spline(toLocal(pts, o))

/** Strands for a style, clipped by the caller to the hair less the head. */
function strandsD(style) {
  return memo(`strands-${style}`, () => {
    const h = HAIR[style]
    const pts = hairOutline(style)
    const xs = pts.map((p) => p[0])
    const ys = pts.map((p) => p[1])
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
    const rand = seq(style.length * 31 + 7)
    const lines = []
    if (h.strands === 'curl') {
      // Locks: wavy strands falling from the crown, each a few waves long.
      for (let i = 0; i < 70; i++) {
        const x = lerp(x0, x1, rand())
        const y = lerp(y0, y1, rand())
        if (!inside(pts, x, y) || inside(HEAD_PTS, x, y)) continue
        const len = 0.35 + rand() * 0.45
        const ph = rand() * 6.28
        const line = []
        for (let s = 0; s <= 10; s++) {
          const q = s / 10
          line.push([x + 0.09 * Math.sin(ph + q * 9) + (x - 0.2) * 0.15 * q, y + q * len])
        }
        lines.push(toLocal(line))
      }
      return polyD(lines)
    }
    if (h.strands === 'straight' || h.strands === 'braid') {
      for (let i = 0; i < 26; i++) {
        const x = lerp(x0, x1, (i + 0.5) / 26)
        const line = []
        for (let y = y0; y <= y1; y += 0.1) line.push([x + 0.06 * Math.sin(y * 2 + i), y])
        lines.push(toLocal(line))
      }
      let d = polyD(lines)
      if (h.strands === 'braid') {
        // Two plaits over the shoulder: chevrons down a column.
        for (const bx of [0.9, 1.02]) for (let y = 0.9; y < 2.9; y += 0.16) {
          const [a, b, c] = toLocal([[bx - 0.12, y], [bx, y + 0.1], [bx + 0.12, y]])
          d += `M${P(...a)}L${P(...b)}L${P(...c)}`
        }
      }
      return d
    }
    if (h.strands === 'sweep') {
      for (let i = 0; i < 20; i++) {
        const k = i / 19
        const line = []
        for (let s = 0; s <= 12; s++) {
          const u = s / 12
          line.push([lerp(x1 - 0.1, x0 + 0.1, u), lerp(y0 + 0.15, y1 - 0.1, k) - 0.4 * Math.sin(u * Math.PI) * (1 - k)])
        }
        lines.push(toLocal(line))
      }
      return polyD(lines)
    }
    if (h.strands === 'short') {
      for (let i = 0; i < 140; i++) {
        const x = lerp(x0, x1, rand())
        const y = lerp(y0, y1, rand())
        if (!inside(pts, x, y) || inside(HEAD_PTS, x, y)) continue
        const a = Math.atan2(y + 0.3, x - 0.1) + 1.4
        lines.push(toLocal([[x, y], [x + Math.cos(a) * 0.12, y + Math.sin(a) * 0.12]]))
      }
      return polyD(lines)
    }
    return ''
  })
}

/** The face: an eye, a brow, a nostril, a mouth, and shading on the far cheek. */
function faceD(o = {}) {
  const L = (pts) => toLocal(pts).map(([x, y]) => P(x, y))
  const [e0, e1, e2, e3] = L([[-0.66, -0.1], [-0.5, -0.2], [-0.36, -0.1], [-0.5, -0.03]])
  const open = o.eyeOpen ?? 1
  const eye = open > 0.05
    ? `M${e0}Q${e1.split(' ')[0]} ${r(Number(e1.split(' ')[1]) + (1 - open) * 0.1 * HEAD.u)} ${e2}Q${e3} ${e0}`
    : `M${e0}L${e2}`
  const brow = `M${L([[-0.72, -0.32]])}Q${L([[-0.53, -0.42]])} ${L([[-0.3, -0.33]])}`
  const nose = `M${L([[-0.93, 0.25]])}Q${L([[-0.82, 0.31]])} ${L([[-0.74, 0.24]])}`
  const mouth = `M${L([[-0.9, 0.47]])}Q${L([[-0.8, 0.51]])} ${L([[-0.66, 0.47]])}`
  const shade = memo('cheek', () => {
    // Under the jaw, where the head shadows the neck.
    const lines = []
    for (let i = 0; i < 8; i++) {
      const x = -0.34 + i * 0.1
      lines.push(toLocal([[x, 1.02 - Math.abs(x) * 0.25], [x + 0.05, 1.3]]))
    }
    return polyD(lines)
  })
  const [lx, ly] = toLocal([[-0.52 + (o.look ?? 0) * 0.06, -0.115]])[0]
  return { lines: eye + brow + nose + mouth, shade, pupil: open > 0.4 ? circ(lx, ly, 1.5) : '' }
}

/**
 * A sitter in the oval, in note-local coordinates: hair, coat, collar, neck,
 * head, strands, face. `clip` limits it to part of the oval (for the composite);
 * `sway` rotates it about the neck; `look` moves the eye.
 */
function sitterSvg(ctx, style, o = {}) {
  if (!style || style === 'none') return ''
  const h = HAIR[style]
  const u = ctx.uid
  const hair = shapeD(hairOutline(style))
  const head = shapeD(HEAD_PTS)
  const neck = shapeD(NECK_PTS)
  const coat = shapeD(COAT_PTS)
  const collar = spline(toLocal(COLLAR_PTS))
  const face = faceD(o)
  let out = ''
  // Hair, then coat over its lower part, then the paper of the neck, collar and head.
  if (h.dark) out += fillD(hair, PAPER) + fillD(hair, `url(#${u}-dk)`) + fillD(hair, `url(#${u}-dk2)`)
  else out += fillD(hair, PAPER)
  if (h.bun) {
    const [bx, by, br] = h.bun
    const [lx, ly] = toLocal([[bx, by]])[0]
    const bd = circ(lx, ly, br * HEAD.u)
    out += h.dark ? fillD(bd, PAPER) + fillD(bd, `url(#${u}-dk)`) + fillD(bd, `url(#${u}-dk2)`) : fillD(bd, PAPER)
  }
  out += fillD(coat, PAPER) + fillD(coat, `url(#${u}-coat)`) + fillD(coat, `url(#${u}-coat2)`)
  out += fillD(neck, PAPER) + fillD(collar, PAPER) + pen(spline(toLocal([[-0.2, 2.75], [0, 2.3], [0.2, 2.75]]), false), 0.9)
  out += fillD(head, PAPER)
  // Strands, inside the hair and outside the face.
  const sid = `${u}-hs-${style}`
  const strands = strandsD(style)
  if (strands && !ctx.defs.has(sid)) ctx.defs.set(sid, clipPathD(sid, hair + head, 'evenodd'))
  if (strands) out += `<g clip-path="url(#${sid})">${pen(strands, 0.8, { stroke: h.dark ? PAPER : INK, opacity: h.dark ? 0.7 : 0.9 })}</g>`
  if (h.fringe) {
    const fd = shapeD(h.fringe)
    out += h.dark ? fillD(fd, PAPER) + fillD(fd, `url(#${u}-dk)`) + fillD(fd, `url(#${u}-dk2)`) : fillD(fd, PAPER) + `<g clip-path="url(#${u}-fr-${style})">${pen(strands, 0.8)}</g>`
    const fid = `${u}-fr-${style}`
    if (!ctx.defs.has(fid)) ctx.defs.set(fid, clipPathD(fid, fd))
  }
  if (h.band) out += pen(spline(toLocal([[-1.28, -0.6], [-0.3, -0.68], [0.96, -0.4]]), false), 1.6, { stroke: PAPER })
  if (h.ear) out += pen(spline(toLocal([[0.34, -0.12], [0.5, -0.1], [0.52, 0.12], [0.36, 0.22]]), false), 1.0)
  out += pen(face.shade, 0.7, { opacity: 0.75 }) + pen(face.lines, 1.1) + fillD(face.pupil, INK)
  const [px, py] = toLocal([[0, 1.7]])[0]
  const sway = o.sway ?? 0
  return `<g clip-path="url(#${u}-oval)"${sway ? ` transform="rotate(${r(sway, 2)} ${r(px)} ${r(py)})"` : ''}>${out}</g>`
}

/* ══ PIECES OF A NOTE ══════════════════════════════════════════════════
 *
 * All in note-local coordinates, 0–1400 by 0–600. Each returns markup; the
 * note assembles them.
 */

/** The border, the braid, the corner medallions, the legend and the microtext. */
function frameSvg(ctx, spec, k = 1) {
  const u = ctx.uid
  const rules = rectD(14, 14, NW - 28, NH - 28) + rectD(40, 40, NW - 80, NH - 80)
  const braidK = k >= 1 ? 1 : clamp01((k - 0.3) / 0.5)
  let out = `<rect x="14" y="14" width="${NW - 28}" height="${NH - 28}" fill="url(#${u}-gr)" opacity="0.4"/>`
  if (braidK > 0) {
    const w = (NW - 28) * braidK
    out += `<g${op(braidK)}><rect x="14" y="14" width="${r(w)}" height="26" fill="url(#${u}-bh)"/><rect x="14" y="${NH - 40}" width="${r(w)}" height="26" fill="url(#${u}-bh)"/><rect x="14" y="14" width="26" height="${NH - 28}" fill="url(#${u}-bv)"/><rect x="${NW - 40}" y="14" width="26" height="${NH - 28}" fill="url(#${u}-bv)"/></g>`
  }
  out += drawn(rectD(14, 14, NW - 28, NH - 28), 1.6, k) + drawn(rectD(40, 40, NW - 80, NH - 80), 1.2, k)
  const m = k >= 1 ? 1 : clamp01((k - 0.6) / 0.4)
  if (m > 0) {
    for (const [cx, cy] of [[27, 27], [NW - 27, 27], [27, NH - 27], [NW - 27, NH - 27]]) {
      out += `<g${op(m)}>${fillD(circ(cx, cy, 21), PAPER)}${pen(circ(cx, cy, 21), 1.2)}${pen(circ(cx, cy, 16), 0.6, { stroke: GREEN })}${text({ x: cx, y: cy + 6, size: 16, text: spec.num.length > 2 ? spec.num.slice(0, 1) : spec.num, fill: INK, anchor: 'middle', weight: 700 })}</g>`
    }
    out += text({ x: 700, y: 72, size: 17, text: 'This note is legal tender for every song', fill: INK, anchor: 'middle', weight: 600, tracking: 5, opacity: m * ctx.typeOpacity })
    const micro = `${spec.micro} · `.repeat(10)
    out += `<g${op(m * ctx.typeOpacity * 0.9)} font-size="7.5" font-weight="600" letter-spacing="1.2" fill="${GREEN}"><text><textPath href="#${u}-m1">${micro}</textPath></text><text><textPath href="#${u}-m2">${micro}</textPath></text></g>`
  }
  return out
}

/** The rosette, by kind: classic, pepper, watch, pepwatch, record, globe. */
function rosetteSvg(ctx, spec, now, o = {}) {
  const { x, y, R } = LAY.rosette
  const u = ctx.uid
  const kind = o.kind ?? spec.rosette
  const phi = ctx.spin
  const draw = o.draw ?? null // per-ring draw-on for the 1968 engraving
  let out = ''
  const ringUse = (i, rot) => {
    const g = RINGS[i]
    const step = 360 / (g.n * g.copies)
    const k = draw ? draw.rings[i] : 1
    if (k <= 0) return ''
    const dash = k < 1 ? ` stroke-dasharray="${r(k, 3)} 1"` : ''
    let s = `<g transform="translate(${x} ${y}) rotate(${r(rot, 2)})" fill="none" stroke="${g.colour}" stroke-width="${g.w}"${dash}>`
    for (let c = 0; c < g.copies; c++) s += `<use href="#${u}-ring${i}"${c ? ` transform="rotate(${r(step * c, 2)})"` : ''}/>`
    return s + '</g>'
  }
  if (kind === 'classic') {
    for (let i = 0; i < RINGS.length; i++) out += ringUse(i, phi * RINGS[i].s * 6)
    const sk = draw ? draw.star : 1
    if (sk > 0) out += `<g transform="translate(${x} ${y}) rotate(${r(phi * 3, 2)})">${drawn(ctx.def('star'), 0.8, sk)}</g>`
    const ck = draw ? draw.circles : 1
    for (const f of [0.2, 0.26, 0.32, 0.42]) out += drawn(circ(x, y, R * f), 0.8, ck)
    const mk = draw ? draw.micro : 1
    if (mk > 0) out += `<g transform="translate(${x} ${y}) rotate(${r(-phi * 2, 2)})"${op(mk)}><text font-size="5.6" font-weight="600" letter-spacing="0.9" fill="${INK}"><textPath href="#${u}-micro">${spec.microRing}</textPath></text></g>`
    out += numeralDisc(spec, x, y, R * 0.2, draw ? draw.numeral : 1)
    return out
  }
  if (kind === 'pepper' || kind === 'pepwatch') {
    out += `<g transform="translate(${x} ${y}) rotate(${r(phi * 9, 2)})"><path d="${ctx.def('pepper')}" fill="url(#${u}-pep)"/>${pen(ctx.def('pepperLines'), 0.9)}</g>`
    out += pen(circ(x, y, R * 0.94), 2.2) + pen(circ(x, y, R * 0.99), 0.8) + ringUse(0, phi * 6)
    if (kind === 'pepwatch') out += handsSvg(ctx, now, x, y, R * 0.7, 1)
    else if (!o.bare) out += numeralDisc(spec, x, y, R * 0.2, 1)
    return out
  }
  if (kind === 'watch') {
    out += fillD(circ(x, y, R * 0.95), PAPER) + pen(circ(x, y, R * 0.95), 2.6) + pen(circ(x, y, R * 0.88), 1.0)
    out += `<g transform="translate(${x} ${y}) rotate(${r(phi * 2, 2)})" fill="none" stroke="${GREEN}" stroke-width="0.6">${Array.from({ length: 4 }, (_, c) => `<use href="#${u}-dial"${c ? ` transform="rotate(${c * 1.9})"` : ''}/>`).join('')}</g>`
    let ticks = ''
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2
      const r0 = R * (i % 5 ? 0.82 : 0.72)
      ticks += `M${P(x + Math.cos(a) * r0, y + Math.sin(a) * r0)}L${P(x + Math.cos(a) * R * 0.86, y + Math.sin(a) * R * 0.86)}`
    }
    out += pen(ticks, 1.2)
    for (const [n, a] of [['12', -90], ['3', 0], ['6', 90], ['9', 180]]) {
      const rad = (a * Math.PI) / 180
      out += text({ x: x + Math.cos(rad) * R * 0.58, y: y + Math.sin(rad) * R * 0.58 + 8, size: 22, text: n, fill: INK, anchor: 'middle', weight: 600 })
    }
    out += handsSvg(ctx, now, x, y, R * 0.8, 1)
    return out
  }
  if (kind === 'record') {
    out += fillD(circ(x, y, R), PAPER)
    out += `<g transform="translate(${x} ${y})">${pen(ctx.def('grooves'), 1.35)}${pen(circ(0, 0, R * 0.98), 1.6)}</g>`
    // Reflections: two paper wedges that do not turn, which is what makes a record read as spinning.
    out += `<g${op(0.55)}>${fillD(`M${P(x, y)}L${P(x + Math.cos(-0.9) * R, y + Math.sin(-0.9) * R)}A${R} ${R} 0 0 1 ${P(x + Math.cos(-0.72) * R, y + Math.sin(-0.72) * R)}Z`, PAPER)}${fillD(`M${P(x, y)}L${P(x + Math.cos(2.24) * R, y + Math.sin(2.24) * R)}A${R} ${R} 0 0 1 ${P(x + Math.cos(2.42) * R, y + Math.sin(2.42) * R)}Z`, PAPER)}</g>`
    // The label: the peppermint, turning fast, with the watch hands on it.
    const L = R * 0.38
    out += fillD(circ(x, y, L), PAPER) + `<g transform="translate(${x} ${y}) rotate(${r(phi * 40, 1)}) scale(${r(L / (R * 0.94), 3)})"><path d="${ctx.def('pepper')}" fill="url(#${u}-pep)"/>${pen(ctx.def('pepperLines'), 1.6)}</g>` + pen(circ(x, y, L), 1.4) + fillD(circ(x, y, 4), INK)
    out += handsSvg(ctx, now, x, y, L * 0.9, 1)
    return out
  }
  if (kind === 'globe') {
    out += globeSvg(ctx, x, y + 70, R * 0.72, now, { man: true })
    return out
  }
  return out
}

function numeralDisc(spec, x, y, rad, k = 1) {
  if (k <= 0) return ''
  const size = Math.min(62, (rad * 1.7) / Math.max(advance(spec.num), 0.5))
  return `<g${op(k)}>${fillD(circ(x, y, rad), PAPER)}${pen(circ(x, y, rad), 1.4)}${text({ x, y: y + size * 0.36, size, text: spec.num, fill: INK, anchor: 'middle', weight: 700 })}</g>`
}

/** Watch hands: the minute hand turns once a song-minute; the second hand steps on the beat. */
function handsSvg(ctx, now, x, y, len, k = 1) {
  if (k <= 0) return ''
  const beat = ctx.beat(now)
  const sec = ((Math.floor(beat) + easeOut(clamp01((beat % 1) / 0.13))) * 30 * Math.PI) / 180
  const min = (now * 6 * Math.PI) / 180 - Math.PI / 2
  const hr = (now * 0.5 * Math.PI) / 180 + Math.PI * 0.2
  const hand = (a, l, w) => `M${P(x - Math.cos(a) * l * 0.12, y - Math.sin(a) * l * 0.12)}L${P(x + Math.cos(a) * l, y + Math.sin(a) * l)}`
  const lance = (a, l, w) => {
    const nx = -Math.sin(a) * w
    const ny = Math.cos(a) * w
    return `M${P(x + nx, y + ny)}L${P(x + Math.cos(a) * l, y + Math.sin(a) * l)}L${P(x - nx, y - ny)}Z`
  }
  return `<g${op(k)}>${fillD(lance(hr, len * 0.55, 5), INK)}${fillD(lance(min, len * 0.85, 3.4), INK)}${pen(hand(sec - Math.PI / 2, len * 0.92), 1.1)}${fillD(circ(x, y, 5), INK)}${fillD(circ(x, y, 2), PAPER)}</g>`
}

/** The portrait oval's tone and frame, with its sitter. */
function portraitSvg(ctx, spec, now, o = {}) {
  const { x, y, rx, ry } = LAY.oval
  const u = ctx.uid
  const toneK = o.tone ?? 1
  const frameK = o.frame ?? 1
  let out = ''
  if (toneK > 0) {
    const h = (ry * 2 + 4) * toneK
    // The sitter is burnished out of the tone, so it comes up with it.
    out += `<g clip-path="url(#${u}-tn${o.id ?? ''})"><g clip-path="url(#${u}-oval)"><rect x="${x - rx}" y="${y - ry}" width="${rx * 2}" height="${ry * 2}" fill="url(#${u}-ph)"/><rect x="${x - rx}" y="${y - ry}" width="${rx * 2}" height="${ry * 2}" fill="url(#${u}-px)" mask="url(#${u}-rim)"/></g>${o.flying ? '' : o.sitter ?? ''}</g>`
    if (toneK < 1) ctx.local.push(clipRect(`${u}-tn${o.id ?? ''}`, x - rx - 60, y - ry - 60, rx * 2 + 120, h + 58))
    else if (!ctx.defs.has(`${u}-tn`)) ctx.defs.set(`${u}-tn`, clipRect(`${u}-tn`, x - rx - 60, y - ry - 60, rx * 2 + 120, ry * 2 + 120))
  }
  // A sitter that is flying in from another note is not inside the tone's reveal.
  if (o.flying && o.sitter) out += o.sitter
  if (frameK > 0) {
    out += `<g transform="translate(${x} ${y}) scale(1 ${r(ry / rx, 4)})" fill="none" stroke="${GREEN}" stroke-width="0.9">${frameK < 1 ? `<g stroke-dasharray="${r(frameK, 3)} 1">` : '<g>'}${Array.from({ length: 4 }, (_, c) => `<use href="#${u}-frame" vector-effect="non-scaling-stroke"${c ? ` transform="rotate(${r(c * 2.25 + ctx.spin * 0.6, 2)})"` : ` transform="rotate(${r(ctx.spin * 0.6, 2)})"`}/>`).join('')}</g></g>`
    out += drawn(ellipse(x, y, rx + 2, ry + 2), 2.2, frameK) + drawn(ellipse(x, y, rx + 40, ry + 40 * (ry / rx)), 1.3, frameK)
  }
  if (spec.caption && (o.caption ?? 1) > 0) out += text({ x, y: 524, size: 17, text: spec.caption, fill: INK, anchor: 'middle', weight: 600, tracking: 6, opacity: (o.caption ?? 1) * ctx.typeOpacity })
  if (spec.word && (o.word ?? 1) > 0) out += text({ x: LAY.rosette.x, y: 522, size: 22, text: spec.word, fill: INK, anchor: 'middle', weight: 700, tracking: 7, opacity: (o.word ?? 1) * ctx.typeOpacity })
  return out
}

/* ── Vignettes ─────────────────────────────────────────────────────── */

/** An airship: the envelope, girders, fins and gondola, shaded underneath. */
function airshipSvg(ctx, x, y, L) {
  const u = ctx.uid
  const h = L * 0.165
  const env = `M${P(x - L / 2, y)}C${P(x - L / 2, y - h)} ${P(x - L * 0.22, y - h * 1.05)} ${P(x, y - h)}C${P(x + L * 0.3, y - h * 0.95)} ${P(x + L * 0.46, y - h * 0.45)} ${P(x + L / 2, y)}C${P(x + L * 0.46, y + h * 0.45)} ${P(x + L * 0.3, y + h * 0.95)} ${P(x, y + h)}C${P(x - L * 0.22, y + h * 1.05)} ${P(x - L / 2, y + h)} ${P(x - L / 2, y)}Z`
  const girders = [-0.55, -0.1, 0.35, 0.75].map((f) => `M${P(x - L * 0.46, y + f * h * 0.6)}C${P(x - L * 0.2, y + f * h * 1.02)} ${P(x + L * 0.25, y + f * h * 1.0)} ${P(x + L * 0.47, y + f * h * 0.35)}`).join('')
  const ribs = Array.from({ length: 9 }, (_, i) => {
    const xx = x - L * 0.38 + i * L * 0.09
    const hh = h * (1 - Math.abs((xx - x) / (L * 0.52)) ** 2.2)
    return `M${P(xx, y - hh)}Q${P(xx + 4, y)} ${P(xx, y + hh)}`
  }).join('')
  const fins = `M${P(x + L * 0.36, y - h * 0.6)}L${P(x + L * 0.5, y - h * 1.25)}L${P(x + L * 0.52, y - h * 0.2)}ZM${P(x + L * 0.36, y + h * 0.6)}L${P(x + L * 0.5, y + h * 1.25)}L${P(x + L * 0.52, y + h * 0.2)}Z`
  const gondola = `M${P(x - L * 0.12, y + h * 1.02)}h${r(L * 0.16)}l${r(-L * 0.02)} ${r(h * 0.35)}h${r(-L * 0.12)}Z`
  const cid = `${u}-ship-${r(x)}`
  if (!ctx.local.includes(cid)) ctx.local.push(`<clipPath id="${cid}"><path d="${env}"/></clipPath>`, cid)
  return `${fillD(env, PAPER)}<g clip-path="url(#${cid})"><rect x="${r(x - L / 2)}" y="${r(y + h * 0.1)}" width="${r(L)}" height="${r(h)}" fill="url(#${u}-dk)" opacity="0.8"/><rect x="${r(x - L / 2)}" y="${r(y + h * 0.5)}" width="${r(L)}" height="${r(h)}" fill="url(#${u}-dk2)" opacity="0.7"/></g>${pen(girders, 0.8)}${pen(ribs, 0.6, { opacity: 0.8 })}${fillD(fins, PAPER)}${pen(fins, 1.1)}${pen(env, 1.6)}${fillD(gondola, PAPER)}${pen(gondola, 1.1)}`
}

/** A cumulus: a bumpy top and a flat base, hatched underneath. */
function cloudD(x, y, w, seed) {
  return memo(`cloud-${r(x)}-${r(y)}-${w}-${seed}`, () => {
    const rand = seq(seed)
    const n = 7
    let d = `M${P(x - w / 2, y)}`
    for (let i = 0; i < n; i++) {
      const x0 = x - w / 2 + (i * w) / n
      const x1 = x0 + w / n
      const hgt = (0.25 + 0.5 * Math.sin(((i + 0.5) / n) * Math.PI)) * w * 0.32 * (0.8 + rand() * 0.4)
      d += `C${P(x0, y - hgt * 1.1)} ${P(x1, y - hgt * 1.1)} ${P(x1, y - (i < n - 1 ? hgt * 0.35 : 0))}`
    }
    return d + 'Z'
  })
}

/** The bottle, with the lightning knocked out of its glass — the still's, in local units. */
function bottleSvg(ctx, cx, top, s, o = {}) {
  const u = ctx.uid
  const k = o.k ?? 1
  const bolt = o.bolt ?? 1
  const W = 100 * s
  const H = 440 * s
  const bottom = top + H
  const X = (v) => cx + v * s
  const Y = (v) => top + v * s
  const body = `M${P(X(-18), Y(22))}V${r(Y(100))}C${P(X(-18), Y(140))} ${P(X(-100), Y(150))} ${P(X(-100), Y(200))}V${r(bottom - 22 * s)}Q${P(X(-100), bottom)} ${P(X(-78), bottom)}H${r(X(78))}Q${P(X(100), bottom)} ${P(X(100), bottom - 22 * s)}V${r(Y(200))}C${P(X(100), Y(150))} ${P(X(18), Y(140))} ${P(X(18), Y(100))}V${r(Y(22))}Z`
  const boltD = memo(`bolt-${r(cx)}-${r(top)}-${s}`, () => {
    const rand = seq(1968)
    const trunk = [[X(8), Y(150)]]
    let bx = 8
    let by = 150
    for (let i = 1; i <= 6; i++) {
      bx += (i % 2 ? -1 : 1) * (22 + rand() * 18) + (rand() - 0.5) * 12
      by += 38 + rand() * 22
      trunk.push([X(bx), Y(by)])
    }
    const fork = (from, dir, n) => {
      const pts = [from]
      let [fx, fy] = from
      for (let i = 0; i < n; i++) { fx += dir * (10 + rand() * 12) * s; fy += (16 + rand() * 14) * s; pts.push([fx, fy]) }
      return pts
    }
    const poly = (pts) => 'M' + pts.map(([px, py]) => P(px, py)).join('L')
    return poly(trunk) + poly(fork(trunk[3], 1, 3)) + poly(fork(trunk[4], -1, 2))
  })
  const gid = `${u}-glass-${r(cx)}`
  if (!ctx.local.includes(gid)) ctx.local.push(clipPathD(gid, body), gid)
  let out = ''
  if (k > 0.15) {
    const gk = clamp01((k - 0.15) / 0.5)
    out += `<g clip-path="url(#${gid})"${op(gk)}>${fillD(body, PAPER)}<rect x="${r(X(-100))}" y="${r(top)}" width="${r(W * 2)}" height="${r(H)}" fill="url(#${u}-gl)" opacity="0.55"/><rect x="${r(X(34))}" y="${r(top)}" width="${r(66 * s)}" height="${r(H)}" fill="url(#${u}-gd)"/><rect x="${r(X(-100))}" y="${r(bottom - 60 * s)}" width="${r(W * 2)}" height="${r(60 * s)}" fill="url(#${u}-gd)"/>`
    if (bolt > 0) out += `<g${op(bolt)}>${pen(boltD, 13 * s)}${pen(boltD, 8.5 * s, { stroke: PAPER })}${pen(boltD, 0.8, { opacity: 0.6 })}</g>`
    out += '</g>'
  }
  out += drawn(body, 2.2, k)
  const cork = o.cork ?? 1
  if (cork > 0 && k > 0.6) {
    const lift = o.corkLift ?? 0
    out += `<g transform="translate(0 ${r(-lift)})"${op(cork)}>${fillD(rectD(X(-24), Y(-2), 48 * s, 26 * s), PAPER)}${pen(rectD(X(-24), Y(-2), 48 * s, 26 * s), 2)}${pen([6, 12, 18].map((dy) => `M${P(X(-22), Y(dy))}H${r(X(22))}`).join(''), 0.8)}</g>`
  }
  return out
}

/** Engraved water. */
function seaD(x0, x1, y, rows = 5, seed = 0) {
  return memo(`sea-${r(x0)}-${r(x1)}-${r(y)}-${rows}-${seed}`, () => Array.from({ length: rows }, (_, i) => {
    const yy = y + i * 8
    const amp = 2.6 + (i % 2)
    const len = 38 - i * 2
    let d = `M${P(x0 + ((i * 7) % len), yy)}`
    for (let x = x0 + ((i * 7) % len); x < x1 - len; x += len) d += `q${r(len / 4)} ${r(-amp)} ${r(len / 2)} 0t${r(len / 2)} 0`
    return d
  }).join(''))
}

/** A stave of five lines running from (x0, y0) up into (x1, y1), and where note n sits on it. */
function staveAt(x0, y0, x1, y1) {
  const at = (u, line) => {
    const x = lerp(x0, x1, u)
    const y = lerp(y0, y1, u) + 60 * Math.sin(u * Math.PI) * (1 - u) + (line - 2) * 9 * (1 - 0.55 * u)
    return [x, y]
  }
  let d = ''
  for (let l = 0; l < 5; l++) {
    const pts = []
    for (let s = 0; s <= 24; s++) pts.push(at(s / 24, l))
    d += 'M' + pts.map(([x, y]) => P(x, y)).join('L')
  }
  return { d, at }
}

/** A note head with a stem, tilted. */
function noteHead(x, y, sc = 1) {
  const e = `<ellipse cx="${r(x)}" cy="${r(y)}" rx="${r(6.4 * sc)}" ry="${r(4.6 * sc)}" transform="rotate(-22 ${r(x)} ${r(y)})" fill="${INK}"/>`
  return e + pen(`M${P(x + 5.6 * sc, y - 1.5 * sc)}V${r(y - 30 * sc)}`, 1.4)
}

const BOTTLE = { x: 1195, top: 160, s: 0.74 }
const BOTTLE_HIM = { x: 1135, top: 150, s: 0.6 }

/** The 1968 vignette: sky, smoke, clouds, the airship, the stave into the bottle, the sea. */
function bottleVignette(ctx, spec, now, st) {
  const u = ctx.uid
  const { cx, cy, rx, ry } = LAY.vig
  const { x: bx, top: btop, s: bs } = st.bottleAt ?? BOTTLE
  let out = ''
  // The sky: fine green lines, clipped to the vignette.
  const skyK = st.sky ?? 1
  if (skyK > 0) out += `<g clip-path="url(#${u}-vig)"><rect x="${cx - rx}" y="${cy - ry}" width="${r(rx * 2 * skyK)}" height="${ry * 1.3}" fill="url(#${u}-sky)"/></g>`
  // Smoke across the sky, wiped out left to right by `clear`.
  const smokeK = st.smoke ?? 0
  if (smokeK > 0) {
    const smoke = memo('smoke', () => {
      let d = ''
      for (let i = 0; i < 7; i++) {
        const y = 100 + i * 16 + (i % 2) * 5
        d += `M${P(cx - rx, y)}`
        for (let x = cx - rx; x < cx + rx; x += 40) d += `q20 ${r(-6 - (i % 3) * 2)} 40 0`
      }
      return d
    })
    const wipe = st.wipe ?? 0
    const id = `${u}-smw${st.id ?? ''}`
    ctx.local.push(clipRect(id, cx - rx + rx * 2 * wipe, 0, rx * 2, NH))
    out += `<g clip-path="url(#${u}-vig)"><g clip-path="url(#${id})"><g transform="translate(${r(-((now * 8) % 40))} 0)">${pen(smoke, 1.1, { opacity: 0.55 * smokeK })}</g></g></g>`
  }
  // The clouds, pulled down into the sea.
  const pull = st.pull ?? 1
  if (pull < 1 && (st.clouds ?? 1) > 0) {
    let clouds = ''
    for (const [x, y, w, seed] of [[1010, 150, 150, 3], [1185, 118, 120, 7], [1290, 170, 110, 11]]) {
      const dy = lerp(0, 492 - y, easeInOut(pull))
      const sq = 1 - 0.75 * easeInOut(pull)
      const cd = cloudD(x, y, w, seed)
      clouds += `<g transform="translate(0 ${r(dy)}) translate(${x} ${y}) scale(1 ${r(sq, 3)}) translate(${-x} ${-y})"${op((1 - pull ** 3) * (st.clouds ?? 1))}>${fillD(cd, PAPER)}<g clip-path="url(#${u}-cl${seed})"><rect x="${x - w / 2}" y="${y - 30}" width="${w}" height="40" fill="url(#${u}-sky)"/></g>${pen(cd, 1.1)}</g>`
      if (!ctx.defs.has(`${u}-cl${seed}`)) ctx.defs.set(`${u}-cl${seed}`, clipPathD(`${u}-cl${seed}`, cd))
    }
    out += `<g clip-path="url(#${u}-vig)">${clouds}</g>`
  }
  // The airship.
  const ship = st.ship ?? 1
  if (ship > 0) {
    const sx = lerp(cx - rx - 140, 1030, easeCamera(ship)) + (st.shipDrift ?? 0)
    out += `<g clip-path="url(#${u}-vig)">${airshipSvg(ctx, sx, 118, 170)}</g>`
  }
  // The sea, and the rows the clouds became.
  const seaK = st.sea ?? 1
  if (seaK > 0) out += `<g clip-path="url(#${u}-vig)"${op(seaK)}>${pen(seaD(cx - rx, cx + rx, 496, 5), 1.0, { stroke: GREEN })}${pull > 0.6 ? pen(seaD(cx - rx, cx + rx, 536, 2, 1), 1.0, { stroke: GREEN, opacity: clamp01((pull - 0.6) / 0.4) }) : ''}</g>`
  // The stave, running into the bottle's neck, and the notes on it.
  const stave = staveAt(950, 380, bx - 4, btop + 8)
  const stK = st.stave ?? 1
  if (stK > 0) out += drawn(stave.d, 0.9, stK, { stroke: GREEN })
  for (const [i, uu] of [[0, 0.2], [1, 0.42], [2, 0.64]]) {
    const k = st.notes ? st.notes[i] : 1
    if (k <= 0) continue
    const [nx, ny] = stave.at(uu, [1, 3, 2][i])
    out += `<g${op(k)} transform="translate(0 ${r(-10 * (1 - k))})">${noteHead(nx, ny, 1 - 0.3 * uu)}</g>`
  }
  out += bottleSvg(ctx, bx, btop, bs, { k: st.bottle ?? 1, bolt: st.bolt ?? 1, cork: st.cork ?? 1, corkLift: st.corkLift ?? 0 })
  out += drawn(ellipse(cx, cy, rx, ry), 1.0, st.frame ?? 1, { stroke: GREEN, opacity: 0.8 })
  return out
}

/** The globe, with a small tall man standing on top of it. */
function globeSvg(ctx, x, y, R, now, o = {}) {
  const u = ctx.uid
  const id = `${u}-gb-${r(x)}-${r(y)}`
  if (!ctx.local.includes(id)) ctx.local.push(clipPathD(id, circ(x, y, R)), id)
  const turn = (now * 0.12) % 1
  let mer = ''
  for (let i = 0; i < 8; i++) {
    const ph = ((i / 8 + turn) % 1) * Math.PI
    const rx = Math.abs(Math.cos(ph)) * R
    mer += `M${P(x, y - R)}A${r(Math.max(rx, 0.5))} ${r(R)} 0 0 ${Math.cos(ph) > 0 ? 1 : 0} ${P(x, y + R)}`
  }
  let par = ''
  for (let i = -3; i <= 3; i++) {
    const yy = y + (i / 4) * R
    const w = Math.sqrt(Math.max(0, R * R - (yy - y) ** 2))
    par += `M${P(x - w, yy)}L${P(x + w, yy)}`
  }
  const split = o.split ?? 0
  const half = (side) => `<g transform="translate(${r(side * split * 7)} 0)" clip-path="url(#${u}-gh${side > 0 ? 'r' : 'l'}-${r(x)})">${fillD(circ(x, y, R), PAPER)}<g clip-path="url(#${id})">${pen(mer, 0.8, { stroke: GREEN })}${pen(par, 0.8, { stroke: GREEN })}<path d="${`M${P(x + R * 0.1, y - R)}A${R} ${R} 0 0 1 ${P(x + R * 0.1, y + R)}A${R * 0.8} ${R} 0 0 0 ${P(x + R * 0.1, y - R)}Z`}" fill="url(#${u}-dk)" opacity="0.7"/></g>${pen(circ(x, y, R), 1.8)}</g>`
  if (!ctx.local.includes(`${u}-ghl-${r(x)}`)) ctx.local.push(clipRect(`${u}-ghl-${r(x)}`, x - R - 20, y - R - 20, R + 20, R * 2 + 40), `${u}-ghl-${r(x)}`, clipRect(`${u}-ghr-${r(x)}`, x, y - R - 20, R + 20, R * 2 + 40), `${u}-ghr-${r(x)}`)
  let out = half(-1) + half(1)
  if (o.man) {
    // A man far too tall for the world he is standing on, with a guitar.
    // Legs apart on the pole, a long coat, a guitar across him, a head in the sky.
    const top = y - R + 2
    const H = R * 1.5
    const q = (fx, fy) => P(x + fx * H, top - fy * H)
    const legs = `M${q(-0.07, 0)}L${q(-0.03, 0.42)}L${q(0.03, 0.42)}L${q(0.07, 0)}L${q(0.045, 0)}L${q(0, 0.36)}L${q(-0.045, 0)}Z`
    const coat = `M${q(-0.05, 0.3)}L${q(-0.075, 0.78)}Q${q(0, 0.84)} ${q(0.075, 0.78)}L${q(0.05, 0.3)}Z`
    const arms = `M${q(-0.07, 0.76)}L${q(-0.1, 0.5)}L${q(0.02, 0.5)}M${q(0.07, 0.76)}L${q(0.1, 0.56)}L${q(0.04, 0.52)}`
    out += fillD(legs, INK) + fillD(coat, INK) + pen(arms, 3.2) + fillD(circ(x, top - 0.87 * H, 0.052 * H), INK)
    // The guitar, slung across.
    out += `<g transform="rotate(-32 ${q(0, 0.5).replace(' ', ' ')})">${fillD(ellipse(x + 0.02 * H, top - 0.47 * H, 0.075 * H, 0.055 * H), PAPER)}${pen(ellipse(x + 0.02 * H, top - 0.47 * H, 0.075 * H, 0.055 * H), 1.6)}${pen(`M${q(0.09, 0.47)}L${q(0.3, 0.47)}`, 2.4)}</g>`
  }
  return out
}

/** The three-dollar bill's vignette: a numeral three, engraved, in a cartouche. */
function threeVignette(ctx) {
  const u = ctx.uid
  const { cx, cy } = LAY.vig
  return `<g transform="translate(${cx} ${cy}) scale(1 1.2)" fill="none" stroke="${GREEN}" stroke-width="0.8">${Array.from({ length: 3 }, (_, c) => `<use href="#${u}-frame" vector-effect="non-scaling-stroke" transform="scale(1.2) rotate(${c * 3 + ctx.spin})"/>`).join('')}</g>
    <text x="${cx}" y="${cy + 120}" font-size="340" font-weight="700" text-anchor="middle" fill="url(#${u}-num)" stroke="${INK}" stroke-width="2.2">3</text>
    ${text({ x: cx, y: cy + 196, size: 24, text: 'Three', fill: INK, anchor: 'middle', weight: 700, tracking: 10, opacity: ctx.typeOpacity })}`
}

/** A guitar with an offset waist. */
function guitarVignette(ctx) {
  const u = ctx.uid
  const { cx, cy } = LAY.vig
  const body = spline([[-70, 60], [-90, 10], [-66, -40], [-40, -30], [-20, -62], [30, -80], [48, -40], [70, 0], [95, 50], [80, 120], [20, 150], [-50, 140], [-95, 110]].map(([x, y]) => [cx + x, cy + 60 + y]))
  const guard = spline([[-50, 40], [-50, -10], [-10, -40], [30, -40], [40, 30], [10, 90], [-40, 90]].map(([x, y]) => [cx + x, cy + 60 + y]))
  const id = `${u}-gtr`
  if (!ctx.local.includes(id)) ctx.local.push(clipPathD(id, body), id)
  const neck = `M${P(cx - 9, cy + 20)}L${P(cx - 9, cy - 220)}L${P(cx + 9, cy - 220)}L${P(cx + 9, cy + 20)}Z`
  const head = `M${P(cx - 9, cy - 220)}C${P(cx - 20, cy - 250)} ${P(cx - 4, cy - 280)} ${P(cx + 16, cy - 290)}L${P(cx + 22, cy - 270)}C${P(cx + 12, cy - 250)} ${P(cx + 12, cy - 235)} ${P(cx + 9, cy - 220)}Z`
  let frets = ''
  for (let i = 1; i < 16; i++) frets += `M${P(cx - 9, cy - 220 + i * 14)}H${r(cx + 9)}`
  let strings = ''
  for (let i = 0; i < 6; i++) strings += `M${P(cx - 6 + i * 2.4, cy - 225)}L${P(cx - 6 + i * 2.4, cy + 150)}`
  return `${fillD(body, PAPER)}<g clip-path="url(#${id})"><rect x="${cx - 120}" y="${cy - 40}" width="240" height="260" fill="url(#${u}-coat)"/><rect x="${cx + 20}" y="${cy - 40}" width="120" height="260" fill="url(#${u}-coat2)"/></g>${fillD(guard, PAPER)}${pen(guard, 1.1)}${pen(body, 2)}${fillD(neck, PAPER)}${pen(neck, 1.4)}${pen(frets, 0.8)}${fillD(head, PAPER)}${pen(head, 1.4)}${pen(strings, 0.5)}${[0, 1, 2].map((i) => pen(rectD(cx - 22, cy + 70 + i * 22 - 90, 44, 8), 1.1)).join('')}`
}

/** The watermark window: unprinted paper, and when the note is held to the light, him. */
function watermarkSvg(ctx, now, light = 0) {
  const u = ctx.uid
  const { cx, cy } = LAY.vig
  let out = drawn(ellipse(cx, cy - 10, 150, 190), 0.8, 1, { stroke: GREEN, opacity: 0.6 })
  if (light > 0.002) {
    // Held to the light: the paper round the window darkens and the watermark is lighter paper.
    const wm = `${u}-wmk`
    out += `<g${op(light)}><path d="${ellipse(cx, cy - 10, 149, 189)}" fill="${PAPER_SHADE}"/><g transform="translate(${cx - HEAD.x - 20} ${cy - 10 - LAY.oval.y})" clip-path="url(#${wm})">${watermarkFigure(ctx)}</g></g>`
    if (!ctx.defs.has(wm)) ctx.defs.set(wm, `<clipPath id="${wm}"><path d="${ellipse(HEAD.x + 20, LAY.oval.y, 149, 189)}"/></clipPath>`)
  }
  return out
}
/** The composite's silhouette, as the paper sees it: soft, no line. */
function watermarkFigure(ctx) {
  const L = shapeD(hairOutline('mane'))
  const Rh = shapeD(hairOutline('straight'))
  const u = ctx.uid
  if (!ctx.defs.has(`${u}-wl`)) {
    ctx.defs.set(`${u}-wl`, clipRect(`${u}-wl`, 0, 0, HEAD.x, NH))
    ctx.defs.set(`${u}-wr`, clipRect(`${u}-wr`, HEAD.x, 0, NW, NH))
  }
  const fig = `<g clip-path="url(#${u}-wl)"><path d="${L}"/></g><g clip-path="url(#${u}-wr)"><path d="${Rh}"/></g><path d="${shapeD(HEAD_PTS)}"/><path d="${shapeD(NECK_PTS)}"/><path d="${shapeD(COAT_PTS)}"/>`
  return `<g fill="#f7f1e3" opacity="0.95">${fig}</g><g fill="#fffaf0" opacity="0.5" transform="translate(${HEAD.x} ${HEAD.y}) scale(0.92) translate(${-HEAD.x} ${-HEAD.y})">${fig}</g>`
}

/* ══ ONE NOTE ══════════════════════════════════════════════════════════
 *
 * `st` carries the state of anything that animates on this particular note;
 * a note with no `st` is its spec's finished state. `print` is how far the
 * press has pulled it (0 — only the plate mark — to 1).
 */
function noteSvg(ctx, k, spec, now, st = {}) {
  const u = ctx.uid
  const print = st.print ?? 1
  let body = ''
  const parts = st.parts ?? {}
  const part = (name, markup) => {
    const p = parts[name]
    if (!p) return markup
    if (p.o <= 0.002) return ''
    return `<g transform="translate(${r(p.dx, 1)} ${r(p.dy, 1)})"${op(p.o)}>${markup}</g>`
  }
  if (print > 0) {
    body += part('frame', frameSvg(ctx, spec, st.frameK ?? 1))
    // The rosette.
    body += part('rosette', rosetteSvg(ctx, spec, now, st.rosette ?? {}))
    if (st.hands) body += part('hands', handsSvg(ctx, now, LAY.rosette.x, LAY.rosette.y, LAY.rosette.R * 0.7, 1))
    if (st.record > 0) body += `<g${op(st.record)}>${rosetteSvg(ctx, spec, now, { kind: 'record' })}</g>`
    // The portrait.
    let sitter = ''
    if (spec.sitter === 'split') {
      sitter += part('sitterL', `<g clip-path="url(#${u}-hl)">${sitterSvg(ctx, 'mane', st.face ?? {})}</g>`)
      sitter += part('sitterR', `<g clip-path="url(#${u}-hr)">${sitterSvg(ctx, 'straight', st.face ?? {})}</g>`)
      if ((st.seam ?? 1) > 0) sitter += pen(`M${HEAD.x} ${LAY.oval.y - LAY.oval.ry}V${LAY.oval.y + LAY.oval.ry}`, 1, { extra: ' stroke-dasharray="6 4"', opacity: 0.7 * (st.seam ?? 1) })
    }
    else sitter = sitterSvg(ctx, spec.sitter, st.face ?? {})
    body += portraitSvg(ctx, spec, now, { ...(st.portrait ?? {}), sitter, flying: spec.sitter === 'split', id: st.portrait?.tone < 1 ? `-${k}` : '' })
    // The vignette.
    const vig = spec.vignette
    if (vig === 'bottle') body += part('vignette', bottleVignette(ctx, spec, now, { ...(st.vig ?? {}), id: k }))
    else if (vig === 'three') body += threeVignette(ctx)
    else if (vig === 'guitar') body += guitarVignette(ctx)
    else if (vig === 'watermark') body += watermarkSvg(ctx, now, st.light ?? 0)
    else if (vig === 'bottleGlobe') {
      body += part('globe', globeSvg(ctx, LAY.vig.cx, 478, 64, now, { split: st.split ?? 0 }))
      body += part('vignette', bottleVignette(ctx, spec, now, { sky: 1, ship: 0, sea: 0, pull: 1, ...(st.vig ?? {}), bottleAt: BOTTLE_HIM, id: k }))
    }
    if (st.extra) body += st.extra
    if (print < 1) {
      const id = `${u}-pr${k}`
      ctx.local.push(clipRect(id, -4, -4, (NW + 8) * print, NH + 8))
      body = `<g clip-path="url(#${id})">${body}</g>${pen(`M${r((NW + 8) * print - 4)} 6V${NH - 6}`, 3, { stroke: GREEN, opacity: 0.6 * Math.sin(print * Math.PI) })}`
    }
  }
  // The plate mark every note has, printed or not, and the crop marks in the gutter.
  const marks = `${pen(rectD(-3, -3, NW + 6, NH + 6), 1.2, { stroke: PAPER_SHADE })}${pen(`M-24 0H-8M0 -24V-8M${NW + 8} 0H${NW + 24}M${NW} -24V-8M-24 ${NH}H-8M0 ${NH + 8}V${NH + 24}M${NW + 8} ${NH}H${NW + 24}M${NW} ${NH + 8}V${NH + 24}`, 0.9)}`
  return `<g id="${u}-n${k}" transform="translate(${S(k, 0)} ${NY})">${marks}${body}</g>`
}

/* ══ THE RED SERIAL ═══════════════════════════════════════════════════ */

const SER = { size: 28, tracking: 4, cell: 21 }

/** An odometer: `v` a (possibly fractional) number; `spin` extra full turns per wheel. */
function serialSvg(ctx, id, x, y, v, spin = [0, 0, 0, 0], o = {}) {
  const { size, tracking, cell } = SER
  const prefix = 'HG'
  const pw = advance(prefix + ' ', size, tracking)
  const total = pw + cell * 4
  const x0 = x - total / 2
  const h = size * 1.2
  let wheels = ''
  let clip = ''
  for (let i = 0; i < 4; i++) {
    const place = 3 - i
    const base = Math.floor(v / 10 ** place) % 10
    const lower = v % 10 ** place
    const carry = place === 0 ? v % 1 : clamp01(lower - (10 ** place - 1))
    const p = base + carry + 10 * (spin[i] ?? 0)
    const d0 = ((Math.floor(p) % 10) + 10) % 10
    const f = p - Math.floor(p)
    const wx = x0 + pw + cell * (i + 0.5)
    clip += `<rect x="${r(wx - cell / 2)}" y="${r(y - size * 0.9)}" width="${cell}" height="${r(h)}"/>`
    wheels += text({ x: wx, y: y - f * h, size, text: String(d0), fill: RED, anchor: 'middle', weight: 600 })
    if (f > 0.001) wheels += text({ x: wx, y: y + (1 - f) * h, size, text: String((d0 + 1) % 10), fill: RED, anchor: 'middle', weight: 600 })
  }
  const cid = `${ctx.uid}-sc-${id}`
  ctx.local.push(`<clipPath id="${cid}">${clip}</clipPath>`)
  let out = `<g${op(o.opacity ?? 1)}>${text({ x: x0, y, size, text: prefix, fill: RED, weight: 600, tracking })}<g clip-path="url(#${cid})">${wheels}</g></g>`
  if (o.shadow > 0) {
    // In the shadows: the engraving's darks hatched through the figures themselves.
    const hid = `${ctx.uid}-sh-${id}`
    ctx.local.push(`<clipPath id="${hid}">${stamped(x, y, Math.round(v))}</clipPath>`)
    out += `<rect x="${r(x0 - 6)}" y="${r(y - size)}" width="${r(total + 12)}" height="${r(size * 1.35)}" fill="url(#${ctx.uid}-dk)" clip-path="url(#${hid})"${op(o.shadow)}/>`
    out = `<g${op(1 - 0.35 * o.shadow)}>${out}</g>`
  }
  return out
}
const stamped = (x, y, year) => {
  const { size, tracking, cell } = SER
  const pw = advance('HG ', size, tracking)
  const x0 = x - (pw + cell * 4) / 2
  return text({ x: x0, y, size, text: 'HG', fill: RED, weight: 600, tracking }) + String(year).split('').map((d, i) => text({ x: x0 + pw + cell * (i + 0.5), y, size, text: d, fill: RED, anchor: 'middle', weight: 600 })).join('')
}

/* ══ THE PLAN — times, the sheet and the camera, solved once per score ═══ */

const PLANS = new WeakMap()
function planFor(score) {
  if (!PLANS.has(score)) PLANS.set(score, buildPlan(score))
  return PLANS.get(score)
}

const RUN_SPEED = 1150
const DT = 0.005

function buildPlan(score) {
  const inSec = (sid) => score.lines.filter((l) => l.section === sid)
  const sec = (sid) => {
    const s = score.sections.find((x) => x.id === sid)
    if (!s) throw new Error(`engraving: no section ${sid}`)
    return s
  }
  const wt = (line, re, nth = 0) => {
    const found = line?.words.filter((w) => re.test(w.text))
    if (!found?.length) throw new Error(`engraving: no word ${re} in "${line?.text}"`)
    return found[Math.min(nth, found.length - 1)].t
  }
  const BEAT = 60 / (score.bpm ?? 87.5)
  const PH = score.beatPhase ?? 0
  const beatAt = (t) => (t - PH) / BEAT
  const nextBeat = (t) => PH + Math.ceil(beatAt(t) - 1e-6) * BEAT
  const nextEighth = (t) => PH + (Math.ceil(beatAt(t) * 2 - 1e-6) * BEAT) / 2

  const v1 = inSec('verse-1')
  const v2 = inSec('verse-2')
  const c1 = inSec('chorus-1')
  const v3 = inSec('verse-3')
  const c2 = inSec('chorus-2')
  const v4 = inSec('verse-4')
  const c3 = inSec('chorus-3')
  const T = {
    l1: v1[0].start, conman: wt(v1[0], /^conman/), shake: wt(v1[0], /^shake/),
    l2: v1[1].start, rhythms: wt(v1[1], /^rhythms/), y1968: wt(v1[1], /^1968/), they: wt(v1[1], /^they/),
    l3: v1[2].start, bottled: wt(v1[2], /^Bottled/), lightning: wt(v1[2], /^lightning/), several: wt(v1[2], /^several/), steady: wt(v1[2], /^steady/), notes: wt(v1[2], /^notes/),
    l4: v1[3].start, pulled: wt(v1[3], /^pulled/), clouds: wt(v1[3], /^clouds/), sea: wt(v1[3], /^sea/), clear: wt(v1[3], /^clear/), sky: wt(v1[3], /^sky/), smoke: wt(v1[3], /^smoke/), know: wt(v1[3], /^know/),
    v2: v2[0].start, look: wt(v2[0], /^look/),
    l6: v2[1].start, killing: wt(v2[1], /^killing/), moving: wt(v2[1], /^moving/), fast: wt(v2[1], /^fast/), cooking: wt(v2[1], /^cooking/), books: wt(v2[1], /^books/),
    l7: v2[2].start, earth: wt(v2[2], /^Earth/), shook: wt(v2[2], /^shook/), y2025: wt(v2[2], /^2025/),
    l8: v2[3].start, searching: wt(v2[3], /^searching/), finally: wt(v2[3], /^finally/), realized: wt(v2[3], /^realized/),
    c1a: c1[0].start, change1: c1[0].end, c1b: c1[1].start, same1: c1[1].end,
    v3: v3[0].start, steal: wt(v3[0], /^steal/), sound: wt(v3[0], /^sound/),
    l12: v3[1].start, stick: wt(v3[1], /^stick/), shadows: wt(v3[1], /^shadows/), follow: wt(v3[1], /^follow/), around: wt(v3[1], /^around/),
    l13: v3[2].start, see: wt(v3[2], /^see/), pretend: wt(v3[2], /^pretend/), stare: wt(v3[2], /^stare/),
    l14: v3[3].start, pray: wt(v3[3], /^pray/), god: wt(v3[3], /^God/), remain: wt(v3[3], /^remain/), unaware: wt(v3[3], /^unaware/), thatI: v3[3].end,
    c2a: c2[0].start, c2b: c2[1].start,
    brk: sec('break').from, brkTo: sec('break').to,
    v4: v4[0].start, move: wt(v4[0], /^move/),
    l18: v4[1].start, watch: wt(v4[1], /^Watch/), split: wt(v4[1], /^split/), ground: wt(v4[1], /^ground/), pierce: wt(v4[1], /^pierce/), sky2: wt(v4[1], /^sky/), find: wt(v4[1], /^find/), groove: wt(v4[1], /^groove/),
    l19: v4[2].start, damage: wt(v4[2], /^damage/), wake: wt(v4[2], /^wake/),
    l20: v4[3].start, handle: wt(v4[3], /^handle/), eyes: wt(v4[3], /^eyes/), sake: wt(v4[3], /^sake/),
    c3: c3.map((l) => l.start),
    end: score.endCardAt ?? score.duration,
  }
  const chorusLines = [...c1, ...c2, ...c3]

  /* ── The camera's x: a drift, plus moves and runs, integrated ──────────── */
  const drift = (t) => 14 - 9 * smooth(ramp(t, 34, 36)) + 15 * smooth(ramp(t, 44, 48)) - 13 * smooth(ramp(t, 139.5, 142)) * (1 - smooth(ramp(t, 170.5, 172.5)))
  const N = Math.ceil((score.duration + 2) / DT)
  const driftTab = new Float64Array(N + 1)
  for (let i = 1; i <= N; i++) driftTab[i] = driftTab[i - 1] + drift((i - 0.5) * DT) * DT
  const driftInt = (a, b) => {
    const f = (t) => { const q = Math.max(0, t) / DT; const i = Math.min(N - 1, Math.floor(q)); return lerp(driftTab[i], driftTab[i + 1], q - i) }
    return f(b) - f(a)
  }
  const segs = []
  let xPrev = S(0, 220)
  let tPrev = 0
  const move = (t, x, a, b = t) => { segs.push({ kind: 'move', a, b, D: x - xPrev - driftInt(tPrev, t) }); xPrev = x; tPrev = t }
  const run = (t, x, a, ru, rd, b = t) => {
    const D = x - xPrev - driftInt(tPrev, t)
    const area = b - a - ru / 2 - rd / 2
    segs.push({ kind: 'run', a, b, ru, rd, v: D / area })
    xPrev = x
    tPrev = t
  }
  /** The slot a run should end on so that it runs at about RUN_SPEED. */
  const runSlot = (t, lx, a, ru, rd, b = t) => {
    const area = b - a - ru / 2 - rd / 2
    const want = xPrev + driftInt(tPrev, t) + RUN_SPEED * area
    return Math.round((want - lx) / PITCH)
  }

  move(T.l1 - 0.2, S(0, 640), 9, T.l1 - 0.2)
  move(T.l2 + 0.3, S(0, 720), T.l2 - 1.2)
  move(T.bottled + 0.25, S(0, 1150), T.they - 0.2)
  move(T.v2 - 0.15, S(1, 690), 49.2)
  const HIS = 5
  run(T.earth - 0.1, S(HIS, 250), T.l6 - 0.5, 1.0, 1.3)
  const J = runSlot(T.v3 - 0.35, 640, T.realized + 0.3, 1.5, 1.8)
  run(T.v3 - 0.35, S(J, 640), T.realized + 0.3, 1.5, 1.8)
  move(T.l12 + 0.5, S(J + 1, 520), T.sound + 0.25)
  move(T.see, S(J + 2, 700), T.around - 0.25)
  move(T.pray - 0.1, S(J + 2, 1140), T.stare + 0.3)
  const H = runSlot(141.8, 560, T.thatI + 0.1, 1.2, 2.4)
  run(141.8, S(H, 560), T.thatI + 0.1, 1.2, 2.4)
  move(T.l19 + 2.6, S(H + 1, 380), T.l19 - 0.1)
  const endAt = sec('outro').from + 0.4
  const F = runSlot(endAt, 700, T.l20 + 4.5, 1.6, 3.2)
  run(endAt, S(F, 700), T.l20 + 4.5, 1.6, 3.2)

  const segSpeed = (s, t) => {
    if (t <= s.a || t >= s.b) return 0
    if (s.kind === 'move') return (s.D / (s.b - s.a)) * (Math.PI / 2) * Math.sin(Math.PI * ((t - s.a) / (s.b - s.a)))
    return s.v * smooth((t - s.a) / s.ru) * (1 - smooth((t - (s.b - s.rd)) / s.rd))
  }
  const speed = (t) => segs.reduce((v, s) => v + segSpeed(s, t), drift(t))
  const camTab = new Float64Array(N + 1)
  camTab[0] = S(0, 220)
  for (let i = 1; i <= N; i++) camTab[i] = camTab[i - 1] + speed((i - 0.5) * DT) * DT
  const camX = (t) => { const q = Math.max(0, t) / DT; const i = Math.min(N - 1, Math.floor(q)); return lerp(camTab[i], camTab[i + 1], q - i) }

  /* ── Zoom and height: keys, eased between, held at them ────────────────── */
  const Y = (ly) => NY + ly
  const zKeys = [
    [0, 1.85], [6, 1.85], [21.5, 1.45], [T.l2 - 1.1, 1.45], [T.l2 + 0.4, 1.0], [T.they - 0.2, 1.0], [T.bottled + 0.25, 1.45],
    [T.l4 - 0.9, 1.45], [T.l4 + 0.4, 1.3], [T.know + 0.6, 1.3], [T.know + 2.6, 0.95], [49.2, 0.95], [T.v2 - 0.15, 1.35],
    [T.l6 - 0.6, 1.35], [T.l6 + 0.7, 0.74], [T.earth - 1.2, 0.74], [T.earth - 0.1, 1.0], [T.l8 - 0.9, 1.0], [T.l8 + 0.6, 1.7],
    [T.realized + 0.1, 1.7], [T.realized + 2.0, 0.72],
    [T.change1 + 0.6, 0.72], [T.change1 + 2.0, 0.86], [T.c1b - 1.4, 0.86], [T.c1b - 0.1, 0.72],
    [T.v3 - 2.0, 0.72], [T.v3 - 0.35, 1.3], [T.sound + 0.25, 1.3], [T.l12 + 0.5, 1.05], [T.around + 0.05, 1.05], [T.see, 1.22],
    [T.stare + 0.3, 1.22], [T.pray - 0.1, 1.32], [T.unaware + 0.4, 1.32], [T.c2a + 0.5, 0.72],
    [T.c2a + 5.2, 0.72], [T.c2a + 6.6, 0.86], [T.c2b - 1.4, 0.86], [T.c2b - 0.1, 0.72],
    [139.6, 0.72], [141.8, 0.95], [164.6, 1.18], [T.v4 + 0.4, 1.45], [T.move + 0.9, 1.45], [T.watch - 0.1, 1.0],
    [T.groove + 1.2, 1.0], [T.l19 + 2.6, 0.9], [T.l20, 0.9], [T.l20 + 1.4, 0.84], [T.c3[0] - 0.3, 0.84], [T.c3[0] + 0.9, 0.72],
    [endAt - 2.8, 0.72], [endAt, 0.92], [T.end, 0.98],
  ]
  const yKeys = [
    [0, Y(300)], [21.5, Y(296)], [T.l1 - 0.2, Y(290)], [T.l2 + 0.4, Y(300)], [T.bottled + 0.25, Y(320)], [T.l4 - 0.9, Y(320)],
    [T.l4 + 0.4, Y(250)], [T.know + 0.6, Y(250)], [T.know + 2.6, Y(300)], [T.v2 - 0.15, Y(290)], [T.l6 + 0.7, Y(300)],
    [T.l8 - 0.9, Y(300)], [T.l8 + 0.6, Y(286)], [T.v3 - 0.35, Y(290)], [T.l12 + 0.5, Y(310)], [T.see, Y(292)], [T.pray - 0.1, Y(300)],
    [141.8, Y(300)], [164.6, Y(292)], [T.v4 + 0.4, Y(288)], [T.move + 0.9, Y(288)], [T.watch - 0.1, Y(300)], [T.end, Y(300)],
  ]
  // In the band between chorus lines the camera slips half a row up or down the sheet and back.
  let side = 1
  for (const [i, line] of chorusLines.entries()) {
    const next = chorusLines[i + 1]
    if (!next || next.section !== line.section) continue
    yKeys.push([line.end + 0.7, Y(300)], [line.end + 2.3, Y(300 + side * ROW * 0.5)], [next.start - 1.5, Y(300 + side * ROW * 0.5)], [next.start - 0.15, Y(300)])
    side = -side
  }
  yKeys.sort((a, b) => a[0] - b[0])
  const keyed = (keys) => (t) => {
    if (t <= keys[0][0]) return keys[0][1]
    for (let i = 0; i < keys.length - 1; i++) {
      const [ta, va] = keys[i]
      const [tb, vb] = keys[i + 1]
      if (t <= tb) return tb <= ta ? vb : lerp(va, vb, easeCamera((t - ta) / (tb - ta)))
    }
    return keys[keys.length - 1][1]
  }
  const zoom = keyed(zKeys)
  const camY = keyed(yKeys)

  /* ── The sheet: what is printed on each slot ──────────────────────────── */
  const base = { sitter: 'none', rosette: 'classic', vignette: 'bottle', num: '1', word: 'One', micro: 'Don’t be fooled by the way I shake', microRing: 'MCMLXVIII · '.repeat(7) }
  const note = (o) => ({ ...base, caption: roman(o.year), ...o })
  const SLOTS = []
  SLOTS[0] = note({ kind: 'A', year: 1968, sitter: 'mane' })
  const REPRINTS = [[1971, 'shag', '5', 'Five'], [1977, 'feather', '20', 'Twenty'], [1986, 'big', '100', 'One hundred'], [1994, 'grunge', '1000', 'One thousand']]
  REPRINTS.forEach(([year, sitter, num, word], i) => { SLOTS[1 + i] = note({ kind: 'reprint', year, sitter, num, word, micro: 'Don’t be fooled by the way I look' }) })
  const his = note({ kind: 'his', year: 2025, micro: 'No matter what I do, I always sound the same' })
  for (let k = HIS; k < J; k++) SLOTS[k] = his
  SLOTS[J] = note({ kind: 'J', year: 2025, caption: 'III', sitter: 'straight', rosette: 'pepper', vignette: 'three', num: '3', word: 'Three', micro: 'I’m here to steal your sound' })
  SLOTS[J + 1] = note({ kind: 'M', year: 2025, caption: 'XII', sitter: 'short', rosette: 'watch', vignette: 'guitar', num: '12', word: 'Twelve', micro: 'I stick to the shadows' })
  SLOTS[J + 2] = note({ kind: 'T', year: 2025, caption: 'L', sitter: 'wavy', rosette: 'globe', vignette: 'watermark', num: '50', word: 'Fifty', micro: 'When you see me I pretend not to stare' })
  for (let k = J + 3; k < H; k++) SLOTS[k] = his
  const him = note({ kind: 'him', year: 2025, sitter: 'split', rosette: 'pepwatch', vignette: 'bottleGlobe', micro: 'Don’t be fooled by the way I move' })
  SLOTS[H] = him
  const himRecord = { ...him, kind: 'copy', rosette: 'record' }
  const FUTURE_FROM = (() => {
    // The notes stop being his halfway through the last chorus: from the first
    // one the press reaches after "No matter where I go" comes round the third time.
    const t = T.c3[2] - 2.2
    const x = camX(t) + 766 / zoom(t)
    return Math.ceil((x - 0) / PITCH)
  })()
  const FUTURE = ['bun', 'curls', 'cap', 'braids', 'wavy', 'short']
  for (let k = H + 1; k <= F + 1; k++) {
    if (k < FUTURE_FROM) SLOTS[k] = himRecord
    else {
      const i = k - FUTURE_FROM
      const n = F - FUTURE_FROM
      const year = k >= F ? 2068 : Math.round(lerp(2031, 2064, n > 0 ? i / n : 1))
      SLOTS[k] = note({ ...himRecord, kind: 'future', year, caption: roman(year), sitter: FUTURE[i % FUTURE.length], micro: 'No matter where I go, I never seem to change' })
    }
  }

  /* ── When each note is printed: as it comes in on the right, on a beat ── */
  const printAt = new Float64Array(SLOTS.length).fill(Infinity)
  {
    let k = 1
    for (let t = 0; t < score.duration && k < SLOTS.length; t += 0.02) {
      while (k < SLOTS.length && (k === H || S(k, 0) < camX(t) + 766 / zoom(t) - 90)) {
        if (k !== H) printAt[k] = nextEighth(t)
        k++
      }
    }
  }
  printAt[0] = -Infinity

  /* ── The composite, piece by piece, one a bar through the break ───────── */
  const bar0 = nextBeat(T.brk + 1.2)
  const bars = Array.from({ length: 9 }, (_, i) => bar0 + i * 4 * BEAT)
  const PIECES = [
    { name: 'frame', at: bars[0], from: null },
    { name: 'rosette', at: bars[1], from: 'III' },
    { name: 'hands', at: bars[2], from: 'XII' },
    { name: 'sitterL', at: bars[3], from: 'MCMLXVIII' },
    { name: 'sitterR', at: bars[4], from: 'III' },
    { name: 'vignette', at: bars[5], from: 'MCMLXVIII' },
    { name: 'globe', at: bars[6], from: 'L' },
    { name: 'caption', at: bars[7], from: null },
  ]

  /* ── The red serial: where it is, and what it reads ──────────────────── */
  const stops = []
  const boxA = (k) => [S(k, LAY.boxA.x), Y(LAY.boxA.y)]
  const boxB = (k) => [S(k, LAY.boxB.x), Y(LAY.boxB.y)]
  const stop = (t, [x, y], o = {}) => stops.push({ t, x, y, dur: o.dur ?? 0.55, shadow: o.shadow ?? 0, leave: o.leave ?? null, slot: o.slot ?? null })
  stop(-1, [S(0, -260), Y(LAY.boxA.y)])
  stop(T.conman, boxA(0), { dur: 1.1, slot: 0 })
  // It hops to each note just after the press does — but it does not leave the 1968 note until the verse about it is over.
  const hopAt = (k) => (k === 1 ? Math.max(printAt[1] + 0.3, T.know + 1.6) : printAt[k] + 0.3)
  const hopPrinted = (k0, k1) => {
    for (let k = k0; k < k1; k++) if (Number.isFinite(printAt[k])) stop(hopAt(k), boxA(k), { slot: k, dur: k === 1 ? 1.0 : 0.5 })
  }
  hopPrinted(1, J)
  stop(T.steal, boxA(J), { dur: 0.7, slot: J })
  stop(T.stick + 0.1, [S(J, 1240), Y(588)], { dur: 1.1, shadow: 1 })
  stop(T.follow + 0.2, [S(J + 1, 330), Y(588)], { dur: 1.6, shadow: 1 })
  stop(T.around + 0.35, [S(J + 1, 1060), Y(588)], { dur: 1.2, shadow: 1 })
  stop(T.see - 0.1, [S(J + 2, 470), Y(474)], { dur: 1.4, shadow: 1 })
  stop(T.pretend + 0.35, [S(J + 2, 930), Y(474)], { dur: 0.9, shadow: 1 })
  stop(T.pray + 0.3, boxB(J + 2), { dur: 0.9, slot: J + 2 })
  hopPrinted(J + 3, H)
  stop(PIECES[7].at, boxA(H), { dur: 1.5, slot: H })
  hopPrinted(H + 1, F + 1)
  stops.sort((a, b) => a.t - b.t)
  for (let i = 1; i < stops.length; i++) stops[i].from = stops[i - 1]

  // What it reads: 0000, then 1968, then each reprint's year, then 2025 — and on to 2068.
  const vKeys = [[0, 0], [T.y1968 - 0.1, 0], [T.y1968 + 1.3, 1968]]
  for (let k = 1; k < HIS; k++) vKeys.push([hopAt(k) - 0.2, vKeys[vKeys.length - 1][1]], [hopAt(k) + 0.5, SLOTS[k].year])
  vKeys.push([T.y2025 - 0.05, SLOTS[HIS - 1].year], [T.y2025 + 1.4, 2025])
  for (let k = FUTURE_FROM; k <= F; k++) if (Number.isFinite(printAt[k])) vKeys.push([hopAt(k) - 0.2, vKeys[vKeys.length - 1][1]], [hopAt(k) + 0.45, SLOTS[k].year])
  vKeys.sort((a, b) => a[0] - b[0])
  const value = (t) => {
    if (t <= vKeys[0][0]) return vKeys[0][1]
    for (let i = 0; i < vKeys.length - 1; i++) {
      const [ta, va] = vKeys[i]
      const [tb, vb] = vKeys[i + 1]
      if (t <= tb) return lerp(va, vb, easeInOut((t - ta) / Math.max(tb - ta, 1e-6)))
    }
    return vKeys[vKeys.length - 1][1]
  }
  // Spins: every chorus word flicks the last wheel round once; the line's last word turns them all.
  const spins = []
  for (const line of chorusLines) {
    line.words.forEach((w, i) => {
      const last = i === line.words.length - 1
      spins.push({ t: w.t, dur: last ? 1.1 : 0.32, turns: last ? [1, 2, 2, 3] : [0, 0, 0, 1] })
    })
  }
  const spinAt = (t) => {
    const out = [0, 0, 0, 0]
    for (const s of spins) {
      if (t < s.t || t > s.t + s.dur) continue
      const u = easeInOut((t - s.t) / s.dur)
      for (let i = 0; i < 4; i++) out[i] += s.turns[i] * u
    }
    return out
  }

  /* ── The rosettes' clock: slow in the verses, fast when the press runs ── */
  const spinSpeed = (t) => {
    let s = 1
    for (const [a, b] of [[T.c1a - 1.5, sec('chorus-1').to], [T.c2a - 1.2, sec('chorus-2').to], [T.c3[0] - 1.2, T.end]]) s += 5 * smooth((t - a) / 1.4) * (1 - smooth((t - b) / 1.6))
    s += 3 * smooth((t - T.sound) / 0.3) * (1 - smooth((t - T.sound - 1.4) / 1.2))
    return s
  }
  const spinTab = new Float64Array(N + 1)
  for (let i = 1; i <= N; i++) spinTab[i] = spinTab[i - 1] + spinSpeed((i - 0.5) * DT) * DT
  const spinClock = (t) => { const q = Math.max(0, t) / DT; const i = Math.min(N - 1, Math.floor(q)); return lerp(spinTab[i], spinTab[i + 1], q - i) }

  return { T, BEAT, PH, beatAt, camX, camY, zoom, speed, SLOTS, printAt, PIECES, stops, value, spinAt, spinClock, HIS, J, H, F, FUTURE_FROM, chorusLines }
}

/* ══ THE SERIAL, AT A TIME ═════════════════════════════════════════════ */

function serialAt(plan, now) {
  const { stops } = plan
  let cur = stops[0]
  for (const s of stops) {
    if (now < s.t - s.dur) break
    cur = s
  }
  if (!cur.from) return { x: cur.x, y: cur.y, shadow: cur.shadow, landed: true, stop: cur }
  const u = easeInOut(ramp(now, cur.t - cur.dur, cur.t))
  const dx = cur.x - cur.from.x
  const lift = Math.sin(u * Math.PI) * Math.min(120, Math.abs(dx) * 0.08)
  return {
    x: lerp(cur.from.x, cur.x, u),
    y: lerp(cur.from.y, cur.y, u) - lift,
    shadow: lerp(cur.from.shadow, cur.shadow, u),
    landed: u >= 1,
    stop: cur,
  }
}

/* ══ THE FRAME ═════════════════════════════════════════════════════════ */

export function engravingFrame({ time, score, lockup = '', uid = 'cm' }) {
  const now = time
  if (score.endCardAt != null && now >= score.endCardAt) return endCard({ now, from: score.endCardAt, lockup })

  const plan = planFor(score)
  const { T, SLOTS, printAt } = plan
  const section = sectionAt(score, now)
  const active = lineAt(score, now)
  const sung = active && now >= active.start - 0.3 && now <= active.end + 1.2 && section.id === active.section

  const cx = plan.camX(now)
  const cy = plan.camY(now)
  const z = plan.zoom(now)
  const half = 766 / z

  const defs = new Map()
  const ctx = {
    uid,
    defs,
    local: [],
    spin: plan.spinClock(now),
    beat: (t) => plan.beatAt(t),
    typeOpacity: sung ? 0.4 : 0.85,
    def: (name) => SHAPES[name](),
  }

  /* ── The world ─────────────────────────────────────────────────────── */
  const world = []
  const kFrom = Math.max(0, Math.floor((cx - half - 60) / PITCH))
  const kTo = Math.min(SLOTS.length - 1, Math.floor((cx + half + 60) / PITCH))
  // The sheet is uncut: the row the camera follows, and the same notes above and below it.
  const vy0 = cy - 333 / z - 20
  const vy1 = cy + 333 / z + 20
  const rows = [-1, 1].filter((row) => NY + row * ROW - 30 < vy1 && NY + row * ROW + NH + 30 > vy0)
  for (let k = kFrom; k <= kTo; k++) {
    const spec = SLOTS[k]
    if (!spec) continue
    world.push(noteSvg(ctx, k, spec, now, noteState(ctx, plan, k, spec, now)))
    for (const row of rows) world.push(`<use href="#${uid}-n${k}" y="${row * ROW}"/>`)
  }

  // The serials he has left behind, and the one still travelling.
  const sr = serialAt(plan, now)
  for (const s of plan.stops) {
    if (s.slot == null || s === sr.stop || now < s.t) continue
    const next = plan.stops[plan.stops.indexOf(s) + 1]
    if (!next || now < next.t - next.dur) continue
    if (s.x < cx - half - 200 || s.x > cx + half + 200) continue
    world.push(stamped(s.x, s.y, s.slot === 0 ? 1968 : SLOTS[s.slot].year))
  }
  world.push(serialSvg(ctx, 'go', sr.x, sr.y, plan.value(now), plan.spinAt(now), { shadow: sr.shadow }))

  // The loupe, searching his rosette.
  world.push(loupe(ctx, plan, now))

  /* ── The quake ─────────────────────────────────────────────────────── */
  let qx = 0
  let qy = 0
  for (const [t0, amp] of [[T.earth, 9], [T.shook, 14]]) {
    const a = now - t0
    if (a < 0 || a > 1.6) continue
    const env = amp * Math.exp(-a / 0.32) * smooth(a / 0.05)
    qx += env * Math.sin(a * 2 * Math.PI * 9.3)
    qy += env * 0.6 * Math.sin(a * 2 * Math.PI * 7.1 + 1.3)
  }

  /* ── The margin ───────────────────────────────────────────────────── */
  let margin = ''
  if (section.kind === 'intro') {
    const o = Math.min(easeOut(ramp(now, 0.6, 1.8)), 1 - easeInOut(ramp(now, section.to - 1.0, section.to - 0.2)))
    margin = titleCard({ title: score.title, track: 2, opacity: o })
  }
  else margin = marginLyric({ now, score, uid })

  const clip = plateClip(uid)
  const view = `translate(${r(CX + qx, 2)} ${r(CY + qy, 2)}) scale(${r(z, 4)}) translate(${r(-cx, 2)} ${r(-cy, 2)})`
  const worldSvg = world.join('')
  const localDefs = ctx.local.filter((s) => s.startsWith('<')).join('')
  return {
    svg: [
      paper(),
      `<defs>${clip.def}${sharedDefs(ctx)}${[...defs.values()].join('')}${localDefs}</defs>`,
      `<g clip-path="${clip.url}">`,
      `<rect x="${PL.x}" y="${PL.y}" width="${PL.w}" height="${PL.h}" fill="${PAPER}"/>`,
      `<g transform="${view}">${worldSvg}</g>`,
      '</g>',
      margin,
    ].join('\n'),
    label: active?.text ?? section.label,
  }
}

/* The static shapes every note shares, built once. */
const SHAPES = {
  star: () => memo('starD', () => starD(LAY.rosette.R * 0.6)),
  pepper: () => memo('pepperD', () => pepperD(LAY.rosette.R * 0.94)),
  pepperLines: () => memo('pepperLinesD', () => pepperLinesD(LAY.rosette.R * 0.94)),
  grooves: () => memo('groovesD', () => groovesD(LAY.rosette.R * 0.4, LAY.rosette.R * 0.97)),
}

/** Patterns, ring paths, clips and masks, in note-local coordinates, once a frame. */
function sharedDefs(ctx) {
  const u = ctx.uid
  const { x, y, rx, ry } = LAY.oval
  const R = LAY.rosette.R
  const rings = RINGS.map((g, i) => `<path id="${u}-ring${i}" d="${memo(`ring${i}`, () => ringD(R * g.f, g.n, g.a))}" pathLength="1"/>`).join('')
  const frame = `<path id="${u}-frame" d="${memo('frameRing', () => ringD(rx + 22, 40, 0.035))}" pathLength="1"/>`
  const dial = `<path id="${u}-dial" d="${memo('dialRing', () => ringD(R * 0.6, 48, 0.035))}"/>`
  const microR = R * 0.37
  return [
    hatchPat(`${u}-ph`, { angle: 0, gap: 4.2, width: 1.0 }),
    hatchPat(`${u}-px`, { angle: 62, gap: 4.6, width: 0.9 }),
    hatchPat(`${u}-coat`, { angle: 38, gap: 3.4, width: 1.15 }),
    hatchPat(`${u}-coat2`, { angle: -42, gap: 3.8, width: 1.0 }),
    hatchPat(`${u}-dk`, { angle: 48, gap: 3.0, width: 1.1 }),
    hatchPat(`${u}-dk2`, { angle: -44, gap: 3.2, width: 1.0 }),
    hatchPat(`${u}-sky`, { angle: 0, gap: 5, width: 0.75, colour: GREEN }),
    hatchPat(`${u}-pep`, { angle: 0, gap: 3.2, width: 1.05, colour: GREEN }),
    hatchPat(`${u}-gl`, { angle: 0, gap: 5, width: 0.9 }),
    hatchPat(`${u}-gd`, { angle: -48, gap: 4.4, width: 0.9 }),
    hatchPat(`${u}-num`, { angle: 0, gap: 4.2, width: 1.3 }),
    braid(`${u}-bh`), braid(`${u}-bv`, { rotate: 90 }), ground(`${u}-gr`),
    rings, frame, dial,
    `<path id="${u}-micro" d="M${-microR} 0a${microR} ${microR} 0 1 1 ${microR * 2} 0a${microR} ${microR} 0 1 1 ${-microR * 2} 0"/>`,
    `<path id="${u}-m1" d="M52 52H${NW - 52}"/><path id="${u}-m2" d="M52 ${NH - 47}H${NW - 52}"/>`,
    `<clipPath id="${u}-oval"><path d="${ellipse(x, y, rx, ry)}"/></clipPath>`,
    `<clipPath id="${u}-vig"><path d="${ellipse(LAY.vig.cx, LAY.vig.cy, LAY.vig.rx, LAY.vig.ry)}"/></clipPath>`,
    clipRect(`${u}-hl`, x - rx - 60, y - ry - 60, HEAD.x - (x - rx - 60), ry * 2 + 120),
    clipRect(`${u}-hr`, HEAD.x, y - ry - 60, x + rx + 60 - HEAD.x, ry * 2 + 120),
    `<radialGradient id="${u}-rimg" cx="0.5" cy="0.5" r="0.5"><stop offset="0.45" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>`,
    `<mask id="${u}-rim" maskUnits="userSpaceOnUse" x="${x - rx - 4}" y="${y - ry - 4}" width="${rx * 2 + 8}" height="${ry * 2 + 8}"><path d="${ellipse(x, y, rx, ry)}" fill="url(#${u}-rimg)"/></mask>`,
  ].join('')
}

/* ══ WHAT EACH NOTE IS DOING NOW ═══════════════════════════════════════ */

function noteState(ctx, plan, k, spec, now) {
  const { T } = plan
  const st = {}
  if (spec.kind === 'A') {
    // The engraving of the 1968 note, through the intro and the first verse.
    st.frameK = easeInOut(ramp(now, 0.3, 3.6))
    st.rosette = {
      draw: {
        rings: RINGS.map((_, i) => easeInOut(ramp(now, 2.8 + i * 1.3, 4.6 + i * 1.3))),
        star: easeInOut(ramp(now, 7.4, 9.4)),
        circles: easeInOut(ramp(now, 8.4, 10)),
        micro: ramp(now, 9.6, 10.6),
        numeral: land(now, 10.4, 0.4),
      },
    }
    st.portrait = { frame: easeInOut(ramp(now, 10.4, 13.2)), tone: easeInOut(ramp(now, 12.6, 17.6)), caption: ramp(now, 19.2, 20.2), word: ramp(now, 10.8, 11.6) }
    const shakeA = now - T.shake + 0.05
    st.face = {
      sway: shakeA > 0 && shakeA < 1.4 ? 4.5 * Math.sin(shakeA * 2 * Math.PI * 3.1) * Math.exp(-shakeA / 0.42) : 0,
    }
    st.vig = {
      frame: easeInOut(ramp(now, 17.5, 20.5)),
      sky: easeInOut(ramp(now, 18.5, 22.5)),
      smoke: easeInOut(ramp(now, 20, 23)),
      wipe: easeInOut(ramp(now, T.clear - 0.1, T.smoke + 0.35)),
      clouds: easeInOut(ramp(now, 20.5, 23.5)),
      pull: easeInOut(ramp(now, T.pulled - 0.05, T.sea + 0.25)),
      ship: ramp(now, T.y1968 - 0.3, T.y1968 + 2.0),
      shipDrift: Math.max(0, now - (T.y1968 + 2.0)) * 3,
      sea: easeInOut(ramp(now, 19, 22)),
      stave: easeInOut(ramp(now, T.bottled - 0.1, T.bottled + 0.9)),
      notes: [land(now, T.several, 0.22), land(now, T.steady, 0.22), land(now, T.notes, 0.22)],
      bottle: easeInOut(ramp(now, T.bottled - 0.05, T.bottled + 0.6)),
      bolt: land(now, T.lightning, 0.2),
    }
    return st
  }
  // Every other note is printed when the press reaches it — except his composite, which is made.
  if (spec.kind !== 'him') st.print = easeInOut(ramp(now, plan.printAt[k] - 0.14, plan.printAt[k] + 0.16))
  if (spec.vignette === 'bottle' || spec.vignette === 'bottleGlobe') st.vig = { smoke: 0, pull: 1, ship: 1, shipDrift: 60 }
  if (spec.vignette === 'bottleGlobe') st.vig = { ship: 0, sky: 1, pull: 1, sea: 0 }
  if (spec.kind === 'copy' || spec.kind === 'future') st.seam = 1
  if (spec.kind === 'reprint' && k === 1) st.face = { eyeOpen: 0.15 + 0.85 * land(now, T.look - 0.05, 0.3) }
  if (spec.kind === 'T') {
    // "When you see me": she glances at him. "I pray to God": the note is held to the light.
    st.face = { look: 2.2 * smooth(ramp(now, T.see - 0.1, T.see + 0.3)) * (1 - smooth(ramp(now, T.stare, T.stare + 0.6))) }
    st.light = smooth(ramp(now, T.pray - 0.2, T.god + 0.4)) * (1 - smooth(ramp(now, T.unaware - 0.1, T.unaware + 0.9)))
  }
  if (spec.kind === 'him') return himState(ctx, plan, k, now, st)
  // His record, turned to look at him on "all the eyes".
  if (spec.rosette === 'record' && k <= plan.H + 3) {
    const e = land(now, T.eyes - 0.05, 0.3) * (1 - smooth(ramp(now, T.sake + 0.3, T.sake + 1.3)))
    if (e > 0.01) st.extra = eyeSvg(ctx, now, e)
  }
  return st
}

/** The break and the last verse, on his note. */
function himState(ctx, plan, k, now, st) {
  const { T, PIECES } = plan
  st.parts = {}
  for (const p of PIECES) {
    const u = easeCamera(ramp(now, p.at - 1.5, p.at))
    const arrived = now >= p.at
    if (p.name === 'frame') {
      st.frameK = easeInOut(ramp(now, p.at - 1.4, p.at + 0.6))
      st.parts.frame = { dx: 0, dy: 0, o: now < p.at - 1.4 ? 0 : 1 }
      continue
    }
    if (p.name === 'caption') continue
    const dx = arrived ? 0 : -1500 * (1 - u)
    const dy = arrived ? 0 : -140 * Math.sin(u * Math.PI)
    st.parts[p.name] = { dx, dy, o: now < p.at - 1.5 ? 0 : smooth((now - (p.at - 1.5)) / 0.3) }
  }
  const cap = PIECES.find((p) => p.name === 'caption').at
  st.portrait = { frame: easeInOut(ramp(now, PIECES[0].at - 0.6, PIECES[0].at + 1.2)), tone: easeInOut(ramp(now, PIECES[0].at, PIECES[0].at + 1.6)), caption: land(now, cap, 0.4), word: land(now, cap, 0.4) }
  st.seam = st.parts.sitterR.o
  st.rosette = { kind: 'pepper', bare: true }
  st.hands = true
  // "the way I move": he sways, a bar a swing.
  const mv = smooth(ramp(now, T.v4 - 0.3, T.v4 + 0.6)) * (1 - smooth(ramp(now, T.move + 1.2, T.move + 2.4)))
  st.face = { sway: mv * 3.2 * Math.sin(((now - T.v4) / (plan.BEAT * 2)) * Math.PI) }
  // "Watch me": the cork; "split the ground", "pierce the sky": the bolt; "find a groove": the record.
  st.vig = {
    ship: 0, sky: 1, pull: 1, sea: 0,
    cork: 1 - ramp(now, T.watch + 0.2, T.watch + 0.9),
    corkLift: 160 * easeOut(ramp(now, T.watch - 0.05, T.watch + 0.8)),
  }
  st.split = land(now, T.ground, 0.35)
  st.record = land(now, T.groove - 0.1, 0.5)
  st.extra = unleashed(ctx, plan, now)
  // The source labels, flying in with each piece.
  for (const p of PIECES) {
    if (!p.from) continue
    const part = st.parts[p.name]
    const o = part.o * (1 - ramp(now, p.at, p.at + 0.9))
    if (o <= 0.01) continue
    const anchor = p.name === 'rosette' || p.name === 'hands' ? [LAY.rosette.x, 470] : p.name === 'vignette' || p.name === 'globe' ? [LAY.vig.cx, 575] : [LAY.oval.x, 470]
    st.extra += text({ x: anchor[0] + part.dx, y: anchor[1] + part.dy, size: 15, text: `from ${p.from}`, fill: GREEN, anchor: 'middle', weight: 600, tracking: 4, upper: true, opacity: o })
  }
  return st
}

/** The lightning out of the bottle: down through the globe, up through the sky. */
function unleashed(ctx, plan, now) {
  const { T } = plan
  const down = easeOut(ramp(now, T.split - 0.05, T.ground + 0.1))
  const up = easeOut(ramp(now, T.pierce - 0.05, T.sky2 + 0.1))
  if (down <= 0 && up <= 0) return ''
  const x = BOTTLE_HIM.x
  const foot = BOTTLE_HIM.top + 440 * BOTTLE_HIM.s
  const neck = BOTTLE_HIM.top
  const pathDown = memo('bolt-down', () => {
    const rand = seq(172)
    const pts = [[x - 10, foot - 30]]
    let px = x - 10
    for (let y = foot - 30; y < 600; y += 22) { px += (rand() - 0.5) * 40; pts.push([px, y + 22]) }
    pts.push([LAY.vig.cx + 4, 640])
    return 'M' + pts.map(([a, b]) => P(a, b)).join('L')
  })
  const pathUp = memo('bolt-up', () => {
    const rand = seq(173)
    const pts = [[x, neck + 10]]
    let px = x
    for (let y = neck + 10; y > -40; y -= 24) { px += (rand() - 0.5) * 50; pts.push([px, y - 24]) }
    return 'M' + pts.map(([a, b]) => P(a, b)).join('L')
  })
  const bolt = (d, k) => (k > 0 ? drawn(d, 14, k) + drawn(d, 8, k, { stroke: PAPER }) : '')
  return bolt(pathDown, down) + bolt(pathUp, up)
}

/** A record turned into an eye: lids round it and a pupil looking back at him. */
function eyeSvg(ctx, now, k) {
  const { x, y, R } = LAY.rosette
  const w = R * 1.42
  const h = R * 1.05 * k
  const lids = `M${P(x - w, y)}Q${P(x, y - h * 1.35)} ${P(x + w, y)}Q${P(x, y + h * 1.35)} ${P(x - w, y)}Z`
  let lashes = ''
  for (let i = 1; i < 10; i++) {
    const u = i / 10
    const px = lerp(x - w, x + w, u)
    const py = y - 2 * u * (1 - u) * h * 1.35 * 2
    const a = -Math.PI / 2 + (u - 0.5) * 1.6
    lashes += `M${P(px, py)}L${P(px + Math.cos(a) * 16, py + Math.sin(a) * 16)}`
  }
  const look = -0.35 * R
  return `<g${op(k)}>${pen(lids, 3.2)}${pen(lashes, 1.6)}${fillD(circ(x + look, y, R * 0.3), INK)}${fillD(circ(x + look + 9, y - 10, 7), PAPER)}</g>`
}

/** The loupe over his rosette, while he is searching. */
function loupe(ctx, plan, now) {
  const { T, HIS, SLOTS } = plan
  const k = smooth(ramp(now, T.searching - 0.6, T.searching)) * (1 - smooth(ramp(now, T.realized + 1.2, T.realized + 2.0)))
  if (k <= 0.002) return ''
  const R = LAY.rosette.R
  // Round the rosette, then settle on the microprint at twelve o'clock.
  const a = lerp(-3.9, -Math.PI / 2, easeInOut(ramp(now, T.searching - 0.5, T.realized)))
  const rad = lerp(R * 0.62, R * 0.37, easeInOut(ramp(now, T.finally - 0.8, T.realized)))
  const lx = LAY.rosette.x + Math.cos(a) * rad
  const ly = LAY.rosette.y + Math.sin(a) * rad
  const LR = 92
  const mag = 2.6
  const u = ctx.uid
  const id = `${u}-loupe`
  ctx.local.push(`<clipPath id="${id}"><path d="${circ(lx, ly, LR)}"/></clipPath>`)
  const inner = rosetteSvg(ctx, SLOTS[HIS], now, {})
  const wx = S(HIS, 0)
  return `<g transform="translate(${wx} ${NY})"${op(k)}><g clip-path="url(#${id})">${fillD(circ(lx, ly, LR), PAPER)}<g transform="translate(${r(lx)} ${r(ly)}) scale(${mag}) translate(${r(-lx)} ${r(-ly)})">${inner}</g></g>${pen(circ(lx, ly, LR + 5), 10)}${pen(circ(lx, ly, LR + 11), 1.2)}${pen(`M${P(lx - LR * 0.55, ly - LR * 0.62)}A${LR * 0.85} ${LR * 0.85} 0 0 1 ${P(lx + LR * 0.2, ly - LR * 0.82)}`, 3, { stroke: PAPER, opacity: 0.8 })}</g>`
}

/* For tools: the camera, so a script can measure it for smoothness. */
export const engravingCamera = (score, now) => {
  const p = planFor(score)
  return { x: p.camX(now), y: p.camY(now), z: p.zoom(now), speed: p.speed(now) }
}
export const engravingPlan = (score) => planFor(score)
