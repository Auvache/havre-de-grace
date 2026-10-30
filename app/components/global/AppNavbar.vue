<!--
  The site navigation: the anchor and the name on the left, records / about /
  contact on the right, and nothing else (SITE-REFRESH.md, "Everywhere").

  It stays fixed at the top while the page scrolls, and reads what is behind
  it so the links are always legible:
    - Over a picture (anything marked `data-nav-over`: the homepage hero, a
      Shoreline band, an album screen) it has no backing and the links are
      white.
    - Over anything else it lays a frosted strip in the colour of whatever is
      underneath, with ink or white links to suit that colour. At the top of a
      plain page the strip is the page's own colour, so it doesn't show.

  A page that opens with a photograph says so with `definePageMeta({ navOver:
  true })`, read from the route so the server render already starts in white
  and leaves out the spacer. Every other page gets a spacer the nav's height,
  so nothing starts underneath it.

  Three short words fit on a phone, so there is no menu button.
-->

<template>
  <header
    ref="el"
    :class="['site-nav', clear ? 'is-clear' : 'is-solid', { 'on-dark': onDark, 'is-scrolled': scrolled }]"
    :style="stripColor ? { '--nav-bg': stripColor } : undefined"
  >
    <nav aria-label="Primary" class="site-nav__row">
      <NuxtLink to="/" class="site-nav__mark" :aria-label="`${siteProfile.artistName}, home`">
        <BrandMark variant="anchor" decorative class="site-nav__anchor" />
        <span class="site-nav__name">{{ siteProfile.artistName }}</span>
      </NuxtLink>

      <ul class="site-nav__links">
        <li v-for="link in navLinks" :key="link.to">
          <NuxtLink :to="link.to" :class="{ on: isActive(link.to) }" :aria-current="isActive(link.to) ? 'page' : undefined">
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
  <div v-if="!over" class="site-nav-spacer" aria-hidden="true" />
</template>

<script setup lang="ts">
import { SITE_NAV_LINKS } from '~/config/navLinks'

const props = withDefaults(defineProps<{
  /** The page starts under the nav (no spacer), whatever its meta says. */
  overPicture?: boolean
}>(), {
  overPicture: false,
})

const route = useRoute()
const siteProfile = useSiteProfile()
const navLinks = SITE_NAV_LINKS

const over = computed(() => props.overPicture || Boolean(route.meta.navOver))

const isActive = (to: string) => route.path === to || route.path.startsWith(`${to}/`)

const el = ref<HTMLElement | null>(null)
// Until the browser has looked, trust the page's meta: a navOver page opens
// on its picture.
const clear = ref(Boolean(route.meta.navOver))
const onDark = ref(Boolean(route.meta.navOver))
const stripColor = ref<string | null>(null)
const scrolled = ref(false)

/** [r, g, b, a] from a computed colour, or null if it isn't one we can read. */
function parseColor(value: string): [number, number, number, number] | null {
  const rgb = value.match(/^rgba?\(([^)]+)\)$/)
  if (rgb) {
    const [r = 0, g = 0, b = 0, a = 1] = rgb[1]!.split(/[\s,/]+/).filter(Boolean).map(Number)
    return [r, g, b, a]
  }
  // color-mix() computes to `color(srgb r g b / a)` with 0–1 channels.
  const srgb = value.match(/^color\(srgb ([^)]+)\)$/)
  if (srgb) {
    const [r = 0, g = 0, b = 0, a = 1] = srgb[1]!.split(/[\s/]+/).filter(Boolean).map(Number)
    return [r * 255, g * 255, b * 255, a]
  }
  // Anything else (oklab, oklch…): let a canvas resolve it.
  if (!value || value === 'transparent') return null
  paint ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  if (!paint) return null
  paint.clearRect(0, 0, 1, 1)
  paint.fillStyle = value
  paint.fillRect(0, 0, 1, 1)
  const [r = 0, g = 0, b = 0, a = 0] = paint.getImageData(0, 0, 1, 1).data
  return [r, g, b, a / 255]
}

let paint: CanvasRenderingContext2D | null | undefined

const isDarkColor = ([r, g, b]: [number, number, number, number]) =>
  0.2126 * r + 0.7152 * g + 0.0722 * b < 140

/** The first solid background at or above `node`, falling back to the page's. */
function backgroundBehind(node: Element | null): { css: string, rgba: [number, number, number, number] } | null {
  for (let at = node; at; at = at.parentElement) {
    const css = getComputedStyle(at).backgroundColor
    const rgba = parseColor(css)
    if (rgba && rgba[3] > 0.5) return { css, rgba }
  }
  const css = getComputedStyle(document.documentElement).getPropertyValue('--theme-bg').trim()
  const rgba = parseColor(css)
  return rgba ? { css, rgba } : null
}

function look() {
  const header = el.value
  if (!header) return
  scrolled.value = window.scrollY > 4

  // What sits just inside the nav's bottom edge, across its middle, not
  // counting the nav itself. A picture that ends partway under the nav
  // already counts as text, so the strip arrives before the words do.
  const rect = header.getBoundingClientRect()
  const y = Math.max(0, rect.bottom - 2)
  const under = document.elementsFromPoint(window.innerWidth / 2, y).find((node) => !header.contains(node)) ?? null

  if (under?.closest('[data-nav-over]')) {
    clear.value = true
    onDark.value = true
    return
  }

  const bg = backgroundBehind(under)
  clear.value = false
  stripColor.value = bg?.css ?? null
  onDark.value = bg ? isDarkColor(bg.rgba) : false
}

let frame = 0
const schedule = () => {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    look()
  })
}

onMounted(() => {
  look()
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
  cancelAnimationFrame(frame)
})

// A new page arrives after its transition; look again once it has painted.
const nuxtApp = useNuxtApp()
const unhook = nuxtApp.hook('page:finish', () => {
  if (!import.meta.client) return
  schedule()
  setTimeout(schedule, 400)
})
onBeforeUnmount(unhook)
</script>

<style scoped>
.site-nav {
  position: fixed;
  inset: 0 0 auto;
  z-index: 45;
  color: var(--theme-text);
  transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
}

.site-nav.is-clear,
.site-nav.on-dark {
  color: #f4f2ec;
}

.site-nav.is-clear {
  text-shadow: 0 1px 12px rgba(0, 0, 0, 0.28);
}

.site-nav.is-solid {
  background: color-mix(in srgb, var(--nav-bg, var(--theme-bg)) 86%, transparent);
  -webkit-backdrop-filter: blur(14px) saturate(1.1);
  backdrop-filter: blur(14px) saturate(1.1);
}

.site-nav.is-solid.is-scrolled {
  box-shadow: 0 1px 0 color-mix(in srgb, currentColor 10%, transparent);
}

.site-nav__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  height: var(--nav-h);
  padding: 0 56px;
  font-size: 13px;
  letter-spacing: 0.14em;
  transition: height 0.3s ease;
}

.site-nav.is-scrolled .site-nav__row {
  height: var(--nav-h-scrolled);
}

.site-nav__mark {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  text-decoration: none;
  white-space: nowrap;
}

.site-nav__anchor {
  width: 16px;
}

.site-nav__links {
  display: flex;
  gap: 40px;
  list-style: none;
}

.site-nav__links a {
  text-decoration: none;
  padding-bottom: 4px;
  border-bottom: 1px solid transparent;
}

.site-nav__links a:hover,
.site-nav__links a.on {
  border-bottom-color: currentColor;
}

.site-nav-spacer {
  height: var(--nav-h);
}

@media (max-width: 640px) {
  .site-nav__row {
    padding: 0 20px;
  }

  .site-nav__links {
    gap: 20px;
    font-size: 12px;
  }

  .site-nav__name {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-nav,
  .site-nav__row {
    transition: none;
  }
}
</style>
