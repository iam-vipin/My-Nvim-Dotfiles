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
// local imports
import { EMathAttributeNames } from "../types";
// types
import type {
  TInlineMathSetCommandOptions,
  TInlineMathUnsetCommandOptions,
  TInlineMathUpdateCommandOptions,
} from "./types";

export const inlineMathCommands = (nodeType: NodeType): Partial<RawCommands> => ({
  setInlineMath:
    (options: TInlineMathSetCommandOptions) =>
    ({ editor, tr }) => {
      const { latex, pos } = options;
      const targetPos = pos ?? editor.state.selection.$from.pos;

      const mathStorage = editor.storage.mathematics;
      if (mathStorage) {
        mathStorage.openMathModal = true;
      }

      tr.replaceWith(targetPos, targetPos, nodeType.create({ latex, [EMathAttributeNames.ID]: uuidv4() }));
      return true;
    },

  unsetInlineMath:
    (options?: TInlineMathUnsetCommandOptions) =>
    ({ editor, tr }) => {
      const pos = options?.pos ?? editor.state.selection.$from.pos;
      const node = editor.state.doc.nodeAt(pos);

      if (!node || node.type.name !== nodeType.name) {
        return false;
      }

      tr.delete(pos, pos + node.nodeSize);
      return true;
    },

  updateInlineMath:
    (options?: TInlineMathUpdateCommandOptions) =>
    ({ editor, tr }) => {
      const { latex, removeIfEmpty = false } = options || {};
      let pos = options?.pos;

      if (pos === undefined) {
        pos = editor.state.selection.$from.pos;
      }

      const node = editor.state.doc.nodeAt(pos);

      if (!node || node.type.name !== nodeType.name) {
        return false;
      }

      const finalLatex = latex !== undefined ? latex : node.attrs.latex;

      // Only remove the node if explicitly requested and content is empty
      if (removeIfEmpty && (!finalLatex || !finalLatex.trim())) {
        tr.delete(pos, pos + node.nodeSize);
        return true;
      }

      tr.setNodeMarkup(pos, nodeType, {
        ...node.attrs, // Preserve all existing attributes
        latex: finalLatex, // Only update latex
      });

      return true;
    },
});
