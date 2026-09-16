<template>
  <section class="page-container section-space">
    <BioSection :latest-album="latestAlbum" />

    <!--
      The press kit used to live here as an #press section. It is its own page
      now (/press), so this is the hand-off rather than a second copy.
    -->
    <ScrollReveal
      as="div"
      class-name="mx-auto mt-16 max-w-3xl border-t border-theme pt-10 text-center"
      variant="section-up"
      :delay-ms="80"
      :distance-px="44"
      :threshold="0.12"
      root-margin="0px 0px -8% 0px"
    >
      <p class="muted-text">
        Writing about the record? Bios, photos, and release details are ready to download.
      </p>
      <NuxtLink
        to="/press"
        class="nav-link mt-3 inline-block hover:text-[var(--color-accent)]"
      >
        press kit
      </NuxtLink>
    </ScrollReveal>
  </section>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'
import { compact, schemaId } from '~/utils/schema'

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

const pageDescription = computed(() => `Havre De Grace is singer-songwriter Stefan Auvache Bradley, writing and recording acoustic folk music in Vancouver, Washington. Bio, influences, press photos, and booking.`)

const { canonicalUrl } = usePageSeo({
  title: `About Havre De Grace | Stefan Auvache Bradley`,
  description: pageDescription,
  // The full press photo is 3024x1752 / 2.4 MB. Scrapers get a 1200-wide
  // derivative; the original stays available as a press-kit download.
  image: {
    src: '/press/media-pic-wide-og.jpg',
    width: 1200,
    height: 695,
    type: 'image/jpeg',
    alt: 'Havre De Grace press photo',
  },
  type: 'profile',
})

// This is the page about the person, so it's declared as the ProfilePage for the
// Person node defined site-wide in app.vue, and the live-performance embed gets
// a VideoObject. That video is titled "Havre De Grace - Live Performance" — the
// most on-the-nose entity signal the catalogue has — and it previously carried
// no markup at all.
const { siteUrl, toAbsoluteUrl } = useAbsoluteUrl()

useSchemaOrg([
  defineWebPage({
    '@type': ['WebPage', 'ProfilePage'],
    mainEntity: { '@id': schemaId.person(siteUrl) },
  }),
  compact({
    '@type': 'VideoObject',
    '@id': `${canonicalUrl.value}#live-performance`,
    name: 'Havre De Grace - Live Performance',
    description: `${siteProfile.artistName} performing live — solo acoustic guitar and vocals.`,
    thumbnailUrl: 'https://i.ytimg.com/vi/0JF4Pm_-mPs/maxresdefault.jpg',
    embedUrl: 'https://www.youtube-nocookie.com/embed/0JF4Pm_-mPs',
    contentUrl: 'https://www.youtube.com/watch?v=0JF4Pm_-mPs',
    // TODO: add `uploadDate` (ISO 8601) from the video's YouTube publish date.
    // Google requires it for video rich results; it's left out rather than
    // guessed, since a wrong date is worse than a missing one.
    image: toAbsoluteUrl('/press/media-pic-wide.jpg'),
    creator: { '@id': schemaId.artist(siteUrl) },
    mainEntityOfPage: { '@id': `${canonicalUrl.value}#webpage` },
  }),
])
</script>
