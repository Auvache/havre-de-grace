import type { StreamingLinks } from '~~/shared/types'
import amazonMusicIcon from '~~/assets/images/amazon-music.png'
import appleMusicIcon from '~~/assets/images/apple-music.png'
import bandcampIcon from '~~/assets/images/bandcamp.png'
import bandsintownIcon from '~~/assets/images/bandsintown.png'
import instagramIcon from '~~/assets/images/instagram.png'
import soundcloudIcon from '~~/assets/images/soundcloud.png'
import spotifyIcon from '~~/assets/images/spotify.png'
import youtubeIcon from '~~/assets/images/youtube.png'
import youtubeMusicIcon from '~~/assets/images/youtube-music.png'

export const streamingPlatformMeta: Record<string, { label: string, iconSrc: string | null }> = {
  spotify: { label: 'Spotify', iconSrc: spotifyIcon },
  appleMusic: { label: 'Apple Music', iconSrc: appleMusicIcon },
  youtubeMusic: { label: 'YouTube Music', iconSrc: youtubeMusicIcon },
  amazonMusic: { label: 'Amazon Music', iconSrc: amazonMusicIcon },
  bandcamp: { label: 'Bandcamp', iconSrc: bandcampIcon },
  bandsintown: { label: 'Bandsintown', iconSrc: bandsintownIcon },
  soundcloud: { label: 'SoundCloud', iconSrc: soundcloudIcon },
  youtube: { label: 'YouTube', iconSrc: youtubeIcon },
  instagram: { label: 'Instagram', iconSrc: instagramIcon },
}

export interface StreamingEntry {
  platform: string
  label: string
  iconSrc: string | null
  url: string
}

/** A links object as a list of the services that actually have a URL, in declared order. */
export const toStreamingEntries = (
  links: StreamingLinks | Record<string, string | undefined> | null | undefined,
): StreamingEntry[] => Object.entries(links ?? {})
  .filter(([, value]) => Boolean(value))
  .map(([platform, value]) => ({
    platform,
    label: streamingPlatformMeta[platform]?.label ?? platform,
    iconSrc: streamingPlatformMeta[platform]?.iconSrc ?? null,
    url: value as string,
  }))
