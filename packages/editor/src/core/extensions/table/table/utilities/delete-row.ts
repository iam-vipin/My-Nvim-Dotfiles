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

import type { Command } from "@tiptap/core";
import { deleteRow, deleteTable } from "@tiptap/pm/tables";
// local imports
import { isCellSelection } from "./helpers";

export const deleteRowOrTable: () => Command =
  () =>
  ({ state, dispatch }) => {
    const { selection } = state;

    // Check if we're in a ProseMirrorTable and have a cell selection
    if (!isCellSelection(selection)) {
      return false;
    }

    // Get the ProseMirrorTable and calculate total rows
    const tableStart = selection.$anchorCell.start(-1);
    const selectedTable = state.doc.nodeAt(tableStart - 1);

    if (!selectedTable) return false;

    // Count total rows by examining the table's children
    const totalRows = selectedTable.childCount;

    // If only one row exists, delete the entire ProseMirrorTable
    if (totalRows === 1) {
      return deleteTable(state, dispatch);
    }

    // Otherwise, proceed with normal row deletion
    return deleteRow(state, dispatch);
  };
