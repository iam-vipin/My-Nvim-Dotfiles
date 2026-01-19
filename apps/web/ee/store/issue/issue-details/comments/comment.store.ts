/**
 * SPDX-FileCopyrightText: 2023-present Plane Software, Inc.
 * SPDX-License-Identifier: LicenseRef-Plane-Commercial
 *
 * Licensed under the Plane Commercial License (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * https://plane.so/legals/eula
 *
 * DO NOT remove or modify this notice.
 * NOTICE: Proprietary and confidential. Unauthorized use or distribution is prohibited.
 */

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
