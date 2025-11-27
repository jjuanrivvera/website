import { ui, defaultLang, languages, experienceHighlights, type Lang } from './ui';
import { getRelativeLocaleUrl } from 'astro:i18n';

/**
 * Get the language from the URL path
 */
export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if (lang in languages) return lang as Lang;
  return defaultLang;
}

/**
 * Get translation function for a specific language
 */
export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

/**
 * Get experience highlights for a specific language and company
 */
export function getExperienceHighlights(
  lang: Lang,
  company: keyof (typeof experienceHighlights)['en']
): readonly string[] {
  return experienceHighlights[lang][company];
}

/**
 * Get the alternate language
 */
export function getAlternateLang(lang: Lang): Lang {
  return lang === 'en' ? 'es' : 'en';
}

/**
 * Get the URL for the alternate language version (uses Astro's built-in helper)
 * Preserves the current path when switching languages
 */
export function getAlternateUrl(lang: Lang, pathname: string): string {
  const alternateLang = getAlternateLang(lang);
  // Remove the current locale prefix from pathname to get the base path
  const basePath = pathname.replace(/^\/(es|en)\//, '/').replace(/^\/(es|en)$/, '/');
  return getRelativeLocaleUrl(alternateLang, basePath);
}

/**
 * Get locale string for meta tags
 */
export function getLocale(lang: Lang): string {
  return lang === 'en' ? 'en_US' : 'es_ES';
}

/**
 * Get canonical URL for the current page
 */
export function getCanonicalUrl(_lang: Lang, pathname: string): string {
  const base = 'https://jjuanrivvera.com';
  // Normalize pathname to ensure consistent trailing slash
  const normalizedPath = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return `${base}${normalizedPath}`;
}

/**
 * Get hreflang URLs for the current page
 */
export function getHreflangUrls(pathname: string): { en: string; es: string } {
  const base = 'https://jjuanrivvera.com';
  // Get base path without locale prefix
  const basePath = pathname.replace(/^\/(es)\//, '/').replace(/^\/(es)$/, '/');
  const normalizedBasePath = basePath === '/' ? '/' : (basePath.endsWith('/') ? basePath : `${basePath}/`);

  return {
    en: `${base}${normalizedBasePath}`,
    es: `${base}/es${normalizedBasePath === '/' ? '/' : normalizedBasePath}`,
  };
}

/**
 * Language switcher flag/code
 */
export function getLangSwitcher(lang: Lang) {
  return lang === 'en'
    ? { flag: '🇪🇸', code: 'ES' }
    : { flag: '🇺🇸', code: 'EN' };
}
