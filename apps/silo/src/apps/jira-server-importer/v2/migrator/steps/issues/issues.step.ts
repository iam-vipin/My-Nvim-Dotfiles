import { v4 as uuidv4 } from "uuid";
import type { TIssuePropertyValuesPayload } from "@plane/etl/core";
import type { IJiraIssue, JiraConfig, JiraIssueField } from "@plane/etl/jira-server";
import { pullIssuesV2, transformComment, transformIssueV2 } from "@plane/etl/jira-server";
import { logger } from "@plane/logger";
import type { ExIssue, ExIssueComment, ExIssueProperty, ExIssuePropertyOption, TWorklog } from "@plane/sdk";
import type { TImportJob } from "@plane/types";
import { getTransformedIssuePropertyValuesV2 } from "@/apps/jira-server-importer/migrator/transformers";
import { createEmptyContext, createPaginationContext } from "@/apps/jira-server-importer/v2/helpers/ctx";
import { buildExternalId, extractJobData } from "@/apps/jira-server-importer/v2/helpers/job";
import { detectSprintFieldId, parseJiraServerSprint } from "@/apps/jira-server-importer/v2/helpers/sprints";
import type {
  IStep,
  IStorageService,
  TIssuePropertiesData,
  TIssueRelationsData,
  TIssuesAssociationsData,
  TIssueTypesData,
  TJobContext,
  TStepExecutionContext,
  TStepExecutionInput,
} from "@/apps/jira-server-importer/v2/types";
import { E_ADDITIONAL_STORAGE_KEYS, EJiraServerStep } from "@/apps/jira-server-importer/v2/types";
import { generateIssuePayloadV2 } from "@/etl/migrator/issues.migrator";
import { getAPIClient } from "@/services/client";
import type { BulkIssuePayload } from "@/types";
import { celeryProducer } from "@/worker";

/**
 * Jira Server Issues Step
 *
 * Pulls issues paginated with comments and property values
 * Processes attachments inline, resolves all entities
 * Uses existing transform functions for proper data conversion
 * Strips parent/cycles/modules → stored as relations for later
 *
 * Dependencies:
 * - issue_properties (provides properties + rawFields for property value transformation)
 * - issue_property_options (provides options)
 *
 * NOT dependencies (accessed via storage.lookupMapping):
 * - users, labels, issue_types
 */
export class JiraServerIssuesStep implements IStep {
  name = EJiraServerStep.ISSUES;

  dependencies = [
    EJiraServerStep.ISSUE_TYPES, // Provides issue types
    EJiraServerStep.ISSUE_PROPERTIES, // Provides properties + rawFields
    EJiraServerStep.ISSUE_PROPERTY_OPTIONS, // Provides options
  ];

  private readonly PAGE_SIZE = 50;

  /**
   * Initialize report batch count on first page
   * Automatically detects if it's the first page and calculates total batches
   */
  private async initializeReportBatchCount(input: TStepExecutionInput, totalIssues: number): Promise<void> {
    const { jobContext, previousContext } = input;
    const startAt = previousContext?.pageCtx.startAt || 0;

    // Only initialize on first page
    if (startAt !== 0) return;

    const totalBatches = Math.ceil(totalIssues / this.PAGE_SIZE);
    const client = getAPIClient();

    await client.importReport.updateImportReport(jobContext.job.report_id, {
      total_batch_count: totalBatches,
    });

    logger.info(`[${jobContext.job.id}] [${this.name}] Initialized report batch count`, {
      jobId: jobContext.job.id,
      totalIssues,
      pageSize: this.PAGE_SIZE,
      totalBatches,
    });
  }

  async execute(input: TStepExecutionInput): Promise<TStepExecutionContext> {
    const { jobContext, storage, previousContext, dependencyData } = input;
    const { job } = jobContext;

    try {
      const projectKey = job.config?.project?.key;
      if (!projectKey) {
        throw new Error("Project key not found in job config");
      }

      const startAt = previousContext?.pageCtx.startAt || 0;
      const totalProcessed = previousContext?.pageCtx.totalProcessed || 0;

      logger.info(`[${jobContext.job.id}] [${this.name}] Starting execution`, {
        jobId: job.id,
        startAt,
        totalProcessed,
      });

      // Get property data from dependencies (needed for property value transformation)
      const propertyData = this.getPropertyData(dependencyData);
      const additionalData = await this.getAdditionalData(storage, job);

      // Pull paginated issues, comments, and transform property values
      const pulled = await this.pull(jobContext, projectKey, startAt, propertyData, additionalData);

      if (pulled.total !== undefined) {
        await this.initializeReportBatchCount(input, pulled.total);
      }

      const associations = this.extractAssociations(job, pulled.issues);

      if (pulled.issues.length === 0) {
        logger.info(`[${jobContext.job.id}] [${this.name}] No issues found`, { jobId: job.id });
        return createEmptyContext();
      }

      // Load entity mappings from storage
      const mappings = await this.loadMappings(job, pulled.issues, associations, storage);

      // Transform issues (uses existing transformIssue function)
      const transformed = await this.transform(job, pulled.issues);
      // Generate payload and send to Celery
      const pushed = await this.push(
        transformed,
        pulled.comments,
        pulled.propertyValues,
        mappings,
        associations,
        propertyData,
        jobContext
      );

      // Store relations for Relations Step
      const relations = this.extractRelations(job, pulled.issues);
      await this.storeRelations(relations, storage, job.id);

      logger.info(`[${jobContext.job.id}] [${this.name}] Completed page`, {
        jobId: job.id,
        issues: pulled.issues.length,
        comments: pulled.comments.length,
        pushed: pushed.length,
      });

      return createPaginationContext({
        hasMore: pulled.hasMore,
        startAt: startAt,
        pageSize: this.PAGE_SIZE,
        pulled: pulled.issues.length,
        pushed: pushed.length,
        totalProcessed: totalProcessed + pulled.issues.length,
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
   * Pull issues and comments, then transform property values
   * Uses existing transformIssuePropertyValues for proper conversion
   */
  private async pull(
    jobContext: TJobContext,
    projectKey: string,
    startAt: number,
    propertyData: {
      issueTypes: TIssueTypesData;
      planeIssueProperties: ExIssueProperty[];
      planeIssuePropertiesOptions: ExIssuePropertyOption[];
    },
    additionalData: {
      rawFields: JiraIssueField[];
    }
  ): Promise<{
    issues: IJiraIssue[];
    comments: ExIssueComment[];
    propertyValues: TIssuePropertyValuesPayload;
    hasMore: boolean;
    total: number;
  }> {
    const { projectId, resourceId } = extractJobData(jobContext.job);
    // Pull paginated issues
    const issuesResult = await pullIssuesV2(
      {
        client: jobContext.sourceClient,
        startAt,
        maxResults: this.PAGE_SIZE,
      },
      projectKey
    );

    // Pull comments for these issues
    // Merge: timestamps from fields.comment, HTML body from renderedFields.comment
    const comments: Partial<ExIssueComment>[] = issuesResult.items
      .map((issue) => {
        const fieldsComments = issue.fields?.comment?.comments || [];
        const renderedComments = issue.renderedFields?.comment?.comments || [];

        // Create a map of rendered comments by ID for quick lookup
        const renderedCommentsMap = new Map(renderedComments.map((rendered) => [rendered.id, rendered]));

        return fieldsComments.map((comment) => {
          // Get the rendered version for HTML body
          const renderedComment = renderedCommentsMap.get(comment.id);

          // Merge: use fields comment (has proper timestamps) but replace body with rendered HTML
          // @ts-expect-error - body exists at runtime but not in type
          const body = renderedComment ? renderedComment.body : comment.body;

          const mergedComment = {
            ...comment,
            body: body,
            issue_id: issue.id,
          };

          return transformComment(resourceId, projectId, mergedComment);
        });
      })
      .flat();

    // Transform property values for each issue using existing function
    const propertyValues = getTransformedIssuePropertyValuesV2(
      jobContext.job,
      issuesResult.items,
      additionalData.rawFields,
      propertyData.planeIssueProperties,
      propertyData.issueTypes
    );

    logger.info(`[${jobContext.job.id}] [${this.name}] Pulled from Jira`, {
      jobId: jobContext.job.id,
      issues: issuesResult.items.length,
      comments: comments.length,
      issuesWithPropertyValues: Object.keys(propertyValues).length,
      hasMore: issuesResult.hasMore,
      startAt,
    });

    return {
      issues: issuesResult.items,
      comments: comments as ExIssueComment[],
      propertyValues,
      hasMore: issuesResult.hasMore,
      total: issuesResult.total ?? 0,
    };
  }

  /**
   * Get property data from dependencyData (loaded by orchestrator)
   */
  private getPropertyData(dependencyData: Record<string, any> | undefined): {
    issueTypes: TIssueTypesData;
    planeIssueProperties: ExIssueProperty[];
    planeIssuePropertiesOptions: ExIssuePropertyOption[];
  } {
    if (!dependencyData) {
      return {
        issueTypes: [],
        planeIssueProperties: [],
        planeIssuePropertiesOptions: [],
      };
    }

    const issueTypes = dependencyData[EJiraServerStep.ISSUE_TYPES] as TIssueTypesData;
    const propertiesData = dependencyData[EJiraServerStep.ISSUE_PROPERTIES] as TIssuePropertiesData;
    const optionsData = dependencyData[EJiraServerStep.ISSUE_PROPERTY_OPTIONS];

    return {
      issueTypes,
      planeIssueProperties: (propertiesData as ExIssueProperty[]) || [],
      planeIssuePropertiesOptions: (optionsData as ExIssuePropertyOption[]) || [],
    };
  }

  private async getAdditionalData(
    storage: IStorageService,
    job: TImportJob<JiraConfig>
  ): Promise<{
    rawFields: JiraIssueField[];
  }> {
    const rawFields = await storage.retrieveData<JiraIssueField[]>(job.id, E_ADDITIONAL_STORAGE_KEYS.JIRA_RAW_FIELDS);
    if (!rawFields || rawFields.length === 0) {
      return {
        rawFields: [],
      };
    }
    return { rawFields };
  }

  /**
   * Load entity mappings from storage
   * (users, labels, issue_types accessed via storage, NOT dependencies)
   */
  private async loadMappings(
    job: TImportJob<JiraConfig>,
    issues: IJiraIssue[],
    associations: TIssuesAssociationsData,
    storage: IStorageService
  ): Promise<{
    userMap: Map<string, string>;
    issueTypeMap: Map<string, string>;
    cycleMap: Map<string, string>;
    moduleMap: Map<string, string>;
  }> {
    const jobId = job.id;
    const resourceId = job.config.resource ? job.config.resource.id : uuidv4();
    const projectId = job.project_id;
    // Extract all external IDs we need to resolve
    const labelNames = new Set<string>();
    const issueTypeIds = new Set<string>();
    const sprintExternalIds = new Set<string>();
    const componentExternalIds = new Set<string>();

    for (const issue of issues) {
      // Labels
      issue.fields.labels?.forEach((label) => labelNames.add(label));

      // Issue types
      if (issue.fields.issuetype?.id) {
        const issueTypeExternalId = `${projectId}_${resourceId}_${issue.fields.issuetype.id}`;
        issueTypeIds.add(issueTypeExternalId);
      }

      associations.cycles.forEach((cycleExternalIds) =>
        cycleExternalIds.forEach((cycleExternalId) => sprintExternalIds.add(cycleExternalId))
      );
      associations.modules.forEach((moduleExternalIds) =>
        moduleExternalIds.forEach((moduleExternalId) => componentExternalIds.add(moduleExternalId))
      );
    }

    // Load mappings in parallel from storage
    const [userMap, issueTypeMap, cycleMap, moduleMap] = await Promise.all([
      // We are retrieving all users instead of associated users, as there can be custom fields that associates with users, and we can't select those
      storage.retrieveMapping(jobId, EJiraServerStep.USERS),
      storage.lookupMapping(jobId, EJiraServerStep.ISSUE_TYPES, Array.from(issueTypeIds)),
      storage.lookupMapping(jobId, EJiraServerStep.CYCLES, Array.from(sprintExternalIds)),
      storage.lookupMapping(jobId, EJiraServerStep.MODULES, Array.from(componentExternalIds)),
    ]);

    logger.info(`[${jobId}] [${this.name}] Loaded mappings`, {
      jobId,
      users: userMap.size,
      issueTypes: issueTypeMap.size,
    });

    return { userMap, issueTypeMap, cycleMap, moduleMap };
  }

  /**
   * Transform Jira issues to Plane issues
   * Uses existing transformIssue function
   */
  private async transform(job: TImportJob<JiraConfig>, issues: IJiraIssue[]): Promise<Partial<ExIssue>[]> {
    const resourceId = job.config?.resource?.id || "";
    const resourceUrl = job.config?.resource?.url || "";
    const stateMapping = job.config?.state || {};
    const priorityMapping = job.config?.priority || {};

    const transformed = issues.map((issue) =>
      transformIssueV2(resourceId, job.project_id, issue, resourceUrl, stateMapping, priorityMapping)
    );

    return transformed;
  }

  /**
   * Extract all relations as external IDs
   * Single unified structure for Relations Step
   */
  private extractRelations(job: TImportJob<JiraConfig>, issues: IJiraIssue[]): TIssueRelationsData[] {
    const { projectId, resourceId } = extractJobData(job);
    return issues
      .map((issue) => ({
        external_id: buildExternalId(projectId, resourceId, issue.id),
        relationships: {
          parent: issue.fields.parent?.id ? buildExternalId(projectId, resourceId, issue.fields.parent?.id) : undefined,
          blocking: this.extractIssueLinks(job, issue, "Blocks", "outward"),
          is_blocked_by: this.extractIssueLinks(job, issue, "Blocks", "inward"),
          relates_to: this.extractIssueLinks(job, issue, "Relates", "both"),
          duplicate_of: this.extractIssueLinks(job, issue, "Duplicate", "outward")[0],
        },
      }))
      .filter(
        (rel) =>
          rel.relationships.parent ||
          rel.relationships.blocking.length > 0 ||
          rel.relationships.is_blocked_by.length > 0 ||
          rel.relationships.relates_to.length > 0 ||
          rel.relationships.duplicate_of
      );
  }

  private extractAssociations(job: TImportJob<JiraConfig>, issues: IJiraIssue[]): TIssuesAssociationsData {
    const { projectId, resourceId } = extractJobData(job);
    const cycles = new Map<string, string[]>();
    const modules = new Map<string, string[]>();
    const worklogs = new Map<string, Partial<TWorklog>[]>();
    for (const issue of issues) {
      const issueExternalId = buildExternalId(projectId, resourceId, issue.id);
      const sprintExternalIds = this.extractSprints(job, issue);
      const componentExternalIds = this.extractComponents(job, issue);
      const issueWorklogs = this.extractWorklogs(job, issue);
      cycles.set(issueExternalId, sprintExternalIds);
      modules.set(issueExternalId, componentExternalIds);
      worklogs.set(issueExternalId, issueWorklogs);
    }
    return { cycles, modules, worklogs };
  }

  private extractSprints(job: TImportJob<JiraConfig>, issue: IJiraIssue): string[] {
    const { projectId, resourceId } = extractJobData(job);

    const sprintFieldKey = detectSprintFieldId(issue);
    const sprintFieldValue = sprintFieldKey ? issue.fields[sprintFieldKey] : null;
    const sprintObjects = sprintFieldValue
      ? Array.isArray(sprintFieldValue)
        ? sprintFieldValue.map((s) => parseJiraServerSprint(s))
        : [parseJiraServerSprint(sprintFieldValue)]
      : null;
    return sprintObjects
      ? sprintObjects
          .map((s) => (s ? buildExternalId(projectId, resourceId, s.id.toString()) : null))
          .filter((s) => s !== null)
      : [];
  }

  private extractComponents(job: TImportJob<JiraConfig>, issue: IJiraIssue): string[] {
    const { projectId, resourceId } = extractJobData(job);
    return (
      issue.fields.components
        .map((c) => buildExternalId(projectId, resourceId, c.id!))
        .filter((c) => c !== undefined) || []
    );
  }

  /**
   * Extract issue link keys of specific type and direction
   */
  private extractIssueLinks(
    job: TImportJob<JiraConfig>,
    issue: IJiraIssue,
    linkType: string,
    direction: "inward" | "outward" | "both"
  ): string[] {
    const links: string[] = [];
    const { projectId, resourceId } = extractJobData(job);

    issue.fields.issuelinks?.forEach((link) => {
      if (link.type?.name === linkType) {
        if (direction === "outward" || direction === "both") {
          if (link.outwardIssue?.id) links.push(buildExternalId(projectId, resourceId, link.outwardIssue.id));
        }
        if (direction === "inward" || direction === "both") {
          if (link.inwardIssue?.id) links.push(buildExternalId(projectId, resourceId, link.inwardIssue.id));
        }
      }
    });

    return links;
  }

  /**
   * Extract worklogs from issue
   */
  private extractWorklogs(_job: TImportJob<JiraConfig>, issue: IJiraIssue): Partial<TWorklog>[] {
    return (
      issue.fields.worklog?.worklogs?.map((worklog) => ({
        description: worklog.comment ?? "",
        duration: worklog.timeSpentSeconds ? worklog.timeSpentSeconds / 60 : 0,
        logged_by: worklog.author?.emailAddress,
        created_at: worklog.created,
        updated_at: worklog.updated,
      })) || []
    );
  }

  /**
   * Generate BulkIssuePayload and send to Celery
   * Uses generateIssuePayloadV2 to process attachments and resolve all entities
   */
  private async push(
    issues: Partial<ExIssue>[],
    comments: ExIssueComment[],
    propertyValues: TIssuePropertyValuesPayload,
    mappings: {
      userMap: Map<string, string>;
      issueTypeMap: Map<string, string>;
      cycleMap: Map<string, string>;
      moduleMap: Map<string, string>;
    },
    associations: TIssuesAssociationsData,
    propertyData: {
      planeIssueProperties: ExIssueProperty[];
      planeIssuePropertiesOptions: ExIssuePropertyOption[];
    },
    jobContext: TJobContext
  ): Promise<BulkIssuePayload[]> {
    const { job, credentials, planeClient } = jobContext;

    // Generate complete BulkIssuePayload
    const bulkPayload: BulkIssuePayload[] = await generateIssuePayloadV2({
      jobId: job.id,
      issues: issues as ExIssue[],
      issueComments: comments,
      credentials,
      planeClient,
      workspaceSlug: job.workspace_slug,
      userMap: mappings.userMap,
      issueTypeMap: mappings.issueTypeMap,
      associations,
      cycleMap: mappings.cycleMap,
      moduleMap: mappings.moduleMap,
      planeIssueProperties: propertyData.planeIssueProperties,
      planeIssuePropertiesOptions: propertyData.planeIssuePropertiesOptions,
      planeIssuePropertyValues: propertyValues,
    });

    const payload = {
      issues: bulkPayload,
      isLastBatch: false,
    };

    await celeryProducer.registerTask(
      payload,
      job.workspace_slug,
      job.project_id,
      job.id,
      credentials.user_id,
      uuidv4(),
      "plane.bgtasks.data_import_task.import_data"
    );

    logger.info(`[${job.id}] [${this.name}] Sent to Celery`, {
      jobId: job.id,
      issues: bulkPayload.length,
      totalComments: bulkPayload.reduce((sum, i) => sum + i.comments.length, 0),
      totalPropertyValues: bulkPayload.reduce((sum, i) => sum + i.issue_property_values.length, 0),
    });

    return bulkPayload;
  }

  /**
   * Store relations data for Relations Step
   * Appends to existing data (accumulated across pages)
   */
  private async storeRelations(
    relations: TIssueRelationsData[],
    storage: IStorageService,
    jobId: string
  ): Promise<void> {
    // Append to existing relations
    await storage.storeData(jobId, E_ADDITIONAL_STORAGE_KEYS.JIRA_ISSUE_RELATIONS, relations, "external_id");

    logger.info(`[${jobId}] [${this.name}] Stored relations`, {
      jobId,
      thisPage: relations.length,
    });
  }
}
