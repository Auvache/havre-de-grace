import { INTO_THE_WILD_SCORE as score } from '../../../app/config/intoTheWildScore.ts'
import { woodcutFrame, PAPER, INK, VERMILION, SLATE } from '../../../shared/video/films/woodcut.mjs'

/*
 * Woodcut — a two-block relief print of "Into the Wild".
 *
 * Every frame on this sheet is the film itself: woodcutFrame at a moment of
 * the song, the same call the clip page makes sixty times a second. Nothing is
 * redrawn for the still, so the sheet cannot disagree with the film.
 *
 * The five moments are the five places the style has to do something
 * different: the title cut letter by letter, a verse block, the first chorus's
 * paper dawn, the horns (no lyric, a ray cut on every bar) and the triptych in
 * the third verse, where one line is three blocks cut on three words.
 */
const at = (time, uid) => () => woodcutFrame({ time, score, uid }).svg

export default {
  id: 'c4-woodcut',
  family: 'C',
  name: 'Woodcut',
  accent: VERMILION,
  tagline: 'A two-block relief print. Every measured word takes another cut out of the block, so each line is finished as it is sung.',
  palette: [['Paper', PAPER], ['Ink', INK], ['Vermilion', VERMILION], ['Slate', SLATE]],

  hero: at(186.95, 'hero'),

  thumbs: [
    { label: 'Title', note: 'The title cut out of the lower block a letter at a time, over a sun cut behind the range.', draw: at(9.5, 'th0') },
    { label: 'Verse', note: '"Ebony, ivory, and bone": the ground in section, each thing cut on its own word.', draw: at(39.6, 'th1') },
    { label: 'Chorus', note: 'First chorus is a paper dawn. The second runs at night; the third floods the sky red.', draw: at(57.6, 'th2') },
    { label: 'Horns', note: 'No lyric. A great sun on the sea, one ray cut per bar; the lower block keeps count.', draw: at(146.0, 'th3') },
    { label: 'Verse 3', note: 'Glaciers, gardens, grottos — three panels, each cut on the word that names it.', draw: at(171.4, 'th4') },
  ],
}
