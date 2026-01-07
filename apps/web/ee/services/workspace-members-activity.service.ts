import { API_BASE_URL } from "@plane/constants";
// plane web imports
import type { TWorkspaceMemberActivity } from "@/plane-web/components/workspace/members/sidebar/activity/helper";
import { APIService } from "@/services/api.service";

export class WorkspaceMembersActivityService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  /**
   * Get workspace members activity
   * @param workspaceSlug
   * @param params
   */
  async getWorkspaceMembersActivity(
    workspaceSlug: string,
    params: { created_at__gt?: string } & Record<string, unknown> = {}
  ): Promise<TWorkspaceMemberActivity[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/members/history/`, {
      params,
    })
      .then((response) => response?.data as TWorkspaceMemberActivity[])
      .catch((error: { response?: { data?: unknown } }) => {
        throw error?.response?.data;
      });
  }
}
