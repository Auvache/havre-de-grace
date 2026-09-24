<!--
  The navigation a full-bleed hero carries on its own first screen. Paints in
  currentColor, so a hero sets the colour on it (or on itself) and the mark,
  the links and the menu button all follow. The site navbar takes over once the
  hero scrolls away (see the `home` layout).
-->

<template>
  <nav
    aria-label="Primary"
    class="hero-topbar page-container relative z-20 flex h-[var(--nav-height)] items-center justify-between"
  >
    <NuxtLink to="/" class="block leading-none" :aria-label="siteProfile.artistName">
      <slot name="brand">
        <BrandMark variant="navSeal" decorative class="w-[clamp(9rem,26vw,11.5rem)]" />
      </slot>
    </NuxtLink>

    <ul class="hidden items-center gap-3 text-sm md:flex">
      <template v-for="(link, index) in SITE_NAV_LINKS" :key="link.to">
        <li>
          <NuxtLink :to="link.to" class="hero-topbar-link nav-link">
            {{ link.label }}
          </NuxtLink>
        </li>
        <li v-if="index < SITE_NAV_LINKS.length - 1" class="opacity-50" aria-hidden="true">/</li>
      </template>
    </ul>

    <button
      type="button"
      class="inline-flex h-10 w-10 items-center justify-center rounded-full border md:hidden"
      style="border-color: color-mix(in srgb, currentColor 40%, transparent)"
      :aria-expanded="mobileOpen ? 'true' : 'false'"
      aria-controls="mobile-nav-overlay"
      aria-label="Open navigation menu"
      @click="mobileOpen = true"
    >
      <span aria-hidden="true" class="block h-[2px] w-5 bg-current shadow-[0_6px_0_0_currentColor,0_-6px_0_0_currentColor]" />
    </button>

    <MobileNavOverlay
      :open="mobileOpen"
      :links="SITE_NAV_LINKS"
      :artist-name="siteProfile.artistName"
      @close="mobileOpen = false"
    />
  </nav>
</template>

<script setup lang="ts">
import { SITE_NAV_LINKS } from '~/config/navLinks'

const siteProfile = useSiteProfile()
const route = useRoute()
const mobileOpen = ref(false)

watch(() => route.fullPath, () => {
  mobileOpen.value = false
})
</script>

<style scoped>
/* The site's underline is the accent colour, which disappears on a photo or a
   dark room; here it follows the text. */
.hero-topbar-link::after {
  background-color: currentColor;
}
</style>
