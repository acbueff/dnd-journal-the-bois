#!/usr/bin/env bash
# Serve the Bois journal on port 8080 (or the port given as $1).
cd "$(dirname "$0")"
PORT="${1:-8080}"
echo "Journal running at http://localhost:$PORT  (Ctrl+C to stop)"
python3 -m http.server "$PORT" --bind 0.0.0.0
