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

// types
import type { TCommentConfig } from "@/types";

export enum ECommentAttributeNames {
  ID = "id",
  COMMENT_ID = "data-comment-id",
  RESOLVED = "data-comment-resolved",
}

export const DEFAULT_COMMENT_ATTRIBUTES = {
  [ECommentAttributeNames.ID]: "",
  [ECommentAttributeNames.COMMENT_ID]: "",
  [ECommentAttributeNames.RESOLVED]: false,
} satisfies Record<ECommentAttributeNames, string | boolean>;

// COMMENT MARK ATTRIBUTES
export type TCommentMarkAttributes = {
  [ECommentAttributeNames.ID]?: string;
  [ECommentAttributeNames.COMMENT_ID]: string;
  [ECommentAttributeNames.RESOLVED]?: boolean;
};

export type TCommentClickPayload = {
  referenceParagraph: string;
  primaryCommentId: string;
  commentIds: string[];
};

// COMMENT MARK OPTIONS
export type TCommentMarkOptions = {
  isFlagged: boolean;
  onCommentClick?: TCommentConfig["onClick"];
  onCommentDelete?: TCommentConfig["onDelete"];
  onCommentRestore?: TCommentConfig["onRestore"];
  onCommentResolve?: TCommentConfig["onResolve"];
  onCommentUnresolve?: TCommentConfig["onUnresolve"];
  shouldHideComment?: TCommentConfig["shouldHideComment"];
};

// COMMENT MARK STORAGE
export type TCommentMarkStorage = {
  commentsOrder: string[];
  deletedComments: Map<string, boolean>;
};

// CSS CLASS CONSTANTS
export enum ECommentMarkCSSClasses {
  BASE = "comment-mark",
  ACTIVE = "comment-mark--active",
  RESOLVED = "comment-mark--resolved",
  BACKGROUND = "bg-[#FFBF66]/25",
}

// ATTRIBUTE SELECTORS
export const COMMENT_MARK_SELECTORS = {
  WITH_ID: "[data-comment-id]",
  RESOLVED: "[data-resolved='true']",
} as const;
