#!/bin/bash

# Build App Script
# Builds a specific app

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_ROOT"

APP_NAME="${1:-echo}"

if [ ! -d "apps/$APP_NAME" ]; then
  echo "❌ App '$APP_NAME' not found"
  echo ""
  echo "Available apps:"
  ls -1 apps/ | grep -v "_template" | sed 's/^/  - /'
  exit 1
fi

echo "🔨 Building $APP_NAME..."
npm run build:infrastructure
npm run build:$APP_NAME
echo "✅ Build complete: dist/$APP_NAME/"
