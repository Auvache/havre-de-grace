/*
 * Flipbook — style B1, as a film. Somebody drawing the song.
 *
 * The frame is cut in two and the halves never trade places. The top 250 units
 * are the lyric, set flat and still in sentence case: you read it, it does not
 * perform, and it is the only clean thing in the frame. Everything below is a
 * stick-figure stage where the line is acted out, and every moving thing in the
 * film lives there.
 *
 * THE RULES THAT MAKE IT A FLIPBOOK AND NOT AN ANIMATION
 *
 *   - Boil. Every line is five segments with a little tremble on each and every
 *     circle an eighteen-point polygon, and the tremble is reseeded fifteen
 *     times a second (`boil`) — the shake of a drawing re-inked every other
 *     frame at 30 fps. At 60 it is noise; at 8 it is a slideshow.
 *   - Poses are replaced, never tweened. A figure steps on measured words; the
 *     run cycle steps on the eighth-note grid, which in this song is real (the
 *     band played to a click — see the score's header). Nothing eases.
 *   - Scenery that moves moves in steps too, at the boil rate. A smooth scroll
 *     under a boiling drawing reads as a camera, and a flipbook has no camera.
 *   - A scene is replaced, hard, on each line. No transitions.
 *   - The stage acts the line. A scene per line, by hand; the generic fallback
 *     at the bottom is for a score this file has not been storyboarded against.
 *
 * `flipbookFrame({ time, score })` is a pure function of the clock, like every
 * film in shared/video/films/.
 */
import { t, rect, path, wobble, wobbleCircle, rng, advance, r } from '../kit.mjs'
import { joints, strokes, POSES, runPose } from '../figure.mjs'
import { sectionAt, lineAt, shownLineAt, splitLine, bankWords, wordIndexAt } from '../score.mjs'
import { endCard } from '../ending.mjs'

/* ── Palette ──────────────────────────────────────────────────────── */
export const PAPER = '#f7f4ea'
export const RULE = '#c2d4e2'
export const PENCIL = '#23262b'
export const RED = '#d8382b'
export const MARGIN = '#e8a0a0'

const BAND = 250
const GROUND = 760

/* ══ THE PEN ══════════════════════════════════════════════════════════
 *
 * Everything drawn goes through a context: what colour the pencil is on this
 * page, how hard it is pressed, and which boil frame it is. Seeds are mixed
 * with the boil so a drawing trembles in place rather than being redrawn
 * somewhere else.
 */
function pencil(now, { inverted = false, weight = 1 } = {}) {
  const boil = Math.floor(now * 15)
  return {
    boil,
    ink: inverted ? PAPER : PENCIL,
    ground: inverted ? PENCIL : PAPER,
    red: RED,
    weight,
    seed: (k) => (k * 131 + boil * 977) % 2147483647,
  }
}

const stroke = (c, d, o = {}) => path(d, {
  stroke: o.red ? c.red : o.stroke ?? c.ink,
  sw: (o.sw ?? 5) * c.weight,
  cap: 'round',
  join: 'round',
  opacity: o.opacity,
  fill: o.fill,
})

const seg = (c, x1, y1, x2, y2, k, amount = 2.4) => wobble(x1, y1, x2, y2, amount, c.seed(k))

/** A trembling polyline — every segment wobbled on its own seed. */
const poly = (c, pts, k, { closed = false, amount = 2.4 } = {}) => {
  let d = ''
  const n = closed ? pts.length : pts.length - 1
  for (let i = 0; i < n; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % pts.length]
    d += seg(c, a[0], a[1], b[0], b[1], k + i * 7, amount) + ' '
  }
  return d
}

const ring = (c, cx, cy, rad, k, amount = 2.2) => wobbleCircle(cx, cy, rad, amount, c.seed(k))

/* ══ PEOPLE ═══════════════════════════════════════════════════════════ */

/** A stick figure from shared/video/figure.mjs's joints, drawn with the trembling pen. */
function person(c, x, ground, h, pose = 'stand', o = {}) {
  // Names resolve against this file's poses first; the shared rig only knows its own.
  const j = joints(x, ground, h, typeof pose === 'string' ? P[pose] ?? pose : pose, o.facing ?? 1)
  return drawJoints(c, j, h, o)
}

function drawJoints(c, j, h, o = {}) {
  const k = o.seed ?? 1
  const sw = o.sw ?? Math.max(3, h * 0.035)
  const wob = h * 0.014
  const colour = { red: o.red, stroke: o.stroke, sw }
  let d = ''
  strokes(j).forEach((line, i) => { d += poly(c, line, k * 13 + i * 5, { amount: wob }) })
  const head = ring(c, j.head[0], j.head[1], j.head[2], k * 17, wob * 0.8)
  /*
   * A knockout: the same strokes, fat, in the page colour, under the figure.
   * It is what an animator does with an eraser round a character who has to
   * read against a busy background — the runner in a forest of trees drawn in
   * the same pencil disappeared into it without one.
   */
  const halo = o.halo ? stroke(c, d + head, { stroke: c.ground, sw: sw + o.halo }) : ''
  return halo + stroke(c, d, colour) + stroke(c, head, colour)
}

/** A figure lying down — the standing joints turned a quarter about the feet. */
function lying(c, x, ground, h, o = {}) {
  const facing = o.facing ?? 1
  const j = joints(0, 0, h, o.pose ?? 'stand')
  const out = {}
  for (const [key, v] of Object.entries(j)) {
    // Rotate (px, py) so "up" (−y) points along ±x, then sit it on the ground.
    const [px, py, ...rest] = v
    out[key] = [x - py * facing, ground - h * 0.1 - px * 0.6, ...rest]
  }
  return drawJoints(c, out, h, o)
}

/* Local poses: the stage needs a few the shared rig does not name. */
const P = {
  ...POSES,
  walkB: { lean: 4, armB: [30, 20], armF: [-28, 12], legB: [20, 6], legF: [-22, -4] },
  strum: { lean: 2, armB: [30, 90], armF: [70, 40], legB: [-10, 0], legF: [12, 0] },
  shrug: { lean: 0, armB: [-60, -70], armF: [60, 70], legB: [-8, 0], legF: [8, 0] },
  hush: { lean: -2, armB: [-10, 40], armF: [150, -120], legB: [80, 80], legF: [86, 86], seated: true },
  look: { lean: 8, armB: [-20, 30], armF: [30, 30], legB: [80, 80], legF: [86, 86], seated: true },
  trip: { lean: 34, armB: [-80, 20], armF: [110, 20], legB: [-40, 30], legF: [30, 10] },
  dig: { lean: 28, armB: [60, 30], armF: [70, 20], legB: [-16, 0], legF: [20, 10] },
  slump: { lean: 24, armB: [10, 10], armF: [20, 10], legB: [80, 80], legF: [86, 86], seated: true },
  cane: { lean: 22, armB: [-10, 10], armF: [36, 0], legB: [-8, 4], legF: [10, 6] },
  carry: { lean: 0, armB: [-150, -20], armF: [150, 20], legB: [-12, 0], legF: [12, 0] },
  horn: { lean: -6, armB: [70, 40], armF: [80, 20], legB: [-10, 0], legF: [10, 0] },
  dance1: { lean: -8, armB: [-120, 30], armF: [40, 60], legB: [-30, 40], legF: [10, 0] },
  dance2: { lean: 8, armB: [-40, -60], armF: [130, -20], legB: [-10, 0], legF: [40, 50] },
}

/* ══ PROPS ════════════════════════════════════════════════════════════
 *
 * Redrawn by hand rather than taken from the motif library — a library path
 * dropped into this style reads as clip art next to the wobble.
 */
const prop = {
  sun: (c, x, y, s, k = 3) => stroke(c, ring(c, x, y, s, k, 2.4)
    + Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2
      return seg(c, x + Math.cos(a) * s * 1.35, y + Math.sin(a) * s * 1.35, x + Math.cos(a) * s * 1.85, y + Math.sin(a) * s * 1.85, k + i, 2)
    }).join(' '), { red: true, sw: 4 }),
  cloud: (c, x, y, s) => stroke(c, `M${r(x - s)} ${r(y)} q${r(s * 0.1)} ${r(-s * 0.7)} ${r(s * 0.7)} ${r(-s * 0.5)} q${r(s * 0.3)} ${r(-s * 0.6)} ${r(s * 0.9)} ${r(-s * 0.12)} q${r(s * 0.6)} ${r(-s * 0.05)} ${r(s * 0.4)} ${r(s * 0.62)} Z`, { opacity: 0.45 }),
  moon: (c, x, y, s, k = 9, o = {}) => {
    // A crescent: an outer arc and an inner one, both sampled and wobbled.
    const outer = []
    const inner = []
    for (let i = 0; i <= 8; i++) {
      const a = -Math.PI * 0.6 + (i / 8) * Math.PI * 1.2
      outer.push([x - Math.cos(a) * s, y + Math.sin(a) * s])
      inner.push([x - Math.cos(a) * s * 0.45 - s * 0.2, y + Math.sin(a) * s * 0.92])
    }
    return stroke(c, poly(c, [...outer, ...inner.reverse()], k, { closed: true, amount: 1.6 }), { sw: 4, ...o })
  },
  star: (c, x, y, s, k) => stroke(c, seg(c, x - s, y, x + s, y, k, 1) + seg(c, x, y - s, x, y + s, k + 1, 1), { sw: 3, opacity: 0.7 }),
  water: (c, y, k = 40, o = {}) => {
    let d = ''
    for (let row = 0; row < 3; row++) {
      const yy = y + row * 44
      const pts = []
      for (let x = (row % 2) * 40 - 40; x <= 1680; x += 80) pts.push([x, yy + (Math.floor(x / 80) % 2 ? -9 : 9)])
      d += poly(c, pts, k + row * 50, { amount: 3 })
    }
    return stroke(c, d, { sw: 4, opacity: o.opacity ?? 0.55 })
  },
  pier: (c, x0, x1, y, k = 60) => {
    let d = poly(c, [[x0, y], [x1, y]], k) + poly(c, [[x0, y + 18], [x1, y + 18]], k + 3)
    for (let x = x0 + 30; x <= x1; x += 120) d += seg(c, x, y + 18, x, y + 110, k + x, 2)
    return stroke(c, d, { sw: 5 })
  },
  boat: (c, x, y, s, k = 70) => stroke(c,
    poly(c, [[x - s, y - s * 0.25], [x + s, y - s * 0.25], [x + s * 0.7, y + s * 0.2], [x - s * 0.7, y + s * 0.2]], k, { closed: true })
    + seg(c, x, y - s * 0.25, x, y - s * 1.6, k + 9)
    + poly(c, [[x + 6, y - s * 1.5], [x + s * 0.8, y - s * 0.4], [x + 6, y - s * 0.4]], k + 12, { closed: true }), { sw: 4 }),
  lighthouse: (c, x, ground, h, beam, k = 80) => {
    const w = h * 0.14
    const top = ground - h
    let d = poly(c, [[x - w, ground], [x - w * 0.7, top + h * 0.2], [x + w * 0.7, top + h * 0.2], [x + w, ground]], k)
    d += poly(c, [[x - w * 0.8, top + h * 0.2], [x - w * 0.8, top + h * 0.05], [x + w * 0.8, top + h * 0.05], [x + w * 0.8, top + h * 0.2]], k + 20)
    d += poly(c, [[x - w, top + h * 0.05], [x, top - h * 0.06], [x + w, top + h * 0.05]], k + 30)
    d += seg(c, x - w * 0.85, top + h * 0.45, x + w * 0.85, top + h * 0.45, k + 40) + seg(c, x - w * 0.92, top + h * 0.7, x + w * 0.92, top + h * 0.7, k + 41)
    d += poly(c, [[x - w * 2.6, ground + 10], [x - w * 1.4, ground - 16], [x + w * 1.6, ground - 12], [x + w * 2.8, ground + 10]], k + 50)
    let b = ''
    if (beam) {
      const ly = top + h * 0.12
      const dir = beam
      b = stroke(c, seg(c, x + dir * w, ly, x + dir * h * 0.8, ly - h * 0.18, k + 60) + seg(c, x + dir * w, ly + 8, x + dir * h * 0.8, ly + h * 0.09, k + 61), { red: true, sw: 4 })
    }
    return stroke(c, d, { sw: 5 }) + b
  },
  stage: (c, x0, x1, top, k = 90) => stroke(c,
    poly(c, [[x0, top], [x1, top]], k) + poly(c, [[x0 - 30, top + 50], [x1 + 30, top + 50]], k + 5)
    + seg(c, x0, top, x0 - 30, top + 50, k + 6) + seg(c, x1, top, x1 + 30, top + 50, k + 7)
    + seg(c, x0 - 30, top + 50, x0 - 30, 900, k + 8) + seg(c, x1 + 30, top + 50, x1 + 30, 900, k + 9)
    // The curtain, swagged at both top corners.
    + `M${r(x0 - 60)} ${BAND + 10} Q${r(x0 + 40)} ${BAND + 90} ${r(x0 + 80)} ${BAND + 10}`
    + ` M${r(x1 + 60)} ${BAND + 10} Q${r(x1 - 40)} ${BAND + 90} ${r(x1 - 80)} ${BAND + 10}`
    + seg(c, x0 - 60, BAND + 10, x0 - 60, top, k + 10) + seg(c, x1 + 60, BAND + 10, x1 + 60, top, k + 11), { sw: 5 }),
  guitar: (c, j, h, k = 100) => {
    // Body at the hip, forward; neck up to the fretting hand.
    const bx = j.hip[0] + h * 0.1
    const by = j.hip[1] - h * 0.05
    return stroke(c, ring(c, bx, by, h * 0.085, k, 1.6) + ring(c, bx - h * 0.07, by - h * 0.06, h * 0.06, k + 1, 1.4)
      + seg(c, bx - h * 0.1, by - h * 0.1, j.handB[0] - h * 0.05, j.handB[1] - h * 0.04, k + 2, 1.5), { sw: Math.max(3, h * 0.03) })
  },
  mic: (c, x, ground, h, k = 110) => stroke(c,
    seg(c, x, ground, x, ground - h, k) + seg(c, x - 26, ground, x + 26, ground, k + 1)
    + ring(c, x, ground - h - 8, 9, k + 2, 1), { red: true, sw: 4 }),
  suitcase: (c, x, y, s, k = 120) => stroke(c, poly(c, [[x - s, y], [x + s, y], [x + s, y + s * 0.72], [x - s, y + s * 0.72]], k, { closed: true })
    + `M${r(x - s * 0.3)} ${r(y)} q${r(s * 0.3)} ${r(-s * 0.4)} ${r(s * 0.6)} 0`),
  pine: (c, x, ground, h, k = 130, o = {}) => {
    const w = h * 0.3
    const pts = [[x, ground - h]]
    for (let i = 1; i <= 3; i++) {
      const y = ground - h + (h * 0.82 * i) / 3
      const ww = w * (0.45 + 0.55 * (i / 3))
      pts.push([x + ww, y], [x + ww * 0.35, y])
    }
    const left = pts.slice(1).map(([px, py]) => [2 * x - px, py]).reverse()
    return stroke(c, poly(c, [...pts, [x + w * 0.2, ground - h * 0.18], [x - w * 0.2, ground - h * 0.18], ...left], k, { closed: true, amount: 2 })
      + seg(c, x, ground - h * 0.18, x, ground, k + 9), o)
  },
  mountain: (c, peaks, base, k = 140, o = {}) => stroke(c, poly(c, peaks, k, { amount: 3 }), { sw: 4, ...o }),
  signpost: (c, x, ground, dirs, k = 150) => {
    let d = seg(c, x, ground, x, ground - 230, k)
    dirs.forEach((dir, i) => {
      const y = ground - 220 + i * 56
      const len = 110
      d += poly(c, [[x, y], [x + dir * len, y], [x + dir * (len + 24), y + 20], [x + dir * len, y + 40], [x, y + 40]], k + i * 11, { closed: true })
    })
    return stroke(c, d)
  },
  gem: (c, x, y, s, k = 160) => stroke(c, poly(c, [[x - s, y - s * 0.4], [x - s * 0.5, y - s], [x + s * 0.5, y - s], [x + s, y - s * 0.4], [x, y + s * 0.9]], k, { closed: true, amount: 1.4 })
    + seg(c, x - s, y - s * 0.4, x + s, y - s * 0.4, k + 8, 1), { red: true, sw: 4 }),
  sparkle: (c, x, y, s, k) => stroke(c, [0, 1, 2, 3].map((i) => {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    return seg(c, x + Math.cos(a) * s * 0.5, y + Math.sin(a) * s * 0.5, x + Math.cos(a) * s, y + Math.sin(a) * s, k + i, 1)
  }).join(' '), { red: true, sw: 3 }),
  stone: (c, x, ground, s, k = 170, o = {}) => {
    const pts = [[x - s, ground], [x - s * 0.8, ground - s * 0.7], [x, ground - s * 0.9], [x + s * 0.9, ground - s * 0.6], [x + s, ground]]
    // A wobbled line is many subpaths, which will not fill: a solid stone gets its own closed shape under the outline.
    const solid = o.fill ? path(`M${pts.map(([px, py]) => `${r(px)} ${r(py)}`).join(' L')} Z`, { fill: o.fill }) : ''
    return solid + stroke(c, poly(c, pts, k, { amount: 1.6 }), { ...o, fill: undefined })
  },
  bone: (c, x, y, s, k = 180) => stroke(c, seg(c, x - s, y - 6, x + s, y - 6, k, 1) + seg(c, x - s, y + 6, x + s, y + 6, k + 1, 1)
    + ring(c, x - s - 6, y - 10, 10, k + 2, 1) + ring(c, x - s - 6, y + 10, 10, k + 3, 1) + ring(c, x + s + 6, y - 10, 10, k + 4, 1) + ring(c, x + s + 6, y + 10, 10, k + 5, 1), { sw: 4 }),
  globe: (c, x, y, s, part, k = 190) => {
    let d = ring(c, x, y, s, k, 2)
    if (part > 0) d += `M${r(x)} ${r(y - s)} Q${r(x + s * 0.8)} ${r(y)} ${r(x)} ${r(y + s)} M${r(x)} ${r(y - s)} Q${r(x - s * 0.8)} ${r(y)} ${r(x)} ${r(y + s)}`
    if (part > 1) d += seg(c, x - s, y, x + s, y, k + 3)
    if (part > 2) d += seg(c, x - s * 0.85, y - s * 0.5, x + s * 0.85, y - s * 0.5, k + 4) + seg(c, x - s * 0.85, y + s * 0.5, x + s * 0.85, y + s * 0.5, k + 5)
    return stroke(c, d)
  },
  question: (c, x, y, s, k = 200, o = {}) => stroke(c, `M${r(x - s * 0.5)} ${r(y - s * 0.5)} Q${r(x - s * 0.5)} ${r(y - s)} ${r(x)} ${r(y - s)} Q${r(x + s * 0.55)} ${r(y - s)} ${r(x + s * 0.5)} ${r(y - s * 0.45)} Q${r(x + s * 0.4)} ${r(y - s * 0.1)} ${r(x)} ${r(y + s * 0.1)} L${r(x)} ${r(y + s * 0.4)}`
    + ring(c, x, y + s * 0.75, 3, k, 0.6), { sw: 4, ...o }),
  note: (c, x, y, s, k = 210, o = {}) => stroke(c, ring(c, x, y, s * 0.35, k, 0.8) + seg(c, x + s * 0.33, y, x + s * 0.33, y - s * 1.3, k + 1, 1) + seg(c, x + s * 0.33, y - s * 1.3, x + s * 0.8, y - s * 1.0, k + 2, 1), { sw: 4, ...o }),
  zed: (c, x, y, s, k = 220) => stroke(c, poly(c, [[x, y], [x + s, y], [x, y + s], [x + s, y + s]], k, { amount: 1 }), { sw: 3.5 }),
  hourglass: (c, x, y, s, k = 230) => stroke(c, poly(c, [[x - s, y - s], [x + s, y - s], [x + s * 0.1, y], [x + s, y + s], [x - s, y + s], [x - s * 0.1, y]], k, { closed: true, amount: 1.4 }), { red: true, sw: 4 }),
  clock: (c, x, y, s, hand, k = 240) => stroke(c, ring(c, x, y, s, k, 1.5) + seg(c, x, y, x, y - s * 0.7, k + 1, 1)
    + seg(c, x, y, x + Math.cos(hand) * s * 0.55, y + Math.sin(hand) * s * 0.55, k + 2, 1), { sw: 4, red: true }),
  key: (c, x, y, s, k = 250) => stroke(c, ring(c, x - s, y, s * 0.4, k, 1) + seg(c, x - s * 0.6, y, x + s, y, k + 1, 1) + seg(c, x + s * 0.7, y, x + s * 0.7, y + s * 0.35, k + 2, 1) + seg(c, x + s, y, x + s, y + s * 0.3, k + 3, 1), { red: true, sw: 4 }),
  bubble: (c, x, y, w, h, k = 260) => stroke(c, `M${r(x - w)} ${r(y)} Q${r(x - w)} ${r(y - h)} ${r(x)} ${r(y - h)} Q${r(x + w)} ${r(y - h)} ${r(x + w)} ${r(y)} Q${r(x + w)} ${r(y + h)} ${r(x)} ${r(y + h)} Q${r(x - w)} ${r(y + h)} ${r(x - w)} ${r(y)} Z`, { sw: 4, opacity: 0.8 }),
  book: (c, x, y, s, k = 270) => stroke(c, poly(c, [[x, y], [x - s, y - s * 0.2], [x - s, y + s * 0.5], [x, y + s * 0.7], [x + s, y + s * 0.5], [x + s, y - s * 0.2]], k, { closed: true, amount: 1.2 }) + seg(c, x, y, x, y + s * 0.7, k + 9, 1), { sw: 4, red: true }),
  shirt: (c, x, y, s, k = 280, o = {}) => stroke(c, poly(c, [[x - s * 0.3, y], [x - s, y + s * 0.3], [x - s * 0.8, y + s * 0.55], [x - s * 0.5, y + s * 0.45], [x - s * 0.5, y + s * 1.4], [x + s * 0.5, y + s * 1.4], [x + s * 0.5, y + s * 0.45], [x + s * 0.8, y + s * 0.55], [x + s, y + s * 0.3], [x + s * 0.3, y]], k, { closed: true, amount: 1.4 }), { sw: 4, ...o }),
  crown: (c, x, y, s) => stroke(c, `M${r(x - s)} ${r(y)} L${r(x - s)} ${r(y - s * 0.95)} L${r(x - s * 0.45)} ${r(y - s * 0.35)} L${r(x)} ${r(y - s * 1.15)} L${r(x + s * 0.45)} ${r(y - s * 0.35)} L${r(x + s)} ${r(y - s * 0.95)} L${r(x + s)} ${r(y)} Z`, { sw: 4 }),
  cross: (c, x, y, s, k = 290) => stroke(c, seg(c, x - s, y - s, x + s, y + s, k, 2) + seg(c, x + s, y - s, x - s, y + s, k + 1, 2), { red: true, sw: 6 }),
  flower: (c, x, ground, h, k = 300, o = {}) => stroke(c, seg(c, x, ground, x, ground - h, k, 1.5)
    + [0, 1, 2, 3, 4].map((i) => {
      const a = (i / 5) * Math.PI * 2
      return ring(c, x + Math.cos(a) * h * 0.14, ground - h + Math.sin(a) * h * 0.14, h * 0.09, k + i, 0.8)
    }).join(' ') + `M${r(x)} ${r(ground - h * 0.4)} q${r(-h * 0.3)} ${r(-h * 0.05)} ${r(-h * 0.35)} ${r(-h * 0.25)}`, { sw: 4, ...o }),
  cave: (c, x, ground, s, k = 310) => stroke(c, poly(c, [[x - s * 1.4, ground], [x - s * 1.2, ground - s], [x - s * 0.4, ground - s * 1.4], [x + s * 0.6, ground - s * 1.3], [x + s * 1.3, ground - s * 0.8], [x + s * 1.5, ground]], k, { amount: 2 })
    + `M${r(x - s * 0.7)} ${r(ground)} Q${r(x - s * 0.7)} ${r(ground - s * 0.9)} ${r(x)} ${r(ground - s * 0.9)} Q${r(x + s * 0.7)} ${r(ground - s * 0.9)} ${r(x + s * 0.7)} ${r(ground)}`, { sw: 5 }),
  bush: (c, x, ground, s, bend, k = 320) => stroke(c, Array.from({ length: 7 }, (_, i) => {
    const a = -Math.PI / 2 + (i - 3) * 0.28 + bend
    return `M${r(x)} ${r(ground)} Q${r(x + Math.cos(a) * s * 0.5 + bend * 30)} ${r(ground + Math.sin(a) * s * 0.5)} ${r(x + Math.cos(a) * s + bend * 60)} ${r(ground + Math.sin(a) * s)}`
  }).join(' '), { sw: 4 }),
  wind: (c, x, y, w, k = 330) => stroke(c, `M${r(x)} ${r(y)} q${r(w * 0.5)} -14 ${r(w)} 0 q${r(w * 0.2)} 10 ${r(w * 0.1)} 18`, { sw: 3.5, opacity: 0.7 }),
  house: (c, x, ground, s, k = 340) => stroke(c, poly(c, [[x - s, ground], [x - s, ground - s * 1.1], [x, ground - s * 1.8], [x + s, ground - s * 1.1], [x + s, ground]], k)
    + poly(c, [[x - s * 0.3, ground], [x - s * 0.3, ground - s * 0.8], [x + s * 0.3, ground - s * 0.8], [x + s * 0.3, ground]], k + 20, { amount: 1.2 })),
  shovel: (c, x, y, s, k = 350) => stroke(c, seg(c, x, y, x + s * 0.6, y - s * 1.4, k, 1) + poly(c, [[x - s * 0.25, y], [x + s * 0.2, y + s * 0.1], [x + s * 0.1, y + s * 0.45], [x - s * 0.3, y + s * 0.3]], k + 4, { closed: true, amount: 1 }), { sw: 4 }),
  dirt: (c, x, ground, n, k = 360) => stroke(c, Array.from({ length: n }, (_, i) => {
    const rand = rng(k + i)
    const px = x + (rand() - 0.5) * 160
    const py = ground - 20 - rand() * 90
    return ring(c, px, py, 4 + rand() * 4, k + i * 3, 0.6)
  }).join(' '), { sw: 3 }),
  glacier: (c, x, ground, s, k = 370) => stroke(c, poly(c, [[x - s * 1.4, ground], [x - s * 0.9, ground - s * 0.9], [x - s * 0.5, ground - s * 0.6], [x, ground - s * 1.5], [x + s * 0.5, ground - s * 0.8], [x + s * 1.4, ground]], k, { amount: 2 })
    + seg(c, x, ground - s * 1.5, x - s * 0.15, ground - s * 0.7, k + 9, 1.4) + seg(c, x - s * 0.9, ground - s * 0.9, x - s * 0.8, ground - s * 0.4, k + 10, 1.2), { sw: 5 }),
  birds: (c, x, y, s, k = 380) => stroke(c, `M${r(x - s)} ${r(y)} q${r(s * 0.5)} ${r(-s * 0.6)} ${r(s)} 0 q${r(s * 0.5)} ${r(-s * 0.6)} ${r(s)} 0`, { sw: 3.5 }),
  horn: (c, j, h, k = 390) => {
    // A trumpet held out from the mouth to the hands, bell forward.
    const mx = j.head[0] + h * 0.08
    const my = j.head[1] + h * 0.04
    const bx = mx + h * 0.42
    return stroke(c, seg(c, mx, my, bx, my, k, 1) + poly(c, [[bx, my], [bx + h * 0.12, my - h * 0.07], [bx + h * 0.12, my + h * 0.07]], k + 3, { closed: true, amount: 0.8 })
      + ring(c, mx + h * 0.2, my + h * 0.05, h * 0.04, k + 5, 0.6), { red: true, sw: Math.max(3, h * 0.03) })
  },
}

/* ══ THE PAGE ═════════════════════════════════════════════════════════ */

function paper(c, inverted) {
  if (inverted) return rect(0, 0, 1600, 900, PENCIL)
  return rect(0, 0, 1600, 900, PAPER)
    + Array.from({ length: 11 }, (_, i) => `<line x1="0" y1="${130 + i * 70}" x2="1600" y2="${130 + i * 70}" stroke="${RULE}" stroke-width="1.6" opacity="0.5"/>`).join('')
    + `<line x1="150" y1="0" x2="150" y2="900" stroke="${MARGIN}" stroke-width="2" opacity="0.7"/>`
}

const groundLine = (c, y = GROUND, k = 21) => stroke(c, seg(c, 0, y, 1600, y - 2, k, 4), { sw: 4 })

/*
 * The lyric band. Flat, still, sentence case, and the only clean thing on the
 * page. The row being sung is red and the other pencil — whole rows, not a
 * sweep: a caption does not perform. Before the first word lands nothing is
 * red; after the last it stays red until the line is replaced.
 */
function band(line, now, inverted) {
  const bg = inverted ? PENCIL : PAPER
  const ink = inverted ? PAPER : PENCIL
  const rows = splitLine(line.text)
  const banks = bankWords(line, rows)
  let singing = -1
  banks.forEach((words, i) => { if (now >= words[0].t - 0.02) singing = i })
  // Mixed case sets about 0.84 of the caps measure in Jost 600.
  const widthAt = (row, size) => advance(row, size) * 0.84
  const sizes = rows.map((row) => Math.min(82, Math.max(56, 1360 / (widthAt(row, 1) || 1))))
  const size = Math.min(...sizes)
  const ys = rows.length === 1 ? [158] : [112, 210]
  return rect(0, 0, 1600, BAND, bg)
    + `<line x1="0" y1="${BAND}" x2="1600" y2="${BAND}" stroke="${ink}" stroke-width="3"/>`
    + rows.map((row, i) => {
      const w = widthAt(row, size)
      return t({ x: 800, y: ys[i], size, text: row, fill: i === singing ? RED : ink, anchor: 'middle', weight: 600, upper: false, len: w > 1400 ? 1400 : null })
    }).join('')
}

/* ══ SCENES ═══════════════════════════════════════════════════════════
 *
 * One per line, keyed `section:index-within-section`. Each takes the pen, the
 * clock, the line and `w` — the index of the word sung last, -1 before the
 * first — and returns the stage. `w` is how a scene steps on words: pick a pose
 * with it, show a prop from it, never interpolate with it.
 */
const SCENES = {
  /* ── Verse 1: somebody leaving, and what they stumble on ─────────── */
  'verse-1:0': (c, now, line, w) => {
    // Headed out: a suitcase, a signpost, a step per word.
    const x = 380 + Math.max(w, 0) * 70
    return groundLine(c) + prop.signpost(c, 1320, GROUND, [1, 1])
      + person(c, x, GROUND, 250, w % 2 ? 'walk' : 'walkB', { seed: 3 }) + prop.suitcase(c, x + 58, GROUND - 100, 40)
      + prop.sun(c, 1380, 380, 50)
  },
  'verse-1:1': (c, now, line, w) => groundLine(c)
    // Lose my way: the arrows on the post change their minds every word.
    + prop.signpost(c, 980, GROUND, [w % 2 ? -1 : 1, w % 3 ? 1 : -1, w % 2 ? 1 : -1])
    + person(c, 620, GROUND, 250, w >= 4 ? 'shrug' : 'stand', { seed: 5 })
    + (w >= 5 ? prop.question(c, 620, 390, 40) : ''),
  'verse-1:2': (c, now, line, w) => groundLine(c)
    + person(c, 700, GROUND, 250, w >= 3 ? 'trip' : 'walk', { seed: 7 })
    + prop.gem(c, 900, GROUND - 26, 26)
    + (w >= 5 ? prop.sparkle(c, 900, GROUND - 40, 70, 11) : '')
    + (w >= 6 ? prop.sparkle(c, 1120, 520, 40, 12) + prop.gem(c, 1120, 520, 18) : ''),
  'verse-1:3': (c, now, line, w) => groundLine(c)
    + prop.sun(c, 800, 400, 70 + Math.min(Math.max(w, 0), 4) * 6)
    + prop.cloud(c, 440, 420, 110) + prop.cloud(c, 1180, 380, 90)
    + person(c, 800, GROUND, 230, 'reach', { seed: 9 }),
  'verse-1:4': (c, now, line, w) => prop.water(c, GROUND + 30)
    + groundLine(c)
    + prop.globe(c, 800, 510, 170, w + 1)
    + person(c, 1150, GROUND, 220, 'reach', { seed: 13, facing: -1 }),
  'verse-1:5': (c, now, line, w) => groundLine(c)
    // Ebony, ivory and bone, one per word, set down in a row.
    + (w >= 0 ? prop.stone(c, 560, GROUND, 60, 171, { fill: c.ink }) : '')
    + (w >= 1 ? stroke(c, `M${520 + 280} ${GROUND - 20} Q${860} ${GROUND - 140} ${940} ${GROUND - 150}`, { sw: 7 }) : '')
    + (w >= 3 ? prop.bone(c, 1100, GROUND - 24, 50) : '')
    + person(c, 330, GROUND, 230, 'look', { seed: 15 }),
  'verse-1:6': (c, now, line, w) => groundLine(c)
    + prop.stone(c, 520, GROUND, 90, 172) + prop.stone(c, 520, GROUND - 70, 55, 173) + prop.stone(c, 520, GROUND - 115, 32, 174)
    + prop.moon(c, 1320, 390, 60)
    + (w >= 3 ? lying(c, 900, GROUND, 240, { seed: 17 }) : person(c, 900, GROUND, 240, 'stand', { seed: 17 }))
    + (w >= 4 ? prop.zed(c, 1030, 600, 28) : ''),
  'verse-1:7': (c, now, line, w) => groundLine(c)
    + prop.moon(c, 1320, 390, 60)
    + lying(c, 620, GROUND, 240, { seed: 17 })
    // They hate sleeping alone: a second sleeper arrives on "alone".
    + (w >= 5 ? lying(c, 980, GROUND, 230, { seed: 19, facing: -1 }) : person(c, 1300, GROUND, 230, w >= 3 ? 'walk' : 'stand', { seed: 19, facing: -1 }))
    + prop.zed(c, 700, 610, 26),

  /* ── Verse 2: tired of thinking, wanting stories ──────────────────── */
  'verse-2:0': (c, now, line, w) => groundLine(c)
    + person(c, 700, GROUND, 240, 'slump', { seed: 21 })
    + Array.from({ length: Math.max(w + 1, 0) }, (_, i) => prop.question(c, 560 + i * 60, 420 - (i % 2) * 50, 26 + (i % 3) * 6, 200 + i * 3)).join(''),
  'verse-2:1': (c, now, line, w) => groundLine(c)
    + lying(c, 520, GROUND, 230, { seed: 23 })
    + prop.bubble(c, 1000, 470, 250, 140)
    + (w >= 0 ? person(c, 880, 560, 120, 'walk', { seed: 25, sw: 4 }) : '')
    + (w >= 2 ? stroke(c, seg(c, 1000, 560, 1000, 380, 26) + poly(c, [[1000, 380], [1070, 400], [1000, 420]], 27, { closed: true }), { red: true, sw: 4 }) : '')
    + (w >= 4 ? prop.key(c, 1130, 450, 40) : ''),
  'verse-2:2': (c, now, line, w) => groundLine(c)
    // Pressure: a rock held overhead, getting bigger each word.
    + person(c, 800, GROUND, 230, 'carry', { seed: 29 })
    + prop.stone(c, 800, GROUND - 250, 90 + Math.max(w, 0) * 14, 175)
    + (w >= 4 ? prop.clock(c, 1250, 440, 60, now * 0.4) : ''),
  'verse-2:3': (c, now, line, w) => groundLine(c)
    + person(c, 800, GROUND, 200 + Math.max(0, 5 - w) * 8, 'cane', { seed: 31 })
    + stroke(c, seg(c, 870, GROUND - 120, 890, GROUND, 32))
    + (w >= 6 ? prop.hourglass(c, 1200, 520, 50) : ''),
  'verse-2:4': (c, now, line, w) => groundLine(c)
    + person(c, 800, GROUND, 250, w >= 5 ? 'reach' : 'stand', { seed: 33 })
    + (w >= 5 ? prop.book(c, 930, 520, 50) : ''),
  'verse-2:5': (c, now, line, w) => groundLine(c)
    + person(c, 560, GROUND, 230, 'look', { seed: 35 }) + prop.book(c, 650, GROUND - 90, 40)
    + prop.bubble(c, 1050, 470, 300, 140)
    // The tale being remembered: a small figure crossing the bubble a step per word.
    + person(c, 850 + Math.max(w, 0) * 45, 560, 110, w % 2 ? 'walk' : 'walkB', { seed: 36, sw: 4 }),
  'verse-2:6': (c, now, line, w) => groundLine(c)
    + stroke(c, seg(c, 300, 380, 300, GROUND, 37) + seg(c, 1300, 380, 1300, GROUND, 38) + `M300 400 Q800 470 1300 400`, { sw: 4 })
    + Array.from({ length: Math.min(Math.max(w + 1, 0), 4) }, (_, i) => prop.shirt(c, 440 + i * 220, 430 + (i === 1 || i === 2 ? 20 : 8), 40, 280 + i * 9, { red: i === 3 })).join('')
    + person(c, 1150, GROUND, 230, 'reach', { seed: 39, facing: -1 }),
  'verse-2:7': (c, now, line, w) => groundLine(c)
    + person(c, 800, GROUND, 250, w % 2 ? 'strum' : 'play', { seed: 41 })
    + prop.guitar(c, joints(800, GROUND, 250, w % 2 ? P.strum : P.play), 250)
    + Array.from({ length: Math.max(w + 1, 0) }, (_, i) => prop.note(c, 960 + i * 55, 480 - (i % 3) * 40, 28, 210 + i * 5, { red: i === w })).join(''),

  /* ── Verse 3: what the treasures are ─────────────────────────────── */
  'verse-3:0': (c, now, line, w) => groundLine(c)
    // Headed out again — this time from a door, and the whole page to cross.
    + prop.house(c, 330, GROUND, 120)
    + person(c, 420 + Math.max(w, 0) * 110, GROUND, 240, w % 2 ? 'walk' : 'walkB', { seed: 43 })
    // Somewhere to be headed: hills on the far side of the page.
    + prop.mountain(c, [[1080, GROUND], [1250, GROUND - 190], [1360, GROUND - 110], [1470, GROUND - 240], [1620, GROUND]], GROUND, 145, { opacity: 0.5 }),
  'verse-3:1': (c, now, line, w) => stroke(c, `M800 ${GROUND + 140} L760 ${GROUND - 60} L520 ${GROUND - 200} M800 ${GROUND + 140} L840 ${GROUND - 60} L1080 ${GROUND - 200} M760 ${GROUND - 60} L840 ${GROUND - 60}`, { sw: 4 })
    + groundLine(c, GROUND - 60, 22)
    + person(c, 800, GROUND + 20, 230, w >= 5 ? 'shrug' : 'stand', { seed: 45 })
    + (w >= 5 ? prop.question(c, 800, 420, 44) : ''),
  'verse-3:2': (c, now, line, w) => groundLine(c)
    + person(c, 700, GROUND, 240, w % 2 ? 'dig' : 'stand', { seed: 47 })
    + prop.shovel(c, 790, GROUND - 20, 90)
    + prop.cross(c, 900, GROUND - 14, 22)
    + prop.dirt(c, 920, GROUND, Math.max(w + 1, 0) * 2),
  'verse-3:3': (c, now, line, w) => groundLine(c)
    + prop.crown(c, 680, GROUND - 4, 60)
    + stroke(c, ring(c, 820, GROUND - 20, 20, 291) + ring(c, 870, GROUND - 16, 16, 292) + ring(c, 850, GROUND - 48, 16, 293), { sw: 4 })
    + (w >= 4 ? prop.cross(c, 770, GROUND - 60, 110) : '')
    + person(c, 1200, GROUND, 240, w >= 4 ? 'walk' : 'stand', { seed: 49, facing: w >= 4 ? 1 : -1 }),
  'verse-3:4': (c, now, line, w) => {
    // Glaciers, gardens, grottos — each one arrives on its own word.
    const at = (text) => line.words.findIndex((x) => x.text.toLowerCase().startsWith(text))
    const g = at('glaciers')
    const f = at('gardens')
    const k = at('grottos')
    const where = w >= k ? 1260 : w >= f ? 800 : 340
    return groundLine(c)
      + (w >= g ? prop.glacier(c, 340, GROUND, 150) : '')
      + (w >= f ? [0, 1, 2, 3].map((i) => prop.flower(c, 700 + i * 70, GROUND, 110 + (i % 2) * 40, 300 + i * 11, { red: i === 1 })).join('') : '')
      + (w >= k ? prop.cave(c, 1260, GROUND, 140) : '')
      + person(c, where + (w >= k ? -220 : 160), GROUND, 170, w >= f ? 'walk' : 'stand', { seed: 51, sw: 5 })
  },
  'verse-3:5': (c, now, line, w) => {
    // The wind through the sage: bushes lean, harder each word.
    const bend = Math.min(Math.max(w + 1, 0), 6) * 0.07
    return groundLine(c)
      + [260, 520, 1080, 1340].map((x, i) => prop.bush(c, x, GROUND, 110 + (i % 2) * 30, bend, 320 + i * 17)).join('')
      + Array.from({ length: Math.min(Math.max(w + 1, 0), 5) }, (_, i) => prop.wind(c, 280 + i * 230, 420 + (i % 2) * 90, 160, 330 + i)).join('')
      + person(c, 800, GROUND, 240, w >= 6 ? 'reach' : 'stand', { seed: 53 })
  },

  /* ── The window: the harbor, the stage ────────────────────────────── */
  'verse-3:6': (c, now, line, w) => {
    /*
     * The hush of a harbor so hollow. The quietest scene in the film and it
     * stays that way: one change per word, and no word changes more than one
     * thing. Two boats sail out of it one after the other, so that by
     * "hollow" there is nobody in the harbor but the figure on the pier.
     */
    const beam = w < 0 ? 1 : [1, -1, 1, -1, 1, -1, 1][w]
    const pier = GROUND - 60
    return prop.water(c, GROUND + 10)
      + prop.moon(c, 380, 380, 56)
      + (w >= 4 ? stroke(c, seg(c, 330, GROUND + 26, 430, GROUND + 26, 401, 2) + seg(c, 350, GROUND + 60, 410, GROUND + 60, 402, 2), { sw: 3.5, opacity: 0.6 }) : '')
      + [[640, 330], [760, 310], [520, 300]].map(([x, y], i) => (w >= 1 ? prop.star(c, x, y, 9, 410 + i * 3) : '')).join('')
      + prop.lighthouse(c, 1290, GROUND - 8, 330, beam)
      + (w < 3 ? prop.boat(c, 1030, GROUND - 4, 70, 71) : w < 5 ? prop.boat(c, 1480, GROUND + 60, 44, 71) : '')
      + (w < 5 ? prop.boat(c, 470, GROUND + 4, 56, 72) : '')
      + prop.pier(c, 0, 820, pier)
      + person(c, 800, pier + 240 * 0.18, 240, w >= 6 ? 'look' : w >= 1 ? 'hush' : 'sit', { seed: 61, facing: w >= 6 ? -1 : 1 })
  },
  'verse-3:7': (c, now, line, w) => {
    /*
     * The roar of a crowd center stage. The loudest the paper gets: a stage,
     * a spot, the figure with a guitar at the mic, and a crowd along the foot
     * of the page that changes every pose on every word from "roar" on.
     */
    const top = 610
    const hp = 270
    const strum = w % 2 ? P.strum : P.play
    const j = joints(760, top, hp, strum)
    const crowd = Array.from({ length: 11 }, (_, i) => {
      const rand = rng(500 + i)
      const pose = w < 1 ? 'stand' : ['cheer', 'wave', 'cheer', 'stand', 'wave'][(i + w * 3 + Math.floor(rand() * 5)) % 5]
      return person(c, 90 + i * 142 + rand() * 30, 930, 170 + rand() * 30, pose, { seed: 70 + i, sw: 5, facing: i % 2 ? -1 : 1 })
    }).join('')
    const shout = w >= 1
      ? Array.from({ length: 6 }, (_, i) => {
        const x = 150 + i * 260
        return stroke(c, seg(c, x, 700, x - 20, 660, 450 + i * 3 + w, 2) + seg(c, x + 24, 700, x + 30, 655, 451 + i * 3 + w, 2), { sw: 3.5, opacity: 0.8 })
      }).join('')
      : ''
    return prop.stage(c, 330, 1270, top)
      + stroke(c, `M170 ${BAND + 20} L680 ${top} M1430 ${BAND + 20} L900 ${top}`, { red: true, sw: 3, opacity: w >= 5 ? 0.9 : 0.5 })
      + drawJoints(c, j, hp, { seed: 81 }) + prop.guitar(c, j, hp)
      + prop.mic(c, 880, top, 170)
      + (w >= 6 ? stroke(c, ring(c, 760, top - hp * 0.5, hp * 0.62, 88, 3), { red: true, sw: 3, opacity: 0.8 }) : '')
      + shout + crowd
  },
}

/* ── The choruses: running, and a different country each time ────────
 *
 * The figure stays put and the world goes past it — in steps, at the boil
 * rate, one run pose per eighth. A section that repeats musically must not
 * repeat visually, so each chorus runs through somewhere else: pines, then
 * hills and birds, then mountains into a forest that closes in on "wild" and
 * is drawn with the pencil pressed twice as hard.
 */
const RUN_X = 560
const SPEED = 300

function chorus(c, now, section, score) {
  const stepped = Math.floor(now * 15) / 15
  const off = (stepped - section.from) * SPEED
  const pose = runPose(Math.floor((now - 0.03) / 0.25))
  const ground = GROUND
  const out = [groundLine(c, ground, 23)]
  const n = Number(section.id.split('-')[1] ?? 1)

  const visible = (gap, parallax, fn) => {
    const o = off * parallax
    const k0 = Math.floor((o - 300) / gap)
    const k1 = Math.ceil((o + 1900) / gap)
    for (let k = k0; k <= k1; k++) out.push(fn(k, k * gap - o))
  }

  if (n === 2) {
    // Rolling hills and birds, with the sun ahead.
    out.push(prop.sun(c, 1340, 380, 46))
    visible(520, 0.4, (k, x) => {
      const rand = rng(900 + k)
      const h = 80 + rand() * 90
      return stroke(c, `M${r(x - 300)} ${ground} Q${r(x)} ${r(ground - h * 2)} ${r(x + 300)} ${ground}`, { sw: 4, opacity: 0.6 })
    })
    visible(300, 1, (k, x) => {
      const rand = rng(950 + k)
      return rand() < 0.5 ? prop.birds(c, x, 360 + rand() * 120, 22, 380 + k) : ''
    })
  }
  else if (n === 3) {
    // Mountains far off, then the forest, which reaches the runner on "wild".
    const wild = score.lines.filter((l) => l.section === section.id)[0]?.words.at(-1)?.t ?? section.from + 2.7
    const edge = (wild - section.from) * SPEED + RUN_X + 160
    visible(460, 0.35, (k, x) => {
      const rand = rng(700 + k)
      const h = 180 + rand() * 170
      return prop.mountain(c, [[x - 230, ground], [x - 60, ground - h * 0.6], [x, ground - h], [x + 90, ground - h * 0.55], [x + 230, ground]], ground, 700 + k * 13, { opacity: 0.55 })
    })
    visible(95, 1, (k, x) => {
      const rand = rng(800 + k)
      const world = k * 95
      const inForest = world > edge
      if (!(inForest ? rand() < 0.95 : rand() < 0.16)) return ''
      const h = inForest ? 150 + rand() * 170 : 110 + rand() * 60
      return prop.pine(c, x + rand() * 40, ground, h, 130 + k * 7, { sw: 5 })
    })
  }
  else {
    // A pine wood at a steady spacing, and a line of far hills.
    out.push(stroke(c, `M0 ${ground - 120} Q400 ${ground - 220} 800 ${ground - 140} T1600 ${ground - 150}`, { sw: 3, opacity: 0.4 }))
    visible(240, 1, (k, x) => {
      const rand = rng(600 + k)
      return prop.pine(c, x + rand() * 80, ground, 150 + rand() * 120, 600 + k * 7, { sw: 5 })
    })
  }

  out.push(person(c, RUN_X, ground, 260, pose, { seed: 91, sw: 9, halo: 22 }))
  // Dust kicked up behind — a puff on every other step.
  if (Math.floor((now - 0.03) / 0.25) % 2 === 0) {
    out.push(stroke(c, ring(c, RUN_X - 110, ground - 14, 12, 95, 1.2) + ring(c, RUN_X - 150, ground - 26, 8, 96, 1), { sw: 3, opacity: 0.6 }))
  }
  return out.join('\n')
}

/* ── The sections with no lyric ──────────────────────────────────── */

function intro(c, now, score) {
  // Rubbed out rather than faded: the title steps down in three passes before the verse.
  const rub = now < 13.8 ? 1 : now < 14.3 ? 0.6 : now < 14.8 ? 0.3 : now < 15.2 ? 0.12 : 0
  const beat = Math.floor((now - 0.03) / 1.0)
  const parts = [groundLine(c, 700, 5)]
  if (now >= 1.0 && rub > 0) {
    parts.push(`<g opacity="${rub}">`
      + t({ x: 800, y: 330, size: 170, text: score.title, fill: PENCIL, anchor: 'middle', weight: 600, upper: false })
      + (now >= 3.0 ? t({ x: 800, y: 410, size: 40, text: score.artist, fill: RED, anchor: 'middle', weight: 500, tracking: 14 }) : '')
      + '</g>')
  }
  if (now >= 2.0) parts.push(prop.sun(c, 1340, 560, 52))
  if (now >= 4.0 && rub < 1) {
    // The eraser's crumbs, under the rubbed-out title.
    parts.push(stroke(c, Array.from({ length: 9 }, (_, i) => seg(c, 460 + i * 80, 460 + (i % 3) * 8, 490 + i * 80, 458 + (i % 3) * 8, 30 + i, 2)).join(' '), { sw: 3, opacity: 0.35 }))
  }
  parts.push(person(c, 800, 700, 260, now >= 6 ? (beat % 2 ? 'wave' : 'stand') : 'stand', { seed: 2 }))
  return parts.join('\n')
}

function breakScene(c, now) {
  // After the run: sitting on a rock getting a breath back, a pose per bar.
  const bar = Math.floor((now - 0.03) / 2)
  return groundLine(c)
    + prop.stone(c, 800, GROUND, 110, 176)
    + person(c, 800, GROUND - 60, 230, bar % 2 ? 'look' : 'slump', { seed: 99 })
    + prop.sun(c, 1320, 400, 50) + prop.cloud(c, 420, 420, 100)
}

function solo(c, now, section) {
  /*
   * Forty seconds of trumpet and mellophone, and no words to step on. Beats
   * are measured in this song, so the players step on them instead — and the
   * scene changes every eight bars, so forty seconds is five pictures rather
   * than one.
   */
  const beat = Math.floor((now - 0.03) / 0.5)
  const scene = Math.floor((now - section.from) / 8) % 5
  const out = [groundLine(c)]
  const player = (x, h, seed, facing = 1) => {
    const pose = { ...P.horn, lean: beat % 2 ? -10 : -2 }
    const j = joints(x, GROUND, h, pose, facing)
    return drawJoints(c, j, h, { seed }) + (facing === 1 ? prop.horn(c, j, h) : '')
  }
  const notes = (x, y, n) => Array.from({ length: n }, (_, i) => prop.note(c, x + i * 60, y - ((i + beat) % 3) * 36, 26, 600 + i, { red: (i + beat) % 4 === 0 })).join('')
  if (scene === 0) out.push(player(700, 260, 101), notes(960, 470, 1 + (beat % 4)))
  else if (scene === 1) {
    out.push(player(500, 240, 103), notes(760, 470, 2))
    out.push(person(c, 1100, GROUND, 230, beat % 2 ? P.dance1 : P.dance2, { seed: 105 }))
  }
  else if (scene === 2) {
    out.push(player(360, 220, 107), player(700, 240, 109), player(1040, 220, 111), notes(1260, 460, 2 + (beat % 2)))
  }
  else if (scene === 3) {
    out.push(...[300, 620, 940, 1260].map((x, i) => person(c, x, GROUND, 220, (beat + i) % 2 ? P.dance1 : P.dance2, { seed: 113 + i, facing: i % 2 ? -1 : 1 })))
    out.push(notes(700, 400, 3))
  }
  else {
    out.push(player(800, 280, 121), notes(1060, 430, 1 + (beat % 3)), prop.sun(c, 1380, 380, 44))
  }
  return out.join('\n')
}

function outro(c, now, section) {
  // Walking away, smaller each beat, towards a horizon.
  const beat = Math.max(0, Math.floor((now - section.from) / 0.5))
  const h = Math.max(30, 220 - beat * 22)
  const x = 700 + beat * 55
  return groundLine(c, 640, 25)
    + prop.sun(c, 1250, 520, 60)
    + person(c, x, 640, h, beat % 2 ? 'walk' : 'walkB', { seed: 131, sw: Math.max(3, h * 0.035) })
}

/** The fallback: a figure standing beside what the line is about. For an unboarded score. */
function generic(c, now, line, w) {
  return groundLine(c) + person(c, 800, GROUND, 240, w % 2 ? 'walk' : 'stand', { seed: 141 }) + prop.sun(c, 1300, 420, 50)
}

/* ══ THE FRAME ════════════════════════════════════════════════════════ */

export function flipbookFrame({ time, score, lockup = '', uid = 'flip' }) {
  const now = time
  if (score.endCardAt != null && now >= score.endCardAt) return endCard({ now, from: score.endCardAt, lockup })

  const section = sectionAt(score, now)
  const kind = section.kind
  const inverted = kind === 'chorus'
  const c = pencil(now, { inverted, weight: section.id === 'chorus-3' ? 1.6 : 1 })
  const active = lineAt(score, now)
  const shown = shownLineAt(score, now)
  const lyric = shown && shown.section === section.id ? shown : null

  let stage = ''
  if (kind === 'intro') stage = intro(c, now, score)
  else if (kind === 'chorus') stage = chorus(c, now, section, score)
  else if (kind === 'break') stage = breakScene(c, now)
  else if (kind === 'solo') stage = solo(c, now, section)
  else if (kind === 'outro') stage = outro(c, now, section)
  else if (lyric) {
    const index = score.lines.filter((l) => l.section === section.id).indexOf(lyric)
    const scene = SCENES[`${section.id}:${index}`] ?? generic
    stage = scene(c, now, lyric, wordIndexAt(lyric, now))
  }
  else stage = groundLine(c)

  return {
    svg: [
      `<g id="${uid}-page">`,
      paper(c, inverted),
      stage,
      lyric && kind !== 'intro' ? band(lyric, now, inverted) : '',
      '</g>',
    ].join('\n'),
    label: active?.section === section.id ? active.text : section.label,
  }
}

export const FLIPBOOK = {
  id: 'b1-flipbook',
  name: 'Flipbook',
  accent: RED,
  palette: { PAPER, RULE, PENCIL, RED, MARGIN },
}
