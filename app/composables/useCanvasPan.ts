import type { Ref } from 'vue'

interface Size {
  width: number
  height: number
}

interface Offset {
  x: number
  y: number
}

interface UseCanvasPanOptions {
  canvasSize: Ref<Size>
  viewportWidth: Ref<number>
  viewportHeight: Ref<number>
  reducedMotion: Ref<boolean>
  onFrame?: (offset: Offset) => void
}

const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value))

export const useCanvasPan = ({
  canvasSize,
  viewportWidth,
  viewportHeight,
  reducedMotion,
  onFrame,
}: UseCanvasPanOptions) => {
  const offset = ref<Offset>({ x: 0, y: 0 })
  const isDragging = ref(false)
  const hasMoved = ref(false)

  let pointerId: number | null = null
  let startPointer = { x: 0, y: 0 }
  let startOffset = { x: 0, y: 0 }
  let lastPointer = { x: 0, y: 0, time: 0 }
  let velocity = { x: 0, y: 0 }
  let momentumFrame = 0
  let centered = false

  const bounds = computed(() => ({
    minX: Math.min(0, viewportWidth.value - canvasSize.value.width),
    maxX: 0,
    minY: Math.min(0, viewportHeight.value - canvasSize.value.height),
    maxY: 0,
  }))

  const centerCanvas = () => {
    offset.value = {
      x: Math.round((viewportWidth.value - canvasSize.value.width) / 2),
      y: Math.round((viewportHeight.value - canvasSize.value.height) / 2),
    }
    onFrame?.(offset.value)
  }

  const applyOffset = (nextX: number, nextY: number, allowElastic = false) => {
    const nextBounds = bounds.value

    if (allowElastic) {
      const resistance = 0.22
      if (nextX < nextBounds.minX) {
        nextX = nextBounds.minX + (nextX - nextBounds.minX) * resistance
      }
      else if (nextX > nextBounds.maxX) {
        nextX = nextBounds.maxX + (nextX - nextBounds.maxX) * resistance
      }

      if (nextY < nextBounds.minY) {
        nextY = nextBounds.minY + (nextY - nextBounds.minY) * resistance
      }
      else if (nextY > nextBounds.maxY) {
        nextY = nextBounds.maxY + (nextY - nextBounds.maxY) * resistance
      }
    }
    else {
      nextX = clamp(nextX, nextBounds.minX, nextBounds.maxX)
      nextY = clamp(nextY, nextBounds.minY, nextBounds.maxY)
    }

    offset.value = {
      x: nextX,
      y: nextY,
    }

    onFrame?.(offset.value)
  }

  const stopMomentum = () => {
    if (momentumFrame) {
      cancelAnimationFrame(momentumFrame)
      momentumFrame = 0
    }
  }

  const springToBounds = () => {
    stopMomentum()

    const tick = () => {
      const targetX = clamp(offset.value.x, bounds.value.minX, bounds.value.maxX)
      const targetY = clamp(offset.value.y, bounds.value.minY, bounds.value.maxY)
      const dx = targetX - offset.value.x
      const dy = targetY - offset.value.y

      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
        applyOffset(targetX, targetY)
        momentumFrame = 0
        return
      }

      applyOffset(offset.value.x + dx * 0.18, offset.value.y + dy * 0.18)
      momentumFrame = requestAnimationFrame(tick)
    }

    tick()
  }

  const startMomentum = () => {
    if (reducedMotion.value) {
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

      applyOffset(offset.value.x + velocity.x, offset.value.y + velocity.y, true)
      momentumFrame = requestAnimationFrame(tick)
    }

    tick()
  }

  const onPointerDown = (event: PointerEvent) => {
    stopMomentum()
    pointerId = event.pointerId
    isDragging.value = true
    hasMoved.value = false
    startPointer = { x: event.clientX, y: event.clientY }
    startOffset = { ...offset.value }
    lastPointer = { x: event.clientX, y: event.clientY, time: performance.now() }
    velocity = { x: 0, y: 0 }
  }

  const onPointerMove = (event: PointerEvent) => {
    if (!isDragging.value || pointerId !== event.pointerId) {
      return
    }

    const deltaX = event.clientX - startPointer.x
    const deltaY = event.clientY - startPointer.y

    if (Math.hypot(deltaX, deltaY) >= 5) {
      hasMoved.value = true
    }

    applyOffset(startOffset.x + deltaX, startOffset.y + deltaY, true)

    const now = performance.now()
    const elapsed = Math.max(16, now - lastPointer.time)
    velocity = {
      x: ((event.clientX - lastPointer.x) / elapsed) * 16,
      y: ((event.clientY - lastPointer.y) / elapsed) * 16,
    }
    lastPointer = { x: event.clientX, y: event.clientY, time: now }
  }

  const finishPointer = (event: PointerEvent) => {
    if (!isDragging.value || pointerId !== event.pointerId) {
      return
    }

    isDragging.value = false
    pointerId = null

    if (hasMoved.value) {
      startMomentum()
    }
    else {
      springToBounds()
    }
  }

  const nudgeBy = (deltaX: number, deltaY: number) => {
    stopMomentum()
    applyOffset(offset.value.x + deltaX, offset.value.y + deltaY)
  }

  const consumeDragIntent = () => {
    const nextValue = hasMoved.value
    hasMoved.value = false
    return nextValue
  }

  watch([viewportWidth, viewportHeight, canvasSize], () => {
    if (!viewportWidth.value || !viewportHeight.value) {
      return
    }

    if (!centered) {
      centered = true
      centerCanvas()
      return
    }

    applyOffset(offset.value.x, offset.value.y)
  }, { immediate: true, deep: true })

  onBeforeUnmount(() => {
    stopMomentum()
  })

  return {
    offset: readonly(offset),
    isDragging: readonly(isDragging),
    onPointerDown,
    onPointerMove,
    onPointerUp: finishPointer,
    onPointerCancel: finishPointer,
    onPointerLeave: finishPointer,
    nudgeBy,
    consumeDragIntent,
  }
}
