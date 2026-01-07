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

import { Placeholder } from "@tiptap/extension-placeholder";
// constants
import { CORE_EXTENSIONS } from "@/constants/extension";
// types
import type { IEditorProps } from "@/types";

type TArgs = {
  placeholder: IEditorProps["placeholder"];
  showPlaceholderOnEmpty: IEditorProps["showPlaceholderOnEmpty"];
};

export const CustomPlaceholderExtension = (args: TArgs) => {
  const { placeholder, showPlaceholderOnEmpty = false } = args;

  return Placeholder.configure({
    placeholder: ({ editor, node }) => {
      if (!editor.isEditable) return "";

      if (node.type.name === CORE_EXTENSIONS.HEADING) return `Heading ${node.attrs.level}`;

      const isUploadInProgress = editor.storage.utility?.uploadInProgress;

      if (isUploadInProgress) return "";

      const shouldHidePlaceholder =
        editor.isActive(CORE_EXTENSIONS.TABLE) ||
        editor.isActive(CORE_EXTENSIONS.CODE_BLOCK) ||
        editor.isActive(CORE_EXTENSIONS.IMAGE) ||
        editor.isActive(CORE_EXTENSIONS.CUSTOM_IMAGE);

      if (shouldHidePlaceholder) return "";

      if (showPlaceholderOnEmpty) {
        const isDocumentEmpty = editor.state.doc.textContent.length === 0;
        if (!isDocumentEmpty) {
          return "";
        }
      }

      if (placeholder) {
        if (typeof placeholder === "string") return placeholder;
        else return placeholder(editor.isFocused, editor.getHTML());
      }

      return "Press '/' for commands...";
    },
    includeChildren: true,
  });
};
