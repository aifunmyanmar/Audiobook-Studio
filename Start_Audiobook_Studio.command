#!/bin/bash

# Change directory to script folder
cd "$(dirname "$0")"

echo "=========================================================="
echo "    🎧 Starting Audiobook Studio Pro (Port: 1104) 🎧     "
echo "=========================================================="

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed or not in PATH."
    echo "Please install Node.js from https://nodejs.org/"
    read -p "Press any key to exit..."
    exit 1
fi

# Auto-install dependencies if not present
if [ ! -d "node_modules" ]; then
    echo "📦 First-time run detected: Installing dependencies (npm install)..."
    npm install
fi

# Ensure 8GB memory ceiling for heavy video rendering
export NODE_OPTIONS="--max-old-space-size=8192"

# Open browser automatically after 3 seconds
(sleep 3 && open "http://localhost:1104") &

echo "🚀 Starting Vite Server on http://localhost:1104 ..."
npm run dev
