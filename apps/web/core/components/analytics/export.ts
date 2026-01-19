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

import type { ColumnDef, Row } from "@tanstack/react-table";
import { download, generateCsv, mkConfig } from "export-to-csv";

export const csvConfig = (workspaceSlug: string) =>
  mkConfig({
    fieldSeparator: ",",
    filename: `${workspaceSlug}-analytics`,
    decimalSeparator: ".",
    useKeysAsHeaders: true,
  });

export const exportCSV = <T>(rows: Row<T>[], columns: ColumnDef<T>[], workspaceSlug: string) => {
  const rowData = rows.map((row) => {
    const exportColumns = columns.map((col) => col.meta?.export);
    const cells = exportColumns.reduce((acc: Record<string, string | number>, col) => {
      if (col) {
        const cell = col?.value(row) ?? "-";
        acc[col.label ?? col.key] = cell;
      }
      return acc;
    }, {});
    return cells;
  });
  const csv = generateCsv(csvConfig(workspaceSlug))(rowData);
  download(csvConfig(workspaceSlug))(csv);
};
