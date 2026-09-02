#!/usr/bin/env bash

# Usage:
#   ./deploy.sh
#   ./deploy.sh "My commit message"
#
# Stages local changes, creates a commit, and pushes main to origin.
# Netlify is expected to deploy automatically from the GitHub main branch.

set -euo pipefail

readonly EXPECTED_BRANCH="main"
readonly REMOTE_NAME="origin"
readonly COMMIT_MESSAGE="${1:-Update Booksa website}"

error() {
  printf 'Error: %s\n' "$*" >&2
}

printf '[1/6] Checking Git repository...\n'

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  error 'This script must be run inside a Git repository.'
  exit 1
fi

repository_root="$(git rev-parse --show-toplevel)"
cd "$repository_root"

if ! remote_url="$(git remote get-url "$REMOTE_NAME" 2>/dev/null)"; then
  error "Git remote '$REMOTE_NAME' does not exist."
  exit 1
fi

printf 'Repository:\n%s\n\n' "$remote_url"

printf '[2/6] Checking branch...\n'
current_branch="$(git branch --show-current)"

if [[ "$current_branch" != "$EXPECTED_BRANCH" ]]; then
  printf "Current branch is '%s'.\n" "${current_branch:-detached HEAD}" >&2
  printf "Deployment expects '%s'.\n" "$EXPECTED_BRANCH" >&2
  printf 'No commit or push was performed.\n' >&2
  exit 1
fi

printf "Current branch: %s\n\n" "$current_branch"

printf '[3/6] Checking changes and sensitive files...\n'
git status --short

if [[ -z "$(git status --porcelain)" ]]; then
  printf 'No local changes to commit.\n'
  exit 0
fi

sensitive_file_found=false
while IFS= read -r file_path; do
  file_name="${file_path##*/}"
  case "$file_name" in
    .env|.env.local|.env.production|.env.development.local)
      printf "Warning: sensitive environment file is tracked or eligible for staging: %s\n" "$file_path" >&2
      sensitive_file_found=true
      ;;
  esac
done < <(git ls-files --cached --others --exclude-standard)

if [[ "$sensitive_file_found" == true ]]; then
  printf 'Deployment stopped. Remove sensitive environment files from Git tracking before continuing.\n' >&2
  printf '.env.example is allowed and remains versioned.\n' >&2
  exit 1
fi

printf 'Sensitive-file check passed.\n\n'

printf '[4/6] Staging files...\n'
git add .
git status --short

if git diff --cached --quiet; then
  printf 'No changes were staged; no commit was created.\n'
  exit 0
fi

printf '\n[5/6] Creating commit...\n'
printf 'Commit message: %s\n' "$COMMIT_MESSAGE"
git commit -m "$COMMIT_MESSAGE"

printf '\n[6/6] Checking remote state and pushing to GitHub...\n'
git fetch "$REMOTE_NAME" "$EXPECTED_BRANCH"

behind_count="$(git rev-list --count "HEAD..FETCH_HEAD")"
if (( behind_count > 0 )); then
  printf "Local '%s' is behind '%s/%s' by %s commit(s).\n" \
    "$EXPECTED_BRANCH" "$REMOTE_NAME" "$EXPECTED_BRANCH" "$behind_count" >&2
  printf "Run 'git pull %s %s', resolve any conflicts, then push when the branch is synchronized.\n" \
    "$REMOTE_NAME" "$EXPECTED_BRANCH" >&2
  printf 'The new local commit was not pushed.\n' >&2
  exit 1
fi

git push "$REMOTE_NAME" "$EXPECTED_BRANCH"

printf '\nDeployment push completed successfully.\n\n'
printf 'GitHub branch:\n%s\n\n' "$EXPECTED_BRANCH"
printf 'Netlify should detect the new GitHub commit automatically if continuous deployment is configured.\n'
