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

export interface IIssueDisplayProperties {
  assignee?: boolean;
  start_date?: boolean;
  due_date?: boolean;
  labels?: boolean;
  key?: boolean;
  priority?: boolean;
  state?: boolean;
  sub_issue_count?: boolean;
  link?: boolean;
  attachment_count?: boolean;
  estimate?: boolean;
  created_on?: boolean;
  updated_on?: boolean;
  modules?: boolean;
  cycle?: boolean;
  issue_type?: boolean;
}

export const ISSUE_DISPLAY_PROPERTIES: {
  key: keyof IIssueDisplayProperties;
  title: string;
}[] = [
  { key: "key", title: "ID" },
  { key: "issue_type", title: "Issue Type" },
  { key: "assignee", title: "Assignee" },
  { key: "start_date", title: "Start date" },
  { key: "due_date", title: "Due date" },
  { key: "labels", title: "Labels" },
  { key: "priority", title: "Priority" },
  { key: "state", title: "State" },
  { key: "sub_issue_count", title: "Sub issue count" },
  { key: "attachment_count", title: "Attachment count" },
  { key: "link", title: "Link" },
  { key: "estimate", title: "Estimate" },
  { key: "modules", title: "Modules" },
  { key: "cycle", title: "Cycle" },
];
