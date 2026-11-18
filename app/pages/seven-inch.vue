<!--
  The list's welcome gift: a 7-inch single on the record player, two demos from
  the next album that aren't out anywhere else. The first welcome email links here; confirming
  lands on /thank-you, which points to that email.

  Unlisted, not private: nothing links to it, it's noindexed (nuxt.config.ts)
  and so is its audio (public/customHttp.json), but anyone with the URL can
  play it. That's fine for a gift; it's no place for a cover.
-->

<template>
  <RecordPlayer
    :albums="[single]"
    format="seven"
    heading="A 7-inch for the Havre De Grace mailing list"
    intro-title="You're in. Here's your 7-inch."
    :intro-lines="[
      'Two demos from my next album. They aren\'t out anywhere else.',
    ]"
    intro-action="Play it"
  />
</template>

<script setup lang="ts">
import type { ListenAlbum } from '~/utils/listenAlbums'
import { formatDuration } from '~/utils/listenAlbums'

definePageMeta({ layout: 'listen' })

/** One song a side. Durations are the files' own, so the side ends where the music does. */
const side = (side: 'a' | 'b', title: string, slug: string, durationSec: number) => ({
  number: side === 'a' ? 1 : 2,
  side,
  sideNumber: 1,
  slug,
  title,
  audioSrc: `/seven-inch/${slug}.mp3`,
  durationSec,
  durationLabel: formatDuration(durationSec),
  lyrics: [],
  credits: [],
})

const single: ListenAlbum = {
  title: 'Insane, Okay / St. George',
  slug: 'seven-inch',
  artist: 'Havre De Grace',
  year: 2026,
  coverImage: '',
  coverAlt: '',
  accent: '#d4a25a',
  credits: [],
  tracks: [
    side('a', 'Insane, Okay', 'insane-okay', 196.2),
    side('b', 'St. George', 'st-george', 172.3),
  ],
}

usePageSeo({
  title: 'A 7-inch for the list | Havre De Grace',
  description: 'Two unreleased demos from the next Havre De Grace album, for the mailing list.',
})
</script>
