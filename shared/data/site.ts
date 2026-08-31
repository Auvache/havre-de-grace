import type { SiteProfile } from '../types'

export const siteProfile: SiteProfile = {
  artistName: 'Havre De Grace',
  legalName: 'Stefan Auvache Bradley',
  description: 'Acoustic folk and singer-songwriter music by Stefan Auvache Bradley, performing as Havre De Grace.',
  location: 'Vancouver, Washington',
  genres: ['Independent Singer-Songwriter', 'Folk', 'Acoustic'],
  bookingEmail: 'booking@havredegracemusic.com',
  // Click targets shown in the footer, the /links page, and album pages. Share
  // and referral parameters are stripped: they add nothing for a visitor and
  // they made the URLs in `entityUrls` inconsistent with these.
  artistLinks: {
    spotify: 'https://open.spotify.com/artist/5Lyc79cqw6P44FeVTRlBLb',
    appleMusic: 'https://music.apple.com/us/artist/havre-de-grace/1875352277',
    youtubeMusic: 'https://music.youtube.com/channel/UC9FYhFcWIz8KVSVqZHwIgxg',
    amazonMusic: 'https://music.amazon.com/artists/B0G83WZY27/havre-de-grace',
    bandcamp: 'https://havredegrace.bandcamp.com/album/i-want-to-be-yours-and-other-songs',
    bandsintown: 'https://www.bandsintown.com/a/15640008',
    soundcloud: 'https://soundcloud.com/havredegracemusic',
    youtube: 'https://www.youtube.com/@havredegracemusic',
    instagram: 'https://www.instagram.com/havredegracemusic',
  },
  // Canonical, artist-level profile URLs for the MusicGroup's schema.org
  // `sameAs`. These are entity identifiers, not click targets, so they must be
  // the profile root with no tracking parameters — Google matches them against
  // the same URLs listed on Wikidata, MusicBrainz, and the platforms
  // themselves. `artistLinks.bandcamp` deliberately deep-links to an album for
  // visitors; the artist root belongs here instead.
  entityUrls: [
    'https://open.spotify.com/artist/5Lyc79cqw6P44FeVTRlBLb',
    'https://music.apple.com/us/artist/havre-de-grace/1875352277',
    'https://music.youtube.com/channel/UC9FYhFcWIz8KVSVqZHwIgxg',
    'https://music.amazon.com/artists/B0G83WZY27/havre-de-grace',
    'https://havredegrace.bandcamp.com',
    'https://www.bandsintown.com/a/15640008',
    'https://soundcloud.com/havredegracemusic',
    'https://www.youtube.com/@havredegracemusic',
    'https://www.instagram.com/havredegracemusic',
  ],
  socialLinks: [
    {
      label: 'Spotify',
      url: 'https://open.spotify.com/artist/5Lyc79cqw6P44FeVTRlBLb',
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
