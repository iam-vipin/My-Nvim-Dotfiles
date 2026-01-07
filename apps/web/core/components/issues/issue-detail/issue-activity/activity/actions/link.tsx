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
import { MessageSquare } from "lucide-react";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
// components
import { IssueActivityBlockComponent, IssueLink } from "./";

type TIssueLinkActivity = { activityId: string; showIssue?: boolean; ends: "top" | "bottom" | undefined };

export const IssueLinkActivity = observer(function IssueLinkActivity(props: TIssueLinkActivity) {
  const { activityId, showIssue = false, ends } = props;
  // hooks
  const {
    activity: { getActivityById },
  } = useIssueDetail();

  const activity = getActivityById(activityId);

  if (!activity) return <></>;
  return (
    <IssueActivityBlockComponent
      icon={<MessageSquare size={14} className="text-secondary" aria-hidden="true" />}
      activityId={activityId}
      ends={ends}
    >
      <>
        {activity.verb === "created" ? (
          <>
            <span>added </span>
            <a
              href={`${activity.new_value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              link
            </a>
          </>
        ) : activity.verb === "updated" ? (
          <>
            <span>updated the </span>
            <a
              href={`${activity.old_value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              link
            </a>
          </>
        ) : (
          <>
            <span>removed this </span>
            <a
              href={`${activity.old_value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              link
            </a>
          </>
        )}
        {showIssue && (activity.verb === "created" ? ` to ` : ` from `)}
        {showIssue && <IssueLink activityId={activityId} />}.
      </>
    </IssueActivityBlockComponent>
  );
});
