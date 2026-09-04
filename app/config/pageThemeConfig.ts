export type PageTheme = 'light' | 'dark'

export type PageGradient =
  | 'home-light'
  | 'teal-depth'
  | 'light-fjord'
  | 'blackout'
  | 'music-dark'
  | 'music-into-the-wild'
  | 'music-charcoal-offwhite'

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

const ALBUM_PAGE_THEME_CONFIG_BY_SLUG: Record<string, PageThemeConfig> = {
  'i-want-to-be-yours-and-other-songs': {
    theme: 'light',
    gradient: 'music-charcoal-offwhite',
  },
  'into-the-wild': {
    theme: 'light',
    gradient: 'music-into-the-wild',
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
    match: /^\/links\/?$/,
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

