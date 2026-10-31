/*
 * Visualizer concepts — the shared frame every mock-up is drawn on.
 *
 * The brief (2026-10-31): the album moves from films with a story to
 * visualizers, after Andalusia — one simple graphic system per song, carrying
 * its core idea, moving with the record and never cutting. Each song's module
 * in this folder offers about five of them as CONCEPTS; build.mjs samples a few
 * moments of each onto one review page.
 *
 * A concept's `frame({ time, score, uid })` returns only the plate: the SVG
 * that goes inside the cover sheet's plate (x 34, y 34, w 1532, h 776 of a
 * 1600 × 900 viewBox). `still()` below adds the paper, clips the plate and sets
 * the measured lyric in the margin with the album's own timing rule, so every
 * concept is judged on the sheet it would actually ship on.
 *
 * Same rules as a film module: a pure function of time, `rng(seed)` never
 * Math.random(), ids namespaced with `uid`. A concept that is chosen can then
 * grow into shared/video/films/ without being rewritten.
 */
import { COVER_SHEET, INK, PAPER, RED, PAPER_SHADE, SECOND_INK, paper, marginLyric } from '../../../shared/video/album.mjs'

export { COVER_SHEET, INK, PAPER, RED, PAPER_SHADE, SECOND_INK }

/** The plate, for drawing inside it. */
export const PLATE = COVER_SHEET.plate
/** Centre of the plate. */
export const CX = PLATE.x + PLATE.w / 2
export const CY = PLATE.y + PLATE.h / 2

/** The line in the margin at `time`: the last one begun, until its section ends. Null in a gap between sections. */
export const sungAt = (score, time) => {
  const line = score.lines.findLast((l) => l.start - 0.3 <= time)
  const section = line && score.sections.find((x) => x.id === line.section)
  return line && (!section || time < section.to) ? line : null
}

/** Every word sung up to `time`, flattened, with its line index. */
export const wordsUpTo = (score, time) =>
  score.lines.flatMap((l) => l.words.map((w) => ({ ...w, line: l.index }))).filter((w) => w.t <= time)

/** How far through the song, 0–1. */
export const songAt = (score, time) => Math.min(Math.max(time / score.duration, 0), 1)

/** One finished still: paper, plate (clipped), lyric in the margin. */
export function still(concept, { time, score, uid }) {
  const { x, y, w, h } = PLATE
  const clip = `${uid}-clip`
  const plate = concept.frame({ time, score, uid })
  return `<svg viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${concept.name}, ${fmt(time)}">
<defs><clipPath id="${clip}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs>
${paper(COVER_SHEET)}
<g clip-path="url(#${clip})">${plate}</g>
${marginLyric({ now: time, score, uid, sheet: COVER_SHEET })}
</svg>`
}

export const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
