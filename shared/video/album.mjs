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

/*
 * The cover sheet — on test in Conman and Andalusia (2026-09-26) before it goes
 * to the other eight. The border is the album cover's own white frame instead
 * of paper, the margin is 90 tall instead of 200, and the lyric is one row in
 * the cover's sea darkened to near-navy, with no signature. The plate takes the
 * height the margin gave up, so a film on this sheet reads its plate from here,
 * never from SHEET. It opens on black (`opening`, below).
 *
 * Chosen over black, the cover's slate sea, a near-navy and a sky-to-sea
 * gradient, each tried as a border on both films.
 */
export const COVER_WHITE = '#f4f5f9'
export const COVER_NAVY = '#2a343f'
export const COVER_SHEET = {
  plate: { x: 34, y: 34, w: 1532, h: 776 },
  margin: { x: 34, y: 810, w: 1532, h: 90 },
  lyricY: 855,
  cover: true,
  border: COVER_WHITE,
  /** The lyric's ink, and its largest and smallest size for one row. */
  lyric: COVER_NAVY,
  cap: 33,
  floor: 22.5,
  /** The size of two rows, when a line has to break, and of the edition number. */
  small: 20,
  edition: 18,
  measure: 1440,
}

/** The paper and the plate mark. Draw first; the film's plate goes on top, clipped to `plateClip`. */
export function paper(sheet = SHEET) {
  if (sheet.cover) return rect(0, 0, 1600, 900, sheet.border)
  const { x, y, w, h } = sheet.plate
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
export function lyricMargin({ line, opacity = 1, fill = INK, cap = 92, sheet = SHEET }) {
  if (!line || opacity <= 0.001) return ''
  if (sheet.cover) return lyricRow({ text: line.text, opacity, fill, sheet })
  const oneSize = Math.min(cap, MEASURE / Math.max(advance(line.text), 0.001))
  const rows = oneSize >= 70 ? [line.text] : splitLine(line.text, 0)
  const size = rows.length === 1 ? oneSize : Math.min(66, ...rows.map((row) => MEASURE / Math.max(advance(row), 0.001)))
  const lead = size * 1.08
  const top = SHEET.lyricY - ((rows.length - 1) * lead) / 2 + size * 0.36
  return `<g opacity="${r(opacity, 3)}">${rows.map((row, i) =>
    t({ x: 800, y: top + i * lead, size, text: row, fill, anchor: 'middle', weight: 700 }),
  ).join('')}</g>`
}

/** The size a line is set at on the cover sheet's one row. */
export const rowSize = (text, sheet = COVER_SHEET) => Math.min(sheet.cap, sheet.measure / Math.max(advance(text), 0.001))

/*
 * One line on the cover sheet: one row, sized to the measure and capped. A line
 * that would go under `floor` breaks into two rows, which the thin margin only
 * has room for small; Conman never needs it (its longest line sets at 25).
 */
function lyricRow({ text, opacity, fill, sheet }) {
  const one = rowSize(text, sheet)
  const rows = one >= sheet.floor ? [text] : splitLine(text, 0)
  const size = rows.length === 1 ? one : Math.min(sheet.small, ...rows.map((row) => sheet.measure / Math.max(advance(row), 0.001)))
  const lead = size * 1.08
  const top = sheet.lyricY - ((rows.length - 1) * lead) / 2 + size * 0.36
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
export function marginLyric({ now, score, uid = '', sheet = SHEET, fill = sheet.lyric ?? INK, skip = null }) {
  let out = ''
  for (const line of score.lines) {
    if (skip && skip(line)) continue
    const span = lineSpan(score, line)
    if (now < span.inStart || now >= span.outEnd) continue
    const opacity = Math.min(easeOut(ramp(now, span.inStart, span.inEnd)), 1 - easeInOut(ramp(now, span.outStart, span.outEnd)))
    out += lyricMargin({ line, opacity, fill, sheet })
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
export function titleCard({ title, track, of = 10, opacity = 1, sheet = SHEET }) {
  // On the cover sheet: the title at the lyric's size in its ink, where the
  // first line takes over from it, the edition number pencilled at the left in
  // the same ink let down, and no signature. (Its films open with `opening`.)
  if (sheet.cover) {
    const size = rowSize(title, sheet)
    return `<g opacity="${r(opacity, 3)}">
    ${t({ x: 800, y: sheet.lyricY + size * 0.36, size, text: title, fill: sheet.lyric, anchor: 'middle', weight: 700 })}
    ${edition({ track, of, sheet })}
  </g>`
  }
  const pencil = '#6f675b'
  // The title may not reach the signature: it is centred, so its measure is
  // twice the room between the middle of the sheet and the signature's left
  // edge, less a gap. A long title ("Goodbye, Norma Jeane") set to the full
  // 1000 ran into it; short ones are capped at 96 long before this binds.
  const signature = advance('Havre De Grace', 26, 6)
  const room = 2 * (1530 - signature - 800) - 80
  const size = Math.min(96, Math.min(1000, room) / Math.max(advance(title), 0.001))
  return `<g opacity="${r(opacity, 3)}">
    ${t({ x: 800, y: SHEET.lyricY + size * 0.36, size, text: title, fill: INK, anchor: 'middle', weight: 700 })}
    ${t({ x: 70, y: SHEET.lyricY + 12, size: 30, text: `${track}/${of}`, fill: pencil, weight: 400, upper: false })}
    ${t({ x: 1530, y: SHEET.lyricY + 12, size: 26, text: 'Havre De Grace', fill: RED, anchor: 'end', weight: 600, tracking: 6 })}
  </g>`
}

/** The edition number, pencilled at the left of the cover sheet's margin in the lyric's ink let down. */
function edition({ track, of = 10, sheet = COVER_SHEET, opacity = 1 }) {
  return t({ x: 70, y: sheet.lyricY + sheet.edition * 0.36, size: sheet.edition, text: `${track}/${of}`, fill: sheet.lyric, weight: 400, upper: false, opacity: 0.55 * opacity })
}

/*
 * The opening — the cover sheet's, first made for Conman. The whole frame is
 * black and the title comes up big in the middle in the cover's white,
 * letter-spaced. It drops into the margin at the lyric's size, where the first
 * line will take over from it; then the black draws in from the edges to the
 * plate, uncovering the white border, and the title turns navy where the black
 * has left it. Then the edition number is pencilled in, and the black lifts off
 * the plate over `lift` to show the film already moving.
 *
 * Drawn last, over the plate and the margin. `out` is when the title leaves.
 */
export const OPENING = { in: [0.2, 1.0], drop: [3.4, 4.8], frame: [4.6, 6.0], marks: [5.8, 6.4] }

/* The title's opening size: big, but inside the frame with its opening
 * letter-spacing — "Ship to Stockholm" at 230 ran off both sides. */
const titleSize0 = (title) => Math.min(230, (1520 - advance(title, 0, 18)) / Math.max(advance(title), 0.001))

export function opening({ now, title, track, of = 10, out, lift = [6.0, 6.2], uid, sheet = COVER_SHEET, intro = null }) {
  if (intro) return portholeOpening({ now, title, uid, sheet, intro })
  const T = OPENING
  const size1 = rowSize(title, sheet)
  const size0 = titleSize0(title)
  const d = easeCamera(ramp(now, T.drop[0], T.drop[1]))
  const size = Math.exp(lerp(Math.log(size0), Math.log(size1), d))
  const y = lerp(450 + size0 * 0.36, sheet.lyricY + size1 * 0.36, d)
  const gone = ramp(now, out[0], out[1])
  const fade = Math.min(easeOut(ramp(now, T.in[0], T.in[1])), 1 - gone)
  const marks = Math.min(easeOut(ramp(now, T.marks[0], T.marks[1])), 1 - gone)
  const tracking = lerp(18, 0, easeOut(ramp(now, T.in[0], T.drop[1])))
  // The black, drawing in from the whole frame to the plate, then lifting off it.
  const f = easeCamera(ramp(now, T.frame[0], T.frame[1]))
  const black = 1 - easeCamera(ramp(now, lift[0], lift[1]))
  const { x, y: py, w, h } = sheet.plate
  const box = [lerp(0, x, f), lerp(0, py, f), lerp(1600, w, f), lerp(900, h, f)].map((v) => r(v, 2))
  const word = (fill) => t({ x: 800, y, size, text: title, fill, anchor: 'middle', weight: 700, tracking })
  let svg = ''
  if (black > 0.001) svg += `<rect x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}" fill="${INK}" opacity="${r(black, 3)}"/>`
  if (fade > 0.001) {
    const id = `${uid}-open`
    svg += `<clipPath id="${id}"><rect x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}"/></clipPath>` +
      `<g opacity="${r(fade, 3)}">${f > 0 ? word(sheet.lyric) : ''}<g clip-path="url(#${id})">${word(sheet.border)}</g></g>`
  }
  if (marks > 0.001) svg += edition({ track, of, sheet, opacity: marks })
  return svg
}

/*
 * The porthole openings — for the long intros (on test on Andalusia and
 * decided 2026-09-26). The title comes up big on black as above, but does not
 * drop to the margin: it leaves, the band's mark comes on in its place and
 * holds, and then the camera dives into the anchor's ring and the ring is a
 * porthole that opens onto the film, its white rim becoming the border. The
 * margin is empty until the first line. The dive is the common thread; how the
 * title leaves and the mark arrives is the song's:
 *
 *   'stamp'  Hard. The mark is stamped down on the title with a thump and a
 *            spray of ink, and the title's letters are knocked flying. Kept
 *            for Conman, Goodbye, Norma Jeane and New York (over the title's
 *            letters sinking one by one before the stamp, and the title
 *            swirled down into the ring).
 *   'draw'   Soft. The letters breathe apart and fade from the ends in; after
 *            a breath of black the anchor is traced on in line, inside its own
 *            shapes so the line is never bigger than the mark, and fills, and
 *            the letters come up beneath it. Andalusia's.

 * Also tried for Andalusia and put aside: the title racked out of focus and
 * the mark into it, and the title sinking on a slow swell with the mark
 * floating up out of it.
 *
 * Each has its own clock: `title` the title coming up, `out` it leaving, `in`
 * the mark arriving (complete at its end), `dive` the camera through the ring.
 */
const STAMP_CLOCK = { title: [0.2, 1.0], hit: 4.82, dive: [7.6, 9.3] }
/*
 * Andalusia's, tuned with the person watching (2026-09-26), who found every
 * step a touch quick: the title up a quarter-second later than the other
 * openings (0.45 s) and gone by 4.65 s; 0.65 s of black; the anchor traced
 * over 2.775 s from 5.3 s and filled from 6.49 s, complete at 8.475 s (chosen
 * over 2.65 s and 2.9 s); half a second on the finished mark; a 1.95 s dive.
 */
const DRAW_CLOCK = { title: [0.45, 1.25], out: [3.25, 4.65], in: [5.3, 8.475], trace: 2.775, fillFrom: 6.4875, dive: [8.975, 10.925] }
/** The drawing on its own, from its first line: traced, filled from 1.19 s, complete at 3.175 s. */
export const MARK_DRAW = { trace: DRAW_CLOCK.trace, fillFrom: DRAW_CLOCK.fillFrom - DRAW_CLOCK.in[0], done: DRAW_CLOCK.in[1] - DRAW_CLOCK.in[0] }
const clockFor = (intro) => (intro === 'stamp' ? STAMP_CLOCK : DRAW_CLOCK)

/* The lockup (public/logos/suite/a4-lockup-stacked.svg), in the file's units. */
const LOCKUP = {
  cx: 425,
  cy: 275.5,
  /** The anchor's ring: its centre and inner radius, in lockup units. */
  ring: { x: 425.02, y: 31.97, r: 23.1 },
  /** The anchor's crown, where it lands. */
  crown: { x: 425, y: 364 },
  anchor: '<circle cx="100" cy="26" r="18" fill="none" stroke="currentColor" stroke-width="10"/><path d="M92.4 40h15.2l-1.8 173h-11.6Z"/><path d="M42 72h116v15H42Z"/><circle cx="42" cy="79.5" r="8.5"/><circle cx="158" cy="79.5" r="8.5"/><path d="M24 134A76 88 0 0 0 176 134L184 102L161 134A61 73 0 0 1 39 134L16 102Z"/>',
  letters: [
    ['M6.5 0V100M61.5 0V100M6.5 50H61.5', 0],
    ['M2 100L32.5 4.5L39.5 4.5L70 100M9.665 76H62.335', 94],
    ['M2 0L32.5 96.5L39.5 96.5L70 0', 192],
    ['M6.5 0V100M6.5 6.5H37.5a22 22 0 0 1 0 44H6.5M28 50.5L59.5 100', 290],
    ['M6.5 0V100M6.5 6.5H51.5M6.5 50H48M6.5 93.5H51.5', 382],
    ['M6.5 0V100M6.5 6.5H29.5A34 34 0 0 1 63.5 40.5V59.5A34 34 0 0 1 29.5 93.5H6.5', 516],
    ['M6.5 0V100M6.5 6.5H51.5M6.5 50H48M6.5 93.5H51.5', 612],
    ['M69.408 31.616A33 43.5 0 1 0 68.079 71.75V50H43.5', 746],
    ['M6.5 0V100M6.5 6.5H37.5a22 22 0 0 1 0 44H6.5M28 50.5L59.5 100', 847],
    ['M2 100L32.5 4.5L39.5 4.5L70 100M9.665 76H62.335', 939],
    ['M70.097 33.705A33 43.5 0 1 0 70.097 66.295', 1037],
    ['M6.5 0V100M6.5 6.5H51.5M6.5 50H48M6.5 93.5H51.5', 1138],
  ],
}
const FULL = 'M0 0H1600V900H0Z'
/* Where the mark sits: in the middle of the black, a little high. */
const LOGO_AT = { x: 800, y: 400, s: 0.56 }

/*
 * The anchor's parts as outlines, for drawing it on: `pathLength` on each, so
 * one dash draws any of them. The ring is two circles, its outer and inner
 * edges. The line is clipped to the anchor's own shapes (ANCHOR_SHAPE), so it
 * sits inside the edge the fill will have and the mark does not shrink when
 * the fill takes over.
 */
const ANCHOR_LINES = LOCKUP.anchor
  .replace(/<circle cx="100" cy="26" r="18"[^>]*\/>/, '<circle cx="100" cy="26" r="23"/><circle cx="100" cy="26" r="13"/>')
  .replace(/\/>/g, ' pathLength="1"/>')
const ANCHOR_SHAPE = LOCKUP.anchor
  .replace(/<circle cx="100" cy="26" r="18"[^>]*\/>/, '<path d="M77 26a23 23 0 1 0 46 0a23 23 0 1 0 -46 0ZM87 26a13 13 0 1 0 26 0a13 13 0 1 0 -26 0Z" clip-rule="evenodd"/>')

/**
 * The mark, drawn at screen (x, y) for its centre, at scale s and rotation
 * rot. `draw` (0–1) traces the anchor's outline and brings the letters up; `fill`
 * (0–1) fills the anchor in behind its outline.
 */
function lockup({ x, y, s, colour, rot = 0, extra = '', opacity = 1, draw = 1, fill = 1, uid = '' }) {
  if (opacity <= 0.001) return ''
  // The letters come up one after another, left to right, behind the anchor's line.
  const letters = LOCKUP.letters.map(([d, lx], i) => {
    const k = draw >= 0.999 ? 1 : easeInOut(clamp01((draw - 0.25 - i * 0.04) / 0.22))
    return k > 0.001 ? `<path d="${d}" transform="translate(${lx} 0)"${op(k)}/>` : ''
  }).join('')
  let anchor = ''
  if (fill > 0.001) anchor += `<g fill="currentColor" opacity="${r(fill, 3)}">${LOCKUP.anchor}</g>`
  if (draw < 0.999 || fill < 0.999) {
    const k = clamp01(draw * 1.4)
    const id = `${uid}-aclip`
    anchor += `<clipPath id="${id}">${ANCHOR_SHAPE}</clipPath><g clip-path="url(#${id})" fill="none" stroke="currentColor" stroke-width="5" stroke-dasharray="1 1" stroke-dashoffset="${r(1 - k, 4)}">${ANCHOR_LINES}</g>`
  }
  return `<g transform="translate(${r(x, 2)} ${r(y, 2)}) rotate(${r(rot, 2)}) scale(${r(s, 4)}) translate(${-LOCKUP.cx} ${-LOCKUP.cy})" style="color:${colour}"${op(opacity)}>` +
    `<g transform="translate(275.841 0) scale(1.776) translate(-16 -8)">${anchor}</g>` +
    `<g transform="translate(0 480) scale(0.711)" fill="none" stroke="currentColor" stroke-width="13" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="6">${letters}</g>${extra}</g>`
}
const op = (o) => (o < 0.999 ? ` opacity="${r(Math.max(0, o), 3)}"` : '')

/**
 * The mark being drawn on, `t` seconds into the drawing, in the lockup file's
 * own units (viewBox -34 -34 918 619.07), in currentColor. Andalusia's
 * opening draws it this way, and the site's splash screen runs the same
 * function so the two cannot drift apart.
 */
export function markDrawnAt(t, uid = 'mark') {
  return lockup({
    x: LOCKUP.cx,
    y: LOCKUP.cy,
    s: 1,
    colour: 'currentColor',
    draw: easeInOut(ramp(t, 0, MARK_DRAW.trace)),
    fill: easeInOut(ramp(t, MARK_DRAW.fillFrom, MARK_DRAW.done)),
    opacity: easeOut(ramp(t, 0, 0.3)),
    uid,
  })
}

/* A lockup point (lx, ly) on screen, for a lockup drawn at x, y, s. */
const onScreen = (lx, ly, { x, y, s }) => [x + (lx - LOCKUP.cx) * s, y + (ly - LOCKUP.cy) * s]

/* Pseudo-random but fixed: the ink spray and the letters. */
const jitter = (i, k) => {
  const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453
  return v - Math.floor(v)
}

/*
 * How the mark arrives, before the dive: { s, rot, dx, dy, opacity, draw,
 * fill, extra } — scale relative to LOGO_AT, and screen offsets.
 */
function markPose(intro, now, C) {
  if (intro === 'stamp') {
    const hit = C.hit
    const u = ramp(now, hit - 0.22, hit)
    const a = now - hit
    if (a <= 0) return { s: lerp(2.5, 1, u * u), rot: lerp(-11, -3, u), opacity: u > 0 ? 1 : 0 }
    // The ink that spatters off it on the hit.
    let spray = ''
    if (a < 0.8) {
      for (let i = 0; i < 16; i++) {
        const th = (i / 16) * Math.PI * 2 + jitter(i, 1) * 0.3
        const d = 330 + jitter(i, 2) * 60 + (120 + jitter(i, 3) * 140) * easeOut(a / 0.8)
        const rad = lerp(9, 3, a / 0.8) * (0.6 + jitter(i, 4))
        spray += `<circle cx="${r(LOCKUP.cx + Math.cos(th) * d * 1.3, 1)}" cy="${r(LOCKUP.cy + Math.sin(th) * d * 0.9, 1)}" r="${r(rad, 1)}" fill="currentColor" opacity="${r(1 - a / 0.8, 3)}"/>`
      }
    }
    return {
      s: 1 - 0.05 * Math.exp(-a / 0.1),
      rot: -3 * Math.exp(-a / 0.3) * Math.cos((2 * Math.PI * a) / 0.55),
      dx: 9 * Math.exp(-a / 0.12) * Math.sin(a * 80),
      extra: spray,
    }
  }
  // 'draw': traced over its first 2.4 s, filled from 1.0 s in to the end. At
  // the mark's own size throughout: any growth reads as a jump when it lands.
  return { draw: easeInOut(ramp(now, C.in[0], C.in[0] + C.trace)), fill: easeInOut(ramp(now, C.fillFrom, C.in[1])), opacity: easeOut(ramp(now, C.in[0], C.in[0] + 0.3)) }
}

/*
 * The mark and the dive: { logo, black }, `black` the path (even-odd) of the
 * black that is left — the whole frame, then the frame with the ring cut out
 * of it, then nothing.
 */
function portholeTurn(intro, now, colour, uid, C) {
  const L = LOGO_AT
  const pose = { s: 1, rot: 0, dx: 0, dy: 0, opacity: 1, draw: 1, fill: 1, extra: '', ...markPose(intro, now, C) }
  // Through the ring: the zoom is about the ring, which drifts to the plate's
  // centre, until its inner edge is past every corner of the frame.
  const dive = ramp(now, C.dive[0], C.dive[1])
  const z = Math.exp(Math.log(100) * dive * dive)
  const [rx0, ry0] = onScreen(LOCKUP.ring.x, LOCKUP.ring.y, { ...L, s: L.s * pose.s })
  const rxs = lerp(rx0 + pose.dx, 800, easeInOut(dive))
  const rys = lerp(ry0 + pose.dy, 422, easeInOut(dive))
  const sc = L.s * pose.s * z
  const cx = rxs - (LOCKUP.ring.x - LOCKUP.cx) * sc
  const cy = rys - (LOCKUP.ring.y - LOCKUP.cy) * sc
  const hole = dive > 0 ? LOCKUP.ring.r * sc : 0
  const black = hole > 0
    ? `${FULL} M${r(rxs - hole, 1)} ${r(rys, 1)}a${r(hole, 1)} ${r(hole, 1)} 0 1 0 ${r(2 * hole, 1)} 0a${r(hole, 1)} ${r(hole, 1)} 0 1 0 ${r(-2 * hole, 1)} 0Z`
    : FULL
  if (hole > 1000) return { logo: '', black: '' }
  return {
    logo: lockup({ x: cx, y: cy, s: sc, colour, rot: pose.rot * (1 - dive), opacity: pose.opacity, draw: pose.draw, fill: pose.fill, extra: pose.extra, uid }),
    black,
  }
}

/* The title's letters, laid out as `t` would set the word centred at 800. */
function titleLetters(title, size, tracking) {
  const text = String(title).toUpperCase()
  let x = 800 - advance(text, size, tracking) / 2 + tracking / 2
  return [...text].map((ch, i) => {
    const w = advance(ch, size, tracking)
    const out = { ch, i, x: x + w / 2 - tracking / 2 }
    x += w
    return out
  }).filter((l) => l.ch.trim())
}

/* How the title leaves: its letters, each at (x, y, rot, opacity). */
function titleExit(intro, now, title, size, colour, C) {
  const on = easeOut(ramp(now, C.title[0], C.title[1]))
  const y = 450 + size * 0.36
  const letter = (l, x, yy, rot, k) => (k > 0.001
    ? t({ x, y: yy, size, text: l.ch, fill: colour, anchor: 'middle', weight: 700, opacity: k, transform: rot ? `rotate(${r(rot, 1)} ${r(x, 1)} ${r(yy - size * 0.36, 1)})` : null })
    : '')
  if (intro === 'stamp') {
    // Held until the stamp lands on it, then knocked flying outwards and down, spinning.
    const hit = C.hit
    const tracking = lerp(18, 4, easeOut(ramp(now, C.title[0], hit)))
    const a = now - hit
    if (a >= 1.2) return ''
    let svg = ''
    for (const l of titleLetters(title, size, tracking)) {
      if (a <= 0) {
        svg += letter(l, l.x, y, 0, on)
        continue
      }
      const vx = ((l.x - 800) / 400) * 900 + (jitter(l.i, 5) - 0.5) * 500
      const vy = -500 - jitter(l.i, 6) * 700
      const rot = (jitter(l.i, 7) - 0.5) * 900 * a
      svg += letter(l, l.x + vx * a, y + vy * a + 0.5 * 2600 * a * a, rot, 1 - ramp(a, 0.5, 1.1))
    }
    return svg
  }
  // 'draw': breathing out, the letters drift apart and fade from both ends in.
  const u = ramp(now, C.out[0], C.out[1])
  if (u >= 1) return ''
  const tracking = lerp(18, 6, easeOut(ramp(now, C.title[0], C.out[0])))
  const list = titleLetters(title, size, tracking)
  const mid = (list.length - 1) / 2
  let svg = ''
  for (const [n, l] of list.entries()) {
    const edge = 1 - Math.abs(n - mid) / Math.max(mid, 1) // 0 at the ends, 1 in the middle
    const k = 1 - easeInOut(clamp01((u - edge * 0.35) / 0.65))
    const x = l.x + (l.x - 800) * 0.18 * easeInOut(u)
    svg += letter(l, x, y - 12 * easeInOut(u), 0, on * k)
  }
  return svg
}

function portholeOpening({ now, title, uid, sheet, intro }) {
  const C = clockFor(intro)
  const colour = sheet.border
  const words = titleExit(intro, now, title, titleSize0(title), colour, C)
  const turn = portholeTurn(intro, now, colour, uid, C)
  let svg = ''
  if (turn.black) svg += `<path d="${turn.black}" fill="${INK}" fill-rule="evenodd"/>`
  // Letters knocked off by the stamp fly over it; otherwise the title is gone first.
  return svg + (intro === 'stamp' ? turn.logo + words : words + turn.logo)
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
