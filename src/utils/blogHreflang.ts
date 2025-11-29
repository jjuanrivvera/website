/**
 * Hreflang generation utility for multilingual blog posts
 * Helps search engines understand language variations of the same content
 */

import type { BlogPost, HreflangLink, SupportedLang } from '@models/blog';

const SITE_URL = 'https://jjuanrivvera.com';

// Language code mapping for hreflang (ISO 639-1 + ISO 3166-1)
const LANG_CODES: Record<SupportedLang, string> = {
  en: 'en-US',
  es: 'es-ES',
  pt: 'pt-BR',
};

/**
 * Build blog post URL for a specific language
 */
function buildPostUrl(slug: string, lang: SupportedLang): string {
  // Remove language prefix from slug if present (safe regex)
  const cleanSlug = slug.replace(/^(en|es|pt)\//, '');

  // English posts don't have language prefix
  if (lang === 'en') {
    return `${SITE_URL}/blog/${cleanSlug}`;
  }

  return `${SITE_URL}/${lang}/blog/${cleanSlug}`;
}

/**
 * Generate hreflang links for a blog post
 * @param currentPost - The current blog post
 * @param allPosts - All blog posts to find translations
 * @returns Array of hreflang links
 */
export function generateHreflangLinks(
  currentPost: BlogPost,
  allPosts: BlogPost[]
): HreflangLink[] {
  const links: HreflangLink[] = [];

  // Add current post's language
  links.push({
    lang: LANG_CODES[currentPost.data.lang],
    url: buildPostUrl(currentPost.slug, currentPost.data.lang),
  });

  // If post has translationKey, find all translations
  if (currentPost.data.translationKey) {
    const translations = allPosts.filter(
      (post) =>
        post.data.translationKey === currentPost.data.translationKey &&
        post.id !== currentPost.id &&
        !post.data.draft // Exclude draft translations
    );

    translations.forEach((translation) => {
      links.push({
        lang: LANG_CODES[translation.data.lang],
        url: buildPostUrl(translation.slug, translation.data.lang),
      });
    });
  }

  // Add x-default (points to English version if available)
  const englishVersion =
    currentPost.data.lang === 'en'
      ? currentPost
      : allPosts.find(
          (post) =>
            post.data.translationKey === currentPost.data.translationKey &&
            post.data.lang === 'en' &&
            !post.data.draft
        );

  if (englishVersion) {
    links.push({
      lang: 'x-default',
      url: buildPostUrl(englishVersion.slug, 'en'),
    });
  }

  return links;
}

/**
 * Get translation of a post in a specific language
 */
export function getTranslation(
  currentPost: BlogPost,
  targetLang: SupportedLang,
  allPosts: BlogPost[]
): BlogPost | null {
  if (!currentPost.data.translationKey) return null;

  const translation = allPosts.find(
    (post) =>
      post.data.translationKey === currentPost.data.translationKey &&
      post.data.lang === targetLang &&
      !post.data.draft
  );

  return translation || null;
}

/**
 * Get all available translations for a post
 */
export function getAllTranslations(
  currentPost: BlogPost,
  allPosts: BlogPost[]
): Map<SupportedLang, BlogPost> {
  const translations = new Map<SupportedLang, BlogPost>();

  if (!currentPost.data.translationKey) {
    // No translations, only current post
    translations.set(currentPost.data.lang, currentPost);
    return translations;
  }

  // Find all posts with same translationKey
  allPosts
    .filter(
      (post) =>
        post.data.translationKey === currentPost.data.translationKey &&
        !post.data.draft
    )
    .forEach((post) => {
      translations.set(post.data.lang, post);
    });

  return translations;
}

/**
 * Build blog listing URL for a specific language
 */
export function buildBlogListingUrl(
  lang: SupportedLang,
  page: number = 1
): string {
  const basePath = lang === 'en' ? '/blog' : `/${lang}/blog`;
  return page === 1
    ? `${SITE_URL}${basePath}`
    : `${SITE_URL}${basePath}/${page}`;
}

/**
 * Build tag page URL for a specific language
 */
export function buildTagUrl(tag: string, lang: SupportedLang): string {
  const normalizedTag = tag.toLowerCase().replace(/\s+/g, '-');
  const basePath = lang === 'en' ? '/blog/tag' : `/${lang}/blog/tag`;
  return `${SITE_URL}${basePath}/${normalizedTag}`;
}

/**
 * Get language switcher URLs for a blog post
 * Returns URL for translation if it exists, otherwise returns blog listing page
 * Returns relative URLs for use in navigation
 */
export function getBlogLanguageSwitcherUrls(
  currentPost: BlogPost,
  allPosts: BlogPost[]
): Record<SupportedLang, string> {
  const languages: SupportedLang[] = ['en', 'es', 'pt'];
  const urls: Record<SupportedLang, string> = {} as Record<
    SupportedLang,
    string
  >;

  languages.forEach((lang) => {
    if (lang === currentPost.data.lang) {
      // Current language - use current post URL (relative)
      const cleanSlug = currentPost.slug.replace(/^(en|es|pt)\//, '');
      urls[lang] =
        lang === 'en' ? `/blog/${cleanSlug}` : `/${lang}/blog/${cleanSlug}`;
    } else if (currentPost.data.translationKey) {
      // Try to find translation
      const translation = allPosts.find(
        (post) =>
          post.data.translationKey === currentPost.data.translationKey &&
          post.data.lang === lang &&
          !post.data.draft
      );

      if (translation) {
        // Translation exists - link to it (relative)
        const cleanSlug = translation.slug.replace(/^(en|es|pt)\//, '');
        urls[lang] =
          lang === 'en' ? `/blog/${cleanSlug}` : `/${lang}/blog/${cleanSlug}`;
      } else {
        // No translation - link to blog listing page (relative)
        urls[lang] = lang === 'en' ? '/blog' : `/${lang}/blog`;
      }
    } else {
      // No translationKey - fallback to blog listing (relative)
      urls[lang] = lang === 'en' ? '/blog' : `/${lang}/blog`;
    }
  });

  return urls;
}
