<template>
  <section class="mt-20 border-t border-theme pt-16">
    <ScrollReveal
      as="div"
      class-name="max-w-2xl"
      variant="section-up"
      :delay-ms="70"
      :distance-px="46"
      :threshold="0.18"
      root-margin="0px 0px -6% 0px"
    >
      <SectionHeading
        title="press"
        eyebrow="media"
        description="Bio, photos, and latest release details for media use."
      />
    </ScrollReveal>

    <div class="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <div class="space-y-8">
        <ScrollReveal
          as="article"
          class-name="surface-card space-y-4 p-6"
          variant="section-left"
          :delay-ms="120"
          :distance-px="78"
          :blur-px="6"
          :threshold="0.14"
          root-margin="0px 0px -8% 0px"
        >
          <p class="label-text muted-text">short bio</p>
          <p class="text-sm leading-relaxed muted-text">
            Havre De Grace is the musical alias of singer-songwriter Stefan Auvache Bradley.
          </p>
	        <p class="text-sm leading-relaxed muted-text">"I love music and music loves me. I can't help but play the guitar and write songs."</p>
	        <p class="text-sm leading-relaxed muted-text">
		        Stefan's first album, I Want to Be Yours and Other Songs, was originally released in July 2025. His followup album, Into the Wild, was released on July 17, 2026.
	        </p>
        </ScrollReveal>

        <ScrollReveal
          v-if="latestAlbum"
          as="article"
          class-name="surface-card space-y-4 p-6"
          variant="section-left"
          :delay-ms="220"
          :distance-px="78"
          :blur-px="6"
          :threshold="0.14"
          root-margin="0px 0px -8% 0px"
        >
          <p class="label-text muted-text">latest release</p>
          <h3 class="text-xl font-medium">{{ latestAlbum.title }}</h3>
          <p v-if="latestAlbum.description" class="text-sm muted-text">
            <RichText :text="latestAlbum.description" />
          </p>
          <StreamingLinks :links="latestAlbum.streamingLinks" compact />
        </ScrollReveal>
      </div>

      <div class="space-y-8">
        <ScrollReveal
          as="article"
          class-name="surface-card space-y-5 p-6"
          variant="section-right"
          :delay-ms="270"
          :distance-px="78"
          :blur-px="6"
          :threshold="0.14"
          root-margin="0px 0px -8% 0px"
        >
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
        </ScrollReveal>
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
    day: 'numeric',
    year: 'numeric',
  })
})
</script>
