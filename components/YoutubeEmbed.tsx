type YoutubeEmbedProps = {
  url: string
  title?: string
}

const toSeconds = (value: string | null) => {
  if (!value) return undefined
  const parts = value.match(/(\d+)(h|m|s)?/gi)
  if (!parts) return undefined

  return parts.reduce((total, part) => {
    const [, amount, unit] = part.match(/(\d+)(h|m|s)?/i) || []
    const num = Number(amount)
    if (!num) return total
    if (unit === 'h') return total + num * 3600
    if (unit === 'm') return total + num * 60
    return total + num
  }, 0)
}

const buildEmbedUrl = (rawUrl: string) => {
  try {
    const parsed = new URL(rawUrl)
    const host = parsed.hostname.replace('www.', '')

    let videoId = ''
    if (host === 'youtu.be') {
      videoId = parsed.pathname.slice(1)
    } else if (host === 'youtube.com' || host === 'm.youtube.com') {
      videoId = parsed.searchParams.get('v') || ''
      if (!videoId && parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.replace('/embed/', '')
      }
      if (!videoId && parsed.pathname.startsWith('/shorts/')) {
        videoId = parsed.pathname.replace('/shorts/', '')
      }
    }

    if (!videoId) return null

    const start = toSeconds(parsed.searchParams.get('t') || parsed.searchParams.get('start'))
    const startQuery = start ? `?start=${start}` : ''

    return `https://www.youtube.com/embed/${videoId}${startQuery}`
  } catch (error) {
    return null
  }
}

const YoutubeEmbed = ({ url, title = 'YouTube video player' }: YoutubeEmbedProps) => {
  const embedUrl = buildEmbedUrl(url)

  if (!embedUrl) {
    return (
      <div className="my-6">
        <a
          className="text-primary-500 underline underline-offset-4"
          href={url}
          rel="noopener noreferrer"
          target="_blank"
        >
          YouTube에서 보기
        </a>
      </div>
    )
  }

  return (
    <div className="my-8">
      <div className="relative aspect-video overflow-hidden rounded-xl border border-gray-200/60 shadow-sm dark:border-gray-700">
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 h-full w-full"
          referrerPolicy="strict-origin-when-cross-origin"
          src={embedUrl}
          title={title}
        />
      </div>
    </div>
  )
}

export default YoutubeEmbed
