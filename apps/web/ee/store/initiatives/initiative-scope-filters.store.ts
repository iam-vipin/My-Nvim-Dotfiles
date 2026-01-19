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

import { action, makeObservable, observable } from "mobx";
import { computedFn } from "mobx-utils";
import type { IInitiativeScopeDisplayFiltersOptions } from "@plane/types";
import { EIssueLayoutTypes } from "@plane/types";

export interface IInitiativeScopeStore {
  updateDisplayFilters: (initiativeId: string, displayFilters: IInitiativeScopeDisplayFiltersOptions) => void;
  getDisplayFilters: (initiativeId: string) => IInitiativeScopeDisplayFiltersOptions | undefined;
}

export class InitiativeScopeStore implements IInitiativeScopeStore {
  displayFiltersMap: Map<string, IInitiativeScopeDisplayFiltersOptions> = new Map();

  constructor() {
    makeObservable(this, {
      displayFiltersMap: observable,
      updateDisplayFilters: action,
    });
  }

  /**Initialize filters */
  initDisplayFilters = (initiativeId: string) => {
    this.displayFiltersMap.set(initiativeId, {
      activeLayout: EIssueLayoutTypes.LIST,
    });
  };

  /**
   * Get display filters
   * @param initiativeId - The initiative id
   * @returns The display filters
   */
  getDisplayFilters = computedFn((initiativeId: string): IInitiativeScopeDisplayFiltersOptions | undefined => {
    if (!this.displayFiltersMap.has(initiativeId)) {
      this.initDisplayFilters(initiativeId);
    }
    return this.displayFiltersMap.get(initiativeId);
  });

  /**
   * Update display filters
   * @param initiativeId - The initiative id
   * @param displayFilters - The display filters
   */
  updateDisplayFilters = (initiativeId: string, displayFilters: IInitiativeScopeDisplayFiltersOptions) => {
    this.displayFiltersMap.set(initiativeId, displayFilters);
  };
}
