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
// components
import { PageHead } from "@/components/core/page-title";
import { ArchivedIssuesHeader } from "@/components/issues/archived-issues-header";
import { ArchivedIssueLayoutRoot } from "@/components/issues/issue-layouts/roots/archived-issue-layout-root";
// hooks
import { useProject } from "@/hooks/store/use-project";
import type { Route } from "./+types/page";

function ProjectArchivedIssuesPage({ params }: Route.ComponentProps) {
  // router
  const { projectId } = params;
  // store hooks
  const { getProjectById } = useProject();
  // derived values
  const project = getProjectById(projectId);
  const pageTitle = project?.name && `${project?.name} - Archived work items`;

  return (
    <>
      <PageHead title={pageTitle} />
      <div className="relative flex h-full w-full flex-col overflow-hidden">
        <ArchivedIssuesHeader />
        <ArchivedIssueLayoutRoot />
      </div>
    </>
  );
}

export default observer(ProjectArchivedIssuesPage);
