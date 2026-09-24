/*
 * Etching — "Ivory" as a hand-coloured naturalist's plate that moves like the chart.
 *
 * Track 4 of the album (app/config/albumStyle.ts). The song is the moment you
 * see somebody and cannot speak for how electric they make you feel — and
 * because you cannot speak, you do not act, and the chance goes. So the film is
 * a naturalist's plate that tries to catalogue a woman by the only things he can
 * name, the things she is compared to, and cannot catalogue her.
 *
 * THREE RULES THE WHOLE FILM IS BUILT ON
 *
 *   - She is never inked. Ivory is the colour of the paper, so she is the one
 *     thing on the plate the etcher leaves bare: a shape wiped clean to the
 *     album's paper, a shade lighter than the plate tone, seen only because of
 *     the hatching laid around her. She is a hint at the shore, in a spotlight,
 *     in a lens, under the stars — and only on "she looked straight back at me"
 *     is the hatching round her dense enough that she is plainly there,
 *     looking out.
 *   - Red is the journey, and the journey is his eye: one red thread, pulled by
 *     an etching needle from pin to pin, reaching each specimen on its noun.
 *     Every "Ivory" it reaches for her pin, and every time it stops a finger's
 *     width short and hangs. In the bridge, where he forgets how to breathe, it
 *     does not even reach. It is the only journey on the album that does not
 *     arrive.
 *   - The acid bites when she does something. On "sings", on "stop and stare",
 *     on "looked straight back at me", on "forgot how to breathe", the plate is
 *     bitten deeper: lines go heavier, light crackles out of the dark in paper,
 *     and the blue floods.
 *
 * THE PLATE, LEFT TO RIGHT
 *
 *   Intro       The border rules and the horizon are scratched in; the thread
 *               comes in from the left.
 *   Verse 1     fig. 1: a shore at dawn. The hatching sweeps across and leaves
 *               a woman standing on the beach, far off, in bare paper. The sun
 *               rises; a wave rolls in and breaks on "shore".
 *   Her eyes    fig. 2, open ocean: the swell etched row by row. fig. 3, the
 *               butterfly: its wings open on "wings", with eyespots for eyes.
 *               fig. 4, on stage: the curtains part, a spotlight comes on and she
 *               is in it; on "sings" light cracks out of her across the dark.
 *   California  fig. 5, a Monterey cypress on a cliff over the Pacific. fig. 6,
 *               a mockingbird, which sings on "Tennessee". fig. 7, a drawer of
 *               pinned specimens with one slot empty; a lens goes over it on
 *               "mystery" and finds only the bare shape of her.
 *   Verse 2     fig. 8, a portrait medallion: a profile with no face, only the
 *               hatching round the back of her head and the flowers in her hair.
 *               fig. 9, the universe at night, an orrery wheeling, and she is
 *               standing under it; on "stop" the planets stop, the camera nearly
 *               stops, and on "stare" every star points at her.
 *   Her name    fig. 10, a stage seen from the crowd: her spotlight, and an empty
 *               one beside it on "beside". fig. 11: the plate at its darkest, and
 *               she looks straight out of it — two blue eyes, and the light
 *               crackling round her.
 *   Paradise    fig. 12, a keyboard of ebony and ivory whose lid lifts on
 *               "paradise" to show a paradise painted inside it; the keys play.
 *               fig. 13, a locket: the thread pins the heart on "heartache", and
 *               the locket shuts on "just for me" with her inside it.
 *   Interlude   A long pan along a border of wild flowers growing, a small blue
 *               butterfly flitting ahead, into the tree of Eden.
 *   Bridge      fig. 14: Eve, in paper, holding out the apple to the empty place
 *               beside the tree. On "forgot how to breathe" the plate floods with
 *               blue; the bubbles rise and stop. When it drains, she is gone and
 *               the apple lies where he should have been standing.
 *   Alaska      fig. 15, the sun going down over the Pacific; fig. 16, the
 *               mockingbird flying; fig. 17, a spruce forest in snowfall, and she
 *               walks away up the path into the trees, her footprints behind her.
 *               fig. 18, the keyboard again, in the snow, playing for nobody.
 *   Ivory       The specimen case: everything the thread pinned, and one empty
 *               pin with a blank label. The thread reaches for it and stops; the
 *               blue butterfly comes off its pin and flies out of the plate.
 *
 * THE PRINT
 *
 *   - Plate tone (#e3d8c1) over the album paper, with wiping marks; the etched
 *     line in the album ink; one blue laid on as a soft wash, under the line;
 *     her in the album paper, over the line; the red thread over everything.
 *   - Tone is built the way an etcher builds it: layers of parallel lines at
 *     different angles, each laid only where the tone passes its threshold
 *     (`hatchD`). Every field is computed once and translated by the camera.
 *   - No filters anywhere. The wash is a radial gradient in a wobbly blob.
 *
 * THE MOTION is the album's (ALBUM_MOTION): a drift that never stops plus
 * half-cosine moves between figures, every figure placed where the camera will
 * be on its word (`X(t, sx)`), everything that arrives on a word eased in and
 * left there. `etchingFrame({ time, score })` is a pure function of the clock.
 */

import { t as text, r, clamp01, easeOut, easeInOut, ramp, lerp } from '../kit.mjs'
import { sectionAt, lineAt } from '../score.mjs'
import { endCard } from '../ending.mjs'
import { PAPER, INK, RED, SECOND_INK, SHEET, paper, plateClip, marginLyric, titleCard, land, easeCamera } from '../album.mjs'

export const BLUE = SECOND_INK.ivory
/** Plate tone: the film of ink an etcher leaves wiped across the plate. */
export const PLATE_TONE = '#e3d8c1'
const WIPE = '#d9cdb3'

export const ETCHING = {
  id: 'album-ivory',
  name: 'Etching',
  accent: RED,
  palette: { PAPER, INK, RED, BLUE, PLATE_TONE },
}

const PL = SHEET.plate
const TOP = PL.y
const BOTTOM = PL.y + PL.h
/** The drift, units a second. */
const DRIFT = 24

/* ══ SMALL THINGS ══════════════════════════════════════════════════════ */

const P = (x, y) => `${r(x)} ${r(y)}`
const smooth = (u) => {
  const x = clamp01(u)
  return x * x * (3 - 2 * x)
}
const op = (o) => (o < 0.999 ? ` opacity="${r(Math.max(0, o), 3)}"` : '')
const g = (inner, attrs = '') => (inner ? `<g${attrs ? ` ${attrs}` : ''}>${inner}</g>` : '')
const pen = (d, w = 1, o = {}) => (d ? `<path d="${d}" fill="none" stroke="${o.stroke ?? INK}" stroke-width="${r(w, 2)}" stroke-linecap="round" stroke-linejoin="round"${op(o.opacity ?? 1)}${o.extra ?? ''}/>` : '')
const fillD = (d, colour, o = {}) => (d ? `<path d="${d}" fill="${colour}"${op(o.opacity ?? 1)}${o.extra ?? ''}/>` : '')
/** A stroke drawn along its length: `k` of it is down. One subpath only. */
const drawn = (d, w, k, o = {}) => {
  if (k <= 0) return ''
  if (k >= 1) return pen(d, w, o)
  return pen(d, w, { ...o, extra: `${o.extra ?? ''} pathLength="1" stroke-dasharray="${r(k, 3)} 1"` })
}
const circ = (x, y, rad) => (rad > 0.2 ? `M${P(x - rad, y)}a${r(rad)} ${r(rad)} 0 1 0 ${r(rad * 2)} 0a${r(rad)} ${r(rad)} 0 1 0 ${r(-rad * 2)} 0` : '')
const ellipse = (x, y, rx, ry) => `M${P(x - rx, y)}a${r(rx)} ${r(ry)} 0 1 0 ${r(rx * 2)} 0a${r(rx)} ${r(ry)} 0 1 0 ${r(-rx * 2)} 0`
const rectD = (x, y, w, h) => `M${P(x, y)}h${r(w)}v${r(h)}h${r(-w)}Z`
const polyD = (lines) => lines.map((pts) => (pts.length > 1 ? 'M' + pts.map(([x, y]) => P(x, y)).join('L') : '')).join('')

/** Deterministic noise in 0–1 from integers — no Math.random anywhere. */
function hash(x, y, s = 0) {
  let h = Math.imul((x | 0) ^ 0x27d4eb2d, 0x165667b1) ^ Math.imul(((y | 0) + Math.imul(s | 0, 7919)) | 0, 0x9e3779b1)
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b)
  h ^= h >>> 13
  h = Math.imul(h, 0xc2b2ae35)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}
/** A seeded sequence, for building static geometry. */
function seq(seed) {
  let i = 0
  return () => hash(i++, 17, seed)
}

const CACHE = new Map()
const memo = (key, build) => {
  if (!CACHE.has(key)) CACHE.set(key, build())
  return CACHE.get(key)
}

/** A closed curve through `pts` (Catmull–Rom, so it passes through every point). */
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

/** A wobbly closed blob, quadratics through the midpoints. */
function blobD(cx, cy, rx, ry, seed = 1, n = 11, wobble = 0.14) {
  const rand = seq(seed)
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    const k = 1 - wobble / 2 + rand() * wobble
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]
  })
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  let d = `M${P(...mid(pts[n - 1], pts[0]))}`
  pts.forEach((p, i) => { d += `Q${P(...p)} ${P(...mid(p, pts[(i + 1) % n]))}` })
  return d + 'Z'
}

/** Normalised points placed at (x, y), scaled by s, mirrored when flip is −1. */
const place = (pts, x, y, s, flip = 1) => pts.map(([u, v]) => [x + u * s * flip, y + v * s])

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

/* ══ HATCHING ══════════════════════════════════════════════════════════
 *
 * Tone the way an etcher lays it: one layer of parallel lines at a time, each
 * laid only where the tone passes its threshold, so the dark parts are crossed
 * three and four times and the light parts once or not at all. The lines sit
 * on a lattice fixed to the world — offset k·spacing along the normal, sampled
 * at a fixed step along the line — so two fields that meet, or two tiles of the
 * same field, carry the same lines straight through the join.
 *
 * Straight lines come back as their run endpoints only; a `bend` makes them
 * follow a form and comes back sampled. The run ends are broken by noise, the
 * way a needle through a hard ground never quite joins up.
 */
function hatchD({ x0, y0, x1, y1, tone, angle = 0, spacing = 6, at = 0, step = 9, seed = 1, jitter = 0.06, bend = null }) {
  const ux = Math.cos(angle)
  const uy = Math.sin(angle)
  const nx = -uy
  const ny = ux
  const m = step
  const corners = [[x0 - m, y0 - m], [x1 + m, y0 - m], [x0 - m, y1 + m], [x1 + m, y1 + m]]
  const os = corners.map(([x, y]) => x * nx + y * ny)
  const ss = corners.map(([x, y]) => x * ux + y * uy)
  const oMin = Math.min(...os)
  const oMax = Math.max(...os)
  const sMin = Math.floor(Math.min(...ss) / step) * step
  const sMax = Math.max(...ss)
  let d = ''
  const emit = (run) => {
    if (run.length < 2) return
    d += 'M' + run.map((p) => P(p[0], p[1])).join('L')
  }
  for (let k = Math.ceil(oMin / spacing); k * spacing <= oMax; k++) {
    const o = k * spacing + (hash(k, 3, seed) - 0.5) * spacing * 0.28
    let run = null
    for (let s = sMin; s <= sMax; s += step) {
      const x = o * nx + s * ux
      const y = o * ny + s * uy
      const inBox = x >= x0 - m && x <= x1 + m && y >= y0 - m && y <= y1 + m
      const on = inBox && tone(x, y) > at + (hash(k, Math.round(s / step), seed) - 0.5) * jitter * 2
      if (on) {
        const off = bend ? bend(x, y) : 0
        const p = [x + nx * off, y + ny * off]
        if (!run) run = [p]
        else if (bend) run.push(p)
        else run[1] = p
      }
      else if (run) { emit(run); run = null }
    }
    if (run) emit(run)
  }
  return d
}

/** Several layers of `hatchD` at once: `layers` = [{ angle, spacing, at }]. */
const layered = (box, tone, layers, seed = 1, o = {}) =>
  layers.map((l, i) => hatchD({ ...box, tone, ...o, ...l, seed: seed * 13 + i })).join('')

/** A clip rectangle, namespaced. */
const clipRect = (id, x, y, w, h) => `<clipPath id="${id}"><rect x="${r(x)}" y="${r(y)}" width="${r(Math.max(0, w))}" height="${r(Math.max(0, h))}"/></clipPath>`
const clipPath = (id, d) => `<clipPath id="${id}"><path d="${d}"/></clipPath>`
/**
 * A sweep's clip: everything left of `edge`, with a ragged edge — each run of
 * lines stops at a slightly different place, the way a needle works across a
 * plate a stroke at a time, never a ruled wipe.
 */
function sweepClip(id, x0, edge, seed = 1, y0 = TOP, y1 = BOTTOM) {
  if (edge <= x0) return clipRect(id, x0, y0, 0, 0)
  let d = `M${P(x0, y0)}`
  const n = Math.ceil((y1 - y0) / 11)
  for (let i = 0; i <= n; i++) d += `L${P(edge + (hash(i, 1, seed) - 0.5) * 90 + 30 * Math.sin(i * 0.7 + seed), y0 + ((y1 - y0) * i) / n)}`
  return clipPath(id, `${d}L${P(x0, y1)}Z`)
}

/* ══ THE WASH ══════════════════════════════════════════════════════════
 *
 * One blue, laid on by hand after the plate is printed: soft, pooling darker
 * in the middle where it dried, never a flat. A radial gradient in a wobbly
 * blob — no blur filter, so nothing is re-rasterised as the camera moves. It
 * blooms: the blob grows from three quarters of its size as it goes down.
 */
function washDefs(uid) {
  return `<radialGradient id="${uid}-wash"><stop offset="0" stop-color="${BLUE}" stop-opacity="0.62"/><stop offset="0.5" stop-color="${BLUE}" stop-opacity="0.5"/><stop offset="0.78" stop-color="${BLUE}" stop-opacity="0.3"/><stop offset="1" stop-color="${BLUE}" stop-opacity="0"/></radialGradient>
    <linearGradient id="${uid}-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BLUE}" stop-opacity="0.42"/><stop offset="1" stop-color="${BLUE}" stop-opacity="0.7"/></linearGradient>`
}
function wash(ctx, cx, cy, rx, ry, k = 1, o = {}) {
  if (k <= 0.002) return ''
  const e = easeOut(clamp01(k))
  const s = 0.72 + 0.28 * e
  return `<path d="${blobD(cx, cy, rx * s, ry * s, o.seed ?? 3, 12, o.wobble ?? 0.18)}" fill="url(#${ctx.uid}-wash)"${op(e * (o.opacity ?? 1))}/>`
}

/* ══ HER ═══════════════════════════════════════════════════════════════
 *
 * Four shapes, all wiped to the paper: standing, in profile, face on, and
 * walking away. Normalised; `place` puts them in the world. They are drawn in
 * the album's paper over the etched line, never outlined, so they exist only
 * where there is tone round them.
 */

/**
 * Standing, front on, feet at y = 0 and crown at y = −1: head, neck, hair,
 * arms and a long dress as separate shapes that merge in the paper, so the gap
 * between an arm and the waist is what makes her a woman and not a pillar.
 * `arm` holds her right arm out at that many degrees; `sway` swings the hem.
 */
function standParts(x, y, s, o = {}) {
  const pl = (pts) => spline(place(pts, x, y, s))
  const sw = o.sway ?? 0
  const parts = [
    ellipse(x + 0.004 * s, y - 0.925 * s, 0.05 * s, 0.063 * s),
    rectD(x - 0.021 * s, y - 0.885 * s, 0.042 * s, 0.09 * s),
    pl([[-0.1, -0.818], [0.1, -0.818], [0.114, -0.792], [0.092, -0.72], [0.066, -0.612], [0.074, -0.55], [0.1, -0.47], [0.14, -0.3], [0.18 + 0.02 * sw, -0.12], [0.215 + 0.03 * sw, -0.012], [0.1, 0.004], [-0.08, 0.004], [-0.2 + 0.03 * sw, -0.012], [-0.162 + 0.02 * sw, -0.12], [-0.125, -0.3], [-0.095, -0.47], [-0.07, -0.55], [-0.062, -0.612], [-0.088, -0.72], [-0.11, -0.792]]),
    pl([[-0.098, -0.81], [-0.126, -0.782], [-0.138, -0.64], [-0.142, -0.5], [-0.132, -0.452], [-0.118, -0.5], [-0.112, -0.64], [-0.1, -0.74]]),
    pl([[0, -1.005], [0.05, -0.99], [0.074, -0.95], [0.08, -0.9], [0.1, -0.85], [0.14, -0.81], [0.182, -0.786], [0.15, -0.768], [0.104, -0.79], [0.07, -0.822], [0.052, -0.87], [0.05, -0.93], [0, -0.955], [-0.05, -0.93], [-0.052, -0.87], [-0.06, -0.81], [-0.086, -0.772], [-0.102, -0.8], [-0.082, -0.86], [-0.074, -0.93], [-0.05, -0.99]]),
  ]
  if (o.arm == null) parts.push(pl([[0.098, -0.81], [0.126, -0.782], [0.138, -0.64], [0.142, -0.5], [0.132, -0.452], [0.118, -0.5], [0.112, -0.64], [0.1, -0.74]]))
  else {
    const [sx, sy, hx, hy] = armAt(x, y, s, o.arm)
    const a = (o.arm * Math.PI) / 180
    const nx = -Math.sin(a)
    const ny = Math.cos(a)
    parts.push(`M${P(sx + nx * 0.024 * s, sy + ny * 0.024 * s)}L${P(hx + nx * 0.013 * s, hy + ny * 0.013 * s)}Q${P(hx + Math.cos(a) * 0.024 * s, hy + Math.sin(a) * 0.024 * s)} ${P(hx - nx * 0.013 * s, hy - ny * 0.013 * s)}L${P(sx - nx * 0.03 * s, sy - ny * 0.03 * s)}Z`)
  }
  return parts
}
/** Shoulder and hand of an arm held out at `deg`: [sx, sy, hx, hy]. */
function armAt(x, y, s, deg) {
  const a = (deg * Math.PI) / 180
  const sx = x + 0.098 * s
  const sy = y - 0.8 * s
  return [sx, sy, sx + Math.cos(a) * 0.37 * s, sy + Math.sin(a) * 0.37 * s]
}
const herFig = (parts, o = 1) => (o <= 0.002 ? '' : `<g fill="${PAPER}"${op(o)}>${parts.map((d) => `<path d="${d}"/>`).join('')}</g>`)

/** Profile, facing right: crown at y −0.75, shoulders cut at y 0.42. */
const PROFILE = [
  [0.02, -0.75], [0.12, -0.72], [0.19, -0.645], [0.215, -0.555], [0.214, -0.5], [0.226, -0.462], [0.262, -0.385],
  [0.266, -0.362], [0.236, -0.346], [0.242, -0.312], [0.228, -0.292], [0.236, -0.266], [0.214, -0.232], [0.2, -0.192],
  [0.166, -0.166], [0.13, -0.156], [0.114, -0.122], [0.118, -0.02], [0.15, 0.08], [0.24, 0.16], [0.34, 0.25],
  [0.38, 0.42], [-0.42, 0.42], [-0.4, 0.26], [-0.34, 0.12], [-0.27, 0.0], [-0.3, -0.14], [-0.34, -0.3],
  [-0.33, -0.46], [-0.27, -0.6], [-0.16, -0.71],
]

/**
 * Face on, head and shoulders: crown at y −0.62, the face an oval at (0, −0.27).
 * Her hair is parted to one side: it falls over her right shoulder (screen left)
 * in waves and is tucked behind her ear on the other, where the neck and the
 * shoulder show against the dark.
 */
const FRONT = [
  [0.02, -0.622], [0.11, -0.604], [0.184, -0.556], [0.218, -0.478], [0.222, -0.38], [0.206, -0.3], [0.19, -0.206],
  [0.162, -0.12], [0.104, -0.03], [0.102, 0.07], [0.2, 0.135], [0.36, 0.195], [0.48, 0.265], [0.54, 0.38], [0.57, 0.62],
  [-0.57, 0.62], [-0.54, 0.38], [-0.44, 0.27], [-0.31, 0.2], [-0.296, 0.1], [-0.268, 0.0], [-0.3, -0.12], [-0.27, -0.24],
  [-0.292, -0.36], [-0.26, -0.48], [-0.19, -0.566], [-0.09, -0.612],
]
const FACE = { x: 0.012, y: -0.27, rx: 0.148, ry: 0.202 }

const herD = (shape, x, y, s, flip = 1) => spline(place(shape, x, y, s, flip))
const her = (d, o = 1) => fillD(d, PAPER, { opacity: o })

/* ══ THE PROPS ═════════════════════════════════════════════════════════
 *
 * Each takes (ctx, now) and returns { main, over? }: `main` is drawn under the
 * red thread, `over` above it (a locket lid that shuts over the pin). All in
 * world coordinates.
 */

/** A figure's caption, lettered small the way an engraver letters a plate. Comes with its figure. */
const caption = (ctx, x, y, s, fill = INK, k = 1) =>
  k <= 0.01 ? '' : text({ x, y, size: 19, text: s, fill, anchor: 'middle', weight: 400, upper: false, tracking: 0.6, opacity: ctx.captionOpacity * clamp01(k) })

/* ── The sky and the sea: a shore at dawn, and a coast at sunset ─────── */

function seascape(key, { x0, x1, horizon, shore, sunX, sunY, depth = 300, top = 60 }) {
  return memo(key, () => {
    const box = { x0, y0: top, x1, y1: horizon }
    const glow = (x, y) => Math.exp(-(((x - sunX) / 260) ** 2 + ((y - sunY) / 170) ** 2))
    // A seascape ends in a drawn fade, never an edge: the lines thin out over its last 260 units.
    const ends = (x) => smooth((x - x0) / 260) * smooth((x1 - x) / 260)
    const sky = (x, y) => (y < horizon - 2 ? (0.22 + 0.7 * ((horizon - y) / (horizon - top))) * (1 - 0.85 * glow(x, y)) * ends(x) : 0)
    const skyD = [
      hatchD({ ...box, tone: sky, angle: 0, spacing: 6.5, at: 0.18, step: 12, seed: 5 }),
      hatchD({ ...box, tone: sky, angle: 0.06, spacing: 7, at: 0.55, step: 12, seed: 6 }),
    ]
    // The sea: wavy strokes, closer together towards the horizon, broken where the sun lies on it.
    const rand = seq(key.length * 7 + 11)
    const sea = []
    let y = horizon + 4
    let row = 0
    while (y < depth + horizon) {
      const amp = 1 + row * 0.35
      let pts = []
      for (let x = x0; x <= x1; x += 14) {
        const sy = y + Math.sin(x / (30 + row * 4) + row * 1.7) * amp
        const lim = shore ? shore(x) : Infinity
        const glitter = Math.abs(x - sunX) < 24 + row * 3 && rand() < 0.7
        if (sy > lim - 4 || glitter || rand() < 0.035 || rand() > ends(x) * 1.15) {
          if (pts.length > 1) sea.push(pts)
          pts = []
          continue
        }
        pts.push([x, sy])
      }
      if (pts.length > 1) sea.push(pts)
      row++
      y += 3.5 + row * 0.9
    }
    return { sky: skyD, sea: polyD(sea) }
  })
}

function sunD(x, y, rad, rays, len = 1) {
  const lines = []
  for (let i = 0; i < rays; i++) {
    const a = Math.PI + (i / (rays - 1)) * Math.PI
    const r0 = rad + 10
    const r1 = rad + (40 + (i % 3) * 30 + (i % 7) * 6) * len
    lines.push([[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]])
  }
  return polyD(lines)
}

function shoreScene(ctx, now) {
  const { cx } = ctx.P.shore
  const T = ctx.T
  const H = 330
  const shore = (x) => 548 + 26 * Math.sin((x - cx) / 330) - 0.035 * (x - cx)
  const sunX = cx + 330
  const scape = seascape(`shore-${ctx.id}`, { x0: cx - 950, x1: cx + 950, horizon: H, shore, sunX, sunY: 300 })
  const beach = memo(`beach-${ctx.id}`, () => {
    const box = { x0: cx - 950, y0: H, x1: cx + 950, y1: 700 }
    const sand = (x, y) => (y > shore(x) + 2 ? (0.2 + 0.5 * clamp01((y - shore(x)) / 160) + (y < shore(x) + 22 ? 0.3 : 0)) * smooth((x - cx + 950) / 260) * smooth((cx + 950 - x) / 260) : 0)
    return layered(box, sand, [{ angle: 0.04, spacing: 7, at: 0.12 }, { angle: -0.5, spacing: 9, at: 0.58 }], 21, { step: 10 })
  })
  const woman = { x: cx - 380, y: 604, s: 290 }
  let out = ''
  // Intro: the horizon is the first scratch.
  out += drawn(`M${P(cx - 950, H)}H${r(cx + 830)}`, 1.6, easeInOut(ramp(now, 2.2, 6.4)))
  // The far sky, laid in the intro.
  const high = ctx.P.shore.from
  out += `${sweepClip(`${ctx.uid}-sky0`, high, lerp(high, cx + 1000, easeInOut(ramp(now, 3.6, 8.8))), 5, TOP, TOP + 200)}${pen(scape.sky[1], 1.05, { extra: ` clip-path="url(#${ctx.uid}-sky0)"` })}`
  // Verse 1: everything else sweeps on, left to right, and leaves her.
  const sw = smooth(ramp(now, T.that - 0.6, T.sure + 0.3))
  const edge = lerp(cx - 1000, cx + 1000, sw)
  const washSky = ramp(now, T.sure + 0.1, T.sure + 1.1)
  const washSea = ramp(now, T.shore + 0.7, T.shore + 1.8)
  out += wash(ctx, cx, 140, 1000, 150, washSky, { opacity: 0.55, seed: 4 })
  out += wash(ctx, cx + 100, 430, 1050, 120, washSea, { opacity: 0.9, seed: 8 })
  out += `${sweepClip(`${ctx.uid}-shore`, cx - 950, edge, 3)}<g clip-path="url(#${ctx.uid}-shore)">${pen(scape.sky[0], 1.0)}${pen(scape.sea, 1.15)}${pen(beach, 1.0)}${pen(`M${P(cx - 950, shore(cx - 950))}${Array.from({ length: 36 }, (_, i) => `L${P(cx - 950 + i * 50, shore(cx - 950 + i * 50))}`).join('')}`, 1.6)}</g>`
  // The sun: rises on "sunrise", behind the horizon.
  const rise = easeOut(ramp(now, T.sunrise - 0.15, T.sunrise + 2.4))
  if (rise > 0) {
    const sy = lerp(H + 70, H - 44, rise)
    const clip = `${ctx.uid}-sunclip`
    const rays = sunD(sunX, sy, 56, 41, 0.4 + 0.6 * rise)
    out += `${clipRect(clip, sunX - 400, TOP, 800, H - TOP)}<g clip-path="url(#${clip})">${pen(rays, 1.0, { opacity: 0.9 })}${fillD(circ(sunX, sy, 56), PAPER)}${pen(circ(sunX, sy, 56), 1.6)}</g>`
  }
  // "waves": a swell rolls in; "shore": it breaks.
  const roll = easeInOut(ramp(now, T.waves - 0.2, T.shore))
  if (roll > 0 && roll < 1) {
    const pts = []
    for (let x = cx - 700; x <= cx + 760; x += 30) {
      const y = lerp(H + 26, shore(x) - 16, roll) + Math.sin(x / 70 + now * 2) * (3 + roll * 5)
      pts.push([x, y])
    }
    out += pen(spline(pts, false), 1.4 + roll * 1.6) + pen(polyD(pts.filter((_, i) => i % 2).map(([x, y]) => [[x - 6, y + 4], [x - 14, y + 12 + roll * 6]])), 1.0)
  }
  const burst = land(now, T.shore, 0.5)
  if (burst > 0) {
    const foam = memo(`foam-${ctx.id}`, () => {
      const rand = seq(77)
      let d = ''
      for (let i = 0; i < 180; i++) {
        const x = cx - 700 + rand() * 1460
        const y = shore(x) - 10 - rand() ** 2 * 50
        d += circ(x, y, 0.9 + rand() * 1.6)
      }
      return d
    })
    const curls = memo(`curls-${ctx.id}`, () => {
      let d = ''
      for (let x = cx - 680; x < cx + 760; x += 90) {
        const y = shore(x) - 8
        d += `M${P(x - 34, y)}Q${P(x - 10, y - 26)} ${P(x + 14, y - 12)}Q${P(x + 20, y - 4)} ${P(x + 8, y - 2)}`
      }
      return d
    })
    out += `<g${op(burst)}>${fillD(foam, INK, { opacity: 0.8 })}${pen(curls, 1.3)}</g>`
  }
  // Her: bare paper, where the sweep has been.
  out += `<g clip-path="url(#${ctx.uid}-shore)">${herFig(standParts(woman.x, woman.y, woman.s))}</g>`
  out += caption(ctx, woman.x, 664, 'fig. 1 — a woman, at sunrise', INK, ramp(now, T.woman, T.woman + 0.6))
  return { main: out }
}

/* ── fig. 2, open ocean; fig. 3, the butterfly ───────────────────────── */

function oceanScene(ctx, now) {
  const { ox, bx } = ctx.P.ocean
  const T = ctx.T
  const box = { x0: ox - 285, y0: 190, x1: ox + 285, y1: 600 }
  const stat = memo(`ocean-${ctx.id}`, () => {
    const crest = (x, row) => box.y0 + 30 + row * 16 + Math.sin(x / 55 + row * 0.7) * (9 + row * 0.6) + Math.sin(x / 19 + row) * 2
    const rows = []
    const rand = seq(41)
    for (let row = 0; row < 24; row++) {
      const pts = []
      for (let x = box.x0; x <= box.x1; x += 12) pts.push([x, crest(x, row) + (rand() - 0.5) * 0.6])
      rows.push(pts)
    }
    const shade = []
    for (let row = 2; row < 24; row++) {
      for (let x = box.x0; x <= box.x1; x += 5 + (24 - row) * 0.3) {
        const y = crest(x, row)
        if (crest(x + 2, row) - crest(x - 2, row) < 0.2) continue
        shade.push([[x, y + 2], [x - 3, y + 7 + row * 0.22]])
      }
    }
    return { rows: polyD(rows), shade: polyD(shade), shape: blobD(ox, (box.y0 + box.y1) / 2 + 20, 285, 205, 17, 13, 0.22) }
  })
  const clip = `${ctx.uid}-ocean`
  const reveal = smooth(ramp(now, T.her - 1.2, T.ocean + 0.4))
  let out = `${clipPath(clip, stat.shape)}${clipRect(`${clip}-r`, box.x0 - 20, box.y0 - 20, box.x1 - box.x0 + 40, (box.y1 - box.y0 + 60) * reveal)}`
  out += `<g clip-path="url(#${clip})">${wash(ctx, ox + 20, 440, 300, 170, ramp(now, T.ocean + 0.3, T.ocean + 1.3), { seed: 7 })}${wash(ctx, ox - 90, 520, 170, 70, ramp(now, T.ocean + 0.6, T.ocean + 1.6), { seed: 12, opacity: 0.8 })}<g clip-path="url(#${clip}-r)">${pen(stat.rows, 1.05)}${pen(stat.shade, 0.85, { opacity: 0.85 })}</g></g>`
  out += caption(ctx, ox, 652, 'fig. 2 — open ocean', INK, reveal)
  // The butterfly: drawn on "butterfly", wings open on "wings", still once pinned.
  const shown = land(now, T.butterfly - 0.1, 0.35)
  if (shown > 0) {
    const open = lerp(0.1, 1, easeOut(ramp(now, T.butterfly, T.wings + 0.2)))
    const breathe = now < T.pinFly ? 1 - 0.07 * (0.5 + 0.5 * Math.sin((now - T.wings) * 2.4)) * ramp(now, T.wings, T.wings + 0.3) : 1
    out += `<g${op(shown)}>${butterfly(ctx, bx, 330, 1.02, open * breathe, 'fig3', ramp(now, T.blue, T.wings + 0.4))}</g>`
    out += caption(ctx, bx, 604, 'fig. 3 — blue butterfly wings')
  }
  return { main: out }
}

/* One wing, drawn for the right side; the left is the mirror. */
const FOREWING = 'M0 0 C 40 -70 150 -150 250 -130 C 280 -120 262 -60 226 -24 C 180 12 90 22 0 10 Z'
const HINDWING = 'M0 12 C 70 22 170 40 184 110 C 190 160 130 190 90 170 C 40 146 12 80 0 30 Z'
const VEINS = 'M0 2L120 -80L240 -126M0 4L140 -54L236 -70M0 6L150 -22L222 -26M0 14L100 50L176 106M0 18L80 90L120 170M0 22L50 100L70 150'
const WING_SHADE = memo('wing-shade', () => {
  const tone = (x, y) => {
    const fore = y < 8 && Math.hypot(x - 250, y + 130) < 150
    const hind = y > 12 && Math.hypot(x - 150, y - 170) < 95
    return fore || hind ? 1 : 0
  }
  return hatchD({ x0: -10, y0: -160, x1: 270, y1: 200, tone, angle: 1.05, spacing: 5.5, at: 0.5, step: 6, seed: 3 })
})

/**
 * A morpho-ish butterfly: etched outline and veins, hatching at the wing tips,
 * blue laid on by hand, an eyespot on each hindwing. `open` is 0–1 (the wings
 * seen edge-on to flat), `blue` 0–1 the wash.
 */
function butterfly(ctx, cx, cy, scale, open = 1, name = 'fly', blue = 1) {
  const u = ctx.uid
  const wingClip = `${u}-${name}-wing`
  const side = (flip) => `transform="translate(${r(cx)} ${r(cy)}) scale(${r(flip * scale * Math.max(open, 0.04), 3)} ${r(scale, 3)})"`
  const sw = (w) => ` vector-effect="non-scaling-stroke"`
  const wings = (flip) => `<g ${side(flip)}>
      ${blue > 0 ? `<path d="${FOREWING}${HINDWING}" fill="url(#${u}-wash)"${op(easeOut(blue))} transform="translate(4 3) scale(0.97)"/>` : ''}
      <path d="M150 -120 C 220 -140 270 -110 240 -50 C 220 -20 190 -20 170 -40 Z" fill="${BLUE}"${op(0.35 * blue)}/>
      <g clip-path="url(#${wingClip})"><path d="${WING_SHADE}" fill="none" stroke="${INK}" stroke-width="${r(0.8 * scale, 2)}"${sw()} opacity="0.85"/></g>
      <path d="${VEINS}" fill="none" stroke="${INK}" stroke-width="${r(1.0 * scale, 2)}"${sw()}/>
      <path d="${FOREWING}${HINDWING}" fill="none" stroke="${INK}" stroke-width="${r(1.6 * scale, 2)}"${sw()} stroke-linejoin="round"/>
      <path d="${circ(118, 118, 20)}" fill="${PAPER}" stroke="${INK}" stroke-width="${r(1.3 * scale, 2)}"${sw()}/>
      <path d="${circ(118, 118, 12)}" fill="${BLUE}"${op(0.35 + 0.65 * blue)}/>
      <path d="${circ(118, 118, 5)}" fill="${INK}"/>
      <path d="${circ(121, 114, 2.2)}" fill="${PAPER}"/>
    </g>`
  return `<clipPath id="${wingClip}"><path d="${FOREWING}${HINDWING}"/></clipPath>
    ${wings(1)}${wings(-1)}
    <g transform="translate(${r(cx)} ${r(cy)}) scale(${r(scale, 3)})">
      <ellipse cx="0" cy="18" rx="7" ry="60" fill="${INK}"/>
      <circle cx="0" cy="-48" r="9" fill="${INK}"/>
      <path d="M-3 -54 C -18 -100 -34 -120 -46 -126 M3 -54 C 18 -100 34 -120 46 -126" fill="none" stroke="${INK}" stroke-width="${r(1.4 * scale, 2)}" vector-effect="non-scaling-stroke"/>
      <circle cx="-46" cy="-126" r="3.5" fill="${INK}"/><circle cx="46" cy="-126" r="3.5" fill="${INK}"/>
    </g>`
}

/* ── fig. 4, on stage ───────────────────────────────────────────────── */

function stageScene(ctx, now) {
  const { sx } = ctx.P.stage
  const T = ctx.T
  const open = { x0: sx - 560, x1: sx + 560, y0: 104, floor: 560, front: 620 }
  const stat = memo(`stage-${ctx.id}`, () => {
    // The backdrop, dark: three layers, with the folds of a drop.
    const back = (x, y) => (y > open.y0 - 10 && y < open.floor + 4 ? 0.78 + 0.14 * Math.sin((x - sx) / 30) : 0)
    const backD = layered({ x0: open.x0, y0: open.y0 - 10, x1: open.x1, y1: open.floor + 4 }, back, [{ angle: 0.4, spacing: 6, at: 0.1 }, { angle: -0.55, spacing: 6.5, at: 0.4 }, { angle: 1.45, spacing: 7, at: 0.8 }], 31, { step: 10 })
    // The floor: boards to a vanishing point, a light tone.
    const vp = 300
    let boards = ''
    for (let i = -10; i <= 10; i++) {
      const xf = sx + i * 64
      const xb = sx + (xf - sx) * ((open.floor - vp) / (open.front - vp))
      boards += `M${P(xb, open.floor)}L${P(xf, open.front)}`
    }
    const floorTone = (x, y) => (y > open.floor && y < open.front ? 0.35 : 0)
    const floorD = hatchD({ x0: open.x0 - 160, y0: open.floor, x1: open.x1 + 160, y1: open.front, tone: floorTone, angle: 0, spacing: 7, at: 0.2, step: 12, seed: 33 })
    const pit = (x, y) => (y > open.front + 36 ? 0.9 : y > open.front ? 0.55 : 0)
    const pitD = layered({ x0: sx - 900, y0: open.front, x1: sx + 900, y1: BOTTOM }, pit, [{ angle: 0.3, spacing: 6, at: 0.1 }, { angle: -0.9, spacing: 6.5, at: 0.6 }], 35, { step: 12 })
    // The proscenium: columns and the arch, hatched in the shadows.
    const colTone = (x, y) => {
      const inCol = (x > sx - 720 && x < open.x0) || (x < sx + 720 && x > open.x1)
      const inArch = y < open.y0 && y > TOP && x > sx - 720 && x < sx + 720
      if (!inCol && !inArch) return 0
      return inArch ? 0.35 + 0.3 * ((open.y0 - y) / 70) : 0.3 + 0.5 * Math.abs(Math.sin((x - sx) / 22))
    }
    const colD = hatchD({ x0: sx - 720, y0: TOP, x1: sx + 720, y1: open.front, tone: colTone, angle: Math.PI / 2, spacing: 6, at: 0.3, step: 12, seed: 37 })
    const arch = `M${P(sx - 720, open.front)}V${r(open.y0 - 30)}M${P(sx + 720, open.front)}V${r(open.y0 - 30)}M${P(open.x0, open.floor)}V${r(open.y0 + 20)}Q${P(open.x0, open.y0)} ${P(open.x0 + 60, open.y0)}H${r(open.x1 - 60)}Q${P(open.x1, open.y0)} ${P(open.x1, open.y0 + 20)}V${r(open.floor)}M${P(sx - 740, open.y0 - 30)}H${r(sx + 740)}M${P(sx - 700, open.front)}H${r(sx + 700)}`
    // A drape: vertical lines bent into folds, crossed in the fold shadows.
    const drape = (dir) => {
      const x0 = dir < 0 ? open.x0 : sx
      const x1 = dir < 0 ? sx : open.x1
      const tone = (x, y) => (y > open.y0 && y < open.floor + 30 ? 0.45 + 0.4 * Math.sin((x - sx) / 26) : 0)
      const bend = (x, y) => 5 * Math.sin((y - open.y0) / 90 + x / 60)
      return [
        hatchD({ x0, y0: open.y0, x1, y1: open.floor + 30, tone, angle: Math.PI / 2, spacing: 5.5, at: 0.05, step: 16, seed: dir < 0 ? 41 : 43, bend }),
        hatchD({ x0, y0: open.y0, x1, y1: open.floor + 30, tone, angle: 1.2, spacing: 7, at: 0.62, step: 12, seed: dir < 0 ? 45 : 47 }),
      ].join('')
    }
    let footlights = ''
    for (let x = sx - 520; x <= sx + 520; x += 65) footlights += `M${P(x - 16, open.front + 4)}Q${P(x, open.front - 14)} ${P(x + 16, open.front + 4)}Z`
    return { backD, boards, floorD, pitD, colD, arch, left: drape(-1), right: drape(1), footlights }
  })
  const lit = land(now, T.stage - 0.05, 0.35)
  const sings = land(now, T.sings - 0.04, 0.4)
  const bite = 1 + 0.55 * sings
  let out = ''
  // Blue: the velvet, and on "sings" a flood of it across the dark.
  out += wash(ctx, sx, 330, 640, 260, ramp(now, T.sings, T.sings + 0.7), { seed: 21, opacity: 0.95 })
  out += pen(stat.backD, 1.05 * bite)
  out += pen(stat.floorD, 0.9) + pen(stat.boards, 1.0) + pen(stat.pitD, 1.0) + pen(stat.colD, 1.0) + pen(stat.arch, 2.0)
  // The spotlight, and her in it.
  const hx = sx
  const feet = open.floor + 2
  const hs = 300
  if (lit > 0) {
    const cone = (w0, w1) => `M${P(hx - w0, open.y0)}L${P(hx + w0, open.y0)}L${P(hx + w1, feet)}A${r(w1)} 22 0 0 1 ${P(hx - w1, feet)}Z`
    out += fillD(cone(34, 190), PLATE_TONE, { opacity: 0.45 * lit }) + fillD(cone(22, 150), PLATE_TONE, { opacity: 0.8 * lit }) + fillD(ellipse(hx, feet, 150, 22), PAPER, { opacity: 0.8 * lit })
  }
  // "sings": light cracks out of her, in paper.
  if (sings > 0) {
    const hy = feet - hs * 0.9
    const rays = memo(`stage-rays-${ctx.id}`, () => Array.from({ length: 72 }, (_, i) => ({ a: (i / 72) * Math.PI * 2 + hash(i, 1, 5) * 0.05, len: 200 + hash(i, 2, 5) * 380, ph: hash(i, 3, 5) * 6.28 })))
    let d = ''
    for (const ray of rays) {
      const L = ray.len * sings * (0.86 + 0.14 * Math.sin(now * 1.9 + ray.ph))
      d += `M${P(hx + Math.cos(ray.a) * 70, hy + Math.sin(ray.a) * 70)}L${P(hx + Math.cos(ray.a) * (70 + L), hy + Math.sin(ray.a) * (70 + L))}`
    }
    out += `${clipRect(`${ctx.uid}-stage-rays`, open.x0, open.y0, open.x1 - open.x0, open.floor - open.y0)}<g clip-path="url(#${ctx.uid}-stage-rays)">${pen(d, 1.6, { stroke: PAPER, opacity: 0.85 })}${bolts(ctx, 'stage', hx, hy, 110, T.sings, now, 7, 420)}</g>`
  }
  out += herFig(standParts(hx, feet, hs), 0.35 + 0.65 * lit)
  // The microphone, in ink, in front of her.
  out += pen(`M${P(hx + 46, feet)}L${P(hx + 40, feet - hs * 0.84)}M${P(hx + 22, feet)}L${P(hx + 70, feet)}`, 3.2) + fillD(ellipse(hx + 30, feet - hs * 0.86, 9, 13), INK, { extra: ` transform="rotate(-30 ${r(hx + 30)} ${r(feet - hs * 0.86)})"` })
  // The drapes: closed until "when she gets on stage", gathered to the sides.
  const part = easeInOut(ramp(now, T.gets - 0.5, T.stage + 0.2))
  const w = lerp(560, 250, part)
  const drapeG = (d, dir) => {
    const shift = (560 - w) * dir
    return `<g clip-path="url(#${ctx.uid}-wings)"><g transform="translate(${r(shift, 1)} 0)">${wash(ctx, dir < 0 ? sx - 280 : sx + 280, 330, 300, 250, ramp(now, T.shes - 0.4, T.shes + 0.8), { seed: dir < 0 ? 22 : 23, opacity: 0.75 })}<path d="${dir < 0 ? stat.left : stat.right}" fill="none" stroke="${INK}" stroke-width="1.05" stroke-linecap="round"/></g></g>`
  }
  out += clipRect(`${ctx.uid}-wings`, open.x0, open.y0, open.x1 - open.x0, open.floor + 40 - open.y0)
  out += drapeG(stat.left, -1) + drapeG(stat.right, 1)
  // The valance across the top.
  let swag = ''
  for (let i = 0; i < 6; i++) {
    const a = open.x0 + (i * (open.x1 - open.x0)) / 6
    const b = open.x0 + ((i + 1) * (open.x1 - open.x0)) / 6
    swag += `M${P(a, open.y0)}Q${P((a + b) / 2, open.y0 + 70)} ${P(b, open.y0)}`
  }
  out += pen(swag, 2.2) + pen(swag.replace(/Q([\d.-]+) ([\d.-]+)/g, (m, x, y) => `Q${x} ${r(Number(y) - 22)}`), 1.2)
  out += fillD(stat.footlights, PAPER) + pen(stat.footlights, 1.2)
  out += caption(ctx, sx, 664, 'fig. 4 — on stage, singing', PAPER, lit)
  return { main: out }
}

/**
 * Light that cracks out of the dark: jagged paper lines from round (x, y),
 * each drawn on in a tenth of a second and gone in half a second, a few at a
 * time across `span` seconds from `from`. Geometry is fixed by index.
 */
function bolts(ctx, name, x, y, r0, from, now, count = 8, reach = 360, span = 1.4) {
  let out = ''
  for (let i = 0; i < count; i++) {
    const t0 = from + (i / count) * span + hash(i, 9, name.length) * 0.1
    const age = now - t0
    if (age < 0 || age > 0.8) continue
    const pts = memo(`bolt-${name}-${i}-${r(x)}-${r(y)}`, () => {
      const a = hash(i, 4, name.length) * Math.PI * 2
      const list = []
      const n = 7
      for (let k = 0; k <= n; k++) {
        const dist = r0 + ((reach * k) / n) * (0.7 + 0.3 * hash(i, k, 21))
        const jag = k === 0 ? 0 : (hash(i, k, 23) - 0.5) * 0.5
        list.push([x + Math.cos(a + jag) * dist, y + Math.sin(a + jag) * dist])
      }
      return list
    })
    const m = Math.max(2, Math.ceil(pts.length * clamp01(age / 0.1)))
    const fade = 1 - clamp01((age - 0.35) / 0.45)
    out += pen('M' + pts.slice(0, m).map((p) => P(...p)).join('L'), 2.4, { stroke: PAPER, opacity: fade })
  }
  return out
}

/* ── fig. 5, California; fig. 6, Tennessee ─────────────────────────── */

function californiaScene(ctx, now) {
  const { cx, bx } = ctx.P.california
  const T = ctx.T
  const stat = memo(`cal-${ctx.id}`, () => {
    const cliff = [[cx - 430, 640], [cx - 410, 500], [cx - 340, 430], [cx - 210, 392], [cx - 70, 372], [cx + 60, 376], [cx + 150, 390], [cx + 174, 430], [cx + 182, 500], [cx + 206, 566], [cx + 236, 640]]
    const tone = (x, y) => (inside(cliff, x, y) ? 0.25 + 0.5 * clamp01((x - cx + 60) / 240) + 0.25 * clamp01((y - 400) / 240) + 0.08 * Math.sin(y / 17 + x / 40) : 0)
    const rock = layered({ x0: cx - 440, y0: 360, x1: cx + 250, y1: 650 }, tone, [{ angle: 1.38, spacing: 6, at: 0.18 }, { angle: 0.2, spacing: 7, at: 0.5 }, { angle: -0.7, spacing: 7, at: 0.78 }], 51, { step: 8 })
    const seaRows = []
    for (let row = 0; row < 12; row++) {
      const y = 470 + row * 14 + row * row * 0.6
      const pts = []
      for (let x = cx + 200; x <= cx + 520; x += 12) pts.push([x, y + Math.sin(x / 26 + row) * (1.5 + row * 0.3)])
      seaRows.push(pts)
    }
    // The trunk, twisted, leaning into the wind; and the flat clouds of foliage.
    const trunk = spline([[cx - 40, 368], [cx - 30, 330], [cx - 46, 296], [cx - 30, 262], [cx - 6, 232]], false)
    const branches = `M${P(cx - 42, 300)}Q${P(cx - 110, 290)} ${P(cx - 190, 262)}M${P(cx - 36, 280)}Q${P(cx - 90, 240)} ${P(cx - 150, 214)}M${P(cx - 20, 250)}Q${P(cx + 40, 236)} ${P(cx + 80, 214)}M${P(cx - 190, 262)}Q${P(cx - 250, 262)} ${P(cx - 300, 268)}`
    const clumps = [[cx - 300, 262, 64, 16], [cx - 210, 250, 92, 22], [cx - 90, 232, 110, 25], [cx + 40, 214, 96, 22], [cx - 240, 214, 80, 19], [cx - 120, 192, 116, 24], [cx + 10, 180, 84, 20], [cx - 150, 156, 80, 17], [cx - 40, 150, 70, 16]]
    const cl = clumps.map(([x, y, rx, ry], i) => {
      const shape = blobD(x, y, rx, ry, 60 + i, 14, 0.3)
      const tn = (px, py) => ((px - x) / rx) ** 2 + ((py - y) / ry) ** 2 < 1 ? 0.35 + 0.5 * clamp01((py - y + ry) / (2 * ry)) : 0
      return { shape, hatch: layered({ x0: x - rx, y0: y - ry, x1: x + rx, y1: y + ry }, tn, [{ angle: 0.2, spacing: 4.5, at: 0.3 }, { angle: 1.4, spacing: 5, at: 0.62 }], 61 + i, { step: 5 }) }
    })
    return { cliff: spline(cliff, false), rock, sea: polyD(seaRows), trunk, branches, clumps: cl }
  })
  let out = ''
  const base = easeInOut(ramp(now, T.looks - 0.3, T.california))
  out += wash(ctx, cx + 360, 540, 220, 120, ramp(now, T.california + 0.5, T.california + 1.5), { seed: 31 })
  out += wash(ctx, cx - 20, 200, 380, 120, ramp(now, T.california + 0.8, T.california + 1.8), { seed: 32, opacity: 0.45 })
  out += `${sweepClip(`${ctx.uid}-cal`, cx - 420, lerp(cx - 420, cx + 600, base), 7)}<g clip-path="url(#${ctx.uid}-cal)">${pen(stat.rock, 1.0)}${pen(stat.cliff, 1.8)}${pen(stat.sea, 1.0)}</g>`
  const tr = ramp(now, T.california - 0.2, T.california + 0.35)
  out += drawn(stat.trunk, 7, tr) + drawn(stat.trunk, 12, tr, { opacity: 0.25 })
  out += pen(stat.branches, 3.2, { opacity: tr })
  stat.clumps.forEach((c, i) => {
    const k = land(now, T.california + 0.15 + i * 0.12, 0.3)
    if (k <= 0) return
    out += `<g${op(k)}>${pen(c.hatch, 0.95)}${pen(c.shape, 1.5)}</g>`
  })
  out += caption(ctx, cx - 20, 664, 'fig. 5 — looks like California', INK, base)
  // The mockingbird, on its branch, and blue flags under it.
  const bird = land(now, T.sounds - 0.1, 0.4)
  if (bird > 0) {
    out += `<g${op(bird)}>${iris(ctx, bx + 120, 610, now, T.sounds + 0.4)}${pen(`M${P(bx - 300, 430)}Q${P(bx - 60, 400)} ${P(bx + 170, 380)}M${P(bx + 40, 396)}Q${P(bx + 110, 360)} ${P(bx + 150, 350)}`, 4)}${leafSpray(bx - 240, 424, 1)}${leafSpray(bx + 130, 372, -1)}${mockingbird(bx - 20, 402, 150, { sing: ramp(now, T.tennessee - 0.1, T.tennessee + 0.12) * (1 - ramp(now, T.tennessee + 1.4, T.tennessee + 1.8)) })}</g>`
    // Song: three arcs from the beak, one after another.
    for (let i = 0; i < 3; i++) {
      const t0 = T.tennessee + i * 0.22
      const age = now - t0
      if (age < 0 || age > 1.4) continue
      const rad = 20 + age * 70
      const o = 1 - age / 1.4
      out += pen(`M${P(bx + 84 + Math.cos(-0.9) * rad, 402 - 94 + Math.sin(-0.9) * rad)}A${r(rad)} ${r(rad)} 0 0 1 ${P(bx + 84 + Math.cos(0.5) * rad, 402 - 94 + Math.sin(0.5) * rad)}`, 1.8, { opacity: o })
    }
    out += caption(ctx, bx, 664, 'fig. 6 — sounds like Tennessee')
  }
  return { main: out }
}

function leafSpray(x, y, dir) {
  let d = ''
  for (let i = 0; i < 5; i++) {
    const a = -0.9 + i * 0.35
    const L = 34 - i * 2
    const ex = x + Math.cos(a) * L * dir
    const ey = y + Math.sin(a) * L - 10
    d += `M${P(x, y)}Q${P((x + ex) / 2 + 8 * dir, (y + ey) / 2 - 8)} ${P(ex, ey)}Q${P((x + ex) / 2 - 4 * dir, (y + ey) / 2 + 6)} ${P(x, y)}Z`
  }
  return pen(d, 1.3)
}

/** Blue flags (Tennessee's iris): sword leaves and three falls, washed. */
function iris(ctx, x, y, now, at) {
  let out = ''
  const k = ramp(now, at, at + 0.9)
  for (let i = 0; i < 3; i++) {
    const fx = x + i * 70 - 60
    const fy = y - 150 - (i % 2) * 40
    out += wash(ctx, fx, fy + 10, 46, 38, k, { seed: 40 + i })
    out += pen(`M${P(fx, y)}Q${P(fx - 6, (y + fy) / 2)} ${P(fx, fy + 20)}`, 2)
    out += pen(`M${P(fx, fy + 20)}Q${P(fx - 40, fy + 10)} ${P(fx - 36, fy + 44)}M${P(fx, fy + 20)}Q${P(fx + 40, fy + 10)} ${P(fx + 36, fy + 44)}M${P(fx, fy + 20)}Q${P(fx - 16, fy - 16)} ${P(fx, fy - 34)}Q${P(fx + 16, fy - 16)} ${P(fx, fy + 20)}`, 1.5)
    out += pen(`M${P(fx - 22, y)}Q${P(fx - 30, y - 60)} ${P(fx - 16, y - 120)}M${P(fx + 18, y)}Q${P(fx + 30, y - 70)} ${P(fx + 26, y - 110)}`, 1.4)
  }
  return out
}

/** A mockingbird perched, facing right, feet at (x, y). `sing` opens the beak. */
function mockingbird(x, y, s, o = {}) {
  const body = [[0.44, -0.74], [0.36, -0.76], [0.27, -0.7], [0.12, -0.6], [-0.12, -0.5], [-0.3, -0.4], [-0.72, -0.68], [-0.8, -0.63], [-0.78, -0.56], [-0.34, -0.3], [-0.12, -0.14], [0.1, -0.1], [0.3, -0.24], [0.42, -0.44], [0.5, -0.58], [0.52, -0.66]]
  const pts = place(body, x, y, s)
  const tone = (px, py) => {
    if (!inside(pts, px, py)) return 0
    const v = (py - (y - 0.75 * s)) / (0.65 * s)
    return 0.8 - v * 0.7
  }
  const shade = memo(`bird-${r(x)}-${r(y)}-${s}`, () => layered({ x0: x - 0.85 * s, y0: y - 0.8 * s, x1: x + 0.55 * s, y1: y - 0.05 * s }, tone, [{ angle: 0.5, spacing: 4, at: 0.3 }, { angle: -0.4, spacing: 4.5, at: 0.6 }], 71, { step: 4 }))
  const open = (o.sing ?? 0) * 0.35
  const bx = x + 0.5 * s
  const by = y - 0.64 * s
  const upper = `M${P(bx, by - 4)}L${P(bx + 0.2 * s, by - 2 - open * 20)}L${P(bx + 2, by + 3)}Z`
  const lower = `M${P(bx, by + 2)}L${P(bx + 0.18 * s, by + 5 + open * 36)}L${P(bx, by + 7)}Z`
  let out = fillD(spline(pts), PLATE_TONE) + pen(shade, 0.8) + pen(spline(pts), 1.5)
  // The wing, its white bars in reserve, and the eye.
  out += pen(`M${P(x - 0.2 * s, y - 0.52 * s)}Q${P(x + 0.05 * s, y - 0.6 * s)} ${P(x + 0.2 * s, y - 0.44 * s)}Q${P(x - 0.05 * s, y - 0.3 * s)} ${P(x - 0.3 * s, y - 0.38 * s)}`, 1.3)
  out += fillD(`M${P(x - 0.12 * s, y - 0.5 * s)}L${P(x + 0.08 * s, y - 0.5 * s)}L${P(x + 0.04 * s, y - 0.46 * s)}L${P(x - 0.14 * s, y - 0.46 * s)}Z`, PAPER)
  out += fillD(upper + lower, INK) + fillD(circ(x + 0.38 * s, y - 0.66 * s, 3.4), INK) + fillD(circ(x + 0.385 * s, y - 0.667 * s, 1.1), PAPER)
  out += pen(`M${P(x - 0.02 * s, y - 0.12 * s)}L${P(x - 0.04 * s, y + 4)}M${P(x + 0.08 * s, y - 0.12 * s)}L${P(x + 0.08 * s, y + 4)}`, 1.6)
  return out
}

/* ── fig. 7, the drawer: species unknown ────────────────────────────── */

function moth(x, y, s, seed) {
  const rand = seq(seed)
  const span = 0.8 + rand() * 0.5
  const f = [[0, -8], [40 * span, -30], [70 * span, -26], [62 * span, 0], [8, 6]]
  const h = [[4, 6], [48 * span, 10], [44 * span, 34], [6, 22]]
  const wingD = (pts, flip) => spline(place(pts, x, y, s / 70, flip))
  const kind = seed % 3
  let d = wingD(f, 1) + wingD(f, -1) + wingD(h, 1) + wingD(h, -1)
  let marks = ''
  for (const flip of [1, -1]) {
    if (kind === 0) marks += `M${P(x + flip * 20 * s / 70, y - 14 * s / 70)}L${P(x + flip * 52 * span * s / 70, y - 18 * s / 70)}`
    if (kind === 1) marks += circ(x + flip * 40 * span * s / 70, y - 12 * s / 70, 5 * s / 70)
    if (kind === 2) marks += `M${P(x + flip * 12 * s / 70, y + 12 * s / 70)}L${P(x + flip * 36 * span * s / 70, y + 22 * s / 70)}`
  }
  return { wings: d, marks, body: ellipse(x, y + 4 * s / 70, 4 * s / 70, 22 * s / 70) }
}

function drawerScene(ctx, now) {
  const { dx, slot } = ctx.P.drawer
  const T = ctx.T
  const W = 1060
  const Hh = 470
  const x0 = dx - W / 2
  const y0 = 128
  const cols = 5
  const rows = 3
  const cw = (W - 60) / cols
  const ch = (Hh - 60) / rows
  const cell = (c, rr) => [x0 + 30 + cw * (c + 0.5), y0 + 30 + ch * (rr + 0.5) - 14]
  const stat = memo(`drawer-${ctx.id}`, () => {
    const felt = (x, y) => (x > x0 + 26 && x < x0 + W - 26 && y > y0 + 26 && y < y0 + Hh - 26 ? 0.3 : 0)
    const feltD = hatchD({ x0, y0, x1: x0 + W, y1: y0 + Hh, tone: felt, angle: 0.78, spacing: 8, at: 0.2, step: 14, seed: 81 })
    const woodTone = (x, y) => (!(x > x0 + 26 && x < x0 + W - 26 && y > y0 + 26 && y < y0 + Hh - 26) ? 0.5 : 0)
    const wood = hatchD({ x0, y0, x1: x0 + W, y1: y0 + Hh, tone: woodTone, angle: 0, spacing: 4.5, at: 0.3, step: 14, seed: 83, bend: (x, y) => 2 * Math.sin(x / 40 + y / 9) })
    const frame = rectD(x0, y0, W, Hh) + rectD(x0 + 26, y0 + 26, W - 52, Hh - 52)
    const specimens = []
    let n = 0
    for (let rr = 0; rr < rows; rr++) {
      for (let c = 0; c < cols; c++) {
        if (c === slot[0] && rr === slot[1]) continue
        const [sx, sy] = cell(c, rr)
        const m = moth(sx, sy, 62 + (n % 3) * 8, 90 + n)
        const shade = hatchD({ x0: sx - 70, y0: sy - 40, x1: sx + 70, y1: sy + 40, tone: (px, py) => (py > sy - 4 ? 0.6 : 0.25), angle: 1.2, spacing: 3.5, at: 0.2, step: 5, seed: 100 + n })
        specimens.push({ c, rr, x: sx, y: sy, ...m, shade, blue: n % 4 === 1 })
        n++
      }
    }
    return { feltD, wood, frame, specimens }
  })
  let out = pen(stat.feltD, 0.8, { opacity: 0.8 }) + pen(stat.wood, 0.9) + pen(stat.frame, 2)
  // "I want to get to know her": the specimens are pinned, two a word.
  const words = ctx.W.know
  stat.specimens.forEach((sp, i) => {
    const w = words[Math.min(words.length - 1, Math.floor(i / 2))]
    const k = land(now, w.t + (i % 2) * 0.12, 0.3)
    if (k <= 0) return
    const clip = `${ctx.uid}-moth-${i}`
    out += `<g${op(k)}>${sp.blue ? wash(ctx, sp.x, sp.y - 4, 70, 36, ramp(now, T.her2 + 0.3, T.her2 + 1.2), { seed: 120 + i }) : ''}${clipPath(clip, sp.wings)}<g clip-path="url(#${clip})">${pen(sp.shade, 0.7)}</g>${pen(sp.wings, 1.3)}${pen(sp.marks, 1.8)}${fillD(sp.body, INK)}${fillD(circ(sp.x, sp.y - 20, 3), INK)}${pen(rectD(sp.x - 34, sp.y + 50, 68, 18), 1)}${pen(`M${P(sp.x - 26, sp.y + 57)}h${22 + (i % 3) * 8}M${P(sp.x - 26, sp.y + 62)}h${14 + (i % 4) * 6}`, 0.9)}</g>`
  })
  // Her slot: a pin and a blank label.
  const [hx, hy] = cell(...slot)
  out += pen(rectD(hx - 34, hy + 50, 68, 18), 1)
  // "she remains my mystery": the lens.
  const lensIn = easeInOut(ramp(now, T.she2 - 0.3, T.mystery + 0.1))
  if (lensIn > 0) {
    const lx = lerp(hx + 420, hx, lensIn)
    const ly = lerp(hy + 260, hy, lensIn)
    const R = 104
    const clip = `${ctx.uid}-lens`
    const inner = memo(`lens-${ctx.id}`, () => layered({ x0: -R, y0: -R, x1: R, y1: R }, (x, y) => (Math.hypot(x, y) < R ? 0.55 : 0), [{ angle: 0.78, spacing: 5, at: 0.1 }, { angle: -0.78, spacing: 5.5, at: 0.4 }], 131, { step: 8 }))
    const face = land(now, T.mystery - 0.1, 0.9)
    out += `${clipPath(clip, circ(lx, ly, R))}<g clip-path="url(#${clip})">${fillD(circ(lx, ly, R), PLATE_TONE)}<g transform="translate(${r(lx)} ${r(ly)})">${pen(inner, 0.9)}</g>${her(herD(PROFILE, lx - 8, ly + 26, 150), face)}</g>`
    out += pen(circ(lx, ly, R) + circ(lx, ly, R + 10), 3) + pen(`M${P(lx + (R + 10) * 0.7, ly + (R + 10) * 0.7)}L${P(lx + 230, ly + 230)}`, 18) + pen(`M${P(lx + 150, ly + 150)}L${P(lx + 230, ly + 230)}`, 24, { opacity: 0.9 })
  }
  out += caption(ctx, dx, 634, 'fig. 7 — species unknown', INK, lensIn)
  return { main: out }
}

/* ── fig. 8, flowers in her hair ────────────────────────────────────── */

function cornflower(x, y, s, rot = 0) {
  let d = ''
  for (let i = 0; i < 9; i++) {
    const a = rot + (i / 9) * Math.PI * 2
    const c = Math.cos(a)
    const sn = Math.sin(a)
    const tip = (k, w) => [x + c * s * k - sn * s * w, y + sn * s * k + c * s * w]
    d += `M${P(...tip(0.25, 0))}L${P(...tip(0.8, -0.2))}L${P(...tip(1, -0.12))}L${P(...tip(0.92, 0))}L${P(...tip(1.02, 0.1))}L${P(...tip(0.8, 0.2))}Z`
  }
  return { petals: d, heart: circ(x, y, s * 0.26) }
}
function forgetMeNot(x, y, s) {
  let d = ''
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2
    d += circ(x + Math.cos(a) * s * 0.5, y + Math.sin(a) * s * 0.5, s * 0.42)
  }
  return { petals: d, heart: circ(x, y, s * 0.2) }
}

function portraitScene(ctx, now) {
  const { px } = ctx.P.portrait
  const T = ctx.T
  const cy = 364
  const rx = 262
  const ry = 280
  const head = { x: px + 20, y: 404, s: 430 }
  const stat = memo(`portrait-${ctx.id}`, () => {
    const pts = place(PROFILE, head.x, head.y, head.s)
    // Engraved background: horizontal lines, dark behind her, lost at her face.
    const tone = (x, y) => {
      if (((x - px) / rx) ** 2 + ((y - cy) / ry) ** 2 > 1) return 0
      const u = (x - (px - rx)) / (2 * rx)
      return 0.95 - 0.68 * smooth(u * 1.25)
    }
    const back = layered({ x0: px - rx, y0: cy - ry, x1: px + rx, y1: cy + ry }, tone, [{ angle: 0, spacing: 5, at: 0.12 }, { angle: 0.5, spacing: 6, at: 0.5 }, { angle: -0.9, spacing: 6.5, at: 0.78 }], 141, { step: 10 })
    // The hair: flowing lines inside the back of the head, where the flowers sit.
    const hair = []
    for (let i = 0; i < 14; i++) {
      const u = i / 13
      const a0 = [head.x + (-0.25 + 0.35 * u) * head.s * 0.6, head.y - 0.7 * head.s]
      const pts2 = []
      for (let k = 0; k <= 8; k++) {
        const v = k / 8
        pts2.push([head.x + (-0.05 - 0.28 * Math.sin(v * 2.6) - 0.06 * u) * head.s + 10 * u, head.y + (-0.68 + 1.0 * v) * head.s * 0.92 + u * 20])
      }
      pts2[0] = a0
      hair.push(pts2)
    }
    const hairD = hair.map((p) => spline(p, false)).join('')
    // The flowers: along the crown and down the back of the head.
    const spots = [[-0.06, -0.7, 1.0], [-0.18, -0.64, 0.9], [-0.27, -0.52, 1.1], [-0.3, -0.36, 0.85], [-0.28, -0.2, 1.0], [0.06, -0.72, 0.8], [-0.1, -0.56, 0.7], [-0.2, -0.42, 0.75], [-0.22, -0.06, 0.8], [0.13, -0.69, 0.65], [-0.34, -0.1, 0.7]]
    const flowers = spots.map(([u, v, k], i) => {
      const [fx, fy] = [head.x + u * head.s, head.y + v * head.s]
      const f = i % 3 === 2 ? forgetMeNot(fx, fy, 30 * k) : cornflower(fx, fy, 44 * k, i * 0.7)
      return { ...f, x: fx, y: fy, s: 44 * k }
    })
    return { pts, d: spline(pts), back, hairD, flowers }
  })
  const clip = `${ctx.uid}-medal`
  const sweep = smooth(ramp(now, T.that2 - 1.6, T.woman2 + 0.5))
  const rim = easeInOut(ramp(now, T.that2 - 2.8, T.that2 - 0.4))
  let out = `${clipPath(clip, ellipse(px, cy, rx, ry))}${sweepClip(`${clip}-s`, px - rx - 60, lerp(px - rx - 60, px + rx + 60, sweep), 11)}`
  out += `<g clip-path="url(#${clip})"><g clip-path="url(#${clip}-s)">${pen(stat.back, 1.0)}</g>${her(stat.d, sweep)}</g>`
  out += drawn(ellipse(px, cy, rx, ry), 1.6, rim) + drawn(ellipse(px, cy, rx + 12, ry + 12), 1.6, rim)
  // The flowers come one after another from "flowers" to "hair", and the blue after them.
  const t0 = T.flowers - 0.1
  const t1 = T.hair + 0.1
  stat.flowers.forEach((f, i) => {
    const at = lerp(t0, t1, i / (stat.flowers.length - 1))
    const k = easeOut(ramp(now, at, at + 0.3))
    if (k <= 0) return
    const tr = `translate(${r(f.x)} ${r(f.y)}) scale(${r(0.4 + 0.6 * k, 3)}) translate(${r(-f.x)} ${r(-f.y)})`
    out += `<g transform="${tr}">${fillD(f.petals, PAPER)}${wash(ctx, f.x, f.y, f.s * 1.2, f.s * 1.2, ramp(now, at + 0.3, at + 1.1), { seed: 150 + i })}${pen(f.petals, 1.3)}${fillD(f.heart, INK)}</g>`
  })
  // A flower fallen from her hair, outside the frame, which is what the thread may pin.
  const fall = land(now, T.flowers - 0.3, 0.4)
  if (fall > 0) {
    const cf = cornflower(px - rx - 60, 560, 30, 0.4)
    out += `<g${op(fall)}>${wash(ctx, px - rx - 60, 560, 40, 40, ramp(now, T.hair, T.hair + 0.9), { seed: 170 })}${pen(cf.petals, 1.2)}${fillD(cf.heart, INK)}${pen(`M${P(px - rx - 60, 580)}Q${P(px - rx - 40, 620)} ${P(px - rx - 90, 660)}`, 1.6)}</g>`
  }
  out += caption(ctx, px, 676, 'fig. 8 — flowers in her hair', INK, sweep)
  return { main: out }
}

/* ── The night: fig. 9, the universe; fig. 10, beside her; fig. 11 ─── */

const NIGHT_LAYERS = [{ angle: 0.42, spacing: 6.5, at: 0.05 }, { angle: -0.62, spacing: 7, at: 0.36 }, { angle: 0.02, spacing: 7.5, at: 0.62 }]
const TILE = 500

function nightTone(night, x, y) {
  const a = smooth((x - night.from) / 560)
  const b = smooth((night.to - x) / 700)
  return 0.8 * Math.min(a, b) + (y > 640 ? 0.1 : 0)
}

/**
 * The night field, whole: straight lines are only their endpoints, so four and
 * a half thousand units of three-layer night is about forty kilobytes. Tiling
 * it was cheaper to draw and wrong to look at — two tiles' lines overlapped at
 * every join, and anti-aliased edges drawn twice left a darker stripe there.
 */
function nightField(ctx) {
  const night = ctx.P.night
  return memo(`night-${ctx.id}`, () => {
    const hatch = layered({ x0: night.from, y0: TOP, x1: night.to, y1: BOTTOM }, (x, y) => nightTone(night, x, y), NIGHT_LAYERS, 200, { step: 10 })
    let stars = ''
    let rays = ''
    for (const [sx, sy, big] of starsIn(ctx.P, night.from, night.to)) {
      stars += circ(sx, sy, big ? 3.2 : 1.1 + hash(Math.round(sx), Math.round(sy), 5) * 1.3)
      if (big) rays += `M${P(sx - 11, sy)}H${r(sx + 11)}M${P(sx, sy - 11)}V${r(sy + 11)}`
    }
    return { hatch, stars, rays }
  })
}

/** Stars between x0 and x1: [x, y, bright]. Fewer over the stage, fewest round her face. */
function starsIn(Pl, x0, x1) {
  const out = []
  const density = (x) => (x < Pl.stage2.sx - 500 ? 1 : x < Pl.face.fx - 700 ? 0.45 : 0.12)
  for (let k = Math.floor(x0 / TILE); k <= Math.floor(x1 / TILE); k++) {
    for (let i = 0; i < 44; i++) {
      const sx = k * TILE + hash(k, i, 1) * TILE
      const sy = TOP + 20 + hash(k, i, 2) ** 1.4 * 520
      if (sx < x0 || sx > x1 || hash(k, i, 3) > density(sx) || nightTone(Pl.night, sx, sy) < 0.5) continue
      out.push([sx, sy, hash(k, i, 4) > 0.84])
    }
  }
  return out
}

const ORBITS = [{ rx: 130, w: 0.9, p: 14, a0: 0.4 }, { rx: 210, w: 0.55, p: 20, a0: 2.2 }, { rx: 295, w: 0.36, p: 17, a0: 4.1, ring: true }, { rx: 385, w: 0.22, p: 25, a0: 5.4 }]

function universeScene(ctx, now) {
  const { ux, sun, woman } = ctx.P.universe
  const T = ctx.T
  const S = ctx.orbitClock(now)
  let out = ''
  out += wash(ctx, ux, 300, 900, 300, ramp(now, T.universe - 0.1, T.universe + 0.9), { seed: 181, opacity: 0.9 })
  // The orrery: paper orbits, paper planets, a sun in reserve.
  const tilt = -0.14
  const orb = (o, a) => {
    const x = Math.cos(a) * o.rx
    const y = Math.sin(a) * o.rx * 0.34
    return [sun[0] + x * Math.cos(tilt) - y * Math.sin(tilt), sun[1] + x * Math.sin(tilt) + y * Math.cos(tilt)]
  }
  let orbits = ''
  let planets = ''
  let shade = ''
  for (const o of ORBITS) {
    orbits += `<ellipse cx="${r(sun[0])}" cy="${r(sun[1])}" rx="${o.rx}" ry="${r(o.rx * 0.34)}" transform="rotate(${r((tilt * 180) / Math.PI, 2)} ${r(sun[0])} ${r(sun[1])})" fill="none" stroke="${PAPER}" stroke-width="1.8" opacity="0.8"/>`
    const [x, y] = orb(o, o.a0 + o.w * S)
    planets += circ(x, y, o.p)
    shade += `M${P(x, y - o.p)}A${o.p} ${o.p} 0 0 1 ${P(x, y + o.p)}A${r(o.p * 0.5)} ${o.p} 0 0 0 ${P(x, y - o.p)}Z`
    if (o.ring) orbits += `<ellipse cx="${r(x)}" cy="${r(y)}" rx="${r(o.p * 2)}" ry="${r(o.p * 0.5)}" transform="rotate(-18 ${r(x)} ${r(y)})" fill="none" stroke="${PAPER}" stroke-width="2"/>`
  }
  const stareK = land(now, T.stare - 0.1, 0.7) * (1 - ramp(now, T.stare + 3.4, T.stare + 5))
  // The sun: rays that point at her on "stare".
  let sunRays = ''
  const [hx, hy] = [woman.x, woman.y - woman.s * 0.93]
  const toHer = Math.atan2(hy - sun[1], hx - sun[0])
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2
    const pull = stareK * 0.9
    const da = Math.atan2(Math.sin(toHer - a), Math.cos(toHer - a))
    const aa = a + da * pull
    const L = 26 + 20 * (i % 2) + stareK * 60
    sunRays += `M${P(sun[0] + Math.cos(aa) * 34, sun[1] + Math.sin(aa) * 34)}L${P(sun[0] + Math.cos(aa) * (34 + L), sun[1] + Math.sin(aa) * (34 + L))}`
  }
  out += orbits + fillD(planets, PAPER) + fillD(shade, INK, { opacity: 0.7 }) + pen(sunRays, 1.6, { stroke: PAPER }) + fillD(circ(sun[0], sun[1], 28), PAPER) + pen(circ(sun[0], sun[1], 20), 1.2)
  // The hill she stands on.
  out += fillD(memo(`hill-${ctx.id}`, () => {
    const pts = []
    // The hill rises out of the foot of the plate on the left, so it has no end to see.
    for (let x = woman.x - 420; x <= woman.x + 1000; x += 40) {
      const rise = smooth((x - woman.x + 420) / 260)
      pts.push([x, lerp(BOTTOM + 30, woman.y + 4 + 30 * (1 - Math.exp(-(((x - woman.x) / 380) ** 2))) * 1.4 + (x - woman.x) * 0.02, rise)])
    }
    return spline([...pts, [woman.x + 1000, BOTTOM + 20], [woman.x - 420, BOTTOM + 30]])
  }), INK, { opacity: 0.55 })
  // Her: she moves; on "stop" the universe stops, and so does she.
  const sway = Math.sin(now * 0.8) * 1.4 * (1 - ramp(now, T.stop, T.stop + 0.5)) * ramp(now, T.moves - 0.4, T.moves)
  out += `<g transform="rotate(${r(sway, 2)} ${r(woman.x)} ${r(woman.y)})">${herFig(standParts(woman.x, woman.y, woman.s))}</g>`
  // "stare": every bright star turns a ray on her.
  if (stareK > 0) out += `<g data-stare="1">${ctx.stareRays(hx, hy, stareK)}</g>`
  out += caption(ctx, ux, 676, 'fig. 9 — the universe, stopped', PAPER, ramp(now, T.stop, T.stop + 0.6))
  return { main: out }
}

function stage2Scene(ctx, now) {
  const { sx } = ctx.P.stage2
  const T = ctx.T
  const top = 470
  const stat = memo(`stage2-${ctx.id}`, () => {
    const deck = (x, y) => (y > top - 40 && y < top ? 0.3 : y >= top && y < 560 ? 0.55 + 0.1 * Math.sin(x / 12) : 0)
    const d = layered({ x0: sx - 620, y0: top - 40, x1: sx + 620, y1: 560 }, deck, [{ angle: Math.PI / 2, spacing: 6, at: 0.2 }, { angle: 0.1, spacing: 7, at: 0.5 }], 211, { step: 8 })
    let heads = ''
    for (let i = 0; i < 17; i++) {
      const hx = sx - 540 + i * 66 + hash(i, 1, 3) * 20
      const hy = 604 + hash(i, 2, 3) * 22
      heads += `M${P(hx - 42, BOTTOM + 10)}Q${P(hx - 40, hy + 40)} ${P(hx - 16, hy + 32)}A22 26 0 1 1 ${P(hx + 16, hy + 32)}Q${P(hx + 40, hy + 40)} ${P(hx + 42, BOTTOM + 10)}Z`
    }
    return { d, heads, edge: `M${P(sx - 620, top - 40)}H${r(sx + 620)}M${P(sx - 620, top)}H${r(sx + 620)}` }
  })
  let out = pen(stat.d, 1.0) + pen(stat.edge, 1.8, { stroke: PAPER, opacity: 0.8 })
  const spot = (x, k) => {
    if (k <= 0) return ''
    const cone = (w0, w1) => `M${P(x - w0, TOP)}L${P(x + w0, TOP)}L${P(x + w1, top - 20)}A${r(w1)} 18 0 0 1 ${P(x - w1, top - 20)}Z`
    return fillD(cone(30, 150), PLATE_TONE, { opacity: 0.4 * k }) + fillD(cone(18, 118), PLATE_TONE, { opacity: 0.78 * k }) + fillD(ellipse(x, top - 20, 118, 18), PAPER, { opacity: 0.85 * k })
  }
  const a = sx - 190
  const b = sx + 190
  out += spot(a, 1)
  out += spot(b, land(now, T.beside - 0.05, 0.4))
  out += wash(ctx, b, top - 40, 150, 90, ramp(now, T.be - 0.1, T.be + 0.8), { seed: 221 })
  out += herFig(standParts(a, top - 18, 300))
  out += fillD(stat.heads, INK)
  out += caption(ctx, sx, 588, 'fig. 10 — beside her', PAPER, land(now, T.beside, 0.5))
  return { main: out }
}

function faceScene(ctx, now) {
  const { fx } = ctx.P.face
  const T = ctx.T
  const s = 560
  const oy = 438
  const face = { x: fx + FACE.x * s, y: oy + FACE.y * s, rx: FACE.rx * s, ry: FACE.ry * s }
  const stat = memo(`face-${ctx.id}`, () => {
    // The darkest part of the plate: a fourth layer, deepest round her.
    const tone = (x, y) => 0.95 * Math.exp(-(((x - fx) / 620) ** 2 + ((y - 340) / 520) ** 2))
    const deep = [
      hatchD({ x0: fx - 800, y0: TOP, x1: fx + 800, y1: BOTTOM, tone, angle: 0.95, spacing: 6, at: 0.45, step: 10, seed: 231 }),
      hatchD({ x0: fx - 800, y0: TOP, x1: fx + 800, y1: BOTTOM, tone, angle: -0.15, spacing: 6.5, at: 0.7, step: 10, seed: 232 }),
    ].join('')
    // Hair: from the parting, over the crown and down her right side in waves
    // to the shoulder; and a few strands tucked back behind the ear.
    const part = [fx + 0.07 * s, oy - 0.6 * s]
    const strands = []
    for (let i = 0; i < 15; i++) {
      const p = (i + 0.5) / 15
      const pts = [[part[0] - i * 2.4, part[1] + i * 1.6]]
      for (let k = 1; k <= 12; k++) {
        const th = -Math.PI / 2 - (k / 12) * Math.PI * 0.55
        const rrx = lerp(face.rx + 8, 0.285 * s, p)
        const rry = lerp(face.ry + 14, 0.33 * s, p)
        pts.push([face.x + Math.cos(th) * rrx, face.y + Math.sin(th) * rry])
      }
      for (let k = 1; k <= 6; k++) {
        const v = k / 6
        const x = face.x - lerp(face.rx + 6, 0.29 * s, p) + 0.018 * s * Math.sin(v * 5 + p * 2) - v * 0.02 * s
        pts.push([x, face.y + face.ry * 0.3 + v * (0.62 * s - p * 0.08 * s)])
      }
      strands.push(pts)
    }
    for (let i = 0; i < 8; i++) {
      const p = (i + 0.5) / 8
      const pts = [[part[0] + i * 1.2, part[1] + i * 1.8]]
      for (let k = 1; k <= 7; k++) {
        const th = -Math.PI / 2 + (k / 7) * Math.PI * 0.42
        pts.push([face.x + Math.cos(th) * lerp(face.rx + 6, 0.215 * s, p), face.y + Math.sin(th) * lerp(face.ry + 10, 0.3 * s, p)])
      }
      strands.push(pts)
    }
    const cf = [[-0.2, -0.5, 36, 0.2], [-0.25, -0.38, 28, 1.1], [-0.13, -0.585, 26, 2.0]].map(([u, w, rad, rot]) => ({ ...cornflower(fx + u * s, oy + w * s, rad, rot), x: fx + u * s, y: oy + w * s, rad }))
    return { deep, silhouette: herD(FRONT, fx, oy, s), hair: strands.map((p) => spline(p, false)).join(''), cf, ear: [fx + 0.198 * s, oy - 0.25 * s] }
  })
  const wipe = easeInOut(ramp(now, T.asked - 0.1, T.name + 0.15))
  const looked = easeOut(ramp(now, T.looked - 0.05, T.looked + 0.3))
  const electric = land(now, T.straight - 0.05, 0.4)
  const bite = 1 + 0.6 * looked
  let out = wash(ctx, fx, 330, 520, 360, ramp(now, T.straight - 0.1, T.me + 0.5), { seed: 241, opacity: 0.95 })
  out += pen(stat.deep, 1.1 * bite)
  // The glow round her: the plate burnished back to its tone, breathing.
  if (electric > 0) {
    const br = 0.94 + 0.06 * Math.sin((now - T.straight) * 2.2)
    for (let i = 0; i < 4; i++) {
      const k = 1 + i * 0.16
      out += fillD(blobD(fx, 330, 300 * k * br, 330 * k * br, 250 + i, 14, 0.12), PLATE_TONE, { opacity: electric * (0.22 - i * 0.04) })
    }
    out += wash(ctx, fx, 330, 360, 380, electric, { seed: 244, opacity: 0.8 })
    out += bolts(ctx, 'face', fx, 330, 270, T.straight, now, 26, 460, 2.4)
  }
  out += her(stat.silhouette, wipe)
  out += pen(stat.hair, 0.9, { opacity: 0.6 * wipe })
  // A pearl at her ear — ivory — and the cornflowers from her portrait.
  out += `<g${op(wipe)}>${pen(`M${P(stat.ear[0], stat.ear[1])}v14`, 1.1)}${fillD(circ(stat.ear[0], stat.ear[1] + 22, 8), PAPER)}${pen(circ(stat.ear[0], stat.ear[1] + 22, 8), 1.3)}${pen(`M${P(stat.ear[0] + 2, stat.ear[1] + 18)}a4 4 0 0 1 3 4`, 1, { opacity: 0.6 })}</g>`
  stat.cf.forEach((f, i) => {
    const k = land(now, T.name - 0.3 + i * 0.12, 0.35) * wipe
    if (k > 0) out += `<g${op(k)}>${fillD(f.petals, PAPER)}${wash(ctx, f.x, f.y, f.rad * 1.3, f.rad * 1.3, ramp(now, T.looked, T.looked + 0.9), { seed: 260 + i })}${pen(f.petals, 1.2)}${fillD(f.heart, INK)}</g>`
  })
  // The eyes: shut on "name", open on "looked" — blue, and looking out.
  const eyesK = land(now, T.name, 0.3)
  if (eyesK > 0) {
    for (const side of [-1, 1]) {
      const ex = face.x + side * face.rx * 0.46
      const ey = face.y - face.ry * 0.08
      const w = face.rx * 0.36
      const hOpen = 13 * looked
      const upper = `M${P(ex - w, ey)}Q${P(ex, ey - 4 - hOpen * 2)} ${P(ex + w, ey)}`
      const lower = `M${P(ex - w, ey)}Q${P(ex, ey + 2 + hOpen * 1.1)} ${P(ex + w, ey)}`
      if (looked > 0.05) {
        const clip = `${ctx.uid}-eye-${side}`
        out += `${clipPath(clip, `${upper}Q${P(ex, ey + 2 + hOpen * 1.1)} ${P(ex - w, ey)}Z`)}<g clip-path="url(#${clip})">${fillD(circ(ex, ey + 1, 13), BLUE)}${pen(circ(ex, ey + 1, 13), 1.4)}${fillD(circ(ex, ey + 1, 5.5), INK)}${fillD(circ(ex + 4, ey - 3, 2.4), PAPER)}</g>`
      }
      // Lashes, a few, at the outer corner.
      let lashes = ''
      for (let j = 0; j < 4; j++) {
        const lx = ex + side * w * (0.45 + j * 0.16)
        const ly = ey - 3 - hOpen * 1.7 * (1 - ((j * 0.16 + 0.45) ** 2))
        lashes += `M${P(lx, ly)}l${r(side * (4 + j * 1.5))} ${r(-6 - j)}`
      }
      out += `<g${op(eyesK)}>${pen(upper, 2.6)}${pen(lashes, 1.3, { opacity: looked })}${pen(lower, 1.0, { opacity: 0.8 * looked })}${pen(`M${P(ex - side * w * 1.0, ey - 20)}Q${P(ex + side * w * 0.2, ey - 34)} ${P(ex + side * w * 1.15, ey - 22)}`, 1.1, { opacity: 0.75 })}</g>`
    }
    const mx = face.x
    const my = face.y + face.ry * 0.62
    const lips = `M${P(mx - 19, my)}Q${P(mx - 9, my - 7)} ${P(mx, my - 3)}Q${P(mx + 9, my - 7)} ${P(mx + 19, my)}Q${P(mx, my + 3)} ${P(mx - 19, my)}ZM${P(mx - 15, my + 2)}Q${P(mx, my + 13)} ${P(mx + 15, my + 2)}`
    out += `<g${op(eyesK * 0.7)}>${pen(`M${P(face.x + 4, face.y + 22)}Q${P(face.x + 8, face.y + 48)} ${P(face.x + 1, face.y + 56)}M${P(face.x - 7, face.y + 58)}Q${P(face.x, face.y + 62)} ${P(face.x + 7, face.y + 58)}`, 1.0)}${pen(lips, 1.2)}</g>`
  }
  out += caption(ctx, fx, 664, 'fig. 11 —', INK, wipe)
  return { main: out }
}

/* ── fig. 12, paradise and a melody: the keyboard ───────────────────── */

const MELODY = [14, 16, 18, 19, 21, 18, 16, 14, 13, 14, 16, 11]

function keyboard(ctx, name, kx, now, lidAt, playAt, o = {}) {
  const x0 = kx - 540
  const keysTop = 470
  const keysBottom = 612
  const n = 28
  const kw = 1080 / n
  const stat = memo(`keys-${name}-${ctx.id}`, () => {
    const caseTone = (x, y) => ((y > 420 && y < keysTop) || (y > keysBottom && y < 646) ? 0.5 + 0.2 * Math.sin(x / 9) : 0)
    const caseD = hatchD({ x0: x0 - 40, y0: 420, x1: x0 + 1120, y1: 646, tone: caseTone, angle: Math.PI / 2, spacing: 5, at: 0.3, step: 10, seed: 260 + name.length })
    const cheeks = (x, y) => (y > 404 && y < 660 && (x < x0 || x > x0 + 1080) ? 0.7 : 0)
    const cheekD = layered({ x0: x0 - 48, y0: 404, x1: x0 + 1128, y1: 660 }, cheeks, [{ angle: 0.9, spacing: 5, at: 0.2 }, { angle: -0.4, spacing: 6, at: 0.55 }], 270, { step: 6 })
    const outline = rectD(x0 - 48, 404, 1176, 256) + `M${P(x0, 420)}H${r(x0 + 1080)}M${P(x0, keysTop)}H${r(x0 + 1080)}M${P(x0, keysBottom)}H${r(x0 + 1080)}M${P(x0, 404)}V660M${P(x0 + 1080, 404)}V660`
    // The painting inside the lid: paradise. Hills, palms, a fountain, birds.
    const L = { x0: x0 + 20, x1: x0 + 1060, y0: 120, y1: 400 }
    const skyTone = (x, y) => (y < 290 ? 0.12 + 0.3 * ((290 - y) / 170) : 0)
    const sky = hatchD({ ...L, tone: skyTone, angle: 0, spacing: 6, at: 0.1, step: 14, seed: 280 })
    const hillsD = `M${P(L.x0, 300)}Q${P(L.x0 + 200, 250)} ${P(L.x0 + 420, 290)}Q${P(L.x0 + 640, 330)} ${P(L.x0 + 820, 270)}Q${P(L.x0 + 950, 240)} ${P(L.x1, 280)}`
    const hillTone = (x, y) => (y > 290 + 20 * Math.sin((x - L.x0) / 120) && y < 400 ? 0.45 : 0)
    const hillsH = hatchD({ ...L, tone: hillTone, angle: 0.3, spacing: 5.5, at: 0.2, step: 10, seed: 281 })
    const palm = (x, y, h) => {
      let d = `M${P(x, y)}Q${P(x + 10, y - h * 0.6)} ${P(x - 6, y - h)}`
      for (let i = 0; i < 7; i++) {
        const a = -Math.PI + (i / 6) * Math.PI
        d += `M${P(x - 6, y - h)}Q${P(x - 6 + Math.cos(a) * 30, y - h - 20 + Math.sin(a) * 10)} ${P(x - 6 + Math.cos(a) * 58, y - h + 14 + Math.abs(Math.cos(a)) * 20)}`
      }
      return d
    }
    const fountain = (x, y) => `M${P(x - 60, y)}Q${P(x, y + 18)} ${P(x + 60, y)}M${P(x - 60, y)}Q${P(x, y - 14)} ${P(x + 60, y)}M${P(x, y - 6)}V${r(y - 60)}M${P(x, y - 60)}Q${P(x - 40, y - 90)} ${P(x - 52, y - 10)}M${P(x, y - 60)}Q${P(x + 40, y - 90)} ${P(x + 52, y - 10)}M${P(x, y - 60)}Q${P(x - 14, y - 110)} ${P(x - 20, y - 20)}M${P(x, y - 60)}Q${P(x + 14, y - 110)} ${P(x + 20, y - 20)}`
    const birds = [[L.x0 + 300, 180], [L.x0 + 340, 160], [L.x0 + 700, 170], [L.x0 + 740, 196]].map(([x, y]) => `M${P(x - 14, y)}Q${P(x - 6, y - 8)} ${P(x, y)}Q${P(x + 6, y - 8)} ${P(x + 14, y)}`).join('')
    const art = pen(sky, 0.8) + pen(hillsH, 0.8) + pen(hillsD, 1.4) + pen(palm(L.x0 + 170, 380, 150) + palm(L.x0 + 250, 390, 110) + palm(L.x0 + 880, 385, 140), 2) + pen(fountain(kx, 370), 1.6) + pen(birds, 1.4) + pen(rectD(L.x0 - 10, L.y0 - 10, L.x1 - L.x0 + 20, L.y1 - L.y0 + 20) + rectD(L.x0, L.y0, L.x1 - L.x0, L.y1 - L.y0), 1.4)
    return { caseD, cheekD, outline, art, L }
  })
  // The lid lifts on "paradise": the painting inside it rises, foreshortened, from the case.
  const lift = easeInOut(ramp(now, lidAt - 0.2, lidAt + 0.6))
  let out = ''
  if (lift > 0.01) {
    const L = stat.L
    const tr = `translate(0 404) scale(1 ${r(lift, 4)}) translate(0 -404)`
    out += `<g transform="${tr}">${fillD(rectD(x0 - 30, 110, 1140, 294), PLATE_TONE)}${wash(ctx, kx - 200, 200, 520, 110, ramp(now, lidAt + 0.4, lidAt + 1.3), { seed: 290 })}${wash(ctx, kx, 380, 200, 36, ramp(now, lidAt + 0.6, lidAt + 1.5), { seed: 291 })}<g stroke-width="1" vector-effect="non-scaling-stroke">${stat.art}</g>${pen(rectD(x0 - 30, 110, 1140, 294), 2.2, { extra: ' vector-effect="non-scaling-stroke"' })}</g>`
  }
  out += pen(stat.caseD, 0.9) + pen(stat.cheekD, 1.0)
  // The keys: ivory in paper, ebony in ink. Pressed ones go down and darken.
  let white = ''
  let pressed = ''
  const press = (i) => {
    let k = 0
    MELODY.forEach((m, j) => {
      if (m !== i) return
      const at = playAt + j * 0.2857
      k = Math.max(k, land(now, at, 0.06) * (1 - ramp(now, at + 0.22, at + 0.34)))
    })
    return k
  }
  for (let i = 0; i < n; i++) {
    const k = press(i)
    const x = x0 + i * kw
    white += rectD(x, keysTop + k * 5, kw, keysBottom - keysTop - k * 3)
    if (k > 0.05) pressed += rectD(x + 3, keysTop + 8, kw - 6, 90)
  }
  out += fillD(white, PAPER) + pen(white, 1.2)
  if (pressed) out += fillD(pressed, INK, { opacity: 0.18 })
  let black = ''
  for (let i = 0; i < n - 1; i++) {
    if ([2, 6].includes(i % 7)) continue
    const x = x0 + (i + 1) * kw
    black += rectD(x - 11, keysTop, 22, 90)
  }
  out += fillD(black, INK) + pen(stat.outline, 1.8)
  // Notes rise from the keys that were played.
  let notes = ''
  MELODY.forEach((m, j) => {
    const at = playAt + j * 0.2857
    const age = now - at
    if (age < 0 || age > 2.6) return
    const x = x0 + (m + 0.5) * kw + Math.sin(age * 2 + j) * 14
    const y = keysTop - 30 - age * 120
    const o = 1 - age / 2.6
    notes += `<g${op(o)}>${fillD(ellipse(x, y, 10, 7), INK, { extra: ` transform="rotate(-22 ${r(x)} ${r(y)})"` })}${pen(`M${P(x + 9, y - 2)}V${r(y - 46)}${j % 2 ? `Q${P(x + 24, y - 36)} ${P(x + 20, y - 20)}` : ''}`, 2)}</g>`
  })
  out += notes
  return out
}

function pianoScene(ctx, now, which) {
  const { kx } = ctx.P[which]
  const T = ctx.T
  const lidAt = which === 'piano' ? T.paradise : T.paradise2
  const playAt = which === 'piano' ? T.play : T.play2
  let out = keyboard(ctx, which, kx, now, lidAt, playAt)
  out += caption(ctx, kx, 684, which === 'piano' ? 'fig. 12 — paradise, and a melody' : 'fig. 18 — a melody, in the snow', INK, land(now, lidAt, 0.6))
  return { main: out }
}

/* ── fig. 13, the locket ────────────────────────────────────────────── */

function heartD(x, y, s) {
  return `M${P(x, y + 0.9 * s)}C${P(x - 0.2 * s, y + 0.6 * s)} ${P(x - 0.95 * s, y + 0.2 * s)} ${P(x - 0.8 * s, y - 0.35 * s)}C${P(x - 0.68 * s, y - 0.78 * s)} ${P(x - 0.14 * s, y - 0.8 * s)} ${P(x, y - 0.38 * s)}C${P(x + 0.14 * s, y - 0.8 * s)} ${P(x + 0.68 * s, y - 0.78 * s)} ${P(x + 0.8 * s, y - 0.35 * s)}C${P(x + 0.95 * s, y + 0.2 * s)} ${P(x + 0.2 * s, y + 0.6 * s)} ${P(x, y + 0.9 * s)}Z`
}

function locket(ctx, name, lx, ly, now, o) {
  const rx = 118
  const ry = 148
  const L = [lx - 150, ly]
  const R = [lx + 150, ly]
  const stat = memo(`locket-${name}-${ctx.id}`, () => {
    const hd = heartD(L[0], L[1] + 4, 82)
    const hTone = (x, y) => 0.25 + 0.55 * clamp01((x - L[0] + 40) / 120) + 0.15 * clamp01((y - L[1]) / 80)
    const hShade = layered({ x0: L[0] - 90, y0: L[1] - 80, x1: L[0] + 90, y1: L[1] + 90 }, hTone, [{ angle: 0.7, spacing: 4.5, at: 0.2 }, { angle: -0.6, spacing: 5, at: 0.55 }], 301, { step: 6 })
    const vessels = `M${P(L[0] - 10, L[1] - 28)}Q${P(L[0] - 18, L[1] - 90)} ${P(L[0] + 30, L[1] - 96)}Q${P(L[0] + 60, L[1] - 92)} ${P(L[0] + 54, L[1] - 60)}M${P(L[0] + 20, L[1] - 40)}L${P(L[0] + 26, L[1] - 118)}M${P(L[0] - 34, L[1] - 40)}L${P(L[0] - 46, L[1] - 104)}`
    const back = layered({ x0: R[0] - rx, y0: R[1] - ry, x1: R[0] + rx, y1: R[1] + ry }, (x, y) => (((x - R[0]) / rx) ** 2 + ((y - R[1]) / ry) ** 2 < 1 ? 0.6 : 0), [{ angle: 0, spacing: 4.5, at: 0.1 }, { angle: 0.6, spacing: 5, at: 0.45 }], 303, { step: 8 })
    let beads = ''
    for (const c of [L, R]) for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2
      beads += circ(c[0] + Math.cos(a) * (rx + 12), c[1] + Math.sin(a) * (ry + 12), 3.2)
    }
    let rose = ''
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      rose += `M${P(R[0], ly)}Q${P(R[0] + Math.cos(a - 0.3) * 60, ly + Math.sin(a - 0.3) * 76)} ${P(R[0] + Math.cos(a) * 92, ly + Math.sin(a) * 118)}Q${P(R[0] + Math.cos(a + 0.3) * 60, ly + Math.sin(a + 0.3) * 76)} ${P(R[0], ly)}`
    }
    rose += ellipse(R[0], ly, 70, 88) + ellipse(R[0], ly, 40, 50) + ellipse(R[0], ly, rx - 14, ry - 14)
    const crack = `M${P(L[0] + 4, L[1] - 30)}L${P(L[0] - 10, L[1] - 6)}L${P(L[0] + 8, L[1] + 14)}L${P(L[0] - 6, L[1] + 34)}L${P(L[0] + 6, L[1] + 56)}L${P(L[0], L[1] + 80)}`
    let chain = ''
    for (let i = 0; i < 16; i++) {
      const u = i / 15
      const cx2 = lerp(lx, lx - 110, u)
      const cy2 = lerp(ly - ry - 18, TOP + 10, u) + Math.sin(u * Math.PI) * 30
      chain += i % 2 ? ellipse(cx2, cy2, 4, 9) : ellipse(cx2, cy2, 8, 5)
    }
    return { hd, hShade, vessels, back, beads, rose, crack, chain }
  })
  const close = easeInOut(ramp(now, o.closeFrom, o.closeTo))
  const k = Math.cos(Math.PI * close)
  let main = pen(stat.chain, 1.6) + pen(`M${P(lx - 12, ly - ry - 6)}Q${P(lx, ly - ry - 30)} ${P(lx + 12, ly - ry - 6)}`, 3)
  // The left half: the heart.
  const hc = `${ctx.uid}-${name}-heart`
  main += fillD(ellipse(L[0], L[1], rx, ry), PLATE_TONE) + wash(ctx, L[0] + 10, L[1] - 10, 90, 100, o.blue, { seed: 311 })
  main += `${clipPath(hc, stat.hd)}<g clip-path="url(#${hc})">${pen(stat.hShade, 0.85)}</g>${pen(stat.hd, 1.8)}${pen(stat.vessels, 3)}`
  main += drawn(stat.crack, 2.2, o.crack)
  main += pen(ellipse(L[0], L[1], rx, ry) + ellipse(L[0], L[1], rx + 6, ry + 6), 2) + fillD(stat.beads.slice(0, stat.beads.length / 2), INK, { opacity: 0.8 })
  // The right half: her, inside — or, once it is past the hinge, the lid's outside.
  const half = (inner) => `<g transform="translate(${r(lx)} 0) scale(${r(k, 4)} 1) translate(${r(-lx)} 0)">${inner}</g>`
  let over = ''
  if (k > 0) {
    const rc = `${ctx.uid}-${name}-her`
    main += half(`${fillD(ellipse(R[0], R[1], rx, ry), PLATE_TONE)}${wash(ctx, R[0], R[1], 110, 130, o.blue, { seed: 312 })}${clipPath(rc, ellipse(R[0], R[1], rx, ry))}<g clip-path="url(#${rc})"><path d="${stat.back}" fill="none" stroke="${INK}" stroke-width="0.85" vector-effect="non-scaling-stroke"/>${her(herD(PROFILE, R[0] - 4, R[1] + 60, 190))}</g><path d="${ellipse(R[0], R[1], rx, ry)}${ellipse(R[0], R[1], rx + 6, ry + 6)}" fill="none" stroke="${INK}" stroke-width="2" vector-effect="non-scaling-stroke"/>`)
  }
  else {
    // Mirrored across the hinge, the lid now covers the heart: drawn over the thread.
    over += half(`${fillD(ellipse(R[0], R[1], rx + 6, ry + 6), PLATE_TONE)}<path d="${stat.rose}" fill="none" stroke="${INK}" stroke-width="1.1" vector-effect="non-scaling-stroke"/><path d="${ellipse(R[0], R[1], rx, ry)}${ellipse(R[0], R[1], rx + 6, ry + 6)}" fill="none" stroke="${INK}" stroke-width="2.2" vector-effect="non-scaling-stroke"/>${fillD(stat.beads.slice(stat.beads.length / 2), INK, { opacity: 0.8 })}`)
  }
  return { main, over }
}

function locketScene(ctx, now) {
  const { lx } = ctx.P.locket
  const T = ctx.T
  const res = locket(ctx, 'l1', lx, 372, now, {
    closeFrom: T.keep - 0.1, closeTo: T.me2 + 0.1,
    crack: ramp(now, T.heartache, T.heartache + 0.35),
    blue: ramp(now, T.heartache + 0.1, T.heartache + 1.0),
  })
  res.main += caption(ctx, lx, 664, 'fig. 13 — heartache, and kept', INK, land(now, T.heartache - 0.4, 0.6))
  return res
}

/* ── The interlude: a border of wild flowers ───────────────────────── */

function frond(x, y, h, lean) {
  let d = `M${P(x, y)}Q${P(x + lean * 0.5, y - h * 0.5)} ${P(x + lean, y - h)}`
  for (let i = 1; i < 12; i++) {
    const u = i / 12
    const px = x + lean * u * u
    const py = y - h * u
    const L = (1 - u) * 44 + 8
    d += `M${P(px, py)}Q${P(px - L * 0.6, py - 6)} ${P(px - L, py + 8)}M${P(px, py)}Q${P(px + L * 0.6, py - 6)} ${P(px + L, py + 8)}`
  }
  return d
}

/** The wild rose of the album still (tools/video-styles/album/ivory.mjs): hatched petals, veined leaves. */
function roseSprig(x, y, s, seed) {
  const stems = [
    [[x - 30 * s, y + 360 * s], [x - 10 * s, y + 250 * s], [x, y]],
    [[x - 10 * s, y + 250 * s], [x - 80 * s, y + 150 * s], [x - 110 * s, y + 70 * s]],
    [[x - 20 * s, y + 290 * s], [x + 60 * s, y + 190 * s], [x + 90 * s, y + 110 * s]],
  ]
  let out = pen(stems.map(([a, b, c]) => `M${P(...a)}Q${P(...b)} ${P(...c)}`).join(''), 1.6)
  const onStem = ([p0, p1, p2], u) => [(1 - u) ** 2 * p0[0] + 2 * u * (1 - u) * p1[0] + u * u * p2[0], (1 - u) ** 2 * p0[1] + 2 * u * (1 - u) * p1[1] + u * u * p2[1]]
  let leaves = ''
  let ribs = ''
  stems.forEach((stem, si) => [0.3, 0.6].forEach((u, li) => {
    const [px, py] = onStem(stem, u)
    const a = ((si + li) % 2 ? 1 : -1) * (0.75 + 0.2 * li)
    const L = 60 * s
    const ex = px + Math.sin(a) * L
    const ey = py - Math.cos(a) * L * 0.8
    const nx = Math.cos(a) * 15 * s
    const ny = Math.sin(a) * 15 * s
    const mx = (px + ex) / 2
    const my = (py + ey) / 2
    leaves += `M${P(px, py)}Q${P(mx + nx, my + ny)} ${P(ex, ey)}Q${P(mx - nx, my - ny)} ${P(px, py)}Z`
    ribs += `M${P(px, py)}L${P(ex, ey)}`
    for (let k = 1; k < 7; k++) {
      const v = k / 7
      const w = Math.sin(v * Math.PI) * 0.85
      ribs += `M${P(px + (ex - px) * v, py + (ey - py) * v)}l${r(nx * w)} ${r(ny * w)}`
    }
  }))
  out += fillD(leaves, PLATE_TONE) + pen(leaves, 1.2) + pen(ribs, 0.7)
  ;[[0, 0, 1], [-110, 70, 0.8], [90, 110, 0.72]].forEach(([bx, by, k], bi) => {
    const cx = x + bx * s
    const cy = y + by * s
    const R = 46 * s * k
    let petals = ''
    let hatchLines = ''
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2 + bi * 0.5 + seed
      const tip = [cx + Math.cos(a) * R, cy + Math.sin(a) * R]
      petals += `M${P(cx, cy)}Q${P(cx + Math.cos(a - 0.62) * R * 0.92, cy + Math.sin(a - 0.62) * R * 0.92)} ${P(...tip)}Q${P(cx + Math.cos(a + 0.62) * R * 0.92, cy + Math.sin(a + 0.62) * R * 0.92)} ${P(cx, cy)}`
      for (let h = 0; h < 6; h++) {
        const u = 0.3 + h * 0.1
        hatchLines += `M${P(cx + Math.cos(a - 0.2) * R * u, cy + Math.sin(a - 0.2) * R * u)}L${P(cx + Math.cos(a + 0.25) * R * (u + 0.08), cy + Math.sin(a + 0.25) * R * (u + 0.08))}`
      }
    }
    out += fillD(petals, PLATE_TONE) + pen(petals, 1.2) + pen(hatchLines, 0.6, { opacity: 0.8 }) + fillD(circ(cx, cy, R * 0.18), INK)
  })
  return out
}

function borderScene(ctx, now) {
  let out = ''
  for (const b of ctx.P.border) {
    if (b.x < ctx.view - 300 || b.x > ctx.view + 1900) continue
    const k = easeOut(ramp(now, b.t, b.t + 1.6))
    if (k <= 0) continue
    const clip = `${ctx.uid}-border-${b.i}`
    const h = b.h
    let d = ''
    let blooms = ''
    if (b.kind === 0) d = frond(b.x, 660, h, 40)
    if (b.kind === 1) {
      d = `M${P(b.x, 660)}Q${P(b.x - 10, 660 - h * 0.5)} ${P(b.x + 6, 660 - h)}M${P(b.x - 4, 660 - h * 0.4)}Q${P(b.x - 40, 660 - h * 0.6)} ${P(b.x - 50, 660 - h * 0.75)}`
      const f = cornflower(b.x + 6, 660 - h, 28, b.i)
      const f2 = cornflower(b.x - 50, 660 - h * 0.75, 20, b.i + 1)
      blooms = wash(ctx, b.x + 6, 660 - h, 38, 38, ramp(now, b.t + 1, b.t + 2), { seed: 330 + b.i }) + pen(f.petals + f2.petals, 1.2) + fillD(f.heart + f2.heart, INK)
    }
    if (b.kind === 2) {
      d = `M${P(b.x, 660)}Q${P(b.x + 20, 660 - h * 0.6)} ${P(b.x - 10, 660 - h)}`
      for (let i = 0; i < 5; i++) {
        const y = 660 - h * (0.3 + i * 0.14)
        d += `M${P(b.x + 6 - i * 2, y)}Q${P(b.x + 40, y - 20)} ${P(b.x + 60 - i * 6, y - 4)}Q${P(b.x + 34, y + 4)} ${P(b.x + 6 - i * 2, y)}`
      }
    }
    if (b.kind === 3) {
      for (let i = 0; i < 7; i++) d += `M${P(b.x + i * 8 - 24, 660)}Q${P(b.x + i * 10 - 30, 660 - h * 0.5)} ${P(b.x + i * 14 - 50, 660 - h * (0.6 + (i % 3) * 0.15))}`
    }
    if (b.kind === 4) blooms = roseSprig(b.x, 660 - h, h / 360, 500 + b.i)
    out += `${clipRect(clip, b.x - 200, 660 - h * k - 60, 400, h * k + 80)}<g clip-path="url(#${clip})">${pen(d, 1.6)}${blooms}</g>`
  }
  // A small blue butterfly, flitting ahead of the camera.
  const fly = ctx.P.flitter
  if (now > fly.from && now < fly.to) {
    const u = (now - fly.from) / (fly.to - fly.from)
    const x = ctx.cam + lerp(1000, 300, u) - 800 + 90 * Math.sin(now * 1.3)
    const y = 290 + 110 * Math.sin(now * 0.9) + 40 * Math.sin(now * 2.7)
    const flap = 0.2 + 0.8 * Math.abs(Math.sin(now * 8))
    out += butterfly(ctx, x, y, 0.3, flap, 'flit', 1)
  }
  return { main: out }
}

/* ── fig. 14, Eden, and the flood ───────────────────────────────────── */

function edenScene(ctx, now) {
  const { ex } = ctx.P.eden
  const T = ctx.T
  const trunkX = ex + 60
  const eve = { x: ex - 250, y: 626, s: 320 }
  const stat = memo(`eden-${ctx.id}`, () => {
    const hill = (x) => 470 + 40 * Math.sin((x - ex) / 260) + 20 * Math.sin((x - ex) / 90)
    const ends = (x) => smooth((x - ex + 900) / 360) * smooth((ex + 900 - x) / 360)
    const hillTone = (x, y) => (y > hill(x) && y < 628 ? (0.28 + 0.2 * clamp01((y - hill(x)) / 120)) * ends(x) : 0)
    const hills = hatchD({ x0: ex - 900, y0: 380, x1: ex + 900, y1: 630, tone: hillTone, angle: 0, spacing: 6, at: 0.18, step: 12, seed: 351 })
    const hillLine = spline(Array.from({ length: 15 }, (_, i) => [ex - 700 + i * 100, hill(ex - 700 + i * 100)]), false)
    let grass = ''
    for (let i = 0; i < 220; i++) {
      const x = ex - 900 + hash(i, 1, 9) * 1800
      if (hash(i, 7, 9) > ends(x)) continue
      const y = 630 + hash(i, 2, 9) * 44
      grass += `M${P(x, y)}q${r(2 - hash(i, 3, 9) * 4)} -${r(8 + hash(i, 4, 9) * 10)} ${r(4 - hash(i, 5, 9) * 8)} -${r(14 + hash(i, 6, 9) * 10)}`
    }
    const trunk = `M${P(trunkX - 40, 632)}Q${P(trunkX - 22, 480)} ${P(trunkX - 26, 330)}L${P(trunkX + 20, 330)}Q${P(trunkX + 24, 480)} ${P(trunkX + 46, 632)}Z`
    const trunkShade = hatchD({ x0: trunkX - 50, y0: 320, x1: trunkX + 50, y1: 634, tone: (x, y) => (x > trunkX - 6 + (632 - y) * 0.02 ? 0.7 : 0.25), angle: Math.PI / 2 - 0.1, spacing: 4, at: 0.3, step: 8, seed: 353, bend: (x, y) => 2 * Math.sin(y / 14) })
    const branches = [
      spline([[trunkX - 10, 340], [trunkX - 80, 290], [trunkX - 190, 250], [trunkX - 300, 240]], false),
      spline([[trunkX + 4, 340], [trunkX + 90, 280], [trunkX + 220, 250], [trunkX + 330, 230]], false),
      spline([[trunkX, 340], [trunkX - 10, 250], [trunkX + 20, 160], [trunkX + 10, 110]], false),
      spline([[trunkX - 6, 300], [trunkX - 90, 200], [trunkX - 150, 140]], false),
      spline([[trunkX + 10, 300], [trunkX + 120, 190], [trunkX + 200, 150]], false),
    ]
    const clumps = [[trunkX - 290, 220, 90], [trunkX - 170, 150, 100], [trunkX - 40, 100, 110], [trunkX + 100, 120, 100], [trunkX + 230, 160, 100], [trunkX + 320, 220, 80], [trunkX - 90, 230, 80], [trunkX + 140, 240, 80], [trunkX + 20, 200, 70]]
    const cl = clumps.map(([x, y, rad], i) => {
      const pts = []
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2
        const rr2 = rad * (k % 2 ? 0.88 : 1.02) * (0.94 + 0.12 * hash(i, k, 7))
        pts.push([x + Math.cos(a) * rr2, y + Math.sin(a) * rr2 * 0.78])
      }
      const tone = (px, py) => (inside(pts, px, py) ? 0.3 + 0.45 * clamp01(((py - y) / rad + (px - x) / rad) * 0.5 + 0.5) : 0)
      return { d: spline(pts), hatch: layered({ x0: x - rad, y0: y - rad, x1: x + rad, y1: y + rad }, tone, [{ angle: 0.9, spacing: 4.5, at: 0.25 }, { angle: -0.5, spacing: 5, at: 0.55 }], 360 + i, { step: 6 }), x, y }
    })
    const apples = [[trunkX - 230, 260], [trunkX - 110, 190], [trunkX + 40, 150], [trunkX + 170, 190], [trunkX + 280, 250], [trunkX - 30, 250], [trunkX + 90, 270]]
    // The serpent round the trunk.
    const coil = []
    for (let i = 0; i <= 40; i++) {
      const u = i / 40
      coil.push([trunkX + 36 * Math.sin(u * Math.PI * 5), 600 - u * 290])
    }
    const serpent = spline(coil, false)
    return { hills, hillLine, grass, trunk, trunkShade, branches, clumps: cl, apples, serpent, hill }
  })
  const grow = ramp(now, T.treeFrom, T.treeFrom + 5)
  let key = pen(stat.hills, 0.95) + pen(stat.hillLine, 1.4) + pen(stat.grass, 1.1)
  key += `<g${op(clamp01(grow * 3))}>${fillD(stat.trunk, PLATE_TONE)}${pen(stat.trunkShade, 0.9)}${pen(stat.trunk, 1.8)}</g>`
  stat.branches.forEach((b, i) => { key += drawn(b, 5 - i * 0.5, clamp01(grow * 1.6 - i * 0.1)) })
  stat.clumps.forEach((c, i) => {
    const k = land(now, T.treeFrom + 2.2 + i * 0.2857, 0.3)
    if (k > 0) key += `<g${op(k)}>${fillD(c.d, PLATE_TONE)}${pen(c.hatch, 0.9)}${pen(c.d, 1.5)}</g>`
  })
  stat.apples.forEach(([x, y], i) => {
    const k = land(now, T.treeFrom + 4.4 + i * 0.1428, 0.2)
    if (k > 0) key += `<g${op(k)}>${fillD(circ(x, y, 15), PLATE_TONE)}${pen(`M${P(x + 3, y - 15)}A15 15 0 0 1 ${P(x + 3, y + 15)}`, 5, { opacity: 0.4 })}${pen(circ(x, y, 15), 1.5)}${pen(`M${P(x, y - 14)}q2 -8 6 -10`, 1.4)}</g>`
  })
  key += drawn(stat.serpent, 9, ramp(now, T.treeFrom + 3.6, T.treeFrom + 5.2)) + drawn(stat.serpent, 5, ramp(now, T.treeFrom + 3.6, T.treeFrom + 5.2), { stroke: PLATE_TONE })
  // Eve: paper, from "I could be the one she loves"; gone once the water has had her.
  const eveK = easeInOut(ramp(now, T.i3 - 0.2, T.loves)) * (1 - easeInOut(ramp(now, T.oh5, T.oh5 + 2.6)))
  const offer = easeInOut(ramp(now, T.but - 0.1, T.name3))
  const armA = lerp(12, -4, offer)
  const [, , hx0, hy0] = armAt(eve.x, eve.y, eve.s, armA)
  const hand = [hx0, hy0]
  const herD2 = herFig(standParts(eve.x, eve.y, eve.s, { arm: armA }), eveK)
  // The apple: in her hand, then adrift, then on the ground where he should be.
  const adrift = easeInOut(ramp(now, T.oh5 + 0.3, T.ivory5 + 1.6))
  const ax = lerp(hand[0] + 16, trunkX + 240, adrift)
  const ay = lerp(hand[1] - 2, 612, adrift) - Math.sin(adrift * Math.PI) * 60
  const apple = eveK > 0.02 || adrift > 0 ? `${fillD(circ(ax, ay, 15), PLATE_TONE)}${pen(`M${P(ax + 3, ay - 15)}A15 15 0 0 1 ${P(ax + 3, ay + 15)}`, 5, { opacity: 0.45 })}${pen(circ(ax, ay, 15), 1.6)}${pen(`M${P(ax, ay - 14)}q2 -8 6 -10`, 1.4)}` : ''
  const glint = land(now, T.eve, 0.2) * (1 - ramp(now, T.eve + 0.5, T.eve + 1.2))
  const glintD = glint > 0 ? pen(`M${P(ax - 26, ay)}h-12M${P(ax + 26, ay)}h12M${P(ax, ay - 26)}v-12M${P(ax - 18, ay - 18)}l-8 -8M${P(ax + 18, ay - 18)}l8 -8`, 1.6, { opacity: glint }) : ''
  // The flood: "forgot how to breathe". The water rises, holds, and drains.
  const rise = easeInOut(ramp(now, T.i4 - 0.05, T.breathe))
  const drain = easeInOut(ramp(now, T.ivory5 - 1.8, T.ivory5 + 3.2))
  const surface = lerp(lerp(712, 128, rise), 716, drain)
  const imm = clamp01((712 - surface) / 560)
  const sway = imm > 0.02 ? ` transform="translate(${r(Math.sin(now * 1.6) * 5 * imm, 2)} 0) skewX(${r(Math.sin(now * 1.1) * 1.4 * imm, 2)})"` : ''
  let out = `<g${sway}>${key}${herD2}${apple}${glintD}</g>`
  out += wash(ctx, trunkX + 240, 560, 160, 70, ramp(now, T.adam, T.adam + 0.9), { seed: 371, opacity: 0.6 })
  if (imm > 0.002) {
    let surf = `M${P(ex - 900, surface)}`
    for (let x = ex - 900; x <= ex + 900; x += 30) surf += `L${P(x, surface + Math.sin(x / 38 + now * 2.2) * 5 + Math.sin(x / 13 - now * 3) * 1.5)}`
    out += fillD(`${surf}L${P(ex + 900, BOTTOM + 10)}L${P(ex - 900, BOTTOM + 10)}Z`, `url(#${ctx.uid}-water)`)
    let ripples = ''
    for (let i = 0; i < 22; i++) {
      const y = surface + 30 + hash(i, 1, 13) * (BOTTOM - surface - 40)
      if (y > BOTTOM - 6) continue
      const x = ex - 800 + hash(i, 2, 13) * 1600 + Math.sin(now * 0.7 + i) * 18
      ripples += `M${P(x - 30, y)}Q${P(x, y - 4)} ${P(x + 30, y)}`
    }
    out += pen(ripples, 1.2, { opacity: 0.55 * imm }) + pen(surf, 1.8)
    // Bubbles: a breath going up, from "forgot" — and none after "breathe".
    let bubbles = ''
    for (let i = 0; i < 18; i++) {
      const t0 = lerp(T.forgot - 0.2, T.breathe - 0.1, i / 17)
      const age = now - t0
      if (age < 0) continue
      const y = 690 - age * 190
      if (y < surface + 4) continue
      const x = trunkX + 250 + Math.sin(age * 5 + i) * 10 + (hash(i, 3, 17) - 0.5) * 60
      const rad = 4 + hash(i, 4, 17) * 11
      bubbles += circ(x, y, rad)
    }
    out += fillD(bubbles, PAPER) + pen(bubbles, 1.3)
  }
  out += caption(ctx, ex, 664, 'fig. 14 — Adam, and Eve', INK, land(now, T.adam, 0.6))
  return { main: out }
}

/* ── fig. 15, California at sunset; fig. 16, Tennessee, flying ────── */

function sunsetScene(ctx, now) {
  const { cx, bx } = ctx.P.sunset
  const T = ctx.T
  const H = 392
  const sunX = cx + 80
  const scape = seascape(`sunset-${ctx.id}`, { x0: cx - 660, x1: cx + 640, horizon: H, shore: null, sunX, sunY: H - 20, depth: 280, top: 70 })
  const sweep = easeInOut(ramp(now, T.looks2 - 0.4, T.california2 + 0.3))
  let out = wash(ctx, cx, 520, 700, 150, ramp(now, T.california2 + 0.2, T.california2 + 1.2), { seed: 391 })
  out += wash(ctx, cx, 170, 700, 110, ramp(now, T.california2 + 0.4, T.california2 + 1.4), { seed: 392, opacity: 0.5 })
  const clip = `${ctx.uid}-sunset`
  out += `${sweepClip(clip, cx - 700, lerp(cx - 740, cx + 740, sweep), 13)}<g clip-path="url(#${clip})">${pen(scape.sky[0] + scape.sky[1], 1.0)}${pen(scape.sea, 1.1)}${pen(`M${P(cx - 620, H)}H${r(cx + 520)}`, 1.6)}</g>`
  // The sun goes down on "California".
  const set = easeInOut(ramp(now, T.california2 - 0.4, T.tennessee2 + 1.5))
  const sy = lerp(H - 50, H + 30, set)
  const sclip = `${ctx.uid}-sunset-sun`
  out += `${clipRect(sclip, sunX - 400, TOP, 800, H - TOP)}<g clip-path="url(#${sclip})"${op(sweep)}>${pen(sunD(sunX, sy, 58, 33, 1), 1.0)}${fillD(circ(sunX, sy, 58), PAPER)}${pen(circ(sunX, sy, 58), 1.6)}</g>`
  // A headland with a cypress, small, at the left — hatched, never a flat of ink.
  const head = memo(`headland-${ctx.id}`, () => {
    const pts = [[cx - 700, 440], [cx - 600, 380], [cx - 500, 372], [cx - 430, 400], [cx - 390, 450], [cx - 372, 520], [cx - 360, 700], [cx - 700, 700]]
    const tone = (x, y) => (inside(pts, x, y) ? 0.55 + 0.3 * clamp01((x - cx + 620) / 260) : 0)
    const hatch = layered({ x0: cx - 700, y0: 360, x1: cx - 350, y1: 700 }, tone, [{ angle: 1.1, spacing: 5, at: 0.2 }, { angle: -0.4, spacing: 6, at: 0.6 }], 405, { step: 8 })
    const clumps = [[cx - 560, 330, 80, 22], [cx - 490, 306, 60, 18], [cx - 620, 346, 44, 14]].map(([x, y, rx, ry], i) => blobD(x, y, rx, ry, 410 + i, 13, 0.32)).join('')
    return { outline: spline(pts.slice(0, 6), false), hatch, clumps, trunk: `M${P(cx - 520, 376)}Q${P(cx - 534, 350)} ${P(cx - 520, 322)}M${P(cx - 526, 350)}Q${P(cx - 570, 340)} ${P(cx - 590, 336)}` }
  })
  out += `<g${op(sweep)}>${pen(head.hatch, 1.0)}${pen(head.outline, 1.8)}${fillD(head.clumps, PLATE_TONE)}${pen(head.clumps, 1.5)}${pen(head.trunk, 4)}</g>`
  out += caption(ctx, cx - 100, 664, 'fig. 15 — California, at sunset', INK, sweep)
  // The mockingbird: on its branch, and gone on "Tennessee".
  const bird = land(now, T.sounds2 - 0.3, 0.4)
  if (bird > 0) {
    out += `<g${op(bird)}>${pen(`M${P(bx - 300, 470)}Q${P(bx - 60, 440)} ${P(bx + 170, 420)}`, 4)}${leafSpray(bx - 240, 464, 1)}${leafSpray(bx + 130, 412, -1)}</g>`
    const fly = easeInOut(ramp(now, T.tennessee2 - 0.05, T.tennessee2 + 2.2))
    if (fly <= 0) out += `<g${op(bird)}>${mockingbird(bx - 20, 442, 150)}</g>`
    else if (fly < 1) {
      const x = lerp(bx - 20, bx + 760, fly)
      const y = lerp(380, 20, fly) - Math.sin(fly * Math.PI) * 40
      out += flyingBird(x, y, 200, Math.sin(now * 12))
    }
    out += caption(ctx, bx, 664, 'fig. 16 — Tennessee, flown')
  }
  return { main: out }
}

/* ── fig. 17, Alaska, the snowfall in the trees ─────────────────────── */

/**
 * A bird in flight, the engraver's M: a small body and two long wings from it,
 * the far one shorter, both beating by `flap` (−1 down to 1 up). Going right.
 */
function flyingBird(x, y, s, flap) {
  const lift = lerp(-0.12, 0.34, 0.5 + 0.5 * flap)
  const wing = (dir, span) => {
    const tip = [x + dir * span * s, y - lift * s * span * 2.2]
    const elbow = [x + dir * span * 0.45 * s, y - (lift * 1.3 + 0.08) * s * span]
    return `M${P(x + dir * 0.03 * s, y - 0.02 * s)}Q${P(elbow[0], elbow[1] - 0.05 * s)} ${P(...tip)}Q${P(elbow[0] + dir * 0.02 * s, elbow[1] + 0.07 * s)} ${P(x, y + 0.03 * s)}Z`
  }
  const far = wing(1, 0.36)
  const near = wing(-1, 0.5)
  let quills = ''
  for (let i = 1; i < 5; i++) {
    const v = i / 5
    quills += `M${P(x - v * 0.25 * s, y - (lift * 1.1 + 0.04) * s * v * 0.5)}l${r(-0.05 * s)} ${r(0.035 * s)}`
  }
  const body = ellipse(x + 0.02 * s, y + 0.01 * s, 0.11 * s, 0.035 * s)
  const tail = `M${P(x - 0.08 * s, y + 0.01 * s)}L${P(x - 0.2 * s, y - 0.03 * s)}L${P(x - 0.19 * s, y + 0.05 * s)}Z`
  const head = circ(x + 0.13 * s, y - 0.005 * s, 0.03 * s)
  return fillD(far, PLATE_TONE) + pen(far, 1.3, { opacity: 0.8 }) + fillD(tail + body + head, PLATE_TONE) + pen(tail + body + head, 1.4) + fillD(near, PLATE_TONE) + pen(near, 1.6) + pen(quills, 1.0) + fillD(`M${P(x + 0.16 * s, y - 0.01 * s)}l${r(0.05 * s)} ${r(0.008 * s)}l${r(-0.05 * s)} ${r(0.014 * s)}Z`, INK)
}

function spruce(x, base, h, weight = 1) {
  let d = `M${P(x, base)}V${r(base - h)}`
  let snow = ''
  const tiers = h > 300 ? 9 : h > 200 ? 7 : 6
  for (let j = 0; j < tiers; j++) {
    const u = j / tiers
    const y = base - h * (0.12 + u * 0.86)
    const w = h * 0.34 * (1 - u) + 6
    const n = Math.max(3, Math.round(w / (h > 300 ? 10 : 12)))
    for (const side of [-1, 1]) {
      for (let k = 1; k <= n; k++) {
        const v = k / n
        const ex = x + side * w * v
        const ey = y + 14 + v * v * h * 0.08
        d += `M${P(x + side * 2, y)}Q${P(x + side * w * v * 0.5, y + 2)} ${P(ex, ey)}`
      }
      snow += `M${P(x + side * 2, y - 2)}Q${P(x + side * w * 0.5, y + 2)} ${P(x + side * w * 0.9, y + 12)}`
    }
  }
  return { d, snow, w: weight, x, half: h * 0.34 + 10 }
}

function alaskaScene(ctx, now) {
  const { ax } = ctx.P.alaska
  const T = ctx.T
  const stat = memo(`alaska-${ctx.id}`, () => {
    const back = []
    const mid = []
    const front = []
    for (let i = 0; i < 23; i++) back.push(spruce(ax - 800 + i * 72 + hash(i, 1, 41) * 30, 480 + hash(i, 2, 41) * 10, 130 + hash(i, 3, 41) * 50))
    for (let i = 0; i < 14; i++) {
      const x = ax - 780 + i * 120 + hash(i, 1, 43) * 50
      if (Math.abs(x - (ax + 120)) < 90) continue
      mid.push(spruce(x, 530 + hash(i, 2, 43) * 20, 250 + hash(i, 3, 43) * 80))
    }
    front.push(spruce(ax - 690, 690, 600), spruce(ax + 560, 700, 620))
    const ends = (x) => smooth((x - ax + 900) / 300) * smooth((ax + 900 - x) / 300)
    const sky = hatchD({ x0: ax - 900, y0: TOP, x1: ax + 900, y1: 480, tone: (x, y) => (0.3 + 0.15 * ((480 - y) / 440)) * ends(x), angle: 0.1, spacing: 7, at: 0.2, step: 14, seed: 421 })
    const snowTone = (x, y) => (y > 520 ? (0.16 + 0.2 * Math.sin(x / 90 + y / 40)) * ends(x) : 0)
    const drifts = hatchD({ x0: ax - 900, y0: 480, x1: ax + 900, y1: BOTTOM, tone: snowTone, angle: 0.02, spacing: 8, at: 0.18, step: 16, seed: 423 })
    const path = [[ax - 460, 700], [ax - 300, 640], [ax - 120, 580], [ax + 40, 530], [ax + 120, 500]]
    return { back, mid, front, sky, drifts, path }
  })
  let out = pen(stat.sky, 0.9, { opacity: 0.8 }) + pen(stat.drifts, 1.0)
  out += wash(ctx, ax, 560, 900, 110, ramp(now, T.alaska - 0.2, T.alaska + 0.9), { seed: 431, opacity: 0.55 })
  const seen = (t) => t.x + t.half > ctx.view - 20 && t.x - t.half < ctx.view + 1620
  const draw = (list, w, o) => list.filter(seen).map((t) => pen(t.d, w, { opacity: o }) + pen(t.snow, 2.4, { stroke: PAPER })).join('')
  out += draw(stat.back, 0.9, 0.55) + draw(stat.mid, 1.2, 0.95)
  // Her: walking away up the path into the trees, from "Walks" until "trees".
  const u = easeInOut(ramp(now, T.walks - 0.1, T.trees + 1.0))
  const gone = easeInOut(ramp(now, T.trees + 0.4, T.trees + 1.6))
  const path = stat.path
  const along = (uu) => {
    const f = uu * (path.length - 1)
    const i = Math.min(path.length - 2, Math.floor(f))
    const k = f - i
    return [lerp(path[i][0], path[i + 1][0], k), lerp(path[i][1], path[i + 1][1], k)]
  }
  // Footprints: left behind her as she goes.
  let prints = ''
  for (let i = 0; i < 26; i++) {
    const uu = 0.05 + i * 0.036
    if (uu > u - 0.02) break
    const [x, y] = along(uu)
    const sc = lerp(1, 0.4, uu)
    prints += `M${P(x + (i % 2 ? 9 : -9) * sc, y)}l${r(-3 * sc)} ${r(-5 * sc)}`
  }
  out += pen(prints, 3, { opacity: 0.85 })
  if (now > T.walks - 0.2 && gone < 1) {
    const [x, y] = along(u)
    const s = lerp(310, 96, u)
    const bob = Math.abs(Math.sin(u * 40)) * 3 * (1 - u)
    out += herFig(standParts(x, y - bob, s, { sway: Math.sin(u * 40) }), (1 - gone) * land(now, T.walks - 0.2, 0.4))
  }
  out += draw(stat.front, 1.3, 1)
  out += caption(ctx, ax, 664, 'fig. 17 — Alaska, the snowfall in the trees', INK, land(now, T.walks, 0.6))
  return { main: out }
}

/** Snow over Alaska and the keyboard: each flake a function of the clock. */
function snowfall(ctx, now) {
  const { from, to, heavy } = ctx.P.snow
  if (ctx.view + 1600 < from || ctx.view > to) return ''
  const k = 0.5 + 0.5 * ramp(now, heavy - 0.3, heavy + 0.6)
  let d = ''
  const N = 150
  for (let i = 0; i < N; i++) {
    if (hash(i, 1, 51) > k) continue
    const sp = 40 + hash(i, 2, 51) * 50
    const y = TOP + (((hash(i, 3, 51) * 660 + now * sp) % 680) + 680) % 680
    const x = ctx.view + ((hash(i, 4, 51) * 1700 - now * 6 + Math.sin(now * 0.8 + i) * 18) % 1700 + 1700) % 1700 - 40
    if (x < from - 200 || x > to + 200) continue
    d += circ(x, y, 1.6 + hash(i, 5, 51) * 2.4)
  }
  return fillD(d, PAPER) + pen(d, 0.6, { opacity: 0.5 })
}

/* ── The specimen case, and her empty pin ───────────────────────────── */

function caseScene(ctx, now) {
  const { cx, slot } = ctx.P.case
  const T = ctx.T
  const x0 = cx - 580
  const y0 = 110
  const W = 1160
  const Hh = 500
  const stat = memo(`case-${ctx.id}`, () => {
    const felt = hatchD({ x0, y0, x1: x0 + W, y1: y0 + Hh, tone: (x, y) => (x > x0 + 30 && x < x0 + W - 30 && y > y0 + 30 && y < y0 + Hh - 30 ? 0.3 : 0), angle: 0.78, spacing: 8, at: 0.2, step: 14, seed: 451 })
    const wood = hatchD({ x0, y0, x1: x0 + W, y1: y0 + Hh, tone: (x, y) => (!(x > x0 + 30 && x < x0 + W - 30 && y > y0 + 30 && y < y0 + Hh - 30) ? 0.55 : 0), angle: 0, spacing: 4.5, at: 0.3, step: 14, seed: 453, bend: (x, y) => 2 * Math.sin(x / 40 + y / 9) })
    const frame = rectD(x0, y0, W, Hh) + rectD(x0 + 30, y0 + 30, W - 60, Hh - 60)
    const glass = `M${P(x0 + 120, y0 + 40)}L${P(x0 + 40, y0 + 200)}M${P(x0 + 180, y0 + 40)}L${P(x0 + 60, y0 + 280)}M${P(x0 + W - 200, y0 + Hh - 40)}L${P(x0 + W - 60, y0 + Hh - 300)}`
    return { felt, wood, frame, glass }
  })
  let out = pen(stat.felt, 0.8, { opacity: 0.8 }) + pen(stat.wood, 0.9) + pen(stat.frame, 2)
  // What was kept: the locket, a cornflower, a feather, a snowflake, the apple, the butterfly.
  const lk = locket(ctx, 'case', cx - 380, 300, now, { closeFrom: -10, closeTo: -9, crack: 1, blue: 1 })
  out += `<g transform="translate(${r(cx - 380)} 300) scale(0.5) translate(${r(-(cx - 380))} -300)">${lk.main}${lk.over}</g>`
  const cf = cornflower(cx - 170, 330, 36, 0.3)
  out += wash(ctx, cx - 170, 330, 44, 44, 1, { seed: 461 }) + pen(cf.petals, 1.3) + fillD(cf.heart, INK) + pen(`M${P(cx - 170, 360)}Q${P(cx - 150, 420)} ${P(cx - 180, 480)}`, 1.6)
  out += pen(`M${P(cx + 200, 470)}Q${P(cx + 230, 380)} ${P(cx + 300, 300)}` + Array.from({ length: 14 }, (_, i) => {
    const u = i / 13
    const px = lerp(cx + 210, cx + 292, u)
    const py = lerp(450, 310, u)
    return `M${P(px, py)}l${r(-26 + u * 10)} ${r(-6)}M${P(px, py)}l${r(20 - u * 8)} ${r(-18)}`
  }).join(''), 1.2)
  const apple = [cx + 200, 520]
  out += fillD(circ(...apple, 18), PLATE_TONE) + pen(`M${P(apple[0] + 4, apple[1] - 18)}A18 18 0 0 1 ${P(apple[0] + 4, apple[1] + 18)}`, 6, { opacity: 0.4 }) + pen(circ(...apple, 18), 1.6)
  let flake = ''
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    const c = [cx - 380, 510]
    flake += `M${P(...c)}L${P(c[0] + Math.cos(a) * 30, c[1] + Math.sin(a) * 30)}M${P(c[0] + Math.cos(a) * 16, c[1] + Math.sin(a) * 16)}l${r(Math.cos(a + 0.8) * 9)} ${r(Math.sin(a + 0.8) * 9)}M${P(c[0] + Math.cos(a) * 16, c[1] + Math.sin(a) * 16)}l${r(Math.cos(a - 0.8) * 9)} ${r(Math.sin(a - 0.8) * 9)}`
  }
  out += pen(flake, 1.4)
  // Labels: lettered one a word on "keep this one just for me" — all but hers.
  const labels = [[cx - 380, 390], [cx - 170, 500], [cx + 250, 560], [cx + 200, 590], [cx - 380, 560], [cx + 330, 380]]
  labels.forEach(([x, y], i) => {
    out += pen(rectD(x - 36, y, 72, 18), 1)
    const w = ctx.W.keep2[Math.min(ctx.W.keep2.length - 1, i)]
    const k = ramp(now, w.t, w.t + 0.3)
    if (k > 0) out += drawn(`M${P(x - 28, y + 9)}q6 -6 10 0t10 0t10 0t10 0t10 0`, 1, k)
  })
  // Hers: an empty pin and a blank label.
  out += pen(rectD(slot[0] - 40, slot[1] + 70, 80, 20), 1.1)
  // The butterfly: pinned, and on the last "Ivory" it comes off its pin and goes.
  const bf = [cx + 330, 250]
  const go = easeInOut(ramp(now, T.last, T.last + 4.4))
  const flap = go > 0 ? 0.3 + 0.7 * Math.abs(Math.cos((now - T.last) * 7)) : 1
  const bx = lerp(bf[0], bf[0] + 820, go) + Math.sin(go * 9) * 30 * go
  const by = lerp(bf[1], -160, go ** 1.3) + Math.sin(go * 12) * 20
  out += pen(`M${P(bf[0], bf[1] - 30)}V${r(bf[1] + 20)}`, 1.4) + fillD(circ(bf[0], bf[1] - 30, 4), INK)
  const pinnedFly = butterfly(ctx, bx, by, go > 0 ? 0.42 - 0.1 * go : 0.42, flap, 'kept', 1)
  out += caption(ctx, cx, 640, 'fig. 19 —', INK, land(now, T.heartache2 - 0.5, 0.6))
  return { main: out, over: pinnedFly }
}

/* ══ THE PLAN — times and places, solved once per score ════════════════ */

const PLANS = new WeakMap()
let planSeq = 0

function planFor(score, uid) {
  if (!PLANS.has(score)) PLANS.set(score, buildPlan(score))
  return { ...PLANS.get(score), uid }
}

function buildPlan(score) {
  planSeq++
  const id = planSeq
  const inSec = (sid) => score.lines.filter((l) => l.section === sid)
  const sec = (sid) => {
    const s = score.sections.find((x) => x.id === sid)
    if (!s) throw new Error(`etching: no section ${sid}`)
    return s
  }
  const wt = (line, re, nth = 0) => {
    const found = line?.words.filter((w) => re.test(w.text))
    if (!found?.length) throw new Error(`etching: no word ${re} in "${line?.text}"`)
    return found[Math.min(nth, found.length - 1)].t
  }
  const v1 = inSec('verse-1')
  const he = inSec('her-eyes')
  const ca = inSec('california')
  const v2 = inSec('verse-2')
  const bh = inSec('beside-her')
  const pa = inSec('paradise')
  const br = inSec('bridge')
  const al = inSec('alaska')
  const last = inSec('last')

  const T = {
    that: v1[0].start, woman: wt(v1[0], /^woman/), sure: wt(v1[0], /^sure/),
    sunrise: wt(v1[1], /^sunrise/), waves: wt(v1[1], /^waves/), shore: wt(v1[1], /^shore/),
    her: he[0].start, open: wt(he[0], /^open/), ocean: wt(he[0], /^ocean/), blue: wt(he[0], /^blue/), butterfly: wt(he[0], /^butterfly/), wings: wt(he[0], /^wings/),
    shes: he[1].start, gets: wt(he[1], /^gets/), stage: wt(he[1], /^stage/), sings: wt(he[1], /^sings/),
    ivory1: he[2].start,
    looks: ca[0].start, california: wt(ca[0], /^California/), sounds: wt(ca[0], /^sounds/), tennessee: wt(ca[0], /^Tennessee/),
    her2: wt(ca[1], /^her/), know: wt(ca[1], /^know/), she2: wt(ca[1], /^she/), mystery: wt(ca[1], /^mystery/),
    ivory2: wt(ca[2], /^Ivory/),
    that2: v2[0].start, woman2: wt(v2[0], /^woman/), flowers: wt(v2[0], /^flowers/), hair: wt(v2[0], /^hair/),
    when2: v2[1].start, moves: wt(v2[1], /^moves/), universe: wt(v2[1], /^universe/), stop: wt(v2[1], /^stop/), stare: wt(v2[1], /^stare/), oh2: wt(v2[1], /^oh/),
    right: bh[0].start, beside: wt(bh[0], /^beside/), be: wt(bh[0], /^be$/),
    when3: bh[1].start, asked: wt(bh[1], /^asked/), name: wt(bh[1], /^name/), looked: wt(bh[1], /^looked/), straight: wt(bh[1], /^straight/), me: wt(bh[1], /^me/),
    ivory3: bh[2].start,
    if1: pa[0].start, paradise: wt(pa[0], /^paradise/), play: wt(pa[0], /^play/),
    heartache: wt(pa[1], /^heartache/), keep: wt(pa[1], /^keep/), me2: wt(pa[1], /^me/),
    ivory4: wt(pa[2], /^Ivory/),
    i3: br[0].start, loves: wt(br[0], /^loves/), adam: wt(br[0], /^Adam/), eve: wt(br[0], /^Eve/),
    but: br[1].start, name3: wt(br[1], /^name/), i4: wt(br[1], /^I$/), forgot: wt(br[1], /^forgot/), breathe: wt(br[1], /^breathe/), oh5: wt(br[1], /^oh/),
    ivory5: br[2].start,
    looks2: al[0].start, california2: wt(al[0], /^California/), sounds2: wt(al[0], /^sounds/), tennessee2: wt(al[0], /^Tennessee/),
    walks: al[1].start, alaska: wt(al[1], /^Alaska/), snowfall: wt(al[1], /^snowfall/), trees: wt(al[1], /^trees/),
    if2: al[2].start, paradise2: wt(al[2], /^paradise/), play2: wt(al[2], /^play/),
    but2: al[3].start, heartache2: wt(al[3], /^heartache/), keep2: wt(al[3], /^keep/),
    ivory6: wt(al[4], /^Ivory/),
    last: last[0].start,
    end: score.endCardAt ?? score.duration,
  }
  T.pinFly = T.wings + 0.25
  T.treeFrom = sec('interlude').to - 5.6
  const W = {
    know: ca[1].words.slice(0, 7),
    keep2: al[3].words.slice(6),
  }

  /* ── The camera: a drift that slows to a hush twice, plus eased moves ── */
  const hushes = [
    { a: T.stop - 0.1, b: T.oh2 + 1.6 },
    { a: T.forgot - 0.2, b: T.ivory5 + 1.4 },
  ]
  const hush = (t) => {
    let h = 0
    for (const x of hushes) h = Math.max(h, easeInOut(ramp(t, x.a, x.a + 0.7)) * (1 - easeInOut(ramp(t, x.b, x.b + 1.4))))
    return h
  }
  const DT = 0.01
  const N = Math.ceil((score.duration + 2) / DT)
  const table = new Float64Array(N + 1)
  for (let i = 1; i <= N; i++) table[i] = table[i - 1] + DRIFT * (1 - 0.85 * hush((i - 0.5) * DT)) * DT
  const drift = (t) => {
    const f = Math.max(0, t) / DT
    const i = Math.min(N - 1, Math.floor(f))
    return lerp(table[i], table[i + 1], f - i)
  }
  const moves = []
  const mv = (a, b, A) => moves.push({ a, b: Math.max(b, a + 1.4), A })
  mv(he[0].start - 3.7, he[0].start - 0.7, 1250) // shore → the ocean, once the sun is up
  mv(he[0].end + 0.25, he[1].start + 1.5, 1150) // → the stage
  mv(he[2].start + 1.4, ca[0].start - 0.55, 1400) // → California
  mv(ca[0].end + 0.45, ca[1].start + 1.3, 950) // → the drawer
  mv(v2[0].start - 3.4, v2[0].start - 0.3, 1100) // → the portrait, after the drawer has held
  mv(v2[0].end + 0.15, v2[1].start + 1.2, 1250) // → the universe
  mv(v2[1].end + 2.3, bh[0].start - 0.7, 1500) // → beside her
  mv(bh[0].end + 0.2, bh[1].start + 1.1, 1150) // → the face
  mv(bh[2].start + 3.3, pa[0].start - 0.15, 1250) // → the keyboard
  mv(pa[0].end + 0.3, pa[1].start + 0.15, 850) // → the locket
  mv(pa[2].end + 1.5, sec('interlude').to - 0.2, 2800) // the interlude → Eden
  mv(br[2].start + 2.3, al[0].start - 0.1, 1350) // Eden → sunset
  mv(al[0].end - 0.2, al[1].start + 0.8, 1380) // → Alaska
  mv(al[1].end + 0.1, al[2].start + 0.6, 1250) // → the snow keyboard
  mv(al[2].end + 0.15, al[3].start + 0.45, 950) // → the case
  mv(al[4].end + 0.9, last[0].start - 3.9, 520) // settle on her pin
  moves.sort((a, b) => a.a - b.a)
  const cam = (t) => {
    let x = drift(t)
    for (const m of moves) {
      if (t <= m.a) break
      x += m.A * easeCamera(ramp(t, m.a, m.b))
    }
    return x
  }
  const X = (t, sx = 800) => cam(t) + sx - 800

  /* ── Where everything is: placed from where the camera is on its word ── */
  const P = {
    shore: { cx: X(11.6, 820), from: X(0, 0) },
    ocean: { ox: X(T.ocean, 470), bx: X(T.butterfly, 1120) },
    stage: { sx: X(T.stage, 800) },
    california: { cx: X(T.california, 540), bx: X(T.tennessee, 1150) },
    drawer: { dx: X(T.mystery, 800), slot: [2, 1] },
    portrait: { px: X(T.flowers, 800) },
    universe: { ux: X(T.universe, 800) },
    stage2: { sx: X(T.beside, 800) },
    face: { fx: X(T.looked, 800) },
    piano: { kx: X(T.paradise, 800) },
    locket: { lx: X(T.heartache, 800) },
    eden: { ex: X(T.eve, 800) },
    sunset: { cx: X(T.california2, 560), bx: X(T.tennessee2, 1150) },
    alaska: { ax: X(T.alaska, 800) },
    piano2: { kx: X(T.paradise2, 800) },
    case: { cx: X(T.last, 800) },
  }
  P.universe.sun = [P.universe.ux + 330, 250]
  P.universe.woman = { x: P.universe.ux - 200, y: 634, s: 340 }
  P.night = { from: P.portrait.px + 620, to: X(bh[2].start + 3.3, 1500) }
  P.case.slot = [P.case.cx, 300]
  P.snow = { from: X(T.walks, -100), to: X(T.play2 + 1.5, 1700), heavy: T.snowfall }
  P.flitter = { from: sec('interlude').from - 0.5, to: T.treeFrom + 4 }
  // The border of wild flowers along the interlude: one a bar, each coming up as it enters.
  const bar = 4 * (60 / (score.bpm ?? 105))
  P.border = []
  const beat = bar / 4
  const phase = score.beatPhase ?? 0
  const first = phase + Math.ceil((pa[2].end + 1.4 - phase) / beat) * beat
  for (let i = 0, t = first; t < T.treeFrom + 0.4; i++, t += beat) {
    P.border.push({ i, t, x: X(t, 1150 + (i % 3) * 110), h: 190 + ((i * 53) % 190), kind: [0, 4, 1, 2, 4, 3, 1, 0, 2, 4][i % 10] })
  }

  /* ── The thread: pins on nouns, and the reaches for her ─────────────── */
  const drawerCell = (c, rr) => {
    const x0 = P.drawer.dx - 530
    const cw = 1000 / 5
    const ch = 410 / 3
    return [x0 + 30 + cw * (c + 0.5), 128 + 30 + ch * (rr + 0.5) - 14]
  }
  const stops = [
    { t: T.shore + 0.1, x: P.shore.cx + 120, y: 556, dur: 11 },
    { t: T.ocean + 0.1, x: P.ocean.ox + 60, y: 256 },
    { t: T.pinFly, x: P.ocean.bx, y: 316 },
    { t: T.stage + 0.1, x: P.stage.sx - 640, y: 610 },
    { t: T.ivory1 + 0.4, near: [P.stage.sx - 60, 470], short: 26 },
    { t: T.california + 0.1, x: P.california.cx - 44, y: 316 },
    { t: T.tennessee + 0.1, x: P.california.bx - 200, y: 414 },
    { t: T.know + 0.1, x: drawerCell(1, 1)[0], y: drawerCell(1, 1)[1] - 20 },
    { t: T.ivory2 + 0.3, near: drawerCell(2, 1), short: 26 },
    { t: T.flowers + 0.1, x: P.portrait.px - 262 - 60, y: 560 },
    { t: T.universe + 0.1, x: P.universe.sun[0], y: P.universe.sun[1] },
    { t: T.be + 0.1, x: P.stage2.sx + 190, y: 452 },
    { t: T.ivory3 + 0.5, near: [P.face.fx - 210, 610], short: 26 },
    { t: T.paradise + 0.6, x: P.piano.kx - 500, y: 130 },
    { t: T.heartache + 0.05, x: P.locket.lx - 150, y: 376 },
    { t: T.ivory4 + 0.3, near: [P.locket.lx + 150, 372], short: 26 },
    { t: T.adam + 0.1, x: P.eden.ex + 90, y: 470 },
    { t: T.california2 + 0.1, x: P.sunset.cx + 80, y: 392 },
    { t: T.tennessee2 + 0.6, x: P.sunset.bx - 110, y: 452 },
    { t: T.alaska + 0.1, x: P.alaska.ax - 690, y: 420 },
    { t: T.paradise2 + 0.6, x: P.piano2.kx - 500, y: 130 },
    { t: T.heartache2 + 0.05, x: P.case.cx - 380, y: 300 },
    { t: T.ivory6 + 0.3, near: P.case.slot, short: 30 },
    { t: T.last + 1.2, near: P.case.slot, short: 13, dur: 2.2, last: true },
  ]
  // Her pins: the ones the thread reaches for and never ties. Shown with their scene.
  const herPins = stops.filter((s) => s.near).map((s) => ({ x: s.near[0], y: s.near[1], from: s.t - 1.8 }))
  const tail = [X(0, -200), 612]
  let prev = { x: tail[0], y: tail[1] }
  let lastPin = prev
  for (const s of stops) {
    if (s.near) {
      const dx = s.near[0] - lastPin.x
      const dy = s.near[1] - lastPin.y
      const len = Math.hypot(dx, dy) || 1
      s.x = s.near[0] - (dx / len) * (s.short + 34)
      s.y = s.near[1] - (dy / len) * (s.short + 34)
      s.dir = [dx / len, dy / len]
    }
    else lastPin = s
    s.from = prev
    s.dur = s.dur ?? Math.min(1.3, Math.max(0.55, 0.6 * (s.t - (prev.t ?? 0))))
    prev = s
  }

  /* The stars that stare: every star in the universe's stretch of night. */
  const stars = starsIn(P, P.universe.ux - 900, P.universe.ux + 900)
  // The orrery's clock: runs, stops on "stop", starts again as the camera leaves.
  const orbitSpeed = (t) => 1 - easeInOut(ramp(t, T.stop - 0.05, T.stop + 0.45)) * (1 - easeInOut(ramp(t, T.oh2 + 1.8, T.oh2 + 4)))
  const OT = new Float64Array(N + 1)
  for (let i = 1; i <= N; i++) OT[i] = OT[i - 1] + orbitSpeed((i - 0.5) * DT) * DT
  const orbitClock = (t) => {
    const f = Math.max(0, t) / DT
    const i = Math.min(N - 1, Math.floor(f))
    return lerp(OT[i], OT[i + 1], f - i)
  }

  return { T, W, P, X, cam, moves, stops, herPins, tail, stars, orbitClock, hush, id }
}

/* ══ THE THREAD ════════════════════════════════════════════════════════ */

function threadAt(plan, now) {
  const { stops, tail } = plan
  const pinned = [{ x: tail[0], y: tail[1] }]
  let head = { x: tail[0], y: tail[1] }
  let state = 'rest'
  let slack = 0
  let dir = [1, 0]
  for (const s of stops) {
    const start = s.t - s.dur
    if (now < start) break
    const u = easeInOut(ramp(now, start, s.t))
    const lift = Math.sin(u * Math.PI) * Math.min(110, Math.hypot(s.x - s.from.x, s.y - s.from.y) * 0.1)
    head = { x: lerp(s.from.x, s.x, u), y: lerp(s.from.y, s.y, u) - lift }
    const dx = s.x - s.from.x
    const dy = s.y - s.from.y
    const len = Math.hypot(dx, dy) || 1
    dir = [dx / len, dy / len]
    if (u < 1) { state = 'travel'; break }
    if (s.near) {
      state = 'near'
      dir = s.dir
      slack = easeInOut(ramp(now, s.t, s.t + 1.8))
      head.y += 14 * slack
    }
    else {
      pinned.push(s)
      state = 'rest'
    }
  }
  return { pinned, head, state, slack, dir }
}

function sag(a, b, k = 1) {
  const len = Math.hypot(b.x - a.x, b.y - a.y)
  const s = Math.min(150, 26 + 0.09 * len) * k
  return `M${P(a.x, a.y)}Q${P((a.x + b.x) / 2, Math.max(a.y, b.y) + s)} ${P(b.x, b.y)}`
}

function threadSvg(plan, now, v) {
  const th = threadAt(plan, now)
  const lo = v - 300
  const hi = v + 1900
  let d = ''
  const seg = (a, b) => Math.max(a.x, b.x) >= lo && Math.min(a.x, b.x) <= hi
  for (let i = 1; i < th.pinned.length; i++) {
    const a = th.pinned[i - 1]
    const b = th.pinned[i]
    if (seg(a, b)) d += sag(a, b)
  }
  const lastPin = th.pinned[th.pinned.length - 1]
  const tip = { x: th.head.x + th.dir[0] * 34, y: th.head.y + th.dir[1] * 34 }
  if (th.state !== 'rest' && seg(lastPin, th.head)) d += sag(lastPin, th.head, th.state === 'travel' ? 0.3 : 0.45 + 0.9 * th.slack)
  let out = d ? pen(d, 2.4, { stroke: RED }) : ''
  // The pins that are tied.
  let pins = ''
  for (let i = 1; i < th.pinned.length; i++) {
    const p = th.pinned[i]
    if (p.x < lo || p.x > hi) continue
    const k = land(now, p.t, 0.18)
    pins += `<circle cx="${r(p.x)}" cy="${r(p.y)}" r="${r(6.5 * (0.6 + 0.4 * k))}" fill="${RED}"/><circle cx="${r(p.x - 1.6)}" cy="${r(p.y - 1.6)}" r="1.9" fill="#f4d9cf"/>`
  }
  // Her pins: red, never tied.
  for (const p of plan.herPins) {
    if (p.x < lo || p.x > hi || now < p.from) continue
    const k = land(now, p.from, 0.4)
    pins += `<g${op(k)}><path d="M${P(p.x, p.y)}l7 16" stroke="${INK}" stroke-width="1.4"/><circle cx="${r(p.x)}" cy="${r(p.y)}" r="6.5" fill="${RED}"/><circle cx="${r(p.x - 1.6)}" cy="${r(p.y - 1.6)}" r="1.9" fill="#f4d9cf"/></g>`
  }
  // The needle, pulling the thread: out while it travels or reaches.
  if (th.state !== 'rest' && th.head.x > lo && th.head.x < hi) {
    const [ux, uy] = th.dir
    const nx = -uy
    const ny = ux
    const e = th.head
    const needle = `M${P(e.x - ux * 4 + nx * 2.6, e.y - uy * 4 + ny * 2.6)}L${P(tip.x, tip.y)}L${P(e.x - ux * 4 - nx * 2.6, e.y - uy * 4 - ny * 2.6)}Z`
    out += fillD(needle, INK) + `<ellipse cx="${r(e.x + ux * 3)}" cy="${r(e.y + uy * 3)}" rx="3" ry="1.2" transform="rotate(${r((Math.atan2(uy, ux) * 180) / Math.PI, 1)} ${r(e.x + ux * 3)} ${r(e.y + uy * 3)})" fill="${PAPER}"/>`
  }
  return out + pins
}

/* ══ THE FRAME ═════════════════════════════════════════════════════════ */

export function etchingFrame({ time, score, lockup = '', uid = 'iv' }) {
  const now = time
  if (score.endCardAt != null && now >= score.endCardAt) return endCard({ now, from: score.endCardAt, lockup })

  const plan = planFor(score, uid)
  const { P: Pl, T } = plan
  const section = sectionAt(score, now)
  const active = lineAt(score, now)
  const cam = plan.cam(now)
  const v = cam - 800
  const vis = (a, b) => b >= v - 60 && a <= v + 1660
  // Type in the plate stands down while the margin is being sung.
  const sung = active && now >= active.start - 0.3 && now <= active.end + 1.2 && section.id === active.section
  const ctx = {
    ...plan,
    uid,
    view: v,
    cam,
    captionOpacity: sung ? 0.4 : 0.8,
    stareRays: (hx, hy, k) => {
      let d = ''
      for (const [sx, sy] of plan.stars) {
        if (sx < v - 100 || sx > v + 1700) continue
        const dx = hx - sx
        const dy = hy - sy
        const len = Math.hypot(dx, dy)
        if (len < 60) continue
        const L = Math.min(len * 0.42, 220) * k
        d += `M${P(sx + (dx / len) * 5, sy + (dy / len) * 5)}L${P(sx + (dx / len) * (5 + L), sy + (dy / len) * (5 + L))}`
      }
      return pen(d, 1.9, { stroke: PAPER, opacity: 0.95 })
    },
  }

  const main = []
  const over = []
  const add = (res) => {
    if (!res) return
    if (res.main) main.push(res.main)
    if (res.over) over.push(res.over)
  }

  // The night, under everything in it.
  if (vis(Pl.night.from, Pl.night.to)) {
    const n = nightField(ctx)
    main.push(pen(n.hatch, 1.15) + fillD(n.stars, PAPER) + pen(n.rays, 1.2, { stroke: PAPER }))
  }

  if (vis(Pl.shore.cx - 950, Pl.shore.cx + 950)) add(shoreScene(ctx, now))
  if (vis(Pl.ocean.ox - 300, Pl.ocean.bx + 300)) add(oceanScene(ctx, now))
  if (vis(Pl.stage.sx - 900, Pl.stage.sx + 900)) add(stageScene(ctx, now))
  if (vis(Pl.california.cx - 400, Pl.california.bx + 320)) add(californiaScene(ctx, now))
  if (vis(Pl.drawer.dx - 560, Pl.drawer.dx + 800)) add(drawerScene(ctx, now))
  if (vis(Pl.portrait.px - 360, Pl.portrait.px + 300)) add(portraitScene(ctx, now))
  if (vis(Pl.universe.ux - 1100, Pl.universe.ux + 700)) add(universeScene(ctx, now))
  if (vis(Pl.stage2.sx - 850, Pl.stage2.sx + 850)) add(stage2Scene(ctx, now))
  if (vis(Pl.face.fx - 800, Pl.face.fx + 800)) add(faceScene(ctx, now))
  if (vis(Pl.piano.kx - 600, Pl.piano.kx + 600)) add(pianoScene(ctx, now, 'piano'))
  if (vis(Pl.locket.lx - 300, Pl.locket.lx + 300)) add(locketScene(ctx, now))
  if (now > T.ivory4 && now < T.i3) add(borderScene(ctx, now))
  if (vis(Pl.eden.ex - 900, Pl.eden.ex + 900)) add(edenScene(ctx, now))
  if (vis(Pl.sunset.cx - 700, Pl.sunset.bx + 320)) add(sunsetScene(ctx, now))
  if (vis(Pl.alaska.ax - 900, Pl.alaska.ax + 900)) add(alaskaScene(ctx, now))
  if (vis(Pl.piano2.kx - 600, Pl.piano2.kx + 600)) add(pianoScene(ctx, now, 'piano2'))
  if (vis(Pl.case.cx - 600, Pl.case.cx + 600)) add(caseScene(ctx, now))
  main.push(snowfall(ctx, now))

  /* ── The plate: tone, wiping marks, and its rules ─────────────────────── */
  const wipes = memo('wipes', () => {
    const lines = []
    for (let i = 0; i < 40; i++) {
      const y = TOP + hash(i, 1, 61) * PL.h
      const x = hash(i, 2, 61) * 3200
      lines.push([[x, y], [x + 1400 + hash(i, 3, 61) * 1800, y + (hash(i, 4, 61) - 0.5) * 40]])
    }
    return polyD(lines)
  })
  const wx = -(v % 3200)
  const tone = `<rect x="${PL.x}" y="${PL.y}" width="${PL.w}" height="${PL.h}" fill="${PLATE_TONE}"/><g transform="translate(${r(wx, 1)} 0)"><path d="${wipes}" fill="none" stroke="${WIPE}" stroke-width="14" stroke-linecap="round" opacity="0.28"/><g transform="translate(3200 0)"><path d="${wipes}" fill="none" stroke="${WIPE}" stroke-width="14" stroke-linecap="round" opacity="0.28"/></g></g>`
  const rules = easeInOut(ramp(now, 0.3, 2.4))
  const border = drawn(rectD(PL.x + 22, PL.y + 22, PL.w - 44, PL.h - 44), 1.2, rules) + drawn(rectD(PL.x + 28, PL.y + 28, PL.w - 56, PL.h - 56), 0.6, rules)
  const plateTitle = text({ x: 800, y: PL.y + 62, size: 17, text: 'Plate IV', fill: INK, anchor: 'middle', weight: 500, tracking: 8, opacity: 0.75 * easeOut(ramp(now, 1.0, 2.2)) })

  /* ── The margin ───────────────────────────────────────────────────────── */
  let margin = ''
  if (section.kind === 'intro') {
    const o = Math.min(easeOut(ramp(now, 0.6, 1.8)), 1 - easeInOut(ramp(now, section.to - 1.0, section.to - 0.2)))
    margin = titleCard({ title: score.title, track: 4, opacity: o })
  }
  else margin = marginLyric({ now, score, uid })

  const clip = plateClip(uid)
  const world = `translate(${r(-v, 1)} 0)`
  return {
    svg: [
      paper(),
      `<defs>${clip.def}${washDefs(uid)}</defs>`,
      `<g clip-path="${clip.url}">`,
      tone,
      `<g transform="${world}">${main.join('')}</g>`,
      `<g transform="${world}">${threadSvg(plan, now, v)}</g>`,
      `<g transform="${world}">${over.join('')}</g>`,
      border,
      plateTitle,
      '</g>',
      margin,
    ].join('\n'),
    label: active?.text ?? section.label,
  }
}

/* For tools: the camera, so a script can measure it for smoothness. */
export const etchingCamera = (score, now) => planFor(score, 'tool').cam(now)
