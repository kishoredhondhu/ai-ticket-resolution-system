# Railway Deployment Fix - Missing libstdc++.so.6

## Problem
The deployment was failing with the error:
```
ImportError: libstdc++.so.6: cannot open shared object file: No such file or directory
```

This error occurs because scipy and scikit-learn require C++ standard libraries that weren't available in the Nixpacks build environment.

## Solution Applied

### 1. Updated `nixpacks.toml`
Added necessary system libraries to the Nix packages:
- `gcc` - GNU Compiler Collection
- `stdenv.cc.cc.lib` - Standard C++ library
- `glibc` - GNU C Library
- `zlib` - Compression library

### 2. Created `start.sh` Script
A startup script that:
- Finds the location of `libstdc++.so.6` in the Nix store
- Sets the `LD_LIBRARY_PATH` environment variable
- Activates the Python virtual environment
- Starts the uvicorn server

### 3. Files Modified

#### `nixpacks.toml`
```toml
[phases.setup]
nixPkgs = [
  "python311", 
  "python311Packages.pip", 
  "python311Packages.virtualenv", 
  "nodejs-18_x",
  "gcc",
  "stdenv.cc.cc.lib",
  "glibc",
  "zlib"
]

[phases.install]
cmds = [
  "python -m venv /opt/venv",
  ". /opt/venv/bin/activate && cd backend && pip install --no-cache-dir -r requirements.txt",
  "cd frontend && npm install"
]

[phases.build]
cmds = [
  "cd frontend && npm run build",
  "chmod +x start.sh"
]

[start]
cmd = "./start.sh"
```

#### `start.sh` (New File)
```bash
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
```

## Deployment Steps

1. **Commit the changes:**
   ```bash
   git add .
   git commit -m "Fix: Add missing C++ libraries for scipy/scikit-learn"
   git push
   ```

2. **Redeploy on Railway:**
   - Railway will automatically detect the changes and rebuild
   - The new build will include the necessary system libraries
   - The startup script will ensure proper library linking

3. **Monitor the deployment:**
   - Check the build logs to ensure all packages are installed
   - Verify that the `libstdc++.so.6` path is found in the deployment logs
   - Test the API endpoints after deployment

## What This Fixes

✅ Resolves the `libstdc++.so.6` missing library error  
✅ Allows scipy and scikit-learn to import properly  
✅ Enables the RAG engine (TF-IDF) to function correctly  
✅ Ensures all backend dependencies work in production  

## Alternative Solutions (If This Doesn't Work)

If you still encounter issues, try these alternatives:

### Option 1: Use Docker Instead of Nixpacks
Create a `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Copy and install Python dependencies
COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy and build frontend
COPY frontend frontend
RUN cd frontend && npm install && npm run build

# Copy backend files
COPY backend backend

# Expose port
EXPOSE 8000

# Start command
CMD cd backend && uvicorn app:app --host 0.0.0.0 --port $PORT
```

### Option 2: Specify Builder in railway.json
Update `railway.json` to explicitly use Docker:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Verification

After deployment, verify the fix by:
1. Checking if the service starts without errors
2. Testing the `/similar-tickets` endpoint
3. Checking that embedding generation works
4. Verifying TF-IDF similarity search functions

## Additional Notes

- The `start.sh` script dynamically finds the library path, making it resilient to Nix store changes
- The `exec` command in start.sh ensures proper signal handling
- The fallback PORT value (8000) is for local testing; Railway will provide the PORT variable
