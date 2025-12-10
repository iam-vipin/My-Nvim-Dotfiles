import type { FC } from "react";
import { observer } from "mobx-react";
// hooks
import type { AsanaConfig } from "@plane/etl/asana";
import type { TImportJob } from "@plane/types";
// assets
import AsanaLogo from "@/app/assets/services/asana.svg";
// plane web imports
import { useAsanaImporter } from "@/plane-web/hooks/store";
import { BaseDashboard } from "../../common/dashboard/base-dashboard";

export const AsanaDashboardRoot = observer(function AsanaDashboardRoot() {
  const getWorkspaceName = (job: TImportJob<AsanaConfig>) => job.config.workspace?.name || "---";
  const getProjectName = (job: TImportJob<AsanaConfig>) => job.config.project?.name || "---";
  const getPlaneProject = (job: TImportJob<AsanaConfig>) => job.config.planeProject;

  return (
    <BaseDashboard
      config={{
        getWorkspaceName,
        getProjectName,
        getPlaneProject,
        serviceName: "Asana",
        logo: AsanaLogo,
        swrKey: "ASANA_IMPORTER",
      }}
      useImporterHook={useAsanaImporter}
    />
  );
});
