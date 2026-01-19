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

// ce imports
import { EIssuesStoreType } from "@plane/types";
import type { TGetAdditionalPropsForProjectLevelFiltersHOC } from "@/ce/helpers/work-item-filters/project-level";
import { getAdditionalProjectLevelFiltersHOCProps as getCoreAdditionalProjectLevelFiltersHOCProps } from "@/ce/helpers/work-item-filters/project-level";
// store imports
import { store } from "@/lib/store-context";

export const getAdditionalProjectLevelFiltersHOCProps: TGetAdditionalPropsForProjectLevelFiltersHOC = (params) => {
  const { entityType, workspaceSlug, projectId } = params;
  // derived values
  const isWorkItemTypeEnabled = store.issueTypes.isWorkItemTypeEnabledForProject(workspaceSlug, projectId);
  const isEpicEnabled = store.issueTypes.isEpicEnabledForProject(workspaceSlug, projectId);
  const projectWorkItemTypeIds = store.issueTypes.getProjectIssueTypeIds(projectId);
  const projectMilestoneIds = store.milestone.getProjectMilestoneIds(projectId);
  const isMilestonesFeatureEnabled = store.milestone.isMilestonesEnabled(workspaceSlug, projectId);
  let customPropertyIds: string[] | undefined = undefined;

  // Get custom property IDs based on entity type and feature flags
  if (entityType === EIssuesStoreType.EPIC && isEpicEnabled) {
    // Get epic custom property IDs
    const epicProperties = store.issueTypes.getProjectEpicDetails(projectId)?.properties;
    customPropertyIds = epicProperties?.map((property) => property.id).filter((propertyId) => propertyId !== undefined);
  } else if (isWorkItemTypeEnabled) {
    // Get work item type custom property IDs across all project work item types
    customPropertyIds = projectWorkItemTypeIds
      .flatMap((issueTypeId) => store.issueTypes.getIssueTypeProperties(issueTypeId).map((property) => property.id))
      .filter((propertyId) => propertyId !== undefined);
  }

  return {
    ...getCoreAdditionalProjectLevelFiltersHOCProps({ entityType, workspaceSlug, projectId }),
    workItemTypeIds: isWorkItemTypeEnabled ? projectWorkItemTypeIds : undefined,
    milestoneIds: isMilestonesFeatureEnabled ? projectMilestoneIds : undefined,
    customPropertyIds: customPropertyIds,
  };
};
