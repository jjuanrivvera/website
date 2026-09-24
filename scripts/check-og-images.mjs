// Fails CI if any *published* (draft: false) blog post is missing its OG image
// at public/img/blog/<slug>-og.jpg — the convention PostLayout.astro references
// for og:image / twitter:image. A missing file ships a broken social preview.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const BLOG_ROOT = path.join(REPO_ROOT, 'src/content/blog');
const OG_DIR = path.join(REPO_ROOT, 'public/img/blog');

const missing = [];
let checked = 0;

for (const lang of fs.readdirSync(BLOG_ROOT)) {
  const dir = path.join(BLOG_ROOT, lang);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const file of fs.readdirSync(dir)) {
    if (!/\.mdx?$/.test(file)) continue;
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const fm = raw.match(/^---\n([\s\S]*?)\n---/);
    if (fm && /^draft:\s*true\s*$/m.test(fm[1])) continue; // skip drafts
    checked++;
    const slug = file.replace(/\.mdx?$/, '');
    if (!fs.existsSync(path.join(OG_DIR, `${slug}-og.jpg`))) {
      missing.push(`${lang}/${file}  ->  public/img/blog/${slug}-og.jpg`);
    }
  }
}

if (missing.length) {
  console.error(`✗ ${missing.length} published post(s) missing an OG image:`);
  for (const m of missing) console.error('  - ' + m);
  console.error(
    '\nGenerate a 1200x630 image at each path above before publishing.'
  );
  process.exit(1);
}
console.log(`✓ OG images present for all ${checked} published posts`);
