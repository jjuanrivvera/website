# Code Review Issues

This document contains all issues identified during the deep code review. Each issue is formatted for GitHub issue creation.

---

## Critical Priority Issues

### Issue 1: Fix Array Mutation Bug in postSorting.ts

**Labels:** `bug`, `critical`, `code-quality`

**Description:**

The `sortPostsByDate` and `sortPostsByDateAsc` functions in `src/utils/postSorting.ts` mutate the original array passed to them, which can cause unexpected behavior throughout the application.

**Current Problematic Code:**
```typescript
export function sortPostsByDate(posts: BlogPost[]): BlogPost[] {
  return posts.sort((a, b) => { ... }); // Mutates original array!
}
```

**Expected Behavior:**
Functions should return a new sorted array without modifying the input.

**Proposed Fix:**
```typescript
export function sortPostsByDate(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => { ... }); // Create copy first
}
```

**Files to Modify:**
- `src/utils/postSorting.ts`

**Acceptance Criteria:**
- [ ] Both sort functions create a copy before sorting
- [ ] Original array passed to functions remains unchanged
- [ ] All existing tests pass

---

### Issue 2: Add Missing Security Headers to Netlify Configuration

**Labels:** `security`, `critical`, `configuration`

**Description:**

The `netlify.toml` file is missing critical security headers that should be present on all production websites:

1. **Strict-Transport-Security (HSTS)** - Enforces HTTPS connections
2. **Permissions-Policy** - Restricts browser features

**Current State:**
Only basic headers are configured (X-Frame-Options, X-Content-Type-Options, Referrer-Policy).

**Proposed Addition to `netlify.toml`:**
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
    Permissions-Policy = "geolocation=(), microphone=(), camera=(), payment=()"
```

**Files to Modify:**
- `netlify.toml`

**Acceptance Criteria:**
- [ ] HSTS header added with appropriate max-age
- [ ] Permissions-Policy header added restricting unused features
- [ ] Headers verified on deployed site using security header checker

---

### Issue 3: Improve ESLint Configuration with TypeScript and Best Practice Rules

**Labels:** `critical`, `code-quality`, `developer-experience`

**Description:**

The current ESLint configuration in `eslint.config.js` is minimal and only includes Astro recommended rules. This allows many potential bugs and code quality issues to slip through.

**Missing Configuration:**
- TypeScript-specific linting rules (`@typescript-eslint`)
- Import organization and sorting rules
- Unused variable detection
- Best practice enforcement
- Security-related rules

**Current Minimal Config:**
```javascript
import eslintPluginAstro from 'eslint-plugin-astro';
export default [...eslintPluginAstro.configs.recommended];
```

**Proposed Enhanced Config:**
```javascript
import eslintPluginAstro from 'eslint-plugin-astro';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '.astro/**'],
  },
  ...eslintPluginAstro.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];
```

**Files to Modify:**
- `eslint.config.js`
- `package.json` (may need additional dev dependencies)

**Acceptance Criteria:**
- [ ] TypeScript ESLint plugin configured
- [ ] Unused variables are flagged
- [ ] `any` types are warned
- [ ] `pnpm lint` passes with new configuration
- [ ] No new errors introduced in existing code (may need to fix some)

---

## High Priority Issues

### Issue 4: Externalize Hardcoded Portfolio Data to Data Files

**Labels:** `enhancement`, `high-priority`, `maintainability`

**Description:**

Portfolio data (experience, skills, projects, education, contact info) is hardcoded directly in component files, making maintenance difficult and violating DRY principles.

**Affected Components:**
- `src/components/sections/Experience.astro` - Jobs array (lines 11-32)
- `src/components/sections/Skills.astro` - Skill categories (lines 8-43)
- `src/components/sections/Projects.astro` - Projects array (lines 8-59)
- `src/components/sections/Education.astro` - Education data
- `src/components/sections/Contact.astro` - Contact information
- `src/components/blog/AuthorBio.astro` - Social links (lines 47-108)

**Proposed Solution:**

Create `/src/data/portfolio.ts`:
```typescript
export const experience = [
  {
    company: 'ACUE',
    key: 'acue',
    startDate: '2021-03',
    endDate: 'present',
    techTags: ['Laravel', 'Vue.js', 'Docker'],
  },
  // ... more jobs
];

export const skills = {
  frontend: ['React', 'Vue.js', 'TypeScript'],
  backend: ['Node.js', 'Laravel', 'Python'],
  // ... more categories
};

export const projects = [
  {
    key: 'canvas-lms-kit',
    github: 'https://github.com/...',
    featured: true,
  },
  // ... more projects
];

export const contact = {
  email: 'jjuanrivvera@gmail.com',
  phone: '+573167290759',
  location: 'Colombia',
};

export const socialLinks = {
  github: 'https://github.com/jjuanrivvera',
  linkedin: 'https://linkedin.com/in/jjuanrivvera',
  twitter: 'https://twitter.com/jjuanrivvera',
};
```

**Acceptance Criteria:**
- [ ] Create `src/data/portfolio.ts` with all portfolio data
- [ ] Update all affected components to import from data file
- [ ] Remove hardcoded data from components
- [ ] Verify site renders correctly after changes

---

### Issue 5: Replace Hardcoded Domain URLs with Configuration

**Labels:** `bug`, `high-priority`, `configuration`

**Description:**

The domain `https://jjuanrivvera.com` is hardcoded in multiple files instead of using the centralized `SITE_CONFIG.url`. This makes it difficult to deploy to staging environments or change domains.

**Affected Files and Lines:**
- `src/utils/blogHreflang.ts` - Multiple locations
- `src/i18n/utils.ts:62,88` - `getCanonicalUrl` and `getHreflangUrls`
- `src/components/blog/BlogListing.astro:72`
- `src/components/blog/Breadcrumb.astro:23`

**Current Problematic Code:**
```typescript
// In i18n/utils.ts
const base = 'https://jjuanrivvera.com'; // Hardcoded!
```

**Proposed Fix:**
```typescript
import { SITE_CONFIG } from '@config/site';
const base = SITE_CONFIG.url;
```

**Acceptance Criteria:**
- [ ] All hardcoded domain URLs replaced with `SITE_CONFIG.url`
- [ ] Site works correctly in development (localhost)
- [ ] Canonical URLs generate correctly
- [ ] hreflang URLs generate correctly

---

### Issue 6: Extract Duplicate i18n Objects to Shared Module

**Labels:** `enhancement`, `high-priority`, `code-quality`, `DRY`

**Description:**

`BlogListing.astro` and `TagArchive.astro` both contain identical 50+ line i18n translation objects, violating the DRY principle and creating maintenance burden.

**Duplicate Code Location:**
- `src/components/blog/BlogListing.astro` (lines 18-60)
- `src/components/blog/TagArchive.astro` (lines 18-60)

**Proposed Solution:**

Create `src/i18n/blog.ts`:
```typescript
export const blogI18n = {
  en: {
    title: 'Blog',
    description: 'Articles about web development...',
    readMore: 'Read more',
    // ... all blog-related translations
  },
  es: {
    title: 'Blog',
    description: 'Artículos sobre desarrollo web...',
    readMore: 'Leer más',
    // ...
  },
  pt: {
    title: 'Blog',
    description: 'Artigos sobre desenvolvimento web...',
    readMore: 'Ler mais',
    // ...
  },
} as const;
```

Then import in components:
```typescript
import { blogI18n } from '@i18n/blog';
const t = blogI18n[lang];
```

**Acceptance Criteria:**
- [ ] Create `src/i18n/blog.ts` with shared translations
- [ ] Update `BlogListing.astro` to use shared module
- [ ] Update `TagArchive.astro` to use shared module
- [ ] Remove duplicate code from both components
- [ ] All blog pages render correctly in all languages

---

### Issue 7: Refactor Duplicate Test Code with Parametrization

**Labels:** `enhancement`, `high-priority`, `testing`, `DRY`

**Description:**

Test files contain significant code duplication (estimated 40%+) where the same tests are copy-pasted for each language instead of using parametrized tests.

**Affected Files:**
- `tests/blog.spec.ts` - ~150 lines of duplicate code
- `tests/i18n.spec.ts` - ~100 lines of duplicate code

**Example of Current Duplication:**
```typescript
// Currently 3 separate tests doing the same thing:
test('English blog listing loads successfully', async ({ page }) => {
  const response = await page.goto('/blog');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Blog/);
});

test('Spanish blog listing loads successfully', async ({ page }) => {
  const response = await page.goto('/es/blog');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Blog/);
});

test('Portuguese blog listing loads successfully', async ({ page }) => {
  const response = await page.goto('/pt/blog');
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Blog/);
});
```

**Proposed Parametrized Approach:**
```typescript
const languages = [
  { locale: '/blog', lang: 'English', urlPrefix: '' },
  { locale: '/es/blog', lang: 'Spanish', urlPrefix: '/es' },
  { locale: '/pt/blog', lang: 'Portuguese', urlPrefix: '/pt' },
];

languages.forEach(({ locale, lang }) => {
  test(`${lang} blog listing loads successfully`, async ({ page }) => {
    const response = await page.goto(locale);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/Blog/);
  });
});
```

**Acceptance Criteria:**
- [ ] Refactor `blog.spec.ts` to use parametrized tests
- [ ] Refactor `i18n.spec.ts` to use parametrized tests
- [ ] Reduce total test file line count by ~40%
- [ ] All tests still pass
- [ ] Test output clearly indicates which language is being tested

---

## Medium Priority Issues

### Issue 8: Add Missing Key Props to Array Map Operations

**Labels:** `enhancement`, `medium-priority`, `best-practices`

**Description:**

Multiple components use `.map()` to render arrays but don't include `key` attributes, which is a best practice for efficient DOM updates.

**Affected Components:**
- `src/components/layout/Navbar.astro` - nav-links map
- `src/components/sections/Experience.astro` - jobs.map, highlights.map
- `src/components/sections/Skills.astro` - skillCategories.map, skills.map
- `src/components/sections/Projects.astro` - projects.map
- `src/components/blog/BlogListing.astro` - page.data.map
- `src/components/blog/TagList.astro` - tags.map
- `src/components/blog/RelatedPosts.astro` - posts.map
- `src/components/blog/TagArchive.astro` - breadcrumbItems.map, tagPosts.map
- `src/components/blog/Breadcrumb.astro` - items.map

**Example Fix:**
```astro
<!-- Before -->
{jobs.map((job) => (
  <div class="timeline-item">

<!-- After -->
{jobs.map((job) => (
  <div key={job.key} class="timeline-item">
```

**Acceptance Criteria:**
- [ ] All array maps in listed components have key props
- [ ] Keys are unique and stable (not array index unless necessary)
- [ ] Site renders correctly

---

### Issue 9: Add Error Handling for Missing Translation Keys

**Labels:** `bug`, `medium-priority`, `i18n`

**Description:**

The `useTranslations` function in `src/i18n/utils.ts` returns `undefined` if a translation key doesn't exist in either the requested language or the default language, which can cause silent failures.

**Current Problematic Code:**
```typescript
export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]): string {
    return ui[lang][key] ?? ui[defaultLang][key]; // Returns undefined if both missing
  };
}
```

**Proposed Fix:**
```typescript
export function useTranslations(lang: Lang) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]): string {
    const translation = ui[lang][key] ?? ui[defaultLang][key];
    if (translation === undefined) {
      console.warn(`Missing translation for key: ${String(key)} in language: ${lang}`);
      return String(key); // Return key as fallback
    }
    return translation;
  };
}
```

**Acceptance Criteria:**
- [ ] Missing keys are logged as warnings in development
- [ ] Missing keys return the key string as fallback (not undefined)
- [ ] Type safety maintained

---

### Issue 10: Configure or Remove Unused Markdown Plugins

**Labels:** `enhancement`, `medium-priority`, `configuration`

**Description:**

Several remark/rehype plugins are installed in `package.json` but not configured in `astro.config.mjs`, meaning they have no effect.

**Installed but Unused:**
- `remark-gfm` - GitHub Flavored Markdown
- `remark-smartypants` - Smart typography
- `rehype-slug` - Add IDs to headings
- `rehype-autolink-headings` - Auto-link headings
- `rehype-external-links` - Handle external links

**Proposed Fix (Option 1 - Configure):**
```javascript
// In astro.config.mjs
import remarkGfm from 'remark-gfm';
import remarkSmartypants from 'remark-smartypants';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeExternalLinks from 'rehype-external-links';

export default defineConfig({
  integrations: [
    mdx({
      remarkPlugins: [remarkGfm, remarkSmartypants],
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
      ],
    }),
  ],
});
```

**Proposed Fix (Option 2 - Remove):**
Remove unused packages from `package.json` if not needed.

**Acceptance Criteria:**
- [ ] Either configure all plugins in astro.config.mjs OR remove from dependencies
- [ ] Blog posts render correctly with any new configuration
- [ ] No unused dependencies

---

### Issue 11: Remove Unused sanitize-html Dependency

**Labels:** `enhancement`, `medium-priority`, `dependencies`

**Description:**

The `sanitize-html` package is listed in `package.json` dependencies but is never imported or used anywhere in the codebase.

**File:** `package.json:39`
```json
"sanitize-html": "^2.17.0"
```

**Verification:**
- No imports of `sanitize-html` found in any source files
- Astro's templating already auto-escapes content

**Proposed Fix:**
```bash
pnpm remove sanitize-html
pnpm remove @types/sanitize-html
```

**Acceptance Criteria:**
- [ ] Remove `sanitize-html` from dependencies
- [ ] Remove `@types/sanitize-html` from devDependencies
- [ ] Build still succeeds
- [ ] No runtime errors

---

### Issue 12: Add Missing TypeScript Configuration Options

**Labels:** `enhancement`, `medium-priority`, `configuration`, `typescript`

**Description:**

The `tsconfig.json` is missing some recommended compiler options that improve type safety and compatibility.

**Current Config:**
```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "preserve",
    "baseUrl": ".",
    "paths": { ... }
  }
}
```

**Proposed Additions:**
```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "preserve",
    "baseUrl": ".",
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "paths": { ... }
  }
}
```

**Also Consider:**
- Rename `@models/*` path alias to `@types/*` for consistency (currently maps to `src/types/*`)

**Acceptance Criteria:**
- [ ] Add recommended compiler options
- [ ] Consider renaming `@models` alias to `@types`
- [ ] TypeScript check passes: `pnpm check`
- [ ] Build succeeds

---

### Issue 13: Extract Hardcoded Language Regex Patterns to Configuration

**Labels:** `enhancement`, `medium-priority`, `maintainability`

**Description:**

The regex pattern `/^(en|es|pt)\//` for matching language prefixes is hardcoded in multiple files. If languages are added/removed, multiple files need updating.

**Affected Files:**
- `src/utils/blogHreflang.ts` (lines 20, 199, 213)
- Potentially other files

**Current Pattern:**
```typescript
const cleanSlug = slug.replace(/^(en|es|pt)\//, '');
```

**Proposed Solution:**
```typescript
// In src/config/site.ts
export const LANG_PATTERN = SITE_CONFIG.supportedLanguages.join('|');
export const LANG_PREFIX_REGEX = new RegExp(`^(${LANG_PATTERN})/`);

// Usage
import { LANG_PREFIX_REGEX } from '@config/site';
const cleanSlug = slug.replace(LANG_PREFIX_REGEX, '');
```

**Acceptance Criteria:**
- [ ] Create centralized language regex in config
- [ ] Update all files using hardcoded pattern
- [ ] Pattern automatically updates when languages change

---

### Issue 14: Refine Content Security Policy Configuration

**Labels:** `security`, `medium-priority`, `configuration`

**Description:**

The current CSP in `src/layouts/Layout.astro` uses `'unsafe-inline'` for both scripts and styles, which reduces security protection.

**Current CSP (line 130-132):**
```
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com ...
style-src 'self' 'unsafe-inline'
```

**Issues:**
- `'unsafe-inline'` for scripts allows any inline script to execute
- `'unsafe-inline'` for styles allows any inline style

**Recommendations:**
1. Document why `'unsafe-inline'` is needed (Astro framework requirement)
2. Consider implementing nonce-based CSP for scripts in the future
3. Add CSP violation reporting endpoint for monitoring

**Proposed Documentation:**
```typescript
// CSP Note: 'unsafe-inline' is required for:
// - Astro's inline scripts (view transitions, island hydration)
// - Scoped component styles
// Consider implementing nonce-based CSP when Astro supports it
```

**Acceptance Criteria:**
- [ ] Add comments explaining CSP decisions
- [ ] Consider adding `report-uri` for CSP violation monitoring
- [ ] Document any future improvements planned

---

## Low Priority Issues

### Issue 15: Standardize Component Styling Approach

**Labels:** `enhancement`, `low-priority`, `consistency`

**Description:**

Section components use global CSS while blog components use scoped `<style>` blocks, creating inconsistency.

**Components Missing Scoped Styles:**
- `src/components/layout/Navbar.astro`
- `src/components/sections/Hero.astro`
- `src/components/sections/Experience.astro`
- `src/components/sections/Skills.astro`
- `src/components/sections/Projects.astro`
- `src/components/sections/Education.astro`
- `src/components/sections/Contact.astro`

**Components With Scoped Styles:**
- All blog components in `src/components/blog/`

**Recommendation:**
Either migrate section component styles to scoped `<style>` blocks, or document the intentional difference in approach.

**Acceptance Criteria:**
- [ ] Either add scoped styles to section components OR document the approach
- [ ] Consistent styling pattern across codebase

---

### Issue 16: Add Error Case and Edge Case Tests

**Labels:** `enhancement`, `low-priority`, `testing`

**Description:**

Current tests only cover happy paths. Missing tests for error conditions and edge cases.

**Missing Test Scenarios:**
1. **404 Error Pages**
   - Navigate to non-existent blog post
   - Navigate to invalid tag

2. **Empty States**
   - Blog listing with no posts
   - Tag with no associated posts

3. **Edge Cases**
   - Blog post with no table of contents (no headings)
   - Very long heading text in TOC
   - Tags with special characters

4. **Accessibility**
   - Keyboard navigation
   - Screen reader compatibility

**Example New Tests:**
```typescript
test.describe('Error Handling', () => {
  test('displays 404 for non-existent blog post', async ({ page }) => {
    const response = await page.goto('/blog/non-existent-post-slug');
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText(/not found/i);
  });
});
```

**Acceptance Criteria:**
- [ ] Add 404 error page tests
- [ ] Add empty state tests (if applicable)
- [ ] Add edge case tests for TOC and tags
- [ ] Consider adding accessibility tests

---

### Issue 17: Fix Flaky Performance Test

**Labels:** `bug`, `low-priority`, `testing`

**Description:**

The performance test in `tests/blog.spec.ts` has a hardcoded 3-second threshold that can fail on slower CI machines or during high load.

**Current Code (line 549-556):**
```typescript
test('blog listing page loads within acceptable time', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/blog');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;

  expect(loadTime).toBeLessThan(3000); // Can fail on slow CI
});
```

**Proposed Fix:**
```typescript
test('blog listing page loads within acceptable time', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/blog');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;

  // More generous threshold for CI environments
  const threshold = process.env.CI ? 5000 : 3000;
  expect(loadTime).toBeLessThan(threshold);
}, { timeout: 10000 }); // Explicit test timeout
```

**Acceptance Criteria:**
- [ ] Performance test has CI-aware threshold
- [ ] Test has explicit timeout
- [ ] Test doesn't fail intermittently in CI

---

### Issue 18: Add Blog Post Creation Documentation to README

**Labels:** `documentation`, `low-priority`

**Description:**

The README doesn't explain how to add new blog posts, what frontmatter fields are required, or how the translation workflow works.

**Missing Documentation:**
1. How to create a new blog post
2. Required and optional frontmatter fields
3. How to add translations (translationKey system)
4. Tag naming conventions
5. Image/cover handling

**Proposed Addition to README:**
```markdown
### Adding Blog Posts

Blog posts are Markdown/MDX files in `src/content/blog/{lang}/`:

1. Create a new `.md` file:
```yaml
---
title: "Post Title" # Max 60 characters
description: "Brief description" # 50-160 characters
pubDate: 2024-01-15
updatedDate: 2024-01-16 # Optional
tags: [typescript, web-dev] # 1-5 tags
lang: en
translationKey: my-post # Same key for all translations
draft: false
author: "Your Name"
cover: ./covers/my-cover.jpg # Optional
coverAlt: "Description of cover image"
---

Your content here...
```

2. For translations, create files with same `translationKey`:
   - `en/my-post.md` (translationKey: my-post)
   - `es/mi-articulo.md` (translationKey: my-post)
   - `pt/meu-artigo.md` (translationKey: my-post)
```

**Acceptance Criteria:**
- [ ] Add blog post creation section to README
- [ ] Document all frontmatter fields
- [ ] Explain translation workflow
- [ ] Add examples

---

### Issue 19: Add JSDoc Documentation to Component Props

**Labels:** `documentation`, `low-priority`, `developer-experience`

**Description:**

Astro component Props interfaces lack JSDoc documentation, making it harder for developers to understand expected prop values.

**Current State:**
```typescript
interface Props {
  customLanguageUrls?: Record<Lang, string>;
}
```

**Proposed Improvement:**
```typescript
/**
 * Navigation bar component
 *
 * Displays responsive navbar with navigation links,
 * mobile menu, and language switcher.
 */
interface Props {
  /**
   * Custom URLs for the language switcher.
   * Use when the current page has different URLs per language
   * (e.g., blog posts with translated slugs).
   */
  customLanguageUrls?: Record<Lang, string>;
}
```

**Affected Components:**
- All components in `src/components/`

**Acceptance Criteria:**
- [ ] Add JSDoc comments to all component Props interfaces
- [ ] Document purpose of each prop
- [ ] Include examples where helpful

---

### Issue 20: Improve Education Component to Support Multiple Entries

**Labels:** `enhancement`, `low-priority`, `feature`

**Description:**

The Education component currently only displays a single education entry. It should support multiple education items like the Experience component does.

**Current Limitation:**
```astro
<!-- Only shows one degree -->
<p class="education-school">SENA</p>
<p class="education-degree">{t('education.degree')}</p>
<span class="education-date">{t('education.date')}</span>
```

**Proposed Improvement:**
```typescript
// In data file
export const education = [
  {
    key: 'sena',
    school: 'SENA',
    icon: 'education',
  },
  // Can add more entries
];

// In component
{education.map((item) => (
  <div key={item.key} class="education-item">
    <p class="education-school">{item.school}</p>
    <p class="education-degree">{t(`education.${item.key}.degree`)}</p>
    <span class="education-date">{t(`education.${item.key}.date`)}</span>
  </div>
))}
```

**Acceptance Criteria:**
- [ ] Education component supports array of entries
- [ ] Data externalized to data file
- [ ] Existing single entry still displays correctly
- [ ] Easy to add additional education entries

---

## Summary

| Priority | Issue Count | Key Themes |
|----------|-------------|------------|
| Critical | 3 | Security headers, ESLint, array mutation bug |
| High | 4 | Code duplication, hardcoded values, test refactoring |
| Medium | 7 | Configuration, dependencies, type safety |
| Low | 6 | Documentation, consistency, enhancements |
| **Total** | **20** | |

---

*Generated from deep code review on 2024-12-01*
