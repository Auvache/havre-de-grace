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
        This is for my full bio section on the about page. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
        do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </p>

      <p class="italic muted-text">
        "This is for my long-form artist quote placeholder for tone and personality. Lorem ipsum dolor sit amet,
        consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore."
      </p>

      <p class="muted-text">
        {{ releaseLine }}
      </p>

      <p class="muted-text">
        This is for my extended narrative bio copy between photos. Lorem ipsum dolor sit amet, consectetur adipiscing
        elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam.
      </p>

      <img
        src="/press/media-pic-square.jpg"
        alt="Havre De Grace portrait"
        class="w-full rounded-[var(--radius-md)] object-cover"
        width="2056"
        height="2083"
        loading="lazy"
      >

      <div class="grid gap-4 sm:grid-cols-2">
        <img
          src="/images/albums/i-want-to-be-yours-and-other-songs/liner-note-portrait-wide.jpg"
          alt="Placeholder about image - wide portrait"
          class="h-full w-full rounded-[var(--radius-sm)] object-cover"
          loading="lazy"
        >
        <img
          src="/images/albums/i-want-to-be-yours-and-other-songs/liner-note-evergreens.jpg"
          alt="Placeholder about image - atmospheric trees"
          class="h-full w-full rounded-[var(--radius-sm)] object-cover"
          loading="lazy"
        >
      </div>

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
    return 'This is for my release timeline context in the bio. Lorem ipsum updates are listed on music and contact pages.'
  }

  if (!props.latestAlbum.releaseDate) {
    return `This is for my release timeline context in the bio. Lorem ipsum supports "${props.latestAlbum.title}" (${props.latestAlbum.year}).`
  }

  const date = new Date(props.latestAlbum.releaseDate)
  if (Number.isNaN(date.getTime())) {
    return `This is for my release timeline context in the bio. Lorem ipsum supports "${props.latestAlbum.title}" (${props.latestAlbum.releaseDate}).`
  }

  return `This is for my release timeline context in the bio. Lorem ipsum supports "${props.latestAlbum.title}", released ${date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })}.`
})
</script>
