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

import { findChildren } from "@tiptap/core";
import type { EditorView } from "@tiptap/pm/view";
// types
import type { UniqueIDOptions } from "./extension";

/**
 * Finds duplicate items in an array using Set for O(n) performance.
 * Much faster than the naive O(n²) indexOf approach.
 */
export function findDuplicates(items: any[]): any[] {
  const seen = new Set();
  const duplicates = new Set<any>();

  for (const item of items) {
    if (seen.has(item)) {
      duplicates.add(item);
    } else {
      seen.add(item);
    }
  }

  return Array.from(duplicates);
}

/**
 * Utility function to create IDs for nodes that don't have them
 */
export const createIdsForView = (view: EditorView, options: UniqueIDOptions) => {
  const { state } = view;
  const { tr, doc } = state;
  const { types, attributeName, generateUniqueID } = options;

  // size > 2 means more than just the default empty paragraph
  const hasContent = doc.content.size > 2;
  if (!hasContent) {
    return;
  }

  const nodesWithoutId = findChildren(
    doc,
    (node) => types.includes(node.type.name) && node.attrs[attributeName] === null
  );

  nodesWithoutId.forEach(({ node, pos }) => {
    tr.setNodeMarkup(pos, undefined, {
      ...node.attrs,
      [attributeName]: generateUniqueID({ node, pos }),
    });
  });

  tr.setMeta("addToHistory", false);
  tr.setMeta("uniqueIdOnlyChange", true);

  view.dispatch(tr);
};
