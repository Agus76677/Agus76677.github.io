#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

MSG="${1:-update: $(date '+%Y-%m-%d %H:%M:%S')}"
PROXY="${2:-${GIT_PUSH_PROXY:-}}"
MAX_RETRIES=3

if [[ -n "$(git status --porcelain)" ]]; then
  git add .
  git commit -m "$MSG"
else
  echo "No local changes to commit."
fi

attempt=1
while (( attempt <= MAX_RETRIES )); do
  echo "Push attempt $attempt/$MAX_RETRIES ..."
  if [[ -n "$PROXY" ]]; then
    if git -c "http.proxy=$PROXY" -c "https.proxy=$PROXY" push origin main; then
      echo "Done. Pushed to origin/main (via proxy $PROXY)."
      exit 0
    fi
  else
    if git push origin main; then
      echo "Done. Pushed to origin/main."
      exit 0
    fi
  fi
  ((attempt++))
  sleep 2
done

echo "Push failed after $MAX_RETRIES attempts."
echo "Tip: bash scripts/publish.sh \"msg\" \"http://127.0.0.1:7890\""
exit 1
