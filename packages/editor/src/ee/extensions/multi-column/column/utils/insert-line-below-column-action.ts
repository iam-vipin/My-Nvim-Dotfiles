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

import { ADDITIONAL_EXTENSIONS } from "@plane/utils";
import type { KeyboardShortcutCommand } from "@tiptap/core";
// constants
import { CORE_EXTENSIONS } from "@/constants/extension";
// helpers
import { findParentNodeOfType } from "@/helpers/common";

export const insertLineBelowColumnAction: KeyboardShortcutCommand = ({ editor }) => {
  // Check if the current selection or the closest node is a column
  if (!editor.isActive(ADDITIONAL_EXTENSIONS.COLUMN)) return false;

  try {
    // Get the current selection
    const { selection } = editor.state;

    // Find the column node and its position
    const columnNode = findParentNodeOfType(selection, [ADDITIONAL_EXTENSIONS.COLUMN]);
    if (!columnNode) return false;

    const columnPos = columnNode.pos;
    const column = columnNode.node;

    // Determine if the selection is in the last row of the column
    const rowCount = column.childCount;
    const lastRow = column.child(rowCount - 1);
    const selectionPath = (selection.$anchor as any).path;
    const selectionInLastRow = selectionPath.includes(lastRow);

    if (!selectionInLastRow) return false;

    // Calculate the position immediately after the column
    const nextNodePos = columnPos + column.nodeSize;

    // Check for an existing node immediately after the column
    const nextNode = editor.state.doc.nodeAt(nextNodePos);

    if (nextNode && nextNode.type.name === CORE_EXTENSIONS.PARAGRAPH) {
      // If the next node is an paragraph, move the cursor there
      const endOfParagraphPos = nextNodePos + nextNode.nodeSize - 1;
      editor.chain().setTextSelection(endOfParagraphPos).run();
    } else if (!nextNode) {
      // If the next node doesn't exist i.e. we're at the end of the document, create and insert a new empty node there
      editor.chain().insertContentAt(nextNodePos, { type: CORE_EXTENSIONS.PARAGRAPH }).run();
      editor
        .chain()
        .setTextSelection(nextNodePos + 1)
        .run();
    } else {
      return false;
    }

    return true;
  } catch (e) {
    console.error("failed to insert line above column", e);
    return false;
  }
};
