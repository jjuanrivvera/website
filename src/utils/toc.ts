/**
 * Table of Contents generation utility
 * Extracts headings from markdown/MDX content
 */

import { slug as githubSlug } from 'github-slugger';
import type { TocHeading } from '@models/blog';

/**
 * Extract table of contents from markdown content
 * @param content - Raw markdown/MDX content
 * @param minDepth - Minimum heading depth to include (default: 2 for h2)
 * @param maxDepth - Maximum heading depth to include (default: 4 for h4)
 * @returns Array of TOC headings
 */
export function extractToc(
  content: string,
  minDepth: number = 2,
  maxDepth: number = 4
): TocHeading[] {
  const headings: TocHeading[] = [];
  const slugger = { slug: githubSlug };

  // Regex to match markdown headings (## Title, ### Title, etc.)
  const headingRegex = /^(#{2,6})\s+(.+)$/gm;

  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const depth = match[1].length;
    const text = match[2].trim();

    // Skip headings outside the depth range
    if (depth < minDepth || depth > maxDepth) {
      continue;
    }

    // Generate slug for the heading
    const headingSlug = slugger.slug(text);

    headings.push({
      depth,
      slug: headingSlug,
      text,
    });
  }

  return headings;
}

/**
 * Generate hierarchical TOC structure
 * Nests headings based on their depth
 */
export interface NestedTocHeading extends TocHeading {
  children: NestedTocHeading[];
}

export function getNestedToc(headings: TocHeading[]): NestedTocHeading[] {
  const toc: NestedTocHeading[] = [];
  const stack: NestedTocHeading[] = [];

  headings.forEach((heading) => {
    const item: NestedTocHeading = { ...heading, children: [] };

    // Find parent heading
    while (stack.length > 0 && stack[stack.length - 1].depth >= item.depth) {
      stack.pop();
    }

    // Add to parent's children or to root
    if (stack.length === 0) {
      toc.push(item);
    } else {
      stack[stack.length - 1].children.push(item);
    }

    stack.push(item);
  });

  return toc;
}

/**
 * Filter TOC headings by depth range
 */
export function filterTocByDepth(
  headings: TocHeading[],
  minDepth: number,
  maxDepth: number
): TocHeading[] {
  return headings.filter((h) => h.depth >= minDepth && h.depth <= maxDepth);
}
