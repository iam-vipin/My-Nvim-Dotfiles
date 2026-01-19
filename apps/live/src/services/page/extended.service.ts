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

import { logger } from "@plane/logger";
import { AppError } from "@/lib/errors";
import { PageCoreService } from "./core.service";

/**
 * This is the extended service for the page service.
 * It extends the core service and adds additional functionality.
 * Implementation for this is found in the enterprise repository.
 */
export abstract class PageService extends PageCoreService {
  constructor() {
    super();
  }

  public async fetchSubPageDetails(pageId: string) {
    return this.get(`${this.basePath}/pages/${pageId}/sub-pages/`, {
      headers: this.getHeader(),
    })
      .then((response) => response?.data)
      .catch((error) => {
        const appError = new AppError(error, {
          context: { operation: "fetchSubPageDetails", pageId },
        });
        logger.error("Failed to fetch sub-page details", appError);
        throw appError;
      });
  }
}
