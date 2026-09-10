import type { MaybeRefOrGetter } from 'vue'

/**
 * The share card, on every page: the anchor lockup reversed out of ink at
 * 1200x630. Generated from public/logos/suite/d2-og-image-dark.svg by
 * tools/logo/rasterize.mjs — edit the SVG and re-run that rather than touching
 * the PNG.
 *
 * Pages used to hand their own artwork to this instead — an album cover on the
 * home, album and song pages. One card everywhere is the deliberate choice: it
 * is the mark that gets recognised in a feed, and the covers are square, which
 * a summary_large_image card letterboxes or crops. The covers are still the
 * schema.org image for the albums they belong to; this is only what a link
 * unfurls to.
 *
 * Dimensions are declared rather than inferred. nuxt-og-image used to stamp
 * every page with 1200x630 / image/jpeg regardless of what was being served,
 * so it is disabled in nuxt.config.ts and these values are the source of truth.
 */
export const SHARE_IMAGE = {
  src: '/og-image.png',
  width: 1200,
  height: 630,
  type: 'image/png',
  alt: 'Havre De Grace',
} as const

interface PageSeoOptions {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  path?: MaybeRefOrGetter<string>
  type?: MaybeRefOrGetter<string>
}

export const usePageSeo = (options: PageSeoOptions) => {
  const route = useRoute()
  const { toAbsoluteUrl } = useAbsoluteUrl()

  const canonicalUrl = computed(() => toAbsoluteUrl(toValue(options.path) || route.path))
  const imageUrl = computed(() => toAbsoluteUrl(SHARE_IMAGE.src))
  const pageType = computed(() => toValue(options.type) || 'website')

  useHead(() => ({
    link: [
      { rel: 'canonical', href: canonicalUrl.value },
    ],
  }))

  // The `keywords` meta tag is deliberately absent — Google has ignored it since
  // 2009 and it was the only place the site still repeated a keyword list.
  useSeoMeta({
    title: () => toValue(options.title),
    description: () => toValue(options.description),
    ogTitle: () => toValue(options.title),
    ogDescription: () => toValue(options.description),
    ogType: () => pageType.value,
    ogUrl: () => canonicalUrl.value,
    ogSiteName: 'Havre De Grace Music',
    ogImage: () => imageUrl.value,
    ogImageWidth: SHARE_IMAGE.width,
    ogImageHeight: SHARE_IMAGE.height,
    ogImageType: SHARE_IMAGE.type,
    ogImageAlt: SHARE_IMAGE.alt,
    twitterCard: 'summary_large_image',
    twitterTitle: () => toValue(options.title),
    twitterDescription: () => toValue(options.description),
    twitterImage: () => imageUrl.value,
    twitterImageAlt: SHARE_IMAGE.alt,
  })

  return {
    canonicalUrl,
    imageUrl,
  }
}
