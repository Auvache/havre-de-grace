<template>
  <section class="page-container section-space border-t border-theme text-center">
    <SectionHeading
      title="music"
      eyebrow="discography"
      description="A preview of every release, with the newest record up front."
      align="center"
    />

    <ul
      v-if="previewAlbums.length"
      class="mx-auto mt-12 grid w-full max-w-3xl grid-cols-2 gap-5 sm:gap-8"
    >
      <li v-for="album in previewAlbums" :key="album.slug">
        <NuxtLink
          :to="`/music/${album.slug}`"
          class="group block focus-visible:outline-none"
          :aria-label="`Open ${album.title}`"
        >
          <NuxtImg
            :src="album.coverImage"
            :alt="album.coverAlt"
            class="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            width="1200"
            height="1200"
            sizes="(max-width: 768px) 50vw, 420px"
            format="webp,avif"
            loading="lazy"
          />
        </NuxtLink>
      </li>
    </ul>

    <p v-else class="mt-8 muted-text">
      Discography entries will appear here as albums are published.
    </p>

    <div class="mt-10 flex justify-center">
      <NuxtLink to="/music" class="nav-link inline-block text-base hover:text-[var(--color-accent)]">
        all releases
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'

const props = withDefaults(defineProps<{
  albums: Album[]
  featuredSlug?: string
}>(), {
  featuredSlug: undefined,
})

const previewAlbums = computed(() => props.albums.slice(0, 2))
</script>
