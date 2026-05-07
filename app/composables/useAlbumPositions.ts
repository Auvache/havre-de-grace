import type { Ref } from 'vue'
import type { TasteAlbum } from '~~/shared/types'

interface Point {
  x: number
  y: number
}

interface CanvasSize {
  width: number
  height: number
}

const TIER_BANDS: Record<TasteAlbum['tier'], [number, number]> = {
  1: [0.05, 0.15],
  2: [0.15, 0.3],
  3: [0.3, 0.5],
  4: [0.5, 0.7],
  5: [0.7, 1],
}

const hashString = (value: string) => {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

const createRandom = (seed: number) => {
  let state = seed || 1

  return () => {
    state += 0x6D2B79F5
    let next = Math.imul(state ^ (state >>> 15), 1 | state)
    next ^= next + Math.imul(next ^ (next >>> 7), 61 | next)
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296
  }
}

export const useAlbumPositions = (
  albums: Ref<TasteAlbum[]>,
  viewportWidth: Ref<number>,
  viewportHeight: Ref<number>,
) => {
  const orderedAlbums = computed(() => [...albums.value].sort((left, right) => {
    if (left.tier !== right.tier) {
      return left.tier - right.tier
    }

    return left.id.localeCompare(right.id)
  }))

  const coverSize = computed(() => viewportWidth.value < 768
    ? Math.max(60, Math.min(100, viewportWidth.value * 0.18))
    : Math.max(80, Math.min(140, viewportWidth.value * 0.12)))

  const canvasSize = computed<CanvasSize>(() => {
    const baseSpan = Math.max(viewportWidth.value || 1280, viewportHeight.value || 720, 960)
    const multiplier = Math.max(3.2, Math.min(5.4, 3.1 + orderedAlbums.value.length / 16))
    const side = Math.round(baseSpan * multiplier)

    return {
      width: side,
      height: side,
    }
  })

  const center = computed<Point>(() => ({
    x: canvasSize.value.width / 2,
    y: canvasSize.value.height / 2,
  }))

  const positions = computed<Record<string, Point>>(() => {
    const result: Record<string, Point> = {}
    const maxRadius = Math.min(canvasSize.value.width, canvasSize.value.height) / 2 * 0.85

    for (const album of orderedAlbums.value) {
      const random = createRandom(hashString(album.id))
      const [minBand, maxBand] = TIER_BANDS[album.tier]
      const radiusUnit = minBand + (maxBand - minBand) * random()
      const radius = radiusUnit * maxRadius
      const angle = random() * Math.PI * 2
      const jitter = (random() - 0.5) * coverSize.value * 0.9

      result[album.id] = {
        x: center.value.x + Math.cos(angle) * radius + jitter,
        y: center.value.y + Math.sin(angle) * radius + jitter,
      }
    }

    const minimumDistance = coverSize.value * 1.28

    for (let iteration = 0; iteration < 50; iteration += 1) {
      let hadCollision = false

      for (let index = 0; index < orderedAlbums.value.length; index += 1) {
        const current = result[orderedAlbums.value[index].id]

        for (let compareIndex = index + 1; compareIndex < orderedAlbums.value.length; compareIndex += 1) {
          const other = result[orderedAlbums.value[compareIndex].id]
          const dx = other.x - current.x
          const dy = other.y - current.y
          const distance = Math.hypot(dx, dy) || 0.001

          if (distance >= minimumDistance) {
            continue
          }

          hadCollision = true
          const overlap = (minimumDistance - distance) / 2
          const angle = Math.atan2(dy, dx)
          const offsetX = Math.cos(angle) * overlap
          const offsetY = Math.sin(angle) * overlap

          current.x -= offsetX
          current.y -= offsetY
          other.x += offsetX
          other.y += offsetY
        }
      }

      for (const album of orderedAlbums.value) {
        const point = result[album.id]
        const clampMargin = coverSize.value * 0.75

        point.x = Math.min(canvasSize.value.width - clampMargin, Math.max(clampMargin, point.x))
        point.y = Math.min(canvasSize.value.height - clampMargin, Math.max(clampMargin, point.y))
      }

      if (!hadCollision) {
        break
      }
    }

    return result
  })

  return {
    orderedAlbums,
    coverSize,
    canvasSize,
    center,
    positions,
  }
}
