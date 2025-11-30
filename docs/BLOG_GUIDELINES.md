# Blog Writing Guidelines

This document outlines the standards and best practices for writing blog posts on this website.

## Image Guidelines

### Always Use Local Images

**Rule**: All images (cover images and content images) must be stored locally in the repository.

**Why?**

- **Performance**: Local images can be optimized by Astro's image optimization
- **Reliability**: No dependency on external CDNs or services
- **Control**: You own the images and can modify them as needed
- **SEO**: Better for image optimization and alt text control
- **Offline capability**: Site works without internet for development

**How to add images:**

1. **Use descriptive filenames before saving:**
   - Name files based on their content, not generic names
   - Use kebab-case for consistency
   - Include relevant keywords naturally

   **Examples:**
   - ✅ `astro-architecture-diagram.png`
   - ✅ `typescript-error-handling-example.jpg`
   - ✅ `microservices-deployment-flow.webp`
   - ❌ `screenshot-2024.png`
   - ❌ `IMG_1234.jpg`
   - ❌ `image1.png`

2. **Place images in the appropriate directory:**

   ```
   src/assets/blog/
   ├── covers/           # Cover images for blog posts
   ├── content/          # Images used within blog content
   └── shared/           # Shared images across multiple posts
   ```

3. **Import and use in frontmatter:**

   ```yaml
   ---
   title: 'My Blog Post'
   cover: '@assets/blog/covers/my-post-cover.jpg'
   coverAlt: 'Descriptive alt text for accessibility'
   ---
   ```

4. **Use in MDX content:**

   ```mdx
   import myImage from '@assets/blog/content/diagram.png';

   <Image src={myImage} alt="Architecture diagram" />
   ```

**❌ Don't:**

```yaml
cover: 'https://external-cdn.com/image.jpg' # External URLs
```

**✅ Do:**

```yaml
cover: '@assets/blog/covers/my-image.jpg' # Local images
```

## Frontmatter Guidelines

### Required Fields

Every blog post MUST include these fields:

```yaml
---
title: 'Your Post Title' # Max 60 characters for SEO
description: 'Post description' # 50-160 characters for SEO
pubDate: 2025-11-29 # Publication date (YYYY-MM-DD)
author: 'Juan Felipe Rivera González' # Author name
tags: ['tag1', 'tag2'] # 1-5 tags, 2-30 characters each
lang: 'en' # en, es, or pt
draft: false # true to hide from production
---
```

### Optional Fields

```yaml
---
updatedDate: 2025-11-30 # When post was last updated
cover: '@assets/blog/covers/image.jpg' # Cover image (local path)
coverAlt: 'Image description' # Required if cover is provided
translationKey: 'unique-key' # Links translations together
featured: true # Highlight this post
canonicalUrl: 'https://example.com/post' # If republished elsewhere
---
```

## Content Guidelines

### Title Best Practices

- **Length**: Maximum 60 characters for optimal SEO
- **Format**: Use title case (capitalize main words)
- **Be descriptive**: Clearly convey the post's topic
- **Avoid clickbait**: Be honest and accurate

**Examples:**

- ✅ "Building Scalable Microservices: Production Tips"
- ✅ "Getting Started with Astro 5.0"
- ❌ "You Won't Believe This One Weird Trick!"
- ❌ "Introduction" (too vague)

### Description Best Practices

- **Length**: 50-160 characters for SEO
- **Purpose**: Summarize the post in one sentence
- **Include keywords**: Naturally incorporate relevant terms
- **Call to action**: Optionally end with what readers will learn

**Examples:**

- ✅ "Practical strategies for scaling microservices. Real-world insights from managing distributed systems in production."
- ❌ "This post is about microservices." (too short, not descriptive)

### Tags Best Practices

- **Quantity**: Use 1-5 tags per post
- **Format**: Lowercase, use hyphens for multi-word tags
- **Be specific**: Use precise, relevant tags
- **Consistency**: Reuse existing tags when possible
- **Restrictions**:
  - Minimum 2 characters
  - Maximum 30 characters
  - Letters, numbers, hyphens, and spaces only
  - Supports Unicode (accented characters allowed)

**Examples:**

- ✅ `['typescript', 'web-development', 'performance']`
- ✅ `['microserviços', 'arquitetura']` (Portuguese)
- ❌ `['ts', 't']` (too short)
- ❌ `['this-is-a-very-long-tag-that-exceeds-the-limit']` (too long)

### Translation Guidelines

When creating translations of posts:

1. **Use the same translationKey** across all language versions:

   ```yaml
   # English post
   translationKey: 'getting-started-astro'

   # Spanish post
   translationKey: 'getting-started-astro'

   # Portuguese post
   translationKey: 'getting-started-astro'
   ```

2. **Keep file naming consistent:**

   ```
   src/content/blog/en/getting-started-with-astro.md
   src/content/blog/es/primeros-pasos-con-astro.md
   src/content/blog/pt/primeiros-passos-com-astro.md
   ```

3. **Translate everything:**
   - Title, description, tags
   - All content
   - Alt text for images
   - Code comments (if relevant to understanding)

4. **Keep the same cover image** across translations (or use localized versions)

## Writing Style Guidelines

### Code Blocks

- Always specify the language for syntax highlighting
- Use descriptive filenames in code examples
- Add comments for complex logic

**Example:**

````markdown
```typescript
// src/utils/helper.ts
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
```
````

### Headings

- Use hierarchical heading structure (h1 → h2 → h3)
- The title is h1, so start content with h2
- Make headings descriptive and scannable
- Use sentence case for headings

**Example:**

```markdown
## Introduction to the concept

### Why this matters

### How it works

## Implementation details

### Step 1: Setup
```

### Links

- Use descriptive link text (not "click here")
- Prefer relative links for internal content
- Open external links in new tab when appropriate

**Examples:**

- ✅ `[Read our TypeScript guide](/blog/typescript-guide)`
- ✅ `[Astro documentation](https://docs.astro.build)`
- ❌ `Click [here](https://example.com) for more info`

### Lists

- Use bullet points for unordered information
- Use numbered lists for sequential steps
- Keep list items parallel in structure

## Accessibility Guidelines

### Images

- **Always provide alt text** for images
- Describe what's in the image, not "image of..."
- For decorative images, use empty alt: `alt=""`

**Examples:**

- ✅ `alt="Architecture diagram showing microservices communication"`
- ✅ `alt="Code snippet demonstrating async/await pattern"`
- ❌ `alt="Image"`
- ❌ `alt=""` (for content images)

### Content Structure

- Use proper heading hierarchy
- Provide text alternatives for visual content
- Ensure sufficient color contrast
- Use descriptive link text

## SEO Best Practices

### Keywords

- Include primary keyword in title
- Use keyword naturally in description
- Mention keyword in first paragraph
- Use related keywords throughout content

### Internal Linking

- Link to related blog posts
- Link to relevant portfolio work
- Use descriptive anchor text
- Don't over-link (2-5 internal links per post)

### Meta Information

- Keep title under 60 characters
- Keep description 50-160 characters
- Use relevant, specific tags
- Update `updatedDate` when making significant changes

## File Organization

### Directory Structure

```
src/content/blog/
├── en/                    # English posts
│   ├── post-slug.md
│   └── another-post.md
├── es/                    # Spanish posts
│   └── post-slug.md
└── pt/                    # Portuguese posts
    └── post-slug.md

src/assets/blog/
├── covers/                # Cover images
├── content/               # Content images
└── shared/                # Shared images
```

### File Naming

- Use kebab-case for filenames
- Keep names descriptive but concise
- Match names across translations (slug can differ)

**Examples:**

- ✅ `getting-started-with-astro.md`
- ✅ `building-scalable-microservices.md`
- ❌ `post1.md`
- ❌ `My New Blog Post.md`

## Publishing Checklist

Before publishing a blog post, verify:

- [ ] All required frontmatter fields are present
- [ ] Title is 60 characters or less
- [ ] Description is 50-160 characters
- [ ] 1-5 relevant tags are used
- [ ] Cover image is local (not external URL)
- [ ] Cover image has alt text
- [ ] All content images are local
- [ ] All images have descriptive alt text
- [ ] Code blocks specify language
- [ ] Headings use proper hierarchy
- [ ] Links are working and descriptive
- [ ] Content is proofread for typos
- [ ] Translations have matching translationKey (if applicable)
- [ ] Post builds without errors (`pnpm build`)
- [ ] `draft: false` when ready to publish

## Common Mistakes to Avoid

### ❌ External Image URLs

```yaml
cover: 'https://unsplash.com/photos/abc123'
```

**Fix:** Download and store locally in `src/assets/blog/covers/`

### ❌ Missing Alt Text

```markdown
![](./image.jpg)
```

**Fix:** Always provide descriptive alt text

```markdown
![Architecture diagram showing three-tier application structure](./image.jpg)
```

### ❌ Too Many Tags

```yaml
tags:
  ['typescript', 'javascript', 'web', 'dev', 'code', 'programming', 'frontend']
```

**Fix:** Use 1-5 most relevant tags

```yaml
tags: ['typescript', 'web-development', 'frontend']
```

### ❌ Vague Title

```yaml
title: 'New Post'
```

**Fix:** Be specific and descriptive

```yaml
title: 'Migrating from JavaScript to TypeScript: A Practical Guide'
```

### ❌ No Translation Key

When you have translations but forgot to link them:

```yaml
# English post - missing translationKey
title: 'Getting Started'

# Spanish post - missing translationKey
title: 'Primeros Pasos'
```

**Fix:** Add matching translationKey to both

```yaml
# English
translationKey: 'getting-started'

# Spanish
translationKey: 'getting-started'
```

## Resources

- [Astro Content Collections Documentation](https://docs.astro.build/en/guides/content-collections/)
- [MDX Documentation](https://mdxjs.com/)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

## Questions?

If you have questions about these guidelines or need clarification on any rule, please open an issue or reach out to the maintainers.
