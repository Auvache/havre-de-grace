<!--
  The homepage, Still Water (docs/redesign/mockups/home.html); the page itself
  is components/home/StillWater.vue, and this file is its SEO.

  The current record's cover is the whole first screen with one play button.
  Below it: the monthly letter, About, and the discography. A record links to
  the record player for now (recordHref in app/config/records.ts). The record, its picture and its words come from
  app/config/records.ts and content/music, so a new record is a config change.
-->

<template>
  <StillWater />
</template>

<script setup lang="ts">
import { schemaId } from '~/utils/schema'

definePageMeta({
  layout: 'home',
  navOver: true,
})

const { latestAlbum } = await useHomeAlbums()

const pageDescription = computed(() => {
  if (!latestAlbum.value) {
    return `Havre De Grace is singer-songwriter Stefan Auvache Bradley. Albums, lyrics, credits, and booking.`
  }

  return `Havre De Grace is singer-songwriter Stefan Auvache Bradley. Hear the album "${latestAlbum.value.title}", read the lyrics, and get booking details.`
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
