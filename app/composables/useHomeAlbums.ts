import type { Album } from '~~/shared/types'

const sortAlbums = (items: Album[]) => [...items]
  .filter((album) => album.isVisible !== false)
  .sort((a, b) => {
    if (a.releaseDate && b.releaseDate) {
      return b.releaseDate.localeCompare(a.releaseDate)
    }

    if (a.releaseDate) {
      return -1
    }

    if (b.releaseDate) {
      return 1
    }

    return b.year - a.year
  })

/**
 * The discography as the homepage sees it: visible releases, newest first, and
 * the one the hero spotlights.
 */
export const useHomeAlbums = async () => {
  const { data } = await useAsyncData('home-albums', async () => {
    const items = await queryCollection('music').all() as Album[]
    return sortAlbums(items)
  })

  const albums = computed(() => data.value ?? [])

  const latestAlbum = computed(() => {
    const items = albums.value
    return items.find((album) => album.isLatest) ?? items[0] ?? null
  })

  return { albums, latestAlbum }
}
