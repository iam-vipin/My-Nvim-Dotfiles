import { Hocuspocus } from "@hocuspocus/server";
import { BroadcastedEvent } from "@plane/editor";
import { logger } from "@plane/logger";
import { type ServerAgentManager } from "@/agents/server-agent";
import { Redis } from "@/extensions/redis";
import { AppError } from "@/lib/errors";

export const broadcastMessageToPage = async (
  instance: Hocuspocus | ServerAgentManager,
  documentName: string,
  eventData: BroadcastedEvent
): Promise<boolean> => {
  const hocuspocusServer =
    "hocuspocusServer" in instance ? (instance as ServerAgentManager).hocuspocusServer : instance;

  if (!hocuspocusServer || !hocuspocusServer.documents) {
    const appError = new AppError("HocusPocus server not available or initialized", {
      context: { operation: "broadcastMessageToPage", documentName },
    });
    logger.error("Error while broadcasting message:", appError);
    return false;
  }

  const redisExtension = hocuspocusServer.configuration.extensions.find((ext) => ext instanceof Redis) as
    | Redis
    | undefined;

  if (!redisExtension) {
    logger.error("BROADCAST_MESSAGE_TO_PAGE: Redis extension not found");
    return false;
  }

  try {
    // Simple and safe - let the Redis extension handle all the logic
    await redisExtension.broadcastToDocument(documentName, eventData);
    return true;
  } catch (error) {
    logger.error(`BROADCAST_MESSAGE_TO_PAGE: Error broadcasting to ${documentName}:`, error);
    return false;
  }
};
