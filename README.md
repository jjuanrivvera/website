# Juan Felipe Rivera Portfolio Website

[![CI](https://github.com/jjuanrivvera/website/actions/workflows/ci.yml/badge.svg)](https://github.com/jjuanrivvera/website/actions/workflows/ci.yml)
[![Netlify Status](https://api.netlify.com/api/v1/badges/8a070b98-08e4-4765-94a5-3c0aef85a461/deploy-status)](https://app.netlify.com/sites/jjuanrivvera99/deploys)

A modern, responsive personal portfolio and blog website built with Astro, featuring internationalization (English/Spanish/Portuguese), optimized performance, and comprehensive SEO.

**Live Site:** [jjuanrivvera.com](https://jjuanrivvera.com)

## Features

- **Internationalization (i18n)** - Full English, Spanish, and Portuguese support with URL-based routing (`/` for EN, `/es/` for ES, `/pt/` for PT)
- **Dark Theme Design** - Modern dark UI with vibrant accent colors and gradient effects
- **Responsive Layout** - Mobile-first design with hamburger menu for mobile devices
- **SPA-like Navigation** - Astro View Transitions for smooth page transitions without full reloads
- **Smooth Animations** - AOS (Animate On Scroll) library for scroll-triggered animations
- **Accessibility** - Skip link, keyboard navigation (Escape to close menu), focus styles, reduced motion support
- **Performance Optimized** - Image optimization, font preloading, LCP preload, CSS/JS bundling
- **SEO Ready** - Open Graph, Twitter Cards, JSON-LD structured data, dynamic hreflang, sitemap
- **Blog System** - MDX-powered blog with pagination, tags, related posts, reading time, table of contents, and RSS feeds

## Tech Stack

- **[Astro](https://astro.build)** - Static site generator with component islands
- **TypeScript** - Type-safe translations and utilities
- **CSS3** - Custom properties, flexbox, grid, animations
- **AOS** - Animate On Scroll library
- **Vitest** - Unit testing framework for utilities and components
- **Playwright** - E2E testing framework
- **Inter Font** - Self-hosted web font
- **Netlify** - Hosting with automatic deployments

## Project Structure

```
website/
├── src/
│   ├── assets/
│   │   └── img/                    # Optimized images (processed by Astro)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.astro        # Navigation with language switcher
│   │   │   └── Footer.astro        # Footer component
│   │   ├── sections/
│   │   │   ├── Hero.astro          # Hero section
│   │   │   ├── Experience.astro    # Work experience timeline
│   │   │   ├── Skills.astro        # Technical skills grid
│   │   │   ├── Projects.astro      # Featured projects
│   │   │   ├── Education.astro     # Academic background
│   │   │   └── Contact.astro       # Contact information
│   │   └── ErrorPage.astro         # 404 error page component
│   ├── i18n/
│   │   ├── ui.ts                   # Translation strings (EN/ES)
│   │   └── utils.ts                # i18n utilities (translations, URLs, hreflang)
│   ├── layouts/
│   │   └── Layout.astro            # Main layout with meta tags, scripts
│   ├── pages/
│   │   ├── index.astro             # English homepage
│   │   ├── 404.astro               # English 404 page
│   │   ├── es/
│   │   │   ├── index.astro         # Spanish homepage
│   │   │   └── 404.astro           # Spanish 404 page
│   │   │   ├── blog/
│   │   │   │   ├── [...page].astro # Spanish blog listing
│   │   │   │   ├── [slug].astro     # Spanish blog posts
│   │   │   │   └── tag/
│   │   │   │       └── [tag].astro # Spanish tag archives
│   │   │   └── rss.xml.ts          # Spanish RSS feed
│   │   └── pt/
│   │       ├── index.astro         # Portuguese homepage
│   │       └── 404.astro           # Portuguese 404 page
│   │       ├── blog/
│   │       │   ├── [...page].astro # Portuguese blog listing
│   │       │   ├── [slug].astro     # Portuguese blog posts
│   │       │   └── tag/
│   │       │       └── [tag].astro # Portuguese tag archives
│   │       └── rss.xml.ts          # Portuguese RSS feed
│   └── styles/
│       └── global.css              # Global styles
├── content/
│   └── blog/
│       ├── en/                     # English blog posts (MDX)
│       ├── es/                     # Spanish blog posts (MDX)
│       └── pt/                     # Portuguese blog posts (MDX)
├── config/
│   ├── blog.ts                     # Blog configuration
│   └── site.ts                     # Site configuration
├── types/
│   └── blog.ts                     # Blog type definitions
├── utils/
│   ├── blogHreflang.ts             # Cross-language blog linking
│   ├── blogSchema.ts               # JSON-LD schema generation
│   ├── dateFormatting.ts           # Localized date formatting
│   ├── postSorting.ts              # Blog post sorting utilities
│   ├── readingTime.ts              # Reading time calculation
│   ├── relatedPosts.ts             # Related posts algorithm
│   ├── slug.ts                     # URL slug generation
│   └── toc.ts                      # Table of contents parsing
├── content.config.ts               # Content collections configuration
├── tests/
│   ├── e2e/
│   │   ├── blog.spec.ts            # Blog E2E tests
│   │   ├── global-setup.ts         # Test configuration
│   │   └── i18n.spec.ts            # i18n E2E tests
│   └── unit/
│       ├── components/
│       │   └── blog/
│       │       ├── ReadingTime.test.ts
│       │       └── TagList.test.ts
│       ├── i18n/
│       │   └── utils.test.ts
│       └── utils/
│           ├── blogHreflang.test.ts
│           ├── dateFormatting.test.ts
│           ├── readingTime.test.ts
│           └── relatedPosts.test.ts
├── public/
│   ├── css/
│   │   └── fonts.css               # Font-face declarations
│   ├── fonts/
│   │   └── Inter*.woff2            # Self-hosted Inter font files
│   ├── img/
│   │   ├── icons.svg               # SVG sprite for icons
│   │   └── favicon.ico             # Favicon
│   ├── files/
│   │   └── CV.pdf                  # Downloadable CV
│   └── robots.txt                  # Search engine directives
├── astro.config.mjs                # Astro configuration
├── tsconfig.json                   # TypeScript configuration
├── netlify.toml                    # Netlify deployment config
└── package.json                    # Dependencies and scripts
```

## Sections

| Section        | Description                                                                    |
| -------------- | ------------------------------------------------------------------------------ |
| **Hero**       | Introduction with profile image, title, CTAs, and social links                 |
| **Experience** | Professional work history timeline with tech tags                              |
| **Skills**     | Technical skills organized by category (Frontend, Backend, Database, Cloud)    |
| **Projects**   | Featured projects with descriptions and technologies                           |
| **Education**  | Academic background                                                            |
| **Contact**    | Contact information with email, phone, and location                            |
| **Blog**       | Blog post listings with pagination, tag filtering, and search                  |
| **Post**       | Individual blog posts with reading time, table of contents, and social sharing |

## Development

### Prerequisites

- Node.js 20+
- pnpm 9+

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm astro check
```

### Environment Variables

The site uses the following environment variables:

- `URL`: Base URL for the site (used for canonical URLs and sitemaps). Set to your production domain (e.g., `https://jjuanrivvera.com`)

In development, Astro uses `localhost:4321` by default. For production builds, set the `URL` environment variable.

### Available Scripts

| Command                | Description                             |
| ---------------------- | --------------------------------------- |
| `pnpm dev`             | Start dev server at `localhost:4321`    |
| `pnpm build`           | Type-check and build for production     |
| `pnpm preview`         | Preview production build locally        |
| `pnpm check`           | Run TypeScript diagnostics              |
| `pnpm format`          | Format code with Prettier               |
| `pnpm format:check`    | Check code formatting                   |
| `pnpm lint`            | Lint code with ESLint                   |
| `pnpm test`            | Run all tests (unit + E2E sequentially) |
| `pnpm test:unit`       | Run Vitest unit tests                   |
| `pnpm test:unit:watch` | Run unit tests in watch mode            |
| `pnpm test:unit:ui`    | Open Vitest UI                          |
| `pnpm test:e2e`        | Run Playwright E2E tests                |
| `pnpm test:e2e:ui`     | Open Playwright UI                      |
| `pnpm test:coverage`   | Generate test coverage report           |

## Testing

The project uses a comprehensive testing strategy with both unit and E2E tests:

### Test Structure

```
tests/
├── unit/                       # Vitest unit tests (~1s execution)
│   ├── components/
│   │   └── blog/               # Component tests using Astro Container API
│   ├── i18n/                   # Internationalization utilities
│   └── utils/                  # Pure utility functions
└── e2e/                        # Playwright E2E tests (~10s execution)
    ├── blog.spec.ts            # Blog functionality tests
    ├── i18n.spec.ts            # Language switching tests
    └── global-setup.ts         # Test configuration
```

### Unit Tests (Vitest)

**115 tests** covering:

- **Utility Functions** - Reading time calculation, date formatting, related posts algorithm
- **i18n Utilities** - Language detection, URL generation, translations
- **Blog Utilities** - Hreflang generation, tag filtering, post sorting
- **Components** - ReadingTime and TagList components using Astro Container API

```bash
# Run unit tests
pnpm test:unit

# Watch mode for development
pnpm test:unit:watch

# Open Vitest UI
pnpm test:unit:ui
```

### E2E Tests (Playwright)

**59 tests** covering:

- Homepage rendering and navigation across all languages
- Language switcher functionality
- Mobile menu interactions
- Section visibility and content
- 404 page handling
- Blog listing, post rendering, and navigation
- SEO meta tags and hreflang tags

```bash
# Run E2E tests
pnpm test:e2e

# Open Playwright UI
pnpm test:e2e:ui
```

### Test Strategy

- **Unit tests** run first in CI for fast feedback on logic errors
- **E2E tests** run in parallel with unit tests for faster CI execution
- **Coverage reporting** available via `pnpm test:coverage`
- All tests must pass before deployment

## Content Management

The blog uses Astro's content collections API with MDX for rich content authoring.

### Blog Posts

Blog posts are written in MDX and stored in `src/content/blog/{lang}/` with the following frontmatter:

```yaml
---
title: 'Post Title'
description: 'Post description for SEO'
pubDate: 2024-01-01
author: 'Juan Felipe Rivera'
tags: ['tag1', 'tag2']
cover:
  src: '/img/blog/covers/post-cover.jpg'
  alt: 'Cover image alt text'
language: 'en'
translationKey: 'post-slug'
featured: false
---
```

### Content Features

- **Pagination**: 12 posts per page with navigation
- **Tags**: Filter posts by tags with dedicated archive pages
- **Related Posts**: Algorithm-based recommendations using tags and recency
- **Reading Time**: Automatic calculation based on word count
- **Table of Contents**: Generated from headings with anchor links
- **Social Sharing**: Twitter, LinkedIn, and copy link buttons
- **RSS Feeds**: Auto-generated per language at `/rss.xml`

### Writing Posts

1. Create a new `.md` file in the appropriate language folder
2. Use standard Markdown with optional JSX components
3. Add frontmatter with required fields
4. For translations, use the same `translationKey` across languages
5. Run `pnpm build` to validate content

## Internationalization

The site supports English (default), Spanish, and Portuguese with URL-based routing:

| Language   | URL Pattern | Example                |
| ---------- | ----------- | ---------------------- |
| English    | `/`         | `jjuanrivvera.com/`    |
| Spanish    | `/es/`      | `jjuanrivvera.com/es/` |
| Portuguese | `/pt/`      | `jjuanrivvera.com/pt/` |

### Translation System

Translations are defined in `src/i18n/ui.ts` (UI elements) and `src/i18n/blog.ts` (blog-specific strings) with TypeScript for type safety:

```typescript
// Access translations in components
const t = useTranslations(lang);
const title = t('hero.name');
```

### Adding Translations

1. Add the key to the `en`, `es`, and `pt` objects in `src/i18n/ui.ts`
2. Use `t('your.key')` in components

## SEO Features

- **Dynamic Canonical URLs** - Each page has its own canonical URL
- **hreflang Tags** - Proper alternate language links for each page
- **Open Graph** - Social sharing metadata with optimized images
- **Twitter Cards** - Large image cards for Twitter
- **JSON-LD** - Person schema for structured data
- **Sitemap** - Auto-generated with i18n support (`sitemap-index.xml`)
- **robots.txt** - Search engine directives

## Performance Features

- **Image Optimization** - Astro's built-in image processing with WebP output
- **LCP Preload** - Profile picture preloaded for faster rendering
- **Font Preload** - Critical fonts preloaded
- **CSS Bundling** - Styles bundled and minified
- **JS Code Splitting** - Only load what's needed per page
- **View Transitions** - SPA-like navigation without full reloads

## Accessibility

- Skip link for keyboard navigation
- Escape key closes mobile menu
- Focus-visible styles for keyboard users
- Reduced motion support via `prefers-reduced-motion`
- ARIA labels on interactive elements
- Semantic HTML structure

## Analytics

Google Analytics 4 is integrated with privacy-focused configuration:

- IP anonymization enabled
- Tracked events:
  - Page views
  - CV downloads
  - Email clicks
  - Phone clicks
  - Social media clicks (LinkedIn, GitHub)
  - Section visibility (IntersectionObserver)

## Deployment

### Netlify (Recommended)

The site is configured for Netlify deployment:

1. Connect your repository to Netlify
2. Build settings are auto-detected from `netlify.toml`:
   - Build command: `pnpm run build`
   - Publish directory: `dist`
   - Node version: 20
   - pnpm version: 9

### Manual Deployment

```bash
# Build the site
pnpm build

# The `dist/` folder contains the static site
# Upload to any static hosting provider
```

## Security

- Content Security Policy (CSP) meta tag
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

## Contributing

### Adding Content

1. **Blog Posts**: Follow the content management guidelines above
2. **Translations**: Add new keys to all language objects in `src/i18n/ui.ts` and `src/i18n/blog.ts`
3. **Components**: Use existing patterns and run `pnpm lint` and `pnpm format`

### Development Workflow

1. Create a feature branch from `main`
2. Make changes and test locally
3. Run `pnpm build` and `pnpm test` to ensure everything works
4. Commit with conventional style (e.g., `feat: add new blog feature`)
5. Open a PR with description and screenshots if UI changes

### Guidelines

- Add tests for new features
- Update this README if adding new features
- Ensure accessibility and i18n coverage

## License

All rights reserved.

---

_Built with [Astro](https://astro.build)_
