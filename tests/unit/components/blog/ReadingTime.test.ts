import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, describe } from 'vitest';
import ReadingTime from '@components/blog/ReadingTime.astro';

describe('ReadingTime component', () => {
  test('renders reading time in English', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ReadingTime, {
      props: { minutes: 5, lang: 'en' },
    });

    expect(result).toContain('5 min read');
    expect(result).toContain('class="reading-time"');
    expect(result).toContain('Estimated reading time');
  });

  test('renders reading time in Spanish', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ReadingTime, {
      props: { minutes: 3, lang: 'es' },
    });

    expect(result).toContain('3 min de lectura');
  });

  test('renders reading time in Portuguese', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ReadingTime, {
      props: { minutes: 7, lang: 'pt' },
    });

    expect(result).toContain('7 min de leitura');
  });

  test('includes clock icon SVG', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ReadingTime, {
      props: { minutes: 5, lang: 'en' },
    });

    expect(result).toContain('<svg');
    expect(result).toContain('</svg>');
    expect(result).toContain('aria-hidden="true"');
  });

  test('has proper ARIA label', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ReadingTime, {
      props: { minutes: 10, lang: 'en' },
    });

    expect(result).toContain('aria-label');
    expect(result).toContain('Estimated reading time: 10 min read');
  });

  test('renders 1 minute correctly', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ReadingTime, {
      props: { minutes: 1, lang: 'en' },
    });

    expect(result).toContain('1 min read');
  });

  test('renders larger reading times', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ReadingTime, {
      props: { minutes: 25, lang: 'en' },
    });

    expect(result).toContain('25 min read');
  });

  test('applies reading-time CSS class', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ReadingTime, {
      props: { minutes: 5, lang: 'en' },
    });

    expect(result).toContain('class="reading-time"');
  });
});
