"use client";

import type { FC } from "react";
import { observer } from "mobx-react";
// hooks
import type { TClickUpConfig } from "@plane/etl/clickup";
import type { TImportJob } from "@plane/types";
// assets
import ClickUpLogo from "@/app/assets/services/clickup.svg?url";
// plane web imports
import { useClickUpImporter } from "@/plane-web/hooks/store";
// components
import { BaseDashboard } from "../../common/dashboard/base-dashboard";

export const ClickUpDashboardRoot: FC = observer(() => {
  const getWorkspaceName = (job: TImportJob<TClickUpConfig>) => job?.config?.space?.name || "---";
  const getProjectName = (job: TImportJob<TClickUpConfig>) => job?.config?.folder?.name || "---";
  const getPlaneProject = (job: TImportJob<TClickUpConfig>) => job?.config?.planeProject;

  return (
    <BaseDashboard
      config={{
        getWorkspaceName,
        getProjectName,
        getPlaneProject,
        serviceName: "ClickUp",
        logo: ClickUpLogo,
        swrKey: "CLICKUP_IMPORTER",
      }}
      useImporterHook={useClickUpImporter}
    />
  );
});
