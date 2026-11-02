/*
 * Meet Me at the Horizon · Lying awake — three visualizers of one sleepless
 * night (2026-11-02), drawn to the film contract so that whichever is chosen
 * can become the motion test without being rewritten.
 *
 *   constellations — a star-atlas plate over a black ridge. Every line that
 *                    names a thing joins stars that were already there into
 *                    it (the sheep he isn't counting, the moon, the bed, an
 *                    hourglass…), labelled like an atlas, in Latin. Red sparks
 *                    jump between stars on the sung words: the racing mind,
 *                    thick in the verses. Gold comes up behind the ridge in
 *                    each chorus; in the outro the stars go out into it. On
 *                    the last "meet me at the horizon" two figures stand on
 *                    the ridge, his red and hers gold, and their hands meet.
 *   nightmares     — the same plate, and the gaps are dangerous. In every real
 *                    silence in the singing (measured from the score: the
 *                    intro and five gaps of two to three seconds) the sky
 *                    reddens and every figure drawn so far turns into its bad
 *                    version, relabelled. The next sung word jolts him awake
 *                    (a white flash, a shake) and everything snaps back. After
 *                    the last "meet me at the horizon" none come: dawn wins.
 *   monkey-brain   — a sleep lab's EEG chart: the head from above, the 10–20
 *                    electrodes, a red point swinging between them on every
 *                    sung word, a pencil scribble of every swing, the
 *                    technician's notes, and a hypnogram that only dips in the
 *                    gaps and is pulled back to WAKE by the next thought.
 *
 * Inks: the album's paper, its warm black, its red (him, and in the
 * nightmares the dark as well) and the song's second ink, dawn gold.
 *
 * Pure functions of the score's clock: rng(seed) only, no DOM, ids namespaced
 * with uid. Everything sung — figures, sparks, hops, gaps — is read from
 * `score`, never from hard-coded times, except VOICE_END below (where the
 * held last "oh" lets go, from the score's own header).
 */
import { rng, r, clamp01, lerp, easeInOut, easeOut, ramp, esc } from '../kit.mjs'
import { COVER_SHEET, INK, PAPER, RED, PAPER_SHADE, SECOND_INK, paper, marginLyric } from '../album.mjs'

const GOLD = SECOND_INK['meet-me-at-the-horizon']
const { x: PX, y: PY, w: PW, h: PH } = COVER_SHEET.plate
const PR = PX + PW
const PB = PY + PH

/** Red that reads as a line on the night plate; the album red is too dark there at two units wide. */
const NRED = '#d4513b'
const STAR = '#efe6cf'
const SKY_TOP = '#141419'
const LAND = '#0e0d0b'

/* ── The clock: what is sung, and where the silences are ──────────── */

/** The held last "oh" lets go here (meetMeAtTheHorizonScore.ts header). */
const VOICE_END = 194.9
/** A line's last word is taken to ring this long past its onset. */
const HOLD = 0.55

const memoStore = new WeakMap()
const memo = (score, key, make) => {
  let m = memoStore.get(score)
  if (!m) memoStore.set(score, (m = {}))
  return m[key] ?? (m[key] = make())
}

const sectionOf = (score, id) => score.sections.find((s) => s.id === id)
const sectionAt = (score, t) => score.sections.find((s) => t >= s.from && t < s.to) ?? score.sections.at(-1)

/*
 * The silences, from the measured words: the intro, every gap between one
 * line's release and the next line's first word, and the outro. Inside a line
 * nothing counts — the voice is holding a note or taking a breath.
 */
const gapsOf = (score) => memo(score, 'gaps', () => {
  const L = score.lines
  const out = [{ kind: 'intro', from: 0, to: L[0].start, next: L[0] }]
  for (let i = 0; i < L.length; i++) {
    const last = i === L.length - 1
    const from = last ? Math.max(VOICE_END, L[i].end + HOLD) : Math.min(L[i].end + HOLD, L[i + 1].start)
    out.push({ kind: last ? 'outro' : 'gap', from, to: last ? Infinity : L[i + 1].start, next: L[i + 1] ?? null })
  }
  return out
})

/** How far under he is, 0 awake – 1 deep in it. Only in a silence; the outro never. */
function drowsy(score, t) {
  const g = gapsOf(score).find((x) => t >= x.from && t < x.to)
  if (!g || g.kind === 'outro') return 0
  if (g.kind === 'intro') return 0.6 * easeInOut(ramp(t, 6, 15))
  return easeInOut(ramp(t - g.from, 0.7, 2.2))
}

/** The next sung word snaps him awake: 1 on the word, gone 0.6 s later. Only after a silence that took him under. */
function joltAt(score, t) {
  for (const g of gapsOf(score)) {
    if (!g.next || t < g.next.start || t >= g.next.start + 0.6) continue
    if (drowsy(score, g.next.start - 0.01) > 0.3) return 1 - (t - g.next.start) / 0.6
  }
  return 0
}

/** The gaps deep enough to dream in, for anyone choosing stills. */
export const horizonGaps = (score) =>
  gapsOf(score).filter((g) => g.kind !== 'outro').map((g) => ({ ...g, peak: drowsy(score, g.to - 0.01) })).filter((g) => g.peak > 0.3)

/*
 * The dawn, 0–1: each chorus ("the sun starts to wake") lifts it a little
 * higher and lets it fall back, the night repeating; from the last hook it
 * stays and fills the outro.
 */
function dawnAt(score, t) {
  let d = 0
  const peaks = { 'chorus-1': 0.26, 'chorus-2': 0.4, 'chorus-3': 0.55 }
  for (const [id, peak] of Object.entries(peaks)) {
    const s = sectionOf(score, id)
    if (!s) continue
    d = Math.max(d, peak * easeInOut(ramp(t, s.from - 1, s.from + 5)) * (1 - 0.8 * easeInOut(ramp(t, s.to - 2, s.to + 7))))
  }
  const hook = sectionOf(score, 'hook-2')
  if (hook) d = Math.max(d, easeInOut(ramp(t, hook.from + 6, VOICE_END + 14)))
  return d
}
/** The stars going out into the morning. */
const outAt = (t) => easeInOut(ramp(t, VOICE_END - 2, VOICE_END + 16))

/** 23:30 at the first frame, ten past six at the last. */
const nightClock = (score, t) => {
  const m = 23 * 60 + 30 + (t * 400) / score.duration
  return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(Math.floor(m % 60)).padStart(2, '0')}`
}

/* ── Drawing vocabulary ───────────────────────────────────────────── */

const P = (x, y) => [x, y]
const arcPts = (cx, cy, rad, a0, a1, n) =>
  Array.from({ length: n }, (_, i) => {
    const a = ((a0 + (a1 - a0) * (n > 1 ? i / (n - 1) : 0)) * Math.PI) / 180
    return P(cx + rad * Math.cos(a), cy + rad * Math.sin(a))
  })
const ring = (cx, cy, rad, n) => {
  const p = arcPts(cx, cy, rad, -90, 270 - 360 / n, n)
  return [...p, p[0]]
}
/** A standing person facing `dir`, one arm reaching `reach` units. Feet at y 86. */
const person = (x, dir, reach) => [
  ring(x, 15, 6, 6), [P(x, 21), P(x, 56)], [P(x - 8, 86), P(x, 56), P(x + 8, 86)],
  [P(x, 30), P(x + dir * reach * 0.5, 37), P(x + dir * reach, 39)], [P(x, 30), P(x - dir * 9, 48)],
]
const eyeAt = (cx, cy, s) => [[P(cx - s, cy), P(cx, cy - s * 0.55), P(cx + s, cy)], [P(cx + s, cy), P(cx, cy + s * 0.55), P(cx - s, cy)], [P(cx, cy - s * 0.4), P(cx, cy + s * 0.4)]]

const txt = (x, y, size, text, o = {}) =>
  `<text x="${r(x)}" y="${r(y)}" font-size="${r(size)}" font-weight="${o.weight ?? 500}" fill="${o.fill ?? INK}"${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.spacing != null ? ` letter-spacing="${o.spacing}"` : ''}${o.opacity != null && o.opacity < 1 ? ` opacity="${r(o.opacity, 3)}"` : ''}${o.italic ? ' font-style="italic"' : ''}>${esc(text)}</text>`

/*
 * An atlas label: the Latin in spaced caps, the English under it in italic,
 * kept inside the plate however near the edge its figure is.
 */
function atlasLabel(x, y, name, fill, opacity, weight = 500) {
  const [latin, english = ''] = name.split(' · ')
  const half = Math.max(latin.length * 14.6, english.length * 8.2) / 2
  const cx = Math.min(Math.max(x, PX + 30 + half), PR - 30 - half)
  return `<g opacity="${r(opacity, 3)}">${txt(cx, y, 19, latin, { fill, anchor: 'middle', spacing: 2.6, weight })}${txt(cx, y + 21, 17, english.toLowerCase(), { fill, anchor: 'middle', italic: true, weight: 400, spacing: 0.4 })}</g>`
}

const polyD = (polys) => polys.map((pl) => pl.map(([x, y], i) => `${i ? 'L' : 'M'}${r(x, 0)} ${r(y, 0)}`).join('')).join('')
const dotsD = (pts) => pts.map(([x, y]) => `M${r(x, 0)} ${r(y, 0)}h0`).join('')

const lengthOf = (polys) => {
  let n = 0
  for (const pl of polys) for (let i = 1; i < pl.length; i++) n += Math.hypot(pl[i][0] - pl[i - 1][0], pl[i][1] - pl[i - 1][1])
  return n
}
/** The part of `polys` between arc length a and b, as path data. */
function cut(polys, a, b) {
  let acc = 0
  let d = ''
  for (const pl of polys) {
    let open = false
    for (let i = 1; i < pl.length; i++) {
      const [x0, y0] = pl[i - 1]
      const [x1, y1] = pl[i]
      const L = Math.hypot(x1 - x0, y1 - y0)
      const s0 = acc
      acc += L
      if (!L) continue
      const u0 = clamp01((a - s0) / L)
      const u1 = clamp01((b - s0) / L)
      if (u1 <= u0) { open = false; continue }
      if (!open || u0 > 0) d += `M${r(x0 + (x1 - x0) * u0, 0)} ${r(y0 + (y1 - y0) * u0, 0)}`
      d += `L${r(x0 + (x1 - x0) * u1, 0)} ${r(y0 + (y1 - y0) * u1, 0)}`
      open = u1 >= 1
    }
  }
  return d
}
function pointAt(polys, len) {
  let acc = 0
  let last = polys[0][0]
  for (const pl of polys) {
    for (let i = 1; i < pl.length; i++) {
      const [x0, y0] = pl[i - 1]
      const [x1, y1] = pl[i]
      const L = Math.hypot(x1 - x0, y1 - y0)
      if (acc + L >= len && L) {
        const u = (len - acc) / L
        return [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u]
      }
      acc += L
      last = pl[pl.length - 1]
    }
  }
  return last
}

/* ── The sky ──────────────────────────────────────────────────────── */

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

/** Background stars in three magnitudes. */
const BG = (() => {
  const g = rng(42)
  const tiers = [[], [], []]
  const all = []
  for (let i = 0; i < 280; i++) {
    const x = PX + 18 + g() * (PW - 36)
    const y = PY + 60 + Math.pow(g(), 1.2) * (RIDGE - PY - 90)
    const m = Math.pow(g(), 3)
    tiers[m > 0.35 ? 2 : m > 0.06 ? 1 : 0].push([x, y])
    all.push([x, y])
  }
  return { tiers, all }
})()

/* ── The figures ──────────────────────────────────────────────────── */

/*
 * Each figure in a 100-unit box, placed at [cx, cy, size] on the plate. Its
 * nightmare (`night`) is drawn in the same box. `duo` figures are two people
 * standing on the ridge, his first (red) then hers (gold).
 */
const FIGURES = {
  sheep: {
    name: 'OVIS · THE SHEEP', at: [260, 185, 190],
    lines: [
      [P(20, 42), P(30, 30), P(45, 27), P(60, 30), P(72, 38), P(76, 50), P(70, 61), P(56, 65), P(40, 65), P(26, 60), P(18, 51), P(20, 42)],
      [P(74, 40), P(86, 35), P(96, 43), P(91, 53), P(78, 52)],
      [P(32, 64), P(30, 84)], [P(43, 65), P(43, 84)], [P(57, 65), P(58, 84)], [P(67, 62), P(70, 84)],
    ],
    night: {
      name: 'LUPUS · THE WOLF',
      lines: [
        [P(20, 42), P(28, 26), P(34, 36), P(42, 22), P(48, 34), P(56, 22), P(62, 34), P(70, 26), P(74, 40), P(76, 52), P(70, 61), P(56, 65), P(40, 65), P(26, 60), P(18, 51), P(20, 42)],
        [P(74, 40), P(80, 22), P(86, 34), P(100, 44), P(88, 50), P(92, 57), P(78, 54)], [P(91, 47), P(92, 53)], [P(18, 51), P(6, 40), P(10, 28)],
        [P(32, 64), P(28, 84), P(21, 88)], [P(43, 65), P(42, 84), P(35, 88)], [P(57, 65), P(58, 84), P(51, 88)], [P(67, 62), P(70, 84), P(63, 88)],
      ],
    },
  },
  moon: {
    name: 'LUNA · THE MOON', at: [1340, 170, 150],
    lines: [[...arcPts(50, 50, 40, -100, 100, 9), ...arcPts(36, 52, 32, 78, -78, 7).slice(1), P(43, 11)]],
    night: { name: 'LUNA SANGUINEA · BLOOD MOON', fill: true, lines: [ring(50, 50, 40, 14)] },
  },
  bed: {
    name: 'LECTUS · THE BED', at: [790, 210, 220],
    lines: [
      [P(8, 24), P(8, 82)], [P(8, 56), P(92, 56), P(92, 82)], [P(8, 46), P(92, 46), P(92, 56)],
      [P(13, 46), P(17, 37), P(31, 36), P(34, 46)], [P(37, 46), P(52, 36), P(72, 37), P(90, 46)],
    ],
    night: {
      name: 'FERETRUM · THE COFFIN',
      lines: [[P(6, 50), P(20, 34), P(80, 34), P(94, 50), P(80, 66), P(20, 66), P(6, 50)], [P(50, 40), P(50, 60)], [P(43, 46), P(57, 46)]],
    },
  },
  hourglass: {
    name: 'CLEPSYDRA · THE HOURGLASS', at: [1440, 400, 120],
    lines: [
      [P(22, 8), P(78, 8)], [P(22, 92), P(78, 92)],
      [P(30, 8), P(30, 20), P(50, 50), P(30, 80), P(30, 92)], [P(70, 8), P(70, 20), P(50, 50), P(70, 80), P(70, 92)],
    ],
    night: {
      name: 'CLEPSYDRA · RUN OUT',
      lines: [
        [P(22, 8), P(78, 8)], [P(22, 92), P(78, 92)], [P(30, 8), P(30, 20), P(50, 50), P(30, 80), P(30, 92)], [P(70, 8), P(70, 20), P(50, 50), P(70, 80), P(70, 92)],
        [P(36, 24), P(46, 30), P(40, 38), P(52, 44)], [P(64, 70), P(54, 76), P(60, 84)],
      ],
    },
  },
  clock: {
    name: 'HOROLOGIUM · THE CLOCK', at: [560, 150, 120],
    lines: [ring(50, 50, 40, 12), [P(50, 50), P(50, 21)], [P(50, 50), P(70, 60)]],
    night: { name: 'HOROLOGIUM · TOO FAST', spin: true, lines: [ring(50, 50, 40, 12)] },
  },
  tree: {
    name: 'ARBOR · THE TREE', at: [1100, 555, 150],
    lines: [
      [P(46, 96), P(46, 58)], [P(54, 96), P(54, 58)],
      (() => {
        const p = Array.from({ length: 9 }, (_, i) => {
          const a = ((i * 40 - 90) * Math.PI) / 180
          const rad = 30 + (i % 2 ? 6 : -1)
          return P(50 + rad * Math.cos(a), 34 + rad * Math.sin(a))
        })
        return [...p, p[0]]
      })(),
      [P(50, 60), P(34, 42)], [P(50, 62), P(66, 40)],
    ],
    night: {
      name: 'ARBOR MORTUA · THE DEAD TREE',
      lines: [
        [P(50, 96), P(50, 40)], [P(50, 62), P(30, 42), P(20, 22)], [P(30, 42), P(12, 40)], [P(50, 52), P(70, 30), P(82, 12)],
        [P(70, 30), P(90, 32)], [P(50, 40), P(44, 18), P(52, 4)], [P(20, 22), P(14, 16)], [P(82, 12), P(90, 8)],
      ],
    },
  },
  sun: {
    name: 'AURORA · THE DAWN', at: [1385, 568, 190],
    lines: [
      [P(2, 72), P(98, 72)], arcPts(50, 72, 25, 180, 360, 7),
      ...[212, 241, 270, 299, 328].map((a) => [arcPts(50, 72, 32, a, a, 1)[0], arcPts(50, 72, 45, a, a, 1)[0]]),
    ],
    night: {
      name: 'SOL NIGER · THE BLACK SUN', fillInk: true,
      lines: [
        [P(2, 72), P(98, 72)], arcPts(50, 72, 25, 180, 360, 9),
        ...[200, 225, 250, 275, 300, 325, 345].map((a) => [arcPts(50, 72, 30, a, a, 1)[0], arcPts(50, 72, 40, a + 5, a + 5, 1)[0], arcPts(50, 72, 52, a - 4, a - 4, 1)[0]]),
      ],
    },
  },
  eye: {
    name: 'OCULUS · THE EYE', at: [470, 420, 200],
    lines: [
      [P(4, 50), P(20, 36), P(35, 28), P(50, 25), P(65, 28), P(80, 36), P(96, 50)],
      [P(96, 50), P(80, 63), P(65, 70), P(50, 73), P(35, 70), P(20, 63), P(4, 50)],
      ring(50, 50, 14, 8), [P(35, 28), P(31, 17)], [P(50, 25), P(50, 13)], [P(65, 28), P(69, 17)],
    ],
    night: { name: 'OCULI · THE EYES', lines: [...eyeAt(50, 50, 30), ...eyeAt(16, 22, 13), ...eyeAt(86, 26, 12), ...eyeAt(22, 84, 11), ...eyeAt(80, 82, 14)] },
  },
  spine: {
    name: 'SPINA · THE SPINE', at: [1190, 350, 150],
    lines: (() => {
      const c = Array.from({ length: 8 }, (_, i) => P(50 + 9 * Math.sin(i * 0.8), 8 + i * 12))
      return [c, ...c.map(([x, y]) => [P(x - 13, y + 2), P(x, y), P(x + 13, y + 2)])]
    })(),
    night: {
      name: 'SPINA TORTA · THE TWIST',
      lines: (() => {
        const c = Array.from({ length: 8 }, (_, i) => P(50 + 26 * Math.sin(i * 1.3), 8 + i * 12))
        return [c, ...c.map(([x, y]) => [P(x - 18, y + 9), P(x - 12, y), P(x, y), P(x + 12, y), P(x + 18, y + 9)])]
      })(),
    },
  },
  house: {
    name: 'DOMUS · THE HOUSE', at: [180, 520, 160],
    lines: [
      [P(15, 90), P(15, 46), P(50, 15), P(85, 46), P(85, 90), P(15, 90)],
      [P(42, 90), P(42, 64), P(58, 64), P(58, 90)], [P(67, 31), P(67, 18), P(76, 18), P(76, 39)],
    ],
    night: {
      name: 'DOMUS · SOMEONE IN THE DOOR',
      lines: [
        [P(20, 90), P(10, 46), P(42, 12), P(82, 40), P(88, 90), P(20, 90)], [P(40, 90), P(38, 60), P(60, 58), P(62, 90)],
        ring(50, 68, 4, 6), [P(50, 72), P(50, 88)], [P(50, 76), P(44, 84)], [P(50, 76), P(56, 84)],
      ],
    },
  },
  window: {
    name: 'FENESTRA · THE WINDOW', at: [1060, 175, 140],
    lines: [
      [P(18, 8), P(82, 8), P(82, 92), P(18, 92), P(18, 8)], [P(50, 8), P(50, 92)], [P(18, 50), P(82, 50)],
      [P(18, 8), P(31, 27), P(25, 50), P(37, 72), P(31, 92)], [P(88, 30), P(99, 24), P(108, 32), P(101, 40), P(93, 36)],
    ],
    night: {
      name: 'FENESTRA · THE HAND',
      lines: [
        [P(18, 8), P(82, 8), P(82, 92), P(18, 92), P(18, 8)], [P(50, 8), P(50, 50)], [P(18, 50), P(50, 50)],
        [P(92, 74), P(70, 64), P(56, 62)], [P(56, 62), P(42, 52), P(36, 54)], [P(56, 62), P(40, 58), P(33, 62)], [P(56, 62), P(42, 66), P(36, 71)], [P(56, 62), P(46, 72), P(42, 78)], [P(64, 60), P(60, 48)],
      ],
    },
  },
  solo: {
    name: 'SOLUS · ALONE', at: [910, 350, 180],
    lines: [ring(13, 57, 7, 6), [P(20, 58), P(68, 58)], [P(68, 58), P(92, 53)], [P(68, 58), P(92, 63)], [P(32, 58), P(46, 50)], [P(4, 69), P(96, 69)]],
    night: {
      name: 'SOLUS · NOT ALONE',
      lines: [
        ring(13, 57, 7, 6), [P(20, 58), P(68, 58)], [P(68, 58), P(92, 53)], [P(68, 58), P(92, 63)], [P(4, 69), P(96, 69)],
        ring(62, 2, 7, 6), [P(62, 9), P(62, 52)], [P(62, 18), P(48, 36), P(40, 50)], [P(62, 18), P(78, 34)], [P(62, 52), P(56, 68)], [P(62, 52), P(68, 68)],
      ],
    },
  },
  meet1: {
    name: 'AMANTES · NOT YET', at: [430, 0, 215], duo: true,
    lines: [person(14, 1, 21), person(86, -1, 21)],
    night: { name: 'AMANTES · GONE', lines: [...person(14, 1, 21), ...person(92, 1, 6)], crack: [P(4, 88), P(14, 93), P(22, 89), P(31, 97), P(40, 92), P(50, 101), P(58, 94), P(67, 99), P(76, 92), P(86, 97), P(98, 90)] },
  },
  meet2: {
    name: 'AMANTES · THE HORIZON', at: [800, 0, 300], duo: true,
    lines: [person(22, 1, 28), person(78, -1, 28)],
  },
}

/** Lyric → figure. The first matching cue names the figure a line draws; a repeat re-traces it. */
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
  [/used to be/i, 'clock'],
  [/^meet me at the horizon, oh$/i, 'meet2'],
  [/^meet me at the horizon$/i, 'meet1'],
]

// Lay every figure out in plate units once: polylines, length, its stars, where its label goes.
for (const F of Object.values(FIGURES)) {
  const [cx, , s] = F.at
  // Duo figures stand with their feet (box y 86) on the ridge.
  const cy = F.duo ? ridgeY(cx) - (0.86 - 0.5) * s : F.at[1]
  F.cy = cy
  F.map = ([x, y]) => [cx - s / 2 + (x * s) / 100, cy - s / 2 + (y * s) / 100]
  F.groups = (F.duo ? F.lines : [F.lines]).map((g) => g.map((pl) => pl.map(F.map)))
  F.lens = F.groups.map(lengthOf)
  const seen = new Set()
  F.stars = []
  for (const g of F.groups) for (const pl of g) for (const p of pl) {
    const k = p.map(Math.round).join()
    if (!seen.has(k)) { seen.add(k); F.stars.push(p) }
  }
  F.labelY = F.duo ? RIDGE + 66 : Math.min(Math.max(...F.stars.map((p) => p[1])) + 30, RIDGE - 36)
  if (F.night) {
    F.nm = F.night.lines.map((pl) => pl.map(F.map))
    if (F.night.crack) F.crack = F.night.crack.map(F.map)
    F.nightLabelY = F.duo ? F.labelY : Math.min(Math.max(F.labelY, Math.max(...F.nm.flat().map((p) => p[1])) + 30), RIDGE - 36)
  }
}
const POOL = [...BG.all, ...Object.values(FIGURES).flatMap((F) => F.stars)]

/** When each figure is drawn and re-traced: [{ start, dur }]. */
const cuesOf = (score) => memo(score, 'cues', () => {
  const out = Object.fromEntries(Object.keys(FIGURES).map((k) => [k, []]))
  for (const l of score.lines) {
    const hit = CUES.find(([re]) => re.test(l.text.trim()))
    if (!hit) continue
    const key = hit[1]
    const first = out[key].length === 0
    const dur = key === 'meet2' ? 3.4 : first ? Math.min(Math.max(l.end - l.start, 1.6), 3.6) : 1.3
    out[key].push({ start: l.start, dur, first })
  }
  return out
})

/*
 * The racing mind: red sparks between nearby stars, fired on the measured
 * words — three a word in the verses, fewer in the choruses and the hooks,
 * none in the intro or outro.
 */
const PER_WORD = { verse: 3, chorus: 1.4, bridge: 0.8, coda: 0.6 }
const sparksOf = (score) => memo(score, 'sparks', () => {
  const g = rng(9)
  const out = []
  for (const l of score.lines) {
    const kind = sectionOf(score, l.section)?.kind
    const per = PER_WORD[kind] ?? 0
    for (const w of l.words) {
      const n = Math.floor(per) + (g() < per % 1 ? 1 : 0)
      for (let j = 0; j < n; j++) {
        const a = POOL[Math.floor(g() * POOL.length)]
        let best = null
        let bd = 1e9
        for (let k = 0; k < 14; k++) {
          const b = POOL[Math.floor(g() * POOL.length)]
          const d = Math.hypot(b[0] - a[0], b[1] - a[1])
          if (d > 50 && d < bd) { bd = d; best = b }
        }
        if (best && bd < 260) out.push({ t: w.t + j * 0.09, a, b: best })
      }
    }
  }
  return out
})

/** A figure's state at t: undefined before its first cue. */
function figureState(F, cues, t, out) {
  if (!cues.length || t < cues[0].start) return null
  const first = cues[0]
  const p = clamp01((t - first.start) / first.dur)
  const last = cues.findLast((c) => c.start <= t)
  const life = t - (last.start + last.dur)
  let a = life < 2.5 ? 0.95 : Math.max(0.3, 0.95 - ((life - 2.5) / 6) * 0.65)
  const retrace = !last.first && t < last.start + last.dur ? clamp01((t - last.start) / last.dur) : null
  return { p, a, retrace, done: p >= 1 }
}

/* ── Constellations / Nightmares ──────────────────────────────────── */

function skyPlate({ time, score, uid, nightmares }) {
  const t = time
  const dawn = dawnAt(score, t)
  const out = outAt(t)
  const N = nightmares ? drowsy(score, t) : 0
  const J = nightmares ? joltAt(score, t) : 0
  const cues = cuesOf(score)
  const id = (s) => `${uid}-${s}`

  // Sky: warm black at the top, warming towards the ridge as the dawn comes.
  const mix = (a, b, u) => `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], u))).join(',')})`
  const top = mix([20, 20, 25], [58, 52, 66], out)
  const mid = mix([24, 22, 25], [120, 92, 62], Math.max(dawn * 0.45, out * 0.8))
  const low = mix([32, 27, 23], [222, 168, 84], dawn)
  let defs = `<linearGradient id="${id('sky')}" x1="0" y1="${PY}" x2="0" y2="${RIDGE}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${top}"/><stop offset="0.62" stop-color="${mid}"/><stop offset="1" stop-color="${low}"/></linearGradient>`
  if (N > 0.001) defs += `<radialGradient id="${id('dread')}" cx="800" cy="${RIDGE}" r="1100" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#9a2216" stop-opacity="${r(0.55 * N, 3)}"/><stop offset="1" stop-color="#3c0805" stop-opacity="${r(0.35 * N, 3)}"/></radialGradient>`

  let body = `<rect x="${PX}" y="${PY}" width="${PW}" height="${RIDGE - PY + 20}" fill="url(#${id('sky')})"/>`
  if (N > 0.001) body += `<rect x="${PX}" y="${PY}" width="${PW}" height="${RIDGE - PY + 20}" fill="url(#${id('dread')})"/>`

  // The atlas: declination arcs and hour lines, engraved faintly into the plate.
  let grid = ''
  for (let rad = 300; rad < 1800; rad += 140) {
    const a0 = Math.PI * 1.06
    const a1 = Math.PI * 1.94
    grid += `M${r(800 + rad * Math.cos(a0), 0)} ${r(1500 + rad * Math.sin(a0), 0)}A${rad} ${rad} 0 0 1 ${r(800 + rad * Math.cos(a1), 0)} ${r(1500 + rad * Math.sin(a1), 0)}`
  }
  for (let k = -5; k <= 5; k++) {
    const a = -Math.PI / 2 + k * 0.085
    grid += `M${r(800 + 440 * Math.cos(a), 0)} ${r(1500 + 440 * Math.sin(a), 0)}L${r(800 + 1720 * Math.cos(a), 0)} ${r(1500 + 1720 * Math.sin(a), 0)}`
  }
  body += `<path d="${grid}" fill="none" stroke="${STAR}" stroke-width="1" opacity="${r(0.07 * (1 - out), 3)}"/>`

  // Background stars, three magnitudes, twinkling as groups.
  const starFade = 1 - out * 0.9
  BG.tiers.forEach((pts, i) => {
    const tw = 0.82 + 0.18 * Math.sin(t * (1.3 + i * 0.7) + i * 2)
    body += `<path d="${dotsD(pts)}" stroke="${STAR}" stroke-width="${[1.6, 2.6, 3.8][i]}" stroke-linecap="round" opacity="${r([0.32, 0.55, 0.85][i] * tw * starFade, 3)}"/>`
  })

  // The racing mind.
  let sp = ''
  for (const s of sparksOf(score)) {
    const age = t - s.t
    if (age < 0 || age > 1.3) continue
    const grow = easeOut(clamp01(age / 0.18))
    const fade = 1 - clamp01((age - 0.25) / 1.05)
    const o = 0.85 * fade * (1 - N)
    if (o < 0.02) continue
    const bx = lerp(s.a[0], s.b[0], grow)
    const by = lerp(s.a[1], s.b[1], grow)
    sp += `<g opacity="${r(o, 3)}"><path d="M${r(s.a[0], 0)} ${r(s.a[1], 0)}L${r(bx, 0)} ${r(by, 0)}" stroke="${NRED}" stroke-width="1.8"/><circle cx="${r(bx, 0)}" cy="${r(by, 0)}" r="3" fill="${NRED}"/></g>`
  }
  body += sp

  // Shiver: every point of a nightmare figure trembles with how deep he is.
  const shiver = (polys, k0 = 0) => polys.map((pl, k) => pl.map(([x, y], i) => [
    x + N * 2.6 * Math.sin(t * 11 + (i + (k + k0) * 7) * 1.7 + y * 0.05),
    y + N * 2.6 * Math.cos(t * 9 + (i + (k + k0) * 7) * 2.3 + x * 0.05),
  ]))

  const labels = []
  let sky = ''
  let front = ''
  const meet2 = figureState(FIGURES.meet2, cues.meet2, t)
  for (const [key, F] of Object.entries(FIGURES)) {
    const st = figureState(F, cues[key], t)
    const latent = 0.36 * starFade
    if (!st) {
      if (!F.duo) sky += `<path d="${dotsD(F.stars)}" stroke="${STAR}" stroke-width="3.6" stroke-linecap="round" opacity="${r(latent, 3)}"/>`
      continue
    }
    // Jolted awake, everything he has drawn is suddenly vivid again.
    let a = Math.max(st.a, 0.95 * J)
    if (key !== 'meet2') a *= 1 - out * 0.75
    // The "not yet" pair gives way to the pair that meets.
    if (key === 'meet1' && meet2) a *= 1 - easeInOut(meet2.p)
    if (key === 'meet2') a = 0.97
    if (a < 0.01) continue
    const n = F.night && st.done ? N : 0
    const day = a * (1 - n * 0.88)
    const ease = easeInOut(st.p)
    let g = ''
    F.groups.forEach((grp, gi) => {
      const col = F.duo ? (gi === 0 ? NRED : GOLD) : STAR
      const len = F.lens[gi] * ease
      const w = F.duo ? 3 : 2
      const pen = F.duo ? col : NRED
      // On the morning sky the pair are silhouettes edged in their own colours.
      if (F.duo && dawn > 0.3) g += `<path d="${cut(grp, 0, len)}" fill="none" stroke="${LAND}" stroke-width="${r(w + 4 * dawn)}" stroke-linecap="round" stroke-linejoin="round" opacity="${r(Math.min(1, (dawn - 0.3) * 2), 3)}"/>`
      g += `<path d="${cut(grp, 0, Math.max(0, len - 70))}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`
      if (st.p < 1) {
        g += `<path d="${cut(grp, Math.max(0, len - 70), len)}" fill="none" stroke="${pen}" stroke-width="${w + 0.6}" stroke-linecap="round" stroke-linejoin="round"/>`
        const [hx, hy] = pointAt(grp, len)
        g += `<circle cx="${r(hx, 0)}" cy="${r(hy, 0)}" r="14" fill="${pen}" opacity="0.25"/><circle cx="${r(hx, 0)}" cy="${r(hy, 0)}" r="5.5" fill="${pen}"/>`
      } else if (st.retrace != null) {
        // A repeated line: the red pen runs over the figure again.
        const L = F.lens[gi] * easeInOut(st.retrace)
        g += `<path d="${cut(grp, Math.max(0, L - 90), L)}" fill="none" stroke="${pen}" stroke-width="${w + 0.8}" stroke-linecap="round" stroke-linejoin="round"/>`
        const [hx, hy] = pointAt(grp, L)
        g += `<circle cx="${r(hx, 0)}" cy="${r(hy, 0)}" r="5" fill="${pen}"/>`
      }
    })
    const stars = `<path d="${dotsD(F.stars)}" stroke="${STAR}" stroke-width="4.6" stroke-linecap="round" opacity="${r(Math.max(latent * (1 - n), day), 3)}"/>`
    let fig = `${F.duo ? '' : stars}<g opacity="${r(day, 3)}">${g}</g>`
    // The hands meeting.
    if (key === 'meet2' && st.done) {
      const [hx, hy] = F.groups[0][3][2]
      const pulse = 0.5 + 0.5 * Math.sin((t - cues.meet2[0].start) * 3)
      fig += `<circle cx="${r(hx, 0)}" cy="${r(hy, 0)}" r="${r(11 + 6 * pulse)}" fill="${GOLD}" opacity="${r(0.35 + 0.3 * pulse, 3)}"/>`
    }
    // The nightmare, in red, trembling.
    if (n > 0.01) {
      let polys = F.nm
      if (F.night.spin) {
        const h1 = t * 7
        const h2 = t * 1.1
        polys = [...polys, [P(50, 50), P(50 + 32 * Math.cos(h1), 50 + 32 * Math.sin(h1))].map(F.map), [P(50, 50), P(50 + 20 * Math.cos(h2), 50 + 20 * Math.sin(h2))].map(F.map)]
      }
      const sh = shiver(polys)
      let ng = ''
      if (F.night.fill) ng += `<path d="${polyD([sh[0]])}Z" fill="#8f1f14" opacity="0.6"/>`
      if (F.night.fillInk) ng += `<path d="${polyD([sh[1]])}Z" fill="#070605"/>`
      ng += `<path d="${polyD(sh)}" fill="none" stroke="${NRED}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`
      ng += `<path d="${dotsD(sh.flat())}" stroke="${NRED}" stroke-width="4.6" stroke-linecap="round"/>`
      if (F.crack) ng += `<path d="${polyD(shiver([F.crack], 3))}" fill="none" stroke="${NRED}" stroke-width="3" stroke-linejoin="bevel"/>`
      fig += `<g opacity="${r(Math.min(1, n * 1.15) * Math.max(st.a, 0.75), 3)}">${ng}</g>`
    }
    if (F.duo) front += fig
    else sky += fig
    // Labels: the atlas name, or the nightmare's, in its place.
    const la = clamp01((t - cues[key][0].start) / 1.2)
    const dayLabel = clamp01(a * 1.1 - 0.1) * la * (1 - n)
    if (dayLabel > 0.02) labels.push(atlasLabel(F.at[0], F.labelY, F.name, STAR, dayLabel * 0.92))
    if (n > 0.02) labels.push(atlasLabel(F.at[0], F.nightLabelY, F.night.name, NRED, n, 600))
  }
  body += sky

  // The sun, in the outro, coming up behind the ridge where they meet.
  const rise = easeInOut(ramp(t, VOICE_END + 2, score.duration - 2))
  if (rise > 0) {
    defs += `<radialGradient id="${id('sun')}"><stop offset="0" stop-color="#f6dc9c"/><stop offset="0.6" stop-color="${GOLD}"/><stop offset="1" stop-color="${GOLD}" stop-opacity="0"/></radialGradient>`
    body += `<circle cx="800" cy="${r(RIDGE + 150 - rise * 170)}" r="${r(260)}" fill="url(#${id('sun')})" opacity="${r(0.9 * rise, 3)}"/>`
  }
  // The dawn glow along the ridge.
  if (dawn > 0.01) {
    defs += `<linearGradient id="${id('glow')}" x1="0" y1="${RIDGE - 360}" x2="0" y2="${RIDGE + 10}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${GOLD}" stop-opacity="0"/><stop offset="1" stop-color="${GOLD}" stop-opacity="${r(0.7 * dawn, 3)}"/></linearGradient>`
    body += `<rect x="${PX}" y="${RIDGE - 360}" width="${PW}" height="370" fill="url(#${id('glow')})"/>`
  }

  // The ridge, its gold edge, and the land engraved in rules.
  body += `<path d="${RIDGE_D}" fill="${LAND}"/>`
  body += `<path d="${RIDGE_LINE}" fill="none" stroke="${GOLD}" stroke-width="2.2" opacity="${r(0.18 + dawn * 0.75, 3)}"/>`
  let hatch = ''
  for (let y = RIDGE + 24; y < PB; y += 10) hatch += `M${PX} ${y}H${PR}`
  body += `<path d="${hatch}" stroke="${STAR}" stroke-width="1" opacity="0.08"/>`
  body += front
  body += labels.join('')

  // Furniture: the plate's title and the hour.
  body += txt(PX + 36, PY + 46, 19, 'STAR ATLAS · ONE NIGHT', { fill: STAR, spacing: 3, weight: 600, opacity: 0.6 * (1 - out * 0.5) })
  body += txt(PR - 36, PY + 46, 19, nightClock(score, t), { fill: STAR, anchor: 'end', spacing: 2, weight: 500, opacity: 0.6 * (1 - out * 0.5) })

  // The jolt: a shake (deterministic) and a white flash.
  let shake = ''
  if (J > 0) {
    const g = rng(Math.round(t * 60) + 3)
    shake = ` transform="translate(${r((g() - 0.5) * 22 * J)} ${r((g() - 0.5) * 22 * J)})"`
  }
  let plate = `<defs>${defs}</defs><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${LAND}"/><g${shake}>${body}</g>`
  if (J > 0) {
    // A burst from the middle of the sky, not a flat wash: bright at the eye, falling off to the edges.
    plate += `<defs><radialGradient id="${id('flash')}" cx="800" cy="380" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff8ea" stop-opacity="${r(0.92 * J * J, 3)}"/><stop offset="0.45" stop-color="#fff8ea" stop-opacity="${r(0.45 * J * J, 3)}"/><stop offset="1" stop-color="#fff8ea" stop-opacity="${r(0.08 * J, 3)}"/></radialGradient></defs><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="url(#${id('flash')})"/>`
  }
  return plate
}

/* ── Monkey Brain ─────────────────────────────────────────────────── */

const HEAD = { x: 450, y: 372, r: 228 }
const ELEC = [
  ['Fp1', -0.31, -0.95], ['Fp2', 0.31, -0.95], ['F7', -0.81, -0.59], ['F3', -0.4, -0.5], ['Fz', 0, -0.42], ['F4', 0.4, -0.5], ['F8', 0.81, -0.59],
  ['T3', -0.97, 0], ['C3', -0.48, 0], ['Cz', 0, 0], ['C4', 0.48, 0], ['T4', 0.97, 0],
  ['T5', -0.81, 0.59], ['P3', -0.4, 0.5], ['Pz', 0, 0.42], ['P4', 0.4, 0.5], ['T6', 0.81, 0.59], ['O1', -0.31, 0.95], ['O2', 0.31, 0.95],
].map(([n, x, y]) => ({ n, x: HEAD.x + x * HEAD.r * 0.84, y: HEAD.y + y * HEAD.r * 0.84 }))
const CZ = ELEC.findIndex((e) => e.n === 'Cz')

/** What the technician writes, one per line, in the order sung. Repeats say so. */
const NOTES = [
  'says he needs no one', 'the dark is sweet tonight', 'awake. thoughts, no sheep', 'lights off, not asleep',
  'lying still. thinking of the sky', 'thinking about death', 'afraid?', 'loops. again, again',
  'imagines the sunrise', 'dark meets dawn', 'everyone else asleep', 'feels someone next to him',
  'call, or wait?', 'fever. skin crawling', 'tension, brain and eyes', 'headache on straightening spine',
  'blood thick, mind deep', 'house creaks. awake', 'windows open, wind', 'could give in',
  'sunrise again', 'dark meets dawn, again', 'world asleep', 'you, still next to him',
  '"meet me at the horizon"', 'one long note', '"meet me at the horizon"',
  'needs no one, again', 'dark cuts deeper', 'alone in bed', 'first light. hope',
  'sun waking', 'relief', 'the only one awake', 'misses how things were',
  '"meet me at the horizon"', 'one long note', '"meet me at the horizon." lets go',
]

/** The swings: one on every sung word (every other in the choruses), a big one on each line. */
const hopsOf = (score) => memo(score, 'hops', () => {
  const g = rng(3)
  const out = []
  let at = CZ
  for (const l of score.lines) {
    const kind = sectionOf(score, l.section)?.kind
    l.words.forEach((w, i) => {
      const big = i === 0
      if (!big && kind === 'chorus' && i % 2) return
      let to
      let tries = 0
      do {
        to = Math.floor(g() * ELEC.length)
        tries++
      } while (to === at || (big && tries < 40 && Math.hypot(ELEC[to].x - ELEC[at].x, ELEC[to].y - ELEC[at].y) < 200))
      out.push({ t: w.t, from: at, to, big, dur: big ? 0.5 : 0.3, line: l.index })
      at = to
    })
  }
  out.push({ t: VOICE_END + 1, from: at, to: CZ, big: false, dur: 1.6 })
  return out
})

function hopAt(h, u) {
  const a = ELEC[h.from]
  const b = ELEC[h.to]
  const d = Math.hypot(b.x - a.x, b.y - a.y)
  const cx = (a.x + b.x) / 2
  const cy = (a.y + b.y) / 2 + d * 0.42 // a swing sags under the branch
  const e = easeInOut(u)
  return [(1 - e) ** 2 * a.x + 2 * (1 - e) * e * cx + e * e * b.x, (1 - e) ** 2 * a.y + 2 * (1 - e) * e * cy + e * e * b.y, cx, cy]
}
const hopD = (h, upto = 1) => {
  const a = ELEC[h.from]
  if (upto >= 1) {
    const [, , cx, cy] = hopAt(h, 0)
    const b = ELEC[h.to]
    return `M${r(a.x, 0)} ${r(a.y, 0)}Q${r(cx, 0)} ${r(cy, 0)} ${r(b.x, 0)} ${r(b.y, 0)}`
  }
  let d = `M${r(a.x, 0)} ${r(a.y, 0)}`
  for (let i = 1; i <= 12; i++) {
    const [x, y] = hopAt(h, (upto * i) / 12)
    d += `L${r(x, 0)} ${r(y, 0)}`
  }
  return d
}

const STAGES = ['WAKE', 'REM', 'N1', 'N2', 'N3']
/** The stage the hypnogram scores at t: only ever down in a silence, and N3 only in the outro. */
function stageAt(score, t) {
  const g = gapsOf(score).find((x) => t >= x.from && t < x.to)
  if (!g) return 0
  const s = t - g.from
  if (g.kind === 'intro') return t < 5 ? 0 : t < 10 ? 2 : 3
  if (g.kind === 'outro') return s < 3 ? 0 : s < 8 ? 2 : s < 14 ? 3 : 4
  return s < 0.8 ? 0 : s < 1.7 ? 2 : 3
}
const stagesOf = (score) => memo(score, 'stages', () => {
  const steps = []
  let prev = -1
  for (let t = 0; t <= score.duration; t += 0.05) {
    const s = stageAt(score, t)
    if (s !== prev) { steps.push([t, s]); prev = s }
  }
  return steps
})

function brainPlate({ time, score, uid }) {
  const t = time
  const dawn = dawnAt(score, t)
  const hops = hopsOf(score)
  const sleep = easeInOut(ramp(t, VOICE_END + 4, VOICE_END + 14))
  let body = `<rect x="${PX}" y="${PY}" width="${PW}" height="${PH}" fill="${PAPER}"/>`
  // Graph paper.
  let grid = ''
  for (let x = PX + 24; x < PR; x += 24) grid += `M${x} ${PY}V${PB}`
  for (let y = PY + 24; y < PB; y += 24) grid += `M${PX} ${y}H${PR}`
  body += `<path d="${grid}" stroke="#cbbfa5" stroke-width="1" opacity="0.55"/>`
  // The window's light, gold, crossing the chart as the dawn comes.
  // The window's light: a skewed four-pane window thrown across the chart, soft at its edges.
  if (dawn > 0.01) {
    const sx = 1480 - dawn * 700
    const W = 420
    const skew = 260
    const ga = `${uid}-light`
    body += `<defs><linearGradient id="${ga}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${GOLD}" stop-opacity="0"/><stop offset="0.25" stop-color="${GOLD}" stop-opacity="1"/><stop offset="0.75" stop-color="${GOLD}" stop-opacity="1"/><stop offset="1" stop-color="${GOLD}" stop-opacity="0"/></linearGradient></defs>`
    const pane = `M${r(sx)} ${PY}h${W}L${r(sx + W - skew)} ${PB}h-${W}Z`
    body += `<path d="${pane}" fill="url(#${ga})" opacity="${r(dawn * 0.3, 3)}"/>`
    // The mullions, in shadow.
    body += `<path d="M${r(sx + W / 2)} ${PY}L${r(sx + W / 2 - skew)} ${PB}M${r(sx + W * 0.1 - skew / 2)} ${(PY + PB) / 2}H${r(sx + W * 0.9 - skew / 2)}" stroke="${PAPER}" stroke-width="16" opacity="${r(dawn * 0.5, 3)}"/>`
  }
  body += txt(PX + 36, PY + 54, 22, 'EEG · 10–20 MONTAGE · ONE NIGHT', { weight: 600, spacing: 2 })
  body += txt(PR - 36, PY + 54, 22, nightClock(score, t), { weight: 500, anchor: 'end', spacing: 1.5 })

  // The head from above.
  const { x: hx, y: hy, r: hr } = HEAD
  body += `<g fill="none" stroke="${INK}" stroke-width="2.6"><circle cx="${hx}" cy="${hy}" r="${hr}"/><path d="M${hx - 22} ${hy - hr + 2}L${hx} ${hy - hr - 30}L${hx + 22} ${hy - hr + 2}"/><ellipse cx="${hx - hr - 10}" cy="${hy}" rx="12" ry="38"/><ellipse cx="${hx + hr + 10}" cy="${hy}" rx="12" ry="38"/></g>`
  body += `<g fill="none" stroke="${INK}" stroke-width="1" stroke-dasharray="5 6" opacity="0.38"><circle cx="${hx}" cy="${hy}" r="${r(hr * 0.84)}"/><circle cx="${hx}" cy="${hy}" r="${r(hr * 0.45)}"/><path d="M${hx} ${hy - hr}V${hy + hr}M${hx - hr} ${hy}H${hx + hr}"/></g>`

  // The night's scribble: every swing older than a few seconds, in pencil.
  let pencil = ''
  let red = ''
  for (const h of hops) {
    const age = t - h.t
    if (age < 0) break
    if (age > h.dur + 2.5) pencil += hopD(h)
    else {
      const o = 0.9 * (1 - clamp01((age - h.dur) / 2.5))
      red += `<path d="${hopD(h, clamp01(age / h.dur))}" stroke-width="${h.big ? 3.2 : 2.2}" opacity="${r(o, 3)}"/>`
    }
  }
  body += `<path d="${pencil}" fill="none" stroke="${INK}" stroke-width="1" opacity="0.13"/>`
  body += `<g fill="none" stroke="${RED}" stroke-linecap="round">${red}</g>`

  // Electrodes, warm where it has just been.
  const heat = ELEC.map(() => 0)
  for (const h of hops) {
    const land = h.t + h.dur
    if (land > t) break
    heat[h.to] = Math.min(1, heat[h.to] + Math.exp(-(t - land) / 2.2))
  }
  ELEC.forEach((e, i) => {
    body += `<circle cx="${r(e.x)}" cy="${r(e.y)}" r="20" fill="#f4eddc" stroke="${INK}" stroke-width="1.8"/>`
    if (heat[i] > 0.02) body += `<circle cx="${r(e.x)}" cy="${r(e.y)}" r="20" fill="${RED}" opacity="${r(heat[i] * 0.85, 3)}"/>`
    body += txt(e.x, e.y + 5.5, 15, e.n, { anchor: 'middle', weight: 600, fill: heat[i] > 0.45 ? '#fff6e6' : INK })
  })

  // The monkey.
  let pos = [ELEC[CZ].x, ELEC[CZ].y]
  for (const h of hops) {
    if (h.t > t) break
    const p = hopAt(h, clamp01((t - h.t) / h.dur))
    pos = [p[0], p[1]]
  }
  body += `<circle cx="${r(pos[0])}" cy="${r(pos[1])}" r="24" fill="${RED}" opacity="${r(0.22 * (1 - sleep), 3)}"/><circle cx="${r(pos[0])}" cy="${r(pos[1])}" r="${r(10 - sleep * 4)}" fill="${RED}"/>`

  // The technician's notes.
  const NX = 860
  const NY = 152
  body += txt(NX, NY, 19, "TECHNICIAN'S NOTES", { weight: 600, spacing: 2.5 })
  body += `<path d="M${NX} ${NY + 12}H${PR - 36}" stroke="${INK}" stroke-width="1"/>`
  const notes = [{ t: 0.5, note: 'lights out' }]
  score.lines.forEach((l, i) => notes.push({ t: l.start, note: NOTES[i] ?? l.text.toLowerCase() }))
  for (const g of gapsOf(score)) {
    if (g.kind === 'gap' && drowsy(score, g.to - 0.01) > 0.5) notes.push({ t: g.from + 1.2, note: 'drifting. N1, N2' })
    if (g.kind === 'intro') notes.push({ t: 10, note: 'drifting. N1' })
    if (g.kind === 'outro') notes.push({ t: g.from + 8, note: 'N2' }, { t: g.from + 14, note: 'asleep at last. N3' })
  }
  notes.sort((a, b) => a.t - b.t)
  const shown = notes.filter((n) => n.t <= t).slice(-11)
  shown.forEach((n, i) => {
    const y = NY + 50 + i * 37
    const a = clamp01((t - n.t) / 0.4)
    const fresh = i === shown.length - 1 && t - n.t < 4
    body += `<g opacity="${r(a, 3)}">${txt(NX, y, 16, nightClock(score, n.t), { weight: 500, fill: '#5a5348', spacing: 1 })}${txt(NX + 78, y, 23, n.note, { weight: 400, italic: true, fill: fresh ? RED : '#3a352d' })}</g>`
  })

  // The hypnogram: stuck at WAKE, dipping only in the silences.
  const HX = 150
  const HW = PR - 36 - HX
  const HY = 652
  const RH = 28
  STAGES.forEach((s, i) => {
    const y = HY + i * RH
    body += txt(PX + 36, y + 5, 14, s, { weight: 600, spacing: 1.5, opacity: 0.8 })
    body += `<path d="M${HX} ${y}H${HX + HW}" stroke="${INK}" stroke-width="1" opacity="0.22"/>`
  })
  const xOf = (s) => HX + (s / score.duration) * HW
  let trace = ''
  let prev = null
  for (const [s, st] of stagesOf(score)) {
    if (s > t) break
    const x = r(xOf(s), 1)
    const y = HY + st * RH
    trace += prev === null ? `M${x} ${y}` : `H${x}V${y}`
    prev = st
  }
  const cur = stageAt(score, t)
  trace += `H${r(xOf(t), 1)}V${HY + cur * RH}`
  body += `<path d="${trace}" fill="none" stroke="${RED}" stroke-width="2.6" stroke-linejoin="miter"/>`
  body += `<circle cx="${r(xOf(t))}" cy="${HY + cur * RH}" r="5" fill="${RED}"/>`
  return body
}

/* ── The contract ─────────────────────────────────────────────────── */

export const HORIZON_DIRECTIONS = ['constellations', 'nightmares', 'monkey-brain']

/** The plate alone, for a still sheet. */
export function horizonPlate({ time, score, uid = 'horizon', direction = 'nightmares' }) {
  if (direction === 'monkey-brain') return brainPlate({ time, score, uid })
  return skyPlate({ time, score, uid, nightmares: direction === 'nightmares' })
}

const film = (direction) => ({ time, score, uid = `horizon-${direction}` }) => {
  const clip = `${uid}-plate`
  return {
    label: sectionAt(score, time).label,
    svg: `<defs><clipPath id="${clip}"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}"/></clipPath></defs>
${paper(COVER_SHEET)}
<g clip-path="url(#${clip})">${horizonPlate({ time, score, uid, direction })}</g>
${marginLyric({ now: time, score, uid, sheet: COVER_SHEET })}`,
  }
}

export const constellationsFrame = film('constellations')
export const nightmaresFrame = film('nightmares')
export const monkeyBrainFrame = film('monkey-brain')
