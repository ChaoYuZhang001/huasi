#!/bin/sh
# Publish the committed site and relay to Cloudflare with an API token.
#
#   CLOUDFLARE_API_TOKEN=<token> sh server/deploy.sh
#
# What gets published is a clean export of HEAD, never the working tree, so
# uncommitted edits, scratch pages and log files cannot end up on the public
# site. Create the token in the Cloudflare dashboard: My Profile > API Tokens >
# Create Token > "Edit Cloudflare Workers". It is read from the environment
# only; this script neither stores nor prints it.
#
# Only api.cloudflare.com is contacted, so this also works on networks where
# the dash.cloudflare.com login page (and therefore `wrangler login`) times out.
set -eu

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "CLOUDFLARE_API_TOKEN is not set." >&2
  echo "Usage: CLOUDFLARE_API_TOKEN=<token> sh server/deploy.sh" >&2
  exit 2
fi

ROOT=$(cd "$(dirname "$0")/.." && pwd)
OUT=$(mktemp -d)
trap 'rm -rf "$OUT"' EXIT INT TERM

git -C "$ROOT" archive HEAD | tar -x -C "$OUT"
echo "Publishing commit $(git -C "$ROOT" log -1 --format='%h %s')"
if [ -n "$(git -C "$ROOT" status --porcelain)" ]; then
  echo "Note: the working tree has uncommitted changes. They are NOT part of this deploy."
fi

cd "$OUT"
export WRANGLER_SEND_METRICS=false
# Prefer a wrangler installed under ~/.local (no global Node needed); else npx.
if [ -x "$HOME/.local/wrangler/node_modules/.bin/wrangler" ]; then
  PATH="$HOME/.local/node/bin:$PATH" "$HOME/.local/wrangler/node_modules/.bin/wrangler" deploy
else
  npx --yes wrangler@4 deploy
fi
