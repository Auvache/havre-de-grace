<!--
  The site navigation: the anchor and the name on the left, records / about /
  contact on the right, and nothing else (SITE-REFRESH.md, "Everywhere").

  It sits at the top of the page and scrolls away with it. On a page that opens
  with a photograph (a Shoreline band, the homepage hero, an album screen) it
  lies on the picture in white: the page says so with `definePageMeta({ navOver:
  true })`, read from the route so the server render already knows.

  Three short words fit on a phone, so there is no menu button.
-->

<template>
  <header :class="['site-nav', { 'is-over': over }]">
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
</template>

<script setup lang="ts">
import { SITE_NAV_LINKS } from '~/config/navLinks'

const props = withDefaults(defineProps<{
  /** Force the over-a-picture treatment regardless of the page's meta. */
  overPicture?: boolean
}>(), {
  overPicture: false,
})

const route = useRoute()
const siteProfile = useSiteProfile()
const navLinks = SITE_NAV_LINKS

const over = computed(() => props.overPicture || Boolean(route.meta.navOver))

const isActive = (to: string) => route.path === to || route.path.startsWith(`${to}/`)
</script>

<style scoped>
.site-nav {
  position: relative;
  z-index: 30;
  color: var(--theme-text);
}

.site-nav.is-over {
  position: absolute;
  inset: 0 0 auto;
  color: #fff;
}

.site-nav__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding: 30px 56px;
  font-size: 13px;
  letter-spacing: 0.14em;
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

@media (max-width: 640px) {
  .site-nav__row {
    padding: 22px 20px;
  }

  .site-nav__links {
    gap: 20px;
    font-size: 12px;
  }

  .site-nav__name {
    display: none;
  }
}
</style>
