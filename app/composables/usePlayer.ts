/*
 * The site's one audio engine: the music that follows people from page to page.
 *
 * Grown out of useAlbumPlayer (track-addressed, one element reused, cue vs.
 * play), but global: the element lives for the whole visit, not one page, so
 * nothing is torn down when the route or the layout changes. Two views read it:
 * the bar at the bottom of the light pages (PlayerBar, mounted once in app.vue)
 * and an album page's own dock. Because they share the engine, the "hand-off"
 * on an album page is just the bar stepping aside: the song and the second are
 * already the same.
 *
 * It only ever starts from a click. Pages with their own sound (the record
 * player, the films, the demo shelf) stop it; see PlayerBar and config/player.
 *
 * State is in useState so the server render and hydration agree (on the server
 * nothing ever plays); the element itself exists only in the browser.
 */

import type { Album } from '~~/shared/types'
import { FADE_MS } from '~/config/player'
import { lookFor } from '~/config/records'
import { toPlayerTracks, type PlayerTrack } from '~/composables/useAlbumPlayer'

export interface QueuedRecord {
  slug: string
  title: string
  /** Small cover for the bar and the lock screen. */
  thumb: string
  tracks: PlayerTrack[]
}

let audio: HTMLAudioElement | null = null
let fadeFrame = 0

const prefersReducedMotion = () =>
  import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const toQueuedRecord = (album: Album): QueuedRecord => ({
  slug: album.slug,
  title: album.title,
  thumb: lookFor(album.slug)?.thumb ?? album.coverImage,
  tracks: toPlayerTracks(album),
})

export function usePlayer() {
  const record = useState<QueuedRecord | null>('player-record', () => null)
  const index = useState<number | null>('player-index', () => null)
  const playing = useState('player-playing', () => false)
  const loading = useState('player-loading', () => false)
  const currentTime = useState('player-time', () => 0)
  const duration = useState('player-duration', () => 0)
  /** × pressed: stay hidden until the next play. */
  const closed = useState('player-closed', () => true)

  const track = computed<PlayerTrack | null>(() =>
    record.value && index.value !== null ? record.value.tracks[index.value] ?? null : null,
  )
  const effectiveDuration = computed(() => duration.value || track.value?.durationSec || 0)
  const progress = computed(() => {
    const total = effectiveDuration.value
    return total > 0 ? Math.min(1, currentTime.value / total) : 0
  })
  const hasNext = computed(() =>
    Boolean(record.value) && index.value !== null && index.value < record.value!.tracks.length - 1,
  )
  const hasPrev = computed(() => index.value !== null && index.value > 0)

  // --- the element ---------------------------------------------------------

  function ensureAudio(): HTMLAudioElement | null {
    if (!import.meta.client) return null
    if (audio) return audio

    const el = new Audio()
    el.preload = 'metadata'
    el.addEventListener('loadedmetadata', () => {
      duration.value = Number.isFinite(el.duration) ? el.duration : 0
    })
    el.addEventListener('timeupdate', () => {
      currentTime.value = el.currentTime
      updatePositionState()
    })
    el.addEventListener('play', () => {
      playing.value = true
      loading.value = false
    })
    el.addEventListener('pause', () => {
      playing.value = false
    })
    el.addEventListener('waiting', () => {
      loading.value = true
    })
    el.addEventListener('playing', () => {
      loading.value = false
    })
    el.addEventListener('ended', () => {
      playing.value = false
      if (hasNext.value) select(index.value! + 1, true)
      else currentTime.value = 0
    })
    el.addEventListener('error', () => {
      loading.value = false
      playing.value = false
    })
    audio = el
    // For checking by hand in dev that only one thing ever plays.
    if (import.meta.dev) (window as unknown as { __hdgAudio?: HTMLAudioElement }).__hdgAudio = el
    return el
  }

  /** The element, for the album screen's clock. Null on the server and before the first play. */
  const element = () => audio

  // --- media session -------------------------------------------------------

  function updateMediaSession() {
    if (!import.meta.client || !('mediaSession' in navigator)) return
    const t = track.value
    const r = record.value
    if (!t || !r) {
      navigator.mediaSession.metadata = null
      return
    }
    const art = new URL(r.thumb, window.location.origin).toString()
    navigator.mediaSession.metadata = new MediaMetadata({
      title: t.title,
      artist: 'Havre De Grace',
      album: r.title,
      artwork: [{ src: art, sizes: '640x640', type: 'image/jpeg' }],
    })
  }

  function updatePositionState() {
    if (!audio || !('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return
    const total = effectiveDuration.value
    if (!total) return
    try {
      navigator.mediaSession.setPositionState({
        duration: total,
        position: Math.min(audio.currentTime, total),
        playbackRate: audio.playbackRate,
      })
    }
    catch {
      // A position past a not-yet-known duration throws; the next update fixes it.
    }
  }

  function bindMediaSession() {
    if (!import.meta.client || !('mediaSession' in navigator)) return
    const set = (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler)
      }
      catch {
        // Not every browser knows every action.
      }
    }
    set('play', () => play())
    set('pause', () => pause())
    set('previoustrack', () => prev())
    set('nexttrack', () => next())
    set('seekto', (details) => {
      if (details.seekTime != null) seek(details.seekTime)
    })
    set('stop', () => close())
  }

  // --- transport -----------------------------------------------------------

  function cancelFade() {
    if (fadeFrame) cancelAnimationFrame(fadeFrame)
    fadeFrame = 0
    if (audio) audio.volume = 1
  }

  function select(next: number, shouldPlay = true) {
    const r = record.value
    const target = r?.tracks[next]
    if (!target) return
    const el = ensureAudio()
    const changed = index.value !== next || !el?.src.endsWith(target.audioSrc)
    index.value = next
    if (!el) return
    cancelFade()
    if (changed) {
      currentTime.value = 0
      duration.value = 0
      el.src = target.audioSrc
      el.load()
    }
    updateMediaSession()
    if (shouldPlay) {
      closed.value = false
      loading.value = true
      el.play().catch(() => {
        loading.value = false
        playing.value = false
      })
    }
  }

  /**
   * Play a record from a track (0-based), or carry on if that track is already
   * the one loaded. Every play button on the site comes through here.
   */
  function playAlbum(album: Album, trackIndex = 0, at?: number) {
    if (record.value?.slug !== album.slug) {
      record.value = toQueuedRecord(album)
      index.value = null
    }
    bindMediaSession()
    select(trackIndex, true)
    if (at != null) seek(at)
  }

  /**
   * Load a track without playing it: a shared link to /music/<album>#<song>
   * opens on that song, silent, until someone presses play.
   */
  function cueAlbum(album: Album, trackIndex = 0) {
    if (record.value?.slug !== album.slug) {
      record.value = toQueuedRecord(album)
      index.value = null
    }
    select(trackIndex, false)
  }

  /** Is this record (and this track, if given) the one loaded? */
  const isCurrent = (slug: string, trackIndex?: number) =>
    record.value?.slug === slug && (trackIndex === undefined || index.value === trackIndex)

  /** Is this record (and track) loaded and sounding? */
  const isPlaying = (slug: string, trackIndex?: number) => playing.value && isCurrent(slug, trackIndex)

  /** A record's play button: start it, or pause/resume it if it's the one loaded. */
  function toggleAlbum(album: Album, trackIndex?: number) {
    if (isCurrent(album.slug, trackIndex) && index.value !== null) {
      toggle()
      return
    }
    playAlbum(album, trackIndex ?? 0)
  }

  function play() {
    if (index.value === null) {
      if (record.value) select(0, true)
      return
    }
    const el = ensureAudio()
    if (!el) return
    cancelFade()
    closed.value = false
    loading.value = true
    el.play().catch(() => {
      loading.value = false
    })
  }

  function pause() {
    audio?.pause()
  }

  function toggle() {
    if (playing.value) pause()
    else play()
  }

  function next() {
    if (hasNext.value) select(index.value! + 1, true)
  }

  /** More than a few seconds in, previous restarts the song. */
  function prev() {
    if (index.value === null) return
    if (currentTime.value > 3) {
      seek(0)
      return
    }
    if (hasPrev.value) select(index.value - 1, true)
  }

  function seek(seconds: number) {
    const el = ensureAudio()
    if (!el) return
    const total = effectiveDuration.value
    const clamped = Math.max(0, total ? Math.min(seconds, total) : seconds)
    el.currentTime = clamped
    currentTime.value = clamped
  }

  function seekProgress(fraction: number) {
    seek(Math.max(0, Math.min(1, fraction)) * effectiveDuration.value)
  }

  /** Fade the sound out and stop. Resolves once it's quiet. */
  function fadeOutAndStop(ms = FADE_MS): Promise<void> {
    const el = audio
    if (!el || el.paused) {
      el?.pause()
      return Promise.resolve()
    }
    if (prefersReducedMotion() || ms <= 0) {
      el.pause()
      el.volume = 1
      return Promise.resolve()
    }
    if (fadeFrame) cancelAnimationFrame(fadeFrame)
    const from = el.volume
    const start = performance.now()
    return new Promise((resolve) => {
      const step = (now: number) => {
        // A frame stamp can be a moment older than `start`; clamp it.
        const k = Math.max(0, Math.min(1, (now - start) / ms))
        el.volume = Math.min(1, Math.max(0, from * (1 - k)))
        if (k < 1) {
          fadeFrame = requestAnimationFrame(step)
          return
        }
        fadeFrame = 0
        el.pause()
        el.volume = 1
        resolve()
      }
      fadeFrame = requestAnimationFrame(step)
    })
  }

  /** ×: stop, and hide the bar until the next play. */
  function close() {
    closed.value = true
    audio?.pause()
  }

  return {
    record, index, track, playing, loading, currentTime, closed,
    duration: effectiveDuration, progress, hasNext, hasPrev,
    playAlbum, cueAlbum, toggleAlbum, isCurrent, isPlaying,
    play, pause, toggle, next, prev, seek, seekProgress, select,
    fadeOutAndStop, close, element,
  }
}
