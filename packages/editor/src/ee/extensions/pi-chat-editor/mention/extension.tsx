import Mention from "@tiptap/extension-mention";
import { mergeAttributes, ReactNodeViewRenderer } from "@tiptap/react";
// local imports
import { PiChatEditorMentionNodeView, PiChatEditorMentionNodeViewProps } from "./node-view";
import {
  EPiChatEditorAttributeNames,
  type PiChatEditorMentionOptions,
  type PiChatMentionSearchCallbackResponse,
} from "./types";
import { renderPiChatEditorMentionsDropdown } from "./utils";

type Props = {
  searchCallback?: (query: string) => Promise<PiChatMentionSearchCallbackResponse>;
};

export const PiChatEditorMentionExtension = (props: Props) => {
  const { searchCallback } = props;

  return Mention.extend<PiChatEditorMentionOptions>({
    addStorage() {
      return {
        mentionsOpen: false,
      };
    },

    addAttributes() {
      return {
        [EPiChatEditorAttributeNames.ID]: {
          default: null,
        },
        [EPiChatEditorAttributeNames.LABEL]: {
          default: null,
        },
        [EPiChatEditorAttributeNames.TARGET]: {
          default: null,
        },
        [EPiChatEditorAttributeNames.SELF]: {
          default: false,
        },
        [EPiChatEditorAttributeNames.REDIRECT_URI]: {
          default: "/",
        },
        [EPiChatEditorAttributeNames.ENTITY_IDENTIFIER]: {
          default: null,
        },
        [EPiChatEditorAttributeNames.ENTITY_NAME]: {
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

    addNodeView() {
      return ReactNodeViewRenderer((props) => (
        <PiChatEditorMentionNodeView {...props} node={props.node as PiChatEditorMentionNodeViewProps["node"]} />
      ));
    },
  }).configure({
    HTMLAttributes: {
      class: "mention",
    },
    suggestion: {
      render: renderPiChatEditorMentionsDropdown({
        searchCallback,
      }),
    },
  });
};
