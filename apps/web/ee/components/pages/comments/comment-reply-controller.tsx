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
import type { TCommentInstance } from "@/plane-web/store/pages/comments/comment-instance";
import type { TPageInstance } from "@/store/pages/base-page";

type TCommentReplyController = {
  comment: TCommentInstance;
  handleShowRepliesToggle: (e: React.MouseEvent) => void;
  showReplies: boolean;
  page: TPageInstance;
};

export const PageCommentReplyController = observer(function PageCommentReplyController({
  comment,
  handleShowRepliesToggle,
  showReplies,
  page,
}: TCommentReplyController) {
  // Use centralized thread display state for consistency
  const threadState = page.comments.getThreadDisplayState(comment.id, showReplies);

  if (!threadState || !threadState.shouldShowReplyController) return null;

  return (
    <div className="w-full animate-expand-action mb-4">
      <div className="w-full relative">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-custom-border-300 animate-scale-line" />
        <div className="relative flex justify-center">
          <button
            onClick={handleShowRepliesToggle}
            className="bg-surface-1 group-hover:bg-surface-2 px-3 py-1 text-tertiary hover:text-secondary transition-colors animate-button-fade-up rounded text-11 font-medium"
          >
            {showReplies
              ? "Hide replies"
              : `Show ${threadState.hiddenRepliesCount} ${threadState.hiddenRepliesCount === 1 ? "reply" : "replies"}`}
          </button>
        </div>
      </div>
    </div>
  );
});
