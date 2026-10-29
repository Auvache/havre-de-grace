<!--
  The light pages (Shoreline): the nav, the page, the footer. A page that opens
  with a photographic band sets `navOver` in its page meta and the nav lies on
  the picture. The persistent player is mounted once in app.vue, not here, so
  it survives a change of layout; `player-room` keeps the footer clear of it.
-->

<template>
  <div class="site-shell player-room min-h-screen text-[var(--theme-text)]">
    <AppNavbar />
    <main>
      <slot />
    </main>
    <AppFooter :tone="isDark ? 'dark' : 'light'" />
  </div>
</template>

<script setup lang="ts">
import AppFooter from '~/components/global/AppFooter.vue'
import AppNavbar from '~/components/global/AppNavbar.vue'

const { isDark } = usePageTheme()
</script>
