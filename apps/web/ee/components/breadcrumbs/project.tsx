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
// ui
// components
import { ProjectBreadcrumb as CEProjectBreadcrumb } from "@/ce/components/breadcrumbs/project";
// hooks
import { useProject } from "@/hooks/store/use-project";
import { useAppRouter } from "@/hooks/use-app-router";
// local components
import { WithFeatureFlagHOC } from "../../../core/components/feature-flags";

type TProjectBreadcrumbProps = {
  workspaceSlug: string;
  projectId: string;
};

export const ProjectBreadcrumb = observer(function ProjectBreadcrumb(props: TProjectBreadcrumbProps) {
  const { workspaceSlug, projectId } = props;
  // router
  const router = useAppRouter();
  // store hooks
  const { getPartialProjectById } = useProject();

  const currentProjectDetails = getPartialProjectById(projectId);

  if (!currentProjectDetails) return null;

  const handleOnClick = () => {
    router.push(`/${workspaceSlug}/projects/${currentProjectDetails.id}/issues/`);
  };

  return (
    <WithFeatureFlagHOC
      workspaceSlug={workspaceSlug?.toString()}
      flag="PROJECT_OVERVIEW"
      fallback={<CEProjectBreadcrumb workspaceSlug={workspaceSlug} projectId={projectId} />}
    >
      <CEProjectBreadcrumb workspaceSlug={workspaceSlug} projectId={projectId} handleOnClick={handleOnClick} />
    </WithFeatureFlagHOC>
  );
});
