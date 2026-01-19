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

import type { MarkdownSerializerState } from "@tiptap/pm/markdown";
import type { Node as NodeType } from "@tiptap/pm/model";
import { ReactNodeViewRenderer } from "@tiptap/react";
// types
import type { TMentionHandler } from "@/types";
// extension config
import { CustomMentionExtensionConfig } from "./extension-config";
// node view
import type { MentionNodeViewProps } from "./mention-node-view";
import { MentionNodeView } from "./mention-node-view";
// types
import { EMentionComponentAttributeNames } from "./types";
// utils
import { renderMentionsDropdown } from "./utils";

export function CustomMentionExtension(props: TMentionHandler) {
  const { searchCallback, renderComponent, getMentionedEntityDetails } = props;
  return CustomMentionExtensionConfig.extend({
    addOptions(this) {
      return {
        ...this.parent?.(),
        renderComponent,
        getMentionedEntityDetails,
      };
    },

    addNodeView() {
      return ReactNodeViewRenderer((props) => (
        <MentionNodeView {...props} node={props.node as MentionNodeViewProps["node"]} />
      ));
    },

    addStorage() {
      return {
        mentionsOpen: false,
        markdown: {
          serialize(state: MarkdownSerializerState, node: NodeType) {
            const label = node.attrs[EMentionComponentAttributeNames.ENTITY_NAME] ?? "user_mention";
            state.write(`@${label}`);
          },
        },
      };
    },
  }).configure({
    suggestion: {
      render: renderMentionsDropdown({
        searchCallback,
      }),
      allowSpaces: true,
    },
  });
}
