<template>
  <section>
    <img
      src="/press/media-pic-wide.jpg"
      alt="Havre De Grace atmospheric portrait"
      class="w-full rounded-[var(--radius-lg)] object-cover"
      width="3024"
      height="1752"
      fetchpriority="high"
    >

    <div class="mx-auto mt-10 max-w-3xl space-y-6">
      <SectionHeading
        title="about"
        eyebrow="bio"
        description="Personal context, artistic voice, and the core details behind the project."
      />

      <p class="muted-text">
        Havre De Grace is the musical alias of singer-songwriter Stefan Auvache Bradley. The project is built around
        voice and acoustic guitar, with songs that value plainspoken emotion over ornament.
      </p>

      <p class="italic muted-text">
        "Music has been and forever will be an anchor for my soul. I cannot help but play the guitar and write songs.
        It is therapy and celebration."
      </p>

      <p class="muted-text">
        {{ releaseLine }}
      </p>

      <img
        src="/press/media-pic-square.jpg"
        alt="Havre De Grace portrait"
        class="w-full rounded-[var(--radius-md)] object-cover"
        width="2056"
        height="2083"
        loading="lazy"
      >

      <div class="grid gap-6 border-t border-theme pt-8 sm:grid-cols-3">
        <article>
          <p class="label-text muted-text">based in</p>
          <p class="mt-2">{{ siteProfile.location }}</p>
        </article>

        <article>
          <p class="label-text muted-text">genres</p>
          <p class="mt-2">{{ genreLine }}</p>
        </article>

        <article>
          <p class="label-text muted-text">artist</p>
          <p class="mt-2">{{ siteProfile.artistName }}</p>
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

const genreLine = computed(() => siteProfile.genres.join(' | '))

const releaseLine = computed(() => {
  if (!props.latestAlbum) {
    return 'New music and project updates are collected on the music and contact pages.'
  }

  if (!props.latestAlbum.releaseDate) {
    return `The latest release is "${props.latestAlbum.title}" (${props.latestAlbum.year}).`
  }

  const date = new Date(props.latestAlbum.releaseDate)
  if (Number.isNaN(date.getTime())) {
    return `The latest release is "${props.latestAlbum.title}" (${props.latestAlbum.releaseDate}).`
  }

  return `The latest release is "${props.latestAlbum.title}", released ${date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })}.`
})
</script>
