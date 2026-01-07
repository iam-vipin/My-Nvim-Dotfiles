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

import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";
import { env } from "@/env";

// Middleware to verify Sentry signature
export const verifySentrySignature = (request: Request, res: Response, next: NextFunction) => {
  const hmac = crypto.createHmac("sha256", env.SENTRY_CLIENT_SECRET as string);
  if (request.body) {
    const body = JSON.stringify(request.body);
    hmac.update(body ?? "{}", "utf8");
  }
  const digest = hmac.digest("hex");
  if (digest !== request.headers["sentry-hook-signature"]) {
    res.status(401).send({ error: "Invalid signature" });
    return;
  }

  next();
};
