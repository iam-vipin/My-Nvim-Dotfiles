# License Module

Instance and workspace license management.

## Purpose

Manages licensing for SaaS and self-hosted deployments including instance configuration and edition tracking.

## Directory Structure

```
license/
├── models/
│   ├── instance.py              # Instance, InstanceAdmin
│   └── configuration.py         # InstanceConfiguration
├── api/                         # License API endpoints
├── bgtasks/                     # License background tasks
├── management/                  # Management commands
├── utils/                       # License utilities
│   ├── encryption.py            # Encryption utilities
│   └── instance_value.py        # Instance value helpers
├── urls.py                      # API routing
├── apps.py                      # Django app config
└── migrations/                  # Database migrations
```

## Models

### Instance

Instance metadata and configuration.

**Key Fields**:

- `instance_id`: Unique instance identifier
- `instance_name`: Human-readable name
- `edition`: Community, Commercial, Cloud
- `is_setup_done`: Setup completion flag
- `is_verified`: Verification status
- `is_support_required`: Support flag
- `is_telemetry_enabled`: Telemetry opt-in

**Lifecycle States**:

- Setup pending
- Verified
- Deprecated

### InstanceAdmin

Admin user associations for the instance.

### InstanceConfiguration

Key-value configuration storage.

**Features**:

- Encrypted value support
- Category grouping
- Type validation

## Editions

| Edition    | Description            |
| ---------- | ---------------------- |
| Community  | Open source edition    |
| Commercial | Self-hosted enterprise |
| Cloud      | SaaS cloud deployment  |

## Key Features

### Instance Lifecycle

- Initial setup tracking
- Verification process
- Deprecation handling

### Configuration Management

- Key-value storage
- Encryption for sensitive values
- Category-based organization

### Telemetry

- Optional telemetry
- Support flag management

## Utilities

### encryption.py

Encryption/decryption for sensitive configuration values.

### instance_value.py

Helper functions for retrieving instance configuration values.

## API Endpoints

License API for:

- Instance registration
- Configuration updates
- License validation
- Admin management
