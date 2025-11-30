/**
 * Hreflang generation utility for multilingual blog posts
 * Helps search engines understand language variations of the same content
 */

import type { BlogPost, HreflangLink, SupportedLang } from '@models/blog';
import { SITE_CONFIG, LOCALE_MAP } from '@config/site';

/**
 * Build blog post URL for a specific language
 * @param slug - The post slug (with or without language prefix)
 * @param lang - The target language code
 * @returns Full URL to the blog post
 * @example
 * buildPostUrl('my-post', 'en') // => 'https://jjuanrivvera.com/blog/my-post'
 * buildPostUrl('my-post', 'es') // => 'https://jjuanrivvera.com/es/blog/my-post'
 */
function buildPostUrl(slug: string, lang: SupportedLang): string {
  // Remove language prefix from slug if present (safe regex)
  const cleanSlug = slug.replace(/^(en|es|pt)\//, '');

  // English posts don't have language prefix
  if (lang === 'en') {
    return `${SITE_CONFIG.url}/blog/${cleanSlug}`;
  }

  return `${SITE_CONFIG.url}/${lang}/blog/${cleanSlug}`;
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
    lang: LOCALE_MAP[currentPost.data.lang],
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
        lang: LOCALE_MAP[translation.data.lang],
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
 * @param currentPost - The current blog post
 * @param targetLang - The target language to find translation for
 * @param allPosts - All blog posts to search within
 * @returns The translated post or null if not found
 * @example
 * const spanishPost = getTranslation(englishPost, 'es', allPosts);
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
 * @param currentPost - The current blog post
 * @param allPosts - All blog posts to search within
 * @returns Map of language codes to their corresponding posts
 * @example
 * const translations = getAllTranslations(post, allPosts);
 * const spanishVersion = translations.get('es');
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
 * @param lang - The target language code
 * @param page - The page number (defaults to 1)
 * @returns Full URL to the blog listing page
 * @example
 * buildBlogListingUrl('en', 1) // => 'https://jjuanrivvera.com/blog'
 * buildBlogListingUrl('es', 2) // => 'https://jjuanrivvera.com/es/blog/2'
 */
export function buildBlogListingUrl(
  lang: SupportedLang,
  page: number = 1
): string {
  const basePath = lang === 'en' ? '/blog' : `/${lang}/blog`;
  return page === 1
    ? `${SITE_CONFIG.url}${basePath}`
    : `${SITE_CONFIG.url}${basePath}/${page}`;
}

/**
 * Build tag page URL for a specific language
 * @param tag - The tag name (will be normalized to lowercase with hyphens)
 * @param lang - The target language code
 * @returns Full URL to the tag archive page
 * @example
 * buildTagUrl('TypeScript', 'en') // => 'https://jjuanrivvera.com/blog/tag/typescript'
 * buildTagUrl('Web Dev', 'es') // => 'https://jjuanrivvera.com/es/blog/tag/web-dev'
 */
export function buildTagUrl(tag: string, lang: SupportedLang): string {
  const normalizedTag = tag.toLowerCase().replace(/\s+/g, '-');
  const basePath = lang === 'en' ? '/blog/tag' : `/${lang}/blog/tag`;
  return `${SITE_CONFIG.url}${basePath}/${normalizedTag}`;
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
