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

import type { JiraConfig } from "@plane/etl/jira-server";
import type { TImportJob } from "@plane/types";

export const extractJobData = (
  job: TImportJob<JiraConfig>
): {
  projectId: string;
  resourceId: string;
} => ({
  projectId: job.project_id,
  resourceId: job.config?.resource?.id || "",
});

export const buildExternalId = (projectId: string, resourceId: string, id: string): string =>
  `${projectId}_${resourceId}_${id}`;
