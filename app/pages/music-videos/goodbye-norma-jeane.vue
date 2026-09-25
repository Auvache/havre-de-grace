<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-12">
      <header class="space-y-4">
        <p class="label-text muted-text">
          Unlisted / for review
        </p>
        <h1 class="display-heading">
          Goodbye, Norma Jeane — the screenprint
        </h1>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          Four minutes forty-one of "Goodbye, Norma Jeane" as a studio's
          silkscreen, track three of ten in the
          <NuxtLink to="/music-videos/album" class="underline">album's</NuxtLink>
          printmaking: paper, black, one pink and one red. It never draws her.
          It draws what was put around her, in the order it was put there,
          along one strip of film: a picture house, a studio cheque, a dressing
          room, searchlights, a wall pasted with her mouth, the walk of fame,
          a diamond, a bottle of pills, a telephone off the hook. The pink
          screen drifts out of register and comes almost, never quite, back in
          on every "Goodbye". The red is the journey: one lipstick line, drawn
          the length of the film, that stops where the lipstick is dropped.
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
          <MusicVideoSvgFilm :film="screenprintFrame" name="Screenprint" :score="score" :t="frameTime" uid="film" />

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
                {{ player.time.value > 0.5 ? 'Resume' : 'Play 4:41' }}
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
          saw — "around 1:55 the posters go up before the word" — since the song's
          seconds are the film's clock.
        </p>
      </section>

      <!-- ── What happens, section by section ───────────────────────── -->
      <section class="space-y-4">
        <h2 class="section-heading text-[1.35rem]">
          One strip of film, left to right
        </h2>
        <p class="max-w-3xl text-sm leading-relaxed muted-text">
          Every part of the song is a stretch of the same strip. Click a section
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
          Everything that arrives in the print lands on one of these times.
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
            <NuxtLink to="/music-videos/into-the-wild" class="underline">/music-videos/into-the-wild</NuxtLink>
            — track one, the woodcut.
          </li>
          <li>
            <NuxtLink to="/music-videos/conman" class="underline">/music-videos/conman</NuxtLink>
            — track two, the torn gallery.
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
 * /music-videos/goodbye-norma-jeane — the whole song, as the album's
 * screenprint (shared/video/films/screenprint.mjs, app/config/albumStyle.ts).
 *
 * Unlisted and noindexed like everything under /music-videos: it restates a
 * published song's lyric in full and exists to be shared by link for a
 * decision. Shaped like /music-videos/into-the-wild: the page owns the
 * projector and the furniture, MusicVideoSvgFilm runs the film, and
 * app/config/goodbyeNormaJeaneScore.ts is the cut.
 */
import { GOODBYE_NORMA_JEANE_SCORE, lineAt, sectionAt } from '~/config/goodbyeNormaJeaneScore'
import { useMusicVideoPlayer } from '~/composables/useMusicVideoPlayer'
import { screenprintFrame } from '~~/shared/video/films/screenprint.mjs'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Goodbye, Norma Jeane — the screenprint',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const score = GOODBYE_NORMA_JEANE_SCORE

/* No analyser: the album's films are a function of the clock and nothing else. */
const player = useMusicVideoPlayer(score, { analyse: false })
const stage = useTemplateRef<HTMLElement>('stage')

/*
 * The poster frame: the title card over the picture house, the leader
 * sweeping on the screen — the album's opening format, and what the film is at
 * rest before anyone presses play.
 */
const POSTER_AT = 9.4

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
    note: 'A picture house: pink curtains, pink seats, the projector\'s light. The leader counts down on the screen, one sweep a bar on the record\'s click, and runs out exactly as the voice comes in. The album\'s title card underneath — 3/10, the title, the band in red.',
  },
  {
    id: 'verse-1',
    label: 'Verse 1',
    note: 'The screen goes silver on "Silver", the bulbs come on round it on "screen", and a star is born on it on "Norma Jeane". Nine blank sign panels stand up on a hill for "Something bigger\'s meant for me". A dress form on Juliet\'s balcony is filled in black on "silhouette". Then the lipstick climbs to a studio cheque and signs it while scissors cut it out of the book.',
  },
  {
    id: 'pre-1',
    label: 'Put an end',
    note: 'A clapperboard. The sticks drop on "end" and lift again on "come on". It never closes — every pre-chorus is the same clapper, open. It closes once, on the last hit of the record.',
  },
  {
    id: 'break-1',
    label: 'Break',
    note: 'The sound stage: a lamp coming up on the beat, the camera on its sticks, an empty director\'s chair, the boom, film cans.',
  },
  {
    id: 'verse-2',
    label: 'Verse 2',
    note: 'The dressing room. The dark hair on a wig stand bleaches platinum on "Die", curl by curl; a gingham frock comes off the dress form on "change" and the white halter dress goes on by "clothes". An eye in the mirror grows its lashes on "Bat" and closes, really slow. The snapshots of home — a church, a pine, a heart — fall out of the mirror frame one word at a time on "goodbye to all you know", and a ball is pitched across a baseball diamond and lands in the glove on "DiMaggio".',
  },
  {
    id: 'pre-2',
    label: 'Put an end',
    note: 'The clapper again. It comes nearer to closing on the second "end" than the first, and still does not.',
  },
  {
    id: 'chorus-1',
    label: 'Goodbye',
    note: 'Night, and searchlights. On "Goodbye" the pink screen comes almost into register. The world rises on "world"; a ring box opens on "love" — a plain band, tiny in the dark — and glints on "seventeen". On "world, it\'s more, more, more" a wall is pasted up with her mouth: one poster, four more, five more, four more. The line ends "you wanted" with no "more", and the camera settles on the one space left empty.',
  },
  {
    id: 'break-2',
    label: 'Interlude',
    note: 'The walk of fame: stars in the pavement, velvet rope, premiere marquees with blank letter boards, and flashbulbs on the bar.',
  },
  {
    id: 'verse-3',
    label: 'Verse 3',
    note: 'Daylight again, and the price. Dice come up doubles on "Double down" and the chips stack on "bets"; the diamond on "Diamonds", sparkling on "only" and "friend"; a squeegee pulls a stroke of pink across a screen on "Different lines paint different strokes"; a pill bottle tips on "these" and the pills come out one a word.',
  },
  {
    id: 'pre-3',
    label: 'Put an end',
    note: 'The third clapper, and still open.',
  },
  {
    id: 'chorus-2',
    label: 'Goodbye',
    note: 'The same night, the same world and ring and wall — and this time, on "you wanted more", the last poster goes up in the empty space.',
  },
  {
    id: 'break-3',
    label: 'Interlude',
    note: 'A bedroom in a pool of lamplight: the bed, the bedside table, the telephone. The lamp goes out, and only the pink is left.',
  },
  {
    id: 'chorus-3',
    label: 'Last goodbye',
    note: 'The last chorus. The world dims as it rises. The wall goes up again, but every poster is fainter and further out of register than the last — the right half of the Marilyn Diptych — and the searchlights go out one by one on "I wanted you, you wanted more". The lipstick line is wearing thin.',
  },
  {
    id: 'outro',
    label: 'Outro',
    note: 'The telephone off the hook, the handset swinging on its cord; the bottle on its side. The lipstick is dropped beside it and the red line ends. The camera goes on alone to one last clapperboard, and on the last hit of the record it shuts — the cut to the end card is the clap.',
  },
]

const NOTES = [
  'Three screens, pulled in order: the pink, off the key by a register that wanders through the verses, comes almost into register on every "Goodbye", and in the last chorus and the outro drifts further out as the print fails; the key in black and paper; and one red, the only screen in register.',
  'Where each thing is drawn is solved from where the camera will be when its word is sung: the clapper is where the camera is on "end", the wall where it is on "world". Retime the score and the strip rearranges itself to match.',
  'The camera never stops: a drift, plus half-cosine moves between views, never faster than forty units a frame. The lipstick rides ahead of it and never goes backwards, except where it signs the cheque — a signature is loops, so there it is drawn as a prolate cycloid.',
  'The score was measured, not tapped in: the voice separated from the mix, the words placed by a speech model and then moved onto the vocal\'s own onsets, the choruses solved once on their pooled evidence. The band played to a click, at 95 BPM, and the leader in the intro sweeps on it.',
  'One function draws all of it: screenprintFrame(t). The same file renders this page sixty times a second, draws the album still on /music-videos/album, and can be walked frame by frame under node to write an mp4.',
]
</script>
