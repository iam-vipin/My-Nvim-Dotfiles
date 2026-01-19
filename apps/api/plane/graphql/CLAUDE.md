# GraphQL Module

GraphQL API endpoint for the Plane mobile application.

## Purpose

Modern GraphQL API built with Strawberry framework, providing type-safe queries and mutations for mobile clients.

## Directory Structure

```
graphql/
├── schema.py                    # Root Query + Mutation types
├── views.py                     # AsyncGraphQLView with JWT auth
├── urls.py                      # GraphQL endpoint routing
├── context.py                   # GraphQL context configuration
├── types/                       # Type definitions (34 subdirectories)
│   ├── issues/                  # Issue/WorkItem types
│   ├── workspace/               # Workspace types
│   ├── project/                 # Project types
│   ├── cycle/                   # Cycle types
│   ├── module/                  # Module types
│   ├── page/                    # Page types
│   ├── epics/                   # Epic types
│   └── ...
├── queries/                     # Query resolvers (14 subdirectories)
│   ├── workspace/               # Workspace queries
│   ├── issues/                  # Issue queries
│   ├── project/                 # Project queries
│   └── ...
├── mutations/                   # Mutation resolvers (12 subdirectories)
│   ├── workspace/               # Workspace mutations
│   ├── issues/                  # Issue mutations
│   ├── project/                 # Project mutations
│   └── ...
├── helpers/                     # Business logic helpers (10 subdirectories)
├── permissions/                 # Authorization classes
│   ├── project.py               # Project-level permissions
│   ├── workspace.py             # Workspace-level permissions
│   └── public.py                # Public permissions
├── utils/                       # Utilities (17 files)
│   ├── error_codes.py           # Error definitions
│   ├── feature_flag.py          # Feature flag utilities
│   ├── work_item_filters.py     # Filtering logic
│   └── ...
└── bgtasks/                     # Background tasks
    └── push_notifications/      # Push notification tasks
```

## Authentication

- JWT-based authentication
- Public operations whitelist: VersionCheckQuery, InstanceQuery, PublicWorkspaceInviteMutation

## Schema Overview

**Queries** (30+ types):

- Instance, FeatureFlag, VersionCheck
- User, Profile, UserFavorites
- Workspace, WorkspaceMembers, WorkspaceFeatures
- Project, ProjectMembers, ProjectFeatures
- Issues, IssueLinks, IssueAttachments, SubIssues
- Cycles, Modules, Pages, Epics, Intake
- Notifications, GlobalSearch

**Mutations** (27+ types):

- Device, Asset management
- User, Profile operations
- Workspace, Project management
- Issue CRUD, comments, attachments
- Cycle, Module operations
- Page, Epic operations
- Intake management

## Key Features

- Async/await architecture for non-blocking operations
- Feature flagging for enterprise features
- Strawberry-Django integration with Django ORM
- Comprehensive pagination and filtering
- Real-time notification support

## Code Statistics

- Total: ~33,000 lines
- Queries: ~7,178 lines
- 34+ type definition directories
