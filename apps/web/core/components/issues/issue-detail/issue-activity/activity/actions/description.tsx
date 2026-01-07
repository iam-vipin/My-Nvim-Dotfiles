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
import { AlignLeft } from "lucide-react";
// hooks
import { useIssueDetail } from "@/hooks/store/use-issue-detail";
// components
import { IssueActivityBlockComponent, IssueLink } from "./";

type TIssueDescriptionActivity = { activityId: string; showIssue?: boolean; ends: "top" | "bottom" | undefined };

export const IssueDescriptionActivity = observer(function IssueDescriptionActivity(props: TIssueDescriptionActivity) {
  const { activityId, showIssue = true, ends } = props;
  // hooks
  const {
    activity: { getActivityById },
  } = useIssueDetail();

  const activity = getActivityById(activityId);

  if (!activity) return <></>;
  return (
    <IssueActivityBlockComponent
      icon={<AlignLeft size={14} className="text-secondary" aria-hidden="true" />}
      activityId={activityId}
      ends={ends}
    >
      <>
        updated the description
        {showIssue ? ` of ` : ``}
        {showIssue && <IssueLink activityId={activityId} />}.
      </>
    </IssueActivityBlockComponent>
  );
});
