# Juan Felipe Rivera Portfolio Website

[![CI](https://github.com/jjuanrivvera/website/actions/workflows/ci.yml/badge.svg)](https://github.com/jjuanrivvera/website/actions/workflows/ci.yml)
[![Netlify Status](https://api.netlify.com/api/v1/badges/your-site-id/deploy-status)](https://app.netlify.com/sites/your-site/deploys)

A modern, responsive personal portfolio website built with Astro, featuring internationalization (English/Spanish/Portuguese), optimized performance, and comprehensive SEO.

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

## Tech Stack

- **[Astro](https://astro.build)** - Static site generator with component islands
- **TypeScript** - Type-safe translations and utilities
- **CSS3** - Custom properties, flexbox, grid, animations
- **AOS** - Animate On Scroll library
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
│   │   └── pt/
│   │       ├── index.astro         # Portuguese homepage
│   │       └── 404.astro           # Portuguese 404 page
│   └── styles/
│       └── global.css              # Global styles
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

| Section        | Description                                                                 |
| -------------- | --------------------------------------------------------------------------- |
| **Hero**       | Introduction with profile image, title, CTAs, and social links              |
| **Experience** | Professional work history timeline with tech tags                           |
| **Skills**     | Technical skills organized by category (Frontend, Backend, Database, Cloud) |
| **Projects**   | Featured projects with descriptions and technologies                        |
| **Education**  | Academic background                                                         |
| **Contact**    | Contact information with email, phone, and location                         |

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

### Available Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `pnpm dev`          | Start dev server at `localhost:4321` |
| `pnpm build`        | Type-check and build for production  |
| `pnpm preview`      | Preview production build locally     |
| `pnpm check`        | Run TypeScript diagnostics           |
| `pnpm format`       | Format code with Prettier            |
| `pnpm format:check` | Check code formatting                |
| `pnpm lint`         | Lint code with ESLint                |
| `pnpm test`         | Run Playwright E2E tests             |
| `pnpm test:ui`      | Run Playwright tests with UI         |

## Internationalization

The site supports English (default), Spanish, and Portuguese with URL-based routing:

| Language   | URL Pattern | Example                |
| ---------- | ----------- | ---------------------- |
| English    | `/`         | `jjuanrivvera.com/`    |
| Spanish    | `/es/`      | `jjuanrivvera.com/es/` |
| Portuguese | `/pt/`      | `jjuanrivvera.com/pt/` |

### Translation System

Translations are defined in `src/i18n/ui.ts` with TypeScript for type safety:

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

## License

All rights reserved.

---

_Built with [Astro](https://astro.build)_
