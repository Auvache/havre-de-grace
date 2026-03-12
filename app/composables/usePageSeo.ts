import type { MaybeRefOrGetter } from 'vue'

interface PageSeoOptions {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
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

  useHead(() => ({
    link: [
      { rel: 'canonical', href: canonicalUrl.value },
    ],
  }))

  useSeoMeta({
    title: () => toValue(options.title),
    description: () => toValue(options.description),
    ogTitle: () => toValue(options.title),
    ogDescription: () => toValue(options.description),
    ogType: () => pageType.value,
    ogUrl: () => canonicalUrl.value,
    ogImage: () => imageUrl.value,
    ogSiteName: siteProfile.artistName,
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
