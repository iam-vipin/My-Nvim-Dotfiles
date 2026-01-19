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

import { observer } from "mobx-react";
import useSWR from "swr";
// ce imports
import type { IProjectAuthWrapper } from "@/ce/layouts/project-wrapper";
// hooks
import {
  EPICS_PROPERTIES_AND_OPTIONS,
  PROJECT_MILESTONES,
  PROJECT_WORKFLOWS,
  WORK_ITEM_TYPES_PROPERTIES_AND_OPTIONS,
} from "@/constants/fetch-keys";
// hooks
import { useUserPermissions } from "@/hooks/store/user";
import { useProjectState } from "@/hooks/store/use-project-state";
// layouts
import { ProjectAuthWrapper as CoreProjectAuthWrapper } from "@/layouts/auth-layout/project-wrapper";
// plane web imports
import { useFlag, useIssueTypes } from "@/plane-web/hooks/store";
import { useMilestones } from "@/plane-web/hooks/store/use-milestone";

export const ProjectAuthWrapper = observer(function ProjectAuthWrapper(props: IProjectAuthWrapper) {
  // props
  const { workspaceSlug, projectId, children } = props;
  // store hooks
  const { getProjectRoleByWorkspaceSlugAndProjectId } = useUserPermissions();
  const {
    isWorkItemTypeEnabledForProject,
    isEpicEnabledForProject,
    fetchAllWorkItemTypePropertiesAndOptions,
    fetchAllEpicPropertiesAndOptions,
  } = useIssueTypes();
  const { fetchWorkflowStates } = useProjectState();
  const { fetchMilestones, isMilestonesEnabled } = useMilestones();
  // derived values
  const currentProjectRole = getProjectRoleByWorkspaceSlugAndProjectId(workspaceSlug, projectId);
  const isWorkItemTypeEnabled = projectId ? isWorkItemTypeEnabledForProject(workspaceSlug, projectId) : false;
  const isEpicEnabled = projectId ? isEpicEnabledForProject(workspaceSlug, projectId) : false;
  const isWorkflowFeatureFlagEnabled = useFlag(workspaceSlug, "WORKFLOWS");
  const isMilestonesFeatureEnabled = projectId ? isMilestonesEnabled(workspaceSlug, projectId) : false;
  // fetching all work item types and properties
  useSWR(
    isWorkItemTypeEnabled ? WORK_ITEM_TYPES_PROPERTIES_AND_OPTIONS(projectId, currentProjectRole) : null,
    isWorkItemTypeEnabled ? () => fetchAllWorkItemTypePropertiesAndOptions(workspaceSlug, projectId) : null,
    { revalidateIfStale: false, revalidateOnFocus: false }
  );

  // fetching all epic types and properties
  useSWR(
    isEpicEnabled ? EPICS_PROPERTIES_AND_OPTIONS(projectId, currentProjectRole) : null,
    isEpicEnabled ? () => fetchAllEpicPropertiesAndOptions(workspaceSlug, projectId) : null,
    { revalidateIfStale: false, revalidateOnFocus: false }
  );

  // fetching project level workflow states
  useSWR(
    isWorkflowFeatureFlagEnabled ? PROJECT_WORKFLOWS(projectId, currentProjectRole) : null,
    () => fetchWorkflowStates(workspaceSlug, projectId),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
    }
  );

  // fetching project level milestones
  useSWR(
    isMilestonesFeatureEnabled ? PROJECT_MILESTONES(projectId, currentProjectRole) : null,
    isMilestonesFeatureEnabled ? () => fetchMilestones(workspaceSlug, projectId) : null,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return (
    <CoreProjectAuthWrapper workspaceSlug={workspaceSlug} projectId={projectId}>
      {children}
    </CoreProjectAuthWrapper>
  );
});
