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
            v-for="cell in cells"
            :key="cell.key"
            type="button"
            class="influence-tile relative block select-none bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            :aria-label="`${cell.album.title} by ${cell.album.artist}`"
            @click="openAlbum(cell.album)"
          >
            <NuxtImg
              :src="cell.album.coverImage"
              :alt="`${cell.album.title} by ${cell.album.artist}`"
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

const TILE = 300
const GAP = 16
const COLS = 4
const PITCH = TILE + GAP
const MAX_SPEED = 250
const DEADZONE = 0.08
const RAMP_POWER = 1.7

const wrapperRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)
const activeAlbum = ref<TasteAlbum | null>(null)

const blockRows = computed(() => Math.max(1, Math.ceil(props.albums.length / COLS)))
const blockW = computed(() => COLS * PITCH)
const blockH = computed(() => blockRows.value * PITCH)

const repeatX = ref(3)
const repeatY = ref(3)

const cells = computed(() => {
  const out: { key: string; album: TasteAlbum }[] = []
  const len = props.albums.length
  if (len === 0) {
    return out
  }
  const totalCols = repeatX.value * COLS
  const totalRows = repeatY.value * blockRows.value
  for (let r = 0; r < totalRows; r++) {
    for (let c = 0; c < totalCols; c++) {
      const idx = (((r % blockRows.value) * COLS) + (c % COLS)) % len
      out.push({ key: `${r}-${c}`, album: props.albums[idx]! })
    }
  }
  return out
})

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${repeatX.value * COLS}, ${TILE}px)`,
  gap: `${GAP}px`,
}))

const offset = { x: 0, y: 0 }
const cursor = { x: 0, y: 0, inside: false }
let pressed = false
let reducedMotion = false
let rafId: number | null = null
let lastT = 0

const applyTransform = () => {
  if (!gridRef.value) {
    return
  }
  const bw = blockW.value
  const bh = blockH.value
  const tx = offset.x - Math.round(offset.x / bw) * bw
  const ty = offset.y - Math.round(offset.y / bh) * bh
  gridRef.value.style.transform = `translate3d(${tx}px, ${ty}px, 0)`
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

  const updateRepeats = () => {
    if (!wrapperRef.value) {
      return
    }
    const vw = wrapperRef.value.clientWidth
    const vh = wrapperRef.value.clientHeight
    repeatX.value = Math.max(3, Math.ceil(vw / blockW.value) + 1)
    repeatY.value = Math.max(3, Math.ceil(vh / blockH.value) + 1)
    applyTransform()
  }

  onMounted(() => {
    syncMedia()
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', updateRepeats)
    updateRepeats()
    applyTransform()
    rafId = requestAnimationFrame(tick)
  })

  onBeforeUnmount(() => {
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
    window.removeEventListener('keydown', onKey)
    window.removeEventListener('resize', updateRepeats)
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  })
}
</script>

<style scoped>
.influence-tile {
  transition: transform 1000ms ease;
  transform-origin: center center;
}

.influence-tile:hover,
.influence-tile:focus-visible {
  transform: scale(1.1);
  z-index: 1;
}

@media (prefers-reduced-motion: reduce) {
  .influence-tile {
    transition-duration: 1ms;
  }
}
</style>
