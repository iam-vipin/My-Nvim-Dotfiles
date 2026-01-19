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
import { action, makeObservable, observable, runInAction } from "mobx";
// plane imports
import { InstanceFeatureFlagService } from "@plane/services";
import type { TInstanceFeatureFlagsResponse } from "@plane/types";

const instanceFeatureFlagService = new InstanceFeatureFlagService();

type TFeatureFlagsMaps = Record<string, boolean>; // feature flag -> boolean

export interface IInstanceFeatureFlagsStore {
  flags: TFeatureFlagsMaps;
  // actions
  hydrate: (data: any) => void;
  fetchInstanceFeatureFlags: () => Promise<TInstanceFeatureFlagsResponse>;
}

export class InstanceFeatureFlagsStore implements IInstanceFeatureFlagsStore {
  flags: TFeatureFlagsMaps = {};

  constructor() {
    makeObservable(this, {
      flags: observable,
      fetchInstanceFeatureFlags: action,
    });
  }

  hydrate = (data: any) => {
    if (data) this.flags = data;
  };

  fetchInstanceFeatureFlags = async () => {
    try {
      const response = await instanceFeatureFlagService.list();
      runInAction(() => {
        if (response) {
          Object.keys(response).forEach((key) => {
            set(this.flags, key, response[key]);
          });
        }
      });
      return response;
    } catch (error) {
      console.error("Error fetching instance feature flags", error);
      throw error;
    }
  };
}
