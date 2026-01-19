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

/* ----------- Importer Utility ----------- */

import type {
  TExtractedCycle,
  TExtractedIssue,
  TExtractedIssueType,
  TExtractedLabel,
  TExtractedModule,
  TExtractedUser,
} from "./extract";

// Configuration model for flatfile
export type FlatfileConfig = {
  appId: string;
  jobId: string;
  actorId: string;
  spaceId: string;
  accountId: string;
  workbookId: string;
  environmentId: string;
};

export type FlatfileServiceConfig = {
  apiKey: string;
};

export type TFlatfileEntity = {
  users: TExtractedUser[];
  labels: TExtractedLabel[];
  cycles: TExtractedCycle[];
  modules: TExtractedModule[];
  issues: TExtractedIssue[];
  issue_types: TExtractedIssueType[];
};
