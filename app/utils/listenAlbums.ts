/*
 * Content layer for the /listen record player.
 *
 * Turns the `music` content collection into the shape the deck needs: albums
 * split into vinyl sides, each track carrying its own duration, lyrics and
 * liner notes. Every field the page renders is real content — where an album
 * hasn't got liner notes or per-song credits yet, the page simply omits that
 * section rather than filling it in.
 */
import type { Album, Credit } from '~~/shared/types'

export interface ListenTrack {
  number: number // 1-based index within the album
  side: 'a' | 'b'
  sideNumber: number // 1-based index within its side (A1, A2, ...)
  slug: string
  title: string
  audioSrc: string
  durationSec: number
  durationLabel: string // "3:25"
  lyrics: string[] // blank strings mark verse breaks
  writingStory?: string
  recordingDetails?: string
  credits: Credit[]
}

export interface ListenAlbum {
  title: string
  slug: string
  artist: string
  year: number
  coverImage: string
  coverAlt: string
  /** The accent the scene tints itself with, picked to sit with the cover art. */
  accent: string
  linerNotes?: string
  credits: Credit[]
  tracks: ListenTrack[]
}

const ALBUM_ACCENT: Record<string, string> = {
  'into-the-wild': '#6f9ec4',
  'i-want-to-be-yours-and-other-songs': '#c9a15e',
}

const DEFAULT_ACCENT = '#c9a15e'

// --- helpers -------------------------------------------------------------

export function parseDuration(value?: string): number {
  if (!value) return 0
  const parts = value.split(':').map(Number)
  if (parts.some(Number.isNaN)) return 0
  return parts.reduce((acc, part) => acc * 60 + part, 0)
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function splitLyrics(lyrics?: string): string[] {
  if (!lyrics) return []
  return lyrics.replace(/\r\n/g, '\n').split('\n').map((line) => line.trimEnd())
    .filter((line, i, arr) => !(line.trim() === '' && (i === 0 || i === arr.length - 1)))
}

/** Parse a YYYY-MM-DD string as a local date. */
function parseIsoDate(value?: string | null): Date | null {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * An album reaches the turntable when it's visible, isn't a single, has audio,
 * and has actually come out. The release-date gate matters: track audio is
 * committed to the repo ahead of release day, and this is what keeps an
 * unreleased record off the deck.
 */
export function isListenable(album: Album, now: Date = new Date()): boolean {
  if (album.isVisible === false || album.isSingle) return false
  const date = parseIsoDate(album.releaseDate)
  const released = date ? date.getTime() <= now.getTime() : true
  return released && (album.tracklist ?? []).some((track) => Boolean(track.audio))
}

/** Which vinyl side each 1-based track index sits on. */
function resolveSides(album: Album, count: number): Array<'a' | 'b'> {
  const out: Array<'a' | 'b'> = Array.from({ length: count }, () => 'a')
  const explicit = album.sides
  if (explicit && ((explicit.a?.length ?? 0) > 0 || (explicit.b?.length ?? 0) > 0)) {
    for (const n of explicit.a ?? []) if (n >= 1 && n <= count) out[n - 1] = 'a'
    for (const n of explicit.b ?? []) if (n >= 1 && n <= count) out[n - 1] = 'b'
    return out
  }
  const half = Math.ceil(count / 2)
  return out.map((_, i) => (i < half ? 'a' : 'b'))
}

// --- builders ------------------------------------------------------------

function toListenAlbum(album: Album): ListenAlbum {
  const list = (album.tracklist ?? []).filter((track) => Boolean(track.audio))
  const sideOf = resolveSides(album, list.length)
  const counters = { a: 0, b: 0 }

  const tracks: ListenTrack[] = list.map((track, i) => {
    const side = sideOf[i]!
    counters[side] += 1
    const durationSec = parseDuration(track.duration)
    return {
      number: i + 1,
      side,
      sideNumber: counters[side],
      slug: slugify(track.title),
      title: track.title,
      audioSrc: track.audio!,
      durationSec,
      durationLabel: track.duration ?? formatDuration(durationSec),
      lyrics: splitLyrics(track.lyrics),
      writingStory: track.writingStory?.trim() || undefined,
      recordingDetails: track.recordingDetails?.trim() || undefined,
      credits: track.credits ?? [],
    }
  })

  return {
    title: album.title,
    slug: album.slug,
    artist: 'Havre De Grace',
    year: album.year,
    coverImage: album.coverImage,
    coverAlt: album.coverAlt,
    accent: ALBUM_ACCENT[album.slug] ?? DEFAULT_ACCENT,
    linerNotes: album.linerNotes?.trim() || undefined,
    credits: album.credits ?? [],
    tracks,
  }
}

/** Every playable album, newest first. */
export function buildListenAlbums(albums: Album[], now: Date = new Date()): ListenAlbum[] {
  return albums
    .filter((album) => isListenable(album, now))
    .map(toListenAlbum)
    .filter((album) => album.tracks.length > 0)
    .sort((a, b) => b.year - a.year)
}

// --- side helpers --------------------------------------------------------

export function sideTracks(album: ListenAlbum | null, side: 'a' | 'b'): ListenTrack[] {
  return album?.tracks.filter((track) => track.side === side) ?? []
}

export function sideDuration(album: ListenAlbum | null, side: 'a' | 'b'): number {
  return sideTracks(album, side).reduce((sum, track) => sum + track.durationSec, 0)
}

/** Cumulative start offset (seconds into the side) for each track on the side. */
export function sideOffsets(tracks: ListenTrack[]): number[] {
  const offsets: number[] = []
  let acc = 0
  for (const track of tracks) {
    offsets.push(acc)
    acc += track.durationSec
  }
  return offsets
}

// --- visible groove bands ------------------------------------------------

/**
 * Real LPs show their songs: each track is a visibly distinct band, separated by
 * a bright hairline where the groove pitch changes. This builds that as a single
 * radial-gradient so the whole side is legible at a glance and you can aim the
 * needle at a specific song by eye.
 *
 * Radii are percentages of the record's RADIUS (`closest-side`), running from
 * `outer` (the lead-in) down to `inner` (the run-out, just outside the label).
 */
export function grooveBandGradient(
  durations: number[],
  offsets: number[],
  total: number,
  { outer = 95, inner = 45, current = -1, accent = '#ffffff' }: {
    outer?: number, inner?: number, current?: number, accent?: string
  } = {},
): string {
  if (!total || !durations.length) return 'none'
  const radius = (p: number) => outer - p * (outer - inner)
  const segments: Array<{ start: number, end: number, color: string }> = []
  const line = 'rgba(255,255,255,.22)'

  segments.push({ start: outer - 0.5, end: outer + 0.5, color: line })
  segments.push({ start: inner - 0.6, end: inner + 0.6, color: 'rgba(255,255,255,.14)' })

  durations.forEach((dur, i) => {
    const startP = (offsets[i] ?? 0) / total
    const endP = startP + dur / total
    const rStart = radius(startP)
    const rEnd = radius(endP)
    if (i < durations.length - 1) segments.push({ start: rEnd - 0.55, end: rEnd + 0.55, color: line })
    if (i === current) {
      segments.push({
        start: rEnd + 0.9,
        end: rStart - 0.9,
        color: `color-mix(in srgb, ${accent} 8%, transparent)`,
      })
    }
  })

  segments.sort((a, b) => a.start - b.start)

  const parts: string[] = []
  let cursor = 0
  for (const seg of segments) {
    const start = Math.max(cursor, seg.start)
    if (seg.end <= start) continue
    if (start > cursor) parts.push(`transparent ${cursor}%`, `transparent ${start}%`)
    parts.push(`${seg.color} ${start}%`, `${seg.color} ${seg.end}%`)
    cursor = seg.end
  }
  parts.push(`transparent ${cursor}%`, 'transparent 100%')
  return `radial-gradient(circle closest-side at 50% 50%, ${parts.join(', ')})`
}
