import { API_BASE_URL } from "@plane/constants";
import type { TWorkspaceBaseActivity } from "@plane/types";
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
  ): Promise<TWorkspaceBaseActivity[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/members/history/`, {
      params,
    })
      .then((response) => response?.data as TWorkspaceBaseActivity[])
      .catch((error: { response?: { data?: unknown } }) => {
        throw error?.response?.data;
      });
  }
}
