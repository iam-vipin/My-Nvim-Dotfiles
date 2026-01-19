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
import { E_INTEGRATION_KEYS } from "@plane/types";
import { healthCheck } from "@/db/query";
import { responseHandler } from "@/helpers/response-handler";
import { getAPIClient } from "@/services/client";

const apiClient = getAPIClient();

@Controller("/health")
export class HomeController {
  @Get("/")
  async HomePingRequest(req: Request, res: Response) {
    try {
      res.status(201).json({ message: "Welcome to Silo health check" });
    } catch (error: any) {
      responseHandler(res, 500, error);
    }
  }

  @Get("/check-hmac")
  async ApiPingRequest(req: Request, res: Response) {
    try {
      await apiClient.workspaceConnection.listWorkspaceConnections({
        connection_type: E_INTEGRATION_KEYS.GITHUB,
      });
      res.status(201).json({ message: "Welcome to Silo API health check" });
    } catch (error: any) {
      responseHandler(res, 500, error);
    }
  }

  @Get("/check-db")
  async CheckDBRequest(req: Request, res: Response) {
    try {
      const isHealthy = await healthCheck();
      if (!isHealthy) {
        responseHandler(res, 500, { message: "Database is not running" });
        return;
      }
      res.status(200).json({ message: "Silo DB is up and running" });
    } catch (error: any) {
      responseHandler(res, 500, error);
    }
  }
}
