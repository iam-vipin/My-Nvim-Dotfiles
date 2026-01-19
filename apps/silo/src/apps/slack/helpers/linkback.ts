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

import type { TSlackConnectionDetails } from "../types/types";
import { createSlackLinkback } from "../views/issue-linkback";
import { enhanceUserMapWithSlackLookup, getSlackToPlaneUserMapFromWC } from "./user";

type TRefreshLinkbackProps = {
  details: TSlackConnectionDetails;
  issueId: string;
  projectId: string;
};

export const refreshLinkback = async (props: TRefreshLinkbackProps) => {
  const { details, issueId, projectId } = props;
  const { workspaceConnection, planeClient, slackService } = details;

  const issue = await planeClient.issue.getIssueWithFields(workspaceConnection.workspace_slug, projectId, issueId, [
    "state",
    "project",
    "assignees",
    "labels",
    "created_by",
    "updated_by",
  ]);

  const userMap = getSlackToPlaneUserMapFromWC(workspaceConnection);
  const enhancedUserMap = await enhanceUserMapWithSlackLookup({
    planeUsers: issue.assignees,
    currentUserMap: userMap,
    slackService,
  });

  const updatedLinkback = createSlackLinkback(workspaceConnection.workspace_slug, issue, enhancedUserMap, false);

  return updatedLinkback;
};
