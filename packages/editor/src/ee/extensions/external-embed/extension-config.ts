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
import { ADDITIONAL_EXTENSIONS } from "@/plane-editor/constants/extensions";
// types
import { EExternalEmbedAttributeNames } from "@/plane-editor/types/external-embed";
import type { TExternalEmbedBlockAttributes } from "@/plane-editor/types/external-embed";
import type { ExternalEmbedExtension, ExternalEmbedExtensionStorage, InsertExternalEmbedCommandProps } from "./types";
// utils
import { DEFAULT_EXTERNAL_EMBED_ATTRIBUTES } from "./utils/attribute";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    [ADDITIONAL_EXTENSIONS.EXTERNAL_EMBED]: {
      insertExternalEmbed: (props: InsertExternalEmbedCommandProps) => ReturnType;
    };
  }
  interface Storage {
    [ADDITIONAL_EXTENSIONS.EXTERNAL_EMBED]: ExternalEmbedExtensionStorage;
  }
}

export const ExternalEmbedExtensionConfig: ExternalEmbedExtension = Node.create({
  name: ADDITIONAL_EXTENSIONS.EXTERNAL_EMBED,
  group: "block",
  atom: true,
  isolating: true,
  defining: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    const attributes = {
      ...Object.values(EExternalEmbedAttributeNames).reduce(
        (acc, value) => {
          acc[value] = {
            default: DEFAULT_EXTERNAL_EMBED_ATTRIBUTES[value],
          };
          return acc;
        },
        {} as Record<
          EExternalEmbedAttributeNames,
          { default: TExternalEmbedBlockAttributes[EExternalEmbedAttributeNames] }
        >
      ),
    };
    return attributes;
  },

  parseHTML() {
    return [
      {
        tag: "external-embed-component",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["external-embed-component", mergeAttributes(HTMLAttributes)];
  },
});
