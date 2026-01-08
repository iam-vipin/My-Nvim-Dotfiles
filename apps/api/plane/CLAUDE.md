# Plane Django Project

Root Django project containing all backend modules.

## Project Structure

```
plane/
├── api/                    # External REST API (third-party integrations)
├── app/                    # Internal REST API (web interface)
├── graphql/                # GraphQL API (mobile app)
├── space/                  # Public space API (shared workspaces)
├── db/                     # Database models, migrations, signals
├── authentication/         # OAuth, SSO, JWT, session management
├── bgtasks/                # Celery background tasks
├── utils/                  # Shared utilities
├── agents/                 # AI agent orchestration
├── analytics/              # Analytics infrastructure
├── automations/            # Workflow automation engine
├── event_stream/           # Real-time event processing
├── silo/                   # External integrations
├── marketplace/            # Integration marketplace
├── ee/                     # Enterprise features
├── license/                # License management
├── payment/                # Subscription/billing
├── middleware/             # Request processing middleware
├── settings/               # Django configuration
├── throttles/              # Rate limiting
├── celery.py               # Celery configuration
├── urls.py                 # Root URL configuration
├── wsgi.py                 # WSGI entry point
└── asgi.py                 # ASGI entry point
```

## API Layers

| Module     | Consumer    | Purpose                  |
| ---------- | ----------- | ------------------------ |
| `api/`     | Third-party | External/public REST API |
| `app/`     | Web app     | Internal REST API        |
| `graphql/` | Mobile app  | GraphQL endpoint         |
| `space/`   | Public      | Public workspace viewing |

## Core Modules

| Module            | Purpose                             |
| ----------------- | ----------------------------------- |
| `db/`             | Models, migrations, mixins, signals |
| `authentication/` | Auth (OAuth, SSO, JWT, LDAP)        |
| `bgtasks/`        | Celery tasks (40+ task files)       |
| `utils/`          | Shared utilities (34+ modules)      |

## Feature Modules

| Module          | Purpose                          |
| --------------- | -------------------------------- |
| `agents/`       | AI agent execution               |
| `automations/`  | Workflow automation              |
| `event_stream/` | Event streaming (outbox pattern) |
| `silo/`         | External integrations            |
| `marketplace/`  | Integration marketplace          |

## Enterprise Modules

| Module     | Purpose                          |
| ---------- | -------------------------------- |
| `ee/`      | Enterprise features (23+ models) |
| `license/` | Instance/license management      |
| `payment/` | Subscriptions and billing        |

## Configuration

| Module        | Purpose                                 |
| ------------- | --------------------------------------- |
| `settings/`   | Django settings by environment          |
| `middleware/` | DB routing, logging, request validation |
| `throttles/`  | API rate limiting                       |

## Entry Points

- **WSGI**: `plane.wsgi:application` (gunicorn)
- **ASGI**: `plane.asgi:application` (uvicorn)
- **Celery**: `plane.celery:app`

## URL Configuration

Root `urls.py` includes:

```python
/api/v1/          # app/ - Internal API
/api/v1/external/ # api/ - External API
/graphql/         # graphql/ - GraphQL
/spaces/          # space/ - Public API
```

## Settings

Set via `DJANGO_SETTINGS_MODULE`:

- `plane.settings.local` - Development
- `plane.settings.production` - Production
- `plane.settings.test` - Testing

## Soft Deletion

Plane uses **soft deletion** instead of hard deletion for all core models. Records are never physically removed from the database; instead, they are marked as deleted using a `deleted_at` timestamp field.

### How It Works

All models inherit from `BaseModel` → `AuditModel` → `SoftDeleteModel` (defined in `db/mixins.py`):

```python
class SoftDeleteModel(models.Model):
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = SoftDeletionManager()      # Excludes deleted records
    all_objects = models.Manager()       # Includes all records

    def delete(self, soft=True):
        if soft:
            self.deleted_at = timezone.now()
            self.save()
            # Related objects are soft-deleted via Celery task
        else:
            super().delete()  # Hard delete
```

### Managers

| Manager             | Behavior                                                                   |
| ------------------- | -------------------------------------------------------------------------- |
| `Model.objects`     | Default - automatically filters out records where `deleted_at IS NOT NULL` |
| `Model.all_objects` | Unfiltered - returns all records including soft-deleted ones               |

### Usage Examples

```python
# Soft delete (default) - sets deleted_at timestamp
issue.delete()
issue.delete(soft=True)

# Hard delete - permanently removes from database
issue.delete(soft=False)

# Query only active records (default behavior)
Issue.objects.filter(project_id=project_id)

# Query including soft-deleted records
Issue.all_objects.filter(project_id=project_id)

# Query only soft-deleted records
Issue.all_objects.filter(deleted_at__isnull=False)

# Bulk soft delete
Issue.objects.filter(project_id=project_id).delete()  # soft=True by default

# Bulk hard delete
Issue.objects.filter(project_id=project_id).delete(soft=False)
```

### Important Considerations

1. **Default queries**: Always use `Model.objects` unless you explicitly need deleted records
2. **Cascading deletes**: When a parent is soft-deleted, related objects are soft-deleted asynchronously via Celery (`soft_delete_related_objects` task in `bgtasks/deletion_task.py`)
3. **Unique constraints**: Soft-deleted records still exist in the database - be careful with unique constraints that might conflict with deleted records
4. **Restoration**: To restore a soft-deleted record, set `deleted_at = None` and save
5. **Foreign keys**: Queries with joins will automatically respect soft deletion when using `Model.objects`

### Audit Fields

All models via `AuditModel` also include:

- `created_at` - Auto-set on creation
- `updated_at` - Auto-updated on save
- `created_by` - User who created the record
- `updated_by` - User who last modified the record

See individual module CLAUDE.md files for detailed documentation.
