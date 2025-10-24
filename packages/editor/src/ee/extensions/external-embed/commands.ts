import type { RawCommands } from "@tiptap/core";
import type { NodeType } from "@tiptap/pm/model";
import tldjs from "tldjs";
import { v4 as uuidv4 } from "uuid";
// types
import { EExternalEmbedAttributeNames, EExternalEmbedEntityType, TExternalEmbedBlockAttributes } from "@/types";
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
