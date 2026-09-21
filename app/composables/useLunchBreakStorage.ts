/**
 * localStorage for the Lunch Break tools, with every failure mode handled.
 *
 * The tools are the whole point of this section and they have no backend, so
 * the browser is the only place progress can live. That is fine, and it is
 * also why nothing here may ever throw:
 *
 *   - Safari in private mode, and any browser with site data blocked, throws
 *     on `localStorage.setItem` rather than returning an error.
 *   - Simply *reading* `window.localStorage` throws in some embedded webviews.
 *   - Stored JSON can be from an older shape of the tool, or corrupt, or
 *     somebody else's.
 *
 * So: every access is wrapped, a failure degrades to an in-memory session
 * rather than a broken page, and `persistent` tells the UI whether it can
 * honestly promise the visitor their work will still be here tomorrow.
 *
 * Nothing typed into these tools is ever transmitted anywhere. There is no
 * analytics call, no API, and no server to send it to.
 */

const STORAGE_PREFIX = 'lbr'

export interface LunchBreakStorage<T> {
  /** Current value. Writes are persisted automatically. */
  state: Ref<T>
  /** False when storage is unavailable — show the "won't be saved" note. */
  persistent: Ref<boolean>
  /** Wipe this key and return to the default. */
  reset: () => void
}

const readStorage = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key)
  }
  catch {
    return null
  }
}

const writeStorage = (key: string, value: string): boolean => {
  try {
    window.localStorage.setItem(key, value)
    return true
  }
  catch {
    return false
  }
}

const removeStorage = (key: string) => {
  try {
    window.localStorage.removeItem(key)
  }
  catch {
    // Nothing to do. The in-memory reset below is what the visitor sees.
  }
}

/**
 * @param name  short key, namespaced to `lbr:<name>` — bumping it is how you
 *              deliberately invalidate everyone's saved state after a breaking
 *              change to the shape.
 * @param fallback  a factory, so each caller gets its own object rather than
 *              sharing one default by reference.
 * @param revive  optional validator/migrator. Return `null` to reject stored
 *              data and fall back, which is what keeps a half-written or
 *              out-of-date blob from breaking the page.
 */
export const useLunchBreakStorage = <T>(
  name: string,
  fallback: () => T,
  revive?: (parsed: unknown) => T | null,
): LunchBreakStorage<T> => {
  const key = `${STORAGE_PREFIX}:${name}`
  const state = ref(fallback()) as Ref<T>
  const persistent = ref(true)

  /*
   * Hydrate on mount rather than in setup. These pages are prerendered to one
   * shared HTML file, so the server has no idea what any given visitor saved —
   * reading during setup would produce markup on the client that disagrees
   * with the server's and trip a hydration mismatch.
   */
  onMounted(() => {
    const raw = readStorage(key)

    if (raw === null) {
      // Distinguish "nothing saved yet" from "storage is unavailable" by
      // attempting a write. A blocked write is what the notice is for.
      persistent.value = writeStorage(key, JSON.stringify(state.value))
      return
    }

    try {
      const parsed = JSON.parse(raw)
      const revived = revive ? revive(parsed) : (parsed as T)
      if (revived !== null && revived !== undefined) {
        state.value = revived
      }
    }
    catch {
      // Corrupt or foreign data. Leave the default in place and let the next
      // write overwrite it.
    }
  })

  watch(state, (value) => {
    if (!import.meta.client) {
      return
    }
    persistent.value = writeStorage(key, JSON.stringify(value))
  }, { deep: true })

  const reset = () => {
    removeStorage(key)
    state.value = fallback()
  }

  return { state, persistent, reset }
}

/**
 * Download a value as a file, without a server round trip.
 *
 * Used by the checklist's JSON export — the backup route for someone moving to
 * a new laptop, which matters more than usual when the only copy of their work
 * is in one browser's storage.
 */
export const downloadJson = (filename: string, data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
