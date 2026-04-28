#!/usr/bin/env bash
# Interactive setup for the newsletter pipeline secrets.
#
# Run this on a machine where the GitHub CLI is authenticated for
# jjuanrivvera/website (the VPS is fine — `gh auth status` should show
# active). The script prompts for each value and writes it into the repo
# secrets via `gh secret set`.
#
# Required:
#   LISTMONK_URL     base URL (e.g. https://newsletter.jjuanrivvera.com)
#   LISTMONK_USER    name of the API user (created in Listmonk admin →
#                    Users → New (kind=API))
#   LISTMONK_TOKEN   token for that API user
#
# Optional:
#   TELEGRAM_BOT_TOKEN   if set, the workflow posts a Telegram summary
#                        after each run
#   NEWSLETTER_FROM_EMAIL  defaults to "Juan Rivera <hello@jjuanrivvera.com>"
#
# Re-running the script is safe — it overwrites existing values.

set -euo pipefail

REPO="jjuanrivvera/website"

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
echo "(press Enter to skip optional values)"
echo

# Prompt helper. Reads a single line from stdin, stripping trailing CR.
# Re-prompts on empty input unless `--allow-empty` is passed.
prompt() {
  local var_name="$1"
  local label="$2"
  local default_value="${3:-}"
  local allow_empty="${4:-no}"
  local hint=""
  [[ -n "$default_value" ]] && hint=" [$default_value]"
  while true; do
    printf "%s%s: " "$label" "$hint"
    IFS= read -r value
    value="${value%$'\r'}"
    if [[ -z "$value" && -n "$default_value" ]]; then
      value="$default_value"
    fi
    if [[ -n "$value" || "$allow_empty" == "yes" ]]; then
      printf -v "$var_name" '%s' "$value"
      return
    fi
    echo "  ✘ value required, try again"
  done
}

# Secret reader (no echo) — used for tokens.
prompt_secret() {
  local var_name="$1"
  local label="$2"
  local allow_empty="${3:-no}"
  while true; do
    printf "%s (hidden): " "$label"
    IFS= read -rs value
    value="${value%$'\r'}"
    echo
    if [[ -n "$value" || "$allow_empty" == "yes" ]]; then
      printf -v "$var_name" '%s' "$value"
      return
    fi
    echo "  ✘ value required, try again"
  done
}

prompt LISTMONK_URL "Listmonk URL" "https://newsletter.jjuanrivvera.com"
prompt LISTMONK_USER "Listmonk API user (kind=API)" ""
prompt_secret LISTMONK_TOKEN "Listmonk API token"
prompt NEWSLETTER_FROM_EMAIL "Newsletter from email" "Juan Rivera <hello@jjuanrivvera.com>"
prompt_secret TELEGRAM_BOT_TOKEN "Telegram bot token (optional)" yes
prompt TELEGRAM_CHAT_ID "Telegram chat id" "1478765505"

set_secret() {
  local key="$1"
  local val="$2"
  if [[ -z "$val" ]]; then
    echo "  · $key: skipped (empty)"
    return
  fi
  printf '%s' "$val" | gh secret set "$key" --repo "$REPO" --body -
  echo "  ✓ $key"
}

echo
echo "Writing secrets…"
set_secret LISTMONK_URL "$LISTMONK_URL"
set_secret LISTMONK_USER "$LISTMONK_USER"
set_secret LISTMONK_TOKEN "$LISTMONK_TOKEN"
set_secret NEWSLETTER_FROM_EMAIL "$NEWSLETTER_FROM_EMAIL"
set_secret TELEGRAM_BOT_TOKEN "${TELEGRAM_BOT_TOKEN:-}"
set_secret TELEGRAM_CHAT_ID "$TELEGRAM_CHAT_ID"

echo
echo "Done. The 'Publish newsletter' workflow will use these on the next push to main."
echo "To smoke-test without sending an email:"
echo "  gh workflow run 'Publish newsletter' --repo $REPO -f dry_run=1 -f force_posts=en/ship-fast-and-safe-with-ai-agents"
