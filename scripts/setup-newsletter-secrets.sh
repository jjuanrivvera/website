#!/usr/bin/env bash
# Newsletter pipeline secret setup.
#
# Most values are hardcoded — only the Listmonk API token is prompted.
# Run on a machine where `gh auth status` shows active for jjuanrivvera/website.
#
# Pre-req: in Listmonk admin → Users → New, create an API user named
# `github-actions` (kind=API) and copy the generated token.

set -euo pipefail

REPO="jjuanrivvera/website"
LISTMONK_URL="https://newsletter.jjuanrivvera.com"
LISTMONK_USER="github-actions"
NEWSLETTER_FROM_EMAIL="Juan Rivera <hello@jjuanrivvera.com>"

if ! command -v gh >/dev/null 2>&1; then
  echo "✘ gh CLI not found. Install it first." >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "✘ gh is not authenticated. Run: gh auth login" >&2
  exit 1
fi

echo
echo "Setting newsletter secrets on $REPO"
echo "  · LISTMONK_URL          = $LISTMONK_URL"
echo "  · LISTMONK_USER         = $LISTMONK_USER"
echo "  · NEWSLETTER_FROM_EMAIL = $NEWSLETTER_FROM_EMAIL"
echo

while true; do
  printf "Listmonk API token (hidden): "
  IFS= read -rs LISTMONK_TOKEN
  LISTMONK_TOKEN="${LISTMONK_TOKEN%$'\r'}"
  echo
  [[ -n "$LISTMONK_TOKEN" ]] && break
  echo "  ✘ token required, try again"
done

set_secret() {
  local key="$1"
  local val="$2"
  printf '%s' "$val" | gh secret set "$key" --repo "$REPO" --body -
  echo "  ✓ $key"
}

echo
echo "Writing secrets…"
set_secret LISTMONK_URL "$LISTMONK_URL"
set_secret LISTMONK_USER "$LISTMONK_USER"
set_secret LISTMONK_TOKEN "$LISTMONK_TOKEN"
set_secret NEWSLETTER_FROM_EMAIL "$NEWSLETTER_FROM_EMAIL"

echo
echo "Done. The 'Publish newsletter' workflow will use these on the next push to main."
echo "To smoke-test without sending an email:"
echo "  gh workflow run 'Publish newsletter' --repo $REPO -f dry_run=1 -f force_posts=en/ship-fast-and-safe-with-ai-agents"
