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

import { useCallback } from "react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
// hooks
import { useProject } from "@/hooks/store/use-project";
import { useProjectFilter } from "@/plane-web/hooks/store/workspace-project-states/use-project-filters";
import type { TProject } from "@/types/projects";
import type { TProjectDisplayFilters } from "@/types/workspace-project-filters";
import { EProjectLayouts } from "@/types/workspace-project-filters";
import { SpreadsheetView } from "./spreadsheet-view";

export const BaseSpreadsheetRoot = observer(function BaseSpreadsheetRoot() {
  // router
  const { workspaceSlug } = useParams();
  // store hooks

  const { updateProject } = useProject();
  const { getFilteredProjectsByLayout, filters, bulkUpdateDisplayFilters } = useProjectFilter();

  const filteredProjectIds = getFilteredProjectsByLayout(EProjectLayouts.TABLE);

  const handleDisplayFiltersUpdate = useCallback(
    (updatedDisplayFilter: Partial<TProjectDisplayFilters>) => {
      bulkUpdateDisplayFilters(workspaceSlug.toString(), {
        ...updatedDisplayFilter,
      });
    },
    [bulkUpdateDisplayFilters]
  );

  if (!Array.isArray(filteredProjectIds)) return null;

  return (
    <SpreadsheetView
      displayFilters={filters?.display_filters as TProjectDisplayFilters}
      handleDisplayFilterUpdate={handleDisplayFiltersUpdate}
      projectIds={filteredProjectIds}
      updateProject={(projectId, data) => updateProject(workspaceSlug.toString(), projectId || "", data)}
      canEditProperties={() => true}
    />
  );
});
