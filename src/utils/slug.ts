/**
 * Slug utilities for Content Layer API
 *
 * The Content Layer API uses file paths as IDs (e.g., "en/post-slug.md").
 * These utilities help convert those IDs to clean URL slugs.
 */

/**
 * Cleans a blog post ID (file path) to create a URL-friendly slug
 *
 * Removes language prefix and file extension from Content Layer API IDs.
 *
 * @param id - The post ID from Content Layer API (e.g., "en/my-post.md")
 * @returns Clean slug suitable for URLs (e.g., "my-post")
 *
 * @example
 * ```ts
 * cleanBlogPostSlug("en/getting-started.md")
 * // => "getting-started"
 *
 * cleanBlogPostSlug("es/primeros-pasos.mdx")
 * // => "primeros-pasos"
 *
 * cleanBlogPostSlug("pt/introducao.md")
 * // => "introducao"
 * ```
 */
export function cleanBlogPostSlug(id: string): string {
  return id
    .replace(/^(en|es|pt)\//, '') // Remove language prefix
    .replace(/\.(md|mdx)$/, ''); // Remove file extension
}
