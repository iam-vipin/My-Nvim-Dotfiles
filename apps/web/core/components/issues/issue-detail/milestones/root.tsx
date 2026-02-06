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
import { MilestoneIcon } from "@plane/propel/icons";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
import { useMilestones } from "@/plane-web/hooks/store/use-milestone";
import { SidebarPropertyListItem } from "@/components/common/layout/sidebar/property-list-item";
import { MilestonesDropdown } from "./dropdown";

type TWorkItemSideBarMilestoneItemProps = {
  workspaceSlug: string;
  projectId: string;
  workItemId: string;
  isPeekView?: boolean;
};

export const WorkItemSideBarMilestoneItem = observer(function WorkItemSideBarMilestoneItem(
  props: TWorkItemSideBarMilestoneItemProps
) {
  const { workspaceSlug, projectId, workItemId } = props;

  //store hooks
  const {
    workItems: { updateWorkItemMilestone },
  } = useMilestones();
  const {
    issue: { getIssueById },
  } = useIssueDetail();

  // derived values
  const workItem = getIssueById(workItemId);

  if (!workItem) return null;

  // handlers
  const handleChange = (milestoneId: string | undefined) => {
    updateWorkItemMilestone(workspaceSlug, projectId, workItemId, milestoneId).catch(() => {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Error!",
        message: "Failed to update work item milestone. Please try again.",
      });
    });
  };

  return (
    <SidebarPropertyListItem icon={MilestoneIcon} label="Milestone">
      <MilestonesDropdown
        projectId={projectId}
        value={workItem.milestone_id}
        onChange={handleChange}
        buttonClassName="h-7.5 px-2"
      />
    </SidebarPropertyListItem>
  );
});
