<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-12">
      <header class="space-y-4">
        <p class="label-text muted-text">
          Unlisted / five styles, one window
        </p>
        <h1 class="display-heading">
          Into the Wild — five ways to film it
        </h1>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          The same fifteen seconds of "Into the Wild" in five styles from
          <NuxtLink to="/music-videos/styles" class="underline">the style suite</NuxtLink>
          — four drawn for this song and one, Flipbook, from the set drawn against
          "Andalusia". The window is the end of the third verse into the last chorus:
          the hush of a harbor, the roar of a crowd, and then the title. Quiet, loud,
          release — fifteen seconds that ask a style for three different pictures,
          which is the test a whole film would put it to.
        </p>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          No video files. Every frame is SVG drawn from the song's own clock and cut
          to a measured score, so each clip is synced to the record by construction.
          Starting one stops the others.
        </p>
      </header>

      <section class="space-y-16">
        <MusicVideoClip
          v-for="clip in CLIPS"
          :key="clip.uid"
          :title="clip.title"
          :from="FROM"
          :to="TO"
          :poster-at="clip.posterAt"
          :uid="clip.uid"
          :src="score.src"
        >
          <template #film="{ t, uid }">
            <MusicVideoSvgFilm :film="clip.film" :name="clip.name" :score="score" :t="t" :uid="uid" />
          </template>
          {{ clip.caption }}
          <NuxtLink :to="`/music-videos/styles#${clip.id}`" class="underline">
            The spec
          </NuxtLink>.
        </MusicVideoClip>
      </section>

      <!-- ── The cut ────────────────────────────────────────────────── -->
      <section class="space-y-4">
        <h2 class="section-heading text-[1.35rem]">
          The fifteen seconds
        </h2>
        <p class="max-w-3xl text-sm leading-relaxed muted-text">
          Four lines and twenty-three measured words. Every cut in all five clips
          lands on one of these times.
        </p>
        <ol class="divide-y divide-[color:var(--theme-border)] border-y border-theme">
          <li v-for="line in windowLines" :key="line.index" class="flex items-baseline gap-4 py-2">
            <span class="w-14 shrink-0 font-mono text-xs muted-text">
              {{ stamp(line.start) }}
            </span>
            <span class="min-w-0 flex-1 text-sm">
              {{ line.text }}
            </span>
          </li>
        </ol>
      </section>

      <section class="surface-card space-y-4 p-6">
        <p class="label-text muted-text">
          How it is cut
        </p>
        <ul class="space-y-3 text-sm leading-relaxed muted-text">
          <li v-for="note in NOTES" :key="note" class="flex gap-3">
            <span aria-hidden="true" class="text-[color:var(--color-accent)]">—</span>
            <span>{{ note }}</span>
          </li>
        </ul>
      </section>

      <section class="space-y-3">
        <h2 class="section-heading text-[1.35rem]">
          Elsewhere
        </h2>
        <ul class="space-y-2 text-sm leading-relaxed muted-text">
          <li>
            <NuxtLink to="/music-videos/styles" class="underline">/music-videos/styles</NuxtLink>
            — the style suite, and the written spec each of these is built from.
          </li>
          <li>
            <NuxtLink to="/music-videos/into-the-wild" class="underline">/music-videos/into-the-wild</NuxtLink>
            — the whole song, as the album's woodcut.
          </li>
          <li>
            <NuxtLink to="/music-videos/album" class="underline">/music-videos/album</NuxtLink>
            — the album's art direction, with this woodcut made smooth.
          </li>
          <li>
            <NuxtLink to="/music-videos/andalusia" class="underline">/music-videos/andalusia</NuxtLink>
            — "Andalusia" as a whole film: the Cartography chart, in its album edition.
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/*
 * /music-videos/into-the-wild-styles — five styles over the same fifteen seconds.
 * The chosen one, Relief, runs as the whole film at /music-videos/into-the-wild.
 *
 * Unlisted and noindexed like the rest of /music-videos: it restates a
 * published lyric and exists to be shared by link for a decision.
 *
 * Every clip is the same window of the same record — that is the point of the
 * page, so the only thing that differs between them is the style. Each style is
 * a module in shared/video/films/, run by MusicVideoSvgFilm inside the stage of
 * MusicVideoClip; app/config/intoTheWildScore.ts is the cut.
 */
import { INTO_THE_WILD_SCORE } from '~/config/intoTheWildScore'
import { trailheadFrame } from '~~/shared/video/films/trailhead.mjs'
import { contourFrame } from '~~/shared/video/films/contour.mjs'
import { woodcutFrame } from '~~/shared/video/films/woodcut.mjs'
import { fieldJournalFrame } from '~~/shared/video/films/field-journal.mjs'
import { flipbookFrame } from '~~/shared/video/films/flipbook.mjs'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Into the Wild — five music video styles',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const score = INTO_THE_WILD_SCORE

/*
 * Song seconds, not clip seconds. 175.75 is just after "The hush of a
 * harbor so hollow" is cut in (175.73) — any earlier and the first frames are
 * the previous line's picture; 190.7 is two seconds into the held "running" of
 * the last chorus, which is still ringing — the window ends on motion, not on
 * a card.
 */
const FROM = 175.75
const TO = 190.7

const CLIPS = [
  {
    id: 'c5-trailhead',
    uid: 'itw-trail',
    name: 'Trailhead',
    title: 'Trailhead',
    film: trailheadFrame,
    posterAt: 183.2,
    caption: 'A national-park screenprint poster for every line: the headline is the lyric, and the picture is printed one flat ink per sung word — a harbor at dusk, a crowd drawn as rows of hills, a runner on the ridge at sunrise.',
  },
  {
    id: 'c2-contour',
    uid: 'itw-topo',
    name: 'Contour',
    title: 'Contour',
    film: contourFrame,
    posterAt: 183.3,
    caption: 'The song as a survey sheet, every noun a landform: the harbor is a drowned bay, the crowd a range that rises a step on every word, and the wild a massif the red trail runs up into.',
  },
  {
    id: 'c4-woodcut',
    uid: 'itw-wood',
    name: 'Woodcut',
    title: 'Woodcut',
    film: woodcutFrame,
    posterAt: 186.95,
    caption: 'A two-block relief print: every word takes another cut out of the block, so each line is finished the moment it has been sung. A hushed harbor with almost nothing carved, a crowd gouged ray by ray, then the whole sky floods red for the run into the wild.',
  },
  {
    id: 'c1-field-journal',
    uid: 'itw-journal',
    name: 'Field Journal',
    title: 'Field Journal',
    film: fieldJournalFrame,
    posterAt: 183.25,
    caption: 'A naturalist\'s notebook, open flat: each line is the entry, and what it names is sketched in pencil on the facing page as it is sung — then the page turns to a trail map, and somebody runs it into the wild.',
  },
  {
    id: 'b1-flipbook',
    uid: 'itw-flip',
    name: 'Flipbook',
    title: 'Flipbook',
    film: flipbookFrame,
    posterAt: 186.9,
    caption: 'Somebody drawing the song: a figure on the end of an emptying pier, then on a stage in front of a crowd that changes pose on every word, then running flat out into the pines as the page inverts to pencil. The run steps on the eighth notes.',
  },
]

const windowLines = computed(() =>
  score.lines.filter((line) => line.start >= FROM - 0.5 && line.start < TO),
)

const stamp = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${(seconds % 60).toFixed(2).padStart(5, '0')}`

const NOTES = [
  'The score was measured off the master rather than tapped in: line starts from the centre of the stereo image, where only the voice is mixed; sections placed by cross-correlation; syllables snapped to the sixteenth-note grid of a band that played to a click at 120 BPM. The two verse lines in this window were then read syllable by syllable by eye.',
  'Each style is one pure function of the song\'s clock — no animation state — so a clip can be scrubbed to any frame and lands where it would have played.',
  'The drawings come from one lyric-to-drawing list for the song (shared/video/cues.mjs), so "the hush of a harbor" is a lighthouse in every style that draws one.',
]
</script>
