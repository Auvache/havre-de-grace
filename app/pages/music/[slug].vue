<template>
  <article v-if="album" class="pb-24">
    <section class="page-container pt-[calc(var(--nav-height)+1.5rem)]">
      <NuxtLink to="/#music" class="nav-link inline-block text-sm muted-text hover:text-[var(--color-accent)]">
        back to music
      </NuxtLink>
    </section>

    <!--
      Unreleased albums show only the cover art and a "Coming <date>" title.
      The full track/lyrics/credits data is kept in the content file and renders
      automatically once the release date has passed.
    -->
    <section
      v-if="isUpcoming"
      class="page-container flex flex-col items-center pb-16 pt-8 text-center md:pt-12"
    >
      <NuxtImg
        :src="album.coverImage"
        :alt="album.coverAlt"
        class="w-full max-w-md rounded-[var(--radius-lg)] object-cover shadow-[0_18px_40px_color-mix(in_srgb,var(--theme-text)_24%,transparent)]"
        width="1400"
        height="1400"
        sizes="(max-width: 768px) 100vw, 448px"
        format="webp,avif"
        loading="eager"
        fetchpriority="high"
      />
      <h1 class="mt-10 text-balance text-2xl font-medium sm:text-3xl">
        {{ comingLabel }}
      </h1>
    </section>

    <template v-else>
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
    </template>
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

// Singles don't have a dedicated album page — they surface in a modal in the
// music section on the homepage.
if (album.value.isSingle) {
  await navigateTo('/#music', { redirectCode: 301 })
}

const hasValue = (value?: string | null) => Boolean(value?.trim().length)

// Parse a YYYY-MM-DD string as a local date so day-level comparisons and labels
// aren't shifted by the browser's timezone (a bare `new Date('2026-07-17')` is UTC).
const parseIsoDate = (value?: string | null) => {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) {
    return null
  }

  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return Number.isNaN(date.getTime()) ? null : date
}

// An album whose release date is still in the future shows a "coming soon"
// placeholder instead of its (not-yet-public) track, lyric, and credit details.
const isUpcoming = computed(() => {
  const date = parseIsoDate(album.value?.releaseDate)
  return date ? date.getTime() > Date.now() : false
})

const comingLabel = computed(() => {
  const date = parseIsoDate(album.value?.releaseDate)
  if (!date) {
    return 'Coming soon'
  }

  return `Coming ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
})

// The per-route config gives released albums a cover-matched gradient. Unreleased
// albums show a bare placeholder, so they use the site's standard white
// background (light-fjord) like every other page instead.
const { setTheme } = usePageTheme()
watchEffect(() => {
  if (isUpcoming.value) {
    setTheme('light', 'light-fjord')
  }
})

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

const hasNotes = computed(() => hasValue(album.value?.linerNotes))

const hasVideos = computed(() => Boolean(album.value?.videos?.length))
const hasCredits = computed(() => Boolean(album.value?.credits?.length))

const pageDescription = computed(() => {
  if (!album.value) {
    return `Havre De Grace Music album page.`
  }

  if (isUpcoming.value) {
    const detail = hasValue(album.value.description) ? album.value.description : comingLabel.value
    return `${album.value.title} by ${siteProfile.artistName}. ${detail}`
  }

  const trackCount = album.value.tracklist.length
  const trackLabel = `${trackCount} track${trackCount === 1 ? '' : 's'}`
  return `${album.value.title} by ${siteProfile.artistName}. ${trackLabel}, lyrics, liner notes, videos, and credits on Havre De Grace Music.`
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

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MusicAlbum',
    name: album.value.title,
    url: canonicalUrl.value,
    image: toAbsoluteUrl(album.value.coverImage),
    datePublished: album.value.releaseDate,
    description: album.value.description,
    genre: siteProfile.genres,
    byArtist: {
      '@type': 'MusicGroup',
      name: siteProfile.artistName,
      url: siteUrl,
      sameAs: Object.values(siteProfile.artistLinks).filter((url): url is string => Boolean(url?.trim().length)),
    },
  }

  // Withhold the tracklist from structured data until the album is released.
  if (!isUpcoming.value) {
    schema.numTracks = album.value.tracklist.length
    schema.track = album.value.tracklist.map((track, index) => ({
      '@type': 'MusicRecording',
      name: track.title,
      position: index + 1,
      duration: toIsoDuration(track.duration),
    }))
  }

  return schema
})

const videoSchemas = computed(() => {
  if (!album.value || isUpcoming.value) {
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
