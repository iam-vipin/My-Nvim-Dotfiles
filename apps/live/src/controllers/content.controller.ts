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
// services
import { ContentAPI } from "@/services/content.service";

// Error interface for better type safety
type APIError = {
  status?: number;
  message?: string;
  response?: {
    data?: unknown;
  };
};

@Controller("/content")
export class ContentController {
  @Get("/")
  async getFileContent(req: Request, res: Response) {
    try {
      // Extract URL from query params
      const { url } = req.query;
      if (!url || typeof url !== "string") {
        return res.status(400).json({
          error: "URL parameter is required",
          message: "Please provide a valid URL in the query parameters",
        });
      }

      // Extract cookie from request headers
      const cookie = req.headers.cookie;

      // Use the ContentService to fetch data
      const response = await ContentAPI.getFileContent({
        url: url,
        cookie: cookie,
      });

      return res.json({
        success: true,
        content: response,
      });
    } catch (error: unknown) {
      // Handle different types of errors
      const apiError = error as APIError;
      if (apiError?.status) {
        return res.status(apiError.status).json({
          error: "Failed to fetch content",
          message: apiError.message || "External service error",
          details: apiError,
        });
      }

      return res.status(500).json({
        error: "Internal server error",
        message: "Failed to fetch content from the provided URL",
      });
    }
  }
}
