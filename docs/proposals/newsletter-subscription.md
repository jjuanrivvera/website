# Proposal: Newsletter Subscription

**Status**: Draft
**Author**: Juan Felipe Rivera
**Date**: 2026-04-20
**Target**: `main`

## Goal

Let readers subscribe to blog updates by email. When a new post is published, subscribers get an email in their preferred language. Comply with GDPR and the Gmail/Yahoo 2026 bulk-sender rules. Own the subscriber list.

## Current Architecture

- Astro static site, i18n (`en`, `es`, `pt`), deployed on Netlify
- Multi-language blog under `/blog`, `/es/blog`, `/pt/blog`
- Homelab for backend: Raspberry Pi 4B (8GB RAM, 2TB storage, Docker, Mosquitto, n8n, Home Assistant, Nginx Proxy Manager)
- VPS (Contabo, 48GB RAM, 240GB NVMe, x86_64, Ubuntu 22.04) on Tailscale
- Public subdomains routed via NPM on Pi (`*.jjuanrivvera.com`)

## Constraints

- **Local-first preference** over SaaS where the cost-quality tradeoff is reasonable
- **Cost-conscious**: pick paths with near-zero monthly cost at 100–1000 subscribers
- **Data ownership**: subscriber list must be exportable and movable at any time
- **Gmail/Yahoo 2026 compliance**: SPF, DKIM, DMARC, one-click `List-Unsubscribe` header are mandatory for any non-trivial sender, strongly filtered if missing
- **Astro/Netlify compatibility**: the site is static; any subscribe form has to POST somewhere reachable from the browser or from a Netlify Function
- **Critical technical constraint**: Netlify Functions run on AWS Lambda and cannot reach Tailscale-only backends. Any self-hosted newsletter backend must be publicly addressable (via NPM with SSL) or fronted by a SaaS tier

## Options Considered

### Option A — Self-hosted Listmonk on VPS + AWS SES + NPM

Listmonk is a Go-based single-binary newsletter platform (active, `knadh/listmonk`). Runs in one container with Postgres. Sends via SMTP (AWS SES recommended). Exposed publicly at `newsletter.jjuanrivvera.com` via NPM with SSL so the Astro subscribe form can POST directly to its public subscription API.

- Pros: full ownership, Postgres-backed subscriber DB, double opt-in + GDPR + one-click `List-Unsubscribe` built in, multi-list (one per locale), API-first (scriptable from n8n), ~57 MB RAM footprint
- Cons: upfront setup (~6 hours), SES production-access request (24h wait), DNS records to get right
- Monthly cost: ~$0 at 100 subs, ~$0.40 at 1000 subs (SES `$0.10/1000`), ~$10 at 5000 subs

### Option B — Buttondown (SaaS)

Writer-focused newsletter SaaS. Markdown-native, clean API, responsive founder, easy CSV export.

- Pros: zero ops, live in 1–2 hours, Gmail compliance handled, clean export path if migration needed later
- Cons: $9/month past 100 subs, $29/month at 5000 subs, subscriber data lives on their servers
- Monthly cost: $0 → $9 → $29 across 100/1000/5000 subs

### Option C — n8n workflow + MySQL on Pi + SMTP relay

Custom workflow using existing homelab components: webhook into n8n, subscriber state machine in MySQL, transactional email via Brevo or SES.

- Pros: reuses existing stack, deep integration with site automations possible
- Cons: ~15 hours to build all edge cases (double opt-in, unsubscribe tokens, bounce handling, `List-Unsubscribe` header, template rendering), high ongoing maintenance burden, every bug risks Gmail spam reputation
- Monthly cost: near $0, but the real cost is engineering time both upfront and recurring

### Option D — Netlify Forms only

Netlify's built-in form handling (100 submissions/month free, $19/mo past that) to collect emails, then manual CSV export to send campaigns.

- Pros: near-zero setup
- Cons: no double opt-in, no `List-Unsubscribe`, no campaign sending (export and use another tool anyway), Gmail will flag this as soon as volume grows

## Recommendation

**Option A: Listmonk on the VPS, fronted by NPM at `newsletter.jjuanrivvera.com`, sending through AWS SES.**

Why this over Buttondown: the blog is partly _about_ owning the homelab and building things locally. Shipping a SaaS-backed newsletter undermines that positioning for readers of the Context Engineering and CLIs-over-MCPs posts. Cost at 5000 subs is ~$10 self-hosted vs $29 SaaS, and at 1000 subs the self-hosted path is essentially free.

Why not n8n-homebrew: Gmail's November 2025 enforcement punishes amateur implementations. The 15+ hours to build the subscription state machine, unsubscribe token flow, bounce parser, and `List-Unsubscribe` header all correctly — plus the ongoing reputation risk — outweigh Listmonk's install cost. n8n still has a role here: scheduled triggers that call the Listmonk API (e.g., "RSS feed update → draft a campaign in Listmonk").

Why not Netlify Forms: not a newsletter, just a form. Still requires a separate sender tool to send campaigns.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│ Astro site on Netlify (jjuanrivvera.com)                │
│ - Subscribe component in blog post layouts + footer     │
│ - Form POST → Astro endpoint (Netlify Functions adapter)│
└─────────────────────────────────────────────────────────┘
                       │ HTTPS POST
                       ▼
┌─────────────────────────────────────────────────────────┐
│ newsletter.jjuanrivvera.com (public)                    │
│ - NPM on Pi, SSL via Let's Encrypt                      │
│ - /api/public/subscription (rate-limited by Listmonk)   │
│ - /admin (basic auth at NPM layer)                      │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ Listmonk container (VPS or Pi, Docker Compose)          │
│ - Postgres 16 for subscribers                           │
│ - 3 lists: en-newsletter, es-newsletter, pt-newsletter  │
│ - Double opt-in enabled per list                        │
│ - One-click List-Unsubscribe header on all campaigns    │
└─────────────────────────────────────────────────────────┘
                       │ SMTP
                       ▼
┌─────────────────────────────────────────────────────────┐
│ AWS SES (us-east-1)                                     │
│ - DKIM, SPF, DMARC aligned for jjuanrivvera.com         │
│ - $0.10 per 1000 emails                                 │
└─────────────────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1 — DNS and SES foundation (~1.5h active + 24h SES approval wait)

1. Add SPF record: `v=spf1 include:amazonses.com -all`
2. Add DMARC record at `p=none` initially: `v=DMARC1; p=none; rua=mailto:dmarc@jjuanrivvera.com`
3. Create AWS account (if not already), verify `jjuanrivvera.com` in SES (`us-east-1`), add the three DKIM CNAMEs SES generates
4. Send a test email from the SES sandbox to a verified personal address
5. File the SES production access request with honest description: personal tech blog, transactional + opt-in newsletter, <1000/day, double opt-in enforced, one-click unsubscribe

### Phase 2 — Listmonk deploy (~1.5h)

1. Docker Compose on the VPS (Postgres 16 + Listmonk binary container)
2. Expose at `newsletter.jjuanrivvera.com` via NPM with SSL, basic auth on `/admin`
3. Configure SMTP settings pointing at SES
4. Create three lists (en-newsletter, es-newsletter, pt-newsletter), all double-opt-in
5. Import default templates, customize header/footer with site branding
6. Enable the one-click `List-Unsubscribe` header in Listmonk settings

### Phase 3 — Astro integration (~2h)

1. Build a `<SubscribeForm lang={lang} />` component
2. Place it in blog post layouts (bottom) and site footer
3. Submit via `fetch` to an Astro server endpoint (Astro 5 server actions or a POST route with the Netlify Functions adapter)
4. The endpoint proxies to `https://newsletter.jjuanrivvera.com/api/public/subscription` with the Listmonk API key held as a Netlify environment variable (never exposed to the browser)
5. Language detection from the current locale; submit to the right list automatically

### Phase 4 — Content workflow (~1h)

1. n8n workflow: triggered by the Astro build webhook or a GitHub webhook on merged blog PR
2. Fetches the new post metadata (title, excerpt, URL, language)
3. Calls `POST /api/campaigns` on Listmonk to draft a campaign in the matching language
4. Does NOT auto-send — requires manual confirmation in the Listmonk admin to avoid accidental broadcasts

### Phase 5 — Hardening (~30 min, 6 weeks out)

1. Review DMARC `rua` aggregate reports after two weeks of clean traffic
2. Move DMARC to `p=quarantine`
3. After six weeks of clean traffic, move DMARC to `p=reject`
4. Run `mail-tester.com` target 10/10
5. Document the runbook in `docs/runbooks/newsletter.md`

Total active work: ~6 hours, spread across a focused afternoon with a 24h pause after Phase 1.

## Open Questions

- **Where does Listmonk live — VPS or Pi?** VPS makes more sense (more RAM/CPU headroom, Listmonk has a tiny footprint but the choice also covers future growth). The Pi already carries Home Assistant, Frigate, n8n, MySQL, and others. Preference: VPS.
- **Double opt-in welcome email**: one generic per-language template, or a first-post teaser? Preference: simple welcome with a pointer to the latest post in that language.
- **Campaign cadence**: on every new post, or batched (weekly/monthly digest)? Preference: per-post for now given low publishing frequency; revisit if output increases.
- **From address**: `newsletter@jjuanrivvera.com` or `juan@jjuanrivvera.com`? Preference: the latter — personal, single-sender — unless Gmail flags it.

## Out of Scope (for this PR)

- Newsletter-specific analytics dashboard (Listmonk's built-in is enough for v1)
- A/B testing of subject lines
- Subscriber segmentation by topic/tag (i18n lists cover the main split)
- SMS or push notification channel (not requested)

## Risks and Mitigations

| Risk                     | Mitigation                                                                                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| SES sandbox rejection    | Backup path: Brevo SMTP relay (300 emails/day free). Switch SMTP host in Listmonk config — zero architectural change.                                                                |
| DNS misconfig (DKIM/SPF) | Validate with `mail-tester.com` before announcing the newsletter. Any score under 9/10 delays the launch.                                                                            |
| VPS outage               | Backups: daily Postgres dump to Pi via rsync. Listmonk subscriber data export (CSV) weekly to Google Drive via n8n.                                                                  |
| Subscriber list leak     | Basic auth on `/admin` at NPM layer, API key stored in Netlify env vars (not in git), no public write endpoints except `/api/public/subscription` which is rate-limited by Listmonk. |
| Compliance regression    | `p=none` → `p=quarantine` → `p=reject` staged rollout; monitor DMARC aggregate reports before tightening.                                                                            |

## Success Criteria

- A reader on any `/blog/*` page can enter their email, pick implied-by-locale language, and receive a double opt-in email within 30 seconds
- Confirmed subscribers receive the next post automatically (after manual send confirmation from admin)
- `mail-tester.com` score 9/10 or higher
- Unsubscribe works in one click from any email client, including Gmail's built-in unsubscribe button
- Zero subscriber data leaves self-hosted infrastructure except SES (transactional send only)

## Decision Requested

Approve Option A as the direction, or call out a constraint that rules it out. If approved, I'll break this doc into sub-issues (one per phase) and start Phase 1 (DNS + SES verification) since it has a 24h blocking wait on AWS.

## References

- [Listmonk docs — concepts, double opt-in, GDPR](https://listmonk.app/docs/concepts/)
- [Listmonk GitHub (knadh/listmonk)](https://github.com/knadh/listmonk)
- [AWS SES production access docs](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html)
- [Gmail bulk sender requirements 2026](https://support.google.com/a/answer/14229414)
- [Astro Netlify adapter docs](https://docs.astro.build/en/guides/integrations-guide/netlify/)
- [Netlify Private Connectivity docs (confirms no Tailscale reachability from Functions)](https://docs.netlify.com/manage/security/private-connectivity/)
