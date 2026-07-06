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

usePageSeo({
  title: 'Influences (Grid) - Havre De Grace',
  description: 'An endless tiled wall of musical influences orbiting Havre De Grace.',
  path: '/influences-new',
  image: '/albums/into-the-wild/images/into-the-wild-album-cover.png',
})
</script>
