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
  // --- Per-song material shown by the /listen record player (all optional) ---
  writingStory?: string
  recordingDetails?: string
  photos?: TrackPhoto[]
  credits?: Credit[]
}

export interface LyricTrack {
  trackNumber: number
  title: string
  duration?: string
  // Optional: a track can be listed on the album page without published lyrics.
  lyrics?: string
  // URL segment for this track's page at /music/<album>/<songSlug>. Absent when
  // the track has no page — see shared/utils/songSlug.ts.
  songSlug?: string
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
  // Pre-rendered 1200x1200 social-card image (see content.config.ts).
  ogImage?: string
  backCoverImage?: string
  backCoverAlt?: string
  description?: string
  // Record player (/listen): which tracks sit on each vinyl side (1-based track
  // numbers). Omit to auto-split evenly, first half on A.
  sides?: {
    a: number[]
    b: number[]
  }
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
  // Canonical artist-profile URLs used for schema.org `sameAs`. Kept separate
  // from `artistLinks` because those are visitor click targets and may
  // deep-link, while these must be bare profile roots (see shared/data/site.ts).
  entityUrls: string[]
  socialLinks: SocialLink[]
  pressAssets: PressAsset[]
  epkDownloadUrl: string
}

