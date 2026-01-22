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
import React from "react";
import { observer } from "mobx-react";
// ce imports
import type { TWorkItemAdditionalSidebarProperties } from "@/ce/components/issues/issue-details/additional-properties";
// plane web imports
import { IssueAdditionalPropertyValuesUpdate } from "@/components/work-item-types/values/addition-properties-update";
import { WorkItemSidebarCustomers } from "@/plane-web/components/issues/issue-details/sidebar/customer-list-root";
import { WorkItemSideBarMilestoneItem } from "@/plane-web/components/issues/issue-details/sidebar/milestones/root";
import { useCustomers } from "@/plane-web/hooks/store";
import { useMilestones } from "@/plane-web/hooks/store/use-milestone";

export const WorkItemAdditionalSidebarProperties = observer(function WorkItemAdditionalSidebarProperties(
  props: TWorkItemAdditionalSidebarProperties
) {
  const { workItemId, projectId, workItemTypeId, workspaceSlug, isEditable, isPeekView = false } = props;
  const { isCustomersFeatureEnabled } = useCustomers();
  const { isMilestonesEnabled } = useMilestones();

  const isMilestonesFeatureEnabled = isMilestonesEnabled(workspaceSlug, projectId);
  return (
    <>
      {isCustomersFeatureEnabled && (
        <WorkItemSidebarCustomers workItemId={workItemId} workspaceSlug={workspaceSlug} isPeekView={isPeekView} />
      )}
      {isMilestonesFeatureEnabled && (
        <WorkItemSideBarMilestoneItem
          workspaceSlug={workspaceSlug}
          isPeekView={isPeekView}
          projectId={projectId}
          workItemId={workItemId}
        />
      )}
      {workItemTypeId && (
        <IssueAdditionalPropertyValuesUpdate
          issueId={workItemId}
          issueTypeId={workItemTypeId}
          projectId={projectId}
          workspaceSlug={workspaceSlug}
          isDisabled={!isEditable}
        />
      )}
    </>
  );
});
