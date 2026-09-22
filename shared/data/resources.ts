/**
 * The /resources section: free browser-based tools for independent musicians.
 *
 * Three tools that came out of doing this work for Havre De Grace — tracking
 * royalty registrations, finding funding, and sanity-checking promo offers —
 * put on the site in case they are useful to anybody else.
 *
 * Deliberately small. There are no articles and no sub-brand: a tool either
 * earns its page or it does not belong here.
 *
 * Imported by nuxt.config.ts as well as by the pages, so it must stay free of
 * Nuxt runtime imports — plain data and pure functions only.
 */

export interface ResourceTool {
  /** Path segment under `${RESOURCES_BASE_PATH}/tools`. */
  slug: string
  name: string
  /** One line for the hub card and the tool page's meta description. */
  summary: string
}

/**
 * Route prefix. '/resources' rather than '/tools': it describes what the pages
 * are, it is what somebody would guess, and /tools is already the unlisted
 * workbench (see app/pages/tools/).
 */
export const RESOURCES_BASE_PATH = '/resources'

export const RESOURCE_TOOLS: ResourceTool[] = [
  {
    slug: 'royalty-checklist',
    name: 'Royalty Registration Checklist',
    summary: 'Track what each song of yours is registered for, and what is still leaving money on the table.',
  },
  {
    slug: 'funding',
    name: 'Funding Directory',
    summary: 'Grants, advances, emergency funds and fan funding — each with an honest line about what you give up.',
  },
  {
    slug: 'promo-checker',
    name: 'Promo & Playlist Scam Checker',
    summary: 'Answer a few questions about an offer or a playlist and get a read on how risky it looks, and why.',
  },
]

export const resourceToolPath = (slug: string): string =>
  `${RESOURCES_BASE_PATH}/tools/${slug}`

export const findToolBySlug = (slug: string): ResourceTool | undefined =>
  RESOURCE_TOOLS.find((tool) => tool.slug === slug)

/**
 * Every route this section owns, for the prerender list in nuxt.config.ts — a
 * static host serves keys, so a route that was never prerendered 404s however
 * correct the page component is.
 */
export const resourcesRoutes = (): string[] => [
  RESOURCES_BASE_PATH,
  ...RESOURCE_TOOLS.map((tool) => resourceToolPath(tool.slug)),
]
