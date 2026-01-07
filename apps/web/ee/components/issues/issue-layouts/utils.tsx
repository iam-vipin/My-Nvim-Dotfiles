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

// types
import type { FC } from "react";
import { useParams } from "next/navigation";
import { ISSUE_GROUP_BY_OPTIONS } from "@plane/constants";
import { Logo } from "@plane/propel/emoji-icon-picker";
import type { ISvgIcons } from "@plane/propel/icons";
import { CustomerRequestIcon, CustomersIcon, MilestoneIcon } from "@plane/propel/icons";
import type {
  IGroupByColumn,
  IIssueDisplayProperties,
  TGetColumns,
  TIssueGroupByOptions,
  TSpreadsheetColumn,
} from "@plane/types";
import { getMilestoneIconProps } from "@plane/utils";
// components
import type { TGetScopeMemberIdsResult } from "@/ce/components/issues/issue-layouts/utils";
import {
  SpreadSheetPropertyIconMap as CeSpreadSheetPropertyIconMap,
  SPREADSHEET_COLUMNS as CE_SPREAD_SHEET_COLUMNS,
  getScopeMemberIds as getCeScopeMemberIds,
} from "@/ce/components/issues/issue-layouts/utils";
// store
import { store } from "@/lib/store-context";
import {
  SpreadsheetCustomerColumn,
  SpreadSheetCustomerRequestColumn,
} from "@/plane-web/components/issues/issue-layouts/spreadsheet";
import { useMilestones } from "@/plane-web/hooks/store/use-milestone";

export const getScopeMemberIds = ({ isWorkspaceLevel, projectId }: TGetColumns): TGetScopeMemberIdsResult => {
  // store values
  const { currentTeamspaceMemberIds } = store.teamspaceRoot.teamspaces;

  if (store.router.teamspaceId) {
    return { memberIds: currentTeamspaceMemberIds ?? [], includeNone: false };
  }

  return getCeScopeMemberIds({ isWorkspaceLevel, projectId });
};

export const getTeamProjectColumns = (): IGroupByColumn[] | undefined => {
  const { projectMap } = store.projectRoot.project;
  const { currentTeamspaceProjectIds } = store.teamspaceRoot.teamspaces;
  // Return undefined if no project ids
  if (!currentTeamspaceProjectIds) return;
  // Map project ids to project columns
  return currentTeamspaceProjectIds
    .map((projectId: string) => {
      const project = projectMap[projectId];
      if (!project) return;
      return {
        id: project.id,
        name: project.name,
        icon: (
          <div className="w-6 h-6 grid place-items-center flex-shrink-0">
            <Logo logo={project.logo_props} />
          </div>
        ),
        payload: { project_id: project.id },
      };
    })
    .filter((column) => column !== undefined) as IGroupByColumn[];
};

export const SpreadSheetPropertyIconMap: Record<string, FC<ISvgIcons>> = {
  ...CeSpreadSheetPropertyIconMap,
  CustomersIcon: CustomersIcon,
  CustomerRequestIcon: CustomerRequestIcon,
};

export const SPREADSHEET_COLUMNS: { [key in keyof IIssueDisplayProperties]: TSpreadsheetColumn } = {
  ...CE_SPREAD_SHEET_COLUMNS,
  customer_count: SpreadsheetCustomerColumn,
  customer_request_count: SpreadSheetCustomerRequestColumn,
};

export const getMilestoneColumns = (): IGroupByColumn[] | undefined => {
  const { projectId, workspaceSlug } = store.router;
  const { getProjectMilestoneIds, getMilestoneById, isMilestonesEnabled } = store.milestone;

  if (!projectId || !workspaceSlug) return;

  const isMilestonesFeatureEnabled = isMilestonesEnabled(workspaceSlug, projectId);

  if (!isMilestonesFeatureEnabled) return;

  const projectMilestoneIds = getProjectMilestoneIds(projectId);

  if (!projectMilestoneIds) return;

  const milestoneColumns: IGroupByColumn[] = [
    {
      id: "None",
      name: "None",
      icon: <MilestoneIcon className="w-4 h-4 text-primary" />,
      payload: {},
    },
  ];

  projectMilestoneIds.map((milestoneId) => {
    const milestone = getMilestoneById(projectId.toString(), milestoneId);
    if (!milestone) return;
    milestoneColumns.push({
      id: milestone.id,
      name: milestone.title,
      icon: <MilestoneIcon className="w-4 h-4" {...getMilestoneIconProps(milestone.progress_percentage)} />,
      payload: { milestone_id: milestone.id },
    });
  });

  return milestoneColumns;
};

export const useGroupByOptions = (
  options: TIssueGroupByOptions[]
): { key: TIssueGroupByOptions; titleTranslationKey: string }[] => {
  // router
  const { workspaceSlug, projectId } = useParams();
  // store hooks
  const { isMilestonesEnabled } = useMilestones();

  //derived values
  const groupByOptions = ISSUE_GROUP_BY_OPTIONS.filter((option) => options.includes(option.key));

  if (!workspaceSlug || !projectId) return groupByOptions;

  const isMilestonesFeatureEnabled = isMilestonesEnabled(workspaceSlug.toString(), projectId.toString());

  const FEATURES_STATUS_MAP: Record<string, boolean> = {
    milestone: isMilestonesFeatureEnabled,
  };

  // filter out options that are not enabled
  const enabledGroupByOptions = groupByOptions.filter((option) => {
    if (option.key === null) return true;
    const isEnabled = FEATURES_STATUS_MAP[option.key];
    if (isEnabled === undefined) return true;
    return isEnabled;
  });

  return enabledGroupByOptions;
};
