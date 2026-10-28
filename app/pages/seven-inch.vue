<!--
  The list's welcome gift: a 7-inch single on the record player, two demos that
  aren't out anywhere else. Kit sends people here once they confirm, and the
  first welcome email links here too.

  Unlisted, not private: nothing links to it, it's noindexed (nuxt.config.ts)
  and so is its audio (public/customHttp.json), but anyone with the URL can
  play it. That's fine for a gift; it's no place for a cover.
-->

<template>
  <RecordPlayer
    :albums="[single]"
    format="seven"
    heading="A 7-inch for the Havre De Grace mailing list"
    intro-title="You're in. This one's just for the list."
    :intro-lines="[
      'Two demos that aren\'t out anywhere else.',
      'Side A is All I Need. Flip it over for Skin and Bones.',
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
  title: 'All I Need / Skin and Bones',
  slug: 'seven-inch',
  artist: 'Havre De Grace',
  year: 2026,
  coverImage: '',
  coverAlt: '',
  accent: '#d4a25a',
  credits: [],
  tracks: [
    side('a', 'All I Need', 'all-i-need', 203.5),
    side('b', 'Skin and Bones', 'skin-and-bones', 228.9),
  ],
}

usePageSeo({
  title: 'A 7-inch for the list | Havre De Grace',
  description: 'Two unreleased demos from Havre De Grace, for the mailing list.',
})
</script>
