import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { DEFAULT_LOCALE, filterPostsByLocale } from '@/lib/posts'
import Main from './Main'

export default async function Page() {
  const sortedPosts = sortPosts(allBlogs)
  const posts = allCoreContent(sortedPosts)
  const localeSegment = DEFAULT_LOCALE
  const filteredPosts = filterPostsByLocale(posts, localeSegment)

  return <Main posts={filteredPosts} />
}
