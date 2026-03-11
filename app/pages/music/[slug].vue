<template>
  <article v-if="album" class="mx-auto max-w-6xl px-6 py-20">
    <NuxtLink to="/music" class="text-sm text-[var(--color-muted-dark)] hover:text-[var(--color-accent)]">
      Back to music
    </NuxtLink>

    <header class="mt-8 grid gap-8 md:grid-cols-[minmax(0,360px)_1fr]">
      <img
        :src="album.coverImage"
        :alt="album.coverAlt"
        class="w-full rounded object-cover"
      >
      <div>
        <h1 class="text-4xl font-medium">{{ album.title }}</h1>
        <p class="mt-2 text-sm uppercase tracking-[0.15em] text-[var(--color-muted-dark)]">
          {{ album.year }}
          <span v-if="formattedReleaseDate"> | {{ formattedReleaseDate }}</span>
        </p>
        <p v-if="album.description" class="mt-6 max-w-2xl text-lg text-[var(--color-muted-dark)]">
          {{ album.description }}
        </p>

        <ul class="mt-8 flex flex-wrap gap-3">
          <li v-for="link in streamingEntries" :key="link.label">
            <a
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex rounded border border-stone-700 px-3 py-2 text-sm hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              {{ link.label }}
            </a>
          </li>
        </ul>
      </div>
    </header>

    <section class="mt-16">
      <h2 class="text-2xl font-medium">Tracks</h2>
      <ol class="mt-6 space-y-8">
        <li v-for="(track, index) in album.tracklist" :key="`${track.title}-${index}`" class="border-b border-stone-700 pb-8">
          <p class="text-lg">
            {{ String(index + 1).padStart(2, '0') }}. {{ track.title }}
            <span v-if="track.duration" class="ml-2 text-sm text-[var(--color-muted-dark)]">({{ track.duration }})</span>
          </p>
          <pre
            v-if="track.lyrics"
            class="mt-4 whitespace-pre-wrap font-sans text-sm text-[var(--color-muted-dark)]"
          >{{ track.lyrics }}</pre>
        </li>
      </ol>
    </section>

    <section v-if="album.linerNotes" class="mt-16">
      <h2 class="text-2xl font-medium">Liner Notes</h2>
      <p class="mt-6 max-w-3xl whitespace-pre-line text-[var(--color-muted-dark)]">{{ album.linerNotes }}</p>
    </section>

    <section v-if="album.videos?.length" class="mt-16">
      <h2 class="text-2xl font-medium">Videos</h2>
      <div class="mt-6 grid gap-8">
        <article v-for="video in album.videos" :key="video.url" class="space-y-3">
          <h3 class="text-lg font-medium">{{ video.title }}</h3>
          <p v-if="video.description" class="text-sm text-[var(--color-muted-dark)]">{{ video.description }}</p>
          <iframe
            class="aspect-video w-full rounded"
            :src="video.url"
            :title="video.title"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </article>
      </div>
    </section>

    <section v-if="album.credits?.length" class="mt-16">
      <h2 class="text-2xl font-medium">Credits</h2>
      <ul class="mt-6 space-y-3 text-[var(--color-muted-dark)]">
        <li v-for="credit in album.credits" :key="`${credit.role}-${credit.name}`">
          <span class="font-medium text-[var(--color-text-dark)]">{{ credit.role }}:</span>
          {{ credit.name }}
        </li>
      </ul>
    </section>
  </article>
</template>

<script setup lang="ts">
import type { Album, StreamingLinks } from '~~/shared/types'

const route = useRoute()

definePageMeta({
  layout: 'dark',
})

const slug = computed(() => route.params.slug as string)

const streamingPlatformLabels: Record<keyof StreamingLinks, string> = {
  spotify: 'Spotify',
  appleMusic: 'Apple Music',
  youtubeMusic: 'YouTube Music',
  amazonMusic: 'Amazon Music',
  bandcamp: 'Bandcamp',
  soundcloud: 'SoundCloud',
  youtube: 'YouTube',
  instagram: 'Instagram',
}

const { data: album } = await useAsyncData(
  () => `music-album-${slug.value}`,
  async () => await queryCollection('music').where('slug', '=', slug.value).first() as Album | null,
)

if (!album.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Album not found',
  })
}

const formattedReleaseDate = computed(() => {
  if (!album.value?.releaseDate) {
    return null
  }

  const date = new Date(album.value.releaseDate)
  if (Number.isNaN(date.getTime())) {
    return album.value.releaseDate
  }

  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
})

const streamingEntries = computed(() => {
  if (!album.value) {
    return []
  }

  return (Object.entries(album.value.streamingLinks) as Array<[keyof StreamingLinks, string | undefined]>)
    .filter(([, url]) => Boolean(url))
    .map(([platform, url]) => ({
      label: streamingPlatformLabels[platform] ?? platform,
      url: url as string,
    }))
})
</script>
