<template>
  <div v-if="cache.supported.value" class="cache-bar">
    <div class="flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
      <p class="text-sm">
        <span v-if="busy" class="text-[var(--color-accent)]">
          caching {{ activeLabel }}…
        </span>
        <span v-else-if="allCached">
          <span class="text-[var(--color-accent)]">●</span>
          all {{ total }} on this device — plays with no network
        </span>
        <span v-else>
          {{ cache.cachedCount.value }} of {{ total }} on this device
        </span>
        <span v-if="cache.cachedBytes.value" class="muted-text">
          · {{ formatBytes(cache.cachedBytes.value) }}
        </span>
      </p>

      <div class="flex items-center gap-4">
        <button
          v-if="!allCached && !busy"
          type="button"
          class="nav-link text-sm hover:text-[var(--color-accent)]"
          @click="cache.downloadAll()"
        >
          cache all
        </button>
        <button
          v-if="cache.cachedCount.value"
          type="button"
          class="nav-link text-sm muted-text hover:text-[var(--color-accent)]"
          @click="cache.clear()"
        >
          clear
        </button>
      </div>
    </div>

    <!-- one bar for the file in flight, one for the shelf as a whole -->
    <div v-if="busy" class="cache-track mt-3">
      <span class="cache-fill" :style="{ width: `${(fileProgress * 100).toFixed(1)}%` }" />
    </div>

    <label class="mt-3 flex cursor-pointer items-center gap-2.5 text-sm">
      <input v-model="cache.autoCache.value" type="checkbox" class="cache-check">
      <span>
        keep offline copies
        <span class="muted-text">— downloads once, instant on every visit after</span>
      </span>
    </label>

    <p v-if="cache.lastError.value" class="mt-3 text-sm text-[var(--color-accent)]">
      {{ cache.lastError.value }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { formatBytes, type useDemoCache } from '~/composables/useDemoCache'

const props = defineProps<{
  cache: ReturnType<typeof useDemoCache>
  /** Every file the loaded playlists point at. */
  files: string[]
}>()

const cache = props.cache

const total = computed(() => props.files.length)
const allCached = computed(() => total.value > 0 && cache.cachedCount.value === total.value)
const busy = computed(() => Boolean(cache.downloading.value))

const activeLabel = computed(() => cache.downloading.value?.[0] ?? '')

const fileProgress = computed(() => {
  const entry = cache.downloading.value?.[1]
  return entry?.bytes ? entry.received / entry.bytes : 0
})
</script>

<style scoped>
.cache-bar {
  border: 1px solid var(--theme-border);
  border-radius: var(--radius-md);
  padding: 1rem 1.15rem;
}

.cache-track {
  height: 3px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--theme-text) 14%, transparent);
  overflow: hidden;
}

.cache-fill {
  display: block;
  height: 100%;
  background: var(--color-accent);
  transition: width 180ms linear;
}

.cache-check {
  width: 1rem;
  height: 1rem;
  accent-color: var(--color-accent);
}
</style>
