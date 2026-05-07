<template>
  <section
    ref="wrapperRef"
    class="relative h-[100dvh] overflow-hidden overscroll-none bg-transparent"
    :class="isDragging ? 'cursor-grabbing' : 'cursor-grab'"
    tabindex="0"
    aria-label="Influences canvas"
    @pointerdown="handlePointerDown"
    @pointermove="pan.onPointerMove"
    @pointerup="pan.onPointerUp"
    @pointercancel="pan.onPointerCancel"
    @pointerleave="pan.onPointerLeave"
    @wheel.prevent
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
      class="absolute left-0 top-0"
      :style="canvasStyle"
    >
      <InfluenceCenterLogo :x="center.x" :y="center.y" />

      <InfluenceAlbum
        v-for="album in orderedAlbums"
        :key="album.id"
        :album="album"
        :x="positions[album.id]?.x ?? center.x"
        :y="positions[album.id]?.y ?? center.y"
        :size="coverSize"
        :revealed="isRevealed(album.id)"
        :reveal-delay="getRevealDelay(album.id)"
        :proximity-scale="getScale(album.id)"
        :hover-enabled="canHover"
        :reduced-motion="reducedMotion"
        :eager="isInitiallyVisible(album.id)"
        @open="openAlbum(album)"
      />
    </div>

    <InfluenceModal :album="activeAlbum" @close="closeModal" />
  </section>
</template>

<script setup lang="ts">
import type { TasteAlbum } from '~~/shared/types'

const props = defineProps<{
  albums: TasteAlbum[]
}>()

const wrapperRef = ref<HTMLElement | null>(null)
const activeAlbum = ref<TasteAlbum | null>(null)
const reducedMotion = ref(false)
const canHover = ref(false)
const viewportWidth = ref(0)
const viewportHeight = ref(0)
const initiallyVisibleIds = ref(new Set<string>())

const albums = computed(() => props.albums)
const { width, height } = useElementSize(wrapperRef)

watch([width, height], () => {
  viewportWidth.value = Math.round(width.value)
  viewportHeight.value = Math.round(height.value)
}, { immediate: true })

if (import.meta.client) {
  const syncMedia = () => {
    reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    canHover.value = window.matchMedia('(hover: hover) and (pointer: fine)').matches
  }

  onMounted(() => {
    syncMedia()
    wrapperRef.value?.focus()
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    window.addEventListener('resize', syncMedia)
  })

  onBeforeUnmount(() => {
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
    window.removeEventListener('resize', syncMedia)
  })
}

const { orderedAlbums, coverSize: coverSizeRef, canvasSize, center, positions } = useAlbumPositions(albums, viewportWidth, viewportHeight)
const coverSize = computed(() => coverSizeRef.value)

const getViewportRect = (offset: { x: number, y: number }) => ({
  left: -offset.x,
  top: -offset.y,
  right: -offset.x + viewportWidth.value,
  bottom: -offset.y + viewportHeight.value,
})

const { initialize, revealInViewport, isRevealed, getRevealDelay } = useAlbumReveal(albums, positions)
const { getScale, update: updateProximity } = useViewportProximity(positions, viewportWidth, viewportHeight, reducedMotion)

const syncFrameState = (offset: { x: number, y: number }) => {
  if (!viewportWidth.value || !viewportHeight.value) {
    return
  }

  const viewport = getViewportRect(offset)
  updateProximity(offset)
  initialize(viewport)
  revealInViewport(viewport)

  initiallyVisibleIds.value = new Set(
    orderedAlbums.value
      .filter((album) => {
        const point = positions.value[album.id]
        return point
          && point.x >= viewport.left
          && point.x <= viewport.right
          && point.y >= viewport.top
          && point.y <= viewport.bottom
      })
      .map((album) => album.id),
  )
}

const pan = useCanvasPan({
  canvasSize,
  viewportWidth,
  viewportHeight,
  reducedMotion,
  onFrame: syncFrameState,
})

const isDragging = computed(() => pan.isDragging.value)

const canvasStyle = computed(() => ({
  width: `${canvasSize.value.width}px`,
  height: `${canvasSize.value.height}px`,
  transform: `translate3d(${pan.offset.value.x}px, ${pan.offset.value.y}px, 0)`,
}))

const handlePointerDown = (event: PointerEvent) => {
  wrapperRef.value?.setPointerCapture(event.pointerId)
  pan.onPointerDown(event)
}

const openAlbum = (album: TasteAlbum) => {
  if (pan.consumeDragIntent()) {
    return
  }

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

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    pan.nudgeBy(step, 0)
  }
  else if (event.key === 'ArrowRight') {
    event.preventDefault()
    pan.nudgeBy(-step, 0)
  }
  else if (event.key === 'ArrowUp') {
    event.preventDefault()
    pan.nudgeBy(0, step)
  }
  else if (event.key === 'ArrowDown') {
    event.preventDefault()
    pan.nudgeBy(0, -step)
  }
}

const isInitiallyVisible = (albumId: string) => initiallyVisibleIds.value.has(albumId)

watch([canvasSize, viewportWidth, viewportHeight], () => {
  syncFrameState(pan.offset.value)
}, { immediate: true })
</script>
