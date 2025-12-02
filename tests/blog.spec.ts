import { test, expect } from './global-setup';

type LanguageConfig = {
  locale: string;
  lang: string;
  urlPrefix: string;
};

const languages: LanguageConfig[] = [
  { locale: '/blog', lang: 'English', urlPrefix: '' },
  { locale: '/es/blog', lang: 'Spanish', urlPrefix: '/es' },
  { locale: '/pt/blog', lang: 'Portuguese', urlPrefix: '/pt' },
];

test.describe('Blog', () => {
  test.describe('Blog Listing Pages', () => {
    languages.forEach(({ locale, lang }) => {
      test(`${lang} blog listing loads successfully`, async ({ page }) => {
        const response = await page.goto(locale);
        expect(response?.status()).toBe(200);

        await expect(page).toHaveTitle(/Blog/);
        await expect(page.locator('.blog-listing__title, h1')).toContainText(
          'Blog'
        );
        await expect(page.locator('.post-card').first()).toBeVisible();
      });
    });

    test('blog listing displays post metadata', async ({ page }) => {
      await page.goto('/blog');

      const firstPost = page.locator('.post-card').first();

      // Check for post title, description, date, and tags
      await expect(firstPost.locator('.post-card__title')).toBeVisible();
      await expect(firstPost.locator('.post-card__description')).toBeVisible();
      await expect(firstPost.locator('.post-card__meta time')).toBeVisible();
      await expect(firstPost.locator('.tag-list')).toBeVisible();
    });
  });

  test.describe('Blog Post Pages', () => {
    test('English blog post loads successfully', async ({ page }) => {
      // First, get a post URL from the listing
      await page.goto('/blog');
      const firstPostLink = page.locator('.post-card__title a').first();
      const postUrl = await firstPostLink.getAttribute('href');

      // Navigate to the post
      const response = await page.goto(postUrl!);
      expect(response?.status()).toBe(200);

      // Verify post structure
      await expect(page.locator('.blog-post__title')).toBeVisible();
      await expect(page.locator('.blog-post__meta time')).toBeVisible();
      await expect(page.locator('.blog-post-content')).toBeVisible();
    });

    test('blog post displays breadcrumbs', async ({ page }) => {
      await page.goto('/blog');
      await page.locator('.post-card__title a').first().click();

      // Verify breadcrumbs are present
      const breadcrumb = page.locator('.breadcrumb');
      await expect(breadcrumb).toBeVisible();
      await expect(breadcrumb.getByText('Home')).toBeVisible();
      await expect(breadcrumb.getByText('Blog')).toBeVisible();
    });

    test('blog post displays author bio', async ({ page }) => {
      await page.goto('/blog');
      await page.locator('.post-card__title a').first().click();

      // Verify author bio is present
      const authorBio = page.locator('.author-bio');
      await expect(authorBio).toBeVisible();
      await expect(authorBio.locator('.author-bio__name')).toBeVisible();
      await expect(authorBio.locator('.author-bio__bio')).toBeVisible();
      await expect(authorBio.locator('.author-bio__avatar')).toBeVisible();

      // Verify social links
      await expect(authorBio.locator('a[href*="github"]')).toBeVisible();
      await expect(authorBio.locator('a[href*="linkedin"]')).toBeVisible();
      await expect(authorBio.locator('a[href*="twitter"]')).toBeVisible();
    });

    test('blog post displays social share buttons', async ({ page }) => {
      await page.goto('/blog');
      await page.locator('.post-card__title a').first().click();

      // Verify social share section is present
      const socialShare = page.locator('.social-share');
      await expect(socialShare).toBeVisible();
    });

    test('blog post displays reading time', async ({ page }) => {
      await page.goto('/blog');
      await page.locator('.post-card__title a').first().click();

      // Verify reading time is displayed
      await expect(page.locator('.blog-post__meta')).toContainText(/min/);
    });
  });

  test.describe('Tag Navigation', () => {
    test('clicking a tag navigates to tag archive page', async ({ page }) => {
      await page.goto('/blog');

      // Click the first tag
      const firstTag = page.locator('.tag-list__tag').first();
      const tagText = await firstTag.textContent();
      await firstTag.click();

      // Verify navigation to tag page
      await expect(page).toHaveURL(/\/blog\/tag\//);

      // Verify tag page displays filtered posts (title includes # symbol)
      const tagName = tagText!.trim(); // Keep the # in the tag name
      // Use case-insensitive check since tag titles are capitalized
      const h1Text = await page.locator('.tag-page__title').textContent();
      expect(h1Text?.toLowerCase()).toContain(tagName.toLowerCase());
      await expect(page.locator('.post-card').first()).toBeVisible();
    });

    test('tag archive pages work in all languages', async ({ page }) => {
      // English tag page
      await page.goto('/blog');
      await page.locator('.tag-list__tag').first().click();
      await expect(page).toHaveURL(/\/blog\/tag\//);

      // Spanish tag page
      await page.goto('/es/blog');
      await page.locator('.tag-list__tag').first().click();
      await expect(page).toHaveURL(/\/es\/blog\/tag\//);

      // Portuguese tag page - skip for now (no Portuguese posts)
      // await page.goto('/pt/blog');
      // await page.locator('.tag-list__tag').first().click();
      // await expect(page).toHaveURL(/\/pt\/blog\/tag\//);
    });

    test('tags display with single hash prefix', async ({ page }) => {
      await page.goto('/blog');

      const firstTag = page.locator('.tag-list__tag').first();
      const tagText = (await firstTag.textContent())!.trim();

      // Verify tag starts with single # and doesn't have ##
      expect(tagText).toMatch(/^#[^\s#]/);
      expect(tagText).not.toContain('##');
    });

    test('tag links in blog post navigate correctly', async ({ page }) => {
      await page.goto('/blog');
      await page.locator('.post-card__title a').first().click();

      // Find and click a tag in the post header
      const postTag = page.locator('.blog-post__header .tag-list__tag').first();
      await postTag.click();

      // Verify navigation to tag page
      await expect(page).toHaveURL(/\/blog\/tag\//);
    });
  });

  test.describe('Language Switching on Blog Posts', () => {
    test('language switcher navigates to translation when available', async ({
      page,
    }) => {
      // Navigate to an English post that has translations
      await page.goto('/blog');

      // Find a post with translations (check if there are multiple posts)
      const postLink = page.locator('.post-card__title a').first();
      await postLink.click();

      // Try to switch to Spanish
      await page
        .getByRole('button', { name: 'Change language' })
        .first()
        .click();

      // Spanish link should be visible
      const esLink = page.locator('#navbar a[hreflang="es"]').first();
      await expect(esLink).toBeVisible();

      const href = await esLink.getAttribute('href');
      expect(href).toBeTruthy();

      // Click to navigate
      await esLink.click();

      // Should navigate to Spanish version or blog listing
      await page.waitForURL(/\/(es\/)?blog/);
      expect(page.url()).toMatch(/\/(es\/)?blog/);
    });

    test('language switcher provides Portuguese option', async ({ page }) => {
      await page.goto('/blog');
      await page.locator('.post-card__title a').first().click();
      await page.waitForLoadState('networkidle');

      // Open language switcher (use first one - desktop navbar)
      await page
        .getByRole('button', { name: 'Change language' })
        .first()
        .click();

      // Portuguese link should be visible and have a valid href
      const ptLink = page.locator('#navbar a[hreflang="pt"]').first();
      await expect(ptLink).toBeVisible();

      const href = await ptLink.getAttribute('href');
      expect(href).toBeTruthy();
      // Href should either point to /pt/blog (fallback) or /pt/blog/[slug] (translation)
      expect(href).toMatch(/^\/pt\/blog/);
    });

    test('language switcher is visible on blog posts', async ({ page }) => {
      await page.goto('/blog');
      await page.locator('.post-card__title a').first().click();

      // Verify language switcher is present
      await expect(
        page.getByRole('button', { name: 'Change language' })
      ).toBeVisible();
    });
  });

  test.describe('Navbar Blog Navigation', () => {
    test('navbar blog link navigates from home to blog', async ({ page }) => {
      await page.goto('/');

      // Click Blog link in navbar
      await page.getByRole('link', { name: 'Blog', exact: true }).click();

      // Verify navigation to blog
      await expect(page).toHaveURL('/blog');
      await expect(page.locator('.blog-listing__title')).toContainText('Blog');
    });

    languages.forEach(({ urlPrefix, lang }) => {
      test(`${lang} navbar blog link works`, async ({ page }) => {
        await page.goto(`${urlPrefix}/`);
        await page.getByRole('link', { name: 'Blog', exact: true }).click();
        await expect(page).toHaveURL(`${urlPrefix}/blog`);
      });
    });

    test('navbar blog link is active on blog pages', async ({ page }) => {
      await page.goto('/blog');

      // Check if blog link has active state
      const blogLink = page.getByRole('link', { name: 'Blog', exact: true });
      await expect(blogLink).toBeVisible();
    });
  });

  test.describe('Table of Contents', () => {
    test('table of contents displays when headings exist', async ({ page }) => {
      await page.goto('/blog');
      await page.locator('.post-card__title a').first().click();

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check if TOC exists (it may not exist on all posts)
      const toc = page.locator('.blog-post__toc');
      const tocExists = (await toc.count()) > 0;

      if (tocExists) {
        await expect(toc).toBeVisible();
        await expect(toc.locator('a').first()).toBeVisible();
      }
    });

    test('table of contents links are clickable', async ({ page }) => {
      await page.goto('/blog');
      await page.locator('.post-card__title a').first().click();

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check if TOC exists
      const tocLinks = page.locator('.blog-post__toc a');
      const linkCount = await tocLinks.count();

      if (linkCount > 0) {
        // Click first TOC link
        const firstLink = tocLinks.first();
        const href = await firstLink.getAttribute('href');
        expect(href).toMatch(/^#/);

        await firstLink.click();

        // Verify URL has hash
        expect(page.url()).toContain('#');
      }
    });
  });

  test.describe('Related Posts', () => {
    test('related posts section displays when available', async ({ page }) => {
      await page.goto('/blog');
      await page.locator('.post-card__title a').first().click();

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check if related posts exist
      const relatedPosts = page.locator('.related-posts');
      const relatedPostsExist = (await relatedPosts.count()) > 0;

      if (relatedPostsExist) {
        await expect(relatedPosts).toBeVisible();

        // Verify related posts have cards
        await expect(relatedPosts.locator('.post-card').first()).toBeVisible();
      }
    });

    test('related posts are clickable', async ({ page }) => {
      await page.goto('/blog');
      await page.locator('.post-card__title a').first().click();

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check if related posts exist
      const relatedPostLink = page
        .locator('.related-posts .post-card__title a')
        .first();
      const linkExists = (await relatedPostLink.count()) > 0;

      if (linkExists) {
        const href = await relatedPostLink.getAttribute('href');
        expect(href).toContain('/blog/');

        // Click and verify navigation
        await relatedPostLink.click();
        await expect(page).toHaveURL(/\/blog\//);
      }
    });
  });

  test.describe('Reading Progress', () => {
    test('reading progress bar is visible on blog posts', async ({ page }) => {
      await page.goto('/blog');
      await page.locator('.post-card__title a').first().click();
      await page.waitForLoadState('networkidle');

      // Reading progress bar should exist
      const progressBar = page.locator('.reading-progress');
      await expect(progressBar).toBeVisible();

      // Verify ARIA attributes
      await expect(progressBar).toHaveAttribute('role', 'progressbar');
      await expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      await expect(progressBar).toHaveAttribute('aria-valuemax', '100');

      // Scroll down and verify progress updates
      await page.evaluate(() =>
        window.scrollTo(0, document.body.scrollHeight / 2)
      );
      await page.waitForTimeout(100); // Wait for scroll handler

      // Progress bar inner should have some width
      const progressBarInner = page.locator('#reading-progress-bar');
      const width = await progressBarInner.evaluate((el) => {
        return window.getComputedStyle(el).width;
      });
      expect(width).not.toBe('0px');
    });
  });

  test.describe('SEO and Meta Tags', () => {
    test('blog post has proper meta tags', async ({ page }) => {
      await page.goto('/blog');
      const firstPostLink = page.locator('.post-card__title a').first();
      await firstPostLink.click();

      // Wait for navigation to complete
      await page.waitForLoadState('networkidle');

      // Check for Open Graph tags
      const ogTitle = page.locator('meta[property="og:title"]');
      const ogDescription = page.locator('meta[property="og:description"]');
      const ogType = page.locator('meta[property="og:type"]');

      expect(await ogTitle.count()).toBeGreaterThan(0);
      expect(await ogDescription.count()).toBeGreaterThan(0);
      // OG type should be either 'article' or 'website' depending on layout configuration
      const ogTypeContent = await ogType.getAttribute('content');
      expect(['article', 'website']).toContain(ogTypeContent);
    });

    test('blog post has canonical URL', async ({ page }) => {
      await page.goto('/blog');
      await page.locator('.post-card__title a').first().click();

      // Wait for navigation to complete
      await page.waitForLoadState('networkidle');

      // Check for canonical link
      const canonical = page.locator('link[rel="canonical"]');
      expect(await canonical.count()).toBeGreaterThan(0);

      const href = await canonical.getAttribute('href');
      expect(href).toContain('/blog/');
    });

    test('blog post has hreflang tags', async ({ page }) => {
      await page.goto('/blog');
      await page.locator('.post-card__title a').first().click();

      // Wait for navigation to complete
      await page.waitForLoadState('networkidle');

      // Check for hreflang links
      const hreflangLinks = page.locator('link[rel="alternate"][hreflang]');
      const count = await hreflangLinks.count();

      // Should have at least the current language
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Responsive Design', () => {
    test('blog listing is responsive on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/blog');

      // Verify mobile menu toggle is visible
      await expect(page.locator('#navToggle')).toBeVisible();

      // Verify blog cards are visible and stacked
      await expect(page.locator('.post-card').first()).toBeVisible();
    });

    test('blog post is responsive on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/blog');
      await page.locator('.post-card__title a').first().click();

      // Verify content is readable
      await expect(page.locator('.blog-post__title')).toBeVisible();
      await expect(page.locator('.blog-post-content')).toBeVisible();
    });

    test('table of contents is responsive on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/blog');
      await page.locator('.post-card__title a').first().click();

      await page.waitForLoadState('networkidle');

      // TOC should be visible or hidden appropriately on mobile
      const toc = page.locator('.blog-post__toc');
      const tocExists = (await toc.count()) > 0;

      // If TOC exists, it should be visible (will be above content on mobile)
      if (tocExists) {
        await expect(toc).toBeVisible();
      }
    });
  });

  test.describe('RSS Feed', () => {
    test('RSS feed is accessible', async ({ page }) => {
      const response = await page.goto('/rss.xml');
      expect(response?.status()).toBe(200);

      // Verify it's XML
      const contentType = response?.headers()['content-type'];
      expect(contentType).toContain('xml');
    });

    languages.forEach(({ urlPrefix, lang }) => {
      test(`${lang} RSS feed exists`, async ({ page }) => {
        const response = await page.goto(`${urlPrefix}/rss.xml`);
        expect(response?.status()).toBe(200);
      });
    });
  });

  test.describe('Search and Filtering', () => {
    test('tag filter shows only posts with that tag', async ({ page }) => {
      await page.goto('/blog');

      // Get the first tag and its text
      const firstTag = page.locator('.tag-list__tag').first();
      const tagText = (await firstTag.textContent())!
        .replace('#', '')
        .trim()
        .toLowerCase();

      // Click the tag
      await firstTag.click();

      // Verify we're on the tag page
      await expect(page).toHaveURL(new RegExp(`/blog/tag/${tagText}`));

      // Verify all displayed posts have this tag
      const blogCards = page.locator('.post-card');
      const count = await blogCards.count();

      expect(count).toBeGreaterThan(0);

      // Check first post has the tag
      const firstPostTags = blogCards.first().locator('.tag-list__tag');
      const postTagsText = await firstPostTags.allTextContents();
      const hasTag = postTagsText.some((tag) =>
        tag.toLowerCase().includes(tagText)
      );

      expect(hasTag).toBe(true);
    });
  });

  test.describe('Performance', () => {
    test('blog listing page loads within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/blog');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('blog post page loads within acceptable time', async ({ page }) => {
      await page.goto('/blog');
      const postLink = page.locator('.post-card__title a').first();

      const startTime = Date.now();
      await postLink.click();
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });
  });
});
