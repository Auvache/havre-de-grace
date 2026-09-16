/*
 * The engine behind /tools/demos — a private demo shelf, not a record player.
 *
 * The design goal is A/B speed: the whole point of the page is hearing take 2
 * against take 4 without waiting for anything, so the player is built around
 * three ideas.
 *
 *   1. An element pool. Every track that has been touched keeps its own
 *      HTMLAudioElement, already buffered and decoded, so going back to one is
 *      instant rather than a fresh fetch. Only one ever plays at a time.
 *   2. Neighbour warming. Selecting a track also starts fetching the one
 *      either side of it in the current order, because the next thing you do
 *      is almost always press next or previous.
 *   3. Position matching. Switching tracks carries the playhead across, so
 *      comparing the second chorus of four takes is four button presses at the
 *      same point in the song rather than four scrubs.
 *
 * None of it assumes a format. `file` is whatever is sitting in public/demos,
 * so uncompressed masters and compressed derivatives can share a playlist and
 * the same file can be swapped from .wav to .mp3 without touching this.
 */

import type { MaybeRefOrGetter } from 'vue'

/** One file on the shelf. `file` is a bare filename inside public/demos. */
export interface DemoTrack {
  title: string
  file: string
  note?: string
}

export interface DemoPlaylist {
  name: string
  note?: string
  tracks: DemoTrack[]
}

export interface DemoLibrary {
  playlists: DemoPlaylist[]
}

/** Every demo lives in one flat folder; the playlists are just orderings of it. */
export const DEMO_DIR = '/demos'

export const demoSrc = (file: string) => `${DEMO_DIR}/${encodeURIComponent(file)}`

/**
 * How many audio elements stay warm at once.
 *
 * Each one holds its buffered audio in memory, and an uncompressed master runs
 * to tens of megabytes, so this is a memory ceiling rather than a performance
 * dial. Six covers a current track plus both neighbours plus the last handful
 * compared against it, which is the shape of an actual A/B session.
 */
const POOL_LIMIT = 6

export const formatTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00'
  }
  const total = Math.floor(seconds)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

export interface DemoPlayerOptions {
  /** Fetch the tracks either side of the current one. */
  preloadNeighbours?: boolean
  /** Carry the playhead across a track change. */
  matchPosition?: boolean
  /**
   * Where a file's audio should be read from.
   *
   * Handed the bare filename, this returns a local blob URL when the file is
   * in the offline cache (see useDemoCache) and null when it is not, in which
   * case the player streams it from the network as before. Keeping it as an
   * injected function means the player has no idea a cache exists and works
   * identically without one.
   */
  resolveSrc?: (file: string) => Promise<string | null>
}

export const useDemoPlayer = (
  library: MaybeRefOrGetter<DemoLibrary | null | undefined>,
  options: DemoPlayerOptions = {},
) => {
  const preloadNeighbours = ref(options.preloadNeighbours ?? true)
  const matchPosition = ref(options.matchPosition ?? false)

  const playlistIndex = ref(0)
  /**
   * Index into the *playlist's own* track array, not into `order`.
   *
   * Identifying the current track by its permanent index is what lets the
   * order be rearranged underneath a playing track without the playhead
   * jumping to whatever slid into its slot.
   */
  const trackIndex = ref<number | null>(null)

  /** Per-playlist running order, as a permutation of track indices. */
  const orders = ref<Record<number, number[]>>({})

  const playing = ref(false)
  const stalled = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(1)
  const error = ref<string | null>(null)

  const playlists = computed<DemoPlaylist[]>(() => toValue(library)?.playlists ?? [])
  const playlist = computed<DemoPlaylist | null>(() => playlists.value[playlistIndex.value] ?? null)

  const naturalOrder = (index: number) =>
    (playlists.value[index]?.tracks ?? []).map((_, i) => i)

  const order = computed<number[]>(() =>
    orders.value[playlistIndex.value] ?? naturalOrder(playlistIndex.value),
  )

  /** The playlist's tracks in the order currently on screen. */
  const orderedTracks = computed(() =>
    order.value
      .map((index) => ({ index, track: playlist.value?.tracks[index] }))
      .filter((entry): entry is { index: number, track: DemoTrack } => Boolean(entry.track)),
  )

  const track = computed<DemoTrack | null>(() =>
    trackIndex.value == null ? null : playlist.value?.tracks[trackIndex.value] ?? null,
  )

  /** Where the current track sits in the running order, or -1. */
  const position = computed(() =>
    trackIndex.value == null ? -1 : order.value.indexOf(trackIndex.value),
  )

  const progress = computed(() => (duration.value ? currentTime.value / duration.value : 0))

  const isReordered = computed(() => {
    const current = orders.value[playlistIndex.value]
    return Boolean(current) && current!.some((value, i) => value !== i)
  })

  // --- the element pool ----------------------------------------------------
  interface PoolItem {
    element: HTMLAudioElement
    /** True when `element.src` is a blob URL that has to be revoked on eviction. */
    local: boolean
  }

  /** file -> element, in least-recently-used-first insertion order. */
  const pool = new Map<string, PoolItem>()
  let current: HTMLAudioElement | null = null
  let detach: (() => void) | null = null
  /**
   * Which `select` call is the live one. Resolving a source is asynchronous
   * now, so a fast second click has to be able to invalidate the first.
   */
  let selectToken = 0
  /**
   * Items dropped from the pool while still audible.
   *
   * `forget` is called when the offline copy behind a file changes or is
   * cleared, and cutting the music off mid-bar to honour that would be worse
   * than finishing the take. So the item leaves the pool — the next select
   * builds a fresh element from whatever the cache now holds — and its blob URL
   * is revoked once it stops being the current element.
   */
  const orphans = new Set<PoolItem>()

  const release = (item: PoolItem) => {
    item.element.pause()
    const src = item.element.src
    // Dropping the source is what actually releases the buffered audio; just
    // discarding the reference leaves the media element alive in the
    // document's media list until GC gets round to it.
    item.element.removeAttribute('src')
    item.element.load()
    if (item.local && src.startsWith('blob:')) {
      URL.revokeObjectURL(src)
    }
  }

  const evict = (protect?: string) => {
    const keep = new Set(
      [position.value - 1, position.value, position.value + 1]
        .map((slot) => order.value[slot])
        .filter((index): index is number => index != null)
        .map((index) => playlist.value?.tracks[index]?.file)
        .filter((file): file is string => Boolean(file)),
    )
    if (protect) {
      keep.add(protect)
    }

    for (const [file, item] of pool) {
      if (pool.size <= POOL_LIMIT) {
        break
      }
      if (keep.has(file) || item.element === current) {
        continue
      }
      release(item)
      pool.delete(file)
    }
  }

  const acquire = async (file: string): Promise<PoolItem | null> => {
    if (!import.meta.client) {
      return null
    }

    const existing = pool.get(file)
    if (existing) {
      // Re-insert so the map stays ordered least-recently-used first.
      pool.delete(file)
      pool.set(file, existing)
      return existing
    }

    const local = (await options.resolveSrc?.(file)) ?? null

    // A second call for the same file may have landed while that was resolving.
    const raced = pool.get(file)
    if (raced) {
      if (local) {
        URL.revokeObjectURL(local)
      }
      return raced
    }

    const element = new Audio()
    element.preload = 'auto'
    element.volume = volume.value
    element.src = local ?? demoSrc(file)

    const item: PoolItem = { element, local: Boolean(local) }
    pool.set(file, item)
    evict(file)
    return item
  }

  /**
   * Drop one file from the pool, or all of them, so the next play of it is
   * rebuilt from source. What the offline cache holds has changed underneath us.
   */
  const forget = (file?: string) => {
    for (const [key, item] of [...pool]) {
      if (file && key !== file) {
        continue
      }
      pool.delete(key)
      if (item.element === current) {
        orphans.add(item)
      } else {
        release(item)
      }
    }
  }

  const sweepOrphans = () => {
    for (const item of [...orphans]) {
      if (item.element !== current) {
        release(item)
        orphans.delete(item)
      }
    }
  }

  /** Build a track's element without making it current. */
  const cue = (slot: number) => {
    const index = order.value[slot]
    const file = index == null ? null : playlist.value?.tracks[index]?.file
    if (file) {
      void acquire(file)
    }
  }

  /** Cue a neighbour, if neighbour preloading is on. */
  const warm = (slot: number) => {
    if (preloadNeighbours.value) {
      cue(slot)
    }
  }

  const bind = (element: HTMLAudioElement) => {
    const onTime = () => {
      currentTime.value = element.currentTime
      stalled.value = false
    }
    const onMeta = () => {
      duration.value = Number.isFinite(element.duration) ? element.duration : 0
    }
    const onPlay = () => {
      playing.value = true
      error.value = null
    }
    const onPause = () => {
      playing.value = false
    }
    const onWaiting = () => {
      stalled.value = true
    }
    const onEnded = () => {
      playing.value = false
      next({ autoplay: true })
    }
    const onError = () => {
      playing.value = false
      stalled.value = false
      error.value = `Could not load ${track.value?.file ?? 'that file'}. Is it in public/demos?`
    }

    element.addEventListener('timeupdate', onTime)
    element.addEventListener('loadedmetadata', onMeta)
    element.addEventListener('durationchange', onMeta)
    element.addEventListener('play', onPlay)
    element.addEventListener('pause', onPause)
    element.addEventListener('waiting', onWaiting)
    element.addEventListener('playing', onTime)
    element.addEventListener('ended', onEnded)
    element.addEventListener('error', onError)

    onMeta()
    currentTime.value = element.currentTime

    return () => {
      element.removeEventListener('timeupdate', onTime)
      element.removeEventListener('loadedmetadata', onMeta)
      element.removeEventListener('durationchange', onMeta)
      element.removeEventListener('play', onPlay)
      element.removeEventListener('pause', onPause)
      element.removeEventListener('waiting', onWaiting)
      element.removeEventListener('playing', onTime)
      element.removeEventListener('ended', onEnded)
      element.removeEventListener('error', onError)
    }
  }

  // --- transport -----------------------------------------------------------
  interface SelectOptions {
    /** Play once it is ready. Defaults to whatever the deck was already doing. */
    autoplay?: boolean
    /** Start here instead of at zero, or wherever `matchPosition` says. */
    seekTo?: number
  }

  const select = async (index: number, selectOptions: SelectOptions = {}) => {
    const file = playlist.value?.tracks[index]?.file
    if (!file) {
      return
    }

    const carried = matchPosition.value ? currentTime.value : 0
    const shouldPlay = selectOptions.autoplay ?? playing.value
    const target = selectOptions.seekTo ?? carried

    // Everything that the click should change happens before the first await,
    // so the row highlights and the old track stops the instant you press it —
    // not when a 50 MB blob has finished coming off disk.
    current?.pause()
    detach?.()
    detach = null
    current = null
    sweepOrphans()
    playing.value = false
    trackIndex.value = index
    currentTime.value = target
    duration.value = 0
    error.value = null

    const token = ++selectToken
    const item = await acquire(file)
    if (!item || token !== selectToken) {
      // Superseded by a later select. Whatever that one picked is now current;
      // this call must not touch it.
      return
    }

    const element = item.element
    current = element
    detach = bind(element)

    if (target > 0) {
      // A freshly created element has no duration yet, so the seek has to wait
      // for metadata or it is silently dropped.
      const seek = () => {
        const limit = Number.isFinite(element.duration) ? element.duration : 0
        element.currentTime = limit ? Math.min(target, Math.max(limit - 0.25, 0)) : target
        currentTime.value = element.currentTime
      }
      if (element.readyState >= 1) {
        seek()
      } else {
        element.addEventListener('loadedmetadata', seek, { once: true })
      }
    } else {
      element.currentTime = 0
      currentTime.value = 0
    }

    if (shouldPlay) {
      void element.play().catch(() => {
        // Autoplay policy, or a file that is not there. The `error` listener
        // covers the second case; the first only needs the button to go back
        // to showing "play".
        playing.value = false
      })
    }

    const slot = order.value.indexOf(index)
    warm(slot + 1)
    warm(slot - 1)
    evict()
  }

  const play = () => {
    if (!current) {
      const first = order.value[0]
      if (first != null) {
        select(first, { autoplay: true })
      }
      return
    }
    void current.play().catch(() => {
      playing.value = false
    })
  }

  const pause = () => {
    current?.pause()
  }

  const toggle = () => (playing.value ? pause() : play())

  const step = (delta: number, stepOptions: SelectOptions = {}) => {
    const tracks = order.value
    if (!tracks.length) {
      return
    }
    const from = position.value < 0 ? (delta > 0 ? -1 : 0) : position.value
    const slot = from + delta
    if (slot < 0 || slot >= tracks.length) {
      // No wraparound: running off either end of a comparison set should stop,
      // not loop you back round to the take you just rejected.
      return
    }
    select(tracks[slot] as number, stepOptions)
  }

  const next = (nextOptions: SelectOptions = {}) => step(1, nextOptions)

  /**
   * Previous, with the convention every player uses: part-way into a track it
   * restarts that track, and only jumps back from the first couple of seconds.
   */
  const previous = () => {
    if (current && currentTime.value > 2.5 && !matchPosition.value) {
      current.currentTime = 0
      currentTime.value = 0
      return
    }
    step(-1)
  }

  const seek = (seconds: number) => {
    if (!current || !duration.value) {
      return
    }
    current.currentTime = Math.min(Math.max(seconds, 0), duration.value)
    currentTime.value = current.currentTime
  }

  const seekToProgress = (fraction: number) => seek(fraction * duration.value)

  // --- ordering ------------------------------------------------------------
  /**
   * Deliberately in-memory only. The running order is a scratch surface for one
   * listening session, and a reload is the way back to the order the JSON
   * declares.
   */
  const move = (from: number, to: number) => {
    const list = [...order.value]
    if (to < 0 || to >= list.length || from < 0 || from >= list.length) {
      return
    }
    const [moved] = list.splice(from, 1)
    list.splice(to, 0, moved as number)
    orders.value = { ...orders.value, [playlistIndex.value]: list }

    // The neighbours changed even though the track did not.
    const slot = position.value
    warm(slot + 1)
    warm(slot - 1)
  }

  const resetOrder = () => {
    const { [playlistIndex.value]: _dropped, ...rest } = orders.value
    orders.value = rest
  }

  const selectPlaylist = (index: number) => {
    if (index === playlistIndex.value) {
      return
    }
    pause()
    // Invalidate any select still resolving, or it will make itself current
    // inside the playlist we just left.
    selectToken += 1
    playlistIndex.value = index
    detach?.()
    detach = null
    current = null
    trackIndex.value = null
    currentTime.value = 0
    duration.value = 0
    error.value = null
  }

  watch(volume, (value) => {
    for (const item of pool.values()) {
      item.element.volume = value
    }
  })

  watch(preloadNeighbours, (enabled) => {
    if (enabled) {
      warm(position.value + 1)
      warm(position.value - 1)
    }
  })

  onBeforeUnmount(() => {
    detach?.()
    current = null
    sweepOrphans()
    for (const item of pool.values()) {
      release(item)
    }
    pool.clear()
  })

  return {
    // state
    playlists,
    playlist,
    playlistIndex: readonly(playlistIndex),
    orderedTracks,
    track,
    trackIndex: readonly(trackIndex),
    position,
    playing: readonly(playing),
    stalled: readonly(stalled),
    currentTime: readonly(currentTime),
    duration: readonly(duration),
    progress,
    error: readonly(error),
    isReordered,
    // settings
    volume,
    preloadNeighbours,
    matchPosition,
    // transport
    select,
    play,
    pause,
    toggle,
    next,
    previous,
    seek,
    seekToProgress,
    // ordering
    move,
    resetOrder,
    selectPlaylist,
    // cache coherence
    forget,
    cue,
  }
}

/** The shape the transport and track list are handed. */
export type DemoPlayerApi = ReturnType<typeof useDemoPlayer>
