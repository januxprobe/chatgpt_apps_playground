#!/bin/bash

# MCP App Stop Script
# This script stops all services (MCP server, ngrok)

# Change to project root directory (parent of scripts/)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_ROOT"

echo "🛑 Stopping MCP App services..."

# Kill server on port 3001
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Kill ngrok
pkill -f "ngrok" 2>/dev/null || true

# Kill server processes (production tsx and dev mode)
pkill -f "tsx apps/" 2>/dev/null || true
pkill -f "tsx watch" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "concurrently" 2>/dev/null || true

sleep 2

echo "✅ All services stopped"
echo ""
echo "Run ./scripts/start-app.sh <app-name> to start again"
