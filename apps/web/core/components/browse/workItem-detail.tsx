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

import { useRef } from "react";
import { observer } from "mobx-react";
// plane imports
import type { TIssue } from "@plane/types";
import type { EditorRefApi } from "@plane/editor";
import { IssueDetailRoot } from "@/components/issues/issue-detail/root";
// plane web imports
import { EpicDetailRoot } from "@/plane-web/components/epics/details/root";

export type TWorkItemDetailRoot = {
  workspaceSlug: string;
  projectId: string;
  workItemId: string;
  workItem: TIssue;
};

export const WorkItemDetailRoot = observer(function WorkItemDetailRoot(props: TWorkItemDetailRoot) {
  const { workspaceSlug, projectId, workItemId, workItem } = props;
  // refs
  const editorRef = useRef<EditorRefApi>(null);

  if (workItem.is_epic) {
    return (
      <EpicDetailRoot editorRef={editorRef} workspaceSlug={workspaceSlug} projectId={projectId} epicId={workItemId} />
    );
  }

  return (
    <IssueDetailRoot
      workspaceSlug={workspaceSlug}
      projectId={projectId}
      issueId={workItemId}
      is_archived={!!workItem.archived_at}
    />
  );
});
