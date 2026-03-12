<template>
  <section class="page-container section-space">
    <BioSection :latest-album="latestAlbum" />
    <PressKit :latest-album="latestAlbum" />
  </section>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'

definePageMeta({
  theme: 'light',
})

const siteProfile = useSiteProfile()

const sortAlbums = (items: Album[]) => [...items]
  .filter((album) => album.isVisible !== false)
  .sort((a, b) => {
    if (a.releaseDate && b.releaseDate) {
      return b.releaseDate.localeCompare(a.releaseDate)
    }

    if (a.releaseDate) {
      return -1
    }

    if (b.releaseDate) {
      return 1
    }

    return b.year - a.year
  })

const { data } = await useAsyncData('about-albums', async () => {
  const items = await queryCollection('music').all() as Album[]
  return sortAlbums(items)
})

const latestAlbum = computed(() => {
  const items = data.value ?? []
  return items.find((album) => album.isLatest) ?? items[0] ?? null
})

const pageDescription = computed(() => `About ${siteProfile.artistName}: artist bio, press kit, high-resolution photos, and latest release details.`)

usePageSeo({
  title: `About and Press | ${siteProfile.artistName}`,
  description: pageDescription,
  image: '/press/media-pic-wide.jpg',
})
</script>
