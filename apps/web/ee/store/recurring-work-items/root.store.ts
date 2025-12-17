// root store
import type { RootStore } from "@/plane-web/store/root.store";
// recurring work items stores
import type { IRecurringWorkItemActivityStore } from "./activity.store";
import { RecurringWorkItemActivityStore } from "./activity.store";
import type { IRecurringWorkItemStore } from "./base.store";
import { RecurringWorkItemStore } from "./base.store";

export interface IRecurringWorkItemsRootStore {
  recurringWorkItems: IRecurringWorkItemStore;
  recurringWorkItemActivities: IRecurringWorkItemActivityStore;
}

export class RecurringWorkItemsRootStore implements IRecurringWorkItemsRootStore {
  recurringWorkItems: IRecurringWorkItemStore;
  recurringWorkItemActivities: IRecurringWorkItemActivityStore;

  constructor(root: RootStore) {
    this.recurringWorkItems = new RecurringWorkItemStore(root);
    this.recurringWorkItemActivities = new RecurringWorkItemActivityStore();
  }
}
