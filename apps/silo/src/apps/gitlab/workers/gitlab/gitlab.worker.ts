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

import type { GitlabMergeRequestEvent, GitlabWebhookEvent } from "@plane/etl/gitlab";
import { logger } from "@plane/logger";
import { captureException } from "@/logger";
import type { TaskHeaders } from "@/types";
import { TaskHandler } from "@/types";
import type { MQ, Store } from "@/worker/base";
import { handleMergeRequest } from "./handlers/merge-request.handler";

export class GitlabWebhookWorker extends TaskHandler {
  mq: MQ;
  store: Store;

  constructor(mq: MQ, store: Store) {
    super();
    this.mq = mq;
    this.store = store;
  }
  async handleTask(headers: TaskHeaders, data: GitlabWebhookEvent): Promise<boolean> {
    logger.info(
      `[GITLAB][${headers.type.toUpperCase()}] Received webhook event from gitlab 🐱 --------- [${data.event_type}]`
    );

    try {
      if (data.event_type === "merge_request") {
        await handleMergeRequest(data as GitlabMergeRequestEvent);
      }
      return true;
    } catch (error) {
      logger.error("[GITLAB] Error processing gitlab webhook", error);
      captureException(error as Error);
      return true;
    } finally {
      logger.info("[GITLAB] Event Processed Successfully");
    }
  }
}
