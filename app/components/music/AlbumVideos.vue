<template>
  <section id="videos" class="scroll-mt-[calc(var(--nav-height)+4.75rem)]">
    <SectionHeading title="videos" />

    <div class="mt-8 grid gap-8">
      <article v-for="video in videos" :key="`${video.url}-${video.title}`" class="space-y-3">
        <h3 class="text-lg font-medium">{{ video.title }}</h3>
        <p v-if="video.description" class="text-sm leading-6 muted-text">{{ video.description }}</p>
        <iframe
          class="aspect-video w-full rounded-[var(--radius-md)] border border-theme"
          :src="toEmbedUrl(video.url)"
          :title="video.title"
          width="1280"
          height="720"
          loading="lazy"
          referrerpolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { VideoEntry } from '~~/shared/types'
import { toEmbedUrl } from '~~/shared/utils/video'

defineProps<{
  videos: VideoEntry[]
}>()
</script>
