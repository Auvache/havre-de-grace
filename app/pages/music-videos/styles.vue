<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl">
      <header class="max-w-3xl space-y-4">
        <p class="label-text muted-text">
          Unlisted / art direction
        </p>
        <h1 class="display-heading">
          Seven ways to film a song
        </h1>
        <p class="text-base leading-relaxed muted-text">
          A style suite for full-length lyric videos and music videos, drawn
          against "Andalusia" because that is the one with a measured score. Four
          of these are alternates of the film at
          <NuxtLink to="/music-videos/kinetic" class="underline">/music-videos/kinetic</NuxtLink>
          — the same cut with the slate taken off, a drawing of what the line is
          about held behind the type, and a structural answer to the thing that is
          actually wrong with it, which is that the four hundredth frame looks like
          the fourth. The other three are not that film at all.
        </p>
        <p class="text-base leading-relaxed muted-text">
          Nothing here is animated. Each sheet is one still, deliberately loaded
          with everything the style uses, plus five thumbnails of the same style at
          five points in the arrangement — because a single frame cannot show the
          one property that matters, which is whether a style has anywhere to go.
        </p>
        <p class="text-base leading-relaxed muted-text">
          Nothing on screen names a section, and the band name appears once, in the
          opening title, then leaves. All seven end on the same two cards.
        </p>
      </header>

      <!-- ── The rules every style is built against ──────────────── -->
      <section class="surface-card mt-12 space-y-4 p-6">
        <h2 class="label-text">
          True of all seven
        </h2>
        <ul class="space-y-3">
          <li v-for="rule in SUITE_RULES" :key="rule" class="flex gap-3 text-sm leading-relaxed muted-text">
            <span aria-hidden="true" class="text-[color:var(--color-accent)]">—</span>
            <span>{{ rule }}</span>
          </li>
        </ul>
      </section>

      <!-- ── Contents ─────────────────────────────────────────────── -->
      <nav class="mt-12 border-y border-theme py-6">
        <ol class="grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="style in VIDEO_STYLES" :key="style.id" class="text-sm">
            <a :href="`#${style.id}`" class="flex items-baseline gap-3 hover:text-[color:var(--color-accent)]">
              <span class="label-text w-8 shrink-0 text-[0.55rem] muted-text">{{ style.id.split('-')[0] }}</span>
              <span class="min-w-0 truncate">{{ style.name }}</span>
            </a>
          </li>
        </ol>
      </nav>

      <!-- ── Family A ─────────────────────────────────────────────── -->
      <section class="mt-16">
        <div class="max-w-3xl">
          <h2 class="section-heading">
            Family A — four ways out of the film that exists
          </h2>
          <p class="mt-3 text-base leading-relaxed muted-text">
            Each keeps the bones of the current cut: Jost set large and fitted to
            a measure, a colour running along the line at the speed of the voice,
            every cut landing on a measured word. Each takes the slate off, puts a
            drawing behind the type, and fixes the sameness a different way — by
            moving the type around a grid, by never letting two plates land in the
            same place twice, by making the frame mechanical, by giving almost all
            of it away, or by building a landscape to stand the words in. Ordered
            by how far they move from what is already built.
          </p>
        </div>
        <div class="mt-12 space-y-16">
          <VideoStyleCard v-for="style in STYLES_A" :key="style.id" :spec="style" />
        </div>
      </section>

      <!-- ── Family B ─────────────────────────────────────────────── -->
      <section class="mt-24">
        <div class="max-w-3xl">
          <h2 class="section-heading">
            Family B — three that are not that film
          </h2>
          <p class="mt-3 text-base leading-relaxed muted-text">
            These share the clock, the score and the drawing set with family A and
            nothing else. Flipbook acts the song out with stick figures under a
            still lyric band; Cartography plots it as a passage and sets the words
            along the route; Academy runs it through a tired projector and burns
            the lyric in as subtitles. Read each premise before the sheet — all
            three look like decoration until you know what drives them.
          </p>
        </div>
        <div class="mt-12 space-y-16">
          <VideoStyleCard v-for="style in STYLES_B" :key="style.id" :spec="style" />
        </div>
      </section>

      <!-- ── The shared ending ────────────────────────────────────── -->
      <section class="mt-24">
        <div class="max-w-3xl">
          <h2 class="section-heading">
            The ending, which is not a style decision
          </h2>
          <p class="mt-3 text-base leading-relaxed muted-text">
            Whatever a film has been for two and a half minutes, it ends the same
            way. The splash screen's lockup, centred on pure black, landing on the
            last note of the arrangement and held three seconds — then a hard cut
            to the credits on the same black, one per line, centred every way. No
            dissolve between them; they are two cards, not a transition. None of
            the seven designs its own ending, which is why this is drawn once here
            rather than seven times on the strips above.
          </p>
          <p class="mt-3 text-sm leading-relaxed muted-text">
            It is the splash screen's mark and the splash screen's ink. The ground
            is not: the splash sits on
            <code class="text-[0.9em]">#141414</code>, and at the end of a film
            that has been paper or amber or ink for the whole run, nearly-black
            reads as a mistake where
            <code class="text-[0.9em]">#000000</code> reads as an ending.
          </p>
        </div>
        <div class="mt-8">
          <VideoStyleSheet src="/video-styles/end-card.svg" ratio="1600 / 760" />
        </div>
      </section>

      <!-- ── How to use this ──────────────────────────────────────── -->
      <section class="surface-card mt-24 space-y-4 p-6">
        <h2 class="label-text">
          Building one
        </h2>
        <ul class="space-y-3">
          <li v-for="note in BUILD_NOTES" :key="note" class="flex gap-3 text-sm leading-relaxed muted-text">
            <span aria-hidden="true" class="text-[color:var(--color-accent)]">—</span>
            <span>{{ note }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/*
 * /music-videos/styles — the style suite, as reference sheets plus the spec each
 * one would be built from.
 *
 * Unlisted and noindexed for the same reason /music-videos/kinetic is: it restates
 * a published lyric across seven sheets and exists to be shared by link for a
 * decision.
 */
import { VIDEO_STYLES, STYLES_A, STYLES_B, SUITE_RULES } from '~/config/videoStyles'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Music video style suite',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const BUILD_NOTES = [
  'The sheets are generated. tools/video-styles/ holds a module per style; `node tools/video-styles/build.mjs` rewrites public/video-styles/*.svg. A change to a look belongs in the module, never in the .svg.',
  'app/config/videoStyles.ts is the written spec — premise, palette, type, layout, what every moving thing is driven by, what each of the ten sections does, and what would ruin it. SUITE_RULES holds what is true of all seven and END_CARD holds the shared ending, down to the hex values. It is the file to hand an agent, not this page.',
  'The drawings come from tools/video-styles/motifs.mjs, and MOTIF_CUES in the config maps lyric to drawing once for the whole suite: "underneath a churchyard" is a church in every style that draws, because that is a reading of the song rather than a look.',
  'app/config/andalusiaScore.ts is the cut and is unchanged. Every style is timed off the same 31 lines and 297 measured word onsets, so a style can be swapped under a finished film without retiming anything.',
  'The existing MusicVideoFilm component is the reference implementation of the pattern all seven use: one pure function of the song\'s clock in, one frame of SVG out, no animation state anywhere. That is what makes the film seekable, and it is also what makes frames capturable off it for an mp4.',
  'Cartography is built, and it is built the way the rest should be. shared/video/films/cartography.mjs is one pure function — `cartographyFrame({ time, score })` — and three different things call it: this page\'s reference sheet at build time, the clips at /music-videos/andalusia sixty times a second, and `node`, which can walk the clock and write out frames for an mp4 because the module is plain JS and takes the score as an argument rather than importing it. The chart furniture on the sheet above is drawn by that same file, so the still and the film cannot disagree about what a sounding looks like.',
  'Write the style module before the page that shows it, not after. Everything above that was expensive to get right — the two-row banking, the leg rules, the label sides — was found by rendering a grid of frames as one contact sheet and looking at eight moments at once. A style is not judged a frame at a time.',
]
</script>
