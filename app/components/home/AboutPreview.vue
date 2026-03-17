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
        />

        <p class="max-w-2xl muted-text">
          Havre De Grace is the musical alias of singer-songwriter Stefan Auvache Bradley.
        </p>

        <p class="max-w-2xl italic muted-text">
	        "I love music and music loves me. I can't help but play the guitar and write songs. It is my favorite thing to
	        do in the world. Havre De Grace is the vehicle I use to share what I love with anyone willing to listen."
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
    return 'Stefan\'s debut album was released in 2025.'
  }

  return `Stefan's debut album "${props.latestAlbumTitle}" was released in 2025.`
})
</script>
