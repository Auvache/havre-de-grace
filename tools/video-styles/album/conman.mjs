/*
 * Conman — the album still: a frame of the Line engraving film itself
 * (shared/video/films/engraving.mjs), so the still and the film cannot disagree.
 * The hand-drawn still this replaced — one banknote with a rosette, an empty
 * portrait and the bottled lightning — became the film's 1968 note, and its
 * guilloche, braid, hatching and bottle are the film's.
 */
import { CONMAN_SCORE } from '../../../app/config/conmanScore.ts'
import { engravingFrame } from '../../../shared/video/films/engraving.mjs'

/* "Bottled lightning in several steady notes": the 1968 sitter, the bottle with the bolt cut into it, the three notes on the stave, the airship. */
const HERO_AT = 37.9

export default {
  slug: 'conman',
  hero: () => engravingFrame({ time: HERO_AT, score: CONMAN_SCORE, uid: 'hero' }).svg,
}
