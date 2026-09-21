/*
 * Setting a sung line as type, without a designer in the loop.
 *
 * Thirty-one lines of lyric, each a different length, each on screen for two to
 * five seconds: laying them out by hand would be thirty-one layouts to maintain
 * and thirty-one things to redo when a word moves. So the film composes each
 * line from its own text, and the rules below are the whole design:
 *
 *   1. Break where the singer breathes. A comma is a rest, so "The only one I
 *      want, my love, is you" sets as three rows rather than one justified
 *      block. This single rule does most of the work.
 *   2. Then break on width, greedily, to a budget — which is what stops "Oh, I
 *      think that I could live in Andalusia" becoming one unreadable strip.
 *   3. Size each row against its own length. A row is stretched to the column,
 *      so its size has to come down as it gets longer or the glyphs would be
 *      squeezed into each other; the useful side effect is hierarchy for free,
 *      because the short rows come out big.
 *   4. The last row is the landing, and gets a higher ceiling than the rest.
 *      That is why every line in this film ends on a word held large —
 *      ANDALUSIA, THROUGH, DIEGO, ROUGE, YOU.
 *
 * Positions are measured in *units* rather than characters: one unit is the
 * width of a capital A, and the table below says how wide each letter is
 * relative to that. A character count would have been simpler — the first cut
 * of this used one — but then the wipe that reveals a line drifts against the
 * glyphs, because an I is a third of a W, and the word being coloured ends up
 * half a letter out. Weighting the letters costs one lookup per character and
 * keeps everything geometric, which matters because this page is
 * server-rendered: measuring real glyphs would need a DOM read before the first
 * frame could be right, and a webfont that has not landed yet measures wrong
 * anyway.
 */

import type { ScoreLine, ScoreWord } from '~/config/andalusiaScore'

export interface LayoutWord {
  t: number
  text: string
  /** Where this word starts, in units from the left of its row. */
  from: number
  /** Where it ends. */
  to: number
}

export interface LayoutRow {
  key: string
  text: string
  /** Total width of the row in units — the denominator for every reveal. */
  units: number
  /** Set at its natural width rather than stretched to the column. */
  loose: boolean
  /** Baseline, in the 1600x900 frame. */
  y: number
  size: number
  /** Left edge, and the width the row is set to. */
  x: number
  width: number
  /** The last row of the line: the word the line lands on. */
  landing: boolean
  /** Onset of this row's first word. */
  at: number
  words: LayoutWord[]
}

export interface LineLayout {
  rows: LayoutRow[]
  at: number
  until: number
}

export interface LayoutOptions {
  /** Units per row before a break is forced. */
  budget?: number
  maxRows?: number
  /** Vertical band the block is centred in. */
  top?: number
  bottom?: number
  bodySize?: number
  landingSize?: number
  /** The widest a row may be. In stretched mode, the width it is set to. */
  maxWidth?: number
  /** Left edge of the column (stretched), or the centre line (natural). */
  x?: number
  /**
   * Natural sets each row at the width its own letters want, centred on `x` —
   * for the quiet verse, where full-bleed would be shouting. Stretched (the
   * default) sets every row to the column, which is the look of this film.
   */
  natural?: boolean
  /** Extra leading between rows, as a fraction of row size. */
  leading?: number
  /**
   * Rows narrower than this are set at their natural width instead of being
   * stretched. Two letters spread across the whole frame read as a fault
   * rather than as tracking.
   */
  stretchMin?: number
}

/**
 * Width per letter, in units, where one unit is a capital A.
 *
 * Measured, not guessed: each of these is `getComputedTextLength()` on a single
 * glyph of Jost at weight 700, divided by the width of an A. The first cut of
 * this file estimated them, and estimating them is exactly how you end up with
 * "OH" set 20% narrower than the letters need and the O and the H sitting on
 * top of each other — `textLength` does what it is told, and what it is told
 * here is arithmetic.
 *
 * Anything not listed is close enough to an A not to be worth a row.
 */
const WIDTHS: Record<string, number> = {
  'I': 0.37,
  'J': 0.45,
  'L': 0.68,
  'T': 0.70,
  'F': 0.72,
  'E': 0.83,
  'S': 0.83,
  'Z': 0.87,
  'U': 0.95,
  'X': 0.95,
  'Y': 0.95,
  'P': 0.95,
  'D': 1.03,
  'H': 1.08,
  'C': 1.10,
  'G': 1.15,
  'N': 1.17,
  'O': 1.20,
  'Q': 1.20,
  'M': 1.23,
  'W': 1.50,
  ' ': 0.45,
  '\'': 0.25,
  '\u2019': 0.25,
}

const SPACE = 0.45

/**
 * Width of one unit, per point of font size — an A in Jost 700 is 0.66 em.
 * Together with the table above this predicts a set row to within about 2% of
 * what the browser measures, which is the accuracy the wipe needs.
 */
const ADVANCE = 0.66

const unitsOf = (text: string): number => {
  let out = 0
  for (const character of text.toUpperCase()) out += WIDTHS[character] ?? 0.95
  return out
}

/**
 * The word as it is set: punctuation breaks the line, then stops existing.
 *
 * A comma is a rest, and the rest is already said by the row break — left in
 * the type it becomes a stray mark at the far end of a stretched row, which is
 * what "OH ," looked like in the first cut. Apostrophes stay, because "DOESNT"
 * is a different word.
 */
export const setAs = (text: string): string => text.replace(/[,.;:!?—]+$/, '')

const groupByPunctuation = (words: ScoreWord[]): ScoreWord[][] => {
  const groups: ScoreWord[][] = [[]]
  words.forEach((word, index) => {
    groups[groups.length - 1]!.push(word)
    if (/[,;:—]$/.test(word.text) && index < words.length - 1) groups.push([])
  })
  return groups.filter((group) => group.length > 0)
}

const widthOf = (words: ScoreWord[]) =>
  words.reduce((sum, word, index) => sum + unitsOf(setAs(word.text)) + (index ? SPACE : 0), 0)

/** Greedy word wrap to a width budget, in units. */
const wrap = (words: ScoreWord[], budget: number): ScoreWord[][] => {
  const rows: ScoreWord[][] = [[]]
  for (const word of words) {
    const current = rows[rows.length - 1]!
    if (current.length && widthOf([...current, word]) > budget) rows.push([word])
    else current.push(word)
  }
  return rows
}

/** Merge the narrowest neighbouring pair until the row count fits. */
const collapse = (rows: ScoreWord[][], maxRows: number): ScoreWord[][] => {
  const out = rows.map((row) => [...row])
  while (out.length > maxRows) {
    let bestAt = 0
    let bestWidth = Infinity
    for (let i = 0; i < out.length - 1; i++) {
      const merged = widthOf([...out[i]!, ...out[i + 1]!])
      if (merged < bestWidth) { bestWidth = merged; bestAt = i }
    }
    out.splice(bestAt, 2, [...out[bestAt]!, ...out[bestAt + 1]!])
  }
  return out
}

export const layoutLine = (line: ScoreLine, options: LayoutOptions = {}): LineLayout => {
  const {
    budget = 14,
    maxRows = 4,
    top = 150,
    bottom = 800,
    bodySize = 186,
    landingSize = 300,
    maxWidth = 1440,
    x = 80,
    natural = false,
    leading = 0.06,
    stretchMin = 7,
  } = options

  const grouped = groupByPunctuation(line.words).flatMap((group) => wrap(group, budget))
  const rows = collapse(grouped, maxRows)

  const sized = rows.map((words, index) => {
    const units = widthOf(words)
    const landing = index === rows.length - 1
    // The size at which this row's natural width *is* the column. Anything
    // bigger and `textLength` would have to pull the letters together.
    const fit = maxWidth / (ADVANCE * Math.max(units, 0.5))
    const size = Math.max(42, Math.min(fit, landing ? landingSize : bodySize))
    const loose = natural || units < stretchMin
    const rowWidth = loose ? Math.round(units * ADVANCE * size) : maxWidth

    let cursor = 0
    const laid: LayoutWord[] = words.map((word, wordIndex) => {
      const text = setAs(word.text)
      const from = cursor + (wordIndex ? SPACE : 0)
      const to = from + unitsOf(text)
      cursor = to
      return { t: word.t, text, from, to }
    })

    return {
      key: `${line.index}-${index}`,
      text: words.map((word) => setAs(word.text)).join(' '),
      units,
      loose,
      size,
      x: natural ? Math.round(x - rowWidth / 2) : x,
      width: rowWidth,
      landing,
      at: words[0]!.t,
      words: laid,
      y: 0,
    }
  })

  /*
   * Fit the block to the band, then centre it.
   *
   * Row sizes are decided one row at a time against the column, so a four-row
   * line can easily want more height than the frame has — the first cut of this
   * film had the long lines running off the top and bottom edges. Scaling every
   * row by the same factor keeps the hierarchy the letters produced and loses
   * only absolute size.
   */
  const band = bottom - top
  const wanted = sized.reduce((sum, row) => sum + row.size * (1 + leading), 0)
  if (wanted > band) {
    const shrink = band / wanted
    for (const row of sized) {
      row.size = Math.round(row.size * shrink)
      if (row.loose) {
        row.width = Math.round(row.units * ADVANCE * row.size)
        if (natural) row.x = Math.round(x - row.width / 2)
      }
    }
  }

  // Stack on baselines, so each row's own size decides the space it takes.
  const height = sized.reduce((sum, row) => sum + row.size * (1 + leading), 0)
  let cursor = (top + bottom) / 2 - height / 2
  for (const row of sized) {
    cursor += row.size * (1 + leading)
    row.y = Math.round(cursor - row.size * 0.16)
  }

  return { rows: sized, at: line.start, until: line.end }
}

/**
 * How much of a row is on screen at `t`, 0–1 of its width.
 *
 * A word arrives as a hard edge that takes two frames to cross itself — a cut
 * on the beat reads as rhythm, where a fade on the beat reads as a mistake.
 */
export const rowReveal = (row: LayoutRow, t: number, snap = 0.07): number => {
  let out = 0
  for (const word of row.words) {
    if (t < word.t) break
    const within = snap > 0 ? Math.min(1, (t - word.t) / snap) : 1
    out = Math.max(out, (word.from + (word.to - word.from) * within) / row.units)
  }
  return out
}

/**
 * The word of this row being sung at `t` — the one the film colours — as a span
 * of the row's width, or null when the row is between words.
 *
 * On and off, with no fade: there is exactly one coloured word at a time, which
 * is a decision and reads as one. Fading it out instead leaves a half-tinted
 * word on screen, which reads as a rendering fault.
 *
 * The span is widened by a third of a space at each end, because the letter
 * positions here are modelled rather than measured and the edge can be a few
 * pixels out — the whitespace either side of a word is where that cannot be
 * seen.
 */
export const rowWordSpan = (
  row: LayoutRow,
  t: number,
  hold = 0.5,
): { from: number, to: number } | null => {
  for (let index = row.words.length - 1; index >= 0; index--) {
    const word = row.words[index]!
    if (word.t > t) continue
    const next = row.words[index + 1]
    const until = next ? next.t : word.t + hold
    if (t >= until) return null
    const bleed = SPACE / 3
    return {
      from: Math.max(0, word.from - bleed) / row.units,
      to: Math.min(row.units, word.to + bleed) / row.units,
    }
  }
  return null
}
