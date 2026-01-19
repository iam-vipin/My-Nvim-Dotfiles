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

import type { Hocuspocus } from "@hocuspocus/server";
import { createRealtimeEvent } from "@plane/editor";
import { logger } from "@plane/logger";
import type { HocusPocusServerContext } from "@/types";
import { broadcastMessageToPage } from "./broadcast-message";

// Helper to broadcast error to frontend
export const broadcastError = async (
  hocuspocusServerInstance: Hocuspocus,
  pageId: string,
  errorMessage: string,
  errorType: "fetch" | "store",
  context: HocusPocusServerContext,
  errorCode?: "content_too_large" | "page_locked" | "page_archived",
  shouldDisconnect?: boolean
) => {
  try {
    const errorEvent = createRealtimeEvent({
      action: "error",
      page_id: pageId,
      parent_id: undefined,
      descendants_ids: [],
      data: {
        error_message: errorMessage,
        error_type: errorType,
        error_code: errorCode,
        should_disconnect: shouldDisconnect,
        user_id: context.userId || "",
      },
      workspace_slug: context.workspaceSlug || "",
      user_id: context.userId || "",
    });

    await broadcastMessageToPage(hocuspocusServerInstance, pageId, errorEvent);
  } catch (broadcastError) {
    logger.error("Error broadcasting error message to frontend:", broadcastError);
  }
};
