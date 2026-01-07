import { API_BASE_URL } from "@plane/constants";
import type { TProjectMemberActivity } from "@/plane-web/components/projects/members/siderbar/activity/helper";
import { APIService } from "@/services/api.service";

export class ProjectMembersActivityService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  /**
   * Get project members activity
   * @param workspaceSlug
   * @param projectId
   * @param params
   */
  async getProjectMembersActivity(
    workspaceSlug: string,
    projectId: string,
    params: { created_at__gt?: string } & Record<string, unknown> = {}
  ): Promise<TProjectMemberActivity[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/project-members/history/`, {
      params,
    })
      .then((response) => response?.data as TProjectMemberActivity[])
      .catch((error: { response?: { data?: unknown } }) => {
        throw error?.response?.data;
      });
  }
}
