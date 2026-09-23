/*
 * The album — what every film for "Into the Wild" shares.
 *
 * Ten songs, ten printmaking techniques, one sheet of paper. Each film is an
 * impression pulled on the same stock with the same black and the same red;
 * what changes from song to song is the technique and one second ink. The
 * written rules are in app/config/albumStyle.ts. This file is the part a film
 * module imports, so that "the album's paper" is one constant and not ten
 * slightly different creams.
 *
 * Plain .mjs, pure, no DOM — the same contract as everything in shared/video/.
 */
import { t, rect, path, advance, clamp01, easeInOut, easeOut, lerp, ramp, r, esc } from './kit.mjs'
import { splitLine } from './score.mjs'

/* ── The three inks every film prints with ────────────────────────────
 *
 * Paper is the stock, never white. Ink is a warm black, never #000 (pure
 * black belongs to the end card, which is how the end card reads as an ending).
 * Red is the journey: in every film the only red thing is the thing that is
 * travelling — Andalusia's route, Into the Wild's sun and trail — so across the
 * album the eye learns that red means "going".
 */
export const PAPER = '#ece4d2'
export const INK = '#1b1915'
export const RED = '#b5392a'
/** Paper a shade down, for the margin's plate mark and anything embossed. */
export const PAPER_SHADE = '#d9cfb9'

/** Each song's second ink. One per film, never two. */
export const SECOND_INK = {
  'into-the-wild': '#586a70', // slate — the woodcut's water and mist
  conman: '#3e5b4c', // banknote green
  'goodbye-norma-jeane': '#e59aae', // screenprint pink
  ivory: '#3f6aa6', // butterfly blue
  andalusia: '#8fa89a', // chart sea
  'new-york': '#d9a13b', // poster yellow
  'meet-me-at-the-horizon': '#d7a24a', // dawn gold
  'rocks-in-the-sea': '#24527d', // cyanotype blue
  'ship-to-stockholm': '#8ea3ad', // ice
  ghost: '#8b8580', // ghost grey
}

/* ── The sheet ────────────────────────────────────────────────────────
 *
 * Every film is a print on a sheet: a paper margin, the image inside a plate
 * mark, and the lyric in the margin under it — where a printmaker pencils a
 * print's title. That margin is the album's one layout constant, and it is why
 * ten different techniques read as one record.
 */
export const SHEET = {
  /** The image — the plate. */
  plate: { x: 34, y: 34, w: 1532, h: 666 },
  /** The lyric margin under it. */
  margin: { x: 34, y: 700, w: 1532, h: 200 },
  /** Centre of the lyric margin, for one row. */
  lyricY: 800,
}

/** The paper and the plate mark. Draw first; the film's plate goes on top, clipped to `plateClip`. */
export function paper() {
  const { x, y, w, h } = SHEET.plate
  return `${rect(0, 0, 1600, 900, PAPER)}
    <rect x="${x - 10}" y="${y - 10}" width="${w + 20}" height="${h + 20}" rx="5" fill="none" stroke="${PAPER_SHADE}" stroke-width="3"/>
    <rect x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${h + 16}" rx="4" fill="none" stroke="#fff8ea" stroke-width="1.5" opacity="0.7"/>`
}

/** A clipPath for the plate, namespaced. Returns { def, url }. */
export function plateClip(uid, o = {}) {
  const { x, y, w, h } = { ...SHEET.plate, ...o }
  const id = `${uid}-plate`
  return { def: `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath>`, url: `url(#${id})` }
}

/* ── The lyric, in the margin ─────────────────────────────────────────
 *
 * Jost 700 caps in the album ink, the same black in every film on the album,
 * and it does not change as it is sung: no sweep, no fill, no colour. What
 * carries the timing is when a line arrives, when it leaves and how it hands
 * over to the next — so that is the part that is measured, and it is the same
 * rule in all ten films (lineSpan, below).
 *
 * One row if it fits at 70 or more, otherwise two rows at the same size, sized
 * to the measure and set at natural width.
 */
const MEASURE = 1400

/** One line in the margin, solid ink, at `opacity`. */
export function lyricMargin({ line, opacity = 1, fill = INK, cap = 92 }) {
  if (!line || opacity <= 0.001) return ''
  const oneSize = Math.min(cap, MEASURE / Math.max(advance(line.text), 0.001))
  const rows = oneSize >= 70 ? [line.text] : splitLine(line.text, 0)
  const size = rows.length === 1 ? oneSize : Math.min(66, ...rows.map((row) => MEASURE / Math.max(advance(row), 0.001)))
  const lead = size * 1.08
  const top = SHEET.lyricY - ((rows.length - 1) * lead) / 2 + size * 0.36
  return `<g opacity="${r(opacity, 3)}">${rows.map((row, i) =>
    t({ x: 800, y: top + i * lead, size, text: row, fill, anchor: 'middle', weight: 700 }),
  ).join('')}</g>`
}

/*
 * When a line is in the margin — the album's one timing rule.
 *
 *   In    Fully up 20 ms before its first word, over the lead before it: never
 *         late, and never so early that it reads as a caption for the line
 *         before. Out of silence it fades in over the whole 0.3 s lead.
 *   Over  A line gives way to the next inside the next one's lead, but not
 *         before it has held for at least a quarter of a second past its own
 *         last word — a line that leaves on the word it ends with reads as cut
 *         off. The outgoing line is gone in the first 40% of the handover and
 *         the incoming one fades up in the rest, so the two are never on the
 *         margin at full strength together: two lines crossfading in one place
 *         is a double exposure.
 *   Out   The last line of a section holds while it is still being sung — its
 *         last word is often held for seconds — and leaves with the section,
 *         over its last 0.35 s. Section boundaries in a score are placed where
 *         the voice stops, so that is when the line goes.
 */
const LEAD = 0.3
const HOLD = 0.25

const sectionOf = (score, line) => score.sections.find((x) => x.id === line.section)

/** When `line` takes the margin. */
function takeover(score, line) {
  const section = sectionOf(score, line)
  const previous = score.lines[line.index - 1]
  const earliest = line.start - LEAD
  if (!previous || previous.section !== line.section) return Math.max(earliest, section ? section.from : 0)
  // Hold the previous line a beat past its last word where the gap allows it.
  return Math.max(earliest, Math.min(previous.end + HOLD, line.start - 0.12))
}

/** The line's time in the margin: fade in over [inStart, inEnd], out over [outStart, outEnd]. */
export function lineSpan(score, line) {
  const section = sectionOf(score, line)
  const previous = score.lines[line.index - 1]
  const next = score.lines[line.index + 1]
  const from = takeover(score, line)
  const lead = Math.max(line.start - from, 0.02)
  const follows = Boolean(previous && previous.section === line.section)
  const inStart = follows ? from + 0.4 * lead : from
  const inEnd = Math.max(inStart + 0.02, line.start - 0.02)
  const handsOver = Boolean(next && next.section === line.section)
  if (handsOver) {
    const to = takeover(score, next)
    return { inStart, inEnd, outStart: to, outEnd: to + 0.4 * Math.max(next.start - to, 0.02) }
  }
  const to = section ? section.to : line.end + 2
  return { inStart, inEnd, outStart: to - 0.35, outEnd: to }
}

/**
 * The margin at `now`: whichever lines are in it, at their opacities. At most
 * two, and only for the fraction of a second one is leaving and the next is
 * arriving. `skip(line)` leaves a line out (Andalusia's oh-ohs have no words).
 */
export function marginLyric({ now, score, uid = '', fill = INK, skip = null }) {
  let out = ''
  for (const line of score.lines) {
    if (skip && skip(line)) continue
    const span = lineSpan(score, line)
    if (now < span.inStart || now >= span.outEnd) continue
    const opacity = Math.min(easeOut(ramp(now, span.inStart, span.inEnd)), 1 - easeInOut(ramp(now, span.outStart, span.outEnd)))
    out += lyricMargin({ line, opacity, fill })
  }
  return out
}

/* ── The title card — the same format on all ten ──────────────────────
 *
 * A printmaker signs a print in the margin: the edition number at the left,
 * the title in the middle, the signature at the right. The album's opening
 * card is exactly that, pencilled under the film's first image — so the track
 * number, which nothing else in any film is allowed to show, is earned here as
 * an edition number: "5/10" is Andalusia.
 */
export function titleCard({ title, track, of = 10, opacity = 1 }) {
  const pencil = '#6f675b'
  const size = Math.min(96, 1000 / Math.max(advance(title), 0.001))
  return `<g opacity="${r(opacity, 3)}">
    ${t({ x: 800, y: SHEET.lyricY + size * 0.36, size, text: title, fill: INK, anchor: 'middle', weight: 700 })}
    ${t({ x: 70, y: SHEET.lyricY + 12, size: 30, text: `${track}/${of}`, fill: pencil, weight: 400, upper: false })}
    ${t({ x: 1530, y: SHEET.lyricY + 12, size: 26, text: 'Havre De Grace', fill: RED, anchor: 'end', weight: 600, tracking: 6 })}
  </g>`
}

/* ── Smoothness ───────────────────────────────────────────────────────
 *
 * What Andalusia's chart does that nothing else in the suite did: it never
 * stops and it never cuts. These are the helpers for the album's motion rules
 * (albumStyle.ts, MOTION).
 */

/*
 * The camera's ease: half a cosine. The kit's cubic easeInOut peaks at three
 * times its average speed, so a long pan lurches through its middle — 120
 * units a frame at 30 fps on a 2000-unit move in 1.6 s. The cosine peaks at
 * about 1.6 times, which is the difference between a camera and a whip.
 */
export const easeCamera = (x) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(x))

/** Ease between keyframes: keys = [{ t, v }], v a number or an object of numbers. Eased in and out. */
export function glide(now, keys) {
  if (!keys.length) return 0
  if (now <= keys[0].t) return keys[0].v
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i]
    const b = keys[i + 1]
    if (now <= b.t) {
      const u = easeCamera(ramp(now, a.t, b.t))
      if (typeof a.v === 'number') return lerp(a.v, b.v, u)
      const out = {}
      for (const k of Object.keys(a.v)) out[k] = lerp(a.v[k], b.v[k], u)
      return out
    }
  }
  return keys[keys.length - 1].v
}

/** A word's arrival: 0 before `at`, 1 once it has landed, over `span` (180 ms default). Never a step. */
export const land = (now, at, span = 0.18) => easeOut(ramp(now, at, at + span))

/** A line's presence: fades in over the cut-in lead, out over `out` after `to`. Lines dissolve; they do not cut. */
export const presence = (now, from, to, fadeIn = 0.3, out = 0.35) =>
  Math.min(easeOut(ramp(now, from, from + fadeIn)), 1 - easeInOut(ramp(now, to, to + out)))

export { esc }
