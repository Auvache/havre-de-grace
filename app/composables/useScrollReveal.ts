interface ScrollRevealOptions {
  once?: boolean
  threshold?: number
  rootMargin?: string
}

export const useScrollReveal = (options: ScrollRevealOptions = {}) => {
  const target = ref<HTMLElement | null>(null)
  const isVisible = ref(false)

  const {
    once = true,
    threshold = 0.2,
    rootMargin = '0px 0px -12% 0px',
  } = options

  if (import.meta.client) {
    const { stop } = useIntersectionObserver(
      target,
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return
        }

        isVisible.value = true

        if (once) {
          stop()
        }
      },
      {
        threshold,
        rootMargin,
      },
    )
  }

  return {
    target,
    isVisible: readonly(isVisible),
  }
}
