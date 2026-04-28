#!/usr/bin/env bash
# Newsletter pipeline secret setup.
#
# Reads the existing Listmonk API token from ~/.listmonk-api-token
# (chmod 600) and writes all four GitHub repo secrets in one shot.
#
# The API user `astro` already exists in Listmonk admin (Super Admin,
# kind=API). Reusing that token here keeps the surface small and
# avoids a second user just for this workflow.
#
# Run on a machine where `gh auth status` shows active for
# jjuanrivvera/website (the VPS qualifies).

set -euo pipefail

REPO="jjuanrivvera/website"
TOKEN_FILE="$HOME/.listmonk-api-token"

LISTMONK_URL="https://newsletter.jjuanrivvera.com"
LISTMONK_USER="astro"
NEWSLETTER_FROM_EMAIL="Juan Rivera <newsletter@jjuanrivvera.com>"

if ! command -v gh >/dev/null 2>&1; then
  echo "✘ gh CLI not found. Install it first." >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "✘ gh is not authenticated. Run: gh auth login" >&2
  exit 1
fi

if [[ ! -r "$TOKEN_FILE" ]]; then
  echo "✘ Token file not readable: $TOKEN_FILE" >&2
  exit 1
fi

LISTMONK_TOKEN="$(<"$TOKEN_FILE")"
LISTMONK_TOKEN="${LISTMONK_TOKEN//[$'\r\n']/}"

if [[ -z "$LISTMONK_TOKEN" ]]; then
  echo "✘ Token file is empty: $TOKEN_FILE" >&2
  exit 1
fi

echo
echo "Writing secrets on $REPO"
echo "  · LISTMONK_URL          = $LISTMONK_URL"
echo "  · LISTMONK_USER         = $LISTMONK_USER"
echo "  · LISTMONK_TOKEN        = (from $TOKEN_FILE)"
echo "  · NEWSLETTER_FROM_EMAIL = $NEWSLETTER_FROM_EMAIL"
echo

set_secret() {
  local key="$1"
  local val="$2"
  printf '%s' "$val" | gh secret set "$key" --repo "$REPO" --body -
  echo "  ✓ $key"
}

set_secret LISTMONK_URL "$LISTMONK_URL"
set_secret LISTMONK_USER "$LISTMONK_USER"
set_secret LISTMONK_TOKEN "$LISTMONK_TOKEN"
set_secret NEWSLETTER_FROM_EMAIL "$NEWSLETTER_FROM_EMAIL"

echo
echo "Done. Smoke-test without sending an email:"
echo "  gh workflow run 'Publish newsletter' --repo $REPO -f dry_run=1 -f force_posts=en/ship-fast-and-safe-with-ai-agents"
