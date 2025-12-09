// local imports
import type { TIssueComment } from "./issue_comment";

export type TCommentReplyOperations = {
  fetchReplies: (commentId: string) => Promise<void>;
  createReply: (commentId: string, data: Partial<TIssueComment>) => Promise<TIssueComment | undefined>;
  updateReply: (replyId: string, data: Partial<TIssueComment>) => Promise<void>;
  deleteReply: (replyId: string) => Promise<void>;
};
