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

import type { TWorkObjectType } from "@/apps/slack/types/workobjects";
import { IssueDetailService } from "./issue-details.service";
import { IssueWorkObjectService } from "./issue-wo.service";
import { IssueWorkObjectViewService } from "./issue-wo-view.service";

export const getIssueWorkObjectService = (
  type: TWorkObjectType,
  teamId: string,
  userId: string
): IssueWorkObjectService => {
  const issueDetailService = new IssueDetailService(type);
  const issueWorkObjectViewService = new IssueWorkObjectViewService(type);

  return new IssueWorkObjectService(
    {
      slackTeamId: teamId,
      slackUserId: userId,
    },
    issueDetailService,
    issueWorkObjectViewService
  );
};
