import { useRef, useState } from "react";
import { observer } from "mobx-react";
// plane imports
import type { EditorRefApi } from "@plane/editor";
import type { TCommentsOperations, TIssueComment } from "@plane/types";
// hooks
import { useUser } from "@/hooks/store/user";
// plane web imports
import { CommentCardDisplay } from "@/plane-web/components/comments/card/display";
// local imports
import { ReplyQuickActions } from "./reply-quick-actions";

type Props = {
  workspaceSlug: string;
  entityId: string;
  getReply: () => TIssueComment | undefined;
  activityOperations: TCommentsOperations;
  showAccessSpecifier: boolean;
  projectId?: string;
};

export const ReplyCard = observer(function ReplyCard(props: Props) {
  const { workspaceSlug, entityId, getReply, activityOperations, showAccessSpecifier, projectId } = props;
  // states
  const [isEditing, setIsEditing] = useState(false);
  // refs
  const readOnlyEditorRef = useRef<EditorRefApi>(null);
  // store hooks
  const { data: currentUser } = useUser();
  // derived values
  const reply = getReply();

  if (!reply) return null;

  return (
    <CommentCardDisplay
      activityOperations={activityOperations}
      entityId={entityId}
      comment={reply}
      disabled={false}
      projectId={projectId}
      readOnlyEditorRef={readOnlyEditorRef}
      showAccessSpecifier={showAccessSpecifier}
      workspaceSlug={workspaceSlug}
      workspaceId={reply.workspace}
      enableReplies={false}
      isReply
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      renderQuickActions={() => {
        if (!activityOperations.replyOperations || reply.actor !== currentUser?.id) return null;
        return (
          <ReplyQuickActions
            handleDelete={async () => {
              await activityOperations.replyOperations?.deleteReply(reply.id);
            }}
            reply={reply}
            setEditMode={() => setIsEditing(true)}
          />
        );
      }}
    />
  );
});
