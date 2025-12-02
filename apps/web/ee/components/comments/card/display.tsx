import type { ReactNode } from "react";
import { useCallback, useRef } from "react";
import { observer } from "mobx-react";
// plane imports
import type { EditorRefApi } from "@plane/editor";
import { Tooltip } from "@plane/propel/tooltip";
import { Avatar } from "@plane/ui";
import { calculateTimeAgo, getFileURL, renderFormattedDate, renderFormattedTime } from "@plane/utils";
// components
import { CommentCardDisplay as BaseCommentCardDisplay } from "@/components/comments/card/display";
import type { TCommentCardDisplayProps } from "@/components/comments/card/display";
// hooks
import { useMember } from "@/hooks/store/use-member";
// local imports
import type { CommentRepliesRootHandle } from "../replies/root";
import { CommentRepliesRoot } from "../replies/root";

type Props = TCommentCardDisplayProps & {
  renderQuickActions: (handleReply: () => void) => ReactNode;
  enableReplies: boolean;
  isReply?: boolean;
};

export const CommentCardDisplay = observer(function CommentCardDisplay(props: Props) {
  const {
    entityId,
    comment,
    disabled,
    projectId,
    workspaceSlug,
    showAccessSpecifier,
    activityOperations,
    enableReplies,
    isReply = false,
    renderQuickActions,
    ...restProps
  } = props;
  // refs
  const repliesRootRef = useRef<CommentRepliesRootHandle>(null);
  const editorRef = useRef<EditorRefApi>(null);
  // store hooks
  const { getUserDetails } = useMember();
  // derived values
  const userDetails = getUserDetails(comment?.actor);
  const displayName = comment?.actor_detail?.is_bot
    ? comment?.actor_detail?.first_name + `Bot`
    : (userDetails?.display_name ?? comment?.actor_detail?.display_name);
  const avatarUrl = userDetails?.avatar_url ?? comment?.actor_detail?.avatar_url;

  const handleReply = useCallback(() => {
    editorRef.current?.setFocusAtPosition(0);
    repliesRootRef.current?.showReplyEditor();
  }, []);
  const areRepliesAvailable = comment.reply_count !== undefined && comment.reply_count > 0;
  const shouldShowIndicator = isReply || areRepliesAvailable;

  return (
    <>
      <div className="relative">
        {shouldShowIndicator && (
          <div
            className="absolute left-[7px] top-1 -bottom-1 w-px transition-border duration-1000 bg-custom-background-80"
            aria-hidden
          />
        )}
        <div className="flex relative w-full gap-2 items-center z-10">
          <Avatar size="sm" name={displayName} src={getFileURL(avatarUrl)} className="shrink-0" />
          <div className="flex-1 flex flex-wrap items-center gap-1">
            <div className="text-xs font-medium">{displayName}</div>
            <div className="text-xs text-custom-text-300">
              commented{" "}
              <Tooltip
                tooltipContent={`${renderFormattedDate(comment.created_at)} at ${renderFormattedTime(comment.created_at)}`}
                position="bottom"
              >
                <span className="text-custom-text-350">
                  {calculateTimeAgo(comment.created_at)}
                  {comment.edited_at && " (edited)"}
                </span>
              </Tooltip>
            </div>
          </div>
          {!disabled && <div className="shrink-0">{renderQuickActions(handleReply)}</div>}
        </div>
        {/* Core: Comment content */}
        <div className="ml-4 pb-4">
          <BaseCommentCardDisplay
            {...restProps}
            entityId={entityId}
            comment={comment}
            disabled={disabled}
            workspaceSlug={workspaceSlug}
            activityOperations={activityOperations}
            showAccessSpecifier={showAccessSpecifier}
          />
        </div>
      </div>
      {enableReplies && !isReply && projectId && (
        <CommentRepliesRoot
          editorRef={editorRef}
          ref={repliesRootRef}
          workspaceSlug={workspaceSlug}
          projectId={projectId}
          entityId={entityId}
          commentId={comment.id}
          repliesCount={comment.reply_count || 0}
          repliedUserIds={comment.replied_user_ids || []}
          lastReplyAt={comment.last_reply_at || null}
          showAccessSpecifier={showAccessSpecifier}
          activityOperations={activityOperations}
        />
      )}
    </>
  );
});
