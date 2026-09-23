import { INTO_THE_WILD_SCORE as score } from '../../../app/config/intoTheWildScore.ts'
import {
  trailheadFrame, CREAM, PINE, SAGE, LAKE, OCHRE, RUST, NIGHT,
} from '../../../shared/video/films/trailhead.mjs'

/*
 * A national-park screenprint poster, one per line of "Into the Wild".
 *
 * Nothing on this sheet is drawn here. Every frame below is the film itself —
 * shared/video/films/trailhead.mjs, called at a song time — so the still and
 * the clips at /music-videos/into-the-wild-styles cannot disagree about what a poster
 * looks like. What this file decides is only which six moments to show.
 */
const at = (time, uid) => () => trailheadFrame({ time, score, uid }).svg

export default {
  id: 'c5-trailhead',
  family: 'C',
  name: 'Trailhead',
  accent: RUST,
  tagline: 'A national-park screenprint poster per line: flat spot colour in silhouette layers, the lyric as the headline, the print pulled one ink per sung word.',
  palette: [['Cream', CREAM], ['Pine', PINE], ['Sage', SAGE], ['Lake', LAKE], ['Ochre', OCHRE], ['Rust', RUST], ['Night', NIGHT]],

  // "The roar of a crowd center stage", every ink down: the crowd drawn as the poster's hills.
  hero: at(183.3, 'hero'),

  thumbs: [
    { label: 'Title', note: 'The only poster with the band on it. Inks pulled on the beat over the intro.', draw: at(9.2, 't0') },
    { label: 'Verse', note: '"The Earth out of water and iron": a new poster per line, the noun as the picture.', draw: at(35.6, 't1') },
    { label: 'Chorus', note: 'The range, the pines and a runner on the ridge. Parallax at a run; midday palette.', draw: at(50.95, 't2') },
    { label: 'Horns', note: 'No headline. The picture takes the whole sheet and changes every four bars.', draw: at(122.4, 't3') },
    { label: 'Glaciers, gardens, grottos', note: 'Three nouns in two seconds: a triptych, each panel printed on its word.', draw: at(171.2, 't4') },
  ],
}
