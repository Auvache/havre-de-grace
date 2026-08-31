/**
 * schema.org node builders for the site's single JSON-LD @graph.
 *
 * Everything here is fed to `useSchemaOrg` (nuxt-schema-org), which merges every
 * call on a page into one `@graph` keyed by `@id`. The module supplies the
 * WebSite/WebPage/Person/BreadcrumbList nodes via its own `define*` helpers; the
 * music types below have no resolver in @unhead/schema-org, so they're written
 * out as raw nodes.
 *
 * The `@id`s are the whole point: they let one MusicGroup entity be *referenced*
 * from the WebSite, from every album, and from every song, instead of being
 * re-described (differently) on each page. Google needs one entity to attach
 * "Havre De Grace" to, not several near-duplicates.
 */

/** Stable, site-wide entity identifiers. */
export const schemaId = {
  artist: (siteUrl: string) => `${siteUrl}/#artist`,
  person: (siteUrl: string) => `${siteUrl}/#stefan-auvache-bradley`,
  album: (albumUrl: string) => `${albumUrl}#album`,
  recording: (songUrl: string) => `${songUrl}#recording`,
  composition: (songUrl: string) => `${songUrl}#composition`,
}

/** Convert "4:26" / "1:02:03" to an ISO 8601 duration. */
export function toIsoDuration(value?: string): string | undefined {
  if (!value) {
    return undefined
  }

  const segments = value.split(':').map((segment) => Number.parseInt(segment, 10))
  if (segments.some((segment) => Number.isNaN(segment))) {
    return undefined
  }

  if (segments.length === 2) {
    const [minutes, seconds] = segments
    return `PT${minutes}M${seconds}S`
  }

  if (segments.length === 3) {
    const [hours, minutes, seconds] = segments
    return `PT${hours}H${minutes}M${seconds}S`
  }

  return undefined
}

/** Drop keys whose value is undefined/null/empty so nodes stay clean. */
export function compact<T extends Record<string, unknown>>(node: T): T {
  return Object.fromEntries(
    Object.entries(node).filter(([, value]) => {
      if (value === undefined || value === null) {
        return false
      }
      if (typeof value === 'string') {
        return value.trim().length > 0
      }
      if (Array.isArray(value)) {
        return value.length > 0
      }
      return true
    }),
  ) as T
}
