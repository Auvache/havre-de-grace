import { INTO_THE_WILD_SCORE as score } from '../../../app/config/intoTheWildScore.ts'
import {
  fieldJournalFrame, PAGE, GRAPHITE, SEPIA, SEA, SAGE, OCHRE, RED,
} from '../../../shared/video/films/field-journal.mjs'

/*
 * A naturalist's notebook, open flat: the line is the entry, the thing it names
 * is sketched on a card taped to the facing page while it is sung, and every
 * sketch a verse makes stays in the book.
 *
 * NOTHING IS DRAWN HERE
 *
 * Every frame on this sheet is the film itself — fieldJournalFrame called at a
 * moment of the song — so the still and the film cannot disagree. What is left
 * below is the choice of moments.
 */
const at = (time, uid) => () => fieldJournalFrame({ time, score, uid }).svg

export default {
  id: 'c1-field-journal',
  family: 'C',
  name: 'Field Journal',
  accent: RED,
  tagline: 'A naturalist\'s notebook, open flat. The line is the entry; what it names is sketched in pencil on the facing page while it is sung, and every find stays in the book.',
  palette: [['Page', PAGE], ['Graphite', GRAPHITE], ['Sepia', SEPIA], ['Sea', SEA], ['Sage', SAGE], ['Ochre', OCHRE], ['Red pencil', RED]],

  hero: at(183.25, 'hero'),

  thumbs: [
    { label: 'Title', note: 'A pressed sprig, the song\'s name, and a compass drawing itself on.', draw: at(12, 't0') },
    { label: 'Verse', note: 'The line\'s sketch on its card; the verse\'s earlier finds, numbered.', draw: at(39.7, 't1') },
    { label: 'Chorus', note: 'A trail map across both leaves, run a pose per eighth.', draw: at(50.2, 't2') },
    { label: 'Horns', note: 'No words: a panorama drawn slowly, one thing at a time.', draw: at(146, 't3') },
    { label: 'Verse 3', note: 'Glaciers, gardens, grottos: three sketches, each on its word.', draw: at(171.2, 't4') },
  ],
}
