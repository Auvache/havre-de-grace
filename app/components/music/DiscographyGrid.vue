<template>
  <ul class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
    <li
      v-for="album in albums"
      :key="album.slug"
      :class="[
        'surface-card interactive-lift overflow-hidden',
        album.slug === featuredSlug ? 'ring-1 ring-[var(--color-accent)]/80' : '',
      ]"
    >
      <AlbumCard
        :album="album"
        :featured="album.slug === featuredSlug"
        :show-description="showDescription"
        :heading-tag="headingTag"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'

withDefaults(defineProps<{
  albums: Album[]
  featuredSlug?: string
  showDescription?: boolean
  headingTag?: string
}>(), {
  featuredSlug: undefined,
  showDescription: true,
  headingTag: 'h3',
})
</script>
