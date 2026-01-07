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

// ----------------------------------------
// Configuration Types
// ----------------------------------------

import type { IGitComment, IPullRequestDetails } from "./base";

// ----------------------------------------
// Event Data Types
// ----------------------------------------

/**
 * Standardized event data structure
 */
export interface IPullRequestEventData {
  repositoryName: string;
  pullRequestIdentifier: string;
  owner: string;
}

/**
 * Configuration for PR state mapping
 */
export interface IPullRequestConfig {
  states?: {
    mergeRequestEventMapping?: Record<string, { id: string; name: string }>;
  };
}

// ----------------------------------------
// Error Types
// ----------------------------------------

/**
 * Error type for pull request operations
 */
export type TPullRequestError = {
  message: string;
  details?: any;
};

// ----------------------------------------
// Service Interfaces
// ----------------------------------------

/**
 * Service interface for pull request operations
 */
export interface IPullRequestService {
  getPullRequest(owner: string, repositoryName: string, pullRequestIdentifier: string): Promise<IPullRequestDetails>;

  getPullRequestComments(owner: string, repo: string, pullRequestIdentifier: string): Promise<IGitComment[]>;

  createPullRequestComment(
    owner: string,
    repo: string,
    pullRequestIdentifier: string,
    body: string
  ): Promise<IGitComment>;

  updatePullRequestComment(
    owner: string,
    repo: string,
    commentId: string,
    body: string,
    pullRequestIdentifier?: number
  ): Promise<IGitComment>;
}
