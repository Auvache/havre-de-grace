import type { Ref } from 'vue'

interface Point {
  x: number
  y: number
}

interface CanvasOffset {
  x: number
  y: number
}

export const useViewportProximity = (
  positions: Ref<Record<string, Point>>,
  viewportWidth: Ref<number>,
  viewportHeight: Ref<number>,
  reducedMotion: Ref<boolean>,
) => {
  const scales = ref<Record<string, number>>({})

  const update = (offset: CanvasOffset) => {
    if (reducedMotion.value) {
      scales.value = Object.fromEntries(Object.keys(positions.value).map((id) => [id, 1]))
      return
    }

    const nextScales: Record<string, number> = {}
    const centerX = -offset.x + viewportWidth.value / 2
    const centerY = -offset.y + viewportHeight.value / 2
    const maxDistance = Math.hypot(viewportWidth.value, viewportHeight.value) / 2 || 1
    const visibleBufferX = viewportWidth.value * 0.65
    const visibleBufferY = viewportHeight.value * 0.65

    for (const [albumId, point] of Object.entries(positions.value)) {
      if (
        point.x < centerX - visibleBufferX
        || point.x > centerX + visibleBufferX
        || point.y < centerY - visibleBufferY
        || point.y > centerY + visibleBufferY
      ) {
        nextScales[albumId] = 1
        continue
      }

      const distance = Math.hypot(point.x - centerX, point.y - centerY)
      const normalized = Math.max(0, 1 - distance / maxDistance)
      nextScales[albumId] = Number((1 + normalized * 0.12).toFixed(4))
    }

    scales.value = nextScales
  }

  const getScale = (albumId: string) => scales.value[albumId] ?? 1

  return {
    scales: readonly(scales),
    update,
    getScale,
  }
}
