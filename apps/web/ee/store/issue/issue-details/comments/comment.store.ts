import type { TIssueServiceType } from "@plane/types";
import type { IIssueCommentStore } from "@/store/issue/issue-details/comment.store";
import { IssueCommentStore } from "@/store/issue/issue-details/comment.store";
import type { IIssueDetail } from "@/store/issue/issue-details/root.store";
import { RepliesStore } from "./replies.store";
import type { IRepliesStore } from "./replies.store";

export interface IIssueCommentStoreExtended extends IIssueCommentStore {
  replies: IRepliesStore;
}

export class IssueCommentStoreExtended extends IssueCommentStore implements IIssueCommentStoreExtended {
  replies: IRepliesStore;

  constructor(rootStore: IIssueDetail, serviceType: TIssueServiceType) {
    super(rootStore, serviceType);
    this.replies = new RepliesStore(rootStore, serviceType);
  }
}
