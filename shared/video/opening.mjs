/*
 * The standard opening — the one Into the Wild's maze set and every film since
 * copies: the band's mark drawn on black, then the song's Hairline title drawn
 * on, then the black lifts off the film already under way.
 *
 * The older films (maze, marquee, blanks, conman, cartography) each carry their
 * own copy of this from before the file existed and are not to be touched;
 * films from 2026-11-10 on call this.
 *
 *   ${filmOpening({ time, uid, slug: 'ghost' })}   // drawn last, over everything
 *
 * `clock` defaults to the maze's (STANDARD_OPENING): the black is gone by 12 s.
 * A song whose first word comes sooner passes a shorter one (Ivory's is
 * { mark: 0.3, markOut: [3.9, 4.5], title: [4.6, 6.9], titleOut: [7.1, 7.7], reveal: [7.5, 8.9] }).
 */
import { r, ramp, easeInOut } from './kit.mjs'
import { INK, PAPER, markDrawnAt, MARK_DRAW } from './album.mjs'
import { drawLines } from './hairline-draw.mjs'
import { TITLES } from './titles.mjs'

export const STANDARD_OPENING = { mark: 0.5, markOut: [5.0, 5.7], title: [6.2, 8.9], reveal: [10.6, 12.0] }

/** True while the opening still covers any of the frame. */
export const inOpening = (time, clock = STANDARD_OPENING) => time < clock.reveal[1]

export function filmOpening({ time, uid, slug, clock = STANDARD_OPENING }) {
  const O = clock
  const black = 1 - ramp(time, ...O.reveal)
  if (black <= 0.001) return ''
  const markOn = 1 - ramp(time, ...O.markOut)
  const mark = time >= O.mark && markOn > 0.001
    ? `<g transform="translate(800 450) scale(${r(520 / 918, 5)}) translate(-459 -309.5)" style="color:${PAPER}" opacity="${r(easeInOut(markOn), 3)}">${markDrawnAt(Math.min(time - O.mark, MARK_DRAW.done), `${uid}-mark`)}</g>`
    : ''
  const titleOn = O.titleOut ? 1 - ramp(time, ...O.titleOut) : 1
  const lines = TITLES[slug]
  if (!lines) throw new Error(`opening: no baked title for "${slug}" (tools/video-styles/titles/bake.mjs)`)
  const title = time >= O.title[0] && titleOn > 0.001
    ? `<g opacity="${r(easeInOut(titleOn), 3)}">${drawLines(lines, easeInOut(ramp(time, ...O.title)), PAPER, `${uid}-title`)}</g>`
    : ''
  return `<g opacity="${r(easeInOut(black), 4)}"><rect width="1600" height="900" fill="${INK}"/>${mark}${title}</g>`
}
