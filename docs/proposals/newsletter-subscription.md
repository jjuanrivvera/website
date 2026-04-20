# Proposal: Newsletter Subscription

**Status**: Draft
**Date**: 2026-04-20
**Target**: `main`

## Goal

Let readers subscribe to blog updates by email. When a new post is published, subscribers get an email in their preferred language. Comply with GDPR and the Gmail/Yahoo 2026 bulk-sender rules. Keep full control of the subscriber list so it is portable at any time.

## Architecture Context

- Astro static site with i18n (`en`, `es`, `pt`), deployed on Netlify.
- Multi-language blog under `/blog`, `/es/blog`, `/pt/blog`.
- Small self-hosted backend reachable over a private mesh network, with selected services exposed publicly through a reverse proxy under `*.jjuanrivvera.com` with SSL.

## Constraints

- **Self-host-first** when the tradeoff is reasonable.
- **Low monthly cost** at 100–1000 subscribers.
- **No Google Workspace** — personal Gmail only. That rules out using Gmail SMTP with a custom `From` address for the newsletter because DKIM cannot be aligned for `jjuanrivvera.com` via personal Gmail.
- **Data portability**: the subscriber list must be exportable and movable at any time.
- **Gmail/Yahoo 2026 compliance**: SPF, DKIM, DMARC, and one-click `List-Unsubscribe` are mandatory for any non-trivial sender; missing any of them gets filtered.
- **Astro/Netlify compatibility**: the site is static. Any subscribe form has to POST to an endpoint reachable from the public internet or from a Netlify Function.
- **Critical technical constraint**: Netlify Functions run on AWS Lambda. They cannot reach private mesh networks. Any self-hosted backend must be publicly addressable (via the existing reverse proxy) or fronted by a SaaS tier.

## Options Considered

### Option A — Listmonk (self-hosted) + Resend SMTP

Listmonk is a Go-based single-binary newsletter platform (`knadh/listmonk`). Runs as one container with Postgres. Sends via Resend's SMTP relay. Resend's free tier covers 3,000 emails per month with custom domain + automatic DKIM and SPF setup through their DNS wizard — no Workspace needed.

- Pros: full ownership of the subscriber list, Postgres-backed, double opt-in + GDPR + one-click `List-Unsubscribe` built in, multi-list (one per locale), $0 incremental cost at expected volume, Resend handles DKIM alignment automatically, modern dev-friendly interface.
- Cons: Resend free tier caps at 3,000 emails/month (100/day). Past that, $20/mo for 50,000 emails. Resend is US-hosted, so send-time metadata (not the list itself) flows through them.
- Monthly cost at expected scale (100/1000/5000 subs, 4 sends each): $0 / $0 / $0–$20 depending on volume.
- Setup cost: ~3h.

### Option B — Listmonk (self-hosted) + Brevo SMTP

Same self-hosted platform, different transactional relay. Brevo (formerly SendinBlue) free tier: 300 emails per day (~9,000/month), custom domain with DKIM, EU-hosted.

- Pros: higher free-tier ceiling than Resend (9k/mo vs 3k/mo), EU data residency, established deliverability.
- Cons: UI less pleasant than Resend, SMTP setup more paperwork, company is larger and occasionally changes terms.
- Monthly cost: $0 up to ~300/day. Past that, Starter plan $9/mo for unlimited daily sends up to 5k contacts.
- Setup cost: ~3h.

### Option C — Listmonk + AWS SES

Send via Amazon SES. $0.10 per 1,000 emails, cheapest at scale.

- Pros: cheapest by far at high volume, battle-tested deliverability.
- Cons: 24h production-access wait, DNS verification is fiddly, sandbox-by-default. Not worth the friction for a blog at starting volume.
- Monthly cost: ~$0 at 100 subs, ~$0.40 at 1000 subs, ~$10 at 5000 subs (with 4 sends each).
- Setup cost: ~6h (plus 24h SES sandbox wait).

**Recommended as upgrade path** from A or B when list outgrows their free tiers.

### Option D — Buttondown (SaaS)

Writer-focused newsletter SaaS. Markdown-native, clean API, active maintenance, straightforward export.

- Pros: zero ops, live in 1–2h, Gmail compliance handled, clean export if migration is ever needed.
- Cons: $9/month past 100 subs, $29/month at 5000 subs. Subscriber data lives on their servers. Goes against the self-host-first preference.
- Monthly cost: $0 → $9 → $29 across 100/1000/5000 subs.

### Option E — Cloudflare-based stack (supporting role, not main)

Cloudflare is infrastructure, not a newsletter platform. Role is complementary to whatever option is chosen:

- **Cloudflare Email Routing** (free): inbound only. Receives mail to `anything@jjuanrivvera.com` and forwards to another address. Useful for DMARC aggregate reports, subscriber replies, and bounces. Cannot send.
- **Cloudflare Workers Send Email binding**: can send transactional email but restricted to verified destination addresses per zone. Designed for password resets, not bulk newsletter campaigns.
- **Cloudflare Workers + Resend + D1/KV**: a fully custom newsletter built on Workers, storing subscribers in D1 (SQLite), sending through Resend. Achievable but reimplements Listmonk poorly.

Verdict: Cloudflare adds value as Email Routing for DMARC reports and Turnstile for bot protection on the subscribe form. Not a replacement for a newsletter platform.

### Option F — n8n workflow + subscriber database + SMTP relay

Custom workflow using existing automation components: webhook → state machine → MySQL → n8n email node.

- Pros: reuses existing automation stack.
- Cons: ~15 hours to build all edge cases (double opt-in tokens, unsubscribe URLs, bounce handling, `List-Unsubscribe` header, template rendering, multi-language). High ongoing maintenance burden. Every bug risks spam reputation.
- Monthly cost: near $0, but the real cost is engineering time.

### Option G — Netlify Forms only

Netlify's built-in form handling (100 submissions/month free, $19/mo past that) to collect emails, then manual CSV export to send campaigns with another tool.

- Pros: near-zero setup.
- Cons: no double opt-in, no `List-Unsubscribe`, no campaign sending. Export then use another tool anyway.

## Recommendation

**Option A — Listmonk self-hosted + Resend SMTP.**

Reasoning:

- Listmonk covers every required feature: double opt-in, per-locale lists, one-click `List-Unsubscribe`, GDPR-grade data handling, public subscription API, campaign composer.
- Resend's free tier covers 3,000 emails/month with custom domain support and automatic DKIM/SPF through their DNS wizard. No Workspace required, no 24h approval wait, no sandbox.
- $0 incremental cost at starting volume. At 1,000 subscribers × 4 sends/month (~4,000 emails), Resend's $20/mo Starter covers it, or we move to Option B (Brevo, 9k/mo free) or Option C (AWS SES, ~$0.40/mo at that volume).
- Migration between SMTP providers is a one-line change in Listmonk config. No architectural rework when the list grows.
- Cloudflare plays a complementary role: Email Routing for DMARC reports and Turnstile on the subscribe form. Both free.

Why not Option B (Brevo) as primary: Resend's UX is better and their free tier, while smaller (3k vs 9k/mo), is more than enough for the first year. Brevo stays as a documented fallback if Resend's pricing or policies change.

Why not Option C (SES) from day one: the 24h sandbox approval wait plus DNS verification friction isn't worth it at starting volume. Resend gives the same deliverability with zero setup friction.

Why not Option D (Buttondown): $108/year at 100 subs, subscriber data outside direct control. The blog's positioning on self-hosted tooling would be undermined by a SaaS newsletter.

Why not Option F (n8n homebrew): the maintenance burden outweighs Listmonk's install cost. Gmail's November 2025 enforcement punishes amateur implementations.

Why not Option G (Netlify Forms only): not a newsletter, just a form collector.

## Architecture Overview

```
[ Astro site on Netlify ]
          │
          │  HTTPS POST  (via a Netlify Function or Astro server endpoint)
          ▼
[ newsletter.jjuanrivvera.com  (public, SSL via reverse proxy) ]
  - /api/public/subscription   (rate-limited by Listmonk)
  - /admin                     (basic auth at proxy layer)
          │
          ▼
[ Listmonk container + Postgres ]
  - 3 lists: en-newsletter, es-newsletter, pt-newsletter
  - Double opt-in enabled per list
  - One-click List-Unsubscribe header on all campaigns
          │
          │  SMTP  (smtp.resend.com:465, API key as SMTP password)
          ▼
[ Resend ]
  - From: hello@jjuanrivvera.com  (verified via DNS, DKIM auto-aligned)
  - 3,000 emails/month free
  - $20/mo at 50k emails (upgrade trigger)

Cloudflare (complementary):
  - Email Routing: DMARC aggregate reports + bounce capture -> Gmail
  - Turnstile widget on subscribe form (anti-bot)
```

## DNS Setup

With Resend as the sender, the DNS records are generated in their dashboard. The typical shape:

```
SPF:    v=spf1 include:_spf.mx.cloudflare.net include:amazonses.com ~all
        (merge with existing CF Email Routing SPF; Resend uses Amazon SES under the hood for delivery)
DKIM:   resend._domainkey                          TXT   (generated by Resend dashboard)
DMARC:  _dmarc.jjuanrivvera.com                    TXT   "v=DMARC1; p=none; rua=mailto:dmarc@jjuanrivvera.com"
MX (inbound only — already set for CF Email Routing):
        isaac.mx.cloudflare.net, amir.mx.cloudflare.net, linda.mx.cloudflare.net
```

Tighten DMARC to `p=quarantine` after 2 weeks of clean aggregate reports, `p=reject` after 6 weeks.

## Implementation Phases

### Phase 1 — Resend signup + DNS (~1h)

1. Sign up at resend.com with `jjuanrivvera@gmail.com`.
2. Add `jjuanrivvera.com` as a verified domain in their dashboard.
3. Copy the DKIM CNAME records they generate into the Cloudflare zone (via the `cf-cli` skill).
4. Merge the SPF record to add `include:amazonses.com` alongside the existing `_spf.mx.cloudflare.net`.
5. Add DMARC `_dmarc` TXT at `p=none` with aggregate report address.
6. Create a Cloudflare Email Routing rule to capture `dmarc@jjuanrivvera.com` and forward to Gmail.
7. Generate a Resend API key for Listmonk (scoped to "send only").

### Phase 2 — Listmonk deploy (~1.5h)

1. Docker Compose on the VPS (Postgres + Listmonk binary container).
2. Expose at `newsletter.jjuanrivvera.com` via the reverse proxy with SSL and basic auth on `/admin`.
3. Configure SMTP in Listmonk → `smtp.resend.com:465` with `resend` as username and the API key as password.
4. Create three lists (`en-newsletter`, `es-newsletter`, `pt-newsletter`), all double-opt-in.
5. Customize default templates with site branding and multi-language copy.
6. Enable the one-click `List-Unsubscribe` header.

### Phase 3 — Astro integration (~2h)

1. Build a `<SubscribeForm lang={lang} />` component.
2. Place it in blog post layouts (bottom) and the site footer.
3. Submit via `fetch` to an Astro server endpoint (Astro 5 server actions or a POST route with the Netlify Functions adapter).
4. The endpoint proxies to `https://newsletter.jjuanrivvera.com/api/public/subscription`, with the Listmonk API key held as a Netlify environment variable (never exposed to the browser).
5. Language detection from the current locale; submit to the matching list automatically.
6. Optional: Cloudflare Turnstile on the form for bot protection.

### Phase 4 — Content workflow (~1h)

1. Automation: triggered by the Astro build webhook or a GitHub webhook on merged blog PR.
2. Fetches the new post metadata (title, excerpt, URL, language).
3. Calls `POST /api/campaigns` on Listmonk to draft a campaign in the matching language.
4. Does **not** auto-send — requires manual confirmation in the Listmonk admin to avoid accidental broadcasts.

### Phase 5 — Hardening (~30 min, 6 weeks out)

1. Review DMARC `rua` aggregate reports after two weeks of clean traffic.
2. Move DMARC to `p=quarantine`.
3. After six weeks of clean traffic, move DMARC to `p=reject`.
4. Run `mail-tester.com` — target 10/10.
5. Document the runbook in `docs/runbooks/newsletter.md`.

### Phase 6 (future, when needed) — Upgrade path

If monthly volume crosses ~50,000 emails:

- **Option A**: move SMTP to Brevo (stays free at 300/day, ~9k/mo). One-line config change.
- **Option B**: move SMTP to AWS SES ($0.10/1000, verified domain DKIM). File production-access request, update SMTP host.
- No other changes required.

Total active work for Phases 1–5: ~5.5h spread across a focused afternoon.

## Open Questions

- **`From` address.** Options: `hello@jjuanrivvera.com`, `juan@jjuanrivvera.com`, `newsletter@jjuanrivvera.com`. Preference leans `juan@` (personal, matches blog voice) unless Resend flags it for being a single-sender address.
- **Campaign cadence.** Per new post or a weekly/monthly digest. Initial lean: per-post given low publishing frequency; revisit if output increases.
- **Welcome email style.** One generic per-language template, or a teaser of the latest post in that language. Initial lean: simple welcome with a pointer to the latest post.
- **Bot protection widget.** Turnstile on the form from day one, or defer until spam signups appear. Low-cost to add early.

## Out of Scope (for this PR)

- Newsletter-specific analytics dashboard (Listmonk's built-in is enough).
- A/B testing of subject lines.
- Subscriber segmentation by topic/tag (i18n lists cover the main split).
- SMS or push notification channels.

## Risks and Mitigations

| Risk                                        | Mitigation                                                                                                                                                                              |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Resend pricing changes or free tier shrinks | SMTP host is a one-line change. Fall back to Brevo, AWS SES, or self-hosted Postfix.                                                                                                    |
| DNS misconfig (DKIM/SPF)                    | Validate with `mail-tester.com` before announcing the newsletter. Any score under 9/10 delays the launch.                                                                               |
| Host outage                                 | Postgres daily backups. Listmonk subscriber CSV export weekly to a separate storage destination.                                                                                        |
| Subscriber list leak                        | Basic auth on `/admin` at the proxy layer. API key in environment variable (not in git). Only `/api/public/subscription` is reachable without auth, and it is rate-limited by Listmonk. |
| Compliance regression                       | DMARC staged rollout (`p=none` → `p=quarantine` → `p=reject`). Monitor aggregate reports before tightening.                                                                             |
| Bot-spam signups                            | Listmonk's built-in rate limiting + Turnstile widget on the subscribe form.                                                                                                             |

## Success Criteria

- A reader on any `/blog/*` page can enter their email, pick (implied by locale) language, and receive a double opt-in email within 30 seconds.
- Confirmed subscribers receive the next post automatically after a manual send confirmation from the admin.
- `mail-tester.com` score 9/10 or higher.
- Unsubscribe works in one click from any email client, including Gmail's built-in unsubscribe button.
- Zero subscriber data leaves self-hosted infrastructure except the chosen SMTP relay (send only, transactional, no list retention by the relay).

## Decision Requested

Approve Option A as the direction, or call out a constraint that rules it out. If approved, this doc breaks down into per-phase tasks and Phase 1 (Resend signup + DNS) starts first.

## References

- [Listmonk docs](https://listmonk.app/docs/)
- [Listmonk GitHub (knadh/listmonk)](https://github.com/knadh/listmonk)
- [Resend docs](https://resend.com/docs)
- [Resend pricing](https://resend.com/pricing)
- [Brevo pricing](https://www.brevo.com/pricing/)
- [AWS SES production access docs](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html)
- [Gmail bulk sender requirements](https://support.google.com/a/answer/14229414)
- [Astro Netlify adapter docs](https://docs.astro.build/en/guides/integrations-guide/netlify/)
- [Cloudflare Email Routing](https://developers.cloudflare.com/email-routing/)
- [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)
