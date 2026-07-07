import type { RouterConfig } from '@nuxt/schema'

// Offset scroll targets by the fixed navbar height so anchored sections
// (e.g. the homepage `#music` section) are not hidden underneath it.
const navHeightOffset = () => {
  if (import.meta.server) {
    return 0
  }

  const value = getComputedStyle(document.documentElement).getPropertyValue('--nav-height')
  const rem = Number.parseFloat(value)

  if (Number.isNaN(rem)) {
    return 72
  }

  const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  return rem * rootFontSize + 16
}

// Cross-route hash navigation (e.g. `/about` -> `/#music`) can resolve before
// the destination page's async content has mounted, so the target element
// doesn't exist yet and the browser falls back to scrolling to the top.
// Poll for it (via MutationObserver) instead of trusting it's already there.
const waitForElement = (selector: string, timeout = 2000): Promise<void> => {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      resolve()
      return
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect()
        clearTimeout(timer)
        resolve()
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })

    const timer = setTimeout(() => {
      observer.disconnect()
      resolve()
    }, timeout)
  })
}

export default <RouterConfig>{
  async scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      if (import.meta.client && to.path !== from.path) {
        await waitForElement(to.hash)
      }

      return {
        el: to.hash,
        top: navHeightOffset(),
        behavior: 'smooth',
      }
    }

    return { top: 0 }
  },
}
