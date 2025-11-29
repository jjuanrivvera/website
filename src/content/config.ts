/**
 * Content Collections Configuration
 * Defines the schema for blog posts with enhanced SEO and i18n support
 */

import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z
      .object({
        // Basic metadata
        title: z
          .string()
          .max(60, 'Title should be 60 characters or less for optimal SEO'),
        description: z
          .string()
          .min(50, 'Description should be at least 50 characters')
          .max(160, 'Description should be 160 characters or less for SEO'),

        // Dates
        pubDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),

        // Author
        author: z.string().default('Juan Felipe Rivera González'),

        // Taxonomy
        tags: z
          .array(
            z
              .string()
              .min(2, 'Tags should be at least 2 characters')
              .max(30, 'Tags should be 30 characters or less')
              .regex(
                /^[\p{L}\p{N}\s-]+$/u,
                'Tags should only contain letters, numbers, hyphens, and spaces'
              )
          )
          .min(1, 'At least one tag is required')
          .max(5, 'Maximum 5 tags allowed'),

        // Images - supports both imported images and external URLs
        cover: z.union([image(), z.string().url()]).optional(),
        coverAlt: z.string().optional(),
        ogImage: z.union([image(), z.string().url()]).optional(), // Custom OG image (fallback to cover)

        // i18n
        lang: z.enum(['en', 'es', 'pt']),
        translationKey: z.string().optional(), // Links related translations

        // Publishing
        draft: z.boolean().default(false),
        featured: z.boolean().default(false),

        // SEO
        canonicalUrl: z.string().url().optional(),
      })
      .refine(
        (data) => {
          // If cover is provided, coverAlt must be provided
          if (data.cover && !data.coverAlt) {
            return false;
          }
          return true;
        },
        {
          message: 'coverAlt is required when cover image is provided',
          path: ['coverAlt'],
        }
      ),
});

export const collections = {
  blog,
};
