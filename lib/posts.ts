import siteMetadata from '@/data/siteMetadata'
import { type CoreContent } from 'pliny/utils/contentlayer'
import { type Blog } from 'contentlayer/generated'

export const SUPPORTED_LOCALES = ['ko', 'en', 'ja'] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

const FALLBACK_LOCALE = SUPPORTED_LOCALES[0]

export function isSupportedLocale(locale: string | undefined): locale is SupportedLocale {
  return locale ? SUPPORTED_LOCALES.includes(locale as SupportedLocale) : false
}

const configuredLocale = siteMetadata.locale?.split('-')[0]?.toLowerCase()

export const DEFAULT_LOCALE: SupportedLocale = isSupportedLocale(configuredLocale)
  ? configuredLocale
  : FALLBACK_LOCALE

export function resolveLocaleFromSlug(slug: string): SupportedLocale {
  const [maybeLocale] = slug.split('/')
  if (slug.includes('/') && isSupportedLocale(maybeLocale)) {
    return maybeLocale
  }
  return DEFAULT_LOCALE
}

export function resolveLocaleFromPath(pathname?: string | null): SupportedLocale {
  if (!pathname || pathname === '/') {
    return DEFAULT_LOCALE
  }
  const [, firstSegment] = pathname.split('/')
  if (isSupportedLocale(firstSegment)) {
    return firstSegment
  }
  return DEFAULT_LOCALE
}

function isExternalPath(path: string) {
  return /^(https?:)?\/\//.test(path) || /^[a-z][a-z0-9+.-]*:/.test(path)
}

function normalizePath(path: string) {
  if (isExternalPath(path) || path.startsWith('#')) {
    return path
  }
  if (!path || path === '/') {
    return '/'
  }
  return path.startsWith('/') ? path : `/${path}`
}

export function buildLocalizedPath(path: string, locale: SupportedLocale) {
  const normalized = normalizePath(path)
  if (isExternalPath(normalized) || normalized.startsWith('#')) {
    return normalized
  }
  if (normalized === '/') {
    return locale === DEFAULT_LOCALE ? '/' : `/${locale}`
  }
  return locale === DEFAULT_LOCALE ? normalized : `/${locale}${normalized}`
}

export function filterPostsByLocale(posts: CoreContent<Blog>[], localeSegment: SupportedLocale) {
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
