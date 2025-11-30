export const BLOG_CONFIG = {
  postsPerPage: 12,
  relatedPostsLimit: 3,
  tagDisplayLimit: 3,
  tocMinDepth: 2,
  tocMaxDepth: 4,
  readingSpeed: {
    wordsPerMinute: 200,
    imageReadingTime: 12, // seconds
    codeBlockReadingTime: 30, // seconds
  },
  relatedPostsScoring: {
    tagSimilarityWeight: 0.7,
    recencyWeight: 0.3,
  },
} as const;
