/* ----------------- Modules Migrator Step ----------------- */
import type { ComponentWithIssueCount } from "jira.js/out/version2/models";
import { v4 as uuid } from "uuid";
import type { JiraConfig, JiraV2Service } from "@plane/etl/jira-server";
import { pullComponentsV2, transformComponentV2 } from "@plane/etl/jira-server";
import { logger } from "@plane/logger";
import type { ExModule } from "@plane/sdk";
import type { TImportJob } from "@plane/types";
import { createEmptyContext, createPaginationContext } from "@/apps/jira-server-importer/v2/helpers/ctx";
import type {
  IStep,
  IStorageService,
  TJobContext,
  TStepExecutionContext,
  TStepExecutionInput,
} from "@/apps/jira-server-importer/v2/types";
import { EJiraServerStep } from "@/apps/jira-server-importer/v2/types";
import { createAllModulesV2 } from "@/etl/migrator/modules.migrator";

/**
 * Jira Server Modules Step (Components in Jira)
 * Pulls components from Jira Server with pagination, transforms to modules, and pushes to Plane
 */
export class JiraServerModulesStep implements IStep {
  name = EJiraServerStep.MODULES;
  dependencies = [];

  private readonly PAGE_SIZE = 100;

  async execute(input: TStepExecutionInput): Promise<TStepExecutionContext> {
    const { jobContext, storage, previousContext } = input;
    const { job, sourceClient } = jobContext;

    try {
      const startAt = previousContext?.pageCtx.startAt ?? 0;
      const totalProcessed = previousContext?.pageCtx.totalProcessed ?? 0;

      logger.info(`[${jobContext.job.id}] [${this.name}] Starting execution`, {
        jobId: job.id,
        startAt,
        totalProcessed,
      });

      const projectKey = job.config?.project?.key;
      if (!projectKey) {
        throw new Error("Project key not found in job config");
      }

      // Pull, transform, push
      const pulled = await this.pull(sourceClient, projectKey, startAt, job.id);

      if (pulled.items.length === 0) {
        logger.info(`[${jobContext.job.id}] [${this.name}] No components found`, { jobId: job.id });
        return createEmptyContext();
      }

      const transformed = this.transform(job, pulled.items);
      const pushed = await this.push(jobContext, transformed, storage);

      return createPaginationContext({
        hasMore: pulled.hasMore,
        startAt,
        pageSize: this.PAGE_SIZE,
        pulled: pulled.items.length,
        pushed,
        totalProcessed: totalProcessed + pulled.items.length,
      });
    } catch (error) {
      logger.error(`[${jobContext.job.id}] [${this.name}] Step failed`, {
        jobId: job.id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Pull components from Jira Server
   */
  private async pull(client: JiraV2Service, projectKey: string, startAt: number, jobId: string) {
    const result = await pullComponentsV2(
      {
        client,
        startAt,
        maxResults: this.PAGE_SIZE,
      },
      projectKey
    );

    logger.info(`[${jobId}] [${this.name}] Pulled components`, {
      jobId,
      count: result.items.length,
      hasMore: result.hasMore,
      startAt,
    });

    return result;
  }

  /**
   * Transform Jira components to Plane modules
   */
  private transform(job: TImportJob<JiraConfig>, jiraComponents: ComponentWithIssueCount[]) {
    const resourceId = job.config.resource ? job.config.resource.id : uuid();
    return jiraComponents.map((component) => transformComponentV2(resourceId, job.project_id, component));
  }

  /**
   * Push modules to Plane and store mappings
   */
  private async push(jobContext: TJobContext, modules: Partial<ExModule>[], storage: IStorageService): Promise<number> {
    const { job, planeClient } = jobContext;
    // Create modules in Plane
    const created = await createAllModulesV2(
      job.id,
      modules as ExModule[],
      planeClient,
      job.workspace_slug,
      job.project_id
    );

    logger.info(`[${job.id}] [${this.name}] Pushed modules`, {
      jobId: job.id,
      count: created.length,
    });

    // Store mappings: component_id -> module_id
    const mappings = created
      .filter((module) => module.external_id && module.id)
      .map((module) => ({
        externalId: module.external_id,
        planeId: module.id!,
      }));

    await storage.storeMapping(job.id, this.name, mappings);

    return created.length;
  }
}
