/*
 * Conman — the album still: a frame of the gallery film itself
 * (shared/video/films/gallery.mjs), so the still and the film cannot disagree.
 * The banknote still before it was a frame of engraving.mjs, the edition this
 * film replaced.
 */
import { CONMAN_SCORE } from '../../../app/config/conmanScore.ts'
import { galleryFrame } from '../../../shared/video/films/gallery.mjs'

/* "These rhythms' been around since 1968": the double-neck behind the first window, its headstock tearing loose on "1968". */
const HERO_AT = 31.05

export default {
  slug: 'conman',
  hero: () => galleryFrame({ time: HERO_AT, score: CONMAN_SCORE, uid: 'hero' }).svg,
}
