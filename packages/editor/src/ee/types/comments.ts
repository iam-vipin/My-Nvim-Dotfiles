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

import type { TCommentClickPayload } from "../extensions/comments/types";

export type { TCommentClickPayload };

export type TCommentConfig = {
  onClick?: (payload: TCommentClickPayload) => void;
  onDelete?: (commentId: string) => void;
  onRestore?: (commentId: string) => void;
  onResolve?: (commentId: string) => void;
  onUnresolve?: (commentId: string) => void;
  onCommentsOrderChange?: (commentsOrder: string[]) => void;
  onCreateCommentMark?: (selection: { from: number; to: number }, commentId: string) => void;
  onStartNewComment?: (selection?: { from: number; to: number; referenceText?: string }) => void;
  canComment?: boolean;
  shouldHideComment?: boolean;
};
