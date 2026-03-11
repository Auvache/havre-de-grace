<template>
  <section class="page-container section-space border-t border-theme">
    <div class="grid gap-10 lg:grid-cols-[minmax(0,410px)_1fr] lg:items-center">
      <img
        src="/press/media-pic-square.jpg"
        alt="Havre De Grace press photo"
        class="w-full rounded-[var(--radius-lg)] object-cover"
        width="2056"
        height="2083"
        loading="lazy"
      >

      <div class="space-y-6">
        <SectionHeading
          title="about"
          eyebrow="bio"
          description="A warm and personal look at the songwriting behind Havre De Grace."
        />

        <p class="max-w-2xl muted-text">
          Havre De Grace is the musical alias of singer-songwriter Stefan Auvache Bradley. Based in
          {{ siteProfile.location }}, he writes intimate acoustic songs that stay close to voice, guitar, and story.
        </p>

        <p class="max-w-2xl italic muted-text">
          "Music has been and forever will be an anchor for my soul. I cannot help but play the guitar and write songs."
        </p>

        <p class="max-w-2xl muted-text">
          {{ latestReleaseLine }}
        </p>

        <NuxtLink to="/about" class="nav-link inline-block text-base hover:text-[var(--color-accent)]">
          read more
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  latestAlbumTitle?: string
}>()

const siteProfile = useSiteProfile()

const latestReleaseLine = computed(() => {
  if (!props.latestAlbumTitle) {
    return 'Read the full bio and press details on the about page.'
  }

  return `Latest release: ${props.latestAlbumTitle}. Read the full story and press materials on the about page.`
})
</script>
