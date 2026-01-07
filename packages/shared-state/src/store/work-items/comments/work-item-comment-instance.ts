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

import { makeObservable, observable } from "mobx";
// types
import type { TIssueComment } from "@plane/types";
import { BaseWorkItemCommentInstance } from "./base-instance";

export interface IWorkItemCommentInstance extends TIssueComment {
  // computed
  asJSON: TIssueComment;
}

export class WorkItemCommentInstance
  extends BaseWorkItemCommentInstance<TIssueComment>
  implements IWorkItemCommentInstance
{
  // observables
  workspace: TIssueComment["workspace"];
  workspace_detail: TIssueComment["workspace_detail"];
  project: TIssueComment["project"];
  project_detail: TIssueComment["project_detail"];
  issue: TIssueComment["issue"];
  issue_detail: TIssueComment["issue_detail"];
  actor: TIssueComment["actor"];
  actor_detail: TIssueComment["actor_detail"];
  created_at: TIssueComment["created_at"];
  edited_at?: TIssueComment["edited_at"];
  updated_at: TIssueComment["updated_at"];
  created_by: TIssueComment["created_by"];
  updated_by: TIssueComment["updated_by"];
  attachments: TIssueComment["attachments"];
  comment_reactions: TIssueComment["comment_reactions"];
  comment_stripped: TIssueComment["comment_stripped"];
  comment_html: TIssueComment["comment_html"];
  comment_json: TIssueComment["comment_json"];
  external_id: TIssueComment["external_id"];
  external_source: TIssueComment["external_source"];
  access: TIssueComment["access"];
  parent_id: TIssueComment["parent_id"];
  reply_count: TIssueComment["reply_count"];
  replied_user_ids: TIssueComment["replied_user_ids"];
  last_reply_at: TIssueComment["last_reply_at"];

  constructor(data: TIssueComment) {
    super(data);

    this.workspace = data.workspace;
    this.workspace_detail = data.workspace_detail;
    this.project = data.project;
    this.project_detail = data.project_detail;
    this.issue = data.issue;
    this.issue_detail = data.issue_detail;
    this.actor = data.actor;
    this.actor_detail = data.actor_detail;
    this.created_at = data.created_at;
    this.edited_at = data.edited_at;
    this.updated_at = data.updated_at;
    this.created_by = data.created_by;
    this.updated_by = data.updated_by;
    this.attachments = data.attachments;
    this.comment_reactions = data.comment_reactions;
    this.comment_stripped = data.comment_stripped;
    this.comment_html = data.comment_html;
    this.comment_json = data.comment_json;
    this.external_id = data.external_id;
    this.external_source = data.external_source;
    this.access = data.access;
    this.parent_id = data.parent_id;
    this.reply_count = data.reply_count;
    this.replied_user_ids = data.replied_user_ids;
    this.last_reply_at = data.last_reply_at;

    makeObservable(this, {
      // observables
      workspace: observable.ref,
      workspace_detail: observable,
      project: observable.ref,
      project_detail: observable,
      issue: observable.ref,
      issue_detail: observable,
      actor: observable.ref,
      actor_detail: observable,
      created_at: observable.ref,
      edited_at: observable.ref,
      updated_at: observable.ref,
      created_by: observable.ref,
      updated_by: observable.ref,
      attachments: observable,
      comment_reactions: observable,
      comment_stripped: observable.ref,
      comment_html: observable.ref,
      comment_json: observable,
      external_id: observable.ref,
      external_source: observable.ref,
      access: observable.ref,
      parent_id: observable.ref,
      reply_count: observable.ref,
      replied_user_ids: observable.ref,
      last_reply_at: observable.ref,
    });
  }

  // computed
  get asJSON(): TIssueComment {
    return {
      id: this.id,
      workspace: this.workspace,
      workspace_detail: this.workspace_detail,
      project: this.project,
      project_detail: this.project_detail,
      issue: this.issue,
      issue_detail: this.issue_detail,
      actor: this.actor,
      actor_detail: this.actor_detail,
      created_at: this.created_at,
      edited_at: this.edited_at,
      updated_at: this.updated_at,
      created_by: this.created_by,
      updated_by: this.updated_by,
      attachments: this.attachments,
      comment_reactions: this.comment_reactions,
      comment_stripped: this.comment_stripped,
      comment_html: this.comment_html,
      comment_json: this.comment_json,
      external_id: this.external_id,
      external_source: this.external_source,
      access: this.access,
      parent_id: this.parent_id,
      reply_count: this.reply_count,
      replied_user_ids: this.replied_user_ids,
      last_reply_at: this.last_reply_at,
    };
  }
}
