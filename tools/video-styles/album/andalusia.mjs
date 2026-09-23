/*
 * Andalusia's album still — a frame of the film itself, in the album edition,
 * so the still and the film cannot disagree about what the chart looks like.
 */
import { ANDALUSIA_SCORE } from '../../../app/config/andalusiaScore.ts'
import { cartographyAlbumFrame } from '../../../shared/video/films/cartography.mjs'

const frame = (time, uid) => cartographyAlbumFrame({ time, score: ANDALUSIA_SCORE, uid }).svg

export default {
  slug: 'andalusia',
  // Verse 3, the line on its way to Bangkok with "Bangkok, Budapest, or" pulled to full ink.
  hero: () => frame(79.8, 'hero'),
}

export const extras = {
  // The album title card: the province pushing in, 5/10 in the margin.
  'title-card': () => frame(6.0, 'title'),
}
