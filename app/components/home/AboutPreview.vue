<template>
  <section class="page-container section-space border-t border-theme">
    <div class="grid gap-10 md:grid-cols-[minmax(0,504px)_1fr] md:items-center">
      <ScrollReveal
        as="div"
        variant="section-left"
        class-name="mx-auto w-full max-w-[504px] overflow-hidden rounded-[var(--radius-lg)]"
        :delay-ms="90"
        :distance-px="84"
        :threshold="0.18"
        root-margin="0px 0px -8% 0px"
      >
        <NuxtImg
          src="/images/bio-update.png"
          alt="Havre De Grace press photo"
          class="w-full rounded-[var(--radius-lg)] object-cover shadow-[0_26px_54px_color-mix(in_srgb,var(--theme-text)_14%,transparent)]"
          width="2000"
          height="2000"
          sizes="(max-width: 768px) 100vw, 504px"
          format="webp,avif"
          loading="lazy"
        />
      </ScrollReveal>

      <ScrollReveal
        as="div"
        class-name="space-y-6"
        variant="section-right"
        :delay-ms="180"
        :distance-px="84"
        :blur-px="6"
        :threshold="0.18"
        root-margin="0px 0px -8% 0px"
      >
        <SectionHeading
          title="about havre de grace"
          eyebrow="bio"
        />

        <p class="max-w-2xl muted-text">
          Havre De Grace is the musical alias of singer-songwriter Stefan Auvache Bradley,
          who writes and records acoustic folk music in Vancouver, Washington. The songs are
          built around fingerpicked guitar and a single voice, in the raw, unhurried style of
          The Tallest Man on Earth and Nick Drake's <em>Pink Moon</em>.
        </p>

        <p class="max-w-2xl italic muted-text">
	        "I love music and music loves me. I can't help but play the guitar and write songs."
        </p>

        <p class="max-w-2xl muted-text">
          {{ latestReleaseLine }} Every song is published here in full, with lyrics and credits.
        </p>

        <NuxtLink to="/about" class="nav-link inline-block text-base hover:text-[var(--color-accent)]">
          read more
        </NuxtLink>
      </ScrollReveal>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'

const props = defineProps<{
  albums?: Album[]
}>()

const siteProfile = useSiteProfile()

// Albums arrive newest-first from the homepage.
const releases = computed(() => props.albums ?? [])

const releaseYear = (album: Album) => {
  const isoYear = album.releaseDate?.slice(0, 4)
  return isoYear && /^\d{4}$/.test(isoYear) ? isoYear : String(album.year)
}

// Describes the catalogue from the content itself. The previous version was
// hardcoded to "His debut album ... was released in 2025" but was handed the
// *latest* album's title, so once Into the Wild shipped it announced the 2026
// record as a 2025 debut.
const latestReleaseLine = computed(() => {
  const items = releases.value
  if (!items.length) {
    return ''
  }

  const debut = items[items.length - 1]!
  const latest = items[0]!

  if (items.length === 1) {
    return `His debut album "${debut.title}" was released in ${releaseYear(debut)}.`
  }

  return `His debut album "${debut.title}" was released in ${releaseYear(debut)}, followed by "${latest.title}" in ${releaseYear(latest)}.`
})
</script>
