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

import { mergeAttributes, Node } from "@tiptap/core";
// constants
import { CORE_EXTENSIONS } from "@/constants/extension";

type TableRowOptions = {
  HTMLAttributes: Record<string, unknown>;
};

export const TableRow = Node.create<TableRowOptions>({
  name: CORE_EXTENSIONS.TABLE_ROW,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      background: {
        default: null,
      },
      textColor: {
        default: null,
      },
    };
  },

  content: "(tableCell | tableHeader)*",

  tableRole: "row",

  parseHTML() {
    return [{ tag: "tr" }];
  },

  renderHTML({ HTMLAttributes }) {
    const style = HTMLAttributes.background
      ? `background-color: ${HTMLAttributes.background}; color: ${HTMLAttributes.textColor}`
      : "";

    const attributes = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { style });

    return ["tr", attributes, 0];
  },
});
