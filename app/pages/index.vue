<template>
  <div>
    <HeroAlbumSpotlight :album="latestAlbum" />

    <ScrollReveal as="div">
      <DiscographyPreview :albums="albums" :featured-slug="latestAlbum?.slug" />
    </ScrollReveal>

    <ScrollReveal as="div" :delay-ms="60">
      <AboutPreview :latest-album-title="latestAlbum?.title" />
    </ScrollReveal>

    <ScrollReveal as="section" class-name="page-container section-space border-t border-theme" :delay-ms="120">
      <SectionHeading
        title="contact"
        eyebrow="booking and updates"
        description="Questions, booking inquiries, and updates all start here."
        align="center"
      />

      <div class="mt-8 text-center">
        <a :href="`mailto:${siteProfile.bookingEmail}`" class="text-base hover:text-[var(--color-accent)]">
          {{ siteProfile.bookingEmail }}
        </a>
      </div>

      <div class="mt-10 flex justify-center">
        <EmailSignupPlaceholder />
      </div>

      <div class="mt-10 text-center">
        <NuxtLink to="/contact" class="nav-link inline-block text-base hover:text-[var(--color-accent)]">
          get in touch
        </NuxtLink>
      </div>
    </ScrollReveal>
  </div>
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

const { data } = await useAsyncData('home-albums', async () => {
  const items = await queryCollection('music').all() as Album[]
  return sortAlbums(items)
})

const albums = computed(() => data.value ?? [])

const latestAlbum = computed(() => {
  const items = albums.value
  return items.find((album) => album.isLatest) ?? items[0] ?? null
})
</script>
