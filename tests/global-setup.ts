import { test as base } from '@playwright/test';

// Extend base test to block Google Analytics routes
export const test = base.extend({
  page: async ({ page }, use) => {
    // Block Google Analytics domains to prevent test traffic pollution
    await page.route('**/*google-analytics.com/**', (route) => route.abort());
    await page.route('**/*googletagmanager.com/**', (route) => route.abort());
    await use(page);
  },
});

export { expect } from '@playwright/test';
