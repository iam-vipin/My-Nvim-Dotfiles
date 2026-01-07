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

import type { KeyboardShortcutCommand } from "@tiptap/core";
// constants
import { CORE_EXTENSIONS } from "@/constants/extension";
// helpers
import { findParentNodeOfType } from "@/helpers/common";

export const insertLineAboveTableAction: KeyboardShortcutCommand = ({ editor }) => {
  // Check if the current selection or the closest node is a table
  if (!editor.isActive(CORE_EXTENSIONS.TABLE)) return false;

  try {
    // Get the current selection
    const { selection } = editor.state;

    // Find the table node and its position
    const tableNode = findParentNodeOfType(selection, [CORE_EXTENSIONS.TABLE]);
    if (!tableNode) return false;

    const tablePos = tableNode.pos;

    // Determine if the selection is in the first row of the table
    const firstRow = tableNode.node.child(0);
    const selectionPath = (selection.$anchor as any).path;
    const selectionInFirstRow = selectionPath.includes(firstRow);

    if (!selectionInFirstRow) return false;

    // Check if the table is at the very start of the document or its parent node
    if (tablePos === 0) {
      // The table is at the start, so just insert a paragraph at the current position
      editor.chain().insertContentAt(tablePos, { type: "paragraph" }).run();
      editor
        .chain()
        .setTextSelection(tablePos + 1)
        .run();
    } else {
      // The table is not at the start, check for the node immediately before the table
      const prevNodePos = tablePos - 1;

      if (prevNodePos <= 0) return false;

      const prevNode = editor.state.doc.nodeAt(prevNodePos - 1);

      if (prevNode && prevNode.type.name === CORE_EXTENSIONS.PARAGRAPH) {
        // If there's a paragraph before the table, move the cursor to the end of that paragraph
        const endOfParagraphPos = tablePos - prevNode.nodeSize;
        editor.chain().setTextSelection(endOfParagraphPos).run();
      } else {
        return false;
      }
    }

    return true;
  } catch (e) {
    console.error("failed to insert line above table", e);
    return false;
  }
};
