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

import type { PlanePageEntity } from "@plane/etl/core";
import type { LinearConfig, LinearService, LinearDocumentEntity } from "@plane/etl/linear";
import { pullDocuments, E_LinearDocsMigratorStep } from "@plane/etl/linear";
import { logger } from "@plane/logger";
import type { TImportJob } from "@plane/types";
import { env } from "@/env";
import { PagesMigrator } from "@/etl/migrator/pages.migrator";
import { getJobCredentials, getJobData } from "@/helpers/job";
import { getAPIClient } from "@/services/client";
import type { TaskHeaders } from "@/types";
import { TaskHandler } from "@/types";
import type { MQ, Store } from "@/worker/base";
import { createLinearClient } from "../helpers/migration-helpers";
import { getTransformedDocuments } from "./tranformers";

const client = getAPIClient();

export const ExecutionOrder = [
  E_LinearDocsMigratorStep.PULL,
  E_LinearDocsMigratorStep.TRANSFORM,
  E_LinearDocsMigratorStep.PUSH,
];

export class LinearDocsMigrator extends TaskHandler {
  constructor(
    private readonly mq: MQ,
    private readonly store: Store
  ) {
    super();
  }

  async handleTask(headers: TaskHeaders, data: any): Promise<boolean> {
    // Get the job data
    const job = await getJobData<LinearConfig>(headers.jobId);
    const credentials = await getJobCredentials(job);
    const client = createLinearClient(credentials);

    if (!job.config) {
      return false;
    }

    let lastResult: any;

    try {
      switch (headers.type) {
        case E_LinearDocsMigratorStep.PULL:
          lastResult = await this.pull(job, client);
          // Split the result into batches and dispatch them
          return await this.dispatchBatches(headers, job, lastResult);
        case E_LinearDocsMigratorStep.TRANSFORM:
          lastResult = await this.transform(job, client, data);
          break;
        case E_LinearDocsMigratorStep.PUSH:
          await this.push(job, data);
          break;
      }

      await this.dispatchNextStep(headers, job, lastResult);
      return true;
    } catch (error) {
      logger.error(error);
      return false;
    }
  }

  async pull(job: TImportJob<LinearConfig>, linearClient: LinearService): Promise<LinearDocumentEntity> {
    const documents = await pullDocuments(linearClient, job.config.teamId);
    return { documents };
  }

  async dispatchBatches(
    headers: TaskHeaders,
    job: TImportJob<LinearConfig>,
    data: LinearDocumentEntity
  ): Promise<boolean> {
    const documents = data.documents;

    const batchSize = Number(env.BATCH_SIZE);
    const batches = [];

    // Split the documents into batches
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      batches.push(batch);
    }

    // Update the job with the batches
    const jobReport = await client.importReport.getImportReport(job.report_id);
    await client.importReport.updateImportReport(job.report_id, {
      total_batch_count: jobReport.total_batch_count + batches.length,
    });

    for (const batch of batches) {
      this.dispatchNextStep(headers, job, {
        documents: batch,
      });
    }

    return true;
  }

  async transform(
    job: TImportJob<LinearConfig>,
    client: LinearService,
    data: LinearDocumentEntity
  ): Promise<PlanePageEntity> {
    const transformedDocuments = await getTransformedDocuments(job, client, data.documents);
    return { pages: transformedDocuments };
  }

  async push(job: TImportJob<LinearConfig>, data: PlanePageEntity): Promise<void> {
    await PagesMigrator.migrate(job, data);
    return;
  }

  async dispatchNextStep(headers: TaskHeaders, job: TImportJob<LinearConfig>, lastResult: any): Promise<void> {
    const step = ExecutionOrder.findIndex((step) => step === headers.type);
    if (step === -1) {
      throw new Error(`Step ${headers.type} not found`);
    }

    const nextStep = ExecutionOrder[step + 1];
    if (!nextStep) {
      return;
    }

    this.pushToQueue({ ...headers, type: nextStep }, lastResult);
  }

  pushToQueue = async (headers: TaskHeaders, data: any) => {
    if (!this.mq) return;
    try {
      // Message should contain jobId, taskName and the task
      await this.mq.sendMessage(data, {
        headers,
      });
    } catch (error) {
      logger.error("Error pushing to job worker queue", error);
      throw new Error("Error pushing to job worker queue");
    }
  };
}
