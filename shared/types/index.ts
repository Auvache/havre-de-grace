export interface StreamingLinks {
  spotify?: string
  appleMusic?: string
  youtubeMusic?: string
  amazonMusic?: string
  bandcamp?: string
  soundcloud?: string
  youtube?: string
}

export interface Track {
  title: string
  duration?: string
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
  coverImage: string
  coverAlt: string
  description?: string
  streamingLinks: StreamingLinks
  tracklist: Track[]
  videos?: VideoEntry[]
  credits?: Credit[]
  linerNotes?: string
}
