/*
 * Goodbye, Norma Jeane — the album still: a frame of the Screenprint film
 * itself (shared/video/films/screenprint.mjs), so the still and the film cannot
 * disagree. The hand-drawn still this replaced — the marquee, the diamond, the
 * reel and the telephone on one sheet — became the film's props.
 */
import { GOODBYE_NORMA_JEANE_SCORE } from '../../../app/config/goodbyeNormaJeaneScore.ts'
import { screenprintFrame } from '../../../shared/video/films/screenprint.mjs'

/* "Know you want the world, it's more, more, more": the wall pasted up, with the space left empty. */
const HERO_AT = 115.9

export default {
  slug: 'goodbye-norma-jeane',
  hero: () => screenprintFrame({ time: HERO_AT, score: GOODBYE_NORMA_JEANE_SCORE, uid: 'hero' }).svg,
}
