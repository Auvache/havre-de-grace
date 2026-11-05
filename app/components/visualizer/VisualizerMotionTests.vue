<template>
  <section class="space-y-5">
    <header class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
      <h2 class="section-heading text-[1.35rem]">
        {{ title }}
      </h2>
      <div class="flex gap-5" role="group" aria-label="Layout">
        <button
          v-for="mode in MODES"
          :key="mode.key"
          type="button"
          class="label-text cursor-pointer text-[0.6rem] transition-colors duration-150 hover:text-[color:var(--color-accent)]"
          :class="mode.key === layout ? 'text-[color:var(--color-accent)] underline underline-offset-4' : 'muted-text'"
          :aria-pressed="mode.key === layout"
          @click="layout = mode.key"
        >
          {{ mode.label }}
        </button>
      </div>
    </header>

    <!-- One clock for every test: they play together, looping the window. -->
    <div class="sticky top-14 z-30 flex items-center gap-4 rounded-[var(--radius-md)] border border-theme bg-[color:var(--theme-bg,#0d1117)]/90 px-3 py-2 backdrop-blur-sm">
      <button
        type="button"
        class="label-text flex shrink-0 cursor-pointer items-center gap-2 text-[0.62rem] hover:text-[color:var(--color-accent)]"
        :aria-label="player.playing.value ? 'Pause all' : 'Play all'"
        @click="toggle"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor">
          <path v-if="player.playing.value" d="M6 5h4v14H6zM14 5h4v14h-4z" />
          <path v-else d="M8 5v14l11-7z" />
        </svg>
        {{ player.playing.value ? 'Pause all' : 'Play all' }}
      </button>
      <input
        type="range"
        class="min-w-0 flex-1 cursor-pointer accent-[color:var(--color-accent)]"
        :min="span.from"
        :max="span.to"
        step="0.05"
        :value="shownTime"
        aria-label="Song time"
        @input="player.seek(Number(($event.target as HTMLInputElement).value))"
      >
      <span class="shrink-0 font-mono text-xs muted-text">{{ clock(shownTime) }} / {{ clock(span.to) }}</span>
      <button
        type="button"
        class="label-text shrink-0 cursor-pointer text-[0.6rem] hover:text-[color:var(--color-accent)]"
        @click="player.muted.value = !player.muted.value"
      >
        {{ player.muted.value ? 'Sound off' : 'Sound on' }}
      </button>
    </div>

    <div :class="layout === 'side' ? 'relative left-1/2 grid w-[96vw] max-w-[1800px] -translate-x-1/2 gap-x-3 gap-y-5 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-10'">
      <figure v-for="test in tests" :key="test.key" class="min-w-0 space-y-2">
        <div class="relative isolate overflow-hidden rounded-[var(--radius-md)] border border-theme bg-black" :style="{ aspectRatio: '16 / 9' }">
          <MusicVideoSvgFilm :film="test.film" :name="test.label" :score="score" :t="shownTime" :uid="`mt-${test.key}`" />
        </div>
        <figcaption class="label-text text-[0.6rem] muted-text">
          {{ test.label }}
        </figcaption>
      </figure>
    </div>
  </section>
</template>

<script setup lang="ts">
/*
 * Motion tests under a film, all on one clock: one record playing, every test
 * drawn at its time, looping a window of the song. Shown one by one (scroll
 * down them) or side by side (the page's full width). What each one is lives
 * in docs/visualizers/<song>.md. Gone once one is picked.
 */
import { useMusicVideoPlayer } from '~/composables/useMusicVideoPlayer'

type FrameFn = (options: { time: number, score: any, lockup: string, uid: string }) => { svg: string, label: string, lib?: string[] }

const props = withDefaults(defineProps<{
  title: string
  tests: { key: string, label: string, film: FrameFn }[]
  score: any
  /** Song seconds the tests cover; play starts at `from` and loops at `to`. */
  span: { from: number, to: number }
  /** Shown before anything is played. */
  posterAt?: number
}>(), { posterAt: undefined })

const MODES = [{ key: 'one', label: 'One by one' }, { key: 'side', label: 'Side by side' }] as const
const layout = ref<'one' | 'side'>('one')

const player = useMusicVideoPlayer(props.score, { analyse: false })
const inWindow = (t: number) => t >= props.span.from && t < props.span.to
const shownTime = computed(() => (inWindow(player.time.value) ? player.time.value : props.posterAt ?? props.span.from))

const toggle = () => {
  if (!player.playing.value && !inWindow(player.time.value)) player.seek(props.span.from)
  player.toggle()
}
/* Loop the window. */
watch(() => player.time.value, (t) => {
  if (player.playing.value && t >= props.span.to) player.seek(props.span.from)
})

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
</script>
