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

import { autorun } from "mobx";
// Store
import type { RootStore } from "@/plane-web/store/root.store";
import { BaseTimeLineStore } from "@/plane-web/store/timeline/base-timeline.store";
import type { IBaseTimelineStore } from "@/plane-web/store/timeline/base-timeline.store";

export interface IInitiativesTimeLineStore extends IBaseTimelineStore {
  isDependencyEnabled: boolean;
}

export class InitiativesTimeLineStore extends BaseTimeLineStore implements IInitiativesTimeLineStore {
  constructor(_rootStore: RootStore) {
    super(_rootStore);

    autorun(() => {
      // Access blockIds to make autorun reactive to blockIds changes
      // MobX autorun only tracks observables accessed directly in the function
      // Even though updateBlocks uses this.blockIds internally, we need to access it here
      // for MobX to track it and re-run the autorun when blockIds changes
      if (!this.blockIds) return;

      // Access filteredInitiativesMap to track initiative data changes
      const initiativesMap = this.rootStore.initiativeStore.filteredInitiativesMap;

      // Create a getter that transforms initiatives to include sort_order and target_date
      const getInitiativeById = (id: string) => {
        const initiative = initiativesMap?.[id];
        if (!initiative) return undefined;
        return {
          ...initiative,
          sort_order: null, // Initiatives don't have sort_order
          target_date: initiative.end_date, // Map end_date to target_date
        };
      };

      this.updateBlocks(getInitiativeById);
    });
  }
}
