import React from "react";
import { MessageCircle } from "lucide-react";
import type { TCommentFilters } from "@/plane-web/store/pages/comments/comment.store";

export type CommentsEmptyStateProps = {
  hasComments: boolean;
  commentFilter: TCommentFilters;
};

export function PageCommentsEmptyState({ hasComments, commentFilter }: CommentsEmptyStateProps) {
  const title = hasComments
    ? commentFilter.showActive
      ? "No active comments"
      : commentFilter.showResolved
        ? "No resolved comments match current filters"
        : "No comments match current filters"
    : "No comments yet";
  const message = "Select text in the editor and add a comment to get started.";

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-3 animate-fade-in-up">
      <MessageCircle className="size-8 text-tertiary" />
      <div className="text-center">
        <h4 className="text-13 font-medium text-secondary">{title}</h4>
        <p className="text-11 text-tertiary mt-1">{message}</p>
      </div>
    </div>
  );
}
