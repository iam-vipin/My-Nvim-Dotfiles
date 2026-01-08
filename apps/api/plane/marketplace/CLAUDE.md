# Marketplace Module

Integration and template marketplace system.

## Purpose

Manages integrations and templates in a marketplace format for discovery and installation.

## Directory Structure

```
marketplace/
├── views/
│   ├── application.py           # Integration app management
│   └── template.py              # Template management
├── serializers/                 # Data serialization
├── models.py                    # Marketplace models
├── admin.py                     # Django admin interface
├── urls.py                      # API routing
├── apps.py                      # Django app config
└── migrations/                  # Database migrations
```

## Features

### Integration Applications

- Browse available integrations
- Application lifecycle management
- Installation tracking per workspace

### Templates

- Pre-built project templates
- Template discovery and browsing
- Template application to workspaces

## Views

### ApplicationView (`views/application.py`)

- List available applications
- Application details
- Installation management

### TemplateView (`views/template.py`)

- List available templates
- Template details
- Template usage

## Integration

- Works with `plane.authentication.models.oauth` for OAuth applications
- Connects to workspace installation tracking
- Admin interface for marketplace management
