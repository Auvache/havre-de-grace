<template>
  <section
    ref="wrapperRef"
    class="relative h-[100dvh] overflow-hidden overscroll-none bg-transparent"
    aria-label="Influences canvas"
    tabindex="0"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @keydown="handleKeydown"
  >
    <div class="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.6),transparent)]" />

    <p
      v-if="!albums.length"
      class="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 translate-y-20 text-sm uppercase tracking-[0.24em] text-[var(--color-muted-dark)]"
    >
      Coming soon
    </p>

    <div
      ref="canvasRef"
      class="absolute left-0 top-0 will-change-transform"
      :style="canvasStyle"
    >
      <InfluenceCenterLogo :x="center.x" :y="center.y" />

      <button
        v-for="album in orderedAlbums"
        :key="album.id"
        type="button"
        class="influence-tile absolute block select-none bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        :style="{ left: `${positions[album.id]?.x ?? center.x}px`, top: `${positions[album.id]?.y ?? center.y}px` }"
        :aria-label="`${album.title} by ${album.artist}`"
        @click="openAlbum(album)"
      >
        <NuxtImg
          :src="album.coverImage"
          :alt="`${album.title} by ${album.artist}`"
          width="600"
          height="600"
          sizes="300px"
          format="webp,avif"
          loading="eager"
          draggable="false"
          class="block h-[300px] w-[300px] object-cover"
        />
      </button>
    </div>

    <InfluenceModal :album="activeAlbum" @close="closeModal" />
  </section>
</template>

<script setup lang="ts">
import type { TasteAlbum } from '~~/shared/types'

const props = defineProps<{
  albums: TasteAlbum[]
}>()

const TILE = 300
const MAX_SPEED = 250
const DEADZONE = 0.08
const RAMP_POWER = 1.7

const wrapperRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLElement | null>(null)
const activeAlbum = ref<TasteAlbum | null>(null)
const viewportWidth = ref(0)
const viewportHeight = ref(0)
const coverSize = ref(TILE)

const albums = computed(() => props.albums)
const { width, height } = useElementSize(wrapperRef)

watch([width, height], () => {
  viewportWidth.value = Math.round(width.value)
  viewportHeight.value = Math.round(height.value)
}, { immediate: true })

const { orderedAlbums, canvasSize, center, positions } = useAlbumPositions(albums, viewportWidth, viewportHeight, coverSize)

const canvasStyle = computed(() => ({
  width: `${canvasSize.value.width}px`,
  height: `${canvasSize.value.height}px`,
}))

const offset = { x: 0, y: 0 }
const cursor = { x: 0, y: 0, inside: false }
let pressed = false
let reducedMotion = false
let rafId: number | null = null
let lastT = 0
let centered = false

const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value))

const getBounds = () => ({
  minX: Math.min(0, viewportWidth.value - canvasSize.value.width),
  maxX: 0,
  minY: Math.min(0, viewportHeight.value - canvasSize.value.height),
  maxY: 0,
})

const applyTransform = () => {
  if (!canvasRef.value) {
    return
  }
  canvasRef.value.style.transform = `translate3d(${offset.x}px, ${offset.y}px, 0)`
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
      const b = getBounds()
      offset.x = clamp(offset.x - fx * MAX_SPEED * dt, b.minX, b.maxX)
      offset.y = clamp(offset.y - fy * MAX_SPEED * dt, b.minY, b.maxY)
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

const handleKeydown = (event: KeyboardEvent) => {
  if (activeAlbum.value) {
    if (event.key === 'Escape') {
      closeModal()
    }
    return
  }

  const step = 56
  let dx = 0
  let dy = 0

  if (event.key === 'ArrowLeft') {
    dx = step
  }
  else if (event.key === 'ArrowRight') {
    dx = -step
  }
  else if (event.key === 'ArrowUp') {
    dy = step
  }
  else if (event.key === 'ArrowDown') {
    dy = -step
  }

  if (dx !== 0 || dy !== 0) {
    event.preventDefault()
    const b = getBounds()
    offset.x = clamp(offset.x + dx, b.minX, b.maxX)
    offset.y = clamp(offset.y + dy, b.minY, b.maxY)
    applyTransform()
  }
}

const centerCanvas = () => {
  offset.x = Math.round((viewportWidth.value - canvasSize.value.width) / 2)
  offset.y = Math.round((viewportHeight.value - canvasSize.value.height) / 2)
  applyTransform()
}

watch([canvasSize, viewportWidth, viewportHeight], () => {
  if (!viewportWidth.value || !viewportHeight.value) {
    return
  }

  if (!centered) {
    centered = true
    centerCanvas()
    return
  }

  const b = getBounds()
  offset.x = clamp(offset.x, b.minX, b.maxX)
  offset.y = clamp(offset.y, b.minY, b.maxY)
  applyTransform()
}, { immediate: true, deep: true })

if (import.meta.client) {
  const syncMedia = () => {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  onMounted(() => {
    syncMedia()
    wrapperRef.value?.focus()
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    window.addEventListener('resize', syncMedia)
    rafId = requestAnimationFrame(tick)
  })

  onBeforeUnmount(() => {
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
    window.removeEventListener('resize', syncMedia)
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  })
}
</script>

<style scoped>
.influence-tile {
  transform: translate(-50%, -50%);
  transform-origin: center center;
  transition: transform 1000ms ease;
}

.influence-tile:hover,
.influence-tile:focus-visible {
  transform: translate(-50%, -50%) scale(1.1);
  z-index: 1;
}

@media (prefers-reduced-motion: reduce) {
  .influence-tile {
    transition-duration: 1ms;
  }
}
</style>
