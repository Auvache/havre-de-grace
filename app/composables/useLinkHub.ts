import amazonMusicIcon from '~~/assets/images/amazon-music.png'
import appleMusicIcon from '~~/assets/images/apple-music.png'
import bandcampIcon from '~~/assets/images/bandcamp.png'
import soundcloudIcon from '~~/assets/images/soundcloud.png'
import spotifyIcon from '~~/assets/images/spotify.png'
import youtubeMusicIcon from '~~/assets/images/youtube-music.png'
import type { Album, StreamingLinks } from '~~/shared/types'

/*
 * What the link-in-bio page at /links needs: the newest release, the listening
 * services with their icons, and the social profiles. The page decides what to
 * put first; this only gathers the facts.
 */

export type ServiceKey = 'spotify' | 'appleMusic' | 'youtubeMusic' | 'amazonMusic' | 'bandcamp' | 'soundcloud'

export interface ServiceLink {
  key: ServiceKey
  label: string
  iconSrc: string
  href: string
}

const SERVICES: Array<{ key: ServiceKey, label: string, iconSrc: string }> = [
  { key: 'spotify', label: 'Spotify', iconSrc: spotifyIcon },
  { key: 'appleMusic', label: 'Apple Music', iconSrc: appleMusicIcon },
  { key: 'youtubeMusic', label: 'YouTube Music', iconSrc: youtubeMusicIcon },
  { key: 'amazonMusic', label: 'Amazon Music', iconSrc: amazonMusicIcon },
  { key: 'bandcamp', label: 'Bandcamp', iconSrc: bandcampIcon },
  { key: 'soundcloud', label: 'SoundCloud', iconSrc: soundcloudIcon },
]

export const useLinkHub = async () => {
  const siteProfile = useSiteProfile()

  const { data: latestAlbum } = await useAsyncData('link-hub-latest-album', async () => {
    const items = await queryCollection('music').all() as Album[]
    const visible = items.filter((album) => album.isVisible !== false)
    return visible.find((album) => album.isLatest) ?? visible[0] ?? null
  })

  /** The newest release on each service, falling back to the artist profile. */
  const albumServices = computed<ServiceLink[]>(() => {
    const albumLinks: StreamingLinks = latestAlbum.value?.streamingLinks ?? {}
    return SERVICES
      .map((service) => ({
        ...service,
        href: albumLinks[service.key] || siteProfile.artistLinks[service.key] || '',
      }))
      .filter((service) => service.href)
  })

  /** The Shorts shelf, which is where most visitors to these pages come from. */
  const shortsUrl = computed(() => siteProfile.artistLinks.youtube ? `${siteProfile.artistLinks.youtube}/shorts` : '')

  return {
    siteProfile,
    latestAlbum,
    albumServices,
    shortsUrl,
    bookingEmail: siteProfile.bookingEmail,
  }
}
