<!--
  An album page, Cinema (docs/redesign/mockups/album-itw.html, album-iwtby.html).

  Dark, graded per record (app/config/records.ts, `cinema`). The screen at the
  top plays the record as a picture with its lines written in, in sync; then
  the title and the play button, the record's own words, the song journey,
  the credits, quiet listening links, and the other record. The dock at the
  bottom is the transport: the same engine as the light pages' bar, so if this
  record was already playing it carries straight on.

  Two things this page has to keep doing whatever it looks like:
    1. Every track links to its own song page in the server-rendered markup;
       those pages are found by crawling this one.
    2. The structured data comes off the full tracklist.
-->

<template>
  <div v-if="album" class="cinema" :style="cinemaStyle">
    <div class="theatre" data-nav-over>
      <ClientOnly>
        <AlbumScreen :look="look" :lyrics="lyrics" />
        <template #fallback>
          <div class="screen-rest" role="img" :aria-label="look.cinema.slides[0]?.alt">
            <img :src="look.cinema.slides[0]?.src" alt="" :style="{ objectPosition: look.cinema.slides[0]?.position, transform: `scale(${look.cinema.slides[0]?.scale ?? 1})` }">
          </div>
        </template>
      </ClientOnly>
    </div>

    <header class="title">
      <h1 :class="{ long: shortTitle.length > 16 }">{{ shortTitle }}</h1>
      <p class="meta">{{ metaLine }}</p>
      <button v-if="!isUpcoming && tracks.length" type="button" class="acts" @click="player.toggleAlbum(album)">
        <b aria-hidden="true">
          <svg v-if="recordPlaying" viewBox="0 0 16 16"><path d="M3 2h3.4v12H3zm6.6 0H13v12H9.6z" fill="currentColor" /></svg>
          <svg v-else viewBox="0 0 16 16"><path d="M4 2v12l10-6z" fill="currentColor" /></svg>
        </b>
        <span>{{ recordPlaying ? 'Pause the record' : 'Play the record' }}</span>
      </button>
      <p v-else-if="isUpcoming" class="meta">{{ comingLabel }}</p>
    </header>

    <div v-if="album.description" class="intro">
      <p><RichText :text="album.description" /></p>
    </div>

    <SongJourney v-if="!isUpcoming" :album="album" />

    <div v-if="!isUpcoming" class="credits">
      <p class="eyebrow">Credits</p>
      <dl>
        <div v-for="credit in album.credits ?? []" :key="credit.role + credit.name" class="credits__row">
          <dt>{{ credit.role }}</dt>
          <dd>{{ credit.name }}</dd>
        </div>
      </dl>
      <nav class="plat" aria-label="Listen elsewhere">
        <a v-for="link in listenLinks" :key="link.label" :href="link.href" rel="noopener">{{ link.label }}</a>
        <NuxtLink v-if="isListenable" :to="vinylHref">The record player</NuxtLink>
      </nav>
    </div>

    <NuxtLink v-for="other in otherRecords" :key="other.slug" :to="`/music/${other.slug}`" class="next">
      <img :src="lookFor(other.slug)?.thumb ?? other.coverImage" alt="" width="110" height="110" loading="lazy">
      <span>
        <span class="eyebrow">{{ otherLabel(other) }}</span>
        <b>{{ other.title }}</b>
      </span>
      <span class="next__go">Enter</span>
    </NuxtLink>

    <AlbumDock v-if="!isUpcoming && tracks.length" :album="album" />
  </div>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'
import { stripEmphasis } from '~~/shared/utils/emphasis'
import { toSongRefs } from '~~/shared/utils/songSlug'
import { compact, schemaId, toIsoDuration } from '~/utils/schema'
import { isListenable as isAlbumListenable } from '~/utils/listenAlbums'
import { toPlayerTracks } from '~/composables/useAlbumPlayer'
import { loadAlbumLyrics, type TimedLine } from '~/config/albumLyrics'
import { currentLook, lookFor } from '~/config/records'
import { handOffOnSameAlbum } from '~/config/player'
import { streamingPlatformMeta } from '~/utils/streamingPlatforms'

const route = useRoute()
const siteProfile = useSiteProfile()
const { toAbsoluteUrl, siteUrl } = useAbsoluteUrl()
const player = usePlayer()

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

// Singles don't have a dedicated album page.
if (album.value.isSingle) {
  await navigateTo('/music', { redirectCode: 301 })
}

const { data: allAlbums } = await useAsyncData('music-albums-all', async () =>
  (await queryCollection('music').all() as Album[])
    .filter((item) => item.isVisible !== false && !item.isSingle)
    .sort((a, b) => (b.releaseDate ?? String(b.year)).localeCompare(a.releaseDate ?? String(a.year))))

const look = computed(() => lookFor(slug.value) ?? currentLook())

const cinemaStyle = computed(() => ({
  '--floor': look.value.cinema.floor,
  '--acc': look.value.cinema.accent,
}))

useHead(() => ({
  bodyAttrs: { style: `background:${look.value.cinema.floor}` },
}))

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

// --- the record ------------------------------------------------------------

const songRefs = computed(() => (album.value ? toSongRefs(album.value) : []))
const tracks = computed(() => toPlayerTracks(album.value))

/** "I Want to Be Yours and Other Songs" is set as I WANT TO BE YOURS, with the rest in the meta line. */
const shortTitle = computed(() => (album.value?.title ?? '').replace(/ and Other Songs$/i, ''))

const NUMBERS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']

const metaLine = computed(() => {
  const a = album.value
  if (!a) return ''
  const date = parseIsoDate(a.releaseDate)
  const day = date ? date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : String(a.year)
  const count = a.tracklist.length
  const seconds = tracks.value.reduce((sum, track) => sum + track.durationSec, 0)
  const total = seconds ? `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}` : ''
  const rest = a.title !== shortTitle.value ? a.title.slice(shortTitle.value.length).trim().toLowerCase() : ''
  return [rest, siteProfile.artistName, day, `${NUMBERS[count] ?? count} songs`, total].filter(Boolean).join(' · ')
})

const recordPlaying = computed(() => player.isPlaying(slug.value))

// The screen's words, loaded for this record only.
const lyrics = ref<Record<string, TimedLine[]>>({})
onMounted(async () => {
  lyrics.value = await loadAlbumLyrics(slug.value)
})

// Show a link to the interactive record player once the album is released and has audio.
const isListenable = computed(() => (album.value ? isAlbumListenable(album.value) : false))
const vinylHref = computed(() => `/listen#${slug.value}`)

const PLATFORM_ORDER = ['spotify', 'appleMusic', 'youtubeMusic', 'bandcamp', 'amazonMusic'] as const
const listenLinks = computed(() => PLATFORM_ORDER
  .map((key) => ({ label: streamingPlatformMeta[key]?.label ?? key, href: album.value?.streamingLinks?.[key] }))
  .filter((link): link is { label: string, href: string } => Boolean(link.href)))

const otherRecords = computed(() => (allAlbums.value ?? []).filter((item) => item.slug !== slug.value))
const otherLabel = (other: Album) => {
  const older = (other.releaseDate ?? '') < (album.value?.releaseDate ?? '')
  return `${older ? 'The record before' : 'The record after'} · ${other.year}`
}

// --- the hash: /music/<album>#<song> cues that song --------------------------

function cueFromHash() {
  const songSlug = window.location.hash.replace(/^#/, '')
  if (!songSlug || !album.value) return
  const index = tracks.value.findIndex((track) => track.slug === songSlug)
  if (index === -1) return
  if (player.isCurrent(album.value.slug) && player.playing.value) return
  player.cueAlbum(album.value, index)
}

// Keep the address bar a link to what's playing, without routing (no scroll).
watch(() => [player.record.value?.slug, player.track.value?.slug] as const, ([recordSlug, songSlug]) => {
  if (!import.meta.client || recordSlug !== slug.value || !songSlug) return
  const url = new URL(window.location.href)
  if (url.hash === `#${songSlug}`) return
  url.hash = `#${songSlug}`
  window.history.replaceState(window.history.state, '', url.toString())
})

onMounted(() => {
  // A different record, or "always stop": the bar's route rule has already
  // faded it out. Make sure nothing of it is left playing under this page.
  if (player.record.value && (player.record.value.slug !== slug.value || !handOffOnSameAlbum)) {
    player.fadeOutAndStop()
  }
  cueFromHash()
  window.addEventListener('hashchange', cueFromHash)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', cueFromHash)
})

// --- SEO ------------------------------------------------------------------

const pageDescription = computed(() => {
  if (!album.value) {
    return `Havre De Grace Music album page.`
  }

  if (isUpcoming.value) {
    const detail = hasValue(album.value.description) ? stripEmphasis(album.value.description) : comingLabel.value
    return `${album.value.title} by ${siteProfile.artistName}. ${detail}`
  }

  const trackCount = album.value.tracklist.length
  return `${album.value.title} by ${siteProfile.artistName}, singer-songwriter ${siteProfile.legalName}. All ${trackCount} tracks with full lyrics and credits, plus the album in digital vinyl format.`
})

const { canonicalUrl } = usePageSeo({
  title: computed(() => `${album.value?.title ?? 'Album'} by Havre De Grace | Lyrics & Credits`),
  description: pageDescription,
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
      { name: 'Records', item: '/music' },
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
</script>

<style scoped>
.cinema {
  --dim: #8593a0;
  --rule-dark: rgba(232, 230, 223, 0.12);
  background: var(--floor);
  color: #e8e6df;
  font-weight: 200;
  margin-top: -1px;
}

.theatre {
  padding: 96px 56px 0;
}

.theatre > :deep(.screen),
.screen-rest {
  max-width: 1180px;
  margin: 0 auto;
  box-shadow: 0 0 120px color-mix(in srgb, var(--acc) 14%, transparent);
}

.screen-rest {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #000;
}

.screen-rest img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.title {
  padding: 56px 56px 20px;
  text-align: center;
}

.title h1 {
  font-weight: 200;
  font-size: clamp(34px, 5vw, 72px);
  letter-spacing: 0.3em;
  text-indent: 0.3em;
  text-transform: uppercase;
  line-height: 1.1;
}

.title h1.long {
  font-size: clamp(28px, 3.4vw, 48px);
}

.meta {
  margin-top: 18px;
  font-size: 12px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--dim);
}

.acts {
  margin-top: 34px;
  display: inline-flex;
  gap: 22px;
  align-items: center;
  font: inherit;
  font-size: 12px;
  font-weight: 300;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #e8e6df;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.acts b {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #e8e6df;
  color: var(--floor);
  display: grid;
  place-items: center;
}

.acts b svg {
  width: 16px;
  height: 16px;
}

.intro {
  max-width: 820px;
  margin: 0 auto;
  padding: 110px 24px 120px;
  text-align: center;
}

.intro p {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 300;
  font-size: clamp(24px, 2.3vw, 32px);
  line-height: 1.45;
  color: #d8d6ce;
}

.intro :deep(em) {
  font-style: normal;
}

.eyebrow {
  color: var(--acc);
}

.credits {
  text-align: center;
  padding: 130px 56px 120px;
  background: linear-gradient(180deg, var(--floor), color-mix(in srgb, var(--floor) 80%, #2a3540));
}

.credits dl {
  max-width: 720px;
  margin: 36px auto 0;
}

.credits__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 36px;
  text-align: left;
  align-items: baseline;
}

.credits dt {
  text-align: right;
  color: var(--dim);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  font-size: 11px;
  line-height: 2.9;
}

.credits dd {
  font-size: 16px;
  line-height: 2.5;
  font-weight: 300;
}

.plat {
  margin-top: 70px;
  display: flex;
  justify-content: center;
  gap: 18px 34px;
  flex-wrap: wrap;
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #cfd2d0;
}

.plat a {
  text-decoration: none;
}

.plat a:hover {
  color: var(--acc);
}

.next {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 40px;
  align-items: center;
  padding: 60px 56px;
  border-top: 1px solid var(--rule-dark);
  text-decoration: none;
}

.next img {
  width: 110px;
  height: 110px;
  object-fit: cover;
}

.next b {
  font-family: var(--font-serif);
  font-weight: 300;
  font-size: 34px;
  line-height: 1.15;
  display: block;
  margin-top: 6px;
}

.next__go {
  font-size: 12px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  border-bottom: 1px solid #e8e6df;
  padding-bottom: 4px;
}

.next:hover b {
  color: var(--acc);
}

@media (max-width: 640px) {
  .theatre {
    padding: 72px 0 0;
  }

  .title {
    padding: 40px 20px 10px;
  }

  .title h1 {
    letter-spacing: 0.22em;
    text-indent: 0.22em;
  }

  .intro {
    padding: 70px 20px;
  }

  .credits {
    padding: 80px 20px;
  }

  .credits__row {
    gap: 16px;
  }

  .next {
    grid-template-columns: auto 1fr;
    gap: 20px;
    padding: 40px 20px;
  }

  .next img {
    width: 80px;
    height: 80px;
  }

  .next__go {
    grid-column: 1 / -1;
    justify-self: start;
  }
}
</style>
