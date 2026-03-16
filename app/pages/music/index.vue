<template>
  <section class="page-container section-space">
    <SectionHeading
      title="music"
      eyebrow="discography"
      description="All releases are listed in reverse chronological order."
      heading-tag="h1"
    />

    <p v-if="latestAlbum" class="mt-6 text-sm muted-text">
      latest:
      <NuxtLink :to="`/music/${latestAlbum.slug}`" class="hover:text-[var(--color-accent)]">
        {{ latestAlbum.title }}
      </NuxtLink>
    </p>

    <DiscographyGrid
      v-if="albums.length"
      class="mt-12"
      :albums="albums"
      :featured-slug="latestAlbum?.slug"
      heading-tag="h2"
    />

    <p v-else class="mt-10 muted-text">
      No albums are available yet.
    </p>
  </section>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'

definePageMeta({
  layout: 'dark',
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

const { data } = await useAsyncData('music-albums', async () => {
  const items = await queryCollection('music').all() as Album[]
  return sortAlbums(items)
})

const albums = computed(() => data.value ?? [])

const latestAlbum = computed(() => {
  const items = albums.value
  return items.find((album) => album.isLatest) ?? items[0] ?? null
})

const pageDescription = computed(() => {
  const visibleTitles = albums.value.map((album) => album.title).slice(0, 5)
  const suffix = visibleTitles.length ? ` Releases include ${visibleTitles.join(', ')}.` : ''
  return `Discography for ${siteProfile.artistName}, listed in reverse chronological order.${suffix}`
})

usePageSeo({
  title: `Discography | ${siteProfile.artistName}`,
  description: pageDescription,
  image: computed(() => latestAlbum.value?.coverImage),
})
</script>
