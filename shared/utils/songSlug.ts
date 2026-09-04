import type { Album, Track } from '../types'

/**
 * URL segment for a song page under /music/<album>/<song>.
 *
 * Derived from the track *title*, not from the audio filename. The filenames
 * carry production artifacts that don't belong in an indexable URL — "Rocks in
 * the Sea" ships as `rocks-in-the-sea-mix.mp3`, which would give
 * `/music/into-the-wild/rocks-in-the-sea-mix`.
 */
export function toSongSlug(title: string): string {
  return title
    .toLowerCase()
    // Drop apostrophes rather than turning them into separators, so
    // "Don't" reads as "dont" and not "don-t".
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export interface SongRef {
  slug: string
  track: Track
  trackNumber: number
}

/**
 * Every track on an album paired with its song-page slug.
 *
 * Titles that would collide after slugification get a `-<n>` suffix based on
 * track position, so each song keeps a unique, stable URL. Tracks whose title
 * slugifies to nothing are skipped — they have no addressable URL.
 */
export function toSongRefs(album: Album): SongRef[] {
  const seen = new Set<string>()

  return (album.tracklist ?? []).reduce<SongRef[]>((refs, track, index) => {
    const base = toSongSlug(track.title)
    if (!base) {
      return refs
    }

    let slug = base
    if (seen.has(slug)) {
      slug = `${base}-${index + 1}`
    }
    seen.add(slug)

    refs.push({ slug, track, trackNumber: index + 1 })
    return refs
  }, [])
}

export function findSongRef(album: Album, slug: string): SongRef | null {
  return toSongRefs(album).find((ref) => ref.slug === slug) ?? null
}
