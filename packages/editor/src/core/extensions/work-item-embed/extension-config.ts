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

export const WorkItemEmbedExtensionConfig = Node.create({
  name: CORE_EXTENSIONS.WORK_ITEM_EMBED,
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      entity_identifier: {
        default: undefined,
      },
      project_identifier: {
        default: undefined,
      },
      workspace_identifier: {
        default: undefined,
      },
      id: {
        default: undefined,
      },
      entity_name: {
        default: undefined,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "issue-embed-component",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["issue-embed-component", mergeAttributes(HTMLAttributes)];
  },
});
