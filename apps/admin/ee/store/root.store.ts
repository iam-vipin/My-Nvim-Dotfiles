import { enableStaticRendering } from "mobx-react";
// stores
import type { IInstanceFeatureFlagsStore } from "@/plane-admin/store/instance-feature-flags.store";
import { InstanceFeatureFlagsStore } from "@/plane-admin/store/instance-feature-flags.store";
import { CoreRootStore } from "@/store/root.store";
import type { IInstanceManagementStore } from "./instance-management.store";
import { InstanceManagementStore } from "./instance-management.store";
// plane admin store

enableStaticRendering(typeof window === "undefined");

export class RootStore extends CoreRootStore {
  instanceFeatureFlags: IInstanceFeatureFlagsStore;
  instanceManagement: IInstanceManagementStore;

  constructor() {
    super();
    this.instanceFeatureFlags = new InstanceFeatureFlagsStore();
    this.instanceManagement = new InstanceManagementStore(this);
  }

  hydrate(initialData: any) {
    super.hydrate(initialData);
    this.instanceFeatureFlags.hydrate(initialData.instanceFeatureFlags);
  }

  resetOnSignOut() {
    super.resetOnSignOut();
    this.instanceFeatureFlags = new InstanceFeatureFlagsStore();
    this.instanceManagement = new InstanceManagementStore(this);
  }
}
