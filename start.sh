#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR/mymua-link-in-bio-saas"
ENV_FILE="$PROJECT_DIR/.env"
NODE_PID=""
TUNNEL_PID=""

cleanup() {
  echo ""
  echo "Shutting down..."
  [ -n "$TUNNEL_PID" ] && kill "$TUNNEL_PID" 2>/dev/null && wait "$TUNNEL_PID" 2>/dev/null
  [ -n "$NODE_PID" ] && kill "$NODE_PID" 2>/dev/null && wait "$NODE_PID" 2>/dev/null
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

OLD_NODE=$(lsof -ti :3000 2>/dev/null || true)
if [ -n "$OLD_NODE" ]; then
  echo "Killing old server (PID $OLD_NODE)..."
  kill "$OLD_NODE" 2>/dev/null || true
  sleep 1
fi

pkill -f "cloudflared tunnel" 2>/dev/null || true

echo "Starting Mymua..."

node server.js > server.log 2>&1 &
NODE_PID=$!
sleep 2

sleep 1
if ! kill -0 "$NODE_PID" 2>/dev/null; then
  echo "Node server failed to start — check server.log"
  exit 1
fi


echo "Node server running (PID $NODE_PID)"

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
echo "  Logs:    server.log | tunnel.log"
echo "  Press Ctrl+C to stop"

wait
