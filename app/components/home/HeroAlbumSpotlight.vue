<template>
  <section class="hero-spotlight relative isolate overflow-hidden">
    <div class="hero-wash pointer-events-none absolute inset-0" aria-hidden="true" />

    <div class="page-container grid min-h-[calc(100vh-var(--nav-height))] gap-12 py-12 lg:grid-cols-[minmax(0,560px)_1fr] lg:items-center">
      <NuxtLink
        v-if="album"
        :to="`/music/${album.slug}`"
        class="hero-cover-wrap interactive-lift overflow-hidden rounded-[var(--radius-lg)] border border-theme"
      >
        <NuxtImg
          :src="album.coverImage"
          :alt="album.coverAlt"
          class="hero-cover w-full object-cover"
          width="3000"
          height="3000"
          sizes="(max-width: 1024px) 100vw, 560px"
          format="webp,avif"
          loading="eager"
          fetchpriority="high"
        />
      </NuxtLink>

      <div class="space-y-6">
        <p class="label-text muted-text">
          latest release
        </p>

        <h1 class="display-heading">
          {{ album?.title ?? siteProfile.artistName }}
        </h1>

        <p class="max-w-2xl muted-text">
          {{ releaseLabel }}
        </p>

        <StreamingLinks v-if="album" :links="album.streamingLinks" />

        <div class="flex flex-wrap gap-3 pt-2">
          <NuxtLink
            :to="album ? `/music/${album.slug}` : '/music'"
            class="inline-flex rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-[var(--theme-bg)]"
          >
            {{ album ? 'explore the album' : 'explore music' }}
          </NuxtLink>
          <NuxtLink
            to="/music"
            class="inline-flex rounded-full border border-theme px-5 py-2.5 text-sm font-medium hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            all releases
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'

const props = defineProps<{
  album: Album | null
}>()

const siteProfile = useSiteProfile()

const releaseLabel = computed(() => {
  if (!props.album) {
    return `${siteProfile.artistName} | ${siteProfile.location}`
  }

  if (!props.album.releaseDate) {
    return `Released ${props.album.year}`
  }

  const date = new Date(props.album.releaseDate)
  if (Number.isNaN(date.getTime())) {
    return `Released ${props.album.releaseDate}`
  }

  return `Released ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
})
</script>

<style scoped>
.hero-spotlight {
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--theme-bg) 94%, var(--color-accent) 6%) 0%,
      #fff 72%,
      color-mix(in srgb, var(--color-bg) 96%, #eaf5fa 4%) 100%
    );
}

.hero-wash {
  background:
    radial-gradient(90% 90% at 12% 12%, color-mix(in srgb, var(--color-accent) 24%, transparent), transparent 62%),
    radial-gradient(80% 80% at 88% 4%, color-mix(in srgb, var(--color-accent) 10%, transparent), transparent 72%);
}

.hero-cover-wrap {
  box-shadow: 0 24px 50px color-mix(in srgb, var(--theme-text) 20%, transparent);
}

.hero-cover {
  animation: hero-cover-zoom 2200ms var(--ease-standard) both;
}

@keyframes hero-cover-zoom {
  from {
    opacity: 0;
    transform: scale(1);
  }
  to {
    opacity: 1;
    transform: scale(1.02);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-cover {
    animation: none;
  }
}
</style>
