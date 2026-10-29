<!--
  The homepage (Still Water). Same frame as the light pages; the hero is the
  page's own and the nav lies on it (navOver in pages/index.vue).
-->

<template>
  <div class="site-shell player-room min-h-screen text-[var(--theme-text)]">
    <AppNavbar />
    <main>
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppFooter from '~/components/global/AppFooter.vue'
import AppNavbar from '~/components/global/AppNavbar.vue'

usePageTheme()
</script>
