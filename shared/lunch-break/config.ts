/**
 * Lunch Break Records — the one config object the whole sub-brand reads from.
 *
 * Lunch Break Records is a free resources section for independent musicians,
 * made by Stefan of Havre De Grace. It lives at /resources on
 * havredegracemusic.com today and is built to move to its own domain later
 * without a rewrite, which is why nothing below is hardcoded anywhere else:
 *
 *   - Every route sits under one prefix (`basePath`).
 *   - Every component sits in app/components/lunchbreak/.
 *   - Every piece of content sits in content/lunch-break/.
 *   - The brand name, tagline and canonical origin come from here.
 *
 * Moving the section to lunchbreakrecords.com is then: point `origin` at the
 * new host, keep `basePath` as '/' or '/resources' depending on whether the
 * paths are preserved, and leave 301s behind on this site. No component or
 * article has to change.
 *
 * Imported by nuxt.config.ts as well as by the pages, so it must stay free of
 * Nuxt runtime imports — plain data and pure functions only.
 */

export interface LunchBreakTool {
  /** Path segment under `${basePath}/tools`. */
  slug: string
  name: string
  /** One line for the hub card and the tool page's meta description. */
  summary: string
  /** Slug of the article this tool is paired with. */
  pairedArticle: string
  /** Short verb phrase for the hub card's call to action. */
  action: string
}

export const LUNCH_BREAK = {
  name: 'Lunch Break Records',
  /**
   * Shipped tagline. `taglineAlternates` are the other candidates, kept here
   * rather than in a doc so swapping one in is a one-word edit.
   * TODO(Stefan): pick one and delete the rest.
   */
  tagline: 'Serious tools for musicians with day jobs.',
  taglineAlternates: [
    'For musicians who are also everything else.',
    'The music business, in the time you actually have.',
    'Career admin for people with a shift to get back to.',
  ],

  /**
   * Canonical origin. Today it is the Havre De Grace site, so canonical URLs
   * agree with the rest of the pages; the day this moves, it becomes
   * 'https://lunchbreakrecords.com' and every canonical, JSON-LD @id and
   * share URL follows.
   */
  origin: 'https://havredegracemusic.com',

  /**
   * Route prefix. Deliberately '/resources' rather than '/lunch-break': it
   * describes what the pages are, it is what someone would guess, and it
   * survives the move to a separate domain as a redirect target.
   */
  basePath: '/resources',

  /** The v1 feedback loop: a mailto link, no backend. */
  feedbackEmail: 'stefan@havredegracemusic.com',

  /** Byline back to the music, shown on every page in the section. */
  byline: {
    text: 'Made by Stefan of Havre De Grace',
    href: '/',
  },

  /**
   * What this is, in the words that have to appear on the hub and nowhere
   * ambiguously. Lunch Break Records is a joke label name attached to a free
   * resource site; nobody should be able to mistake it for one that signs
   * artists.
   */
  about: {
    is: 'Lunch Break Records is a free resource site: guides and browser-based tools for independent musicians, written and built by one working songwriter.',
    isNot: 'It is not a record label. It does not sign artists, release records, take a cut of anyone\'s income, or offer label, management or distribution services. The name is a joke about when the work gets done.',
  },

  /**
   * --- Launch switch ---------------------------------------------------
   *
   * `published: false` keeps the whole section out of search and out of the
   * sitemap (via the `noindex` route rules in nuxt.config.ts, which also drop
   * the URLs from sitemap.xml) and out of the markdown mirrors and llms.txt.
   * The pages are still built and still reachable by typing the URL, which is
   * what makes them reviewable.
   *
   * Nothing links to /resources from the rest of the site yet either — see
   * `navLink` below for the link that goes in when this flips.
   *
   * To launch: set this true, uncomment the nav entry in AppNavbar, flip
   * `draft: false` on the articles Stefan has edited, and rebuild.
   */
  published: false,

  /**
   * Whether article drafts (`draft: true` in frontmatter) are listed and
   * rendered. True while the section is unpublished, so Stefan can read the
   * drafts on a real page; once `published` flips, drafts drop off the hub and
   * their pages carry a noindex of their own until he clears the flag.
   */
  get showDrafts(): boolean {
    return !this.published
  },

  /**
   * The navigation entry this section gets when it launches. "For Musicians"
   * rather than "Resources" or "Lunch Break": Havre De Grace's audience is
   * people who came for the songs, and the label has to explain itself to
   * someone who has never heard the brand name.
   */
  navLink: {
    label: 'for musicians',
    to: '/resources',
  },

  tools: <LunchBreakTool[]>[
    {
      slug: 'royalty-checklist',
      name: 'Royalty Registration Checklist',
      summary: 'Track what each song of yours is registered for, and what is still leaving money on the table.',
      pairedArticle: 'royalties-your-distributor-isnt-collecting',
      action: 'Open the checklist',
    },
    {
      slug: 'funding',
      name: 'Funding Directory',
      summary: 'Grants, advances, emergency funds and fan funding — each with an honest line about what you give up.',
      pairedArticle: 'funding-for-independent-artists',
      action: 'Browse the directory',
    },
    {
      slug: 'promo-checker',
      name: 'Promo & Playlist Scam Checker',
      summary: 'Answer a few questions about an offer or a playlist and get a read on how risky it looks, and why.',
      pairedArticle: 'how-to-spot-playlist-and-promo-scams',
      action: 'Run the check',
    },
  ],
}

/** `/resources`, `/resources/some-article`, `/resources/tools/funding`. */
export const lunchBreakPath = (...segments: string[]): string => {
  const tail = segments.filter(Boolean).join('/')
  return tail ? `${LUNCH_BREAK.basePath}/${tail}` : LUNCH_BREAK.basePath
}

export const lunchBreakToolPath = (slug: string): string => lunchBreakPath('tools', slug)

export const lunchBreakArticlePath = (slug: string): string => lunchBreakPath(slug)

/** Absolute URL, for canonicals, JSON-LD @ids and share links. */
export const lunchBreakUrl = (path: string): string =>
  `${LUNCH_BREAK.origin.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`

/** `<Page title> | Lunch Break Records`, the branded title pattern. */
export const lunchBreakTitle = (pageTitle: string): string => `${pageTitle} | ${LUNCH_BREAK.name}`

export const findToolBySlug = (slug: string): LunchBreakTool | undefined =>
  LUNCH_BREAK.tools.find((tool) => tool.slug === slug)

export const findToolByArticle = (articleSlug: string): LunchBreakTool | undefined =>
  LUNCH_BREAK.tools.find((tool) => tool.pairedArticle === articleSlug)

/**
 * Every route this section owns. nuxt.config.ts reads this for the prerender
 * list (a static host serves keys — an unprerendered route 404s) and for the
 * `noindex` route rules while `published` is false.
 *
 * Article routes are listed from the filenames in content/lunch-break/articles
 * rather than crawled, so adding an article is one entry here plus the file.
 */
export const LUNCH_BREAK_ARTICLE_SLUGS = [
  'royalties-your-distributor-isnt-collecting',
  'funding-for-independent-artists',
  'how-to-spot-playlist-and-promo-scams',
  'own-your-audience',
] as const

export const lunchBreakRoutes = (): string[] => [
  LUNCH_BREAK.basePath,
  ...LUNCH_BREAK_ARTICLE_SLUGS.map((slug) => lunchBreakArticlePath(slug)),
  ...LUNCH_BREAK.tools.map((tool) => lunchBreakToolPath(tool.slug)),
]
