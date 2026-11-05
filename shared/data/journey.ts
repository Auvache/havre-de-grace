/**
 * The song journey: what each album page shows for each song, below the screen.
 *
 * A TypeScript data file beside bio.ts and letter.ts rather than fields on
 * content/music/*.yml, because (1) it's a draft Stefan is approving line by
 * line, so it's easier to read in one place than threaded through two long
 * lyric files, and (2) it needs no change to the content collection's schema,
 * which the build, the record player and the markdown mirror all read.
 *
 * Per song, all optional:
 *   - snippet: one to four lines, word for word from the published lyric.
 *     DRAFTS, chosen by Claude on 2026-10-29 for Stefan to approve.
 *   - image:   a still.
 *   - motif:   a line drawing from shared/video/motifs.mjs, drawn on as the
 *              scene scrolls in.
 *   - film:    the song's finished film, when there is one.
 *
 * Into the Wild has none: its album page stops at the intro paragraph.
 * A story is never written here. The album page shows a song's own
 * `writingStory` from the content file, which is Stefan's words, when it has one.
 *
 * A song with an image, a motif, a film, a story or a snippet of two lines or
 * more gets a full scene; a song with only a line gets a quiet row. The content
 * decides, never the template.
 */

export interface JourneyImage {
  src: string
  alt: string
  caption?: string
}

export interface JourneySong {
  snippet?: string[]
  image?: JourneyImage
  motif?: string
  film?: { href: string, label: string }
  /** A small label beside the title: "The single". */
  tag?: string
}

/** album slug → song slug → the song's material. */
export const journeys: Record<string, Record<string, JourneySong>> = {
  'i-want-to-be-yours-and-other-songs': {
    'i-want-to-be-yours': {
      snippet: [
        'Yes, I could be famous',
        'That\'d sure be a chore',
        'I could belong to everybody, but',
        'I want to be yours',
      ],
      motif: 'sailboat',
    },
    'shades-of-blue-and-red': {
      snippet: [
        'Crossing the water on your way to me',
        'Talking about all the things that we\'ve seen',
      ],
      motif: 'wave',
    },
    'sky-blue': {
      snippet: ['At least my shade\'s more like the sky when I\'m sitting with you'],
    },
    'scarecrow': {
      snippet: [
        'She looks like a lightning strike',
        'Laughs with her smile but never her eyes',
        'Darkness builds under dark gray skies',
        'Been waiting on sunlight for more than a while',
      ],
      motif: 'moon',
    },
    'jesus-creek': {
      snippet: [
        'Tiny log cabin down by Jesus Creek',
        'New baby boy, it\'s a house without sleep, oh',
      ],
      motif: 'church',
    },
    'demolition-woman-live': {
      tag: 'Live',
      snippet: ['She\'s a demolition woman, coming for my heart'],
    },
    'white-raven-live': {
      tag: 'Live',
      snippet: ['I\'m just a white raven, flying through a storm'],
    },
    'song-for-the-sick': {
      snippet: ['No justice for love in a song for the sick'],
    },
    'i-want-to-be-yours-demo-version': {
      tag: 'Demo',
      snippet: ['I could be a singer, living on the road'],
    },
  },
}
