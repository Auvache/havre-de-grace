<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-3xl space-y-10">
      <h1 class="display-heading">
        Visualizers
      </h1>
      <ol class="divide-y divide-[color:var(--theme-border)] border-y border-theme">
        <li v-for="(song, i) in SONGS" :key="song.slug">
          <NuxtLink :to="`/visualizers/${song.slug}`" class="flex items-baseline gap-5 py-4 hover:underline">
            <span class="font-mono text-xs muted-text">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="text-base">{{ song.title }}</span>
          </NuxtLink>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
/*
 * /visualizers — one page per song on Into the Wild, in track order. Unlisted
 * and noindexed like everything under it. What each film is, and the ideas
 * for the songs without one, are in docs/visualizers/.
 */
definePageMeta({ layout: 'default' })
useHead({ title: 'Visualizers', meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const SONGS = [
  { slug: 'into-the-wild', title: 'Into the Wild' },
  { slug: 'conman', title: 'Conman' },
  { slug: 'goodbye-norma-jeane', title: 'Goodbye, Norma Jeane' },
  { slug: 'ivory', title: 'Ivory' },
  { slug: 'andalusia', title: 'Andalusia' },
  { slug: 'new-york', title: 'New York' },
  { slug: 'meet-me-at-the-horizon', title: 'Meet Me at the Horizon' },
  { slug: 'rocks-in-the-sea', title: 'Rocks in the Sea' },
  { slug: 'ship-to-stockholm', title: 'Ship to Stockholm' },
  { slug: 'ghost', title: 'Ghost' },
]
</script>
