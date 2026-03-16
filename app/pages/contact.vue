<template>
  <section class="page-container section-space">
    <SectionHeading
      title="contact"
      eyebrow="booking and press"
      description="Please reach out by email for booking, interviews, and press requests."
      heading-tag="h1"
    />

    <div class="mx-auto mt-12 grid max-w-4xl gap-8 lg:grid-cols-2">
      <article class="surface-card space-y-3 p-6">
        <p class="label-text muted-text">email</p>
        <a :href="`mailto:${siteProfile.bookingEmail}`" class="text-base hover:text-[var(--color-accent)]">
          {{ siteProfile.bookingEmail }}
        </a>
        <p class="text-sm muted-text">
          Email is the best way to get in touch.
        </p>
      </article>

      <article class="surface-card space-y-4 p-6">
        <p class="label-text muted-text">social links</p>
        <StreamingLinks :links="socialLinks" />
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { StreamingLinks } from '~~/shared/types'

definePageMeta({
  theme: 'light',
})

const siteProfile = useSiteProfile()

const socialPlatformByLabel: Record<string, keyof StreamingLinks> = {
  Spotify: 'spotify',
  'Apple Music': 'appleMusic',
  'YouTube Music': 'youtubeMusic',
  'Amazon Music': 'amazonMusic',
  Bandcamp: 'bandcamp',
  SoundCloud: 'soundcloud',
  YouTube: 'youtube',
  Instagram: 'instagram',
}

const socialLinks = computed<Record<string, string>>(() =>
  siteProfile.socialLinks.reduce((acc, link) => {
    const platform = socialPlatformByLabel[link.label]
    if (platform) {
      acc[platform] = link.url
    }

    return acc
  }, {} as Record<string, string>))

usePageSeo({
  title: `Contact | ${siteProfile.artistName}`,
  description: `Contact ${siteProfile.artistName} for booking, interviews, and press requests.`,
  image: '/press/media-pic-square.jpg',
})
</script>
