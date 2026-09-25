/*
 * Meet Me at the Horizon — the album still: a frame of the Mezzotint film
 * itself (shared/video/films/mezzotint.mjs), so the still and the film cannot
 * disagree. The hand-drawn still this replaced — the bedroom at dawn, the
 * window, the red horizon over the pines — became the film's room and its
 * window, and its burnished ramp from ink to paper is the film's.
 */
import { MEET_ME_AT_THE_HORIZON_SCORE } from '../../../app/config/meetMeAtTheHorizonScore.ts'
import { mezzotintFrame } from '../../../shared/video/films/mezzotint.mjs'

/* "Should I be afraid, will my troubles end": the bed risen through the burnished-away ceiling, the stars wheeling into trails round it, the moon. */
const HERO_AT = 46.6

export default {
  slug: 'meet-me-at-the-horizon',
  hero: () => mezzotintFrame({ time: HERO_AT, score: MEET_ME_AT_THE_HORIZON_SCORE, uid: 'hero' }).svg,
}
