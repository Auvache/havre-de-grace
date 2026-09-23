/*
 * Into the Wild — the album still: a frame of the Relief film itself
 * (shared/video/films/relief.mjs), so the still and the film cannot disagree.
 */
import { INTO_THE_WILD_SCORE } from '../../../app/config/intoTheWildScore.ts'
import { reliefFrame } from '../../../shared/video/films/relief.mjs'

/* "Oh, I'm running": into the forest under the risen sun, the stage behind. */
const HERO_AT = 189.2

export default {
  slug: 'into-the-wild',
  hero: () => reliefFrame({ time: HERO_AT, score: INTO_THE_WILD_SCORE, uid: 'hero' }).svg,
}

export const extras = {
  'title-card': () => reliefFrame({ time: 6, score: INTO_THE_WILD_SCORE, uid: 'title' }).svg,
}
