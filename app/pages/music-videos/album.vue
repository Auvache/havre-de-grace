<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-16">
      <header class="max-w-3xl space-y-4">
        <p class="label-text muted-text">
          Unlisted / art direction for the album
        </p>
        <h1 class="display-heading">
          Into the Wild — ten films, one record
        </h1>
        <p class="text-base leading-relaxed muted-text">
          A film for every song on the album, each one its own, all ten plainly
          from the same record. The way they hang together is printmaking. Every
          film is an impression pulled by a different technique on the same
          sheet of paper, with the same black and the same red. The way they move
          is Andalusia's: one continuous world, a camera that never stops, and no
          hard cuts.
        </p>
        <p class="text-base leading-relaxed muted-text">
          Below: what never changes, then two films running — the Into the Wild
          woodcut made smooth, and Andalusia's chart on the album's paper, the
          first of the ten to be finished — and then one still per song. The written rules are
          <code class="text-[0.9em]">app/config/albumStyle.ts</code>.
        </p>
      </header>

      <!-- ── The constants ─────────────────────────────────────────── -->
      <section class="grid gap-6 lg:grid-cols-2">
        <div class="surface-card space-y-4 p-6">
          <h2 class="label-text">
            The same in all ten
          </h2>
          <ul class="flex gap-3">
            <li v-for="swatch in INKS" :key="swatch.hex" class="flex items-center gap-2 text-xs muted-text">
              <span class="h-6 w-6 rounded-sm border border-theme" :style="{ backgroundColor: swatch.hex }" />
              {{ swatch.name }}
            </li>
          </ul>
          <ul class="space-y-3">
            <li v-for="rule in ALBUM_CONSTANTS" :key="rule" class="flex gap-3 text-sm leading-relaxed muted-text">
              <span aria-hidden="true" class="text-[color:var(--color-accent)]">—</span>
              <span>{{ rule }}</span>
            </li>
          </ul>
        </div>
        <div class="surface-card space-y-4 p-6">
          <h2 class="label-text">
            How every film moves
          </h2>
          <ul class="space-y-3">
            <li v-for="rule in ALBUM_MOTION" :key="rule" class="flex gap-3 text-sm leading-relaxed muted-text">
              <span aria-hidden="true" class="text-[color:var(--color-accent)]">—</span>
              <span>{{ rule }}</span>
            </li>
          </ul>
        </div>
      </section>

      <section class="surface-card space-y-4 p-6">
        <h2 class="label-text">
          Found by drawing the ten
        </h2>
        <ul class="space-y-3">
          <li v-for="note in ALBUM_NOTES" :key="note" class="flex gap-3 text-sm leading-relaxed muted-text">
            <span aria-hidden="true" class="text-[color:var(--color-accent)]">—</span>
            <span>{{ note }}</span>
          </li>
        </ul>
      </section>

      <!-- ── Motion tests ──────────────────────────────────────────── -->
      <section class="space-y-8">
        <div class="max-w-3xl">
          <h2 class="section-heading">
            Two films running
          </h2>
          <p class="mt-3 text-base leading-relaxed muted-text">
            A still cannot show the one thing this pass is about, so two of the
            ten are running. The first is a window of the Into the Wild woodcut,
            which runs end to end at
            <NuxtLink to="/music-videos/into-the-wild" class="underline">/music-videos/into-the-wild</NuxtLink>
            — compare it with the stepped woodcut at
            <NuxtLink to="/music-videos/into-the-wild-styles" class="underline">/music-videos/into-the-wild-styles</NuxtLink>.
            The second is finished: a window of the whole film, which runs end
            to end at
            <NuxtLink to="/music-videos/andalusia" class="underline">/music-videos/andalusia</NuxtLink>.
          </p>
        </div>
        <MusicVideoClip
          v-for="clip in CLIPS"
          :key="clip.uid"
          :title="clip.title"
          :from="clip.from"
          :to="clip.to"
          :poster-at="clip.posterAt"
          :uid="clip.uid"
          :src="clip.score.src"
        >
          <template #film="{ t, uid }">
            <MusicVideoSvgFilm :film="clip.film" :name="clip.name" :score="clip.score" :t="t" :uid="uid" />
          </template>
          {{ clip.caption }}
        </MusicVideoClip>
      </section>

      <!-- ── Ten songs ─────────────────────────────────────────────── -->
      <section class="space-y-8">
        <div class="max-w-3xl">
          <h2 class="section-heading">
            Ten songs, ten techniques
          </h2>
          <p class="mt-3 text-base leading-relaxed muted-text">
            One still per song, in track order: the song's technique in the
            plate, its hero line in the margin. Each has one second ink of its
            own, and in each the only red is the thing that travels.
          </p>
        </div>

        <figure class="space-y-3">
          <VideoStyleSheet src="/video-styles/album-sheet.svg" ratio="1600 / 2560" />
          <figcaption class="text-[0.8rem] muted-text">
            All ten on one sheet — the test is whether any of them sticks out.
            <a href="/video-styles/album-sheet.svg" class="underline" target="_blank" rel="noopener">Open the file</a>.
          </figcaption>
        </figure>

        <article v-for="song in ALBUM_SONGS" :id="song.slug" :key="song.slug" class="scroll-mt-24 space-y-5 border-t border-theme pt-10">
          <header class="flex flex-wrap items-baseline gap-x-5 gap-y-2">
            <span class="font-mono text-xs muted-text">{{ String(song.track).padStart(2, '0') }}</span>
            <h3 class="section-heading text-[1.5rem]">
              {{ song.title }}
            </h3>
            <span class="label-text text-[0.58rem] text-[color:var(--color-accent)]">{{ song.technique }}</span>
            <span class="label-text text-[0.55rem] muted-text">{{ song.status }}</span>
            <NuxtLink v-if="song.page" :to="song.page" class="label-text text-[0.55rem] underline">
              Watch the whole film
            </NuxtLink>
          </header>
          <VideoStyleSheet :src="song.still" ratio="16 / 9" />
          <div class="grid gap-6 md:grid-cols-[2fr_1fr]">
            <div class="space-y-3 text-sm leading-relaxed muted-text">
              <p>{{ song.premise }}</p>
              <p><span class="label-text text-[0.55rem] text-[color:var(--color-accent)]">How it moves</span> {{ song.moves }}</p>
            </div>
            <dl class="space-y-3 text-sm">
              <div class="flex items-center gap-3">
                <span class="h-6 w-6 shrink-0 rounded-sm border border-theme" :style="{ backgroundColor: song.second }" />
                <span class="muted-text">Second ink <code class="text-[0.85em]">{{ song.second }}</code></span>
              </div>
              <div class="flex gap-3">
                <span class="h-6 w-6 shrink-0 rounded-sm border border-theme" :style="{ backgroundColor: RED }" />
                <span class="muted-text">{{ song.journey }}</span>
              </div>
            </dl>
          </div>
        </article>
      </section>

      <!-- ── The title card ────────────────────────────────────────── -->
      <section class="space-y-4">
        <h2 class="section-heading text-[1.35rem]">
          The title card, the same on all ten
        </h2>
        <p class="max-w-3xl text-sm leading-relaxed muted-text">
          Signed the way a print is: the edition number at the left — the track
          number, the one number any film shows — the title in the middle, and
          the band at the right in red. Andalusia's is 5/10.
        </p>
        <VideoStyleSheet src="/video-styles/album/into-the-wild-title-card.svg" ratio="16 / 9" />
      </section>

      <section class="space-y-3">
        <h2 class="section-heading text-[1.35rem]">
          Elsewhere
        </h2>
        <ul class="space-y-2 text-sm leading-relaxed muted-text">
          <li>
            <NuxtLink to="/music-videos/styles" class="underline">/music-videos/styles</NuxtLink>
            — the twelve-style suite this was chosen from.
          </li>
          <li>
            <NuxtLink to="/music-videos/into-the-wild" class="underline">/music-videos/into-the-wild</NuxtLink>
            — the title track as a whole film, in this woodcut.
          </li>
          <li>
            <NuxtLink to="/music-videos/into-the-wild-styles" class="underline">/music-videos/into-the-wild-styles</NuxtLink>
            — the five-style test for the title track, stepped woodcut included.
          </li>
          <li>
            <NuxtLink to="/music-videos/andalusia" class="underline">/music-videos/andalusia</NuxtLink>
            — the whole Andalusia film, in its album edition.
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/*
 * /music-videos/album — the album's art direction: the constants, two motion
 * tests and a still per song.
 *
 * Unlisted and noindexed like everything under /music-videos. The rules are
 * app/config/albumStyle.ts; the stills are generated by
 * tools/video-styles/album.mjs from tools/video-styles/album/<slug>.mjs.
 */
import { ALBUM_CONSTANTS, ALBUM_MOTION, ALBUM_NOTES, ALBUM_SONGS, PAPER, INK, RED } from '~/config/albumStyle'
import { INTO_THE_WILD_SCORE } from '~/config/intoTheWildScore'
import { ANDALUSIA_SCORE } from '~/config/andalusiaScore'
import { reliefFrame } from '~~/shared/video/films/relief.mjs'
import { cartographyAlbumFrame } from '~~/shared/video/films/cartography.mjs'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Into the Wild — the album films',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const INKS = [
  { name: 'Paper', hex: PAPER },
  { name: 'Ink', hex: INK },
  { name: 'Red', hex: RED },
]

/* Song seconds, not clip seconds — each clip is handed its song's own clock. */
const CLIPS = [
  {
    uid: 'album-relief',
    name: 'Relief',
    title: 'Into the Wild — woodcut, smooth',
    film: reliefFrame,
    score: INTO_THE_WILD_SCORE,
    // 175.85: the previous line has cleared the margin and "The hush" is fading up.
    from: 175.85,
    to: 190.7,
    posterAt: 186.7,
    caption: 'The woodcut again, carved the same way but moving like the chart: one long print the camera travels along, from a hushed harbor to a stage to the mountains. The singer runs off the stage on "running" and leaps into the wild as the sky floods red.',
  },
  {
    uid: 'album-carto',
    name: 'Cartography',
    title: 'Andalusia — the chart, album edition',
    film: cartographyAlbumFrame,
    score: ANDALUSIA_SCORE,
    from: 72.8,
    to: 87.8,
    posterAt: 79.8,
    caption: 'Andalusia\'s chart on the album\'s sheet: the same globe, route and camera, re-inked in the album\'s paper, black and red, with the lyric moved into the margin under the plate, where a printmaker pencils a title. Nothing about the motion changed. The whole film is at /music-videos/andalusia.',
  },
]
</script>
