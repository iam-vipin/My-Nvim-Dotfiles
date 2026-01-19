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
import { computedFn } from "mobx-utils";
import type { E_FEATURE_FLAGS } from "@plane/constants";
// services
import { SitesFeatureFlagService } from "@plane/services";
// init services
const featureFlagService = new SitesFeatureFlagService();

type TFeatureFlagsMaps = Record<E_FEATURE_FLAGS, boolean>; // feature flag -> boolean

export interface IFeatureFlagsStore {
  fetchMap: Record<string, TFeatureFlagsMaps>; // anchor -> has fetched feature flag details
  flags: Record<string, TFeatureFlagsMaps>; // anchor -> feature flag map
  fetchFeatureFlag: (anchor: string, flag: keyof typeof E_FEATURE_FLAGS) => Promise<{ value: boolean }>;
  fetchFeatureFlags: (
    anchor: string,
    flags: ReadonlyArray<keyof typeof E_FEATURE_FLAGS>
  ) => Promise<Array<{ value: boolean }>>;
  getFeatureFlag: (anchor: string, flag: keyof typeof E_FEATURE_FLAGS, defaultValue: boolean) => boolean;
  hasFetchedFeatureFlag: (anchor: string, flag: keyof typeof E_FEATURE_FLAGS) => boolean;
}

export class FeatureFlagsStore implements IFeatureFlagsStore {
  fetchMap: IFeatureFlagsStore["fetchMap"] = {};
  flags: IFeatureFlagsStore["flags"] = {};

  constructor() {
    makeObservable(this, {
      fetchMap: observable,
      flags: observable,
      fetchFeatureFlag: action,
      fetchFeatureFlags: action,
    });
  }

  fetchFeatureFlag: IFeatureFlagsStore["fetchFeatureFlag"] = async (anchor, flag) => {
    // Mark as fetched immediately to prevent duplicate calls
    runInAction(() => {
      set(this.fetchMap, [anchor, flag], true);
    });

    try {
      const response = await featureFlagService.retrieve(anchor, flag);
      runInAction(() => {
        set(this.flags, [anchor, flag], response.value);
      });
      return response;
    } catch (error) {
      console.error("Error fetching feature flags", error);
      runInAction(() => {
        set(this.fetchMap, [anchor, flag], false);
      });
      throw error;
    }
  };

  fetchFeatureFlags: IFeatureFlagsStore["fetchFeatureFlags"] = async (anchor, flags) => {
    const promises = flags.map((flag) => this.fetchFeatureFlag(anchor, flag));
    return Promise.all(promises);
  };

  getFeatureFlag: IFeatureFlagsStore["getFeatureFlag"] = computedFn(
    (anchor, flag, defaultValue) => this.flags[anchor]?.[flag] ?? defaultValue
  );

  hasFetchedFeatureFlag: IFeatureFlagsStore["hasFetchedFeatureFlag"] = computedFn(
    (anchor, flag) => this.fetchMap[anchor]?.[flag] ?? false
  );
}
