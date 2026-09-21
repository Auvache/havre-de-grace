import type { MaybeRefOrGetter } from 'vue'
import { LUNCH_BREAK, lunchBreakTitle, lunchBreakUrl } from '~~/shared/lunch-break/config'
import { SHARE_IMAGE } from '~/composables/usePageSeo'

/**
 * Head and JSON-LD for every Lunch Break Records page.
 *
 * This deliberately does not call `usePageSeo`, even though it repeats a few
 * of its lines. Two reasons:
 *
 * 1. **Canonicals come from the brand config, not from the site's runtime
 *    config.** The spec for this section is that it can move to its own domain
 *    without a rewrite, so the canonical origin is `LUNCH_BREAK.origin` —
 *    today identical to `runtimeConfig.public.siteUrl`, tomorrow possibly not.
 *    Layering an override on top of usePageSeo would leave two `rel=canonical`
 *    links racing each other.
 *
 * 2. **No markdown mirror.** usePageSeo advertises a `<route>.md` twin for any
 *    route not on its exclusion list, and modules/agent-discovery.ts only
 *    writes mirrors for the routes it explicitly emits. A Lunch Break page
 *    going through usePageSeo would advertise an alternate that was never
 *    generated, pointing every cooperative agent at a 404.
 *
 * The share image is still the site's one card, imported rather than copied so
 * it cannot drift.
 */

export interface LunchBreakSeoOptions {
  /** Page title WITHOUT the brand suffix — this adds "| Lunch Break Records". */
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  /** Site-root-relative path, e.g. "/resources/tools/funding". */
  path: MaybeRefOrGetter<string>
  /** og:type. "article" for articles, "website" for the hub and the tools. */
  type?: MaybeRefOrGetter<string>
  /**
   * Keep the page out of the index regardless of the section-wide switch —
   * used for article drafts once the section itself is published.
   */
  noindex?: MaybeRefOrGetter<boolean>
}

export const useLunchBreakSeo = (options: LunchBreakSeoOptions) => {
  const canonicalUrl = computed(() => lunchBreakUrl(toValue(options.path)))
  const fullTitle = computed(() => lunchBreakTitle(toValue(options.title)))
  const imageUrl = computed(() => lunchBreakUrl(SHARE_IMAGE.src))

  /*
   * While `LUNCH_BREAK.published` is false the whole section carries a
   * `noindex, follow` route rule from nuxt.config.ts, which is also what keeps
   * the URLs out of sitemap.xml. This meta tag is the belt to that braces, and
   * it is the only mechanism for a single unpublished draft once the section
   * as a whole has launched.
   */
  const isNoindex = computed(() => !LUNCH_BREAK.published || Boolean(toValue(options.noindex)))

  useHead(() => ({
    link: [
      { rel: 'canonical', href: canonicalUrl.value },
    ],
    meta: isNoindex.value
      ? [{ name: 'robots', content: 'noindex, follow' }]
      : [],
  }))

  useSeoMeta({
    title: () => fullTitle.value,
    description: () => toValue(options.description),
    ogTitle: () => fullTitle.value,
    ogDescription: () => toValue(options.description),
    ogType: () => toValue(options.type) || 'website',
    ogUrl: () => canonicalUrl.value,
    ogSiteName: LUNCH_BREAK.name,
    ogImage: () => imageUrl.value,
    ogImageWidth: SHARE_IMAGE.width,
    ogImageHeight: SHARE_IMAGE.height,
    ogImageType: SHARE_IMAGE.type,
    ogImageAlt: SHARE_IMAGE.alt,
    twitterCard: 'summary_large_image',
    twitterTitle: () => fullTitle.value,
    twitterDescription: () => toValue(options.description),
    twitterImage: () => imageUrl.value,
    twitterImageAlt: SHARE_IMAGE.alt,
  })

  return {
    canonicalUrl,
    fullTitle,
    imageUrl,
  }
}

/**
 * The publisher/creator node every Lunch Break page points at.
 *
 * Lunch Break Records is a brand operated by one person, so it is an
 * Organization with Stefan as its founder rather than a second Person entity
 * competing with the one app.vue already defines for the music side.
 */
export const lunchBreakSchemaId = {
  brand: () => `${lunchBreakUrl(LUNCH_BREAK.basePath)}#lunch-break-records`,
  article: (url: string) => `${url}#article`,
  tool: (url: string) => `${url}#tool`,
  faq: (url: string) => `${url}#faq`,
}

/**
 * The JSON-LD node for a tool page.
 *
 * `WebApplication` rather than the broader `SoftwareApplication`: these run in
 * the browser, with nothing to download and nothing to install, which is
 * exactly the distinction the subtype exists to draw. `offers` at price 0 is
 * how "free" is stated in a way a parser can read — schema.org has no
 * `isFree`, and leaving it out reads as "price unknown".
 */
export const lunchBreakToolSchema = (options: {
  tool: { name: string, summary: string }
  canonicalUrl: string
  /** e.g. "MusicApplication", "BusinessApplication". */
  category?: string
}) => ({
  '@type': 'WebApplication',
  '@id': lunchBreakSchemaId.tool(options.canonicalUrl),
  name: options.tool.name,
  description: options.tool.summary,
  url: options.canonicalUrl,
  applicationCategory: options.category ?? 'BusinessApplication',
  operatingSystem: 'Any — runs in a web browser',
  browserRequirements: 'Requires JavaScript',
  isAccessibleForFree: true,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  publisher: { '@id': lunchBreakSchemaId.brand() },
})
