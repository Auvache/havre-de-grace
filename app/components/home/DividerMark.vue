<!--
  The mark in the middle of the homepage's hairlines, drawn in the record's
  sea colour (the divider sets `color`). Three to choose between at /home/1-3:
  the logo's anchor, a diamond, a four-point compass star.
-->

<template>
  <BrandMark v-if="mark === 'anchor'" variant="anchor" decorative class="divider-mark divider-mark--anchor" />
  <svg v-else-if="mark === 'diamond'" class="divider-mark divider-mark--diamond" viewBox="0 0 20 20" aria-hidden="true">
    <path d="M10 1l9 9-9 9-9-9z" fill="none" stroke="currentColor" stroke-width="1.4" />
  </svg>
  <svg v-else class="divider-mark divider-mark--star" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 0l2.2 9.8L24 12l-9.8 2.2L12 24l-2.2-9.8L0 12l9.8-2.2z" fill="currentColor" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  mark: 'anchor' | 'diamond' | 'star'
}>()
</script>

<style scoped>
.divider-mark {
  display: block;
  height: auto;
}

.divider-mark--anchor {
  width: 20px;
}

.divider-mark--diamond {
  width: 16px;
}

.divider-mark--star {
  width: 24px;
}
</style>
