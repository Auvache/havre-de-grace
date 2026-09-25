<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-12">
      <header class="space-y-4">
        <p class="label-text muted-text">
          Unlisted / for review
        </p>
        <h1 class="display-heading">
          Rocks in the Sea — the cyanotype
        </h1>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          Three minutes forty-two of "Rocks in the Sea" as a sun print, track
          eight of ten in the
          <NuxtLink to="/music-videos/album" class="underline">album's</NuxtLink>
          printmaking. A cyanotype is paper brushed with iron salts, things laid
          on it and the sheet left in the sun: white where something lay, blue
          where the light got in. And it is not permanent until it is washed.
          Until then it is pale and unsettled, and anything lifted off the paper
          prints soft.
        </p>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          So the film is a print that is not yet fixed. A shoreline is laid on
          the paper a word at a time — the hometown, the rocks, a road into the
          trees — every white thing a little soft at the edge, and a grey cloud
          laid on "gray" that stays with the camera wherever it goes. On "I choose
          to stay" the wash goes over: the blue deepens, everything presses flat
          and sharp, and the cloud rinses out of the paper. The last chorus is the
          first one, fixed. The only red is the road, the one line the sun did not
          make.
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
          <MusicVideoSvgFilm :film="cyanotypeFrame" name="Cyanotype" :score="score" :t="frameTime" uid="film" />

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
                {{ player.time.value > 0.5 ? 'Resume' : 'Play 3:48' }}
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
          saw — "around 1:40 the trees arrive before the word" — since the song's
          seconds are the film's clock.
        </p>
      </section>

      <!-- ── What happens, section by section ───────────────────────── -->
      <section class="space-y-4">
        <h2 class="section-heading text-[1.35rem]">
          One shoreline, left to right
        </h2>
        <p class="max-w-3xl text-sm leading-relaxed muted-text">
          Every part of the song is a stretch of the same shore. Click a section
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
          Everything that is laid on the paper lands on one of these times.
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
          Nothing on the paper is hand-placed
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
            <NuxtLink to="/music-videos/ivory" class="underline">/music-videos/ivory</NuxtLink>
            — track four, the etching.
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
 * /music-videos/rocks-in-the-sea — the whole song, as the album's cyanotype
 * (shared/video/films/cyanotype.mjs, app/config/albumStyle.ts).
 *
 * Unlisted and noindexed like everything under /music-videos: it restates a
 * published song's lyric in full and exists to be shared by link for a
 * decision. Shaped like /music-videos/ivory: the page owns the projector and
 * the furniture, MusicVideoSvgFilm runs the film, and
 * app/config/rocksInTheSeaScore.ts is the cut.
 */
import { ROCKS_IN_THE_SEA_SCORE, lineAt, sectionAt } from '~/config/rocksInTheSeaScore'
import { useMusicVideoPlayer } from '~/composables/useMusicVideoPlayer'
import { cyanotypeFrame } from '~~/shared/video/films/cyanotype.mjs'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Rocks in the Sea — the cyanotype',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const score = ROCKS_IN_THE_SEA_SCORE

/* No analyser: the album's films are a function of the clock and nothing else. */
const player = useMusicVideoPlayer(score, { analyse: false })
const stage = useTemplateRef<HTMLElement>('stage')

/*
 * The poster frame: the title card under the first things the sun printed —
 * the coat exposed to blue, the horizon, the sun and the sea laid on it — the
 * album's opening format, and what the film is at rest before anyone presses
 * play.
 */
const POSTER_AT = 27.5
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
    note: 'The sensitiser is brushed on in four wide strokes and exposes, slowly, from pale to blue. The horizon thread is laid, then the sun, then the sea a thread at a time, the coast and the sand. The album\'s title card underneath — 8/10, the title, the band in red.',
  },
  {
    id: 'verse-1',
    label: 'Verse 1',
    note: 'On "drove" the red road is drawn along the foot of the print. The hometown\'s paper houses are laid on the far shore house by house on "hometown", the steeple on "today"; three fern fronds on "green"; and on "gray" a grey cotton cloud. On "It\'s always with me" the camera leaves everything behind except the cloud.',
  },
  {
    id: 'break-1',
    label: 'Guitar',
    note: 'Seaweed, the way Anna Atkins laid it for the first cyanotype book, one frond a bar, each unfurling as it settles.',
  },
  {
    id: 'verse-2',
    label: 'Verse 2',
    note: 'A dandelion clock, laid on "don\'t have", losing a few seeds on "much", "left" and "say". The photogram\'s classic things — a key, scissors, a spoon, a comb, a button — laid in a row on "things", and every seed left carried off on "drift away". The cloud shivers on "shake" and rains on "rain". The rocks are laid in the water on "rocks" and "water", and on "calling my name" rings go out from them while the camera slows.',
  },
  {
    id: 'chorus-1',
    label: 'Chorus',
    note: 'The road turns up the headland on "road" and slims into the ferns on "trees"; the rain stops and the sea calms on "hide the sound". Gulls lift out of the trees on "hearts leaving home" and are away by "free". Then rocks in the sea, sand scattered on "sand", a wave thread rolling in on "sea".',
  },
  {
    id: 'break-2',
    label: 'Guitar',
    note: 'The print opens out to the whole sheet and a long swell rolls through the threads, and folds back in for the verse.',
  },
  {
    id: 'verse-3',
    label: 'Verse 3',
    note: 'Two tin cans, laid on "talked" and "sister", and the string between them pulled taut on "today". A paper chain of houses unfolds on "the things that we make". Three stones lift out of the water on "stranded", "rocks" and "bay" — soft while they are in the air — and land crisp as a cairn. On "stay" the wash goes over the print.',
  },
  {
    id: 'chorus-2',
    label: 'Chorus',
    note: 'Fixed: the full blue, every edge sharp, the cloud gone and the sun out. The road runs up a second headland into the trees; the gulls come back and settle in them; the hometown is laid on the far shore on "home". Rocks, sand, a wave, sea grass — the album still, with the cairn and the paper houses in it.',
  },
  {
    id: 'outro',
    label: 'End',
    note: 'The end card on the last note, the chord ringing out under the credits.',
  },
]

const NOTES = [
  'Every white thing is laid on the paper as it is sung: it arrives a touch large and soft — lifted off the sheet — and settles flat over most of a second. Until the wash, nothing settles all the way; after it, everything does.',
  'The wash is a sheet of water crossing the print from left to right over five seconds from "stay". Behind its edge the exposed blue becomes the full Prussian, the penumbras close up, and the cloud — cotton wool, the one thing that was never lying flat — rinses out.',
  'Where each thing is drawn is solved from where the camera will be when its word is sung, and the last chorus is composed backwards from its final picture: the album still, which the film ends on.',
  'The camera never stops: a drift, plus half-cosine moves between places, never faster than twenty units a frame. It slows to a hush of a few units a second while the rocks call, on the last line of the first chorus, and from "For the ones that I love" to the end.',
  'The score was measured, not tapped in: the voice separated from the mix, the words placed by a speech model and moved onto the vocal\'s own onsets, and the last chorus — the first one exactly 132 beats later — solved once on both. The band played to a click at 100 BPM, and the seaweed comes up on its bars.',
  'One function draws all of it: cyanotypeFrame(t). The same file renders this page sixty times a second and can be walked frame by frame under node to write an mp4.',
]
</script>
