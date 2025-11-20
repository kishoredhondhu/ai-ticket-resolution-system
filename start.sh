#!/bin/bash
set -e

# Find and set the library path for libstdc++
GCC_LIB_PATH=$(find /nix/store -name "libstdc++.so.6" 2>/dev/null | head -1 | xargs dirname)
if [ -n "$GCC_LIB_PATH" ]; then
    export LD_LIBRARY_PATH="$GCC_LIB_PATH:$LD_LIBRARY_PATH"
    echo "Set LD_LIBRARY_PATH to include: $GCC_LIB_PATH"
fi

# Activate virtual environment
. /opt/venv/bin/activate

# Change to backend directory and start uvicorn
cd backend
exec uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}
