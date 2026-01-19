# Apps Directory

Monorepo applications for the Plane platform.

## Applications

| App         | Language           | Purpose                        |
| ----------- | ------------------ | ------------------------------ |
| `web/`      | TypeScript/React   | Main web application           |
| `admin/`    | TypeScript/React   | Admin panel UI                 |
| `space/`    | TypeScript/React   | Public workspace sharing       |
| `api/`      | Python/Django      | REST API backend               |
| `live/`     | TypeScript/Node.js | Real-time collaboration server |
| `silo/`     | TypeScript/Node.js | Integrations engine            |
| `pi/`       | Python             | Plane Intelligence (AI)        |
| `email/`    | Go                 | Email service                  |
| `monitor/`  | Go                 | Monitoring service             |
| `proxy/`    | Caddy              | Reverse proxy configs          |
| `dev-wiki/` | -                  | Development documentation      |

## Frontend Apps (React Router)

### web/

Main Plane web application.

- **Framework**: React 18 + React Router v7
- **State**: MobX
- **Styling**: Tailwind CSS
- **Structure**: `app/` (routes), `core/` (components, hooks, stores)
- **Editions**: `ce/` (community), `ee/` (enterprise)

### admin/

Instance administration panel.

- **Framework**: React 18 + React Router v7
- **Purpose**: Instance configuration, user management, settings

### space/

Public workspace sharing application.

- **Framework**: React 18 + React Router v7
- **Purpose**: Public views of shared projects/issues

## Backend Services

### api/

Django REST API backend (see `api/plane/CLAUDE.md` for details).

- **Framework**: Django + DRF
- **Database**: PostgreSQL
- **Queue**: Celery + RabbitMQ
- **APIs**: REST (`app/`), External (`api/`), GraphQL (`graphql/`)

### live/

Real-time collaboration server.

- **Framework**: Node.js + HocusPocus (Yjs)
- **Purpose**: Powers collaborative rich text editing
- **Protocol**: WebSocket

### silo/

Integrations engine.

- **Framework**: Node.js
- **Purpose**: External integrations, webhooks, data sync

### pi/

Plane Intelligence - AI features.

- **Language**: Python
- **Purpose**: AI-powered features and automation

## Infrastructure Services

### email/

Email processing service.

- **Language**: Go
- **Purpose**: Email sending and processing

### monitor/

Monitoring service.

- **Language**: Go
- **Purpose**: System monitoring and health checks

### proxy/

Reverse proxy configurations.

- **Server**: Caddy
- **Configs**: CE/EE variants, AIO (all-in-one) variants

## Development Commands

```bash
# Start all apps
pnpm dev

# Start specific app
pnpm --filter web dev
pnpm --filter admin dev
pnpm --filter space dev

# Build all
pnpm build

# Build specific app
pnpm --filter web build
```

## Port Assignments (Development)

| App   | Port |
| ----- | ---- |
| web   | 3000 |
| admin | 3001 |
| space | 3002 |
| api   | 8000 |
| live  | 3003 |
