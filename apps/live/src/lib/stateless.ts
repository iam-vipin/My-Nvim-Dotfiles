/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

import type { onStatelessPayload } from "@hocuspocus/server";
import { createRealtimeEvent } from "@plane/editor";
import type { EventToPayloadMap } from "@plane/editor";
import { DocumentCollaborativeEvents } from "@plane/editor/lib";
import type { TDocumentEventsServer } from "@plane/editor/lib";
import { logger } from "@plane/logger";
import { serverAgentManager } from "@/agents/server-agent";

/**
 * Broadcast the client event to all the clients so that they can update their state
 * @param param0
 */
export const onStateless = async ({ payload, document, connection }: onStatelessPayload) => {
  const payloadStr = payload;

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
    const eventType = documentEvent;

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
      teamspaceId?: string;
      action?: string;
    };

    // Handle synced action
    if (parsedPayload.action === "synced" && parsedPayload.workspaceSlug) {
      serverAgentManager.notifySyncTrigger(document.name, connection.context).catch((error) => {
        logger.error("ON_STATELESS: Error in notifySyncTrigger:", error);
      });
      return;
    }
  }
};
