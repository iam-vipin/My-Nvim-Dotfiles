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

import type { TChartData } from "./charts";
import type { TLogoProps } from "./common";
import type { TCycleGroups } from "./cycle";
import type { TModuleStatus } from "./module";

export type TAnalyticsTabsExtended = "users" | "projects" | "cycles" | "modules" | "intake";
export type TAnalyticsGraphsExtended = "users" | "project-status" | "cycles" | "modules" | "intake";

export type AnalyticsTableDataMapExtended = {
  users: UserInsightColumns;
  projects: ProjectInsightColumns;
  cycles: CycleInsightColumns;
  modules: ModuleInsightColumns;
  intake: IntakeInsightColumns;
};

export interface UserInsightColumns {
  display_name: string;
  user_id: string;
  avatar_url: string;
  cancelled_work_items: number;
  completed_work_items: number;
  backlog_work_items: number;
  un_started_work_items: number;
  started_work_items: number;
  created_work_items: number;
}

export interface ProjectInsightColumns {
  id: string;
  name: string;
  identifier: string;
  total_work_items: number;
  completed_work_items: number;
  total_epics: number;
  total_intake: number;
  total_cycles: number;
  total_modules: number;
  total_members: number;
  total_pages: number;
  total_views: number;
  logo_props: TLogoProps;
}

export interface CycleInsightColumns {
  id: string;
  name: string;
  project__name: string;
  owned_by_id: string;
  start_date: string;
  end_date: string;
  total_issues: number;
  completed_issues: number;
  cancelled_issues: number;
  unstarted_issues: number;
  started_issues: number;
  status: TCycleGroups;
  project__logo_props: TLogoProps;
}

export interface ModuleInsightColumns {
  id: string;
  name: string;
  project__name: string;
  start_date: string;
  target_date: string;
  lead_id: string;
  total_issues: number;
  completed_issues: number;
  cancelled_issues: number;
  unstarted_issues: number;
  started_issues: number;
  project__logo_props: TLogoProps;
  status: TModuleStatus;
}

export interface IntakeInsightColumns {
  project_id: string;
  project__name: string;
  total_work_items: number;
  accepted_intake: number;
  rejected_intake: number;
  duplicate_intake: number;
  project__logo_props: TLogoProps;
}

export interface ICycleProgressData extends TChartData<string, string> {
  backlog_issues: number;
  cancelled_issues: number;
  completed_issues: number;
  count: number;
  started_issues: number;
  status: TCycleGroups;
  total_issues: number;
  unstarted_issues: number;
  start_date?: string;
  end_date?: string;
}

export interface IModuleProgressData extends TChartData<string, string> {
  key: string;
  name: string;
  count: number;
  total_issues: number;
  completed_issues: number;
  unstarted_issues: number;
  started_issues: number;
  cancelled_issues: number;
  status: TModuleStatus;
  start_date?: string;
  target_date?: string;
}
