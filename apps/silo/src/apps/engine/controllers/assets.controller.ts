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
import { Controller, Get } from "@plane/decorators";
import type { E_INTEGRATION_KEYS } from "@plane/types";
import { getPlaneAPIClient } from "@/helpers/plane-api-client";
import { responseHandler } from "@/helpers/response-handler";
import { getAPIClient } from "@/services/client";

const apiClient = getAPIClient();

@Controller("/api/assets")
export class AssetsController {
  @Get("/:source/:workspaceId/:userId/:id")
  async getAsset(req: Request, res: Response) {
    try {
      // Verify the params are present
      const { workspaceId, userId, id, source } = req.params;
      if (!workspaceId || !userId || !id || !source) {
        return res.status(400).send("Missing required parameters");
      }

      // Get the credentials for the workspace
      const credentials = await apiClient.workspaceCredential.listWorkspaceCredentials({
        source: source.toUpperCase(),
        workspace_id: workspaceId,
        user_id: userId,
      });
      if (!credentials || credentials.length === 0) {
        return res.status(401).send("No credentials found for the workspace");
      }

      const credential = credentials[0];
      if (!credential.target_access_token) {
        return res.status(401).send("No target access token found for the workspace");
      }

      const workspaceConnections = await apiClient.workspaceConnection.listWorkspaceConnections({
        credential_id: credential.id,
      });
      if (!workspaceConnections || workspaceConnections.length === 0) {
        return res.status(401).send("No workspace connection found for the workspace");
      }

      const workspaceConnection = workspaceConnections[0];

      // Create Plane Client, with the help of the recieved token
      const planeClient = await getPlaneAPIClient(credential, source.toUpperCase() as E_INTEGRATION_KEYS);

      // Get the presigned url for the asset
      const asset = await planeClient.assets.getAssetInfo(workspaceConnection.workspace_slug, id);
      return res.status(302).redirect(asset.asset_url);
    } catch (error) {
      return responseHandler(res, 500, error);
    }
  }
}
