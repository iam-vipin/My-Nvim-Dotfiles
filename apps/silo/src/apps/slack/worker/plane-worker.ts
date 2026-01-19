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

import { logger } from "@plane/logger";
import type { PlaneWebhookPayload } from "@plane/sdk";
import { captureException } from "@/logger";
import type { TaskHeaders } from "@/types";
import { TaskHandler } from "@/types";
import type { MQ, Store } from "@/worker/base";
import { E_SLACK_WORKER_EVENTS } from "../types/types";
import { handleIssueCommentWebhook } from "./plane-webhook-handlers/handle-comment-webhook";
import { handleDMAlertWebhook } from "./plane-webhook-handlers/handle-dm-alerts";
import { handleIssueWebhook } from "./plane-webhook-handlers/handle-issue-webhook";
import { handleProjectUpdateWebhook } from "./plane-webhook-handlers/handle-project-updates";

export class PlaneSlackWebhookWorker extends TaskHandler {
  mq: MQ;
  store: Store;

  constructor(mq: MQ, store: Store) {
    super();
    this.mq = mq;
    this.store = store;
  }
  async handleTask(headers: TaskHeaders, data: PlaneWebhookPayload): Promise<boolean> {
    logger.info(`[SLACK] [PLANE_WORKER] Received payload`, {
      payload: {
        headers,
        data,
      },
    });

    try {
      switch (data.event) {
        case E_SLACK_WORKER_EVENTS.ISSUE:
          await handleIssueWebhook(data);
          break;
        case E_SLACK_WORKER_EVENTS.ISSUE_COMMENT:
          await handleIssueCommentWebhook(data);
          break;
        case E_SLACK_WORKER_EVENTS.PROJECT_UPDATE:
          await handleProjectUpdateWebhook(data);
          break;
        case E_SLACK_WORKER_EVENTS.DM_ALERT:
          await handleDMAlertWebhook(data);
          break;
        default:
          break;
      }
      return true;
    } catch (error) {
      logger.error(error);
      captureException(error as Error);
      return true;
    } finally {
      logger.info("[SLACK] Event Processed Successfully");
    }
  }
}
