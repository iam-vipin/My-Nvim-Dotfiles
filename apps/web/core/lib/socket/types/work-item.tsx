import type { TIssue, TIssueComment } from "@plane/types";

export type TWorkItemWithComment = TIssue & {
  comment: TIssueComment;
};
