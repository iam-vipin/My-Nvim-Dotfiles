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

import type { FC } from "react";
import { observer } from "mobx-react";
// components
import {
  WorkspaceWorklogFilterUsers,
  WorkspaceWorklogFilterProjects,
  WorkspaceWorklogFilterDateRange,
} from "@/components/worklogs";

type TWorkspaceWorklogFilterRoot = {
  workspaceSlug: string;
  workspaceId: string;
};

export const WorkspaceWorklogFilterRoot = observer(function WorkspaceWorklogFilterRoot(
  props: TWorkspaceWorklogFilterRoot
) {
  const { workspaceSlug, workspaceId } = props;

  return (
    <div className="relative flex items-center gap-2">
      <WorkspaceWorklogFilterUsers workspaceSlug={workspaceSlug} workspaceId={workspaceId} />
      <WorkspaceWorklogFilterProjects workspaceSlug={workspaceSlug} workspaceId={workspaceId} />
      <WorkspaceWorklogFilterDateRange workspaceSlug={workspaceSlug} workspaceId={workspaceId} />
    </div>
  );
});
