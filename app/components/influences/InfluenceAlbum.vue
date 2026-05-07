<template>
  <button
    type="button"
    class="absolute block select-none text-left focus-visible:outline-none"
    :class="[
      revealed ? 'pointer-events-auto' : 'pointer-events-none',
      revealed ? 'opacity-100' : 'opacity-0',
    ]"
    :style="wrapperStyle"
    :aria-label="`${album.title} by ${album.artist}`"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @focus="hovered = true"
    @blur="hovered = false"
    @click="$emit('open')"
  >
    <div class="relative">
      <div
        v-if="imageFailed"
        class="flex aspect-square items-center justify-center rounded-[var(--radius-md)] border border-white/10 bg-black/45 px-3 text-center text-sm tracking-[0.08em] text-white"
        :style="coverStyle"
      >
        {{ album.title }}
      </div>

      <NuxtImg
        v-else
        :src="album.coverImage"
        :alt="`${album.title} by ${album.artist}`"
        width="600"
        height="600"
        sizes="(max-width: 767px) 100px, 140px"
        format="webp,avif"
        :loading="eager ? 'eager' : 'lazy'"
        class="influence-album-cover aspect-square rounded-[var(--radius-md)] object-cover"
        :style="coverStyle"
        @error="imageFailed = true"
      />

      <div
        v-if="showLabel"
        class="pointer-events-none absolute left-1/2 top-full mt-3 w-max max-w-[12rem] -translate-x-1/2 text-center"
      >
        <p class="text-[length:var(--font-size-body)] leading-tight text-white">
          {{ album.title }}
        </p>
        <p class="mt-1 text-[length:var(--font-size-label)] uppercase tracking-[0.2em] text-[var(--color-muted-dark)]">
          {{ album.artist }}
        </p>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import type { TasteAlbum } from '~~/shared/types'

const props = defineProps<{
  album: TasteAlbum
  x: number
  y: number
  size: number
  revealed: boolean
  revealDelay: number
  proximityScale: number
  hoverEnabled: boolean
  reducedMotion: boolean
  eager?: boolean
}>()

defineEmits<{
  open: []
}>()

const hovered = ref(false)
const imageFailed = ref(false)

const effectiveScale = computed(() => {
  const hoverScale = props.hoverEnabled && hovered.value && !props.reducedMotion ? 1.08 : 1
  return Math.min(1.18, props.proximityScale * hoverScale)
})

const wrapperStyle = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`,
  width: `${props.size}px`,
  transform: `translate(-50%, -50%) scale(${effectiveScale.value})`,
  transformOrigin: 'center center',
  transitionDelay: `${props.revealDelay}ms`,
  transitionDuration: props.reducedMotion ? '1ms' : undefined,
}))

const coverStyle = computed(() => ({
  width: `${props.size}px`,
  boxShadow: hovered.value
    ? '0 20px 36px rgb(0 0 0 / 0.42)'
    : '0 16px 26px rgb(0 0 0 / 0.3)',
}))

const showLabel = computed(() => props.hoverEnabled && hovered.value && props.revealed)
</script>

<style scoped>
button {
  transition:
    opacity 900ms var(--ease-standard),
    transform 200ms ease-out;
  will-change: transform, opacity;
}

.influence-album-cover {
  transition:
    box-shadow 300ms var(--ease-standard),
    transform 300ms var(--ease-standard);
}
</style>
