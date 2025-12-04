import Mention from "@tiptap/extension-mention";
import { mergeAttributes, ReactNodeViewRenderer } from "@tiptap/react";
// local imports
import type { PI_CHAT_EXTENSIONS } from "@plane/utils";
import type { PiChatEditorMentionNodeViewProps } from "./node-view";
import { PiChatEditorMentionNodeView } from "./node-view";
import { EPiChatEditorAttributeNames } from "./types";
import type {
  PiChatEditorMentionOptions,
  PiChatMentionSearchCallbackResponse,
  PiChatEditorMentionAttributes,
} from "./types";
import { renderPiChatEditorMentionsDropdown } from "./utils";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    [PI_CHAT_EXTENSIONS.MENTION]: {
      addChatContext: (attributes: PiChatEditorMentionAttributes) => ReturnType;
    };
  }
}

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

    addCommands() {
      return {
        addChatContext:
          (attributes: PiChatEditorMentionAttributes) =>
          ({ editor, chain }) => {
            const currentHTML = editor.getHTML();
            const isEmpty = !currentHTML || currentHTML === "<p></p>" || currentHTML.trim() === "";

            // Helper to create mention content with optional trailing text
            const createMentionContent = (trailingText = "") => [
              { type: this.name, attrs: attributes },
              { type: "text", text: trailingText ? ` ${trailingText}` : " " },
            ];

            // Case 1: Empty query - insert mention directly
            if (isEmpty) {
              return chain().insertContent(createMentionContent()).focus().run();
            }

            // Parse HTML to check if it starts with a mention
            const parser = new DOMParser();
            const doc = parser.parseFromString(currentHTML, "text/html");
            const firstParagraph = doc.querySelector("p");
            const firstChild = firstParagraph?.firstChild;
            const startsWithMention =
              firstChild?.nodeType === Node.ELEMENT_NODE &&
              (firstChild as HTMLElement).tagName.toLowerCase() === "mention-component";

            let textToPreserve = "";

            if (startsWithMention) {
              // Case 2: Query starts with mention - extract text after mention
              const fullText = firstParagraph?.textContent || "";
              const mentionLabel = (firstChild as HTMLElement).textContent || "";
              textToPreserve = fullText.substring(mentionLabel.length);
            } else {
              // Case 3: Query doesn't start with mention - preserve all text
              textToPreserve = doc.body?.textContent || "";
            }

            // Clear and insert new mention with preserved text
            return chain().clearContent().insertContent(createMentionContent(textToPreserve.trimStart())).focus().run();
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
