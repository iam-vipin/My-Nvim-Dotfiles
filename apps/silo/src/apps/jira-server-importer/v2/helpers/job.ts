import type { JiraConfig } from "@plane/etl/jira-server";
import type { TImportJob } from "@plane/types";

export const extractJobData = (
  job: TImportJob<JiraConfig>
): {
  projectId: string;
  resourceId: string;
} => ({
  projectId: job.project_id,
  resourceId: job.config?.resource?.id || "",
});

export const buildExternalId = (projectId: string, resourceId: string, id: string): string =>
  `${projectId}_${resourceId}_${id}`;
