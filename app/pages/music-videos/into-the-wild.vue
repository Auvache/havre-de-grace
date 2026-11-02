<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-10">
      <header class="space-y-4">
        <p class="label-text muted-text">
          Unlisted / motion test
        </p>
        <h1 class="display-heading">
          Into the Wild — the maze
        </h1>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          The mark drawn on, the title drawn on, then blank paper. A red dot
          comes in from the left and the first maze is drawn round it; its only
          way out goes all the way round, anticlockwise. The dot walks the way
          somebody walks a maze: it looks down each corridor, won't take one it
          can see is a dead end or leads back where it has been, goes straight
          for a door it can see, and stops when it is stumped. At each door it
          stands still while the next maze is drawn round it, then goes on. Its
          line fades out behind it.
        </p>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          It gains confidence through the first maze and keeps it through the
          first chorus, then loses it slowly to nothing by the end of verse 2.
          When the horns come in it melts down: stops and pulses harder and
          harder, then on the loudest hit races every way, old ground and dead
          ends and all. Late in the horns it comes round, slowing, and stops on
          the harmonic as they drop away; its breathing slows, and on "headed"
          it sets out carefully, growing sure of itself. In the last pull back
          the camera never stops: every maze was the middle of a bigger one,
          and all of them the band's anchor, the dot in its stock. On the last
          note, the mark.
        </p>
      </header>

      <section class="space-y-5">
        <div
          ref="stage"
          class="relative isolate overflow-hidden rounded-[var(--radius-md)] border border-theme bg-black"
          :style="{ aspectRatio: '16 / 9' }"
        >
          <MusicVideoSvgFilm :film="mazeFrame" name="The Maze" :score="score" :t="frameTime" uid="film" />

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
                {{ player.time.value > 0.5 ? 'Resume' : 'Play' }}
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

        <div class="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <label class="flex cursor-pointer items-center gap-2">
            <input v-model="loop" type="checkbox">
            Loop the test, {{ clock(TEST.from) }}–{{ clock(TEST.to) }}
          </label>
          <span class="muted-text">Now: {{ clock(player.time.value) }} · {{ currentSection.label }} · {{ moodAt(player.time.value) }}</span>
        </div>
      </section>

      <section class="space-y-4">
        <h2 class="section-heading text-[1.35rem]">
          Jump to
        </h2>
        <p class="max-w-3xl text-sm leading-relaxed muted-text">
          Tap a moment to start the film there. When something is off, the most
          useful note is a time and what you saw: "at 0:41 it charges past a
          way out it should have seen".
        </p>
        <ol class="divide-y divide-[color:var(--theme-border)] border-y border-theme">
          <li v-for="beat in BEATS" :key="beat.at">
            <button
              type="button"
              class="flex w-full cursor-pointer items-baseline gap-4 py-3 text-left transition-colors duration-150 hover:text-[color:var(--color-accent)]"
              @click="jump(beat.at)"
            >
              <span class="w-12 shrink-0 font-mono text-xs muted-text">{{ clock(beat.at) }}</span>
              <span class="min-w-0 flex-1 text-sm leading-relaxed">
                <span class="label-text mr-2 text-[0.55rem]" :class="beat.key ? 'text-[color:var(--color-accent)]' : ''">{{ beat.label }}</span>
                <span class="muted-text">{{ beat.note }}</span>
              </span>
            </button>
          </li>
        </ol>
      </section>

      <p class="text-sm leading-relaxed muted-text">
        The stills this came from, and the Off the Grid versions before it, are on
        <NuxtLink to="/music-videos/off-the-grid" class="underline">/music-videos/off-the-grid</NuxtLink>.
      </p>

      <p class="text-sm leading-relaxed muted-text">
        <NuxtLink to="/music-videos/ideas#into-the-wild" class="underline">← All the ideas</NuxtLink>
        · The earlier printmaking film is at
        <NuxtLink to="/music-videos/into-the-wild-print" class="underline">/music-videos/into-the-wild-print</NuxtLink>.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/*
 * /music-videos/into-the-wild — the maze, the motion test for Into the Wild's maze
 * (shared/video/films/maze.mjs), the whole song with a projector, opening on
 * the horns. Unlisted and noindexed like everything under /music-videos.
 */
import { INTO_THE_WILD_SCORE, sectionAt } from '~/config/intoTheWildScore'
import { useMusicVideoPlayer } from '~/composables/useMusicVideoPlayer'
import { mazeFrame, moodAt } from '~~/shared/video/films/maze.mjs'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Into the Wild — the maze',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const score = INTO_THE_WILD_SCORE
const player = useMusicVideoPlayer(score, { analyse: false })
const stage = useTemplateRef<HTMLElement>('stage')

/* At rest, before anyone presses play: the second maze, sure of himself. */
const POSTER_AT = 26

/* The first minute on a loop, if ticked. */
const TEST = { from: 0, to: 60 }
const loop = ref(false)
watch(() => player.time.value, (t) => {
  if (loop.value && player.playing.value && t >= TEST.to) player.seek(TEST.from)
})
const frameTime = computed(() =>
  !player.playing.value && player.time.value < 0.05 ? POSTER_AT : player.time.value,
)
const currentSection = computed(() => sectionAt(player.time.value))

const BEATS = [
  { at: 0, label: 'Opening', note: 'The mark drawn on, then the title, then the black lifts off the paper.' },
  { at: 11, label: 'The way in', note: 'In from the left; once his line has faded the first maze is drawn round him, and on "To see if I can\'t lose my way" he sets off, all the way round it.' },
  { at: 29, label: 'A door', note: 'He stops in the doorway while the second maze is drawn round him, then goes on, sure of himself.' },
  { at: 58, label: 'Losing it', note: 'From the break to the end of verse 2 he slows, hesitates longer at forks, and stops longer when stumped.' },
  { at: 108, label: 'Meltdown', note: 'The horns (1:51): he stops and pulses harder and harder; on the big hit at 1:56 he sprints all over, never the same way three times, turning back only at walls.', key: true },
  { at: 141, label: 'Coming round', note: 'From 2:24 he slows, and stops dead on the harmonic at 2:28; his breathing slows.', key: true },
  { at: 150, label: 'Sets out', note: 'On "headed" (2:32.5) he sets out carefully; a few wrong turns he puts right, and out through the door as the last chorus comes in (3:04.7).' },
  { at: 190, label: 'The anchor', note: 'One steady pull back from 3:13: the maze he is in, then all of it, the band’s anchor made of maze, held from 3:22.3, and the mark on the last note (3:23.8).', key: true },
]

const jump = (at: number) => {
  if (at >= TEST.to) loop.value = false
  player.seek(at)
  if (!player.playing.value) player.toggle()
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

const toggleFullscreen = () => {
  const element = stage.value
  if (!element) return
  if (document.fullscreenElement) void document.exitFullscreen()
  else void element.requestFullscreen?.()
}

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
</script>
