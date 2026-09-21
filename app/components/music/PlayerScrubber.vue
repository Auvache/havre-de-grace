<template>
  <div
    ref="railEl"
    class="scrubber"
    role="slider"
    tabindex="0"
    :aria-label="label"
    aria-valuemin="0"
    :aria-valuemax="Math.round(duration) || 0"
    :aria-valuenow="Math.round(currentTime)"
    :aria-valuetext="valueText"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
    @keydown="onKey"
  >
    <span class="scrubber-rail" aria-hidden="true">
      <span class="scrubber-fill" :style="{ transform: `scaleX(${shownProgress})` }" />
    </span>
    <span class="scrubber-thumb" aria-hidden="true" :style="{ left: `${shownProgress * 100}%` }" />
  </div>
</template>

<script setup lang="ts">
/*
 * The seek bar, shared by every album-page design.
 *
 * It is one element with `role="slider"` rather than a styled `<input
 * type="range">`: the range element cannot be given a scrub-anywhere hit area
 * taller than its visual track without the thumb going with it, and these
 * designs want a 2px line that is still a comfortable target.
 *
 * While a drag is in progress the bar shows the *drag* position, not the audio
 * position. Without that it fights the player's timeupdate events and the thumb
 * stutters back under the finger between frames.
 */

const props = withDefaults(defineProps<{
  currentTime: number
  duration: number
  label?: string
  /** Seconds moved per arrow press. */
  step?: number
}>(), {
  label: 'Seek',
  step: 5,
})

const emit = defineEmits<{
  /** Fired continuously during a drag and once on release. */
  seek: [seconds: number]
}>()

const railEl = ref<HTMLElement | null>(null)
const dragging = ref(false)
const dragProgress = ref(0)

const progress = computed(() =>
  props.duration > 0 ? Math.min(1, Math.max(0, props.currentTime / props.duration)) : 0,
)

const shownProgress = computed(() => (dragging.value ? dragProgress.value : progress.value))

const clock = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

const valueText = computed(() => `${clock(props.currentTime)} of ${clock(props.duration)}`)

function progressFromEvent(event: PointerEvent): number {
  const el = railEl.value
  if (!el) return 0
  const rect = el.getBoundingClientRect()
  if (rect.width === 0) return 0
  return Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
}

function onDown(event: PointerEvent) {
  if (!props.duration) return
  const el = railEl.value
  if (!el) return
  event.preventDefault()
  el.setPointerCapture(event.pointerId)
  dragging.value = true
  dragProgress.value = progressFromEvent(event)
  emit('seek', dragProgress.value * props.duration)
}

function onMove(event: PointerEvent) {
  if (!dragging.value) return
  dragProgress.value = progressFromEvent(event)
  emit('seek', dragProgress.value * props.duration)
}

function onUp(event: PointerEvent) {
  if (!dragging.value) return
  const el = railEl.value
  if (el?.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId)
  emit('seek', dragProgress.value * props.duration)
  dragging.value = false
}

function onKey(event: KeyboardEvent) {
  if (!props.duration) return

  const jump = (seconds: number) => {
    event.preventDefault()
    emit('seek', Math.min(props.duration, Math.max(0, props.currentTime + seconds)))
  }

  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') jump(props.step)
  else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') jump(-props.step)
  else if (event.key === 'Home') { event.preventDefault(); emit('seek', 0) }
  else if (event.key === 'End') { event.preventDefault(); emit('seek', props.duration) }
}
</script>

<style scoped>
/*
 * Everything visual is a custom property with a fallback, so each page theme
 * restyles the bar by setting variables on an ancestor instead of reaching in
 * with descendant selectors.
 */
.scrubber {
  position: relative;
  display: flex;
  align-items: center;
  /* The bar is 2-3px; the target is 18. */
  height: 18px;
  cursor: pointer;
  touch-action: none;
  user-select: none;
}

.scrubber-rail {
  position: relative;
  display: block;
  width: 100%;
  height: var(--scrubber-height, 3px);
  overflow: hidden;
  border-radius: 999px;
  background: var(--scrubber-track, color-mix(in srgb, currentColor 18%, transparent));
}

.scrubber-fill {
  position: absolute;
  inset: 0;
  transform-origin: left center;
  border-radius: inherit;
  background: var(--scrubber-fill, var(--color-accent));
  /* No transition: this tracks a drag, and easing it lags the finger. */
}

.scrubber-thumb {
  position: absolute;
  top: 50%;
  width: var(--scrubber-thumb-size, 10px);
  height: var(--scrubber-thumb-size, 10px);
  border-radius: 999px;
  background: var(--scrubber-fill, var(--color-accent));
  transform: translate(-50%, -50%) scale(var(--scrubber-thumb-scale, 0));
  transition: transform 160ms var(--ease-standard);
}

.scrubber:hover .scrubber-thumb,
.scrubber:focus-visible .scrubber-thumb,
.scrubber:active .scrubber-thumb {
  --scrubber-thumb-scale: 1;
}

.scrubber:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 4px;
  border-radius: 999px;
}
</style>
