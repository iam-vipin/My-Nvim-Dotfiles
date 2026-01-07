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

import type { Issue as LinearIssue } from "@linear/sdk";
import type { LinearCycle } from "@plane/etl/linear";
import { LinearService } from "@plane/etl/linear";
import type { TWorkspaceCredential } from "@plane/types";
import { env } from "@/env";

export const filterCyclesForIssues = (issues: LinearIssue[], cycles: LinearCycle[]): any[] => {
  const issueIds = new Set(issues.map((issue) => issue.id));

  return cycles
    .filter((cycle) => cycle.issues.some((issue) => issueIds.has(issue.id)))
    .map((cycle) => ({
      ...cycle,
      issues: cycle.issues.filter((issue) => issueIds.has(issue.id)),
    }));
};

export const createLinearClient = (credentials: TWorkspaceCredential): LinearService => {
  if (env.LINEAR_OAUTH_ENABLED === "1") {
    return new LinearService({
      isPAT: false,
      accessToken: credentials.source_access_token!,
    });
  } else {
    return new LinearService({
      isPAT: true,
      apiKey: credentials.source_access_token!,
    });
  }
};
