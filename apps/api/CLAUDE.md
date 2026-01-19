# API Application

Django REST API backend for Plane.

## Overview

Python/Django application providing REST API, GraphQL, and background task processing for the Plane platform.

## Directory Structure

```
api/
├── plane/                       # Django project root
├── bin/                         # Shell scripts
├── requirements/                # Python dependencies
├── templates/                   # Email/HTML templates
├── manage.py                    # Django management script
├── Dockerfile.api               # Production Dockerfile
├── Dockerfile.dev               # Development Dockerfile
├── pyproject.toml               # Python project config
├── pytest.ini                   # Pytest configuration
└── run_tests.py                 # Test runner script
```

## Tech Stack

- **Framework**: Django 4.x + Django REST Framework
- **Database**: PostgreSQL 14+
- **Cache**: Redis 6.2.7+
- **Queue**: Celery + RabbitMQ
- **GraphQL**: Strawberry

## Development Commands

```bash
# Run development server
python manage.py runserver

# Run migrations
python manage.py migrate

# Create migrations
python manage.py makemigrations

# Run tests
pytest

# Run specific test
pytest plane/tests/test_module.py

# Celery worker
celery -A plane worker -l info

# Celery beat (scheduler)
celery -A plane beat -l info
```

## Environment Configuration

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `SECRET_KEY` - Django secret key
- `AWS_S3_*` - S3/MinIO storage settings

## Requirements

Dependencies split by environment in `requirements/`:

- `base.txt` - Core dependencies
- `local.txt` - Development dependencies
- `production.txt` - Production dependencies
- `test.txt` - Testing dependencies

## Docker

```bash
# Build API image
docker build -f Dockerfile.api -t plane-api .

# Development with hot reload
docker build -f Dockerfile.dev -t plane-api-dev .
```

## Testing

```bash
# Run all tests
pytest

# With coverage
pytest --cov=plane

# Specific module
pytest plane/app/tests/
```

See `plane/CLAUDE.md` for Django project structure details.
