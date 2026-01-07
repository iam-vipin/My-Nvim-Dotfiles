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
// plane web components
import {
  WorkspaceWorklogAppliedFilterUsers,
  WorkspaceWorklogAppliedFilterProjects,
  WorkspaceWorklogAppliedFilterDateRange,
} from "@/plane-web/components/worklogs";
// plane web hooks
import { useWorkspaceWorklogs } from "@/plane-web/hooks/store";

type TWorkspaceWorklogAppliedFilterRoot = {
  workspaceSlug: string;
  workspaceId: string;
};

export const WorkspaceWorklogAppliedFilterRoot = observer(function WorkspaceWorklogAppliedFilterRoot(
  props: TWorkspaceWorklogAppliedFilterRoot
) {
  const { workspaceSlug, workspaceId } = props;
  // hooks
  const { filters } = useWorkspaceWorklogs();

  // derived values
  const isAppliedFilters = Object.values(filters).some((filter) => filter.length > 0);

  if (!isAppliedFilters) return <></>;
  return (
    <div className="relative flex items-center flex-wrap gap-2 rounded-sm p-2 bg-layer-1">
      <WorkspaceWorklogAppliedFilterUsers workspaceSlug={workspaceSlug} workspaceId={workspaceId} />
      <WorkspaceWorklogAppliedFilterProjects workspaceSlug={workspaceSlug} workspaceId={workspaceId} />
      <WorkspaceWorklogAppliedFilterDateRange workspaceSlug={workspaceSlug} workspaceId={workspaceId} />
    </div>
  );
});
