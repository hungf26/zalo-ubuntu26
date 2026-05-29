#!/bin/bash
# Zalo Linux - macOS port launcher
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ELECTRON="$SCRIPT_DIR/node_modules/.bin/electron"
APP_DIR="$SCRIPT_DIR/zalo-linux"
LOGFILE="$HOME/.local/share/zalo-macos-port.log"

mkdir -p "$(dirname "$LOGFILE")"

if [ ! -f "$ELECTRON" ]; then
    echo "ERROR: Electron not found. Run: cd \"$SCRIPT_DIR\" && npm install"
    exit 1
fi

# Vietnamese input support
export XMODIFIERS="${XMODIFIERS:-@im=ibus}"
export GTK_IM_MODULE="${GTK_IM_MODULE:-ibus}"
export QT_IM_MODULE="${QT_IM_MODULE:-ibus}"
export ELECTRON_DISABLE_SECURITY_WARNINGS=1
export NODE_OPTIONS="--no-deprecation"

exec "$ELECTRON" \
    --no-sandbox \
    --disable-dev-shm-usage \
    --disable-features=NetworkServiceSandbox,RendererCodeIntegrity \
    --disable-gpu \
    --disable-software-rasterizer \
    --disable-gpu-sandbox \
    --in-process-gpu \
    --user-data-dir="$HOME/.config/ZaloData" \
    "$APP_DIR" \
    "$@" 2>>"$LOGFILE"
