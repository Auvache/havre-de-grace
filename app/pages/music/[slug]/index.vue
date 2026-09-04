<template>
  <article v-if="album" class="pb-24">
    <section class="page-container flex items-center justify-between gap-4 pt-[calc(var(--nav-height)+1.5rem)]">
      <NuxtLink to="/#music" class="nav-link inline-block text-sm muted-text hover:text-[var(--color-accent)]">
        back to home
      </NuxtLink>
      <NuxtLink
        v-if="isListenable"
        to="/listen"
        class="nav-link inline-block text-sm font-semibold text-[var(--color-accent)]"
      >
        listen in digital vinyl format →
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
        <Tracklist :tracks="trackEntries" :album-slug="album.slug" />

        <AlbumCredits
          v-if="hasCredits"
          :credits="album.credits ?? []"
        />
      </div>
    </template>
  </article>
</template>

<script setup lang="ts">
import type { Album, LyricTrack } from '~~/shared/types'
import { stripEmphasis } from '~~/shared/utils/emphasis'
import { toSongRefs } from '~~/shared/utils/songSlug'
import { compact, schemaId, toIsoDuration } from '~/utils/schema'
import { isListenable as isAlbumListenable } from '~/utils/listenAlbums'

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

// Show a link to the interactive record player once the album is released and has audio.
const isListenable = computed(() => (album.value ? isAlbumListenable(album.value) : false))

// Every track is listed in the tracks section; the ones with lyrics expand to show
// them, and each links out to its own song page.
const songRefs = computed(() => (album.value ? toSongRefs(album.value) : []))
const songSlugByTrackNumber = computed(
  () => new Map(songRefs.value.map((ref) => [ref.trackNumber, ref.slug])),
)

const trackEntries = computed<LyricTrack[]>(() => (album.value?.tracklist ?? [])
  .map((track, index) => ({
    trackNumber: index + 1,
    title: track.title,
    duration: track.duration,
    lyrics: hasValue(track.lyrics) ? track.lyrics!.trim() : undefined,
    songSlug: songSlugByTrackNumber.value.get(index + 1),
  })))

const hasCredits = computed(() => Boolean(album.value?.credits?.length))

const pageDescription = computed(() => {
  if (!album.value) {
    return `Havre De Grace Music album page.`
  }

  if (isUpcoming.value) {
    const detail = hasValue(album.value.description) ? stripEmphasis(album.value.description) : comingLabel.value
    return `${album.value.title} by ${siteProfile.artistName}. ${detail}`
  }

  const trackCount = album.value.tracklist.length
  return `${album.value.title} by ${siteProfile.artistName} — the acoustic folk project of ${siteProfile.legalName}. All ${trackCount} tracks with full lyrics and credits, plus the album in digital vinyl format.`
})

const { canonicalUrl } = usePageSeo({
  title: computed(() => `${album.value?.title ?? 'Album'} by Havre De Grace | Lyrics & Credits`),
  description: pageDescription,
  image: computed(() => (album.value
    ? {
        src: album.value.ogImage ?? album.value.coverImage,
        width: 1200,
        height: 1200,
        type: 'image/jpeg',
        alt: album.value.coverAlt,
      }
    : undefined)),
  type: 'music.album',
})

// MusicAlbum is this page's primary entity. Two things changed from the previous
// hand-rolled block: `byArtist` now *references* the single site-wide MusicGroup
// by @id instead of restating a partial copy of it, and the tracklist points at
// the per-song MusicRecording nodes on the song pages, so the album, its songs,
// and the artist form one connected graph. The streaming URLs are attached here
// too — they're the strongest corroboration that this release is real, and they
// were previously absent from the album markup entirely.
const albumStreamingUrls = computed(() =>
  Object.values(album.value?.streamingLinks ?? {}).filter((url): url is string => Boolean(url?.trim().length)),
)

useSchemaOrg([
  defineWebPage({
    mainEntity: { '@id': schemaId.album(canonicalUrl.value) },
  }),

  defineBreadcrumb({
    itemListElement: [
      { name: 'Music', item: '/#music' },
      { name: album.value.title, item: `/music/${slug.value}` },
    ],
  }),

  compact({
    '@type': 'MusicAlbum',
    '@id': schemaId.album(canonicalUrl.value),
    name: album.value.title,
    url: canonicalUrl.value,
    image: toAbsoluteUrl(album.value.ogImage ?? album.value.coverImage),
    datePublished: album.value.releaseDate,
    description: stripEmphasis(album.value.description),
    genre: siteProfile.genres,
    albumProductionType: 'https://schema.org/StudioAlbum',
    albumReleaseType: 'https://schema.org/AlbumRelease',
    byArtist: { '@id': schemaId.artist(siteUrl) },
    mainEntityOfPage: { '@id': `${canonicalUrl.value}#webpage` },
    sameAs: albumStreamingUrls.value,
    // Withhold the tracklist from structured data until the album is released.
    numTracks: isUpcoming.value ? undefined : album.value.tracklist.length,
    track: isUpcoming.value
      ? undefined
      : songRefs.value.map((ref) => compact({
          '@type': 'MusicRecording',
          '@id': schemaId.recording(toAbsoluteUrl(`/music/${slug.value}/${ref.slug}`)),
          name: ref.track.title,
          url: toAbsoluteUrl(`/music/${slug.value}/${ref.slug}`),
          position: ref.trackNumber,
          duration: toIsoDuration(ref.track.duration),
          byArtist: { '@id': schemaId.artist(siteUrl) },
        })),
  }),
])

const navSections = computed<ScrollSection[]>(() => {
  const sections: ScrollSection[] = [
    { id: 'art', label: 'Art' },
    { id: 'tracks', label: 'Tracks' },
  ]

  if (hasCredits.value) {
    sections.push({ id: 'credits', label: 'Credits' })
  }

  return sections
})

const { activeSectionId } = useScrollspy(computed(() => navSections.value.map((section) => section.id)))

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
</script>
