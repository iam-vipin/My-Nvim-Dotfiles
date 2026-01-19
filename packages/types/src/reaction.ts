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

import type { IUserLite } from "./users";

export interface IIssueReaction {
  actor: string;
  actor_detail: IUserLite;
  created_at: Date;
  created_by: string;
  id: string;
  issue: string;
  project: string;
  reaction: string;
  updated_at: Date;
  updated_by: string;
  workspace: string;
}

export interface IssueReactionForm {
  reaction: string;
}

export interface IssueCommentReaction {
  id: string;
  created_at: Date;
  updated_at: Date;
  reaction: string;
  created_by: string;
  updated_by: string;
  project: string;
  workspace: string;
  actor: string;
  comment: string;
}

export interface IssueCommentReactionForm {
  reaction: string;
}
