/*
 * Ship to Stockholm — the album still: a frame of the Wood engraving film
 * itself (shared/video/films/wood-engraving.mjs), so the still and the film
 * cannot disagree. The hand-drawn still this replaced — a ship in the ice, a
 * tightrope from its mast to a light on the horizon, the red wake behind it —
 * became the film's last verse and its outro, and its tone engine is the film's.
 */
import { SHIP_TO_STOCKHOLM_SCORE } from '../../../app/config/shipToStockholmScore.ts'
import { woodEngravingFrame } from '../../../shared/video/films/wood-engraving.mjs'

/* "We're walking a tightrope to Eden": the plank walked arms out, the ship moored in the ice, the one window lit behind him, the light on the horizon. */
const HERO_AT = 190.1

export default {
  slug: 'ship-to-stockholm',
  hero: () => woodEngravingFrame({ time: HERO_AT, score: SHIP_TO_STOCKHOLM_SCORE, uid: 'hero' }).svg,
}
