import type { FC } from "react";
import { observer } from "mobx-react";
// hooks
import type { JiraConfig } from "@plane/etl/jira";
import type { TImportJob } from "@plane/types";
// assets
import JiraLogo from "@/app/assets/services/jira.svg?url";
// plane web imports
import { useJiraServerImporter } from "@/plane-web/hooks/store";
// components
import { BaseDashboard } from "../../common/dashboard/base-dashboard";

export const JiraServerDashboardRoot = observer(function JiraServerDashboardRoot() {
  const getWorkspaceName = (job: TImportJob<JiraConfig>) => job.config.resource?.name || "---";
  const getProjectName = (job: TImportJob<JiraConfig>) => job.config.project?.name || "---";
  const getPlaneProject = (job: TImportJob<JiraConfig>) => job.config.planeProject;

  return (
    <BaseDashboard
      config={{
        getWorkspaceName,
        getProjectName,
        getPlaneProject,
        serviceName: "Jira Server/Data Center",
        logo: JiraLogo,
        swrKey: "JIRA_SERVER_IMPORTER",
      }}
      useImporterHook={useJiraServerImporter}
    />
  );
});
