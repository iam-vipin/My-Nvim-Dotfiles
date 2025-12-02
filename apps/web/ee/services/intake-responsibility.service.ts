import { API_BASE_URL } from "@plane/constants";
import type { TIntakeUser } from "@plane/types";
// services
import { APIService } from "@/services/api.service";

export class IntakeResponsibilityService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async getIntakeAssignee(workspaceSlug: string, projectId: string): Promise<TIntakeUser> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/intake-responsibilities/`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async createIntakeAssignee(workspaceSlug: string, projectId: string, data: { user: string }): Promise<TIntakeUser> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/intake-responsibilities/`, data)
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }

  async deleteIntakeAssignee(workspaceSlug: string, projectId: string, userId: string): Promise<void> {
    return this.delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}/intake-responsibilities/${userId}/`)
      .then((response) => response?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }
}
