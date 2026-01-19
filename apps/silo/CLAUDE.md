# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Silo is Plane's integrations engine - a Node.js/TypeScript service that handles external integrations, data imports, and real-time sync between Plane and external tools like Jira, GitHub, Linear, Slack, and others.

## Architecture

### Service Components

Silo runs three distinct service types that can be started independently:

- **API Server** (`api`): REST endpoints for integration configuration and webhooks
- **Import Tasks** (`imports`): Queue-based background workers for data migration/imports
- **Integration Tasks** (`integrations`): Real-time event processing and sync workers

### Directory Structure

```
src/
├── apps/                    # Integration-specific modules
│   ├── jira-importer/      # Jira Cloud/Server import logic
│   ├── linear-importer/    # Linear import logic
│   ├── github/            # GitHub integration and webhooks
│   ├── gitlab/            # GitLab integration
│   ├── slack/             # Slack integration and bot
│   ├── sentry/            # Sentry integration
│   ├── asana-importer/    # Asana import logic
│   ├── notion-importer/   # Notion/Confluence import logic
│   ├── flatfile/          # CSV import via Flatfile
│   └── engine/            # Core engine controllers
├── etl/                   # Extract-Transform-Load framework
├── services/              # Shared services (OAuth, API clients)
├── worker/               # Queue infrastructure (RabbitMQ/Redis)
├── lib/                  # Common utilities and parsers
├── db/                   # Database connection and queries
└── helpers/              # Utility functions
```

### Key Architectural Patterns

- **Module Isolation**: Each integration lives in its own `apps/` directory with controllers, helpers, migrators, and workers
- **ETL Framework**: Common import pipeline in `etl/` for transforming external data to Plane entities
- **Queue-Based Processing**: Uses RabbitMQ for background tasks and Celery for Plane API communication
- **OAuth Strategy Pattern**: Pluggable OAuth providers in `services/oauth/strategies/`

## Common Commands

### Development

```bash
# Start all services (API + workers)
pnpm dev

# Start specific service type
node dist/start.mjs api          # API server only
node dist/start.mjs imports      # Import workers only
node dist/start.mjs integrations # Integration workers only

# Build for production
pnpm build

# Run tests
pnpm test                        # All tests
pnpm test -- --testPathPattern=parser # Specific test files
```

### Code Quality

```bash
pnpm check:types                 # TypeScript type checking
pnpm check:lint                  # ESLint (max 2553 warnings)
pnpm check:format                # Prettier format check
pnpm fix:lint                    # Auto-fix lint issues
pnpm fix:format                  # Auto-format with Prettier
```

## Environment Configuration

Key environment variables in `src/env.ts`:

- **Database**: `DATABASE_URL`, `PG_SCHEMA`
- **Message Queue**: `AMQP_URL`, `REDIS_URL`
- **External APIs**: `API_BASE_URL`, `API_INTERNAL_BASE_URL`
- **Integration Keys**: `GITHUB_CLIENT_ID`, `JIRA_CLIENT_ID`, `SLACK_CLIENT_SECRET`, etc.
- **AWS S3**: `AWS_S3_BUCKET_NAME`, `AWS_ACCESS_KEY_ID`

## Integration Development

### Adding New OAuth Provider

1. Create strategy in `src/services/oauth/strategies/new-provider.strategy.ts`
2. Implement `OAuthStrategy` interface with required methods
3. Register in `src/services/oauth/index.ts` with environment variable checks
4. Add provider-specific environment variables to `src/env.ts`

### Adding New Importer

1. Create app directory: `src/apps/new-importer/`
2. Implement modules:
   - `controllers/` - API endpoints
   - `migrator/` - Data transformation logic
   - `helpers/` - Utility functions
   - `workers/` - Background processing (if needed)
3. Register controller in `src/server.ts`
4. Extend ETL migrators in `src/etl/migrator/` for common entities

### Worker Development

- Import workers extend `BaseImportWorker` from `src/etl/base-import-worker.ts`
- Integration workers use queue infrastructure from `src/worker/base/`
- All workers support graceful shutdown and error handling

## Testing

- Uses Jest with TypeScript support
- Test files: `*.test.ts` alongside source files
- Path mapping: `@/*` resolves to `src/*`
- Example test locations:
  - `src/helpers/parser.test.ts` - Content parsing utilities
  - `src/apps/slack/helpers/content-parser/parser.test.ts` - Slack-specific parsing

## Build System

- **Bundler**: tsdown (faster alternative to tsc)
- **Output**: ESM format in `dist/` directory
- **Entry Point**: `src/start.ts`
- **External Dependencies**: Some packages like `jira.js` and `bluebird` are marked as noExternal
- **Development**: nodemon with tsdown watch mode

## @plane/etl Package Dependency

Silo heavily depends on the `@plane/etl` workspace package, which provides provider-specific ETL (Extract-Transform-Load) utilities and services for all integrations.

### ETL Package Structure

The package is organized by provider with modular exports:

```
@plane/etl/
├── core/          # Common types, constants, services (E_JOB_STATUS, FeatureFlagService)
├── asana/         # Asana API services and transformers
├── clickup/       # ClickUp API services and transformers
├── flatfile/      # Flatfile CSV import services
├── github/        # GitHub API services, auth, webhook types
├── gitlab/        # GitLab API services, auth, webhook types
├── jira/          # Jira Cloud API services and transformers
├── jira-server/   # Jira Server/Data Center API services
├── linear/        # Linear API services and transformers
├── sentry/        # Sentry API services, auth, webhook types
└── slack/         # Slack API services and types
```

### Key ETL Exports Used in Silo

- **Core Enums**: `E_JOB_STATUS`, `E_IMPORTER_KEYS`, `E_INTEGRATION_ENTITY_CONNECTION_MAP`, `E_SILO_ERROR_CODES`
- **Type Definitions**: `PlaneEntities`, `TIssuePropertyValuesPayload`, provider-specific entity types
- **API Services**: Provider-specific service builders (`createJiraService`, `createLinearService`, etc.)
- **Authentication**: OAuth service builders (`createGithubAuth`, `createLinearAuthService`)
- **ETL Functions**: Transform utilities (`transformIssue`, `transformUser`, `transformComment`)
- **Data Pulling**: Provider data fetchers (`pullUsers`, `pullIssuesV2`, `pullDocuments`)

### ETL Usage Patterns

```typescript
// Import provider-specific services and types
import { createJiraService, JiraService } from "@plane/etl/jira";
import type { JiraConfig, JiraEntity } from "@plane/etl/jira";

// Import core constants and types
import { E_JOB_STATUS, E_IMPORTER_KEYS } from "@plane/etl/core";
import type { PlaneEntities } from "@plane/etl/core";

// Import transformation utilities
import { transformIssue } from "@plane/etl/linear";
```

### Development Notes

- ETL package uses tsdown for building with minification
- Provides consistent API interfaces across all integrations
- Handles provider-specific authentication and rate limiting
- Contains shared transformation logic for converting external entities to Plane format

## Key Libraries

- **Express** - Web framework with Winston logging
- **Queue Processing** - amqplib (RabbitMQ), redis, pg (PostgreSQL)
- **OAuth/HTTP** - axios, various provider SDKs
- **Content Processing** - marked (Markdown), turndown (HTML to Markdown), node-html-parser
- **Validation** - zod (environment variables), reflect-metadata (decorators)
- **ETL Framework** - `@plane/etl` workspace package for integration-specific services and transformers

## Performance Considerations

- Batch processing with configurable `BATCH_SIZE` (default 50)
- Redis caching for frequently accessed data
- Database connection pooling via `postgres` library
- Message queue prefetch limits via `MQ_PREFETCH_COUNT`
