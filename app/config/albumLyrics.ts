/*
 * Timed lyrics for the album screen, by record and song slug.
 *
 * Every song's score file in app/config/ (the Into the Wild films' word-timed
 * scores, and the line-timed ones made for the screen) exports LINES; the
 * screen needs only each line's start, end and text. Loaded per record, on the
 * album page only, so the light pages never carry them.
 *
 * A song missing here shows its title on the screen instead of lyrics.
 */

export interface TimedLine {
  start: number
  end: number
  text: string
  /** Least certain: check by ear first (the review page marks these). */
  check?: boolean
}

type LineSource = {
  LINES: ReadonlyArray<{ start: number; end: number; text: string }>
  CHECK?: number[]
}

const LOADERS: Record<string, Record<string, () => Promise<LineSource>>> = {
  'into-the-wild': {
    'into-the-wild': () => import('./intoTheWildScore'),
    'conman': () => import('./conmanScore'),
    'goodbye-norma-jeane': () => import('./goodbyeNormaJeaneScore'),
    'ivory': () => import('./ivoryScore'),
    'andalusia': () => import('./andalusiaScore'),
    'new-york': () => import('./newYorkScore'),
    'meet-me-at-the-horizon': () => import('./meetMeAtTheHorizonScore'),
    'rocks-in-the-sea': () => import('./rocksInTheSeaScore'),
    'ship-to-stockholm': () => import('./shipToStockholmScore'),
    'ghost': () => import('./ghostScore'),
  },
  'i-want-to-be-yours-and-other-songs': {
    'i-want-to-be-yours': () => import('./iWantToBeYoursScore'),
    'shades-of-blue-and-red': () => import('./shadesOfBlueAndRedScore'),
    'sky-blue': () => import('./skyBlueScore'),
    'scarecrow': () => import('./scarecrowScore'),
    'jesus-creek': () => import('./jesusCreekScore'),
    'demolition-woman-live': () => import('./demolitionWomanScore'),
    'white-raven-live': () => import('./whiteRavenScore'),
    'song-for-the-sick': () => import('./songForTheSickScore'),
    'i-want-to-be-yours-demo-version': () => import('./iWantToBeYoursDemoScore'),
  },
}

/** Every timed song on a record: { songSlug: lines }. */
export async function loadAlbumLyrics(albumSlug: string): Promise<Record<string, TimedLine[]>> {
  const loaders = LOADERS[albumSlug] ?? {}
  const entries = await Promise.all(Object.entries(loaders).map(async ([slug, load]) => {
    const { LINES, CHECK = [] } = await load()
    return [slug, LINES.map(({ start, end, text }, i) => ({ start, end, text, check: CHECK.includes(i) || undefined }))] as const
  }))
  return Object.fromEntries(entries)
}

export const albumHasLyrics = (albumSlug: string) => Boolean(LOADERS[albumSlug])
