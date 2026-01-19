# Live Server

Real-time collaborative server that powers Plane's rich text editor using Hocuspocus (Yjs) and Socket.IO.

## Development

### Commands

```bash
# Start the main server (Hocuspocus + Socket.IO)
pnpm dev

# Start the AMQP event consumer
pnpm dev:consumer

# Build for production
pnpm build

# Start production server
pnpm start
```

### Environment Variables

Copy `.env.example` to `.env` and configure the required variables.

## Architecture

- **Hocuspocus Server**: Collaborative document editing with Yjs CRDT
- **Socket.IO**: Real-time workspace events
- **AMQP Consumer**: Processes events from RabbitMQ for real-time updates
