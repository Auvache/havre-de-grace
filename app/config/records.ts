/*
 * The look of each record, in one place.
 *
 * The light pages (homepage, Records, About, Letters…) wear the *current*
 * record's palette and hero art. Every June 6 a new record comes out and the
 * site re-skins to it: add its entry to RECORD_LOOKS and point CURRENT_RECORD
 * at it. That one line is the whole re-skin. The anchor is the brand and never
 * changes; the sea is Into the Wild's.
 *
 * Each record's album page (/music/<slug>) is dark and keeps its own `cinema`
 * grade whatever year it is, so an old record still looks like itself.
 */

export interface RecordPalette {
  /** Text and hairlines. */
  ink: string
  /** The page. */
  bone: string
  /** The accent: eyebrows, the player's progress line. */
  sea: string
  /** A deeper accent: the playing track. */
  deep: string
  /** Quiet bands (the homepage pull quote). */
  mist: string
}

export interface RecordImage {
  src: string
  /** CSS object-position. */
  position?: string
  /**
   * How far past the frame to scale it. The Into the Wild cover has a white
   * border; scaling to 1.12 pushes it off every edge.
   */
  scale?: number
}

/** A picture on the album screen. A list, so more photos are a data change. */
export interface ScreenSlide extends RecordImage {
  alt: string
}

export type ScreenTreatment = 'calm' | 'old-film'
export type Lettering = 'hairline' | 'typed'

export interface RecordLook {
  slug: string
  title: string
  palette: RecordPalette
  /** The homepage hero and the record's photographic band. */
  hero: RecordImage
  /** Small square cover for the player bar and lists. */
  thumb: string
  /** A larger square cover for the Records page and the homepage. */
  cover: string
  /** A lyric for the homepage's pull quote: real, from content/music. */
  pullQuote?: { lines: string[]; song: string }
  /**
   * The homepage's words about the record, beside its track list. Real copy:
   * the text is cut from the record's own description in content/music.
   */
  intro?: { headline: string; text: string }
  cinema: {
    /** The album page's floor. */
    floor: string
    /** Its accent, which has to survive on the floor. */
    accent: string
    treatment: ScreenTreatment
    lettering: Lettering
    slides: ScreenSlide[]
  }
}

export const RECORD_LOOKS: Record<string, RecordLook> = {
  'into-the-wild': {
    slug: 'into-the-wild',
    title: 'Into the Wild',
    palette: {
      ink: '#1d232a',
      bone: '#f3f1ec',
      sea: '#6f8299',
      deep: '#3f5670',
      mist: '#e3e8ec',
    },
    hero: { src: '/images/site/into-the-wild-2400.jpg', position: 'center 58%', scale: 1.12 },
    thumb: '/images/site/into-the-wild-640.jpg',
    cover: '/images/site/into-the-wild-2400.jpg',
    pullQuote: {
      // From the title track (content/music/into-the-wild.yml).
      lines: [
        'Oh, I want to take stories with meaning',
        'from the tales that my life\'s taught to me,',
        'dress them in something revealing,',
        'and put them in songs that I sing.',
      ],
      song: 'Into the Wild',
    },
    intro: {
      headline: 'Ten songs, meant to be heard in order',
      text: 'The songs were selected, organized, and produced with the intention of being listened to as a whole body of work. The album explores what music means to the artist and the listener: adventure, creativity, self-identity, and a medium for working through big emotions.',
    },
    cinema: {
      floor: '#0d1318',
      accent: '#9fb6cc',
      treatment: 'calm',
      lettering: 'hairline',
      slides: [
        { src: '/images/site/into-the-wild-2400.jpg', position: 'center 58%', scale: 1.14, alt: 'The Into the Wild cover: open sea under an overcast sky' },
      ],
    },
  },
  'i-want-to-be-yours-and-other-songs': {
    slug: 'i-want-to-be-yours-and-other-songs',
    title: 'I Want to Be Yours and Other Songs',
    // Only used if this record were ever made current again.
    palette: {
      ink: '#1f231f',
      bone: '#f2f1ec',
      sea: '#7d8c74',
      deep: '#4b5a45',
      mist: '#e4e7e1',
    },
    hero: { src: '/images/site/woods-wide-2400.jpg', position: '50% 40%', scale: 1.04 },
    thumb: '/images/site/i-want-to-be-yours-640.jpg',
    cover: '/images/site/i-want-to-be-yours-1600.jpg',
    cinema: {
      floor: '#0b110d',
      accent: '#a9bf9f',
      treatment: 'old-film',
      lettering: 'typed',
      slides: [
        { src: '/images/site/woods-wide-2400.jpg', position: '50% 40%', scale: 1.04, alt: 'Stefan playing guitar in a pine wood' },
      ],
    },
  },
}

/** The record the light pages wear. Change this on June 6. */
export const CURRENT_RECORD = 'into-the-wild'

export const currentLook = (): RecordLook => RECORD_LOOKS[CURRENT_RECORD]!

export const lookFor = (slug?: string | null): RecordLook | null =>
  (slug && RECORD_LOOKS[slug]) || null

/** The palette as CSS custom properties, for :root. */
export const paletteCss = (palette: RecordPalette = currentLook().palette): string =>
  `html:root{--ink:${palette.ink};--bone:${palette.bone};--sea:${palette.sea};--deep:${palette.deep};--mist:${palette.mist}}`
