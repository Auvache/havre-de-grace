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

usePageSeo({
  title: computed(() => `Listen: ${album.value?.title ?? 'Album'} | ${siteProfile.artistName}`),
  description: computed(() => `Play ${album.value?.title} by ${siteProfile.artistName} on an interactive record player — drop the needle and explore each song.`),
  image: computed(() => album.value?.coverImage),
  path: computed(() => `/listen/${albumSlug.value}`),
  type: 'music.album',
})
</script>
