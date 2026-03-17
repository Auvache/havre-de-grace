<template>
  <section class="page-container section-space">
    <div class="mx-auto max-w-2xl text-center">
      <ScrollReveal
        as="div"
        variant="section-up"
        :delay-ms="70"
        :duration-ms="840"
        :distance-px="56"
        :threshold="0.18"
        root-margin="0px 0px -6% 0px"
      >
        <SectionHeading
          title="contact"
          eyebrow="booking and press"
          description="For booking, interviews, and press requests, email directly or find Havre De Grace on the platforms below."
          heading-tag="h1"
          align="center"
        />
      </ScrollReveal>

      <ScrollReveal
        as="div"
        class-name="mt-10 rounded-[var(--radius-lg)] border border-theme bg-[color-mix(in_srgb,var(--theme-surface)_92%,transparent)] px-6 py-10 shadow-[0_28px_58px_color-mix(in_srgb,var(--theme-text)_10%,transparent)] sm:px-10"
        variant="section-up"
        :delay-ms="180"
        :distance-px="52"
        :threshold="0.16"
        root-margin="0px 0px -6% 0px"
      >
        <p class="label-text muted-text">email</p>
        <a
          :href="`mailto:${siteProfile.bookingEmail}`"
          class="mt-4 inline-block text-lg hover:text-[var(--color-accent)] sm:text-xl"
        >
          {{ siteProfile.bookingEmail }}
        </a>
        <p class="mt-4 text-sm muted-text">
          Email is the fastest way to connect.
        </p>

        <div class="mt-8 flex justify-center">
          <StreamingLinks :links="siteProfile.artistLinks" />
        </div>
      </ScrollReveal>
    </div>
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  theme: 'light',
})

const siteProfile = useSiteProfile()

usePageSeo({
  title: `Contact | ${siteProfile.artistName}`,
  description: `Contact ${siteProfile.artistName} for booking, interviews, and press requests.`,
  image: '/press/media-pic-square.jpg',
})
</script>
