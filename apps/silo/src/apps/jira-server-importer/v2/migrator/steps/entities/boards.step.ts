import type { Board } from "jira.js/out/agile/models";
import type { JiraConfig, JiraV2Service, PaginatedResult } from "@plane/etl/jira-server";
import { pullBoardsV2 } from "@plane/etl/jira-server";
import { logger } from "@plane/logger";
import type { TImportJob } from "@plane/types";
import {
  createContinueContext,
  createEmptyContext,
  createSuccessContext,
} from "@/apps/jira-server-importer/v2/helpers/ctx";
import type {
  IStep,
  IStorageService,
  TBoardData,
  TStepExecutionContext,
  TStepExecutionInput,
} from "@/apps/jira-server-importer/v2/types";
import { EJiraServerStep } from "@/apps/jira-server-importer/v2/types";

/**
 * Handles the extraction of boards from Jira Server.
 *
 * This step pulls all boards from Jira Server in a paginated manner and stores them
 * for use by dependent steps. Boards are accumulated across pages and stored once
 * all pages have been fetched.
 *
 * Note: Boards are not created as entities in Plane, only stored as reference data
 * for mapping issues to modules/views. If future requirements need board entities
 * in Plane, add transform/push logic here.
 */
export class JiraServerBoardsStep implements IStep {
  name = EJiraServerStep.BOARDS;
  dependencies = [];

  private readonly PAGE_SIZE = 100;

  /**
   * Executes the board extraction process:
   * 1. Retrieves pagination context
   * 2. Pulls boards from Jira Server
   * 3. Stores boards in Redis
   * 4. Continues to next page or completes
   */
  async execute(input: TStepExecutionInput): Promise<TStepExecutionContext> {
    const { jobContext, storage, previousContext } = input;
    const { job, sourceClient } = jobContext;

    try {
      const { startAt, totalProcessed } = this.getPaginationContext(previousContext);
      const projectId = this.getProjectId(job);

      logger.info(`[${job.id}] [${this.name}] Pulling boards`, { startAt, totalProcessed });

      const result = await this.pullBoards(sourceClient, projectId, startAt, job.id);

      if (this.shouldReturnEmpty(result, startAt)) {
        return createEmptyContext();
      }

      await this.storeBoards(storage, job.id, result.items);

      const newTotalProcessed = totalProcessed + result.items.length;

      return this.buildNextContext(result, startAt, newTotalProcessed);
    } catch (error) {
      logger.error(`[${job.id}] [${this.name}] Step failed`, {
        jobId: job.id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Extracts pagination state from previous context
   */
  private getPaginationContext(previousContext?: TStepExecutionContext) {
    return {
      startAt: previousContext?.pageCtx.startAt ?? 0,
      totalProcessed: previousContext?.pageCtx.totalProcessed ?? 0,
    };
  }

  /**
   * Extracts and validates project ID from job configuration
   */
  private getProjectId(job: TImportJob<JiraConfig>): string {
    const projectId = job.config?.project?.id;
    if (!projectId) {
      throw new Error("Project ID not found in job config");
    }
    return projectId;
  }

  /**
   * Pulls a page of boards from Jira Server
   */
  private async pullBoards(client: JiraV2Service, projectId: string, startAt: number, jobId: string) {
    const result = await pullBoardsV2(
      {
        client,
        startAt,
        maxResults: this.PAGE_SIZE,
      },
      projectId
    );

    logger.info(`[${jobId}] [${this.name}] Pulled boards`, {
      jobId,
      count: result.items.length,
      hasMore: result.hasMore,
    });

    return result;
  }

  /**
   * Checks if step should return empty context (no boards found on first page)
   */
  private shouldReturnEmpty(result: PaginatedResult<Board>, startAt: number): boolean {
    return result.items.length === 0 && startAt === 0;
  }

  /**
   * Stores boards in Redis with automatic deduplication by board ID
   */
  private async storeBoards(storage: IStorageService, jobId: string, items: Board[]) {
    if (items.length === 0) return;

    const boardData: TBoardData = items
      .filter((board) => board.id && board.name && board.type)
      .map((board) => ({
        id: board.id,
        name: board.name,
        type: board.type,
      })) as TBoardData;

    await storage.storeData(jobId, this.name, boardData, "id");

    logger.info(`[${jobId}] [${this.name}] Stored boards`, { count: boardData.length });
  }

  /**
   * Builds the next context based on pagination state
   */
  private buildNextContext(
    result: PaginatedResult<Board>,
    startAt: number,
    totalProcessed: number
  ): TStepExecutionContext {
    const pulled = result.items.length;

    if (result.hasMore) {
      return createContinueContext({
        nextStartAt: startAt + this.PAGE_SIZE, // Fixed: nextStartAt instead of startAt
        totalProcessed,
        pulled,
        pushed: pulled,
      });
    }

    return createSuccessContext({
      pulled,
      pushed: pulled,
      totalProcessed,
    });
  }
}
