import { API_BASE_URL } from "@plane/constants";
import type { TIssueComment } from "@plane/types";
import { APIService } from "../../api.service";

/**
 * Service class for managing comment replies
 * Extends the APIService class to handle HTTP requests to the comment replies endpoints
 * @extends {APIService}
 */
export class RepliesService extends APIService {
  constructor(BASE_URL?: string) {
    super(BASE_URL || API_BASE_URL);
  }

  /**
   * Lists all replies for a specific comment
   * @param {string} workspaceSlug - The workspace slug
   * @param {string} projectId - The project ID
   * @param {string} issueId - The issue ID
   * @param {string} commentId - The comment ID to get replies for
   * @returns {Promise<TIssueComment[]>} Promise resolving to an array of comment replies
   * @throws {Error} If the API request fails
   */
  async list(workspaceSlug: string, projectId: string, issueId: string, commentId: string): Promise<TIssueComment[]> {
    return this.get(
      `/api/workspaces/${workspaceSlug}/projects/${projectId}/issues/${issueId}/comments/${commentId}/replies/`
    )
      .then((response) => response?.data)
      .catch((error) => {
        throw error?.response?.data;
      });
  }
}
