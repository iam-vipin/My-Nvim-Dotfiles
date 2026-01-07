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

import type { Editor } from "@tiptap/core";
import type { Slice } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import { find } from "linkifyjs";

export const EXTERNAL_EMBED_PASTE_PLUGIN_KEY = new PluginKey("externalEmbedPastePlugin");

export const createExternalEmbedPastePlugin = (options: { isFlagged: boolean; editor: Editor }): Plugin =>
  new Plugin({
    key: EXTERNAL_EMBED_PASTE_PLUGIN_KEY,
    props: {
      handlePaste: (view: EditorView, event: ClipboardEvent, slice: Slice) => {
        const { from } = view.state.selection;
        const $from = view.state.doc.resolve(from);
        const paragraphNode = $from.node($from.depth);
        const isEmpty = paragraphNode.content.size === 0;
        let textContent = "";

        slice.content.forEach((node) => {
          textContent += node.textContent;
        });

        const { isFlagged } = options;
        const link = find(textContent).find((item) => item.isLink && item.value === textContent);
        const isWebUrl = link?.href.startsWith("http") || link?.href.startsWith("www");

        if (link?.href && isEmpty && !isFlagged && isWebUrl) {
          const urlText = link.href;
          const to = from + urlText.length;

          const storage = options.editor.storage.externalEmbedComponent;
          if (storage) {
            storage.url = urlText;
            storage.isPasteDialogOpen = true;
            storage.posToInsert = { from, to };
          }
        }

        return false;
      },
    },
  });
