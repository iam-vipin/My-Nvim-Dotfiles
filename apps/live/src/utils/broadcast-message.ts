import { Hocuspocus } from "@hocuspocus/server";
import { BroadcastedEvent } from "@plane/editor";
import { type ServerAgentManager } from "@/agents/server-agent";
import { Redis } from "@/extensions/redis";

export const broadcastMessageToPage = (
  instance: Hocuspocus | ServerAgentManager,
  documentName: string,
  eventData: BroadcastedEvent
): boolean => {
  const hocuspocusServer =
    "hocuspocusServer" in instance ? (instance as ServerAgentManager).hocuspocusServer : instance;

  if (!hocuspocusServer || !hocuspocusServer.documents) {
    console.error("HocusPocus server not available or initialized");
    return false;
  }
  const redisExtension = hocuspocusServer.configuration.extensions.find((ext) => ext instanceof Redis);

  if (redisExtension) {
    redisExtension.broadcastToDocument(documentName, eventData);
    return true;
  }
  return false;
};
