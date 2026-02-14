import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'
import { allBlogs } from 'contentlayer/generated'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { formatDate } from 'pliny/utils/formatDate'
import { genPageMetadata } from 'app/seo'
import { findSeriesBySlug, getSeriesGroups } from '@/lib/series'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const params = await props.params
  const slug = decodeURI(params.slug)
  const posts = allCoreContent(sortPosts([...allBlogs]))
  const series = findSeriesBySlug(posts, slug)

  if (!series) {
    return genPageMetadata({
      title: 'Series',
      description: 'Series not found',
    })
  }

  return genPageMetadata({
    title: series.name,
    description: `${series.name} series posts`,
  })
}

export const generateStaticParams = async () => {
  const posts = allCoreContent(sortPosts([...allBlogs]))
  const seriesGroups = getSeriesGroups(posts)
  return seriesGroups.map((series) => ({
    slug: encodeURI(series.slug),
  }))
}

export default async function SeriesDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params
  const slug = decodeURI(params.slug)
  const posts = allCoreContent(sortPosts([...allBlogs]))
  const series = findSeriesBySlug(posts, slug)

  if (!series) {
    return notFound()
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <p className="text-base text-gray-500 dark:text-gray-400">
          <Link
            href="/series"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
          >
            &larr; All series
          </Link>
        </p>
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
          {series.name}
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          {series.posts.length} posts in this series
        </p>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {series.posts.map((post, index) => (
          <li key={post.slug} className="py-8">
            <article>
              <p className="text-primary-500 dark:text-primary-400 text-sm font-medium">
                Part {index + 1}
              </p>
              <h2 className="text-2xl leading-8 font-bold tracking-tight">
                <Link href={`/${post.path}`} className="text-gray-900 dark:text-gray-100">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {formatDate(post.date, siteMetadata.locale)}
              </p>
              {post.summary && (
                <p className="prose mt-3 max-w-none text-gray-500 dark:text-gray-400">
                  {post.summary}
                </p>
              )}
            </article>
          </li>
        ))}
      </ul>
    </div>
  )
}
