/*
 * The rules the persistent player follows as people move around the site
 * (SITE-REFRESH.md, "The persistent player").
 */

/**
 * Opening the album page of the record that's playing hands the music to the
 * page's dock: same song, same second, and the bar fades under it. Set to
 * false and any album page fades the music out and stops it instead.
 */
export const handOffOnSameAlbum = true

/** How long the bar and the sound take to fade when a page stops them. */
export const FADE_MS = 300

/** The record player's fade: the music winds down while the deck comes up. */
export const LISTEN_FADE_MS = 2000

/**
 * Pages with their own sound: the record player, the 7-inch, the films and the
 * demo shelf. Arriving on one fades the bar out and stops the music, so two
 * things never play at once.
 */
export const STOP_ROUTES: RegExp[] = [
  /^\/listen(?:\/|$)/,
  /^\/seven-inch(?:\/|$)/,
  /^\/music-videos(?:\/|$)/,
  /^\/tools(?:\/|$)/,
]

/** How long the music takes to fade when arriving on `path` stops it. */
export const stopFadeFor = (path: string): number =>
  /^\/listen(?:\/|$)/.test(path) ? LISTEN_FADE_MS : FADE_MS

/** An album page or one of its song pages: /music/<album>[/<song>]. */
export const albumSlugOf = (path: string): string | null =>
  path.match(/^\/music\/([^/]+)(?:\/[^/]+)?\/?$/)?.[1] ?? null
