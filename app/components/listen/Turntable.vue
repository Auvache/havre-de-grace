<template>
  <section ref="turntableEl" class="turntable" aria-label="Record player">
    <div class="power-light" aria-hidden="true" />
    <div class="speed-slot" aria-hidden="true" />
    <div class="rest-post" aria-hidden="true" />

    <div
      ref="recordWrapEl"
      class="record-wrap"
      role="button"
      tabindex="0"
      aria-label="Record grooves. Click a groove to choose a track."
      @pointerdown="emit('record-pointerdown', $event)"
      @keydown="emit('record-keydown', $event)"
    >
      <div class="record-flip" :class="{ flipped }">
        <div class="record" :style="{ transform: `rotate(${rotationDeg}deg)` }">
          <div class="groove-zone-hint" aria-hidden="true" />
          <div class="record-label" aria-hidden="true">
            <span class="record-spindle" />
          </div>
        </div>
      </div>
    </div>

    <div class="tonearm-zone">
      <div
        class="tonearm"
        :class="{ dragging }"
        role="slider"
        tabindex="0"
        aria-label="Tonearm track selector"
        aria-valuemin="0"
        :aria-valuemax="valueMax"
        :aria-valuenow="valueNow"
        :aria-valuetext="valueText"
        @pointerdown="emit('arm-pointerdown', $event)"
        @pointermove="emit('arm-pointermove', $event)"
        @pointerup="emit('arm-pointerup', $event)"
        @pointercancel="emit('arm-pointerup', $event)"
        @keydown="emit('arm-keydown', $event)"
      >
        <div class="pivot-base" aria-hidden="true" />
        <div class="arm-bar" aria-hidden="true" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  flipped: boolean
  rotationDeg: number
  dragging: boolean
  valueNow: number
  valueMax: number
  valueText: string
}>()

const emit = defineEmits<{
  'arm-pointerdown': [event: PointerEvent]
  'arm-pointermove': [event: PointerEvent]
  'arm-pointerup': [event: PointerEvent]
  'arm-keydown': [event: KeyboardEvent]
  'record-pointerdown': [event: PointerEvent]
  'record-keydown': [event: KeyboardEvent]
}>()

// Exposed so the parent's pointer math (pivot point, groove radius) can measure
// the real DOM rects, which stay correct under the canvas pan transform.
const turntableEl = ref<HTMLElement | null>(null)
const recordWrapEl = ref<HTMLElement | null>(null)

defineExpose({ turntableEl, recordWrapEl })
</script>
