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

/* ----------- Extracted Types ----------- */
// Issues that are extracted out of the workbook
export type TExtractedRecord = {
  // Properties of an issue
  id?: string;
  title?: string;
  state?: string;
  priority?: string;
  issue_type?: string;
  description?: string;
  assignees?: string[];

  // Log properties
  created_at?: string;
  created_by?: string;

  // Dates
  start_date?: string;
  target_date?: string;

  // Connections
  labels?: string[];
  cycle?: string;
  module?: string;
};

// Extracted Issue
export type TExtractedIssue = Omit<TExtractedRecord, "cycle" | "title"> & {
  title: string;
};

// Extracted Issue Type
export type TExtractedIssueType = string;

// Extracted User
export type TExtractedUser = {
  id: string;
  email: string;
};

// Labels that are extracted out of the workbook
export type TExtractedLabel = string;

// Cycles that are extracted out of the workbook
export type TExtractedCycle = {
  id: string;
  name: string;
  issues: string[];
};

export type TExtractedModule = {
  id: string;
  name: string;
  issues: string[];
};
