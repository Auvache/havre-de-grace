<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-12">
      <header class="space-y-4">
        <p class="label-text muted-text">
          Unlisted / for review
        </p>
        <h1 class="display-heading">
          Meet Me at the Horizon — the mezzotint
        </h1>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          Three minutes forty of "Meet Me at the Horizon" as a mezzotint, track
          seven of ten in the
          <NuxtLink to="/music-videos/album" class="underline">album's</NuxtLink>
          printmaking. A mezzotint is made backwards: the plate is rocked until it
          prints solid black, and the picture is burnished out of the dark. The
          song is a night awake — a man alone in a bed that used to hold two, his
          thoughts running, the room turning on him, and the dawn he waits for all
          night. So the film opens on a black plate and burnishes a bedroom out of
          it, and the dawn comes in over the whole song. But anxiety re-rocks the
          plate: halfway through, the first dawn is swept back to black, and it has
          to be made again.
        </p>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          The only red is the horizon, where the dawn comes in and where the song
          asks to be met. Whoever "you" is, she is never inked, only left in the
          paper — a shape the dark leaves on the other pillow, harder to see the
          lighter the room gets. The film never says why she is gone. No video
          file anywhere: every frame is SVG drawn from the song's own clock and
          cut to a measured score, so things land where they are sung.
        </p>
      </header>

      <!-- ── The film ───────────────────────────────────────────────── -->
      <section class="space-y-5">
        <div
          ref="stage"
          class="relative isolate overflow-hidden rounded-[var(--radius-md)] border border-theme bg-black"
          :style="{ aspectRatio: '16 / 9' }"
        >
          <MusicVideoSvgFilm :film="mezzotintFrame" name="Mezzotint" :score="score" :t="frameTime" uid="film" />

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
                {{ player.time.value > 0.5 ? 'Resume' : 'Play 3:40' }}
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
          saw — "around 1:17 the black sweeps across before 'fever'" — since the
          song's seconds are the film's clock.
        </p>
      </section>

      <!-- ── What happens, section by section ───────────────────────── -->
      <section class="space-y-4">
        <h2 class="section-heading text-[1.35rem]">
          One night, from 3:07 to sunrise
        </h2>
        <p class="max-w-3xl text-sm leading-relaxed muted-text">
          One room, one window and what is outside it, reached by camera and never
          by a cut. Click a section to jump to it.
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
            <NuxtLink to="/music-videos/new-york" class="underline">/music-videos/new-york</NuxtLink>
            — track six, the letterpress, the track before this one.
          </li>
          <li>
            <NuxtLink to="/music-videos/ship-to-stockholm" class="underline">/music-videos/ship-to-stockholm</NuxtLink>
            — track nine, the wood engraving, the album's other night.
          </li>
          <li>
            <NuxtLink to="/music-videos/ivory" class="underline">/music-videos/ivory</NuxtLink>
            — track four, the etching, where she is left in the paper too.
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/*
 * /music-videos/meet-me-at-the-horizon — the whole song, as the album's
 * mezzotint (shared/video/films/mezzotint.mjs, app/config/albumStyle.ts).
 *
 * Unlisted and noindexed like everything under /music-videos: it restates a
 * published song's lyric in full and exists to be shared by link for a
 * decision. Shaped like /music-videos/ship-to-stockholm: the page owns the
 * projector and the furniture, MusicVideoSvgFilm runs the film, and
 * app/config/meetMeAtTheHorizonScore.ts is the cut.
 */
import { MEET_ME_AT_THE_HORIZON_SCORE, lineAt, sectionAt } from '~/config/meetMeAtTheHorizonScore'
import { useMusicVideoPlayer } from '~/composables/useMusicVideoPlayer'
import { mezzotintFrame } from '~~/shared/video/films/mezzotint.mjs'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Meet Me at the Horizon — the mezzotint',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const score = MEET_ME_AT_THE_HORIZON_SCORE

/* No analyser: the album's films are a function of the clock and nothing else. */
const player = useMusicVideoPlayer(score, { analyse: false })
const stage = useTemplateRef<HTMLElement>('stage')

/*
 * The poster frame: the title card under the first image — the bedroom
 * burnished out of the black round the bedside lamp, two pillows and one head,
 * the clock at 3:07 — the album's opening format, and what the film is at rest
 * before anyone presses play.
 */
const POSTER_AT = 13
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
    note: 'The plate is solid black, and the bedroom is burnished out of it round the bedside lamp: the window, the clock at 3:07, the bed with two pillows and one head on them. The album\'s title card underneath: 7/10, the title, the band in red.',
  },
  {
    id: 'verse-1',
    label: 'Awake',
    note: 'The camera settles on the empty pillow on "lover". On "thoughts" wisps rise off him up the wall and become sheep, walking to a fence; the first jumps, and on "no" they all stop, the jumper hanging in the air over the fence; on "sheep" they dissolve. He puts the lamp out on "light", and in the dark only his open eyes are left. He blinks on "sleep" and they open again.',
  },
  {
    id: 'verse-2',
    label: 'The sky',
    note: 'On "sky" the ceiling is burnished away into stars and a moon; on "wonder" the bed lifts off the floor and rises with him into them. On "afraid" the stars start to wheel, and by "end" they are long trails round the pole. On "repeat" it all runs backwards: the trails unwind, the bed comes down, the ceiling closes over, and the clock spins back to 3:07. Again, and again.',
  },
  {
    id: 'chorus-1',
    label: 'First dawn',
    note: 'The camera goes to the window. The sky over the pines starts to warm, the trees stretch on "yawn", and on "meets" the red horizon is drawn across the window. Back in the room it is still too dark to see — and on "you\'re" she is on the other pillow, turned towards him, only the shape the dark leaves.',
  },
  {
    id: 'verse-3',
    label: 'Fever',
    note: 'She is gone. His phone lights on the nightstand on "call"; he reaches for it and stops on "wait", and it goes out. On "Fever" the plate is re-rocked: a band of fresh burr sweeps across the frame and takes the dawn and the red line with it. Specks crawl over him on "skin"; the room breathes on the click through "tension"; the frame tilts while the headache "evolves", and rights itself on "straighten" as he sits bolt upright.',
  },
  {
    id: 'verse-4',
    label: 'The house',
    note: 'Ink floods down the frame on "blood". On "deep" the camera pulls back out of the room until it is a lit cutaway in a house on a hill under the moon, and the house creaks on "creak". Back in, the casements swing open on "open" and the wind comes through the room. On "I could be the sky" his dream self lifts out of him, floats to the window and out, and the camera follows it into the night.',
  },
  {
    id: 'chorus-2',
    label: 'Second dawn',
    note: 'He floats over the pines and the sleeping village as the dawn is burnished in a second time, and on "meets" the red horizon is drawn again, the whole width of the plate. On "you\'re" she is floating beside him.',
  },
  {
    id: 'hook-1',
    label: 'Meet me',
    note: 'On "Meet me at the horizon" she drifts away from him until she is a small figure standing on the red line. He reaches for her through the whole held "Oh". Then his dream self goes into the light and the camera is pulled back through the window into the room, where he has been lying awake all along.',
  },
  {
    id: 'verse-5',
    label: 'Alone',
    note: 'The same bed and the same words, but the window is open and the room is greyer now: the shaft of light from the window lies across the bed. The empty pillow on "alone". On "sliver" the rim of the sun shows at the end of the lane between the pines.',
  },
  {
    id: 'chorus-3',
    label: 'Sunrise',
    note: 'The sun comes up in the window and the room is burnished pale. He sits up on "except me". She is on the pillow once more on "miss", and there is too much light now to see her. On "so" he gets up, and goes and stands in the window.',
  },
  {
    id: 'hook-2',
    label: 'The horizon',
    note: 'He steps out of the window and walks down the lane between the pines towards the sun, and she is on the horizon, walking to him. The horizon comes to meet them: the pines go down behind it as it nears.',
  },
  {
    id: 'outro',
    label: 'Outro',
    note: 'The plate opens to the whole sheet. They meet on the red line and take each other\'s hand, the sun clears the horizon behind them, and the print is burnished nearly to paper while the camera eases back. The cut to the end card is the record\'s last strike.',
  },
]

const NOTES = [
  'The dawn is burnished twice. The first comes up through the first chorus and is swept away with the red line when the plate is re-rocked on "Fever"; the second comes up in the sky in the second chorus and holds, and the sun it brings up is the one they meet under.',
  'The world is one projection of planes at depth: the bedroom\'s back wall, the pines behind the house, a village, a ridge, the sky at infinity. That is what lets the camera pull back until the room is a window in a house, rise with the bed through the ceiling into the stars, float out through the window and travel down a lane to the horizon without a cut.',
  'The horizon is kept on the eye line, which is where a horizon is. So when it comes near at the end it is a hill exactly as high as the eye, and two people standing on it stand against the sky.',
  'She is drawn in the paper and nothing else, so she can only be seen where there is dark round her: on the pillow at night, against the dawn sky, on the horizon. In daylight in the last chorus there is nothing left to show her.',
  'The score was measured, not tapped in: the voice separated from the mix, the words placed by a speech model and then moved onto the vocal\'s own onsets. The band played to a click at 55 BPM, felt at 110; every repeat is a whole number of beats — the second and third choruses 50 and 98 beats after the first, the last verse 114 after the first, the second hook 48 after the first — so the choruses were solved once, on their pooled evidence.',
  'One function draws all of it: mezzotintFrame(t). The same file renders this page sixty times a second, draws the album still on /music-videos/album, and can be walked frame by frame under node to write an mp4.',
]
</script>
