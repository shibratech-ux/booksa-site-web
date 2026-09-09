#!/usr/bin/env bash
set -euo pipefail

# Usage: ./deploy.sh [commit-message] [branch]
# Stages all non-ignored changes, builds, commits, and pushes to origin.
# Run from any directory; the repository is resolved from this script's location.

error() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

if (( $# > 2 )); then
  error 'Usage: ./deploy.sh [commit-message] [branch]'
fi

readonly COMMIT_MESSAGE="${1:-Update Booksa website}"
readonly BRANCH="${2:-main}"
readonly REMOTE_NAME="origin"

command -v git >/dev/null 2>&1 || error 'Git is not installed or available in PATH.'
command -v npm >/dev/null 2>&1 || error 'npm is required to validate the production build.'

script_directory="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$script_directory"
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || error 'The script must be located in the project Git repository.'
repository_root="$(git rev-parse --show-toplevel)"
cd "$repository_root"

[[ -f package.json ]] || error 'No package.json found at the repository root.'
[[ -d node_modules ]] || error 'Dependencies are missing. Run npm ci, then retry.'
git check-ref-format --branch "$BRANCH" >/dev/null 2>&1 || error "Invalid branch: $BRANCH"
current_branch="$(git branch --show-current)"
[[ -n "$current_branch" ]] || error 'Detached HEAD detected. Check out a branch before running this script.'
[[ "$current_branch" == "$BRANCH" ]] || error "Current branch is '$current_branch', expected '$BRANCH'. Check out '$BRANCH' or pass '$current_branch' as the second argument."
remote_url="$(git remote get-url "$REMOTE_NAME")" || error "No '$REMOTE_NAME' remote is configured."

printf 'Repository: %s\nBranch: %s\n' "$remote_url" "$BRANCH"
printf '\n[1/5] Checking local changes...\n'
git status --short
[[ -z "$(git diff --name-only --diff-filter=U)" ]] || error 'Resolve merge conflicts before deploying.'
for operation in MERGE_HEAD CHERRY_PICK_HEAD REVERT_HEAD rebase-merge rebase-apply; do
  [[ ! -e "$(git rev-parse --git-path "$operation")" ]] || error "Finish the pending Git operation ($operation) before deploying."
done

# Preserve the project's environment-file protection; .env.example is allowed.
while IFS= read -r -d '' file_path; do
  case "${file_path##*/}" in
    .env.example) ;;
    .env|.env.*)
      # Allow a previously tracked environment file to be removed in this commit.
      [[ ! -e "$file_path" ]] || error "Environment file would be included: $file_path. Remove it from Git tracking and ignore it before retrying."
      ;;
  esac
done < <(git ls-files -z --cached --others --exclude-standard)

printf '\n[2/5] Checking remote branch...\n'
# Fetch before staging or committing so a stale branch leaves local changes intact.
git fetch "$REMOTE_NAME" "refs/heads/$BRANCH"
if ! git merge-base --is-ancestor FETCH_HEAD HEAD; then
  error "Local '$BRANCH' is behind or diverged from '$REMOTE_NAME/$BRANCH'. Integrate the remote changes and retry."
fi

printf '\n[3/5] Running production build...\n'
npm run build

printf '\n[4/5] Staging and committing changes...\n'
git add --all
if git diff --cached --quiet; then
  printf 'No new changes to commit; existing local commits will still be pushed.\n'
else
  git commit -m "$COMMIT_MESSAGE"
fi

printf '\n[5/5] Pushing to GitHub...\n'
# A normal push also rejects remote changes made since the fetch above.
git push --set-upstream "$REMOTE_NAME" "HEAD:refs/heads/$BRANCH"

printf '\nSuccess. Branch %s was pushed to origin.\n' "$BRANCH"
printf 'If Netlify is connected to this branch, a deployment should start for new commits.\n'
