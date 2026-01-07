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
import { PriorityPropertyIcon } from "@plane/propel/icons";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
// components
import { IssueActivityBlockComponent, IssueLink } from "./";

type TIssuePriorityActivity = { activityId: string; showIssue?: boolean; ends: "top" | "bottom" | undefined };

export const IssuePriorityActivity = observer(function IssuePriorityActivity(props: TIssuePriorityActivity) {
  const { activityId, showIssue = true, ends } = props;
  // hooks
  const {
    activity: { getActivityById },
  } = useIssueDetail();

  const activity = getActivityById(activityId);

  if (!activity) return <></>;
  return (
    <IssueActivityBlockComponent
      icon={<PriorityPropertyIcon className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />}
      activityId={activityId}
      ends={ends}
    >
      <>
        set the priority to <span className="font-medium text-primary">{activity.new_value}</span>
        {showIssue ? ` for ` : ``}
        {showIssue && <IssueLink activityId={activityId} />}.
      </>
    </IssueActivityBlockComponent>
  );
});
