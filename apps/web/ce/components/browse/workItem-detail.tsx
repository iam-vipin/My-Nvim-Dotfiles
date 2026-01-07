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

import { observer } from "mobx-react";
import type { TIssue } from "@plane/types";
import { IssueDetailRoot } from "@/components/issues/issue-detail/root";

export type TWorkItemDetailRoot = {
  workspaceSlug: string;
  projectId: string;
  issueId: string;
  issue: TIssue | undefined;
};

export const WorkItemDetailRoot = observer(function WorkItemDetailRoot(props: TWorkItemDetailRoot) {
  const { workspaceSlug, projectId, issueId, issue } = props;

  return (
    <IssueDetailRoot
      workspaceSlug={workspaceSlug.toString()}
      projectId={projectId.toString()}
      issueId={issueId.toString()}
      is_archived={!!issue?.archived_at}
    />
  );
});
