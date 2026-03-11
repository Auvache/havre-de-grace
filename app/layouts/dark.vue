<template>
  <div class="min-h-screen bg-[var(--color-bg-dark)] text-[var(--color-text-dark)]">
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
</script>
