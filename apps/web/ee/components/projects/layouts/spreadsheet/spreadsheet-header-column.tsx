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

import { useRef } from "react";
//types
import { observer } from "mobx-react";
import type { IProjectDisplayProperties } from "@/constants/project/spreadsheet";
import type { TProjectDisplayFilters } from "@/types/workspace-project-filters";
//components

import { HeaderColumn } from "./columns/header-column";

interface Props {
  property: keyof IProjectDisplayProperties;
  displayFilters: TProjectDisplayFilters;
  handleDisplayFilterUpdate: (data: Partial<TProjectDisplayFilters>) => void;
}
export const SpreadsheetHeaderColumn = observer(function SpreadsheetHeaderColumn(props: Props) {
  const { displayFilters, property, handleDisplayFilterUpdate } = props;

  //hooks
  const tableHeaderCellRef = useRef<HTMLTableCellElement | null>(null);

  return (
    <th
      className="h-11 w-full min-w-40 max-w-80 items-center bg-layer-1 text-13 font-medium px-4 py-1 border border-b-0 border-t-0 border-subtle"
      ref={tableHeaderCellRef}
      tabIndex={0}
    >
      <HeaderColumn
        displayFilters={displayFilters}
        handleDisplayFilterUpdate={handleDisplayFilterUpdate}
        property={property}
        onClose={() => {
          tableHeaderCellRef?.current?.focus();
        }}
      />
    </th>
  );
});
