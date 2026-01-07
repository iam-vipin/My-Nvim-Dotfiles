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

// local imports
import type { TIssueComment } from "./issue_comment";

export type TCommentReplyOperations = {
  fetchReplies: (commentId: string) => Promise<void>;
  createReply: (commentId: string, data: Partial<TIssueComment>) => Promise<TIssueComment | undefined>;
  updateReply: (replyId: string, data: Partial<TIssueComment>) => Promise<void>;
  deleteReply: (replyId: string) => Promise<void>;
};
