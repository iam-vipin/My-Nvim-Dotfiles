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

import axios from "axios";
import type { Request, Response } from "express";
import { Controller, Get } from "@plane/decorators";
// services
// helpers
import { env } from "@/env";
import { handleAuthentication } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { IframelyAPI } from "@/services/iframely.service";

@Controller("/iframely")
export class IframelyController {
  @Get("/")
  async getIframely(req: Request, res: Response) {
    try {
      const { url: sourceURL, _theme, workspaceSlug, userId } = req.query;
      const { cookie } = req.headers || req.query;
      // Validate environment configuration
      if (!env.IFRAMELY_URL) {
        return res.status(500).json({
          error: "An unexpected error occurred",
          code: "SERVER_ERROR",
        });
      }

      // Validate required parameters
      if (!sourceURL) {
        return res.status(400).json({
          error: "URL parameter is required",
          code: "MISSING_URL",
        });
      }

      if (!cookie || typeof cookie !== "string") {
        return res.status(401).json({
          error: "Authentication required",
          code: "MISSING_AUTHENTICATION",
        });
      }

      if (!userId || typeof userId !== "string") {
        return res.status(400).json({
          error: "User ID parameter is required",
          code: "MISSING_USER_ID",
        });
      }

      if (!workspaceSlug || typeof workspaceSlug !== "string") {
        return res.status(400).json({
          error: "Workspace slug parameter is required",
          code: "MISSING_WORKSPACE_SLUG",
        });
      }

      // Authenticate user
      try {
        await handleAuthentication({
          cookie,
          userId,
        });
      } catch (_error) {
        // handleAuthentication throws errors for unauthorized access
        return res.status(401).json({
          error: "Authentication failed",
          code: "UNAUTHORIZED",
        });
      }

      // If authentication is successful, proceed with the request
      const response = await IframelyAPI.getIframe({
        url: sourceURL as string,
        theme: _theme as string,
      });

      res.json(response);
    } catch (error) {
      if (error instanceof AppError) {
        const status = error.statusCode || 500;
        let errorMessage = "An error occurred while fetching the embed data";
        let errorCode = "UNKNOWN_ERROR";

        switch (status) {
          case 404:
            errorMessage = "The requested content is no longer available";
            errorCode = "CONTENT_NOT_FOUND";
            break;
          case 410:
            errorMessage = "This content has been permanently removed";
            errorCode = "CONTENT_REMOVED";
            break;
          case 401:
          case 403:
            errorMessage = "This content is private or requires authentication";
            errorCode = "CONTENT_PRIVATE";
            break;
          case 415:
            errorMessage = "This type of content is not supported";
            errorCode = "UNSUPPORTED_CONTENT";
            break;
          case 418:
            errorMessage = "The content server took too long to respond";
            errorCode = "TIMEOUT";
            break;
          default:
            errorMessage = "An unexpected error occurred";
            errorCode = "SERVER_ERROR";
        }

        return res.status(status).json({
          error: errorMessage,
          code: errorCode,
        });
      }
    }
  }
}
