#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found. Please install pnpm first." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "node not found. Please install Node.js first." >&2
  exit 1
fi

pnpm run package

if ! npx --yes @vscode/vsce --version >/dev/null 2>&1; then
  echo "Failed to run vsce via npx." >&2
  exit 1
fi

VERSION=$(node -p "require('./package.json').version")
VSIX_FILE="gait-vscode-${VERSION}.vsix"

npx --yes @vscode/vsce package -o "$VSIX_FILE"

if [[ ! -f "$VSIX_FILE" ]]; then
  echo "VSIX not found: $VSIX_FILE" >&2
  exit 1
fi

if ! command -v code >/dev/null 2>&1; then
  echo "code CLI not found. Run 'Shell Command: Install "code" command in PATH' in VS Code." >&2
  exit 1
fi

code --install-extension "$VSIX_FILE"

echo "Installed: $VSIX_FILE"
