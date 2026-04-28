#!/usr/bin/env node
// Newsletter campaign trigger.
//
// Designed to run inside GitHub Actions on push to main. Inspects which
// blog posts were added/modified in the event, builds a campaign per
// new published post, and fires it through the Listmonk REST API.
//
// Idempotent on retries: each campaign uses `${lang}-${slug}` as its
// `name`. Before creating a new campaign, the script queries Listmonk
// for an existing one with that name and skips if found. Reruns of the
// same workflow (or a force-push that re-introduces the file) do not
// double-send.
//
// Required env:
//   LISTMONK_URL    e.g. https://newsletter.jjuanrivvera.com
//   LISTMONK_USER   API user (created in Listmonk admin → Users → API)
//   LISTMONK_TOKEN  Token for that API user (Basic auth)
//
// Optional env:
//   GITHUB_EVENT_PATH   Push event payload (provided automatically in CI)
//   DRY_RUN=1           Skip actual API calls; just log what would happen
//   FORCE_POSTS=...     Comma-separated `lang/slug` overrides (e.g. for testing
//                       without a push event). Bypasses git change detection.

import fs from 'node:fs';
import path from 'node:path';

const REQUIRED_ENV = ['LISTMONK_URL', 'LISTMONK_USER', 'LISTMONK_TOKEN'];
const DRY_RUN = process.env.DRY_RUN === '1';
const REPO_ROOT = path.resolve(process.cwd());
const BLOG_ROOT = path.join(REPO_ROOT, 'src', 'content', 'blog');
const SITE_BASE = 'https://jjuanrivvera.com';

// Per-language list UUIDs — must stay in sync with
// src/components/blog/SubscribeForm.astro. The subscribe form is the
// source of truth for which list a reader of language X joins; this
// script must publish to the same list when sending to language X.
const LIST_UUIDS = {
  en: '1fd370d2-9c78-4e9d-98a2-9313fd5a0061',
  es: '99da3660-a828-409c-8ad4-a5631ab09cb6',
  pt: '97112328-d358-4ecf-bb43-33a63731a11b',
};

// Listmonk's POST /api/campaigns expects integer list IDs in `lists`,
// not UUIDs. Numeric IDs are stable per Listmonk install (assigned at
// list creation time). Keep both maps in sync if a list is recreated.
const LIST_IDS = {
  en: 3,
  es: 4,
  pt: 5,
};

const PATH_LABEL = {
  en: 'blog',
  es: 'es/blog',
  pt: 'pt/blog',
};

function fail(msg) {
  console.error(`✘ ${msg}`);
  process.exit(1);
}

function info(msg) {
  console.log(`• ${msg}`);
}

// Minimal YAML frontmatter parser — handles strings, numbers, booleans,
// dates, simple inline arrays, and bracketed multi-line arrays. The blog
// frontmatter is consistent enough that bringing a YAML lib is overkill.
function parseFrontmatter(text) {
  const match = text.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return null;
  const out = {};
  const lines = match[1].split('\n');
  let pendingArrayKey = null;
  let pendingArray = [];
  for (let raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (!line) continue;
    if (pendingArrayKey) {
      // Inside a `key:` ... `]` multi-line array.
      const closing = line.includes(']');
      const cleaned = line.replace(/[\[\],]/g, '').trim();
      if (cleaned) {
        for (const part of cleaned.split(/[,]/)) {
          const v = part.trim().replace(/^['"]|['"]$/g, '');
          if (v) pendingArray.push(v);
        }
      }
      if (closing) {
        out[pendingArrayKey] = pendingArray;
        pendingArrayKey = null;
        pendingArray = [];
      }
      continue;
    }
    const kv = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
    if (!kv) continue;
    const [, key, rawVal] = kv;
    const v = rawVal.trim();
    if (v === '') {
      // Could be a multiline array starting with `key:`
      pendingArrayKey = key;
      pendingArray = [];
      continue;
    }
    if (v.startsWith('[') && v.endsWith(']')) {
      out[key] = v
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
      continue;
    }
    if (v.startsWith('[')) {
      pendingArrayKey = key;
      pendingArray = [];
      const cleaned = v.slice(1).replace(/[,]/g, ' ').trim();
      if (cleaned) {
        for (const part of cleaned.split(/\s+/)) {
          const item = part.replace(/^['"]|['"]$/g, '');
          if (item) pendingArray.push(item);
        }
      }
      continue;
    }
    let parsed = v.replace(/^['"]|['"]$/g, '');
    if (parsed === 'true') parsed = true;
    else if (parsed === 'false') parsed = false;
    else if (/^\d{4}-\d{2}-\d{2}$/.test(parsed)) parsed = new Date(parsed);
    out[key] = parsed;
  }
  return out;
}

// Determine which markdown files are newly added or modified in this
// push. Uses the GH event payload (commits[].added/modified) when
// available, or `git diff` against the previous commit as a fallback.
async function detectChangedPosts() {
  const forceList = process.env.FORCE_POSTS;
  if (forceList) {
    return forceList
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((entry) => {
        const [lang, slug] = entry.split('/');
        return { lang, slug, file: path.join(BLOG_ROOT, lang, `${slug}.md`) };
      });
  }
  let changedFiles = [];
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (eventPath && fs.existsSync(eventPath)) {
    const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    const commits = event.commits ?? [];
    for (const c of commits) {
      changedFiles.push(...(c.added ?? []), ...(c.modified ?? []));
    }
  } else {
    // Local fallback — diff against HEAD~1.
    const { execSync } = await import('node:child_process');
    try {
      const out = execSync(
        'git diff --name-only --diff-filter=AM HEAD~1 HEAD',
        {
          encoding: 'utf8',
        }
      );
      changedFiles = out.split('\n').filter(Boolean);
    } catch {
      changedFiles = [];
    }
  }
  // Match content/blog/<lang>/<slug>.md
  const matched = [];
  const seen = new Set();
  for (const f of changedFiles) {
    const m = f.match(/^src\/content\/blog\/([a-z]{2})\/([^/]+)\.md$/);
    if (!m) continue;
    const key = `${m[1]}/${m[2]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    matched.push({ lang: m[1], slug: m[2], file: path.join(REPO_ROOT, f) });
  }
  return matched;
}

// HTML body for the newsletter. Intentionally minimal — title, cover,
// description, and a "Read full post" CTA driving readers back to the
// blog. Full body lives on the blog and benefits from analytics + nicer
// rendering than email clients can offer.
function buildEmailHtml({ title, description, coverUrl, postUrl, lang }) {
  const cta =
    lang === 'es'
      ? 'Leer en el blog'
      : lang === 'pt'
        ? 'Ler no blog'
        : 'Read on the blog';
  return `<!doctype html>
<html lang="${lang}">
  <body style="margin:0;padding:0;background:#0f1115;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e6e7eb;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f1115;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#171a21;border-radius:14px;overflow:hidden;border:1px solid #232733;">
            ${
              coverUrl
                ? `<tr><td style="padding:0;"><img src="${coverUrl}" alt="" width="600" style="display:block;width:100%;height:auto;border:0;"/></td></tr>`
                : ''
            }
            <tr>
              <td style="padding:32px 32px 8px 32px;">
                <h1 style="margin:0 0 16px 0;font-size:26px;line-height:1.25;color:#ffffff;">${escapeHtml(title)}</h1>
                <p style="margin:0;font-size:16px;line-height:1.6;color:#a8acba;">${escapeHtml(description)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 32px 32px;">
                <a href="${postUrl}" style="display:inline-block;background:#6366f1;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:9999px;font-size:15px;">${cta} →</a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 24px 32px;border-top:1px solid #232733;">
                <p style="margin:24px 0 0 0;font-size:12px;color:#6a6f7d;">
                  Sent from <a href="${SITE_BASE}" style="color:#a8acba;text-decoration:none;">jjuanrivvera.com</a>.
                  You can <a href="{{ UnsubscribeURL }}" style="color:#a8acba;">unsubscribe</a> any time.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Construct the public cover image URL. Source is `cover: '@assets/blog/covers/foo.jpg'`
// in frontmatter. Astro builds them into hashed `/_astro/...` paths at build time, but
// for the email we use the OG image URL pattern that already exists for each post:
// /img/blog/<slug>-og.jpg (referenced in the live OG meta of each post). This avoids
// having to wait for an Astro build to finish before we can resolve the asset.
function ogImageUrl(slug) {
  return `${SITE_BASE}/img/blog/${slug}-og.jpg`;
}

function postUrl(lang, slug) {
  return lang === 'en'
    ? `${SITE_BASE}/${PATH_LABEL.en}/${slug}`
    : `${SITE_BASE}/${PATH_LABEL[lang]}/${slug}`;
}

function listmonkAuthHeader() {
  const u = process.env.LISTMONK_USER;
  const t = process.env.LISTMONK_TOKEN;
  return `Basic ${Buffer.from(`${u}:${t}`).toString('base64')}`;
}

async function listmonk(method, route, body) {
  const url = `${process.env.LISTMONK_URL.replace(/\/$/, '')}${route}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: listmonkAuthHeader(),
      // CF Bot Fight Mode flags Node's default fetch UA on this zone.
      // A real-looking User-Agent clears the managed challenge.
      'User-Agent': 'jjuanrivvera-newsletter/1.0 (+https://jjuanrivvera.com)',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    /* server may return non-JSON on errors */
  }
  if (!res.ok) {
    throw new Error(
      `Listmonk ${method} ${route} → ${res.status} ${text.slice(0, 300)}`
    );
  }
  return json?.data ?? json;
}

async function existingCampaign(name) {
  // Listmonk's /api/campaigns supports a `query` param (free-text search
  // across name + subject). We use the campaign name pattern, which we
  // construct deterministically as `<lang>-<slug>`.
  const url = `/api/campaigns?query=${encodeURIComponent(name)}&order_by=created_at&order=DESC&per_page=20`;
  const res = await listmonk('GET', url);
  const list = res?.results ?? res ?? [];
  return list.find((c) => c.name === name);
}

async function createAndSendCampaign({ lang, slug, frontmatter }) {
  const listUuid = LIST_UUIDS[lang];
  if (!listUuid) {
    info(`skip ${lang}/${slug} — no list configured for lang=${lang}`);
    return { skipped: true, reason: 'no-list' };
  }

  const name = `${lang}-${slug}`;
  if (!DRY_RUN) {
    const dup = await existingCampaign(name);
    if (dup) {
      info(
        `skip ${name} — already in Listmonk (id=${dup.id}, status=${dup.status})`
      );
      return { skipped: true, reason: 'dup', campaignId: dup.id };
    }
  }

  const subject = String(frontmatter.title ?? '');
  const description = String(frontmatter.description ?? '');
  const url = postUrl(lang, slug);
  const cover = ogImageUrl(slug);
  const html = buildEmailHtml({
    title: subject,
    description,
    coverUrl: cover,
    postUrl: url,
    lang,
  });

  if (DRY_RUN) {
    info(
      `[DRY] would create campaign name="${name}" subject="${subject}" list=${listUuid} url=${url}`
    );
    return { skipped: false, dryRun: true };
  }

  const created = await listmonk('POST', '/api/campaigns', {
    name,
    subject,
    lists: [LIST_IDS[lang]],
    type: 'regular',
    content_type: 'html',
    body: html,
    from_email:
      process.env.NEWSLETTER_FROM_EMAIL ||
      'Juan Rivera <newsletter@jjuanrivvera.com>',
    messenger: 'email',
    tags: ['auto-publish', `lang-${lang}`],
  });
  const campaignId = created?.id;
  if (!campaignId)
    throw new Error(`No campaign id in response: ${JSON.stringify(created)}`);

  // Listmonk requires a separate status-change call to actually send.
  // PUT /api/campaigns/:id/status with { status: 'running' } kicks the
  // queue.
  await listmonk('PUT', `/api/campaigns/${campaignId}/status`, {
    status: 'running',
  });
  info(`✓ campaign ${name} sent (id=${campaignId})`);
  return { skipped: false, campaignId, name, listUuid, url };
}

async function main() {
  if (!DRY_RUN) {
    for (const k of REQUIRED_ENV) {
      if (!process.env[k]) fail(`Missing env ${k}`);
    }
  }

  const posts = await detectChangedPosts();
  info(`detected ${posts.length} changed blog file(s)`);
  if (posts.length === 0) return;

  const results = [];
  for (const post of posts) {
    try {
      const text = fs.readFileSync(post.file, 'utf8');
      const fm = parseFrontmatter(text);
      if (!fm) {
        info(`skip ${post.lang}/${post.slug} — no frontmatter`);
        continue;
      }
      if (fm.draft === true) {
        info(`skip ${post.lang}/${post.slug} — draft:true`);
        continue;
      }
      // Future-dated posts wait for their day. The build wouldn't list
      // them as published yet anyway, so the email shouldn't go either.
      if (fm.pubDate instanceof Date && fm.pubDate.getTime() > Date.now()) {
        info(
          `skip ${post.lang}/${post.slug} — pubDate in the future (${fm.pubDate.toISOString()})`
        );
        continue;
      }
      const result = await createAndSendCampaign({
        lang: post.lang,
        slug: post.slug,
        frontmatter: fm,
      });
      results.push({ lang: post.lang, slug: post.slug, ...result });
    } catch (err) {
      console.error(`Error on ${post.lang}/${post.slug}:`, err.message);
      results.push({ lang: post.lang, slug: post.slug, error: err.message });
    }
  }

  // Summarize to stdout so the GitHub Actions log captures what happened.
  // No external notifications — Juan is one of the subscribers, so the
  // proof that the pipeline works is a real email landing in his inbox.
  const sent = results.filter((r) => !r.skipped && !r.error && !r.dryRun);
  const skipped = results.filter((r) => r.skipped);
  const errors = results.filter((r) => r.error);
  if (sent.length) {
    info('Newsletter dispatched:');
    for (const r of sent) {
      info(
        `  · ${r.lang}/${r.slug} → list ${r.listUuid.slice(0, 8)}… (campaign ${r.campaignId})`
      );
    }
  }
  if (skipped.length) {
    info('Skipped (already-sent or no-list):');
    for (const r of skipped) info(`  · ${r.lang}/${r.slug} — ${r.reason}`);
  }
  if (errors.length) {
    info('Errors:');
    for (const r of errors) info(`  · ${r.lang}/${r.slug}: ${r.error}`);
  }

  if (errors.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
