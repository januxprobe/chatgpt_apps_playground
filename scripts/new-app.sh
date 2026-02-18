#!/bin/bash

# New App Scaffolding Script
# Creates a new app from the template

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_ROOT"

APP_ID=$1

if [ -z "$APP_ID" ]; then
  echo "Usage: ./scripts/new-app.sh <app-id>"
  echo ""
  echo "Example: ./scripts/new-app.sh weather"
  echo "  Creates: apps/weather/"
  exit 1
fi

if [ -d "apps/$APP_ID" ]; then
  echo "❌ App '$APP_ID' already exists"
  exit 1
fi

echo "📦 Creating new app: $APP_ID"
echo ""

# Copy template
cp -r apps/_template apps/$APP_ID

# Rename template files
mv apps/$APP_ID/server.ts.template apps/$APP_ID/server.ts
mv apps/$APP_ID/standalone.ts.template apps/$APP_ID/standalone.ts
mv apps/$APP_ID/widget/widget.html.template apps/$APP_ID/widget/$APP_ID-widget.html
mv apps/$APP_ID/widget/widget.ts.template apps/$APP_ID/widget/$APP_ID-widget.ts
rm apps/$APP_ID/README.md

# Prompt for app details
read -p "App display name (e.g., 'Weather App'): " APP_NAME
read -p "First tool name (e.g., 'get_weather'): " TOOL_NAME
read -p "Tool title (e.g., 'Get Weather'): " TOOL_TITLE
read -p "Tool description: " TOOL_DESCRIPTION

# Replace placeholders
find apps/$APP_ID -type f -exec sed -i '' "s/{{APP_ID}}/$APP_ID/g" {} \;
find apps/$APP_ID -type f -exec sed -i '' "s/{{APP_NAME}}/$APP_NAME/g" {} \;
find apps/$APP_ID -type f -exec sed -i '' "s/{{TOOL_NAME}}/$TOOL_NAME/g" {} \;
find apps/$APP_ID -type f -exec sed -i '' "s/{{TOOL_TITLE}}/$TOOL_TITLE/g" {} \;
find apps/$APP_ID -type f -exec sed -i '' "s/{{TOOL_DESCRIPTION}}/$TOOL_DESCRIPTION/g" {} \;

# Add scripts to package.json
npm pkg set "scripts.build:$APP_ID"="tsc -p tsconfig.app.json && cross-env APP=$APP_ID vite build --config vite.app.config.ts"
npm pkg set "scripts.start:$APP_ID"="concurrently 'cross-env APP=$APP_ID NODE_ENV=development vite build --watch --config vite.app.config.ts' 'tsx watch apps/$APP_ID/standalone.ts'"
npm pkg set "scripts.inspector:$APP_ID"="npx @modelcontextprotocol/inspector tsx apps/$APP_ID/standalone.ts -- --stdio"

echo ""
echo "✅ App created at apps/$APP_ID"
echo ""
echo "Next steps:"
echo "  1. Edit apps/$APP_ID/server.ts - Implement your tool logic"
echo "  2. Edit apps/$APP_ID/widget/$APP_ID-widget.html - Design your UI"
echo "  3. Edit apps/$APP_ID/widget/$APP_ID-widget.ts - Add UI logic"
echo "  4. Test: ./scripts/start-app.sh $APP_ID"
echo ""
echo "Happy coding! 🚀"
