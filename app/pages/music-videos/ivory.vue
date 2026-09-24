<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-12">
      <header class="space-y-4">
        <p class="label-text muted-text">
          Unlisted / for review
        </p>
        <h1 class="display-heading">
          Ivory — the etching
        </h1>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          Three minutes eight of "Ivory" as a hand-coloured naturalist's plate,
          track four of ten in the
          <NuxtLink to="/music-videos/album" class="underline">album's</NuxtLink>
          printmaking: etched line in black, one blue laid on by hand, and one
          red thread. The song is the moment you see somebody and cannot speak
          for how electric they make you feel, and so do not act, and the chance
          goes. The plate tries to catalogue her by the only things he can name
          — open ocean, butterfly wings, California, Tennessee, flowers in her
          hair, Alaska in the snow — and cannot. She is never inked: Ivory is the
          colour of the paper, so she is the one thing the etcher leaves bare,
          seen only because of the hatching round her. The red thread is his eye
          going from one comparison to the next. It reaches every specimen on
          its word, and every "Ivory" it reaches for her pin and stops a finger's
          width short.
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
          <MusicVideoSvgFilm :film="etchingFrame" name="Etching" :score="score" :t="frameTime" uid="film" />

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
                {{ player.time.value > 0.5 ? 'Resume' : 'Play 3:08' }}
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
          saw — "around 1:30 the eyes open before the word" — since the song's
          seconds are the film's clock.
        </p>
      </section>

      <!-- ── What happens, section by section ───────────────────────── -->
      <section class="space-y-4">
        <h2 class="section-heading text-[1.35rem]">
          One plate, left to right
        </h2>
        <p class="max-w-3xl text-sm leading-relaxed muted-text">
          Every part of the song is a stretch of the same plate. Click a section
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
          Everything that arrives on the plate lands on one of these times.
          Click a line to jump to it.
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
          Nothing on the plate is hand-placed
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
            <NuxtLink to="/music-videos/into-the-wild" class="underline">/music-videos/into-the-wild</NuxtLink>
            — track one, the woodcut.
          </li>
          <li>
            <NuxtLink to="/music-videos/conman" class="underline">/music-videos/conman</NuxtLink>
            — track two, the line engraving.
          </li>
          <li>
            <NuxtLink to="/music-videos/goodbye-norma-jeane" class="underline">/music-videos/goodbye-norma-jeane</NuxtLink>
            — track three, the screenprint.
          </li>
          <li>
            <NuxtLink to="/music-videos/andalusia" class="underline">/music-videos/andalusia</NuxtLink>
            — track five, the engraved chart.
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
 * /music-videos/ivory — the whole song, as the album's hand-coloured etching
 * (shared/video/films/etching.mjs, app/config/albumStyle.ts).
 *
 * Unlisted and noindexed like everything under /music-videos: it restates a
 * published song's lyric in full and exists to be shared by link for a
 * decision. Shaped like /music-videos/goodbye-norma-jeane: the page owns the
 * projector and the furniture, MusicVideoSvgFilm runs the film, and
 * app/config/ivoryScore.ts is the cut.
 */
import { IVORY_SCORE, lineAt, sectionAt } from '~/config/ivoryScore'
import { useMusicVideoPlayer } from '~/composables/useMusicVideoPlayer'
import { etchingFrame } from '~~/shared/video/films/etching.mjs'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Ivory — the etching',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const score = IVORY_SCORE

/* No analyser: the album's films are a function of the clock and nothing else. */
const player = useMusicVideoPlayer(score, { analyse: false })
const stage = useTemplateRef<HTMLElement>('stage')

/*
 * The poster frame: the title card under the first scratch — the horizon and
 * the far sky laid in, the thread coming in from the left — the album's opening
 * format, and what the film is at rest before anyone presses play.
 */
const POSTER_AT = 8.2
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
    note: 'The plate is grounded: its border rules are scratched in, then the horizon, then the far sky, and the red thread comes in from the left on its needle. The album\'s title card underneath — 4/10, the title, the band in red.',
  },
  {
    id: 'verse-1',
    label: 'Verse 1',
    note: 'fig. 1, a shore at dawn. The hatching sweeps across the plate on "That there\'s a woman" and leaves her standing on the beach in bare paper, far off. The sun rises on "sunrise"; a swell rolls in on "waves" and breaks in foam on "shore", where the thread takes its first pin. The blue goes on after the line.',
  },
  {
    id: 'her-eyes',
    label: 'Her eyes',
    note: 'fig. 2, open ocean, etched row by row and washed. fig. 3, a blue butterfly, whose wings open on "wings" with an eyespot on each — her eyes. fig. 4, a stage: the curtains are drawn aside on "when she gets on stage", a spotlight comes on and she is in it, and on "sings" light cracks out of her in paper across the dark and the blue floods the backdrop. On "Ivory" the thread reaches for her pin and stops a finger\'s width short.',
  },
  {
    id: 'california',
    label: 'California',
    note: 'fig. 5, a Monterey cypress on a headland over the Pacific. fig. 6, a mockingbird among blue flags, which sings on "Tennessee". fig. 7, a drawer of pinned moths, one pinned a word on "I want to get to know her", and one slot empty. A lens slides over it on "she remains my mystery" and finds only the bare shape of her. "Oh, Ivory": the thread reaches for the empty slot, and stops.',
  },
  {
    id: 'verse-2',
    label: 'Verse 2',
    note: 'fig. 8, an engraved portrait medallion: a profile with no face, only the hatching round the back of her head, and cornflowers coming into her hair one after another from "flowers" to "hair". fig. 9, the universe at night: an orrery wheeling over a hill, and she is standing on it. On "stop" the planets stop and the camera very nearly does; on "stare" every star in the sky turns a ray on her.',
  },
  {
    id: 'beside-her',
    label: 'Her name',
    note: 'fig. 10, a stage seen from the crowd: her spotlight, and on "beside" a second one comes on, empty, which the thread pins on "where I want to be". fig. 11: the plate at its darkest, and on "When I asked her for her name" she is wiped out of it in paper, face on — and on "looked" her eyes open, blue. On "straight back at me" the plate burns: light round her, the blue flooding, cracks of paper out of the dark. "Ivory": the thread comes up from below, and stops short.',
  },
  {
    id: 'paradise',
    label: 'Paradise',
    note: 'fig. 12, a keyboard of ebony and ivory. Its lid lifts on "paradise" to show a paradise painted inside it — palms, a fountain, birds — and the keys play on "play a melody", the notes rising off them. fig. 13, a locket: the thread pins the heart on "heartache" and a crack runs down it; on "keep this one just for me" the locket shuts with her inside, over the pin. "Oh, Ivory": the thread reaches for the place where she was.',
  },
  {
    id: 'interlude',
    label: 'Interlude',
    note: 'A long pan along a border of wild flowers coming up out of the plate a beat at a time — ferns, wild roses, cornflowers, reeds — with a small blue butterfly flitting ahead. The tree of Eden grows out of the end of it: the trunk, the branches, the leaves on the beat, the apples, the serpent.',
  },
  {
    id: 'bridge',
    label: 'My name',
    note: 'fig. 14. Eve, in paper, comes into the plate on "the one she loves", holding an apple; the thread pins the tree on "Adam", on the side where nobody is standing. On "when she asked me for my name" she holds the apple out to the empty place. On "I forgot how to breathe" the plate floods with blue from the foot up, the camera almost stops, and the bubbles of a breath go up — and stop on "breathe". This "Ivory" the thread does not reach at all. When the water drains she is gone, and the apple lies where he should have been.',
  },
  {
    id: 'alaska',
    label: 'Alaska',
    note: 'fig. 15, the sun going down over the Pacific where it came up over the shore. fig. 16, the mockingbird, which flies on "Tennessee". fig. 17, a spruce forest in snowfall, and on "Walks just like Alaska" she walks away up the path into the trees, smaller and smaller, her footprints behind her, and is gone on "trees". fig. 18, the keyboard again, in the snow, its lid lifting and its keys playing for nobody. Then the specimen case: everything the thread pinned, lettered a label a word on "keep this one just for me" — all but hers.',
  },
  {
    id: 'last',
    label: 'Ivory',
    note: 'The camera settles on her pin in the case: an empty pin and a blank label. On the last "Ivory" the thread makes one more reach, closer than ever, and stops; and the blue butterfly beside it comes off its pin and flies up and out of the plate.',
  },
  {
    id: 'outro',
    label: 'Outro',
    note: 'The case, the slack thread, the empty pin. The cut to the end card is the last hit of the record.',
  },
]

const NOTES = [
  'She is drawn in the album\'s paper, a shade lighter than the plate tone and never outlined — so she is visible only where there is hatching round her. That is why she is a hint at the shore and in the spotlight, and plain only in fig. 11, where the plate is at its darkest.',
  'Tone is built the way an etcher builds it: layers of parallel lines at different angles, each laid only where the tone passes its threshold. The lines sit on a lattice fixed to the plate, so two fields that meet carry the same lines through the join, and every field is computed once and moved by the camera.',
  'Where each figure is drawn is solved from where the camera will be when its word is sung: the lens is where the camera is on "mystery", the face where it is on "looked". Retime the score and the plate rearranges itself to match.',
  'The camera never stops: a drift, plus half-cosine moves between figures, never faster than forty units a frame. Twice it slows to a hush of a few units a second — when the universe stops to stare, and when he forgets how to breathe.',
  'The score was measured, not tapped in: the voice separated from the mix, the words placed by a speech model and then moved onto the vocal\'s own onsets, the repeated lines solved once on their pooled evidence. The band played to a click at 105 BPM, and the wild flowers of the interlude come up on it.',
  'One function draws all of it: etchingFrame(t). The same file renders this page sixty times a second, draws the album still on /music-videos/album, and can be walked frame by frame under node to write an mp4.',
]
</script>
