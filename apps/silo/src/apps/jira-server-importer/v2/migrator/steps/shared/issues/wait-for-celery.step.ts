import { logger } from "@plane/logger";
import { createEmptyContext } from "@/apps/jira-server-importer/v2/helpers/ctx";
import type { IStep, TStepExecutionContext, TStepExecutionInput } from "@/apps/jira-server-importer/v2/types";
import { EJiraStep } from "@/apps/jira-server-importer/v2/types";
import { wait } from "@/helpers/delay";
import { getAPIClient } from "@/services/client";

export class WaitForCeleryStep implements IStep {
  name = EJiraStep.WAIT_FOR_CELERY;
  dependencies = [];

  async execute(input: TStepExecutionInput): Promise<TStepExecutionContext> {
    const { jobContext } = input;
    const client = getAPIClient();

    // Check if all Celery tasks are done
    const report = await client.importReport.getImportReport(jobContext.job.report_id);

    const allBatchesProcessed = report.imported_batch_count >= report.total_batch_count;

    if (!allBatchesProcessed) {
      logger.info(`[${jobContext.job.id}] [${this.name}] Waiting for Celery to finish`, {
        completed: report.completed_batch_count,
        total: report.total_batch_count,
      });

      // Wait 5 seconds and retrigger
      await wait(5000);
      const emptyContext = createEmptyContext();
      return {
        ...emptyContext,
        pageCtx: {
          ...emptyContext.pageCtx,
          hasMore: true,
        },
      };
    }

    logger.info(`[${jobContext.job.id}] [${this.name}] Celery finished processing all batches`);
    return createEmptyContext();
  }
}
