import { v4 as uuidv4 } from "uuid";
import { logger } from "@plane/logger";
import { createEmptyContext } from "@/apps/jira-server-importer/v2/helpers/ctx";
import type {
  IStep,
  TIssueRelationsData,
  TStepExecutionContext,
  TStepExecutionInput,
} from "@/apps/jira-server-importer/v2/types";
import { E_ADDITIONAL_STORAGE_KEYS, EJiraServerStep } from "@/apps/jira-server-importer/v2/types";
import { celeryProducer } from "@/worker";

/**
 * Relations Step
 *
 * Retrieves all accumulated relations from storage and sends to Celery in one batch
 * Only handles relationships (parent, blocking, etc) - cycles/modules already handled
 */
export class JiraServerRelationsStep implements IStep {
  name = EJiraServerStep.RELATIONS;
  dependencies = [];

  async execute(input: TStepExecutionInput): Promise<TStepExecutionContext> {
    const { jobContext, storage } = input;
    const { job, credentials } = jobContext;

    try {
      logger.info(`[${jobContext.job.id}] [${this.name}] Starting execution`, { jobId: job.id });

      // Retrieve all relations from storage
      const allRelations = await storage.retrieveData<TIssueRelationsData[]>(
        job.id,
        E_ADDITIONAL_STORAGE_KEYS.JIRA_ISSUE_RELATIONS
      );

      if (!allRelations || allRelations.length === 0) {
        logger.info(`[${jobContext.job.id}] [${this.name}] No relations found`, { jobId: job.id });
        return createEmptyContext();
      }

      // Filter out relations with no actual relationships
      const relationsWithRelationships = allRelations.filter((rel) => {
        const r = rel.relationships;
        return (
          r.parent ||
          r.blocking?.length > 0 ||
          r.is_blocked_by?.length > 0 ||
          r.relates_to?.length > 0 ||
          r.duplicate_of
        );
      });

      if (relationsWithRelationships.length === 0) {
        logger.info(`[${jobContext.job.id}] [${this.name}] No relationships to process`, { jobId: job.id });
        return createEmptyContext();
      }

      // Strip out associations (cycles/modules) - only send relationships
      const relationshipsOnly = relationsWithRelationships.map((rel) => ({
        external_id: rel.external_id,
        relationships: rel.relationships,
      }));

      // Send all to Celery in one batch
      await celeryProducer.registerTask(
        {
          relations_batch: relationshipsOnly,
          job_id: job.id,
          workspace_id: job.workspace_id,
          project_id: job.project_id,
          source: job.source,
          user_id: credentials.user_id,
        },
        job.workspace_slug,
        job.project_id,
        job.id,
        credentials.user_id,
        uuidv4(),
        "plane.silo.bgtasks.bulk_update_issue_relations_task_v2.bulk_update_issue_relations_task_v2"
      );

      logger.info(`[${jobContext.job.id}] [${this.name}] Sent all relations to Celery`, {
        jobId: job.id,
        totalRelations: relationshipsOnly.length,
      });

      return createEmptyContext();
    } catch (error) {
      logger.error(`[${jobContext.job.id}] [${this.name}] Step failed`, {
        jobId: job.id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
