#!/usr/bin/env bash
set -euo pipefail

# =========================================
# BOOKSA DEPLOYMENT — LOGGING FUNCTIONS
# =========================================

error() {
  printf '\n❌ ERROR: %s\n' "$*" >&2
  exit 1
}

info() {
  printf '\n▶ %s\n' "$*"
}

success() {
  printf '\n✅ %s\n' "$*"
}