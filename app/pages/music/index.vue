<template>
  <section class="page-container section-space text-center">
    <SectionHeading
      title="music"
      eyebrow="discography"
      align="center"
      heading-tag="h1"
    />

    <ul
      v-if="albums.length"
      class="mx-auto mt-12 flex w-full max-w-5xl flex-wrap justify-center gap-x-8 gap-y-10"
    >
      <li
        v-for="album in albums"
        :key="album.slug"
        class="w-full max-w-xs sm:w-72 sm:max-w-none"
      >
        <NuxtLink
          :to="`/music/${album.slug}`"
          class="group block focus-visible:outline-none"
          :aria-label="`Open ${album.title}`"
        >
          <div class="relative overflow-hidden">
            <NuxtImg
              :src="album.coverImage"
              :alt="album.coverAlt"
              class="aspect-square w-full object-cover shadow-[0_22px_46px_color-mix(in_srgb,var(--theme-text)_14%,transparent)] transition-transform duration-300 group-hover:scale-[1.03]"
              width="1200"
              height="1200"
              sizes="(max-width: 640px) 78vw, (max-width: 1024px) 42vw, 320px"
              format="webp,avif"
              loading="lazy"
            />
            <div
              v-if="album.slug === 'into-the-wild'"
              class="absolute inset-0 flex items-center justify-center bg-black/35 text-center"
            >
              <span class="text-lg font-semibold uppercase tracking-[0.2em] text-red-600 sm:text-xl">
                Coming Soon
              </span>
            </div>
          </div>

          <h2 class="mt-4 text-xl font-medium leading-tight">
            {{ album.title }}
          </h2>

          <p class="mt-1 text-sm muted-text">
            {{ formatReleaseDate(album) }}
          </p>
        </NuxtLink>
      </li>
    </ul>

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

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const formatReleaseDate = (album: Album) => {
  if (!album.releaseDate) {
    return String(album.year)
  }

  const isoDateMatch = album.releaseDate.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!isoDateMatch) {
    return album.releaseDate
  }

  const [, year, month, day] = isoDateMatch
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day))

  if (Number.isNaN(parsedDate.getTime())) {
    return album.releaseDate
  }

  return dateFormatter.format(parsedDate)
}

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
