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
import { E_INTEGRATION_KEYS } from "@plane/types";
import type { WebhookGitHubLabel, WebhookGitHubMilestone } from "../types";

export const transformGitHubLabel = (label: WebhookGitHubLabel): Partial<ExIssueLabel> => ({
  name: label.name,
  color: `#${label.color}`,
  external_id: label.id.toString(),
  external_source: E_INTEGRATION_KEYS.GITHUB,
});

export const transformGitHubMilestone = (milestone: WebhookGitHubMilestone): Partial<ExCycle> => ({
  external_id: milestone.id.toString(),
  external_source: E_INTEGRATION_KEYS.GITHUB,
  name: milestone.title,
  description: milestone.description || undefined,
  start_date: milestone.created_at,
  end_date: milestone.due_on || undefined,
});
