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

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      return {
        el: to.hash,
        top: navHeightOffset(),
        behavior: 'smooth',
      }
    }

    return { top: 0 }
  },
}
