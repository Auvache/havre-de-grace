<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-3xl space-y-14">
      <ScrollReveal
        as="header"
        class-name="text-center"
        variant="section-up"
        :duration-ms="880"
        :distance-px="56"
        :threshold="0.16"
        root-margin="0px 0px -6% 0px"
      >
        <SectionHeading
          title="contact"
          description="Email is the fastest way to reach me — it goes straight to my inbox, and I answer everything."
          heading-tag="h1"
          align="center"
        />

        <a
          :href="`mailto:${siteProfile.bookingEmail}`"
          class="interactive-lift mt-8 inline-flex rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white"
        >
          {{ siteProfile.bookingEmail }}
        </a>
      </ScrollReveal>

      <!--
        One inbox, three reasons for writing to it. Spelling out what to include
        is the whole job of a contact page for an independent artist: it turns a
        vague "hi, are you available?" into a bookable enquiry on the first
        email rather than the third.
      -->
      <section class="grid gap-6 sm:grid-cols-3">
        <ScrollReveal
          v-for="(reason, index) in reasons"
          :key="reason.title"
          as="article"
          class-name="surface-card space-y-3 p-6"
          variant="section-up"
          :delay-ms="80 + index * 90"
          :distance-px="52"
          :blur-px="5"
          :threshold="0.12"
          root-margin="0px 0px -8% 0px"
        >
          <p class="label-text">{{ reason.title }}</p>
          <p class="text-sm leading-relaxed muted-text">{{ reason.body }}</p>
          <NuxtLink
            v-if="reason.to"
            :to="reason.to"
            class="nav-link inline-block text-sm hover:text-[var(--color-accent)]"
          >
            {{ reason.linkLabel }}
          </NuxtLink>
        </ScrollReveal>
      </section>

      <ScrollReveal
        as="section"
        class-name="border-t border-theme pt-12 text-center"
        variant="section-up"
        :delay-ms="80"
        :distance-px="44"
        :threshold="0.12"
        root-margin="0px 0px -8% 0px"
      >
        <SectionHeading
          title="elsewhere"
          description="Messages here reach me too, just more slowly than email."
          heading-tag="h2"
          align="center"
        />

        <div class="mt-8 flex justify-center">
          <StreamingLinks :links="siteProfile.artistLinks" compact />
        </div>

        <p class="mt-8 text-sm muted-text">
          Based in {{ siteProfile.location }}.
        </p>
      </ScrollReveal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { schemaId } from '~/utils/schema'

const siteProfile = useSiteProfile()

const reasons = [
  {
    title: 'booking',
    body: 'Include the date, the city, the venue, and the kind of night it is. Solo acoustic, and happy to travel from the Portland–Vancouver area.',
  },
  {
    title: 'press',
    body: 'Bios, high-resolution photos, and release details are ready to download — no need to ask first. Interview requests are welcome by email.',
    to: '/press',
    linkLabel: 'press kit',
  },
  {
    title: 'licensing & collaboration',
    body: 'Sync, film, and other licensing enquiries, or anything else. Say what you have in mind and which song it is for.',
  },
]

const pageDescription = `Booking, press, and licensing contact for Havre De Grace, the acoustic folk project of Stefan Auvache Bradley in Vancouver, Washington.`

const { siteUrl } = useAbsoluteUrl()

useSchemaOrg([
  defineWebPage({
    '@type': ['WebPage', 'ContactPage'],
    mainEntity: { '@id': schemaId.artist(siteUrl) },
  }),
])

usePageSeo({
  title: `Contact & Booking | Havre De Grace`,
  description: pageDescription,
})
</script>
