import type { Album, ListenAlbum, ListenTrack, TrackLayout } from '~~/shared/types'

// --- Behavioral constants (ported from new-page-mockup.html) ---
// The visual style of the player/papers will change later; these govern behavior.
// Parked off the record: the arm hangs straight down over the arm rest.
export const OFF_ANGLE = -95
export const OFF_RELEASE_BOUNDARY = -80
// Tonearm angles for the outer (track 1) and inner (last track) grooves. Tuned for
// the stylus that extends out the end of the arm onto the centered vinyl; the inner
// groove stays outside the white center label. Nudge these if a zone sits off the
// black grooves (more negative = further out toward the rim).
export const PLAY_OUTER_ANGLE = -65
export const PLAY_INNER_ANGLE = -50

// Arm rotates around the drawn pivot base (transform-origin matches in CSS).
export const TURNTABLE_PIVOT_RATIO = { x: 379 / 430, y: 73 / 300 }
// Groove band as a fraction of the record radius: inner sits just outside the white
// center label (~0.42R), outer just inside the rim, so every zone lands on vinyl.
export const RECORD_OUTER_RATIO = 0.88
export const RECORD_INNER_RATIO = 0.48
export const SPIN_RATE = 360 / 3800
export const STOP_RAMP_MS = 1000
export const START_RAMP_MS = 520
export const PAGE_TRANSITION_MS = 1000
// How long the record takes to flip to its other side (matches the CSS transition).
export const FLIP_MS = 720

// Fixed artboard the record player scene lives on.
export const SCENE_WIDTH = 2200
export const SCENE_HEIGHT = 1600

// Approximated vinyl spacing: outer zones wider, inner zones tighter, no gaps.
// Returns `count + 1` boundaries in [0, 1]. Generalizes the mockup's hand-tuned
// 9-zone table to any track count (e.g. 10 for Into the Wild).
export function makeTrackBoundaries(count: number): number[] {
  if (count <= 0) {
    return [0, 1]
  }
  if (count === 1) {
    return [0, 1]
  }

  // Zone weight shrinks from the outside (i=0) to the label (i=count-1).
  const weights = Array.from({ length: count }, (_, i) => 1 - 0.45 * (i / (count - 1)))
  const total = weights.reduce((sum, w) => sum + w, 0)

  const boundaries = [0]
  let acc = 0
  for (let i = 0; i < count; i += 1) {
    acc += weights[i]!
    boundaries.push(acc / total)
  }
  boundaries[boundaries.length - 1] = 1
  return boundaries
}

// Per-track accent palette (accent, accent-2, accent-dark). Cycles for >9 tracks.
const PALETTE: ReadonlyArray<readonly [string, string, string]> = [
  ['#ef463b', '#ffd15c', '#112644'],
  ['#7f59ff', '#ffe06a', '#16123b'],
  ['#1fa2ff', '#a7ffeb', '#0a2e42'],
  ['#ff8a00', '#ffef78', '#2d1a09'],
  ['#00a884', '#b7ff5a', '#06352f'],
  ['#f72585', '#4cc9f0', '#1d1230'],
  ['#4361ee', '#f1fa8c', '#101833'],
  ['#8d99ae', '#edf2f4', '#202838'],
  ['#ffbe0b', '#fb5607', '#16213e'],
]

// Messy per-track collage positions [x, y, rotate]. Cycles for >9 tracks.
const LAYOUTS: ReadonlyArray<TrackLayout> = [
  { lyrics: [544, 362, 10], storyA: [1410, 370, -7], storyB: [466, 842, -12], annotations: [1388, 798, 8], imageA: [1544, 1030, -9], imageB: [632, 1072, 5] },
  { lyrics: [1398, 342, -11], storyA: [490, 414, 8], storyB: [1402, 846, 12], annotations: [546, 928, -6], imageA: [1534, 572, 7], imageB: [754, 314, -8] },
  { lyrics: [450, 536, -8], storyA: [1414, 486, 13], storyB: [1318, 994, -7], annotations: [618, 340, 11], imageA: [1580, 330, -11], imageB: [494, 1074, 9] },
  { lyrics: [602, 332, 7], storyA: [1428, 736, -12], storyB: [420, 936, 6], annotations: [1424, 376, 5], imageA: [1642, 1030, 10], imageB: [656, 798, -9] },
  { lyrics: [1396, 326, 12], storyA: [480, 390, -14], storyB: [1376, 922, 8], annotations: [568, 956, 12], imageA: [1586, 638, -6], imageB: [430, 728, -11] },
  { lyrics: [452, 344, -13], storyA: [1410, 400, -4], storyB: [506, 950, 15], annotations: [1406, 846, -10], imageA: [1586, 1028, 6], imageB: [692, 770, -7] },
  { lyrics: [1420, 400, -6], storyA: [466, 488, 12], storyB: [1360, 970, -11], annotations: [554, 890, -8], imageA: [1564, 724, 14], imageB: [680, 316, 8] },
  { lyrics: [544, 342, 14], storyA: [1408, 506, 9], storyB: [448, 942, -5], annotations: [1378, 886, -8], imageA: [1620, 324, -6], imageB: [682, 1022, 10] },
  { lyrics: [456, 794, -9], storyA: [1430, 354, 7], storyB: [578, 322, 11], annotations: [1402, 840, 12], imageA: [1566, 1032, -8], imageB: [404, 526, -12] },
]

// Until real song photos exist, every track shows three copies of this shared
// placeholder. Once a track defines its own `photos` in the content YAML, those
// replace the placeholders entirely.
const PLACEHOLDER_PHOTO = '/images/photo-placeholder.svg'
const PLACEHOLDER_PHOTO_COUNT = 3

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// The track's stable URL slug + audio basename, e.g.
// "/albums/.../music/scarecrow.mp3" -> "scarecrow".
function basenameSlug(audio?: string): string | null {
  if (!audio) {
    return null
  }
  const file = audio.split('/').pop() ?? ''
  const base = file.replace(/\.[^.]+$/, '')
  return base ? slugify(base) : null
}

// Parse a YYYY-MM-DD string as a local date (matches [slug].vue behavior).
function parseIsoDate(value?: string | null): Date | null {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) {
    return null
  }
  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return Number.isNaN(date.getTime()) ? null : date
}

// An album is listenable when it's visible, not a single, has at least one track
// with an audio file, and its release date has passed.
export function isAlbumListenable(album: Album, now: Date = new Date()): boolean {
  if (album.isVisible === false || album.isSingle) {
    return false
  }
  const released = (() => {
    const date = parseIsoDate(album.releaseDate)
    return date ? date.getTime() <= now.getTime() : true
  })()
  const hasAudio = (album.tracklist ?? []).some((track) => Boolean(track.audio))
  return released && hasAudio
}

export function toListenAlbum(album: Album, now: Date = new Date()): ListenAlbum {
  const listenable = isAlbumListenable(album, now)
  const releaseDate = parseIsoDate(album.releaseDate)
  const releaseLabel = !listenable && releaseDate && releaseDate.getTime() > now.getTime()
    ? `Coming ${releaseDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
    : undefined

  return {
    title: album.title,
    slug: album.slug,
    coverImage: album.coverImage,
    coverAlt: album.coverAlt,
    backCoverImage: album.backCoverImage,
    backCoverAlt: album.backCoverAlt,
    listenable,
    releaseLabel,
    background: album.listenBackground,
  }
}

// Assign each track (by 0-based index) to a vinyl side. Uses the album's explicit
// `sides` map when present, otherwise splits evenly with the first half on side A.
function resolveSides(album: Album, count: number): Array<'a' | 'b'> {
  const assignment: Array<'a' | 'b'> = Array.from({ length: count }, () => 'a')
  const explicit = album.sides
  if (explicit && ((explicit.a?.length ?? 0) > 0 || (explicit.b?.length ?? 0) > 0)) {
    for (const n of explicit.a ?? []) {
      if (n >= 1 && n <= count) assignment[n - 1] = 'a'
    }
    for (const n of explicit.b ?? []) {
      if (n >= 1 && n <= count) assignment[n - 1] = 'b'
    }
    return assignment
  }
  const half = Math.ceil(count / 2)
  return assignment.map((_, i) => (i < half ? 'a' : 'b'))
}

// Split a lyrics block into trimmed lines, preserving blank lines between verses.
function toLyricLines(lyrics?: string): string[] {
  if (!lyrics) {
    return []
  }
  return lyrics
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    // Drop leading/trailing blank lines but keep internal verse gaps.
    .reduce<string[]>((acc, line, index, arr) => {
      const isEdgeBlank = line.trim() === '' && (acc.length === 0 || index === arr.length - 1)
      if (!isEdgeBlank) acc.push(line)
      return acc
    }, [])
}

// Build the per-track view model for the record player from real album content.
// Every content field is optional; empty values simply render nothing in the collage.
export function buildListenTracks(album: Album): ListenTrack[] {
  const list = album.tracklist ?? []
  const sideAssignment = resolveSides(album, list.length)
  const sideCounters = { a: 0, b: 0 }

  return list.map((track, index) => {
    const number = index + 1
    const side = sideAssignment[index]!
    sideCounters[side] += 1
    const sideNumber = sideCounters[side]
    const audioSrc = track.audio ?? ''
    const slug = basenameSlug(track.audio) ?? slugify(track.title) ?? `track-${number}`
    const [accent, accent2, accentDark] = PALETTE[index % PALETTE.length]!
    const layout = LAYOUTS[index % LAYOUTS.length]!

    return {
      number,
      side,
      sideNumber,
      slug,
      title: track.title,
      audioSrc,
      accent,
      accent2,
      accentDark,
      lyrics: toLyricLines(track.lyrics),
      writingStory: track.writingStory?.trim() || undefined,
      recordingDetails: track.recordingDetails?.trim() || undefined,
      photos: track.photos?.length
        ? track.photos
        : Array.from({ length: PLACEHOLDER_PHOTO_COUNT }, () => ({ src: PLACEHOLDER_PHOTO, alt: '' })),
      credits: track.credits ?? [],
      layout,
    }
  })
}
