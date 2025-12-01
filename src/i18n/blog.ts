/**
 * Blog-specific internationalization translations
 *
 * This module contains all blog-related translations extracted from blog components
 * to follow DRY principles and improve maintainability.
 *
 * @module i18n/blog
 */

/**
 * Blog listing page translations (pagination, metadata)
 * Used in: BlogListing.astro
 */
export const blogListingI18n = {
  en: {
    title: 'Blog',
    description:
      'Articles about web development, software engineering, and technology.',
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of',
    paginationLabel: 'Blog pagination',
  },
  es: {
    title: 'Blog',
    description:
      'Artículos sobre desarrollo web, ingeniería de software y tecnología.',
    previous: 'Anterior',
    next: 'Siguiente',
    page: 'Página',
    of: 'de',
    paginationLabel: 'Paginación del blog',
  },
  pt: {
    title: 'Blog',
    description:
      'Artigos sobre desenvolvimento web, engenharia de software e tecnologia.',
    previous: 'Anterior',
    next: 'Próximo',
    page: 'Página',
    of: 'de',
    paginationLabel: 'Paginação do blog',
  },
} as const;

/**
 * Tag archive page translations (navigation, article counts)
 * Used in: TagArchive.astro
 */
export const tagArchiveI18n = {
  en: {
    home: 'Home',
    blog: 'Blog',
    article: 'article',
    articles: 'articles',
    taggedAs: (count: number) =>
      count === 1 ? 'article tagged as' : 'articles tagged as',
    about: 'about',
    backToAllArticles: 'Back to all articles',
  },
  es: {
    home: 'Inicio',
    blog: 'Blog',
    article: 'artículo',
    articles: 'artículos',
    taggedAs: (count: number) =>
      count === 1 ? 'artículo etiquetado como' : 'artículos etiquetados como',
    about: 'sobre',
    backToAllArticles: 'Volver a todos los artículos',
  },
  pt: {
    home: 'Início',
    blog: 'Blog',
    article: 'artigo',
    articles: 'artigos',
    taggedAs: (count: number) =>
      count === 1 ? 'artigo marcado como' : 'artigos marcados como',
    about: 'sobre',
    backToAllArticles: 'Voltar para todos os artigos',
  },
} as const;

// Type exports for type safety
export type BlogListingTranslations = typeof blogListingI18n;
export type TagArchiveTranslations = typeof tagArchiveI18n;
