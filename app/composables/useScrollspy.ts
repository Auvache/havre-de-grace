import { toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

interface ScrollspyOptions {
  rootMargin?: string
  threshold?: number | number[]
  fallbackOffset?: number
}

const DEFAULT_THRESHOLDS = [0, 0.2, 0.35, 0.5, 0.75, 1]

export const useScrollspy = (
  sectionIds: MaybeRefOrGetter<string[]>,
  options: ScrollspyOptions = {},
) => {
  const activeSectionId = ref('')

  const observedEntries = new Map<string, IntersectionObserverEntry>()
  const observerStops: Array<() => void> = []
  let scrollRaf = 0
  let removeScrollListener: (() => void) | null = null

  const {
    rootMargin = '-30% 0px -55% 0px',
    threshold = DEFAULT_THRESHOLDS,
    fallbackOffset = 180,
  } = options

  const cleanupObservers = () => {
    while (observerStops.length) {
      observerStops.pop()?.()
    }
  }

  const computeFallback = () => {
    const ids = toValue(sectionIds)
    let fallback = ids[0] ?? ''

    for (const id of ids) {
      const element = document.getElementById(id)
      if (!element) {
        continue
      }

      if (element.getBoundingClientRect().top - fallbackOffset <= 0) {
        fallback = id
      }
      else {
        break
      }
    }

    return fallback
  }

  const recomputeActive = () => {
    const intersecting = [...observedEntries.entries()]
      .filter(([, entry]) => entry.isIntersecting)
      .sort(([, a], [, b]) => {
        if (b.intersectionRatio !== a.intersectionRatio) {
          return b.intersectionRatio - a.intersectionRatio
        }

        return Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top)
      })

    if (intersecting.length) {
      activeSectionId.value = intersecting[0][0]
      return
    }

    const fallback = computeFallback()
    if (fallback) {
      activeSectionId.value = fallback
    }
  }

  const scheduleRecompute = () => {
    if (scrollRaf) {
      cancelAnimationFrame(scrollRaf)
    }

    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0
      recomputeActive()
    })
  }

  const observeSections = async () => {
    if (!import.meta.client) {
      return
    }

    cleanupObservers()
    observedEntries.clear()

    const ids = toValue(sectionIds)
    if (!ids.length) {
      activeSectionId.value = ''
      return
    }

    activeSectionId.value = ids[0]

    await nextTick()

    for (const id of ids) {
      const target = document.getElementById(id)
      if (!target) {
        continue
      }

      const { stop } = useIntersectionObserver(
        target,
        (entries) => {
          const [entry] = entries
          if (!entry) {
            return
          }

          observedEntries.set(id, entry)
          recomputeActive()
        },
        {
          rootMargin,
          threshold,
        },
      )

      observerStops.push(stop)
    }

    recomputeActive()
  }

  watch(
    () => [...toValue(sectionIds)],
    () => {
      void observeSections()
    },
    { immediate: true, flush: 'post' },
  )

  if (import.meta.client) {
    onMounted(() => {
      const onScroll = () => scheduleRecompute()
      window.addEventListener('scroll', onScroll, { passive: true })
      removeScrollListener = () => window.removeEventListener('scroll', onScroll)
    })
  }

  onScopeDispose(() => {
    cleanupObservers()
    removeScrollListener?.()

    if (scrollRaf) {
      cancelAnimationFrame(scrollRaf)
    }
  })

  return {
    activeSectionId: readonly(activeSectionId),
  }
}
