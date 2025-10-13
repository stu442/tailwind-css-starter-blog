import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { notFound } from 'next/navigation'
import Main from '../Main'
import {
  DEFAULT_LOCALE,
  filterPostsByLocale,
  isSupportedLocale,
  SUPPORTED_LOCALES,
} from '@/lib/posts'

type Params = {
  locale: string
}

export function generateStaticParams() {
  return SUPPORTED_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE).map((locale) => ({
    locale,
  }))
}

export default async function LocaleHome({ params }: { params: Params }) {
  const { locale } = params

  if (!isSupportedLocale(locale) || locale === DEFAULT_LOCALE) {
    notFound()
  }

  const sortedPosts = sortPosts(allBlogs)
  const posts = allCoreContent(sortedPosts)
  const filteredPosts = filterPostsByLocale(posts, locale)

  return <Main posts={filteredPosts} />
}
