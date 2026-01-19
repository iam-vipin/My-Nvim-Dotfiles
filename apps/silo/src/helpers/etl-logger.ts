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
import type { E_KNOWN_ETL_PHASE, E_KNOWN_ETL_ASSET } from "@/types/etl";

type LoggerContext = {
  jobId: string;
  workspaceSlug: string;
  phase: E_KNOWN_ETL_PHASE;
};

/**
 * Creates a scoped logger HOF for tracking ETL operations with job context
 */
export function createETLLogger(context: LoggerContext) {
  const prefix = `[Jira Import][Job: ${context.jobId}][Workspace: ${context.workspaceSlug}]`;

  return async function withLog<T>(
    asset: E_KNOWN_ETL_ASSET,
    fn: () => Promise<T>,
    getCount?: (result: T) => number
  ): Promise<T> {
    const startTime = Date.now();
    logger.info(`${prefix} ${context.phase} ${asset}...`);

    try {
      const result = await fn();
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const count = getCount ? getCount(result) : Array.isArray(result) ? result.length : "N/A";

      logger.info(`${prefix} ✓ ${context.phase} ${asset}: ${count} item(s) in ${duration}s`);
      return result;
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      logger.error(`${prefix} ✗ Failed to ${context.phase.toLowerCase()} ${asset} after ${duration}s:`, error);
      throw error;
    }
  };
}
