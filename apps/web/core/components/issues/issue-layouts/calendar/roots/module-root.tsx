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

import { useCallback } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// plane imports
import { EIssuesStoreType } from "@plane/types";
// hooks
import { useIssues } from "@/hooks/store/use-issues";
// local imports
import { ModuleIssueQuickActions } from "../../quick-action-dropdowns";
import { BaseCalendarRoot } from "../base-calendar-root";

export const ModuleCalendarLayout = observer(function ModuleCalendarLayout() {
  const { workspaceSlug, projectId, moduleId } = useParams();

  const {
    issues: { addIssuesToModule },
  } = useIssues(EIssuesStoreType.MODULE);

  const addIssuesToView = useCallback(
    (issueIds: string[]) => {
      if (!workspaceSlug || !projectId || !moduleId) throw new Error();
      return addIssuesToModule(workspaceSlug.toString(), projectId.toString(), moduleId.toString(), issueIds);
    },
    [addIssuesToModule, workspaceSlug, projectId, moduleId]
  );

  if (!moduleId) return null;

  return (
    <BaseCalendarRoot
      QuickActions={ModuleIssueQuickActions}
      addIssuesToView={addIssuesToView}
      viewId={moduleId?.toString()}
    />
  );
});
