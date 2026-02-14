import { slug as slugify } from 'github-slugger'
import type { Blog } from 'contentlayer/generated'
import type { CoreContent } from 'pliny/utils/contentlayer'

export type CoreBlog = CoreContent<Blog>

export interface SeriesInfo {
  slug: string
  name: string
}

export interface SeriesGroup extends SeriesInfo {
  posts: CoreBlog[]
}

const toSeriesOrder = (value?: number) =>
  typeof value === 'number' ? value : Number.POSITIVE_INFINITY

const bySeriesOrder = (a: CoreBlog, b: CoreBlog) => {
  const orderDiff = toSeriesOrder(a.seriesOrder) - toSeriesOrder(b.seriesOrder)
  if (orderDiff !== 0) return orderDiff
  return new Date(a.date).getTime() - new Date(b.date).getTime()
}

export const getSeriesSlug = (seriesName: string) => slugify(seriesName.trim())

export function getSeriesGroups(posts: CoreBlog[]): SeriesGroup[] {
  const seriesMap = new Map<string, SeriesGroup>()

  posts.forEach((post) => {
    const seriesName = post.series?.trim()
    if (!seriesName) return

    const seriesSlug = getSeriesSlug(seriesName)
    if (!seriesMap.has(seriesSlug)) {
      seriesMap.set(seriesSlug, { slug: seriesSlug, name: seriesName, posts: [] })
    }

    seriesMap.get(seriesSlug)!.posts.push(post)
  })

  return Array.from(seriesMap.values())
    .map((series) => ({
      ...series,
      posts: [...series.posts].sort(bySeriesOrder),
    }))
    .sort((a, b) => {
      const aLatest = Math.max(...a.posts.map((post) => new Date(post.date).getTime()))
      const bLatest = Math.max(...b.posts.map((post) => new Date(post.date).getTime()))
      return bLatest - aLatest
    })
}

export function findSeriesBySlug(posts: CoreBlog[], seriesSlug: string) {
  return getSeriesGroups(posts).find((series) => series.slug === seriesSlug)
}

export function getSeriesNavigation(posts: CoreBlog[], currentSlug: string, seriesName: string) {
  const seriesSlug = getSeriesSlug(seriesName)
  const series = findSeriesBySlug(posts, seriesSlug)
  if (!series) return null

  const index = series.posts.findIndex((post) => post.slug === currentSlug)
  if (index < 0) return null

  return {
    series: { slug: series.slug, name: series.name } as SeriesInfo,
    prev: series.posts[index - 1],
    next: series.posts[index + 1],
  }
}
