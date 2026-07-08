<template>
  <div class="min-h-screen text-[var(--theme-text)]">
    <main class="h-screen">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// The record player is a full-bleed, chrome-free scene: no navbar. Visitors exit
// back to the picker via the in-scene "Albums" button.
usePageTheme()
</script>
