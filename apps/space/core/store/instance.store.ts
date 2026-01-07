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

import { set } from "lodash-es";
import { observable, action, makeObservable, runInAction } from "mobx";
// plane imports
import { InstanceService } from "@plane/services";
import type { IInstance, IInstanceConfig } from "@plane/types";
// store
import type { CoreRootStore } from "@/store/root.store";

type TError = {
  status: string;
  message: string;
  data?: {
    is_activated: boolean;
    is_setup_done: boolean;
  };
};

export interface IInstanceStore {
  // observables
  isLoading: boolean;
  instance: IInstance | undefined;
  config: IInstanceConfig | undefined;
  error: TError | undefined;
  // action
  fetchInstanceInfo: () => Promise<void>;
  hydrate: (data: IInstance) => void;
}

export class InstanceStore implements IInstanceStore {
  isLoading: boolean = true;
  instance: IInstance | undefined = undefined;
  config: IInstanceConfig | undefined = undefined;
  error: TError | undefined = undefined;
  // services
  instanceService;

  constructor(private store: CoreRootStore) {
    makeObservable(this, {
      // observable
      isLoading: observable.ref,
      instance: observable,
      config: observable,
      error: observable,
      // actions
      fetchInstanceInfo: action,
      hydrate: action,
    });
    // services
    this.instanceService = new InstanceService();
  }

  hydrate = (data: IInstance) => set(this, "instance", data);

  /**
   * @description fetching instance information
   */
  fetchInstanceInfo = async () => {
    try {
      this.isLoading = true;
      this.error = undefined;
      const instanceInfo = await this.instanceService.info();
      runInAction(() => {
        this.isLoading = false;
        this.instance = instanceInfo.instance;
        this.config = instanceInfo.config;
      });
    } catch (_error) {
      runInAction(() => {
        this.isLoading = false;
        this.error = {
          status: "error",
          message: "Failed to fetch instance info",
        };
      });
    }
  };
}
