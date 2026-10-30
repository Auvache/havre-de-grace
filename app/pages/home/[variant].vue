<!--
  /home/1-5: the homepage with five ways of moving between its sections in
  place of the solid mist band (see components/home/StillWater.vue). Unlisted
  and noindexed; delete once one is chosen.
-->

<template>
  <StillWater :transition="n" />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'home',
  navOver: true,
})

const route = useRoute()
const n = Number(route.params.variant) as 1 | 2 | 3 | 4 | 5

if (![1, 2, 3, 4, 5].includes(n)) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

useHead({
  title: `Home, transition ${n}`,
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})
</script>
