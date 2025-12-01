// plane imports
import type { TCallbackMentionComponentProps } from "@plane/editor";
import type { TEditorMentionItem, TEditorMentionType } from "@plane/types";
// local imports
import { EditorWorkItemMention } from "./work-item";

export type TEditorMentionComponentProps = TCallbackMentionComponentProps & {
  getMentionDetails?: (mentionType: TEditorMentionType, entityId: string) => TEditorMentionItem | undefined;
};

export const EditorAdditionalMentionsRoot: React.FC<TEditorMentionComponentProps> = (props) => {
  const { entity_name } = props;

  switch (entity_name) {
    case "issue_mention":
      return <EditorWorkItemMention {...props} />;
  }
};
