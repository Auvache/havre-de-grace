<!--
  /home/1-3: the homepage with each of the three marks for its hairlines
  (components/home/DividerMark.vue): 1 the logo's anchor, 2 a diamond, 3 a
  compass star. Unlisted and noindexed; delete once one is chosen.
-->

<template>
  <StillWater :mark="mark" />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'home',
  navOver: true,
})

const MARKS: Record<string, 'anchor' | 'diamond' | 'star'> = { 1: 'anchor', 2: 'diamond', 3: 'star' }

const route = useRoute()
const n = String(route.params.variant)
const mark = MARKS[n]

if (!mark) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

useHead({
  title: `Home, mark ${n}`,
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})
</script>
