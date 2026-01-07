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

// add types which will be used in methods

import type { ExProject, ExState } from "@plane/sdk";
import type {
  TClickUpFolder,
  TClickUpSpace,
  TClickUpStatus,
  TClickUpPriority,
  TClickUpTeam,
  TClickUpUser,
  TClickUpList,
  TClickUpTask,
  TClickUpTag,
  TClickUpCustomTaskType,
  TClickUpCustomField,
  TClickUpComment,
} from "./entities";

export type TClickUpStateConfig = {
  source_state: TClickUpStatus;
  target_state: ExState;
};

export type TClickUpPriorityConfig = {
  source_priority: TClickUpPriority;
  target_priority: string;
};

export type TClickUpConfig = {
  issues: number;
  users: TClickUpUser[];
  team: TClickUpTeam;
  space: TClickUpSpace;
  statuses: TClickUpStatus[];
  folder: TClickUpFolder;
  folders?: TClickUpFolder[];
  planeProject: ExProject;
  label: string[];
  state: TClickUpStateConfig[];
  priority: TClickUpPriorityConfig[];
  skipUserImport: boolean;
  skipAdditionalDataImport: boolean;
};

export type TClickUpListsWithTasks = TClickUpList & {
  tasks: TClickUpTask[];
};

export type TClickUpTaskWithComments = { taskId: string; comment: TClickUpComment };
export type TClickUpCustomFieldWithTaskType = {
  customTaskType: TClickUpCustomTaskType;
  customField: TClickUpCustomField;
};

export type TClickUpEntity = {
  users: TClickUpUser[];
  listsWithTasks: TClickUpListsWithTasks[];
  tasks: TClickUpTask[];
  taskComments: TClickUpTaskWithComments[];
  tags: TClickUpTag[];
  statuses: TClickUpStatus[];
  priorities: TClickUpPriority[];
  customTaskTypes: TClickUpCustomTaskType[];
  customFieldsForTaskTypes: TClickUpCustomFieldWithTaskType[];
};

export type TClickUpAuthState = {
  workspaceId: string;
  userId: string;
  personalAccessToken: string;
  appInstallationId: string;
};

export type TClickUpTaskRelation = {
  identifier: string;
  relation: "blocked_by" | "relates_to" | "duplicate" | "parent_id";
};

export type TClickUpRelationMapKey = "issue";

export type TClickUpRelationMap = {
  [key in TClickUpRelationMapKey]: Record<string, TClickUpTaskRelation[]>;
};

export enum E_CLICKUP_IMPORT_PHASE {
  ISSUES = "issues",
  ADDITIONAL_DATA = "additional_data",
}

export enum E_CLICKUP_ADDITIONAL_DATA_MIGRATOR_STEPS {
  PULL = "pull",
  TRANSFORM = "transform",
  PUSH = "push",
}
