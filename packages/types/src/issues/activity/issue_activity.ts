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
import type { EInboxIssueSource } from "../../intake";
import type {
  TIssueActivityWorkspaceDetail,
  TIssueActivityProjectDetail,
  TIssueActivityIssueDetail,
  TIssueActivityUserDetail,
} from "./base";

export type TIssueActivity = {
  id: string;
  workspace: string;
  workspace_detail: TIssueActivityWorkspaceDetail;
  project: string;
  project_detail: TIssueActivityProjectDetail;
  issue: string;
  issue_detail: TIssueActivityIssueDetail;
  actor: string;
  actor_detail: TIssueActivityUserDetail;
  created_at: string;
  updated_at: string;
  created_by: string | undefined;
  updated_by: string | undefined;
  attachments: any[];

  verb: string;
  field: string | undefined;
  old_value: string | undefined;
  new_value: string | undefined;
  comment: string | undefined;
  old_identifier: string | undefined;
  new_identifier: string | undefined;
  epoch: number;
  issue_comment: string | null;
  source_data: {
    source: EInboxIssueSource;
    source_email?: string;
    extra: {
      username?: string;
    };
  };
};

export type TIssueActivityMap = {
  [issue_id: string]: TIssueActivity;
};

export type TIssueActivityIdMap = {
  [issue_id: string]: string[];
};
