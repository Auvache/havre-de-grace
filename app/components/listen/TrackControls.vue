<template>
  <section class="track-controls" aria-label="Playback controls">
    <button
      type="button"
      class="control-button play-button"
      :class="{ 'is-playing': isPlaying }"
      :aria-label="isPlaying ? 'Lift the tonearm and stop the record' : 'Drop the needle and play the record'"
      @click="emit('toggle')"
    >
      <span class="control-icon" aria-hidden="true">{{ isPlaying ? '■' : '▶' }}</span>
      {{ isPlaying ? 'Stop' : 'Play' }}
    </button>

    <button
      type="button"
      class="control-button flip-button"
      :disabled="isFlipping"
      :aria-label="`Flip the record to side ${otherSideLabel}`"
      @click="emit('flip')"
    >
      <span class="control-icon" aria-hidden="true">⟳</span>
      Flip to {{ otherSideLabel }}
    </button>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  // True while the needle is down — the button acts as Stop.
  isPlaying: boolean
  side: 'a' | 'b'
  isFlipping: boolean
}>()

const emit = defineEmits<{
  toggle: []
  flip: []
}>()

const otherSideLabel = computed(() => (props.side === 'a' ? 'B' : 'A'))
</script>
