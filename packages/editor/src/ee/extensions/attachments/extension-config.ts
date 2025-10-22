import { mergeAttributes, Node } from "@tiptap/core";
// plane editor imports
import { ADDITIONAL_EXTENSIONS } from "@/plane-editor/constants/extensions";
// local imports
import {
  type AttachmentExtension,
  AttachmentExtensionStorage,
  EAttachmentBlockAttributeNames,
  type InsertAttachmentComponentProps,
  type TAttachmentBlockAttributes,
} from "./types";
import { DEFAULT_ATTACHMENT_BLOCK_ATTRIBUTES } from "./utils";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    [ADDITIONAL_EXTENSIONS.ATTACHMENT]: {
      insertAttachmentComponent: (props: InsertAttachmentComponentProps) => ReturnType;
    };
  }
  interface Storage {
    [ADDITIONAL_EXTENSIONS.ATTACHMENT]: AttachmentExtensionStorage;
  }
}

export const CustomAttachmentExtensionConfig: AttachmentExtension = Node.create({
  name: ADDITIONAL_EXTENSIONS.ATTACHMENT,
  group: "block",
  atom: true,

  addAttributes() {
    const attributes = {
      ...Object.values(EAttachmentBlockAttributeNames).reduce(
        (acc, value) => {
          acc[value] = {
            default: DEFAULT_ATTACHMENT_BLOCK_ATTRIBUTES[value],
          };
          return acc;
        },
        {} as Record<
          EAttachmentBlockAttributeNames,
          { default: TAttachmentBlockAttributes[EAttachmentBlockAttributeNames] }
        >
      ),
    };
    return attributes;
  },

  parseHTML() {
    return [
      {
        tag: "attachment-component",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["attachment-component", mergeAttributes(HTMLAttributes)];
  },
});
