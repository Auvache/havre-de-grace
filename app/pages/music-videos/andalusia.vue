<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-12">
      <header class="space-y-4">
        <p class="label-text muted-text">
          Unlisted / proof of concept
        </p>
        <h1 class="display-heading">
          Andalusia — the chart
        </h1>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          Two minutes fifty-three of "Andalusia" as an admiralty chart, in the
          <NuxtLink to="/music-videos/styles#b2-cartography" class="underline">Cartography</NuxtLink>
          style: the song plotted as a passage plan on the real Earth. One red
          line starts as a dot in Andalusia, goes round the world, and ends as a
          pulsing dot outside Portland, and every line it draws stays drawn. No video
          file anywhere: every frame is SVG drawn from the song's own clock, so
          it lands where it is sung and weighs about what its markup weighs.
        </p>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          This is the
          <NuxtLink to="/music-videos/album" class="underline">album edition</NuxtLink>,
          track five of ten on Into the Wild. It is the same globe, route and
          camera, printed on the album's sheet: paper, black and one red, the chart
          inside a plate mark, and the lyric in the margin under it, where a
          printmaker pencils a print's title.
        </p>
      </header>

      <!-- ── The film ───────────────────────────────────────────────── -->
      <section class="space-y-5">
        <div
          ref="stage"
          class="relative isolate overflow-hidden rounded-[var(--radius-md)] border border-theme bg-black"
          :style="{ aspectRatio: '16 / 9' }"
        >
          <MusicVideoSvgFilm :film="cartographyAlbumFrame" name="Cartography, album edition" :score="score" :t="frameTime" uid="film" />

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
          section buttons jump straight into a part of the arrangement — verse 3
          at 1:13, where four ports are named in nine seconds, and the oh-ohs at
          1:49, where the chart empties to open sea, are the two worth looking
          at first.
        </p>
      </section>

      <!-- ── How the film is built, section by section ──────────────── -->
      <section class="space-y-4">
        <h2 class="section-heading text-[1.35rem]">
          Ten sections, ten scales
        </h2>
        <p class="max-w-3xl text-sm leading-relaxed muted-text">
          The device that keeps the style from going flat. A verse is a
          coastline, a chorus is the whole ocean, and the fourth verse is one
          harbour. Click a section to jump to it.
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
          Thirty-one lines, two hundred and ninety-seven words, each with a
          measured onset. Every landfall on the chart is one of these times.
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

      <!-- ── What is actually driving this ──────────────────────────── -->
      <section class="surface-card space-y-4 p-6">
        <p class="label-text muted-text">
          Nothing on the chart is hand-placed
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
            — the seven-style suite, and the written spec each one is built from.
          </li>
          <li>
            <NuxtLink to="/music-videos/album" class="underline">/music-videos/album</NuxtLink>
            — the album's art direction: the sheet, inks and motion all ten songs share.
          </li>
          <li>
            <NuxtLink to="/music-videos/kinetic" class="underline">/music-videos/kinetic</NuxtLink>
            — the same song in the kinetic-typography cut this suite was drawn
            against.
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/*
 * /music-videos/andalusia — the whole song, in the Cartography style, album
 * edition (app/config/albumStyle.ts).
 *
 * Unlisted and noindexed, like /music-videos/kinetic and the /music/itw-*
 * mockups and for the same reason: it restates a published song's lyric in full
 * and exists to be shared by link for a decision, not to be arrived at.
 *
 * The page owns the projector and the furniture; MusicVideoSvgFilm runs the
 * film, cartographyAlbumFrame in shared/video/films/cartography.mjs is the
 * style, and app/config/andalusiaScore.ts is the cut. This page was three
 * fifteen-second snippets while the question was "does this style have
 * anywhere to go". It does, so it is now the film — and since the album
 * direction was chosen, it is the album's edition of it, the same one the
 * snippet on /music-videos/album plays.
 */
import { ANDALUSIA_SCORE, lineAt, sectionAt } from '~/config/andalusiaScore'
import { useMusicVideoPlayer } from '~/composables/useMusicVideoPlayer'
import { cartographyAlbumFrame } from '~~/shared/video/films/cartography.mjs'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Andalusia — the chart, album edition',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const score = ANDALUSIA_SCORE

/*
 * No analyser. Cartography's spec gives the audio driver nothing to do — a
 * chart is a document, and documents do not throb — so the film is a pure
 * function of the clock and nothing else.
 */
const player = useMusicVideoPlayer(score, { analyse: false })
const stage = useTemplateRef<HTMLElement>('stage')

/*
 * The poster frame. The film opens on blank paper — the chart draws itself over
 * the first four seconds — so before anyone presses play the frame is held at
 * the moment the title card is full: the chart in the plate, the title, 5/10
 * and the band in the margin. A video that looks like
 * an empty rectangle until you play it does not get played.
 */
const POSTER_AT = 6.4

const frameTime = computed(() =>
  !player.playing.value && player.time.value < 0.05 ? POSTER_AT : player.time.value,
)

const currentSection = computed(() => sectionAt(player.time.value))
const currentLine = computed(() => lineAt(player.time.value))

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

/*
 * What each section does. Keyed by the score's own section ids, so a retimed
 * record moves these rows with it rather than leaving a written-down time to go
 * stale.
 */
const BEATS = [
  {
    id: 'intro',
    label: 'Intro',
    note: 'Andalusia at province scale, pushing in slowly. The album\'s title '
      + 'card sits in the margin — 5/10, the title, the band in red — and '
      + 'fades as the intro ends. As it leaves, the dot appears.',
  },
  {
    id: 'verse-1',
    label: 'Verse 1',
    note: 'The red line wanders the province, one leg per sung line: Sevilla, '
      + 'Córdoba, Granada, Málaga, Cádiz and back. The dot grows the whole way.',
  },
  {
    id: 'verse-2',
    label: 'Verse 2',
    note: 'The line leaves on the verse\'s first word and lands on "Stockholm". '
      + 'The camera rides it, pulling back over the North Sea on the way.',
  },
  {
    id: 'chorus-1',
    label: 'Chorus',
    note: 'Round the North Sea: Copenhagen, Oslo, London, Dublin, one leg per '
      + 'line. The lyric is in the margin, so the chart stays at full strength.',
  },
  {
    id: 'verse-3',
    label: 'Verse 3',
    note: 'Pulled back to a hemisphere. San Diego, Bangkok, Budapest and Baton '
      + 'Rouge, spread evenly across the verse rather than landing as sung.',
  },
  {
    id: 'chorus-2',
    label: 'Chorus',
    note: 'America: Baton Rouge to New York, Phoenix, Mexico City and Toronto.',
  },
  {
    id: 'ohs',
    label: 'Oh-oh-oh',
    note: 'The whole globe, twice round eastward through fifteen cities. One '
      + 'eased-out clock drives it, so the world spins down as it fills with red. '
      + 'No words, so the margin is empty.',
  },
  {
    id: 'verse-4',
    label: 'Verse 4',
    note: 'Home. Reykjavík to Andalusia, landing on the second "Andalusia". The '
      + 'dot breathes there for a few seconds, then the line leaves again two '
      + 'seconds into "Walk until my boots are faded blue", and from here '
      + 'nothing is named.',
  },
  {
    id: 'chorus-3',
    label: 'Final chorus',
    note: 'Round the world about twice more, unnamed, on one clock that eases '
      + 'in and out. It lands in Vancouver, Washington, two seconds into the '
      + 'last line, as a dot that pulses the way home did. The camera pulls '
      + 'straight back to the whole globe with the dot in the middle, and the end '
      + 'card cuts in on the guitar harmonic at 2:46. No line is drawn after the '
      + 'landing.',
  },
  {
    id: 'outro',
    label: 'Outro',
    note: 'The shared ending: the lockup on pure black, taking over from the '
      + 'globe with no transition, then a hard cut to the credits.',
  },
]

const NOTES = [
  'The map is the Earth: Natural Earth\'s coastline, public domain, baked into '
    + 'shared/video/geo/earth.mjs by tools/video-styles/geo.mjs. It is drawn on an '
    + 'orthographic globe at three levels of detail, and each landmass is clipped '
    + 'at the horizon and closed along the limb, so the far side of the world is '
    + 'not drawn.',
  'Every leg is timed off the score: a line\'s measured start, a place name\'s '
    + 'measured onset, or a section\'s boundaries. Retime the score and the film '
    + 'retimes itself.',
  'The camera rides the line by construction. A followed leg puts a camera key '
    + 'on each of its ends, eased with the same curve and on the same great '
    + 'circle as the red line, so the head stays in the middle of the frame and '
    + 'the world moves under it.',
  'The zoom is in the projection, not in a transform. The coast, the graticule, '
    + 'the red line and the type keep the same pen from a province to the whole '
    + 'world.',
  'The sheet is the album\'s: the globe is centred on the plate and scaled to '
    + 'its height inside the projection, not squeezed with a transform, and the '
    + 'lyric is timed by the same margin rule as every other film on the album.',
  'One function draws all of it: cartographyAlbumFrame(t). The same file renders '
    + 'this film sixty times a second, draws the snippet on /music-videos/album, '
    + 'and can be walked frame by frame under node to write an mp4.',
]
</script>
