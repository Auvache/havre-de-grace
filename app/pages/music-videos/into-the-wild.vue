<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-12">
      <header class="space-y-4">
        <p class="label-text muted-text">
          Unlisted / for review
        </p>
        <h1 class="display-heading">
          Into the Wild — the woodcut
        </h1>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          Three minutes twenty-five of "Into the Wild" as one long carved
          panorama, track one of ten in the
          <NuxtLink to="/music-videos/album" class="underline">album's</NuxtLink>
          printmaking: paper, black, one slate and one red. The camera travels
          left to right the whole song and never stops: an empty sea, the Earth
          carved up out of it, a moor of sleeping stones, a forest, a town, a
          mountain pass, a harbour, a stage, and the range. The red is the
          journey: the sun, and the trail the runner cuts.
        </p>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          No video file anywhere. Every frame is SVG drawn from the song's own
          clock and cut to a measured score, so things land where they are sung.
        </p>
      </header>

      <!-- ── The film ───────────────────────────────────────────────── -->
      <section class="space-y-5">
        <div
          ref="stage"
          class="relative isolate overflow-hidden rounded-[var(--radius-md)] border border-theme bg-black"
          :style="{ aspectRatio: '16 / 9' }"
        >
          <MusicVideoSvgFilm :film="reliefFrame" name="Relief" :score="score" :t="frameTime" uid="film" />

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
                {{ player.time.value > 0.5 ? 'Resume' : 'Play 3:25' }}
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
          for fifteen), <kbd>M</kbd> mutes and <kbd>F</kbd> fills the screen.
          When something is wrong, the most useful note is a time and what you
          saw — "around 1:12 the sign lands before the word" — since the song's
          seconds are the film's clock.
        </p>
      </section>

      <!-- ── What happens, section by section ───────────────────────── -->
      <section class="space-y-4">
        <h2 class="section-heading text-[1.35rem]">
          One world, left to right
        </h2>
        <p class="max-w-3xl text-sm leading-relaxed muted-text">
          Every part of the song is a stretch of the same print. Click a section
          to jump to it.
        </p>
        <ol class="divide-y divide-[color:var(--theme-border)] border-y border-theme">
          <li v-for="beat in BEATS" :key="beat.id">
            <button
              type="button"
              class="flex w-full cursor-pointer items-baseline gap-4 py-3 text-left transition-colors duration-150 hover:text-[color:var(--color-accent)]"
              :class="beat.id === currentSection.id ? 'text-[color:var(--color-accent)]' : ''"
              @click="player.seek(sectionFrom(beat.id))"
            >
              <span class="w-14 shrink-0 font-mono text-xs muted-text">
                {{ clock(sectionFrom(beat.id)) }}
              </span>
              <span class="label-text w-28 shrink-0 text-[0.55rem]">
                {{ beat.label }}
              </span>
              <span class="min-w-0 flex-1 text-sm leading-relaxed muted-text">
                {{ beat.note }}
              </span>
            </button>
          </li>
        </ol>
      </section>

      <!-- ── The cut ────────────────────────────────────────────────── -->
      <section class="space-y-4">
        <h2 class="section-heading text-[1.35rem]">
          The cut
        </h2>
        <p class="max-w-3xl text-sm leading-relaxed muted-text">
          {{ score.lines.length }} lines and {{ wordCount }} measured words.
          Every cut in the print lands on one of these times. Click a line to
          jump to it.
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
          Nothing in the print is hand-placed
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
            <NuxtLink to="/music-videos/album" class="underline">/music-videos/album</NuxtLink>
            — the album's art direction: the sheet, inks and motion all ten songs share.
          </li>
          <li>
            <NuxtLink to="/music-videos/into-the-wild-styles" class="underline">/music-videos/into-the-wild-styles</NuxtLink>
            — the five styles this was chosen from, over the same fifteen seconds.
          </li>
          <li>
            <NuxtLink to="/music-videos/conman" class="underline">/music-videos/conman</NuxtLink>
            — track two, the torn gallery.
          </li>
          <li>
            <NuxtLink to="/music-videos/goodbye-norma-jeane" class="underline">/music-videos/goodbye-norma-jeane</NuxtLink>
            — track three, the screenprint.
          </li>
          <li>
            <NuxtLink to="/music-videos/ivory" class="underline">/music-videos/ivory</NuxtLink>
            — track four, the etching.
          </li>
          <li>
            <NuxtLink to="/music-videos/andalusia" class="underline">/music-videos/andalusia</NuxtLink>
            — track five, the album's other finished film.
          </li>
          <li>
            <NuxtLink to="/music-videos/ship-to-stockholm" class="underline">/music-videos/ship-to-stockholm</NuxtLink>
            — track nine, the wood engraving.
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/*
 * /music-videos/into-the-wild — the whole song, as the album's woodcut
 * (shared/video/films/relief.mjs, app/config/albumStyle.ts).
 *
 * Unlisted and noindexed like everything under /music-videos: it restates a
 * published song's lyric in full and exists to be shared by link for a
 * decision. Shaped like /music-videos/andalusia: the page owns the projector
 * and the furniture, MusicVideoSvgFilm runs the film, and
 * app/config/intoTheWildScore.ts is the cut. The five-style test that used to
 * live at this address is /music-videos/into-the-wild-styles.
 */
import { INTO_THE_WILD_SCORE, lineAt, sectionAt } from '~/config/intoTheWildScore'
import { useMusicVideoPlayer } from '~/composables/useMusicVideoPlayer'
import { reliefFrame } from '~~/shared/video/films/relief.mjs'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Into the Wild — the woodcut',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const score = INTO_THE_WILD_SCORE

/* No analyser: the album's films are a function of the clock and nothing else. */
const player = useMusicVideoPlayer(score, { analyse: false })
const stage = useTemplateRef<HTMLElement>('stage')

/*
 * The poster frame: the title card with the sun up over the empty sea — the
 * album's opening format, and what the film is at rest before anyone presses play.
 */
const POSTER_AT = 11

const frameTime = computed(() =>
  !player.playing.value && player.time.value < 0.05 ? POSTER_AT : player.time.value,
)

const currentSection = computed(() => sectionAt(player.time.value))
const currentLine = computed(() => lineAt(player.time.value))
const wordCount = score.lines.reduce((n, line) => n + line.words.length, 0)

const sectionFrom = (id: string): number =>
  (score.sections.find((section) => section.id === id)?.from ?? 0) + 0.01

const sectionLabel = (id: string): string =>
  score.sections.find((section) => section.id === id)?.label ?? ''

const clock = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`

const stamp = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${(seconds % 60).toFixed(1).padStart(4, '0')}`

const toggleFullscreen = () => {
  const element = stage.value
  if (!element) return
  if (document.fullscreenElement) void document.exitFullscreen()
  else void element.requestFullscreen?.()
}

/* Keyboard on the window, as on /music-videos/andalusia: the thing being reviewed is the film. */
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

/* What each section does, keyed by the score's section ids. */
const BEATS = [
  {
    id: 'intro',
    label: 'Intro',
    note: 'An empty sea at first light. The red sun rises out of the horizon under the album\'s title card — 1/10, the title, the band in red.',
  },
  {
    id: 'verse-1',
    label: 'Verse 1',
    note: 'The Earth being carved. A compass is cut into the sky on "adventure" and knocked loose on "lose my way"; gems glint in the water; the gods\' sun throws rays; the sea is cut into waves on "water", and on "iron" the land and the range rise out of it. Ebony, ivory and bone are strata and a fossil in the cliff. The stone-cold beauties are boulders rising out of a moor, each with its eyes shut, and the singer is asleep among them as the sun sets and the moon comes up.',
  },
  {
    id: 'chorus-1',
    label: 'Chorus',
    note: 'Dawn. He stands on "So", runs on "running", and three pines are cut up out of the ground ahead of him on "into the wild". The red trail starts here and runs behind him for the rest of the film.',
  },
  {
    id: 'break',
    label: 'Break',
    note: 'Through the forest, slowing to a walk as it thins out into a town.',
  },
  {
    id: 'verse-2',
    label: 'Verse 2',
    note: 'The town he is tired of. Windows light up word by word; a blank shop sign is carved for each noun — an hourglass, a key, an hourglass, a book, a book; the clock tower\'s face is carved on "creates" and its hands race on "pressure"; a door opens on "revealing" and throws light on the street; a guitar appears in a lit window on "songs", and he stops in front of it.',
  },
  {
    id: 'chorus-2',
    label: 'Chorus',
    note: 'He runs out of the town into the pines.',
  },
  {
    id: 'solo',
    label: 'Horns',
    note: 'Forty seconds over a mountain pass with an empty margin. The ground climbs and falls, a flock goes over on every fourth bar, the sun sets behind the range, and the stars come out.',
  },
  {
    id: 'verse-3',
    label: 'Verse 3',
    note: 'Night, coming down off the pass. The compass again; a signpost whose arms are cut blank on "end", "up" and "know"; glints in the ground for the treasures; a crown carved and struck through on "gold"; a glacier on the nearest peak, flowers along the path and a grotto cut into a rock; wind through the sage. Then the camera leaves him and goes on alone to the harbour and the stage.',
  },
  {
    id: 'chorus-3',
    label: 'Final chorus',
    note: 'The sky floods red and the sun rises with a ray for every word. The singer runs along the stage, leaps off it on "the wild", and runs on into the range.',
  },
  {
    id: 'outro',
    label: 'Outro',
    note: 'Still running. The end card cuts in on the last hit of the arrangement.',
  },
]

const NOTES = [
  'Where each thing is drawn is solved from where the camera will be when its word is sung: the sign for "goals" hangs where the camera is on "goals". Retime the score and the world rearranges itself to match.',
  'The runner is his speed integrated: sitting, standing, running, walking, stopping, climbing, each change eased. The camera follows him and never goes slower than its drift. His walk and run are phased by distance covered, so his feet never slide.',
  'Parallax is translation at a fraction of the camera — sky 0.22, range 0.55, ground 1 — never scale, so a knife cut is the same width everywhere, as in a print.',
  'One function draws all of it: reliefFrame(t). The same file renders this page sixty times a second, draws the window on /music-videos/album, and can be walked frame by frame under node to write an mp4.',
]
</script>
