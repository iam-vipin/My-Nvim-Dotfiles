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
import { handleIssueCommentWebhook } from "./event-handlers/issue-comment.handler";
import { handleIssueWebhook } from "./event-handlers/issue.handler";
export class PlaneGithubWebhookWorker extends TaskHandler {
  mq: MQ;
  store: Store;

  constructor(mq: MQ, store: Store) {
    super();
    this.mq = mq;
    this.store = store;
  }
  async handleTask(headers: TaskHeaders, data: PlaneWebhookPayload): Promise<boolean> {
    try {
      switch (data.event) {
        case "issue":
          await handleIssueWebhook(headers, this.mq, this.store, data);
          break;
        case "issue_comment":
          await handleIssueCommentWebhook(headers, this.mq, this.store, data);
          break;
        default:
          break;
      }
      return true;
    } catch (error) {
      logger.error("[GITHUB] Error processing plane webhook:", error);
      captureException(error as Error);
      return true;
    }
  }
}
