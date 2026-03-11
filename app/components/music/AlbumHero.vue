<template>
  <section id="art" class="page-container scroll-mt-[calc(var(--nav-height)+4.75rem)] pt-8 md:pt-12">
    <header class="grid gap-10 lg:grid-cols-[minmax(0,520px)_1fr] lg:items-end">
      <img
        :src="album.coverImage"
        :alt="album.coverAlt"
        class="w-full rounded-[var(--radius-lg)] object-cover shadow-[0_18px_40px_color-mix(in_srgb,var(--theme-text)_24%,transparent)]"
      >

      <div class="space-y-5">
        <p class="label-text muted-text">album</p>
        <h1 class="display-heading text-balance">{{ album.title }}</h1>
        <p class="muted-text">
          {{ album.year }}
          <span v-if="formattedReleaseDate"> | {{ formattedReleaseDate }}</span>
        </p>
        <p v-if="album.description" class="max-w-2xl muted-text">
          {{ album.description }}
        </p>
        <StreamingLinks :links="album.streamingLinks" />
      </div>
    </header>
  </section>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'

defineProps<{
  album: Album
  formattedReleaseDate?: string | null
}>()
</script>
