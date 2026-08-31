<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <AppSplashScreen />
</template>

<script setup lang="ts">
import AppSplashScreen from '~/components/global/AppSplashScreen.vue'
import { compact, schemaId } from '~/utils/schema'

const siteProfile = useSiteProfile()
const { toAbsoluteUrl, siteUrl } = useAbsoluteUrl()

const artistId = schemaId.artist(siteUrl)
const personId = schemaId.person(siteUrl)

// One entity per real-world thing, cross-referenced by @id, in a single @graph.
//
// - WebSite  : the site itself, published by the artist.
// - MusicGroup: "Havre De Grace" the act. Album and song pages point `byArtist`
//   at this @id rather than restating it, so every release rolls up to one
//   artist entity.
// - Person   : Stefan Auvache Bradley. A named target for the legal-name
//   queries, and it tells Google the alias and the person are related rather
//   than being two unconnected names that happen to share a page.
//
// `alternateName` carries the variants people actually search for. Google reads
// these as names for this entity, which is the lever for separating the act
// from Havre de Grace, Maryland.
useSchemaOrg([
  defineWebSite({
    name: 'Havre De Grace',
    alternateName: ['Havre De Grace Music', 'Havre De Grace Band'],
    description: siteProfile.description,
    publisher: { '@id': artistId },
    inLanguage: 'en',
  }),

  compact({
    '@type': 'MusicGroup',
    '@id': artistId,
    name: siteProfile.artistName,
    alternateName: ['Havre De Grace Music', 'Havre De Grace Band'],
    url: `${siteUrl}/`,
    description: siteProfile.description,
    genre: siteProfile.genres,
    foundingLocation: {
      '@type': 'Place',
      name: siteProfile.location,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Vancouver',
        addressRegion: 'WA',
        addressCountry: 'US',
      },
    },
    location: {
      '@type': 'Place',
      name: siteProfile.location,
    },
    member: {
      '@type': 'OrganizationRole',
      member: { '@id': personId },
      roleName: 'Singer-songwriter',
    },
    image: toAbsoluteUrl('/press/media-pic-wide.jpg'),
    logo: toAbsoluteUrl('/android-chrome-512x512.png'),
    email: siteProfile.bookingEmail,
    sameAs: siteProfile.entityUrls,
  }),

  compact({
    '@type': 'Person',
    '@id': personId,
    name: siteProfile.legalName,
    alternateName: siteProfile.artistName,
    url: `${siteUrl}/about`,
    jobTitle: 'Singer-songwriter',
    description: `Singer-songwriter and guitarist from ${siteProfile.location}, who records and performs as ${siteProfile.artistName}.`,
    image: toAbsoluteUrl('/images/profile.jpg'),
    homeLocation: {
      '@type': 'Place',
      name: siteProfile.location,
    },
    memberOf: { '@id': artistId },
  }),
])
</script>
