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

import type { RawCommands } from "@tiptap/core";
import type { NodeType } from "@tiptap/pm/model";
import { v4 as uuidv4 } from "uuid";
// types
import { EMathAttributeNames } from "../types";

export const blockMathCommands = (nodeType: NodeType): Partial<RawCommands> => ({
  setBlockMath:
    (options) =>
    ({ commands, editor }) => {
      const { latex, pos } = options;

      const mathStorage = editor.storage.mathematics;
      if (mathStorage) {
        mathStorage.openMathModal = true;
      }

      return commands.insertContentAt(pos ?? editor.state.selection.from, {
        type: nodeType.name,
        attrs: { latex, [EMathAttributeNames.ID]: uuidv4() },
      });
    },

  unsetBlockMath:
    (options) =>
    ({ editor, tr }) => {
      const pos = options?.pos ?? editor.state.selection.$from.pos;
      const node = editor.state.doc.nodeAt(pos);

      if (!node || node.type.name !== nodeType.name) {
        return false;
      }

      tr.delete(pos, pos + node.nodeSize);
      return true;
    },

  updateBlockMath:
    (options) =>
    ({ editor, tr }) => {
      const { latex } = options || {};
      let pos = options?.pos;

      if (pos === undefined) {
        pos = editor.state.selection.$from.pos;
      }

      const node = editor.state.doc.nodeAt(pos);

      if (!node || node.type.name !== nodeType.name) {
        return false;
      }

      tr.setNodeMarkup(pos, nodeType, {
        ...node.attrs, // Preserve all existing attributes
        latex: latex !== undefined ? latex : node.attrs.latex, // Only update latex
      });

      return true;
    },
});
