<template>
  <section id="art" class="page-container scroll-mt-[calc(var(--nav-height)+4.75rem)] pb-8 pt-8 md:pb-12 md:pt-12">
    <header class="grid gap-10 lg:grid-cols-[minmax(0,520px)_1fr] lg:items-end">
      <NuxtImg
        :src="album.coverImage"
        :alt="album.coverAlt"
        class="w-full rounded-[var(--radius-lg)] object-cover shadow-[0_18px_40px_color-mix(in_srgb,var(--theme-text)_24%,transparent)]"
        width="1400"
        height="1400"
        sizes="(max-width: 1024px) 100vw, 520px"
        format="webp,avif"
        loading="eager"
        fetchpriority="high"
      />

      <div class="space-y-5">
        <p class="label-text muted-text">album</p>
        <h1 class="display-heading text-balance">{{ album.title }}</h1>
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
