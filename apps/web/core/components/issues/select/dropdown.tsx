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

import React from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { EUserPermissionsLevel } from "@plane/constants";
import type { IIssueLabel } from "@plane/types";
import { EUserPermissions } from "@plane/types";
// hooks
import { useLabel } from "@/hooks/store/use-label";
import { useUserPermissions } from "@/hooks/store/user";
// local imports
import type { TWorkItemLabelSelectBaseProps } from "./base";
import { WorkItemLabelSelectBase } from "./base";

type TWorkItemLabelSelectProps = Omit<TWorkItemLabelSelectBaseProps, "labelIds" | "getLabelById" | "onDropdownOpen"> & {
  projectId: string | undefined;
};

export const IssueLabelSelect = observer(function IssueLabelSelect(props: TWorkItemLabelSelectProps) {
  const { projectId } = props;
  // router
  const { workspaceSlug } = useParams();
  // store hooks
  const { allowPermissions } = useUserPermissions();
  const { getProjectLabelIds, getLabelById, fetchProjectLabels, createLabel } = useLabel();
  // derived values
  const projectLabelIds = getProjectLabelIds(projectId);

  const canCreateLabel =
    projectId &&
    allowPermissions([EUserPermissions.ADMIN], EUserPermissionsLevel.PROJECT, workspaceSlug?.toString(), projectId);

  const onDropdownOpen = () => {
    if (projectLabelIds === undefined && workspaceSlug && projectId)
      fetchProjectLabels(workspaceSlug.toString(), projectId);
  };

  const handleCreateLabel = (data: Partial<IIssueLabel>) => {
    if (!workspaceSlug || !projectId) {
      throw new Error("Workspace slug or project ID is missing");
    }
    return createLabel(workspaceSlug.toString(), projectId, data);
  };

  return (
    <WorkItemLabelSelectBase
      {...props}
      getLabelById={getLabelById}
      labelIds={projectLabelIds ?? []}
      onDropdownOpen={onDropdownOpen}
      createLabel={handleCreateLabel}
      createLabelEnabled={!!canCreateLabel}
    />
  );
});
