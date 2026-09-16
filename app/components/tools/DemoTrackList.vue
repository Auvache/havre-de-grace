<template>
  <div>
    <div class="flex flex-wrap items-baseline justify-between gap-3">
      <h2 class="list-heading">
        {{ player.playlist.value?.name ?? 'tracks' }}
      </h2>

      <button
        v-if="player.isReordered.value"
        type="button"
        class="nav-link text-sm muted-text hover:text-[var(--color-accent)]"
        @click="player.resetOrder()"
      >
        reset order
      </button>
    </div>

    <p v-if="player.playlist.value?.note" class="mt-2 text-sm muted-text">
      {{ player.playlist.value.note }}
    </p>

    <ol class="mt-6 divide-y divide-[color:var(--theme-border)] border-y border-theme">
      <li
        v-for="(entry, slot) in player.orderedTracks.value"
        :key="entry.track.file"
        class="demo-row"
        :class="{ 'is-current': entry.index === player.trackIndex.value }"
      >
        <button
          type="button"
          class="demo-row-main"
          :aria-label="`Play ${entry.track.title}`"
          @click="onSelect(entry.index)"
        >
          <span class="demo-row-index" aria-hidden="true">
            <svg
              v-if="entry.index === player.trackIndex.value && player.playing.value"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5h3v14H8zM13 5h3v14h-3z" />
            </svg>
            <svg
              v-else-if="entry.index === player.trackIndex.value"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5.6v12.8a.8.8 0 0 0 1.23.67l9.9-6.4a.8.8 0 0 0 0-1.34l-9.9-6.4A.8.8 0 0 0 8 5.6Z" />
            </svg>
            <span v-else>{{ slot + 1 }}</span>
          </span>

          <span class="min-w-0 flex-1">
            <span class="block truncate text-[0.95rem] leading-snug">{{ entry.track.title }}</span>
            <span class="mt-0.5 block truncate text-xs muted-text">
              {{ entry.track.note ? `${entry.track.note} · ` : '' }}{{ entry.track.file }}
            </span>
          </span>

          <!--
            Where this take is coming from. A filled dot means it is on this
            device and will start with no network at all; an outline means it
            still has to be streamed.
          -->
          <span
            v-if="cache?.supported.value"
            class="cache-dot"
            :class="`is-${cache.entry(entry.track.file).status}`"
            :title="DOT_TITLE[cache.entry(entry.track.file).status]"
          />
        </button>

        <!--
          Buttons rather than drag and drop. The order only has to survive the
          session, and two taps that work identically on a phone beat a pointer
          gesture that does not work on one at all.
        -->
        <span class="flex shrink-0 items-center gap-0.5 pr-1">
          <button
            type="button"
            class="demo-move"
            :aria-label="`Move ${entry.track.title} up`"
            :disabled="slot === 0"
            @click="player.move(slot, slot - 1)"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m6 14 6-6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            class="demo-move"
            :aria-label="`Move ${entry.track.title} down`"
            :disabled="slot === player.orderedTracks.value.length - 1"
            @click="player.move(slot, slot + 1)"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m6 10 6 6 6-6" />
            </svg>
          </button>
        </span>
      </li>
    </ol>

    <p v-if="!player.orderedTracks.value.length" class="mt-6 text-sm muted-text">
      This playlist has no tracks.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { DemoPlayerApi } from '~/composables/useDemoPlayer'
import type { CacheStatus, useDemoCache } from '~/composables/useDemoCache'

const props = defineProps<{
  player: DemoPlayerApi
  cache?: ReturnType<typeof useDemoCache>
}>()

const player = props.player
const cache = props.cache

const DOT_TITLE: Record<CacheStatus, string> = {
  unknown: 'Checking…',
  missing: 'Streams from the network',
  downloading: 'Downloading to this device',
  ready: 'Stored on this device',
  error: 'Could not be cached',
}

/** Clicking the track that is already playing pauses it, the way a row should. */
const onSelect = (index: number) => {
  if (index === player.trackIndex.value) {
    player.toggle()
    return
  }
  player.select(index, { autoplay: true })
}
</script>

<style scoped>
/*
 * `.section-heading` at the subheading size, spelled out rather than composed.
 * main.css declares its utilities after `@tailwind utilities`, so a Tailwind
 * `text-[length:…]` alongside it loses on source order and the heading comes
 * out at full display size.
 */
.list-heading {
  font-size: var(--font-size-subheading);
  font-weight: 450;
  letter-spacing: 0.04em;
  line-height: 1.1;
  text-transform: uppercase;
}

.demo-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color var(--dur-fast) var(--ease-standard);
}

.demo-row:hover {
  background: color-mix(in srgb, var(--theme-text) 4%, transparent);
}

.demo-row.is-current {
  background: color-mix(in srgb, var(--color-accent) 10%, transparent);
}

.demo-row-main {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
  padding: 0.85rem 0.5rem 0.85rem 0.9rem;
  text-align: left;
}

.demo-row-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  flex-shrink: 0;
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
  color: var(--theme-muted);
}

.demo-row.is-current .demo-row-index {
  color: var(--color-accent);
}

.demo-row-index svg {
  width: 0.95rem;
  height: 0.95rem;
}

.cache-dot {
  width: 0.45rem;
  height: 0.45rem;
  flex-shrink: 0;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--theme-muted) 60%, transparent);
}

.cache-dot.is-ready {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.cache-dot.is-downloading {
  background: color-mix(in srgb, var(--color-accent) 50%, transparent);
  border-color: var(--color-accent);
  animation: cache-pulse 1.1s var(--ease-standard) infinite;
}

.cache-dot.is-error {
  border-color: color-mix(in srgb, var(--color-accent) 70%, transparent);
  background: transparent;
}

@keyframes cache-pulse {
  50% { opacity: 0.35; }
}

@media (prefers-reduced-motion: reduce) {
  .cache-dot.is-downloading {
    animation: none;
  }
}

.demo-move {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-sm);
  color: var(--theme-muted);
  transition:
    color var(--dur-fast) var(--ease-standard),
    background-color var(--dur-fast) var(--ease-standard);
}

.demo-move svg {
  width: 1rem;
  height: 1rem;
}

.demo-move:hover:not(:disabled) {
  color: var(--theme-text);
  background: color-mix(in srgb, var(--theme-text) 8%, transparent);
}

.demo-move:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}
</style>
