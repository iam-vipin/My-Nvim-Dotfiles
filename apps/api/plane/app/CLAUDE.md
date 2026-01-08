# App Module

Internal REST API layer for the Plane web interface.

## Purpose

Core REST API backend powering the Plane web application. Provides endpoints for all user-facing features.

## Directory Structure

```
app/
├── authentication/              # Authentication backends
├── middleware/                  # API middleware
├── permissions/                 # Permission classes & decorators
│   ├── base.py                  # @allow_permission decorator, ROLE enum
│   ├── workspace.py             # Workspace-level permissions
│   ├── project.py               # Project-level permissions
│   └── page.py                  # Page-level permissions
├── serializers/                 # DRF serializers (24 files)
│   ├── base.py                  # BaseSerializer, DynamicBaseSerializer
│   ├── issue.py                 # Issue serializers (1294 lines)
│   ├── workspace.py             # Workspace serializers
│   └── ...
├── views/                       # API views (29 directories)
│   ├── analytic/                # Analytics endpoints
│   ├── asset/                   # File asset management
│   ├── cycle/                   # Sprint/cycle management
│   ├── issue/                   # Issue management (base, comments, attachments)
│   ├── module/                  # Module management
│   ├── notification/            # Notifications
│   ├── page/                    # Documentation pages
│   ├── project/                 # Project management
│   ├── workspace/               # Workspace operations
│   └── ...
└── urls/                        # URL routing (17 modules)
```

## Permission System

**Roles** (ROLE enum):

- `ADMIN`: 20
- `MEMBER`: 15
- `GUEST`: 5

**Decorator Usage**:

```python
@allow_permission(allowed_roles=[ROLE.ADMIN, ROLE.MEMBER], level="PROJECT")
def my_view(request):
    ...
```

## Key Endpoints

| Feature    | Endpoint Pattern                            |
| ---------- | ------------------------------------------- |
| Workspaces | `/workspaces/`, `/workspaces/<slug>/`       |
| Projects   | `/workspaces/<slug>/projects/`              |
| Issues     | `/workspaces/<slug>/projects/<id>/issues/`  |
| Cycles     | `/workspaces/<slug>/projects/<id>/cycles/`  |
| Modules    | `/workspaces/<slug>/projects/<id>/modules/` |
| Pages      | `/workspaces/<slug>/projects/<id>/pages/`   |
| Views      | `/workspaces/<slug>/projects/<id>/views/`   |
| Search     | `/workspaces/<slug>/search/`                |
| Analytics  | `/workspaces/<slug>/analytics/`             |

## Base Classes

- `BaseViewSet`: ModelViewSet with pagination, filtering, timezone support
- `BaseAPIView`: Custom endpoints, exception handling
- `DynamicBaseSerializer`: Field filtering and nested expansion

## Key Features

- Session and API key authentication
- Dynamic field selection (`?fields=`, `?expand=`)
- Timezone-aware operations
- Read replica support
- Comprehensive audit logging
