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

import { useEffect } from "react";
import { observer } from "mobx-react";
import { useParams, usePathname } from "next/navigation";
import useSWR from "swr";
// components
import { PageHead } from "@/components/core/page-title";
import { ProjectRoot } from "@/components/project/root";
// hooks
import { useProject } from "@/hooks/store/use-project";
import { useWorkspace } from "@/hooks/store/use-workspace";
// plane web components
import { WorkspaceProjectsRoot } from "@/plane-web/components/projects";
import { useProjectFilter, useWorkspaceFeatures } from "@/plane-web/hooks/store";
import { useFlag } from "@/plane-web/hooks/store/use-flag";
import { EWorkspaceFeatures } from "@/plane-web/types/workspace-feature";
import { EProjectLayouts } from "@/plane-web/types/workspace-project-filters";

export const ProjectPageRoot = observer(function ProjectPageRoot() {
  // router
  const { workspaceSlug } = useParams();
  const pathname = usePathname();
  // store
  const { currentWorkspace } = useWorkspace();
  const { isWorkspaceFeatureEnabled } = useWorkspaceFeatures();
  const { fetchProjects } = useProject();
  const { updateAttributes, updateLayout } = useProjectFilter();
  // derived values
  const pageTitle = currentWorkspace?.name ? `${currentWorkspace?.name} - Projects` : undefined;
  const currentWorkspaceId = currentWorkspace?.id;
  const isProjectGroupingFlagEnabled = useFlag(workspaceSlug.toString(), "PROJECT_GROUPING");
  const isProjectGroupingEnabled =
    isWorkspaceFeatureEnabled(EWorkspaceFeatures.IS_PROJECT_GROUPING_ENABLED) && isProjectGroupingFlagEnabled;
  const isArchived = pathname.includes("/archives");

  // fetching workspace projects
  useSWR(
    workspaceSlug && currentWorkspace ? `WORKSPACE_PROJECTS_${workspaceSlug}` : null,
    workspaceSlug && currentWorkspace ? () => fetchProjects(workspaceSlug.toString()) : null,
    { revalidateIfStale: false, revalidateOnFocus: false }
  );

  useEffect(() => {
    if (isArchived) {
      updateAttributes(workspaceSlug.toString(), "archived", true, isArchived);
      updateLayout(workspaceSlug.toString(), EProjectLayouts.GALLERY, isArchived);
    } else {
      updateAttributes(workspaceSlug.toString(), "archived", false, isArchived);
    }
  }, [isArchived, updateAttributes, updateLayout, workspaceSlug]);

  if (!currentWorkspaceId || !workspaceSlug) return <></>;
  return (
    <>
      <PageHead title={pageTitle} />

      {isProjectGroupingEnabled ? (
        <div className="h-full w-full overflow-hidden">
          <WorkspaceProjectsRoot
            workspaceSlug={workspaceSlug.toString()}
            workspaceId={currentWorkspaceId}
            isArchived={isArchived}
          />
        </div>
      ) : (
        <ProjectRoot />
      )}
    </>
  );
});
