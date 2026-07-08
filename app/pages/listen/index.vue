<template>
  <div class="page-container pb-24 pt-[calc(var(--nav-height)+2rem)]">
    <header class="mb-10 max-w-2xl">
      <h1 class="text-3xl font-medium sm:text-4xl">Listen</h1>
      <p class="mt-3 text-[var(--theme-muted)]">
        Drop the needle on the record player. Pick an album to load it onto the turntable.
      </p>
    </header>

    <ul class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      <li v-for="album in albums" :key="album.slug">
        <NuxtLink
          v-if="album.listenable"
          :to="`/listen/${album.slug}`"
          class="group block"
        >
          <div class="overflow-hidden rounded-[var(--radius-lg)] shadow-[0_14px_30px_color-mix(in_srgb,var(--theme-text)_20%,transparent)]">
            <NuxtImg
              :src="album.coverImage"
              :alt="album.coverAlt"
              class="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
              width="800"
              height="800"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              format="webp,avif"
              loading="lazy"
            />
          </div>
          <h2 class="mt-3 text-sm font-semibold">{{ album.title }}</h2>
          <p class="text-xs uppercase tracking-[0.12em] text-[var(--color-accent)]">Play on the record player</p>
        </NuxtLink>

        <div v-else class="block cursor-default opacity-70">
          <div class="relative overflow-hidden rounded-[var(--radius-lg)] shadow-[0_14px_30px_color-mix(in_srgb,var(--theme-text)_16%,transparent)]">
            <NuxtImg
              :src="album.coverImage"
              :alt="album.coverAlt"
              class="aspect-square w-full object-cover"
              width="800"
              height="800"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              format="webp,avif"
              loading="lazy"
            />
            <span class="absolute inset-x-0 bottom-0 bg-black/55 px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.12em] text-white">
              {{ album.releaseLabel ?? 'Coming soon' }}
            </span>
          </div>
          <h2 class="mt-3 text-sm font-semibold">{{ album.title }}</h2>
          <p class="text-xs uppercase tracking-[0.12em] text-[var(--theme-muted)]">Not yet available</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { Album, ListenAlbum } from '~~/shared/types'
import { toListenAlbum } from '~/utils/recordPlayer'

definePageMeta({
  layout: 'dark',
})

const { data: albums } = await useAsyncData('listen-albums', async () => {
  const items = await queryCollection('music').all() as Album[]
  return items
    .filter((album) => album.isVisible !== false && !album.isSingle)
    .map((album) => toListenAlbum(album))
    // Listenable albums first, then newest by year.
    .sort((a, b) => Number(b.listenable) - Number(a.listenable))
}) as { data: Ref<ListenAlbum[]> }

usePageSeo({
  title: 'Listen | Havre De Grace',
  description: 'Play Havre De Grace albums on an interactive record player — drop the needle, explore lyrics, stories, and artwork for each song.',
  path: '/listen',
})
</script>
