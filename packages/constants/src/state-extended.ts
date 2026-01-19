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

import type { TStateAnalytics } from "@plane/types";

export const STATE_ANALYTICS_DETAILS: {
  key: keyof TStateAnalytics;
  title: string;
  color: string;
}[] = [
  {
    key: "backlog_issues",
    title: "Backlog",
    color: "#EBEDF2",
  },
  {
    key: "unstarted_issues",
    title: "Unstarted",
    color: "#6E6E6E80",
  },
  {
    key: "started_issues",
    title: "Started",
    color: "#FF813380",
  },
  {
    key: "completed_issues",
    title: "Completed",
    color: "#26D95080",
  },
  {
    key: "cancelled_issues",
    title: "Cancelled",
    color: "#FF333350",
  },
];
