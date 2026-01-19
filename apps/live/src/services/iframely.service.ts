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

// services
import { logger } from "@plane/logger";
import type { IframelyResponse } from "@plane/types";
// types
// helpers
import { env } from "@/env";
import { AppError } from "@/lib/errors";
import { APIService } from "./api.service";

const IFRAMELY_URL = env.IFRAMELY_URL ?? "";
export class IframelyService extends APIService {
  constructor() {
    super(IFRAMELY_URL);
  }

  async getIframe({ url, theme }: { url: string; theme: string }): Promise<IframelyResponse> {
    return this.get(`/iframely`, {
      params: { url: url, group: true, _theme: theme },
    })
      .then((response) => response?.data)
      .catch((error) => {
        const appError = new AppError(error, {
          context: { operation: "getIframe", url },
        });
        logger.error("Failed to fetch iframe data", appError);
        throw appError;
      });
  }
}

// Create a singleton instance
export const IframelyAPI = new IframelyService();
