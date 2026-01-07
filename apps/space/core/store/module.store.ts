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
import { action, computed, makeObservable, observable, runInAction } from "mobx";
// plane imports
import { SitesModuleService } from "@plane/services";
// types
import type { TPublicModule } from "@/types/modules";
// root store
import type { CoreRootStore } from "./root.store";

export interface IIssueModuleStore {
  // observables
  modules: TPublicModule[] | undefined;
  // computed actions
  getModuleById: (moduleId: string | undefined) => TPublicModule | undefined;
  getModulesByIds: (moduleIds: string[]) => TPublicModule[];
  // fetch actions
  fetchModules: (anchor: string) => Promise<TPublicModule[]>;
}

export class ModuleStore implements IIssueModuleStore {
  moduleMap: Record<string, TPublicModule> = {};
  moduleService: SitesModuleService;
  rootStore: CoreRootStore;

  constructor(_rootStore: CoreRootStore) {
    makeObservable(this, {
      // observables
      moduleMap: observable,
      // computed
      modules: computed,
      // fetch action
      fetchModules: action,
    });
    this.moduleService = new SitesModuleService();
    this.rootStore = _rootStore;
  }

  get modules() {
    return Object.values(this.moduleMap);
  }

  getModuleById = (moduleId: string | undefined) => (moduleId ? this.moduleMap[moduleId] : undefined);

  getModulesByIds = (moduleIds: string[]) => {
    const currModules = [];
    for (const moduleId of moduleIds) {
      const issueModule = this.getModuleById(moduleId);
      if (issueModule) {
        currModules.push(issueModule);
      }
    }

    return currModules;
  };

  fetchModules = async (anchor: string) => {
    try {
      const modulesResponse = await this.moduleService.list(anchor);
      runInAction(() => {
        this.moduleMap = {};
        for (const issueModule of modulesResponse) {
          set(this.moduleMap, [issueModule.id], issueModule);
        }
      });
      return modulesResponse;
    } catch (error) {
      console.error("Failed to fetch members:", error);
      return [];
    }
  };
}
