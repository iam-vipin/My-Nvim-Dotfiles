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

// plane types
import type { TPaginationInfo } from "../common";
import type { TIssuePriorities } from "../issues";
import type { TIssue } from "../issues/issue";
import type { TIntakeIssueExtended } from "./intake-extended";

export type TIntakeIssueForm = {
  name: string;
  email: string;
  username: string;
  description_html: string;
};

export enum EInboxIssueCurrentTab {
  OPEN = "open",
  CLOSED = "closed",
}

export type TInboxIssueCurrentTab = EInboxIssueCurrentTab;

export enum EInboxIssueStatus {
  PENDING = -2,
  DECLINED = -1,
  SNOOZED = 0,
  ACCEPTED = 1,
  DUPLICATE = 2,
}

export enum EInboxIssueSource {
  IN_APP = "IN_APP",
  FORMS = "FORMS",
  EMAIL = "EMAIL",
}

export type TInboxIssueStatus = EInboxIssueStatus;
export type TInboxIssue = {
  id: string;
  status: TInboxIssueStatus;
  snoozed_till: Date | null;
  duplicate_to: string | undefined;
  source: EInboxIssueSource | undefined;
  issue: (TIssue & TIntakeIssueExtended) | undefined;
  created_by: string;
  duplicate_issue_detail: TInboxDuplicateIssueDetails | undefined;
};

// filters
export type TInboxIssueFilterMemberKeys = "assignees" | "created_by";

export type TInboxIssueFilterDateKeys = "created_at" | "updated_at";

export type TInboxIssueFilter = {
  [key in TInboxIssueFilterMemberKeys]: string[] | undefined;
} & {
  [key in TInboxIssueFilterDateKeys]: string[] | undefined;
} & {
  state: string[] | undefined;
  status: TInboxIssueStatus[] | undefined;
  priority: TIssuePriorities[] | undefined;
  labels: string[] | undefined;
};

// sorting filters
export type TInboxIssueSortingKeys = "order_by" | "sort_by";

export type TInboxIssueSortingOrderByKeys = "issue__created_at" | "issue__updated_at" | "issue__sequence_id";

export type TInboxIssueSortingSortByKeys = "asc" | "desc";

export type TInboxIssueSorting = {
  order_by: TInboxIssueSortingOrderByKeys | undefined;
  sort_by: TInboxIssueSortingSortByKeys | undefined;
};

// filtering and sorting types for query params
export type TInboxIssueSortingOrderByQueryParamKeys =
  | "issue__created_at"
  | "-issue__created_at"
  | "issue__updated_at"
  | "-issue__updated_at"
  | "issue__sequence_id"
  | "-issue__sequence_id";

export type TInboxIssueSortingOrderByQueryParam = {
  order_by: TInboxIssueSortingOrderByQueryParamKeys;
};

export type TInboxIssuesQueryParams = {
  [key in keyof TInboxIssueFilter]: string;
} & TInboxIssueSortingOrderByQueryParam & {
    per_page: number;
    cursor: string;
  };

// inbox issue types

export type TInboxDuplicateIssueDetails = {
  id: string;
  sequence_id: string;
  name: string;
};

export type TInboxIssuePaginationInfo = TPaginationInfo & {
  total_results: number;
};

export type TInboxIssueWithPagination = TInboxIssuePaginationInfo & {
  results: TInboxIssue[];
};

export type TAnchors = { [key: string]: string };

export type TInboxForm = {
  anchors: TAnchors;
  id: string;
  is_in_app_enabled: boolean;
  is_form_enabled: boolean;
};

export type TInboxIssueForm = {
  name: string;
  description: string;
  username: string;
  email: string;
};

export interface IInboxIssueStore extends TInboxIssue {
  isLoading: boolean;
  id: string;
  status: TInboxIssueStatus;
  issue: (TIssue & TIntakeIssueExtended) | undefined;
  snoozed_till: Date | null;
  source: EInboxIssueSource | undefined;
  duplicate_to: string | undefined;
  created_by: string;
  duplicate_issue_detail: TInboxDuplicateIssueDetails | undefined;
  // actions
  updateInboxIssueStatus: (status: TInboxIssueStatus) => Promise<void>; // accept, decline
  updateInboxIssueDuplicateTo: (issueId: string) => Promise<void>; // connecting the inbox issue to the project existing issue
  updateInboxIssueSnoozeTill: (date: Date | undefined) => Promise<void>; // snooze the issue
  updateIssue: (issue: Partial<TIssue>) => Promise<void>; // updating the issue
  updateProjectIssue: (issue: Partial<TIssue>) => Promise<void>; // updating the issue
  fetchIssueActivity: () => Promise<void>; // fetching the issue activity
}
