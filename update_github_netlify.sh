#!/usr/bin/env bash
set -euo pipefail

# Compatibility entry point for the shared GitHub/Netlify deployment workflow.
# Keep build, Git validation, staging, and push logic in deploy.sh.

usage() {
  cat <<'USAGE'
Usage: update_github_netlify.sh [commit-message] [branch]

Builds the project, stages all non-ignored changes, commits when needed, and
pushes to origin. Defaults: "Update Booksa website" and "main".
The requested branch must be checked out and already exist on origin.
Netlify deploys through its GitHub integration when configured for this branch.

Can be run from any directory. Install dependencies with npm ci first.
USAGE
}

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

if (( $# > 2 )); then
  usage >&2
  exit 1
fi

script_directory="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
deploy_script="$script_directory/deploy.sh"

if [[ ! -f "$deploy_script" || ! -r "$deploy_script" ]]; then
  printf 'Error: Required deployment script is missing or unreadable: %s\n' "$deploy_script" >&2
  exit 1
fi

# Use Bash explicitly so this also works if deploy.sh loses its executable bit.
# exec preserves the deployment's exit status and forwards signals directly.
exec bash "$deploy_script" "$@"
