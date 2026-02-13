#!/bin/bash

# Multi-App ChatGPT Server Startup Script
# Starts all apps on a single MCP server

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$PROJECT_ROOT"

echo "🎮 Starting Multi-App ChatGPT Server..."
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check dependencies
echo "📋 Checking dependencies..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found"
    exit 1
fi
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok not found"
    exit 1
fi
echo "✅ Dependencies OK"
echo ""

# Kill existing
echo "🧹 Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
pkill -f "ngrok" 2>/dev/null || true
sleep 2

# Build all apps
echo "🔨 Building all apps..."
npm run build
echo ""

# Start multi-app server
echo "🌐 Starting multi-app MCP server on port 3001..."
npm run start:multi > server.log 2>&1 &
SERVER_PID=$!
sleep 5

# Check server
if ! lsof -ti:3001 > /dev/null; then
    echo "❌ Server failed to start. Check server.log"
    cat server.log
    exit 1
fi
echo "✅ Multi-app server running (PID: $SERVER_PID)"
echo ""

# Start ngrok
echo "🌍 Starting ngrok tunnel..."
ngrok http 3001 > ngrok.log 2>&1 &
NGROK_PID=$!
sleep 3

# Get ngrok URL
NGROK_URL=""
for i in {1..10}; do
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4)
    if [ ! -z "$NGROK_URL" ]; then
        break
    fi
    sleep 1
done

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL"
    exit 1
fi

echo -e "${GREEN}✅ ngrok tunnel created${NC}"
echo ""

# Display info
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 Multi-App Server Ready!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}⚠️  Note:${NC} Multi-app server is currently a work in progress"
echo "   For now, please run apps individually with ./scripts/start-app.sh"
echo ""
echo "Available apps:"
echo "  • Echo: echo tool"
echo "  • Calculator: add, subtract, multiply, divide"
echo ""
echo -e "${YELLOW}URL:${NC} ${GREEN}${NGROK_URL}/mcp${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
echo ""

cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    ./scripts/stop.sh
    exit 0
}

trap cleanup INT TERM

while true; do
    if ! kill -0 $SERVER_PID 2>/dev/null; then
        echo "❌ Server stopped unexpectedly"
        cleanup
    fi
    if ! kill -0 $NGROK_PID 2>/dev/null; then
        echo "❌ ngrok stopped unexpectedly"
        cleanup
    fi
    sleep 2
done
