<template>
  <NuxtLink :to="`/music/${album.slug}`" class="group block h-full rounded-[var(--radius-md)] p-4 focus-visible:outline-none">
    <div class="overflow-hidden rounded-[var(--radius-sm)]">
      <img
        :src="album.coverImage"
        :alt="album.coverAlt"
        class="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        loading="lazy"
      >
    </div>

    <p v-if="featured" class="label-text mt-4 text-[var(--color-accent)]">
      new
    </p>

    <component :is="headingTag" class="mt-3 text-2xl font-medium leading-tight">
      {{ album.title }}
    </component>

    <p class="mt-1 text-sm muted-text">
      {{ album.year }}
      <span v-if="formattedReleaseDate"> | {{ formattedReleaseDate }}</span>
    </p>

    <p v-if="showDescription && album.description" class="mt-4 text-sm muted-text">
      {{ album.description }}
    </p>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'

const props = withDefaults(defineProps<{
  album: Album
  featured?: boolean
  showDescription?: boolean
  headingTag?: string
}>(), {
  featured: false,
  showDescription: true,
  headingTag: 'h3',
})

const formattedReleaseDate = computed(() => {
  if (!props.album.releaseDate) {
    return null
  }

  const date = new Date(props.album.releaseDate)
  if (Number.isNaN(date.getTime())) {
    return props.album.releaseDate
  }

  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
})
</script>
