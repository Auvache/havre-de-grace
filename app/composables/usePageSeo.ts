import type { MaybeRefOrGetter } from 'vue'

/**
 * Social-share image. Dimensions are declared explicitly rather than inferred:
 * nuxt-og-image used to stamp every page with 1200x630 / image/jpeg, which was
 * wrong for the square album artwork actually being served (and the artwork was
 * served as a raw 3000x3000, 5 MB PNG). That module is disabled in
 * nuxt.config.ts; these values are the source of truth.
 */
export interface PageSeoImage {
  src: string
  width: number
  height: number
  type?: string
  alt?: string
}

/** Brand fallback: 1200x630, 143 KB, reads "MUSIC BY HAVRE DE GRACE". */
export const DEFAULT_SEO_IMAGE: PageSeoImage = {
  src: '/og-image.jpg',
  width: 1200,
  height: 630,
  type: 'image/jpeg',
  alt: 'Music by Havre De Grace',
}

interface PageSeoOptions {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  path?: MaybeRefOrGetter<string>
  image?: MaybeRefOrGetter<PageSeoImage | undefined>
  type?: MaybeRefOrGetter<string>
}

export const usePageSeo = (options: PageSeoOptions) => {
  const route = useRoute()
  const { toAbsoluteUrl } = useAbsoluteUrl()

  const canonicalUrl = computed(() => toAbsoluteUrl(toValue(options.path) || route.path))
  const image = computed(() => toValue(options.image) ?? DEFAULT_SEO_IMAGE)
  const imageUrl = computed(() => toAbsoluteUrl(image.value.src))
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
    ogImageWidth: () => image.value.width,
    ogImageHeight: () => image.value.height,
    ogImageType: () => image.value.type ?? 'image/jpeg',
    ogImageAlt: () => image.value.alt,
    twitterCard: 'summary_large_image',
    twitterTitle: () => toValue(options.title),
    twitterDescription: () => toValue(options.description),
    twitterImage: () => imageUrl.value,
    twitterImageAlt: () => image.value.alt,
  })

  return {
    canonicalUrl,
    imageUrl,
  }
}
