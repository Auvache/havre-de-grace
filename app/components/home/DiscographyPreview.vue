<template>
  <section class="page-container section-space text-center">
    <ScrollReveal
      as="div"
      variant="section-up"
      class-name="mx-auto max-w-2xl"
      :delay-ms="70"
      :threshold="0.16"
      root-margin="0px 0px -8% 0px"
    >
      <SectionHeading
        title="music"
        eyebrow="discography"
        align="center"
      />
    </ScrollReveal>

    <ul
      v-if="previewAlbums.length"
      class="mx-auto mt-12 grid w-full max-w-3xl grid-cols-2 gap-5 sm:gap-8"
    >
      <ScrollReveal
        v-for="(album, index) in previewAlbums"
        :key="album.slug"
        as="li"
        :variant="index % 2 === 0 ? 'section-left' : 'section-right'"
        :delay-ms="160 + (index * 110)"
        :distance-px="76"
        :blur-px="6"
        :threshold="0.12"
        root-margin="0px 0px -8% 0px"
      >
        <NuxtLink
          :to="`/music/${album.slug}`"
          class="group block focus-visible:outline-none"
          :aria-label="`Open ${album.title}`"
        >
          <div class="relative overflow-hidden">
            <NuxtImg
              :src="album.coverImage"
              :alt="album.coverAlt"
              class="aspect-square w-full object-cover shadow-[0_22px_46px_color-mix(in_srgb,var(--theme-text)_14%,transparent)] transition-transform duration-300 group-hover:scale-[1.03]"
              width="1200"
              height="1200"
              sizes="(max-width: 768px) 50vw, 420px"
              format="webp,avif"
              loading="lazy"
            />
            <div
              v-if="album.slug === 'into-the-wild'"
              class="absolute inset-0 flex items-center justify-center bg-black/35 text-center"
            >
              <span class="text-lg font-semibold uppercase tracking-[0.2em] text-red-600 sm:text-xl">
                Coming Soon
              </span>
            </div>
          </div>
        </NuxtLink>
      </ScrollReveal>
    </ul>

    <ScrollReveal
      v-else
      as="p"
      class-name="mt-8 muted-text"
      variant="section-up"
      :delay-ms="150"
      :threshold="0.16"
      root-margin="0px 0px -8% 0px"
    >
      Discography entries will appear here as albums are published.
    </ScrollReveal>

    <ScrollReveal
      as="div"
      class-name="mt-10 flex justify-center"
      variant="section-up"
      :delay-ms="240"
      :threshold="0.16"
      root-margin="0px 0px -8% 0px"
    >
      <NuxtLink to="/music" class="nav-link inline-block text-base hover:text-[var(--color-accent)]">
        all releases
      </NuxtLink>
    </ScrollReveal>
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
