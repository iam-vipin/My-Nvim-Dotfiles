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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      if (!this.rootStore.initiativeStore) return;

      // Access initiativesMap to track initiative data changes
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
