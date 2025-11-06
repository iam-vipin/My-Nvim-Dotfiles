"use client";

import type { FC } from "react";
import { observer } from "mobx-react";
// hooks
import type { FlatfileConfig } from "@plane/etl/flatfile";
import type { TImportJob } from "@plane/types";
// assets
import CSVLogo from "@/app/assets/services/csv.svg?url";
// plane web imports
import { useFlatfileImporter } from "@/plane-web/hooks/store";
// components
import { BaseDashboard } from "../../common/dashboard/base-dashboard";

export const FlatfileDashboardRoot: FC = observer(() => {
  const { getProjectById } = useFlatfileImporter();

  const getWorkspaceName = (job: TImportJob<FlatfileConfig>) => job.config.workbookId || "---";
  const getProjectName = (job: TImportJob<FlatfileConfig>) => "---";
  const getPlaneProject = (job: TImportJob<FlatfileConfig>) => {
    if (job.project_id) {
      return getProjectById(job.project_id);
    }
  };

  return (
    <BaseDashboard
      config={{
        getWorkspaceName,
        getProjectName,
        getPlaneProject,
        serviceName: "CSV Importer",
        logo: CSVLogo,
        swrKey: "FLATFILE_IMPORTER",
        hideWorkspace: true,
        hideProject: true,
        hideDeactivate: true,
      }}
      useImporterHook={useFlatfileImporter}
    />
  );
});
