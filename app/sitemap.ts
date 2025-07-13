import { MetadataRoute } from 'next'
import { allBlogs } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'
import { joinUrl } from '../lib/utils'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteMetadata.siteUrl

  const blogRoutes = allBlogs
    .filter((post) => !post.draft)
    .map((post) => ({
      url: joinUrl(siteUrl, post.path),
      lastModified: post.lastmod || post.date,
    }))

  const routes = ['', 'blog', 'tags'].map((route) => ({
    url: joinUrl(siteUrl, route),
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...blogRoutes]
}
