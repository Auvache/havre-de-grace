import { INTO_THE_WILD_SCORE } from '../../../app/config/intoTheWildScore.ts'
import {
  contourFrame, PAPER, BROWN, INDEX, WATER, WOOD, TRAIL, INK,
} from '../../../shared/video/films/contour.mjs'

/*
 * A topographic survey sheet with the song as the terrain.
 *
 * Every frame on this sheet is drawn by the film itself —
 * shared/video/films/contour.mjs, called at a song time — so the still and the
 * film cannot disagree about what a contour looks like. The hero is the roar
 * of the crowd at its loudest: the range risen to its last step, the benchmark
 * on the summit, the line fully sung. The five thumbnails are the title, a
 * verse, a chorus, the horns and the third verse's three landforms.
 */
const at = (time, uid) => contourFrame({ time, score: INTO_THE_WILD_SCORE, uid }).svg

export default {
  id: 'c2-contour',
  family: 'C',
  name: 'Contour',
  accent: TRAIL,
  tagline: 'A topographic survey sheet. Every noun the song sings becomes a landform in contour lines, and the lyric is the quadrangle\'s name along the foot.',
  palette: [['Paper', PAPER], ['Contour', BROWN], ['Index', INDEX], ['Water', WATER], ['Wood', WOOD], ['Trail', TRAIL], ['Ink', INK]],

  hero: () => at(183.3, 'hero'),

  thumbs: [
    {
      label: 'Title',
      note: 'The quad is named in the collar; the contours ink themselves in, one per beat.',
      draw: () => at(10, 't0'),
    },
    {
      label: 'Verse',
      note: 'A new sheet per line, its contours going down word by word from the sea up.',
      draw: () => at(38.4, 't1'),
    },
    {
      label: 'Chorus',
      note: 'The massif. One red dashed trail runs up the valley at the pace of the line.',
      draw: () => at(51.9, 't2'),
    },
    {
      label: 'Horns',
      note: 'No lyric. The sheet pans a long ridge and the collar prints its section, A to A′.',
      draw: () => at(131, 't3'),
    },
    {
      label: 'Verse 3',
      note: 'Glaciers, gardens and grottos: three landforms, lettered as each is sung.',
      draw: () => at(171.2, 't4'),
    },
  ],
}
