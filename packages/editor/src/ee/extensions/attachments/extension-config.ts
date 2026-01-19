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
// plane editor imports
import { ADDITIONAL_EXTENSIONS } from "@/plane-editor/constants/extensions";
// local imports
import { EAttachmentBlockAttributeNames } from "./types";
import type {
  AttachmentExtensionStorage,
  AttachmentExtension,
  InsertAttachmentComponentProps,
  TAttachmentBlockAttributes,
} from "./types";
import { DEFAULT_ATTACHMENT_BLOCK_ATTRIBUTES } from "./utils";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    [ADDITIONAL_EXTENSIONS.ATTACHMENT]: {
      insertAttachmentComponent: (props: InsertAttachmentComponentProps) => ReturnType;
    };
  }
  interface Storage {
    [ADDITIONAL_EXTENSIONS.ATTACHMENT]: AttachmentExtensionStorage;
  }
}

export const CustomAttachmentExtensionConfig: AttachmentExtension = Node.create({
  name: ADDITIONAL_EXTENSIONS.ATTACHMENT,
  group: "block",
  atom: true,

  addAttributes() {
    const attributes = {
      ...Object.values(EAttachmentBlockAttributeNames).reduce(
        (acc, value) => {
          acc[value] = {
            default: DEFAULT_ATTACHMENT_BLOCK_ATTRIBUTES[value],
          };
          return acc;
        },
        {} as Record<
          EAttachmentBlockAttributeNames,
          { default: TAttachmentBlockAttributes[EAttachmentBlockAttributeNames] }
        >
      ),
    };
    return attributes;
  },

  parseHTML() {
    return [
      {
        tag: "attachment-component",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["attachment-component", mergeAttributes(HTMLAttributes)];
  },
});
