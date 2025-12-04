import { action, computed, makeObservable, observable, runInAction } from "mobx";

/**
 * Base instance class for work item entities
 * Provides common MobX observable pattern that can be extended by specific instances
 */
export abstract class BaseWorkItemCommentInstance<T extends { id: string }> {
  // Common observable properties
  id: string;

  constructor(data: T) {
    this.id = data.id;

    makeObservable(this, {
      id: observable.ref,
      asJSON: computed,
      update: action,
    });
  }

  /**
   * Returns the instance as plain JSON object
   */
  abstract get asJSON(): T;

  /**
   * Update method - updates instance properties with partial data
   * Uses Object.keys pattern for efficient updates
   */
  update = action((data: Partial<T>) => {
    runInAction(() => {
      Object.keys(data).forEach((key) => {
        const typedKey = key as keyof T;
        if (data[typedKey] !== undefined) {
          (this as Record<keyof T, unknown>)[typedKey] = data[typedKey];
        }
      });
    });
  });
}
