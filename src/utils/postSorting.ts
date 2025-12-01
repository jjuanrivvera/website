import type { CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

/**
 * Sort blog posts by date (newest first)
 * Uses updatedDate if available, otherwise pubDate
 */
export function sortPostsByDate(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => {
    const dateA = a.data.updatedDate || a.data.pubDate;
    const dateB = b.data.updatedDate || b.data.pubDate;
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Sort blog posts by date (oldest first)
 */
export function sortPostsByDateAsc(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => {
    const dateA = a.data.updatedDate || a.data.pubDate;
    const dateB = b.data.updatedDate || b.data.pubDate;
    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Get the effective date for a post (updatedDate or pubDate)
 */
export function getPostDate(post: BlogPost): Date {
  return post.data.updatedDate || post.data.pubDate;
}
