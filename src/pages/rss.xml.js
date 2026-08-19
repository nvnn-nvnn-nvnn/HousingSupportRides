import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'

export async function GET(context) {
  const posts = await getCollection('journal', ({ data }) => !data.draft)

  return rss({
    title: 'Housing Support Rides — Journal',
    description: 'Field updates, water quality results, and stories from the watershed.',
    site: context.site,
    items: posts
      .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf())
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.publishedAt,
        description: post.data.excerpt || post.data.title,
        categories: [post.data.category, ...post.data.tags],
        link: `/journal/${post.id}/`,
      })),
  })
}
