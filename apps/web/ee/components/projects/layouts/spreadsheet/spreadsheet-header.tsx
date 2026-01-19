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
// ui

// constants
// hooks
import type { TSelectionHelper } from "@/hooks/use-multiple-select";
import type { IProjectDisplayProperties } from "@/plane-web/constants/project/spreadsheet";
import type { TProjectDisplayFilters } from "@/plane-web/types/workspace-project-filters";
import { SpreadsheetHeaderColumn } from "./spreadsheet-header-column";

interface Props {
  displayFilters: TProjectDisplayFilters;
  handleDisplayFilterUpdate: (data: Partial<TProjectDisplayFilters>) => void;
  canEditProperties: (projectId: string | undefined) => boolean;
  spreadsheetColumnsList: (keyof IProjectDisplayProperties)[];
  selectionHelpers: TSelectionHelper;
}

export const SpreadsheetHeader = observer(function SpreadsheetHeader(props: Props) {
  const { displayFilters, handleDisplayFilterUpdate, spreadsheetColumnsList } = props;

  return (
    <thead className="sticky top-0 left-0 z-[12] border-b-[0.5px] border-subtle">
      <tr>
        <th
          className="group/list-header sticky left-0 z-[15] h-11 w-[28rem] flex items-center gap-1 bg-layer-1 text-13 font-medium before:absolute before:h-full before:right-0 before:border-[0.5px] before:border-subtle pl-4"
          tabIndex={-1}
        >
          <span className="flex h-full w-full flex-grow items-center py-2.5">Projects</span>
        </th>

        {spreadsheetColumnsList.map((property) => (
          <SpreadsheetHeaderColumn
            key={property}
            property={property}
            displayFilters={displayFilters}
            handleDisplayFilterUpdate={handleDisplayFilterUpdate}
          />
        ))}
      </tr>
    </thead>
  );
});
