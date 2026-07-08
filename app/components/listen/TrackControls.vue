<template>
  <section class="track-controls" data-no-pan aria-label="Track controls">
    <button
      type="button"
      class="track-button"
      :aria-pressed="currentTrack === 0 ? 'true' : 'false'"
      aria-label="Move tonearm off the record"
      @click="emit('select', 0)"
    >
      Off
    </button>
    <button
      v-for="track in tracks"
      :key="track.slug"
      type="button"
      class="track-button"
      :aria-pressed="currentTrack === track.sideNumber ? 'true' : 'false'"
      :aria-label="`Move tonearm to side ${sideLabel} track ${track.sideNumber}: ${track.title}`"
      @click="emit('select', track.sideNumber)"
    >
      {{ sideLabel }}{{ track.sideNumber }}
    </button>

    <button
      type="button"
      class="flip-button"
      :disabled="isFlipping"
      :aria-label="`Flip the record to side ${otherSideLabel}`"
      @click="emit('flip')"
    >
      ⟳ Flip to {{ otherSideLabel }}
    </button>
  </section>
</template>

<script setup lang="ts">
import type { ListenTrack } from '~~/shared/types'

const props = defineProps<{
  tracks: ListenTrack[]
  currentTrack: number
  side: 'a' | 'b'
  isFlipping: boolean
}>()

const emit = defineEmits<{
  select: [trackNumber: number]
  flip: []
}>()

const sideLabel = computed(() => props.side.toUpperCase())
const otherSideLabel = computed(() => (props.side === 'a' ? 'B' : 'A'))
</script>
