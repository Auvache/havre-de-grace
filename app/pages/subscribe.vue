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
          title="mailing list"
          description="New songs, the stories behind them, and early word on the next record — sent straight to your inbox."
          heading-tag="h1"
          align="center"
        />

        <div class="mt-10">
          <NewsletterSignup />
        </div>

        <p class="mt-6 text-sm muted-text">
          One click to confirm, one click to leave. No more than a handful of
          emails a year, and your address goes nowhere else.
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
const expectations = [
  {
    title: 'new songs',
    body: 'Release dates before they go out anywhere else, and the occasional demo or rough mix that never makes the records.',
  },
  {
    title: 'the stories',
    body: 'Where a song came from, what it was originally about, and what changed on the way to the take that shipped.',
  },
  {
    title: 'shows & merch',
    body: 'Dates near you when there are any, and a heads-up when there is something new to buy. Never more than that.',
  },
]

const pageDescription = `Join the Havre De Grace mailing list for new songs, the stories behind them, and early word on the next record from Stefan Auvache Bradley.`

usePageSeo({
  title: `Mailing List | Havre De Grace`,
  description: pageDescription,
})
</script>
