<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-12">
      <header class="space-y-4">
        <p class="label-text muted-text">
          Unlisted / for review
        </p>
        <h1 class="display-heading">
          New York — the letterpress
        </h1>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          Three minutes thirty-five of "New York" as a letterpress wall, track
          six of ten in the
          <NuxtLink to="/music-videos/album" class="underline">album's</NuxtLink>
          printmaking: wood type and picture cuts in ink, the poster yellow as a
          second forme, and one red. The song is about being done with everybody's
          formula — the one right way to make it, the city you have to move to,
          the thing you have to bend or sell to get somewhere you may not even
          want to be. So there is nobody in it. It is a wall flyposted with
          advice, and every artifact on it — a love song, a gold record, a
          lighthouse, a contract, a paint-by-numbers, a departures board, the
          formula itself — gets burnt, melted, torn, shattered or crushed under
          a NO.
        </p>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          Red is the one thing that travels: a printer's rule that runs the
          length of the wall and strikes out every piece of advice it passes,
          and at the end goes off the sheet on its own. No video file anywhere:
          every frame is SVG drawn from the song's own clock and cut to a
          measured score, so every NO lands where it is sung.
        </p>
      </header>

      <!-- ── The film ───────────────────────────────────────────────── -->
      <section class="space-y-5">
        <div
          ref="stage"
          class="relative isolate overflow-hidden rounded-[var(--radius-md)] border border-theme bg-black"
          :style="{ aspectRatio: '16 / 9' }"
        >
          <MusicVideoSvgFilm :film="letterpressFrame" name="Letterpress" :score="score" :t="frameTime" uid="film" />

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
                {{ player.time.value > 0.5 ? 'Resume' : 'Play 3:35' }}
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
          saw — "around 1:50 the third NO lands late" — since the song's
          seconds are the film's clock.
        </p>
      </section>

      <!-- ── What happens, section by section ───────────────────────── -->
      <section class="space-y-4">
        <h2 class="section-heading text-[1.35rem]">
          One wall, left to right
        </h2>
        <p class="max-w-3xl text-sm leading-relaxed muted-text">
          Every part of the song is a stretch of the same wall. Click a section
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
          Everything that is printed or destroyed on the wall lands on one of these times.
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
          Nothing on the wall is hand-placed
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
 * /music-videos/new-york — the whole song, as the album's letterpress
 * (shared/video/films/letterpress.mjs, app/config/albumStyle.ts).
 *
 * Unlisted and noindexed like everything under /music-videos: it restates a
 * published song's lyric in full and exists to be shared by link for a
 * decision. Shaped like /music-videos/ship-to-stockholm: the page owns the
 * projector and the furniture, MusicVideoSvgFilm runs the film, and
 * app/config/newYorkScore.ts is the cut.
 */
import { NEW_YORK_SCORE, lineAt, sectionAt } from '~/config/newYorkScore'
import { useMusicVideoPlayer } from '~/composables/useMusicVideoPlayer'
import { letterpressFrame } from '~~/shared/video/films/letterpress.mjs'

definePageMeta({ layout: 'default' })

useHead({
  title: 'New York — the letterpress',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const score = NEW_YORK_SCORE

/* No analyser: the album's films are a function of the clock and nothing else. */
const player = useMusicVideoPlayer(score, { analyse: false })
const stage = useTemplateRef<HTMLElement>('stage')

/*
 * The poster frame: the title card under the first image — THE FORMULA
 * broadside, pulled and nearly finished, the departures listed — the album's
 * opening format, and what the film is at rest before anyone presses play.
 */
const POSTER_AT = 15.5
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
    note: 'The broadside is pulled block by block on the beat: a brass rule, THE ONE SURE WAY TO MAKE IT, the yellow forme, THE FORMULA in wood type, the departures — Memphis, Nashville, Austin, L.A., Detroit, New York — and a row of lights along a shore. The red rule comes in along the foot of the wall and underlines it. The album\'s title card underneath: 6/10, the title, the band in red.',
  },
  {
    id: 'verse-1',
    label: 'Love',
    note: 'The camera whips along the wall to a poster: LOVE in wood type, a love song\'s sheet music. Rocks fall in on "rocks"; on "burning" it catches, and the whole poster burns away from the coals, which glow on "coals". Under it is a sea poster: easy dreams in a submarine that surfaces on "submarines", fires on "undermine", and brings down the trophy on its plinth — THE GOAL — on "goal".',
  },
  {
    id: 'chorus-1',
    label: 'The lights',
    note: 'A night poster: five lighthouses built of the things that tell you where to go — a plain one, a microphone stand, a stack of amps, a metronome, a trophy — each beam carrying a piece of advice. On "follow" they all turn to point the same way; from "lights" to "shore" the red rule strikes the row of them out, and each goes dark as it is struck. Then a pole of loudspeaker horns and two megaphones shouting advice until headphones come down on "listen", the horns droop on "anybody", melt on "ever" and shatter on "anymore".',
  },
  {
    id: 'break-1',
    label: 'The gear',
    note: 'A wall of amps. Records drop onto them on the bar and melt down the front; a guitar rises off the fourth stack and comes down on it on the downbeat. A cassette drops and its tape runs on down the wall, and the camera follows it.',
  },
  {
    id: 'verse-2',
    label: 'Move to',
    note: 'A departures board, every flap spinning. Each city lands on its word and the red rule strikes it out, row by row, zigzagging down the board like a list crossed out; NEW YORK sits at the bottom, NOW BOARDING. After "Detroit" the flaps jam, blow off and the board comes apart. Then a conveyor belt under THE ONLY WAY, which drops off a chain on "break": the contract tears on "bargain", THE RULES bends and snaps on "bend", the guitar case falls through a trapdoor on "abandon", and the cash register — $0.003 a stream — bursts on "exploit".',
  },
  {
    id: 'chorus-2',
    label: 'Art class',
    note: 'TODAY: THE RIGHT WAY TO PAINT on the chalkboard, and three easels of the same paint-by-numbers filling in cell for cell on the words. They are torn to strips on "listen", "anybody" and "ever", and on "anymore" a tin of THE RIGHT COLOUR goes everywhere.',
  },
  {
    id: 'no-1',
    label: 'No',
    note: 'A fresh broadside, four yellow blocks pulled on the four beats before. Under them the formula in four parts — a metronome, a stack of how-to books, a punch clock, a report card of Fs — and each NO comes down on its word and crushes one. Then NEW YORK as a skyline in wood type: the cab waiting at the kerb leaves without him on "won\'t go", the rule strikes the city out on "New York", and it melts.',
  },
  {
    id: 'break-2',
    label: 'Instrumental',
    note: 'The wall at speed. A run of forms — APPLICATION, FORM 27-B, TERMS & CONDITIONS — with a rubber stamp coming down on every beat; records thrown in and shattering on the beats; THE LADDER losing its rungs from the top; advice pulled in wood type on one beat and knocked out of the forme on the next. In the quiet bar, one metronome keeping the time it is given, the tape coming back — and it breaks.',
  },
  {
    id: 'chorus-3',
    label: 'Lights out',
    note: 'The shore again, and this time the lighthouses topple into the sea one on each of "follow", "lights", "see", "out" and "shore", while the rule runs on along the horizon past all of them. Then a wall of televisions — STAY TUNED, BUY NOW, OBEY, GO VIRAL — that implode a row at a time on "listen", "anybody" and "ever", and take the shelf with them on "anymore".',
  },
  {
    id: 'no-2',
    label: 'New York',
    note: 'Everything the film has broken is lined up along the floor, and three rounds of NO come down on it, each bigger and more out of true than the last, printed over each other. Then the formula poster again. "Won\'t go" stamps NOT GOING over the big one; the band drops out and the camera leans in on New York; the rule strikes it out on "New York", and on "York" the poster tears in two and its type falls out. The wall comes down behind it in strips, everything rains past, and the red rule goes off the sheet on its own. The cut to the end card is the voice letting go.',
  },
]

const NOTES = [
  'Nobody is in it. Every picture is a cut — a picture block locked up in the forme with the type — printed flat in ink with the poster yellow as a second forme, and every one is something a musician is handed on the way: a love song, a gold record, an amp, a contract, a guitar, a ticket out.',
  'Red is the journey, and the journey is his own. The red rule runs the length of the wall along its foot, rises square to strike through every piece of advice it passes — the lights on the shore, the cities, New York twice — and leaves the sheet at the end, going nowhere anyone pointed.',
  'Things are destroyed six ways, each a pure function of the time since its word: burnt from a point with a charred edge and ash, torn into strips that peel and fall, shattered into shards that tile until they fly, melted by bending their points, crushed flat, or knocked out of the forme letter by letter — pied, in the printer\'s word.',
  'The camera never cuts: a drift plus eased whips, integrated from one speed curve, that bank into the turn; the sheet jumps a little with the kick on every beat of the click, and shakes on every NO. Where each thing stands is solved from where the camera is when its word is sung.',
  'The score was measured, not tapped in: the voice separated from the mix, the words placed by a speech model and then moved onto the vocal\'s own onsets. The band played to a click at 98.5 BPM, and every NO was measured on its own.',
  'One function draws all of it: letterpressFrame(t). The same file renders this page sixty times a second, draws the album still on /music-videos/album, and can be walked frame by frame under node to write an mp4.',
]
</script>
