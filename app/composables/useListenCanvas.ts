import type { Ref } from 'vue'

interface UseListenCanvasArgs {
  wrapperEl: Ref<HTMLElement | null>
  canvasEl: Ref<HTMLElement | null>
  sceneWidth: number
  sceneHeight: number
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

// On phones, shrink the whole artboard so more of the scene fits on screen.
// Everything stays proportional — this just zooms the camera out. The fixed
// overlays (back link, track controls) are scaled to match in record-player.css
// under the same 640px breakpoint; keep these two in sync.
const MOBILE_SCALE = 2 / 3
const MOBILE_QUERY = '(max-width: 640px)'

// Drag-to-pan canvas navigation for the /listen scene. Grab empty space and drag
// to explore, with momentum and spring-back to bounds. Works for mouse, touch, and
// pen alike. Pointerdowns on elements marked [data-no-pan] (tonearm, record,
// controls, switcher) are ignored here so those interactions never pan the canvas.
export function useListenCanvas({ wrapperEl, canvasEl, sceneWidth, sceneHeight }: UseListenCanvasArgs) {
  const { width, height } = useElementSize(wrapperEl)

  // Uniform zoom factor for the artboard. 1 on desktop, MOBILE_SCALE on phones.
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const scale = computed(() => (isMobile.value ? MOBILE_SCALE : 1))

  // Scaled artboard footprint — the on-screen size the pan bounds must respect.
  const scaledWidth = () => sceneWidth * scale.value
  const scaledHeight = () => sceneHeight * scale.value

  // Reactive so the scene can show a "grabbing" cursor while a drag is in flight.
  const isDragging = ref(false)

  const offset = { x: 0, y: 0 }
  let dragging = false
  let hasMoved = false
  let pointerId: number | null = null
  let startPointer = { x: 0, y: 0 }
  let startOffset = { x: 0, y: 0 }
  let lastPointer = { x: 0, y: 0, time: 0 }
  let velocity = { x: 0, y: 0 }

  let reducedMotion = false
  let centered = false
  let momentumFrame = 0

  const bounds = () => ({
    minX: Math.min(0, width.value - scaledWidth()),
    maxX: 0,
    minY: Math.min(0, height.value - scaledHeight()),
    maxY: 0,
  })

  const applyTransform = () => {
    if (canvasEl.value) {
      // Pan first, then scale from the top-left origin (set in CSS) so the
      // translate stays in the same coordinate space the bounds are computed in.
      canvasEl.value.style.transform = `translate3d(${Math.round(offset.x)}px, ${Math.round(offset.y)}px, 0) scale(${scale.value})`
    }
  }

  const setOffset = (nextX: number, nextY: number, elastic = false) => {
    const b = bounds()
    if (elastic) {
      const resistance = 0.22
      if (nextX < b.minX) nextX = b.minX + (nextX - b.minX) * resistance
      else if (nextX > b.maxX) nextX = b.maxX + (nextX - b.maxX) * resistance
      if (nextY < b.minY) nextY = b.minY + (nextY - b.minY) * resistance
      else if (nextY > b.maxY) nextY = b.maxY + (nextY - b.maxY) * resistance
    }
    else {
      nextX = clamp(nextX, b.minX, b.maxX)
      nextY = clamp(nextY, b.minY, b.maxY)
    }
    offset.x = nextX
    offset.y = nextY
    applyTransform()
  }

  const centerCanvas = () => {
    setOffset((width.value - scaledWidth()) / 2, (height.value - scaledHeight()) / 2)
  }

  const stopMomentum = () => {
    if (momentumFrame) cancelAnimationFrame(momentumFrame)
    momentumFrame = 0
  }

  const springToBounds = () => {
    stopMomentum()
    const tick = () => {
      const b = bounds()
      const targetX = clamp(offset.x, b.minX, b.maxX)
      const targetY = clamp(offset.y, b.minY, b.maxY)
      const dx = targetX - offset.x
      const dy = targetY - offset.y
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
        setOffset(targetX, targetY)
        momentumFrame = 0
        return
      }
      setOffset(offset.x + dx * 0.18, offset.y + dy * 0.18)
      momentumFrame = requestAnimationFrame(tick)
    }
    tick()
  }

  const startMomentum = () => {
    if (reducedMotion) {
      springToBounds()
      return
    }
    stopMomentum()
    const tick = () => {
      velocity.x *= 0.94
      velocity.y *= 0.94
      if (Math.abs(velocity.x) < 0.15 && Math.abs(velocity.y) < 0.15) {
        springToBounds()
        return
      }
      setOffset(offset.x + velocity.x, offset.y + velocity.y, true)
      momentumFrame = requestAnimationFrame(tick)
    }
    tick()
  }

  const isInteractive = (event: PointerEvent) => {
    const target = event.target as HTMLElement | null
    return Boolean(target?.closest?.('[data-no-pan]'))
  }

  const onPointerDown = (event: PointerEvent) => {
    if (isInteractive(event)) return

    // Clear any lingering text selection so it can't hijack this pan gesture.
    window.getSelection?.()?.removeAllRanges?.()

    stopMomentum()
    dragging = true
    isDragging.value = true
    hasMoved = false
    pointerId = event.pointerId
    startPointer = { x: event.clientX, y: event.clientY }
    startOffset = { ...offset }
    lastPointer = { x: event.clientX, y: event.clientY, time: performance.now() }
    velocity = { x: 0, y: 0 }
    wrapperEl.value?.setPointerCapture?.(event.pointerId)
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!dragging || pointerId !== event.pointerId) return

    const dx = event.clientX - startPointer.x
    const dy = event.clientY - startPointer.y
    if (Math.hypot(dx, dy) >= 5) hasMoved = true
    setOffset(startOffset.x + dx, startOffset.y + dy, true)

    const now = performance.now()
    const elapsed = Math.max(16, now - lastPointer.time)
    velocity = {
      x: ((event.clientX - lastPointer.x) / elapsed) * 16,
      y: ((event.clientY - lastPointer.y) / elapsed) * 16,
    }
    lastPointer = { x: event.clientX, y: event.clientY, time: now }
  }

  const finishPointer = (event: PointerEvent) => {
    if (!dragging || pointerId !== event.pointerId) return
    dragging = false
    isDragging.value = false
    pointerId = null
    try {
      wrapperEl.value?.releasePointerCapture?.(event.pointerId)
    }
    catch {
      // ignore
    }
    if (hasMoved) startMomentum()
    else springToBounds()
  }

  // Re-center on the record player (scene center).
  const recenter = () => {
    centerCanvas()
  }

  watch([width, height], () => {
    if (!width.value || !height.value) return
    if (!centered) {
      centered = true
      centerCanvas()
      return
    }
    setOffset(offset.x, offset.y)
  }, { immediate: true })

  // Crossing the mobile breakpoint changes the artboard footprint; re-center so
  // the record player stays framed rather than drifting off toward a corner.
  watch(scale, () => {
    if (!width.value || !height.value) return
    stopMomentum()
    centerCanvas()
  })

  onMounted(() => {
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    applyTransform()
  })

  onUnmounted(() => {
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
    stopMomentum()
  })

  return {
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp: finishPointer,
    onPointerCancel: finishPointer,
    recenter,
  }
}
