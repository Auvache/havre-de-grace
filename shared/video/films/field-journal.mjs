/*
 * Field Journal — style C1, for "Into the Wild".
 *
 * A naturalist's notebook, open flat as a two-page spread. The line being sung
 * is the entry, written across the top of the left-hand page; the thing it
 * names is sketched on a card taped to the right-hand page, drawn on in pencil
 * while the voice sings it, with a watercolour wash blooming behind it. Every
 * sketch a verse makes stays in the book — shrunk into a specimen grid under
 * the entry — so by the end of a verse the spread is a page of finds. The page
 * turns at a section boundary, and a chorus is a different kind of page
 * altogether: a trail map across both leaves, with somebody running along it.
 *
 * `fieldJournalFrame({ time, score })` is a pure function of the song's clock.
 * Nothing animates by remembering: the pencil "drawing on" is a dash offset
 * computed from how many measured words and click eighths have gone by, so a
 * scrubbed or replayed clip is the same drawing at the same moment.
 *
 * DRAWN ON WITHOUT MEASURING
 *
 * A pencil line that draws itself wants its own length, and a pure frame
 * function may not ask the DOM for it. `pathLength="1"` on every stroke makes
 * the browser normalise the length itself, so a dash of `1` and an offset of
 * `1 - p` shows exactly the first `p` of the stroke whatever it measures.
 */

import { t, rect, line, path, circle, rng, r, esc, clamp01, lerp, ramp, easeOut } from '../kit.mjs'
import { motifBody } from '../motifs.mjs'
import { sectionAt, shownLineAt, cutIn, splitLine, bankWords } from '../score.mjs'
import { cuesIn } from '../cues.mjs'
import { joints, strokes, runPose } from '../figure.mjs'
import { endCard } from '../ending.mjs'

/* ── The palette ───────────────────────────────────────────────────── */
export const DESK = '#2a231c'
export const PAGE = '#efe6d2'
export const CARD = '#f7f1e3'
export const GRAPHITE = '#3b3a36'
export const SEPIA = '#6b4f36'
export const SEA = '#8fb3c4'
export const SAGE = '#9fb59a'
export const OCHRE = '#d9b46a'
export const RED = '#b8432f'
export const TAPE = '#e6d9ae'

/** The wash each drawing wants. A reading of the noun, like the cues themselves. */
const WASH = {
  lighthouse: SEA, wave: SEA, glacier: SEA, globe: SEA, moon: SEA,
  sprig: SAGE, flower: SAGE, pine: SAGE, cave: SAGE, stone: SAGE, runner: SAGE, book: SAGE, key: SAGE,
  crowd: OCHRE, microphone: OCHRE, sun: OCHRE, gem: OCHRE, crown: OCHRE, compass: OCHRE,
  bone: OCHRE, hourglass: OCHRE, clock: OCHRE, door: OCHRE, guitar: OCHRE,
}

/* ── Type ──────────────────────────────────────────────────────────── */
/*
 * The entry is sentence case, so the kit's caps table is the wrong ruler.
 * These are Jost 500 advance widths in ems, near enough to set a row to its
 * measure with textLength without the spaces being eaten or blown open.
 */
const LOWER = {
  a: 0.55, b: 0.58, c: 0.5, d: 0.58, e: 0.54, f: 0.31, g: 0.58, h: 0.56, i: 0.24, j: 0.24,
  k: 0.5, l: 0.24, m: 0.85, n: 0.56, o: 0.57, p: 0.58, q: 0.58, r: 0.35, s: 0.43, t: 0.33,
  u: 0.56, v: 0.5, w: 0.76, x: 0.49, y: 0.5, z: 0.45,
  ' ': 0.26, ',': 0.24, '.': 0.24, '\'': 0.2, '’': 0.2, '-': 0.33, '—': 0.8,
}
const CAPS = { I: 0.3, M: 0.84, W: 0.98, O: 0.78, S: 0.56, T: 0.54 }
const ems = (text) => {
  let e = 0
  for (const ch of String(text)) e += LOWER[ch] ?? CAPS[ch] ?? (ch === ch.toUpperCase() ? 0.66 : 0.55)
  return e
}

/** How far through a row the voice is, by this face's own widths, landing on word boundaries. */
function through(now, row, words) {
  const whole = Math.max(ems(row), 0.001)
  let cursor = 0
  let edge = 0
  words.forEach((word, i) => {
    const before = cursor
    cursor += ems(word.text)
    const after = cursor
    cursor += ems(' ')
    if (now < word.t) return
    const next = words[i + 1]
    const span = Math.min(0.18, Math.max((next?.t ?? word.t + 0.3) - word.t, 0.06))
    edge = lerp(before, after, easeOut(ramp(now, word.t, word.t + span)))
  })
  return clamp01(edge / whole)
}

/**
 * The entry: the line, broken into its rows, each fitted to the measure and
 * written in graphite. What has not been sung yet is the same pencil pressed
 * lightly — the row is drawn twice and the heavy copy clipped to the voice.
 */
function entry({ now, lyric, x, y, measure, cap, anchor = 'start', uid, leading = 1.12, weight = 500, oneRow = 5, floor = 0 }) {
  const fitted = (list) => Math.min(cap, ...list.map((row) => measure / Math.max(ems(row), 0.001)))
  let rows = splitLine(lyric.text, oneRow)
  /*
   * A long line in two rows comes out at fifty-odd units on a 650 measure —
   * legible up close, not across a room. Past a floor it takes three rows
   * instead, broken by length so the rows come out near even.
   */
  const words = lyric.text.split(' ')
  if (floor && rows.length === 2 && fitted(rows) < floor && words.length >= 6) {
    const total = ems(lyric.text)
    const cuts = [total / 3, (2 * total) / 3]
    const out = [[], [], []]
    let run = 0
    for (const w of words) {
      const k = run < cuts[0] ? 0 : run < cuts[1] ? 1 : 2
      out[k].push(w)
      run += ems(w + ' ')
    }
    rows = out.filter((row) => row.length).map((row) => row.join(' '))
  }
  const banks = bankWords(lyric, rows)
  const size = fitted(rows)
  let baseline = y + size * 0.78
  return rows.map((row, i) => {
    const len = ems(row) * size
    const left = anchor === 'middle' ? x - len / 2 : x
    const edge = through(now, row, banks[i])
    const id = `${uid}-row-${lyric.index}-${i}`
    const base = { x, y: baseline, size, text: row, len, anchor, weight, upper: false }
    const out = `${t({ ...base, fill: GRAPHITE, opacity: 0.3 })}
      <clipPath id="${id}"><rect x="${r(left - 4)}" y="${r(baseline - size)}" width="${r(len * edge + 4)}" height="${r(size * 1.4)}"/></clipPath>
      ${t({ ...base, fill: GRAPHITE, extra: `clip-path="url(#${id})"` })}`
    baseline += size * leading
    return out
  }).join('')
}

/* ── Pencil ────────────────────────────────────────────────────────── */

/*
 * The steps a drawing goes down in: every measured word, and every eighth of
 * the click, between `from` and `to`. A sketch that ran on a smooth clock read
 * as an animation; one that only moved on words stalled through a held note.
 * Words and the click together are the rate a hand actually draws at.
 */
function steps(from, to, words) {
  const out = []
  for (const w of words) if (w.t >= from - 0.001 && w.t < to) out.push(w.t)
  for (let k = Math.ceil((from - 0.03) / 0.25); 0.03 + k * 0.25 < to; k++) {
    const g = 0.03 + k * 0.25
    if (!out.some((x) => Math.abs(x - g) < 0.07)) out.push(g)
  }
  return out.sort((a, b) => a - b)
}

/** 0→1 in steps, each eased over 90 ms. */
const stepped = (now, list) =>
  list.length ? list.reduce((sum, at) => sum + easeOut(ramp(now, at, at + 0.09)), 0) / list.length : 1

const DRAWABLE = /<(path|circle|rect|line|polyline|ellipse)\b[^>]*\/>/g

/*
 * Each stroke of a motif, drawn on in turn. Given one shared progress, every
 * element with its own pathLength draws at once — a crowd of twelve strokes
 * came up as twelve scattered fragments, which reads as noise, not as a pencil.
 * One after another is how a hand does it.
 */
const ELEMENTS = new Map()
const elementsOf = (name) => {
  if (!ELEMENTS.has(name)) ELEMENTS.set(name, motifBody(name).match(DRAWABLE) ?? [])
  return ELEMENTS.get(name)
}

/**
 * A motif, sketched: drawn on to `p`, with a second, lighter pass of the pencil
 * a hair off the first — the one thing that makes a library icon read as
 * something drawn from life. `width` is in frame units whatever the size.
 */
function sketch(name, cx, cy, size, p, o = {}) {
  if (p <= 0) return ''
  const { stroke = GRAPHITE, width = 2.6, rotate = 0, second = true, opacity = 1 } = o
  const s = size / 100
  const parts = elementsOf(name)
  const pass = (q, dx, dy, spin, sw, op) => {
    if (q <= 0) return ''
    const n = parts.length
    const body = q >= 1
      ? parts.join('')
      : parts.map((el, i) => {
        const u = clamp01(q * n - i)
        if (u <= 0) return ''
        if (u >= 1) return el
        return el.replace(/\/>$/, ` pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${r(1 - u, 4)}"/>`)
      }).join('')
    return `<g transform="translate(${r(cx - size / 2 + dx)} ${r(cy - size / 2 + dy)}) scale(${r(s, 4)}) rotate(${r(rotate + spin, 2)} 50 50)" fill="none" stroke="${stroke}" stroke-width="${r(sw / s, 3)}" stroke-linecap="round" stroke-linejoin="round" opacity="${r(op * opacity, 3)}">${body}</g>`
  }
  return pass(p, 0, 0, 0, width, 0.92)
    + (second ? pass(clamp01((p - 0.2) / 0.8), size * 0.012, -size * 0.008, 0.9, width * 0.5, 0.4) : '')
}

/** A few hatched strokes under a drawing — its shadow on the ground. */
function hatch(cx, cy, w, p, seed, stroke = GRAPHITE) {
  if (p <= 0) return ''
  const rand = rng(seed)
  const n = Math.ceil(7 * p)
  let d = ''
  for (let i = 0; i < n; i++) {
    const x = cx - w / 2 + (i + 0.3) * (w / 7) + (rand() - 0.5) * 6
    d += `M${r(x)} ${r(cy + 6)} l${r(w / 9)} ${r(-12 - rand() * 4)}`
  }
  return path(d, { stroke, sw: 1.6, cap: 'round', opacity: 0.45 })
}

/** A wobbly blob, the shape a wash dries to. */
function blob(cx, cy, rx, ry, seed) {
  const rand = rng(seed)
  const n = 11
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    const k = 0.84 + rand() * 0.3
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]
  })
  let d = ''
  for (let i = 0; i < n; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % n]
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
    d += (i === 0 ? `M${r(m[0])} ${r(m[1])}` : '') + ` Q${r(b[0])} ${r(b[1])} ${r((b[0] + pts[(i + 2) % n][0]) / 2)} ${r((b[1] + pts[(i + 2) % n][1]) / 2)}`
  }
  return d + 'Z'
}

/** A watercolour wash behind a drawing, blooming in as the drawing goes down. */
function wash(cx, cy, rad, colour, amount, seed, uid, blurred = true) {
  if (amount <= 0) return ''
  const k = lerp(0.55, 1, easeOut(amount))
  return path(blob(cx, cy, rad * k * 1.12, rad * k * 0.86, seed), {
    fill: colour, opacity: r(0.5 * clamp01(amount * 1.4), 3), filter: blurred ? `${uid}-wash` : null,
  })
}

const tape = (x, y, w, angle) =>
  rect(x - w / 2, y - 17, w, 34, TAPE, { opacity: 0.78, transform: `rotate(${r(angle, 2)} ${r(x)} ${r(y)})` })

/** "fig. 12 — harbor", with a pencil leader to the drawing. */
function label(x, y, text, to, opacity = 1) {
  if (opacity <= 0) return ''
  const lead = to ? line(to[0], to[1], x + (to[0] < x ? -8 : 8), y - 8, GRAPHITE, 1.3, { opacity: 0.6 * opacity }) : ''
  return lead + t({ x, y, size: 23, text, fill: SEPIA, weight: 400, upper: false, opacity, anchor: to && to[0] > x ? 'end' : 'start' })
}

/* ── The book ──────────────────────────────────────────────────────── */

/** The spread: desk, two leaves, a gutter, and the stack of pages at each edge. */
function book(uid, ruling = 'grid', seed = 1) {
  const rulingPath = (() => {
    let d = ''
    if (ruling === 'grid') {
      for (let x = 64; x < 1560; x += 40) if (Math.abs(x - 800) > 26) d += `M${x} 40 V860`
      for (let y = 60; y < 860; y += 40) d += `M44 ${y} H1556`
    }
    else if (ruling === 'ruled') {
      for (let y = 96; y < 860; y += 46) d += `M44 ${y} H778 M822 ${y} H1556`
    }
    return d ? path(d, { stroke: ruling === 'grid' ? '#9fb3bd' : '#9fb3bd', sw: 1, opacity: ruling === 'grid' ? 0.28 : 0.4 }) : ''
  })()
  const rand = rng(seed)
  const stack = [0, 1, 2].map((i) => `${line(28 + i * 4, 26 + i, 28 + i * 4, 874 - i, '#c9bc9f', 1.2)}${line(1572 - i * 4, 26 + i, 1572 - i * 4, 874 - i, '#c9bc9f', 1.2)}`).join('')
  return `
    <defs>
      <linearGradient id="${uid}-gutter" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#5a4630" stop-opacity="0"/>
        <stop offset="0.46" stop-color="#5a4630" stop-opacity="0.2"/>
        <stop offset="0.5" stop-color="#3a2c1e" stop-opacity="0.34"/>
        <stop offset="0.54" stop-color="#5a4630" stop-opacity="0.2"/>
        <stop offset="1" stop-color="#5a4630" stop-opacity="0"/>
      </linearGradient>
      <filter id="${uid}-wash" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="14"/></filter>
    </defs>
    ${rect(0, 0, 1600, 900, DESK)}
    ${rect(24, 22, 1552, 856, PAGE, { rx: 6 })}
    ${stack}
    ${rulingPath}
    ${rect(720, 22, 160, 856, `url(#${uid}-gutter)`)}
    ${line(800, 22, 800, 878, '#8a7458', 1, { opacity: 0.5 + rand() * 0.01 })}`
}

/** The card a sketch is drawn on, taped to the right-hand leaf. */
function card(cx, cy, w, h, angle, seed) {
  const rand = rng(seed)
  return `<g transform="rotate(${r(angle, 2)} ${r(cx)} ${r(cy)})">
    ${rect(cx - w / 2 + 5, cy - h / 2 + 7, w, h, '#3a2c1e', { opacity: 0.12 })}
    ${rect(cx - w / 2, cy - h / 2, w, h, CARD)}
    ${tape(cx - w / 2 + 40, cy - h / 2 + 6, 120, -28 + rand() * 8)}
    ${tape(cx + w / 2 - 40, cy - h / 2 + 6, 120, 26 + rand() * 8)}
  </g>`
}

/* ══ READING THE SCORE ONCE ══════════════════════════════════════════ */

/*
 * Every drawing the song makes, in order, numbered — fig. 1 to fig. N — so the
 * number under a sketch is its place in the book rather than a count anybody
 * has to keep. Consecutive repeats of the same drawing are one figure: "lose my
 * way" is the compass that "adventure" already drew, not a second one.
 */
const PLANS = new WeakMap()
function planFor(score) {
  if (PLANS.has(score)) return PLANS.get(score)
  const figs = []
  let last = null
  for (const lyric of score.lines) {
    const kind = score.sections.find((s) => s.id === lyric.section)?.kind
    if (kind === 'chorus') { last = null; continue }
    for (const cue of cuesIn(lyric)) {
      if (cue.motif === last) continue
      figs.push({ ...cue, line: lyric.index, section: lyric.section, n: figs.length + 1 })
      last = cue.motif
    }
  }
  const plan = { figs }
  PLANS.set(score, plan)
  return plan
}

/* ══ THE FRAME ════════════════════════════════════════════════════════ */

/**
 * One frame of the film.
 * @param {{ time: number, score: object, lockup?: string, uid?: string }} o
 * @returns {{ svg: string, label: string }}
 */
export function fieldJournalFrame({ time, score, lockup = '', uid = 'journal' }) {
  const now = time
  if (score.endCardAt != null && now >= score.endCardAt) return endCard({ now, from: score.endCardAt, lockup })
  const section = sectionAt(score, now)
  const plan = planFor(score)
  const shown = shownLineAt(score, now)
  const lyric = shown && shown.section === section.id ? shown : null

  let body
  if (section.kind === 'intro') body = titleSpread(now, section, score, uid)
  else if (section.kind === 'chorus' || section.kind === 'outro') body = trailSpread(now, section, lyric, score, uid)
  else if (section.kind === 'break') body = pressedSpread(now, section, uid)
  else if (section.kind === 'solo') body = panoramaSpread(now, section, uid)
  else body = verseSpread(now, section, lyric, score, plan, uid)

  return { svg: body, label: lyric?.text ?? section.label }
}

/* ══ THE SPREADS ══════════════════════════════════════════════════════ */

/*
 * A verse. The entry across the top of the left leaf; the sketch of the line
 * on a card on the right leaf, drawing on as it is sung; and under the entry,
 * every figure this verse has already drawn, small, numbered, in the order it
 * found them. The grid is the verse's memory, and it is what makes the fourth
 * line of a verse look nothing like the first.
 */
const VERSE_LOOK = {
  'verse-1': { ruling: 'grid', seed: 11, angle: -1.6 },
  'verse-2': { ruling: 'ruled', seed: 23, angle: 1.4 },
  'verse-3': { ruling: 'grid', seed: 37, angle: -0.8 },
}

function verseSpread(now, section, lyric, score, plan, uid) {
  const look = VERSE_LOOK[section.id] ?? VERSE_LOOK['verse-1']
  const out = [book(uid, look.ruling, look.seed)]
  if (!lyric) return out.join('')

  /* The finds so far, under the entry. */
  const earlier = plan.figs.filter((f) => f.section === section.id && f.line < lyric.index).slice(-8)
  const cols = 4
  earlier.forEach((f, i) => {
    const cx = 154 + (i % cols) * 168
    const cy = 478 + Math.floor(i / cols) * 206
    const rand = rng(f.n * 7)
    out.push(path(blob(cx, cy - 6, 64, 50, f.n), { fill: WASH[f.motif] ?? OCHRE, opacity: 0.3 }))
    out.push(sketch(f.motif, cx, cy - 8, 132, 1, { width: 2, rotate: (rand() - 0.5) * 8, second: false }))
    out.push(t({ x: cx, y: cy + 86, size: 20, text: `fig. ${f.n}`, fill: SEPIA, weight: 400, upper: false, anchor: 'middle', opacity: 0.85 }))
  })

  /* The entry. */
  out.push(entry({ now, lyric, x: 92, y: 88, measure: 650, cap: 92, uid, floor: 66, leading: 1.06 }))

  /* The sketch of this line, on its card. */
  const figs = plan.figs.filter((f) => f.line === lyric.index)
  const cardAngle = look.angle + ((lyric.index % 3) - 1) * 0.9
  out.push(card(1188, 452, 610, 700, cardAngle, lyric.index + 3))
  const from = cutIn(score, lyric)
  const slots = {
    1: [[1188, 420, 430]],
    2: [[1120, 370, 340], [1392, 600, 210]],
    3: [[1050, 300, 230], [1320, 330, 230], [1188, 590, 230]],
  }[Math.min(figs.length, 3)] ?? []
  figs.slice(0, 3).forEach((f, i) => {
    const [cx, cy, size] = slots[i]
    const start = i === 0 ? lyric.start : f.t
    const next = figs[i + 1]
    const end = next ? next.t : lyric.end + 0.9
    const p = stepped(now, steps(start, end, lyric.words))
    const colour = WASH[f.motif] ?? OCHRE
    out.push(wash(cx, cy + size * 0.04, size * 0.46, colour, p, f.n * 13, uid))
    if (f.motif === 'crowd') out.push(noise(now, lyric, cx, cy, size))
    out.push(sketch(f.motif, cx, cy, size, p, { rotate: cardAngle }))
    out.push(hatch(cx, cy + size * 0.5, size * 0.6, ramp(p, 0.7, 1), f.n))
    const ly = Math.min(cy + size * 0.5 + 44, 786)
    out.push(t({ x: cx, y: ly, size: 23, text: `fig. ${f.n} — ${f.match.toLowerCase()}`, fill: SEPIA, weight: 400, upper: false, anchor: 'middle', opacity: r(clamp01((p - 0.55) / 0.3), 3) }))
  })
  if (!figs.length) {
    const p = stepped(now, steps(lyric.start, lyric.end + 0.9, lyric.words))
    const again = cuesIn(lyric).length ? plan.figs.filter((f) => f.section === section.id && f.line < lyric.index).at(-1) : null
    if (again) {
      /*
       * A line that names the drawing the last line made — "lose my way" after
       * "adventure", "sleeping alone" after "sleeping" — does not get a second
       * compass. It gets the first one back, and the red pencil goes round it.
       */
      out.push(path(blob(1188, 424, 200, 160, again.n * 13), { fill: WASH[again.motif] ?? OCHRE, opacity: 0.4, filter: `${uid}-wash` }))
      out.push(sketch(again.motif, 1188, 420, 400, 1, { rotate: cardAngle }))
      out.push(ring(1188, 420, 250, 215, p, again.n))
      out.push(t({ x: 1188, y: 736, size: 23, text: `fig. ${again.n}, again`, fill: RED, weight: 400, upper: false, anchor: 'middle', opacity: r(clamp01((p - 0.5) / 0.3), 3) }))
    }
    else out.push(sketch('sprig', 1188, 430, 300, p, { stroke: SEPIA }))
  }
  return out.join('')
}

/** A red-pencil ring, drawn round something once, overshooting where it closes. */
function ring(cx, cy, rx, ry, p, seed) {
  if (p <= 0) return ''
  const rand = rng(seed + 90)
  let d = ''
  const turns = 1.12
  const n = 40
  for (let i = 0; i <= n; i++) {
    const a = -2.2 + (i / n) * Math.PI * 2 * turns
    const k = 1 + (rand() - 0.5) * 0.05 + (i / n) * 0.05
    d += (i ? ' L' : 'M') + `${r(cx + Math.cos(a) * rx * k)} ${r(cy + Math.sin(a) * ry * k)}`
  }
  const dash = p < 1 ? { dash: `1 1` } : {}
  return path(d, { stroke: RED, sw: 4, cap: 'round', join: 'round', opacity: 0.85, ...dash }).replace('<path ', p < 1 ? `<path pathLength="1" stroke-dashoffset="${r(1 - p, 4)}" ` : '<path ')
}

/*
 * "The roar of a crowd": red pencil, radiating off the drawing, one burst per
 * sung word and each further out than the last — the noise getting louder.
 */
function noise(now, lyric, cx, cy, size) {
  let d = ''
  let shown = 0
  // From "roar" on — the article before it is not a noise.
  const from = Math.max(0, lyric.words.findIndex((w) => /^roar/i.test(w.text)))
  lyric.words.forEach((w, k) => {
    if (k < from || now < w.t) return
    shown = Math.max(shown, easeOut(ramp(now, w.t, w.t + 0.09)))
    const rand = rng(40 + k)
    const rad = size * 0.56 + (k - from) * 18
    for (let i = 0; i < 6; i++) {
      const a = Math.PI * (1.08 + (i / 5) * 0.84) + (rand() - 0.5) * 0.18
      const len = 18 + rand() * 16
      d += `M${r(cx + Math.cos(a) * rad)} ${r(cy + Math.sin(a) * rad * 0.9)} l${r(Math.cos(a) * len)} ${r(Math.sin(a) * len)}`
    }
  })
  return d ? path(d, { stroke: RED, sw: 3.2, cap: 'round', opacity: r(0.85 * shown, 3) }) : ''
}

/* ── The chorus: a trail map across both leaves ─────────────────────── */

const TRAIL_LOOK = {
  'chorus-1': { seed: 101, base: 700, rise: 150, amp: 60, extra: 'sun', wash: OCHRE },
  'chorus-2': { seed: 202, base: 640, rise: 60, amp: 90, extra: 'river', wash: SEA },
  'chorus-3': { seed: 303, base: 720, rise: 200, amp: 70, extra: 'range', wash: SAGE },
}

const TRAILS = new Map()
/** The trail, sampled, with its arc length — computed in JS, never measured. */
function trailFor(look) {
  if (TRAILS.has(look.seed)) return TRAILS.get(look.seed)
  const pts = []
  let s = 0
  let prev = null
  for (let x = -60; x <= 1700; x += 16) {
    const u = (x + 60) / 1760
    const y = look.base - look.rise * u + Math.sin(u * Math.PI * 3.2 + look.seed) * look.amp + Math.sin(u * 11 + look.seed * 0.3) * 14
    if (prev) s += Math.hypot(x - prev[0], y - prev[1])
    pts.push([x, y, s])
    prev = [x, y]
  }
  TRAILS.set(look.seed, pts)
  return pts
}
const atLength = (pts, s) => {
  for (let i = 1; i < pts.length; i++) {
    if (pts[i][2] >= s) {
      const a = pts[i - 1]
      const b = pts[i]
      const u = (s - a[2]) / Math.max(b[2] - a[2], 0.001)
      return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), Math.atan2(b[1] - a[1], b[0] - a[0])]
    }
  }
  const z = pts[pts.length - 1]
  return [z[0], z[1], 0]
}
const polyTo = (pts, s) => {
  let d = ''
  for (const p of pts) {
    if (p[2] > s) { const q = atLength(pts, s); d += ` L${r(q[0])} ${r(q[1])}`; break }
    d += (d ? ' L' : 'M') + `${r(p[0])} ${r(p[1])}`
  }
  return d
}

function trailSpread(now, section, lyric, score, uid) {
  const chorus = section.kind === 'outro'
    ? score.sections.filter((s) => s.kind === 'chorus').at(-1)
    : section
  const look = TRAIL_LOOK[chorus.id] ?? TRAIL_LOOK['chorus-1']
  const pts = trailFor(look)
  const rand = rng(look.seed)
  const out = [book(uid, 'none', look.seed)]
  // The map is drawn on the page, not on the desk: everything below is clipped to the leaves.
  out.push(`<clipPath id="${uid}-leaves"><rect x="26" y="24" width="1548" height="852" rx="6"/></clipPath><g clip-path="url(#${uid}-leaves)">`)

  /* Ridgelines, the way a sketch map puts hills in: a few pencil lines. */
  let ridges = ''
  for (let k = 0; k < 3; k++) {
    const y0 = 400 + k * 58
    let d = ''
    for (let x = 60; x <= 1540; x += 40) {
      const y = y0 - Math.abs(Math.sin((x / 1480) * Math.PI * (2 + k) + look.seed + k)) * (70 - k * 14) + rand() * 6
      d += (d ? ' L' : 'M') + `${x} ${r(y)}`
    }
    ridges += path(d, { stroke: GRAPHITE, sw: 2 - k * 0.4, join: 'round', opacity: 0.5 - k * 0.1 })
  }
  out.push(ridges)
  if (look.extra === 'sun') out.push(sketch('sun', 640, 296, 96, 1, { stroke: SEPIA, width: 2 }) + path(blob(640, 296, 48, 48, 9), { fill: OCHRE, opacity: 0.35 }))
  if (look.extra === 'river') {
    out.push(path('M-20 380 C300 440 520 620 760 620 S1180 820 1620 860', { stroke: SEA, sw: 46, cap: 'round', opacity: 0.55 }))
    out.push(path('M-20 380 C300 440 520 620 760 620 S1180 820 1620 860', { stroke: GRAPHITE, sw: 1.4, opacity: 0.45 }))
  }
  if (look.extra === 'range') {
    out.push(path(blob(1180, 400, 250, 64, 5), { fill: SAGE, opacity: 0.3 }))
    out.push(sketch('mountain', 1180, 372, 330, 1, { width: 2.2, second: true }))
    out.push(sketch('glacier', 360, 392, 210, 1, { width: 2, second: false, opacity: 0.8 }))
  }

  /* Pines along the trail, each with a spot of wash — no blur, there are a dozen. */
  const pines = []
  for (let i = 0; i < 13; i++) {
    const q = atLength(pts, 120 + i * 135 + rand() * 50)
    const side = i % 2 ? -1 : 1
    const size = 58 + rand() * 48
    const x = q[0] + (rand() - 0.5) * 60
    const y = q[1] + side * (70 + rand() * 50)
    if (y < 400 || y > 850) continue
    pines.push({ x, y, size })
  }
  pines.sort((a, b) => a.y - b.y)
  for (const p of pines) {
    out.push(path(blob(p.x, p.y + 4, p.size * 0.4, p.size * 0.28, Math.round(p.x)), { fill: look.wash, opacity: 0.35 }))
    out.push(sketch('pine', p.x, p.y - p.size * 0.3, p.size, 1, { width: 1.8, second: false }))
  }

  /* The trail: all of it faint, the part already run in red pencil. */
  const total = pts[pts.length - 1][2]
  out.push(path(polyTo(pts, total), { stroke: GRAPHITE, sw: 2, dash: '2 12', cap: 'round', opacity: 0.45 }))

  /* The runner, stepping on the click — a pose per eighth, never tweened. */
  const runLine = score.lines.find((l) => l.section === chorus.id)
  const start = runLine ? runLine.start : chorus.from
  const tick = (x) => Math.floor((x - 0.03) / 0.25)
  const step = Math.max(0, tick(now) - tick(start))
  const STRIDE = 74
  const s = 110 + step * STRIDE
  if (now >= start - 0.3) {
    out.push(path(polyTo(pts, Math.min(s, total)), { stroke: RED, sw: 4, dash: '12 10', cap: 'round', opacity: 0.9 }))
    // Footprints: two per stride, alternating either side of the path.
    let prints = ''
    for (let k = 1; k <= step; k++) {
      const q = atLength(pts, 110 + k * STRIDE - 26)
      const side = k % 2 ? 1 : -1
      const nx = -Math.sin(q[2]) * 9 * side
      const ny = Math.cos(q[2]) * 9 * side
      prints += `<ellipse cx="${r(q[0] + nx)}" cy="${r(q[1] + ny)}" rx="7" ry="4" transform="rotate(${r((q[2] * 180) / Math.PI, 1)} ${r(q[0] + nx)} ${r(q[1] + ny)})"/>`
    }
    if (prints) out.push(`<g fill="${SEPIA}" opacity="0.6">${prints}</g>`)
    const q = atLength(pts, s)
    if (q[0] < 1680) out.push(runner(q[0], q[1] + 4, 190, step))
  }
  out.push('</g>')

  /* "…into the wild": the big pine, and its figure, on the word. */
  const wild = runLine?.words.find((w) => /^wild/i.test(w.text))
  if (wild && section.kind === 'chorus') {
    const p = stepped(now, steps(wild.t, wild.t + 1.2, runLine.words))
    const [cx, cy] = look.extra === 'range' ? [1440, 560] : [1420, 520]
    out.push(wash(cx, cy + 20, 110, SAGE, p, 77, uid))
    out.push(sketch('pine', cx, cy, 230, p, { width: 2.8 }))
    out.push(label(cx - 120, cy + 150, 'the wild', null, clamp01((p - 0.5) / 0.3)))
  }

  /* The chorus written large, across both leaves. */
  if (lyric && section.kind === 'chorus') {
    out.push(entry({ now, lyric, x: 800, y: 70, measure: 1360, cap: 124, anchor: 'middle', uid, weight: 500, oneRow: 8 }))
  }
  return out.join('')
}

/** A person, in pencil, from the shared rig. */
function runner(x, ground, h, step) {
  const j = joints(x, ground, h, runPose(step), 1)
  const d = strokes(j).map((line) => line.map((p, i) => `${i ? 'L' : 'M'}${r(p[0])} ${r(p[1])}`).join(' ')).join(' ')
  return path(d, { stroke: GRAPHITE, sw: 6, cap: 'round', join: 'round' })
    + circle(j.head[0], j.head[1], j.head[2], { stroke: GRAPHITE, sw: 6, fill: PAGE })
}

/* ── The title page ─────────────────────────────────────────────────── */

function titleSpread(now, section, score, uid) {
  const out = [book(uid, 'grid', 3)]
  const clock = (a, b) => steps(a, b, [])
  // The left leaf: a pressed sprig, taped in, before anything is written.
  const sprig = stepped(now, clock(1.0, 6.0))
  out.push(wash(400, 470, 190, SAGE, sprig, 4, uid))
  out.push(sketch('sprig', 400, 470, 440, sprig, { stroke: SEPIA, rotate: -18, width: 3 }))
  if (now >= 5.0) {
    out.push(tape(330, 330, 150, -32))
    out.push(tape(470, 640, 150, 24))
  }
  // The right leaf: the song's name, and whose notebook it is.
  const title = easeOut(ramp(now, 2.0, 2.6))
  out.push(t({ x: 1188, y: 380, size: 124, text: score.title, fill: GRAPHITE, anchor: 'middle', weight: 500, upper: false, opacity: title, len: 660 }))
  out.push(t({ x: 1188, y: 450, size: 26, text: score.artist, fill: RED, anchor: 'middle', weight: 500, tracking: 12, opacity: easeOut(ramp(now, 3.2, 3.7)) }))
  out.push(line(930, 490, 1446, 490, GRAPHITE, 1.5, { opacity: 0.5 * ramp(now, 3.6, 4.2) }))
  const compass = stepped(now, clock(6.5, 14.0))
  out.push(wash(1188, 660, 120, OCHRE, compass, 6, uid))
  out.push(sketch('compass', 1188, 660, 250, compass, { width: 2.4 }))
  return out.join('')
}

/* ── The break: specimens pressed between the pages ─────────────────── */

function pressedSpread(now, section, uid) {
  const out = [book(uid, 'none', 5)]
  const a = stepped(now, steps(section.from + 0.2, section.from + 4.2, []))
  const b = stepped(now, steps(section.from + 4.0, section.to - 0.6, []))
  out.push(wash(420, 450, 200, SAGE, a, 12, uid))
  out.push(sketch('flower', 420, 450, 460, a, { stroke: SEPIA, rotate: 10, width: 3 }))
  out.push(wash(1180, 450, 200, OCHRE, b, 13, uid))
  out.push(sketch('sprig', 1180, 450, 480, b, { stroke: SEPIA, rotate: -24, width: 3 }))
  if (a > 0.5) out.push(tape(360, 250, 150, -20) + tape(470, 690, 150, 18))
  if (b > 0.5) out.push(tape(1110, 250, 150, 22) + tape(1260, 690, 150, -16))
  return out.join('')
}

/* ── The horns: a panorama, drawn slowly across the whole spread ────── */

function panoramaSpread(now, section, uid) {
  const out = [book(uid, 'none', 7)]
  const span = section.to - section.from
  const parts = [
    ['mountain', 360, 420, 560, SAGE, 0],
    ['glacier', 1180, 400, 480, SEA, 0],
    ['pine', 180, 700, 180, SAGE, -4],
    ['pine', 610, 690, 150, SAGE, 3],
    ['pine', 1010, 700, 190, SAGE, -2],
    ['birds', 820, 210, 260, SEA, 0],
    ['sun', 1420, 190, 170, OCHRE, 0],
    ['pine', 1430, 700, 160, SAGE, 4],
  ]
  parts.forEach(([name, cx, cy, size, colour, spin], i) => {
    const a = section.from + (i / parts.length) * span
    const b = a + (span / parts.length) * 0.9
    const p = stepped(now, steps(a, b, []))
    out.push(wash(cx, cy + size * 0.06, size * 0.42, colour, p, 50 + i, uid, size > 300))
    out.push(sketch(name, cx, cy, size, p, { rotate: spin, width: size > 300 ? 2.8 : 2.2 }))
  })
  out.push(line(60, 790, 1540, 790, GRAPHITE, 1.6, { opacity: 0.5 * ramp(now, section.from, section.from + 3) }))
  return out.join('')
}

export const FIELD_JOURNAL = {
  id: 'c1-field-journal',
  name: 'Field Journal',
  accent: RED,
  palette: { PAGE, GRAPHITE, SEPIA, SEA, SAGE, OCHRE, RED },
}
