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
- **Data portability**: the subscriber list must be exportable and movable at any time.
- **Gmail/Yahoo 2026 compliance**: SPF, DKIM, DMARC, and one-click `List-Unsubscribe` are mandatory for any non-trivial sender; missing any of them gets filtered.
- **Astro/Netlify compatibility**: the site is static. Any subscribe form has to POST to an endpoint reachable from the public internet or from a Netlify Function.
- **Critical technical constraint**: Netlify Functions run on AWS Lambda. They cannot reach private mesh networks. Any self-hosted backend must be publicly addressable (via the existing reverse proxy) or fronted by a SaaS tier.

## Options Considered

### Option A — Listmonk (self-hosted) + AWS SES

Listmonk is a Go-based single-binary newsletter platform (`knadh/listmonk`). Runs as one container with Postgres. Sends via SMTP (AWS SES recommended). Exposed publicly at `newsletter.jjuanrivvera.com` so the subscribe form can POST directly to its public subscription API.

- Pros: full ownership, Postgres-backed subscriber DB, double opt-in + GDPR + one-click `List-Unsubscribe` built in, multi-list (one per locale), API-first (scriptable), ~57 MB RAM footprint.
- Cons: upfront setup (~6 hours), SES production-access request (24h wait), DNS records to get right.
- Monthly cost: ~$0 at 100 subs, ~$0.40 at 1000 subs (SES `$0.10/1000`), ~$10 at 5000 subs.

### Option B — Listmonk (self-hosted) + Gmail SMTP relay

Same platform as Option A, but send through Gmail/Google Workspace SMTP instead of a transactional provider. Gmail personal allows ~500 messages/day; Google Workspace allows ~2000/day with the ability to send from a verified alias at the custom domain.

- Pros: no SES setup, no approval wait, excellent deliverability (Gmail's IPs), DKIM alignment through Workspace, $0 incremental cost if Workspace is already in use.
- Cons: daily rate limit. Once the list outgrows ~1500 sends in a day, needs a separate transactional provider. Gmail can throttle or suspend if bounce/complaint rates spike.
- Monthly cost: $0 up to ~45,000 emails/month (1500/day × 30). Past that, switch SMTP host to SES/Brevo/Postmark and restart.
- Setup cost: under 2h (Listmonk install + Workspace app password + SMTP config).

### Option C — Buttondown (SaaS)

Writer-focused newsletter SaaS. Markdown-native, clean API, active maintenance, straightforward export.

- Pros: zero ops, live in 1–2h, Gmail compliance handled, clean export if migration is ever needed.
- Cons: $9/month past 100 subs, $29/month at 5000 subs. Subscriber data lives on their servers.
- Monthly cost: $0 → $9 → $29 across 100/1000/5000 subs.

### Option D — Cloudflare-based stack

Cloudflare is infrastructure, not a newsletter platform. Worth evaluating because it can play a supporting role:

- **Cloudflare Email Routing** (free): inbound only. Receives mail to `anything@jjuanrivvera.com` and forwards to another address. Useful for DMARC aggregate reports, subscriber replies, and bounces. Cannot send.
- **Cloudflare Workers Send Email binding**: can send transactional email but restricted to verified destination addresses per zone. Designed for password resets and similar, not bulk newsletter campaigns.
- **Cloudflare Workers + Resend** (or Postmark/SES) **+ D1/KV**: a fully custom newsletter built on Workers, storing subscribers in D1 (SQLite), sending through a third-party transactional API. Achievable but reimplements Listmonk poorly.

Verdict: Cloudflare does not replace a newsletter platform for outbound bulk. It **does** add value in the stack as:

- Inbound mail handling for DMARC reports and bounce catching (free).
- Turnstile widget on the subscribe form to stop bot signups (free).
- Optional alternative compute layer if the site ever leaves Netlify.

Cloudflare's role here is complementary to whatever option is chosen, not a replacement.

### Option E — n8n workflow + subscriber database + SMTP relay

Custom workflow using existing automation components: webhook → state machine → MySQL → n8n email node.

- Pros: reuses existing automation stack.
- Cons: ~15 hours to build all edge cases (double opt-in tokens, unsubscribe URLs, bounce handling, `List-Unsubscribe` header, template rendering, multi-language). High ongoing maintenance burden. Every bug risks Gmail spam reputation.
- Monthly cost: near $0, but real cost is engineering time.

### Option F — Netlify Forms only

Netlify's built-in form handling (100 submissions/month free, $19/mo past that) to collect emails, then manual CSV export to send campaigns with another tool.

- Pros: near-zero setup.
- Cons: no double opt-in, no `List-Unsubscribe`, no campaign sending. Export then use another tool anyway. Gmail will flag as soon as volume grows.

## Recommendation

**Option B — Listmonk self-hosted, sending through Gmail/Workspace SMTP, with a documented upgrade path to AWS SES.**

Reasoning:

- Listmonk covers every required feature: double opt-in, per-locale lists, one-click `List-Unsubscribe`, GDPR-grade data handling, public subscription API, campaign composer.
- Gmail/Workspace SMTP reaches the 2026 deliverability bar without extra work because DKIM, SPF, and IP reputation are already handled by Google.
- $0 incremental cost at realistic starting volumes.
- Setup time is the shortest of the self-hosted options (no SES approval wait).
- When the list outgrows Workspace's daily limit, migration to SES is a one-line SMTP host change in Listmonk — no architectural rework.
- Cloudflare plays a complementary role: Email Routing for DMARC reports and bounce capture, Turnstile on the subscribe form for bot protection. Both free.

Why not Option A (SES from day one): the SES production-access request is a blocking 24h wait and adds DNS/verification work that isn't needed at starting volume. Defer it to when list size justifies it.

Why not Option C (Buttondown): good SaaS, but $108/year starting at 100 subs and subscriber data residency outside of direct control.

Why not Option E (n8n homebrew): Gmail's November 2025 enforcement punishes amateur implementations. The maintenance burden outweighs Listmonk's install cost.

Why not Option F (Netlify Forms only): not a newsletter, just a form collector.

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
          │  SMTP  (smtp.gmail.com:587, app password)
          ▼
[ Gmail / Google Workspace ]
  - From: juan@jjuanrivvera.com  (Workspace alias) or jjuanrivvera@gmail.com (personal)
  - Hard cap: 2000/day (Workspace), 500/day (personal)

Cloudflare (complementary):
  - Email Routing: DMARC aggregate reports + bounce capture -> Gmail
  - Turnstile widget on subscribe form
```

## DNS Setup

```
SPF:    v=spf1 include:_spf.google.com ~all
DKIM:   managed by Google Workspace (enable in admin console, publish CNAMEs)
DMARC:  v=DMARC1; p=none; rua=mailto:dmarc@jjuanrivvera.com
List-Unsubscribe: handled by Listmonk on every campaign send
```

Tighten DMARC to `p=quarantine` after 2 weeks of clean aggregate reports, `p=reject` after 6 weeks.

## Implementation Phases

### Phase 1 — DNS + Gmail/Workspace setup (~1h)

1. Add SPF record including Google's relay: `v=spf1 include:_spf.google.com ~all`.
2. Enable DKIM signing for the domain in Google Workspace admin (or skip if using personal Gmail and accept that From must be `@gmail.com`).
3. Add DMARC record at `p=none` with an aggregate report address.
4. Configure Cloudflare Email Routing to forward `dmarc@jjuanrivvera.com` (and any bounce catch-all) to a personal inbox.
5. Generate a Gmail app password for the sending account (requires 2FA).

### Phase 2 — Listmonk deploy (~1.5h)

1. Docker Compose (Postgres + Listmonk). Single host deployment behind the existing reverse proxy.
2. Expose at `newsletter.jjuanrivvera.com` with SSL. Basic auth on `/admin` at the proxy layer.
3. Configure SMTP in Listmonk → smtp.gmail.com:587 with the app password from Phase 1.
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

1. Automation: on new blog post (GitHub webhook on merged PR or build webhook from Astro), call `POST /api/campaigns` on Listmonk to draft a campaign in the right language.
2. Does **not** auto-send — requires manual confirmation in the Listmonk admin to avoid accidental broadcasts.
3. RSS feed already exists; use it as the source of truth for post metadata.

### Phase 5 — Hardening (~30 min, 6 weeks out)

1. Review DMARC `rua` aggregate reports after two weeks of clean traffic.
2. Move DMARC to `p=quarantine`.
3. After six weeks of clean traffic, move DMARC to `p=reject`.
4. Run `mail-tester.com` — target 10/10.
5. If list volume is approaching Workspace's daily limit, file AWS SES production access request now (24h wait) so the upgrade path is ready.
6. Document the runbook in `docs/runbooks/newsletter.md`.

### Phase 6 (future, when needed) — Upgrade to SES

1. Verify domain in SES (`us-east-1`), add DKIM CNAMEs.
2. Request SES production access.
3. Update Listmonk SMTP host/port/credentials → `email-smtp.us-east-1.amazonaws.com:587` with SES SMTP credentials.
4. No other changes required.

Total active work for Phases 1–5: ~6h spread across a focused afternoon and a maintenance window.

## Open Questions

- **Personal Gmail vs Google Workspace as sender.** Workspace lets the `From` be `juan@jjuanrivvera.com` (professional, matches domain). Personal Gmail forces `From: jjuanrivvera@gmail.com` which reads as less polished for a custom-domain blog. If Workspace is already in use, use it. If not, either accept the personal-Gmail appearance for v1 or jump to SES directly.
- **Campaign cadence.** Per new post or a weekly/monthly digest. Initial lean: per-post given low publishing frequency; revisit if output increases.
- **Welcome email style.** One generic per-language template, or a teaser of the latest post in that language. Initial lean: simple welcome with a pointer to the latest post.
- **List segmentation.** Three language lists cover the main split. No further segmentation at v1.

## Out of Scope (for this PR)

- Newsletter-specific analytics dashboard (Listmonk's built-in is enough).
- A/B testing of subject lines.
- Subscriber segmentation by topic/tag (i18n lists cover the main split).
- SMS or push notification channels.

## Risks and Mitigations

| Risk                                     | Mitigation                                                                                                                                                                              |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gmail/Workspace throttling or suspension | Low bounce rate discipline (double opt-in + automatic hard-bounce unsubscribe). Monitor complaint rate. SES upgrade path ready if issues surface.                                       |
| DNS misconfig (DKIM/SPF)                 | Validate with `mail-tester.com` before announcing the newsletter. Any score under 9/10 delays the launch.                                                                               |
| Host outage                              | Postgres daily backups. Listmonk subscriber CSV export weekly to a separate storage destination.                                                                                        |
| Subscriber list leak                     | Basic auth on `/admin` at the proxy layer. API key in environment variable (not in git). Only `/api/public/subscription` is reachable without auth, and it is rate-limited by Listmonk. |
| Compliance regression                    | DMARC staged rollout (`p=none` → `p=quarantine` → `p=reject`). Monitor aggregate reports before tightening.                                                                             |
| Bot-spam signups                         | Listmonk's built-in rate limiting + Turnstile widget on the subscribe form.                                                                                                             |

## Success Criteria

- A reader on any `/blog/*` page can enter their email, pick (implied by locale) language, and receive a double opt-in email within 30 seconds.
- Confirmed subscribers receive the next post automatically after a manual send confirmation from the admin.
- `mail-tester.com` score 9/10 or higher.
- Unsubscribe works in one click from any email client, including Gmail's built-in unsubscribe button.
- Zero subscriber data leaves self-hosted infrastructure except the chosen SMTP relay (send only, transactional, no retention of content by the relay).

## Decision Requested

Approve Option B (Listmonk + Gmail/Workspace SMTP, SES deferred as upgrade path) as the direction, or call out a constraint that rules it out. If approved, this doc breaks down into per-phase tasks and Phase 1 (DNS + Workspace setup) starts first.

## References

- [Listmonk docs](https://listmonk.app/docs/)
- [Listmonk GitHub (knadh/listmonk)](https://github.com/knadh/listmonk)
- [Gmail bulk sender requirements](https://support.google.com/a/answer/14229414)
- [Google Workspace SMTP relay settings](https://support.google.com/a/answer/176600)
- [AWS SES production access docs](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html)
- [Astro Netlify adapter docs](https://docs.astro.build/en/guides/integrations-guide/netlify/)
- [Cloudflare Email Routing](https://developers.cloudflare.com/email-routing/)
- [Cloudflare Workers Send Email binding](https://developers.cloudflare.com/email-routing/email-workers/send-email-workers/)
- [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)
