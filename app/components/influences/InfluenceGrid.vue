<template>
  <section
    ref="wrapperRef"
    class="relative h-[100dvh] w-full overflow-hidden bg-black"
    aria-label="Influences grid"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <div ref="gridRef" class="will-change-transform">
        <div class="grid" :style="gridStyle">
          <button
            v-for="album in albums"
            :key="album.id"
            type="button"
            class="influence-tile relative block select-none bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            :aria-label="`${album.title} by ${album.artist}`"
            @click="openAlbum(album)"
          >
            <NuxtImg
              :src="album.coverImage"
              :alt="`${album.title} by ${album.artist}`"
              width="800"
              height="800"
              sizes="400px"
              format="webp,avif"
              loading="lazy"
              draggable="false"
              class="block h-[400px] w-[400px] object-cover"
            />
          </button>
        </div>
      </div>
    </div>

    <InfluenceModal :album="activeAlbum" @close="closeModal" />
  </section>
</template>

<script setup lang="ts">
import type { TasteAlbum } from '~~/shared/types'

const props = defineProps<{
  albums: TasteAlbum[]
}>()

const TILE = 400
const GAP = 16
const COLS = 4
const BUFFER = 160
const MAX_SPEED = 1600
const DEADZONE = 0.08
const RAMP_POWER = 1.7

const wrapperRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)
const activeAlbum = ref<TasteAlbum | null>(null)

const rows = computed(() => Math.max(1, Math.ceil(props.albums.length / COLS)))

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${COLS}, ${TILE}px)`,
  gap: `${GAP}px`,
}))

const offset = { x: 0, y: 0 }
const cursor = { x: 0, y: 0, inside: false }
let pressed = false
let reducedMotion = false
let rafId: number | null = null
let lastT = 0

const computeBounds = () => {
  const w = wrapperRef.value?.clientWidth ?? 0
  const h = wrapperRef.value?.clientHeight ?? 0
  const gridW = COLS * TILE + Math.max(0, COLS - 1) * GAP
  const gridH = rows.value * TILE + Math.max(0, rows.value - 1) * GAP
  return {
    halfPanX: Math.max(0, (gridW - w) / 2) + BUFFER,
    halfPanY: Math.max(0, (gridH - h) / 2) + BUFFER,
  }
}

const applyTransform = () => {
  if (!gridRef.value) {
    return
  }
  gridRef.value.style.transform = `translate3d(${offset.x}px, ${offset.y}px, 0)`
}

const easeAxis = (n: number) => {
  const abs = Math.abs(n)
  if (abs < DEADZONE) {
    return 0
  }
  const ramp = (abs - DEADZONE) / (1 - DEADZONE)
  return Math.sign(n) * Math.pow(Math.min(1, ramp), RAMP_POWER)
}

const tick = (t: number) => {
  if (lastT === 0) {
    lastT = t
  }
  const dt = Math.min(0.05, (t - lastT) / 1000)
  lastT = t

  if (cursor.inside && !pressed && !activeAlbum.value && !reducedMotion && wrapperRef.value) {
    const rect = wrapperRef.value.getBoundingClientRect()
    const cx = rect.width / 2
    const cy = rect.height / 2
    if (cx > 0 && cy > 0) {
      const nx = (cursor.x - rect.left - cx) / cx
      const ny = (cursor.y - rect.top - cy) / cy
      const fx = easeAxis(Math.max(-1, Math.min(1, nx)))
      const fy = easeAxis(Math.max(-1, Math.min(1, ny)))
      offset.x -= fx * MAX_SPEED * dt
      offset.y -= fy * MAX_SPEED * dt
      const { halfPanX, halfPanY } = computeBounds()
      offset.x = Math.max(-halfPanX, Math.min(halfPanX, offset.x))
      offset.y = Math.max(-halfPanY, Math.min(halfPanY, offset.y))
      applyTransform()
    }
  }

  rafId = requestAnimationFrame(tick)
}

const onPointerMove = (event: PointerEvent) => {
  cursor.x = event.clientX
  cursor.y = event.clientY
  cursor.inside = true
}

const onPointerLeave = () => {
  cursor.inside = false
}

const onPointerDown = () => {
  pressed = true
}

const onPointerUp = () => {
  pressed = false
}

const openAlbum = (album: TasteAlbum) => {
  activeAlbum.value = album
}

const closeModal = () => {
  activeAlbum.value = null
}

if (import.meta.client) {
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && activeAlbum.value) {
      closeModal()
    }
  }

  const syncMedia = () => {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  const clampOffsetToBounds = () => {
    const { halfPanX, halfPanY } = computeBounds()
    offset.x = Math.max(-halfPanX, Math.min(halfPanX, offset.x))
    offset.y = Math.max(-halfPanY, Math.min(halfPanY, offset.y))
    applyTransform()
  }

  onMounted(() => {
    syncMedia()
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', clampOffsetToBounds)
    applyTransform()
    rafId = requestAnimationFrame(tick)
  })

  onBeforeUnmount(() => {
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
    window.removeEventListener('keydown', onKey)
    window.removeEventListener('resize', clampOffsetToBounds)
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  })
}
</script>

<style scoped>
.influence-tile {
  transition: transform 250ms ease;
  transform-origin: center center;
}

.influence-tile:hover,
.influence-tile:focus-visible {
  transform: scale(1.2);
  z-index: 1;
}

@media (prefers-reduced-motion: reduce) {
  .influence-tile {
    transition-duration: 1ms;
  }
}
</style>
