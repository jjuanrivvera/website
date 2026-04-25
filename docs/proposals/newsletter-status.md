# Newsletter — Implementation Status

**Last updated**: 2026-04-25

## Architecture (deployed)

```text
Astro site (Netlify)
  └── <SubscribeForm lang>
        ├── altcha-widget fetches challenge cross-origin from Listmonk (CORS allowed)
        └── HTML form POST cross-origin → newsletter.jjuanrivvera.com/subscription/form
              └── Listmonk on Pi (Docker, behind home tunnel)
                    └── SMTP via Resend (smtp.resend.com:465 SSL)
                          └── Resend → Amazon SES → recipient inbox
```

No first-party Astro server endpoint. Listmonk's hosted form handler accepts
the cross-origin POST directly; browsers don't require CORS for plain HTML
form submits.

## Phase 1 — DNS + Resend (DONE)

DNS records on `jjuanrivvera.com` zone:

- `_dmarc` TXT — DMARC `p=none` monitoring; tighten to `quarantine` after 2w clean, `reject` after 6w
- `resend._domainkey` TXT — DKIM key from Resend
- `send.jjuanrivvera.com` TXT — `v=spf1 include:amazonses.com ~all` (isolated subdomain SPF)
- `send.jjuanrivvera.com` MX → `feedback-smtp.sa-east-1.amazonses.com` (return-path)
- Email Routing rule: `dmarc@jjuanrivvera.com` → forwards to `jjuanrivvera@gmail.com` (DMARC reports)

Root SPF unchanged (still strict CF Email Routing only).

Resend domain `jjuanrivvera.com` verified. Send-only API key stored.

## Phase 2 — Listmonk on Pi (DONE)

**Deployment**:

- Pi `~/services/listmonk/` — Docker Compose (Listmonk v6.1.0 + Postgres 17 alpine)
- Listmonk container binds `127.0.0.1:9020`, Postgres `127.0.0.1:9001`
- Restart policy: `unless-stopped`
- Public URL: `https://newsletter.jjuanrivvera.com` (via home tunnel, version 76)
- Whitelisted in CF "Not in colombia" geo-fence (subscribers reachable globally)

**Bootstrap quirk** (documented for future ref):

- Listmonk v6.1.0 setup wizard has a bug — inserts admin with `user_role_id=NULL` violating NOT NULL constraint.
- Workaround applied: created Super Admin role + admin user via SQL with the bcrypt hash that Listmonk's bootstrap had generated (extracted from the failed insert error message).
- IMPORTANT: SSH heredoc mangles `$2a$06$...` bcrypt prefixes — always pass via `scp` of a SQL file, never inline.

**Configuration**:

- SMTP server: Resend (smtp.resend.com:465, SSL/TLS, auth=LOGIN, user=resend, password=Resend API key)
- Default sender: `newsletter@jjuanrivvera.com`

**Lists** (all double opt-in, public):
| ID | Name | UUID |
|---|---|---|
| 3 | Newsletter (English) | `1fd370d2-9c78-4e9d-98a2-9313fd5a0061` |
| 4 | Newsletter (Español) | `99da3660-a828-409c-8ad4-a5631ab09cb6` |
| 5 | Newsletter (Português) | `97112328-d358-4ecf-bb43-33a63731a11b` |

**Users**:

- `admin` (type=user, role=Super Admin) — web login
- `astro` (type=api, role=Super Admin) — for Astro integration

## Credentials (stored on VPS, never in repo)

- Admin password: `~/.listmonk-admin-pass` (chmod 600)
- API user "astro" token: `~/.listmonk-api-token` (chmod 600)
- Resend API key (send-only): `~/.resend-api-key` (chmod 600)
- Listmonk Postgres password: `~/services/listmonk/.env` on Pi (chmod 600)

## Decisions (per Juan 2026-04-24)

- From address: `newsletter@jjuanrivvera.com`
- Cadence: per-post (one email per new blog post)
- Welcome email: generic
- Listmonk on: Pi (not VPS)
- Captcha on subscribe form: **Altcha** (built-in Listmonk; chosen over Turnstile because Listmonk doesn't natively support Turnstile and Altcha needs no third-party signup or server-side validation)

## Phase 3 — Astro integration (DONE)

Shipped:

1. `<SubscribeForm lang={lang} />` reusable Astro component (`src/components/blog/SubscribeForm.astro`)
2. Placed in blog post layouts after `<AuthorBio>`
3. **HTML form POST cross-origin** to `https://newsletter.jjuanrivvera.com/subscription/form` — no server endpoint, no Listmonk API token in browser
4. Per-language hidden input `l` carries the matching list UUID
5. Altcha widget fetches challenge from `/api/public/captcha/altcha` (CORS: `https://jjuanrivvera.com`, `https://www.jjuanrivvera.com`)
6. Listmonk validates the altcha solution server-side and sends the double-opt-in email
7. Response renders on Listmonk's hosted page in a new tab (`target="_blank"`) so the reader keeps their place in the post

## Phase 4 — Content workflow (PENDING)

- Trigger: blog PR merge to main
- Action: GitHub Action runs Listmonk campaign API to send the new post to the matching language list
- Template per language with site branding

## Phase 5 — Hardening (6 weeks out)

- DMARC `p=none` → `p=quarantine` (2w) → `p=reject` (6w)
- List cleanup automation (auto-remove hard-bounced emails)
- Bounce handling via SES SNS (optional)

## Phase 6 — Future upgrades

- If list grows past Resend's free 3k/month: migrate to Brevo (9k free) or AWS SES production
- All migration paths preserve Listmonk as the data layer
