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

import type { ICycle } from "./cycle";
import type { TIssue } from "./issues/issue";
import type { IModule } from "./module";
import type { TPage } from "./page";
import type { IProject } from "./project";
import type { IUser } from "./users";
import type { IWorkspace } from "./workspace";

export type TSearchEntities =
  | "user_mention"
  | "issue_mention"
  | "project_mention"
  | "cycle_mention"
  | "module_mention"
  | "page_mention";

export type TUserSearchResponse = {
  member__avatar_url: IUser["avatar_url"];
  member__display_name: IUser["display_name"];
  member__id: IUser["id"];
};

export type TProjectSearchResponse = {
  name: IProject["name"];
  id: IProject["id"];
  identifier: IProject["identifier"];
  logo_props: IProject["logo_props"];
  workspace__slug: IWorkspace["slug"];
};

export type TIssueSearchResponse = Pick<
  TIssue,
  "name" | "id" | "sequence_id" | "project_id" | "priority" | "state_id" | "type_id"
> & {
  project__identifier: IProject["identifier"];
  state__group: TIssue["state__group"];
  state__color: string;
};

export type TCycleSearchResponse = {
  name: ICycle["name"];
  id: ICycle["id"];
  project_id: ICycle["project_id"];
  project__identifier: IProject["identifier"];
  status: ICycle["status"];
  workspace__slug: IWorkspace["slug"];
};

export type TModuleSearchResponse = {
  name: IModule["name"];
  id: IModule["id"];
  project_id: IModule["project_id"];
  project__identifier: IProject["identifier"];
  status: IModule["status"];
  workspace__slug: IWorkspace["slug"];
};

export type TPageSearchResponse = {
  name: TPage["name"];
  id: TPage["id"];
  logo_props: TPage["logo_props"];
  projects__id: TPage["project_ids"];
  workspace__slug: IWorkspace["slug"];
};

export type TSearchResponse = {
  cycle_mention?: TCycleSearchResponse[];
  issue_mention?: TIssueSearchResponse[];
  module_mention?: TModuleSearchResponse[];
  page_mention?: TPageSearchResponse[];
  project_mention?: TProjectSearchResponse[];
  user_mention?: TUserSearchResponse[];
};

export type TSearchEntityRequestPayload = {
  count: number;
  project_id?: string;
  query_type: TSearchEntities[];
  query: string;
  team_id?: string;
  issue_id?: string;
};
