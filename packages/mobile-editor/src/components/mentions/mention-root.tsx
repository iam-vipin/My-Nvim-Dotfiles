// plane imports
import type { TCallbackMentionComponentProps } from "@plane/editor";
// local components
import { EditorUserMention } from "./user-mention";

type EditorMentionsRootProps = TCallbackMentionComponentProps & {
  currentUserId: string;
};

export const EditorMentionsRoot: React.FC<EditorMentionsRootProps> = (props) => {
  const { entity_identifier, entity_name, currentUserId } = props;

  switch (entity_name) {
    case "user_mention":
      return <EditorUserMention id={entity_identifier} currentUserId={currentUserId} />;
    default:
      return null;
  }
};
