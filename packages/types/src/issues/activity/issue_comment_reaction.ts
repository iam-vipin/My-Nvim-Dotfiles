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

export type TIssueCommentReaction = {
  id: string;
  comment: string;
  actor: string;
  reaction: string;
  workspace: string;
  project: string;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  updated_by: string;
  display_name: string;
};

export type TIssueCommentReactionMap = {
  [reaction_id: string]: TIssueCommentReaction;
};

export type TIssueCommentReactionIdMap = {
  [comment_id: string]: { [reaction: string]: string[] };
};
