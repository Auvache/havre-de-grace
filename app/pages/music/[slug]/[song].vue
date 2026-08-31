<template>
  <article v-if="album && song" class="pb-24">
    <section class="page-container pt-[calc(var(--nav-height)+1.5rem)]">
      <nav aria-label="Breadcrumb" class="text-sm muted-text">
        <ol class="flex flex-wrap items-center gap-2">
          <li>
            <NuxtLink to="/#music" class="nav-link hover:text-[var(--color-accent)]">
              music
            </NuxtLink>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <NuxtLink :to="`/music/${album.slug}`" class="nav-link hover:text-[var(--color-accent)]">
              {{ album.title }}
            </NuxtLink>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{{ song.track.title }}</li>
        </ol>
      </nav>
    </section>

    <section class="page-container grid gap-10 pb-12 pt-10 md:grid-cols-[minmax(0,320px)_1fr] md:items-start">
      <NuxtLink
        :to="`/music/${album.slug}`"
        :aria-label="`${album.title} by ${siteProfile.artistName}`"
        class="mx-auto block w-full max-w-[320px] overflow-hidden rounded-[var(--radius-md)]"
      >
        <NuxtImg
          :src="album.coverImage"
          :alt="album.coverAlt"
          class="w-full object-cover"
          width="1200"
          height="1200"
          sizes="(max-width: 768px) 60vw, 320px"
          format="webp,avif"
          loading="eager"
          fetchpriority="high"
        />
      </NuxtLink>

      <div class="space-y-5">
        <p class="label-text muted-text">
          track {{ song.trackNumber }} of {{ trackCount }}
        </p>

        <h1 class="text-balance text-3xl font-medium sm:text-4xl">
          {{ song.track.title }}
        </h1>

        <p class="muted-text">
          <em>{{ song.track.title }}</em> is track {{ song.trackNumber }} on
          <NuxtLink :to="`/music/${album.slug}`" class="nav-link hover:text-[var(--color-accent)]">{{ album.title }}</NuxtLink>,
          the {{ albumOrdinal }} album by {{ siteProfile.artistName }} — the acoustic folk
          project of {{ siteProfile.legalName }}<span v-if="formattedReleaseDate">, released {{ formattedReleaseDate }}</span>.<span v-if="song.track.duration"> Running time {{ song.track.duration }}.</span>
        </p>

        <StreamingLinks v-if="hasStreamingLinks" :links="album.streamingLinks" />
      </div>
    </section>

    <section v-if="lyrics" class="page-container">
      <SectionHeading :title="`${song.track.title} lyrics`" heading-tag="h2" />
      <pre class="mt-6 whitespace-pre-wrap font-sans text-sm leading-7 muted-text">{{ lyrics }}</pre>
    </section>

    <!--
      Populated from the `writingStory` / `recordingDetails` / per-track `credits`
      fields in the album content file. These are what make a song page its own
      page rather than a second copy of the album page's lyrics, so they render
      whenever they exist.
    -->
    <section v-if="song.track.writingStory" class="page-container mt-16">
      <SectionHeading title="writing it" heading-tag="h2" />
      <p class="mt-6 muted-text">
        <RichText :text="song.track.writingStory" />
      </p>
    </section>

    <section v-if="song.track.recordingDetails" class="page-container mt-16">
      <SectionHeading title="recording it" heading-tag="h2" />
      <p class="mt-6 muted-text">
        <RichText :text="song.track.recordingDetails" />
      </p>
    </section>

    <section v-if="song.track.credits?.length" class="page-container mt-16">
      <SectionHeading title="credits" heading-tag="h2" />
      <dl class="mt-6 space-y-2 text-sm">
        <div v-for="credit in song.track.credits" :key="`${credit.role}-${credit.name}`" class="flex flex-wrap gap-2">
          <dt class="muted-text">
            {{ credit.role }}:
          </dt>
          <dd>{{ credit.name }}</dd>
        </div>
      </dl>
    </section>

    <nav class="page-container mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-theme pt-8 text-sm">
      <NuxtLink
        v-if="previousSong"
        :to="`/music/${album.slug}/${previousSong.slug}`"
        class="nav-link hover:text-[var(--color-accent)]"
      >
        ← {{ previousSong.track.title }}
      </NuxtLink>
      <span v-else />

      <NuxtLink :to="`/music/${album.slug}`" class="nav-link muted-text hover:text-[var(--color-accent)]">
        all {{ trackCount }} tracks
      </NuxtLink>

      <NuxtLink
        v-if="nextSong"
        :to="`/music/${album.slug}/${nextSong.slug}`"
        class="nav-link text-right hover:text-[var(--color-accent)]"
      >
        {{ nextSong.track.title }} →
      </NuxtLink>
      <span v-else />
    </nav>
  </article>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'
import { toSongRefs } from '~~/shared/utils/songSlug'
import { compact, schemaId, toIsoDuration } from '~/utils/schema'

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
  await navigateTo('/#music', { redirectCode: 301, replace: true })
}

const trackCount = computed(() => songs.value.length)
const previousSong = computed(() => (songIndex.value > 0 ? songs.value[songIndex.value - 1] : null))
const nextSong = computed(() => songs.value[songIndex.value + 1] ?? null)

const lyrics = computed(() => song.value?.track.lyrics?.trim() || null)

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
  image: computed(() => (album.value
    ? {
        src: album.value.ogImage ?? album.value.coverImage,
        width: 1200,
        height: 1200,
        type: 'image/jpeg',
        alt: album.value.coverAlt,
      }
    : undefined)),
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
      { name: 'Music', item: '/#music' },
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
