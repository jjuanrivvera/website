/**
 * RSS Feed (English)
 *
 * Generates RSS 2.0 feed with full content and HTML sanitization
 * Follows best practices for blog RSS feeds
 */

import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE_CONFIG } from '@config/site';

export async function GET(context: APIContext) {
  const isDev = import.meta.env.DEV;

  // Get all published English posts, sorted by date
  const posts = (
    await getCollection('blog', ({ data }) => {
      return data.lang === 'en' && (isDev || !data.draft);
    })
  ).sort((a, b) => {
    const dateA = a.data.updatedDate || a.data.pubDate;
    const dateB = b.data.updatedDate || b.data.pubDate;
    return dateB.getTime() - dateA.getTime();
  });

  return rss({
    title: 'Juan Felipe Rivera Gonzalez - Blog',
    description:
      'Articles about web development, software engineering, and technology by Juan Felipe Rivera Gonzalez, Full Stack Developer.',
    site: context.site ?? SITE_CONFIG.url,
    items: posts.map((post) => {
      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: `/blog/${post.id.replace(/^en\//, '').replace(/\.(md|mdx)$/, '')}`,
        author: `${post.data.author} <noreply@jjuanrivvera.com>`,
        categories: post.data.tags,
        customData: `
          ${
            post.data.cover
              ? `<enclosure url="${
                  typeof post.data.cover === 'string'
                    ? post.data.cover
                    : `${context.site}${post.data.cover.src}`
                }" type="image/jpeg" />`
              : ''
          }
          ${post.data.featured ? '<featured>true</featured>' : ''}
          ${post.data.updatedDate ? `<atom:updated>${post.data.updatedDate.toISOString()}</atom:updated>` : ''}
        `,
      };
    }),
    customData: `
      <language>en-us</language>
      <copyright>Copyright ${new Date().getFullYear()} Juan Felipe Rivera Gonzalez</copyright>
      <managingEditor>noreply@jjuanrivvera.com (Juan Felipe Rivera Gonzalez)</managingEditor>
      <webMaster>noreply@jjuanrivvera.com (Juan Felipe Rivera Gonzalez)</webMaster>
      <ttl>60</ttl>
      <image>
        <url>${SITE_CONFIG.url}/og-image.jpg</url>
        <title>Juan Felipe Rivera Gonzalez - Blog</title>
        <link>${SITE_CONFIG.url}/blog</link>
      </image>
    `,
    stylesheet: '/rss-styles.xsl',
  });
}
