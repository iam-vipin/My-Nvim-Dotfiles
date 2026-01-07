// store
import type { IBaseWorkspaceMemberStore } from "@/store/member/workspace/workspace-member.store";
import { BaseWorkspaceMemberStore } from "@/store/member/workspace/workspace-member.store";
import type { RootStore } from "@/plane-web/store/root.store";
import type { IMemberRootStore } from "@/store/member";
// types
import type { EUserPermissions } from "@plane/constants";
import { E_FEATURE_FLAGS } from "@plane/constants";
import type { IWorkspaceBulkInviteFormData } from "@plane/types";

export type IWorkspaceMemberStore = IBaseWorkspaceMemberStore & {
  mutateWorkspaceMembersActivity: (workspaceSlug: string) => Promise<void>;
};

export class WorkspaceMemberStore extends BaseWorkspaceMemberStore implements IWorkspaceMemberStore {
  constructor(_memberRoot: IMemberRootStore, _rootStore: RootStore) {
    super(_memberRoot, _rootStore);
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

  /**
   * @description update the role of a workspace member
   * @param workspaceSlug
   * @param userId
   * @param data
   */
  override updateMember = async (workspaceSlug: string, userId: string, data: { role: EUserPermissions }) => {
    await super.updateMember(workspaceSlug, userId, data);
    void this.mutateWorkspaceMembersActivity(workspaceSlug);
  };

  /**
   * @description remove a member from workspace
   * @param workspaceSlug
   * @param userId
   */
  override removeMemberFromWorkspace = async (workspaceSlug: string, userId: string) => {
    await super.removeMemberFromWorkspace(workspaceSlug, userId);
    void this.mutateWorkspaceMembersActivity(workspaceSlug);
  };

  /**
   * @description bulk invite members to a workspace
   * @param workspaceSlug
   * @param data
   */
  override inviteMembersToWorkspace = async (workspaceSlug: string, data: IWorkspaceBulkInviteFormData) => {
    await super.inviteMembersToWorkspace(workspaceSlug, data);
    void this.mutateWorkspaceMembersActivity(workspaceSlug);
  };

  /**
   * @description delete a member invitation
   * @param workspaceSlug
   * @param memberId
   */
  override deleteMemberInvitation = async (workspaceSlug: string, invitationId: string) => {
    await super.deleteMemberInvitation(workspaceSlug, invitationId);
    void this.mutateWorkspaceMembersActivity(workspaceSlug);
  };
}
