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

import React, { useRef } from "react";
import { observer } from "mobx-react";
// plane imports
import { SPREADSHEET_SELECT_GROUP } from "@plane/constants";
// components
import { MultipleSelectGroup } from "@/components/core/multiple-select";
// plane web imports
import { SPREADSHEET_PROPERTY_LIST } from "@/plane-web/constants/project/spreadsheet";
import { useBulkOperationStatus } from "@/plane-web/hooks/use-bulk-operation-status";
// types
import type { TProject } from "@/types/projects";
import type { TProjectDisplayFilters } from "@/types/workspace-project-filters";
// local components
import { SpreadsheetTable } from "./spreadsheet-table";

type Props = {
  displayFilters: TProjectDisplayFilters;
  handleDisplayFilterUpdate: (data: Partial<TProjectDisplayFilters>) => void;
  projectIds: string[] | undefined;
  updateProject: ((projectId: string | null, data: Partial<TProject>) => Promise<TProject>) | undefined;
  canEditProperties: (projectId: string | undefined) => boolean;
};

export const SpreadsheetView = observer(function SpreadsheetView(props: Props) {
  const { displayFilters, handleDisplayFilterUpdate, projectIds, updateProject, canEditProperties } = props;
  // refs
  const containerRef = useRef<HTMLTableElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  // plane web hooks
  const isBulkOperationsEnabled = useBulkOperationStatus();

  if (!projectIds || projectIds.length === 0) return <></>;
  return (
    <div className="relative flex h-full w-full flex-col overflow-x-hidden whitespace-nowrap rounded-lg bg-layer-1 text-secondary">
      <div ref={portalRef} className="spreadsheet-menu-portal" />
      <MultipleSelectGroup
        containerRef={containerRef}
        entities={{
          [SPREADSHEET_SELECT_GROUP]: projectIds,
        }}
        disabled={!isBulkOperationsEnabled}
      >
        {(helpers) => (
          <>
            <div ref={containerRef} className="vertical-scrollbar horizontal-scrollbar scrollbar-lg h-full w-full">
              <SpreadsheetTable
                displayFilters={displayFilters}
                handleDisplayFilterUpdate={handleDisplayFilterUpdate}
                projectIds={projectIds}
                portalElement={portalRef}
                updateProject={updateProject}
                canEditProperties={canEditProperties}
                containerRef={containerRef}
                spreadsheetColumnsList={SPREADSHEET_PROPERTY_LIST}
                selectionHelpers={helpers}
              />
            </div>
          </>
        )}
      </MultipleSelectGroup>
    </div>
  );
});
