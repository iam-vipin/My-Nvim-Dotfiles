import { pullIssueTypes } from "@plane/etl/jira";
import { logger } from "@plane/logger";
import { createJiraClient } from "@/apps/jira-importer/helpers/migration-helpers";
import type { TJobContext } from "@/apps/jira-server-importer/v2/types";
import { getJobCredentials } from "@/helpers/job";
import { JiraIssueTypesStep } from "../../shared";

export class JiraCloudIssueTypesStep extends JiraIssueTypesStep {
  protected async pull(jobContext: TJobContext, projectId: string, startAt: number) {
    const { job } = jobContext;
    const credentials = await getJobCredentials(job);
    const client = createJiraClient(job, credentials);
    const result = await pullIssueTypes(client, projectId);

    logger.info(`[${jobContext.job.id}] [${this.name}] Pulled issue types from Jira Cloud`, {
      jobId: jobContext.job.id,
      count: result.length,
      hasMore: false,
      startAt,
    });

    return {
      items: result,
      hasMore: false,
      startAt,
      maxResults: result.length,
    };
  }
}
