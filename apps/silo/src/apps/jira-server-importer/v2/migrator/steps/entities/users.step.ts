import type { ImportedJiraUser, JiraConfig, JiraV2Service } from "@plane/etl/jira-server";
import { pullUsersV2, transformUser } from "@plane/etl/jira-server";
import { logger } from "@plane/logger";
import type { Client as PlaneClient, PlaneUser } from "@plane/sdk";
import type { TImportJob, TWorkspaceCredential } from "@plane/types";
import { withCache } from "@/apps/jira-server-importer/v2/helpers/cache";
import { createEmptyContext, createPaginationContext } from "@/apps/jira-server-importer/v2/helpers/ctx";
import type {
  IStep,
  IStorageService,
  TJobContext,
  TStepExecutionContext,
  TStepExecutionInput,
} from "@/apps/jira-server-importer/v2/types";
import { EJiraServerStep } from "@/apps/jira-server-importer/v2/types";
import { createUsers } from "@/etl/migrator/users.migrator";
import { protect } from "@/lib";

/**
 * Handles the import of users from Jira Server to Plane.
 *
 * This step pulls all users from Jira Server in a paginated manner, transforms them
 * to the Plane format, and creates them in the target Plane workspace. It stores
 * mappings between Jira user emails and Plane user IDs for use by dependent steps.
 *
 * User avatars are also imported to Plane during this process.
 */
export class JiraServerUsersStep implements IStep {
  name = EJiraServerStep.USERS;
  dependencies = [];

  private readonly PAGE_SIZE = 100;

  /**
   * Check if user import should be skipped based on job configuration
   */
  private shouldExecute(input: TStepExecutionInput): boolean {
    const { jobContext } = input;
    const job = jobContext.job as TImportJob<JiraConfig>;
    return !job.config?.skipUserImport;
  }

  /**
   * Executes the user import step with pagination support.
   *
   * Orchestrates the pull-transform-push pattern:
   * 1. Checks if user import should be skipped based on job configuration
   * 2. Pulls users from Jira Server (paginated)
   * 3. Transforms them to Plane format
   * 4. Creates new users in Plane (deduplicates against existing users)
   * 5. Stores email-to-ID mappings for dependent steps
   *
   * @param input - The step execution input containing job context, storage, and previous pagination state
   * @returns Execution context with pagination info (hasMore, startAt, counts)
   * @throws Error if the step execution fails at any stage
   */
  async execute(input: TStepExecutionInput): Promise<TStepExecutionContext> {
    const { jobContext, storage, previousContext } = input;
    const { job, sourceClient } = jobContext;

    try {
      // Check if user import should be skipped
      if (!this.shouldExecute(input)) {
        logger.info(`[${job.id}] [${this.name}] Skipping - skipUserImport is configured`, {
          jobId: job.id,
        });
        return {
          pageCtx: { startAt: 0, hasMore: false, totalProcessed: 0 },
          results: { pulled: 0, pushed: 0, errors: [] },
        };
      }

      // Get pagination state
      const startAt = previousContext?.pageCtx.startAt ?? 0;
      const totalProcessed = previousContext?.pageCtx.totalProcessed ?? 0;

      logger.info(`[${job.id}] [${this.name}] Starting execution`, {
        jobId: job.id,
        startAt,
        totalProcessed,
      });

      // Pull users from Jira Server (paginated)
      const pulledUsers = await this.pull(sourceClient, startAt, job.id);

      if (pulledUsers.items.length === 0) {
        logger.info(`[${job.id}] [${this.name}] No users found`, { jobId: job.id });
        return createEmptyContext();
      }

      // Transform users
      const transformedUsers = this.transform(pulledUsers.items);

      // Push to Plane (create only new users)
      const createdCount = await this.push(jobContext, transformedUsers, storage);

      return createPaginationContext({
        hasMore: pulledUsers.hasMore,
        startAt: startAt,
        pageSize: this.PAGE_SIZE,
        pulled: pulledUsers.items.length,
        pushed: createdCount,
        totalProcessed: totalProcessed + pulledUsers.items.length,
      });
    } catch (error) {
      logger.error(`[${job.id}] [${this.name}] Step failed`, {
        jobId: job.id,
        error: error as Error,
      });
      throw error;
    }
  }

  /**
   * Pulls users from Jira Server API with pagination support.
   *
   * @param client - The Jira V2 service client for making API calls
   * @param startAt - The pagination offset (0-based index)
   * @param jobId - The import job ID for logging purposes
   * @returns Paginated result containing user items and hasMore flag
   */
  private async pull(client: JiraV2Service, startAt: number, jobId: string) {
    const result = await pullUsersV2({
      client,
      startAt,
      maxResults: this.PAGE_SIZE,
    });

    logger.info(`[${jobId}] [${this.name}] Pulled users from Jira Server`, {
      jobId,
      count: result.items.length,
      hasMore: result.hasMore,
      startAt,
    });

    return result;
  }

  /**
   * Transforms Jira Server users to Plane user format.
   *
   * @param jiraUsers - Array of users imported from Jira Server
   * @returns Array of users in Plane format ready for creation
   */
  private transform(jiraUsers: ImportedJiraUser[]) {
    return jiraUsers.map((user) => transformUser(user));
  }

  /**
   * Pushes users to Plane, creating only new ones that don't already exist.
   *
   * Performs deduplication by comparing against existing Plane users via email.
   * After creating new users, stores mappings from email to Plane user ID
   * for use by dependent import steps (e.g., issue assignment).
   *
   * @param jobContext - The job context containing Plane client and job details
   * @param transformedUsers - Array of transformed users ready to be created
   * @param storage - Storage service for persisting email-to-ID mappings
   * @returns The number of users successfully created in Plane
   */
  private async push(
    jobContext: TJobContext,
    transformedUsers: Partial<PlaneUser>[],
    storage: IStorageService
  ): Promise<number> {
    const { planeClient, job, credentials } = jobContext;

    const existingUsers = await this.fetchExistingUsers(planeClient, job);
    const usersToCreate = this.extractNewUsers(transformedUsers, existingUsers);

    logger.info(`[${job.id}] [${this.name}] User deduplication`, {
      jobId: job.id,
      pulled: transformedUsers.length,
      existing: existingUsers.length,
      toCreate: usersToCreate.length,
    });

    const createdUsers = await this.dispatchUserCreation(
      job.id,
      usersToCreate,
      planeClient,
      credentials,
      job.workspace_slug,
      job.project_id
    );

    await this.dispatchStoreMappings(job.id, existingUsers, createdUsers, storage);

    return createdUsers.length;
  }

  /**
   * Fetches all existing users from Plane workspace.
   *
   * @param planeClient - The Plane SDK client
   * @param job - The import job containing workspace and project info
   * @returns Array of existing Plane users
   */
  private async fetchExistingUsers(planeClient: PlaneClient, job: TImportJob<JiraConfig>): Promise<PlaneUser[]> {
    return withCache(
      this.name,
      job,
      async () => await protect(planeClient.users.list.bind(planeClient.users), job.workspace_slug, job.project_id)
    );
  }

  /**
   * Extracts users that don't exist in Plane by comparing emails.
   *
   * @param transformedUsers - Users transformed from Jira format
   * @param existingUsers - Current users in Plane workspace
   * @returns Filtered array of users that need to be created
   */
  private extractNewUsers(transformedUsers: Partial<PlaneUser>[], existingUsers: PlaneUser[]): Partial<PlaneUser>[] {
    return transformedUsers.filter((user) => !existingUsers.find((existing) => existing.email === user.email));
  }

  /**
   * Dispatches user creation to Plane if there are users to create.
   *
   * @param jobId - The import job ID
   * @param usersToCreate - Array of users to create
   * @param planeClient - The Plane SDK client
   * @param credentials - Authentication credentials
   * @param workspaceSlug - Target workspace slug
   * @param projectId - Target project ID
   * @returns Array of successfully created users
   */
  private async dispatchUserCreation(
    jobId: string,
    usersToCreate: Partial<PlaneUser>[],
    planeClient: PlaneClient,
    credentials: TWorkspaceCredential,
    workspaceSlug: string,
    projectId: string
  ): Promise<PlaneUser[]> {
    if (usersToCreate.length === 0) {
      return [];
    }

    return await createUsers(jobId, usersToCreate as PlaneUser[], planeClient, credentials, workspaceSlug, projectId);
  }

  /**
   * Dispatches storage of user mappings (email to Plane user ID).
   *
   * @param jobId - The import job ID
   * @param existingUsers - Users that already existed in Plane
   * @param createdUsers - Users that were newly created
   * @param storage - Storage service for persisting mappings
   */
  private async dispatchStoreMappings(
    jobId: string,
    existingUsers: PlaneUser[],
    createdUsers: PlaneUser[],
    storage: IStorageService
  ): Promise<void> {
    const allUsers = [...existingUsers, ...createdUsers];
    const mappings = allUsers
      .filter((user) => user.email && user.id)
      .map((user) => ({
        externalId: user.email!,
        planeId: user.id!,
      }));

    await storage.storeMapping(jobId, this.name, mappings);

    logger.info(`[${jobId}] [${this.name}] Stored mappings`, {
      jobId,
      mappingCount: mappings.length,
    });
  }
}
