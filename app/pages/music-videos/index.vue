<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-3xl space-y-12">
      <header class="space-y-4">
        <p class="label-text muted-text">
          Unlisted / music videos
        </p>
        <h1 class="display-heading">
          Music videos
        </h1>
        <p class="text-base leading-relaxed muted-text">
          Every film for Into the Wild, in track order.
        </p>
      </header>

      <section class="space-y-3">
        <NuxtLink to="/music-videos/album" class="surface-card block space-y-1 p-6 hover:underline">
          <span class="label-text text-[0.58rem] text-[color:var(--color-accent)]">The album</span>
          <span class="section-heading block text-[1.5rem]">Into the Wild — ten films, one record</span>
          <span class="block text-sm muted-text">The art direction: the constants, the motion rules and a still per song.</span>
        </NuxtLink>
      </section>

      <section class="space-y-4">
        <h2 class="section-heading text-[1.35rem]">
          The songs
        </h2>
        <ol class="divide-y divide-[color:var(--theme-border)] border-y border-theme">
          <li v-for="song in ALBUM_SONGS" :key="song.slug">
            <NuxtLink
              :to="song.page ?? `/music-videos/album#${song.slug}`"
              class="flex flex-wrap items-baseline gap-x-5 gap-y-1 py-4 hover:underline"
            >
              <span class="font-mono text-xs muted-text">{{ String(song.track).padStart(2, '0') }}</span>
              <span class="text-base">{{ song.title }}</span>
              <span class="label-text text-[0.58rem] text-[color:var(--color-accent)]">{{ song.technique }}</span>
              <span class="label-text ml-auto text-[0.55rem] muted-text">{{ song.page ? song.status : 'still only' }}</span>
            </NuxtLink>
          </li>
        </ol>
      </section>

      <section class="space-y-3">
        <h2 class="section-heading text-[1.35rem]">
          Workbench
        </h2>
        <ul class="space-y-2 text-sm leading-relaxed muted-text">
          <li>
            <NuxtLink to="/music-videos/styles" class="underline">/music-videos/styles</NuxtLink>
            — the twelve-style suite the album direction was chosen from.
          </li>
          <li>
            <NuxtLink to="/music-videos/into-the-wild-styles" class="underline">/music-videos/into-the-wild-styles</NuxtLink>
            — the five-style test for the title track.
          </li>
          <li>
            <NuxtLink to="/music-videos/kinetic" class="underline">/music-videos/kinetic</NuxtLink>
            — the original kinetic-typography Andalusia.
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/*
 * /music-videos — the index: the album page, then every song's film.
 *
 * Unlisted and noindexed like everything under /music-videos. The song list is
 * ALBUM_SONGS, so a song gets a link here as soon as its entry has a `page`;
 * until then it links to its still on the album page.
 */
import { ALBUM_SONGS } from '~/config/albumStyle'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Music videos',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})
</script>
