export interface StreamingLinks {
  spotify?: string
  appleMusic?: string
  youtubeMusic?: string
  amazonMusic?: string
  bandcamp?: string
  bandsintown?: string
  soundcloud?: string
  youtube?: string
  instagram?: string
}

export interface TrackPhoto {
  src: string
  alt?: string
}

export interface Track {
  title: string
  duration?: string
  lyrics?: string
  // Absolute public path to the playable audio file (see content.config.ts).
  audio?: string
  // --- /listen "now playing" collage (all optional) ---
  writingStory?: string
  recordingDetails?: string
  photos?: TrackPhoto[]
  credits?: Credit[]
}

// --- Interactive record player (/listen) ---

// A track prepared for the record player. Every content field is optional.
export interface ListenTrack {
  number: number // 1-based index within the album
  side: 'a' | 'b' // which face of the record this track lives on
  sideNumber: number // 1-based index within its side (A1, A2, ... / B1, B2, ...)
  slug: string // URL segment, derived from the audio file basename
  title: string
  audioSrc: string
  accent: string
  accent2: string
  accentDark: string
  lyrics: string[] // lyric lines (empty array when the song has no lyrics)
  writingStory?: string // how the song was written
  recordingDetails?: string // how the song was recorded
  photos: TrackPhoto[] // borderless, uncaptioned photos (empty when none)
  credits: Credit[] // per-song liner notes (empty when none)
}

// An album as shown in the /listen picker and switcher.
export interface ListenAlbum {
  title: string
  slug: string
  coverImage: string
  coverAlt: string
  // Album-wide back artwork, shown next to the front cover during playback.
  backCoverImage?: string
  backCoverAlt?: string
  listenable: boolean // released + has audio -> playable
  releaseLabel?: string // e.g. "Coming July 17, 2026" when not yet listenable
  // Record-player backdrop keyword (e.g. "charcoal"); maps to a [data-bg] style.
  background?: string
}

export interface LyricTrack {
  trackNumber: number
  title: string
  duration?: string
  // Optional: a track can be listed on the album page without published lyrics.
  lyrics?: string
}

export interface VideoEntry {
  title: string
  url: string
  description?: string
}

export interface Credit {
  role: string
  name: string
}

export interface Album {
  title: string
  slug: string
  year: number
  releaseDate?: string
  isLatest?: boolean
  isVisible?: boolean
  isSingle?: boolean
  // For singles drawn from a larger release: clicking the single links to this
  // album page instead of opening the single modal.
  parentAlbumSlug?: string
  coverImage: string
  coverAlt: string
  backCoverImage?: string
  backCoverAlt?: string
  description?: string
  // Record player (/listen): which tracks sit on each vinyl side (1-based track
  // numbers). Omit to auto-split evenly, first half on A.
  sides?: {
    a: number[]
    b: number[]
  }
  // Record player backdrop keyword (e.g. "charcoal"). Omit for the default look.
  listenBackground?: string
  streamingLinks: StreamingLinks
  // Shown on the hero when the album itself has no streaming links yet
  // (i.e. it hasn't released) but a single from it already has.
  leadSingle?: {
    title: string
    streamingLinks: StreamingLinks
  }
  tracklist: Track[]
  linerNotes?: string
  linerNoteImages?: Array<{
    src: string
    alt: string
  }>
  videos?: VideoEntry[]
  credits?: Credit[]
  pressQuotes?: Array<{
    quote: string
    source?: string
  }>
  epkDownloadUrl?: string
}

export interface TasteAlbum {
  id: string
  title: string
  artist: string
  coverImage: string
  tier: 1 | 2 | 3 | 4 | 5
  description: string
  listenLinks?: {
    spotify?: string
    appleMusic?: string
  }
}

export interface TasteAlbumCollection {
  albums: TasteAlbum[]
}

export interface SocialLink {
  label: string
  url: string
}

export interface PressAsset {
  label: string
  src: string
  downloadName: string
}

export interface SiteProfile {
  artistName: string
  legalName: string
  description: string
  location: string
  genres: string[]
  bookingEmail: string
  artistLinks: StreamingLinks
  socialLinks: SocialLink[]
  pressAssets: PressAsset[]
  epkDownloadUrl: string
}

