/*
 * The engine behind the album pages — one record, played in the page.
 *
 * This is deliberately not useVinylDeck. The deck models a *side* of vinyl as
 * one continuous surface because that is what /listen is pretending to be; an
 * album page is a list of songs, and the thing a visitor wants from it is "play
 * that one" and "send that one to a friend". So this is track-addressed, not
 * seconds-across-the-side, and every track has a URL.
 *
 * Three things it owns:
 *
 *   1. One audio element, reused. An album page is a browsing surface — people
 *      skip. A pool (as in useDemoPlayer) buys instant A/B at the cost of
 *      holding every touched track in memory, which is the right trade for a
 *      demo shelf and the wrong one here, where the files are final masters and
 *      the next press is usually "next".
 *   2. The hash. `/music/into-the-wild#ivory` cues Ivory, and selecting a track
 *      rewrites the hash so the address bar is always a shareable link to what
 *      you are hearing. The slugs come from toSongSlug, so a hash link and the
 *      song page at /music/<album>/<slug> agree by construction.
 *   3. Cue vs. play. Arriving on a link cues the track and leaves it paused.
 *      Browsers block autoplay anyway, but the reason to do it deliberately is
 *      that a shared link should open where the sender meant, not start making
 *      noise at whoever opened it.
 */

import type { MaybeRefOrGetter } from 'vue'
import type { Album, Credit } from '~~/shared/types'
import { toSongRefs } from '~~/shared/utils/songSlug'

export interface PlayerTrack {
  /** 1-based position on the album. */
  number: number
  /** URL segment — matches this track's song page and its share hash. */
  slug: string
  title: string
  audioSrc: string
  /** Declared running time, e.g. "3:25". Used before metadata loads. */
  durationLabel: string
  /** Declared running time in seconds, from the content file. */
  durationSec: number
  lyrics: string
  /** Vinyl side this track sits on, when the album declares sides. */
  side: 'a' | 'b'
  // --- The per-song archive, shown in the details panel. All optional in the
  // content file; a song that has none of it simply shows its words. ---
  writingStory?: string
  recordingDetails?: string
  credits: Credit[]
}

export const formatClock = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

const parseDurationLabel = (value?: string): number => {
  if (!value) return 0
  const parts = value.split(':').map(Number)
  if (parts.some(Number.isNaN)) return 0
  return parts.reduce((acc, part) => acc * 60 + part, 0)
}

/**
 * Turn a content-collection album into the player's track list.
 *
 * Tracks without an `audio` path are dropped rather than rendered as dead rows:
 * a track you cannot play does not belong in a player, and the album page still
 * lists the full tracklist separately if it wants to.
 */
export function toPlayerTracks(album: Album | null | undefined): PlayerTrack[] {
  if (!album) return []

  const sideOf = (trackNumber: number): 'a' | 'b' =>
    album.sides?.b?.includes(trackNumber) ? 'b' : 'a'

  return toSongRefs(album)
    .filter((ref) => Boolean(ref.track.audio))
    .map((ref) => ({
      number: ref.trackNumber,
      slug: ref.slug,
      title: ref.track.title,
      audioSrc: ref.track.audio!,
      durationLabel: ref.track.duration ?? '0:00',
      durationSec: parseDurationLabel(ref.track.duration),
      lyrics: ref.track.lyrics?.trim() ?? '',
      side: sideOf(ref.trackNumber),
      writingStory: ref.track.writingStory?.trim() || undefined,
      recordingDetails: ref.track.recordingDetails?.trim() || undefined,
      credits: ref.track.credits ?? [],
    }))
}

export interface AlbumPlayerOptions {
  /**
   * Keep `location.hash` pointed at the selected track.
   *
   * On by default, and the reason the album page is shareable at all. Turn it
   * off for a player that is not the page's primary subject (a sidebar preview,
   * a second player on the same route) — two writers fighting over one hash
   * would make both links wrong.
   */
  syncHash?: boolean
  /** Advance to the next track when one ends. */
  autoAdvance?: boolean
}

export function useAlbumPlayer(
  source: MaybeRefOrGetter<PlayerTrack[]>,
  options: AlbumPlayerOptions = {},
) {
  const syncHash = options.syncHash ?? true
  const autoAdvance = options.autoAdvance ?? true

  const tracks = computed<PlayerTrack[]>(() => toValue(source) ?? [])

  /** null = nothing cued yet; the page is at rest and no track is selected. */
  const index = ref<number | null>(null)
  const playing = ref(false)
  const loading = ref(false)
  const currentTime = ref(0)
  /** Real decoded duration once metadata lands; falls back to the declared one. */
  const duration = ref(0)
  const volume = ref(1)
  const muted = ref(false)
  const error = ref<string | null>(null)

  const track = computed<PlayerTrack | null>(() =>
    index.value === null ? null : tracks.value[index.value] ?? null,
  )

  const effectiveDuration = computed(() =>
    duration.value || track.value?.durationSec || 0,
  )

  const progress = computed(() => {
    const total = effectiveDuration.value
    return total > 0 ? Math.min(1, currentTime.value / total) : 0
  })

  const hasNext = computed(() =>
    index.value !== null && index.value < tracks.value.length - 1,
  )
  const hasPrev = computed(() => index.value !== null && index.value > 0)

  // --- the element ---------------------------------------------------------

  let audio: HTMLAudioElement | null = null

  /*
   * Detaches every listener below in one call on teardown.
   *
   * Without it, pausing and clearing `src` during unmount makes the element
   * emit a last `timeupdate` (and an `error`, from the empty source) *after*
   * the reference has been dropped, and the handlers threw on a null `audio`.
   * The listeners also close over `el` rather than the mutable outer binding,
   * so a late event that slips through still reads a real element.
   */
  let listeners: AbortController | null = null

  function ensureAudio(): HTMLAudioElement | null {
    if (!import.meta.client) return null
    if (audio) return audio

    const el = new Audio()
    el.preload = 'metadata'
    el.volume = volume.value

    listeners = new AbortController()
    const { signal } = listeners
    const on = (type: string, handler: () => void) =>
      el.addEventListener(type, handler, { signal })

    on('loadedmetadata', () => {
      duration.value = Number.isFinite(el.duration) ? el.duration : 0
    })
    on('timeupdate', () => {
      currentTime.value = el.currentTime
    })
    on('play', () => {
      playing.value = true
      loading.value = false
    })
    on('pause', () => {
      playing.value = false
    })
    on('waiting', () => {
      loading.value = true
    })
    on('playing', () => {
      loading.value = false
    })
    on('ended', () => {
      playing.value = false
      if (autoAdvance && hasNext.value) {
        select(index.value! + 1, { play: true })
      }
      else {
        currentTime.value = 0
      }
    })
    on('error', () => {
      loading.value = false
      playing.value = false
      error.value = 'That track could not be loaded.'
    })

    audio = el
    return el
  }

  watch(volume, (value) => {
    if (audio) audio.volume = value
  })
  watch(muted, (value) => {
    if (audio) audio.muted = value
  })

  // --- hash ----------------------------------------------------------------

  /**
   * Rewrite the hash without routing.
   *
   * `history.replaceState` rather than `router.replace`: the hash here is a
   * bookmark for the track, not a navigation, and pushing it through the router
   * would fire scrollBehavior and yank the page to the anchor every time a
   * track changed — including on autoplay-advance, where the visitor did not
   * ask to go anywhere.
   */
  function writeHash(slug: string | null) {
    if (!import.meta.client || !syncHash) return
    const url = new URL(window.location.href)
    url.hash = slug ? `#${slug}` : ''
    window.history.replaceState(window.history.state, '', url.toString())
  }

  /** The absolute, shareable URL for a track. */
  function shareUrl(slug: string): string {
    if (!import.meta.client) return `#${slug}`
    const url = new URL(window.location.href)
    url.hash = `#${slug}`
    return url.toString()
  }

  /**
   * Copy a track's link, reporting whether it worked.
   *
   * The clipboard API needs a secure context and is refused outright by some
   * embedded browsers, so the caller gets a boolean to decide between "Copied"
   * and leaving its normal label up — the one thing it must not do is claim a
   * copy that did not happen.
   */
  async function copyShareUrl(slug: string): Promise<boolean> {
    if (!import.meta.client) return false
    try {
      await navigator.clipboard.writeText(shareUrl(slug))
      return true
    }
    catch {
      return false
    }
  }

  // --- transport -----------------------------------------------------------

  interface SelectOptions {
    /** Start playing once loaded. Off means cue it and wait. */
    play?: boolean
    /** Leave the hash alone (used by the initial read, which came from it). */
    silent?: boolean
  }

  function select(next: number, { play: shouldPlay = true, silent = false }: SelectOptions = {}) {
    const target = tracks.value[next]
    if (!target) return

    const changed = index.value !== next
    index.value = next
    error.value = null

    if (!silent) writeHash(target.slug)

    const el = ensureAudio()
    if (!el) return

    if (changed) {
      currentTime.value = 0
      duration.value = 0
      el.src = target.audioSrc
      el.load()
    }

    if (shouldPlay) {
      loading.value = true
      el.play().catch(() => {
        // An autoplay refusal is not an error worth showing — the track is
        // cued and the visitor's next press will start it.
        loading.value = false
        playing.value = false
      })
    }
  }

  function selectBySlug(slug: string, opts: SelectOptions = {}) {
    const found = tracks.value.findIndex((item) => item.slug === slug)
    if (found !== -1) select(found, opts)
  }

  function play() {
    if (index.value === null) {
      select(0)
      return
    }
    const el = ensureAudio()
    if (!el) return
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

  /** Press on the track that is already playing = pause. Anywhere else = go there. */
  function toggleTrack(next: number) {
    if (index.value === next) toggle()
    else select(next)
  }

  function next() {
    if (hasNext.value) select(index.value! + 1)
  }

  /**
   * Previous, the way a transport button behaves: more than a few seconds into
   * a track, it restarts that track instead of leaving it.
   */
  function prev() {
    if (index.value === null) return
    if (currentTime.value > 3) {
      seek(0)
      return
    }
    if (hasPrev.value) select(index.value - 1)
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

  // --- lifecycle -----------------------------------------------------------

  /**
   * Open on whatever the link asked for.
   *
   * Cued, never played, and `silent` so reading the hash does not immediately
   * rewrite it. An unknown fragment is ignored rather than corrected — the page
   * has other anchors (#tracks, #credits) and they are not this player's to
   * take over.
   */
  function openFromHash() {
    if (!import.meta.client || !syncHash) return
    const slug = window.location.hash.replace(/^#/, '')
    if (!slug) return
    selectBySlug(slug, { play: false, silent: true })
  }

  onMounted(() => {
    openFromHash()
    window.addEventListener('hashchange', openFromHash)
  })

  onBeforeUnmount(() => {
    if (import.meta.client) {
      window.removeEventListener('hashchange', openFromHash)
    }
    // Detach first: pausing and clearing the source both fire events, and by
    // this point the component they would update is going away.
    listeners?.abort()
    listeners = null

    if (audio) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      audio = null
    }
  })

  return {
    // state
    tracks, index, track, playing, loading, error,
    currentTime, duration: effectiveDuration, progress, volume, muted,
    hasNext, hasPrev,
    // transport
    select, selectBySlug, toggleTrack, play, pause, toggle, next, prev,
    seek, seekProgress,
    // sharing
    shareUrl, copyShareUrl,
  }
}
