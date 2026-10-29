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
          :title="letter.offer"
          :description="letter.offerDetail"
          heading-tag="h1"
          align="center"
        />

        <div class="mt-10">
          <NewsletterSignup />
        </div>

        <p class="mt-6 text-sm muted-text">
          One click to confirm, one click to leave. One letter a month, and your
          address goes nowhere else.
        </p>
      </ScrollReveal>

      <!--
        Three reasons to hand over an address, in the same three-card shape the
        contact page uses for its three reasons to write to one.
      -->
      <section class="grid gap-6 sm:grid-cols-3">
        <ScrollReveal
          v-for="(item, index) in expectations"
          :key="item.title"
          as="article"
          class-name="surface-card space-y-3 p-6"
          variant="section-up"
          :delay-ms="80 + index * 90"
          :distance-px="52"
          :blur-px="5"
          :threshold="0.12"
          root-margin="0px 0px -8% 0px"
        >
          <p class="label-text">{{ item.title }}</p>
          <p class="text-sm leading-relaxed muted-text">{{ item.body }}</p>
        </ScrollReveal>
      </section>

      <ScrollReveal
        as="section"
        class-name="border-t border-theme pt-10 text-center"
        variant="section-up"
        :delay-ms="80"
        :distance-px="44"
        :threshold="0.12"
        root-margin="0px 0px -8% 0px"
      >
        <p class="text-sm muted-text">
          See what you'd be getting:
          <NuxtLink to="/letters" class="nav-link hover:text-[var(--color-accent)]">
            read the letters
          </NuxtLink>
        </p>
        <p class="mt-3 text-sm muted-text">
          Already on the list and want off it?
          <NuxtLink to="/unsubscribe" class="nav-link hover:text-[var(--color-accent)]">
            unsubscribe
          </NuxtLink>
        </p>
      </ScrollReveal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { letter } from '~~/shared/data/letter'

const expectations = [
  {
    title: 'unreleased recordings',
    body: 'Something new every month: a demo, an idea I\'m working on, or a song that isn\'t out yet. The list hears it first.',
  },
  {
    title: 'the letter',
    body: 'The story behind each one, music that\'s been moving me, and a few thoughts on making songs around a day job and a young family.',
  },
  {
    title: 'shows & records',
    body: 'Dates near you when there are any, and new records here before anywhere else. Never more than that.',
  },
]

const pageDescription = 'Join the Havre De Grace mailing list: unreleased songs and demos from Stefan Auvache Bradley, something new every month.'

usePageSeo({
  title: `Mailing List | Havre De Grace`,
  description: pageDescription,
})
</script>
