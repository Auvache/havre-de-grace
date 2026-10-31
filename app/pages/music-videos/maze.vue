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
          A red dot finding its way out of one maze after another, each one
          grown round the last. It panics in the third through the horns, then
          stops, breathes and takes the clean way out as the last chorus
          starts, and the camera pulls back to show it was all the middle of
          a maze too big to see the edge of.
        </p>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          This is a motion test, so judge the movement, not the finish: the
          dot's breathing pulse, the scramble in the horns, the stop at verse 3,
          and whether the zooms read as one move or a slideshow.
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
      </section>

      <section class="space-y-4">
        <h2 class="section-heading text-[1.35rem]">
          Jump to
        </h2>
        <p class="max-w-3xl text-sm leading-relaxed muted-text">
          Tap a moment to start the film there. The one to watch first is the
          panic into the calm. When something is off, the most useful note is a
          time and what you saw: "at 2:31 the stop feels too sudden".
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
    </div>
  </div>
</template>

<script setup lang="ts">
/*
 * /music-videos/maze — the motion test for Into the Wild's maze
 * (shared/video/films/maze.mjs), the whole song with a projector, opening on
 * the horns. Unlisted and noindexed like everything under /music-videos.
 */
import { INTO_THE_WILD_SCORE, sectionAt } from '~/config/intoTheWildScore'
import { useMusicVideoPlayer } from '~/composables/useMusicVideoPlayer'
import { mazeFrame } from '~~/shared/video/films/maze.mjs'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Into the Wild — the maze',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const score = INTO_THE_WILD_SCORE
const player = useMusicVideoPlayer(score, { analyse: false })
const stage = useTemplateRef<HTMLElement>('stage')

/* At rest, before anyone presses play: the scramble in the third maze. */
const POSTER_AT = 135
const frameTime = computed(() =>
  !player.playing.value && player.time.value < 0.05 ? POSTER_AT : player.time.value,
)
const currentSection = computed(() => sectionAt(player.time.value))

const BEATS = [
  { at: 108, label: 'Panic → calm', note: 'The third maze, through the horns: the scramble and the racing pulse, the stop at verse 3, the deep breaths, and the clean way out. About 80 seconds.', key: true },
  { at: 0, label: 'The way in', note: 'Blank paper, the line from the left, the first maze drawn round it.' },
  { at: 44, label: 'First way out', note: 'Out on "running", and the second maze grows round the first while the camera pulls back.' },
  { at: 96, label: 'Into the third', note: 'Out of the second on the chorus, into the big one.' },
  { at: 178, label: 'The pull back', note: 'The door on the last chorus, and the zoom out to the maze with no edge.' },
]

const jump = (at: number) => {
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
