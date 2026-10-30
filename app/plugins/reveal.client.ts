/*
  Sections rise into place as they scroll into view, the way the old site's
  ScrollReveal did, on every page.

  What moves: each child of a reading column (`.reading > *`), each child of a
  homepage band (`.block > *`), each child of a `.reveal-group` (a row whose
  items come in one after another), and anything marked `data-reveal`
  (ScrollReveal's wrappers, or `data-reveal="left" | "right"` to come in from a
  side). The outermost match wins, so nothing fades twice.

  Nothing is hidden in the HTML. Only here, once the page has drawn, does an
  element below the fold get `reveal-pending`; anything already on screen is
  left exactly where it is. Without JavaScript, or with reduced motion, every
  page simply reads as it is (the reason ScrollReveal was switched off on
  2026-10-29: pages showed blank until an observer fired).
*/

const TARGETS = [
  'main [data-reveal]',
  'main .reading > :not(.reveal-group)',
  'main .block > :not(.reveal-group)',
  'main .reveal-group > *',
].join(', ')

// Items revealed in the same moment come in one after another.
const STAGGER_MS = 110

export default defineNuxtPlugin((nuxtApp) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  const observer = new IntersectionObserver((entries) => {
    const arriving = entries
      .filter((entry) => entry.isIntersecting)
      .map((entry) => entry.target as HTMLElement)
      .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top || a.getBoundingClientRect().left - b.getBoundingClientRect().left)

    arriving.forEach((el, index) => {
      observer.unobserve(el)
      el.style.transitionDelay = `${index * STAGGER_MS}ms`
      el.classList.add('is-revealed')
      // Once it has arrived it is an ordinary element again, so its own hover
      // transitions aren't slowed by ours.
      const settle = (event: TransitionEvent) => {
        if (event.target !== el || event.propertyName !== 'opacity') return
        el.removeEventListener('transitionend', settle)
        el.classList.remove('reveal-pending', 'is-revealed')
        el.style.transitionDelay = ''
      }
      el.addEventListener('transitionend', settle)
    })
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })

  const scan = () => {
    const fold = window.innerHeight * 0.94

    for (const el of document.querySelectorAll<HTMLElement>(TARGETS)) {
      if (el.dataset.revealSeen) continue
      el.dataset.revealSeen = '1'

      if (el.parentElement?.closest('.reveal-pending')) continue
      if (el.getBoundingClientRect().top < fold) continue

      el.classList.add('reveal-pending')
      observer.observe(el)
    }
  }

  nuxtApp.hook('app:mounted', () => requestAnimationFrame(scan))
  nuxtApp.hook('page:finish', () => requestAnimationFrame(scan))
})
