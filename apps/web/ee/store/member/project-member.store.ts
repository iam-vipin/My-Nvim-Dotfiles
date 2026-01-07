import { update } from "lodash-es";
import { computedFn } from "mobx-utils";
import { EUserProjectRoles } from "@plane/types";
import type { IProjectBulkAddFormData, TProjectMembership } from "@plane/types";
// plane imports
import { getHighestRole } from "@plane/utils";
// plane web imports
import type { RootStore } from "@/plane-web/store/root.store";
// store
import type { IMemberRootStore } from "@/store/member";
import type { IBaseProjectMemberStore } from "@/store/member/project/base-project-member.store";
import { BaseProjectMemberStore } from "@/store/member/project/base-project-member.store";
import { E_FEATURE_FLAGS } from "@plane/constants";

export type IProjectMemberStore = IBaseProjectMemberStore;

export class ProjectMemberStore extends BaseProjectMemberStore implements IProjectMemberStore {
  constructor(_memberRoot: IMemberRootStore, rootStore: RootStore) {
    super(_memberRoot, rootStore);
  }

  /**
   * @description Returns the project role from the teamspace membership
   * @param { string } userId
   * @param { string } projectId
   * @returns { EUserProjectRoles | undefined }
   */
  private getProjectRoleFromTeamspaceMembership = computedFn(
    (userId: string, projectId: string): EUserProjectRoles | undefined => {
      // Find all the teamspaces linked to the project
      const projectTeamspaceIds = this.rootStore.teamspaceRoot.teamspaces.getProjectTeamspaceIds(projectId);
      if (!projectTeamspaceIds || projectTeamspaceIds.length === 0) return undefined;
      // Check if the user is a member of any of the teamspaces
      const isUserMemberOfTeamspace = projectTeamspaceIds.some((teamspaceId) =>
        this.rootStore.teamspaceRoot.teamspaces.isUserMemberOfTeamspace(userId, teamspaceId)
      );
      if (!isUserMemberOfTeamspace) return undefined;
      // Return MEMBER if the user is a member of any of the teamspaces
      return EUserProjectRoles.MEMBER;
    }
  );

  /**
   * @description Returns the highest role from the project and teamspace membership
   * @param { string } userId
   * @param { string } projectId
   * @returns { EUserProjectRoles | undefined }
   */
  getUserProjectRole = computedFn((userId: string, projectId: string): EUserProjectRoles | undefined => {
    // Get the roles from the project and teamspace membership
    const projectRoleFromProjectMembership = this.getRoleFromProjectMembership(userId, projectId);
    const projectRoleFromTeamspaceMembership = this.getProjectRoleFromTeamspaceMembership(userId, projectId);

    // Filter out undefined roles and get the highest role
    const roles = [projectRoleFromProjectMembership, projectRoleFromTeamspaceMembership].filter(
      (role): role is EUserProjectRoles => role !== undefined
    );

    // Return the highest role
    return getHighestRole(roles);
  });

  /**
   * @description Returns the highest role from the project and teamspace membership
   * @param projectId
   * @param userId
   * @param role
   */
  getProjectMemberRoleForUpdate = (projectId: string, userId: string, role: EUserProjectRoles): EUserProjectRoles => {
    const projectRoleFromTeamspaceMembership = this.getProjectRoleFromTeamspaceMembership(userId, projectId);

    const availableRoles = [projectRoleFromTeamspaceMembership, role].filter(
      (role): role is EUserProjectRoles => role !== undefined
    );

    return getHighestRole(availableRoles) ?? role;
  };

  /**
   * @description Processes the removal of a member from a project
   * This method handles the cleanup of member data from the project member map
   * @param projectId - The ID of the project to remove the member from
   * @param userId - The ID of the user to remove from the project
   */
  processMemberRemoval = (projectId: string, userId: string) => {
    // Get the role from the teamspace membership
    const projectRoleFromTeamspaceMembership = this.getProjectRoleFromTeamspaceMembership(userId, projectId);
    if (projectRoleFromTeamspaceMembership) {
      // If the user is a member of the teamspace, update user membership detail
      update(this.projectMemberMap, [projectId, userId], (prev: TProjectMembership) => ({
        ...prev,
        id: null,
        original_role: null,
        role: projectRoleFromTeamspaceMembership,
      }));
    } else {
      this.handleMemberRemoval(projectId, userId);
    }
  };

  /**
   * @description Mutate project members activity
   * @param workspaceSlug
   * @param projectId
   */
  mutateProjectMembersActivity = async (workspaceSlug: string, projectId: string) => {
    const isProjectMembersActivityEnabled = this.rootStore.featureFlags.getFeatureFlag(
      workspaceSlug,
      E_FEATURE_FLAGS.PROJECT_MEMBER_ACTIVITY,
      false
    );

    if (isProjectMembersActivityEnabled) {
      await this.rootStore.projectMembersActivityStore.fetchProjectMembersActivity(workspaceSlug, projectId);
    }
  };

  /**
   * @description bulk add members to a project
   * @param workspaceSlug
   * @param projectId
   * @param data
   * @returns Promise<TProjectMembership[]>
   */
  override bulkAddMembersToProject = async (
    workspaceSlug: string,
    projectId: string,
    data: IProjectBulkAddFormData
  ) => {
    const response = await super.bulkAddMembersToProject(workspaceSlug, projectId, data);
    void this.mutateProjectMembersActivity(workspaceSlug, projectId);
    return response;
  };

  /**
   * @description update the role of a member in a project
   * @param workspaceSlug
   * @param projectId
   * @param userId
   * @param data
   */
  override updateMemberRole = async (
    workspaceSlug: string,
    projectId: string,
    userId: string,
    role: EUserProjectRoles
  ) => {
    const response = await super.updateMemberRole(workspaceSlug, projectId, userId, role);
    void this.mutateProjectMembersActivity(workspaceSlug, projectId);
    return response;
  };

  /**
   * @description remove a member from a project
   * @param workspaceSlug
   * @param projectId
   * @param userId
   */
  override removeMemberFromProject = async (workspaceSlug: string, projectId: string, userId: string) => {
    await super.removeMemberFromProject(workspaceSlug, projectId, userId);
    void this.mutateProjectMembersActivity(workspaceSlug, projectId);
  };
}
