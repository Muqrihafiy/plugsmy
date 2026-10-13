#!/usr/bin/env bash
# Install outside the repository at /root/.ssh/plugsmy-deploy-command.
# This forced SSH command ignores stdin and accepts only a commit SHA.
set -euo pipefail
if [[ "${SSH_ORIGINAL_COMMAND:-}" =~ ^deploy\ ([0-9a-f]{40})$ ]]; then
  exec /bin/bash /root/.ssh/plugsmy-deploy.sh /root/plugsmy-website "${BASH_REMATCH[1]}" </dev/null
fi
echo 'Only deploy <40-character commit SHA> is allowed.' >&2
exit 1
