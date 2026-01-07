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

export enum ERecurringWorkItemRunLogStatus {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export type TRecurringWorkItemRunLog = {
  created_at: string;
  created_by: string | null;
  deleted_at: string | null;
  error_message: string | null;
  finished_at: string;
  id: string;
  project: string;
  recurring_task: string;
  started_at: string;
  status: ERecurringWorkItemRunLogStatus;
  task_id: string;
  updated_at: string;
  updated_by: string | null;
  workitem: string;
  workitem_sequence_id: number;
  workspace: string;
};
