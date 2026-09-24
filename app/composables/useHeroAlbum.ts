import type { MaybeRefOrGetter } from 'vue'
import type { Album } from '~~/shared/types'

// Parse YYYY-MM-DD as a local date so the day isn't shifted by the browser's
// timezone (a bare `new Date('2026-07-17')` is parsed as UTC).
const toLocalDate = (iso?: string): Date | null => {
  const match = iso?.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * What the homepage hero needs to know about the release it is selling: where
 * it lives, whether it's out yet, and the services to hear it on (the lead
 * single's, if the album itself isn't out yet).
 */
export const useHeroAlbum = (albumSource: MaybeRefOrGetter<Album | null>) => {
  const siteProfile = useSiteProfile()
  const album = computed(() => toValue(albumSource))

  const title = computed(() => album.value?.title ?? siteProfile.artistName)

  // Singles tied to a parent release link to that album; a standalone single
  // has no page of its own, so it points at the discography.
  const albumHref = computed(() => {
    if (!album.value) return '/#music'
    if (album.value.parentAlbumSlug) return `/music/${album.value.parentAlbumSlug}`
    return album.value.isSingle ? '/#music' : `/music/${album.value.slug}`
  })

  const releaseDate = computed(() => toLocalDate(album.value?.releaseDate))

  const isOut = computed(() => !releaseDate.value || releaseDate.value.getTime() <= Date.now())

  /** "July 17, 2026" */
  const releaseDay = computed(() => releaseDate.value
    ? releaseDate.value.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : String(album.value?.year ?? ''))

  const albumEntries = computed(() => toStreamingEntries(album.value?.streamingLinks))

  const streaming = computed(() => {
    if (albumEntries.value.length) {
      return { entries: albumEntries.value, subject: album.value?.title ?? '' }
    }
    const single = album.value?.leadSingle
    return { entries: toStreamingEntries(single?.streamingLinks), subject: single?.title ?? '' }
  })

  return {
    album,
    title,
    artistName: siteProfile.artistName,
    albumHref,
    isOut,
    releaseDay,
    streaming,
  }
}
