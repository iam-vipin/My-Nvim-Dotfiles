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

import type { IUserLite } from "../users";

export type TIssueReaction = {
  actor: string;
  id: string;
  issue: string;
  reaction: string;
  display_name: string;
};

export interface IIssuePublicReaction {
  actor_details: IUserLite;
  reaction: string;
}

export type TIssueReactionMap = {
  [reaction_id: string]: TIssueReaction;
};

export type TIssueReactionIdMap = {
  [issue_id: string]: { [reaction: string]: string[] };
};

export interface IPublicVote {
  vote: -1 | 1;
  actor_details: IUserLite;
}
