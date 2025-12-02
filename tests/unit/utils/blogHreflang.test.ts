import { describe, it, expect } from 'vitest';
import {
  generateHreflangLinks,
  getTranslation,
  getAllTranslations,
  buildBlogListingUrl,
  buildTagUrl,
  getBlogLanguageSwitcherUrls,
} from '@utils/blogHreflang';
import type { BlogPost } from '@models/blog';

// Mock blog posts for testing
const createMockPost = (
  id: string,
  lang: 'en' | 'es' | 'pt',
  translationKey?: string,
  draft: boolean = false
): BlogPost => ({
  id,
  data: {
    title: `Post ${id}`,
    description: `Description for ${id}`,
    pubDate: new Date('2025-01-01'),
    author: 'Test Author',
    tags: ['test'],
    lang,
    translationKey,
    draft,
    featured: false,
  },
  body: '',
  collection: 'blog',
});

describe('generateHreflangLinks', () => {
  it('generates hreflang link for current post', () => {
    const currentPost = createMockPost('en/my-post.md', 'en');
    const links = generateHreflangLinks(currentPost, [currentPost]);

    expect(links.length).toBeGreaterThan(0);
    expect(links.some((l) => l.lang === 'en-US')).toBe(true);
  });

  it('includes translations when translationKey exists', () => {
    const enPost = createMockPost('en/my-post.md', 'en', 'my-post-key');
    const esPost = createMockPost('es/mi-post.md', 'es', 'my-post-key');
    const allPosts = [enPost, esPost];

    const links = generateHreflangLinks(enPost, allPosts);

    expect(links.some((l) => l.lang === 'en-US')).toBe(true);
    expect(links.some((l) => l.lang === 'es-ES')).toBe(true);
  });

  it('excludes draft translations', () => {
    const enPost = createMockPost('en/my-post.md', 'en', 'my-post-key');
    const esDraft = createMockPost('es/mi-post.md', 'es', 'my-post-key', true);
    const allPosts = [enPost, esDraft];

    const links = generateHreflangLinks(enPost, allPosts);

    expect(links.some((l) => l.lang === 'es-ES')).toBe(false);
  });

  it('adds x-default for English version', () => {
    const enPost = createMockPost('en/my-post.md', 'en', 'my-post-key');
    const esPost = createMockPost('es/mi-post.md', 'es', 'my-post-key');
    const allPosts = [enPost, esPost];

    const links = generateHreflangLinks(enPost, allPosts);

    expect(links.some((l) => l.lang === 'x-default')).toBe(true);
    const xDefault = links.find((l) => l.lang === 'x-default');
    expect(xDefault?.url).toContain('/blog/my-post');
  });

  it('generates correct URLs for each language', () => {
    const enPost = createMockPost('en/my-post.md', 'en', 'my-post-key');
    const esPost = createMockPost('es/mi-post.md', 'es', 'my-post-key');
    const allPosts = [enPost, esPost];

    const links = generateHreflangLinks(enPost, allPosts);

    const enLink = links.find((l) => l.lang === 'en-US');
    const esLink = links.find((l) => l.lang === 'es-ES');

    expect(enLink?.url).toContain('/blog/my-post');
    expect(esLink?.url).toContain('/es/blog/mi-post');
  });
});

describe('getTranslation', () => {
  it('finds translation in target language', () => {
    const enPost = createMockPost('en/my-post.md', 'en', 'my-post-key');
    const esPost = createMockPost('es/mi-post.md', 'es', 'my-post-key');
    const allPosts = [enPost, esPost];

    const translation = getTranslation(enPost, 'es', allPosts);

    expect(translation).not.toBeNull();
    expect(translation?.data.lang).toBe('es');
  });

  it('returns null when no translationKey exists', () => {
    const enPost = createMockPost('en/my-post.md', 'en');
    const allPosts = [enPost];

    const translation = getTranslation(enPost, 'es', allPosts);

    expect(translation).toBeNull();
  });

  it('returns null when translation does not exist', () => {
    const enPost = createMockPost('en/my-post.md', 'en', 'my-post-key');
    const allPosts = [enPost];

    const translation = getTranslation(enPost, 'pt', allPosts);

    expect(translation).toBeNull();
  });

  it('excludes draft translations', () => {
    const enPost = createMockPost('en/my-post.md', 'en', 'my-post-key');
    const esDraft = createMockPost('es/mi-post.md', 'es', 'my-post-key', true);
    const allPosts = [enPost, esDraft];

    const translation = getTranslation(enPost, 'es', allPosts);

    expect(translation).toBeNull();
  });
});

describe('getAllTranslations', () => {
  it('returns all translations including current post', () => {
    const enPost = createMockPost('en/my-post.md', 'en', 'my-post-key');
    const esPost = createMockPost('es/mi-post.md', 'es', 'my-post-key');
    const ptPost = createMockPost('pt/meu-post.md', 'pt', 'my-post-key');
    const allPosts = [enPost, esPost, ptPost];

    const translations = getAllTranslations(enPost, allPosts);

    expect(translations.size).toBe(3);
    expect(translations.has('en')).toBe(true);
    expect(translations.has('es')).toBe(true);
    expect(translations.has('pt')).toBe(true);
  });

  it('returns only current post when no translationKey', () => {
    const enPost = createMockPost('en/my-post.md', 'en');
    const allPosts = [enPost];

    const translations = getAllTranslations(enPost, allPosts);

    expect(translations.size).toBe(1);
    expect(translations.has('en')).toBe(true);
  });

  it('excludes draft translations', () => {
    const enPost = createMockPost('en/my-post.md', 'en', 'my-post-key');
    const esDraft = createMockPost('es/mi-post.md', 'es', 'my-post-key', true);
    const allPosts = [enPost, esDraft];

    const translations = getAllTranslations(enPost, allPosts);

    expect(translations.size).toBe(1);
    expect(translations.has('en')).toBe(true);
    expect(translations.has('es')).toBe(false);
  });
});

describe('buildBlogListingUrl', () => {
  it('builds English blog listing URL without prefix', () => {
    const url = buildBlogListingUrl('en');
    expect(url).toBe('https://jjuanrivvera.com/blog');
  });

  it('builds Spanish blog listing URL with language prefix', () => {
    const url = buildBlogListingUrl('es');
    expect(url).toBe('https://jjuanrivvera.com/es/blog');
  });

  it('builds Portuguese blog listing URL with language prefix', () => {
    const url = buildBlogListingUrl('pt');
    expect(url).toBe('https://jjuanrivvera.com/pt/blog');
  });

  it('handles pagination for English', () => {
    const url = buildBlogListingUrl('en', 2);
    expect(url).toBe('https://jjuanrivvera.com/blog/2');
  });

  it('handles pagination for Spanish', () => {
    const url = buildBlogListingUrl('es', 3);
    expect(url).toBe('https://jjuanrivvera.com/es/blog/3');
  });
});

describe('buildTagUrl', () => {
  it('builds tag URL for English', () => {
    const url = buildTagUrl('TypeScript', 'en');
    expect(url).toBe('https://jjuanrivvera.com/blog/tag/typescript');
  });

  it('builds tag URL for Spanish', () => {
    const url = buildTagUrl('TypeScript', 'es');
    expect(url).toBe('https://jjuanrivvera.com/es/blog/tag/typescript');
  });

  it('normalizes tag to lowercase', () => {
    const url = buildTagUrl('JavaScript', 'en');
    expect(url).toContain('javascript');
  });

  it('replaces spaces with hyphens', () => {
    const url = buildTagUrl('Web Development', 'en');
    expect(url).toContain('web-development');
  });
});

describe('getBlogLanguageSwitcherUrls', () => {
  it('returns current post URL for current language', () => {
    const currentPost = createMockPost('en/my-post.md', 'en');
    const urls = getBlogLanguageSwitcherUrls(currentPost, [currentPost]);

    expect(urls.en).toBe('/blog/my-post');
  });

  it('returns translation URLs when they exist', () => {
    const enPost = createMockPost('en/my-post.md', 'en', 'my-post-key');
    const esPost = createMockPost('es/mi-post.md', 'es', 'my-post-key');
    const allPosts = [enPost, esPost];

    const urls = getBlogLanguageSwitcherUrls(enPost, allPosts);

    expect(urls.en).toBe('/blog/my-post');
    expect(urls.es).toBe('/es/blog/mi-post');
  });

  it('returns blog listing URL when translation does not exist', () => {
    const enPost = createMockPost('en/my-post.md', 'en', 'my-post-key');
    const allPosts = [enPost];

    const urls = getBlogLanguageSwitcherUrls(enPost, allPosts);

    expect(urls.es).toBe('/es/blog');
    expect(urls.pt).toBe('/pt/blog');
  });

  it('returns blog listing when no translationKey', () => {
    const enPost = createMockPost('en/my-post.md', 'en');
    const allPosts = [enPost];

    const urls = getBlogLanguageSwitcherUrls(enPost, allPosts);

    expect(urls.en).toBe('/blog/my-post');
    expect(urls.es).toBe('/es/blog');
    expect(urls.pt).toBe('/pt/blog');
  });
});
