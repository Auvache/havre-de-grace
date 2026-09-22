export type PageTheme = 'light' | 'dark'

export type PageGradient =
  | 'home-light'
  | 'teal-depth'
  | 'light-fjord'
  | 'blackout'
  | 'music-dark'
  | 'music-into-the-wild'
  | 'music-charcoal-offwhite'
  | 'album-night-sea'
  | 'album-night-forest'

export interface PageThemeConfig {
  theme: PageTheme
  gradient: PageGradient
}

interface PageThemeRule {
  match: RegExp
  config: PageThemeConfig
}

const DEFAULT_PAGE_THEME_CONFIG: PageThemeConfig = {
  theme: 'light',
  gradient: 'light-fjord',
}

/*
 * Album pages are dark rooms lit by their own cover art (see
 * app/pages/music/[slug]/index.vue), so each release gets a night palette
 * pulled from its sleeve rather than the light themes these two used to have.
 * The accent has to survive on near-black, which is what separates these from
 * the daytime versions kept below them.
 */
const ALBUM_PAGE_THEME_CONFIG_BY_SLUG: Record<string, PageThemeConfig> = {
  'i-want-to-be-yours-and-other-songs': {
    theme: 'dark',
    gradient: 'album-night-forest',
  },
  'into-the-wild': {
    theme: 'dark',
    gradient: 'album-night-sea',
  },
}

// Single source of truth for per-route look and feel.
const PAGE_THEME_RULES: PageThemeRule[] = [
  {
    match: /^\/$/,
    config: {
      theme: 'light',
      gradient: 'light-fjord',
    },
  },
  {
    match: /^\/music(?:\/|$)/,
    config: {
      theme: 'light',
      gradient: 'light-fjord',
    },
  },
  {
    match: /^\/about\/?$/,
    config: {
      theme: 'light',
      gradient: 'light-fjord',
    },
  },
  {
    match: /^\/press\/?$/,
    config: {
      theme: 'light',
      gradient: 'light-fjord',
    },
  },
  {
    match: /^\/contact\/?$/,
    config: {
      theme: 'light',
      gradient: 'light-fjord',
    },
  },
  {
    match: /^\/(?:subscribe|unsubscribe)\/?$/,
    config: {
      theme: 'light',
      gradient: 'light-fjord',
    },
  },
  {
    match: /^\/links\/?$/,
    config: {
      theme: 'light',
      gradient: 'light-fjord',
    },
  },
  {
    // The tools at /resources. Working pages, so they take the same daylight
    // palette as the rest of the prose on the site rather than a look of
    // their own.
    match: /^\/resources(?:\/|$)/,
    config: {
      theme: 'light',
      gradient: 'light-fjord',
    },
  },
  {
    // The record player is a dark, full-bleed scene that paints its own
    // background; the site theme only needs to stop fighting it.
    match: /^\/listen(?:\/|$)/,
    config: {
      theme: 'dark',
      gradient: 'blackout',
    },
  },
  {
    // The influences canvas is a deliberately immersive dark experience.
    match: /^\/influences\/?$/,
    config: {
      theme: 'dark',
      gradient: 'blackout',
    },
  },
  {
    // 16:9 films that paint their own frames — ink and bone and red, or chart
    // and route red. The page around them gets out of the way entirely,
    // because the only colour anyone should be judging is the film's.
    match: /^\/music-videos(?:\/|$)/,
    config: {
      theme: 'dark',
      gradient: 'blackout',
    },
  },
  {
    // The unlisted workbench. Dark, because these are pages for working in
    // rather than pages for arriving at — and because a demo shelf is read at
    // night as often as not.
    match: /^\/tools(?:\/|$)/,
    config: {
      theme: 'dark',
      gradient: 'music-dark',
    },
  },
]

// Matches both an album page (/music/<slug>) and one of its song pages
// (/music/<slug>/<song>), so a song inherits its album's cover-matched gradient
// instead of falling through to the plain light theme.
const toAlbumSlug = (path: string): string | null => {
  const matched = path.match(/^\/music\/([^/]+)(?:\/[^/]+)?\/?$/)
  return matched?.[1] ?? null
}

export const resolvePageThemeConfig = (path: string): PageThemeConfig => {
  const slug = toAlbumSlug(path)
  if (slug) {
    const albumTheme = ALBUM_PAGE_THEME_CONFIG_BY_SLUG[slug]
    if (albumTheme) {
      return albumTheme
    }
  }

  return PAGE_THEME_RULES.find((rule) => rule.match.test(path))?.config ?? DEFAULT_PAGE_THEME_CONFIG
}

