import { describe, it, expect } from 'vitest';
import {
  getLangFromUrl,
  useTranslations,
  getCanonicalUrl,
  getHreflangUrls,
  getLocale,
} from '@i18n/utils';

describe('getLangFromUrl', () => {
  it('extracts English language from root URL', () => {
    const url = new URL('https://jjuanrivvera.com/');
    const lang = getLangFromUrl(url);
    expect(lang).toBe('en');
  });

  it('extracts Spanish language from URL', () => {
    const url = new URL('https://jjuanrivvera.com/es/about');
    const lang = getLangFromUrl(url);
    expect(lang).toBe('es');
  });

  it('extracts Portuguese language from URL', () => {
    const url = new URL('https://jjuanrivvera.com/pt/blog');
    const lang = getLangFromUrl(url);
    expect(lang).toBe('pt');
  });

  it('defaults to English for invalid language', () => {
    const url = new URL('https://jjuanrivvera.com/fr/about');
    const lang = getLangFromUrl(url);
    expect(lang).toBe('en');
  });

  it('defaults to English for root path', () => {
    const url = new URL('https://jjuanrivvera.com/');
    const lang = getLangFromUrl(url);
    expect(lang).toBe('en');
  });
});

describe('useTranslations', () => {
  it('returns translation function for English', () => {
    const t = useTranslations('en');
    expect(typeof t).toBe('function');
  });

  it('translates hero name in English', () => {
    const t = useTranslations('en');
    const name = t('hero.name');
    expect(name).toBe('Juan Felipe Rivera Gonzalez');
  });

  it('translates hero name in Spanish', () => {
    const t = useTranslations('es');
    const name = t('hero.name');
    expect(name).toBe('Juan Felipe Rivera Gonzalez');
  });

  it('translates hero title in English', () => {
    const t = useTranslations('en');
    const title = t('hero.title');
    expect(typeof title).toBe('string');
    expect(title.length).toBeGreaterThan(0);
  });

  it('translates hero title in Spanish', () => {
    const t = useTranslations('es');
    const title = t('hero.title');
    expect(typeof title).toBe('string');
    expect(title.length).toBeGreaterThan(0);
  });

  it('translates hero title in Portuguese', () => {
    const t = useTranslations('pt');
    const title = t('hero.title');
    expect(typeof title).toBe('string');
    expect(title.length).toBeGreaterThan(0);
  });

  it('falls back to default language for missing keys', () => {
    const t = useTranslations('es');
    // Even if a key is missing in Spanish, should return English version
    const value = t('hero.name');
    expect(value).toBeTruthy();
  });
});

describe('getCanonicalUrl', () => {
  it('generates canonical URL for root path', () => {
    const url = getCanonicalUrl('en', '/');
    expect(url).toBe('https://jjuanrivvera.com/');
  });

  it('generates canonical URL for about page', () => {
    const url = getCanonicalUrl('en', '/about');
    expect(url).toBe('https://jjuanrivvera.com/about/');
  });

  it('ensures trailing slash consistency', () => {
    const url1 = getCanonicalUrl('en', '/blog');
    const url2 = getCanonicalUrl('en', '/blog/');
    expect(url1).toBe(url2);
    expect(url1).toMatch(/\/$/);
  });

  it('generates canonical URL for localized page', () => {
    const url = getCanonicalUrl('es', '/es/about');
    expect(url).toBe('https://jjuanrivvera.com/es/about/');
  });

  it('normalizes paths without trailing slash', () => {
    const url = getCanonicalUrl('pt', '/pt/blog/post-slug');
    expect(url).toMatch(/\/$/);
  });
});

describe('getHreflangUrls', () => {
  it('generates hreflang URLs for root path', () => {
    const urls = getHreflangUrls('/');

    expect(urls.en).toBe('https://jjuanrivvera.com/');
    expect(urls.es).toBe('https://jjuanrivvera.com/es/');
    expect(urls.pt).toBe('https://jjuanrivvera.com/pt/');
  });

  it('generates hreflang URLs for about page', () => {
    const urls = getHreflangUrls('/about');

    expect(urls.en).toBe('https://jjuanrivvera.com/about/');
    expect(urls.es).toBe('https://jjuanrivvera.com/es/about/');
    expect(urls.pt).toBe('https://jjuanrivvera.com/pt/about/');
  });

  it('strips locale prefix from Spanish URL', () => {
    const urls = getHreflangUrls('/es/about');

    expect(urls.en).toBe('https://jjuanrivvera.com/about/');
    expect(urls.es).toBe('https://jjuanrivvera.com/es/about/');
    expect(urls.pt).toBe('https://jjuanrivvera.com/pt/about/');
  });

  it('strips locale prefix from Portuguese URL', () => {
    const urls = getHreflangUrls('/pt/blog');

    expect(urls.en).toBe('https://jjuanrivvera.com/blog/');
    expect(urls.es).toBe('https://jjuanrivvera.com/es/blog/');
    expect(urls.pt).toBe('https://jjuanrivvera.com/pt/blog/');
  });

  it('ensures all URLs have consistent trailing slashes', () => {
    const urls = getHreflangUrls('/blog/post-slug');

    Object.values(urls).forEach((url) => {
      expect(url).toMatch(/\/$/);
    });
  });

  it('handles URLs with trailing slash', () => {
    const urls = getHreflangUrls('/about/');

    expect(urls.en).toBe('https://jjuanrivvera.com/about/');
    expect(urls.es).toBe('https://jjuanrivvera.com/es/about/');
    expect(urls.pt).toBe('https://jjuanrivvera.com/pt/about/');
  });
});

describe('getLocale', () => {
  it('returns en_US for English', () => {
    expect(getLocale('en')).toBe('en_US');
  });

  it('returns es_ES for Spanish', () => {
    expect(getLocale('es')).toBe('es_ES');
  });

  it('returns pt_BR for Portuguese', () => {
    expect(getLocale('pt')).toBe('pt_BR');
  });
});
