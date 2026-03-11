<template>
  <section class="mx-auto max-w-6xl px-6 py-20">
    <p class="text-xs uppercase tracking-[0.2em] text-[var(--color-muted-dark)]">Discography</p>
    <h1 class="mt-4 text-4xl font-medium">music</h1>
    <p class="mt-6 max-w-2xl text-lg text-[var(--color-muted-dark)]">
      Every release on this page is loaded from <code>content/music/*.yml</code>.
    </p>

    <ul v-if="albums?.length" class="mt-12 grid gap-8 sm:grid-cols-2">
      <li
        v-for="album in albums"
        :key="album.slug"
        class="overflow-hidden rounded border border-stone-700 bg-stone-900/60 transition hover:-translate-y-1 hover:border-[var(--color-accent)]"
      >
        <NuxtLink :to="`/music/${album.slug}`" class="block p-4">
          <img
            :src="album.coverImage"
            :alt="album.coverAlt"
            class="aspect-square w-full rounded object-cover"
            loading="lazy"
          >
          <h2 class="mt-4 text-2xl font-medium">{{ album.title }}</h2>
          <p class="mt-1 text-sm text-[var(--color-muted-dark)]">
            {{ album.year }}
          </p>
          <p v-if="album.description" class="mt-4 text-sm text-[var(--color-muted-dark)]">
            {{ album.description }}
          </p>
        </NuxtLink>
      </li>
    </ul>

    <p v-else class="mt-10 text-[var(--color-muted-dark)]">
      No albums are available yet.
    </p>
  </section>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'

definePageMeta({
  layout: 'dark',
})

const { data: albums } = await useAsyncData('music-albums', async () => {
  const items = await queryCollection('music').all() as Album[]

  return [...items].sort((a, b) => {
    if (a.releaseDate && b.releaseDate) {
      return b.releaseDate.localeCompare(a.releaseDate)
    }

    return b.year - a.year
  })
})
</script>
