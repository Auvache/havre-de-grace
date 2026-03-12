const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be']

const isYoutubeHost = (hostname: string) => YOUTUBE_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`))

const parseUrl = (url: string) => {
  try {
    return new URL(url)
  }
  catch {
    return null
  }
}

export const toEmbedUrl = (url: string) => {
  if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com/video/')) {
    return url
  }

  const parsed = parseUrl(url)
  if (!parsed) {
    return url
  }

  if (parsed.hostname.includes('youtu.be')) {
    const id = parsed.pathname.replace('/', '')
    return id ? `https://www.youtube.com/embed/${id}` : url
  }

  if (isYoutubeHost(parsed.hostname)) {
    const id = parsed.searchParams.get('v')
    return id ? `https://www.youtube.com/embed/${id}` : url
  }

  if (parsed.hostname.includes('vimeo.com')) {
    const id = parsed.pathname.split('/').filter(Boolean).pop()
    return id ? `https://player.vimeo.com/video/${id}` : url
  }

  return url
}

export const toVideoThumbnailUrl = (url: string) => {
  const embedUrl = toEmbedUrl(url)
  const parsed = parseUrl(embedUrl)
  if (!parsed) {
    return undefined
  }

  if (isYoutubeHost(parsed.hostname)) {
    const id = parsed.pathname.split('/').filter(Boolean).pop()
    return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined
  }

  return undefined
}
