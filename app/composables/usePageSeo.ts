import type { MaybeRefOrGetter } from 'vue'

interface PageSeoOptions {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  keywords?: MaybeRefOrGetter<string | string[] | undefined>
  path?: MaybeRefOrGetter<string>
  image?: MaybeRefOrGetter<string | undefined>
  type?: MaybeRefOrGetter<string>
}

export const usePageSeo = (options: PageSeoOptions) => {
  const route = useRoute()
  const siteProfile = useSiteProfile()
  const { toAbsoluteUrl } = useAbsoluteUrl()

  const canonicalUrl = computed(() => toAbsoluteUrl(toValue(options.path) || route.path))
  const imageUrl = computed(() => toAbsoluteUrl(toValue(options.image) || '/press/media-pic-wide.jpg'))
  const pageType = computed(() => toValue(options.type) || 'website')
  const keywordContent = computed(() => {
    const value = toValue(options.keywords)
    if (Array.isArray(value)) {
      return value.join(', ')
    }

    return value || 'Havre De Grace Music, Havre De Grace Band, Havre De Grace, acoustic folk music, singer-songwriter, indie folk, Vancouver WA music'
  })

  useHead(() => ({
    link: [
      { rel: 'canonical', href: canonicalUrl.value },
    ],
  }))

  useSeoMeta({
    title: () => toValue(options.title),
    description: () => toValue(options.description),
    keywords: () => keywordContent.value,
    ogTitle: () => toValue(options.title),
    ogDescription: () => toValue(options.description),
    ogType: () => pageType.value,
    ogUrl: () => canonicalUrl.value,
    ogImage: () => imageUrl.value,
    ogSiteName: 'Havre De Grace Music',
    twitterCard: 'summary_large_image',
    twitterTitle: () => toValue(options.title),
    twitterDescription: () => toValue(options.description),
    twitterImage: () => imageUrl.value,
  })

  return {
    canonicalUrl,
    imageUrl,
  }
}
