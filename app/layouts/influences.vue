<template>
  <div class="min-h-screen text-[var(--theme-text)]">
    <AppNavbar immersive />
    <main class="h-screen">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppNavbar from '~/components/global/AppNavbar.vue'

usePageTheme()
</script>
