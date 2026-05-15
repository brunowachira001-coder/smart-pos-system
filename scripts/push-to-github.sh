#!/usr/bin/env bash
# One-command push for security commit 35cbff4
set -euo pipefail

REPO_DIR="${1:-$HOME/Desktop}"
export PATH="$HOME/.local/bin:$PATH"

cd "$REPO_DIR"

echo "==> Checking commit..."
git log -1 --oneline
if ! git status -sb | grep -q 'ahead'; then
  echo "Nothing to push (branch not ahead of origin)."
  exit 0
fi

# Prefer GitHub CLI
if command -v gh >/dev/null 2>&1 || [ -x "$HOME/.local/bin/gh" ]; then
  GH="$(command -v gh 2>/dev/null || echo "$HOME/.local/bin/gh")"
  if ! "$GH" auth status >/dev/null 2>&1; then
    echo ""
    echo "GitHub login required (browser or token)."
    echo "Run: $GH auth login"
    echo "  - GitHub.com"
    echo "  - HTTPS"
    echo "  - Login with a web browser (easiest)"
    echo ""
    "$GH" auth login
    "$GH" auth setup-git
  fi
  git remote set-url origin https://github.com/brunowachira001-coder/smart-pos-system.git
  git push -u origin main
  echo ""
  echo "Success: pushed to origin/main"
  git status -sb
  exit 0
fi

# Fallback: HTTPS + PAT prompt
echo "gh not found. Install: sudo apt install gh"
echo "Or push manually with a Personal Access Token as the password."
git remote set-url origin https://github.com/brunowachira001-coder/smart-pos-system.git
git push -u origin main
