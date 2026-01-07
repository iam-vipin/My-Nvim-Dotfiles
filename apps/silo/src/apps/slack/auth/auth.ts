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

import { isValidSlackRequest } from "@slack/bolt";
import type { NextFunction, Request, Response } from "express";
import { createSlackAuth } from "@plane/etl/slack";
import { logger } from "@plane/logger";
import { env } from "@/env";
import { captureException } from "@/logger";

export const slackAuth = createSlackAuth(
  env.SLACK_CLIENT_ID,
  env.SLACK_CLIENT_SECRET,
  encodeURI(env.SILO_API_BASE_URL + env.SILO_BASE_PATH + "/api/slack/user/auth/callback"),
  encodeURI(env.SILO_API_BASE_URL + env.SILO_BASE_PATH + "/api/slack/team/auth/callback")
);

export const authenticateSlackRequestMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Get raw body as string - this should be set by raw-body middleware

  // If the signing secret is not set, we don't need to verify the signature
  if (!env.SLACK_SIGNING_SECRET) {
    logger.warn("Slack signing secret is not set, skipping request verification");
    return next();
  }

  const options = {
    signingSecret: env.SLACK_SIGNING_SECRET || "",
    body: (req as RequestWithRawBody).rawBody || "",
    headers: {
      "x-slack-signature": req.headers["x-slack-signature"] as string,
      "x-slack-request-timestamp": parseInt(req.headers["x-slack-request-timestamp"] as string),
    },
  };

  if (!isValidSlackRequest(options)) {
    logger.error("Unauthorized Slack request");
    captureException(
      new Error("Unauthorized Slack request", {
        cause: {
          options,
        },
      })
    );
    return res.status(401).json({ error: "Unauthorized request" });
  }

  next();
};

// Custom type to add rawBody to the request
// We're adding this rawBody to the request in the server.ts file
interface RequestWithRawBody extends Request {
  rawBody?: string;
}
