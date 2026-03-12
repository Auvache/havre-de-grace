<template>
  <section class="page-container section-space border-t border-theme">
    <div class="grid gap-10 lg:grid-cols-[minmax(0,410px)_1fr] lg:items-center">
      <NuxtImg
        src="/press/media-pic-square.jpg"
        alt="Havre De Grace press photo"
        class="w-full rounded-[var(--radius-lg)] object-cover"
        width="2056"
        height="2083"
        sizes="(max-width: 1024px) 100vw, 410px"
        format="webp,avif"
        loading="lazy"
      />

      <div class="space-y-6">
        <SectionHeading
          title="about"
          eyebrow="bio"
          description="A warm and personal look at the songwriting behind Havre De Grace."
        />

        <p class="max-w-2xl muted-text">
          This is for my bio preview section on the homepage. Lorem ipsum dolor sit amet, consectetur adipiscing elit,
          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua while based in {{ siteProfile.location }}.
        </p>

        <p class="max-w-2xl italic muted-text">
          "This is for my featured artist quote placeholder on the homepage. Lorem ipsum dolor sit amet, consectetur
          adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore."
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
    return 'This is for my latest-release context on the homepage. Lorem ipsum details will expand on the about page.'
  }

  return `This is for my latest-release context on the homepage. Lorem ipsum details support ${props.latestAlbumTitle}.`
})
</script>
