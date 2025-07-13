import { MetadataRoute } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { joinUrl } from '../lib/utils'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: joinUrl(siteMetadata.siteUrl, 'sitemap.xml'),
    host: siteMetadata.siteUrl,
  }
}
