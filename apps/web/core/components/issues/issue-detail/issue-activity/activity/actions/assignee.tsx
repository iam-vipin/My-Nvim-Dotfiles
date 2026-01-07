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
// icons
import { MembersPropertyIcon } from "@plane/propel/icons";
// hooks;
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
// components
import { IssueActivityBlockComponent, IssueLink } from "./";

type TIssueAssigneeActivity = { activityId: string; showIssue?: boolean; ends: "top" | "bottom" | undefined };

export const IssueAssigneeActivity = observer(function IssueAssigneeActivity(props: TIssueAssigneeActivity) {
  const { activityId, ends, showIssue = true } = props;
  // hooks
  const {
    activity: { getActivityById },
  } = useIssueDetail();

  const activity = getActivityById(activityId);

  if (!activity) return <></>;
  return (
    <IssueActivityBlockComponent
      icon={<MembersPropertyIcon className="h-3.5 w-3.5 flex-shrink-0 text-secondary" />}
      activityId={activityId}
      ends={ends}
    >
      <>
        {activity.old_value === "" ? `added a new assignee ` : `removed the assignee `}
        <a
          href={`/${activity.workspace_detail?.slug}/profile/${activity.new_identifier ?? activity.old_identifier}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center font-medium text-primary hover:underline capitalize"
        >
          {activity.new_value && activity.new_value !== "" ? activity.new_value : activity.old_value}
        </a>
        {showIssue && (activity.old_value === "" ? ` to ` : ` from `)}
        {showIssue && <IssueLink activityId={activityId} />}.
      </>
    </IssueActivityBlockComponent>
  );
});
