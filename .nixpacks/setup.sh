#!/bin/bash
# Setup script to ensure proper library linking

# Find and export the GCC library path
export LD_LIBRARY_PATH=$(find /nix/store -name "libstdc++.so.6" -exec dirname {} \; 2>/dev/null | head -n 1):$LD_LIBRARY_PATH
