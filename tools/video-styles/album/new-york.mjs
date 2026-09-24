/*
 * New York — the album still: a frame of the Letterpress film itself
 * (shared/video/films/letterpress.mjs), so the still and the film cannot
 * disagree. The hand-set still this replaced — a wood-type broadside that was
 * also a timetable, four NOs for a headline, New York struck through in red —
 * became the film's formula poster and its headline, and its wood type,
 * impression and rules are the film's.
 */
import { NEW_YORK_SCORE } from '../../../app/config/newYorkScore.ts'
import { letterpressFrame } from '../../../shared/video/films/letterpress.mjs'

/* "No, no, no, no": four NOs down on their yellow blocks, the formula in four parts in pieces under them, the red rule underlining. */
const HERO_AT = 111.5

export default {
  slug: 'new-york',
  hero: () => letterpressFrame({ time: HERO_AT, score: NEW_YORK_SCORE, uid: 'hero' }).svg,
}
