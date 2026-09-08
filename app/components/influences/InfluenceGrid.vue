<template>
  <section class="relative h-[100dvh] w-full overflow-hidden bg-black" aria-label="Influences">
    <!--
      Navigation is a real scroll container rather than a JS-driven canvas:
      touch gets the platform's own swipe, momentum and rubber band for free,
      and desktop gets wheel/trackpad panning and arrow keys. Mouse drag-to-pan
      is layered on top because a plain wheel only moves one axis. The wall is
      finite but jumps a whole number of blocks the instant it reaches an end
      (see wrapScroll), so it reads as endless in every direction.
    -->
    <div
      ref="scrollerRef"
      class="influence-scroller h-full w-full"
      :class="{ 'is-dragging': isDragging }"
      tabindex="0"
      role="group"
      aria-label="Wall of influences. Scroll, swipe, or use the arrow keys to explore."
      @scroll.passive="onScroll"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerEnd"
      @pointercancel="onPointerEnd"
      @wheel.passive="onWheel"
      @keydown="noteInteraction"
      @click.capture="onClickCapture"
    >
      <div class="influence-canvas" :style="gridStyle">
        <button
          v-for="cell in cells"
          :key="cell.key"
          type="button"
          class="influence-tile group relative block h-full w-full select-none overflow-hidden bg-white/5 focus-visible:outline-none"
          :tabindex="cell.primary ? 0 : -1"
          :aria-hidden="cell.primary ? undefined : 'true'"
          :aria-label="`${cell.album.title} by ${cell.album.artist}`"
          @click="openAlbum(cell.album)"
        >
          <NuxtImg
            :src="cell.album.coverImage"
            :alt="cell.primary ? `${cell.album.title} by ${cell.album.artist}` : ''"
            width="600"
            height="600"
            :sizes="`${tile}px`"
            format="webp,avif"
            loading="lazy"
            decoding="async"
            draggable="false"
            class="block h-full w-full object-cover"
          />

          <span class="influence-caption pointer-events-none absolute inset-x-0 bottom-0 block px-3 pb-2.5 pt-8 text-left">
            <span class="block truncate text-[length:var(--font-size-label)] leading-tight text-white">
              {{ cell.album.title }}
            </span>
            <span class="mt-0.5 block truncate text-[0.65rem] uppercase tracking-[0.18em] text-white/65">
              {{ cell.album.artist }}
            </span>
          </span>
        </button>
      </div>
    </div>

    <div class="influence-vignette pointer-events-none absolute inset-0" aria-hidden="true" />

    <div class="influence-chrome pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-[clamp(1rem,3vw,2rem)] pb-[clamp(1rem,3vw,2rem)]">
      <p class="label-text text-white/70">
        influences
      </p>
      <p class="influence-hint label-text text-white/60" :class="{ 'is-hidden': hintHidden }">
        {{ hintText }}
      </p>
    </div>

    <InfluenceIntro :open="introOpen" @dismiss="dismissIntro" />

    <InfluenceModal :album="activeAlbum" @close="closeModal" />
  </section>
</template>

<script setup lang="ts">
import type { TasteAlbum } from '~~/shared/types'

const props = defineProps<{
  albums: TasteAlbum[]
}>()

// Viewports of travel we aim for between wraps, and the ceiling on how many
// tiles that is allowed to put in the DOM.
const TRAVEL_VIEWPORTS = 4
const MAX_TILES = 1100
const MIN_REPEAT = 3
const MAX_REPEAT = 7
const DRAG_THRESHOLD = 6
const FRICTION = 0.94
const MIN_VELOCITY = 0.2
const HINT_TIMEOUT = 6000

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const scrollerRef = ref<HTMLElement | null>(null)
const activeAlbum = ref<TasteAlbum | null>(null)
const introOpen = ref(false)
const isDragging = ref(false)
const hintHidden = ref(false)
const viewportWidth = ref(1280)
const viewportHeight = ref(800)
const coarsePointer = ref(false)
const reducedMotion = ref(false)

let inertiaFrame = 0
let dragPointer: number | null = null
let lastPoint = { x: 0, y: 0 }
let dragDistance = 0
let velocity = { x: 0, y: 0 }
let suppressClick = false
let wrapping = false
let hintTimer: ReturnType<typeof setTimeout> | undefined

const hintText = computed(() => (coarsePointer.value ? 'swipe to explore' : 'drag or scroll to explore'))

const tile = computed(() => {
  if (viewportWidth.value < 640) {
    return 150
  }
  return viewportWidth.value < 1024 ? 190 : 240
})

const gap = computed(() => (tile.value < 200 ? 10 : 14))
const pitch = computed(() => tile.value + gap.value)

// One "block" is the full album list laid out as squarely as the count allows,
// so neither axis visibly repeats sooner than the other.
const columns = computed(() => {
  const total = props.albums.length
  if (total < 2) {
    return 1
  }

  const ideal = Math.round(Math.sqrt(total * 1.5))
  for (let delta = 0; delta < total; delta++) {
    for (const candidate of [ideal + delta, ideal - delta]) {
      if (candidate >= 2 && candidate <= total && total % candidate === 0) {
        return candidate
      }
    }
  }

  return Math.ceil(Math.sqrt(total))
})

const rows = computed(() => Math.max(1, Math.ceil(props.albums.length / columns.value)))
const blockWidth = computed(() => columns.value * pitch.value)
const blockHeight = computed(() => rows.value * pitch.value)

const repeats = computed(() => {
  const wanted = (viewport: number, block: number) =>
    clamp(Math.round((viewport * TRAVEL_VIEWPORTS) / block) + 2, MIN_REPEAT, MAX_REPEAT)

  let x = wanted(viewportWidth.value, blockWidth.value)
  let y = wanted(viewportHeight.value, blockHeight.value)

  while (x * columns.value * y * rows.value > MAX_TILES && (x > MIN_REPEAT || y > MIN_REPEAT)) {
    if (y > MIN_REPEAT && y * rows.value >= x * columns.value) {
      y -= 1
    }
    else if (x > MIN_REPEAT) {
      x -= 1
    }
    else {
      break
    }
  }

  return { x, y }
})

const totalColumns = computed(() => repeats.value.x * columns.value)
const totalRows = computed(() => repeats.value.y * rows.value)

const cells = computed(() => {
  const out: { key: string, album: TasteAlbum, primary: boolean }[] = []
  const total = props.albums.length
  if (total === 0) {
    return out
  }

  // Only the middle block is reachable by keyboard; the repeats are decoration
  // and would otherwise drop ~1000 buttons into the tab order.
  const primaryColumn = Math.floor(repeats.value.x / 2)
  const primaryRow = Math.floor(repeats.value.y / 2)

  for (let r = 0; r < totalRows.value; r++) {
    for (let c = 0; c < totalColumns.value; c++) {
      const index = (((r % rows.value) * columns.value) + (c % columns.value)) % total
      out.push({
        key: `${r}-${c}`,
        album: props.albums[index]!,
        primary: Math.floor(c / columns.value) === primaryColumn && Math.floor(r / rows.value) === primaryRow,
      })
    }
  }

  return out
})

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${totalColumns.value}, ${tile.value}px)`,
  gridAutoRows: `${tile.value}px`,
  gap: `${gap.value}px`,
  '--influence-tile': `${tile.value}px`,
}))

// Centering and wrapping both fire scroll events, so the hint is dismissed by
// real input only -- pointer, wheel or key -- and otherwise times out.
const noteInteraction = () => {
  hintHidden.value = true
}

const stopInertia = () => {
  if (inertiaFrame) {
    cancelAnimationFrame(inertiaFrame)
    inertiaFrame = 0
  }
}

// The canvas is periodic every block, so jumping a whole number of blocks is
// invisible. Doing it only at the hard extremes means no in-flight momentum is
// ever cut short -- a fling simply carries on past the seam.
const wrapScroll = () => {
  const element = scrollerRef.value
  if (!element || wrapping) {
    return
  }

  const maxX = element.scrollWidth - element.clientWidth
  const maxY = element.scrollHeight - element.clientHeight
  const spareX = Math.max(0, repeats.value.x - Math.ceil(element.clientWidth / blockWidth.value))
  const spareY = Math.max(0, repeats.value.y - Math.ceil(element.clientHeight / blockHeight.value))
  const jumpX = Math.max(1, Math.floor(spareX / 2)) * blockWidth.value
  const jumpY = Math.max(1, Math.floor(spareY / 2)) * blockHeight.value

  let nextX = element.scrollLeft
  let nextY = element.scrollTop

  if (maxX > jumpX) {
    if (nextX <= 0) {
      nextX += jumpX
    }
    else if (nextX >= maxX - 1) {
      nextX -= jumpX
    }
  }

  if (maxY > jumpY) {
    if (nextY <= 0) {
      nextY += jumpY
    }
    else if (nextY >= maxY - 1) {
      nextY -= jumpY
    }
  }

  if (nextX === element.scrollLeft && nextY === element.scrollTop) {
    return
  }

  wrapping = true
  element.scrollLeft = nextX
  element.scrollTop = nextY
  wrapping = false
}

const onScroll = () => {
  wrapScroll()
}

const onWheel = () => {
  stopInertia()
  noteInteraction()
}

const runInertia = () => {
  const element = scrollerRef.value
  if (!element || (Math.abs(velocity.x) < MIN_VELOCITY && Math.abs(velocity.y) < MIN_VELOCITY)) {
    stopInertia()
    return
  }

  element.scrollLeft += velocity.x
  element.scrollTop += velocity.y
  velocity = { x: velocity.x * FRICTION, y: velocity.y * FRICTION }
  inertiaFrame = requestAnimationFrame(runInertia)
}

// Touch panning is left entirely to the platform; only a mouse gets synthetic
// drag-to-pan, since a wheel alone cannot move both axes.
const onPointerDown = (event: PointerEvent) => {
  stopInertia()
  noteInteraction()

  if (event.pointerType !== 'mouse' || event.button !== 0 || activeAlbum.value) {
    return
  }

  dragPointer = event.pointerId
  isDragging.value = true
  dragDistance = 0
  velocity = { x: 0, y: 0 }
  lastPoint = { x: event.clientX, y: event.clientY }
}

const onPointerMove = (event: PointerEvent) => {
  const element = scrollerRef.value
  if (!element || dragPointer !== event.pointerId) {
    return
  }

  const deltaX = lastPoint.x - event.clientX
  const deltaY = lastPoint.y - event.clientY
  lastPoint = { x: event.clientX, y: event.clientY }
  dragDistance += Math.hypot(deltaX, deltaY)

  if (dragDistance < DRAG_THRESHOLD) {
    return
  }

  if (!element.hasPointerCapture(event.pointerId)) {
    element.setPointerCapture(event.pointerId)
  }

  // Relative deltas rather than an absolute origin, so a wrap mid-drag does not
  // yank the wall back under the cursor.
  element.scrollLeft += deltaX
  element.scrollTop += deltaY
  velocity = { x: deltaX, y: deltaY }
}

const onPointerEnd = (event: PointerEvent) => {
  const element = scrollerRef.value
  if (dragPointer !== event.pointerId) {
    return
  }

  if (element?.hasPointerCapture(event.pointerId)) {
    element.releasePointerCapture(event.pointerId)
  }

  dragPointer = null
  isDragging.value = false

  if (dragDistance >= DRAG_THRESHOLD) {
    suppressClick = true
    if (!reducedMotion.value) {
      stopInertia()
      inertiaFrame = requestAnimationFrame(runInertia)
    }
  }
}

// A drag that ends over a tile still fires a click; swallow that one.
const onClickCapture = (event: MouseEvent) => {
  if (!suppressClick) {
    return
  }

  suppressClick = false
  event.stopPropagation()
  event.preventDefault()
}

const openAlbum = (album: TasteAlbum) => {
  activeAlbum.value = album
}

const dismissIntro = () => {
  introOpen.value = false
  // The hint is the first thing to read once the intro is gone, so its
  // countdown starts here rather than on mount.
  hintTimer = setTimeout(noteInteraction, HINT_TIMEOUT)
}

const closeModal = () => {
  activeAlbum.value = null
  // InfluenceModal clears body overflow when it closes, which would also drop
  // the lock this page put there on mount.
  nextTick(() => {
    document.body.style.overflow = 'hidden'
  })
}

const centerScroll = () => {
  const element = scrollerRef.value
  if (!element) {
    return
  }

  element.scrollLeft = (element.scrollWidth - element.clientWidth) / 2
  element.scrollTop = (element.scrollHeight - element.clientHeight) / 2
}

const syncViewport = () => {
  const element = scrollerRef.value
  viewportWidth.value = element?.clientWidth || window.innerWidth
  viewportHeight.value = element?.clientHeight || window.innerHeight
}

const onResize = () => {
  stopInertia()
  syncViewport()
  nextTick(centerScroll)
}

onMounted(() => {
  reducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  coarsePointer.value = window.matchMedia('(pointer: coarse)').matches
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
  syncViewport()
  nextTick(centerScroll)
  window.addEventListener('resize', onResize)
  introOpen.value = true
})

onBeforeUnmount(() => {
  stopInertia()
  clearTimeout(hintTimer)
  document.documentElement.style.overflow = ''
  document.body.style.overflow = ''
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.influence-scroller {
  overflow: auto;
  /* Both axes are ours; never chain to the document or trigger pull-to-refresh,
     and skip the bounce so reaching a wrap point reads as more wall. */
  overscroll-behavior: none;
  overflow-anchor: none;
  touch-action: pan-x pan-y;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.influence-scroller::-webkit-scrollbar {
  display: none;
}

.influence-canvas {
  display: grid;
  width: max-content;
}

@media (hover: hover) and (pointer: fine) {
  .influence-scroller {
    cursor: grab;
  }

  .influence-scroller.is-dragging {
    cursor: grabbing;
  }
}

.influence-tile {
  /* Off-screen tiles skip layout and paint; the grid sizes every track
     explicitly, so nothing shifts when they come back. */
  content-visibility: auto;
  contain-intrinsic-size: var(--influence-tile, 240px) var(--influence-tile, 240px);
  border-radius: var(--radius-sm);
  transition: transform 320ms var(--ease-standard);
}

.influence-scroller.is-dragging .influence-tile {
  transition: none;
}

.influence-tile:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
  z-index: 2;
}

@media (hover: hover) and (pointer: fine) {
  .influence-tile:hover {
    transform: scale(1.06);
    z-index: 2;
  }
}

.influence-caption {
  background: linear-gradient(to top, rgb(0 0 0 / 0.85), rgb(0 0 0 / 0.45) 55%, transparent);
  opacity: 0;
  transition: opacity 220ms var(--ease-standard);
}

.influence-tile:hover .influence-caption,
.influence-tile:focus-visible .influence-caption {
  opacity: 1;
}

.influence-vignette {
  background:
    linear-gradient(to bottom, rgb(0 0 0 / 0.75), transparent 12%, transparent 86%, rgb(0 0 0 / 0.78)),
    linear-gradient(to right, rgb(0 0 0 / 0.5), transparent 9%, transparent 91%, rgb(0 0 0 / 0.5));
}

.influence-chrome {
  /* These sit over album art, so they need their own contrast. */
  text-shadow: 0 1px 14px rgb(0 0 0 / 0.95), 0 0 4px rgb(0 0 0 / 0.8);
}

.influence-hint {
  transition: opacity 600ms var(--ease-standard);
}

.influence-hint.is-hidden {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .influence-tile,
  .influence-caption,
  .influence-hint {
    transition-duration: 1ms;
  }

  .influence-tile:hover {
    transform: none;
  }
}
</style>
