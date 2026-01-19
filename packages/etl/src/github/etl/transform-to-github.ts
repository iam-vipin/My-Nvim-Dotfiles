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

import type { ExCycle, ExIssueLabel } from "@plane/sdk";
import type { WebhookGitHubLabel, WebhookGitHubMilestone } from "../types";

export const transformPlaneLabel = (label: ExIssueLabel): Partial<WebhookGitHubLabel> => ({
  name: label.name,
  color: label.color.replace("#", ""),
});

export const transformPlaneCycle = (cycle: ExCycle): Partial<WebhookGitHubMilestone> => ({
  id: parseInt(cycle.external_id || "0"),
  title: cycle.name,
  description: cycle.description,
  created_at: cycle.created_at,
  due_on: cycle.end_date,
});
