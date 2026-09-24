/*
 * Ivory — the album still: a frame of the Etching film itself
 * (shared/video/films/etching.mjs), so the still and the film cannot disagree.
 * The hand-drawn still this replaced — ocean, butterfly and wild roses on one
 * plate, with the thread pinned between them — became the film's first figures,
 * and its butterfly, wash and hatching are the film's.
 */
import { IVORY_SCORE } from '../../../app/config/ivoryScore.ts'
import { etchingFrame } from '../../../shared/video/films/etching.mjs'

/* "Her eyes are open ocean and blue butterfly wings": the swell washed, the wings just open, the thread on its pin. */
const HERO_AT = 31.6

export default {
  slug: 'ivory',
  hero: () => etchingFrame({ time: HERO_AT, score: IVORY_SCORE, uid: 'hero' }).svg,
}
