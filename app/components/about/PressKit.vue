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
            Havre De Grace is the musical alias of singer-songwriter Stefan Auvache Bradley. His chosen medium is
            stripped down to what matters: one guitar, his voice, and whatever song won't leave him alone. His debut
            album, I Want to Be Yours and Other Songs, was released in 2025.
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
            Full EPK coming soon.
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

const hasEpkDownload = computed(() => {
  const url = siteProfile.epkDownloadUrl?.trim()
  if (!url) {
    return false
  }

  return !url.toLowerCase().includes('todo')
})
</script>
