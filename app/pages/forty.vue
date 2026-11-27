<!--
  Forty: a live demo of a new song on the record player, one take on one mic.

  Unlisted, not private, like /seven-inch: nothing links to it, it's noindexed
  (nuxt.config.ts) and so is its audio (public/customHttp.json), but anyone
  with the URL can play it.
-->

<template>
  <RecordPlayer
    :albums="[single]"
    format="seven"
    heading="Forty, a live demo by Havre De Grace"
    intro-title="Forty"
    :intro-lines="[
      'A live demo of a new song. One take, one mic.',
    ]"
    intro-action="Play it"
  />
</template>

<script setup lang="ts">
import type { ListenAlbum } from '~/utils/listenAlbums'
import { formatDuration } from '~/utils/listenAlbums'

definePageMeta({ layout: 'listen' })

/** The file's own duration, so the side ends where the music does. */
const DURATION_SEC = 234.6

const single: ListenAlbum = {
  title: 'Forty',
  slug: 'forty',
  artist: 'Havre De Grace',
  year: 2026,
  coverImage: '',
  coverAlt: '',
  accent: '#d4a25a',
  credits: [],
  tracks: [
    {
      number: 1,
      side: 'a',
      sideNumber: 1,
      slug: 'forty',
      title: 'Forty',
      audioSrc: '/forty/forty-mastered.mp3',
      durationSec: DURATION_SEC,
      durationLabel: formatDuration(DURATION_SEC),
      lyrics: [],
      credits: [],
    },
  ],
}

usePageSeo({
  title: 'Forty (live demo) | Havre De Grace',
  description: 'A live demo of Forty, a new Havre De Grace song: one take, one mic.',
})
</script>
