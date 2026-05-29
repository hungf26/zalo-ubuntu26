#!/bin/bash
# Build Zalo Linux (macOS port)
# Requires: 7z, node/npm, python3-pillow (optional)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DMG_URL="https://res-download-pc.zadn.vn/mac/ZaloSetup-universal-26.5.20.dmg"
DMG_FILE="$SCRIPT_DIR/ZaloSetup-universal-26.5.20.dmg"
EXTRACT_DIR="$SCRIPT_DIR/dmg-extracted"
APP_DIR="$SCRIPT_DIR/zalo-linux"
PATCHES_DIR="$SCRIPT_DIR/patches"

echo "=== Zalo macOS → Linux Port Builder ==="

# Step 1: Download DMG
if [ ! -f "$DMG_FILE" ]; then
    echo "[1/5] Downloading Zalo macOS DMG (~307MB)..."
    curl -L --progress-bar \
        -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" \
        -o "$DMG_FILE" "$DMG_URL"
else
    echo "[1/5] DMG already exists: $(du -sh "$DMG_FILE" | cut -f1)"
fi

# Step 2: Extract DMG
if [ ! -d "$EXTRACT_DIR" ]; then
    echo "[2/5] Extracting DMG..."
    mkdir -p "$EXTRACT_DIR"
    7z x "$DMG_FILE" -o"$EXTRACT_DIR" -y > /dev/null
else
    echo "[2/5] Already extracted."
fi

# Step 3: Copy app files
RESOURCES="$EXTRACT_DIR/Zalo 26.5.20-universal/Zalo.app/Contents/Resources"
echo "[3/5] Copying app.asar and resources..."
mkdir -p "$APP_DIR"
cp "$RESOURCES/app.asar" "$APP_DIR/"
cp -r "$RESOURCES/app.asar.unpacked" "$APP_DIR/"
cp "$RESOURCES/icon.icns" "$APP_DIR/" 2>/dev/null || true

# Step 4: Apply Linux patches
echo "[4/5] Applying Linux patches..."
UNPACKED="$APP_DIR/app.asar.unpacked"

cp "$PATCHES_DIR/native/nativelibs/sqlite3/sqlite3-binding.js" \
   "$UNPACKED/native/nativelibs/sqlite3/sqlite3-binding.js"

cp "$PATCHES_DIR/native/nativelibs/db-cross-v4/dist/binding.js" \
   "$UNPACKED/native/nativelibs/db-cross-v4/dist/binding.js"

cp "$PATCHES_DIR/native/nativelibs/file-utilities/index.js" \
   "$UNPACKED/native/nativelibs/file-utilities/index.js"

cp "$PATCHES_DIR/native/nativelibs/v8-profiles/index.js" \
   "$UNPACKED/native/nativelibs/v8-profiles/index.js"

cp "$PATCHES_DIR/native/nativelibs/zwalker/index.js" \
   "$UNPACKED/native/nativelibs/zwalker/index.js"

# Linux sqlite3 binary
mkdir -p "$UNPACKED/native/nativelibs/sqlite3/binding/napi-v6-linux-x64"
cp "$PATCHES_DIR/native/nativelibs/sqlite3/binding/napi-v6-linux-x64/node_sqlite3.node" \
   "$UNPACKED/native/nativelibs/sqlite3/binding/napi-v6-linux-x64/"

echo "  Patches applied."

# Step 5: Install Electron 22
echo "[5/5] Installing Electron 22..."
cd "$SCRIPT_DIR"
npm install 2>/dev/null

echo ""
echo "=== Build complete ==="
echo "Run: $SCRIPT_DIR/run-zalo.sh"
