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
import type { MentionOptions } from "@tiptap/extension-mention";
import Mention from "@tiptap/extension-mention";
import type { MarkdownSerializerState } from "@tiptap/pm/markdown";
import type { Node as NodeType } from "@tiptap/pm/model";
// plane imports
import type { CORE_EXTENSIONS } from "@plane/utils";
// types
import type { TMentionHandler } from "@/types";
// local types
import type { TMentionComponentAttributes } from "./types";
import { EMentionComponentAttributeNames } from "./types";

export type TMentionExtensionOptions = MentionOptions & {
  renderComponent: TMentionHandler["renderComponent"];
  getMentionedEntityDetails: TMentionHandler["getMentionedEntityDetails"];
};

declare module "@tiptap/core" {
  interface Storage {
    [CORE_EXTENSIONS.MENTION]: {
      mentionsOpen: boolean;
    };
  }
}

export const CustomMentionExtensionConfig = Mention.extend<TMentionExtensionOptions>({
  addAttributes() {
    return {
      [EMentionComponentAttributeNames.ID]: {
        default: null,
      },
      [EMentionComponentAttributeNames.ENTITY_IDENTIFIER]: {
        default: null,
      },
      [EMentionComponentAttributeNames.ENTITY_NAME]: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "mention-component",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["mention-component", mergeAttributes(HTMLAttributes)];
  },

  renderText({ node }) {
    return getMentionDisplayText(this.options, node);
  },

  addStorage() {
    const options = this.options;
    return {
      markdown: {
        serialize(state: MarkdownSerializerState, node: NodeType) {
          state.write(getMentionDisplayText(options, node));
        },
      },
    };
  },
});

function getMentionDisplayText(options: TMentionExtensionOptions, node: NodeType): string {
  const attrs = node.attrs as TMentionComponentAttributes;
  const mentionEntityId = attrs[EMentionComponentAttributeNames.ENTITY_IDENTIFIER];
  const mentionEntityDetails = options.getMentionedEntityDetails?.(mentionEntityId ?? "");
  return `@${mentionEntityDetails?.display_name ?? attrs[EMentionComponentAttributeNames.ID] ?? mentionEntityId}`;
}
