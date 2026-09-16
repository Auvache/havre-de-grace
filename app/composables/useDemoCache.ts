/*
 * Persistent offline storage for the demo shelf.
 *
 * The element pool in useDemoPlayer makes a track instant once you have touched
 * it *this session*. This makes it instant forever: every file is stored in the
 * Cache API, which survives reloads, tab closes and restarts, so the second
 * visit to /tools/demos plays a 50 MB master off local disk with no network at
 * all.
 *
 * ## Why the Cache API rather than a service worker
 *
 * The usual way to precache is a service worker, but a worker's scope is its
 * own directory — one registered under /tools could not intercept the requests
 * for /demos/*.wav, and one at the root would take control of the entire public
 * site to serve one unlisted page. The Cache API is available directly in the
 * window, with no worker and no scope, so the page opens its own cache and
 * hands the player a blob URL. Nothing outside /tools/demos is affected.
 *
 * ## Staleness
 *
 * A cache keyed on filenames has an obvious trap: replace a mix in place, keep
 * the name, and the browser happily plays last month's bounce forever. So every
 * entry is revalidated on load with a HEAD request — a few hundred bytes per
 * track — and dropped if the ETag, Last-Modified or length has moved. The
 * bodies are cached; the validators are checked.
 */
import { DEMO_DIR, demoSrc } from '~/composables/useDemoPlayer'

/**
 * Bump to invalidate every stored body at once — a change to what is stored or
 * to the headers stored alongside it, rather than a change to the audio.
 */
const CACHE_NAME = 'hdg-demos-v1'

/** Remembers the toggle between visits; the downloads themselves are the cache. */
const AUTO_KEY = 'hdg-demos-autocache'

export type CacheStatus = 'unknown' | 'missing' | 'downloading' | 'ready' | 'error'

export interface CacheEntry {
  status: CacheStatus
  /** Total size in bytes, once known. */
  bytes: number
  /** Bytes in hand, while downloading. */
  received: number
}

const emptyEntry = (): CacheEntry => ({ status: 'unknown', bytes: 0, received: 0 })

export const formatBytes = (bytes: number) => {
  if (!bytes) {
    return '0 MB'
  }
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }
  const mb = bytes / (1024 * 1024)
  return mb >= 100 ? `${Math.round(mb)} MB` : `${mb.toFixed(1)} MB`
}

/** The headers worth keeping beside a body: what it is, and how to tell if it moved. */
const VALIDATOR_HEADERS = ['content-type', 'etag', 'last-modified', 'content-length']

const validatorOf = (headers: Headers) =>
  [headers.get('etag'), headers.get('last-modified'), headers.get('content-length')].join('|')

export interface DemoCacheOptions {
  /**
   * Called with a filename whose stored body has just been thrown away, or
   * with nothing when the whole cache has been. The player uses it to drop its
   * own in-memory element for that file, so the page cannot go on playing a
   * version it no longer has.
   */
  onEvict?: (file?: string) => void
}

export const useDemoCache = (options: DemoCacheOptions = {}) => {
  /**
   * The Cache API needs a secure context, so this is false on plain http other
   * than localhost, and in a few private-browsing modes. Everything below
   * no-ops when it is, and the player falls back to streaming from the network.
   */
  const supported = ref(false)

  const entries = ref<Record<string, CacheEntry>>({})
  const autoCache = ref(true)
  /** A download is running; `downloadAll` walks the list one file at a time. */
  const working = ref(false)
  const lastError = ref<string | null>(null)
  /** Bytes the origin has granted this site, from the Storage API. */
  const quota = ref(0)
  const persisted = ref(false)

  const entry = (file: string): CacheEntry => entries.value[file] ?? emptyEntry()

  const patch = (file: string, next: Partial<CacheEntry>) => {
    entries.value = { ...entries.value, [file]: { ...entry(file), ...next } }
  }

  const open = () => caches.open(CACHE_NAME)

  const cachedCount = computed(
    () => Object.values(entries.value).filter((e) => e.status === 'ready').length,
  )
  const cachedBytes = computed(() =>
    Object.values(entries.value)
      .filter((e) => e.status === 'ready')
      .reduce((total, e) => total + e.bytes, 0),
  )
  const pendingFiles = computed(() =>
    Object.entries(entries.value)
      .filter(([, e]) => e.status === 'missing' || e.status === 'error')
      .map(([file]) => file),
  )
  const downloading = computed(() =>
    Object.entries(entries.value).find(([, e]) => e.status === 'downloading'),
  )

  const refreshUsage = async () => {
    if (!navigator.storage?.estimate) {
      return
    }
    const estimate = await navigator.storage.estimate()
    quota.value = estimate.quota ?? 0
  }

  /**
   * Ask the browser not to evict this origin's storage when the disk gets
   * tight. Chrome grants it silently for a site the user engages with; Safari
   * and Firefox have their own rules. A refusal is not an error — it only means
   * a cached master may have to be fetched again some day.
   */
  const requestPersistence = async () => {
    if (!navigator.storage?.persist) {
      return
    }
    persisted.value = (await navigator.storage.persisted?.()) ?? false
    if (!persisted.value) {
      persisted.value = await navigator.storage.persist()
    }
  }

  /**
   * Work out what is already on disk, and check it is still current.
   *
   * The stored body answers immediately; the HEAD that follows only decides
   * whether to throw it away, so a stale-but-present file still plays instantly
   * on this load and is re-fetched for the next one.
   */
  const prime = async (files: string[]) => {
    if (!supported.value) {
      return
    }

    const cache = await open()

    await Promise.all(files.map(async (file) => {
      const src = demoSrc(file)
      const hit = await cache.match(src)

      if (!hit) {
        patch(file, { status: 'missing', bytes: 0, received: 0 })
        return
      }

      patch(file, {
        status: 'ready',
        bytes: Number(hit.headers.get('content-length')) || 0,
        received: Number(hit.headers.get('content-length')) || 0,
      })

      try {
        const head = await fetch(src, { method: 'HEAD', cache: 'no-cache' })
        if (!head.ok) {
          return
        }
        if (validatorOf(head.headers) !== validatorOf(hit.headers)) {
          await cache.delete(src)
          patch(file, { status: 'missing', bytes: 0, received: 0 })
          options.onEvict?.(file)
        }
      } catch {
        // Offline, which is the case this whole composable exists for. Keep
        // what is on disk and say nothing.
      }
    }))

    await refreshUsage()
  }

  /** Fetch one file into the cache, reporting progress as it goes. */
  const download = async (file: string) => {
    if (!supported.value || entry(file).status === 'downloading') {
      return
    }

    const src = demoSrc(file)
    patch(file, { status: 'downloading', received: 0 })

    try {
      const response = await fetch(src, { cache: 'no-store' })
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`)
      }

      const total = Number(response.headers.get('content-length')) || 0
      patch(file, { bytes: total })

      // Read the body by hand rather than calling `.blob()`, so a 50 MB master
      // reports a moving bar instead of sitting at zero for half a minute.
      const chunks: Uint8Array[] = []
      let received = 0

      if (response.body) {
        const reader = response.body.getReader()
        for (;;) {
          const { done, value } = await reader.read()
          if (done) {
            break
          }
          chunks.push(value)
          received += value.length
          patch(file, { received })
        }
      } else {
        chunks.push(new Uint8Array(await response.arrayBuffer()))
        received = chunks[0]!.length
      }

      const blob = new Blob(chunks as BlobPart[], {
        type: response.headers.get('content-type') ?? 'application/octet-stream',
      })

      // Carry the validators across, so `prime` can tell on the next visit
      // whether the file behind this name has been replaced.
      const headers = new Headers()
      for (const name of VALIDATOR_HEADERS) {
        const value = response.headers.get(name)
        if (value) {
          headers.set(name, value)
        }
      }
      headers.set('content-length', String(blob.size))

      const cache = await open()
      await cache.put(src, new Response(blob, { headers }))

      patch(file, { status: 'ready', bytes: blob.size, received: blob.size })
      // The pooled element, if there is one, is still pointing at the old
      // source — a network stream, or the blob this just replaced.
      options.onEvict?.(file)
      lastError.value = null
      await refreshUsage()
    } catch (cause) {
      patch(file, { status: 'error', received: 0 })
      lastError.value = `Could not cache ${file}: ${(cause as Error).message}`
    }
  }

  /**
   * One at a time, deliberately.
   *
   * Six parallel fetches of multi-megabyte audio share the same pipe and all
   * finish late; sequentially, the first track is playable from disk while the
   * rest are still arriving — which is the order you actually want them in.
   */
  const downloadAll = async (files?: string[]) => {
    if (!supported.value || working.value) {
      return
    }
    working.value = true
    try {
      for (const file of files ?? pendingFiles.value) {
        await download(file)
      }
    } finally {
      working.value = false
    }
  }

  /** A blob URL for a cached file, or null if it is not stored. Caller revokes. */
  const localUrl = async (file: string): Promise<string | null> => {
    if (!supported.value) {
      return null
    }
    try {
      const hit = await (await open()).match(demoSrc(file))
      if (!hit) {
        return null
      }
      return URL.createObjectURL(await hit.blob())
    } catch {
      return null
    }
  }

  const remove = async (file: string) => {
    if (!supported.value) {
      return
    }
    await (await open()).delete(demoSrc(file))
    patch(file, { status: 'missing', bytes: 0, received: 0 })
    options.onEvict?.(file)
    await refreshUsage()
  }

  const clear = async () => {
    if (!supported.value) {
      return
    }
    await caches.delete(CACHE_NAME)
    options.onEvict?.()
    entries.value = Object.fromEntries(
      Object.keys(entries.value).map((file) => [file, { status: 'missing' as const, bytes: 0, received: 0 }]),
    )
    await refreshUsage()
  }

  /**
   * Drop anything in the cache that no playlist points at any more, so a
   * renamed or retired take does not sit on disk forever.
   */
  const prune = async (files: string[]) => {
    if (!supported.value) {
      return
    }
    const wanted = new Set(files.map(demoSrc))
    const cache = await open()
    for (const request of await cache.keys()) {
      const path = new URL(request.url).pathname
      if (path.startsWith(`${DEMO_DIR}/`) && !wanted.has(decodeURI(path)) && !wanted.has(path)) {
        await cache.delete(request)
      }
    }
    await refreshUsage()
  }

  onMounted(async () => {
    supported.value = typeof caches !== 'undefined' && window.isSecureContext

    try {
      const stored = localStorage.getItem(AUTO_KEY)
      if (stored != null) {
        autoCache.value = stored === 'true'
      }
    } catch {
      // Private mode, or storage blocked. The default stands.
    }

    if (supported.value) {
      await requestPersistence()
      await refreshUsage()
    }
  })

  watch(autoCache, (value) => {
    try {
      localStorage.setItem(AUTO_KEY, String(value))
    } catch {
      // As above — the toggle still works for this session.
    }
  })

  return {
    supported: readonly(supported),
    entries: readonly(entries),
    entry,
    autoCache,
    working: readonly(working),
    downloading,
    lastError: readonly(lastError),
    cachedCount,
    cachedBytes,
    pendingFiles,
    quota: readonly(quota),
    persisted: readonly(persisted),
    prime,
    prune,
    download,
    downloadAll,
    localUrl,
    remove,
    clear,
  }
}
