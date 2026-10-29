<!--
  Where Kit sends someone straight after they sign up, before they've
  confirmed: the "Clare form" redirect (Kit's own hosted form, and the site's
  signup when JavaScript is off and the form posts to Kit directly). With
  JavaScript the signup says "check your inbox" in place and never comes here.

  So the job is the one step left, confirming, and what's waiting after it:
  Kit's confirmation link lands on /seven-inch.
-->

<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-2xl space-y-12">
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
          title="almost there"
          description="Check your inbox for an email from Havre De Grace and click the link to confirm. Then your first 7-inch is waiting: two demos that aren't out anywhere else."
          heading-tag="h1"
          align="center"
        />
      </ScrollReveal>

      <ScrollReveal
        as="section"
        class-name="surface-card space-y-4 p-8 text-center"
        variant="section-up"
        :delay-ms="80"
        :distance-px="52"
        :threshold="0.12"
        root-margin="0px 0px -8% 0px"
      >
        <p class="label-text">from here</p>
        <p class="text-sm leading-relaxed muted-text">
          {{ letter.offerDetail }}
        </p>
        <p class="text-sm leading-relaxed muted-text">
          No email after a few minutes? Look in spam or promotions, and drag it
          to your inbox so the next one lands there.
        </p>
      </ScrollReveal>

      <ScrollReveal
        as="section"
        class-name="space-y-5 text-center"
        variant="section-up"
        :delay-ms="160"
        :distance-px="52"
        :threshold="0.12"
        root-margin="0px 0px -8% 0px"
      >
        <p class="label-text">while you wait</p>

        <NuxtLink
          to="/listen"
          class="cta-solo interactive-lift inline-flex rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white"
        >
          hear the albums
        </NuxtLink>

        <p v-if="shortsUrl" class="text-sm muted-text">
          Or
          <a :href="shortsUrl" target="_blank" rel="noopener" class="nav-link hover:text-[var(--color-accent)]">
            watch the Shorts
          </a>
        </p>
      </ScrollReveal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { letter } from '~~/shared/data/letter'

const siteProfile = useSiteProfile()
const shortsUrl = computed(() => siteProfile.artistLinks.youtube ? `${siteProfile.artistLinks.youtube}/shorts` : '')

usePageSeo({
  title: `Almost there | Havre De Grace`,
  description: 'Confirm your email to join the Havre De Grace mailing list.',
})
</script>
