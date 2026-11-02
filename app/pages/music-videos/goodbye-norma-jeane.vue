<template>
  <div class="page-container section-space">
    <div class="mx-auto max-w-5xl space-y-10">
      <header class="space-y-4">
        <p class="label-text muted-text">
          Unlisted / motion test
        </p>
        <h1 class="display-heading">
          Goodbye, Norma Jeane — the marquee
        </h1>
        <p class="max-w-3xl text-base leading-relaxed muted-text">
          One picture-house letter board for the whole song. It starts empty
          and dark, turns over into NORMA JEANE as the voice comes in, then
          flips through all twenty-nine of her films in release order, one
          landing every three bars, and spins down to nothing after
          <em>Something's Got to Give</em>. Her name is never spelled, but
          three times it shows through the scramble in red.
        </p>
      </header>

      <section class="space-y-5">
        <div
          ref="stage"
          class="relative isolate overflow-hidden rounded-[var(--radius-md)] border border-theme bg-black"
          :style="{ aspectRatio: '16 / 9' }"
        >
          <MusicVideoSvgFilm :film="marqueeFrame" name="Marquee" :score="score" :t="frameTime" uid="marquee" />

          <button
            v-if="!player.playing.value"
            type="button"
            class="absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-black/10 transition-colors duration-200 hover:bg-black/0"
            :aria-label="loop ? 'Play the 15-second test' : 'Play the film'"
            @click="start"
          >
            <span class="flex items-center gap-3 rounded-full bg-black/55 px-6 py-3 text-white backdrop-blur-sm">
              <svg aria-hidden="true" viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span class="label-text text-[0.62rem]">
                {{ loop ? 'Play the 15-second test' : player.time.value > 0.5 ? 'Resume' : 'Play 4:41' }}
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
            Loop the test, {{ stamp(TEST.from) }}–{{ stamp(TEST.to) }}
          </label>
          <span class="muted-text">Now: {{ stamp(player.time.value) }} · {{ currentSection.label }}</span>
        </div>

        <p class="text-sm leading-relaxed muted-text">
          Space plays and pauses, the arrow keys jump five seconds (hold shift
          for fifteen), <kbd>M</kbd> mutes and <kbd>F</kbd> fills the screen.
          Untick the loop to play the whole song. A note with a time is the
          most useful kind — "at 1:19 the clue goes by too fast".
        </p>
      </section>

      <section class="space-y-4">
        <h2 class="section-heading">
          What to look at in the test
        </h2>
        <ul class="max-w-3xl list-disc space-y-2 pl-5 text-sm leading-relaxed muted-text">
          <li><strong>1:14.0</strong> — <em>The Fireball</em> lands on the downbeat. The bulbs flash, the red letters come in as it lands.</li>
          <li><strong>1:14–1:17.8</strong> — the hold. Single tiles twitch half a flip on the beat.</li>
          <li><strong>1:17.8</strong> — the scramble, rippling left to right.</li>
          <li><strong>1:19.3</strong> — the first clue: M, Y and O in red, in her places, for a beat and a half.</li>
          <li><strong>1:21.5</strong> — <em>All About Eve</em> lands.</li>
          <li><strong>1:25.3</strong> — the scramble toward <em>Right Cross</em> starts.</li>
        </ul>
      </section>

      <section class="space-y-4">
        <h2 class="section-heading">
          Jump to
        </h2>
        <div class="flex flex-wrap gap-2 text-sm">
          <button v-for="m in JUMPS" :key="m.label" type="button" class="rounded-full border border-theme px-3 py-1 hover:bg-black/5" @click="jump(m.at)">
            {{ stamp(m.at) }} · {{ m.label }}
          </button>
        </div>
        <details class="text-sm">
          <summary class="cursor-pointer muted-text">
            Every landing
          </summary>
          <ol class="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2">
            <li v-for="(f, i) in moments.titles" :key="f.at">
              <button type="button" class="text-left hover:underline" @click="jump(f.at - 1)">
                <span class="tabular-nums muted-text">{{ stamp(f.at) }}</span> &nbsp;{{ i + 1 }}. {{ f.title }}
              </button>
            </li>
          </ol>
        </details>
      </section>

      <p class="text-sm leading-relaxed muted-text">
        <NuxtLink to="/music-videos/ideas#goodbye-norma-jeane" class="underline">← All the ideas</NuxtLink>
        · The earlier printmaking film is at
        <NuxtLink to="/music-videos/goodbye-norma-jeane-print" class="underline">/music-videos/goodbye-norma-jeane-print</NuxtLink>.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/*
 * /music-videos/goodbye-norma-jeane — the Goodbye, Norma Jeane marquee, as a motion test.
 *
 * Unlisted and noindexed like everything under /music-videos. The film is
 * shared/video/films/marquee.mjs; the page owns the projector, loops the
 * 15-second test window by default, and unloops to play the whole song.
 */
import { GOODBYE_NORMA_JEANE_SCORE, sectionAt } from '~/config/goodbyeNormaJeaneScore'
import { useMusicVideoPlayer } from '~/composables/useMusicVideoPlayer'
import { marqueeFrame, marqueeMoments } from '~~/shared/video/films/marquee.mjs'

definePageMeta({ layout: 'default' })

useHead({
  title: 'Goodbye, Norma Jeane — the marquee',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const score = GOODBYE_NORMA_JEANE_SCORE
const player = useMusicVideoPlayer(score, { analyse: false })
const stage = useTemplateRef<HTMLElement>('stage')
const moments = marqueeMoments(score)

/* The test: verse 2, The Fireball landing, the first clue, All About Eve. */
const TEST = { from: 72.5, to: 87.5 }
const loop = ref(true)

/* At rest before anyone presses play: the first frame of the test. */
const frameTime = computed(() =>
  !player.playing.value && player.time.value < 0.05 ? TEST.from + 7.4 : player.time.value,
)

watch(() => player.time.value, (t) => {
  if (loop.value && player.playing.value && (t >= TEST.to || t < TEST.from - 0.5)) player.seek(TEST.from)
})

const start = () => {
  if (loop.value && (player.time.value < TEST.from || player.time.value >= TEST.to)) player.seek(TEST.from)
  player.toggle()
}

const jump = (at: number) => {
  loop.value = false
  player.seek(Math.max(0, at))
  if (!player.playing.value) player.toggle()
}

const JUMPS = [
  { at: 0, label: 'Empty marquee' },
  { at: moments.nj - 3, label: 'Into NORMA JEANE' },
  ...moments.clues.map((at, i) => ({ at: at - 2, label: `Clue ${i + 1} (${[3, 6, 9][i]} letters)` })),
  { at: 217.96 - 2, label: 'Last chorus' },
  { at: moments.sgtg - 4, label: "Something's Got to Give" },
  { at: moments.last - 8, label: 'The last letters' },
]

const currentSection = computed(() => sectionAt(player.time.value))

const stamp = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${(seconds % 60).toFixed(1).padStart(4, '0')}`

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
      start()
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
