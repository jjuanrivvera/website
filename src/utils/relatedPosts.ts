/**
 * Related posts algorithm
 * Finds similar posts based on tag similarity and recency
 */

import type { BlogPost, RelatedPost } from '@models/blog';
import { BLOG_CONFIG } from '@config/blog';

interface RelatedPostsOptions {
  limit?: number;
  sameLangOnly?: boolean;
  excludeDrafts?: boolean;
}

const DEFAULT_OPTIONS: Required<RelatedPostsOptions> = {
  limit: BLOG_CONFIG.relatedPostsLimit,
  sameLangOnly: true,
  excludeDrafts: true,
};

/**
 * Calculate Jaccard similarity between two sets of tags
 * Jaccard = |A ∩ B| / |A ∪ B|
 */
function calculateTagSimilarity(tagsA: string[], tagsB: string[]): number {
  const setA = new Set(tagsA.map((t) => t.toLowerCase()));
  const setB = new Set(tagsB.map((t) => t.toLowerCase()));

  // Calculate intersection
  const intersection = new Set([...setA].filter((x) => setB.has(x)));

  // Calculate union
  const union = new Set([...setA, ...setB]);

  // Avoid division by zero
  if (union.size === 0) return 0;

  return intersection.size / union.size;
}

/**
 * Calculate recency score (0-1 scale)
 * More recent posts get higher scores
 */
function calculateRecencyScore(postDate: Date, newestDate: Date): number {
  const daysDiff = Math.abs(
    (newestDate.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Posts within 30 days get max score, older posts decay
  if (daysDiff <= 30) return 1;
  if (daysDiff <= 90) return 0.8;
  if (daysDiff <= 180) return 0.6;
  if (daysDiff <= 365) return 0.4;
  return 0.2;
}

/**
 * Find related posts for a given post
 * @param currentPost - The post to find related posts for
 * @param allPosts - All available blog posts
 * @param options - Configuration options
 * @returns Array of related posts with similarity scores
 */
export function getRelatedPosts(
  currentPost: BlogPost,
  allPosts: BlogPost[],
  options: RelatedPostsOptions = {}
): BlogPost[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Filter out the current post and apply filters
  let candidates = allPosts.filter((post) => {
    // Exclude current post
    if (post.id === currentPost.id) return false;

    // Exclude drafts if option is set
    if (opts.excludeDrafts && post.data.draft) return false;

    // Filter by language if option is set
    if (opts.sameLangOnly && post.data.lang !== currentPost.data.lang) {
      return false;
    }

    return true;
  });

  // Find newest post date for recency calculation
  const newestDate = new Date(
    Math.max(
      ...candidates.map((p) =>
        p.data.updatedDate
          ? p.data.updatedDate.getTime()
          : p.data.pubDate.getTime()
      )
    )
  );

  // Calculate similarity scores
  const scoredPosts: RelatedPost[] = candidates.map((post) => {
    const tagSimilarity = calculateTagSimilarity(
      currentPost.data.tags,
      post.data.tags
    );

    const postDate = post.data.updatedDate || post.data.pubDate;
    const recencyScore = calculateRecencyScore(postDate, newestDate);

    // Weighted score: configurable weights
    const score =
      tagSimilarity * BLOG_CONFIG.relatedPostsScoring.tagSimilarityWeight +
      recencyScore * BLOG_CONFIG.relatedPostsScoring.recencyWeight;

    return { post, score };
  });

  // Sort by score (highest first) and take top N
  const related = scoredPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, opts.limit)
    .map((item) => item.post);

  return related;
}

/**
 * Get posts by specific tag
 */
export function getPostsByTag(
  allPosts: BlogPost[],
  tag: string,
  excludeDrafts: boolean = true
): BlogPost[] {
  return allPosts
    .filter((post) => {
      if (excludeDrafts && post.data.draft) return false;
      return post.data.tags.some((t) => t.toLowerCase() === tag.toLowerCase());
    })
    .sort(
      (a, b) =>
        (b.data.updatedDate || b.data.pubDate).getTime() -
        (a.data.updatedDate || a.data.pubDate).getTime()
    );
}

/**
 * Get all unique tags from posts with counts
 */
export function getAllTags(
  posts: BlogPost[],
  excludeDrafts: boolean = true
): Map<string, number> {
  const tagCounts = new Map<string, number>();

  posts.forEach((post) => {
    if (excludeDrafts && post.data.draft) return;

    post.data.tags.forEach((tag) => {
      const normalized = tag.toLowerCase();
      tagCounts.set(normalized, (tagCounts.get(normalized) || 0) + 1);
    });
  });

  // Sort by count descending
  return new Map([...tagCounts.entries()].sort((a, b) => b[1] - a[1]));
}
