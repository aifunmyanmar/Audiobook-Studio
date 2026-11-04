#!/bin/bash

# Change directory to script folder
cd "$(dirname "$0")"

echo "=========================================================="
echo "    🛑 Stopping Audiobook Studio Pro (Port: 1104) 🛑     "
echo "=========================================================="

PID=$(lsof -ti :1104 2>/dev/null)

if [ -n "$PID" ]; then
    echo "Stopping process (PID: $PID) listening on port 1104..."
    kill -9 $PID 2>/dev/null
    echo "✅ Audiobook Studio stopped successfully."
else
    echo "ℹ️ No active process found running on port 1104."
fi

sleep 1
