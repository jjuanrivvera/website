---
title: 'Getting Started with Astro: Modern Framework'
description: 'Discover why Astro is perfect for fast, content-focused websites. Unique features, performance benefits, and how to start.'
author: 'Juan Felipe Rivera Gonzalez'
pubDate: 2025-11-20
cover: 'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=1200&h=675&fit=crop'
coverAlt: 'Abstract cosmic illustration representing Astro framework'
tags: ['astro', 'web development', 'javascript', 'performance']
lang: 'en'
translationKey: 'getting-started-with-astro'
featured: true
draft: false
---

# Getting Started with Astro: A Modern Static Site Generator

In the ever-evolving landscape of web development, choosing the right framework can make or break your project. Today, I want to share why **Astro** has become my go-to choice for building fast, content-focused websites.

## What Makes Astro Different?

Astro takes a unique approach to building websites by shipping **zero JavaScript by default**. This might sound counterintuitive in 2025, but it's actually a game-changer for performance.

### Key Features

1. **Island Architecture**: Only hydrate interactive components when needed
2. **Framework Agnostic**: Use React, Vue, Svelte, or any framework you prefer
3. **Content Collections**: Type-safe content management with Zod
4. **Built-in Optimizations**: Image optimization, lazy loading, and more

## Performance Benefits

```javascript
// Traditional approach - hydrates entire page
export default function Page() {
  return <Layout>
    <Header />
    <Content />
    <Footer />
  </Layout>
}

// Astro approach - only interactive parts hydrate
---
import Header from '@components/Header.astro';
import InteractiveWidget from '@components/Widget.jsx';
import Footer from '@components/Footer.astro';
---

<Layout>
  <Header />
  <InteractiveWidget client:load />
  <Footer />
</Layout>
```

With Astro, only the `InteractiveWidget` component ships JavaScript to the client. This results in:

- **Faster page loads**: Less JavaScript means faster Time to Interactive (TTI)
- **Better SEO**: Search engines can crawl fully-rendered HTML
- **Improved Core Web Vitals**: Smaller bundles = better LCP and CLS scores

## Getting Started

Setting up a new Astro project is incredibly simple:

```bash
npm create astro@latest

# Follow the prompts:
# ✔ Where should we create your new project? › my-astro-site
# ✔ How would you like to start your new project? › a template
# ✔ Install dependencies? … yes
# ✔ Initialize a git repository? … yes
```

That's it! You now have a fully functional Astro project.

## Content Collections

One of Astro's most powerful features is Content Collections. Here's how I use them for my blog:

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.date(),
      cover: image().optional(),
      tags: z.array(z.string()),
      lang: z.enum(['en', 'es', 'pt']),
      draft: z.boolean().default(false),
    }),
});

export const collections = {
  blog: blogCollection,
};
```

This gives you:

- Type-safe content queries
- Automatic validation
- IntelliSense in your editor
- Build-time errors for invalid content

## Real-World Performance

I recently migrated my portfolio from Next.js to Astro. The results speak for themselves:

| Metric               | Next.js | Astro | Improvement     |
| -------------------- | ------- | ----- | --------------- |
| **Bundle Size**      | 247 KB  | 12 KB | **95% smaller** |
| **LCP**              | 2.1s    | 0.8s  | **62% faster**  |
| **Lighthouse Score** | 87      | 100   | **+13 points**  |

## When to Use Astro

Astro excels at:

- **Content sites**: Blogs, documentation, marketing pages
- **Static sites**: Portfolios, landing pages, company websites
- **Hybrid apps**: Mix static content with dynamic islands

Astro might not be ideal for:

- Heavy SPAs (Single Page Applications)
- Real-time dashboards requiring constant data updates
- Apps that need complex client-side routing

## Conclusion

Astro represents a paradigm shift in how we build websites. By defaulting to zero JavaScript and only adding interactivity where needed, it delivers exceptional performance without sacrificing developer experience.

Whether you're building a blog, documentation site, or portfolio, Astro provides the perfect balance of speed, flexibility, and modern developer tooling.

Ready to give it a try? Check out the [official Astro documentation](https://docs.astro.build) and start building faster websites today!

---

**What's your experience with Astro?** Share your thoughts in the comments below or reach out to me on [LinkedIn](https://linkedin.com/in/jjuanrivvera99).
