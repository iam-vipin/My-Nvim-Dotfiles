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

import type { Editor } from "@tiptap/react";

export const insertContentAtSavedSelection = (editor: Editor, content: string) => {
  if (!editor || editor.isDestroyed) {
    console.error("Editor reference is not available or has been destroyed.");
    return;
  }

  if (!editor.state.selection) {
    console.error("Saved selection is invalid.");
    return;
  }

  const docSize = editor.state.doc.content.size;
  const safePosition = Math.max(0, Math.min(editor.state.selection.anchor, docSize));

  try {
    editor.chain().focus().insertContentAt(safePosition, content).run();
  } catch (error) {
    console.error("An error occurred while inserting content at saved selection:", error);
  }
};
