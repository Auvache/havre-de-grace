<!--
  A song's own page, in its album's Cinema grade: the words, Stefan's notes on
  writing and recording it where he's written them, credits, and the songs
  either side. The dock plays it (same engine as everywhere else).
-->

<template>
  <article v-if="album && song" class="song" :style="cinemaStyle">
    <nav aria-label="Breadcrumb" class="crumbs">
      <NuxtLink to="/music">records</NuxtLink>
      <span aria-hidden="true">/</span>
      <NuxtLink :to="`/music/${album.slug}`">{{ album.title }}</NuxtLink>
    </nav>

    <header class="head">
      <NuxtLink :to="`/music/${album.slug}`" :aria-label="`${album.title} by ${siteProfile.artistName}`" class="head__cover">
        <img :src="look.thumb" :alt="album.coverAlt" width="320" height="320">
      </NuxtLink>
      <div>
        <p class="eyebrow">Track {{ song.trackNumber }} of {{ trackCount }}</p>
        <h1>{{ song.track.title }}</h1>
        <p class="head__about">
          <em>{{ song.track.title }}</em> is track {{ song.trackNumber }} on
          <NuxtLink :to="`/music/${album.slug}`">{{ album.title }}</NuxtLink>,
          the {{ albumOrdinal }} album by {{ siteProfile.artistName }}, singer-songwriter
          {{ siteProfile.legalName }}<span v-if="formattedReleaseDate">, released {{ formattedReleaseDate }}</span>.<span v-if="song.track.duration"> Running time {{ song.track.duration }}.</span>
        </p>
        <button v-if="playerIndex !== null" type="button" class="head__play" @click="player.toggleAlbum(album, playerIndex)">
          <b aria-hidden="true">
            <svg v-if="songPlaying" viewBox="0 0 16 16"><path d="M3 2h3.4v12H3zm6.6 0H13v12H9.6z" fill="currentColor" /></svg>
            <svg v-else viewBox="0 0 16 16"><path d="M4 2v12l10-6z" fill="currentColor" /></svg>
          </b>
          <span>{{ songPlaying ? 'Pause' : 'Play the song' }}</span>
        </button>
      </div>
    </header>

    <section v-if="lyrics" class="block">
      <h2 class="eyebrow">{{ song.track.title }} lyrics</h2>
      <pre class="lyrics">{{ lyrics }}</pre>
    </section>

    <!--
      Populated from the `writingStory` / `recordingDetails` / per-track `credits`
      fields in the album content file. These are what make a song page its own
      page rather than a second copy of the album page's lyrics, so they render
      whenever they exist.
    -->
    <section v-if="song.track.writingStory" class="block">
      <h2 class="eyebrow">Writing it</h2>
      <p class="prose"><RichText :text="song.track.writingStory" /></p>
    </section>

    <section v-if="song.track.recordingDetails" class="block">
      <h2 class="eyebrow">Recording it</h2>
      <p class="prose"><RichText :text="song.track.recordingDetails" /></p>
    </section>

    <section v-if="song.track.credits?.length" class="block">
      <h2 class="eyebrow">Credits</h2>
      <dl class="credits">
        <div v-for="credit in song.track.credits" :key="`${credit.role}-${credit.name}`">
          <dt>{{ credit.role }}</dt>
          <dd>{{ credit.name }}</dd>
        </div>
      </dl>
    </section>

    <nav class="sibs" aria-label="Songs either side">
      <NuxtLink v-if="previousSong" :to="`/music/${album.slug}/${previousSong.slug}`">← {{ previousSong.track.title }}</NuxtLink>
      <span v-else />
      <NuxtLink :to="`/music/${album.slug}`" class="sibs__all">all {{ trackCount }} songs</NuxtLink>
      <NuxtLink v-if="nextSong" :to="`/music/${album.slug}/${nextSong.slug}`" class="sibs__next">{{ nextSong.track.title }} →</NuxtLink>
      <span v-else />
    </nav>

    <AlbumDock :album="album" />
  </article>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'
import { toSongRefs } from '~~/shared/utils/songSlug'
import { compact, schemaId, toIsoDuration } from '~/utils/schema'
import { toPlayerTracks } from '~/composables/useAlbumPlayer'
import { currentLook, lookFor } from '~/config/records'

definePageMeta({
  layout: 'dark',
})

const route = useRoute()
const siteProfile = useSiteProfile()
const { toAbsoluteUrl, siteUrl } = useAbsoluteUrl()

const albumSlug = computed(() => String(route.params.slug))
const songSlug = computed(() => String(route.params.song))

const { data: album } = await useAsyncData(
  () => `song-album-${albumSlug.value}`,
  async () => await queryCollection('music').where('slug', '=', albumSlug.value).first() as Album | null,
)

if (!album.value) {
  throw createError({ statusCode: 404, statusMessage: 'Album not found' })
}

const songs = computed(() => (album.value ? toSongRefs(album.value) : []))
const songIndex = computed(() => songs.value.findIndex((ref) => ref.slug === songSlug.value))
const song = computed(() => songs.value[songIndex.value] ?? null)

if (songIndex.value === -1) {
  throw createError({ statusCode: 404, statusMessage: 'Song not found' })
}

// Parse YYYY-MM-DD as a local date (matches the album page).
const parseIsoDate = (value?: string | null) => {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) {
    return null
  }
  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return Number.isNaN(date.getTime()) ? null : date
}

// An unreleased album's songs have no public page yet — the album page itself
// only shows a "coming soon" placeholder, so a song page would leak lyrics and
// tracklist ahead of the release.
const isUpcoming = computed(() => {
  const date = parseIsoDate(album.value?.releaseDate)
  return date ? date.getTime() > Date.now() : false
})

if (isUpcoming.value) {
  await navigateTo(`/music/${albumSlug.value}`, { redirectCode: 302, replace: true })
}

// Singles don't get album pages, so they don't get song pages either.
if (album.value.isSingle) {
  await navigateTo('/music', { redirectCode: 301, replace: true })
}

const trackCount = computed(() => songs.value.length)
const previousSong = computed(() => (songIndex.value > 0 ? songs.value[songIndex.value - 1] : null))
const nextSong = computed(() => songs.value[songIndex.value + 1] ?? null)

const lyrics = computed(() => song.value?.track.lyrics?.trim() || null)

// The album's grade, and this song in the shared player.
const player = usePlayer()
const look = computed(() => lookFor(albumSlug.value) ?? currentLook())
const cinemaStyle = computed(() => ({ '--floor': look.value.cinema.floor, '--acc': look.value.cinema.accent }))
useHead(() => ({ bodyAttrs: { style: `background:${look.value.cinema.floor}` } }))
const playerIndex = computed(() => {
  const found = toPlayerTracks(album.value).findIndex((track) => track.slug === songSlug.value)
  return found === -1 ? null : found
})
const songPlaying = computed(() => playerIndex.value !== null && player.isPlaying(albumSlug.value, playerIndex.value))

const hasStreamingLinks = computed(() =>
  Object.values(album.value?.streamingLinks ?? {}).some(Boolean),
)

const formattedReleaseDate = computed(() => {
  const date = parseIsoDate(album.value?.releaseDate)
  if (!date) {
    return null
  }
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

// "debut" / "second" reads better than a bare number in the intro sentence.
const albumOrdinal = computed(() => {
  const year = album.value?.year
  return year && year <= 2025 ? 'debut' : 'second'
})

const albumUrl = computed(() => toAbsoluteUrl(`/music/${albumSlug.value}`))
const songPath = computed(() => `/music/${albumSlug.value}/${songSlug.value}`)

const pageDescription = computed(() => {
  if (!song.value || !album.value) {
    return ''
  }

  const base = `Lyrics and credits for "${song.value.track.title}" by ${siteProfile.artistName}, track ${song.value.trackNumber} on the album ${album.value.title}`
  return song.value.track.writingStory
    ? `${base}, with the story behind how the song was written.`
    : `${base}.`
})

const { canonicalUrl } = usePageSeo({
  // Song, then artist, then intent. The album name is deliberately left out:
  // including it pushed these past 80 characters (e.g. "I Want to Be Yours -
  // Demo Version — I Want to Be Yours and Other Songs | Havre De Grace"), which
  // Google truncates. The album is still in the description, the breadcrumb, and
  // the on-page copy.
  title: computed(() => `${song.value?.track.title} — ${siteProfile.artistName} | Lyrics`),
  description: pageDescription,
  path: songPath,
  type: 'music.song',
})

// MusicRecording is the page's primary entity, tied by @id to the one MusicGroup
// (app.vue) and to its album's MusicAlbum node. `recordingOf` carries the
// MusicComposition and the lyrics as a distinct work, which is the correct shape
// for song text — MusicRecording has no lyrics property of its own.
useSchemaOrg([
  defineWebPage({
    mainEntity: { '@id': schemaId.recording(toAbsoluteUrl(songPath.value)) },
  }),

  defineBreadcrumb({
    itemListElement: [
      { name: 'Music', item: '/music' },
      { name: album.value.title, item: `/music/${albumSlug.value}` },
      { name: song.value!.track.title, item: songPath.value },
    ],
  }),

  compact({
    '@type': 'MusicRecording',
    '@id': schemaId.recording(canonicalUrl.value),
    name: song.value!.track.title,
    url: canonicalUrl.value,
    position: song.value!.trackNumber,
    duration: toIsoDuration(song.value!.track.duration),
    image: toAbsoluteUrl(album.value.coverImage),
    genre: siteProfile.genres,
    byArtist: { '@id': schemaId.artist(siteUrl) },
    inAlbum: {
      '@type': 'MusicAlbum',
      '@id': schemaId.album(albumUrl.value),
      name: album.value.title,
      url: albumUrl.value,
      byArtist: { '@id': schemaId.artist(siteUrl) },
    },
    mainEntityOfPage: { '@id': `${canonicalUrl.value}#webpage` },
    recordingOf: compact({
      '@type': 'MusicComposition',
      '@id': schemaId.composition(canonicalUrl.value),
      name: song.value!.track.title,
      composer: { '@id': schemaId.person(siteUrl) },
      lyricist: { '@id': schemaId.person(siteUrl) },
      lyrics: lyrics.value
        ? {
            '@type': 'CreativeWork',
            text: lyrics.value,
          }
        : undefined,
    }),
  }),
])
</script>

<style scoped>
.song {
  --dim: #8593a0;
  --rule-dark: rgba(232, 230, 223, 0.12);
  max-width: 980px;
  margin: 0 auto;
  padding: 110px 56px 80px;
  color: #e8e6df;
}

.eyebrow {
  color: var(--acc);
}

.crumbs {
  display: flex;
  gap: 10px;
  font-size: 12px;
  letter-spacing: 0.16em;
  color: var(--dim);
}

.crumbs a {
  text-decoration: none;
}

.crumbs a:hover {
  color: #e8e6df;
}

.head {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 56px;
  align-items: center;
  padding: 48px 0 64px;
  border-bottom: 1px solid var(--rule-dark);
}

.head__cover img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.head h1 {
  font-family: var(--font-serif);
  font-weight: 300;
  font-size: clamp(40px, 5vw, 64px);
  line-height: 1.02;
  margin: 14px 0 20px;
}

.head__about {
  font-size: 16px;
  line-height: 1.75;
  color: #c9c7bf;
  font-weight: 300;
}

.head__about a {
  text-decoration: underline;
  text-underline-offset: 3px;
}

.head__play {
  margin-top: 28px;
  display: inline-flex;
  gap: 18px;
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

.head__play b {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e8e6df;
  color: var(--floor);
  display: grid;
  place-items: center;
}

.head__play svg {
  width: 13px;
  height: 13px;
}

.block {
  padding: 56px 0;
  border-bottom: 1px solid var(--rule-dark);
}

.lyrics {
  margin-top: 22px;
  white-space: pre-wrap;
  font-family: var(--font-serif);
  font-size: 21px;
  line-height: 1.7;
  color: #d3d1c8;
}

.prose {
  margin-top: 18px;
  font-size: 17px;
  line-height: 1.85;
  color: #c9c7bf;
  font-weight: 300;
  max-width: 680px;
}

.credits {
  margin-top: 18px;
  display: grid;
  gap: 8px;
}

.credits div {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 18px;
}

.credits dt {
  min-width: 180px;
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--dim);
  padding-top: 4px;
}

.credits dd {
  font-size: 16px;
  font-weight: 300;
}

.sibs {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  padding-top: 40px;
  font-size: 14px;
  font-weight: 300;
}

.sibs a {
  text-decoration: none;
}

.sibs a:hover {
  color: var(--acc);
}

.sibs__all {
  color: var(--dim);
  letter-spacing: 0.14em;
}

.sibs__next {
  text-align: right;
}

@media (max-width: 720px) {
  .song {
    padding: 90px 20px 60px;
  }

  .head {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .head__cover {
    max-width: 200px;
  }

  .sibs {
    grid-template-columns: 1fr 1fr;
  }

  .sibs__all {
    grid-column: 1 / -1;
    order: 3;
  }
}
</style>
