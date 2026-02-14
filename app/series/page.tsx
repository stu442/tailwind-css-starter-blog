import Link from '@/components/Link'
import { allBlogs } from 'contentlayer/generated'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { formatDate } from 'pliny/utils/formatDate'
import siteMetadata from '@/data/siteMetadata'
import { genPageMetadata } from 'app/seo'
import { getSeriesGroups } from '@/lib/series'

export const metadata = genPageMetadata({
  title: 'Series',
  description: 'Browse posts organized by series',
})

export default async function SeriesPage() {
  const posts = allCoreContent(sortPosts([...allBlogs]))
  const seriesGroups = getSeriesGroups(posts)

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
          Series
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          Related posts grouped into a single reading flow.
        </p>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {seriesGroups.length === 0 && (
          <li className="py-12 text-gray-500 dark:text-gray-400">No series found.</li>
        )}
        {seriesGroups.map((series) => {
          const latestPostDate = series.posts.reduce((latest, post) => {
            return new Date(post.date).getTime() > new Date(latest).getTime() ? post.date : latest
          }, series.posts[0].date)
          return (
            <li key={series.slug} className="py-8">
              <article>
                <h2 className="text-2xl leading-8 font-bold tracking-tight">
                  <Link
                    href={`/series/${series.slug}`}
                    className="text-gray-900 dark:text-gray-100"
                  >
                    {series.name}
                  </Link>
                </h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {series.posts.length} posts
                  {latestPostDate && (
                    <>
                      {' • Latest: '}
                      {formatDate(latestPostDate, siteMetadata.locale)}
                    </>
                  )}
                </p>
              </article>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
