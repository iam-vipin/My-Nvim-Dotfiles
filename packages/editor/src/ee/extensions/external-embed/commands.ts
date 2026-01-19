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

import type { RawCommands } from "@tiptap/core";
import type { NodeType } from "@tiptap/pm/model";
import tldjs from "tldjs";
import { v4 as uuidv4 } from "uuid";
// types
import type { TExternalEmbedBlockAttributes } from "@/types";
import { EExternalEmbedAttributeNames, EExternalEmbedEntityType } from "@/types";
// local imports
import { useModifiedEmbedUrl } from "./utils/url-modify";

export const externalEmbedCommands = (nodeType: NodeType): Partial<RawCommands> => ({
  insertExternalEmbed:
    (props) =>
    ({ commands, editor }) => {
      const uniqueID = uuidv4();
      const modifiedUrl = useModifiedEmbedUrl({ url: props[EExternalEmbedAttributeNames.SOURCE] || "" });

      const options: Partial<TExternalEmbedBlockAttributes> = {
        [EExternalEmbedAttributeNames.SOURCE]: modifiedUrl,
        [EExternalEmbedAttributeNames.ID]: uniqueID,
        [EExternalEmbedAttributeNames.IS_RICH_CARD]: props[EExternalEmbedAttributeNames.IS_RICH_CARD],
        [EExternalEmbedAttributeNames.ENTITY_TYPE]: props[EExternalEmbedAttributeNames.IS_RICH_CARD]
          ? EExternalEmbedEntityType.RICH_CARD
          : EExternalEmbedEntityType.EMBED,
        [EExternalEmbedAttributeNames.HAS_EMBED_FAILED]: false,
      };

      if (modifiedUrl) {
        const sourceURL = new URL(modifiedUrl);
        const domain = tldjs.getDomain(modifiedUrl) || tldjs.getSubdomain(modifiedUrl) || sourceURL.hostname;
        const siteName = domain.split(".")[0];
        if (siteName) {
          options[EExternalEmbedAttributeNames.ENTITY_NAME] = siteName;
        }
      } else {
        const storage = editor.storage.externalEmbedComponent;
        if (storage) {
          storage.openInput = true;
        }
      }

      if (props.pos) {
        commands.insertContentAt(props.pos, {
          type: nodeType.name,
          attrs: options,
        });
      } else {
        commands.insertContent({ type: nodeType.name, attrs: options });
      }

      return true;
    },
});
