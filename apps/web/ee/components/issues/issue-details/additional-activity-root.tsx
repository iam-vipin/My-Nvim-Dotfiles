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
// components
import type { TAdditionalActivityRoot } from "@/ce/components/issues/issue-details/additional-activity-root";
// local imports
import { WorkItemConvertActivity } from "./convert";
import { CustomerActivity } from "./customer-activity";
import { CustomerRequestActivity } from "./customer-request-activity";
import { EpicActivity } from "./epic-activity-root";
import { IssueEstimateTimeActivity } from "./estimate-time-activity";
import { MilestoneActivity } from "./milestone-activity-root";

export function AdditionalActivityRoot(props: TAdditionalActivityRoot) {
  const { field, activityId, ends } = props;

  switch (field) {
    case "estimate_time":
      return <IssueEstimateTimeActivity activityId={activityId} ends={ends} showIssue={false} />;
    case "customer":
      return <CustomerActivity activityId={activityId} ends={ends} />;
    case "customer_request":
      return <CustomerRequestActivity activityId={activityId} ends={ends} />;
    case "work_item":
      return <WorkItemConvertActivity activityId={activityId} ends={ends} />;
    case "epic":
      return <EpicActivity activityId={activityId} ends={ends} />;
    case "milestones":
      return <MilestoneActivity activityId={activityId} ends={ends} />;
    default:
      return <></>;
  }
}
