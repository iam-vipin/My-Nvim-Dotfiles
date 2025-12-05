"use client";

import { observer } from "mobx-react";
import { Outlet } from "react-router";
// plane imports
import { EUserPermissions, EUserPermissionsLevel } from "@plane/constants";
// components
import { NotAuthorizedView } from "@/components/auth-screens/not-authorized-view";
import { PageHead } from "@/components/core/page-title";
// hooks
import { useProject } from "@/hooks/store/use-project";
import { useUserPermissions } from "@/hooks/store/user/user-permissions";
// plane web imports
import { EpicsEmptyState } from "@/plane-web/components/epics/settings/empty-state";
import { useProjectAdvanced } from "@/plane-web/hooks/store/projects/use-projects";
import type { Route } from "./+types/layout";

function EpicsLayout({ params }: Route.ComponentProps) {
  // router
  const { workspaceSlug, projectId } = params;
  // store hooks
  const { getProjectById } = useProject();
  const { getProjectFeatures } = useProjectAdvanced();
  const { allowPermissions } = useUserPermissions();
  // derived values
  const project = getProjectById(projectId);
  const projectFeatures = getProjectFeatures(projectId);
  const isEpicsEnabled = projectFeatures?.is_epic_enabled;

  const pageTitle = project?.name ? `${project?.name} - Epics` : undefined;

  if (project && !isEpicsEnabled)
    return (
      <div className="flex items-center justify-center h-full w-full">
        <EpicsEmptyState workspaceSlug={workspaceSlug} projectId={projectId} redirect />
      </div>
    );

  const isAuthorized = allowPermissions(
    [EUserPermissions.ADMIN, EUserPermissions.MEMBER],
    EUserPermissionsLevel.PROJECT
  );

  if (!isAuthorized) {
    return (
      <>
        <PageHead title={pageTitle} />
        <div className="flex size-full items-center justify-center">
          <NotAuthorizedView isProjectView />;
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead title={pageTitle} />
      <Outlet />
    </>
  );
}

export default observer(EpicsLayout);
