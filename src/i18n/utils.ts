import {
  ui,
  defaultLang,
  languages,
  languageMeta,
  experienceHighlights,
  type Lang,
} from './ui';
import { getRelativeLocaleUrl } from 'astro:i18n';

const supportedLanguages = Object.keys(languages) as Lang[];
const localePrefixRegex = new RegExp(`^/(${supportedLanguages.join('|')})/`);
const localeExactRegex = new RegExp(`^/(${supportedLanguages.join('|')})$`);

function stripLocalePrefix(pathname: string): string {
  return pathname
    .replace(localePrefixRegex, '/')
    .replace(localeExactRegex, '/');
}

export type LanguageOption = {
  lang: Lang;
  label: string;
  flag: string;
  code: string;
  href: string;
};

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

export function getLocaleUrl(lang: Lang, pathname: string): string {
  const basePath = stripLocalePrefix(pathname);
  return getRelativeLocaleUrl(lang, basePath);
}

export function getLanguageOptions(pathname: string): LanguageOption[] {
  return supportedLanguages.map((lang) => ({
    lang,
    label: languages[lang],
    flag: languageMeta[lang].flag,
    code: languageMeta[lang].code,
    href: getLocaleUrl(lang, pathname),
  }));
}

/**
 * Get locale string for meta tags
 */
export function getLocale(lang: Lang): string {
  return languageMeta[lang].locale.replace('-', '_');
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
export function getHreflangUrls(pathname: string): Record<Lang, string> {
  const base = 'https://jjuanrivvera.com';
  const basePath = stripLocalePrefix(pathname);
  const normalizedBasePath =
    basePath === '/' ? '/' : basePath.endsWith('/') ? basePath : `${basePath}/`;

  return supportedLanguages.reduce(
    (acc, locale) => {
      const localizedPath =
        locale === defaultLang
          ? normalizedBasePath
          : normalizedBasePath === '/'
            ? `/${locale}/`
            : `/${locale}${normalizedBasePath}`;

      acc[locale] = `${base}${localizedPath}`;
      return acc;
    },
    {} as Record<Lang, string>
  );
}
