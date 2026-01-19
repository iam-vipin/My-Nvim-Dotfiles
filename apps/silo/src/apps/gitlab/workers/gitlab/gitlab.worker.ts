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

import type { GitlabIssueEvent, GitlabNoteEvent, GitlabMergeRequestEvent, GitlabWebhookEvent } from "@plane/etl/gitlab";
import { logger } from "@plane/logger";
import { captureException } from "@/logger";
import type { TaskHeaders } from "@/types";
import { TaskHandler } from "@/types";
import type { MQ, Store } from "@/worker/base";
import { handleMergeRequest } from "./handlers/merge-request.handler";
import { handleIssueComment } from "./handlers/issue-comment.handler";
import { handleIssueEvents } from "./handlers/issue.handler";

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
      } else if (data.event_type === "issue" || data.event_type === "work_item") {
        await handleIssueEvents(this.store, data as GitlabIssueEvent);
      } else if (data.event_type === "note") {
        await handleIssueComment(this.store, data as GitlabNoteEvent);
      }
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`[GITLAB][${data.event_type}] Error processing gitlab webhook`, errorMessage);
      captureException(error as Error);
      return true;
    } finally {
      logger.info(`[GITLAB][${data.event_type}] Event Processed Successfully`);
    }
  }
}
