import type { FC, ReactNode } from "react";
import { useEffect, useRef } from "react";
import { observer } from "mobx-react";
// plane imports
import { ACTIVITY_HIGHLIGHT_TIMEOUT } from "@plane/constants";
import { CommentIcon } from "@plane/propel/icons";
import type { TIssueComment } from "@plane/types";
import { cn } from "@plane/utils";
// hooks
import { useWorkspaceNotifications } from "@/hooks/store/notifications";

type TCommentBlock = {
  comment: TIssueComment;
  ends: "top" | "bottom" | undefined;
  children: ReactNode;
};

export const CommentBlock: FC<TCommentBlock> = observer((props) => {
  const { comment, ends, children } = props;
  const commentBlockRef = useRef<HTMLDivElement>(null);
  // store hooks
  const { higlightedActivityIds, setHighlightedActivityIds } = useWorkspaceNotifications();

  useEffect(() => {
    if (higlightedActivityIds.length > 0 && higlightedActivityIds[0] === comment.id) {
      if (commentBlockRef.current) {
        commentBlockRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        // reset highlighted activity ids after 5 seconds
        setTimeout(() => {
          setHighlightedActivityIds([]);
        }, ACTIVITY_HIGHLIGHT_TIMEOUT);
      }
    }
  }, [higlightedActivityIds, comment.id, setHighlightedActivityIds]);

  if (!comment) return null;
  return (
    <div
      id={comment.id}
      className={`relative flex gap-3 ${ends === "top" ? `pb-2` : ends === "bottom" ? `pt-2` : `py-2`}`}
      ref={commentBlockRef}
    >
      <div
        className="absolute left-[13px] top-0 bottom-0 w-0.5 transition-border duration-1000 bg-custom-background-80"
        aria-hidden
      />
      <div
        className={cn(
          "flex-shrink-0 relative w-7 h-7 ring-6 rounded-full transition-border duration-1000 flex justify-center items-center z-[3] uppercase font-medium bg-custom-background-80",
          higlightedActivityIds.includes(comment.id) ? "border-2 border-custom-primary-100" : ""
        )}
      >
        <CommentIcon width={14} height={14} className="text-custom-text-200" aria-hidden="true" />
      </div>
      <div className="flex flex-col gap-3 truncate flex-grow">
        <div className="text-base mb-2 bg-custom-background-90 rounded-lg p-3">{children}</div>
      </div>
    </div>
  );
});
