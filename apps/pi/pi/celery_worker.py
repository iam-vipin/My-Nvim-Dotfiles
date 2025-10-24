#!/usr/bin/env python3
"""
Celery worker startup script for Plane Intelligence.
"""

import os
import sys

# Add the project root to Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

from pi.celery_app import celery_app

if __name__ == "__main__":
    # Start Celery worker
    celery_app.start()
