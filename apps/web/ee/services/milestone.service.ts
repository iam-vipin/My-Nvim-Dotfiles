import { API_BASE_URL } from "@plane/constants";
import type { ISearchIssueResponse, TIssue, TMilestone } from "@plane/types";
// services
import { APIService } from "@/services/api.service";

export class MilestoneService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }

  async list(workspaceSlug: string, projectId: string): Promise<TMilestone[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/milestones/`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async create(workspaceSlug: string, projectId: string, data: Partial<TMilestone>): Promise<TMilestone> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/milestones/`, data)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async update(
    workspaceSlug: string,
    projectId: string,
    milestoneId: string,
    data: Partial<TMilestone>
  ): Promise<TMilestone> {
    return this.patch(`/api/workspaces/${workspaceSlug}/projects/${projectId}/milestones/${milestoneId}/`, data)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async destroy(workspaceSlug: string, projectId: string, milestoneId: string): Promise<void> {
    return this.delete(`/api/workspaces/${workspaceSlug}/projects/${projectId}/milestones/${milestoneId}/`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async workItemsSearch(workspaceSlug: string, projectId: string, query: string): Promise<ISearchIssueResponse[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/milestones/work-items/search/`, {
      params: { query },
    })
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async getWorkItems(workspaceSlug: string, projectId: string, milestoneId: string): Promise<TIssue[]> {
    return this.get(`/api/workspaces/${workspaceSlug}/projects/${projectId}/milestones/${milestoneId}/work-items/`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }

  async updateWorkItems(
    workspaceSlug: string,
    projectId: string,
    milestoneId: string,
    work_item_ids: string[]
  ): Promise<TIssue[]> {
    return this.post(`/api/workspaces/${workspaceSlug}/projects/${projectId}/milestones/${milestoneId}/work-items/`, {
      work_item_ids,
    })
      .then((res) => res?.data)
      .catch((err) => {
        throw err?.response?.data;
      });
  }
}

const milestoneService = new MilestoneService();

export default milestoneService;
