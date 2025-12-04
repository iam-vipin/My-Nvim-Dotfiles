import { pullIssueFields } from "@plane/etl/jira";
import type { JiraIssueField } from "@plane/etl/jira-server";
import { createJiraClient } from "@/apps/jira-importer/helpers/migration-helpers";
import { getJobCredentials } from "@/helpers/job";
import type { TJobContext, TIssueTypesData } from "../../../../types";
import { JiraIssuePropertiesStep } from "../../shared/entities";

export class JiraCloudIssuePropertiesStep extends JiraIssuePropertiesStep {
  protected async pull(
    jobCtx: TJobContext,
    projectId: string,
    issueTypesData: TIssueTypesData
  ): Promise<JiraIssueField[]> {
    const { job } = jobCtx;
    const credentials = await getJobCredentials(job);
    const client = createJiraClient(job, credentials);
    const issueTypes = issueTypesData
      .map((type) => {
        const id = type.external_id.split("_").pop();
        if (typeof id !== "string" || id.length === 0) {
          return null;
        }
        return { id, name: type.name };
      })
      .filter((item): item is { id: string; name: string } => item !== null);

    return pullIssueFields(client, issueTypes, projectId);
  }
}
