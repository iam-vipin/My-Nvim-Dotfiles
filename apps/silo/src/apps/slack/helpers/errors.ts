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

/* ------------------- Exceptions ---------------------- */

import { logger } from "@plane/logger";
import type { E_INTEGRATION_KEYS } from "@plane/types";

/**
 * Exception thrown when work object details cannot be found or retrieved
 */
export class DetailsNotFoundException extends Error {
  constructor(
    provider: E_INTEGRATION_KEYS,
    public readonly context?: unknown
  ) {
    const message = `[${provider}] No connection details found`;
    super(message);
    this.name = "DetailsNotFoundException";
    logger.info(message, this.context);
    Error.captureStackTrace(this, this.constructor);
  }
}
