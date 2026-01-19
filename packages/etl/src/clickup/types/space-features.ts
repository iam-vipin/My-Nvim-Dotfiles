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

import type { TClickUpPriority } from "./entities";
// Feature configurations
export type TClickUpDueDatesFeature = {
  enabled: boolean;
  start_date: boolean;
  remap_due_dates: boolean;
  remap_closed_due_date: boolean;
};

export type TClickUpSprintsFeature = {
  enabled: boolean;
};

export type TClickUpTimeTrackingFeature = {
  enabled: boolean;
  harvest: boolean;
  rollup: boolean;
  default_to_billable: number;
};

export type TClickUpPointsFeature = {
  enabled: boolean;
};

export type TClickUpCustomItemsFeature = {
  enabled: boolean;
};

export type TClickUpPrioritiesFeature = {
  enabled: boolean;
  priorities: TClickUpPriority[];
};

export type TClickUpTagsFeature = {
  enabled: boolean;
};

export type TClickUpTimeEstimatesFeature = {
  enabled: boolean;
  rollup: boolean;
  per_assignee: boolean;
};

export type TClickUpCheckUnresolvedFeature = {
  enabled: boolean;
  subtasks: boolean | null;
  checklists: boolean | null;
  comments: boolean | null;
};

export type TClickUpMilestonesFeature = {
  enabled: boolean;
};

export type TClickUpCustomFieldsFeature = {
  enabled: boolean;
};

export type TClickUpRemapDependenciesFeature = {
  enabled: boolean;
};

export type TClickUpDependencyWarningFeature = {
  enabled: boolean;
};

export type TClickUpStatusPiesFeature = {
  enabled: boolean;
};

export type TClickUpMultipleAssigneesFeature = {
  enabled: boolean;
};

export type TClickUpEmailsFeature = {
  enabled: boolean;
};

// All features combined
export type TClickUpSpaceFeatures = {
  due_dates: TClickUpDueDatesFeature;
  sprints: TClickUpSprintsFeature;
  time_tracking: TClickUpTimeTrackingFeature;
  points: TClickUpPointsFeature;
  custom_items: TClickUpCustomItemsFeature;
  priorities: TClickUpPrioritiesFeature;
  tags: TClickUpTagsFeature;
  time_estimates: TClickUpTimeEstimatesFeature;
  check_unresolved: TClickUpCheckUnresolvedFeature;
  milestones: TClickUpMilestonesFeature;
  custom_fields: TClickUpCustomFieldsFeature;
  remap_dependencies: TClickUpRemapDependenciesFeature;
  dependency_warning: TClickUpDependencyWarningFeature;
  status_pies: TClickUpStatusPiesFeature;
  multiple_assignees: TClickUpMultipleAssigneesFeature;
  emails: TClickUpEmailsFeature;
  scheduler_enabled: boolean;
};
