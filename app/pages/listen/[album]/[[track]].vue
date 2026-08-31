<template>
  <RecordPlayerScene
    :key="listenAlbum.slug"
    :album="listenAlbum"
    :tracks="tracks"
    :initial-track-slug="initialTrackSlug"
  />
</template>

<script setup lang="ts">
import type { Album, ListenAlbum, ListenTrack } from '~~/shared/types'
import { buildListenTracks, isAlbumListenable, toListenAlbum } from '~/utils/recordPlayer'

// Remount the page (and the scene) when the album changes, but NOT when only the
// track segment changes — track selection uses router.replace within the same album.
definePageMeta({
  layout: 'listen',
  key: (route) => String(route.params.album),
})

const route = useRoute()
const siteProfile = useSiteProfile()

const albumSlug = computed(() => String(route.params.album))
const trackParam = computed(() => {
  const raw = route.params.track
  const value = Array.isArray(raw) ? raw[0] : raw
  return value ? String(value) : undefined
})

const { data: allAlbums } = await useAsyncData(
  () => `listen-player-${albumSlug.value}`,
  async () => {
    const items = await queryCollection('music').all() as Album[]
    return items.filter((item) => item.isVisible !== false && !item.isSingle)
  },
) as { data: Ref<Album[]> }

const album = computed(() => allAlbums.value?.find((item) => item.slug === albumSlug.value) ?? null)

if (!album.value) {
  throw createError({ statusCode: 404, statusMessage: 'Album not found' })
}

// Not released / no audio yet -> back to the picker.
if (!isAlbumListenable(album.value)) {
  await navigateTo('/listen', { replace: true })
}

const listenAlbum = computed<ListenAlbum>(() => toListenAlbum(album.value!))
const tracks = computed<ListenTrack[]>(() => buildListenTracks(album.value!))

// Validate the track slug; drop an unknown one back to the album's Off state.
const initialTrackSlug = computed(() => {
  const slug = trackParam.value
  return slug && tracks.value.some((track) => track.slug === slug) ? slug : undefined
})

if (trackParam.value && !initialTrackSlug.value) {
  await navigateTo(`/listen/${albumSlug.value}`, { replace: true })
}

// noindex (see routeRules in nuxt.config.ts). The canonical still points here
// rather than at /music/<album>: this is a distinct experience, not a duplicate
// of the album page, and noindex already keeps it out of the index. Share
// metadata is kept accurate because these URLs do get passed around directly.
usePageSeo({
  title: computed(() => `Listen to ${album.value?.title ?? 'Album'} in digital vinyl format | ${siteProfile.artistName}`),
  description: computed(() => `Play ${album.value?.title} by ${siteProfile.artistName} on an interactive record player — drop the needle, flip the record, and hear the album side by side.`),
  image: computed(() => (album.value
    ? {
        src: album.value.ogImage ?? album.value.coverImage,
        width: 1200,
        height: 1200,
        type: 'image/jpeg',
        alt: album.value.coverAlt,
      }
    : undefined)),
  path: computed(() => `/listen/${albumSlug.value}`),
  type: 'music.album',
})
</script>
