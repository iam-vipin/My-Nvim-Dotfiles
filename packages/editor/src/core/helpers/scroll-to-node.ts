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
// types
import type { IMarking } from "@/types";

function findNthH1(editor: Editor, n: number, level: number): number {
  let count = 0;
  let pos = 0;
  editor.state.doc.descendants((node, position) => {
    if (node.type.name === "heading" && node.attrs.level === level) {
      count++;
      if (count === n) {
        pos = position;
        return false;
      }
    }
  });
  return pos;
}

function scrollToNode(editor: Editor, pos: number): void {
  const headingNode = editor.state.doc.nodeAt(pos);
  if (headingNode) {
    const headingDOM = editor.view.nodeDOM(pos);
    if (headingDOM instanceof HTMLElement) {
      headingDOM.scrollIntoView({ behavior: "smooth" });
    }
  }
}

export function scrollToNodeViaDOMCoordinates(editor: Editor, pos: number, behavior?: ScrollBehavior): void {
  const view = editor.view;

  // Get the coordinates of the position
  const coords = view.coordsAtPos(pos);

  if (coords) {
    // Scroll to the coordinates
    window.scrollTo({
      top: coords.top + window.scrollY - window.innerHeight / 2,
      behavior: behavior,
    });

    // Optionally, you can also focus the editor
    view.focus();
  } else {
    console.warn("Unable to find coordinates for the given position");
  }
}

export function scrollSummary(editor: Editor, marking: IMarking) {
  if (editor) {
    const pos = findNthH1(editor, marking.sequence, marking.level);
    scrollToNode(editor, pos);
  }
}
