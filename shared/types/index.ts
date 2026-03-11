export interface StreamingLinks {
  spotify?: string
  appleMusic?: string
  youtubeMusic?: string
  amazonMusic?: string
  bandcamp?: string
  soundcloud?: string
  youtube?: string
  instagram?: string
}

export interface Track {
  title: string
  duration?: string
  lyrics?: string
}

export interface LyricTrack {
  trackNumber: number
  title: string
  duration?: string
  lyrics: string
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
  coverImage: string
  coverAlt: string
  description?: string
  streamingLinks: StreamingLinks
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
