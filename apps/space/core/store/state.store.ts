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

import { clone } from "lodash-es";
import { action, computed, makeObservable, observable, runInAction } from "mobx";
// plane imports
import { SitesStateService } from "@plane/services";
import type { IState } from "@plane/types";
// helpers
import { sortStates } from "@/helpers/state.helper";
// store
import type { CoreRootStore } from "./root.store";

export interface IStateStore {
  // observables
  states: IState[] | undefined;
  //computed
  sortedStates: IState[] | undefined;
  // computed actions
  getStateById: (stateId: string | undefined) => IState | undefined;
  // fetch actions
  fetchStates: (anchor: string) => Promise<IState[]>;
}

export class StateStore implements IStateStore {
  states: IState[] | undefined = undefined;
  stateService: SitesStateService;
  rootStore: CoreRootStore;

  constructor(_rootStore: CoreRootStore) {
    makeObservable(this, {
      // observables
      states: observable,
      // computed
      sortedStates: computed,
      // fetch action
      fetchStates: action,
    });
    this.stateService = new SitesStateService();
    this.rootStore = _rootStore;
  }

  get sortedStates() {
    if (!this.states) return;
    return sortStates(clone(this.states));
  }

  getStateById = (stateId: string | undefined) => this.states?.find((state) => state.id === stateId);

  fetchStates = async (anchor: string) => {
    const statesResponse = await this.stateService.list(anchor);
    runInAction(() => {
      this.states = statesResponse;
    });
    return statesResponse;
  };
}
