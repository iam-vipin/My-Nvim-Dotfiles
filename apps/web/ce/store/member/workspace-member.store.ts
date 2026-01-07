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

// store
import type { IBaseWorkspaceMemberStore } from "@/store/member/workspace/workspace-member.store";
import { BaseWorkspaceMemberStore } from "@/store/member/workspace/workspace-member.store";
import type { RootStore } from "@/plane-web/store/root.store";
import type { IMemberRootStore } from "@/store/member";

export type IWorkspaceMemberStore = IBaseWorkspaceMemberStore;

export class WorkspaceMemberStore extends BaseWorkspaceMemberStore implements IWorkspaceMemberStore {
  constructor(_memberRoot: IMemberRootStore, _rootStore: RootStore) {
    super(_memberRoot, _rootStore);
  }
}
