<template>
  <section class="hero-spotlight relative isolate overflow-hidden">
    <div class="page-container flex min-h-[calc(100vh-var(--nav-height))] flex-col items-center justify-center gap-10 pb-12 pt-[clamp(var(--space-6),11vw,var(--space-8))] text-center">
      <component
        :is="albumHref ? NuxtLinkComponent : 'button'"
        v-if="album"
        :type="albumHref ? undefined : 'button'"
        :to="albumHref ?? undefined"
        :aria-label="albumHref ? undefined : `Open ${album.title}`"
        class="hero-cover-wrap interactive-lift relative block w-full max-w-[504px] overflow-hidden"
        @click="albumHref ? undefined : openSingle()"
      >
        <NuxtImg
          :src="album.coverImage"
          :alt="album.coverAlt"
          class="hero-cover w-full object-cover"
          width="3000"
          height="3000"
          sizes="(max-width: 1024px) 100vw, 504px"
          format="webp,avif"
          loading="eager"
          fetchpriority="high"
        />
      </component>

      <div class="flex max-w-2xl flex-col items-center gap-6">
        <p class="label-text muted-text">
          new release
        </p>

        <h1 class="display-heading">
          {{ album?.title ?? siteProfile.artistName }}
        </h1>

        <p class="muted-text">
          {{ releaseLabel }}
        </p>

        <StreamingLinks v-if="hasAlbumStreamingLinks" :links="album!.streamingLinks" />
        <template v-else-if="leadSingle">
          <p class="text-sm muted-text">
            Stream lead single {{ leadSingle.title }} now
          </p>
          <StreamingLinks :links="leadSingle.streamingLinks" />
        </template>

        <div class="flex flex-wrap justify-center gap-3 pt-2">
          <component
            :is="albumHref || !isSingle ? NuxtLinkComponent : 'button'"
            :type="albumHref || !isSingle ? undefined : 'button'"
            :to="albumHref ?? (isSingle ? undefined : (album ? `/music/${album.slug}` : '/#music'))"
            class="inline-flex rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-white"
            @click="albumHref || !isSingle ? undefined : openSingle()"
          >
            {{ ctaLabel }}
          </component>
          <NuxtLink
            to="/#music"
            class="inline-flex rounded-full border border-theme px-5 py-2.5 text-sm font-medium hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            all releases
          </NuxtLink>
        </div>
      </div>
    </div>

    <SingleModal :album="activeSingle" @close="closeSingle" />
  </section>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'

const props = defineProps<{
  album: Album | null
}>()

const siteProfile = useSiteProfile()

const NuxtLinkComponent = resolveComponent('NuxtLink')

const isSingle = computed(() => Boolean(props.album?.isSingle))

const hasAlbumStreamingLinks = computed(() =>
  Object.values(props.album?.streamingLinks ?? {}).some(Boolean),
)
const leadSingle = computed(() => props.album?.leadSingle ?? null)

// When set, the hero links to this album page instead of opening the single
// modal. Singles tied to a parent release link to that album.
const albumHref = computed(() => {
  if (!props.album) {
    return null
  }

  if (props.album.parentAlbumSlug) {
    return `/music/${props.album.parentAlbumSlug}`
  }

  return props.album.isSingle ? null : `/music/${props.album.slug}`
})

const isSingleOpen = ref(false)
const activeSingle = computed(() => (isSingleOpen.value ? props.album : null))
const openSingle = () => {
  isSingleOpen.value = true
}
const closeSingle = () => {
  isSingleOpen.value = false
}

const ctaLabel = computed(() => {
  if (!props.album) {
    return 'explore music'
  }
  if (albumHref.value) {
    return 'explore the album'
  }
  return isSingle.value ? 'listen now' : 'explore the album'
})

const releaseLabel = computed(() => {
  if (!props.album) {
    return `${siteProfile.artistName} | ${siteProfile.location}`
  }

  if (!props.album.releaseDate) {
    return `Released ${props.album.year}`
  }

  // Parse YYYY-MM-DD as a local date so the announced day isn't shifted by the
  // browser's timezone (a bare `new Date('2026-07-17')` is parsed as UTC).
  const isoMatch = props.album.releaseDate.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!isoMatch) {
    return `Released ${props.album.releaseDate}`
  }

  const [, year, month, day] = isoMatch
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  if (Number.isNaN(date.getTime())) {
    return `Released ${props.album.releaseDate}`
  }

  // Upcoming releases are announced with their day; past releases show month/year.
  if (date.getTime() > Date.now()) {
    return `Coming ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
  }

  return `Released ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
})
</script>

<style scoped>
.hero-spotlight {
  background: transparent;
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
    transform: scale(1.02);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-cover {
    animation: none;
  }
}
</style>
