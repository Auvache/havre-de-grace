<template>
  <component
    :is="as"
    ref="target"
    :class="['reveal-base', { 'is-visible': isVisible }, className]"
    :style="revealStyle"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  as?: string
  className?: string
  delayMs?: number
  once?: boolean
  threshold?: number
  rootMargin?: string
}>(), {
  as: 'div',
  className: '',
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
}))
</script>
