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

import type { GitlabIssue, GitlabLabel, GitlabMergeRequest, GitlabNote, GitlabProject, GitlabUser } from "./common";

// Base webhook event type
export interface GitlabWebhookEvent {
  object_kind: string;
  event_type?: string;
  user: GitlabUser;
  project: GitlabProject;
  repository: {
    name: string;
    url: string;
    description: string;
    homepage: string;
  };
  isEnterprise?: boolean;
}

// Push event
export interface GitlabPushEvent extends GitlabWebhookEvent {
  object_kind: "push";
  before: string;
  after: string;
  ref: string;
  checkout_sha: string;
  commits: {
    id: string;
    message: string;
    title: string;
    timestamp: string;
    url: string;
    author: {
      name: string;
      email: string;
    };
    added: string[];
    modified: string[];
    removed: string[];
  }[];
  total_commits_count: number;
}

// Issue event
export interface GitlabIssueEvent extends GitlabWebhookEvent {
  object_kind: "issue" | "work_item";
  event_type: "issue" | "work_item";
  object_attributes: GitlabIssue & {
    action: GitlabIssueWebhookActions;
    url: string;
    type: "Issue" | "Task" | "Incident";
  };
  labels: GitlabLabel[];
  changes: {
    [key: string]: {
      previous: any;
      current: any;
    };
  };
  assignees: GitlabUser[];
}

// Merge request event
export interface GitlabMergeRequestEvent extends GitlabWebhookEvent {
  object_kind: "merge_request";
  object_attributes: GitlabMergeRequest & {
    action: string;
    url: string;
    source: GitlabProject;
    target: GitlabProject;
    last_commit: {
      id: string;
      message: string;
      timestamp: string;
      url: string;
      author: {
        name: string;
        email: string;
      };
    };
  };
  labels: GitlabLabel[];
  changes: {
    [key: string]: {
      previous: any;
      current: any;
    };
  };
}

// Note event
export interface GitlabNoteEvent extends GitlabWebhookEvent {
  object_kind: "note";
  event_type: "note";
  object_attributes: GitlabNote & {
    description: string;
    url: string;
    action: GitlabNoteWebhookActions;
  };
  issue: Omit<GitlabIssue, "labels"> & {
    labels: GitlabLabel[];
  };
  merge_request?: GitlabMergeRequest;
  snippet?: {
    id: number;
    title: string;
    content: string;
    author_id: number;
    project_id: number;
    created_at: string;
    updated_at: string;
    file_name: string;
    type: string;
    visibility_level: number;
  };
  commit?: {
    id: string;
    message: string;
    timestamp: string;
    url: string;
    author: {
      name: string;
      email: string;
    };
  };
}

export enum GitlabIssueWebhookActions {
  OPEN = "open",
  CLOSE = "close",
  REOPEN = "reopen",
  UPDATE = "update",
}

export enum GitlabNoteWebhookActions {
  CREATE = "create",
  UPDATE = "update",
}
