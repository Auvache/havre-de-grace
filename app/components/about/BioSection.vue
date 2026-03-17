<template>
  <section>
    <NuxtImg
      src="/press/media-pic-wide.jpg"
      alt="Havre De Grace atmospheric portrait"
      class="w-full rounded-[var(--radius-lg)] object-cover"
      width="3024"
      height="1752"
      sizes="100vw"
      format="webp,avif"
      loading="eager"
      fetchpriority="high"
    />

    <div class="mx-auto mt-10 max-w-3xl space-y-6">
      <SectionHeading
        title="about"
        eyebrow="bio"
        heading-tag="h1"
      />

      <p class="italic muted-text">
	      "I love music and music loves me. I can't help but play the guitar and write songs. It is my favorite thing to
	      do in the world. Havre De Grace is the vehicle I use to share what I love with anyone willing to listen."
      </p>

      <p class="muted-text">
        Havre De Grace is the musical alias of singer-songwriter Stefan Auvache Bradley. The name comes from a freeway
        exit sign he spotted on a road trip. It grabbed him, and years later when choosing a name for his project, it
        still hadn't let go.
      </p>

      <p class="muted-text">
        This is the perfect analogy for how Stefan writes music. It isn't about composition or correctness or putting in
        the hours. He never even set out to be a musician. He just loves playing the guitar and writing songs. And he
        runs with whatever feels good.
      </p>

      <p class="muted-text">
        Growing up, his parents shared an eclectic mix of music with him, ranging from Led Zeppelin, REO Speedwagon,
        and Heart to Michael Jackson and Donny Osmond. Along the way, he fell in love with the music of Bob Dylan, Jack
        White, John Mayer, and Kristian Matsson's The Tallest Man on Earth. His chosen medium is stripped down to what
        matters: one guitar, his voice, and whatever song won't leave him alone.
      </p>

      <p class="muted-text">
        Stefan doesn't write songs with much intention. A feeling hits, a line appears, and if it's good, he writes it
        down. Most of his songs are lyrically ninety percent finished within five minutes. They're about falling in
        love, being a father, working through loss, navigating complex social situations, and balancing a love for music
        with his other passions. Playing music is a therapeutic necessity and playful obsession in equal measure.
      </p>

      <p class="muted-text">
        {{ releaseLine }}
      </p>

      <p class="muted-text">
        You don't have to listen to it... But you could.
      </p>

      <NuxtImg
        src="/press/media-pic-square.jpg"
        alt="Havre De Grace portrait"
        class="w-full rounded-[var(--radius-md)] object-cover"
        width="2056"
        height="2083"
        sizes="(max-width: 1024px) 100vw, 768px"
        format="webp,avif"
        loading="lazy"
      />

      <div class="grid gap-4 sm:grid-cols-2">
        <NuxtImg
          src="/images/albums/i-want-to-be-yours-and-other-songs/liner-note-portrait-wide.jpg"
          alt="Placeholder about image - wide portrait"
          class="h-full w-full rounded-[var(--radius-sm)] object-cover"
          width="1200"
          height="800"
          sizes="(max-width: 640px) 100vw, 50vw"
          format="webp,avif"
          loading="lazy"
        />
        <NuxtImg
          src="/images/albums/i-want-to-be-yours-and-other-songs/liner-note-evergreens.jpg"
          alt="Placeholder about image - atmospheric trees"
          class="h-full w-full rounded-[var(--radius-sm)] object-cover"
          width="1200"
          height="800"
          sizes="(max-width: 640px) 100vw, 50vw"
          format="webp,avif"
          loading="lazy"
        />
      </div>

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
    </div>
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
    return 'His debut album was released in 2025. He doesn\'t worry much about production — you don\'t need a whole lot more than one guitar and a voice. He makes music and performs when he feels like it.'
  }

  if (!props.latestAlbum.releaseDate) {
    return `His debut album, ${props.latestAlbum.title}, was released in ${props.latestAlbum.year}. He doesn't worry much about production — you don't need a whole lot more than one guitar and a voice. He makes music and performs when he feels like it.`
  }

  const date = new Date(props.latestAlbum.releaseDate)
  if (Number.isNaN(date.getTime())) {
    return `His debut album, ${props.latestAlbum.title}, was released in ${props.latestAlbum.releaseDate}. He doesn't worry much about production — you don't need a whole lot more than one guitar and a voice. He makes music and performs when he feels like it.`
  }

  return `His debut album, ${props.latestAlbum.title}, was released in ${date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })}. He doesn't worry much about production — you don't need a whole lot more than one guitar and a voice. He makes music and performs when he feels like it.`
})
</script>
