/*
 * The shared ending — the same two screens at the end of every film.
 *
 * Not a style decision (see END_CARD in app/config/videoStyles.ts). The mark
 * alone on pure black from the score's `endCardAt`, hard cut, held three
 * seconds; then a hard cut to the credits on the same black. Cartography keeps
 * its own copy from before this file existed; films after it call this.
 */
import { rect, t, r } from './kit.mjs'

export const END_BLACK = '#000000'
export const END_INK = '#f4f6f7'

export const CREDITS = [
  'Words, voice and guitar — Stefan Auvache Bradley',
  'Mellophone, mix and production — Parker Holt',
]

/** `lockup` is the stacked mark as inline SVG, handed in by the caller — a film never reads a file. */
export function endCard({ now, from, lockup = '' }) {
  const credits = now >= from + 3
  const parts = [rect(0, 0, 1600, 900, END_BLACK)]
  if (!credits) {
    parts.push(`<g transform="translate(800 450) scale(${r(500 / 918, 5)}) translate(-459 -309.5)" style="color:${END_INK}">${lockup}</g>`)
  }
  else {
    const first = 450 - ((CREDITS.length - 1) * 62) / 2 + 34 * 0.34
    parts.push(CREDITS.map((credit, i) => t({
      x: 800, y: first + i * 62, size: 34, text: credit, fill: END_INK, anchor: 'middle', weight: 400, upper: false,
    })).join(''))
  }
  return { svg: parts.join('\n'), label: credits ? 'Credits' : 'Havre De Grace' }
}
