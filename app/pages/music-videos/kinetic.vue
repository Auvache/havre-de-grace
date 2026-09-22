<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-12">
      <header class="space-y-4">
        <p class="label-text muted-text">
          Unlisted / proof of concept
        </p>
        <h1 class="display-heading">
          Andalusia — the whole song
        </h1>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          Two minutes fifty-three of kinetic typography, cut to the record. No
          video file anywhere: every frame is SVG drawn from the song's own
          clock, so the words land where they are sung and the whole thing
          weighs about what its markup weighs.
        </p>
      </header>

      <!-- The film. -->
      <section class="space-y-5">
        <div
          ref="stage"
          class="relative isolate overflow-hidden rounded-[var(--radius-md)] border border-theme bg-black"
          :style="{ aspectRatio: '16 / 9' }"
        >
          <MusicVideoFilm
            :t="frameTime"
            :level="player.level.value"
            :bass="player.bass.value"
            :treble="player.treble.value"
            :progress="player.progress.value"
          />

          <!-- The whole frame is the play button until it is playing. -->
          <button
            v-if="!player.playing.value"
            type="button"
            class="absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-black/10 transition-colors duration-200 hover:bg-black/0"
            aria-label="Play the film"
            @click="player.toggle()"
          >
            <span class="flex items-center gap-3 rounded-full bg-black/55 px-6 py-3 text-white backdrop-blur-sm">
              <svg aria-hidden="true" viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span class="label-text text-[0.62rem]">
                {{ player.time.value > 0.5 ? 'Resume' : 'Play 2:53' }}
              </span>
            </span>
          </button>
        </div>

        <MusicVideoTransport
          :time="player.time.value"
          :duration="score.duration"
          :progress="player.progress.value"
          :playing="player.playing.value"
          :muted="player.muted.value"
          :sections="score.sections"
          :current="currentSection"
          @toggle="player.toggle()"
          @seek="player.seek"
          @update:muted="player.muted.value = $event"
          @fullscreen="toggleFullscreen"
        />

        <p class="text-sm leading-relaxed muted-text">
          Space plays and pauses, the arrow keys jump five seconds (hold shift
          for fifteen), <kbd>M</kbd> mutes and <kbd>F</kbd> fills the screen. The
          section buttons jump straight into a part of the arrangement — the
          quiet fourth verse at 2:06 and the oh-ohs at 1:50 are the two worth
          looking at first.
        </p>
      </section>

      <!-- Sync trim. -->
      <section class="surface-card space-y-4 p-6">
        <div class="flex flex-wrap items-center gap-x-8 gap-y-4">
          <label class="flex flex-1 items-center gap-3 text-sm">
            <span class="label-text muted-text whitespace-nowrap text-[0.6rem]">
              Sync nudge
            </span>
            <input
              v-model.number="player.offsetMs.value"
              type="range"
              min="-400"
              max="400"
              step="10"
              class="min-w-[10rem] flex-1 accent-[color:var(--color-accent)]"
            >
            <span class="w-16 font-mono text-xs muted-text">
              {{ player.offsetMs.value > 0 ? '+' : '' }}{{ player.offsetMs.value }}ms
            </span>
            <button
              type="button"
              class="label-text cursor-pointer text-[0.6rem] text-[color:var(--color-accent)]"
              @click="player.offsetMs.value = 0"
            >
              Reset
            </button>
          </label>

          <p
            class="label-text text-[0.6rem]"
            :class="player.reactive.value ? 'text-[color:var(--color-accent)]' : 'muted-text'"
          >
            {{ player.reactive.value ? 'Analyser live' : 'Analyser idle' }}
          </p>
        </div>
        <p class="text-sm leading-relaxed muted-text">
          The nudge slides the picture against the sound. It is here because the
          last fifty milliseconds of agreement between a word and its type is a
          judgement made by ear — if a section reads consistently early or late,
          find the number here and it gets folded into the score. Twenty
          milliseconds have been folded in already, so zero is the current
          answer rather than an untouched default.
        </p>
      </section>

      <!-- The cut list. -->
      <section class="space-y-4">
        <h2 class="section-heading text-[1.35rem]">
          The cut
        </h2>
        <p class="max-w-3xl text-sm leading-relaxed muted-text">
          Thirty-one lines, two hundred and ninety-seven words, each with a
          measured onset. Click a line to jump to it.
        </p>
        <ol class="divide-y divide-[color:var(--theme-border)] border-y border-theme">
          <li v-for="line in score.lines" :key="line.index">
            <button
              type="button"
              class="flex w-full cursor-pointer items-baseline gap-4 py-2 text-left transition-colors duration-150 hover:text-[color:var(--color-accent)]"
              :class="line.index === currentLine?.index ? 'text-[color:var(--color-accent)]' : ''"
              @click="player.seek(line.start - 0.35)"
            >
              <span class="w-14 shrink-0 font-mono text-xs muted-text">
                {{ stamp(line.start) }}
              </span>
              <span class="label-text w-24 shrink-0 text-[0.55rem] muted-text">
                {{ sectionLabel(line.section) }}
              </span>
              <span class="min-w-0 flex-1 text-sm">
                {{ line.text }}
              </span>
            </button>
          </li>
        </ol>
      </section>

      <section class="surface-card space-y-4 p-6">
        <p class="label-text muted-text">
          How it is made, and what is still rough
        </p>
        <ul class="space-y-3 text-sm leading-relaxed muted-text">
          <li v-for="note in NOTES" :key="note" class="flex gap-3">
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
 * /music-videos/kinetic — "Andalusia" as a kinetic-typography film, end to end.
 *
 * Unlisted and noindexed, like the /music/itw-* mockups and for the same
 * reason: it restates a published song's entire lyric and exists to be shared
 * by link for a decision, not to be arrived at.
 *
 * The page owns the projector and the furniture. MusicVideoFilm is the film,
 * and app/config/andalusiaScore.ts is the cut.
 */
import { ANDALUSIA_SCORE, lineAt, sectionAt } from '~/config/andalusiaScore'
import { useMusicVideoPlayer } from '~/composables/useMusicVideoPlayer'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Andalusia — SVG music video',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const score = ANDALUSIA_SCORE
const player = useMusicVideoPlayer()
const stage = useTemplateRef<HTMLElement>('stage')

/*
 * The poster frame. The film opens on black — the song does, for a second and
 * a bit — so before anyone presses play the frame is held at the title card
 * instead, where the type is. A video that looks like a blank rectangle until
 * you play it does not get played.
 */
const POSTER_AT = 6.4

const frameTime = computed(() =>
  !player.playing.value && player.time.value < 0.05 ? POSTER_AT : player.time.value,
)

const currentSection = computed(() => sectionAt(player.time.value))
const currentLine = computed(() => lineAt(player.time.value))

const stamp = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${(seconds % 60).toFixed(1).padStart(4, '0')}`

const sectionLabel = (id: string): string =>
  score.sections.find((section) => section.id === id)?.label ?? ''

const toggleFullscreen = () => {
  const element = stage.value
  if (!element) return
  if (document.fullscreenElement) void document.exitFullscreen()
  else void element.requestFullscreen?.()
}

/*
 * Keyboard on the window rather than on the frame: the thing being reviewed is
 * the film, and having to click it before space does anything is the kind of
 * small friction that stops someone watching it a second time.
 */
const onKeydown = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement | null
  if (target && /^(?:INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
  const step = event.shiftKey ? 15 : 5
  switch (event.key) {
    case ' ':
      player.toggle()
      break
    case 'ArrowRight':
      player.seek(player.time.value + step)
      break
    case 'ArrowLeft':
      player.seek(player.time.value - step)
      break
    case 'm':
    case 'M':
      player.muted.value = !player.muted.value
      break
    case 'f':
    case 'F':
      toggleFullscreen()
      break
    default:
      return
  }
  event.preventDefault()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

const NOTES = [
  'The score is measured, not tapped in. The mp3 was decoded to PCM and an STFT taken at 10 ms; vocal presence — the share of the spectrum sitting in 1.2–2.6 kHz — cuts the song into sung phrases, which is what fixes every line start, and vocal-band spectral flux places the syllables inside each line by shortest path. Line starts are good to about a frame at 30fps; an unstressed word inside a line can sit 100 ms off.',
  'The middle of the record was re-cut. The first pass invented a five-and-a-half second instrumental between the first chorus and verse 3 — there is none, the chorus turns straight into the verse — and every line from there to the end of the oh-ohs was consequently assigned to the phrase belonging to the line after it. Verse 3 and the second chorus are now placed by correlating them against verse 1 and chorus 1, which share their melodies: verse 3 matches at 0.86 and reproduces verse 1’s internal line spacing to within 0.05 s, and chorus 2 matches at 0.92–0.93, the strongest agreement anywhere in the song.',
  'The least certain numbers in the file are the second group of oh-ohs, at 1:54. The band is loud under them, so they were taken off the envelope of the vocal band rather than off a clean onset, and their spacing is uneven enough that it may be the measurement rather than the singing. The first group, ten of them on an even third of a second, is solid.',
  'No line is laid out by hand. Each breaks at its own commas, wraps to a character budget, and every row is stretched to the column with textLength — so the type is a grid rather than a guess about how wide a word will be, and a retimed word costs no layout work.',
  'Ten sections, ten looks: two verses that invert each other, three choruses that cut between red and ink on every line, the place-name verse set like a departure board, a fourth verse that drops to small light type because the arrangement drops away, and the oh-ohs counted out as seventeen lit cells.',
  'One thing is live, off an AnalyserNode: the difference-blended circle that inverts the type it crosses. The whole frame used to invert on every measured word as well, which at a word every third of a second read as a flicker running the length of the film rather than as a hit; it now fires once per section, and the word is marked by the accent colour running along the line instead.',
  'The end card is the stacked lockup from the splash screen, inlined from public/logos/suite so it takes the film’s foreground colour rather than the ink baked into the file. It arrives at 2:46, alone, a beat before the type underneath it.',
  'What it is not yet: a deliverable. If this is the direction, the open questions are whether it ships as a page here or as an mp4 for YouTube — frames can be captured off these same components — and whether the final chorus should build further than it does, since it currently plays like the first two at a bigger type size.',
]
</script>
