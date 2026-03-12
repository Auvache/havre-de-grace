import type { SiteProfile } from '../types'

export const siteProfile: SiteProfile = {
  artistName: 'Havre De Grace',
  legalName: 'Stefan Auvache Bradley',
  description: 'Independent singer-songwriter music rooted in intimate acoustic storytelling.',
  location: 'Vancouver, Washington',
  genres: ['Independent Singer-Songwriter', 'Folk', 'Acoustic'],
  bookingEmail: 'booking@havredegracemusic.com',
  artistLinks: {
    spotify: 'https://open.spotify.com/artist/5Lyc79cqw6P44FeVTRlBLb?si=wB2FxUU0SsuLAS5EPuyFqw',
    appleMusic: 'https://music.apple.com/us/artist/havre-de-grace/1875352277',
    youtubeMusic: 'https://music.youtube.com/channel/UC9FYhFcWIz8KVSVqZHwIgxg?si=bM-aT2sjiEYxi1js',
    amazonMusic: 'https://music.amazon.com/artists/B0G83WZY27/havre-de-grace?marketplaceId=ATVPDKIKX0DER&musicTerritory=US&ref=dm_sh_xjo54sgurf1z0eePEZRczcJRG',
    bandcamp: 'https://havredegrace.bandcamp.com/album/i-want-to-be-yours-and-other-songs',
    soundcloud: 'https://soundcloud.com/havredegracemusic',
    youtube: 'https://www.youtube.com/@havredegracemusic',
    instagram: 'https://www.instagram.com/havredegracemusic',
  },
  socialLinks: [
    {
      label: 'Spotify',
      url: 'https://open.spotify.com/artist/5Lyc79cqw6P44FeVTRlBLb?si=wB2FxUU0SsuLAS5EPuyFqw',
    },
    {
      label: 'Apple Music',
      url: 'https://music.apple.com/us/artist/havre-de-grace/1875352277',
    },
    {
      label: 'Bandcamp',
      url: 'https://havredegrace.bandcamp.com/album/i-want-to-be-yours-and-other-songs',
    },
    {
      label: 'YouTube',
      url: 'https://www.youtube.com/@havredegracemusic',
    },
    {
      label: 'Instagram',
      url: 'https://www.instagram.com/havredegracemusic',
    },
  ],
  pressAssets: [
    {
      label: 'Press Photo (Square)',
      src: '/press/media-pic-square.jpg',
      downloadName: 'havre-de-grace-press-photo-square.jpg',
    },
    {
      label: 'Press Photo (Wide)',
      src: '/press/media-pic-wide.jpg',
      downloadName: 'havre-de-grace-press-photo-wide.jpg',
    },
  ],
  epkDownloadUrl: '/press/havre-de-grace-epk-placeholder.txt',
}
