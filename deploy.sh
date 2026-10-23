
#!/usr/bin/env bash
set -euo pipefail

# BOOKSA — GitHub / Netlify Deployment
# Usage: ./deploy.sh [commit_message] [branch]

error() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

info() {
  printf '\n==> %s\n' "$*"
}

success() {
  printf '\nSUCCESS: %s\n' "$*"
}

# 1. Validate arguments and tools
(( $# <= 2 )) || error "Too many arguments."

command -v git >/dev/null || error "Git missing."
command -v npm >/dev/null || error "npm missing."

# 2. Locate repository
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

ROOT="$(git rev-parse --show-toplevel)" ||
  error "Not inside a Git repository."

cd "$ROOT"
[[ -f package.json ]] || error "package.json missing."

# 3. Detect active branch
CURRENT_BRANCH="$(git branch --show-current)"
[[ -n "$CURRENT_BRANCH" ]] ||
  error "Detached HEAD is not supported."

BRANCH="${2:-$CURRENT_BRANCH}"
MESSAGE="${1:-Update Booksa website}"
REMOTE="origin"

[[ "$BRANCH" == "$CURRENT_BRANCH" ]] ||
  error "Current branch is $CURRENT_BRANCH, not $BRANCH."

git check-ref-format --branch "$BRANCH" >/dev/null ||
  error "Invalid branch name."

git remote get-url "$REMOTE" >/dev/null ||
  error "Remote origin missing."

info "BOOKSA DEPLOYMENT"
printf 'Branch: %s\n' "$BRANCH"
printf 'Commit message: %s\n' "$MESSAGE"

# 4. Verify Git state
info "[1/6] Checking Git repository"

git status --short

[[ -z "$(git ls-files -u)" ]] ||
  error "Resolve merge conflicts first."

for operation in \
  MERGE_HEAD CHERRY_PICK_HEAD REVERT_HEAD \
  rebase-merge rebase-apply
do
  [[ ! -e "$(git rev-parse --git-path "$operation")" ]] ||
    error "Pending Git operation: $operation"
done

# 5. Check sensitive files
info "[2/6] Checking sensitive files"

check_sensitive_file() {
  local file="$1"
  local name="${file##*/}"

  case "$name" in
    .env.example)
      ;;
    .env|.env.*)
      if [[ -e "$file" || -L "$file" ]]; then
        error "Sensitive file detected in Git: $file"
      fi
      ;;
  esac
}

while IFS= read -r -d '' file; do
  check_sensitive_file "$file"
done < <(
  git ls-files --cached --others \
    --exclude-standard -z
)

success "Environment files checked"

# 6. Verify remote synchronization
info "[3/6] Checking remote branch"

if git ls-remote --exit-code \
  --heads "$REMOTE" "refs/heads/$BRANCH" >/dev/null; then

  git fetch "$REMOTE" "refs/heads/$BRANCH"

  git merge-base --is-ancestor FETCH_HEAD HEAD ||
    error "Remote has new commits. Integrate them first."
else
  error "Remote branch not found or inaccessible."
fi

success "Remote branch verified"

# 7. Production build
info "[4/6] Building project"

npm ci
npm run build

success "Production build passed"

# 8. Stage and create commit
info "[5/6] Creating Git commit"

git add --all

while IFS= read -r -d '' file; do
  name="${file##*/}"

  case "$name" in
    .env.example)
      ;;
    .env|.env.*)
      error "Sensitive file staged: $file"
      ;;
  esac
done < <(
  git diff --cached --name-only \
    --diff-filter=ACMR -z
)

git diff --cached --check ||
  error "Invalid staged changes."

if git diff --cached --quiet; then
  info "No new changes to commit."
else
  git commit -m "$MESSAGE"
fi

# 9. Push to GitHub
info "[6/6] Pushing to GitHub"

git push --set-upstream \
  "$REMOTE" "HEAD:refs/heads/$BRANCH"

success "GitHub push completed"

printf '\nBranch: %s\n' "$BRANCH"
printf 'Commit: %s\n' "$(git rev-parse --short HEAD)"

if [[ "$BRANCH" == "main" ]]; then
  info "Netlify production deployment may start."
else
  info "Netlify branch deployment may start."
fi
