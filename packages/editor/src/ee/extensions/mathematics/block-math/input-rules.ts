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

import { InputRule } from "@tiptap/core";
import type { NodeType } from "@tiptap/pm/model";
// types
import { EMathAttributeNames } from "../types";

export const blockMathInputRules = (nodeType: NodeType, isFlagged: boolean) => [
  new InputRule({
    find: /(?<!\$)\$\$([^$\n]+)\$\$(?!\$)$/,
    handler: ({ state, range, match }) => {
      if (isFlagged) {
        return;
      }
      const [, latex] = match;
      const trimmedLatex = latex.trim();
      const { tr } = state;
      const start = range.from;
      const end = range.to;

      tr.replaceWith(
        start,
        end,
        nodeType.create({
          [EMathAttributeNames.LATEX]: trimmedLatex,
        })
      );
    },
  }),
];
