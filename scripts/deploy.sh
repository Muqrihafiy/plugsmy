#!/usr/bin/env bash
# Executed on the existing production server by GitHub Actions.
set -euo pipefail

deploy_path=${1:?Missing deployment directory}
revision=${2:?Missing commit SHA}
[[ "$revision" =~ ^[0-9a-f]{40}$ ]]
cd "$deploy_path"

if [[ -n "$(git status --porcelain)" ]]; then
  echo 'Deployment stopped: server checkout has local changes.' >&2
  exit 1
fi

git fetch origin main
git cat-file -e "$revision^{commit}"
git merge-base --is-ancestor "$revision" origin/main
git reset --hard "$revision"
test -s site/index.html
test -s site/styles.css
docker compose config --quiet
docker compose up -d

for attempt in {1..15}; do
  if curl --fail --silent --show-error http://127.0.0.1:3023/ >/dev/null; then
    echo "Deployed $revision successfully."
    exit 0
  fi
  sleep 2
done
echo 'Deployment failed: Nginx did not respond successfully on port 3023.' >&2
exit 1
