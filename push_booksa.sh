#!/usr/bin/env bash
set -euo pipefail

# Usage: ./push_booksa.sh [commit_message] [branch]
# Run from the repository or place the script at its root.

fail() { printf 'ERREUR : %s\n' "$*" >&2; exit 1; }
info() { printf '\n==> %s\n' "$*"; }

command -v git >/dev/null 2>&1 || fail 'Git est introuvable.'
[[ $# -le 2 ]] || fail 'Utilisation : ./push_booksa.sh [message] [branche]'

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || fail 'Placez ce script dans votre dépôt Git.'
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

CURRENT_BRANCH="$(git branch --show-current)"
[[ -n "$CURRENT_BRANCH" ]] || fail 'HEAD détaché : sélectionnez une branche.'
BRANCH="${2:-$CURRENT_BRANCH}"
MESSAGE="${1:-Update Booksa website}"
[[ "$BRANCH" == "$CURRENT_BRANCH" ]] || fail "Branche active : $CURRENT_BRANCH ; branche demandée : $BRANCH."
[[ -n "$MESSAGE" ]] || fail 'Le message du commit ne peut pas être vide.'
git remote get-url origin >/dev/null 2>&1 || fail 'Le remote origin est absent.'
[[ -z "$(git ls-files -u)" ]] || fail 'Résolvez les conflits Git avant le push.'

info "Dépôt : $ROOT | Branche : $BRANCH"
git status --short

# Check tracked and untracked, non-ignored paths using NUL delimiters.
info 'Contrôle des fichiers sensibles'
while IFS= read -r -d '' path; do
  name="${path##*/}"
  case "$name" in
    .env.example|.env.sample|.env.template) ;;
    .env|.env.*|*.pem|*.p12|*.p8|id_rsa|id_ed25519|serviceAccountKey.json|firebase-adminsdk*.json)
      fail "Fichier sensible non ignoré ou suivi : $path (vérifiez .gitignore et git rm --cached si nécessaire)." ;;
  esac
done < <(git ls-files --cached --others --exclude-standard -z)

info 'Vérification de la branche distante'
# Fetch before editing the index; refuse non-fast-forward states.
git fetch origin "$BRANCH" || fail "Impossible de récupérer origin/$BRANCH."
git merge-base --is-ancestor FETCH_HEAD HEAD || fail "origin/$BRANCH comporte des commits absents localement : intégrez-les avant le push."

info 'Ajout des fichiers et vérification du diff'
git add --all
# Check staged paths again, including files already staged before this script.
while IFS= read -r -d '' path; do
  name="${path##*/}"
  case "$name" in
    .env.example|.env.sample|.env.template) ;;
    .env|.env.*|*.pem|*.p12|*.p8|id_rsa|id_ed25519|serviceAccountKey.json|firebase-adminsdk*.json)
      fail "Fichier sensible indexé : $path. Retirez-le de l'index avant de continuer." ;;
  esac
done < <(git diff --cached --name-only --diff-filter=ACMR -z)
git diff --cached --check || fail 'Le diff contient des erreurs de formatage.'
git diff --cached --stat

if git diff --cached --quiet; then
  info 'Aucune modification à committer.'
else
  git commit -m "$MESSAGE"
fi

info "Push vers origin/$BRANCH"
git push -u origin "HEAD:refs/heads/$BRANCH"
printf '\nSuccès ! Branche : %s | Commit : %s\n' "$BRANCH" "$(git rev-parse --short HEAD)"
if [[ "$BRANCH" == main ]]; then
  printf 'Si Netlify surveille main, le déploiement automatique peut démarrer.\n'
fi
