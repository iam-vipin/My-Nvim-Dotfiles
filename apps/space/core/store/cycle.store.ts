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

import { action, makeObservable, observable, runInAction } from "mobx";
// plane imports
import { SitesCycleService } from "@plane/services";
import type { TPublicCycle } from "@/types/cycle";
// store
import type { CoreRootStore } from "./root.store";

export interface ICycleStore {
  // observables
  cycles: TPublicCycle[] | undefined;
  // computed actions
  getCycleById: (cycleId: string | undefined) => TPublicCycle | undefined;
  // fetch actions
  fetchCycles: (anchor: string) => Promise<TPublicCycle[]>;
}

export class CycleStore implements ICycleStore {
  cycles: TPublicCycle[] | undefined = undefined;
  cycleService: SitesCycleService;
  rootStore: CoreRootStore;

  constructor(_rootStore: CoreRootStore) {
    makeObservable(this, {
      // observables
      cycles: observable,
      // fetch action
      fetchCycles: action,
    });
    this.cycleService = new SitesCycleService();
    this.rootStore = _rootStore;
  }

  getCycleById = (cycleId: string | undefined) => this.cycles?.find((cycle) => cycle.id === cycleId);

  fetchCycles = async (anchor: string) => {
    const cyclesResponse = await this.cycleService.list(anchor);
    runInAction(() => {
      this.cycles = cyclesResponse;
    });
    return cyclesResponse;
  };
}
