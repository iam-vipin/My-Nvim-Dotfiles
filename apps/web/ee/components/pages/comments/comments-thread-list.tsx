import { observer } from "mobx-react";
import type { TCommentInstance } from "@/plane-web/store/pages/comments/comment-instance";
import type { TPageInstance } from "@/store/pages/base-page";
import { PageThreadCommentItem } from "./thread-comment-item";

export type CommentsListProps = {
  comments: TCommentInstance[];
  page: TPageInstance;
  selectedThreadId?: string;
  onSetItemRef: (id: string) => (element: HTMLDivElement | null) => void;
};

export const PageCommentsThreadList = observer(function PageCommentsThreadList({
  comments,
  page,
  selectedThreadId,
  onSetItemRef,
}: CommentsListProps) {
  const commentsFilters = page.comments.commentsFilters;
  const isFiltering =
    commentsFilters && (!commentsFilters.showAll || !commentsFilters.showActive || !commentsFilters.showResolved);

  return (
    <div
      className={`divide-y divide-custom-border-300 ${isFiltering ? "animate-smooth-comments" : "animate-stagger-comments"}`}
    >
      {comments.map((comment) => (
        <PageThreadCommentItem
          key={comment.id}
          ref={onSetItemRef(comment.id)}
          comment={comment}
          page={page}
          isSelected={selectedThreadId === comment.id}
          referenceText={comment.reference_stripped}
        />
      ))}
    </div>
  );
});
