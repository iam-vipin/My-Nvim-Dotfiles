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

import { observer } from "mobx-react";
import useSWR from "swr";

import { cn } from "@plane/utils";
import type { TPageInstance } from "@/store/pages/base-page";
import { PageCommentDisplay } from "./comment-display";
import { PageCommentReplyLoadingSkeleton } from "./reply-loading-skeleton";

type ThreadRepliesProps = {
  threadId: string;
  showReplies: boolean;
  showReplyBox: boolean;
  page: TPageInstance;
};

export const PageCommentThreadReplyList = observer(function PageCommentThreadReplyList({
  threadId,
  showReplies,
  showReplyBox,
  page,
}: ThreadRepliesProps) {
  const { fetchThreadComments } = page.comments;

  // Get thread display state - single source of truth
  const threadState = page.comments.getThreadDisplayState(threadId, showReplies);

  // Only fetch thread comments when showReplies is true (user clicked to expand)
  const { isLoading, data: dataFromServer } = useSWR(
    showReplies && threadId ? `THREAD-COMMENTS-${threadId}` : null,
    async () => {
      if (!threadId) return [];
      return await fetchThreadComments(threadId);
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  if (!threadState) return null;

  return (
    <div className="overflow-hidden animate-expand relative">
      {isLoading && !dataFromServer && (
        <PageCommentReplyLoadingSkeleton commentReplyCount={threadState.hiddenRepliesCount} />
      )}
      {threadState.displayItems.map((item, index, array) => {
        const isLastItem = index === array.length - 1;

        return (
          <div key={item.comment.id} className={cn("relative w-full", !isLastItem && "mb-4")}>
            {(!isLastItem || showReplyBox) && (
              <div className="absolute left-3 top-0 -bottom-4 w-0.5 bg-custom-border-300" aria-hidden />
            )}
            <PageCommentDisplay page={page} comment={item.comment} isParent={false} />
          </div>
        );
      })}
    </div>
  );
});
