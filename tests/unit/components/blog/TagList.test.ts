import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, describe } from 'vitest';
import TagList from '@components/blog/TagList.astro';

describe('TagList component', () => {
  test('renders all tags when no limit specified', async () => {
    const container = await AstroContainer.create();
    const tags = ['TypeScript', 'JavaScript', 'React'];
    const result = await container.renderToString(TagList, {
      props: { tags, lang: 'en' },
    });

    expect(result).toContain('#TypeScript');
    expect(result).toContain('#JavaScript');
    expect(result).toContain('#React');
  });

  test('limits tags when limit prop is provided', async () => {
    const container = await AstroContainer.create();
    const tags = ['TypeScript', 'JavaScript', 'React', 'Node', 'Vue'];
    const result = await container.renderToString(TagList, {
      props: { tags, lang: 'en', limit: 3 },
    });

    expect(result).toContain('#TypeScript');
    expect(result).toContain('#JavaScript');
    expect(result).toContain('#React');
    expect(result).not.toContain('#Node');
    expect(result).not.toContain('#Vue');
  });

  test('shows +N indicator when tags are limited', async () => {
    const container = await AstroContainer.create();
    const tags = ['TypeScript', 'JavaScript', 'React', 'Node', 'Vue'];
    const result = await container.renderToString(TagList, {
      props: { tags, lang: 'en', limit: 2 },
    });

    expect(result).toContain('+3'); // Shows remaining 3 tags
    expect(result).toContain('tag-list__more');
  });

  test('generates correct English tag URLs', async () => {
    const container = await AstroContainer.create();
    const tags = ['TypeScript', 'Web Development'];
    const result = await container.renderToString(TagList, {
      props: { tags, lang: 'en' },
    });

    expect(result).toContain('/blog/tag/typescript');
    expect(result).toContain('/blog/tag/web-development'); // spaces replaced
  });

  test('generates correct Spanish tag URLs', async () => {
    const container = await AstroContainer.create();
    const tags = ['TypeScript'];
    const result = await container.renderToString(TagList, {
      props: { tags, lang: 'es' },
    });

    expect(result).toContain('/es/blog/tag/typescript');
  });

  test('generates correct Portuguese tag URLs', async () => {
    const container = await AstroContainer.create();
    const tags = ['TypeScript'];
    const result = await container.renderToString(TagList, {
      props: { tags, lang: 'pt' },
    });

    expect(result).toContain('/pt/blog/tag/typescript');
  });

  test('normalizes tag URLs to lowercase', async () => {
    const container = await AstroContainer.create();
    const tags = ['JavaScript', 'TYPESCRIPT', 'React'];
    const result = await container.renderToString(TagList, {
      props: { tags, lang: 'en' },
    });

    expect(result).toContain('/blog/tag/javascript');
    expect(result).toContain('/blog/tag/typescript');
    expect(result).toContain('/blog/tag/react');
  });

  test('replaces spaces with hyphens in tag URLs', async () => {
    const container = await AstroContainer.create();
    const tags = ['Web Development', 'Cloud Computing'];
    const result = await container.renderToString(TagList, {
      props: { tags, lang: 'en' },
    });

    expect(result).toContain('/blog/tag/web-development');
    expect(result).toContain('/blog/tag/cloud-computing');
  });

  test('applies CSS classes correctly', async () => {
    const container = await AstroContainer.create();
    const tags = ['TypeScript'];
    const result = await container.renderToString(TagList, {
      props: { tags, lang: 'en' },
    });

    expect(result).toContain('class="tag-list"');
    expect(result).toContain('class="tag-list__tag"');
  });

  test('includes title attribute on tag links', async () => {
    const container = await AstroContainer.create();
    const tags = ['TypeScript'];
    const result = await container.renderToString(TagList, {
      props: { tags, lang: 'en' },
    });

    expect(result).toContain('title="View all posts tagged with TypeScript"');
  });

  test('shows all tags when showAll is true even with limit', async () => {
    const container = await AstroContainer.create();
    const tags = ['TypeScript', 'JavaScript', 'React', 'Node'];
    const result = await container.renderToString(TagList, {
      props: { tags, lang: 'en', limit: 2, showAll: true },
    });

    // When showAll is true, all tags are displayed
    expect(result).toContain('#TypeScript');
    expect(result).toContain('#JavaScript');
    expect(result).toContain('#React');
    expect(result).toContain('#Node');
    // Note: The component logic shows +N even with showAll=true if limit is set
    // This is the current behavior
  });

  test('handles empty tag list', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(TagList, {
      props: { tags: [], lang: 'en' },
    });

    expect(result).toContain('class="tag-list"');
    // Should render empty div
  });

  test('handles single tag', async () => {
    const container = await AstroContainer.create();
    const tags = ['TypeScript'];
    const result = await container.renderToString(TagList, {
      props: { tags, lang: 'en' },
    });

    expect(result).toContain('#TypeScript');
    expect(result).not.toContain('+'); // No "more" indicator for single tag
  });

  test('ARIA label on +N indicator', async () => {
    const container = await AstroContainer.create();
    const tags = ['TypeScript', 'JavaScript', 'React', 'Node', 'Vue'];
    const result = await container.renderToString(TagList, {
      props: { tags, lang: 'en', limit: 2 },
    });

    expect(result).toContain('aria-label="3 more tags"');
  });
});
