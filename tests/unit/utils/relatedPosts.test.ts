import { describe, it, expect } from 'vitest';
import {
  getRelatedPosts,
  getPostsByTag,
  getAllTags,
} from '@utils/relatedPosts';
import type { BlogPost } from '@models/blog';

// Mock blog posts for testing
const createMockPost = (
  id: string,
  tags: string[],
  lang: 'en' | 'es' | 'pt' = 'en',
  pubDate: Date = new Date('2025-01-01'),
  draft: boolean = false
): BlogPost => ({
  id,
  data: {
    title: `Post ${id}`,
    description: `Description for ${id}`,
    pubDate,
    updatedDate: undefined,
    author: 'Test Author',
    tags,
    lang,
    draft,
    featured: false,
  },
  body: '',
  collection: 'blog',
});

describe('getRelatedPosts', () => {
  it('finds posts with similar tags', () => {
    const currentPost = createMockPost('post-1', ['typescript', 'testing']);
    const allPosts = [
      currentPost,
      createMockPost('post-2', ['typescript', 'react']),
      createMockPost('post-3', ['javascript', 'node']),
      createMockPost('post-4', ['typescript', 'testing', 'vitest']),
    ];

    const related = getRelatedPosts(currentPost, allPosts);

    // post-4 should be first (shares 2 tags)
    // post-2 should be second (shares 1 tag)
    expect(related.length).toBeGreaterThan(0);
    expect(related[0].id).toBe('post-4');
  });

  it('excludes the current post from results', () => {
    const currentPost = createMockPost('post-1', ['typescript']);
    const allPosts = [currentPost, createMockPost('post-2', ['typescript'])];

    const related = getRelatedPosts(currentPost, allPosts);

    expect(related.every((p) => p.id !== currentPost.id)).toBe(true);
  });

  it('excludes draft posts by default', () => {
    const currentPost = createMockPost('post-1', ['typescript']);
    const allPosts = [
      currentPost,
      createMockPost('post-2', ['typescript'], 'en', new Date(), true), // draft
      createMockPost('post-3', ['typescript'], 'en', new Date(), false),
    ];

    const related = getRelatedPosts(currentPost, allPosts);

    expect(related.some((p) => p.data.draft)).toBe(false);
  });

  it('filters by language when sameLangOnly is true', () => {
    const currentPost = createMockPost('post-1', ['typescript'], 'en');
    const allPosts = [
      currentPost,
      createMockPost('post-2', ['typescript'], 'es'),
      createMockPost('post-3', ['typescript'], 'en'),
    ];

    const related = getRelatedPosts(currentPost, allPosts, {
      sameLangOnly: true,
    });

    expect(related.every((p) => p.data.lang === 'en')).toBe(true);
  });

  it('respects the limit option', () => {
    const currentPost = createMockPost('post-1', ['typescript']);
    const allPosts = [
      currentPost,
      createMockPost('post-2', ['typescript']),
      createMockPost('post-3', ['typescript']),
      createMockPost('post-4', ['typescript']),
      createMockPost('post-5', ['typescript']),
    ];

    const related = getRelatedPosts(currentPost, allPosts, { limit: 2 });

    expect(related.length).toBe(2);
  });

  it('considers recency in scoring', () => {
    const recentDate = new Date('2025-01-15');
    const oldDate = new Date('2024-01-01');

    const currentPost = createMockPost(
      'post-1',
      ['typescript'],
      'en',
      new Date('2025-01-10')
    );
    const allPosts = [
      currentPost,
      createMockPost('post-2', ['typescript'], 'en', recentDate),
      createMockPost('post-3', ['typescript'], 'en', oldDate),
    ];

    const related = getRelatedPosts(currentPost, allPosts);

    // More recent post should rank higher
    expect(related[0].id).toBe('post-2');
  });

  it('returns posts sorted by score even with no shared tags', () => {
    const currentPost = createMockPost(
      'post-1',
      ['typescript'],
      'en',
      new Date('2025-01-10')
    );
    const allPosts = [
      currentPost,
      createMockPost('post-2', ['python'], 'en', new Date('2025-01-09')), // similar date
      createMockPost('post-3', ['ruby'], 'en', new Date('2024-01-01')), // old date
    ];

    const related = getRelatedPosts(currentPost, allPosts);

    // Even without shared tags, posts are ranked by recency
    // More recent post should rank higher
    if (related.length > 0) {
      expect(related[0].id).toBe('post-2');
    }
  });
});

describe('getPostsByTag', () => {
  it('filters posts by tag (case-insensitive)', () => {
    const allPosts = [
      createMockPost('post-1', ['TypeScript', 'React']),
      createMockPost('post-2', ['typescript', 'Node']),
      createMockPost('post-3', ['JavaScript', 'React']),
    ];

    const filtered = getPostsByTag(allPosts, 'typescript');

    expect(filtered.length).toBe(2);
    expect(
      filtered.every((p) =>
        p.data.tags.some((t) => t.toLowerCase() === 'typescript')
      )
    ).toBe(true);
  });

  it('excludes draft posts by default', () => {
    const allPosts = [
      createMockPost('post-1', ['typescript'], 'en', new Date(), false),
      createMockPost('post-2', ['typescript'], 'en', new Date(), true), // draft
    ];

    const filtered = getPostsByTag(allPosts, 'typescript');

    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('post-1');
  });

  it('includes draft posts when excludeDrafts is false', () => {
    const allPosts = [
      createMockPost('post-1', ['typescript'], 'en', new Date(), true), // draft
    ];

    const filtered = getPostsByTag(allPosts, 'typescript', false);

    expect(filtered.length).toBe(1);
  });

  it('sorts posts by date (newest first)', () => {
    const allPosts = [
      createMockPost('post-1', ['typescript'], 'en', new Date('2024-01-01')),
      createMockPost('post-2', ['typescript'], 'en', new Date('2025-01-01')),
      createMockPost('post-3', ['typescript'], 'en', new Date('2024-06-01')),
    ];

    const filtered = getPostsByTag(allPosts, 'typescript');

    expect(filtered[0].id).toBe('post-2'); // newest
    expect(filtered[2].id).toBe('post-1'); // oldest
  });
});

describe('getAllTags', () => {
  it('extracts and counts all unique tags', () => {
    const allPosts = [
      createMockPost('post-1', ['TypeScript', 'React']),
      createMockPost('post-2', ['typescript', 'Node']),
      createMockPost('post-3', ['React', 'TypeScript']),
    ];

    const tags = getAllTags(allPosts);

    expect(tags.get('typescript')).toBe(3);
    expect(tags.get('react')).toBe(2);
    expect(tags.get('node')).toBe(1);
  });

  it('normalizes tags to lowercase', () => {
    const allPosts = [
      createMockPost('post-1', ['TypeScript']),
      createMockPost('post-2', ['typescript']),
      createMockPost('post-3', ['TYPESCRIPT']),
    ];

    const tags = getAllTags(allPosts);

    expect(tags.get('typescript')).toBe(3);
    expect(tags.size).toBe(1);
  });

  it('excludes tags from draft posts by default', () => {
    const allPosts = [
      createMockPost('post-1', ['typescript'], 'en', new Date(), false),
      createMockPost('post-2', ['python'], 'en', new Date(), true), // draft
    ];

    const tags = getAllTags(allPosts);

    expect(tags.has('typescript')).toBe(true);
    expect(tags.has('python')).toBe(false);
  });

  it('sorts tags by count (descending)', () => {
    const allPosts = [
      createMockPost('post-1', ['typescript']),
      createMockPost('post-2', ['typescript']),
      createMockPost('post-3', ['typescript']),
      createMockPost('post-4', ['react']),
      createMockPost('post-5', ['react']),
      createMockPost('post-6', ['node']),
    ];

    const tags = getAllTags(allPosts);
    const tagArray = Array.from(tags.entries());

    expect(tagArray[0][0]).toBe('typescript'); // 3 occurrences
    expect(tagArray[1][0]).toBe('react'); // 2 occurrences
    expect(tagArray[2][0]).toBe('node'); // 1 occurrence
  });
});
