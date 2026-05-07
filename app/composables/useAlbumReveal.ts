import type { Ref } from 'vue'
import type { TasteAlbum } from '~~/shared/types'

interface ViewportRect {
  left: number
  top: number
  right: number
  bottom: number
}

interface Point {
  x: number
  y: number
}

const isInsideViewport = (point: Point, viewport: ViewportRect, buffer = 50) => (
  point.x >= viewport.left - buffer
  && point.x <= viewport.right + buffer
  && point.y >= viewport.top - buffer
  && point.y <= viewport.bottom + buffer
)

export const useAlbumReveal = (
  albums: Ref<TasteAlbum[]>,
  positions: Ref<Record<string, Point>>,
) => {
  const revealed = ref(new Set<string>())
  const revealDelayMap = ref<Record<string, number>>({})
  const initialRevealComplete = ref(false)

  const applyReveal = (albumIds: string[], staggered: boolean) => {
    if (!albumIds.length) {
      return
    }

    const nextSet = new Set(revealed.value)
    const nextDelayMap = { ...revealDelayMap.value }

    albumIds.forEach((albumId, index) => {
      nextSet.add(albumId)

      if (!(albumId in nextDelayMap)) {
        nextDelayMap[albumId] = staggered ? index * 140 : 0
      }
    })

    revealed.value = nextSet
    revealDelayMap.value = nextDelayMap
  }

  const initialize = (viewport: ViewportRect) => {
    if (initialRevealComplete.value) {
      return
    }

    const visibleIds = [...albums.value]
      .filter((album) => isInsideViewport(positions.value[album.id], viewport, 0))
      .sort((left, right) => left.tier - right.tier)
      .map((album) => album.id)

    applyReveal(visibleIds, true)
    initialRevealComplete.value = true
  }

  const revealInViewport = (viewport: ViewportRect) => {
    const nextIds = albums.value
      .filter((album) => !revealed.value.has(album.id))
      .filter((album) => isInsideViewport(positions.value[album.id], viewport))
      .map((album) => album.id)

    applyReveal(nextIds, false)
  }

  const isRevealed = (albumId: string) => revealed.value.has(albumId)
  const getRevealDelay = (albumId: string) => revealDelayMap.value[albumId] ?? 0

  return {
    revealed: readonly(revealed),
    initialize,
    revealInViewport,
    isRevealed,
    getRevealDelay,
  }
}
