#!/bin/bash
set -e

# Activate virtual environment
. /opt/venv/bin/activate

# Change to backend directory and start uvicorn
cd backend
exec uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000}
