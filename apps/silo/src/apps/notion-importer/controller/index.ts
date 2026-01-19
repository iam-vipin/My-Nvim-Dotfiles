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

import type { Request, Response } from "express";
import { Controller, Post } from "@plane/decorators";
import type { E_IMPORTER_KEYS } from "@plane/etl/core";
import { E_JOB_STATUS } from "@plane/etl/core";
import { createOrUpdateCredentials } from "@/helpers/credential";
import { responseHandler } from "@/helpers/response-handler";
import { getAPIClientInternal } from "@/services/client";
import { importTaskManger } from "@/worker";
import type { EZipDriverType } from "../drivers";

const apiClient = getAPIClientInternal();

@Controller("/api/zip-importer")
export class NotionController {
  @Post("/:provider/credentials/save")
  async saveCredentials(req: Request, res: Response) {
    try {
      const { workspaceId, userId, externalApiToken } = req.body;
      const { provider } = req.params;

      if (!workspaceId || !userId || !externalApiToken) {
        return res.status(400).json({
          error: "Missing required parameters: workspaceId, userId or externalApiToken",
        });
      }

      await createOrUpdateCredentials(workspaceId, userId, provider.toUpperCase() as E_IMPORTER_KEYS, {
        source: provider.toUpperCase(),
        target_access_token: externalApiToken,
        workspace_id: workspaceId,
        user_id: userId,
      });

      return res.sendStatus(201);
    } catch (error) {
      return responseHandler(res, 500, error);
    }
  }

  @Post("/:provider/start-import")
  async startImport(req: Request, res: Response) {
    try {
      const { workspaceId, userId, config } = req.body;
      const { provider } = req.params;

      if (!workspaceId || !userId || !config) {
        return res.status(400).json({ error: "Missing required parameters: workspaceId, userId or fileKey" });
      }

      const credentials = await apiClient.workspaceCredential.listWorkspaceCredentials({
        workspace_id: workspaceId,
        user_id: userId,
        source: provider.toUpperCase() as EZipDriverType,
      });

      if (!credentials.length) {
        return res.status(400).json({ error: "Credentials not found" });
      }

      const credential = credentials[0];

      // Create job for the import
      const job = await apiClient.importJob.createImportJob({
        status: E_JOB_STATUS.CREATED,
        credential_id: credential.id,
        initiator_id: userId,
        workspace_id: workspaceId,
        source: provider.toUpperCase() as EZipDriverType,
        config: config,
      });

      await apiClient.importReport.updateImportReport(job.report_id, {
        total_batch_count: 2,
      });

      await importTaskManger.registerTask(
        {
          route: job.source.toLowerCase(),
          jobId: job.id,
          type: "initiate",
        },
        {
          type: provider.toUpperCase() as EZipDriverType,
        }
      );

      return res.status(200).json({
        success: true,
        message: "Upload confirmed. Import process will begin shortly.",
      });
    } catch (error) {
      return responseHandler(res, 500, error);
    }
  }
}
