<template>
  <section class="page-container section-space border-t border-theme">
    <SectionHeading
      title="music"
      eyebrow="discography"
      description="A preview of every release, with the newest record up front."
    />

    <DiscographyGrid
      v-if="previewAlbums.length"
      class="mt-12"
      :albums="previewAlbums"
      :featured-slug="featuredSlug"
      :show-description="false"
      heading-tag="h3"
    />

    <p v-else class="mt-8 muted-text">
      Discography entries will appear here as albums are published.
    </p>

    <div class="mt-10">
      <NuxtLink to="/music" class="nav-link inline-block text-base hover:text-[var(--color-accent)]">
        all releases
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'

const props = withDefaults(defineProps<{
  albums: Album[]
  featuredSlug?: string
}>(), {
  featuredSlug: undefined,
})

const previewAlbums = computed(() => props.albums.slice(0, 3))
</script>
