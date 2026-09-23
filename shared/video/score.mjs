/*
 * Reading a score — the lookups every film needs and none of them should write
 * twice.
 *
 * A film takes its score by argument and never imports one, so these take it
 * by argument too. They were Cartography's private helpers first; that file
 * still carries its own copies, and new films use these.
 *
 * Nothing here is a style decision. How early a line comes on screen, where a
 * line breaks into rows and where the colour edge sits inside a row are all
 * facts about reading a lyric, and they were all found the hard way in
 * cartography.mjs — the comments that say why are kept with them.
 */
import { advance, clamp01, easeOut, lerp, ramp } from './kit.mjs'

export const sectionAt = (score, time) =>
  score.sections.find((s) => time >= s.from && time < s.to) ?? score.sections[score.sections.length - 1]

/** The line being sung at `time`, or the last one sung. */
export const lineAt = (score, time) => {
  let found = null
  for (const candidate of score.lines) {
    if (candidate.start > time + 0.001) break
    found = candidate
  }
  return found
}

/*
 * When a line comes on screen: a beat before its first word, so it is up and
 * readable as it is sung. Cut in exactly on the first word, a line is only half
 * in when that word lands, and every line reads as late. Never before the
 * previous line has finished being sung, nor before its own section.
 */
export const LEAD = 0.3
export const cutIn = (score, line, lead = LEAD) => {
  const previous = score.lines[line.index - 1]
  const section = score.sections.find((x) => x.id === line.section)
  const floor = Math.max(previous ? previous.end : 0, section ? section.from : 0)
  return Math.min(line.start, Math.max(line.start - lead, floor))
}

/** The line on screen at `time`: like `lineAt`, but cut in early by `cutIn`. */
export const shownLineAt = (score, time, lead = LEAD) => {
  let found = null
  for (const candidate of score.lines) {
    if (cutIn(score, candidate, lead) > time + 0.001) break
    found = candidate
  }
  return found
}

/** The index of the last word sung by `time` inside `line`, or -1 before the first. */
export const wordIndexAt = (line, time) => {
  let index = -1
  line.words.forEach((word, i) => { if (time >= word.t) index = i })
  return index
}

/** 1 on a word's onset, ringing out over `halfLife`. The loudest of the line's words. */
export const wordHit = (line, time, halfLife = 0.16) =>
  line ? line.words.reduce((out, w) => Math.max(out, time < w.t ? 0 : Math.exp(-(time - w.t) / halfLife)), 0) : 0

/*
 * Split a line into the rows it wants: at its commas, or in half.
 *
 * "Oh, I'm headed out on an adventure" splits at its comma into one word and
 * six, which is a row of type and a row of shouting. A first part that short is
 * an interjection, not a half of the line.
 */
export function splitLine(text, maxOneRow = 6) {
  const parts = text.split(',').map((part) => part.trim()).filter(Boolean)
  if (parts.length >= 2 && parts[0].split(' ').length > 1) {
    return [parts[0] + ',', parts.slice(1).join(', ')]
  }
  const words = text.split(' ')
  if (words.length <= maxOneRow) return [text]
  const half = Math.ceil(words.length / 2)
  return [words.slice(0, half).join(' '), words.slice(half).join(' ')]
}

/**
 * Which of the line's measured words belong to which row — by position rather
 * than by text, because "the" appears three times in one line of this song.
 */
export function bankWords(line, rows) {
  let taken = 0
  return rows.map((row) => {
    const count = row.split(' ').length
    const slice = line.words.slice(taken, taken + count)
    taken += count
    return slice.length ? slice : [{ t: line.start, text: row }]
  })
}

/**
 * How far through a row the voice is, as a share of the row's own measure —
 * landing on word boundaries, and sweeping across the word being sung in the
 * 180 ms it takes to say it. Nobody sings half a word: taking the fraction of
 * words sung and splitting it by length put the edge at WALK UNTIL MY BOO|TS.
 */
export function throughRow(now, row, words) {
  const whole = Math.max(advance(row), 0.001)
  let cursor = 0
  let edge = 0
  words.forEach((word, index) => {
    const before = cursor
    cursor += advance(word.text)
    const after = cursor
    cursor += advance(' ')
    if (now < word.t) return
    const next = words[index + 1]
    const span = Math.min(0.18, Math.max((next?.t ?? word.t + 0.3) - word.t, 0.06))
    edge = lerp(before, after, easeOut(ramp(now, word.t, word.t + span)))
  })
  return clamp01(edge / whole)
}

/**
 * The size that sets `text` in Jost 700 caps to exactly `measure` with
 * `tracking` per glyph, capped. Solved rather than scaled, because tracking is
 * a flat number of units per glyph and does not shrink with the size.
 */
export function sizeToMeasure(text, measure, cap = 9999, tracking = 0) {
  const ems = advance(text, 1, 0)
  const glyphs = String(text).length
  return Math.min(cap, Math.max(1, (measure - tracking * glyphs) / Math.max(ems, 0.001)))
}
