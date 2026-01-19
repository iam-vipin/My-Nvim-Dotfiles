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
import { ADDITIONAL_EXTENSIONS } from "@/plane-editor/constants/extensions";

export const PageLinkExtensionConfig = Node.create({
  name: ADDITIONAL_EXTENSIONS.PAGE_LINK_COMPONENT,
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
        default: "page_link",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "page-link-component",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["page-link-component", mergeAttributes(HTMLAttributes)];
  },
});
