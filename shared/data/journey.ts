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
 *   - image:   a still. Into the Wild's are the album film's own stills
 *              (public/video-styles/album/, drawn in code, no AI).
 *   - motif:   a line drawing from shared/video/motifs.mjs, drawn on as the
 *              scene scrolls in.
 *   - film:    the song's finished film, when there is one.
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
  'into-the-wild': {
    'into-the-wild': {
      snippet: [
        'Oh, I\'m headed out on an adventure',
        'To see if I can\'t lose my way',
        'And stumble upon all the splendorous things',
        'The gods hid about when they made',
      ],
      image: { src: '/video-styles/album/into-the-wild.svg', alt: 'A red sun over black mountains and pines, a figure running', caption: 'Into the Wild · still from the album film' },
    },
    'conman': {
      snippet: [
        'I\'m a conman and I\'m here to steal your sound',
        'I stick to the shadows when I follow you around',
      ],
      image: { src: '/video-styles/album/conman.svg', alt: 'A wall of pasted pictures: a portrait, a pair of hands, a window', caption: 'Conman · the wall' },
    },
    'goodbye-norma-jeane': {
      tag: 'The single',
      snippet: [
        'Silver screen says Norma Jeane, oh',
        'Something bigger\'s meant for me',
        'With a silhouette like Juliet, oh',
        'Someone else could cut your checks',
      ],
      motif: 'heart',
    },
    'ivory': {
      snippet: [
        'Her eyes are open ocean and blue butterfly wings',
        'She\'s got some way about her when she gets on stage and sings, oh',
      ],
      image: { src: '/video-styles/album/ivory.svg', alt: 'A hand-coloured etching of a blue butterfly beside an ocean chart', caption: 'Ivory · hand-coloured etching' },
    },
    'andalusia': {
      snippet: [
        'Oh, I think that I could live in Andalusia',
        'Walk until my boots are breaking through',
      ],
      image: { src: '/video-styles/album/andalusia.svg', alt: 'An engraved chart of the globe with a red route across it', caption: 'Andalusia · cartography' },
      film: { href: '/music-videos/andalusia', label: 'Watch the film' },
    },
    'new-york': {
      snippet: ['They say love when lost upon the rocks is best left burning out the coals'],
    },
    'meet-me-at-the-horizon': {
      snippet: ['Some nights the darkness is sweeter than others'],
    },
    'rocks-in-the-sea': {
      snippet: [
        'When the road slims down and the trees hide the sound',
        'Of hearts leaving home, there you\'re free',
      ],
      image: { src: '/video-styles/album/rocks-in-the-sea.svg', alt: 'Pale rocks in a blue sea, a red line running up the shore', caption: 'Rocks in the Sea · still from the album film' },
    },
    'ship-to-stockholm': {
      snippet: [
        'Oh, away with the land and away with the light',
        'Tomorrow I will be a\' sailing',
      ],
      image: { src: '/video-styles/album/ship-to-stockholm.svg', alt: 'A tall ship at a night quay, a lit window up the hill', caption: 'Ship to Stockholm · wood engraving' },
    },
    'ghost': {
      snippet: ['The city burns and I\'m a ghost'],
    },
  },
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
