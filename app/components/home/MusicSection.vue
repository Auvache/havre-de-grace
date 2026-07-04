<template>
  <section
    id="music"
    class="page-container section-space border-t border-theme text-center scroll-mt-[calc(var(--nav-height)+1.5rem)]"
  >
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
      v-if="albums.length"
      class="mx-auto mt-12 flex w-full max-w-5xl flex-wrap justify-center gap-x-8 gap-y-10"
    >
      <ScrollReveal
        v-for="(album, index) in albums"
        :key="album.slug"
        as="li"
        class-name="w-full max-w-xs sm:w-72 sm:max-w-none"
        :variant="index % 2 === 0 ? 'section-left' : 'section-right'"
        :delay-ms="140 + (index * 90)"
        :distance-px="64"
        :blur-px="6"
        :threshold="0.12"
        root-margin="0px 0px -8% 0px"
      >
        <component
          :is="albumHref(album) ? NuxtLinkComponent : 'button'"
          :type="albumHref(album) ? undefined : 'button'"
          :to="albumHref(album) ?? undefined"
          class="group block w-full text-center focus-visible:outline-none"
          :aria-label="`Open ${album.title}`"
          @click="albumHref(album) ? undefined : openSingle(album)"
        >
          <div class="relative overflow-hidden">
            <NuxtImg
              :src="album.coverImage"
              :alt="album.coverAlt"
              class="aspect-square w-full object-cover shadow-[0_22px_46px_color-mix(in_srgb,var(--theme-text)_14%,transparent)] transition-transform duration-300 group-hover:scale-[1.03]"
              width="1200"
              height="1200"
              sizes="(max-width: 640px) 78vw, (max-width: 1024px) 42vw, 320px"
              format="webp,avif"
              loading="lazy"
            />
          </div>

          <h3 class="mt-4 text-xl font-medium leading-tight">
            {{ album.title }}
          </h3>

          <p class="mt-1 text-sm muted-text">
            {{ formatReleaseDate(album) }}
          </p>
        </component>
      </ScrollReveal>
    </ul>

    <p v-else class="mt-10 muted-text">
      No albums are available yet.
    </p>

    <SingleModal :album="activeSingle" @close="activeSingle = null" />
  </section>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'

const props = withDefaults(defineProps<{
  albums: Album[]
}>(), {
  albums: () => [],
})

const NuxtLinkComponent = resolveComponent('NuxtLink')

const activeSingle = ref<Album | null>(null)
const openSingle = (album: Album) => {
  activeSingle.value = album
}

// Returns the album page to link to, or null when the tile should open the
// single modal instead. Singles tied to a parent release link to that album.
const albumHref = (album: Album) => {
  if (album.parentAlbumSlug) {
    return `/music/${album.parentAlbumSlug}`
  }

  return album.isSingle ? null : `/music/${album.slug}`
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const formatReleaseDate = (album: Album) => {
  if (!album.releaseDate) {
    return String(album.year)
  }

  const isoDateMatch = album.releaseDate.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!isoDateMatch) {
    return album.releaseDate
  }

  const [, year, month, day] = isoDateMatch
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day))

  if (Number.isNaN(parsedDate.getTime())) {
    return album.releaseDate
  }

  return dateFormatter.format(parsedDate)
}
</script>
