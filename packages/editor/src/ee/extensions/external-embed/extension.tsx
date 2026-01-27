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

import { ReactNodeViewRenderer } from "@tiptap/react";
// types
import type { ExternalEmbedNodeViewProps } from "@/types";
// local imports
import { externalEmbedCommands } from "./commands";
import { ExternalEmbedNodeView } from "./components/node-view";
import { ExternalEmbedExtensionConfig } from "./extension-config";
import { createExternalEmbedPastePlugin } from "./plugins";
import type { ExternalEmbedExtensionOptions, ExternalEmbedExtensionStorage, ExternalEmbedProps } from "./types";

export function ExternalEmbedExtension(props: ExternalEmbedProps) {
  return ExternalEmbedExtensionConfig.extend<ExternalEmbedExtensionOptions, ExternalEmbedExtensionStorage>({
    selectable: true,
    draggable: true,

    addOptions() {
      return {
        ...this.parent?.(),
        externalEmbedCallbackComponent: props?.widgetCallback,
        isFlagged: !!props?.isFlagged,
        onClick: props?.onClick,
      };
    },

    addStorage(): ExternalEmbedExtensionStorage {
      return {
        posToInsert: { from: 0, to: 0 },
        url: "",
        openInput: false,
        isPasteDialogOpen: false,
      };
    },

    addProseMirrorPlugins() {
      const isTouchDevice = !!this.editor.storage.utility?.isTouchDevice;
      if (isTouchDevice) {
        return [];
      }
      return [
        createExternalEmbedPastePlugin({
          isFlagged: this.options.isFlagged,
          editor: this.editor,
        }),
      ];
    },

    addCommands() {
      return externalEmbedCommands(this.type);
    },

    addNodeView() {
      return ReactNodeViewRenderer((props) => (
        <ExternalEmbedNodeView {...props} node={props.node as ExternalEmbedNodeViewProps["node"]} />
      ));
    },
  });
}
