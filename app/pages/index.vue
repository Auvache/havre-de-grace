<template>
  <div>
    <HeroAlbumSpotlight :album="latestAlbum" />

<!--    <DiscographyPreview :albums="albums" :featured-slug="latestAlbum?.slug" />-->

    <AboutPreview :latest-album-title="latestAlbum?.title" />

    <section class="page-container section-space border-t border-theme">
      <ScrollReveal
        as="div"
        class-name="text-center"
        variant="section-up"
        :delay-ms="80"
        :duration-ms="820"
        :threshold="0.18"
        root-margin="0px 0px -6% 0px"
      >
        <SectionHeading
          title="contact"
          eyebrow="booking and press"
          description="For inquiries, please reach out directly by email."
          align="center"
        />
      </ScrollReveal>

      <ScrollReveal
        as="div"
        class-name="mt-8 text-center"
        variant="section-up"
        :delay-ms="220"
        :distance-px="48"
        :threshold="0.18"
        root-margin="0px 0px -6% 0px"
      >
        <a :href="`mailto:${siteProfile.bookingEmail}`" class="text-base hover:text-[var(--color-accent)]">
          {{ siteProfile.bookingEmail }}
        </a>
        <p class="mt-3 text-sm muted-text">
          Email is the fastest way to connect.
        </p>
      </ScrollReveal>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'

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

const { data } = await useAsyncData('home-albums', async () => {
  const items = await queryCollection('music').all() as Album[]
  return sortAlbums(items)
})

const albums = computed(() => data.value ?? [])

const latestAlbum = computed(() => {
  const items = albums.value
  return items.find((album) => album.isLatest) ?? items[0] ?? null
})

const pageDescription = computed(() => {
  if (!latestAlbum.value) {
    return `${siteProfile.artistName} official website featuring music, bio, and booking details.`
  }

  return `Official website of ${siteProfile.artistName}. Explore the latest release "${latestAlbum.value.title}" and the full discography.`
})

usePageSeo({
  title: `${siteProfile.artistName} | Official Music Site`,
  description: pageDescription,
  image: computed(() => latestAlbum.value?.coverImage),
})
</script>
