#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/home/admin/sisikita/sisikita-api}"
BRANCH="${BRANCH:-main}"
PORT="${PORT:-3001}"
HEALTH_PATH="${HEALTH_PATH:-/api/categories}"

cd "$APP_DIR"

if [ ! -f .env.production ]; then
  echo "Missing $APP_DIR/.env.production" >&2
  exit 1
fi

if [ ! -d .git ]; then
  echo "$APP_DIR is not a git repository" >&2
  exit 1
fi

printf 'Deploying %s on branch %s\n' "$APP_DIR" "$BRANCH"

git fetch origin "$BRANCH"
git checkout "$BRANCH"
git reset --hard "origin/$BRANCH"

npm ci

if [ -f prisma/schema.prisma ]; then
  npx prisma generate
fi

npm run build

set -a
source ./.env.production
set +a

export PORT="${PORT:-${APP_PORT:-3001}}"
export APP_PORT="$PORT"
export NODE_ENV="${NODE_ENV:-production}"

if pm2 describe sisikita-api >/dev/null 2>&1; then
  pm2 delete sisikita-api
fi
pm2 start ecosystem.config.cjs --update-env
pm2 save

printf 'Waiting for local health on http://127.0.0.1:%s%s\n' "$PORT" "$HEALTH_PATH"
for attempt in $(seq 1 15); do
  HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:${PORT}${HEALTH_PATH}" || true)
  if [ "$HTTP_CODE" != "000" ]; then
    echo "Health check passed on attempt $attempt with HTTP $HTTP_CODE"
    pm2 status sisikita-api
    exit 0
  fi
  sleep 2
  echo "Health check retry $attempt/15"
done

echo "Health check failed after deploy" >&2
pm2 logs sisikita-api --lines 100 --nostream || true
exit 1
