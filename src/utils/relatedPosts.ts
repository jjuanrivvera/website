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

// Recency scoring thresholds (in days)
const RECENCY_THRESHOLDS = {
  VERY_RECENT: 30, // Within 30 days = max score
  RECENT: 90, // Within 90 days = high score
  MODERATE: 180, // Within 180 days = medium score
  OLD: 365, // Within 365 days = low score
} as const;

// Recency scores for each threshold
const RECENCY_SCORES = {
  VERY_RECENT: 1.0,
  RECENT: 0.8,
  MODERATE: 0.6,
  OLD: 0.4,
  VERY_OLD: 0.2,
} as const;

/**
 * Calculate recency score (0-1 scale)
 * Scores posts based on temporal proximity to reference date
 * Posts closer in time to the reference get higher scores
 */
function calculateRecencyScore(postDate: Date, referenceDate: Date): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const daysDiff = Math.abs(
    (referenceDate.getTime() - postDate.getTime()) / MS_PER_DAY
  );

  // Posts within thresholds get corresponding scores
  if (daysDiff <= RECENCY_THRESHOLDS.VERY_RECENT)
    return RECENCY_SCORES.VERY_RECENT;
  if (daysDiff <= RECENCY_THRESHOLDS.RECENT) return RECENCY_SCORES.RECENT;
  if (daysDiff <= RECENCY_THRESHOLDS.MODERATE) return RECENCY_SCORES.MODERATE;
  if (daysDiff <= RECENCY_THRESHOLDS.OLD) return RECENCY_SCORES.OLD;
  return RECENCY_SCORES.VERY_OLD;
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

  // Use current post's date as reference for recency calculation
  // This ensures related posts are relative to the current post's timeframe
  const currentPostDate =
    currentPost.data.updatedDate || currentPost.data.pubDate;

  // Calculate similarity scores
  const scoredPosts: RelatedPost[] = candidates.map((post) => {
    const tagSimilarity = calculateTagSimilarity(
      currentPost.data.tags,
      post.data.tags
    );

    const postDate = post.data.updatedDate || post.data.pubDate;
    const recencyScore = calculateRecencyScore(postDate, currentPostDate);

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
 * @param allPosts - All blog posts to filter
 * @param tag - The tag to filter by (case-insensitive)
 * @param excludeDrafts - Whether to exclude draft posts (defaults to true)
 * @returns Array of posts with the specified tag, sorted by date (newest first)
 * @example
 * const typescriptPosts = getPostsByTag(allPosts, 'TypeScript');
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
 * @param posts - All blog posts to extract tags from
 * @param excludeDrafts - Whether to exclude draft posts (defaults to true)
 * @returns Map of normalized tag names to their occurrence counts, sorted by count (descending)
 * @example
 * const tagCounts = getAllTags(allPosts);
 * // Map { 'typescript' => 5, 'javascript' => 3, 'react' => 2 }
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
