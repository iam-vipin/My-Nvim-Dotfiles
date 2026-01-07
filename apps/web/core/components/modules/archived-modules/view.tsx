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
// assets
import AllFiltersImage from "@/app/assets/empty-state/module/all-filters.svg?url";
import NameFilterImage from "@/app/assets/empty-state/module/name-filter.svg?url";
// components
import { ModuleListItem, ModulePeekOverview } from "@/components/modules";
// ui
import { CycleModuleListLayoutLoader } from "@/components/ui/loader/cycle-module-list-loader";
// hooks
import { useModule } from "@/hooks/store/use-module";
import { useModuleFilter } from "@/hooks/store/use-module-filter";

export interface IArchivedModulesView {
  workspaceSlug: string;
  projectId: string;
}

export const ArchivedModulesView = observer(function ArchivedModulesView(props: IArchivedModulesView) {
  const { workspaceSlug, projectId } = props;
  // store hooks
  const { getFilteredArchivedModuleIds, loader } = useModule();
  const { archivedModulesSearchQuery } = useModuleFilter();
  // derived values
  const filteredArchivedModuleIds = getFilteredArchivedModuleIds(projectId);

  if (loader || !filteredArchivedModuleIds) return <CycleModuleListLayoutLoader />;

  if (filteredArchivedModuleIds.length === 0)
    return (
      <div className="h-full w-full grid place-items-center">
        <div className="text-center">
          <img
            src={archivedModulesSearchQuery.trim() === "" ? AllFiltersImage : NameFilterImage}
            className="h-36 sm:h-48 w-36 sm:w-48 mx-auto"
            alt="No matching modules"
          />
          <h5 className="text-18 font-medium mt-7 mb-1">No matching modules</h5>
          <p className="text-placeholder text-14">
            {archivedModulesSearchQuery.trim() === ""
              ? "Remove the filters to see all modules"
              : "Remove the search criteria to see all modules"}
          </p>
        </div>
      </div>
    );

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex h-full w-full justify-between">
        <div className="flex h-full w-full flex-col overflow-y-auto vertical-scrollbar scrollbar-lg">
          {filteredArchivedModuleIds.map((moduleId) => (
            <ModuleListItem key={moduleId} moduleId={moduleId} />
          ))}
        </div>
        <ModulePeekOverview
          projectId={projectId?.toString() ?? ""}
          workspaceSlug={workspaceSlug?.toString() ?? ""}
          isArchived
        />
      </div>
    </div>
  );
});
