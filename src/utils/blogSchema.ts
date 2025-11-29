import type { CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { SITE_CONFIG } from '@config/site';

interface BlogPostingSchemaParams {
  post: CollectionEntry<'blog'>;
  postUrl: string;
  profilePicture: ImageMetadata;
}

export function generateBlogPostingSchema({
  post,
  postUrl,
  profilePicture,
}: BlogPostingSchemaParams) {
  const { data } = post;
  const publishedTime = data.pubDate.toISOString();
  const modifiedTime = data.updatedDate?.toISOString();

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.title,
    description: data.description,
    image: data.cover
      ? typeof data.cover === 'string'
        ? data.cover
        : `${SITE_CONFIG.url}${data.cover.src}`
      : undefined,
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    author: {
      '@type': 'Person',
      name: data.author,
      url: SITE_CONFIG.url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.author,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}${profilePicture.src}`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    keywords: data.tags.join(', '),
    inLanguage: data.lang,
  };
}
