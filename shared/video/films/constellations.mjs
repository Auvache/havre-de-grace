/*
 * Meet Me at the Horizon · Constellations — the film (v1, 2026-11-10).
 *
 * One sleepless night on a star-atlas plate: the night sky over a black
 * ridge. The whole sky wheels slowly about a pole below the horizon for the
 * whole song, like the disc of a planisphere behind its horizon mask, so
 * stars rise on the left and set on the right and the hour in the corner
 * runs from half past eleven to six.
 *
 * His mind is one red point, the pen. In the verses it races: it jumps from
 * star to star on every sung word and leaves a thread that fades. When a
 * line names a thing, the pen joins stars that were already there into it,
 * a stroke per word, finishing on the word that names it, and the atlas
 * letters it in Latin: the sheep he isn't counting, the moon, the bed, an
 * hourglass, the clock, the tree, the dawn, the eye, the spine, the house,
 * the window, him alone. Each holds and fades to a ghost and wheels on with
 * the sky; the first ones have set by morning.
 *
 * In the choruses the pen settles: it goes over the tree and the dawn again,
 * then drifts to the bed, and on "you're still next to me" five stars beside
 * it light gold — her. Gold comes up behind the ridge in each chorus, higher
 * each time, and sinks back; after the third it stays. In the silences the
 * pen only drifts.
 *
 * On each "Meet me at the horizon" the pen comes down to the ridge and
 * draws him standing there; on the long "Oh" she is drawn in gold across
 * from him; "won't you" is his arm, the second "meet me" hers. The first
 * time they are too far apart and she fades with the gold. The last time
 * the hands meet on "horizon", the pen rests there, the stars go out a few
 * at a time, and the sun comes up behind the two of them. End card on the
 * last strike.
 *
 * Inks: the night plate's own (a warm black, star white), the red pen (one
 * red thing, the only thing that travels), and dawn gold for the dawn and
 * for her.
 *
 * Built as one plan per score (planFor): the figures placed in the turning
 * sky, every stroke scheduled on a measured word, and the pen's whole path
 * as legs. The frame only reads it. The sky's fixed parts (stars, grid,
 * ridge) are `lib`.
 */
import { rng, r, clamp01, lerp, easeInOut, easeOut, ramp, esc } from '../kit.mjs'
import { COVER_SHEET, SECOND_INK, paper, marginLyric, glide } from '../album.mjs'
import { filmOpening, inOpening } from '../opening.mjs'
import { endCard } from '../ending.mjs'

const GOLD = SECOND_INK['meet-me-at-the-horizon']
const { x: PX, y: PY, w: PW, h: PH } = COVER_SHEET.plate
const PR = PX + PW
const PB = PY + PH

/** Red that reads as a line on the night plate; the album red is too dark there at two units wide. */
const NRED = '#d4513b'
const STAR = '#efe6cf'
const LAND = '#0e0d0b'

/** The held last "oh" lets go here (meetMeAtTheHorizonScore.ts header). */
const VOICE_END = 194.9
/** The black has lifted (the standard opening). */
const LIFTED = 12

/* ── The turning sky ──────────────────────────────────────────────── */

/*
 * The pole is below the horizon, as it is looking south: everything in the
 * sky moves on circles about it, left to right. "Sky" coordinates are where a
 * thing is at t = 0; the screen is the sky turned by OMEGA degrees a second.
 * 0.32°/s is 68° over the film: about six units a second in mid-sky, slow
 * enough to be the night and fast enough to see.
 */
const POLE = [800, 1500]
const OMEGA = 0.32
const DEG = Math.PI / 180
const turn = ([x, y], deg) => {
  const a = deg * DEG
  const c = Math.cos(a)
  const s = Math.sin(a)
  const dx = x - POLE[0]
  const dy = y - POLE[1]
  return [POLE[0] + dx * c - dy * s, POLE[1] + dx * s + dy * c]
}
const toScreen = (p, t) => turn(p, OMEGA * t)
const toSky = (p, t) => turn(p, -OMEGA * t)
/** A point `theta` degrees round from straight up, `R` from the pole. */
const polar = (theta, R) => [POLE[0] + R * Math.sin(theta * DEG), POLE[1] - R * Math.cos(theta * DEG)]
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])

/* ── The ridge ────────────────────────────────────────────────────── */

const RIDGE = 690
const RIDGE_PTS = (() => {
  const g = rng(7)
  const pts = []
  for (let x = PX; x <= PR + 16; x += 16) pts.push([x, RIDGE + 6 * Math.sin(x / 210) + 5 * Math.sin(x / 67 + 1) + g() * 2.5])
  return pts
})()
const ridgeY = (x) => {
  const i = Math.max(0, Math.min(RIDGE_PTS.length - 2, Math.floor((x - PX) / 16)))
  const [x0, y0] = RIDGE_PTS[i]
  const [x1, y1] = RIDGE_PTS[i + 1]
  return lerp(y0, y1, clamp01((x - x0) / (x1 - x0)))
}
const RIDGE_D = `M${PX} ${PB}` + RIDGE_PTS.map(([x, y]) => `L${r(x, 0)} ${r(y, 1)}`).join('') + `L${PR} ${PB}Z`
const RIDGE_LINE = RIDGE_PTS.map(([x, y], i) => `${i ? 'L' : 'M'}${r(x, 0)} ${r(y, 1)}`).join('')

/** Is a sky point comfortably in the visible sky at t? */
function inSky(p, t, margin = 46) {
  const [x, y] = toScreen(p, t)
  return x > PX + margin && x < PR - margin && y > PY + margin && y < ridgeY(x) - margin
}

/* ── The stars ────────────────────────────────────────────────────── */

/*
 * Every star the film ever sees, in sky coordinates: the sector of sky that
 * passes over the plate in the whole turn. Three magnitudes; each split into
 * eight batches that twinkle on their own and, at the end, go out on their own.
 */
const BATCHES = 8
const SKY = (() => {
  const g = rng(42)
  const batches = Array.from({ length: 3 * BATCHES }, () => [])
  const pool = []
  for (let i = 0; i < 980; i++) {
    const p = polar(-118 + g() * 166, Math.sqrt(800 ** 2 + g() * (1670 ** 2 - 800 ** 2)))
    const m = Math.pow(g(), 3)
    const tier = m > 0.35 ? 2 : m > 0.06 ? 1 : 0
    batches[tier * BATCHES + Math.floor(g() * BATCHES)].push(p)
    pool.push(p)
  }
  return { batches, pool }
})()

/* ── Drawing vocabulary ───────────────────────────────────────────── */

const P = (x, y) => [x, y]
const arcPts = (cx, cy, rad, a0, a1, n) =>
  Array.from({ length: n }, (_, i) => {
    const a = (a0 + (a1 - a0) * (n > 1 ? i / (n - 1) : 0)) * DEG
    return P(cx + rad * Math.cos(a), cy + rad * Math.sin(a))
  })
const ring = (cx, cy, rad, n, from = -90) => {
  const p = arcPts(cx, cy, rad, from, from + 360 - 360 / n, n)
  return [...p, p[0]]
}

const txt = (x, y, size, text, o = {}) =>
  `<text x="${r(x)}" y="${r(y)}" font-size="${r(size)}" font-weight="${o.weight ?? 500}" fill="${o.fill ?? STAR}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.spacing != null ? ` letter-spacing="${o.spacing}"` : ''}${o.opacity != null && o.opacity < 1 ? ` opacity="${r(o.opacity, 3)}"` : ''}${o.italic ? ' font-style="italic"' : ''}>${esc(text)}</text>`

const dotsD = (pts) => pts.map(([x, y]) => `M${r(x, 1)} ${r(y, 1)}h0`).join('')

/*
 * A track: polylines in the order the pen takes them, as one run of travel.
 * Between polylines the pen is up; that hop counts for a third of its length,
 * so the point crosses it quickly instead of jumping. `verts` are the travel
 * positions of the corners, where a word's stroke likes to end.
 */
const PEN_UP = 0.33
function makeTrack(polys) {
  const segs = []
  const verts = []
  let total = 0
  let prev = null
  for (const pl of polys) {
    if (prev && dist(prev, pl[0]) > 1) {
      const len = dist(prev, pl[0]) * PEN_UP
      segs.push({ a: prev, b: pl[0], ink: false, s0: total, len })
      total += len
    }
    for (let i = 1; i < pl.length; i++) {
      const len = dist(pl[i - 1], pl[i])
      if (!len) continue
      segs.push({ a: pl[i - 1], b: pl[i], ink: true, s0: total, len })
      total += len
      verts.push(total)
    }
    prev = pl[pl.length - 1]
  }
  return { segs, verts, total, start: polys[0][0], end: prev }
}
/** The ink of a track between travel u0 and u1, as path data. */
function inkD(track, u0, u1) {
  let d = ''
  let open = null
  for (const s of track.segs) {
    if (s.s0 >= u1) break
    if (!s.ink || s.s0 + s.len <= u0) continue
    const a = clamp01((u0 - s.s0) / s.len)
    const b = clamp01((u1 - s.s0) / s.len)
    if (b <= a) continue
    const x0 = lerp(s.a[0], s.b[0], a)
    const y0 = lerp(s.a[1], s.b[1], a)
    if (!open || a > 0 || open[0] !== s.a[0] || open[1] !== s.a[1]) d += `M${r(x0, 1)} ${r(y0, 1)}`
    d += `L${r(lerp(s.a[0], s.b[0], b), 1)} ${r(lerp(s.a[1], s.b[1], b), 1)}`
    open = b >= 1 ? s.b : null
  }
  return d
}
function pointOn(track, u) {
  if (u <= 0) return track.start
  for (const s of track.segs) {
    if (u <= s.s0 + s.len) {
      const k = clamp01((u - s.s0) / s.len)
      return [lerp(s.a[0], s.b[0], k), lerp(s.a[1], s.b[1], k)]
    }
  }
  return track.end
}

/*
 * A track drawn in time with a line: one stroke per sung word, each begun on
 * the word's measured onset and done before the next (at most 0.45 s), ending
 * on a corner where one is near. The last word finishes the figure.
 */
function schedule(track, words, lastDur = 0.45) {
  const W = words.length
  const T = track.total
  const b = [0]
  for (let k = 1; k < W; k++) {
    const want = (k / W) * T
    let best = want
    let bd = (0.38 * T) / W
    for (const v of track.verts) {
      const d = Math.abs(v - want)
      if (d < bd && v > b[k - 1] + 1 && v < T - 1) { bd = d; best = v }
    }
    b.push(Math.max(best, b[k - 1]))
  }
  b.push(T)
  const chunks = words.map((w, k) => ({
    t0: w.t,
    d: k < W - 1 ? Math.min(0.45, Math.max(0.12, 0.8 * (words[k + 1].t - w.t))) : lastDur,
    a: b[k],
    b: b[k + 1],
  }))
  const last = chunks[chunks.length - 1]
  return { chunks, t0: chunks[0].t0, t1: last.t0 + last.d }
}
function travelAt(sch, t) {
  let u = 0
  for (const c of sch.chunks) {
    if (t < c.t0) break
    u = c.a + (c.b - c.a) * easeInOut(clamp01((t - c.t0) / c.d))
  }
  return u
}

/* ── The figures ──────────────────────────────────────────────────── */

/*
 * Each figure in a 100-unit box. `at` is where it is drawn on the screen at
 * the moment it is drawn — [degrees round from straight up, distance from the
 * pole, size] — upright then; it wheels on with the sky from there. Placed so
 * that none overlap in the sky, the bed is still up for the third chorus and
 * the tree and the dawn for their re-tracings (checked by constellationsPlan's
 * `figures[].window`).
 */
const FIGURES = {
  sheep: {
    name: 'OVIS · THE SHEEP', at: [-10.4, 1225, 190],
    lines: [
      [P(20, 42), P(30, 30), P(45, 27), P(60, 30), P(72, 38), P(76, 50), P(70, 61), P(56, 65), P(40, 65), P(26, 60), P(18, 51), P(20, 42)],
      [P(74, 40), P(86, 35), P(96, 43), P(91, 53), P(78, 52)],
      [P(32, 64), P(30, 84)], [P(43, 65), P(43, 84)], [P(57, 65), P(58, 84)], [P(67, 62), P(70, 84)],
    ],
  },
  moon: {
    name: 'LUNA · THE MOON', at: [2, 1360, 150],
    lines: [[...arcPts(50, 50, 40, -100, 100, 9), ...arcPts(36, 52, 32, 78, -78, 7).slice(1), P(43, 11)]],
  },
  bed: {
    name: 'LECTUS · THE BED', at: [-23, 1290, 220],
    lines: [
      [P(8, 24), P(8, 82)], [P(8, 56), P(92, 56), P(92, 82)], [P(92, 56), P(92, 46), P(8, 46)],
      [P(13, 46), P(17, 37), P(31, 36), P(34, 46)], [P(37, 46), P(52, 36), P(72, 37), P(90, 46)],
    ],
  },
  hourglass: {
    name: 'CLEPSYDRA · THE HOURGLASS', at: [-30.4, 1235, 130],
    lines: [
      [P(22, 8), P(78, 8)], [P(70, 8), P(70, 20), P(50, 50), P(30, 80), P(30, 92)],
      [P(22, 92), P(78, 92)], [P(70, 92), P(70, 80), P(50, 50), P(30, 20), P(30, 8)],
    ],
  },
  clock: {
    name: 'HOROLOGIUM · THE CLOCK', at: [6.6, 1150, 130],
    lines: [ring(50, 50, 40, 12), [P(50, 21), P(50, 50), P(70, 60)]],
  },
  tree: {
    name: 'ARBOR · THE TREE', at: [-20.3, 1010, 150],
    lines: [
      [P(46, 96), P(46, 58)],
      (() => {
        const p = Array.from({ length: 9 }, (_, i) => {
          const a = (i * 40 + 130) * DEG
          const rad = 30 + (i % 2 ? 6 : -1)
          return P(50 + rad * Math.cos(a), 34 + rad * Math.sin(a))
        })
        return [...p, p[0]]
      })(),
      [P(54, 58), P(54, 96)], [P(50, 60), P(34, 42)], [P(50, 62), P(66, 40)],
    ],
  },
  sun: {
    name: 'AURORA · THE DAWN', at: [-6.9, 1030, 190],
    lines: [
      [P(2, 72), P(98, 72)], arcPts(50, 72, 25, 360, 180, 7),
      ...[212, 241, 270, 299, 328].map((a) => [arcPts(50, 72, 32, a, a, 1)[0], arcPts(50, 72, 45, a, a, 1)[0]]),
    ],
  },
  eye: {
    name: 'OCULUS · THE EYE', at: [-24, 1050, 200],
    lines: [
      [P(4, 50), P(20, 36), P(35, 28), P(50, 25), P(65, 28), P(80, 36), P(96, 50)],
      [P(96, 50), P(80, 63), P(65, 70), P(50, 73), P(35, 70), P(20, 63), P(4, 50)],
      [P(35, 28), P(31, 17)], [P(50, 13), P(50, 25)], [P(65, 28), P(69, 17)], ring(50, 50, 14, 8),
    ],
  },
  spine: {
    name: 'SPINA · THE SPINE', at: [-26, 1340, 150],
    // Only the column is stars; the wings are ink. (All 24 points as stars rose as a lattice.)
    starIf: ([x, y]) => Math.abs(x - (50 + 9 * Math.sin(((y - 8) / 12) * 0.8))) < 1,
    lines: (() => {
      const c = Array.from({ length: 8 }, (_, i) => P(50 + 9 * Math.sin(i * 0.8), 8 + i * 12))
      // Down the column, then each vertebra's wings, bottom to top.
      return [c, ...c.map(([x, y]) => [P(x - 13, y + 2), P(x, y), P(x + 13, y + 2)]).reverse()]
    })(),
  },
  house: {
    name: 'DOMUS · THE HOUSE', at: [-32, 1170, 160],
    lines: [
      [P(15, 90), P(15, 46), P(50, 15), P(85, 46), P(85, 90), P(15, 90)],
      [P(42, 90), P(42, 64), P(58, 64), P(58, 90)], [P(67, 31), P(67, 18), P(76, 18), P(76, 39)],
    ],
  },
  window: {
    name: 'FENESTRA · THE WINDOW', at: [-29.5, 1370, 140],
    lines: [
      [P(18, 8), P(82, 8), P(82, 92), P(18, 92), P(18, 8)], [P(50, 8), P(50, 92)], [P(18, 50), P(82, 50)],
      [P(18, 8), P(31, 27), P(25, 50), P(37, 72), P(31, 92)], [P(88, 30), P(99, 24), P(108, 32), P(101, 40), P(93, 36)],
    ],
  },
  solo: {
    name: 'SOLUS · ALONE', at: [-27.8, 1260, 180],
    lines: [[P(4, 69), P(96, 69)], [P(92, 63), P(68, 58), P(92, 53)], [P(68, 58), P(20, 58)], ring(13, 57, 7, 6, 0), [P(32, 58), P(46, 50)]],
  },
}

/** Lyric → figure. The first line that matches draws it; a later one goes over it again. */
const CUES = [
  [/counting sheep/i, 'sheep'],
  [/absence of light/i, 'moon'],
  [/lie in my bed/i, 'bed'],
  [/after we die/i, 'hourglass'],
  [/again and again/i, 'clock'],
  [/trees start to yawn/i, 'tree'],
  [/of the dawn|in the dawn/i, 'sun'],
  [/brain and my eyes/i, 'eye'],
  [/straighten my spine/i, 'spine'],
  [/house starts to creak/i, 'house'],
  [/windows are open/i, 'window'],
  [/all alone/i, 'solo'],
]

/** How the pen jumps in a verse line that names nothing: [lyric, manner]. Anything else just races. */
const MANNERS = [
  [/call you first/i, 'pace'],
  [/skin starts to crawl/i, 'crawl'],
  [/too deep|cuts deeper/i, 'deep'],
]

/** Her: five stars beside the bed, in the bed's box — a second sleeper's outline, never joined for long. */
const HER = [P(40, 27), P(51, 17), P(64, 13), P(77, 17), P(88, 27)]
/** Where the pen waits at the bed: the pillow. */
const BED_REST = P(24, 36)

/* A figure laid into the sky: drawn upright at `tDraw`, at its `at`. */
function layFigure(key, tDraw) {
  const F = FIGURES[key]
  const [theta, R, s] = F.at
  const [cx, cy] = polar(theta, R)
  const onScreen = ([x, y]) => [cx - s / 2 + (x * s) / 100, cy - s / 2 + (y * s) / 100]
  const map = (p) => toSky(onScreen(p), tDraw)
  const polys = F.lines.map((pl) => pl.map(map))
  const track = makeTrack(polys)
  // Each star, and the travel at which the pen first reaches it.
  const stars = []
  const seen = new Map()
  const keyOf = (p) => `${Math.round(p[0])},${Math.round(p[1])}`
  const allowed = F.starIf ? new Set(F.lines.flat().filter(F.starIf).map(map).map(keyOf)) : null
  const note = (p, u) => {
    const k = keyOf(p)
    if (allowed && !allowed.has(k)) return
    if (!seen.has(k)) { seen.set(k, 1); stars.push({ p, u }) }
  }
  note(track.start, 0)
  for (const sg of track.segs) { if (!sg.ink) note(sg.b, sg.s0 + sg.len); else { note(sg.a, sg.s0); note(sg.b, sg.s0 + sg.len) } }
  stars.sort((a, b) => a.u - b.u)
  // The label, set under the figure as it stands when drawn, kept inside the plate.
  const [latin, english = ''] = F.name.split(' · ')
  const drawn = F.lines.flat().map(onScreen)
  const half = Math.max(latin.length * 14.6, english.length * 8.2) / 2
  const lx = Math.min(Math.max(cx, PX + 30 + half), PR - 30 - half)
  const ly = Math.min(Math.max(...drawn.map((p) => p[1])) + 34, RIDGE - 40)
  return {
    key, tDraw, size: s, centre: toSky([cx, cy], tDraw), track, stars,
    fullD: inkD(track, 0, track.total),
    starsD: dotsD(stars.map((x) => x.p)),
    label: { at: toSky([lx, ly], tDraw), rot: -OMEGA * tDraw, latin, english: english.toLowerCase() },
    map, sch: null, retraces: [], bright: [],
  }
}

/* ── The two on the ridge ─────────────────────────────────────────── */

/*
 * Two people standing on the ridge, in screen coordinates (the land does not
 * turn). Each is a body (legs, spine, head, the far arm) and, separately, the
 * arm that reaches. The body ends at the shoulder, where the reach begins.
 * `hand`, when given, is where both reaching hands end: where they meet.
 */
const DUOS = [
  { his: 270, hers: 1300, k: 2.7, reach: 27 },
  { his: 684, hers: 836, k: 2.7, reach: 28, meet: true },
]
function person(x, dir, k, reach, hand) {
  const fy = ridgeY(x) + 1
  const sh = [x, fy - 56 * k]
  const end = hand ?? [x + dir * reach * k, fy - 47 * k]
  const body = makeTrack([
    [P(x - 8 * k, fy), P(x, fy - 30 * k), P(x + 8 * k, fy)],
    [P(x, fy - 30 * k), P(x, fy - 65 * k)],
    ring(x, fy - 71 * k, 6 * k, 10, 90),
    [P(x - dir * 9 * k, fy - 38 * k), sh],
  ])
  const arm = makeTrack([[sh, [lerp(sh[0], end[0], 0.5), lerp(sh[1], end[1], 0.5) + 2 * k], end]])
  // Joints: every corner of the body but the head's ring, and the arm's elbow and hand.
  const at = (track, p) => track.segs.find((sg) => sg.ink && dist(sg.b, p) < 0.5)
  const mark = (track, pts) => pts.map((p) => {
    const sg = at(track, p)
    return { p, u: sg ? sg.s0 + sg.len : 0 }
  })
  body.joints = mark(body, [P(x - 8 * k, fy), P(x, fy - 30 * k), P(x + 8 * k, fy), P(x, fy - 65 * k), P(x - dir * 9 * k, fy - 38 * k), sh])
  arm.joints = mark(arm, [arm.segs[0].b, end])
  return { body, arm, hand: end }
}

/* ── The night's shape ────────────────────────────────────────────── */

/*
 * The dawn, 0–1: each chorus ("the sun starts to wake") lifts it a little
 * higher; it sinks back after the first two, lingers through the first "meet
 * me", and after the third it does not sink.
 */
const DAWN = [
  { t: 0, v: 0 }, { t: 51, v: 0 }, { t: 57.5, v: 0.26 }, { t: 66, v: 0.26 }, { t: 76, v: 0.03 },
  { t: 105.6, v: 0.03 }, { t: 112.5, v: 0.42 }, { t: 124, v: 0.38 }, { t: 138, v: 0.3 }, { t: 147, v: 0.05 },
  { t: 153.5, v: 0.05 }, { t: 158.6, v: 0.2 }, { t: 165.5, v: 0.56 }, { t: 179, v: 0.6 }, { t: 195, v: 0.8 }, { t: 211.86, v: 1 },
]
const dawnAt = (t) => glide(t, DAWN)
/** The morning taking the sky, 0–1, through the outro. */
const outAt = (t) => easeInOut(ramp(t, VOICE_END - 3, 211))
/** 23:30 at the first frame, ten past six at the last. */
const nightClock = (score, t) => {
  const m = 23 * 60 + 30 + (t * 400) / score.duration
  return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(Math.floor(m % 60)).padStart(2, '0')}`
}

/* ── The plan ─────────────────────────────────────────────────────── */

const plans = new WeakMap()
function planFor(score) {
  let plan = plans.get(score)
  if (!plan) plans.set(score, (plan = buildPlan(score)))
  return plan
}

function buildPlan(score) {
  const g = rng(11)
  const L = score.lines
  const sectionOf = (l) => score.sections.find((s) => s.id === l.section)

  /* What each line does. */
  const seen = new Set()
  const hookSeq = {}
  let herCount = 0
  const roles = L.map((l) => {
    const sec = sectionOf(l)
    if (sec.kind === 'bridge' || sec.kind === 'coda') {
      const n = (hookSeq[sec.id] = (hookSeq[sec.id] ?? 0) + 1)
      return { kind: ['him', 'herOh', 'herArm'][n - 1] ?? 'rest', hook: sec.kind === 'coda' ? 1 : 0 }
    }
    const cue = CUES.find(([re]) => re.test(l.text))
    if (cue) {
      const first = !seen.has(cue[1])
      seen.add(cue[1])
      return { kind: first ? 'draw' : 'retrace', key: cue[1] }
    }
    if (/next to me|used to be/i.test(l.text)) return { kind: 'her', n: herCount++ }
    if (/could be the sky/i.test(l.text)) return { kind: 'rise' }
    return { kind: sec.kind === 'verse' ? 'hops' : 'settle' }
  })

  /* The figures, laid into the sky at the moment their line begins. */
  const figures = {}
  L.forEach((l, i) => { if (roles[i].kind === 'draw') figures[roles[i].key] = layFigure(roles[i].key, l.start) })
  const figureUp = (F, t) => inSky(F.centre, t, F.size * 0.36)
  // A figure that has set cannot be gone over again: the pen settles instead.
  L.forEach((l, i) => { if (roles[i].kind === 'retrace' && !figureUp(figures[roles[i].key], l.end)) roles[i] = { kind: 'settle' } })
  const bed = figures.bed
  const her = bed ? HER.map(bed.map) : []
  const bedRest = bed ? bed.map(BED_REST) : null
  const herLit = her.map(() => [])
  const herLines = []

  /* The two on the ridge, once for each hook. */
  const duos = DUOS.map((D) => {
    const mid = (D.his + D.hers) / 2
    const hand = D.meet ? [mid, (ridgeY(D.his) + ridgeY(D.hers)) / 2 + 1 - 47 * D.k] : null
    return { ...D, him: person(D.his, 1, D.k, D.reach, hand), her: person(D.hers, -1, D.k, D.reach, hand), hand }
  })

  /* The pen. */
  const legs = []
  const threads = []
  const sky = (p) => ({ p, sky: true })
  const land = (p) => ({ p, sky: false })
  const skyOf = (loc, t) => (loc.sky ? loc.p : toSky(loc.p, t))

  /** A star to jump to: within `range` of here, in view now and for a while, leaning towards `target`. */
  function star(from, t, target, range) {
    for (let widen = 1; widen < 5; widen++) {
      let best = null
      let bs = Infinity
      for (const p of SKY.pool) {
        const d = dist(p, from)
        if (d < range[0] || d > range[1] * widen) continue
        if (!inSky(p, t) || !inSky(p, t + 5)) continue
        const lean = target ? (dist(from, target) < 160 ? 0 : dist(p, target)) : 0
        // Keep to the open sky: a star inside a figure already drawn is a poor place to land.
        let crowd = 0
        for (const F of Object.values(figures)) if (F.tDraw < t + 1 && dist(p, F.centre) < F.size * 0.62) crowd = 500
        const s = lean + crowd + g() * 230
        if (s < bs) { bs = s; best = p }
      }
      if (best) return best
    }
    return from
  }
  /** Somewhere in the open sky, for a line with nowhere it has to be. */
  const somewhere = (t) => toSky([260 + g() * 1080, 130 + g() * 380], t)

  const first = star(toSky([610, 300], LIFTED), LIFTED, null, [0, 60])
  let cur = sky(first)
  let free = LIFTED + 2
  const move = (t0, t1, to, o = {}) => {
    t0 = Math.max(t0, free)
    t1 = Math.max(t1, t0 + 0.08)
    legs.push({ kind: 'move', t0, t1, from: cur, to, bend: 0, ease: easeInOut, ...o })
    cur = to
    free = t1
  }
  const follow = (track, sch, inSkySpace, o = {}) => {
    legs.push({ kind: 'track', t0: Math.max(sch.t0, free), t1: sch.t1, track, sch, sky: inSkySpace, ...o })
    cur = inSkySpace ? sky(track.end) : land(track.end)
    free = sch.t1
  }
  const flip = () => (g() < 0.5 ? -1 : 1)

  /** Where the pen has to be when line i starts, if anywhere. */
  const startOf = (i) => {
    const role = roles[i]
    if (!role) return null
    if (role.kind === 'draw' || role.kind === 'retrace') return sky(figures[role.key].track.start)
    if (role.kind === 'her' && bedRest) return sky(bedRest)
    if (role.kind === 'him') return land(duos[role.hook].him.body.start)
    return null
  }

  /** How long the last word's stroke may take: done in time to reach the next line's start. */
  const lastStroke = (l, next) => Math.min(0.45, Math.max(0.14, (next ? next.start - l.words[l.words.length - 1].t : 1) - 0.34))

  // The intro: it wakes on one star, and drifts once before the first word.
  move(14.1, L[0].start - 0.5, sky(star(first, 15, null, [150, 300])), { bend: 0.3 })

  L.forEach((l, i) => {
    const role = roles[i]
    const next = L[i + 1]
    switch (role.kind) {
      case 'hops': {
        const goal = startOf(i + 1)
        const hop = (t, dur, to) => {
          const from = cur
          move(t, t + dur, sky(to), { ease: easeOut, hop: true })
          if (from.sky) threads.push({ t0: t, t1: free, a: from.p, b: to })
        }
        // The line's manner: pacing between two stars, crawling, leaping, or just racing.
        const manner = MANNERS.find(([re]) => re.test(l.text))?.[1] ?? 'race'
        let roam = null
        let ends = null
        l.words.forEach((w, k) => {
          const gap = (l.words[k + 1]?.t ?? w.t + 0.4) - w.t
          const dur = Math.min(0.17, gap * 0.6)
          const here = skyOf(cur, w.t)
          if (manner === 'pace') {
            // "Do I call you first or wait for you to call": back and forth between the same two stars.
            ends ??= [star(here, w.t, null, [40, 110]), star(here, l.end, null, [230, 330])]
            hop(w.t, dur, ends[(k + 1) % 2])
            return
          }
          if (manner === 'crawl') {
            // "my skin starts to crawl": two small steps to a word.
            hop(w.t, Math.min(0.12, gap * 0.3), star(here, w.t, null, [35, 100]))
            if (gap > 0.24) hop(w.t + gap * 0.5, Math.min(0.12, gap * 0.3), star(skyOf(cur, w.t), w.t, null, [35, 100]))
            return
          }
          // Racing with nowhere to be: a new far corner of the sky every few words.
          if (!goal && (k % 4 === 0 || !roam)) {
            for (let n = 0; n < 12; n++) { roam = somewhere(w.t); if (dist(roam, here) > 380) break }
          }
          const target = goal ? skyOf(goal, w.t) : roam
          const range = manner === 'deep' ? [200, 400] : k === 0 ? [120, 270] : [70, 210]
          hop(w.t, dur, star(here, w.t, target, range))
        })
        break
      }
      case 'draw': {
        const F = figures[role.key]
        F.sch = schedule(F.track, l.words, lastStroke(l, next))
        F.bright.push([F.sch.t0, F.sch.t1])
        follow(F.track, F.sch, true)
        break
      }
      case 'retrace': {
        const F = figures[role.key]
        const sch = schedule(F.track, l.words, lastStroke(l, next))
        F.retraces.push(sch)
        F.bright.push([sch.t0, sch.t1])
        follow(F.track, sch, true)
        break
      }
      case 'settle': {
        // One slow move for the whole line, to wherever the next line needs it.
        const to = startOf(i + 1) ?? sky(star(skyOf(cur, l.start), l.end, null, [220, 420]))
        move(l.start, l.end + 0.35, to, { bend: 0.2 * flip() })
        if (roles[i + 1]?.kind === 'her' && bed) bed.bright.push([l.end - 0.6, next.end + 1])
        break
      }
      case 'rise': {
        // "I could be the sky": up to the top of it; "if I could only give in": and back down.
        const turnAt = l.words.find((w) => /^if$/i.test(w.text))?.t ?? (l.start + l.end) / 2
        move(l.start, turnAt - 0.05, sky(toSky([790, 112], turnAt)), { bend: -0.18 })
        const to = startOf(i + 1) ?? sky(star(skyOf(cur, l.end), l.end, null, [220, 420]))
        move(turnAt, Math.min(l.end + 0.5, (next?.start ?? l.end + 1) - 0.1), to, { bend: 0.12 })
        break
      }
      case 'her': {
        // The last five words (not the "so" that leads on): one of her stars each.
        const words = l.words.filter((w) => !/^so$/i.test(w.text)).slice(-her.length)
        const stays = role.n < 2
        words.forEach((w, k) => {
          move(w.t, w.t + 0.24, sky(her[k]), { ease: easeOut })
          herLit[k].push({ t: w.t + 0.12, stays, until: l.end + 1.4 })
        })
        if (stays && words.length) herLines.push({ t0: words[0].t, words: words.map((w) => w.t), until: l.end + 1.4 })
        break
      }
      case 'him': {
        const D = duos[role.hook]
        D.bodySch = schedule(D.him.body, l.words, 0.5)
        follow(D.him.body, D.bodySch, false)
        break
      }
      case 'herOh': {
        const D = duos[role.hook]
        const [oh, ...rest] = l.words
        // She is one long stroke, the length of the held note.
        D.herBody = [oh.t + 0.1, (rest[0]?.t ?? oh.t + 3.4) - 0.3]
        if (rest.length) {
          D.armSch = schedule(D.him.arm, rest, 0.5)
          follow(D.him.arm, D.armSch, false)
        }
        break
      }
      case 'herArm': {
        const D = duos[role.hook]
        const words = l.words.slice(0, 5)
        D.herArm = schedule(D.her.arm, words, 0.5)
        if (D.meet) {
          D.meetAt = D.herArm.t1
          D.flareAt = l.words[5]?.t ?? D.meetAt + 0.3
        } else {
          // He stands reaching until the verse is nearly on him.
          free = Math.min(l.end + 1.7, (next?.start ?? l.end + 3) - 2.1)
          D.leaveAt = free + 0.5
        }
        break
      }
      default:
    }
    if (!next) return
    // The silence before the next line: go where it starts; if nowhere, and it is long, drift.
    const to = startOf(i + 1)
    const gap = next.start - free
    if (to) {
      if (gap > 0.12) {
        const t1 = next.start - Math.min(0.12, gap * 0.25)
        move(gap > 2 ? free + 0.4 : Math.max(free + 0.02, t1 - 1.2), t1, to, { bend: (gap > 2 ? 0.3 : 0.15) * flip() })
      }
    } else if (gap > 2 && roles[i + 1].kind === 'hops') {
      move(free + 0.5, next.start - 0.3, sky(star(skyOf(cur, free), next.start, null, [160, 340])), { bend: 0.35 * flip() })
    }
  })

  /* When each figure goes out in the morning: in the order they were drawn. */
  const order = Object.values(figures).sort((a, b) => a.tDraw - b.tDraw)
  order.forEach((F, i) => { F.outAt = VOICE_END + 1.2 + (i / Math.max(1, order.length - 1)) * 10 })

  return { figures, order, roles, legs, threads, her, herLit, herLines, duos, first, figureUp }
}

/** The pen on the screen at t. */
function penAt(plan, t) {
  let leg = null
  for (const l of plan.legs) {
    if (l.t0 > t) break
    leg = l
  }
  if (!leg) return toScreen(plan.first, t)
  if (leg.kind === 'track') {
    const p = pointOn(leg.track, travelAt(leg.sch, t))
    return leg.sky ? toScreen(p, t) : p
  }
  const at = (loc) => (loc.sky ? toScreen(loc.p, t) : loc.p)
  const A = at(leg.from)
  const B = at(leg.to)
  const u = leg.ease(clamp01((t - leg.t0) / (leg.t1 - leg.t0)))
  if (!leg.bend) return [lerp(A[0], B[0], u), lerp(A[1], B[1], u)]
  // A bent path: a quadratic through a point off to one side.
  const cx = (A[0] + B[0]) / 2 - (B[1] - A[1]) * leg.bend
  const cy = (A[1] + B[1]) / 2 + (B[0] - A[0]) * leg.bend
  const v = 1 - u
  return [v * v * A[0] + 2 * v * u * cx + u * u * B[0], v * v * A[1] + 2 * v * u * cy + u * u * B[1]]
}

/* ── The fixed parts, as lib ──────────────────────────────────────── */

const libCache = new Map()
function skyLib(uid) {
  if (!libCache.has(uid)) {
    // The atlas: declination circles about the pole and hour lines out from it.
    let grid = ''
    for (let rad = 820; rad < 1700; rad += 140) grid += `M${r(POLE[0] - rad)} ${POLE[1]}A${rad} ${rad} 0 0 1 ${r(POLE[0] + rad)} ${POLE[1]}A${rad} ${rad} 0 0 1 ${r(POLE[0] - rad)} ${POLE[1]}`
    for (let a = -120; a <= 50; a += 5) {
      const [x0, y0] = polar(a, 800)
      const [x1, y1] = polar(a, 1700)
      grid += `M${r(x0, 0)} ${r(y0, 0)}L${r(x1, 0)} ${r(y1, 0)}`
    }
    let hatch = ''
    for (let y = RIDGE + 24; y < PB; y += 10) hatch += `M${PX} ${y}H${PR}`
    const W = [1.6, 2.6, 3.8]
    libCache.set(uid, `<defs><path id="${uid}-grid" d="${grid}" fill="none" stroke="${STAR}" stroke-width="1"/>${
      SKY.batches.map((pts, i) => `<path id="${uid}-s${i}" d="${dotsD(pts)}" stroke="${STAR}" stroke-width="${W[Math.floor(i / BATCHES)]}" stroke-linecap="round"/>`).join('')
    }<g id="${uid}-land"><path d="${RIDGE_D}" fill="${LAND}"/><path d="${hatch}" stroke="${STAR}" stroke-width="1" opacity="0.08"/></g></defs>`)
  }
  return libCache.get(uid)
}

/* ── The plate ────────────────────────────────────────────────────── */

const mix = (a, b, u) => `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], u))).join(',')})`
const op = (o) => (o < 0.999 ? ` opacity="${r(Math.max(0, o), 3)}"` : '')

const GHOST = 0.42

/** A figure's light at t: full while it is being drawn or gone over, then down to a ghost. */
function figureLight(F, t) {
  let a = 0
  for (const [from, to] of F.bright) {
    if (t < from) continue
    const life = t - to
    a = Math.max(a, life < 3 ? 0.95 : Math.max(GHOST, 0.95 - ((life - 3) / 6) * (0.95 - GHOST)))
  }
  // In the morning each one comes up once more, for a last look, and goes out.
  const last = easeInOut(ramp(t, F.outAt - 0.7, F.outAt)) * 0.8
  return Math.max(a, last) * (1 - easeInOut(ramp(t, F.outAt + 0.2, F.outAt + 2.8)))
}

/** The stars at a person's joints (feet, hip, neck, shoulder, elbow, hand), once the ink has reached them. */
function joints(who, bodyU, armU, colour, a) {
  if (a < 0.01) return ''
  let d = ''
  for (const tr of [[who.body, bodyU], [who.arm, armU]]) {
    for (const p of tr[0].joints) if (tr[1] >= p.u - 0.5) d += `M${r(p.p[0], 1)} ${r(p.p[1], 1)}h0`
  }
  return d ? `<path d="${d}" stroke="${colour}" stroke-width="8" stroke-linecap="round"${op(a)}/>` : ''
}

/** The plate alone — what goes inside the sheet. Returns { plate, lib }. */
export function constellationsPlate({ time, score, uid }) {
  const t = time
  const plan = planFor(score)
  const dawn = dawnAt(t)
  const out = outAt(t)
  const id = (s) => `${uid}-${s}`
  const sung = Math.max(0, ...score.lines.map((l) => (t >= l.start - 0.1 && t < l.end + 1.5 ? l.words.reduce((m, w) => Math.max(m, t < w.t ? 0 : Math.exp(-(t - w.t) / 0.16)), 0) : 0)))

  // Sky: warm black at the top, warming towards the ridge as the dawn comes; pale by morning.
  const top = mix([20, 20, 25], [128, 124, 146], out)
  const mid = mix([24, 22, 25], [204, 170, 130], Math.max(dawn * 0.3, out))
  const low = mix([32, 27, 23], [226, 174, 90], Math.max(dawn, out))
  let defs = `<linearGradient id="${id('sky')}" x1="0" y1="${PY}" x2="0" y2="${RIDGE}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${top}"/><stop offset="0.62" stop-color="${mid}"/><stop offset="1" stop-color="${low}"/></linearGradient>`
  let body = `<rect x="${PX}" y="${PY}" width="${PW}" height="${RIDGE - PY + 20}" fill="url(#${id('sky')})"/>`

  /* Everything that turns with the sky, under one transform. */
  let sky = `<use href="#${id('grid')}" opacity="${r(0.07 * (1 - out), 3)}"/>`
  // The stars, twinkling batch by batch; in the morning they go out batch by batch, the faint ones first.
  for (let i = 0; i < 3 * BATCHES; i++) {
    const tier = Math.floor(i / BATCHES)
    const k = i % BATCHES
    const tw = 0.8 + 0.2 * Math.sin(t * (1.1 + tier * 0.6 + k * 0.23) + i * 2.1)
    const goes = VOICE_END - 5 + tier * 4.6 + k * 1.05
    const o = [0.32, 0.55, 0.85][tier] * tw * (1 - easeInOut(ramp(t, goes, goes + 2.2))) * (1 - 0.35 * dawn)
    if (o > 0.01) sky += `<use href="#${id(`s${i}`)}" opacity="${r(o, 3)}"/>`
  }

  // Her stars beside the bed: ordinary stars until the pen touches them.
  const starFade = 1 - easeInOut(ramp(t, VOICE_END - 2, VOICE_END + 8))
  let labelNow = ''
  if (plan.her.length) {
    let gold = ''
    plan.her.forEach((p, k) => {
      let lit = 0
      for (const e of plan.herLit[k]) {
        if (t < e.t) continue
        lit = Math.max(lit, e.stays
          ? easeOut(ramp(t, e.t, e.t + 0.2)) * (1 - easeInOut(ramp(t, e.until, e.until + 4)))
          : 0.5 * easeOut(ramp(t, e.t, e.t + 0.15)) * (1 - easeInOut(ramp(t, e.t + 0.25, e.t + 1.3))))
      }
      sky += `<path d="${dotsD([p])}" stroke="${STAR}" stroke-width="3.6" stroke-linecap="round" opacity="${r(0.36 * starFade * (1 - lit), 3)}"/>`
      if (lit > 0.01) gold += `<circle cx="${r(p[0], 1)}" cy="${r(p[1], 1)}" r="11" fill="${GOLD}" opacity="${r(0.22 * lit, 3)}"/><circle cx="${r(p[0], 1)}" cy="${r(p[1], 1)}" r="${r(2.6 + 1.8 * lit, 1)}" fill="${GOLD}" opacity="${r(lit, 3)}"/>`
    })
    // And, while she is there, the line of her: gold, thin, gone again with the stars.
    for (const hl of plan.herLines) {
      if (t < hl.t0 || t > hl.until + 4) continue
      let d = ''
      for (let k = 1; k < hl.words.length; k++) {
        const u = easeOut(ramp(t, hl.words[k], hl.words[k] + 0.24))
        if (u <= 0) break
        const a = plan.her[k - 1]
        const b = plan.her[k]
        d += `M${r(a[0], 1)} ${r(a[1], 1)}L${r(lerp(a[0], b[0], u), 1)} ${r(lerp(a[1], b[1], u), 1)}`
      }
      if (d) gold += `<path d="${d}" fill="none" stroke="${GOLD}" stroke-width="1.6" stroke-linecap="round" opacity="${r(0.8 * (1 - easeInOut(ramp(t, hl.until, hl.until + 4))), 3)}"/>`
    }
    sky += gold
  }

  // While the two stand on the ridge, the sky stands back a little.
  let hush = 0
  for (const D of plan.duos) {
    if (!D.bodySch) continue
    hush = Math.max(hush, easeInOut(ramp(t, D.bodySch.t0 - 1.2, D.bodySch.t0 + 0.8)) * (D.meet ? 1 : 1 - easeInOut(ramp(t, D.leaveAt, D.leaveAt + 2.5))))
  }

  // The figures.
  let labels = ''
  for (const F of plan.order) {
    const latent = 0.36 * starFade
    if (t < F.sch.t0) {
      if (latent > 0.01) sky += `<path d="${F.starsD}" stroke="${STAR}" stroke-width="3.6" stroke-linecap="round" opacity="${r(latent, 3)}"/>`
      continue
    }
    const a = figureLight(F, t) * (1 - 0.4 * hush)
    if (a < 0.01) continue
    const u = travelAt(F.sch, t)
    const done = t >= F.sch.t1
    // Stars the pen has reached are lit; the rest wait.
    const n = done ? F.stars.length : F.stars.findIndex((s) => s.u > u + 0.5)
    const lit = n < 0 ? F.stars : F.stars.slice(0, n)
    const dark = n < 0 ? [] : F.stars.slice(n)
    if (dark.length && latent > 0.01) sky += `<path d="${dotsD(dark.map((s) => s.p))}" stroke="${STAR}" stroke-width="3.6" stroke-linecap="round" opacity="${r(latent, 3)}"/>`
    let gfig = `<path d="${done ? F.starsD : dotsD(lit.map((s) => s.p))}" stroke="${STAR}" stroke-width="4.6" stroke-linecap="round"/>`
    if (done) {
      gfig += `<path d="${F.fullD}" fill="none" stroke="${STAR}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
      // The last of the red cools once the pen has lifted.
      const warm = 1 - ramp(t, F.sch.t1, F.sch.t1 + 0.6)
      if (warm > 0.01) gfig += `<path d="${inkD(F.track, Math.max(0, F.track.total - 80), F.track.total)}" fill="none" stroke="${NRED}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity="${r(warm, 3)}"/>`
    } else {
      // The newest ink is still red; it cools to star-white behind the pen.
      const cool = Math.max(0, u - 80)
      if (cool > 0) gfig += `<path d="${inkD(F.track, 0, cool)}" fill="none" stroke="${STAR}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`
      gfig += `<path d="${inkD(F.track, cool, u)}" fill="none" stroke="${NRED}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`
      labelNow = F.label.english
    }
    // Gone over again: the red runs along what is already there.
    for (const sch of F.retraces) {
      if (t < sch.t0 || t > sch.t1 + 0.6) continue
      const v = travelAt(sch, t)
      const fade = 1 - ramp(t, sch.t1, sch.t1 + 0.6)
      gfig += `<path d="${inkD(F.track, Math.max(0, v - 110), v)}" fill="none" stroke="${NRED}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" opacity="${r(fade, 3)}"/>`
      labelNow = F.label.english
    }
    sky += `<g${op(a)}>${gfig}</g>`
    // Its name, lettered once the last word has landed.
    const la = easeOut(ramp(t, F.sch.t1 - 0.25, F.sch.t1 + 0.9)) * clamp01(a * 1.15 - 0.08) * 0.92 * (1 - 0.3 * hush)
    if (la > 0.02) {
      const [lx, ly] = F.label.at
      labels += `<g transform="rotate(${r(F.label.rot, 2)} ${r(lx, 1)} ${r(ly, 1)})" opacity="${r(la, 3)}">${txt(lx, ly, 19, F.label.latin, { anchor: 'middle', spacing: 2.6 })}${txt(lx, ly + 21, 17, F.label.english, { anchor: 'middle', italic: true, weight: 400, spacing: 0.4 })}</g>`
    }
  }
  sky += labels

  // The threads the pen leaves, jumping star to star: the racing mind.
  let web = ''
  for (const th of plan.threads) {
    if (t < th.t0) break
    const age = t - th.t1
    if (age > 2.2) continue
    const u = easeOut(clamp01((t - th.t0) / (th.t1 - th.t0)))
    const o = age < 0 ? 0.9 : 0.9 * (1 - age / 2.2) ** 1.5
    web += `<path d="M${r(th.a[0], 1)} ${r(th.a[1], 1)}L${r(lerp(th.a[0], th.b[0], u), 1)} ${r(lerp(th.a[1], th.b[1], u), 1)}" opacity="${r(o, 3)}"/>`
    if (age >= 0 && age < 1.2) web += `<circle cx="${r(th.b[0], 1)}" cy="${r(th.b[1], 1)}" r="${r(3 + 9 * easeOut(age / 1.2), 1)}" opacity="${r(0.5 * (1 - age / 1.2), 3)}"/>`
  }
  if (web) sky += `<g fill="none" stroke="${NRED}" stroke-width="1.8" stroke-linecap="round">${web}</g>`

  body += `<g transform="rotate(${r(OMEGA * t, 3)} ${POLE[0]} ${POLE[1]})">${sky}</g>`

  // The sun, in the outro, coming up behind the ridge where they meet.
  const rise = easeInOut(ramp(t, VOICE_END + 1, 211.86))
  if (rise > 0) {
    defs += `<radialGradient id="${id('sun')}"><stop offset="0" stop-color="#f6dc9c"/><stop offset="0.6" stop-color="${GOLD}"/><stop offset="1" stop-color="${GOLD}" stop-opacity="0"/></radialGradient>`
    const sunX = plan.duos.find((D) => D.meet)?.hand[0] ?? 800
    body += `<circle cx="${r(sunX)}" cy="${r(RIDGE + 150 - rise * 190)}" r="270" fill="url(#${id('sun')})" opacity="${r(0.95 * rise, 3)}"/>`
  }
  // The dawn glow along the ridge.
  if (dawn > 0.01) {
    defs += `<linearGradient id="${id('glow')}" x1="0" y1="${RIDGE - 360}" x2="0" y2="${RIDGE + 10}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${GOLD}" stop-opacity="0"/><stop offset="1" stop-color="${GOLD}" stop-opacity="${r(0.7 * dawn, 3)}"/></linearGradient>`
    body += `<rect x="${PX}" y="${RIDGE - 360}" width="${PW}" height="370" fill="url(#${id('glow')})"/>`
  }

  // The ridge and its gold edge.
  body += `<use href="#${id('land')}"/>`
  body += `<path d="${RIDGE_LINE}" fill="none" stroke="${GOLD}" stroke-width="2.2" opacity="${r(0.18 + dawn * 0.75, 3)}"/>`

  // The two on the ridge.
  let penGold = null
  for (const D of plan.duos) {
    if (!D.bodySch || t < D.bodySch.t0) continue
    const hisA = D.meet ? 1 : 1 - easeInOut(ramp(t, D.leaveAt, D.leaveAt + 5))
    const herA = D.meet ? 1 : 1 - easeInOut(ramp(t, D.leaveAt - 1.2, D.leaveAt + 3))
    const sil = Math.min(1, Math.max(0, (dawn - 0.3) * 2))
    const strokes = (d, col, w, a) => (d && a > 0.01
      ? (sil > 0.01 ? `<path d="${d}" fill="none" stroke="${LAND}" stroke-width="${r(w + 3 * dawn, 1)}" stroke-linecap="round" stroke-linejoin="round" opacity="${r(sil * a, 3)}"/>` : '')
        + `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${op(a)}/>`
      : '')
    // Him. Like the figures in the sky, they have stars at their joints.
    const bu = travelAt(D.bodySch, t)
    const au = D.armSch && t >= D.armSch.t0 ? travelAt(D.armSch, t) : -1
    let his = inkD(D.him.body, 0, bu)
    if (au >= 0) his += inkD(D.him.arm, 0, au)
    body += strokes(his, NRED, 3, hisA) + joints(D.him, bu, au, NRED, hisA)
    // Her: one long gold stroke over the held note, then her arm.
    if (D.herBody && t >= D.herBody[0]) {
      const hu = D.her.body.total * easeInOut(ramp(t, D.herBody[0], D.herBody[1]))
      let hers = inkD(D.her.body, 0, hu)
      let head = t < D.herBody[1] + 0.3 ? pointOn(D.her.body, hu) : null
      let hau = -1
      if (D.herArm && t >= D.herArm.t0) {
        hau = travelAt(D.herArm, t)
        hers += inkD(D.her.arm, 0, hau)
        head = pointOn(D.her.arm, hau)
      }
      body += strokes(hers, GOLD, 3, herA) + joints(D.her, hu, hau, GOLD, herA)
      if (head && herA > 0.5) penGold = head
    }
    // The hands meeting: one flare, then a glow that breathes.
    if (D.meet && t >= D.meetAt) {
      const [hx, hy] = D.hand
      const since = t - D.flareAt
      const pulse = 0.5 + 0.5 * Math.sin((t - D.meetAt) * 2.4)
      const calm = 1 - 0.6 * easeInOut(ramp(t, VOICE_END, 210))
      body += `<circle cx="${r(hx, 1)}" cy="${r(hy, 1)}" r="${r(13 + 6 * pulse * calm, 1)}" fill="${GOLD}" opacity="${r(0.3 + 0.3 * pulse * calm, 3)}"/>`
      if (since >= 0 && since < 1.6) body += `<circle cx="${r(hx, 1)}" cy="${r(hy, 1)}" r="${r(14 + 150 * easeOut(since / 1.6), 1)}" fill="none" stroke="${GOLD}" stroke-width="${r(3 * (1 - since / 1.6), 2)}" opacity="${r(0.9 * (1 - since / 1.6), 3)}"/>`
    }
  }
  if (penGold) body += `<circle cx="${r(penGold[0], 1)}" cy="${r(penGold[1], 1)}" r="13" fill="${GOLD}" opacity="0.25"/><circle cx="${r(penGold[0], 1)}" cy="${r(penGold[1], 1)}" r="5" fill="${GOLD}"/>`

  // The pen: one red point, a short tail when it moves, a halo that jumps on each sung word and breathes otherwise.
  const penOn = easeInOut(ramp(t, LIFTED + 0.4, LIFTED + 1.8))
  if (penOn > 0.001) {
    const [x, y] = penAt(plan, t)
    let tail = ''
    let px = x
    let py = y
    for (let k = 1; k <= 6; k++) {
      const [qx, qy] = penAt(plan, t - k * 0.022)
      if (Math.hypot(qx - px, qy - py) > 0.6) tail += `<path d="M${r(px, 1)} ${r(py, 1)}L${r(qx, 1)} ${r(qy, 1)}" stroke-width="${r(5.5 - k * 0.7, 1)}" opacity="${r(0.55 * (1 - k / 7), 3)}"/>`
      px = qx
      py = qy
    }
    const rest = easeInOut(ramp(t, VOICE_END, 208))
    const breath = 0.5 + 0.5 * Math.sin((2 * Math.PI * t) / lerp(1.7, 3.4, rest))
    const halo = 13 + 3 * breath * (1 - 0.7 * rest) + 9 * sung
    body += `<g opacity="${r(penOn, 3)}">${tail ? `<g fill="none" stroke="${NRED}" stroke-linecap="round">${tail}</g>` : ''}<circle cx="${r(x, 1)}" cy="${r(y, 1)}" r="${r(halo, 1)}" fill="${NRED}" opacity="${r(0.2 + 0.12 * sung, 3)}"/><circle cx="${r(x, 1)}" cy="${r(y, 1)}" r="5.5" fill="${NRED}"/></g>`
  }

  // Furniture: the plate's title and the hour.
  const quiet = 0.55 * (1 - out * 0.5)
  body += txt(PX + 36, PY + 46, 19, 'STAR ATLAS · ONE NIGHT', { spacing: 3, weight: 600, opacity: quiet })
  body += txt(PR - 36, PY + 46, 19, nightClock(score, t), { anchor: 'end', spacing: 2, weight: 500, opacity: quiet })

  return {
    plate: `<defs>${defs}</defs><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${LAND}"/>${body}`,
    lib: skyLib(uid),
    drawing: labelNow,
  }
}

/* ── The film ─────────────────────────────────────────────────────── */

/** The film: the album's cover sheet, the night plate, the lyric in the margin, the standard opening. */
export function constellationsFrame({ time, score, lockup = '', uid = 'constellations' }) {
  if (score.endCardAt != null && time >= score.endCardAt) return { ...endCard({ now: time, from: score.endCardAt, lockup }), lib: [skyLib(uid)] }
  const section = score.sections.find((s) => time >= s.from && time < s.to) ?? score.sections.at(-1)
  const { plate, lib, drawing } = constellationsPlate({ time, score, uid })
  const clip = `${uid}-plate`
  return {
    label: inOpening(time) ? 'Opening' : `${section.label}${drawing ? ` · ${drawing}` : ''}`,
    lib: [lib],
    svg: `<defs><clipPath id="${clip}"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}"/></clipPath></defs>
${paper(COVER_SHEET)}
<g clip-path="url(#${clip})">${plate}</g>
${marginLyric({ now: time, score, uid, sheet: COVER_SHEET })}
${filmOpening({ time, uid, slug: 'meet-me-at-the-horizon' })}`,
  }
}

/** The frame held before play: the second chorus, the sky full, gold behind the ridge and her five stars lit beside the bed. */
export const CONSTELLATIONS_POSTER = 124.8

export const CONSTELLATIONS_BEATS = [
  { at: 0, label: 'Opening' },
  { at: 12, label: 'The sky turns' },
  { at: 17, label: 'Racing' },
  { at: 26, label: 'The sheep', key: true },
  { at: 52, label: 'First gold' },
  { at: 65, label: 'Next to me', key: true },
  { at: 81, label: 'The eye, the spine' },
  { at: 102, label: 'I could be the sky' },
  { at: 127, label: 'Meet me · not yet', key: true },
  { at: 141, label: 'Alone again' },
  { at: 159, label: 'The dawn stays' },
  { at: 172, label: 'The way things used to be' },
  { at: 179.5, label: 'Meet me · the horizon', key: true },
  { at: 195, label: 'Morning', key: true },
]

/** For checking and for the docs: each figure, when it is drawn, and how long it is up. */
export function constellationsPlan(score) {
  const plan = planFor(score)
  return {
    figures: plan.order.map((F) => {
      let up = null
      let down = null
      for (let t = 0; t < score.duration; t += 0.5) {
        if (plan.figureUp(F, t)) { up ??= t; down = t }
      }
      return { key: F.key, drawn: [F.sch.t0, F.sch.t1], retraced: F.retraces.map((s) => s.t0), window: [up, down], centre: F.centre, size: F.size }
    }),
    roles: plan.roles.map((x) => x.kind + (x.key ? `:${x.key}` : '')),
    legs: plan.legs,
    penAt: (t) => penAt(plan, t),
  }
}
