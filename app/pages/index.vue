<template>
  <div>
    <HeroAlbumSpotlight :album="latestAlbum" />

    <AboutPreview :albums="albums" />

    <MusicSection :albums="albums" />

    <section
      id="contact"
      class="page-container section-space border-t border-theme scroll-mt-[calc(var(--nav-height)+1.5rem)]"
    >
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
        <NuxtLink
          to="/about#press"
          class="mt-4 inline-block text-sm hover:text-[var(--color-accent)]"
        >
          Go to press kit
        </NuxtLink>
      </ScrollReveal>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'
import { schemaId } from '~/utils/schema'

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
    return `Havre De Grace is the acoustic folk and singer-songwriter project of Stefan Auvache Bradley, from Vancouver, Washington. Albums, lyrics, credits, and booking.`
  }

  return `Havre De Grace is the acoustic folk and singer-songwriter project of Stefan Auvache Bradley, from Vancouver, Washington. Hear the album "${latestAlbum.value.title}", read the lyrics, and get booking details.`
})

// The homepage is the page *about* the artist, so its WebPage node names the
// MusicGroup as its mainEntity. This is the relationship the MusicGroup used to
// assert from its own side via `mainEntityOfPage`, which was wrong: that node
// renders on every page, so it pointed at a `/#webpage` @id that only exists here.
const { siteUrl } = useAbsoluteUrl()

useSchemaOrg([
  defineWebPage({
    mainEntity: { '@id': schemaId.artist(siteUrl) },
  }),
])

usePageSeo({
  // "Havre De Grace Music" leads so the exact target phrase (and the domain
  // name) sits at the front of the title, with the genre terms behind it.
  title: `Havre De Grace Music | Acoustic Folk Singer-Songwriter`,
  description: pageDescription,
  image: computed(() => (latestAlbum.value
    ? {
        src: latestAlbum.value.ogImage ?? latestAlbum.value.coverImage,
        width: 1200,
        height: 1200,
        type: 'image/jpeg',
        alt: latestAlbum.value.coverAlt,
      }
    : undefined)),
})
</script>
