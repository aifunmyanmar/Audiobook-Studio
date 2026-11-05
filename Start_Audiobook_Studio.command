#!/bin/bash
cd "$(dirname "$0")"

echo "=========================================================="
echo "    🎧 Starting Audiobook Studio Pro (Port: 1104) 🎧     "
echo "=========================================================="
echo ""

mkdir -p bin

# 1. Check Node.js
if ! command -v node &> /dev/null; then
    echo "[CHECK 1/4] ⚠️ Node.js is missing. Checking Homebrew..."
    if command -v brew &> /dev/null; then
        echo "[INFO] Installing Node.js via Homebrew..."
        brew install node
    else
        echo "❌ Node.js is not installed."
        echo "Opening https://nodejs.org in your browser..."
        open "https://nodejs.org/"
        read -p "Press Enter after installing Node.js to continue..."
    fi
fi
echo "[CHECK 1/4] ✅ Node.js is ready: $(node -v)"

# 2. Check Node packages (Remotion, React, Vite)
if [ ! -d "node_modules" ]; then
    echo "[CHECK 2/4] 📦 First-time run: Installing Remotion and dependencies (npm install)..."
    npm install
else
    echo "[CHECK 2/4] ✅ Remotion & Node packages are ready."
fi

# 3. Check FFmpeg
if command -v ffmpeg &> /dev/null || [ -f "bin/ffmpeg" ]; then
    echo "[CHECK 3/4] ✅ FFmpeg is ready."
else
    echo "[CHECK 3/4] ⚡ FFmpeg missing. Attempting Homebrew install..."
    if command -v brew &> /dev/null; then
        brew install ffmpeg
    else
        echo "⚠️ Please install ffmpeg via: brew install ffmpeg"
    fi
fi

# 4. Check yt-dlp
if command -v yt-dlp &> /dev/null || [ -f "bin/yt-dlp" ]; then
    echo "[CHECK 4/4] ✅ yt-dlp is ready."
else
    echo "[CHECK 4/4] ⚡ yt-dlp missing. Auto-downloading standalone binary into bin/yt-dlp..."
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o bin/yt-dlp && chmod +x bin/yt-dlp
    if [ -f "bin/yt-dlp" ]; then
        echo "[CHECK 4/4] ✅ yt-dlp downloaded and ready in bin/yt-dlp"
    fi
fi

# 5. Launch Remotion & Vite Server
export NODE_OPTIONS="--max-old-space-size=8192"
echo ""
echo "🚀 Starting Vite Server on http://localhost:1104 ..."
(sleep 3 && open "http://localhost:1104") &
npm run dev
