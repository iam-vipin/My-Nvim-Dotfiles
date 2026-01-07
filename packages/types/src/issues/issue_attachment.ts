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

import type { TFileSignedURLResponse } from "../file";

export type TIssueAttachment = {
  id: string;
  attributes: {
    name: string;
    size: number;
  };
  asset_url: string;
  issue_id: string;
  // required
  updated_at: string;
  updated_by: string;
  created_by: string;
};

export type TIssueAttachmentUploadResponse = TFileSignedURLResponse & {
  attachment: TIssueAttachment;
};

export type TIssueAttachmentMap = {
  [issue_id: string]: TIssueAttachment;
};

export type TIssueAttachmentIdMap = {
  [issue_id: string]: string[];
};
