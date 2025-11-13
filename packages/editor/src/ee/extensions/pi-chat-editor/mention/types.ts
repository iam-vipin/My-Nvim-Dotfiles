import type { MentionOptions } from "@tiptap/extension-mention";

export enum EPiChatEditorAttributeNames {
  ID = "id",
  LABEL = "label",
  TARGET = "target",
  SELF = "self",
  REDIRECT_URI = "redirect_uri",
  ENTITY_IDENTIFIER = "entity_identifier",
  ENTITY_NAME = "entity_name",
}

export type PiChatEditorMentionAttributes = {
  [EPiChatEditorAttributeNames.ID]: string | null;
  [EPiChatEditorAttributeNames.LABEL]: string | null;
  [EPiChatEditorAttributeNames.TARGET]: string | null;
  [EPiChatEditorAttributeNames.SELF]: boolean;
  [EPiChatEditorAttributeNames.REDIRECT_URI]: string;
  [EPiChatEditorAttributeNames.ENTITY_IDENTIFIER]: string | null;
  [EPiChatEditorAttributeNames.ENTITY_NAME]: string | null;
};

export type PiChatEditorMentionItem = {
  id: string;
  title: string;
  subTitle: string | undefined;
  icon: React.ReactNode;
};

export type PiChatMentionSearchCallbackResponse = {
  [key: string]: PiChatEditorMentionItem[];
};

export type PiChatEditorMentionOptions = MentionOptions & {
  mentionHighlights: () => Promise<string[]>;
  readonly?: boolean;
};
