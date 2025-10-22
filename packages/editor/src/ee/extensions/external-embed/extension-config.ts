import { mergeAttributes, Node } from "@tiptap/core";
// constants
import { ADDITIONAL_EXTENSIONS } from "@/plane-editor/constants/extensions";
// types
import { EExternalEmbedAttributeNames, type TExternalEmbedBlockAttributes } from "@/plane-editor/types/external-embed";
import type { ExternalEmbedExtension, ExternalEmbedExtensionStorage, InsertExternalEmbedCommandProps } from "./types";
// utils
import { DEFAULT_EXTERNAL_EMBED_ATTRIBUTES } from "./utils/attribute";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    [ADDITIONAL_EXTENSIONS.EXTERNAL_EMBED]: {
      insertExternalEmbed: (props: InsertExternalEmbedCommandProps) => ReturnType;
    };
  }
  interface Storage {
    [ADDITIONAL_EXTENSIONS.EXTERNAL_EMBED]: ExternalEmbedExtensionStorage;
  }
}

export const ExternalEmbedExtensionConfig: ExternalEmbedExtension = Node.create({
  name: ADDITIONAL_EXTENSIONS.EXTERNAL_EMBED,
  group: "block",
  atom: true,
  isolating: true,
  defining: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    const attributes = {
      ...Object.values(EExternalEmbedAttributeNames).reduce(
        (acc, value) => {
          acc[value] = {
            default: DEFAULT_EXTERNAL_EMBED_ATTRIBUTES[value],
          };
          return acc;
        },
        {} as Record<
          EExternalEmbedAttributeNames,
          { default: TExternalEmbedBlockAttributes[EExternalEmbedAttributeNames] }
        >
      ),
    };
    return attributes;
  },

  parseHTML() {
    return [
      {
        tag: "external-embed-component",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["external-embed-component", mergeAttributes(HTMLAttributes)];
  },
});
