<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-3xl space-y-16">
      <ScrollReveal
        as="header"
        variant="section-up"
        :duration-ms="880"
        :distance-px="56"
        :threshold="0.16"
        root-margin="0px 0px -6% 0px"
      >
        <SectionHeading
          title="press"
          description="Bios, photos, and release details for media use. Everything on this page is cleared for publication."
          heading-tag="h1"
        />

        <!--
          The whole kit as one file, above everything else: an editor on a
          deadline wants one link, not eight. The individual downloads below are
          for everyone who only needs the short bio or a single photo.
        -->
        <div class="mt-8 flex flex-wrap items-center gap-4">
          <a
            :href="siteProfile.epkDownloadUrl"
            download
            class="interactive-lift inline-flex rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-white"
          >
            download the full press kit (.zip)
          </a>
          <p class="text-sm muted-text">
            Bios, photos, and a fact sheet.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal
        as="section"
        variant="section-up"
        :delay-ms="80"
        :distance-px="52"
        :threshold="0.14"
        root-margin="0px 0px -8% 0px"
      >
        <SectionHeading title="the facts" heading-tag="h2" />

        <dl class="mt-8 divide-y divide-[color:var(--theme-border)] border-y border-theme text-sm">
          <!--
            The label sits above the value on phones and beside it from `sm` up.
            A fixed label column at 390px left the booking address — the single
            most important line on the page — clipped mid-word.
          -->
          <div v-for="fact in facts" :key="fact.label" class="flex flex-wrap gap-x-6 gap-y-1 py-3">
            <dt class="label-text muted-text w-full shrink-0 pt-1 sm:w-40">{{ fact.label }}</dt>
            <dd class="min-w-0 flex-1 break-words">
              <a
                v-if="fact.href"
                :href="fact.href"
                class="hover:text-[var(--color-accent)]"
              >{{ fact.value }}</a>
              <span v-else>{{ fact.value }}</span>
            </dd>
          </div>
        </dl>
      </ScrollReveal>

      <PressBios />

      <PressPhotos />

      <ScrollReveal
        v-if="latestAlbum"
        as="section"
        variant="section-up"
        :delay-ms="80"
        :distance-px="52"
        :threshold="0.12"
        root-margin="0px 0px -8% 0px"
      >
        <SectionHeading title="latest release" heading-tag="h2" />

        <article class="surface-card mt-10 grid gap-6 p-6 sm:grid-cols-[minmax(0,180px)_1fr] sm:items-start">
          <NuxtImg
            :src="latestAlbum.coverImage"
            :alt="latestAlbum.coverAlt"
            class="w-full rounded-[var(--radius-sm)] object-cover"
            width="360"
            height="360"
            sizes="(max-width: 640px) 100vw, 180px"
            format="webp,avif"
            loading="lazy"
          />

          <div class="space-y-4">
            <div>
              <h3 class="text-xl font-medium">{{ latestAlbum.title }}</h3>
              <p v-if="formattedReleaseDate" class="mt-1 text-sm muted-text">
                Released {{ formattedReleaseDate }}
              </p>
            </div>

            <p v-if="latestAlbum.description" class="text-sm leading-relaxed muted-text">
              <RichText :text="latestAlbum.description" />
            </p>

            <StreamingLinks :links="latestAlbum.streamingLinks" compact />

            <NuxtLink
              :to="`/music/${latestAlbum.slug}`"
              class="nav-link inline-block text-sm hover:text-[var(--color-accent)]"
            >
              tracklist and credits
            </NuxtLink>
          </div>
        </article>
      </ScrollReveal>

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
          title="interviews and requests"
          description="Interview requests, additional photos, or anything not covered here."
          heading-tag="h2"
          align="center"
        />

        <NuxtLink
          to="/contact"
          class="interactive-lift mt-8 inline-flex rounded-full border border-theme px-6 py-3 text-sm hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          get in touch
        </NuxtLink>
      </ScrollReveal>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'
import { schemaId } from '~/utils/schema'

const siteProfile = useSiteProfile()

const { data } = await useAsyncData('press-albums', async () => {
  const items = await queryCollection('music').all() as Album[]
  return [...items]
    .filter((album) => album.isVisible !== false)
    .sort((a, b) => (b.releaseDate ?? String(b.year)).localeCompare(a.releaseDate ?? String(a.year)))
})

const latestAlbum = computed(() => {
  const items = data.value ?? []
  return items.find((album) => album.isLatest) ?? items[0] ?? null
})

const formattedReleaseDate = computed(() => {
  const raw = latestAlbum.value?.releaseDate
  if (!raw) {
    return null
  }

  // Parsed into a *local* date from its parts, the way HeroAlbumSpotlight does.
  // `new Date('2026-07-17')` is midnight UTC, which toLocaleDateString then
  // renders in the reader's zone — so anyone west of Greenwich sees the release
  // land a day early. This page prints the day, so that error is visible.
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!isoMatch) {
    return raw
  }

  const [, year, month, day] = isoMatch
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  if (Number.isNaN(date.getTime())) {
    return raw
  }

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
})

const facts = computed(() => [
  { label: 'Performing name', value: siteProfile.artistName },
  { label: 'Legal name', value: siteProfile.legalName },
  { label: 'Based in', value: siteProfile.location },
  { label: 'Genres', value: siteProfile.genres.join(', ') },
  ...(latestAlbum.value
    ? [{ label: 'Latest release', value: `${latestAlbum.value.title} (${latestAlbum.value.year})` }]
    : []),
  {
    label: 'Booking & press',
    value: siteProfile.bookingEmail,
    href: `mailto:${siteProfile.bookingEmail}`,
  },
])

const pageDescription = `Press kit for Havre De Grace, the acoustic folk project of Stefan Auvache Bradley: short, medium and long bios, high-resolution press photos, release details, and booking contact.`

const { siteUrl } = useAbsoluteUrl()

useSchemaOrg([
  defineWebPage({
    mainEntity: { '@id': schemaId.artist(siteUrl) },
  }),
])

usePageSeo({
  title: `Press Kit | Havre De Grace`,
  description: pageDescription,
})
</script>
