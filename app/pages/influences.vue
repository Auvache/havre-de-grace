<template>
  <InfluenceCanvas :albums="albums" />
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

usePageSeo({
  title: 'Influences - Havre De Grace',
  description: 'Explore the albums orbiting Havre De Grace in a pannable field of musical influences.',
  path: '/influences',
  image: '/images/albums/into-the-wild-album.png',
})
</script>
