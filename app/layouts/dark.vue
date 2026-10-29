<!--
  The album pages (Cinema): dark, graded per record, the nav over the screen.
  The page paints its own floor; its dock replaces the player bar.
-->

<template>
  <div class="site-shell player-room min-h-screen text-[var(--theme-text)]">
    <AppNavbar over-picture />
    <main>
      <slot />
    </main>
    <AppFooter tone="dark" />
  </div>
</template>

<script setup lang="ts">
import AppFooter from '~/components/global/AppFooter.vue'
import AppNavbar from '~/components/global/AppNavbar.vue'

usePageTheme()
</script>
