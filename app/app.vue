<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <AppSplashScreen />
</template>

<script setup lang="ts">
import AppSplashScreen from '~/components/global/AppSplashScreen.vue'

const siteProfile = useSiteProfile()
const { toAbsoluteUrl, siteUrl } = useAbsoluteUrl()

const musicGroupSchema = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'MusicGroup',
  name: siteProfile.artistName,
  alternateName: siteProfile.legalName,
  url: siteUrl,
  description: siteProfile.description,
  genre: siteProfile.genres,
  image: toAbsoluteUrl('/press/media-pic-wide.jpg'),
  sameAs: Object.values(siteProfile.artistLinks).filter((url): url is string => Boolean(url?.trim().length)),
}))

useHead(() => ({
  script: [
    {
      key: 'ld-music-group',
      type: 'application/ld+json',
      textContent: JSON.stringify(musicGroupSchema.value),
    },
  ],
}))
</script>
