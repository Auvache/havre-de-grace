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
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { VideoEntry } from '~~/shared/types'

defineProps<{
  videos: VideoEntry[]
}>()

const toEmbedUrl = (url: string) => {
  if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com/video/')) {
    return url
  }

  try {
    const parsed = new URL(url)

    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '')
      return id ? `https://www.youtube.com/embed/${id}` : url
    }

    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}` : url
    }

    if (parsed.hostname.includes('vimeo.com')) {
      const id = parsed.pathname.split('/').filter(Boolean).pop()
      return id ? `https://player.vimeo.com/video/${id}` : url
    }
  }
  catch {
    return url
  }

  return url
}
</script>
