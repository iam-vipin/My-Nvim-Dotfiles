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

export type TIssueLinkEditableFields = {
  title: string;
  url: string;
};

export type TLinkMetadata = {
  title?: string;
  favicon?: string;
  favicon_url?: string;
  url?: string;
};

export type TIssueLink = TIssueLinkEditableFields & {
  created_by_id: string;
  id: string;
  metadata: TLinkMetadata;
  issue_id: string;

  //need
  created_at: Date;
};

export type TIssueLinkMap = {
  [issue_id: string]: TIssueLink;
};

export type TIssueLinkIdMap = {
  [issue_id: string]: string[];
};
