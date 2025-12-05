import { pullUsers } from "@plane/etl/jira";
import type { JiraV2Service, PaginatedResult, ImportedJiraUser } from "@plane/etl/jira-server";
import { logger } from "@plane/logger";
import type { TJobContext } from "../../../../types";
import { JiraUsersStep } from "../../shared/entities";

export class JiraCloudUserStep extends JiraUsersStep {
  /*
   * For jira cloud, we don't have access to user emails, hence
   * we take a csv in order to import the users, and we use a different
   * pull function, hence we need to overwrite this.
   */
  protected async pull(
    jobContext: TJobContext,
    _client: JiraV2Service,
    _startAt: number,
    _jobId: string
  ): Promise<PaginatedResult<ImportedJiraUser>> {
    const { job } = jobContext;
    if (!job.config.users) {
      logger.error(`[${job.id}] [${this.name}] No users found in config`, { jobId: job.id });
      return {
        items: [],
        hasMore: false,
        total: 0,
        startAt: 0,
        maxResults: 0,
      };
    }

    const users = pullUsers(job.config.users);
    const items = users.map((user) => ({
      avatarUrl: "",
      user_id: user.user_id,
      email: user.email,
      full_name: "",
      user_name: user.user_name,
      added_to_org: user.added_to_org,
      org_role: user.org_role,
      user_status: "Active",
    }));

    return {
      items,
      hasMore: false,
      total: items.length,
      startAt: 0,
      maxResults: items.length,
    };
  }
}
