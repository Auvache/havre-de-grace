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
	      "I love music and music loves me. I can't help but play the guitar and write songs. Havre De Grace is the vehicle I use to share what I love with anyone who wants to listen."
      </p>

      <p class="muted-text">
        For Stefan, music isn't about composition, correctness, marketing, or building a fanbase. He never set out to be a musician or a performer. He just loves playing the guitar and writing songs, and he runs with whatever feels best in the moment.
      </p>

      <p class="muted-text">
        Growing up, his parents shared an eclectic mix of music with him, ranging from Led Zeppelin, REO Speedwagon,
        and Heart to Michael Jackson and Donny Osmond. As he grew up, he fell in love with the music of Bob Dylan, Jack
        White, John Mayer, and Kristian Matsson's The Tallest Man on Earth. These influences have shaped him as a guitar player and a songwriter.
      </p>

      <p class="muted-text">
        Most of Stefan's songs are lyrically ninety percent finished within five minutes. They're about infatuation, being a father, working through loss, navigating complex social situations, and balancing passion with practicality. Playing music is a therapeutic necessity and playful obsession in equal measure.
      </p>

      <p class="muted-text">
        {{ releaseLine }}
      </p>

	    <p class="muted-text">
		    The next Havre De Grace next album, Into the Wild, is scheduled for release in summer 2026.
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
          src="https://www.youtube.com/embed/3ro2I9rvQj8?si=w533QpFQK6WmQVjb"
          title="Havre De Grace - Live Performance"
          class="h-full w-full"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
      </div>
    </ScrollReveal>

    <ScrollReveal
      as="div"
      class-name="mx-auto mt-8 max-w-3xl"
      variant="section-up"
      :delay-ms="120"
      :distance-px="48"
      :threshold="0.18"
      root-margin="0px 0px -6% 0px"
    >
      <div class="grid gap-6 border-t border-theme pt-8 sm:grid-cols-3">
        <article>
          <p class="label-text muted-text">based in</p>
          <p class="mt-2">{{ siteProfile.location }}</p>
        </article>

        <article>
          <p class="label-text muted-text">genres</p>
          <p class="mt-2">{{ genreLine }}</p>
        </article>

        <article>
          <p class="label-text muted-text">artist</p>
          <p class="mt-2">{{ siteProfile.artistName }}</p>
        </article>
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

const genreLine = computed(() => siteProfile.genres.join(' | '))

const releaseLine = computed(() => {
  if (!props.latestAlbum) {
    return 'His debut album was released in 2025. It is a collection of singles that highlight various snapshots of his life.'
  }

  if (!props.latestAlbum.releaseDate) {
    return `His debut album, ${props.latestAlbum.title}, was released in ${props.latestAlbum.year}. It is a stripped down collection of singles that highlight various snapshots of his life.`
  }

  const date = new Date(props.latestAlbum.releaseDate)
  if (Number.isNaN(date.getTime())) {
    return `His debut album, ${props.latestAlbum.title}, was released in ${props.latestAlbum.releaseDate}. It is a stripped down collection of singles that highlight various snapshots of his life.`
  }

  return `His debut album, ${props.latestAlbum.title}, was released in ${date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })}. It is a stripped down collection of singles that highlight various snapshots of his life.`
})
</script>
