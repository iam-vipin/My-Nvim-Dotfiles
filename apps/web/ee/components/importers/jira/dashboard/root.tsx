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

import type { FC } from "react";
import { observer } from "mobx-react";
// hooks
import type { JiraConfig } from "@plane/etl/jira";
import type { TImportJob } from "@plane/types";
// assets
import JiraLogo from "@/app/assets/services/jira.svg?url";
// plane web imports
import { useJiraImporter } from "@/plane-web/hooks/store";
// components
import { BaseDashboard } from "../../common/dashboard/base-dashboard";

export const JiraDashboardRoot = observer(function JiraDashboardRoot() {
  const getWorkspaceName = (job: TImportJob<JiraConfig>) => job.config.resource?.name || "---";
  const getProjectName = (job: TImportJob<JiraConfig>) => job.config.project?.name || "---";
  const getPlaneProject = (job: TImportJob<JiraConfig>) => job.config.planeProject;

  return (
    <BaseDashboard
      config={{
        getWorkspaceName,
        getProjectName,
        getPlaneProject,
        serviceName: "Jira",
        logo: JiraLogo,
        swrKey: "JIRA_IMPORTER",
      }}
      useImporterHook={useJiraImporter}
    />
  );
});
