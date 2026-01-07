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
import { E_IMPORTER_KEYS } from "@plane/etl/core";
import { createOrUpdateCredentials } from "@/helpers/credential";
import { responseHandler } from "@/helpers/response-handler";
import { useValidateUserAuthentication } from "@/lib/decorators";

@Controller("/api/flatfile")
class CSVController {
  @useValidateUserAuthentication()
  @Post("/credentials/save")
  async saveCredentials(req: Request, res: Response) {
    try {
      const { workspaceId, userId, externalApiToken } = req.body;

      if (!workspaceId || !externalApiToken) {
        return res.status(400).json({
          error: "Missing required parameters: workspaceId or externalApiToken",
        });
      }

      await createOrUpdateCredentials(workspaceId, userId, E_IMPORTER_KEYS.FLATFILE, {
        source: "FLATFILE",
        target_access_token: externalApiToken,
        workspace_id: workspaceId,
        user_id: userId,
      });

      return res.sendStatus(201);
    } catch (error) {
      return responseHandler(res, 500, error);
    }
  }
}

export default CSVController;
