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

import { mergeAttributes } from "@tiptap/core";
import { Image as BaseImageExtension } from "@tiptap/extension-image";
// constants
import { CORE_EXTENSIONS } from "@/constants/extension";
// local imports
import { ECustomImageAttributeNames } from "./types";
import type {
  CustomImageExtensionOptions,
  TCustomImageAttributes,
  CustomImageExtensionType,
  CustomImageExtensionStorage,
  InsertImageComponentProps,
} from "./types";
import { DEFAULT_CUSTOM_IMAGE_ATTRIBUTES } from "./utils";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    [CORE_EXTENSIONS.CUSTOM_IMAGE]: {
      insertImageComponent: ({ file, pos, event }: InsertImageComponentProps) => ReturnType;
    };
  }
  interface Storage {
    [CORE_EXTENSIONS.CUSTOM_IMAGE]: CustomImageExtensionStorage;
  }
}

export const CustomImageExtensionConfig: CustomImageExtensionType = BaseImageExtension.extend<
  CustomImageExtensionOptions,
  CustomImageExtensionStorage
>({
  name: CORE_EXTENSIONS.CUSTOM_IMAGE,
  group: "block",
  atom: true,

  addAttributes() {
    const attributes = {
      ...this.parent?.(),
      ...Object.values(ECustomImageAttributeNames).reduce(
        (acc, value) => {
          acc[value] = {
            default: DEFAULT_CUSTOM_IMAGE_ATTRIBUTES[value],
          };
          return acc;
        },
        {} as Record<ECustomImageAttributeNames, { default: TCustomImageAttributes[ECustomImageAttributeNames] }>
      ),
    };

    return attributes;
  },

  parseHTML() {
    return [
      {
        tag: "image-component",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["image-component", mergeAttributes(HTMLAttributes)];
  },
});
