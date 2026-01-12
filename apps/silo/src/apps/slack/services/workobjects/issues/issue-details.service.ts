import type {
  IIssueDetailService,
  TWorkObjectType,
  TWorkObjectIssueDetails,
  TWorkItemDetailsCtx,
  TWorkObjectAdditionalIssueDetails,
} from "@/apps/slack/types/workobjects";
import { logger } from "@plane/logger";
import type { Client, IssueWithExpanded } from "@plane/sdk";

/**
 * Fields to expand when fetching issue details from Plane API
 */
const expandedFields = ["state", "project", "assignees", "labels", "type", "created_by", "updated_by"] as const;

/* ----------------- Class Specific Types ------------------ */
type TIssueDetail = IssueWithExpanded<[...typeof expandedFields]>;

/**
 * Type-safe fetcher function that returns a specific key from TWorkObjectAdditionalIssueDetails
 * @template K - The key from TWorkObjectAdditionalIssueDetails that this fetcher will populate
 */
type TAdditionalDetailsFetcher<K extends keyof TWorkObjectAdditionalIssueDetails> = (
  planeClient: Client,
  issueDetail: TIssueDetail,
  ctx: TWorkItemDetailsCtx & { workspaceSlug: string }
) => Promise<Pick<TWorkObjectAdditionalIssueDetails, K>>;

/**
 * Map type that ensures each fetcher key corresponds to a key in TWorkObjectAdditionalIssueDetails
 * and returns the correct partial type for that key
 */
type TAdditionalDetailsFetcherMap = {
  [K in keyof TWorkObjectAdditionalIssueDetails]: TAdditionalDetailsFetcher<K>;
};
/* ----------------- Class Specific Types ------------------ */

/**
 * Service responsible for fetching and managing work item details from Plane API.
 * Handles both core issue data and additional details like custom properties,
 * project members, states, and parent issues.
 *
 * Supports multiple fetch strategies:
 * - By ID: Direct fetch using workspace/project/issue IDs
 * - By Sequence: Fetch using project identifier and issue sequence number
 */
export class IssueDetailService implements IIssueDetailService {
  /**
   * Registry of fetchers for additional issue details.
   * Each fetcher is responsible for loading a specific aspect of the issue.
   */
  private additionalDetailsFetchers: Partial<TAdditionalDetailsFetcherMap> = {
    propertyDetails: this.fetchCustomProperties.bind(this),
    projectMembers: this.fetchProjectMembers.bind(this),
    availableStates: this.fetchStates.bind(this),
    parent: this.fetchParent.bind(this),
  };

  /**
   * Creates an instance of IssueDetailService
   * @param type - The type of work object this service handles
   */
  constructor(private readonly type: TWorkObjectType) {}

  /**
   * Fetches complete work item details including core fields and additional details.
   * This is the main entry point for retrieving all issue information needed for Slack.
   *
   * @param planeClient - Authenticated Plane SDK client
   * @param ctx - Context containing workspace slug and fetch strategy (id or sequence)
   * @returns Complete work item details with additional metadata
   */
  async getWorkItemDetails(
    planeClient: Client,
    ctx: TWorkItemDetailsCtx & { workspaceSlug: string }
  ): Promise<TWorkObjectIssueDetails> {
    const issue = await this.getWorkItem(planeClient, ctx);
    const additionalDetails = await this.getAdditionalIssueDetails(planeClient, issue, ctx);

    return {
      ...issue,
      additionalDetails,
    };
  }

  /**
   * Dispatches work item fetch based on the strategy specified in context.
   * Strategy determines whether to fetch by ID or by sequence number.
   *
   * @param planeClient - Authenticated Plane SDK client
   * @param ctx - Context with fetch strategy and required identifiers
   * @returns Issue details with expanded fields
   * @throws Error if strategy is not supported
   */
  private async getWorkItem(
    planeClient: Client,
    ctx: TWorkItemDetailsCtx & { workspaceSlug: string }
  ): Promise<TIssueDetail> {
    switch (ctx.strategy) {
      case "id":
        return this.getWorkItemById(planeClient, ctx);
      case "sequence":
        return this.getWorkItemBySequence(planeClient, ctx);
      default:
        throw new Error(`Provided Issue Fetch Strategy Not Supported, currently supports "id" | "sequence"`);
    }
  }

  /**
   * Fetches work item using direct UUID identifiers.
   * Requires workspace slug, project ID, and issue ID.
   *
   * @param planeClient - Authenticated Plane SDK client
   * @param ctx - Context with strategy='id', workspaceSlug, projectId, and issueId
   * @returns Issue details with expanded relationships
   * @throws Error if strategy assertion fails
   */
  private async getWorkItemById(
    planeClient: Client,
    ctx: TWorkItemDetailsCtx & { workspaceSlug: string }
  ): Promise<TIssueDetail> {
    if (ctx.strategy !== "id") throw new Error(`Assertion failed, expected strategy "id"`);
    const { workspaceSlug, projectId, issueId } = ctx;

    return await planeClient.issue.getIssueWithFields(workspaceSlug, projectId, issueId, [...expandedFields]);
  }

  /**
   * Fetches work item using human-readable identifiers (project identifier + sequence number).
   * Example: PROJECT-123 where PROJECT is identifier and 123 is sequence.
   *
   * @param planeClient - Authenticated Plane SDK client
   * @param ctx - Context with strategy='sequence', workspaceSlug, projectIdentifier, and issueSequence
   * @returns Issue details with expanded relationships
   * @throws Error if strategy assertion fails
   */
  private async getWorkItemBySequence(
    planeClient: Client,
    ctx: TWorkItemDetailsCtx & { workspaceSlug: string }
  ): Promise<TIssueDetail> {
    if (ctx.strategy !== "sequence") throw new Error(`Assertion failed, expected strategy "sequence"`);
    const { workspaceSlug, projectIdentifier, issueSequence } = ctx;
    return await planeClient.issue.getIssueByIdentifierWithFields(
      workspaceSlug,
      projectIdentifier,
      issueSequence,
      [...expandedFields],
      true
    );
  }

  /**
   * Fetch all additional issue details by executing registered fetchers in parallel.
   * Each fetcher is independent and failures are logged without breaking the entire operation.
   * This ensures that even if one detail fetch fails, others can still succeed.
   *
   * @param planeClient - Authenticated Plane SDK client
   * @param issueDetail - Core issue details already fetched
   * @param ctx - Context with workspace slug and other identifiers
   * @returns Merged object containing all successfully fetched additional details
   */
  private async getAdditionalIssueDetails(
    planeClient: Client,
    issueDetail: TIssueDetail,
    ctx: TWorkItemDetailsCtx & { workspaceSlug: string }
  ): Promise<TWorkObjectAdditionalIssueDetails> {
    const fetcherEntries = Object.entries(this.additionalDetailsFetchers);

    // Execute all fetchers in parallel
    const results = await Promise.allSettled(
      fetcherEntries.map(([_key, fetcher]) => fetcher(planeClient, issueDetail, ctx))
    );

    // Merge all successful results
    const mergedDetails: TWorkObjectAdditionalIssueDetails = {};

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        Object.assign(mergedDetails, result.value);
      } else {
        const [key] = fetcherEntries[index];
        logger.warn(`[Slack][Issue Detail] Failed to fetch ${key}:`);
      }
    });

    return mergedDetails;
  }

  /**
   * Fetcher for custom properties based on issue type.
   * Loads property definitions, their options (for OPTION type properties),
   * and current values set on the issue.
   *
   * @param planeClient - Authenticated Plane SDK client
   * @param issueDetail - Core issue details containing issue type
   * @param ctx - Context with workspace slug
   * @returns Property definitions, options map, and values map
   * @throws Error if project ID is missing
   */
  private async fetchCustomProperties(
    planeClient: Client,
    issueDetail: TIssueDetail,
    ctx: TWorkItemDetailsCtx & { workspaceSlug: string }
  ): Promise<Pick<TWorkObjectAdditionalIssueDetails, "propertyDetails">> {
    const issueId = issueDetail.id;
    const projectId = issueDetail.project.id;
    const issueTypeId = issueDetail.type?.id;

    const { workspaceSlug } = ctx;

    if (!projectId) {
      throw new Error("[Assertion Failed] Project Id not found while fetching custom properties from issue details", {
        cause: issueDetail,
      });
    }

    if (!issueTypeId) {
      logger.info(
        "[Slack WorkObjects][Additional Property Fetching] No type found for issue details, skipping fetching custom properties"
      );
      return { propertyDetails: undefined };
    }

    const customProperties = await planeClient.issueProperty.fetch(workspaceSlug, projectId, issueTypeId);

    /* --------------- Fetch options for properties that have them --------------- */
    const propertiesWithOptions = customProperties.filter((property) => property.property_type === "OPTION");
    const propertyOptionsMap = await this.fetchAndMapByPropertyId(propertiesWithOptions, (propertyId) =>
      planeClient.issuePropertyOption.fetch(workspaceSlug, projectId, propertyId)
    );

    /* --------------- Fetch property values for each available property --------------- */
    const propertyValuesMap = (await this.fetchAndMapByPropertyId(customProperties, (propertyId) =>
      planeClient.issuePropertyValue.fetch(workspaceSlug, projectId, issueId, propertyId)
    )) as unknown as Map<
      string,
      {
        property_id: string;
        values: string[];
      }[]
    >;
    return {
      propertyDetails: {
        properties: customProperties,
        propertyOptions: propertyOptionsMap,
        propertyValues: propertyValuesMap,
      },
    };
  }

  /**
   * Fetches all members of the project containing this issue.
   * Used to populate assignee selection and display member information.
   *
   * @param planeClient - Authenticated Plane SDK client
   * @param issueDetail - Core issue details containing project ID
   * @param ctx - Context with workspace slug
   * @returns List of project members
   * @throws Error if project ID is missing
   */
  private async fetchProjectMembers(
    planeClient: Client,
    issueDetail: TIssueDetail,
    ctx: TWorkItemDetailsCtx & { workspaceSlug: string }
  ): Promise<Pick<TWorkObjectAdditionalIssueDetails, "projectMembers">> {
    const { workspaceSlug } = ctx;
    const projectId = issueDetail.project.id;

    if (!projectId)
      throw new Error("[Slack Work Objects] Assertion Failed, No ProjectId found for issue details received", {
        cause: issueDetail,
      });

    const projectMembers = await planeClient.users.list(workspaceSlug, projectId);

    return {
      projectMembers,
    };
  }

  /**
   * Fetches all available states for the project.
   * Used to populate state selection dropdowns in Slack UI.
   *
   * @param planeClient - Authenticated Plane SDK client
   * @param issueDetail - Core issue details containing project ID
   * @param ctx - Context with workspace slug
   * @returns List of available states for the project
   * @throws Error if project ID is missing
   */
  private async fetchStates(
    planeClient: Client,
    issueDetail: TIssueDetail,
    ctx: TWorkItemDetailsCtx & { workspaceSlug: string }
  ): Promise<Pick<TWorkObjectAdditionalIssueDetails, "availableStates">> {
    const { workspaceSlug } = ctx;
    const projectId = issueDetail.project.id;

    if (!projectId)
      throw new Error("[Slack Work Objects] Assertion Failed, No ProjectId found for issue details received", {
        cause: issueDetail,
      });

    const projectStates = await planeClient.state.list(workspaceSlug, projectId);

    return {
      availableStates: projectStates.results,
    };
  }

  /**
   * Fetches parent issue details if the issue has a parent relationship.
   * Used to display parent context in Slack messages.
   *
   * @param planeClient - Authenticated Plane SDK client
   * @param issueDetail - Core issue details containing parent ID reference
   * @param ctx - Context with workspace slug
   * @returns Parent issue details or undefined if no parent exists
   */
  private async fetchParent(
    planeClient: Client,
    issueDetail: TIssueDetail,
    ctx: TWorkItemDetailsCtx & { workspaceSlug: string }
  ): Promise<Pick<TWorkObjectAdditionalIssueDetails, "parent">> {
    const { workspaceSlug } = ctx;
    const projectId = issueDetail.project.id;
    const parent = issueDetail.parent;

    if (!projectId || !parent) {
      logger.info("No projectId or parent found for the given issue detail, fetching aborted", issueDetail);
      return { parent: undefined };
    }

    const parentDetails = await planeClient.issue.getIssue(workspaceSlug, projectId, parent);
    return { parent: parentDetails };
  }

  /* ------------------ Helpers -------------------------*/
  /**
   * Helper to fetch data for multiple properties in parallel and map results by property ID.
   * Executes all fetch operations concurrently for better performance.
   *
   * @template T - Type of data being fetched for each property
   * @param properties - Array of objects containing property IDs
   * @param fetchFn - Function to fetch data for a single property ID
   * @returns Map of property ID to fetched data
   */
  private async fetchAndMapByPropertyId<T>(
    properties: Array<{ id?: string }>,
    fetchFn: (propertyId: string) => Promise<T>
  ): Promise<Map<string, T>> {
    const results = await Promise.all(properties.map((property) => fetchFn(property.id ?? "")));
    return new Map(properties.map((property, index) => [property.id ?? "", results[index]]));
  }
}
