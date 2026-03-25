<template>
  <div class="min-h-screen text-[var(--theme-text)]">
    <main class="min-h-screen">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
usePageTheme()
</script>
