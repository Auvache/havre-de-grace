<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-12">
      <header class="space-y-4">
        <p class="label-text muted-text">
          Unlisted / for review
        </p>
        <h1 class="display-heading">
          Conman — the line engraving
        </h1>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          Four minutes of "Conman" as an uncut sheet of banknotes, track two of
          ten in the
          <NuxtLink to="/music-videos/album" class="underline">album's</NuxtLink>
          printmaking: engraved line in black, one banknote green, and one red
          serial number. The song is about how being inspired by other
          musicians is a kind of theft — and how that is not a bad thing: we
          take from each other all the time and build on it, and if we are
          lucky, somebody takes from us. So the whole song is one sheet of notes
          coming off a press, every one of them a copy of the one before with a
          new face on it. The red serial is the conman. It follows the camera
          from note to note, stamps every one it passes, rolls from 1968 to 2025
          when the earth shakes, and at the end rolls on to 2068 on somebody
          else's note.
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
          <MusicVideoSvgFilm :film="engravingFrame" name="Line engraving" :score="score" :t="frameTime" uid="film" />

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
                {{ player.time.value > 0.5 ? 'Resume' : 'Play 4:00' }}
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
          saw — "around 1:43 the serial lands before the word" — since the song's
          seconds are the film's clock.
        </p>
      </section>

      <!-- ── What happens, section by section ───────────────────────── -->
      <section class="space-y-4">
        <h2 class="section-heading text-[1.35rem]">
          One sheet, left to right
        </h2>
        <p class="max-w-3xl text-sm leading-relaxed muted-text">
          Every part of the song is a stretch of the same sheet. Click a section
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
          Everything that arrives on the sheet lands on one of these times.
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
          Every note is the same note
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
            <NuxtLink to="/music-videos/goodbye-norma-jeane" class="underline">/music-videos/goodbye-norma-jeane</NuxtLink>
            — track three, the screenprint.
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
 * /music-videos/conman — the whole song, as the album's line engraving
 * (shared/video/films/engraving.mjs, app/config/albumStyle.ts).
 *
 * Unlisted and noindexed like everything under /music-videos: it restates a
 * published song's lyric in full and exists to be shared by link for a
 * decision. Shaped like /music-videos/goodbye-norma-jeane: the page owns the
 * projector and the furniture, MusicVideoSvgFilm runs the film, and
 * app/config/conmanScore.ts is the cut.
 */
import { CONMAN_SCORE, lineAt, sectionAt } from '~/config/conmanScore'
import { useMusicVideoPlayer } from '~/composables/useMusicVideoPlayer'
import { engravingFrame } from '~~/shared/video/films/engraving.mjs'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Conman — the line engraving',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const score = CONMAN_SCORE

/* No analyser: the album's films are a function of the clock and nothing else. */
const player = useMusicVideoPlayer(score, { analyse: false })
const stage = useTemplateRef<HTMLElement>('stage')

/*
 * The poster frame: the title card under the 1968 note half engraved — the
 * rosette's rings cut, the oval's tone coming down over the sitter — the
 * album's opening format, and what the film is at rest before anyone presses play.
 */
const POSTER_AT = 19.4
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
    note: 'The 1968 note is engraved under the title card: the border, the rosette\'s rings one after another, the portrait oval, and the tone brought down over a sitter with a lion\'s mane, burnished out of the plate. 2/10, the title, the band in red.',
  },
  {
    id: 'verse-1',
    label: '1968',
    note: 'The red serial arrives on "conman", and the sitter shakes his head on "shake". On "1968" the numbering wheels roll from 0000 to 1968 and an airship sails into the vignette. The bottle is engraved on "Bottled" and the lightning cut into its glass; a stave runs into its neck and a note lands on it on each of "several steady notes". The clouds are pulled down into the sea, and the smoke is wiped out of the sky.',
  },
  {
    id: 'verse-2',
    label: 'A killing',
    note: 'The reprints: the same note printed again and again, a new face each time — 1971, 1977, 1986, 1994 — and a bigger number, 5, 20, 100, 1000. The camera runs along them on "moving fast", the serial hopping to each and rolling to its year. The 2025 note has nobody in its oval. The sheet shakes on "Earth shook"; a loupe searches the rosette and on "realized" finds MCMLXVIII engraved in its microprint.',
  },
  {
    id: 'chorus-1',
    label: 'Chorus',
    note: 'The press runs. The same note, printed as it comes in, one after another, with the same notes above and below it on the uncut sheet; the serial stamps every one; the rosettes spin; every word flicks the numbering wheels round and they land on the same number. Between the lines the camera slips half a row up the sheet and back.',
  },
  {
    id: 'verse-3',
    label: 'Shadows',
    note: 'Three notes of the people he follows now: a three-dollar bill with a peppermint rosette; a note whose rosette is a watch dial, its second hand stepping on the beat, with a guitar for a vignette; a note with a small, very tall man standing on top of the world. The serial lands on the first on "steal", follows along the bottom border in the hatching\'s shadow, looks away when the sitter looks at it, and on "pray" the last note is held to the light: his silhouette is the watermark in its paper, and it is gone again by "unaware".',
  },
  {
    id: 'chorus-2',
    label: 'Chorus',
    note: 'The press runs again, and every note on the sheet is his — the same note as last time.',
  },
  {
    id: 'break',
    label: 'Break',
    note: 'A blank note on the press, and on each bar a piece of the notes before it flies in from the left, labelled with where it came from: the peppermint (III), the watch hands (XII), the 1968 mane for the left of the face (MCMLXVIII), the long dark hair for the right (III), the bottle, the globe (L). A seam runs down the middle of the portrait. On the last bar the serial lands on it.',
  },
  {
    id: 'verse-4',
    label: 'Groove',
    note: 'He sways on "the way I move". "Watch me": the bottle is uncorked; the lightning splits the ground through the globe and pierces the sky through the top of the note; and the rosette finds a groove — it is a record, the peppermint for its label, the watch hands on it. The note stays cracked behind him on "damage in my wake", and on "all the eyes" the record on the next note is an eye, looking back at him.',
  },
  {
    id: 'chorus-3',
    label: 'Last chorus',
    note: 'The press runs his note — and then other people\'s: new faces, his record for a rosette, his bottle and globe, and his serial stamped on every one, the years rolling on, 2036, 2045, 2054…',
  },
  {
    id: 'outro',
    label: 'Outro',
    note: 'The camera settles on the last note: a new face, MMLXVIII, and the serial reading HG 2068 — a hundred years after the first. The cut to the end card is the last hit of the record.',
  },
]

const NOTES = [
  'Every note on the sheet is printed from one layout — the rosette, the portrait oval, the vignette, the border — and what changes is the face in the oval, the number and the year. The rows above and below the one the camera follows are the same notes again, as on an uncut sheet.',
  'Everything is line. Tone is line spacing and line crossing; the sitters are left in the paper, burnished out of the tone, and it is their hair that says who they are. The one thing that is not ink is the watermark, which is in the paper.',
  'The camera is a forger\'s loupe: it zooms in the transform, so the engraving\'s lines get heavier as it looks closer, the way a magnified print does. Its travel is one speed curve integrated — a drift that never stops, plus eased moves and runs — so it never cuts and never stops.',
  'Nothing about Led Zeppelin, Jack White, John Mayer or The Tallest Man on Earth is drawn from life: they are there as nods — an airship and 1968, a peppermint and a three, a watch and a guitar, a small tall man on top of the world.',
  'The score was measured, not tapped in: the voice separated from the mix, the words placed by a speech model and then moved onto the vocal\'s own onsets. The band played to a click at 87.5 BPM, and every repeat is a whole number of beats after the first, so the six choruses were solved once. The notes are printed on the eighth notes of that click.',
  'One function draws all of it: engravingFrame(t). The same file renders this page sixty times a second, draws the album still on /music-videos/album, and can be walked frame by frame under node to write an mp4.',
]
</script>
