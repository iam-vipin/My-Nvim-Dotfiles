import { E_FEATURE_FLAGS } from "@plane/constants";
// store
import { BaseWorkspaceRootStore } from "@/store/workspace";
import type { RootStore } from "@/plane-web/store/root.store";

export class WorkspaceRootStore extends BaseWorkspaceRootStore {
  // root store (override base class type)
  rootStore: RootStore;

  constructor(_rootStore: RootStore) {
    super(_rootStore);
    this.rootStore = _rootStore;
  }

  // actions
  /**
   * Mutate workspace members activity
   * @param workspaceSlug
   */
  mutateWorkspaceMembersActivity = async (workspaceSlug: string) => {
    const isMembersActivityEnabled = this.rootStore.featureFlags.getFeatureFlag(
      workspaceSlug,
      E_FEATURE_FLAGS.WORKSPACE_MEMBER_ACTIVITY,
      false
    );

    if (isMembersActivityEnabled) {
      await this.rootStore.workspaceMembersActivityStore.fetchWorkspaceMembersActivity(workspaceSlug);
    }
  };
}
