// local imports
import type { TIssue, TSearchEntities, TStateGroups } from "..";

export type TEditorEmbedType = "issue";
export type TEditorMentionType = Extract<TSearchEntities, "issue_mention">;

export type TEditorWorkItemEmbed = Pick<
  TIssue,
  "id" | "name" | "sequence_id" | "project_id" | "priority" | "type_id"
> & {
  project__identifier: string;
  state__group: TStateGroups;
  state__name: string;
};

export type TEditorWorkItemMention = Pick<TIssue, "id" | "name" | "sequence_id" | "project_id" | "type_id"> & {
  project__identifier: string;
  state__group: TStateGroups;
  state__name: string;
};

export type TEditorEmbedItem = TEditorWorkItemEmbed;
export type TEditorMentionItem = TEditorWorkItemMention;

export type TEditorEmbedsResponse = TEditorEmbedItem[];
export type TEditorMentionsResponse = TEditorMentionItem[];
