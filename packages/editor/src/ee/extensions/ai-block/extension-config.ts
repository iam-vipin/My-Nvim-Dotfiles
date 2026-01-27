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

import { Node, mergeAttributes } from "@tiptap/core";
// constants
import { ADDITIONAL_EXTENSIONS } from "@/plane-editor/constants/extensions";
// types
import { EAIBlockAttributeNames } from "./types";
import type { CustomAIBlockExtensionType, TAIBlockAttributes } from "./types";
// utils
import { DEFAULT_AI_BLOCK_ATTRIBUTES } from "./utils";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    [ADDITIONAL_EXTENSIONS.AI_BLOCK]: {
      insertAIBlock: () => ReturnType;
    };
  }
}

export const CustomAIBlockExtensionConfig: CustomAIBlockExtensionType = Node.create({
  name: ADDITIONAL_EXTENSIONS.AI_BLOCK,
  group: "block",
  content: "block+",

  addAttributes() {
    const attributes = {
      ...Object.values(EAIBlockAttributeNames).reduce(
        (acc, value) => {
          acc[value] = {
            default: DEFAULT_AI_BLOCK_ATTRIBUTES[value],
          };
          return acc;
        },
        {} as Record<EAIBlockAttributeNames, { default: TAIBlockAttributes[EAIBlockAttributeNames] }>
      ),
    };

    return attributes;
  },

  parseHTML() {
    return [
      {
        tag: "ai-block-component",
      },
    ];
  },

  // Render HTML for the AI block node
  renderHTML({ HTMLAttributes }) {
    return ["ai-block-component", mergeAttributes(HTMLAttributes), 0];
  },
});
