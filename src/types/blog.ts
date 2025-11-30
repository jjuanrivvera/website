/**
 * Blog-related TypeScript type definitions
 */

import type { CollectionEntry } from 'astro:content';

// Blog post type from content collection
export type BlogPost = CollectionEntry<'blog'>;

// Supported languages
export type SupportedLang = 'en' | 'es' | 'pt';

// Table of Contents heading
export interface TocHeading {
  depth: number;
  slug: string;
  text: string;
}

// Reading time calculation result
export interface ReadingTime {
  text: string;
  minutes: number;
  time: number;
  words: number;
}

// Related post with similarity score
export interface RelatedPost {
  post: BlogPost;
  score: number;
}

// Hreflang link for multilingual SEO
export interface HreflangLink {
  lang: string;
  url: string;
}

// Pagination metadata
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  postsPerPage: number;
  totalPosts: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextUrl?: string;
  prevUrl?: string;
}

// Blog post with computed metadata
export interface EnhancedBlogPost extends BlogPost {
  readingTime: ReadingTime;
  tableOfContents: TocHeading[];
  relatedPosts: BlogPost[];
  hreflangLinks: HreflangLink[];
}

// Tag with post count
export interface TagWithCount {
  tag: string;
  count: number;
  posts: BlogPost[];
}

// RSS feed item
export interface RSSFeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: Date;
  author: string;
  categories: string[];
  content?: string;
}

// Social share platform
export type SocialPlatform =
  | 'twitter'
  | 'facebook'
  | 'linkedin'
  | 'reddit'
  | 'email';

// Social share link
export interface SocialShareLink {
  platform: SocialPlatform;
  url: string;
  label: string;
  icon: string;
}

// Breadcrumb item
export interface BreadcrumbItem {
  label: string;
  url: string;
  position: number;
}

// Blog SEO metadata
export interface BlogSEO {
  title: string;
  description: string;
  ogImage?: string;
  ogType: 'article' | 'website';
  publishedTime?: string;
  modifiedTime?: string;
  author: string;
  tags: string[];
  canonicalUrl?: string;
}

// Blog navigation (previous/next post)
export interface BlogNavigation {
  prev?: {
    title: string;
    slug: string;
  };
  next?: {
    title: string;
    slug: string;
  };
}
