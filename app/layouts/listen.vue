<template>
  <div class="listen-shell">
    <slot />
  </div>
</template>

<script setup lang="ts">
// The record player is a full-bleed, chrome-free scene: no navbar, no footer.
// Visitors exit via the in-scene link back to the site.
usePageTheme()
</script>

<style>
/* Not scoped: the scene is a locked, full-viewport world, so the document
   itself has to stop scrolling and stop painting the site gradient behind it. */
html:has(.listen-shell) {
  scroll-behavior: auto;
}

html:has(.listen-shell) body {
  background: #050506;
  overflow: hidden;
  overscroll-behavior: none;
}

.listen-shell {
  position: relative;
  min-height: 100dvh;
}
</style>
