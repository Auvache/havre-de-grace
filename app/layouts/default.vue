<template>
  <div class="min-h-screen text-[var(--theme-text)]">
    <AppNavbar />
    <main class="min-h-[calc(100vh-var(--nav-height))]">
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
