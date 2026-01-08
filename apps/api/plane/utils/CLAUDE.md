# Utils Module

Shared utility library for the Plane application.

## Purpose

Core utility functions and classes used across all Plane modules.

## Directory Structure

```
utils/
├── filters/                     # Filtering utilities
│   ├── base.py                  # FilterSet, FilterBackend
│   └── converters.py            # Filter converters
├── permissions/                 # Permission utilities
│   ├── workspace.py             # Workspace permissions
│   ├── project.py               # Project permissions
│   └── page.py                  # Page permissions
├── notifications/               # Notification utilities
├── exporters/                   # Data export utilities
├── importers/                   # Data import utilities
├── porters/                     # Import/export handlers
├── integrations/                # Integration utilities
├── core/                        # Core utilities
├── openapi/                     # OpenAPI/Swagger utilities
├── instance_config_variables/   # Instance configuration
├── timezone/                    # Timezone utilities
├── paginator.py                 # Cursor-based pagination
├── global_paginator.py          # Global pagination
├── issue_filters.py             # Issue filtering logic
├── grouper.py                   # Grouping utilities
├── cycle_transfer_issues.py     # Issue transfer logic
├── analytics_events.py          # Analytics event tracking
├── analytics_plot.py            # Analytics plotting
├── build_chart.py               # Chart building
├── content_validator.py         # Content validation
├── email_validator.py           # Email validation
├── path_validator.py            # Path validation
├── encryption.py                # Encryption utilities
├── color.py                     # Color utilities
├── date_utils.py                # Date utilities
├── url.py                       # URL utilities
├── host.py                      # Host utilities
├── html_processor.py            # HTML processing
├── markdown.py                  # Markdown utilities
├── error_codes.py               # Error code definitions
├── exception_logger.py          # Exception logging
├── helpers.py                   # General helpers
├── logging.py                   # Logging utilities
├── constants.py                 # Constants
├── uuid.py                      # UUID utilities
├── ip_address.py                # IP address utilities
├── telemetry.py                 # Telemetry
├── order_queryset.py            # QuerySet ordering
├── issue_search.py              # Issue search
├── issue_relation_mapper.py     # Issue relation mapping
└── imports.py                   # Import utilities
```

## Key Components

### Pagination (`paginator.py`)

```python
class BasePaginator:
    # Cursor-based pagination with CursorResult
    def paginate(self, queryset, cursor=None, per_page=100):
        ...
```

### Filtering (`filters/`)

- FilterSet for defining filters
- FilterBackend for DRF integration
- Extended variants for complex filtering

### Permissions (`permissions/`)

- Workspace-level permission checks
- Project-level permission checks
- Page-level permission checks

### Validators

- `content_validator.py`: Content validation
- `email_validator.py`: Email format validation
- `path_validator.py`: File path validation

### Data Processing

- `issue_filters.py`: Complex issue filtering
- `grouper.py`: Data grouping utilities
- `cycle_transfer_issues.py`: Transfer issues between cycles

### Analytics

- `analytics_events.py`: Event tracking
- `analytics_plot.py`: Data visualization
- `build_chart.py`: Chart generation

### Exception Handling

```python
from plane.utils.exception_logger import log_exception

try:
    # code
except Exception as e:
    log_exception(e)
```

## Usage Pattern

```python
from plane.utils.paginator import BasePaginator
from plane.utils.issue_filters import issue_filters
from plane.utils.exception_logger import log_exception
```
