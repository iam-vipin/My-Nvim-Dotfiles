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
import { env } from "@/env";
import { MQ } from "./base";
import type { TMQEntityOptions } from "./base/types";

export class CeleryProducer {
  private mq: MQ | undefined;

  private initQueue = async (options: TMQEntityOptions) => {
    this.mq = new MQ(options, env.AMQP_URL);
    await this.mq.connect();
    logger.info(`Message Queue ${options.queueName} connected successfully 🐇🐇🐰`);
  };

  public initialize = async (options: TMQEntityOptions) => {
    logger.info("Initializing Celery Producer.. ♨️");
    try {
      await this.initQueue(options);
    } catch (error) {
      logger.error(`Something went wrong while initiating job worker 🧨, ${error}`);
    }
  };

  public registerTask = async (
    data: any,
    workspaceSlug: string,
    projectId?: string,
    jobId?: string,
    userId?: string,
    taskId?: string,
    taskName = "plane.bgtasks.data_import_task.import_data"
  ) => {
    if (!this.mq) return;
    try {
      // Create a unique task ID
      const id = taskId ?? Math.random().toString(36).substring(2, 15);

      // Create the Celery task message
      const celeryMessage = {
        id: id,
        task: taskName, // This should match your Python task name
        args: [],
        kwargs: {
          payload: data,
          slug: workspaceSlug,
          project_id: projectId,
          user_id: userId,
          job_id: jobId,
        },
      };

      await this.mq.sendMessage(celeryMessage, {
        lang: "py",
        task: taskName,
        id: taskId,
      });
    } catch (error) {
      logger.error("Error pushing to job worker queue:", error);
    }
  };
}
