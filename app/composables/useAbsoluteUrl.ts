const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

export const useAbsoluteUrl = () => {
  const runtimeConfig = useRuntimeConfig()
  const siteUrl = trimTrailingSlash(runtimeConfig.public.siteUrl || 'https://havredegracemusic.com')

  const toAbsoluteUrl = (pathOrUrl: string) => {
    if (!pathOrUrl) {
      return siteUrl
    }

    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
      return pathOrUrl
    }

    if (pathOrUrl.startsWith('//')) {
      return `https:${pathOrUrl}`
    }

    return `${siteUrl}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
  }

  return {
    siteUrl,
    toAbsoluteUrl,
  }
}
