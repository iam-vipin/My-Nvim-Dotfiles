import { Effect } from "effect";
import type { Server as SocketIOServer, Socket } from "socket.io";

export interface RelayHandlerContext {
  runFork: <A, E>(effect: Effect.Effect<A, E, never>) => void;
}

/**
 * Setup handler for the default namespace (/)
 * Provides general pub/sub relay functionality
 */
export const setupRelayNamespace = (io: SocketIOServer, ctx: RelayHandlerContext): void => {
  io.on("connection", (socket: Socket) => {
    const clientId = socket.id;

    ctx.runFork(
      Effect.logInfo("RELAY: Client connected", {
        clientId,
        remoteAddress: socket.handshake.address,
      })
    );

    socket.emit("connected", {
      clientId,
      timestamp: Date.now(),
    });

    // Subscribe to a channel
    socket.on("subscribe", (channel: string) => {
      socket.join(channel);
      ctx.runFork(
        Effect.logInfo("RELAY: Client subscribed to channel", {
          clientId,
          channel,
        })
      );
      socket.emit("subscribed", { channel, timestamp: Date.now() });
    });

    // Unsubscribe from a channel
    socket.on("unsubscribe", (channel: string) => {
      socket.leave(channel);
      ctx.runFork(
        Effect.logInfo("RELAY: Client unsubscribed from channel", {
          clientId,
          channel,
        })
      );
      socket.emit("unsubscribed", { channel, timestamp: Date.now() });
    });

    // Broadcast to a channel
    socket.on("broadcast", (data: { channel: string; payload: unknown }) => {
      ctx.runFork(
        Effect.logInfo("RELAY: Broadcasting to channel", {
          clientId,
          channel: data.channel,
        })
      );
      socket.to(data.channel).emit("message", {
        channel: data.channel,
        payload: data.payload,
        sender: clientId,
        timestamp: Date.now(),
      });
    });

    // Ping/pong
    socket.on("ping", () => {
      socket.emit("pong", { timestamp: Date.now() });
    });

    socket.on("disconnect", (reason: string) => {
      ctx.runFork(
        Effect.logInfo("RELAY: Client disconnected", {
          clientId,
          reason,
        })
      );
    });
  });
};
