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

export interface IWorkspaceStore {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export class WorkspaceStore implements IWorkspaceStore {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;

  constructor(data: IWorkspaceStore) {
    makeObservable(this, {
      id: observable.ref,
      name: observable.ref,
      createdAt: observable.ref,
      updatedAt: observable.ref,
    });
    this.id = data.id;
    this.name = data.name;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
