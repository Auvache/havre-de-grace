<template>
  <div class="space-y-4">
    <div class="flex items-center gap-4">
      <button
        type="button"
        class="interactive-lift flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[color:var(--color-accent)] text-white"
        :aria-label="playing ? 'Pause' : 'Play'"
        @click="emit('toggle')"
      >
        <svg v-if="!playing" aria-hidden="true" viewBox="0 0 24 24" class="h-5 w-5 translate-x-[1px]" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
        <svg v-else aria-hidden="true" viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
          <path d="M7 6h4v12H7zm6 0h4v12h-4z" />
        </svg>
      </button>

      <p class="w-24 shrink-0 font-mono text-xs muted-text">
        {{ clock(time) }} / {{ clock(duration) }}
      </p>

      <!--
        The scrub bar, with a tick at every section edge. Seeking is the main
        thing anyone does to a three-minute cut they are reviewing, so the
        sections are on the bar rather than hidden in a menu.
      -->
      <div
        ref="track"
        class="relative h-9 flex-1 cursor-pointer touch-none select-none"
        role="slider"
        tabindex="0"
        aria-label="Seek"
        :aria-valuemin="0"
        :aria-valuemax="Math.round(duration)"
        :aria-valuenow="Math.round(time)"
        :aria-valuetext="clock(time)"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @keydown="onKeydown"
      >
        <div class="absolute inset-x-0 top-4 h-[3px] rounded bg-white/15">
          <div
            class="h-full rounded bg-[color:var(--color-accent)]"
            :style="{ width: `${progress * 100}%` }"
          />
        </div>
        <div
          v-for="section in sections"
          :key="section.id"
          class="absolute top-2 h-[11px] w-[1px] bg-white/35"
          :style="{ left: `${(section.from / duration) * 100}%` }"
        />
        <div
          class="pointer-events-none absolute top-[9px] h-[9px] w-[9px] -translate-x-1/2 rounded-full bg-white"
          :style="{ left: `${progress * 100}%` }"
        />
      </div>

      <button
        type="button"
        class="label-text shrink-0 cursor-pointer text-[0.6rem]"
        :class="muted ? 'text-[color:var(--color-accent)]' : 'muted-text'"
        :aria-label="muted ? 'Unmute' : 'Mute'"
        @click="emit('update:muted', !muted)"
      >
        {{ muted ? 'Muted' : 'Sound' }}
      </button>

      <button
        type="button"
        class="label-text shrink-0 cursor-pointer text-[0.6rem] muted-text"
        aria-label="Full screen"
        @click="emit('fullscreen')"
      >
        Full
      </button>
    </div>

    <!-- Jump to any part of the arrangement. -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="section in sections"
        :key="section.id"
        type="button"
        class="label-text cursor-pointer rounded-full border px-3 py-1 text-[0.58rem] transition-colors duration-150"
        :class="section.id === current.id
          ? 'border-[color:var(--color-accent)] text-[color:var(--color-accent)]'
          : 'border-theme muted-text hover:text-[color:var(--theme-text)]'"
        @click="emit('seek', section.from + 0.01)"
      >
        {{ section.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/*
 * The controls under the film. A transport rather than a play button, because
 * what this page is for is watching one part of a cut over and over.
 */
import type { ScoreSection } from '~/config/andalusiaScore'

const props = defineProps<{
  time: number
  duration: number
  progress: number
  playing: boolean
  muted: boolean
  sections: readonly ScoreSection[]
  current: ScoreSection
}>()

const emit = defineEmits<{
  toggle: []
  seek: [seconds: number]
  'update:muted': [value: boolean]
  fullscreen: []
}>()

const track = useTemplateRef<HTMLElement>('track')
let scrubbing = false

const clock = (seconds: number): string => {
  const total = Math.max(0, seconds)
  return `${Math.floor(total / 60)}:${String(Math.floor(total % 60)).padStart(2, '0')}`
}

const seekFromEvent = (event: PointerEvent) => {
  const element = track.value
  if (!element) return
  const box = element.getBoundingClientRect()
  const ratio = (event.clientX - box.left) / box.width
  emit('seek', Math.min(Math.max(ratio, 0), 1) * props.duration)
}

const onPointerDown = (event: PointerEvent) => {
  scrubbing = true
  // Capture, so a drag that leaves the bar keeps scrubbing rather than sticking.
  // In a try: a synthetic event (or a pointer that has already gone) has no id
  // to capture, and losing the capture is not a reason to lose the seek.
  try {
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
  }
  catch {}
  seekFromEvent(event)
}
const onPointerMove = (event: PointerEvent) => {
  if (scrubbing) seekFromEvent(event)
}
const onPointerUp = () => {
  scrubbing = false
}

const onKeydown = (event: KeyboardEvent) => {
  const step = event.shiftKey ? 15 : 5
  if (event.key === 'ArrowRight') emit('seek', props.time + step)
  else if (event.key === 'ArrowLeft') emit('seek', props.time - step)
  else if (event.key === 'Home') emit('seek', 0)
  else return
  event.preventDefault()
}
</script>
