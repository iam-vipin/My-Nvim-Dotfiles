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

import type { IssueActions } from "@/hooks/use-issues-actions";

export const useTeamIssueActions: () => IssueActions = () => ({
  fetchIssues: () => Promise.resolve(undefined),
  fetchNextIssues: () => Promise.resolve(undefined),
  removeIssue: () => Promise.resolve(undefined),
  updateFilters: () => Promise.resolve(undefined),
});

export const useTeamViewIssueActions: () => IssueActions = () => ({
  fetchIssues: () => Promise.resolve(undefined),
  fetchNextIssues: () => Promise.resolve(undefined),
  removeIssue: () => Promise.resolve(undefined),
  updateFilters: () => Promise.resolve(undefined),
});

export const useTeamProjectWorkItemsActions: () => IssueActions = () => ({
  fetchIssues: () => Promise.resolve(undefined),
  fetchNextIssues: () => Promise.resolve(undefined),
  removeIssue: () => Promise.resolve(undefined),
  updateFilters: () => Promise.resolve(undefined),
});
