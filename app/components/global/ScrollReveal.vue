<template>
  <component
    :is="as"
    ref="target"
    :class="['reveal-base', { 'is-visible': isVisible }, className]"
    :data-reveal="variant"
    :style="revealStyle"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  as?: string
  className?: string
  variant?: 'fade-up' | 'section-left' | 'section-right' | 'section-up'
  delayMs?: number
  durationMs?: number
  distancePx?: number
  blurPx?: number
  scaleFrom?: number
  once?: boolean
  threshold?: number
  rootMargin?: string
}>(), {
  as: 'div',
  className: '',
  variant: 'fade-up',
  delayMs: 0,
  once: true,
  threshold: 0.2,
  rootMargin: '0px 0px -12% 0px',
})

const { target, isVisible } = useScrollReveal({
  once: props.once,
  threshold: props.threshold,
  rootMargin: props.rootMargin,
})

const revealStyle = computed(() => ({
  transitionDelay: `${props.delayMs}ms`,
  '--reveal-duration': props.durationMs != null ? `${props.durationMs}ms` : undefined,
  '--reveal-distance': props.distancePx != null ? `${props.distancePx}px` : undefined,
  '--reveal-blur': props.blurPx != null ? `${props.blurPx}px` : undefined,
  '--reveal-scale': props.scaleFrom != null ? `${props.scaleFrom}` : undefined,
}))
</script>
