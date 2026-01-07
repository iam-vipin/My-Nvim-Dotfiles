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
import type { PageEmbedExtensionAttributes } from "./extension-config";

export const pageEmbedCommands = (nodeType: NodeType): Partial<RawCommands> => ({
  insertPageEmbed:
    ({ pageId, workspaceSlug, position }) =>
    ({ commands, chain, editor, dispatch }) => {
      const transactionId = uuidv4();
      let success = false;

      if (position) {
        // Insert at specific position
        success = commands.insertContentAt(position, {
          type: nodeType.name,
          attrs: {
            id: transactionId,
            entity_identifier: pageId,
            workspace_identifier: workspaceSlug,
            entity_name: "sub_page",
          } as PageEmbedExtensionAttributes,
        });

        if (success && dispatch && editor) {
          // Find the inserted node to determine its end position
          const nodeEndPos = position + (editor.state?.doc.nodeAt(position)?.nodeSize || 0);

          // Check if there's already a paragraph after this node
          const nodeAfter = editor.state.doc.nodeAt(nodeEndPos);

          if (!nodeAfter || nodeAfter.type.name !== "paragraph") {
            // No paragraph after, create one
            chain()
              .insertContentAt(nodeEndPos, { type: "paragraph" })
              .setTextSelection(nodeEndPos + 1)
              .run();
          } else {
            // Paragraph exists, just move cursor there
            chain()
              .setTextSelection(nodeEndPos + 1)
              .run();
          }
        }
      } else {
        // Insert at current position
        success = commands.insertContent({
          type: nodeType.name,
          attrs: {
            id: transactionId,
            entity_identifier: pageId,
            workspace_identifier: workspaceSlug,
            entity_name: "sub_page",
          } as PageEmbedExtensionAttributes,
        });

        if (success && dispatch) {
          // After insertion, create a paragraph or focus on existing one
          chain().createParagraphNear().focus().run();
        }
      }

      return success;
    },
});
