<template>
  <div>
    <HeroEndlessSea :album="latestAlbum" />

    <HomeSections :albums="albums" />
  </div>
</template>

<script setup lang="ts">
import { schemaId } from '~/utils/schema'

// The hero carries its own navigation; see layouts/home.vue.
definePageMeta({
  layout: 'home',
})

const { albums, latestAlbum } = await useHomeAlbums()

const pageDescription = computed(() => {
  if (!latestAlbum.value) {
    return `Havre De Grace is the acoustic folk and singer-songwriter project of Stefan Auvache Bradley, from Vancouver, Washington. Albums, lyrics, credits, and booking.`
  }

  return `Havre De Grace is the acoustic folk and singer-songwriter project of Stefan Auvache Bradley, from Vancouver, Washington. Hear the album "${latestAlbum.value.title}", read the lyrics, and get booking details.`
})

// The homepage is the page *about* the artist, so its WebPage node names the
// MusicGroup as its mainEntity. This is the relationship the MusicGroup used to
// assert from its own side via `mainEntityOfPage`, which was wrong: that node
// renders on every page, so it pointed at a `/#webpage` @id that only exists here.
const { siteUrl } = useAbsoluteUrl()

useSchemaOrg([
  defineWebPage({
    mainEntity: { '@id': schemaId.artist(siteUrl) },
  }),
])

usePageSeo({
  // "Havre De Grace Music" leads so the exact target phrase (and the domain
  // name) sits at the front of the title.
  title: `Havre De Grace Music | Official`,
  description: pageDescription,
})
</script>
