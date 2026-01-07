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

import { computedFn } from "mobx-utils";
import type { EUserPermissions } from "@plane/constants";
import type { RootStore } from "@/plane-web/store/root.store";
import { BaseUserPermissionStore } from "@/store/user/base-permissions.store";
import type { IBaseUserPermissionStore } from "@/store/user/base-permissions.store";

export type IUserPermissionStore = IBaseUserPermissionStore;

export class UserPermissionStore extends BaseUserPermissionStore implements IUserPermissionStore {
  constructor(store: RootStore) {
    super(store);
  }

  /**
   * @description Returns the project role from the workspace
   * @param { string } workspaceSlug
   * @param { string } projectId
   * @returns { EUserPermissions | undefined }
   */
  getProjectRoleByWorkspaceSlugAndProjectId = computedFn(
    (workspaceSlug: string, projectId?: string): EUserPermissions | undefined =>
      this.getProjectRole(workspaceSlug, projectId)
  );

  fetchWorkspaceLevelProjectEntities = (workspaceSlug: string, projectId: string): void => {
    void this.store.projectRoot.project.fetchProjectDetails(workspaceSlug, projectId);
  };
}
