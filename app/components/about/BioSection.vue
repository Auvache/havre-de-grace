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
      <img
        src="/images/bio-update.png"
        alt="Havre De Grace atmospheric portrait"
        class="w-full rounded-[var(--radius-lg)] object-cover shadow-[0_30px_64px_color-mix(in_srgb,var(--theme-text)_14%,transparent)]"
        width="3024"
        height="1752"
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

	    <p class="muted-text">
		    Havre De Grace is the musical alias of singer-songwriter Stefan Auvache Bradley.
	    </p>

      <p class="italic muted-text">
	      "I love music and music loves me. I can't help but play the guitar and write songs."
      </p>

      <p class="muted-text">
        Growing up, his parents shared an eclectic mix of music with him, ranging from Led Zeppelin, REO Speedwagon,
        and Heart to Michael Jackson and Donny Osmond. As he grew up, he fell in love with the music of Bob Dylan, Jack
        White, John Mayer, and Kristian Matsson's The Tallest Man on Earth. These influences have shaped him as a guitar player and a songwriter.
      </p>

      <p class="muted-text">
        Most of Stefan's songs are lyrically ninety percent finished within five minutes. They're about infatuation, fatherhood, loss, navigating complex social situations, and balancing passion with practicality.
      </p>

	    <p class="muted-text">
		    Stefan's first album, I Want to Be Yours and Other Songs, was originally released under the moniker Stefan Auvache in July 2025. His followup album, Into the Wild, is scheduled for release on July 17, 2026.
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
        <img
          src="/images/profile.jpg"
          alt="Havre De Grace profile portrait"
          class="h-full w-full rounded-[var(--radius-sm)] object-cover"
          width="1200"
          height="800"
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
        <img
          src="/images/bio-pic.jpg"
          alt="Havre De Grace bio portrait"
          class="h-full w-full rounded-[var(--radius-sm)] object-cover"
          width="1200"
          height="800"
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
          src="https://www.youtube.com/embed/0JF4Pm_-mPs?si=u7ip8ecrCrAivo3A"
          title="Havre De Grace - Live Performance"
          class="h-full w-full"
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

const props = defineProps<{
  latestAlbum: Album | null
}>()

const siteProfile = useSiteProfile()
</script>
