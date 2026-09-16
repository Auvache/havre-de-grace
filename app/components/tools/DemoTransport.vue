<template>
  <div class="surface-card p-5 sm:p-6">
    <!-- now playing -->
    <div class="flex min-h-[3.25rem] items-start justify-between gap-4">
      <div class="min-w-0">
        <p class="label-text muted-text text-[0.62rem]">
          {{ player.playlist.value?.name ?? 'demos' }}
        </p>
        <p class="mt-1.5 truncate text-lg font-medium leading-snug">
          {{ player.track.value?.title ?? 'nothing cued' }}
        </p>
        <p
          v-if="player.track.value?.note"
          class="mt-0.5 truncate text-sm muted-text"
        >
          {{ player.track.value.note }}
        </p>
      </div>

      <span
        v-if="player.stalled.value"
        class="label-text shrink-0 pt-1 text-[0.62rem] text-[var(--color-accent)]"
      >
        buffering
      </span>
    </div>

    <!-- scrubber -->
    <div class="mt-5">
      <input
        type="range"
        class="demo-scrub"
        min="0"
        max="1000"
        step="1"
        :value="scrubValue"
        :disabled="!player.duration.value"
        :aria-label="`Seek within ${player.track.value?.title ?? 'track'}`"
        :style="{ '--played': `${(player.progress.value * 100).toFixed(2)}%` }"
        @input="onScrub"
      >
      <div class="mt-1.5 flex justify-between text-xs tabular-nums muted-text">
        <span>{{ formatTime(player.currentTime.value) }}</span>
        <span>{{ formatTime(player.duration.value) }}</span>
      </div>
    </div>

    <!-- transport -->
    <div class="mt-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="transport-button"
          aria-label="Previous track"
          :disabled="!canPrevious"
          @click="player.previous()"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M7 5.5h2v13H7z" />
            <path d="M18.5 6.4v11.2a.8.8 0 0 1-1.22.68l-8.6-5.6a.8.8 0 0 1 0-1.36l8.6-5.6a.8.8 0 0 1 1.22.68Z" />
          </svg>
        </button>

        <button
          type="button"
          class="transport-button is-primary"
          :aria-label="player.playing.value ? 'Pause' : 'Play'"
          :disabled="!player.orderedTracks.value.length"
          @click="player.toggle()"
        >
          <svg v-if="player.playing.value" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M8 5h3v14H8zM13 5h3v14h-3z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M8 5.6v12.8a.8.8 0 0 0 1.23.67l9.9-6.4a.8.8 0 0 0 0-1.34l-9.9-6.4A.8.8 0 0 0 8 5.6Z" />
          </svg>
        </button>

        <button
          type="button"
          class="transport-button"
          aria-label="Next track"
          :disabled="!canNext"
          @click="player.next()"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M15 5.5h2v13h-2z" />
            <path d="M5.5 6.4v11.2a.8.8 0 0 0 1.22.68l8.6-5.6a.8.8 0 0 0 0-1.36l-8.6-5.6A.8.8 0 0 0 5.5 6.4Z" />
          </svg>
        </button>
      </div>

      <label class="flex flex-1 items-center gap-3 sm:max-w-[13rem]">
        <span class="label-text muted-text text-[0.62rem]">vol</span>
        <input
          v-model.number="player.volume.value"
          type="range"
          class="demo-scrub is-slim"
          min="0"
          max="1"
          step="0.01"
          aria-label="Volume"
          :style="{ '--played': `${(player.volume.value * 100).toFixed(0)}%` }"
        >
      </label>
    </div>

    <!-- the two things that make comparison fast -->
    <div class="mt-5 flex flex-wrap gap-x-6 gap-y-3 border-t border-theme pt-4">
      <label class="flex cursor-pointer items-center gap-2.5 text-sm">
        <input v-model="player.matchPosition.value" type="checkbox" class="demo-check">
        <span>
          keep playhead
          <span class="muted-text">— switch takes at the same point</span>
        </span>
      </label>

      <label class="flex cursor-pointer items-center gap-2.5 text-sm">
        <input v-model="player.preloadNeighbours.value" type="checkbox" class="demo-check">
        <span>
          preload neighbours
          <span class="muted-text">— faster, more data</span>
        </span>
      </label>
    </div>

    <p v-if="player.error.value" class="mt-4 text-sm text-[var(--color-accent)]">
      {{ player.error.value }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { formatTime, type DemoPlayerApi } from '~/composables/useDemoPlayer'

const props = defineProps<{ player: DemoPlayerApi }>()

// The parent never swaps players, and everything inside the object is already a
// ref, so holding the object itself is enough.
const player = props.player

const scrubValue = computed(() => Math.round(player.progress.value * 1000))

const canPrevious = computed(() => player.position.value > 0 || player.currentTime.value > 2.5)
const canNext = computed(() =>
  player.position.value >= 0 && player.position.value < player.orderedTracks.value.length - 1,
)

const onScrub = (event: Event) => {
  const target = event.target as HTMLInputElement
  player.seekToProgress(Number(target.value) / 1000)
}
</script>

<style scoped>
.transport-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--theme-border);
  border-radius: 999px;
  color: var(--theme-text);
  transition:
    border-color var(--dur-fast) var(--ease-standard),
    color var(--dur-fast) var(--ease-standard),
    background-color var(--dur-fast) var(--ease-standard),
    transform var(--dur-fast) var(--ease-standard);
}

.transport-button svg {
  width: 1.15rem;
  height: 1.15rem;
}

.transport-button.is-primary {
  width: 3.4rem;
  height: 3.4rem;
  background: var(--color-accent);
  border-color: transparent;
  color: #fff;
}

.transport-button.is-primary svg {
  width: 1.45rem;
  height: 1.45rem;
}

.transport-button:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.transport-button.is-primary:hover:not(:disabled) {
  color: #fff;
  transform: scale(1.04);
}

.transport-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* One track, filled to `--played`, rather than a browser-default slider. */
.demo-scrub {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 1.25rem;
  background: transparent;
  cursor: pointer;
}

.demo-scrub::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 999px;
  background:
    linear-gradient(to right, var(--color-accent) var(--played, 0%), transparent var(--played, 0%)),
    color-mix(in srgb, var(--theme-text) 16%, transparent);
}

.demo-scrub::-moz-range-track {
  height: 4px;
  border-radius: 999px;
  background:
    linear-gradient(to right, var(--color-accent) var(--played, 0%), transparent var(--played, 0%)),
    color-mix(in srgb, var(--theme-text) 16%, transparent);
}

.demo-scrub::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  margin-top: -5px;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  background: var(--color-accent);
  border: 2px solid var(--theme-bg);
}

.demo-scrub::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: 2px solid var(--theme-bg);
  border-radius: 999px;
  background: var(--color-accent);
}

.demo-scrub.is-slim {
  height: 1rem;
}

.demo-scrub:disabled {
  opacity: 0.4;
  cursor: default;
}

.demo-check {
  width: 1rem;
  height: 1rem;
  accent-color: var(--color-accent);
}
</style>
