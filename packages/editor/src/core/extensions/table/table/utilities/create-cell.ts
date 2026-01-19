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

import type { Fragment, Node as ProsemirrorNode, NodeType } from "@tiptap/pm/model";

export function createCell(
  cellType: NodeType,
  cellContent?: Fragment | ProsemirrorNode | Array<ProsemirrorNode>,
  attrs?: Record<string, unknown>
): ProsemirrorNode | null | undefined {
  if (cellContent) {
    return cellType.createChecked(attrs, cellContent);
  }

  return cellType.createAndFill(attrs);
}
