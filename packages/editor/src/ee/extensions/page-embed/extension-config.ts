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
import type { EPageAccess } from "@plane/constants";
import { ADDITIONAL_EXTENSIONS } from "@/plane-editor/constants/extensions";

export type PageEmbedExtensionAttributes = {
  entity_identifier?: string;
  workspace_identifier?: string;
  locked?: boolean;
  archived?: boolean;
  access?: EPageAccess;
  id?: string;
  entity_name?: string;
};

export const PageEmbedExtensionConfig = Node.create({
  name: ADDITIONAL_EXTENSIONS.PAGE_EMBED_COMPONENT,
  group: "block",
  atom: true,

  addAttributes() {
    return {
      entity_identifier: {
        default: undefined,
      },
      workspace_identifier: {
        default: undefined,
      },
      id: {
        default: undefined,
      },
      entity_name: {
        default: "sub_page",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "page-embed-component",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["page-embed-component", mergeAttributes(HTMLAttributes)];
  },

  addStorage() {
    return {
      deletedPageSet: new Map<string, boolean>(),
    };
  },
});
