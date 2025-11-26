import { useEffect, useState, useImperativeHandle, forwardRef, useRef } from "react";
import { uniq } from "lodash-es";
import { observer } from "mobx-react";
// plane imports
import { Button } from "@plane/propel/button";
import type { TCommentsOperations } from "@plane/types";
import { Avatar, AvatarGroup } from "@plane/ui";
import { calculateTimeAgo, getFileURL } from "@plane/utils";
// hooks
import { useMember } from "@/hooks/store/use-member";
// local imports
import { RepliesList } from "./replies-list";
import { ReplyCreate } from "./reply-create";

type Props = {
  workspaceSlug: string;
  projectId: string;
  entityId: string;
  activityOperations: TCommentsOperations;
  commentId: string;
  repliesCount: number;
  repliedUserIds: string[];
  lastReplyAt: string | null;
  showAccessSpecifier: boolean;
};

export type CommentRepliesRootHandle = {
  showReplyEditor: () => void;
};

export const CommentRepliesRoot = observer(
  forwardRef<CommentRepliesRootHandle, Props>(function CommentRepliesRoot(props, ref) {
    const {
      workspaceSlug,
      projectId,
      entityId,
      activityOperations,
      commentId,
      repliesCount,
      repliedUserIds,
      lastReplyAt,
      showAccessSpecifier,
    } = props;
    // states
    const [isExpanded, setIsExpanded] = useState(false);
    // refs
    const previousRepliesCountRef = useRef(repliesCount);
    // store hooks
    const { getUserDetails } = useMember();
    // Expose method to show editor - expands and shows editor
    useImperativeHandle(ref, () => ({
      showReplyEditor: () => {
        setIsExpanded(true);
      },
    }));
    // Auto-expand only when a new reply is added (repliesCount increases)
    useEffect(() => {
      const previousCount = previousRepliesCountRef.current;
      const currentCount = repliesCount;

      // Only auto-expand if replies count increased (new reply added) and not already expanded
      if (currentCount > previousCount && currentCount > 0 && !isExpanded) {
        setIsExpanded(true);
      }

      // Update ref for next render
      previousRepliesCountRef.current = currentCount;
    }, [repliesCount, isExpanded]);
    // Fetch replies when expanded and has replies
    useEffect(() => {
      if (isExpanded && repliesCount > 0) {
        activityOperations.replyOperations?.fetchReplies(commentId).catch((error) => {
          console.error("Failed to fetch replies:", error);
        });
      }
    }, [isExpanded, repliesCount, commentId, activityOperations.replyOperations]);

    return (
      <div className="flex flex-col gap-2">
        {repliesCount > 0 && !isExpanded && (
          <Button
            variant="link-neutral"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-xs text-custom-text-300 hover:text-custom-text-200 w-fit px-0 z-[1] ml-2 pl-3 relative"
          >
            {repliedUserIds.length > 0 && (
              <AvatarGroup size="sm" max={2} showTooltip={false}>
                {uniq(repliedUserIds).map((userId) => {
                  const userDetails = getUserDetails(userId);
                  if (!userDetails) return null;
                  return (
                    <Avatar
                      key={userId}
                      name={userDetails.display_name}
                      src={userDetails.avatar_url ? getFileURL(userDetails.avatar_url) : undefined}
                    />
                  );
                })}
              </AvatarGroup>
            )}
            <span>
              {repliesCount} {repliesCount === 1 ? "reply" : "replies"}
            </span>
            <div className="size-1 rounded-full bg-custom-background-80" />
            {lastReplyAt && (
              <>
                <span className="text-custom-text-400">Last reply</span>
                <span className="text-custom-text-400">{calculateTimeAgo(lastReplyAt)}</span>
              </>
            )}
            <div className="absolute left-0 top-0 h-4 w-2 border-l border-b rounded-bl-full border-custom-background-80" />
          </Button>
        )}

        {isExpanded && (
          <>
            {repliesCount > 0 && (
              <RepliesList
                workspaceSlug={workspaceSlug}
                projectId={projectId}
                entityId={entityId}
                commentId={commentId}
                activityOperations={activityOperations}
                showAccessSpecifier={showAccessSpecifier}
                setIsExpanded={setIsExpanded}
              />
            )}
            <ReplyCreate
              workspaceSlug={workspaceSlug}
              projectId={projectId}
              entityId={entityId}
              commentId={commentId}
              activityOperations={activityOperations}
            />
          </>
        )}
      </div>
    );
  })
);
