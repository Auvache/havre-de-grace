<template>
  <section class="mt-20 border-t border-theme pt-16">
    <SectionHeading
      title="press"
      eyebrow="press kit"
      description="Bio, photos, release details, and direct booking contact for media use."
    />

    <div class="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <div class="space-y-8">
        <article class="surface-card space-y-4 p-6">
          <p class="label-text muted-text">short bio</p>
          <p class="text-sm leading-relaxed muted-text">
            This is for my copy-paste short bio section in the press kit. Lorem ipsum dolor sit amet, consectetur
            adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam.
          </p>
        </article>

        <article v-if="latestAlbum" class="surface-card space-y-4 p-6">
          <p class="label-text muted-text">latest release</p>
          <h3 class="text-xl font-medium">{{ latestAlbum.title }}</h3>
          <p class="text-sm muted-text">
            {{ latestAlbum.year }}
            <span v-if="formattedReleaseDate"> | {{ formattedReleaseDate }}</span>
          </p>
          <p v-if="latestAlbum.description" class="text-sm muted-text">
            {{ latestAlbum.description }}
          </p>
          <StreamingLinks :links="latestAlbum.streamingLinks" compact />
        </article>

        <article class="surface-card space-y-4 p-6">
          <p class="label-text muted-text">selected quotes</p>
          <blockquote
            v-for="quote in readyQuotes"
            :key="`${quote.quote}-${quote.source}`"
            class="border-l border-theme pl-4 text-sm italic leading-relaxed muted-text"
          >
            "{{ quote.quote }}"
            <cite v-if="quote.source" class="mt-2 block not-italic">- {{ quote.source }}</cite>
          </blockquote>
          <p v-if="!readyQuotes.length" class="text-sm muted-text">
            This is for placeholder press quotes about my music. Lorem ipsum quote samples will be replaced as coverage is published.
          </p>
        </article>
      </div>

      <div class="space-y-8">
        <article class="surface-card space-y-4 p-6">
          <p class="label-text muted-text">booking and press</p>
          <a :href="`mailto:${siteProfile.bookingEmail}`" class="text-base hover:text-[var(--color-accent)]">
            {{ siteProfile.bookingEmail }}
          </a>
          <a
            v-if="hasEpkDownload"
            :href="siteProfile.epkDownloadUrl"
            class="inline-flex w-fit rounded-full border border-theme px-4 py-2 text-sm hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            download full epk
          </a>
          <p v-else class="text-sm muted-text">
            This is for my EPK download placeholder state. Lorem ipsum packet will be replaced with final assets.
          </p>
        </article>

        <article class="surface-card space-y-5 p-6">
          <p class="label-text muted-text">press photos</p>
          <ul class="space-y-4">
            <li v-for="asset in siteProfile.pressAssets" :key="asset.src" class="space-y-3">
              <NuxtImg
                :src="asset.src"
                :alt="asset.label"
                class="h-28 w-full rounded-[var(--radius-sm)] object-cover"
                width="560"
                height="280"
                sizes="(max-width: 1024px) 100vw, 360px"
                format="webp,avif"
                loading="lazy"
              />
              <div class="flex items-center justify-between gap-3 text-sm">
                <div class="muted-text">
                  <p>{{ asset.label }}</p>
                  <p>{{ imageDimensions[asset.src] ?? 'High resolution' }}</p>
                </div>
                <a
                  :href="asset.src"
                  :download="asset.downloadName"
                  class="inline-flex rounded-full border border-theme px-3 py-1.5 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  download
                </a>
              </div>
            </li>
          </ul>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'

const props = defineProps<{
  latestAlbum: Album | null
}>()

const siteProfile = useSiteProfile()

const imageDimensions: Record<string, string> = {
  '/press/media-pic-square.jpg': '2056 x 2083',
  '/press/media-pic-wide.jpg': '3024 x 1752',
}

const formattedReleaseDate = computed(() => {
  if (!props.latestAlbum?.releaseDate) {
    return null
  }

  const date = new Date(props.latestAlbum.releaseDate)
  if (Number.isNaN(date.getTime())) {
    return props.latestAlbum.releaseDate
  }

  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
})

const readyQuotes = computed(() => (props.latestAlbum?.pressQuotes ?? []).filter((quote) => {
  const normalized = quote.quote.toLowerCase()
  return normalized.trim().length > 0 && !normalized.includes('todo')
}))

const hasEpkDownload = computed(() => {
  const url = siteProfile.epkDownloadUrl?.trim()
  if (!url) {
    return false
  }

  return !url.toLowerCase().includes('todo')
})
</script>
