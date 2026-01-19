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

import React from "react";
// helpers
import { cn } from "../utils";
// types
import type { TTableData } from "./types";

export function Table<T>(props: TTableData<T>) {
  const {
    data,
    columns,
    keyExtractor,
    tableClassName = "",
    tHeadClassName = "",
    tHeadTrClassName = "",
    thClassName = "",
    tBodyClassName = "",
    tBodyTrClassName = "",
    tdClassName = "",
  } = props;

  return (
    <table className={cn("table-auto w-full overflow-hidden whitespace-nowrap", tableClassName)}>
      <thead className={cn("divide-y divide-subtle-1", tHeadClassName)}>
        <tr className={cn("divide-x divide-subtle-1 text-13 text-primary", tHeadTrClassName)}>
          {columns.map((column) => (
            <th key={column.key} className={cn("px-2.5 py-2", thClassName)}>
              {(column?.thRender && column?.thRender()) || column.content}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className={cn("divide-y divide-subtle-1", tBodyClassName)}>
        {data.map((item) => (
          <tr
            key={keyExtractor(item)}
            className={cn("divide-x divide-subtle-1 text-13 text-secondary", tBodyTrClassName)}
          >
            {columns.map((column) => (
              <td key={`${column.key}-${keyExtractor(item)}`} className={cn("px-2.5 py-2", tdClassName)}>
                {column.tdRender(item)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
