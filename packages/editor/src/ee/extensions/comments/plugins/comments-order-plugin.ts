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

import { Plugin, PluginKey } from "@tiptap/pm/state";
// plane editor imports
import { ADDITIONAL_EXTENSIONS } from "@/plane-editor/constants/extensions";
// local imports
import type { TCommentMarkAttributes, TCommentMarkStorage } from "../types";
import { ECommentAttributeNames } from "../types";

export type TCommentsOrderPluginOptions = {
  storage: TCommentMarkStorage;
};

export const createCommentsOrderPlugin = (options: TCommentsOrderPluginOptions) => {
  const { storage } = options;

  return new Plugin({
    key: new PluginKey("commentsOrderTracker"),
    appendTransaction: (transactions, oldState, newState) => {
      // Skip if no document changes
      const hasDocChanges = transactions.some((tr) => tr.docChanged);
      if (!hasDocChanges || oldState.doc.eq(newState.doc)) {
        return null;
      }

      const commentPositions: { commentId: string; position: number }[] = [];

      // Traverse the document to find all comment marks and their positions
      newState.doc.descendants((node, pos) => {
        node.marks.forEach((mark) => {
          const markAttrs = mark.attrs as TCommentMarkAttributes;
          if (mark.type.name === ADDITIONAL_EXTENSIONS.COMMENTS && markAttrs[ECommentAttributeNames.COMMENT_ID]) {
            // Check if this commentId is already in our array
            const existingIndex = commentPositions.findIndex(
              (item) => item.commentId === markAttrs[ECommentAttributeNames.COMMENT_ID]
            );

            if (existingIndex === -1) {
              // If not found, add it with current position
              commentPositions.push({
                commentId: markAttrs[ECommentAttributeNames.COMMENT_ID],
                position: pos,
              });
            } else {
              // If found, update with the earliest position (closest to document start)
              if (pos < commentPositions[existingIndex].position) {
                commentPositions[existingIndex].position = pos;
              }
            }
          }
        });
      });

      // Sort by position and update storage
      const newCommentOrder = commentPositions.sort((a, b) => a.position - b.position).map((item) => item.commentId);

      // Only update storage if order has changed
      const currentOrder = storage.commentsOrder;
      if (JSON.stringify(currentOrder) !== JSON.stringify(newCommentOrder)) {
        storage.commentsOrder = newCommentOrder;
      }

      return null;
    },
  });
};
