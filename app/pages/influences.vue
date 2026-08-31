<template>
  <InfluenceGrid :albums="albums" />
</template>

<script setup lang="ts">
import type { TasteAlbumCollection } from '~~/shared/types'
import albumsData from '../../content/taste/albums.json'

definePageMeta({
  layout: 'influences',
  pageTransition: {
    name: 'influences',
    mode: 'out-in',
  },
})

const albums = computed(() => (albumsData as TasteAlbumCollection).albums ?? [])

// Orphaned by design (no nav link) and noindex (see routeRules in
// nuxt.config.ts): the grid is client-rendered, so crawlers see an empty page,
// and the content is other artists' album covers rather than anything about
// Havre De Grace. The previous pannable-canvas version lived here and the grid
// at /influences-new; the grid replaced it, so only this route remains.
usePageSeo({
  title: 'Influences - Havre De Grace',
  description: 'An endless tiled wall of the records that shaped Havre De Grace.',
  path: '/influences',
})
</script>
