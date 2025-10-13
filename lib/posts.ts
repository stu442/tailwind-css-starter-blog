import siteMetadata from '@/data/siteMetadata'
import { type CoreContent } from 'pliny/utils/contentlayer'
import { type Blog } from 'contentlayer/generated'

export const SUPPORTED_LOCALES = ['ko', 'en', 'ja'] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE =
  siteMetadata.locale?.split('-')[0]?.toLowerCase() ?? (SUPPORTED_LOCALES[0] as string)

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale)
}

export function filterPostsByLocale(posts: CoreContent<Blog>[], localeSegment: string) {
  return posts.filter((post) => {
    const normalizedPath = post.path.replace(/^blog\//, '')
    const [pathLocale] = normalizedPath.split('/')
    const hasLocalePrefix = normalizedPath.includes('/')

    if (!hasLocalePrefix) {
      return localeSegment === DEFAULT_LOCALE
    }

    return pathLocale === localeSegment
  })
}
