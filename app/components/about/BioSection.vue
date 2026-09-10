<template>
  <section>
    <ScrollReveal
      as="div"
      class-name="mx-auto max-w-3xl"
      variant="section-up"
      :duration-ms="900"
      :distance-px="72"
      :blur-px="0"
      :threshold="0.16"
      root-margin="0px 0px -6% 0px"
    >
      <NuxtImg
        src="/images/bio-update.png"
        alt="Havre De Grace, the acoustic folk project of Stefan Auvache Bradley"
        class="w-full rounded-[var(--radius-lg)] object-cover shadow-[0_30px_64px_color-mix(in_srgb,var(--theme-text)_14%,transparent)]"
        width="2000"
        height="2000"
        sizes="(max-width: 768px) 100vw, 768px"
        format="webp,avif"
        loading="eager"
        fetchpriority="high"
      />
    </ScrollReveal>

    <ScrollReveal
      as="div"
      class-name="mx-auto mt-10 max-w-3xl space-y-6"
      variant="section-up"
      :delay-ms="110"
      :duration-ms="860"
      :distance-px="52"
      :threshold="0.16"
      root-margin="0px 0px -6% 0px"
    >
      <SectionHeading
        title="about"
        eyebrow="bio"
        heading-tag="h1"
      />

      <!--
        Prose lives in shared/data/bio.ts so that /about.md (see
        modules/agent-discovery.ts) renders the same words this section does.
      -->
      <p
        v-for="(paragraph, index) in bioParagraphs"
        :key="index"
        class="muted-text"
        :class="{ italic: paragraph.emphasis }"
      >
        {{ paragraph.text }}
      </p>
    </ScrollReveal>

    <div class="mx-auto mt-6 grid max-w-3xl gap-4 sm:grid-cols-2">
      <ScrollReveal
        as="div"
        variant="section-left"
        :delay-ms="90"
        :distance-px="72"
        :blur-px="0"
        root-margin="0px 0px -8% 0px"
      >
        <NuxtImg
          src="/images/profile.jpg"
          sizes="(max-width: 640px) 100vw, 384px"
          format="webp,avif"
          alt="Stefan Auvache Bradley, who performs as Havre De Grace"
          class="h-full w-full rounded-[var(--radius-sm)] object-cover"
          width="2056"
          height="2083"
          loading="lazy"
        />
      </ScrollReveal>
      <ScrollReveal
        as="div"
        variant="section-right"
        :delay-ms="190"
        :distance-px="72"
        :blur-px="0"
        :threshold="0.12"
        root-margin="0px 0px -8% 0px"
      >
        <NuxtImg
          src="/images/bio-pic.jpg"
          sizes="(max-width: 640px) 100vw, 384px"
          format="webp,avif"
          alt="Havre De Grace performing live"
          class="h-full w-full rounded-[var(--radius-sm)] object-cover"
          width="1000"
          height="1000"
          loading="lazy"
        />
      </ScrollReveal>
    </div>

    <ScrollReveal
      as="div"
      class-name="mx-auto mt-10 max-w-3xl"
      variant="section-up"
      :delay-ms="120"
      :distance-px="52"
      :blur-px="5"
      :threshold="0.14"
      root-margin="0px 0px -8% 0px"
    >
      <div class="aspect-video w-full overflow-hidden rounded-[var(--radius-md)]">
        <iframe
          src="https://www.youtube-nocookie.com/embed/0JF4Pm_-mPs"
          title="Havre De Grace - Live Performance"
          class="h-full w-full"
          loading="lazy"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
      </div>
    </ScrollReveal>
  </section>
</template>

<script setup lang="ts">
import type { Album } from '~~/shared/types'
import { bioParagraphs } from '~~/shared/data/bio'

const props = defineProps<{
  latestAlbum: Album | null
}>()

const siteProfile = useSiteProfile()
</script>
