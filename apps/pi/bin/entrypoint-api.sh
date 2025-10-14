#!/bin/bash
set -e

echo "Starting Plane PI API server..."

# Set default values if not provided
export FASTAPI_APP_HOST=${FASTAPI_APP_HOST:-0.0.0.0}
export FASTAPI_APP_PORT=${FASTAPI_APP_PORT:-8000}

echo "API Host: $FASTAPI_APP_HOST"
echo "API Port: $FASTAPI_APP_PORT"

# Start the FastAPI application
python -m pi.manage wait-for-db
python -m pi.manage runserver