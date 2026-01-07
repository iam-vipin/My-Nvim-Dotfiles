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

import type { TSlackPayload } from "@plane/etl/slack";
import { logger } from "@plane/logger";
import { captureException } from "@/logger";
import type { TaskHeaders } from "@/types";
import { TaskHandler } from "@/types";
import type { MQ, Store } from "@/worker/base";
import { handleBlockActions } from "./handlers/block-actions";
import { handleCommand } from "./handlers/handle-command";
import { handleSlackEvent } from "./handlers/handle-message";
import { handleMessageAction } from "./handlers/message-action";
import { handleViewSubmission } from "./handlers/view-submission";

export class SlackInteractionHandler extends TaskHandler {
  mq: MQ;
  store: Store;

  constructor(mq: MQ, store: Store) {
    super();
    this.mq = mq;
    this.store = store;
  }

  async handleTask(headers: TaskHeaders, data: TSlackPayload): Promise<boolean> {
    logger.info(
      `[SLACK][${headers.type.toUpperCase()}] Received webhook event from slack 🐱 --------- [${headers.route}]`,
      {
        payload: {
          headers,
          data,
        },
      }
    );

    try {
      switch (data.type) {
        case "message_action":
          await handleMessageAction(data);
          break;
        case "block_actions":
          await handleBlockActions(data);
          break;
        case "view_submission":
          await handleViewSubmission(data);
          break;
        case "event":
          await handleSlackEvent(data);
          break;
        case "command":
          await handleCommand(data);
          break;
        default:
          break;
      }
      return true;
    } catch (error) {
      logger.error(`[SLACK] Error processing slack webhook`, {
        error,
      });
      captureException(error as Error);
      return true;
    } finally {
      logger.info("[SLACK] Event Processed Successfully");
    }
  }
}
