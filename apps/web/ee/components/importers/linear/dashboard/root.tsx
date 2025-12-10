import type { FC } from "react";
import { observer } from "mobx-react";
// hooks
import type { LinearConfig } from "@plane/etl/linear";
import type { TImportJob } from "@plane/types";
// assets
import LinearLogo from "@/app/assets/services/linear.svg?url";
// plane web imports
import { useLinearImporter } from "@/plane-web/hooks/store";
// components
import { BaseDashboard } from "../../common/dashboard/base-dashboard";

export const LinearDashboardRoot = observer(function LinearDashboardRoot() {
  const getWorkspaceName = (job: TImportJob<LinearConfig>) => job?.config?.workspaceDetail?.name || "---";
  const getProjectName = (job: TImportJob<LinearConfig>) =>
    job?.config?.teamDetail?.name || job?.config?.teamName || "---";
  const getPlaneProject = (job: TImportJob<LinearConfig>) => job?.config?.planeProject;

  return (
    <BaseDashboard
      config={{
        getWorkspaceName,
        getProjectName,
        getPlaneProject,
        serviceName: "Linear",
        logo: LinearLogo,
        swrKey: "LINEAR_IMPORTER",
      }}
      useImporterHook={useLinearImporter}
    />
  );
});
