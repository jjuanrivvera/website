import { getViteConfig } from 'astro/config';
import { defineConfig } from 'vitest/config';

export default defineConfig(
  getViteConfig({
    test: {
      globals: true,
      environment: 'happy-dom',
      include: ['tests/unit/**/*.test.ts'],
      exclude: ['tests/e2e/**/*', 'node_modules/**/*', 'dist/**/*'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'tests/**/*',
          '**/*.config.*',
          '**/node_modules/**',
          '**/dist/**',
          '**/.astro/**',
        ],
      },
    },
  })
);
