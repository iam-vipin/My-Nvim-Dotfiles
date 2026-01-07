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

import type { Editor } from "@tiptap/core";
// local imports
import { getCommentSelector } from "../extensions/comments";
import type { TExtendedEditorRefApi } from "../types";

type TArgs = {
  editor: Editor | null;
};

export const getExtenedEditorRefHelpers = (args: TArgs): TExtendedEditorRefApi => {
  const { editor } = args;

  return {
    removeComment: (commentId) => {
      if (!editor) return;
      editor.chain().focus().removeComment(commentId).run();
    },
    setCommentMark: ({ commentId, from, to }) => {
      if (!editor) return;
      editor.chain().focus().setTextSelection({ from, to }).setComment(commentId).run();
    },
    resolveCommentMark: (commentId) => {
      if (!editor) return;
      editor.chain().focus().resolveComment(commentId).run();
    },
    unresolveCommentMark: (commentId) => {
      if (!editor) return;
      editor.chain().focus().unresolveComment(commentId).run();
    },
    hoverCommentMarks: (commentIds) => {
      if (!editor) return;
      editor.commands.hoverComments(commentIds);
    },
    selectCommentMark: (commentId) => {
      if (!editor) return;
      editor.commands.selectComment(commentId);
    },
    scrollToCommentMark: (commentId) => {
      if (!editor || !commentId) return;
      const selector = getCommentSelector(commentId);
      const element = editor.view.dom.querySelector(selector);

      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
  };
};
