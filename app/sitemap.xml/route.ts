import { allBlogs } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'
import { joinUrl } from '@/lib/utils'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { getSeriesGroups } from '@/lib/series'

export const dynamic = 'force-static'

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>'
const XML_NAMESPACE = 'http://www.sitemaps.org/schemas/sitemap/0.9'

const buildUrlEntry = (loc: string, lastmod: string) => `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>
`

export async function GET() {
  const siteUrl = siteMetadata.siteUrl
  const today = new Date().toISOString()

  const staticRoutes = ['', 'blog', 'series', 'tags'].map((route) => ({
    loc: joinUrl(siteUrl, route),
    lastmod: today,
  }))

  const blogRoutes = allBlogs
    .filter((post) => !post.draft)
    .map((post) => ({
      loc: joinUrl(siteUrl, post.path),
      lastmod: new Date(post.lastmod || post.date).toISOString(),
    }))

  const publishedCoreBlogs = allCoreContent(sortPosts([...allBlogs]))
  const seriesRoutes = getSeriesGroups(publishedCoreBlogs).map((series) => {
    const lastmod = series.posts.reduce(
      (latestDate, post) => {
        const candidateDate = new Date(post.lastmod || post.date).toISOString()
        return candidateDate > latestDate ? candidateDate : latestDate
      },
      new Date(series.posts[0].lastmod || series.posts[0].date).toISOString()
    )

    return {
      loc: joinUrl(siteUrl, `series/${series.slug}`),
      lastmod,
    }
  })

  const urls = [...staticRoutes, ...seriesRoutes, ...blogRoutes]
    .map((entry) => buildUrlEntry(entry.loc, entry.lastmod))
    .join('')

  const body = `${XML_HEADER}
<urlset xmlns="${XML_NAMESPACE}">${urls}
</urlset>
`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
    },
  })
}
