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
import { useParams } from "next/navigation";
import useSWR from "swr";
// components
import { ProjectRoot } from "@/components/project/root";
// hooks
import { useProject } from "@/hooks/store/use-project";
import { useWorkspace } from "@/hooks/store/use-workspace";

export const ProjectPageRoot = observer(function ProjectPageRoot() {
  // router
  const { workspaceSlug } = useParams();
  // store
  const { currentWorkspace } = useWorkspace();
  const { fetchProjects } = useProject();
  // fetching workspace projects
  useSWR(
    workspaceSlug && currentWorkspace ? `WORKSPACE_PROJECTS_${workspaceSlug}` : null,
    workspaceSlug && currentWorkspace ? () => fetchProjects(workspaceSlug.toString()) : null,
    { revalidateIfStale: false, revalidateOnFocus: false }
  );

  return <ProjectRoot />;
});
