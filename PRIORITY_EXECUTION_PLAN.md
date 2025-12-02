# Priority Execution Plan - Open Issues Analysis

**Generated:** 2025-12-01
**Total Issues:** 11
**Total Estimated Time:** 5.5-6.5 hours

---

## 📋 Executive Summary

This document provides a structured execution plan for all open issues in the repository, prioritized by severity, impact, and dependencies. Issues are grouped into 5 phases, from critical security fixes to future enhancements.

### Quick Stats

- **Critical Issues:** 2 (security + core bug)
- **High Priority:** 3 (code quality + DRY violations)
- **Medium Priority:** 3 (maintenance + performance)
- **Low Priority:** 2 (quick enhancements)
- **Future Enhancement:** 1 (larger effort)

---

## 🔴 Phase 2: High Priority (Code Quality & DRY Violations)

**Total Estimated Time:** ~90 minutes
**Deploy:** After completion, run full test suite

## 🟡 Phase 3: Medium Priority (Quick Wins & Maintenance)

**Total Estimated Time:** ~60 minutes
**Deploy:** After completion

## 🟢 Phase 4: Low Priority (Quick Enhancements)

**Total Estimated Time:** ~20 minutes
**Deploy:** Can be combined with Phase 3 deployment

### Issue #17: AVIF Format Evaluation 🎨

**Priority:** OPTIONAL - Optimization
**Effort:** ~15 minutes (includes testing)
**Labels:** `enhancement`

**Problem:**
Using WebP format for images, but AVIF offers 20-30% better compression.

**Benefits:**

- 20-30% better compression than WebP
- Smaller file sizes with same visual quality
- Faster LCP (Largest Contentful Paint) times
- 95%+ global browser support

**Implementation Options:**

**Option 1: Switch hero image to AVIF**

```astro
<Image
  src={profilePicture}
  alt={t('hero.imageAlt')}
  format="avif"
  width={200}
  height={200}
/>
```

**Option 2: Picture component with fallback**

```astro
<Picture
  src={profilePicture}
  alt={t('hero.imageAlt')}
  formats={['avif', 'webp']}
  width={200}
  height={200}
/>
```

**Testing Required:**

1. Compare file sizes: AVIF vs WebP vs original
2. Visual quality comparison
3. Build time impact
4. Browser compatibility testing
5. Lighthouse performance scores before/after

**Files to Consider:**

- `src/components/sections/Hero.astro` - Profile picture
- `src/components/blog/PostCard.astro` - Blog post covers
- `src/layouts/PostLayout.astro` - Featured images

**Acceptance Criteria:**

- [ ] File size comparison documented
- [ ] Visual quality verified
- [ ] Browser compatibility tested
- [ ] Performance impact measured
- [ ] Decision documented (implement or skip)

---

## 📅 Phase 5: Future Enhancement (Larger Effort)

**Total Estimated Time:** 2-3 hours
**Recommendation:** Schedule as separate sprint

### Issue #18: Add Vitest for Unit Testing 🧪

**Priority:** MEDIUM - Testing infrastructure
**Effort:** 2-3 hours
**Labels:** `enhancement`, `testing`

**Problem:**

- Only Playwright E2E tests exist
- No unit testing framework configured
- No tests for utility functions, components, or i18n logic

**Benefits:**

- Faster feedback loop (milliseconds vs seconds)
- Component isolation testing
- Utility function coverage
- Better CI performance
- Improved code quality

**Proposed Test Structure:**

```
tests/
├── unit/                          # Vitest unit tests
│   ├── components/               # Component tests using Container API
│   │   ├── blog/
│   │   │   ├── PostCard.test.ts
│   │   │   ├── TagList.test.ts
│   │   │   └── ReadingTime.test.ts
│   │   └── layout/
│   │       └── LanguageSwitcher.test.ts
│   ├── utils/                    # Utility function tests
│   │   ├── blogHreflang.test.ts
│   │   ├── dateFormatting.test.ts
│   │   ├── readingTime.test.ts
│   │   └── relatedPosts.test.ts
│   └── i18n/
│       └── utils.test.ts         # i18n utility tests
└── e2e/                          # Playwright E2E tests (moved from root)
    ├── homepage.spec.ts
    ├── blog.spec.ts
    └── language-switching.spec.ts
```

**Implementation Steps:**

1. **Install dependencies:**

   ```bash
   pnpm add -D vitest @vitest/ui @astrojs/test-utils happy-dom
   ```

2. **Create Vitest configuration:**

   ```typescript
   // vitest.config.ts
   import { getViteConfig } from 'astro/config';

   export default getViteConfig({
     test: {
       globals: true,
       environment: 'happy-dom',
       include: ['tests/unit/**/*.test.ts'],
       coverage: {
         provider: 'v8',
         reporter: ['text', 'json', 'html'],
         exclude: ['tests/e2e/**/*'],
       },
     },
   });
   ```

3. **Update package.json scripts:**

   ```json
   {
     "scripts": {
       "test": "vitest run && playwright test",
       "test:unit": "vitest run",
       "test:unit:watch": "vitest",
       "test:unit:ui": "vitest --ui",
       "test:e2e": "playwright test",
       "test:e2e:ui": "playwright test --ui",
       "test:coverage": "vitest run --coverage"
     }
   }
   ```

4. **Update Playwright config:**

   ```typescript
   // playwright.config.ts
   export default defineConfig({
     testDir: './tests/e2e', // Changed from './tests'
     // ... rest of config
   });
   ```

5. **Move existing E2E tests:**

   ```bash
   mkdir -p tests/e2e
   mv tests/*.spec.ts tests/e2e/
   ```

6. **Create example unit tests** (see issue for examples)

7. **Update CI workflow:**

   ```yaml
   # .github/workflows/ci.yml
   - name: Run unit tests
     run: pnpm test:unit

   - name: Run E2E tests
     run: pnpm test:e2e
   ```

**Test Coverage Goals:**

**Priority 1 (High Value):**

- [ ] i18n utilities
- [ ] Blog utilities (readingTime, relatedPosts, postSorting)
- [ ] Date formatting utilities
- [ ] Blog hreflang URL generation

**Priority 2 (Medium Value):**

- [ ] ReadingTime component
- [ ] TagList component
- [ ] PostCard component
- [ ] LanguageSwitcher component

**Priority 3 (Nice to Have):**

- [ ] Table of Contents generation
- [ ] Blog schema generation
- [ ] Breadcrumb logic

**Acceptance Criteria:**

- [ ] Vitest installed and configured
- [ ] Test folder structure reorganized
- [ ] Existing Playwright tests moved to `tests/e2e/`
- [ ] At least 5 utility function unit tests written
- [ ] At least 2 component unit tests using Container API
- [ ] Updated npm scripts
- [ ] CI workflow updated
- [ ] All tests passing

---

## 📊 Execution Strategy & Recommendations

### Recommended Timeline

**Day 1: Critical + High Priority (Phases 1 & 2)**

- Duration: ~110 minutes (~2 hours)
- Deploy after Phase 1 (security + critical bug)
- Deploy again after Phase 2 (code quality)
- Run full test suite before each deployment

**Day 2: Medium + Low Priority (Phases 3 & 4)**

- Duration: ~80 minutes (~1.5 hours)
- Single deployment after Phase 3
- Can include Phase 4 in same deployment
- Monitor analytics after GA fix

**Future Sprint: Phase 5 (Vitest)**

- Duration: 2-3 hours
- Schedule when you have dedicated uninterrupted time
- Requires focused attention for test infrastructure setup

### Deployment Strategy

**After Phase 1:**

```bash
pnpm build
pnpm preview  # Test locally
git add .
git commit -m "fix: add security headers and fix array mutation bug"
git push
```

**After Phase 2:**

```bash
pnpm test  # Run E2E tests
pnpm build
git add .
git commit -m "refactor: extract duplicate code and fix hardcoded URLs"
git push
```

**After Phase 3:**

```bash
pnpm test
pnpm build
git add .
git commit -m "feat: migrate to Content Layer API and fix GA test pollution"
git push
```

**After Phase 4:**

```bash
pnpm build
git add .
git commit -m "feat: add responsive images and evaluate AVIF format"
git push
```

### Benefits of This Approach

✅ **Security vulnerabilities patched first** - Protects users immediately
✅ **Critical bugs fixed before they cause issues** - Prevents data corruption
✅ **Code quality improvements** - Makes subsequent work easier
✅ **Performance enhancements compound** - Build times improve
✅ **Quick wins build momentum** - Dependency cleanup & config changes
✅ **Largest effort isolated** - Vitest requires focused attention

### Risk Mitigation

**Phase 1 Risks:**

- **Security headers:** Test with https://securityheaders.com after deployment
- **Array mutation:** Run all tests, check blog post ordering

**Phase 2 Risks:**

- **Hardcoded URLs:** Test all blog pages, canonical URLs, and hreflang tags
- **i18n extraction:** Verify all translations render correctly in all languages
- **Test refactoring:** Ensure test output remains clear and failures are traceable

**Phase 3 Risks:**

- **GA changes:** Monitor real-time GA after deployment to ensure legitimate traffic still tracked
- **Content Layer API:** Thoroughly test blog functionality, especially pagination and tag archives

### Total Time Investment

- **Phases 1-4:** ~3.5 hours (can be split across 2 days)
- **Phase 5:** 2-3 hours (separate focused session)
- **Total:** 5.5-6.5 hours

---

## 📝 Issue Reference Table

| Issue | Title                        | Priority | Effort  | Phase |
| ----- | ---------------------------- | -------- | ------- | ----- |
| #10   | Add Missing Security Headers | Critical | 10 min  | 1     |
| #9    | Fix Array Mutation Bug       | Critical | 10 min  | 1     |
| #11   | Replace Hardcoded URLs       | High     | 20 min  | 2     |
| #12   | Extract Duplicate i18n       | High     | 30 min  | 2     |
| #13   | Refactor Test Code           | High     | 40 min  | 2     |
| #14   | Remove Unused Dependency     | Medium   | 5 min   | 3     |
| #8    | Fix GA Test Pollution        | Medium   | 25 min  | 3     |
| #15   | Content Layer API            | Medium   | 30 min  | 3     |
| #16   | Responsive Images            | Low      | 5 min   | 4     |
| #17   | AVIF Format                  | Optional | 15 min  | 4     |
| #18   | Add Vitest                   | Medium   | 2-3 hrs | 5     |

---

## 🎯 Next Steps

1. **Review this plan** with stakeholders/team
2. **Start with Phase 1** - Critical security and bug fixes
3. **Monitor deployments** - Check logs, analytics, security headers
4. **Document decisions** - Update CLAUDE.md with any configuration changes
5. **Track progress** - Check off acceptance criteria as you complete each issue
6. **Schedule Phase 5** - Block calendar time for Vitest implementation

---

## 📚 References

- **GitHub Issues:** https://github.com/jjuanrivvera/website/issues
- **Security Headers Check:** https://securityheaders.com
- **Astro Content Layer API:** https://docs.astro.build/en/reference/modules/astro-content/
- **Vitest Documentation:** https://vitest.dev/
- **Astro Container API:** https://docs.astro.build/en/reference/container-reference/

---

**Document maintained by:** Claude Code
**Last updated:** 2025-12-01
**Status:** Ready for execution
