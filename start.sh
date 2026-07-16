#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/mymua-link-in-bio-saas"
ENV_FILE="$PROJECT_DIR/.env"
TUNNEL_PID=""

cleanup() {
  echo ""
  echo "Shutting down..."
  [ -n "$TUNNEL_PID" ] && kill "$TUNNEL_PID" 2>/dev/null && wait "$TUNNEL_PID" 2>/dev/null
  pm2 stop mymua 2>/dev/null || true
  echo "Stopped."
  exit 0
}
trap cleanup SIGINT SIGTERM

cd "$PROJECT_DIR"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

TOKEN=$(grep TUNNEL_TOKEN "$ENV_FILE" | cut -d= -f2-)
if [ -z "$TOKEN" ]; then
  echo "TUNNEL_TOKEN not found in .env"
  exit 1
fi

if ! command -v cloudflared &>/dev/null; then
  echo "cloudflared not installed"
  exit 1
fi

echo "Starting Mymua..."

pm2 delete mymua 2>/dev/null || true
pm2 start ecosystem.config.js
sleep 2

if ! pm2 show mymua | grep -q online; then
  echo "Node server failed to start — check logs/err.log"
  pm2 logs mymua --lines 10 --nostream 2>/dev/null || true
  exit 1
fi

echo "Node server running via PM2"

TUNNEL_TOKEN="$TOKEN" cloudflared tunnel run > "$SCRIPT_DIR/tunnel.log" 2>&1 &
TUNNEL_PID=$!

for i in $(seq 1 10); do
  if curl -s -o /dev/null "http://localhost:3000/login" 2>/dev/null; then
    break
  fi
  sleep 1
done

sleep 3

echo "Mymua is live"
echo "  Server:  http://localhost:3000"
echo "  Tunnel:  https://naina.mymua.in"
echo "  Server auto-restarts on crash (PM2)"
echo "  Press Ctrl+C to stop"

wait
