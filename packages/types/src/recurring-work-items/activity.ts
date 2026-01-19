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

import type { TProjectBaseActivity } from "../activity";
import type { TRecurringWorkItemRunLog } from "./run-log";

export type TRecurringWorkItemActivityFields =
  | "assignees"
  | "description"
  | "labels"
  | "modules"
  | "name"
  | "priority"
  | "recurring_workitem"
  | "state"
  | "type"
  | "custom_property"
  | "start_at"
  | "end_at"
  | "interval_type"
  | "task_execution";

export type TRecurringWorkItemActivityVerbs = "created" | "added" | "updated" | "removed" | "completed" | "failed";

export type TRecurringWorkItemActivityKeys = `${TRecurringWorkItemActivityFields}_${TRecurringWorkItemActivityVerbs}`;

export type TRecurringWorkItemActivity = TProjectBaseActivity<
  TRecurringWorkItemActivityFields,
  TRecurringWorkItemActivityVerbs
> & {
  property: string | null;
  recurring_workitem_task_log: TRecurringWorkItemRunLog | null;
};
