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

import { Extension } from "@tiptap/core";
import type { Range } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import Suggestion from "@tiptap/suggestion";

export const IssueEmbedSuggestions = Extension.create({
  name: "issue-embed-suggestions",

  addOptions() {
    return {
      suggestion: {
        char: "#workitem_",
        allowSpaces: true,
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: any }) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        pluginKey: new PluginKey("issue-embed-suggestions"),
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});
