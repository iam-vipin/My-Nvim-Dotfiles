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
import { Controller, Get, Post } from "@plane/decorators";
import { E_INTEGRATION_KEYS } from "@plane/types";
import { responseHandler } from "@/helpers/response-handler";
import { EnsureEnabled } from "@/lib/decorators";
import { SentryAssetsController } from "./sentry-assets.controller";
import { SentryAuthController } from "./sentry-auth.controller";
import { SentryWebhookController } from "./sentry-webhook.controller";

@Controller("/api/sentry")
@EnsureEnabled(E_INTEGRATION_KEYS.SENTRY)
class SentryController {
  @Get("/ping")
  async ping(_req: Request, res: Response) {
    res.send("pong");
  }

  @Post("/alert-rule")
  async createAlertRule(req: Request, res: Response) {
    try {
      res.send(200);
    } catch (error) {
      return responseHandler(res, 500, error);
    }
  }
}

export default [SentryController, SentryAuthController, SentryWebhookController, SentryAssetsController];
