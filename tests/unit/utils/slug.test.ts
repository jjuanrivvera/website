/**
 * Tests for slug utilities
 */

import { describe, expect, it } from 'vitest';
import { cleanBlogPostSlug } from '@utils/slug';

describe('cleanBlogPostSlug', () => {
  it('removes language prefix and file extension, URL-encodes the slug', () => {
    expect(cleanBlogPostSlug('en/getting-started.md')).toBe('getting-started');
    expect(cleanBlogPostSlug('es/primeros-pasos.mdx')).toBe('primeros-pasos');
    expect(cleanBlogPostSlug('pt/introducao.md')).toBe('introducao');
  });

  it('handles slugs with special characters by URL-encoding them', () => {
    expect(cleanBlogPostSlug('en/my post.md')).toBe('my%20post');
    expect(cleanBlogPostSlug('en/my-post!.md')).toBe('my-post!');
    expect(cleanBlogPostSlug('en/café.md')).toBe('caf%C3%A9');
  });

  it('handles edge cases', () => {
    expect(cleanBlogPostSlug('en/.md')).toBe('');
    expect(cleanBlogPostSlug('en/test')).toBe('test');
    expect(cleanBlogPostSlug('getting-started.md')).toBe('getting-started'); // No language prefix
  });
});
