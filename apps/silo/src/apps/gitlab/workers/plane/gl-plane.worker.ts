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

import { TaskHandler } from "@/types";
import type { TaskHeaders } from "@/types";
import type { MQ, Store } from "@/worker/base";
import { handleIssueCommentWebhook, handleIssueWebhook } from "./event-handlers";
import type { PlaneWebhookPayload } from "@plane/sdk";
import { captureException } from "@/logger";
import { logger } from "@plane/logger";

export class PlaneGitlabWebhookWorker extends TaskHandler {
  mq: MQ;
  store: Store;

  constructor(mq: MQ, store: Store) {
    super();
    this.mq = mq;
    this.store = store;
  }

  async handleTask(headers: TaskHeaders, data: PlaneWebhookPayload): Promise<boolean> {
    try {
      logger.info(`[GITLAB] [PLANE_WORKER] Received payload for event: ${data.event}`);
      switch (data.event) {
        case "issue":
          await handleIssueWebhook(this.store, data);
          break;
        case "issue_comment":
          await handleIssueCommentWebhook(this.store, data);
          break;
        default:
          break;
      }
      return true;
    } catch (error) {
      logger.error("[GITLAB] Error processing gitlab webhook", error);
      captureException(error as Error);
      return true;
    }
  }
}
