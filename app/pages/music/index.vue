<!--
  Records (docs/redesign/mockups/records.html): every record, newest first, each
  with its cover, its own description, a play button and the way in. The record
  player, the films and influences are linked from the footer.

  /music redirected to the homepage's discography until the 2026 refresh;
  /records now redirects here (nuxt.config.ts).
-->

<template>
  <div>
    <ShorelineBand title="Records" :image="false" />

    <div class="reading wide">
      <article v-for="album in albums" :key="album.slug" class="rec">
        <NuxtLink :to="recordHref(album.slug)" class="rec__cover" :aria-label="`${album.title}, the record`">
          <img :src="lookFor(album.slug)?.cover ?? album.coverImage" :alt="album.coverAlt" width="840" height="840" :loading="album === albums[0] ? 'eager' : 'lazy'">
        </NuxtLink>
        <div>
          <p class="eyebrow">{{ meta(album) }}</p>
          <h2 class="italic-title rec__title">{{ album.title }}</h2>
          <p class="rec__text"><RichText :text="album.description" /></p>
          <div class="rec__acts">
            <button
              type="button"
              class="pp"
              :aria-label="player.isPlaying(album.slug) ? `Pause ${album.title}` : `Play ${album.title}`"
              @click="player.toggleAlbum(album)"
            >
              <svg v-if="player.isPlaying(album.slug)" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2h3.4v12H3zm6.6 0H13v12H9.6z" fill="currentColor" /></svg>
              <svg v-else viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2v12l10-6z" fill="currentColor" /></svg>
            </button>
            <NuxtLink :to="recordHref(album.slug)" class="u-link">Enter the record</NuxtLink>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'
import { lookFor, recordHref } from '~/config/records'
import { schemaId } from '~/utils/schema'

const player = usePlayer()
const { albums } = await useHomeAlbums()

const NUMBERS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']

const seconds = (label?: string) => (label ?? '').split(':').map(Number).reduce((acc, part) => acc * 60 + (part || 0), 0)

/** "2026 · ten songs · 36 minutes", from the record's own tracklist. */
const meta = (album: Album) => {
  const count = album.tracklist?.length ?? 0
  const minutes = Math.round((album.tracklist ?? []).reduce((acc, track) => acc + seconds(track.duration), 0) / 60)
  const songs = `${NUMBERS[count] ?? count} song${count === 1 ? '' : 's'}`
  return [album.year, songs, minutes ? `${minutes} minutes` : null].filter(Boolean).join(' · ')
}

const { siteUrl } = useAbsoluteUrl()

useSchemaOrg([
  defineWebPage({
    '@type': 'CollectionPage',
    about: { '@id': schemaId.artist(siteUrl) },
  }),
])

usePageSeo({
  title: 'Records | Havre De Grace',
  description: 'Every Havre De Grace record, newest first: Into the Wild (2026) and I Want to Be Yours and Other Songs (2025).',
})
</script>

<style scoped>
.rec {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 80px;
  align-items: center;
  padding: 60px 0;
}

/* A rule between records only; the footer brings its own. */
.rec + .rec {
  border-top: 1px solid var(--rule);
}

.rec:first-child {
  padding-top: 0;
}

.rec:last-child {
  padding-bottom: 0;
}

.rec__cover img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.rec__title {
  font-size: clamp(40px, 4vw, 58px);
  margin: 16px 0 22px;
}

.rec__text {
  font-size: 16px;
  line-height: 1.8;
  color: color-mix(in srgb, var(--ink) 78%, var(--bone));
  max-width: 440px;
}

.rec__acts {
  display: flex;
  gap: 30px;
  margin-top: 30px;
  align-items: center;
}

@media (max-width: 900px) {
  .rec {
    grid-template-columns: 1fr;
    gap: 32px;
  }
}
</style>
