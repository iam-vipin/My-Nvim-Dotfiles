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

import { Mark, mergeAttributes } from "@tiptap/core";
// plane editor imports
import { ADDITIONAL_EXTENSIONS } from "@/plane-editor/constants/extensions";
// local imports
import { commentMarkCommands } from "./commands";
import {
  createClickHandlerPlugin,
  createHoverHandlerPlugin,
  createCommentsOrderPlugin,
  createCommentHighlightPlugin,
  TrackCommentDeletionPlugin,
  TrackCommentRestorationPlugin,
} from "./plugins";
import type { TCommentMarkOptions, TCommentMarkStorage, TCommentMarkAttributes } from "./types";
import { ECommentMarkCSSClasses, ECommentAttributeNames, DEFAULT_COMMENT_ATTRIBUTES } from "./types";

declare module "@tiptap/core" {
  interface Storage {
    [ADDITIONAL_EXTENSIONS.COMMENTS]: TCommentMarkStorage;
  }
}

export const CommentsExtensionConfig = Mark.create<TCommentMarkOptions, TCommentMarkStorage>({
  name: ADDITIONAL_EXTENSIONS.COMMENTS,
  excludes: "",
  exitable: true,
  inclusive: false,

  addStorage() {
    return {
      commentsOrder: [],
      deletedComments: new Map<string, boolean>(),
    };
  },

  addOptions() {
    return {
      isFlagged: false,
      shouldHideComment: false,
    };
  },

  addAttributes() {
    const attributes = {
      // Reduce instead of map to accumulate the attributes directly into an object
      ...Object.values(ECommentAttributeNames).reduce(
        (acc, value) => {
          acc[value] = {
            default: DEFAULT_COMMENT_ATTRIBUTES[value],
          };
          return acc;
        },
        {} as Record<ECommentAttributeNames, { default: TCommentMarkAttributes[ECommentAttributeNames] }>
      ),
    };
    return attributes;
  },

  parseHTML() {
    return [
      {
        tag: `span[${ECommentAttributeNames.COMMENT_ID}]`,
        getAttrs: (element: Element) => ({
          commentId: element.getAttribute(ECommentAttributeNames.COMMENT_ID),
          resolved: element.getAttribute(ECommentAttributeNames.RESOLVED) === "true",
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const isResolved = HTMLAttributes[ECommentAttributeNames.RESOLVED] === true;

    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        class: this.options.shouldHideComment
          ? ""
          : isResolved
            ? `${ECommentMarkCSSClasses.BASE} ${ECommentMarkCSSClasses.RESOLVED}`
            : `${ECommentMarkCSSClasses.BASE} ${ECommentMarkCSSClasses.ACTIVE} relative cursor-pointer transition-all duration-200 ease-out ${ECommentMarkCSSClasses.BACKGROUND} hover:bg-[#FFBF66]/40`,
      }),
      0,
    ];
  },

  addProseMirrorPlugins() {
    const { onCommentClick, onCommentDelete, onCommentRestore } = this.options;

    const plugins = [
      // Click handler plugin
      createClickHandlerPlugin({
        onCommentClick,
        isTouchDevice: this.editor.storage.utility?.isTouchDevice,
      }),
      // Hover handler plugin
      createHoverHandlerPlugin(),
      // Highlight handler plugin for comment mark decorations
      createCommentHighlightPlugin(),
      // Comments order tracking plugin
      createCommentsOrderPlugin({ storage: this.storage }),
    ];

    // Add comment tracking plugin if handlers provided
    if (onCommentDelete && onCommentRestore) {
      plugins.push(
        TrackCommentRestorationPlugin(this.editor, onCommentRestore),
        TrackCommentDeletionPlugin(this.editor, onCommentDelete)
      );
    }

    return plugins;
  },

  addCommands() {
    return commentMarkCommands(this.type);
  },
});
