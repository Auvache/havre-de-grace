<!--
  The homepage layout.

  The hero owns the whole first screen, including its navigation (HeroTopBar),
  so there is no banner offset here and the site navbar waits above the
  viewport until the hero has scrolled away.
-->

<template>
  <div class="min-h-screen text-[var(--theme-text)]">
    <AppNavbar reveal-after-hero />
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
