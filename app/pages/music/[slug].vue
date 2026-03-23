<template>
  <section
    v-if="album && isIntoTheWildComingSoon"
    class="flex h-screen items-center justify-center px-6"
  >
    <div class="w-full max-w-xl text-center">
      <NuxtImg
        :src="album.coverImage"
        :alt="album.coverAlt"
        class="aspect-square w-full object-cover shadow-[0_22px_46px_color-mix(in_srgb,var(--theme-text)_24%,transparent)]"
        width="1800"
        height="1800"
        sizes="(max-width: 768px) 90vw, 640px"
        format="webp,avif"
        loading="eager"
        fetchpriority="high"
      />
      <p class="mt-6 text-2xl font-semibold uppercase tracking-[0.2em] text-red-600 sm:text-3xl">
        Coming Soon
      </p>
    </div>
  </section>

  <article v-else-if="album" class="pb-24">
    <section class="page-container pt-[calc(var(--nav-height)+1.5rem)]">
      <NuxtLink to="/music" class="nav-link inline-block text-sm muted-text hover:text-[var(--color-accent)]">
        back to music
      </NuxtLink>
    </section>

    <AlbumHero :album="album" :formatted-release-date="formattedReleaseDate" />

    <AlbumScrollspyNav
      :sections="navSections"
      :active-section-id="activeSectionId"
      @navigate="scrollToSection"
    />

    <div class="page-container space-y-20 pb-10 pt-14 sm:pt-16">
      <Tracklist
        :tracks="album.tracklist"
        :show-lyrics-jump="hasLyrics"
        @jump-to-lyrics="handleTrackLyricsJump"
      />

      <LyricsViewer
        v-if="hasLyrics"
        ref="lyricsViewer"
        :tracks="lyricTracks"
      />

      <LinerNotes
        v-if="hasNotes"
        :notes="album.linerNotes"
        :images="album.linerNoteImages"
      />

      <AlbumVideos
        v-if="hasVideos"
        :videos="album.videos ?? []"
      />

      <AlbumCredits
        v-if="hasCredits"
        :credits="album.credits ?? []"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { Album, LyricTrack, VideoEntry } from '~~/shared/types'
import { toEmbedUrl, toVideoThumbnailUrl } from '~~/shared/utils/video'

interface ScrollSection {
  id: string
  label: string
}

const STICKY_SCROLL_OFFSET = 152

const route = useRoute()
const siteProfile = useSiteProfile()
const { toAbsoluteUrl, siteUrl } = useAbsoluteUrl()

definePageMeta({
  layout: 'dark',
})

const slug = computed(() => route.params.slug as string)

const { data: album } = await useAsyncData(
  () => `music-album-${slug.value}`,
  async () => await queryCollection('music').where('slug', '=', slug.value).first() as Album | null,
)

if (!album.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Album not found',
  })
}

const hasValue = (value?: string | null) => Boolean(value?.trim().length)
const isIntoTheWildComingSoon = computed(() => album.value?.slug === 'into-the-wild')

const formattedReleaseDate = computed(() => {
  if (!album.value?.releaseDate) {
    return null
  }

  const date = new Date(album.value.releaseDate)
  if (Number.isNaN(date.getTime())) {
    return album.value.releaseDate
  }

  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
})

const hasLyrics = computed(() => (album.value?.tracklist ?? []).some((track) => hasValue(track.lyrics)))

const lyricTracks = computed<LyricTrack[]>(() => (album.value?.tracklist ?? [])
  .flatMap((track, index) => (hasValue(track.lyrics)
    ? [{
      trackNumber: index + 1,
      title: track.title,
      duration: track.duration,
      lyrics: track.lyrics!.trim(),
    }]
    : [])))

const hasNotes = computed(() =>
  hasValue(album.value?.linerNotes) || Boolean(album.value?.linerNoteImages?.length))

const hasVideos = computed(() => Boolean(album.value?.videos?.length))
const hasCredits = computed(() => Boolean(album.value?.credits?.length))

const pageDescription = computed(() => {
  if (!album.value) {
    return `${siteProfile.artistName} album page.`
  }

  if (isIntoTheWildComingSoon.value) {
    return `${album.value.title} by ${siteProfile.artistName}. Coming soon.`
  }

  const trackCount = album.value.tracklist.length
  const trackLabel = `${trackCount} track${trackCount === 1 ? '' : 's'}`
  return `${album.value.title} by ${siteProfile.artistName}. ${trackLabel}, lyrics, liner notes, videos, and credits.`
})

const { canonicalUrl } = usePageSeo({
  title: computed(() => `${album.value?.title ?? 'Album'} | ${siteProfile.artistName}`),
  description: pageDescription,
  image: computed(() => album.value?.coverImage),
  type: 'music.album',
})

const toIsoDuration = (value?: string) => {
  if (!value) {
    return undefined
  }

  const segments = value.split(':').map((segment) => Number.parseInt(segment, 10))
  if (segments.some((segment) => Number.isNaN(segment))) {
    return undefined
  }

  if (segments.length === 2) {
    const [minutes, seconds] = segments
    return `PT${minutes}M${seconds}S`
  }

  if (segments.length === 3) {
    const [hours, minutes, seconds] = segments
    return `PT${hours}H${minutes}M${seconds}S`
  }

  return undefined
}

const musicAlbumSchema = computed(() => {
  if (!album.value) {
    return null
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'MusicAlbum',
    name: album.value.title,
    url: canonicalUrl.value,
    image: toAbsoluteUrl(album.value.coverImage),
    datePublished: album.value.releaseDate,
    numTracks: album.value.tracklist.length,
    description: album.value.description,
    genre: siteProfile.genres,
    byArtist: {
      '@type': 'MusicGroup',
      name: siteProfile.artistName,
      url: siteUrl,
      sameAs: Object.values(siteProfile.artistLinks).filter((url): url is string => Boolean(url?.trim().length)),
    },
    track: album.value.tracklist.map((track, index) => ({
      '@type': 'MusicRecording',
      name: track.title,
      position: index + 1,
      duration: toIsoDuration(track.duration),
    })),
  }
})

const videoSchemas = computed(() => {
  if (!album.value) {
    return []
  }

  return (album.value.videos ?? []).map((video: VideoEntry, index: number) => {
    const embedUrl = toEmbedUrl(video.url)
    const thumbnailUrl = toVideoThumbnailUrl(video.url)

    return {
      key: `ld-video-${album.value?.slug}-${index}`,
      data: {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: video.title,
        description: video.description || `${video.title} from ${album.value?.title}`,
        uploadDate: album.value?.releaseDate,
        thumbnailUrl,
        embedUrl,
        contentUrl: video.url,
        isPartOf: {
          '@type': 'MusicAlbum',
          name: album.value?.title,
          url: canonicalUrl.value,
        },
      },
    }
  })
})

useHead(() => {
  const script: Array<{ key: string, type: string, textContent: string }> = []

  if (musicAlbumSchema.value) {
    script.push({
      key: `ld-album-${album.value?.slug}`,
      type: 'application/ld+json',
      textContent: JSON.stringify(musicAlbumSchema.value),
    })
  }

  for (const videoSchema of videoSchemas.value) {
    script.push({
      key: videoSchema.key,
      type: 'application/ld+json',
      textContent: JSON.stringify(videoSchema.data),
    })
  }

  return { script }
})

const navSections = computed<ScrollSection[]>(() => {
  const sections: ScrollSection[] = [
    { id: 'art', label: 'Art' },
    { id: 'tracks', label: 'Tracks' },
  ]

  if (hasLyrics.value) {
    sections.push({ id: 'lyrics', label: 'Lyrics' })
  }

  if (hasNotes.value) {
    sections.push({ id: 'notes', label: 'Notes' })
  }

  if (hasVideos.value) {
    sections.push({ id: 'videos', label: 'Videos' })
  }

  if (hasCredits.value) {
    sections.push({ id: 'credits', label: 'Credits' })
  }

  return sections
})

const { activeSectionId } = useScrollspy(computed(() => navSections.value.map((section) => section.id)))

const lyricsViewer = ref<{ openTrack: (trackNumber: number) => void } | null>(null)

const scrollToSection = (sectionId: string) => {
  if (!import.meta.client) {
    return
  }

  const section = document.getElementById(sectionId)
  if (!section) {
    return
  }

  const top = window.scrollY + section.getBoundingClientRect().top - STICKY_SCROLL_OFFSET
  window.scrollTo({
    top: Math.max(top, 0),
    behavior: 'smooth',
  })
}

const handleTrackLyricsJump = (trackNumber: number) => {
  if (!hasLyrics.value) {
    return
  }

  lyricsViewer.value?.openTrack(trackNumber)

  nextTick(() => {
    scrollToSection(`lyrics-track-${trackNumber}`)
  })
}
</script>
