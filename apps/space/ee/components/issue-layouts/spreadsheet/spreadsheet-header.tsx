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
// types
import type { IIssueDisplayProperties } from "@plane/types";
// components
import { SpreadsheetHeaderColumn } from "./spreadsheet-header-column";

interface Props {
  displayProperties: IIssueDisplayProperties;
  spreadsheetColumnsList: (keyof IIssueDisplayProperties)[];
}

export const SpreadsheetHeader = observer(function SpreadsheetHeader(props: Props) {
  const { displayProperties, spreadsheetColumnsList } = props;
  // router

  return (
    <thead className="sticky top-0 left-0 z-12 border-b-[0.5px] border-subtle">
      <tr>
        <th
          className="group/list-header sticky left-0 z-15 h-11 w-[28rem] flex items-center gap-1 bg-layer-2 text-13 font-medium before:absolute before:h-full before:right-0 before:border-[0.5px] before:border-subtle pl-2"
          tabIndex={-1}
        >
          <span className="flex h-full w-full flex-grow items-center pl-6 py-2.5">Work items</span>
        </th>

        {spreadsheetColumnsList.map((property) => (
          <SpreadsheetHeaderColumn key={property} property={property} displayProperties={displayProperties} />
        ))}
      </tr>
    </thead>
  );
});
