<template>
  <div
    class="pointer-events-none absolute flex items-center justify-center"
    :style="logoStyle"
    aria-hidden="true"
  >
    <div class="influence-logo-glow" />
    <img
      :src="logoWhite"
      alt=""
      class="relative z-[1] w-[clamp(6rem,16vw,12rem)] select-none"
      draggable="false"
    >
  </div>
</template>

<script setup lang="ts">
import logoWhite from '~~/assets/images/logo-white.png'

const props = defineProps<{
  x: number
  y: number
}>()

const logoStyle = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`,
  transform: 'translate(-50%, -50%)',
}))
</script>

<style scoped>
.influence-logo-glow {
  position: absolute;
  inset: 50%;
  width: min(42vw, 28rem);
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border-radius: 999px;
  background:
    radial-gradient(circle, rgb(255 255 255 / 0.16) 0%, rgb(118 160 173 / 0.08) 35%, transparent 72%);
  filter: blur(16px);
}
</style>
