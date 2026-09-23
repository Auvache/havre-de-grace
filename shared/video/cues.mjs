/*
 * Which drawing goes with which line, per song.
 *
 * A reading of the song, not a look: whatever a film ends up being, "the hush
 * of a harbor" is a lighthouse. Andalusia's list is MOTIF_CUES in
 * app/config/videoStyles.ts and predates this file; songs after it keep their
 * list here, in plain JS, so a film module can import it without importing a
 * score and without a TypeScript loader.
 *
 * Order matters. `cueFor` takes the LAST match in the line, because a lyric
 * line ends on its noun — "Stone-cold these beauties are sleeping" is about the
 * sleeping, "I'm off in search of those treasures" is about the treasures — and
 * a list read front to back would hand most lines their first word instead.
 */

export const INTO_THE_WILD_CUES = [
  { match: 'adventure', motif: 'compass' },
  { match: 'lose my way', motif: 'compass', note: 'The same compass, needle loose.' },
  { match: 'splendorous', motif: 'gem' },
  { match: 'gods', motif: 'sun' },
  { match: 'water', motif: 'wave' },
  { match: 'iron', motif: 'globe', note: 'The Earth being made, not a lump of metal.' },
  { match: 'bone', motif: 'bone' },
  { match: 'Stone-cold', motif: 'stone' },
  { match: 'sleeping', motif: 'moon' },
  { match: 'running', motif: 'runner' },
  { match: 'wild', motif: 'pine', note: 'The one drawing the song is named for. Use it in every chorus, never in a verse.' },
  { match: 'conjecture', motif: 'hourglass' },
  { match: 'goals', motif: 'key' },
  { match: 'pressure', motif: 'clock' },
  { match: 'old', motif: 'hourglass' },
  { match: 'stories', motif: 'book' },
  { match: 'taught', motif: 'book' },
  { match: 'revealing', motif: 'door' },
  { match: 'songs', motif: 'guitar' },
  { match: "don't know", motif: 'compass' },
  { match: 'treasures', motif: 'gem' },
  { match: 'silver or gold', motif: 'crown', note: 'Crossed out, in a style that can cross a thing out: these are the treasures the song does not mean.' },
  { match: 'glaciers', motif: 'glacier' },
  { match: 'gardens', motif: 'flower' },
  { match: 'grottos', motif: 'cave' },
  { match: 'sage', motif: 'sprig' },
  { match: 'harbor', motif: 'lighthouse' },
  { match: 'crowd', motif: 'crowd' },
  { match: 'stage', motif: 'microphone' },
]

/**
 * Every cue in a line, in the order they are sung, with the word each lands on
 * — so a style can change the drawing mid-line ("glaciers and gardens and
 * grottos" is three pictures in two and a half seconds).
 */
export function cuesIn(line, cues = INTO_THE_WILD_CUES) {
  if (!line) return []
  const found = []
  const lower = line.words.map((w) => w.text.toLowerCase().replace(/[^a-z'-]/g, ''))
  for (const cue of cues) {
    const first = cue.match.toLowerCase().split(' ')[0].replace(/[^a-z'-]/g, '')
    const at = lower.findIndex((w) => w === first || w.startsWith(first))
    if (at >= 0) found.push({ ...cue, word: at, t: line.words[at].t })
  }
  return found.sort((a, b) => a.word - b.word)
}

/** The drawing a line is about: its last cue. `null` when it names nothing. */
export const cueFor = (line, cues = INTO_THE_WILD_CUES) => {
  const all = cuesIn(line, cues)
  return all.length ? all[all.length - 1].motif : null
}
