# Database Module

Core data layer with Django ORM models.

## Purpose

Defines all database models, migrations, mixins, and signals for Plane.

## Directory Structure

```
db/
├── models/
│   ├── base.py                  # BaseModel (UUID PK, audit fields)
│   ├── user.py                  # User, Profile, Account
│   ├── workspace.py             # Workspace, WorkspaceMember, Team
│   ├── project.py               # Project, ProjectMember
│   ├── issue.py                 # Issue and related models (32KB)
│   ├── cycle.py                 # Cycle, CycleIssue
│   ├── module.py                # Module, ModuleIssue
│   ├── page.py                  # Page, PageVersion
│   ├── state.py                 # State, StateGroup enum
│   ├── label.py                 # Label
│   ├── notification.py          # Notification, preferences
│   ├── asset.py                 # FileAsset (40+ entity types)
│   ├── webhook.py               # Webhook, WebhookLog
│   ├── api.py                   # APIToken, APIActivityLog
│   └── ...
├── migrations/                  # 112+ migration files
├── management/commands/         # 20+ management commands
├── backfills/                   # Data backfill utilities
├── mixins.py                    # Model mixins
└── signals.py                   # Django signals
```

## Core Mixins

| Mixin                | Fields/Features                                 |
| -------------------- | ----------------------------------------------- |
| `TimeAuditModel`     | `created_at`, `updated_at`                      |
| `UserAuditModel`     | `created_by`, `updated_by`                      |
| `SoftDeleteModel`    | `deleted_at`, soft deletion support             |
| `AuditModel`         | Combines all above                              |
| `ChangeTrackerMixin` | `changed_fields`, `old_values`, `has_changed()` |

## Key Models

**User & Auth**: User, Profile, Account (OAuth)

**Workspace**: Workspace, WorkspaceMember, WorkspaceMemberInvite, Team

**Project**: Project, ProjectMember, ProjectIdentifier

**Issues** (issue.py - largest file):

- Issue, IssueSequence, IssueAssignee, IssueLabel
- IssueComment, IssueActivity, IssueAttachment
- IssueLink, IssueRelation, IssueSubscriber
- IssueVersion, IssueDescriptionVersion

**Cycles**: Cycle, CycleIssue, CycleUserProperties

**Modules**: Module, ModuleIssue, ModuleMember

**Pages**: Page, PageLabel, PageLog, PageVersion

**States**: State with StateGroup enum (Backlog, Todo, In Progress, Done, Cancelled, Triage)

## Soft Deletion

- All models inherit soft delete via `BaseModel`
- `objects` manager: excludes deleted records
- `all_objects` manager: includes deleted records
- `delete(soft=True)` for soft deletion

## Custom Signals

- `post_bulk_create`: After bulk_create operations
- `post_bulk_update`: After bulk_update operations

## Management Commands

| Command                   | Purpose                         |
| ------------------------- | ------------------------------- |
| `wait_for_migrations`     | Wait for migrations to complete |
| `fix_duplicate_sequences` | Fix duplicate sequence IDs      |
| `clear_cache`             | Clear cache                     |
| `create_instance_admin`   | Create admin user               |
| `faker`                   | Generate test data              |
| `activate_user`           | Activate user account           |
