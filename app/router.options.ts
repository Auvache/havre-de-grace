import type { RouterConfig } from '@nuxt/schema'

// Offset scroll targets by the height of the fixed header so anchored sections
// (e.g. the homepage `#music` section) are not hidden underneath it.
//
// Measured off the element rather than read from --chrome-height, because that
// token is a `calc()` of two others: getPropertyValue hands back an unresolved
// custom property as its literal token stream, so parseFloat("calc(4.5rem +
// 2.75rem)") is NaN and every anchor would quietly fall back to the constant.
// The header is the thing being cleared anyway, and measuring it is also what
// keeps this honest when the mailing-list banner inside it comes and goes.
const chromeHeightOffset = () => {
  if (import.meta.server) {
    return 0
  }

  const header = document.querySelector('header')
  return (header?.getBoundingClientRect().height ?? 0) + 16
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
        top: chromeHeightOffset(),
        behavior: 'smooth',
      }
    }

    return { top: 0 }
  },
}
