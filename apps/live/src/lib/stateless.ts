import { onStatelessPayload } from "@hocuspocus/server";
import { TDocumentEventsServer, EventToPayloadMap, createRealtimeEvent } from "@plane/editor";
import { DocumentCollaborativeEvents } from "@plane/editor/lib";
import { logger } from "@plane/logger";
import { serverAgentManager } from "@/agents/server-agent";

/**
 * Broadcast the client event to all the clients so that they can update their state
 * @param param0
 */
export const onStateless = async ({ payload, document, connection }: onStatelessPayload) => {
  const payloadStr = payload as string;
  logger.info("ON_STATELESS: payload", { payloadStr });

  // Function to safely parse JSON without throwing exceptions
  const safeJsonParse = (str: string) => {
    try {
      return { success: true, data: JSON.parse(str) };
    } catch (e) {
      return { success: false, error: e };
    }
  };

  // First check if this is a known document event
  const documentEvent = DocumentCollaborativeEvents[payload as TDocumentEventsServer]?.client;

  if (documentEvent) {
    const eventType = documentEvent as keyof EventToPayloadMap;

    let eventData: Partial<EventToPayloadMap[typeof eventType]> = {
      user_id: connection.context.userId,
    };

    if (eventType === "archived") {
      eventData = {
        ...eventData,
        archived_at: new Date().toISOString(),
      };
    }

    const realtimeEvent = createRealtimeEvent({
      action: eventType,
      page_id: document.name,
      descendants_ids: [],
      data: eventData as EventToPayloadMap[typeof eventType],
      workspace_slug: connection.context.workspaceSlug || "",
      user_id: connection.context.userId || "",
    });

    // Broadcast the event
    document.broadcastStateless(JSON.stringify(realtimeEvent));
    return;
  }

  // If not a document event, try to parse as JSON
  const parseResult = safeJsonParse(payloadStr);

  if (parseResult.success && parseResult.data && typeof parseResult.data === "object") {
    const parsedPayload = parseResult.data as {
      workspaceSlug?: string;
      projectId?: string;
      action?: string;
    };

    // Handle synced action
    if (parsedPayload.action === "synced" && parsedPayload.workspaceSlug) {
      serverAgentManager.notifySyncTrigger(document.name, connection.context);
      return;
    }
  }
};
